import { useInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { SEARCH_PAGE_SIZE, SEARCH_RESULT_CAP, searchRepositories } from '../../api/github';
import { queryKeys } from '../../api/queryKeys';
import type { GitHubRepository, RepoSort, SearchResponse } from '../../api/types';

export function getNextSearchPage(
  lastPage: SearchResponse<GitHubRepository>,
  allPages: SearchResponse<GitHubRepository>[],
): number | undefined {
  const loaded = allPages.reduce((sum, page) => sum + page.items.length, 0);
  const available = Math.min(lastPage.total_count, SEARCH_RESULT_CAP);
  if (lastPage.items.length < SEARCH_PAGE_SIZE || loaded >= available) return undefined;
  return allPages.length + 1;
}

export function useRepositorySearch(rawQuery: string, sort: RepoSort) {
  const query = rawQuery.trim();

  const result = useInfiniteQuery({
    queryKey: queryKeys.search(query, sort),
    queryFn: ({ pageParam, signal }) =>
      searchRepositories({ query, sort, page: pageParam, signal }),
    initialPageParam: 1,
    getNextPageParam: getNextSearchPage,
    enabled: query.length > 0,
  });

  const repositories = useMemo(() => {
    // Results can shift between pages while paging, so drop duplicates by id.
    const seen = new Set<number>();
    return (result.data?.pages ?? [])
      .flatMap((page) => page.items)
      .filter((repo) => (seen.has(repo.id) ? false : (seen.add(repo.id), true)));
  }, [result.data]);

  return {
    ...result,
    repositories,
    totalCount: result.data?.pages[0]?.total_count ?? 0,
  };
}

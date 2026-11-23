import { useQuery } from '@tanstack/react-query';

import { getReadme, getRepository } from '../../api/github';
import { queryKeys } from '../../api/queryKeys';

export function useRepository(owner: string, repo: string) {
  return useQuery({
    queryKey: queryKeys.repository(owner, repo),
    queryFn: ({ signal }) => getRepository(owner, repo, signal),
  });
}

export function useReadme(owner: string, repo: string) {
  return useQuery({
    queryKey: queryKeys.readme(owner, repo),
    queryFn: ({ signal }) => getReadme(owner, repo, signal),
    staleTime: 30 * 60 * 1000,
  });
}

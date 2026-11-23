import { getJson, getText } from './client';
import type { GitHubRepository, GitHubUser, RepoSort, SearchResponse } from './types';

export const SEARCH_PAGE_SIZE = 20;
// The search API never returns more than the first 1000 results.
export const SEARCH_RESULT_CAP = 1000;

export interface SearchParams {
  query: string;
  sort: RepoSort;
  page: number;
  signal?: AbortSignal;
}

export function searchRepositories({ query, sort, page, signal }: SearchParams) {
  return getJson<SearchResponse<GitHubRepository>>('/search/repositories', {
    query: { q: query, sort, order: 'desc', per_page: SEARCH_PAGE_SIZE, page },
    signal,
  });
}

export function getRepository(owner: string, repo: string, signal?: AbortSignal) {
  return getJson<GitHubRepository>(
    `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`,
    { signal },
  );
}

export function getReadme(owner: string, repo: string, signal?: AbortSignal) {
  return getText(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/readme`, {
    accept: 'application/vnd.github.raw+json',
    signal,
  });
}

export function getUser(login: string, signal?: AbortSignal) {
  return getJson<GitHubUser>(`/users/${encodeURIComponent(login)}`, { signal });
}

export function getUserRepositories(login: string, signal?: AbortSignal) {
  return getJson<GitHubRepository[]>(`/users/${encodeURIComponent(login)}/repos`, {
    query: { sort: 'pushed', per_page: 30 },
    signal,
  });
}

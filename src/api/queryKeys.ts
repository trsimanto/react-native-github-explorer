import type { RepoSort } from './types';

export const queryKeys = {
  search: (query: string, sort: RepoSort) => ['search', query, sort] as const,
  repository: (owner: string, repo: string) => ['repository', owner, repo] as const,
  readme: (owner: string, repo: string) => ['readme', owner, repo] as const,
  user: (login: string) => ['user', login] as const,
  userRepositories: (login: string) => ['user', login, 'repositories'] as const,
};

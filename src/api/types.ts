export interface GitHubOwner {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
  type: 'User' | 'Organization' | 'Bot' | string;
}

export interface GitHubLicense {
  key: string;
  name: string;
  spdx_id: string | null;
}

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  owner: GitHubOwner;
  html_url: string;
  description: string | null;
  fork: boolean;
  homepage: string | null;
  language: string | null;
  stargazers_count: number;
  watchers_count: number;
  forks_count: number;
  open_issues_count: number;
  topics?: string[];
  license: GitHubLicense | null;
  default_branch: string;
  archived: boolean;
  created_at: string;
  updated_at: string;
  pushed_at: string;
}

export interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
  type: string;
  name: string | null;
  company: string | null;
  blog: string | null;
  location: string | null;
  bio: string | null;
  twitter_username: string | null;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
}

export interface SearchResponse<T> {
  total_count: number;
  incomplete_results: boolean;
  items: T[];
}

export type RepoSort = 'stars' | 'updated';

/** The fields a list row needs; also what we persist for favorites. */
export type RepoSummary = Pick<
  GitHubRepository,
  | 'id'
  | 'name'
  | 'full_name'
  | 'description'
  | 'language'
  | 'stargazers_count'
  | 'forks_count'
  | 'updated_at'
> & {
  owner: Pick<GitHubOwner, 'login' | 'avatar_url'>;
};

export function toRepoSummary(repo: GitHubRepository | RepoSummary): RepoSummary {
  return {
    id: repo.id,
    name: repo.name,
    full_name: repo.full_name,
    description: repo.description,
    language: repo.language,
    stargazers_count: repo.stargazers_count,
    forks_count: repo.forks_count,
    updated_at: repo.updated_at,
    owner: { login: repo.owner.login, avatar_url: repo.owner.avatar_url },
  };
}

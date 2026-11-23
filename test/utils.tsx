import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { PropsWithChildren } from 'react';

import type { GitHubRepository, SearchResponse } from '../src/api/types';

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  });
}

export function createWrapper(client = createTestQueryClient()) {
  return function Wrapper({ children }: PropsWithChildren) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}

interface MockResponseInit {
  status?: number;
  headers?: Record<string, string>;
}

export function jsonResponse(body: unknown, { status = 200, headers = {} }: MockResponseInit = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', ...headers },
  });
}

export function makeRepo(overrides: Partial<GitHubRepository> = {}): GitHubRepository {
  const id = overrides.id ?? 1;
  return {
    id,
    name: `repo-${id}`,
    full_name: `octocat/repo-${id}`,
    owner: {
      login: 'octocat',
      id: 583231,
      avatar_url: 'https://avatars.githubusercontent.com/u/583231',
      html_url: 'https://github.com/octocat',
      type: 'User',
    },
    html_url: `https://github.com/octocat/repo-${id}`,
    description: 'A test repository',
    fork: false,
    homepage: null,
    language: 'TypeScript',
    stargazers_count: 1500,
    watchers_count: 1500,
    forks_count: 42,
    open_issues_count: 3,
    topics: ['react-native'],
    license: { key: 'mit', name: 'MIT License', spdx_id: 'MIT' },
    default_branch: 'main',
    archived: false,
    created_at: '2020-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    pushed_at: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

export function makeSearchPage(
  ids: number[],
  totalCount: number,
): SearchResponse<GitHubRepository> {
  return {
    total_count: totalCount,
    incomplete_results: false,
    items: ids.map((id) => makeRepo({ id })),
  };
}

import { buildUrl, getJson, getText } from '../client';
import { GitHubApiError, NetworkError, RateLimitError } from '../errors';
import { getReadme, searchRepositories } from '../github';
import { jsonResponse, makeSearchPage } from '../../../test/utils';

const fetchMock = jest.fn<Promise<Response>, Parameters<typeof fetch>>();

beforeEach(() => {
  fetchMock.mockReset();
  globalThis.fetch = fetchMock as unknown as typeof fetch;
});

describe('buildUrl', () => {
  it('encodes query params and drops empty values', () => {
    expect(buildUrl('/search/repositories', { q: 'react native', page: 2, sort: undefined })).toBe(
      'https://api.github.com/search/repositories?q=react%20native&page=2',
    );
  });
});

describe('getJson', () => {
  it('sends GitHub headers and returns parsed JSON', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ login: 'octocat' }));

    await expect(getJson('/users/octocat')).resolves.toEqual({ login: 'octocat' });

    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe('https://api.github.com/users/octocat');
    expect(init?.headers).toMatchObject({
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    });
  });

  it('throws RateLimitError with the reset time on a primary rate limit', async () => {
    const reset = 1_900_000_000;
    fetchMock.mockResolvedValueOnce(
      jsonResponse(
        { message: 'API rate limit exceeded' },
        {
          status: 403,
          headers: { 'x-ratelimit-remaining': '0', 'x-ratelimit-reset': String(reset) },
        },
      ),
    );

    const error = await getJson('/search/repositories').catch((e: unknown) => e);

    expect(error).toBeInstanceOf(RateLimitError);
    expect((error as RateLimitError).resetAt).toEqual(new Date(reset * 1000));
    expect((error as RateLimitError).status).toBe(403);
  });

  it('treats retry-after as a secondary rate limit', async () => {
    jest.useFakeTimers({ now: new Date('2026-06-01T12:00:00Z') });
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ message: 'secondary' }, { status: 429, headers: { 'retry-after': '60' } }),
    );

    const error = (await getJson('/x').catch((e: unknown) => e)) as RateLimitError;

    expect(error).toBeInstanceOf(RateLimitError);
    expect(error.resetAt).toEqual(new Date('2026-06-01T12:01:00Z'));
    jest.useRealTimers();
  });

  it('does not mistake a plain 403 for a rate limit', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(
        { message: 'Resource not accessible' },
        { status: 403, headers: { 'x-ratelimit-remaining': '42' } },
      ),
    );

    const error = await getJson('/x').catch((e: unknown) => e);

    expect(error).not.toBeInstanceOf(RateLimitError);
    expect(error).toBeInstanceOf(GitHubApiError);
    expect((error as GitHubApiError).message).toBe('Resource not accessible');
  });

  it('surfaces 404s as GitHubApiError', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ message: 'Not Found' }, { status: 404 }));

    await expect(getJson('/repos/a/b')).rejects.toMatchObject({
      status: 404,
      message: 'Not Found',
    });
  });

  it('wraps fetch failures in NetworkError', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('Network request failed'));

    await expect(getJson('/x')).rejects.toBeInstanceOf(NetworkError);
  });
});

describe('endpoints', () => {
  it('searchRepositories requests the right page and sort', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(makeSearchPage([1, 2], 2)));

    const result = await searchRepositories({ query: 'expo', sort: 'updated', page: 3 });

    expect(result.items).toHaveLength(2);
    expect(fetchMock.mock.calls[0]![0]).toBe(
      'https://api.github.com/search/repositories?q=expo&sort=updated&order=desc&per_page=20&page=3',
    );
  });

  it('getReadme asks for the raw media type', async () => {
    fetchMock.mockResolvedValueOnce(new Response('# Hello', { status: 200 }));

    await expect(getReadme('octocat', 'hello-world')).resolves.toBe('# Hello');
    expect(fetchMock.mock.calls[0]![1]?.headers).toMatchObject({
      Accept: 'application/vnd.github.raw+json',
    });
  });

  it('getText propagates errors the same way', async () => {
    fetchMock.mockResolvedValueOnce(new Response('', { status: 500 }));

    await expect(getText('/x')).rejects.toMatchObject({
      status: 500,
      message: 'Request failed with status 500',
    });
  });
});

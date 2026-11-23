import { GitHubApiError, NetworkError, RateLimitError } from './errors';

export const GITHUB_API_URL = 'https://api.github.com';

type QueryValue = string | number | boolean | undefined;

export interface RequestOptions {
  query?: Record<string, QueryValue>;
  accept?: string;
  signal?: AbortSignal;
}

export function buildUrl(path: string, query?: Record<string, QueryValue>): string {
  const url = `${GITHUB_API_URL}${path.startsWith('/') ? path : `/${path}`}`;
  if (!query) return url;

  const params = Object.entries(query)
    .filter(([, value]) => value !== undefined && value !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&');

  return params ? `${url}?${params}` : url;
}

/**
 * GitHub signals primary rate limits with 403/429 plus `x-ratelimit-remaining: 0`,
 * and secondary limits with a `retry-after` header.
 */
export function parseRateLimit(response: Response): RateLimitError | null {
  if (response.status !== 403 && response.status !== 429) return null;

  const remaining = response.headers.get('x-ratelimit-remaining');
  const reset = response.headers.get('x-ratelimit-reset');
  const retryAfter = response.headers.get('retry-after');

  if (remaining === '0' && reset) {
    const seconds = Number(reset);
    return new RateLimitError(
      Number.isFinite(seconds) ? new Date(seconds * 1000) : null,
      response.status,
    );
  }
  if (retryAfter) {
    const seconds = Number(retryAfter);
    return new RateLimitError(
      Number.isFinite(seconds) ? new Date(Date.now() + seconds * 1000) : null,
      response.status,
    );
  }
  if (response.status === 429) return new RateLimitError(null, 429);
  return null;
}

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { message?: string };
    if (body?.message) return body.message;
  } catch {
    // body was empty or not JSON
  }
  return `Request failed with status ${response.status}`;
}

async function send(path: string, options: RequestOptions): Promise<Response> {
  let response: Response;
  try {
    response = await fetch(buildUrl(path, options.query), {
      headers: {
        Accept: options.accept ?? 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      signal: options.signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') throw error;
    throw new NetworkError();
  }

  if (!response.ok) {
    const rateLimit = parseRateLimit(response);
    if (rateLimit) throw rateLimit;
    throw new GitHubApiError(await readErrorMessage(response), response.status);
  }
  return response;
}

export async function getJson<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await send(path, options);
  return (await response.json()) as T;
}

export async function getText(path: string, options: RequestOptions = {}): Promise<string> {
  const response = await send(path, options);
  return response.text();
}

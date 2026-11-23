export class GitHubApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'GitHubApiError';
    this.status = status;
  }
}

export class RateLimitError extends GitHubApiError {
  /** When the limit resets. Null when GitHub did not tell us. */
  readonly resetAt: Date | null;

  constructor(resetAt: Date | null, status = 403) {
    super('GitHub API rate limit exceeded', status);
    this.name = 'RateLimitError';
    this.resetAt = resetAt;
  }
}

export class NetworkError extends Error {
  constructor(message = 'Network request failed') {
    super(message);
    this.name = 'NetworkError';
  }
}

export function isRateLimitError(error: unknown): error is RateLimitError {
  return error instanceof RateLimitError;
}

export function isNotFoundError(error: unknown): boolean {
  return error instanceof GitHubApiError && error.status === 404;
}

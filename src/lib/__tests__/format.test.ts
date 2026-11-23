import { formatCount, formatRelativeDate, formatResetTime } from '../format';
import { resolveRelativeLinks } from '../readme';
import { shouldRetry } from '../queryClient';
import { GitHubApiError, RateLimitError } from '../../api/errors';

describe('formatCount', () => {
  it.each([
    [0, '0'],
    [999, '999'],
    [1000, '1k'],
    [12_345, '12.3k'],
    [250_400, '250k'],
    [1_200_000, '1.2m'],
  ])('%d -> %s', (input, expected) => {
    expect(formatCount(input)).toBe(expected);
  });
});

describe('formatRelativeDate', () => {
  const now = new Date('2026-06-15T12:00:00Z');

  it('formats past dates', () => {
    expect(formatRelativeDate('2026-06-15T09:00:00Z', now)).toBe('3 hours ago');
    expect(formatRelativeDate('2026-06-14T12:00:00Z', now)).toBe('1 day ago');
    expect(formatRelativeDate('2025-06-15T12:00:00Z', now)).toBe('1 year ago');
  });

  it('handles very recent dates', () => {
    expect(formatRelativeDate('2026-06-15T11:59:30Z', now)).toBe('just now');
  });
});

describe('formatResetTime', () => {
  it('falls back when the reset time is unknown', () => {
    expect(formatResetTime(null)).toBe('Please try again in a few minutes.');
  });

  it('includes minutes until reset', () => {
    const now = new Date('2026-06-15T12:00:00Z');
    expect(formatResetTime(new Date('2026-06-15T12:04:10Z'), now)).toMatch(/in about 5 min/);
  });
});

describe('resolveRelativeLinks', () => {
  it('rewrites relative images and links, leaving absolute ones alone', () => {
    const input = [
      '![logo](./docs/logo.png)',
      '[guide](docs/GUIDE.md "Guide")',
      '[site](https://example.com)',
      '[anchor](#install)',
    ].join('\n');

    expect(resolveRelativeLinks(input, 'octocat', 'hello', 'main')).toBe(
      [
        '![logo](https://raw.githubusercontent.com/octocat/hello/main/docs/logo.png)',
        '[guide](https://github.com/octocat/hello/blob/main/docs/GUIDE.md "Guide")',
        '[site](https://example.com)',
        '[anchor](#install)',
      ].join('\n'),
    );
  });
});

describe('shouldRetry', () => {
  it('never retries rate limits or client errors', () => {
    expect(shouldRetry(0, new RateLimitError(null))).toBe(false);
    expect(shouldRetry(0, new GitHubApiError('Not Found', 404))).toBe(false);
  });

  it('retries other failures twice', () => {
    expect(shouldRetry(0, new GitHubApiError('Bad gateway', 502))).toBe(true);
    expect(shouldRetry(1, new Error('x'))).toBe(true);
    expect(shouldRetry(2, new Error('x'))).toBe(false);
  });
});

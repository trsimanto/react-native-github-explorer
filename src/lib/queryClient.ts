import { focusManager, QueryClient } from '@tanstack/react-query';
import { AppState, Platform, type AppStateStatus } from 'react-native';

import { GitHubApiError, RateLimitError } from '../api/errors';

export function shouldRetry(failureCount: number, error: unknown): boolean {
  // Retrying a rate limit or a 4xx only burns more of the quota.
  if (error instanceof RateLimitError) return false;
  if (error instanceof GitHubApiError && error.status >= 400 && error.status < 500) return false;
  return failureCount < 2;
}

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
        retry: shouldRetry,
      },
    },
  });
}

/** React Native has no window focus events; map them to AppState instead. */
export function subscribeAppStateFocus(): () => void {
  const onChange = (status: AppStateStatus) => {
    if (Platform.OS !== 'web') focusManager.setFocused(status === 'active');
  };
  const subscription = AppState.addEventListener('change', onChange);
  return () => subscription.remove();
}

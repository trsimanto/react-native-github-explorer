import { fireEvent, render, screen } from '@testing-library/react-native';

import { GitHubApiError, NetworkError, RateLimitError } from '../../api/errors';
import { EmptyState, ErrorState } from '../StateViews';

describe('ErrorState', () => {
  it('explains a rate limit and when it resets', async () => {
    const resetAt = new Date(Date.now() + 10 * 60_000);
    await render(<ErrorState error={new RateLimitError(resetAt)} />);

    expect(screen.getByText('GitHub rate limit reached')).toBeOnTheScreen();
    expect(screen.getByText(/Resets at .* \(in about 10 min\)/)).toBeOnTheScreen();
  });

  it('shows an offline message for network errors', async () => {
    await render(<ErrorState error={new NetworkError()} />);

    expect(screen.getByText('You appear to be offline')).toBeOnTheScreen();
  });

  it('shows not found for 404s', async () => {
    await render(<ErrorState error={new GitHubApiError('Not Found', 404)} />);

    expect(screen.getByText('Not found')).toBeOnTheScreen();
  });

  it('falls back to the error message', async () => {
    await render(<ErrorState error={new Error('Boom')} />);

    expect(screen.getByText('Something went wrong')).toBeOnTheScreen();
    expect(screen.getByText('Boom')).toBeOnTheScreen();
  });

  it('calls onRetry', async () => {
    const onRetry = jest.fn();
    await render(<ErrorState error={new Error('Boom')} onRetry={onRetry} />);

    await fireEvent.press(screen.getByRole('button', { name: 'Try again' }));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('has no retry button without a handler', async () => {
    await render(<ErrorState error={new Error('Boom')} />);

    expect(screen.queryByRole('button', { name: 'Try again' })).toBeNull();
  });
});

describe('EmptyState', () => {
  it('renders title and message', async () => {
    await render(<EmptyState icon="star-outline" title="Nothing here" message="Add something" />);

    expect(screen.getByTestId('empty-state')).toBeOnTheScreen();
    expect(screen.getByText('Nothing here')).toBeOnTheScreen();
    expect(screen.getByText('Add something')).toBeOnTheScreen();
  });
});

import { act, renderHook, waitFor } from '@testing-library/react-native';

import { RateLimitError } from '../../../api/errors';
import { createWrapper, jsonResponse, makeSearchPage } from '../../../../test/utils';
import { getNextSearchPage, useRepositorySearch } from '../useRepositorySearch';

const fetchMock = jest.fn<Promise<Response>, Parameters<typeof fetch>>();

beforeEach(() => {
  fetchMock.mockReset();
  globalThis.fetch = fetchMock as unknown as typeof fetch;
});

const range = (start: number, count: number) => Array.from({ length: count }, (_, i) => start + i);

describe('useRepositorySearch', () => {
  it('does not fetch for an empty query', async () => {
    const { result } = await renderHook(() => useRepositorySearch('   ', 'stars'), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(result.current.repositories).toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('loads the first page and then the next one', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse(makeSearchPage(range(1, 20), 25)))
      .mockResolvedValueOnce(jsonResponse(makeSearchPage(range(21, 5), 25)));

    const { result } = await renderHook(() => useRepositorySearch('expo', 'stars'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.repositories).toHaveLength(20);
    expect(result.current.totalCount).toBe(25);
    expect(result.current.hasNextPage).toBe(true);
    expect(String(fetchMock.mock.calls[0]![0])).toContain('q=expo&sort=stars');

    await act(async () => {
      await result.current.fetchNextPage();
    });

    await waitFor(() => expect(result.current.repositories).toHaveLength(25));
    expect(result.current.hasNextPage).toBe(false);
    expect(String(fetchMock.mock.calls[1]![0])).toContain('page=2');
  });

  it('removes duplicate repositories across pages', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse(makeSearchPage(range(1, 20), 100)))
      .mockResolvedValueOnce(jsonResponse(makeSearchPage(range(20, 20), 100)));

    const { result } = await renderHook(() => useRepositorySearch('expo', 'stars'), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    await act(async () => {
      await result.current.fetchNextPage();
    });

    await waitFor(() => expect(result.current.repositories).toHaveLength(39));
  });

  it('exposes rate limit errors', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(
        { message: 'API rate limit exceeded' },
        {
          status: 403,
          headers: { 'x-ratelimit-remaining': '0', 'x-ratelimit-reset': '1900000000' },
        },
      ),
    );

    const { result } = await renderHook(() => useRepositorySearch('expo', 'stars'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(RateLimitError);
  });

  it('refetches when the sort changes', async () => {
    fetchMock.mockImplementation(() => Promise.resolve(jsonResponse(makeSearchPage([1], 1))));

    const { result, rerender } = await renderHook(
      ({ sort }: { sort: 'stars' | 'updated' }) => useRepositorySearch('expo', sort),
      { wrapper: createWrapper(), initialProps: { sort: 'stars' } },
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    await rerender({ sort: 'updated' });

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(String(fetchMock.mock.calls[1]![0])).toContain('sort=updated');
  });
});

describe('getNextSearchPage', () => {
  it('stops at the 1000 result cap', () => {
    const pages = Array.from({ length: 50 }, (_, i) =>
      makeSearchPage(range(i * 20 + 1, 20), 50_000),
    );
    expect(getNextSearchPage(pages[49]!, pages)).toBeUndefined();
    expect(getNextSearchPage(pages[48]!, pages.slice(0, 49))).toBe(50);
  });
});

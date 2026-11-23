import AsyncStorage from '@react-native-async-storage/async-storage';

import { makeRepo } from '../../../../test/utils';
import { useFavoritesStore } from '../favoritesStore';

const STORAGE_KEY = 'github-explorer/favorites';

beforeEach(async () => {
  useFavoritesStore.setState({ favorites: [] });
  await AsyncStorage.clear();
});

describe('favoritesStore', () => {
  it('adds a repository as a slim summary, newest first', () => {
    const { add } = useFavoritesStore.getState();
    add(makeRepo({ id: 1 }));
    add(makeRepo({ id: 2 }));

    const { favorites } = useFavoritesStore.getState();
    expect(favorites.map((f) => f.id)).toEqual([2, 1]);
    expect(favorites[0]).not.toHaveProperty('topics');
    expect(favorites[0]?.owner).toEqual({
      login: 'octocat',
      avatar_url: 'https://avatars.githubusercontent.com/u/583231',
    });
  });

  it('ignores duplicates', () => {
    const repo = makeRepo({ id: 7 });
    useFavoritesStore.getState().add(repo);
    useFavoritesStore.getState().add(repo);

    expect(useFavoritesStore.getState().favorites).toHaveLength(1);
  });

  it('toggles a repository on and off', () => {
    const repo = makeRepo({ id: 3 });
    useFavoritesStore.getState().toggle(repo);
    expect(useFavoritesStore.getState().favorites).toHaveLength(1);

    useFavoritesStore.getState().toggle(repo);
    expect(useFavoritesStore.getState().favorites).toHaveLength(0);
  });

  it('removes by id and clears', () => {
    const { add, remove, clear } = useFavoritesStore.getState();
    add(makeRepo({ id: 1 }));
    add(makeRepo({ id: 2 }));

    remove(1);
    expect(useFavoritesStore.getState().favorites.map((f) => f.id)).toEqual([2]);

    clear();
    expect(useFavoritesStore.getState().favorites).toEqual([]);
  });

  it('persists favorites to AsyncStorage', async () => {
    useFavoritesStore.getState().add(makeRepo({ id: 9 }));

    await new Promise((resolve) => setTimeout(resolve, 0));
    const stored = JSON.parse((await AsyncStorage.getItem(STORAGE_KEY)) ?? '{}');

    expect(stored.version).toBe(1);
    expect(stored.state.favorites.map((f: { id: number }) => f.id)).toEqual([9]);
  });

  it('rehydrates from AsyncStorage', async () => {
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ state: { favorites: [makeRepo({ id: 5 })] }, version: 1 }),
    );

    await useFavoritesStore.persist.rehydrate();

    expect(useFavoritesStore.getState().favorites.map((f) => f.id)).toEqual([5]);
  });
});

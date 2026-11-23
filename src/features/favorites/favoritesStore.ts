import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { toRepoSummary, type GitHubRepository, type RepoSummary } from '../../api/types';

interface FavoritesState {
  favorites: RepoSummary[];
  add: (repo: GitHubRepository | RepoSummary) => void;
  remove: (id: number) => void;
  toggle: (repo: GitHubRepository | RepoSummary) => void;
  clear: () => void;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      add: (repo) => {
        if (get().favorites.some((f) => f.id === repo.id)) return;
        // newest first
        set((state) => ({ favorites: [toRepoSummary(repo), ...state.favorites] }));
      },
      remove: (id) => set((state) => ({ favorites: state.favorites.filter((f) => f.id !== id) })),
      toggle: (repo) => {
        const { add, remove, favorites } = get();
        if (favorites.some((f) => f.id === repo.id)) remove(repo.id);
        else add(repo);
      },
      clear: () => set({ favorites: [] }),
    }),
    {
      name: 'github-explorer/favorites',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ favorites: state.favorites }),
    },
  ),
);

export function useIsFavorite(id: number | undefined): boolean {
  return useFavoritesStore((state) => id !== undefined && state.favorites.some((f) => f.id === id));
}

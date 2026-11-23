import { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text } from 'react-native';

import type { RepoSummary } from '../../api/types';
import { ErrorState, LoadingState, RepoListItem, Separator } from '../../components';
import type { RootStackScreenProps } from '../../navigation/types';
import { spacing, useTheme } from '../../theme';
import { useFavoritesStore } from '../favorites/favoritesStore';
import { useUser, useUserRepositories } from './hooks';
import { ProfileHeader } from './ProfileHeader';

export function ProfileScreen({ route, navigation }: RootStackScreenProps<'Profile'>) {
  const { login } = route.params;
  const { colors } = useTheme();
  const userQuery = useUser(login);
  const reposQuery = useUserRepositories(login);
  const [refreshing, setRefreshing] = useState(false);

  const favorites = useFavoritesStore((s) => s.favorites);
  const toggleFavorite = useFavoritesStore((s) => s.toggle);
  const favoriteIds = useMemo(() => new Set(favorites.map((f) => f.id)), [favorites]);

  useLayoutEffect(() => {
    navigation.setOptions({ title: login });
  }, [navigation, login]);

  const openRepo = useCallback(
    (repo: RepoSummary) =>
      navigation.push('RepoDetail', { owner: repo.owner.login, repo: repo.name }),
    [navigation],
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([userQuery.refetch(), reposQuery.refetch()]);
    } finally {
      setRefreshing(false);
    }
  }, [userQuery, reposQuery]);

  if (userQuery.isPending) return <LoadingState />;
  if (userQuery.isError) {
    return <ErrorState error={userQuery.error} onRetry={() => void userQuery.refetch()} />;
  }

  return (
    <FlatList
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.content}
      data={reposQuery.data ?? []}
      extraData={favoriteIds}
      keyExtractor={(item) => String(item.id)}
      renderItem={({ item }) => (
        <RepoListItem
          repo={item}
          onPress={openRepo}
          isFavorite={favoriteIds.has(item.id)}
          onToggleFavorite={toggleFavorite}
        />
      )}
      ItemSeparatorComponent={Separator}
      ListHeaderComponent={<ProfileHeader user={userQuery.data} />}
      ListEmptyComponent={
        reposQuery.isPending ? (
          <LoadingState label="Loading repositories" />
        ) : reposQuery.isError ? (
          <ErrorState error={reposQuery.error} onRetry={() => void reposQuery.refetch()} />
        ) : (
          <Text style={[styles.empty, { color: colors.textMuted }]}>
            No public repositories yet.
          </Text>
        )
      }
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.textMuted}
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: spacing.xl * 2 },
  empty: { textAlign: 'center', padding: spacing.xl },
});

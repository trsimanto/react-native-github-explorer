import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';

import type { RepoSort, RepoSummary } from '../../api/types';
import { EmptyState, ErrorState, LoadingState, RepoListItem, Separator } from '../../components';
import { formatCount } from '../../lib/format';
import { useDebouncedValue } from '../../lib/useDebouncedValue';
import type { TabScreenProps } from '../../navigation/types';
import { spacing, useTheme } from '../../theme';
import { useFavoritesStore } from '../favorites/favoritesStore';
import { SearchBar } from './SearchBar';
import { SortToggle } from './SortToggle';
import { useRepositorySearch } from './useRepositorySearch';

export function SearchScreen({ navigation }: TabScreenProps<'Search'>) {
  const { colors } = useTheme();
  const [text, setText] = useState('');
  const [sort, setSort] = useState<RepoSort>('stars');
  const [refreshing, setRefreshing] = useState(false);
  const query = useDebouncedValue(text.trim(), 400);

  const {
    repositories,
    totalCount,
    isPending,
    isError,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
  } = useRepositorySearch(query, sort);

  const favorites = useFavoritesStore((s) => s.favorites);
  const toggleFavorite = useFavoritesStore((s) => s.toggle);
  const favoriteIds = useMemo(() => new Set(favorites.map((f) => f.id)), [favorites]);

  const openRepo = useCallback(
    (repo: RepoSummary) =>
      navigation.navigate('RepoDetail', { owner: repo.owner.login, repo: repo.name }),
    [navigation],
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  const onEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage && !isFetchNextPageError) void fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, isFetchNextPageError, fetchNextPage]);

  const renderBody = () => {
    if (!query) {
      return (
        <EmptyState
          icon="logo-github"
          title="Explore GitHub"
          message="Search by name, topic or qualifier, e.g. “react native”, “topic:kotlin” or “user:trsimanto”."
        />
      );
    }
    if (isPending) return <LoadingState label="Searching" />;
    if (isError && repositories.length === 0) {
      return <ErrorState error={error} onRetry={() => void refetch()} />;
    }

    return (
      <FlatList
        data={repositories}
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
        contentContainerStyle={styles.listContent}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.textMuted}
          />
        }
        ListHeaderComponent={
          <Text style={[styles.count, { color: colors.textMuted }]}>
            {formatCount(totalCount)} repositories
          </Text>
        }
        ListEmptyComponent={
          <EmptyState
            icon="search-outline"
            title="No repositories found"
            message={`Nothing matches “${query}”. Try a different search.`}
          />
        }
        ListFooterComponent={
          isFetchingNextPage ? (
            <ActivityIndicator style={styles.footer} color={colors.primary} />
          ) : isFetchNextPageError ? (
            <View style={styles.footerError}>
              <ErrorState error={error} onRetry={() => void fetchNextPage()} />
            </View>
          ) : undefined
        }
      />
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.controls}>
        <SearchBar value={text} onChangeText={setText} />
        <SortToggle value={sort} onChange={setSort} />
      </View>
      {renderBody()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  controls: { padding: spacing.lg, paddingBottom: spacing.sm, gap: spacing.md },
  listContent: { paddingBottom: spacing.xl, flexGrow: 1 },
  count: { marginHorizontal: spacing.lg, marginBottom: spacing.sm, fontSize: 13 },
  footer: { marginVertical: spacing.xl },
  footerError: { minHeight: 220 },
});

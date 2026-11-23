import { useCallback, useLayoutEffect } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import type { RepoSummary } from '../../api/types';
import { EmptyState, RepoListItem, Separator } from '../../components';
import type { TabScreenProps } from '../../navigation/types';
import { spacing, useTheme } from '../../theme';
import { useFavoritesStore } from './favoritesStore';

export function FavoritesScreen({ navigation }: TabScreenProps<'Favorites'>) {
  const { colors } = useTheme();
  const favorites = useFavoritesStore((s) => s.favorites);
  const remove = useFavoritesStore((s) => s.remove);
  const clear = useFavoritesStore((s) => s.clear);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight:
        favorites.length > 0
          ? () => (
              <Pressable
                accessibilityRole="button"
                hitSlop={8}
                style={styles.headerButton}
                onPress={() =>
                  Alert.alert('Clear favorites?', 'This removes every saved repository.', [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Clear', style: 'destructive', onPress: clear },
                  ])
                }
              >
                <Text style={{ color: colors.danger, fontSize: 16 }}>Clear</Text>
              </Pressable>
            )
          : undefined,
    });
  }, [navigation, favorites.length, clear, colors.danger]);

  const openRepo = useCallback(
    (repo: RepoSummary) =>
      navigation.navigate('RepoDetail', { owner: repo.owner.login, repo: repo.name }),
    [navigation],
  );

  const onToggle = useCallback((repo: RepoSummary) => remove(repo.id), [remove]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={favorites}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <RepoListItem repo={item} onPress={openRepo} isFavorite onToggleFavorite={onToggle} />
        )}
        ItemSeparatorComponent={Separator}
        contentContainerStyle={styles.content}
        ListEmptyComponent={
          <EmptyState
            icon="star-outline"
            title="No favorites yet"
            message="Tap the star on any repository to keep it here. Favorites are stored on this device."
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flexGrow: 1, paddingVertical: spacing.lg },
  headerButton: { paddingHorizontal: spacing.sm },
});

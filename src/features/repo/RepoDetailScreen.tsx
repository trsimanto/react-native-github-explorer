import { useCallback, useLayoutEffect, useState } from 'react';
import {
  Image,
  Linking,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { isNotFoundError } from '../../api/errors';
import {
  Chip,
  ErrorState,
  FavoriteToggle,
  Icon,
  LanguageDot,
  LoadingState,
  Stat,
} from '../../components';
import { formatCount, formatRelativeDate } from '../../lib/format';
import type { RootStackScreenProps } from '../../navigation/types';
import { radius, spacing, useTheme } from '../../theme';
import { useFavoritesStore, useIsFavorite } from '../favorites/favoritesStore';
import { useReadme, useRepository } from './hooks';
import { ReadmeView } from './ReadmeView';

export function RepoDetailScreen({ route, navigation }: RootStackScreenProps<'RepoDetail'>) {
  const { owner, repo: name } = route.params;
  const { colors } = useTheme();
  const repoQuery = useRepository(owner, name);
  const readmeQuery = useReadme(owner, name);
  const [refreshing, setRefreshing] = useState(false);

  const repo = repoQuery.data;
  const isFavorite = useIsFavorite(repo?.id);
  const toggleFavorite = useFavoritesStore((s) => s.toggle);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: name,
      headerRight: repo
        ? () => <FavoriteToggle active={isFavorite} onPress={() => toggleFavorite(repo)} />
        : undefined,
    });
  }, [navigation, name, repo, isFavorite, toggleFavorite]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([repoQuery.refetch(), readmeQuery.refetch()]);
    } finally {
      setRefreshing(false);
    }
  }, [repoQuery, readmeQuery]);

  if (repoQuery.isPending) return <LoadingState />;
  if (repoQuery.isError) {
    return <ErrorState error={repoQuery.error} onRetry={() => void repoQuery.refetch()} />;
  }
  if (!repo) return null;

  const topics = repo.topics ?? [];

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.textMuted}
        />
      }
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`View ${repo.owner.login}'s profile`}
        onPress={() => navigation.push('Profile', { login: repo.owner.login })}
        style={styles.ownerRow}
      >
        <Image source={{ uri: repo.owner.avatar_url }} style={styles.ownerAvatar} />
        <Text style={[styles.ownerLogin, { color: colors.primary }]}>{repo.owner.login}</Text>
        <Icon name="chevron-forward" size={16} color={colors.textMuted} />
      </Pressable>

      <Text style={[styles.title, { color: colors.text }]}>{repo.name}</Text>
      {repo.description ? (
        <Text style={[styles.description, { color: colors.textMuted }]}>{repo.description}</Text>
      ) : null}

      {topics.length > 0 ? (
        <View style={styles.topics}>
          {topics.map((topic) => (
            <Chip key={topic} label={topic} />
          ))}
        </View>
      ) : null}

      <View style={styles.stats}>
        <Stat
          icon="star"
          color={colors.star}
          value={`${formatCount(repo.stargazers_count)} stars`}
        />
        <Stat icon="git-branch-outline" value={`${formatCount(repo.forks_count)} forks`} />
        <Stat icon="alert-circle-outline" value={`${formatCount(repo.open_issues_count)} issues`} />
        {repo.language ? <LanguageDot language={repo.language} /> : null}
      </View>
      <View style={styles.stats}>
        {repo.license?.spdx_id && repo.license.spdx_id !== 'NOASSERTION' ? (
          <Stat icon="document-text-outline" value={repo.license.spdx_id} />
        ) : null}
        <Stat icon="time-outline" value={`Pushed ${formatRelativeDate(repo.pushed_at)}`} />
        {repo.archived ? <Stat icon="archive-outline" value="Archived" /> : null}
      </View>

      <Pressable
        accessibilityRole="link"
        onPress={() => void Linking.openURL(repo.html_url)}
        style={({ pressed }) => [
          styles.githubButton,
          {
            borderColor: colors.border,
            backgroundColor: colors.surface,
            opacity: pressed ? 0.8 : 1,
          },
        ]}
      >
        <Icon name="logo-github" size={18} color={colors.text} />
        <Text style={[styles.githubLabel, { color: colors.text }]}>Open on GitHub</Text>
      </Pressable>

      <View
        style={[styles.readme, { backgroundColor: colors.surface, borderColor: colors.border }]}
      >
        <Text style={[styles.readmeTitle, { color: colors.textMuted }]}>README</Text>
        {readmeQuery.isPending ? (
          <View style={styles.readmeState}>
            <LoadingState label="Loading README" />
          </View>
        ) : readmeQuery.isError ? (
          isNotFoundError(readmeQuery.error) ? (
            <Text style={{ color: colors.textMuted }}>This repository has no README.</Text>
          ) : (
            <View style={styles.readmeState}>
              <ErrorState error={readmeQuery.error} onRetry={() => void readmeQuery.refetch()} />
            </View>
          )
        ) : (
          <ReadmeView
            markdown={readmeQuery.data}
            owner={repo.owner.login}
            repo={repo.name}
            branch={repo.default_branch}
          />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xl * 2 },
  ownerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  ownerAvatar: { width: 28, height: 28, borderRadius: 14 },
  ownerLogin: { fontSize: 15, fontWeight: '600' },
  title: { fontSize: 26, fontWeight: '700' },
  description: { fontSize: 15, lineHeight: 22 },
  topics: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.lg, alignItems: 'center' },
  githubButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  githubLabel: { fontSize: 15, fontWeight: '600' },
  readme: {
    padding: spacing.lg,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  readmeTitle: { fontSize: 12, fontWeight: '700', letterSpacing: 1, marginBottom: spacing.sm },
  readmeState: { minHeight: 160 },
});

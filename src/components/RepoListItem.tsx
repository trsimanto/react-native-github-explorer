import { memo } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import type { RepoSummary } from '../api/types';
import { formatCount, formatRelativeDate } from '../lib/format';
import { radius, spacing, useTheme } from '../theme';
import { FavoriteToggle } from './FavoriteToggle';
import { LanguageDot } from './LanguageDot';
import { Stat } from './Stat';

interface Props {
  repo: RepoSummary;
  onPress: (repo: RepoSummary) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (repo: RepoSummary) => void;
}

function RepoListItemComponent({ repo, onPress, isFavorite = false, onToggleFavorite }: Props) {
  const { colors } = useTheme();

  return (
    <Pressable
      testID={`repo-item-${repo.id}`}
      accessibilityRole="button"
      accessibilityLabel={`${repo.full_name}, ${repo.stargazers_count} stars`}
      onPress={() => onPress(repo)}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      <View style={styles.header}>
        <Image source={{ uri: repo.owner.avatar_url }} style={styles.avatar} />
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
          <Text style={{ color: colors.textMuted }}>{repo.owner.login}/</Text>
          {repo.name}
        </Text>
        {onToggleFavorite ? (
          <FavoriteToggle active={isFavorite} onPress={() => onToggleFavorite(repo)} />
        ) : null}
      </View>

      {repo.description ? (
        <Text style={[styles.description, { color: colors.textMuted }]} numberOfLines={2}>
          {repo.description}
        </Text>
      ) : null}

      <View style={styles.meta}>
        <Stat
          icon="star"
          color={colors.star}
          value={formatCount(repo.stargazers_count)}
          accessibilityLabel={`${repo.stargazers_count} stars`}
        />
        <Stat icon="git-branch-outline" value={formatCount(repo.forks_count)} />
        {repo.language ? <LanguageDot language={repo.language} /> : null}
        <Text style={[styles.updated, { color: colors.textMuted }]}>
          Updated {formatRelativeDate(repo.updated_at)}
        </Text>
      </View>
    </Pressable>
  );
}

export const RepoListItem = memo(RepoListItemComponent);

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    gap: spacing.sm,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  avatar: { width: 24, height: 24, borderRadius: 12 },
  title: { flex: 1, fontSize: 16, fontWeight: '600' },
  description: { fontSize: 14, lineHeight: 20 },
  meta: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: spacing.lg },
  updated: { fontSize: 12 },
});

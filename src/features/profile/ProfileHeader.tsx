import { Image, Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import type { GitHubUser } from '../../api/types';
import { Icon, type IconName } from '../../components/Icon';
import { formatCount } from '../../lib/format';
import { spacing, useTheme } from '../../theme';

function normaliseUrl(url: string): string {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

function DetailRow({ icon, label, url }: { icon: IconName; label: string; url?: string }) {
  const { colors } = useTheme();
  const content = (
    <View style={styles.detailRow}>
      <Icon name={icon} size={16} color={colors.textMuted} />
      <Text
        style={[styles.detail, { color: url ? colors.primary : colors.text }]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
  if (!url) return content;
  return (
    <Pressable accessibilityRole="link" onPress={() => void Linking.openURL(url)}>
      {content}
    </Pressable>
  );
}

export function ProfileHeader({ user }: { user: GitHubUser }) {
  const { colors } = useTheme();
  return (
    <View style={styles.container}>
      <View style={styles.identity}>
        <Image
          source={{ uri: user.avatar_url }}
          style={[styles.avatar, { borderColor: colors.border }]}
        />
        <View style={styles.names}>
          {user.name ? (
            <Text style={[styles.name, { color: colors.text }]}>{user.name}</Text>
          ) : null}
          <Text style={[styles.login, { color: colors.textMuted }]}>@{user.login}</Text>
        </View>
      </View>

      {user.bio ? <Text style={[styles.bio, { color: colors.text }]}>{user.bio}</Text> : null}

      <View style={styles.counts}>
        <Text style={{ color: colors.textMuted }}>
          <Text style={[styles.countValue, { color: colors.text }]}>
            {formatCount(user.followers)}
          </Text>{' '}
          followers
        </Text>
        <Text style={{ color: colors.textMuted }}>
          <Text style={[styles.countValue, { color: colors.text }]}>
            {formatCount(user.following)}
          </Text>{' '}
          following
        </Text>
        <Text style={{ color: colors.textMuted }}>
          <Text style={[styles.countValue, { color: colors.text }]}>
            {formatCount(user.public_repos)}
          </Text>{' '}
          repos
        </Text>
      </View>

      <View style={styles.details}>
        {user.company ? <DetailRow icon="business-outline" label={user.company} /> : null}
        {user.location ? <DetailRow icon="location-outline" label={user.location} /> : null}
        {user.blog ? (
          <DetailRow icon="link-outline" label={user.blog} url={normaliseUrl(user.blog)} />
        ) : null}
        {user.twitter_username ? (
          <DetailRow
            icon="logo-twitter"
            label={`@${user.twitter_username}`}
            url={`https://x.com/${user.twitter_username}`}
          />
        ) : null}
        <DetailRow icon="logo-github" label="View on GitHub" url={user.html_url} />
      </View>

      <Text style={[styles.section, { color: colors.textMuted }]}>RECENTLY PUSHED</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg, gap: spacing.md },
  identity: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  avatar: { width: 72, height: 72, borderRadius: 36, borderWidth: StyleSheet.hairlineWidth },
  names: { flex: 1 },
  name: { fontSize: 22, fontWeight: '700' },
  login: { fontSize: 16 },
  bio: { fontSize: 15, lineHeight: 21 },
  counts: { flexDirection: 'row', gap: spacing.lg, flexWrap: 'wrap' },
  countValue: { fontWeight: '700' },
  details: { gap: spacing.sm },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  detail: { fontSize: 14, flexShrink: 1 },
  section: { marginTop: spacing.sm, fontSize: 12, fontWeight: '700', letterSpacing: 1 },
});

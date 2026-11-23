import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { isNotFoundError, isRateLimitError, NetworkError } from '../api/errors';
import { formatResetTime } from '../lib/format';
import { radius, spacing, useTheme } from '../theme';
import { Icon, type IconName } from './Icon';

interface MessageProps {
  icon: IconName;
  title: string;
  message?: string;
  action?: ReactNode;
  testID?: string;
}

function MessageView({ icon, title, message, action, testID }: MessageProps) {
  const { colors } = useTheme();
  return (
    <View style={styles.container} testID={testID}>
      <Icon name={icon} size={44} color={colors.textMuted} />
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      {message ? (
        <Text style={[styles.message, { color: colors.textMuted }]}>{message}</Text>
      ) : null}
      {action}
    </View>
  );
}

export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.container} accessibilityRole="progressbar" accessibilityLabel={label}>
      <ActivityIndicator color={colors.primary} />
    </View>
  );
}

export function EmptyState(props: Omit<MessageProps, 'testID'>) {
  return <MessageView {...props} testID="empty-state" />;
}

export function describeError(error: unknown): { icon: IconName; title: string; message: string } {
  if (isRateLimitError(error)) {
    return {
      icon: 'hourglass-outline',
      title: 'GitHub rate limit reached',
      message: `Unauthenticated requests are limited by GitHub. ${formatResetTime(error.resetAt)}`,
    };
  }
  if (error instanceof NetworkError) {
    return {
      icon: 'cloud-offline-outline',
      title: 'You appear to be offline',
      message: 'Check your connection and try again.',
    };
  }
  if (isNotFoundError(error)) {
    return {
      icon: 'help-circle-outline',
      title: 'Not found',
      message: 'It may have been renamed or deleted.',
    };
  }
  return {
    icon: 'warning-outline',
    title: 'Something went wrong',
    message: error instanceof Error ? error.message : 'Unknown error',
  };
}

export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const { colors } = useTheme();
  const { icon, title, message } = describeError(error);
  return (
    <MessageView
      testID="error-state"
      icon={icon}
      title={title}
      message={message}
      action={
        onRetry ? (
          <Pressable
            accessibilityRole="button"
            onPress={onRetry}
            style={({ pressed }) => [
              styles.button,
              { backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1 },
            ]}
          >
            <Text style={[styles.buttonLabel, { color: colors.primaryContrast }]}>Try again</Text>
          </Pressable>
        ) : null
      }
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.sm,
  },
  title: { fontSize: 17, fontWeight: '600', textAlign: 'center' },
  message: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  button: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.pill,
  },
  buttonLabel: { fontSize: 15, fontWeight: '600' },
});

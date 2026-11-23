import { StyleSheet, Text, View } from 'react-native';

import { radius, spacing, useTheme } from '../theme';

export function Chip({ label }: { label: string }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.chip, { backgroundColor: colors.surfaceMuted }]}>
      <Text style={[styles.label, { color: colors.primary }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.pill },
  label: { fontSize: 12, fontWeight: '500' },
});

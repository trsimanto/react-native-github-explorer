import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { RepoSort } from '../../api/types';
import { radius, spacing, useTheme } from '../../theme';

const OPTIONS: { value: RepoSort; label: string }[] = [
  { value: 'stars', label: 'Most stars' },
  { value: 'updated', label: 'Recently updated' },
];

interface Props {
  value: RepoSort;
  onChange: (value: RepoSort) => void;
}

export function SortToggle({ value, onChange }: Props) {
  const { colors } = useTheme();
  return (
    <View
      accessibilityRole="tablist"
      style={[styles.container, { backgroundColor: colors.surfaceMuted }]}
    >
      {OPTIONS.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => onChange(option.value)}
            style={[styles.segment, selected && { backgroundColor: colors.surface }]}
          >
            <Text
              style={[
                styles.label,
                { color: selected ? colors.text : colors.textMuted },
                selected && styles.labelSelected,
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', borderRadius: radius.sm, padding: 2 },
  segment: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm - 2,
    borderRadius: radius.sm - 2,
  },
  label: { fontSize: 13 },
  labelSelected: { fontWeight: '600' },
});

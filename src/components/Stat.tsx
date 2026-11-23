import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../theme';
import { Icon, type IconName } from './Icon';

interface StatProps {
  icon: IconName;
  value: string;
  color?: string;
  accessibilityLabel?: string;
}

export function Stat({ icon, value, color, accessibilityLabel }: StatProps) {
  const { colors } = useTheme();
  return (
    <View style={styles.row} accessible accessibilityLabel={accessibilityLabel}>
      <Icon name={icon} size={14} color={color ?? colors.textMuted} />
      <Text style={[styles.value, { color: colors.textMuted }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  value: { fontSize: 13 },
});

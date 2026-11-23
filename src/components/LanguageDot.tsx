import { StyleSheet, Text, View } from 'react-native';

import { languageColor, useTheme } from '../theme';

export function LanguageDot({ language }: { language: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.row}>
      <View style={[styles.dot, { backgroundColor: languageColor(language) }]} />
      <Text style={[styles.label, { color: colors.textMuted }]}>{language}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  label: { fontSize: 13 },
});

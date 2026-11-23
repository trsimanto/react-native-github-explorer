import { Pressable, StyleSheet } from 'react-native';

import { useTheme } from '../theme';
import { Icon } from './Icon';

interface Props {
  active: boolean;
  onPress: () => void;
  size?: number;
}

export function FavoriteToggle({ active, onPress, size = 22 }: Props) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      hitSlop={10}
      accessibilityRole="button"
      accessibilityLabel={active ? 'Remove from favorites' : 'Add to favorites'}
      accessibilityState={{ selected: active }}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <Icon
        name={active ? 'star' : 'star-outline'}
        size={size}
        color={active ? colors.star : colors.textMuted}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { padding: 4 },
  pressed: { opacity: 0.6 },
});

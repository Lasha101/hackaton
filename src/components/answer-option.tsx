import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type AnswerState = 'idle' | 'correct' | 'wrong' | 'revealed';

type AnswerOptionProps = {
  index: number;
  label: string;
  state: AnswerState;
  disabled?: boolean;
  onPress: () => void;
};

export function AnswerOption({ index, label, state, disabled, onPress }: AnswerOptionProps) {
  const theme = useTheme();
  const letter = String.fromCharCode(65 + index);

  const palette = {
    idle: { background: theme.surface, border: theme.backgroundSelected, badge: theme.backgroundElement, badgeText: theme.textSecondary },
    correct: { background: theme.successBackground, border: theme.success, badge: theme.success, badgeText: theme.surface },
    wrong: { background: theme.errorBackground, border: theme.error, badge: theme.error, badgeText: theme.surface },
    revealed: { background: theme.surface, border: theme.success, badge: theme.successBackground, badgeText: theme.success },
  }[state];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled, selected: state === 'correct' || state === 'wrong' }}
      style={({ pressed }) => [
        styles.container,
        { backgroundColor: palette.background, borderColor: palette.border },
        pressed && styles.pressed,
      ]}>
      <View style={[styles.badge, { backgroundColor: palette.badge }]}>
        <ThemedText type="smallBold" style={{ color: palette.badgeText }}>
          {letter}
        </ThemedText>
      </View>
      <ThemedText style={styles.label}>{label}</ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
    borderWidth: 1,
  },
  pressed: {
    opacity: 0.8,
  },
  badge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    flex: 1,
    fontWeight: 400,
  },
});

import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useThemePreference } from '@/hooks/use-theme-preference';

type ScreenHeaderProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
};

export function ScreenHeader({ eyebrow, title, subtitle }: ScreenHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.text}>
        {eyebrow && (
          <ThemedText type="code" themeColor="accent" style={styles.eyebrow}>
            {eyebrow}
          </ThemedText>
        )}
        <ThemedText style={styles.title}>{title}</ThemedText>
        {subtitle && (
          <ThemedText type="small" themeColor="textSecondary" style={styles.subtitle}>
            {subtitle}
          </ThemedText>
        )}
      </View>
      <ThemeToggle />
    </View>
  );
}

export function ThemeToggle() {
  const theme = useTheme();
  const { scheme, toggleScheme } = useThemePreference();

  return (
    <Pressable
      onPress={toggleScheme}
      accessibilityRole="button"
      accessibilityLabel={scheme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
      hitSlop={8}
      style={({ pressed }) => [
        styles.toggle,
        { backgroundColor: theme.surface, borderColor: theme.backgroundSelected },
        pressed && styles.pressed,
      ]}>
      <ThemedText themeColor="textSecondary" style={styles.toggleIcon}>
        {scheme === 'dark' ? '☀︎' : '☾'}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  text: {
    flex: 1,
    gap: Spacing.one,
  },
  eyebrow: {
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: 600,
  },
  subtitle: {
    fontWeight: 400,
  },
  toggle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleIcon: {
    fontSize: 18,
    lineHeight: 22,
  },
  pressed: {
    opacity: 0.8,
  },
});

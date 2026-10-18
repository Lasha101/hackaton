import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { type ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { type MaterialKind } from '@/hooks/use-materials';

const kindColors: Record<MaterialKind, { color: ThemeColor; background: ThemeColor }> = {
  pdf: { color: 'error', background: 'errorBackground' },
  docx: { color: 'accent', background: 'accentBackground' },
  txt: { color: 'success', background: 'successBackground' },
  other: { color: 'textSecondary', background: 'backgroundElement' },
};

export function FileBadge({ kind }: { kind: MaterialKind }) {
  const theme = useTheme();
  const { color, background } = kindColors[kind];

  return (
    <View style={[styles.badge, { backgroundColor: theme[background] }]}>
      <ThemedText type="code" themeColor={color} style={styles.label}>
        {kind === 'other' ? 'FILE' : kind.toUpperCase()}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 11,
    letterSpacing: 0.5,
  },
});

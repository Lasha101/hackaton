import { StyleSheet, View } from 'react-native';

import { Screen } from '@/components/screen';
import { ScreenHeader } from '@/components/screen-header';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useMaterials } from '@/hooks/use-materials';
import { useTheme } from '@/hooks/use-theme';

// Placeholder profile until accounts exist.
export default function ProfileScreen() {
  const theme = useTheme();
  const { materials } = useMaterials();
  const cardCount = materials.reduce((total, material) => total + material.cardCount, 0);

  const stats = [
    { label: 'Files', value: materials.length },
    { label: 'Cards', value: cardCount },
    { label: 'Day streak', value: 3 },
  ];

  return (
    <Screen>
      <ScreenHeader eyebrow="Profile" title="Your profile" />

      <View style={styles.identity}>
        <View style={[styles.avatar, { backgroundColor: theme.accentBackground }]}>
          <ThemedText themeColor="accent" style={styles.initials}>
            GL
          </ThemedText>
        </View>
        <View style={styles.identityText}>
          <ThemedText style={styles.name}>Guest learner</ThemedText>
          <ThemedText type="small" themeColor="textSecondary" style={styles.light}>
            Sign-in is coming soon
          </ThemedText>
        </View>
      </View>

      <View style={styles.stats}>
        {stats.map((stat) => (
          <View
            key={stat.label}
            style={[styles.stat, { backgroundColor: theme.surface, borderColor: theme.backgroundSelected }]}>
            <ThemedText style={styles.statValue}>{stat.value}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={styles.light}>
              {stat.label}
            </ThemedText>
          </View>
        ))}
      </View>

      <View style={[styles.menu, { backgroundColor: theme.surface, borderColor: theme.backgroundSelected }]}>
        {['Account', 'Notifications', 'Study reminders', 'Help & feedback'].map((item, index) => (
          <View
            key={item}
            style={[styles.menuRow, index > 0 && { borderTopWidth: 1, borderTopColor: theme.backgroundElement }]}>
            <ThemedText style={styles.light}>{item}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={styles.light}>
              Soon
            </ThemedText>
          </View>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: 600,
  },
  identityText: {
    gap: 2,
  },
  name: {
    fontSize: 18,
    fontWeight: 600,
  },
  light: {
    fontWeight: 400,
  },
  stats: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    paddingVertical: Spacing.three,
    borderRadius: 18,
    borderWidth: 1,
  },
  statValue: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: 600,
  },
  menu: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
  },
});

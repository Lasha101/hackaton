import { router, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { FileBadge } from '@/components/file-badge';
import { Screen } from '@/components/screen';
import { ScreenHeader } from '@/components/screen-header';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { formatDate, formatFileSize, useMaterials, type Material } from '@/hooks/use-materials';
import { useTheme } from '@/hooks/use-theme';

export default function LibraryScreen() {
  const { materials, loading, error, refresh } = useMaterials();
  const count = materials.length;

  // Pick up progress made while another tab was open.
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  return (
    <Screen>
      <ScreenHeader
        eyebrow="Library"
        title="Your materials"
        subtitle={count === 1 ? '1 file ready to study' : `${count} files ready to study`}
      />

      {error && count === 0 ? (
        <ErrorState message={error} onRetry={refresh} />
      ) : loading && count === 0 ? (
        <ActivityIndicator style={styles.loader} />
      ) : count === 0 ? (
        <EmptyState />
      ) : (
        <View style={styles.list}>
          {materials.map((material) => (
            <MaterialRow key={material.id} material={material} />
          ))}
        </View>
      )}
    </Screen>
  );
}

function MaterialRow({ material }: { material: Material }) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={() => router.push({ pathname: '/study', params: { materialId: material.id } })}
      accessibilityRole="button"
      accessibilityLabel={`Study ${material.name}`}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: theme.surface, borderColor: theme.backgroundSelected },
        pressed && styles.pressed,
      ]}>
      <FileBadge kind={material.kind} />
      <View style={styles.rowText}>
        <ThemedText numberOfLines={1} style={styles.name}>
          {material.name}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary" style={styles.meta}>
          {[
            material.processing
              ? `Preparing lessons ${material.readySections}/${material.totalSections}`
              : `${material.cardCount} cards`,
            material.size > 0 ? formatFileSize(material.size) : null,
            formatDate(material.uploadedAt),
          ]
            .filter(Boolean)
            .join(' · ')}
        </ThemedText>
      </View>
      <ThemedText themeColor="textSecondary" style={styles.chevron}>
        ›
      </ThemedText>
    </Pressable>
  );
}

function EmptyState() {
  const theme = useTheme();

  return (
    <View style={[styles.empty, { borderColor: theme.backgroundSelected }]}>
      <ThemedText style={styles.emptyTitle}>No materials yet</ThemedText>
      <ThemedText type="small" themeColor="textSecondary" style={styles.emptyText}>
        Upload a PDF, Word document or text file and we’ll turn it into study cards.
      </ThemedText>
      <View style={styles.emptyAction}>
        <Button label="Upload a file" onPress={() => router.navigate('/upload')} primary />
      </View>
    </View>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  const theme = useTheme();

  return (
    <View style={[styles.empty, { borderColor: theme.backgroundSelected }]}>
      <ThemedText style={styles.emptyTitle}>Couldn’t load your library</ThemedText>
      <ThemedText type="small" themeColor="textSecondary" style={styles.emptyText}>
        {message}
      </ThemedText>
      <View style={styles.emptyAction}>
        <Button label="Try again" onPress={onRetry} primary />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loader: {
    marginTop: Spacing.five,
  },
  list: {
    gap: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: 18,
    borderWidth: 1,
  },
  pressed: {
    opacity: 0.8,
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontWeight: 500,
  },
  meta: {
    fontWeight: 400,
  },
  chevron: {
    fontSize: 22,
    lineHeight: 26,
  },
  empty: {
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.five,
    paddingHorizontal: Spacing.four,
    borderRadius: 20,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 600,
  },
  emptyText: {
    textAlign: 'center',
    fontWeight: 400,
  },
  emptyAction: {
    flexDirection: 'row',
    marginTop: Spacing.two,
  },
});

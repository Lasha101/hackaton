import * as DocumentPicker from 'expo-document-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { uploadStudyMaterial } from '@/api/materials';
import { Button } from '@/components/button';
import { FileBadge } from '@/components/file-badge';
import { Screen } from '@/components/screen';
import { ScreenHeader } from '@/components/screen-header';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { formatFileSize, kindFromFile, useMaterials } from '@/hooks/use-materials';
import { useTheme } from '@/hooks/use-theme';

// Matches what the backend can read (app/extract.py). Old binary .doc files aren't supported.
const ACCEPTED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'text/markdown',
];
const MAX_SIZE = 20 * 1024 * 1024;

type Status =
  | { kind: 'idle' }
  | { kind: 'uploading' }
  | { kind: 'done'; lessonCount: number }
  | { kind: 'error'; message: string };

export default function UploadScreen() {
  const theme = useTheme();
  const { addMaterial, refresh } = useMaterials();
  const [file, setFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [status, setStatus] = useState<Status>({ kind: 'idle' });

  async function pickFile() {
    const result = await DocumentPicker.getDocumentAsync({ type: ACCEPTED_TYPES });
    if (result.canceled) return;

    const asset = result.assets[0];
    if (asset.size && asset.size > MAX_SIZE) {
      setFile(null);
      setStatus({ kind: 'error', message: 'That file is larger than 20 MB. Try a smaller one.' });
      return;
    }
    setFile(asset);
    setStatus({ kind: 'idle' });
  }

  async function upload() {
    if (!file) return;
    setStatus({ kind: 'uploading' });
    try {
      const response = await uploadStudyMaterial(file);
      // Show it right away; the library's polling fills in progress as lessons are generated.
      addMaterial({
        id: response.doc_id,
        name: file.name,
        kind: kindFromFile(file.name, file.mimeType),
        size: file.size ?? 0,
        uploadedAt: Date.now(),
        cardCount: 0,
        totalSections: response.total_sections,
        readySections: 0,
        answered: 0,
        processing: true,
      });
      refresh();
      setStatus({ kind: 'done', lessonCount: response.total_sections });
      setFile(null);
    } catch (error) {
      setStatus({
        kind: 'error',
        message: error instanceof Error ? error.message : 'Something went wrong. Please try again.',
      });
    }
  }

  const uploading = status.kind === 'uploading';

  return (
    <Screen>
      <ScreenHeader
        eyebrow="Upload"
        title="Add study material"
        subtitle="We’ll read your file and turn it into short cards and questions."
      />

      {file ? (
        <View style={[styles.fileCard, { backgroundColor: theme.surface, borderColor: theme.backgroundSelected }]}>
          <FileBadge kind={kindFromFile(file.name, file.mimeType)} />
          <View style={styles.fileText}>
            <ThemedText numberOfLines={1} style={styles.fileName}>
              {file.name}
            </ThemedText>
            {file.size !== undefined && (
              <ThemedText type="small" themeColor="textSecondary" style={styles.light}>
                {formatFileSize(file.size)}
              </ThemedText>
            )}
          </View>
          {!uploading && (
            <Pressable
              onPress={() => setFile(null)}
              accessibilityRole="button"
              accessibilityLabel="Remove file"
              hitSlop={10}>
              <ThemedText themeColor="textSecondary" style={styles.remove}>
                ×
              </ThemedText>
            </Pressable>
          )}
        </View>
      ) : (
        <Pressable
          onPress={pickFile}
          accessibilityRole="button"
          accessibilityLabel="Choose a file to upload"
          style={({ pressed }) => [
            styles.dropZone,
            { backgroundColor: theme.surface, borderColor: theme.backgroundSelected },
            pressed && styles.pressed,
          ]}>
          <View style={[styles.dropIcon, { backgroundColor: theme.accentBackground }]}>
            <ThemedText themeColor="accent" style={styles.dropArrow}>
              ↑
            </ThemedText>
          </View>
          <ThemedText style={styles.dropTitle}>Choose a file</ThemedText>
          <ThemedText type="small" themeColor="textSecondary" style={styles.light}>
            PDF, DOCX, TXT or Markdown · up to 20 MB
          </ThemedText>
        </Pressable>
      )}

      {file && (
        <View style={styles.actions}>
          <Button label="Choose another" onPress={pickFile} disabled={uploading} />
          <Button label={uploading ? 'Uploading…' : 'Upload'} onPress={upload} loading={uploading} primary />
        </View>
      )}

      {status.kind === 'done' && (
        <View style={[styles.message, { backgroundColor: theme.successBackground }]}>
          <ThemedText type="smallBold" themeColor="success">
            Added to your library · preparing {status.lessonCount}{' '}
            {status.lessonCount === 1 ? 'lesson' : 'lessons'}
          </ThemedText>
          <Pressable onPress={() => router.navigate('/')} accessibilityRole="button" hitSlop={8}>
            <ThemedText type="smallBold" themeColor="success">
              View  →
            </ThemedText>
          </Pressable>
        </View>
      )}

      {status.kind === 'error' && (
        <View style={[styles.message, { backgroundColor: theme.errorBackground }]}>
          <ThemedText type="smallBold" themeColor="error" style={styles.messageText}>
            {status.message}
          </ThemedText>
        </View>
      )}

      <View style={styles.tips}>
        <ThemedText type="smallBold" themeColor="textSecondary">
          Tips for better cards
        </ThemedText>
        {[
          'Text-based files work best — scanned images may not be read.',
          'Shorter chapters give more focused questions.',
          'Headings help us group cards by topic.',
        ].map((tip) => (
          <View key={tip} style={styles.tip}>
            <View style={[styles.dot, { backgroundColor: theme.backgroundSelected }]} />
            <ThemedText type="small" themeColor="textSecondary" style={[styles.light, styles.tipText]}>
              {tip}
            </ThemedText>
          </View>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  dropZone: {
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.six,
    paddingHorizontal: Spacing.four,
    borderRadius: 24,
    borderWidth: 1.5,
    borderStyle: 'dashed',
  },
  pressed: {
    opacity: 0.8,
  },
  dropIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.two,
  },
  dropArrow: {
    fontSize: 24,
    lineHeight: 28,
    fontWeight: 600,
  },
  dropTitle: {
    fontSize: 18,
    fontWeight: 600,
  },
  light: {
    fontWeight: 400,
  },
  fileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: 18,
    borderWidth: 1,
  },
  fileText: {
    flex: 1,
    gap: 2,
  },
  fileName: {
    fontWeight: 500,
  },
  remove: {
    fontSize: 24,
    lineHeight: 28,
    paddingHorizontal: Spacing.one,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  message: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: 16,
  },
  messageText: {
    flex: 1,
  },
  tips: {
    gap: Spacing.two,
  },
  tip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  tipText: {
    flex: 1,
  },
});

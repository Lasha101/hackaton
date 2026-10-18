import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View, type ScrollViewInstance } from 'react-native';

import { answerCard, getResults, getSection, getStatus, type Results, type Section } from '@/api/materials';
import { AnswerOption, type AnswerState } from '@/components/answer-option';
import { Button } from '@/components/button';
import { Screen } from '@/components/screen';
import { ScreenHeader } from '@/components/screen-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useMaterials } from '@/hooks/use-materials';
import { useTheme } from '@/hooks/use-theme';

type Phase =
  | { kind: 'loading'; message: string }
  | { kind: 'card' }
  | { kind: 'error'; message: string }
  | { kind: 'finished'; results: Results };

/** The server's verdict on this card's first answer: tells us the right option and why. */
type Grade = { correctIndex: number; explanation: string };

export default function StudyScreen() {
  const theme = useTheme();
  const { materialId } = useLocalSearchParams<{ materialId?: string }>();
  const { materials, refresh } = useMaterials();
  const material = materials.find((item) => item.id === materialId);

  const [phase, setPhase] = useState<Phase>({ kind: 'loading', message: 'Loading your lessons…' });
  const [section, setSection] = useState<Section | null>(null);
  const [cardIndex, setCardIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [grade, setGrade] = useState<Grade | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [answerError, setAnswerError] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showCommentsNote, setShowCommentsNote] = useState(false);
  const scrollRef = useRef<ScrollViewInstance>(null);
  // Bumped on every navigation, so a slow response for a section we've moved past is ignored.
  const navigation = useRef(0);
  const retry = useRef<() => void>(() => {});

  const resetCard = useCallback(() => {
    setSelected(null);
    setGrade(null);
    setAnswerError(null);
    setShowExplanation(false);
    setShowCommentsNote(false);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, []);

  /** Show the first card still to answer, starting at section `start` of `total`. */
  const goToSection = useCallback(
    async (docId: string, start: number, total: number) => {
      const token = ++navigation.current;
      retry.current = () => goToSection(docId, start, total);
      setPhase({ kind: 'loading', message: 'Preparing your lesson…' });
      try {
        for (let i = start; ; i++) {
          if (i >= total) {
            const results = await getResults(docId);
            if (token !== navigation.current) return;
            setPhase({ kind: 'finished', results });
            refresh();
            return;
          }
          const next = await getSection(docId, i);
          if (token !== navigation.current) return;
          const firstOpen = next.cards.findIndex((card) => !card.answered);
          // Skip front/back matter, and lessons already finished in an earlier session.
          if (next.skip || firstOpen === -1) continue;

          resetCard();
          setSection(next);
          setCardIndex(firstOpen);
          setPhase({ kind: 'card' });
          // Warm up the next lesson so it's usually generated before the learner gets there.
          if (i + 1 < total) getSection(docId, i + 1).catch(() => {});
          return;
        }
      } catch (error) {
        if (token !== navigation.current) return;
        setPhase({ kind: 'error', message: error instanceof Error ? error.message : 'Something went wrong.' });
      }
    },
    [refresh, resetCard],
  );

  useEffect(() => {
    if (!materialId) return;
    const start = async () => {
      retry.current = start;
      try {
        const status = await getStatus(materialId);
        await goToSection(materialId, status.resume_section ?? status.total, status.total);
      } catch (error) {
        setPhase({ kind: 'error', message: error instanceof Error ? error.message : 'Something went wrong.' });
      }
    };
    start();
    return () => {
      navigation.current++; // ignore anything still in flight after leaving the screen
    };
  }, [materialId, goToSection]);

  function handleBack() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  }

  const backLink = (
    <Pressable onPress={handleBack} accessibilityRole="button" hitSlop={8} style={styles.back}>
      <ThemedText type="smallBold" themeColor="textSecondary" numberOfLines={1}>
        ‹  {material?.name ?? 'Library'}
      </ThemedText>
    </Pressable>
  );

  if (!materialId) {
    return (
      <Screen>
        {backLink}
        <ScreenHeader title="Pick a file to study" subtitle="Choose something from your library first." />
      </Screen>
    );
  }

  if (phase.kind === 'loading' || phase.kind === 'error') {
    return (
      <Screen>
        {backLink}
        <View style={styles.centered}>
          {phase.kind === 'loading' ? (
            <>
              <ActivityIndicator color={theme.accent} />
              <ThemedText type="small" themeColor="textSecondary" style={styles.note}>
                {phase.message}
              </ThemedText>
            </>
          ) : (
            <>
              <ThemedText type="smallBold" themeColor="error" style={styles.note}>
                {phase.message}
              </ThemedText>
              <View style={styles.actions}>
                <Button label="Try again" onPress={() => retry.current()} primary />
              </View>
            </>
          )}
        </View>
      </Screen>
    );
  }

  if (phase.kind === 'finished') {
    const { results } = phase;
    return (
      <Screen>
        {backLink}
        <ScreenHeader eyebrow="Finished" title="You’ve studied every card" />
        <ThemedView type="surface" style={[styles.card, styles.score, { borderColor: theme.backgroundSelected }]}>
          <ThemedText style={styles.scoreValue}>
            {results.correct} / {results.answered}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            answered correctly on the first try ({Math.round(results.score_percent)}%)
          </ThemedText>
        </ThemedView>
        {results.missed.length > 0 && (
          <View style={styles.section}>
            <ThemedText type="smallBold" themeColor="textSecondary">
              Worth another look
            </ThemedText>
            {results.missed.map((miss) => (
              <ThemedView
                key={`${miss.section_index}-${miss.card_index}`}
                type="surface"
                style={[styles.card, { borderColor: theme.backgroundSelected }]}>
                <ThemedText style={styles.missQuestion}>{miss.question}</ThemedText>
                <ThemedText type="small" themeColor="success">
                  {miss.options[miss.correct_index]}
                </ThemedText>
              </ThemedView>
            ))}
          </View>
        )}
        <View style={styles.actions}>
          <Button label="Back to library" onPress={handleBack} primary />
        </View>
      </Screen>
    );
  }

  // phase.kind === 'card'
  const docId = materialId;
  const lesson = section!;
  const card = lesson.cards[cardIndex];
  const correctIndex = grade?.correctIndex ?? -1;
  const answered = selected !== null && grade !== null;
  const isCorrect = answered && selected === correctIndex;

  function stateFor(index: number): AnswerState {
    if (!answered) return 'idle';
    if (index === selected) return isCorrect ? 'correct' : 'wrong';
    if (index === correctIndex) return 'revealed';
    return 'idle';
  }

  async function handleSelect(index: number) {
    setSelected(index);
    setAnswerError(null);
    // Retries after a wrong answer are graded locally: the server only scores the first try.
    if (grade) return;
    setSubmitting(true);
    try {
      const result = await answerCard(docId, lesson.index, cardIndex, index);
      setGrade({ correctIndex: result.correct_index, explanation: result.explanation });
    } catch (error) {
      setSelected(null);
      setAnswerError(error instanceof Error ? error.message : 'Could not check your answer.');
    } finally {
      setSubmitting(false);
    }
  }

  function handleNext() {
    if (cardIndex + 1 < lesson.cards.length) {
      resetCard();
      setCardIndex(cardIndex + 1);
    } else {
      goToSection(docId, lesson.index + 1, lesson.total_sections);
    }
  }

  function handleComments() {
    // Will become router.push('/comments') once the comments page exists.
    setShowCommentsNote((value) => !value);
  }

  const cardLabel = lesson.cards.length > 1 ? ` · card ${cardIndex + 1} of ${lesson.cards.length}` : '';

  return (
    <Screen scrollRef={scrollRef}>
      <View style={styles.top}>
        {backLink}
        <ScreenHeader
          eyebrow={`Lesson ${lesson.index + 1} / ${lesson.total_sections}${cardLabel}`}
          title={lesson.title}
        />
      </View>

      <ThemedView type="surface" style={[styles.card, { borderColor: theme.backgroundSelected }]}>
        <ThemedText type="smallBold" themeColor="textSecondary">
          Read
        </ThemedText>
        <ThemedText style={styles.snippet}>{card.text}</ThemedText>
      </ThemedView>

      <View style={styles.section}>
        <ThemedText type="smallBold" themeColor="textSecondary">
          Question
        </ThemedText>
        <ThemedText style={styles.question}>{card.question}</ThemedText>
      </View>

      <View style={styles.options}>
        {card.options.map((option, index) => (
          <AnswerOption
            key={option}
            index={index}
            label={option}
            state={stateFor(index)}
            disabled={answered || submitting}
            onPress={() => handleSelect(index)}
          />
        ))}
      </View>

      {submitting && <ActivityIndicator color={theme.accent} style={styles.loader} />}

      {answerError && (
        <ThemedText type="smallBold" themeColor="error">
          {answerError}
        </ThemedText>
      )}

      {answered && (
        <View style={styles.feedback}>
          <ThemedText type="smallBold" themeColor={isCorrect ? 'success' : 'error'}>
            {isCorrect
              ? 'Correct! Nicely done.'
              : `Not quite — the answer is ${String.fromCharCode(65 + correctIndex)}.`}
          </ThemedText>
          {isCorrect ? (
            <Pressable
              onPress={handleNext}
              accessibilityRole="button"
              hitSlop={8}
              style={({ pressed }) => [
                styles.nextButton,
                { backgroundColor: theme.accentBackground },
                pressed && { opacity: 0.8 },
              ]}>
              <ThemedText type="smallBold" themeColor="accent">
                Next  →
              </ThemedText>
            </Pressable>
          ) : (
            <Pressable onPress={() => setSelected(null)} accessibilityRole="button" hitSlop={8}>
              <ThemedText type="smallBold" themeColor="accent">
                Try again
              </ThemedText>
            </Pressable>
          )}
        </View>
      )}

      <View style={styles.actions}>
        <Button
          label={showExplanation ? 'Hide explanation' : '✦  Explain with AI'}
          onPress={() => setShowExplanation((value) => !value)}
          // The explanation gives the answer away, so the server only sends it after an answer.
          disabled={!grade}
          primary
        />
        <Button label="Comments" onPress={handleComments} />
      </View>

      {showExplanation && grade && (
        <View
          style={[styles.card, { backgroundColor: theme.accentBackground, borderColor: theme.accentBackground }]}>
          <ThemedText type="smallBold" themeColor="accent">
            ✦ AI explanation
          </ThemedText>
          <ThemedText style={styles.snippet}>{grade.explanation}</ThemedText>
        </View>
      )}

      {!grade && (
        <ThemedText type="small" themeColor="textSecondary" style={styles.note}>
          Answer the question to unlock the explanation.
        </ThemedText>
      )}

      {showCommentsNote && (
        <ThemedText type="small" themeColor="textSecondary" style={styles.note}>
          Comments are coming soon — you’ll be able to discuss this card with other learners.
        </ThemedText>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: {
    gap: Spacing.three,
  },
  back: {
    alignSelf: 'flex-start',
  },
  centered: {
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.six,
  },
  card: {
    padding: Spacing.four,
    borderRadius: 20,
    borderWidth: 1,
    gap: Spacing.two,
  },
  snippet: {
    fontSize: 17,
    lineHeight: 28,
    fontWeight: 400,
  },
  section: {
    gap: Spacing.two,
  },
  question: {
    fontSize: 19,
    lineHeight: 28,
    fontWeight: 500,
  },
  options: {
    gap: Spacing.two,
  },
  feedback: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.three,
  },
  nextButton: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: 999,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  loader: {
    alignSelf: 'flex-start',
    marginVertical: Spacing.two,
  },
  note: {
    textAlign: 'center',
  },
  score: {
    alignItems: 'center',
  },
  scoreValue: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: 600,
  },
  missQuestion: {
    fontWeight: 500,
  },
});

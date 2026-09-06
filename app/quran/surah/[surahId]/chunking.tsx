import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState, useMemo, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { getSurahById } from '../../../../src/data/arabic/quran';
import { useQuranSurah } from '../../../../src/hooks/useQuranData';
import { useQuranStore } from '../../../../src/stores/quranStore';
import { QuranWord } from '../../../../src/types/quran';
import { quranAudioService, AudioState } from '../../../../src/services/quranAudioService';
import { useAyahTranslations } from '../../../../src/hooks/useAyahTranslations';
import { useLocalizedContent } from '../../../../src/hooks/useLocalizedContent';
import { useSettingsStore } from '../../../../src/stores/settingsStore';
import { font, color, radius } from '../../../../src/theme/tokens';

// ============ Types ============

type ChunkStep =
  | { type: 'learn'; chunkIndex: number }
  | { type: 'combine'; fromChunk: number; toChunk: number }
  | { type: 'full' };

// ============ Algorithm ============

function splitIntoChunks(words: QuranWord[], chunkSize = 3): QuranWord[][] {
  const chunks: QuranWord[][] = [];
  for (let i = 0; i < words.length; i += chunkSize) {
    chunks.push(words.slice(i, i + chunkSize));
  }
  return chunks;
}

function generateSteps(chunks: QuranWord[][]): ChunkStep[] {
  const steps: ChunkStep[] = [];
  if (chunks.length <= 1) {
    steps.push({ type: 'full' });
    return steps;
  }

  // Learn chunk 0
  steps.push({ type: 'learn', chunkIndex: 0 });

  for (let i = 1; i < chunks.length; i++) {
    // Learn new chunk in isolation
    steps.push({ type: 'learn', chunkIndex: i });
    // Combine everything learned so far (0..i)
    // For the last chunk, this combine IS the full ayah, so use 'full' type
    if (i === chunks.length - 1) {
      steps.push({ type: 'full' });
    } else {
      steps.push({ type: 'combine', fromChunk: 0, toChunk: i });
    }
  }

  return steps;
}

// ============ Word State ============

type WordVisualState = 'current' | 'assembled' | 'unlearned';

function getWordState(
  wordIndex: number,
  step: ChunkStep,
  chunks: QuranWord[][],
): WordVisualState {
  // Build flat index ranges for each chunk
  const chunkRanges: { start: number; end: number }[] = [];
  let offset = 0;
  for (const chunk of chunks) {
    chunkRanges.push({ start: offset, end: offset + chunk.length - 1 });
    offset += chunk.length;
  }

  if (step.type === 'full') {
    return 'current';
  }

  if (step.type === 'learn') {
    const currentRange = chunkRanges[step.chunkIndex];
    if (wordIndex >= currentRange.start && wordIndex <= currentRange.end) {
      return 'current';
    }
    // Previous chunks are assembled
    for (let i = 0; i < step.chunkIndex; i++) {
      const range = chunkRanges[i];
      if (wordIndex >= range.start && wordIndex <= range.end) {
        return 'assembled';
      }
    }
    return 'unlearned';
  }

  if (step.type === 'combine') {
    // Chunks fromChunk..toChunk are current
    for (let i = step.fromChunk; i <= step.toChunk; i++) {
      const range = chunkRanges[i];
      if (wordIndex >= range.start && wordIndex <= range.end) {
        return 'current';
      }
    }
    return 'unlearned';
  }

  return 'unlearned';
}

// ============ Constants ============

const METHOD_COLOR = '#f59e0b';
const BG_COLOR = color.bg;
const CARD_COLOR = color.surface;
const BORDER_COLOR = color.border;
const TEXT_PRIMARY = color.text;
const TEXT_SECONDARY = color.textMuted;
const ARABIC_GOLD = color.sacred;

// ============ Component ============

export default function ChunkingScreen() {
  const { t } = useTranslation();
  const { lc } = useLocalizedContent();
  const { surahId } = useLocalSearchParams<{ surahId: string }>();

  const surah = getSurahById(surahId);
  const { ayahs, isLoading } = useQuranSurah(surahId);
  const { markAyahLearned, isAyahLearned } = useQuranStore();

  // Fetch language-specific translations (EN/FR based on user setting)
  const { translations: langTranslations } = useAyahTranslations(surah?.surahNumber ?? null);
  const language = useSettingsStore((s) => s.language);

  const isMountedRef = useRef(true);

  const [currentAyahIndex, setCurrentAyahIndex] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [audioState, setAudioState] = useState<AudioState>('idle');
  const audioStateRef = useRef<AudioState>('idle');

  // Current ayah data
  const currentAyah = ayahs[currentAyahIndex];

  // Get language-appropriate translation for current ayah
  // Falls back to static data translation, then to joining word translations
  const ayahTranslation = currentAyah
    ? langTranslations.get(currentAyah.ayahNumber)
      || lc(currentAyah.translation, currentAyah.translationFr)
      || currentAyah.words.map(w => w.translation).join(' ')
    : '';

  // Compute chunks and steps for current ayah
  const chunks = useMemo(() => {
    if (!currentAyah) return [];
    // Short ayahs (≤3 words): chunk word by word for proper learning flow
    const chunkSize = currentAyah.words.length <= 3 ? 1 : 3;
    return splitIntoChunks(currentAyah.words, chunkSize);
  }, [currentAyah]);

  const steps = useMemo(() => {
    return generateSteps(chunks);
  }, [chunks]);

  const currentStep = steps[currentStepIndex] || { type: 'full' as const };
  const isLastStep = currentStepIndex >= steps.length - 1;
  const isLastAyah = currentAyahIndex >= ayahs.length - 1;

  // Stop audio on unmount or ayah change
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      quranAudioService.stop();
    };
  }, []);

  useEffect(() => {
    quranAudioService.stop();
    setAudioState('idle');
    audioStateRef.current = 'idle';
  }, [currentAyahIndex]);

  // ============ Audio ============

  const playAyahAudio = () => {
    if (!surah || !currentAyah) return;

    if (audioStateRef.current === 'playing') {
      quranAudioService.pause();
      setAudioState('paused');
      audioStateRef.current = 'paused';
      return;
    }

    if (audioStateRef.current === 'paused') {
      quranAudioService.resume();
      setAudioState('playing');
      audioStateRef.current = 'playing';
      return;
    }

    quranAudioService.playAyah(surah.surahNumber, currentAyah.ayahNumber, {
      onStateChange: (state) => {
        if (isMountedRef.current) setAudioState(state);
        audioStateRef.current = state;
      },
      onComplete: () => {
        if (isMountedRef.current) setAudioState('idle');
        audioStateRef.current = 'idle';
      },
      onError: () => {
        if (isMountedRef.current) setAudioState('idle');
        audioStateRef.current = 'idle';
      },
    });
  };

  // ============ Handlers ============

  const handleNextStep = () => {
    if (isLastStep) {
      // Mark as learned and advance to next ayah
      if (currentAyah) {
        markAyahLearned(surahId, currentAyah.id);
      }
      if (!isLastAyah) {
        setCurrentAyahIndex((prev) => prev + 1);
        setCurrentStepIndex(0);
      }
    } else {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    } else if (currentAyahIndex > 0) {
      // Go to previous ayah's last step
      setCurrentAyahIndex((prev) => prev - 1);
      // Steps will be recomputed, set to last step after render
      setCurrentStepIndex(999); // Will be clamped by currentStep fallback
    }
  };

  const handlePrevAyah = () => {
    if (currentAyahIndex > 0) {
      setCurrentAyahIndex((prev) => prev - 1);
      setCurrentStepIndex(0);
    }
  };

  const handleNextAyah = () => {
    if (!isLastAyah) {
      setCurrentAyahIndex((prev) => prev + 1);
      setCurrentStepIndex(0);
    }
  };

  // Clamp step index when steps change (e.g., navigating to previous ayah)
  useEffect(() => {
    if (currentStepIndex >= steps.length && steps.length > 0) {
      setCurrentStepIndex(steps.length - 1);
    }
  }, [steps.length]);

  // ============ Step label ============

  const getStepLabel = (): string => {
    if (currentStep.type === 'learn') {
      return t('chunking.chunk', {
        current: currentStep.chunkIndex + 1,
        total: chunks.length,
      });
    }
    if (currentStep.type === 'combine') {
      return t('chunking.combining', {
        from: currentStep.fromChunk + 1,
        to: currentStep.toChunk + 1,
      });
    }
    return t('chunking.fullAyah');
  };

  // ============ Action button label ============

  const getActionLabel = (): string => {
    if (isLastStep) {
      return t('chunking.markLearned');
    }
    return t('chunking.iKnowThis');
  };

  const getActionIcon = (): string => {
    if (isLastStep) {
      return 'checkmark-circle';
    }
    return 'arrow-forward';
  };

  // ============ Render guards ============

  if (!surah) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>{t('common.notFound')}</Text>
      </SafeAreaView>
    );
  }

  if (isLoading || !currentAyah) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={METHOD_COLOR} />
          <Text style={styles.loadingText}>{t('common.loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const ayahAlreadyLearned = isAyahLearned(surahId, currentAyah.id);

  // Get audio icon based on state
  const audioIcon = audioState === 'playing' ? 'pause' : audioState === 'loading' ? 'hourglass' : 'volume-high';

  // ============ Render ============

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={styles.closeButton}
          onPress={() => {
            quranAudioService.stop();
            router.back();
          }}
          accessibilityRole="button"
          accessibilityLabel={t('common.back')}
        >
          <Ionicons name="close" size={24} color={TEXT_PRIMARY} />
        </Pressable>

        <View style={styles.headerCenter}>
          <Text style={styles.surahNameArabic}>{surah.nameArabic}</Text>
          <Text style={styles.headerMethodLabel}>{t('chunking.title')}</Text>
        </View>

        <View style={styles.ayahCounter}>
          <Text style={styles.ayahCounterText}>
            {currentAyahIndex + 1}/{ayahs.length}
          </Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Ayah info card */}
        <View style={styles.ayahInfoCard}>
          <View style={styles.ayahInfoRow}>
            <Text style={styles.ayahNumberBadge}>
              {t('chunking.ayahLabel', { number: currentAyah.ayahNumber })}
            </Text>
            <View style={styles.ayahInfoRight}>
              {ayahAlreadyLearned && (
                <View style={styles.learnedBadge}>
                  <Ionicons name="checkmark-circle" size={14} color={color.progress} />
                  <Text style={styles.learnedBadgeText}>{t('common.learned')}</Text>
                </View>
              )}
              {/* Audio button */}
              <Pressable
                style={styles.audioButton}
                onPress={playAyahAudio}
                accessibilityRole="button"
                accessibilityLabel={audioState === 'playing' ? t('common.pause') : t('common.play')}
              >
                <Ionicons
                  name={audioIcon as any}
                  size={18}
                  color={METHOD_COLOR}
                />
              </Pressable>
            </View>
          </View>
        </View>

        {/* Step label */}
        <View style={styles.stepLabelContainer}>
          <View style={styles.stepLabelBadge}>
            <Ionicons
              name={
                currentStep.type === 'learn'
                  ? 'layers-outline'
                  : currentStep.type === 'combine'
                  ? 'git-merge-outline'
                  : 'text-outline'
              }
              size={16}
              color={METHOD_COLOR}
            />
            <Text style={styles.stepLabelText}>
              {getStepLabel()}
            </Text>
          </View>
          {/* Step counter */}
          <Text style={styles.stepCounterText}>
            {t('chunking.step', { current: currentStepIndex + 1, total: steps.length })}
          </Text>
        </View>

        {/* Legend */}
        {currentStep.type !== 'full' && (
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: TEXT_PRIMARY }]} />
              <Text style={styles.legendText}>{t('chunking.currentChunk')}</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: color.border }]} />
              <Text style={styles.legendText}>{t('chunking.assembled')}</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: color.borderStrong }]} />
              <Text style={styles.legendText}>{t('chunking.remaining')}</Text>
            </View>
          </View>
        )}

        {/* Word display - uses row-reverse for correct Arabic RTL flow */}
        <View style={styles.wordsCard}>
          <View style={styles.wordsContainer}>
            {currentAyah.words.map((word, wordIndex) => {
              const visualState = getWordState(wordIndex, currentStep, chunks);

              return (
                <View key={word.id || wordIndex} style={styles.wordWrapper}>
                  <Text
                    style={[
                      styles.wordText,
                      visualState === 'current' && styles.wordCurrent,
                      visualState === 'assembled' && styles.wordAssembled,
                      visualState === 'unlearned' && styles.wordUnlearned,
                    ]}
                  >
                    {word.text}
                  </Text>
                  {visualState === 'current' && (
                    <View style={styles.wordUnderline} />
                  )}
                </View>
              );
            })}
          </View>

          {/* Transliteration */}
          <View style={styles.transliterationContainer}>
            <Text style={styles.transliterationText}>
              {currentAyah.transliteration}
            </Text>
          </View>

          {/* Translation (language-aware: EN/FR) */}
          <View style={styles.translationContainer}>
            <Text style={styles.translationText}>
              {ayahTranslation}
            </Text>
          </View>
        </View>

        {/* Chunk detail for learn steps */}
        {currentStep.type === 'learn' && (
          <View style={styles.chunkDetailCard}>
            <Text style={styles.chunkDetailTitle}>
              {t('chunking.learnChunk')}
            </Text>
            <View style={styles.chunkWordsRow}>
              {chunks[currentStep.chunkIndex]?.map((word, idx) => (
                <View key={word.id || idx} style={styles.chunkWordItem}>
                  <Text style={styles.chunkWordArabic}>{word.text}</Text>
                  <Text style={styles.chunkWordTranslit}>{word.transliteration}</Text>
                  {language === 'en' && (
                    <Text style={styles.chunkWordMeaning}>{word.translation}</Text>
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Chunk detail for combine steps */}
        {currentStep.type === 'combine' && (
          <View style={styles.chunkDetailCard}>
            <Text style={styles.chunkDetailTitle}>
              {t('chunking.combineChunks')}
            </Text>
            <View style={styles.chunkWordsRow}>
              {chunks.slice(currentStep.fromChunk, currentStep.toChunk + 1).flat().map((word, idx) => (
                <View key={word.id || idx} style={styles.chunkWordItem}>
                  <Text style={styles.chunkWordArabic}>{word.text}</Text>
                  <Text style={styles.chunkWordTranslit}>{word.transliteration}</Text>
                  {language === 'en' && (
                    <Text style={styles.chunkWordMeaning}>{word.translation}</Text>
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Full ayah detail */}
        {currentStep.type === 'full' && (
          <View style={styles.chunkDetailCard}>
            <Text style={styles.chunkDetailTitle}>
              {t('chunking.fullAyahInstruction')}
            </Text>
            <View style={styles.chunkWordsRow}>
              {currentAyah.words.map((word, idx) => (
                <View key={word.id || idx} style={styles.chunkWordItem}>
                  <Text style={styles.chunkWordArabic}>{word.text}</Text>
                  <Text style={styles.chunkWordTranslit}>{word.transliteration}</Text>
                  {language === 'en' && (
                    <Text style={styles.chunkWordMeaning}>{word.translation}</Text>
                  )}
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom controls */}
      <View style={styles.bottomControls}>
        {/* Step progress dots */}
        <View style={styles.stepDotsContainer}>
          {steps.map((_, idx) => (
            <View
              key={idx}
              style={[
                styles.stepDot,
                idx === currentStepIndex && styles.stepDotActive,
                idx < currentStepIndex && styles.stepDotCompleted,
              ]}
            />
          ))}
        </View>

        {/* Navigation and action */}
        <View style={styles.controlsRow}>
          {/* Prev step / ayah */}
          <Pressable
            style={[
              styles.navButton,
              currentAyahIndex === 0 && currentStepIndex === 0 && styles.navButtonDisabled,
            ]}
            onPress={handlePrevStep}
            disabled={currentAyahIndex === 0 && currentStepIndex === 0}
            accessibilityRole="button"
            accessibilityLabel={t('common.previous')}
          >
            <Ionicons
              name="chevron-back"
              size={20}
              color={currentAyahIndex === 0 && currentStepIndex === 0 ? color.borderStrong : TEXT_PRIMARY}
            />
          </Pressable>

          {/* Action button */}
          <Pressable
            style={[
              styles.actionButton,
              isLastStep && styles.actionButtonMarkLearned,
              isLastStep && isLastAyah && styles.actionButtonFinish,
            ]}
            onPress={handleNextStep}
            accessibilityRole="button"
            accessibilityLabel={getActionLabel()}
          >
            <Ionicons
              name={getActionIcon() as any}
              size={20}
              color={isLastStep ? '#000000' : TEXT_PRIMARY}
            />
            <Text
              style={[
                styles.actionButtonText,
                isLastStep && styles.actionButtonTextMark,
              ]}
            >
              {getActionLabel()}
            </Text>
          </Pressable>

          {/* Next ayah */}
          <Pressable
            style={[
              styles.navButton,
              isLastAyah && styles.navButtonDisabled,
            ]}
            onPress={handleNextAyah}
            disabled={isLastAyah}
            accessibilityRole="button"
            accessibilityLabel={t('common.next')}
          >
            <Ionicons
              name="chevron-forward"
              size={20}
              color={isLastAyah ? color.borderStrong : TEXT_PRIMARY}
            />
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

// ============ Styles ============

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG_COLOR,
  },
  errorText: {
    color: TEXT_SECONDARY,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    color: TEXT_SECONDARY,
    fontSize: 14,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: BORDER_COLOR,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: radius.xl,
    backgroundColor: CARD_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  surahNameArabic: {
    fontFamily: font.arabic,
    lineHeight: 37,
    color: ARABIC_GOLD,
    fontSize: 22,
    fontWeight: 'bold',
  },
  headerMethodLabel: {
    color: METHOD_COLOR,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  ayahCounter: {
    width: 40,
    height: 40,
    borderRadius: radius.xl,
    backgroundColor: CARD_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ayahCounterText: {
    color: TEXT_SECONDARY,
    fontSize: 12,
    fontWeight: '600',
  },

  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    gap: 16,
  },

  // Ayah info
  ayahInfoCard: {
    backgroundColor: CARD_COLOR,
    borderRadius: radius.md,
    padding: 12,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
  },
  ayahInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ayahInfoRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ayahNumberBadge: {
    color: METHOD_COLOR,
    fontSize: 16,
    fontWeight: '700',
  },
  learnedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.md,
  },
  learnedBadgeText: {
    color: color.progress,
    fontSize: 12,
    fontWeight: '600',
  },
  audioButton: {
    width: 36,
    height: 36,
    borderRadius: radius.lg,
    backgroundColor: `${METHOD_COLOR}15`,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: `${METHOD_COLOR}30`,
  },

  // Step label
  stepLabelContainer: {
    alignItems: 'center',
    gap: 6,
  },
  stepLabelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: `${METHOD_COLOR}15`,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: `${METHOD_COLOR}30`,
  },
  stepLabelText: {
    color: METHOD_COLOR,
    fontSize: 14,
    fontWeight: '600',
  },
  stepCounterText: {
    color: TEXT_SECONDARY,
    fontSize: 12,
  },

  // Legend
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    color: TEXT_SECONDARY,
    fontSize: 11,
  },

  // Words card - uses row-reverse for correct Arabic RTL wrapping
  wordsCard: {
    backgroundColor: CARD_COLOR,
    borderRadius: radius.lg,
    padding: 24,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
  },
  wordsContainer: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  wordWrapper: {
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  wordText: {
    fontSize: 28,
    writingDirection: 'rtl',
    textAlign: 'center',
  },
  wordCurrent: {
    color: TEXT_PRIMARY,
  },
  wordAssembled: {
    color: color.text,
  },
  wordUnlearned: {
    color: color.textFaint,
  },
  wordUnderline: {
    height: 2,
    backgroundColor: METHOD_COLOR,
    width: '100%',
    marginTop: 4,
    borderRadius: 1,
  },

  // Transliteration
  transliterationContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: BORDER_COLOR,
  },
  transliterationText: {
    color: TEXT_SECONDARY,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    fontStyle: 'italic',
  },

  // Translation
  translationContainer: {
    marginTop: 12,
  },
  translationText: {
    color: color.textMuted,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },

  // Chunk detail card
  chunkDetailCard: {
    backgroundColor: CARD_COLOR,
    borderRadius: radius.md,
    padding: 16,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
  },
  chunkDetailTitle: {
    color: METHOD_COLOR,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  chunkWordsRow: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  chunkWordItem: {
    alignItems: 'center',
    backgroundColor: `${METHOD_COLOR}10`,
    borderRadius: radius.md,
    padding: 12,
    minWidth: 80,
    borderWidth: 1,
    borderColor: `${METHOD_COLOR}25`,
  },
  chunkWordArabic: {
    fontFamily: font.arabic,
    lineHeight: 41,
    color: TEXT_PRIMARY,
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 4,
    writingDirection: 'rtl',
  },
  chunkWordTranslit: {
    color: TEXT_SECONDARY,
    fontSize: 12,
    fontStyle: 'italic',
    marginBottom: 2,
  },
  chunkWordMeaning: {
    color: color.textMuted,
    fontSize: 11,
    textAlign: 'center',
    maxWidth: 100,
  },

  // Bottom controls
  bottomControls: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: BORDER_COLOR,
    backgroundColor: BG_COLOR,
    gap: 12,
  },

  // Step dots
  stepDotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: color.surfaceRaised,
  },
  stepDotActive: {
    backgroundColor: METHOD_COLOR,
    width: 20,
  },
  stepDotCompleted: {
    backgroundColor: `${METHOD_COLOR}80`,
  },

  // Controls row
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  navButton: {
    width: 44,
    height: 44,
    borderRadius: radius.xl,
    backgroundColor: CARD_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: BORDER_COLOR,
  },
  navButtonDisabled: {
    opacity: 0.4,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: CARD_COLOR,
    paddingVertical: 14,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: METHOD_COLOR,
  },
  actionButtonMarkLearned: {
    backgroundColor: METHOD_COLOR,
    borderColor: METHOD_COLOR,
  },
  actionButtonFinish: {
    backgroundColor: color.progress,
    borderColor: color.progress,
  },
  actionButtonText: {
    color: TEXT_PRIMARY,
    fontSize: 15,
    fontWeight: '600',
  },
  actionButtonTextMark: {
    color: '#000000',
  },
});

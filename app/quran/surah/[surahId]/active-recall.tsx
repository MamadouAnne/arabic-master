import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { getSurahById } from '../../../../src/data/arabic/quran';
import { useQuranSurah } from '../../../../src/hooks/useQuranData';
import { useQuranStore } from '../../../../src/stores/quranStore';
import { useAyahTranslations } from '../../../../src/hooks/useAyahTranslations';
import { useLocalizedContent } from '../../../../src/hooks/useLocalizedContent';
import { useSettingsStore } from '../../../../src/stores/settingsStore';
import { TajweedText } from '../../../../src/components/quran/TajweedText';
import { ReviewRating } from '../../../../src/types/quran';
import { quranAudioService, AudioState } from '../../../../src/services/quranAudioService';
import { getHintText } from '../../../../src/utils/arabicTextUtils';
import { font, color, radius } from '../../../../src/theme/tokens';
import { withAlpha } from '../../../../src/components/ui/Primitives';

const METHOD_COLOR = color.accent;

type RecallMode = 'first_letter' | 'fill_blank' | 'continue_from' | 'full_recall';
type FillBlankSubMode = 'arabic_fill' | 'meaning_match';

const RATING_CONFIG: { rating: ReviewRating; labelKey: string; color: string }[] = [
  { rating: 0, labelKey: 'spacedRepetition.rating0', color: color.danger },
  { rating: 1, labelKey: 'spacedRepetition.rating1', color: color.danger },
  { rating: 2, labelKey: 'spacedRepetition.rating2', color: color.danger },
  { rating: 3, labelKey: 'spacedRepetition.rating3', color: METHOD_COLOR },
  { rating: 4, labelKey: 'spacedRepetition.rating4', color: color.accent },
  { rating: 5, labelKey: 'spacedRepetition.rating5', color: color.accent },
];

const MODE_TABS: { key: RecallMode; labelKey: string }[] = [
  { key: 'first_letter', labelKey: 'activeRecall.modeFirstLetter' },
  { key: 'fill_blank', labelKey: 'activeRecall.modeFillBlank' },
  { key: 'continue_from', labelKey: 'activeRecall.modeContinueFrom' },
  { key: 'full_recall', labelKey: 'activeRecall.modeFullRecall' },
];

const SPLIT_OPTIONS = [0.3, 0.5, 0.7];

export default function ActiveRecallScreen() {
  const { t } = useTranslation();
  const { lc } = useLocalizedContent();
  const { surahId } = useLocalSearchParams<{ surahId: string }>();

  const surah = getSurahById(surahId);
  const { ayahs, isLoading } = useQuranSurah(surahId);
  const {
    progress,
    updateReviewItem,
    scheduleReview,
    markAyahLearned,
  } = useQuranStore();
  const { translations: langTranslations } = useAyahTranslations(surah?.surahNumber ?? null);
  const language = useSettingsStore((s) => s.language);

  const [currentAyahIndex, setCurrentAyahIndex] = useState(0);
  const [mode, setMode] = useState<RecallMode>('first_letter');
  const [isRevealed, setIsRevealed] = useState(false);
  const [selectedRating, setSelectedRating] = useState<ReviewRating | null>(null);

  // Fill-in-blank specific state
  const [fillBlankSubMode, setFillBlankSubMode] = useState<FillBlankSubMode>('arabic_fill');
  const [blankIndices, setBlankIndices] = useState<number[]>([]);
  const [filledWords, setFilledWords] = useState<Record<number, string>>({});
  const [selectedBlankIndex, setSelectedBlankIndex] = useState<number | null>(null);
  const [isChecked, setIsChecked] = useState(false);

  // Audio state
  const [audioState, setAudioState] = useState<AudioState>('idle');
  const audioStateRef = useRef<AudioState>('idle');
  const isMountedRef = useRef(true);

  // Timeout ref for handleRate cleanup
  const rateTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Streak state
  const [sessionStreak, setSessionStreak] = useState(0);

  const currentAyah = ayahs[currentAyahIndex] ?? null;
  const ayahTranslation = currentAyah
    ? langTranslations.get(currentAyah.ayahNumber)
      || lc(currentAyah.translation, currentAyah.translationFr)
      || currentAyah.words.map(w => w.translation).join(' ')
    : '';
  const showTajweed = progress.settings.showTajweedColors;

  // Stop audio and clear rate timeout on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      quranAudioService.stop();
      if (rateTimeoutRef.current) clearTimeout(rateTimeoutRef.current);
    };
  }, []);

  // Stop audio on ayah change
  useEffect(() => {
    quranAudioService.stop();
    setAudioState('idle');
    audioStateRef.current = 'idle';
  }, [currentAyahIndex]);

  // Audio handler
  const playAyahAudio = useCallback(() => {
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
  }, [surah, currentAyah]);

  // Generate blank indices for fill-blank mode
  const generatedBlanks = useMemo(() => {
    if (!currentAyah || mode !== 'fill_blank') return [];
    const words = currentAyah.words;
    const minBlanks = Math.min(words.length, Math.max(2, Math.ceil(words.length * 0.4)));
    const indices: number[] = [];
    for (let i = 0; i < words.length; i++) {
      if (Math.random() < 0.50) {
        indices.push(i);
      }
    }
    // Ensure minimum blanks
    while (indices.length < minBlanks) {
      const rand = Math.floor(Math.random() * words.length);
      if (!indices.includes(rand)) indices.push(rand);
    }
    return indices;
  }, [currentAyahIndex, mode, currentAyah?.id, fillBlankSubMode]);

  // Sync blankIndices state when generated blanks change
  useEffect(() => {
    setBlankIndices(generatedBlanks);
    setFilledWords({});
    setSelectedBlankIndex(null);
    setIsChecked(false);
  }, [generatedBlanks]);

  // Shuffled word bank for fill-blank with distractors from nearby ayahs
  const wordBank = useMemo(() => {
    if (!currentAyah || mode !== 'fill_blank') return [];

    const isMeaning = fillBlankSubMode === 'meaning_match';
    const blankedWords = blankIndices.map((i) => ({
      index: i,
      text: isMeaning
        ? (currentAyah.words[i]?.translation ?? '')
        : (currentAyah.words[i]?.text ?? ''),
      isDistractor: false,
    }));

    // Add distractors from neighboring ayahs
    const correctTexts = new Set(blankedWords.map((w) => w.text));
    const distractors: { index: number; text: string; isDistractor: boolean }[] = [];
    const numDistractors = Math.min(3, Math.max(1, Math.ceil(blankedWords.length * 0.5)));

    for (let offset = 1; offset <= 3 && distractors.length < numDistractors; offset++) {
      for (const delta of [offset, -offset]) {
        const neighbor = ayahs[currentAyahIndex + delta];
        if (!neighbor) continue;
        for (const word of neighbor.words) {
          if (distractors.length >= numDistractors) break;
          const text = isMeaning ? (word.translation ?? '') : (word.text ?? '');
          if (text && !correctTexts.has(text) && !distractors.some((d) => d.text === text)) {
            distractors.push({ index: -1, text, isDistractor: true });
          }
        }
      }
    }

    // Fisher-Yates shuffle
    const shuffled = [...blankedWords, ...distractors];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, [blankIndices, currentAyah?.id, mode, fillBlankSubMode, ayahs, currentAyahIndex]);

  // Words that are still available in the bank (not yet placed)
  const availableBank = useMemo(() => {
    const filledTexts = Object.values(filledWords);
    const remaining = [...wordBank];
    for (const text of filledTexts) {
      const idx = remaining.findIndex((w) => w.text === text);
      if (idx !== -1) remaining.splice(idx, 1);
    }
    return remaining;
  }, [wordBank, filledWords]);

  // Fill-blank results with per-word detail
  const fillBlankResults = useMemo(() => {
    if (!currentAyah || !isChecked) return { correct: 0, incorrect: 0, details: [] as { index: number; filled: string; expected: string; isCorrect: boolean }[] };
    let correct = 0;
    let incorrect = 0;
    const details: { index: number; filled: string; expected: string; isCorrect: boolean }[] = [];
    const isMeaning = fillBlankSubMode === 'meaning_match';

    for (const idx of blankIndices) {
      const filled = filledWords[idx] ?? '';
      const expected = isMeaning
        ? (currentAyah.words[idx]?.translation ?? '')
        : (currentAyah.words[idx]?.text ?? '');
      const isCorrect = filled === expected;
      if (isCorrect) {
        correct++;
      } else {
        incorrect++;
      }
      details.push({ index: idx, filled, expected, isCorrect });
    }
    return { correct, incorrect, details };
  }, [isChecked, filledWords, blankIndices, currentAyah?.id, fillBlankSubMode]);

  // Continue-from: variable split point
  const continueFromSplit = useMemo(() => {
    if (!currentAyah) return 0;
    const randomSplit = SPLIT_OPTIONS[Math.floor(Math.random() * SPLIT_OPTIONS.length)];
    return Math.max(1, Math.ceil(currentAyah.words.length * randomSplit));
  }, [currentAyah?.id]);

  const resetState = useCallback(() => {
    setIsRevealed(false);
    setSelectedRating(null);
    setFilledWords({});
    setSelectedBlankIndex(null);
    setIsChecked(false);
  }, []);

  const handleModeChange = useCallback((newMode: RecallMode) => {
    setMode(newMode);
    resetState();
  }, [resetState]);

  const handleRate = useCallback((rating: ReviewRating) => {
    if (!currentAyah) return;
    setSelectedRating(rating);

    // Update streak
    if (rating >= 3) {
      setSessionStreak((prev) => prev + 1);
    } else {
      setSessionStreak(0);
    }

    scheduleReview(currentAyah.id, surahId);
    updateReviewItem(currentAyah.id, rating);

    if (rating >= 4) {
      markAyahLearned(surahId, currentAyah.id);
    }

    // Advance to next ayah after a short delay
    if (rateTimeoutRef.current) clearTimeout(rateTimeoutRef.current);
    rateTimeoutRef.current = setTimeout(() => {
      setCurrentAyahIndex((prev) => {
        if (prev < ayahs.length - 1) return prev + 1;
        return prev;
      });
      resetState();
    }, 800);
  }, [currentAyah, currentAyahIndex, ayahs.length, surahId, resetState]);

  const handlePrevAyah = useCallback(() => {
    if (currentAyahIndex > 0) {
      setCurrentAyahIndex((prev) => prev - 1);
      resetState();
    }
  }, [currentAyahIndex, resetState]);

  const handleNextAyah = useCallback(() => {
    if (currentAyahIndex < ayahs.length - 1) {
      setCurrentAyahIndex((prev) => prev + 1);
      resetState();
    }
  }, [currentAyahIndex, ayahs.length, resetState]);

  const handleBlankTap = useCallback((index: number) => {
    if (isChecked) return;
    setSelectedBlankIndex(index === selectedBlankIndex ? null : index);
  }, [isChecked, selectedBlankIndex]);

  const handleWordBankTap = useCallback((wordText: string) => {
    if (isChecked || selectedBlankIndex === null) return;
    setFilledWords((prev) => ({ ...prev, [selectedBlankIndex]: wordText }));
    setSelectedBlankIndex(null);
  }, [isChecked, selectedBlankIndex]);

  const handleCheck = useCallback(() => {
    setIsChecked(true);
    setIsRevealed(true);
  }, []);

  // --- Audio icon ---
  const audioIcon = audioState === 'playing' ? 'pause' : audioState === 'loading' ? 'hourglass' : 'volume-high';

  // --- Audio button component ---
  const renderAudioButton = () => (
    <Pressable
      style={styles.audioButton}
      onPress={playAyahAudio}
    >
      <Ionicons name={audioIcon as any} size={18} color={METHOD_COLOR} />
    </Pressable>
  );

  // --- Word-by-word breakdown after reveal ---
  const renderWordByWordBreakdown = () => {
    if (!currentAyah || !isRevealed || selectedRating !== null) return null;
    return (
      <View style={styles.breakdownCard}>
        <Text style={styles.breakdownTitle}>{t('activeRecall.wordByWord')}</Text>
        <View style={styles.breakdownWordsRow}>
          {currentAyah.words.map((word, idx) => (
            <View key={word.id || idx} style={styles.breakdownWordItem}>
              <Text style={styles.breakdownWordArabic}>{word.text}</Text>
              <Text style={styles.breakdownWordTranslit}>{word.transliteration}</Text>
              {language === 'en' && (
                <Text style={styles.breakdownWordMeaning}>{word.translation}</Text>
              )}
            </View>
          ))}
        </View>
      </View>
    );
  };

  // --- Guards ---

  if (!surah) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>{t('common.notFound')}</Text>
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={METHOD_COLOR} />
        </View>
      </SafeAreaView>
    );
  }

  if (!currentAyah) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>{t('common.notFound')}</Text>
      </SafeAreaView>
    );
  }

  // --- First Letter Mode ---
  const renderFirstLetterMode = () => {
    const words = currentAyah.words;
    return (
      <View style={styles.card}>
        <View style={styles.ayahBadgeRow}>
          <View style={styles.ayahBadge}>
            <Text style={styles.ayahBadgeText}>
              {t('activeRecall.ayahNumber', { number: currentAyah.ayahNumber })}
            </Text>
          </View>
          {renderAudioButton()}
        </View>

        {/* Translation hint before reveal */}
        {!isRevealed && (
          <Text style={styles.translationHint}>{ayahTranslation}</Text>
        )}

        {!isRevealed ? (
          <>
            <View style={styles.wordRow}>
              {words.map((word, i) => (
                <Text key={word.id || i} style={styles.wordArabicHint}>
                  {getHintText(word.text)}
                </Text>
              ))}
            </View>
            <Pressable style={styles.actionButton} onPress={() => setIsRevealed(true)}>
              <Ionicons name="eye-outline" size={20} color={METHOD_COLOR} />
              <Text style={styles.actionButtonText}>{t('activeRecall.showAnswer')}</Text>
            </Pressable>
          </>
        ) : (
          <View style={styles.revealedContent}>
            <View style={styles.arabicContainer}>
              <TajweedText
                text={currentAyah.textUthmani}
                tajweedRules={currentAyah.tajweedRules}
                showTajweed={showTajweed}
                fontSize={34}
              />
            </View>
            <Text style={styles.translationText}>{ayahTranslation}</Text>
          </View>
        )}
      </View>
    );
  };

  // --- Fill-in-Blank Mode ---
  const renderFillBlankMode = () => {
    const words = currentAyah.words;
    const isMeaning = fillBlankSubMode === 'meaning_match';

    return (
      <View style={styles.card}>
        <View style={styles.ayahBadgeRow}>
          <View style={styles.ayahBadge}>
            <Text style={styles.ayahBadgeText}>
              {t('activeRecall.ayahNumber', { number: currentAyah.ayahNumber })}
            </Text>
          </View>
          {renderAudioButton()}
        </View>

        {/* Sub-mode toggle */}
        <View style={styles.subModeToggle}>
          <Pressable
            style={[styles.subModeTab, fillBlankSubMode === 'arabic_fill' && styles.subModeTabActive]}
            onPress={() => { setFillBlankSubMode('arabic_fill'); resetState(); }}
          >
            <Text style={[styles.subModeTabText, fillBlankSubMode === 'arabic_fill' && styles.subModeTabTextActive]}>
              {t('activeRecall.arabicFill')}
            </Text>
          </Pressable>
          <Pressable
            style={[styles.subModeTab, fillBlankSubMode === 'meaning_match' && styles.subModeTabActive]}
            onPress={() => { setFillBlankSubMode('meaning_match'); resetState(); }}
          >
            <Text style={[styles.subModeTabText, fillBlankSubMode === 'meaning_match' && styles.subModeTabTextActive]}>
              {t('activeRecall.meaningMatch')}
            </Text>
          </Pressable>
        </View>

        {isMeaning ? (
          <>
            {/* Meaning Match: Arabic words all visible, translation blanks below */}
            <View style={styles.wordRow}>
              {words.map((word, i) => (
                <Text key={word.id || i} style={styles.wordArabic}>
                  {word.text}
                </Text>
              ))}
            </View>

            {/* Full ayah translation for context (especially useful for FR users) */}
            <Text style={styles.meaningContextTranslation}>{ayahTranslation}</Text>

            {/* Translation slots */}
            <View style={styles.meaningRow}>
              {words.map((word, i) => {
                const isBlanked = blankIndices.includes(i);
                if (!isBlanked) {
                  return (
                    <View key={word.id || i} style={styles.meaningSlotFilled}>
                      <Text style={styles.meaningSlotText}>{word.translation}</Text>
                    </View>
                  );
                }
                const filled = filledWords[i];
                const isSelected = selectedBlankIndex === i;
                const blankExtraStyle = isChecked && filled
                  ? (filled === word.translation ? styles.blankBoxCorrect : styles.blankBoxIncorrect)
                  : isSelected
                    ? styles.blankBoxSelected
                    : null;

                return (
                  <Pressable key={word.id || i} onPress={() => handleBlankTap(i)}>
                    <View style={[styles.meaningBlankBox, blankExtraStyle]}>
                      <Text style={styles.meaningBlankText}>
                        {filled || '___'}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </>
        ) : (
          <>
            {/* Arabic Fill: translation hint + Arabic words with blanks */}
            <Text style={styles.meaningContextTranslation}>{ayahTranslation}</Text>
            <View style={styles.wordRow}>
              {words.map((word, i) => {
                const isBlanked = blankIndices.includes(i);
                if (!isBlanked) {
                  return (
                    <Text key={word.id || i} style={styles.wordArabic}>
                      {word.text}
                    </Text>
                  );
                }
                const filled = filledWords[i];
                const isSelected = selectedBlankIndex === i;
                const blankExtraStyle = isChecked && filled
                  ? (filled === word.text ? styles.blankBoxCorrect : styles.blankBoxIncorrect)
                  : isSelected
                    ? styles.blankBoxSelected
                    : null;

                return (
                  <Pressable key={word.id || i} onPress={() => handleBlankTap(i)}>
                    <View style={[styles.blankBox, blankExtraStyle]}>
                      <Text style={styles.blankText}>
                        {filled || '____'}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </>
        )}

        {/* Instruction */}
        {!isChecked && (
          <Text style={styles.instructionText}>{t('activeRecall.tapBlanksToFill')}</Text>
        )}

        {/* Detailed results after check */}
        {isChecked && (
          <View style={styles.detailedResults}>
            {fillBlankResults.details.map((detail) => (
              <View key={detail.index} style={styles.detailRow}>
                {detail.isCorrect ? (
                  <Text style={styles.detailCorrect}>{detail.filled}</Text>
                ) : (
                  <View style={styles.detailWrongRow}>
                    <Text style={styles.detailWrong}>{detail.filled || '—'}</Text>
                    <Text style={styles.detailExpected}>
                      {t('activeRecall.expectedWord', { word: detail.expected })}
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Word Bank */}
        {!isChecked && availableBank.length > 0 && (
          <View style={styles.wordBankSection}>
            <Text style={styles.wordBankLabel}>{t('activeRecall.wordBank')}</Text>
            <View style={isMeaning ? styles.wordBankRowLtr : styles.wordBankRow}>
              {availableBank.map((item, i) => (
                <Pressable
                  key={`${item.index}-${i}`}
                  style={isMeaning ? styles.wordBankPillMeaning : styles.wordBankPill}
                  onPress={() => handleWordBankTap(item.text)}
                >
                  <Text style={isMeaning ? styles.wordBankPillTextMeaning : styles.wordBankPillText}>
                    {item.text}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* Check button */}
        {!isChecked && Object.keys(filledWords).length > 0 && (
          <Pressable style={styles.actionButton} onPress={handleCheck}>
            <Ionicons name="checkmark-circle-outline" size={20} color={METHOD_COLOR} />
            <Text style={styles.actionButtonText}>{t('activeRecall.check')}</Text>
          </Pressable>
        )}
      </View>
    );
  };

  // --- Continue From Mode ---
  const renderContinueFromMode = () => {
    const words = currentAyah.words;
    const splitAt = continueFromSplit;
    return (
      <View style={styles.card}>
        <View style={styles.ayahBadgeRow}>
          <View style={styles.ayahBadge}>
            <Text style={styles.ayahBadgeText}>
              {t('activeRecall.ayahNumber', { number: currentAyah.ayahNumber })}
            </Text>
          </View>
          {renderAudioButton()}
        </View>

        <View style={styles.wordRow}>
          {words.slice(0, splitAt).map((word, i) => (
            <Text key={word.id || i} style={styles.wordArabic}>
              {word.text}
            </Text>
          ))}
          {!isRevealed && (
            <Text style={styles.ellipsis}>...</Text>
          )}
          {isRevealed && words.slice(splitAt).map((word, i) => (
            <Text key={word.id || (splitAt + i)} style={styles.wordArabicRevealed}>
              {word.text}
            </Text>
          ))}
        </View>

        {!isRevealed ? (
          <>
            <Text style={styles.instructionText}>{t('activeRecall.recallTheRest')}</Text>
            <Pressable style={styles.actionButton} onPress={() => setIsRevealed(true)}>
              <Ionicons name="eye-outline" size={20} color={METHOD_COLOR} />
              <Text style={styles.actionButtonText}>{t('activeRecall.showRest')}</Text>
            </Pressable>
          </>
        ) : (
          <Text style={styles.translationText}>{ayahTranslation}</Text>
        )}
      </View>
    );
  };

  // --- Full Recall Mode ---
  const renderFullRecallMode = () => {
    return (
      <View style={styles.card}>
        {!isRevealed ? (
          <>
            <View style={styles.ayahBadgeRow}>
              <View style={styles.fullRecallBadge}>
                <Text style={styles.fullRecallNumber}>{currentAyah.ayahNumber}</Text>
              </View>
              {renderAudioButton()}
            </View>
            <Text style={styles.fullRecallLabel}>
              {t('activeRecall.ayahNumber', { number: currentAyah.ayahNumber })}
            </Text>

            {/* Translation hint */}
            <Text style={styles.translationHint}>{ayahTranslation}</Text>

            <Text style={styles.instructionText}>{t('activeRecall.reciteFromMemory')}</Text>
            <Pressable style={styles.actionButton} onPress={() => setIsRevealed(true)}>
              <Ionicons name="eye-outline" size={20} color={METHOD_COLOR} />
              <Text style={styles.actionButtonText}>{t('activeRecall.showAnswer')}</Text>
            </Pressable>
          </>
        ) : (
          <View style={styles.revealedContent}>
            <View style={styles.arabicContainer}>
              <TajweedText
                text={currentAyah.textUthmani}
                tajweedRules={currentAyah.tajweedRules}
                showTajweed={showTajweed}
                fontSize={34}
              />
            </View>
            <Text style={styles.translationText}>{ayahTranslation}</Text>
          </View>
        )}
      </View>
    );
  };

  const renderCurrentMode = () => {
    switch (mode) {
      case 'first_letter':
        return renderFirstLetterMode();
      case 'fill_blank':
        return renderFillBlankMode();
      case 'continue_from':
        return renderContinueFromMode();
      case 'full_recall':
        return renderFullRecallMode();
    }
  };

  // --- Rating Section ---
  const renderRatingSection = () => {
    if (!isRevealed || selectedRating !== null) return null;
    return (
      <View style={styles.ratingSection}>
        <Text style={styles.ratingPrompt}>{t('activeRecall.rateRecall')}</Text>
        <View style={styles.ratingGrid}>
          {RATING_CONFIG.map(({ rating, labelKey, color }) => (
            <Pressable
              key={rating}
              style={[
                styles.ratingButton,
                { backgroundColor: `${color}20`, borderColor: `${color}40` },
              ]}
              onPress={() => handleRate(rating)}
            >
              <Text style={[styles.ratingNumber, { color }]}>{rating}</Text>
              <Text style={[styles.ratingLabel, { color }]}>{t(labelKey)}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    );
  };

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
        >
          <Ionicons name="close" size={24} color={color.text} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.surahNameArabic}>{surah.nameArabic}</Text>
          <Text style={styles.methodTitle}>{t('activeRecall.title')}</Text>
        </View>
        <View style={styles.headerRight}>
          {/* Streak badge */}
          {sessionStreak >= 2 && (
            <View style={styles.streakBadge}>
              <Text style={styles.streakEmoji}>{'🔥'}</Text>
              <Text style={styles.streakText}>{sessionStreak}</Text>
            </View>
          )}
          <Text style={styles.ayahCounterText}>
            {currentAyahIndex + 1}/{ayahs.length}
          </Text>
        </View>
      </View>

      {/* Mode Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.modeTabsContent}
        style={styles.modeTabsScroll}
      >
        {MODE_TABS.map((tab) => {
          const isActive = mode === tab.key;
          return (
            <Pressable
              key={tab.key}
              style={[styles.modeTab, isActive && styles.modeTabActive]}
              onPress={() => handleModeChange(tab.key)}
            >
              <Text style={[styles.modeTabText, isActive && styles.modeTabTextActive]}>
                {t(tab.labelKey)}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Main Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderCurrentMode()}
        {renderWordByWordBreakdown()}
        {renderRatingSection()}
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <Pressable
          style={[styles.navButton, currentAyahIndex === 0 && styles.navButtonDisabled]}
          onPress={handlePrevAyah}
          disabled={currentAyahIndex === 0}
        >
          <Ionicons
            name="chevron-back"
            size={24}
            color={currentAyahIndex === 0 ? color.borderStrong : color.accent}
          />
        </Pressable>
        <Text style={styles.navCounter}>
          {t('activeRecall.ayahNumber', { number: currentAyah.ayahNumber })}
        </Text>
        <Pressable
          style={[
            styles.navButton,
            currentAyahIndex >= ayahs.length - 1 && styles.navButtonDisabled,
          ]}
          onPress={handleNextAyah}
          disabled={currentAyahIndex >= ayahs.length - 1}
        >
          <Ionicons
            name="chevron-forward"
            size={24}
            color={currentAyahIndex >= ayahs.length - 1 ? color.borderStrong : color.accent}
          />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.bg,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: color.textMuted,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 100,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: color.border,
  },
  closeButton: {
    padding: 8,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  surahNameArabic: {
    fontFamily: font.arabic,
    lineHeight: 40,
    color: color.sacred,
    fontSize: 24,
    fontWeight: 'bold',
  },
  methodTitle: {
    color: METHOD_COLOR,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ayahCounterText: {
    color: color.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },

  // Streak badge
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: withAlpha(color.warning, 0.13),
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: withAlpha(color.warning, 0.25),
  },
  streakEmoji: {
    fontSize: 14,
  },
  streakText: {
    color: color.warning,
    fontSize: 13,
    fontWeight: '700',
  },

  // Audio button
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

  // Mode Tabs
  modeTabsScroll: {
    maxHeight: 52,
    borderBottomWidth: 1,
    borderBottomColor: color.border,
  },
  modeTabsContent: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  modeTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radius.xl,
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.border,
  },
  modeTabActive: {
    backgroundColor: `${METHOD_COLOR}20`,
    borderColor: METHOD_COLOR,
  },
  modeTabText: {
    color: color.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  modeTabTextActive: {
    color: METHOD_COLOR,
  },

  // Sub-mode toggle (for fill-blank)
  subModeToggle: {
    flexDirection: 'row',
    backgroundColor: color.bg,
    borderRadius: radius.xl,
    padding: 3,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: color.border,
  },
  subModeTab: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radius.lg,
    alignItems: 'center',
  },
  subModeTabActive: {
    backgroundColor: `${METHOD_COLOR}25`,
  },
  subModeTabText: {
    color: color.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  subModeTabTextActive: {
    color: METHOD_COLOR,
  },

  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    gap: 16,
  },

  // Card
  card: {
    backgroundColor: color.surface,
    borderRadius: radius.xl,
    padding: 24,
    borderWidth: 1,
    borderColor: color.border,
    alignItems: 'center',
    minHeight: 200,
  },
  ayahBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 16,
    width: '100%',
  },
  ayahBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: radius.md,
    backgroundColor: `${METHOD_COLOR}15`,
  },
  ayahBadgeText: {
    color: METHOD_COLOR,
    fontSize: 13,
    fontWeight: '600',
  },

  // Translation hint (shown before reveal)
  translationHint: {
    color: color.textMuted,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
    fontStyle: 'italic',
    paddingHorizontal: 8,
  },

  // Word Row (RTL flex-wrap)
  wordRow: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    marginBottom: 16,
  },
  wordArabic: {
    fontFamily: font.arabic,
    color: color.sacred,
    fontSize: 36,
    lineHeight: 62,
  },
  wordArabicHint: {
    fontFamily: font.arabic,
    color: color.sacred,
    fontSize: 36,
    lineHeight: 62,
    opacity: 0.8,
  },
  wordArabicRevealed: {
    fontFamily: font.arabic,
    color: METHOD_COLOR,
    fontSize: 36,
    lineHeight: 62,
  },
  ellipsis: {
    color: color.textMuted,
    fontSize: 28,
    lineHeight: 48,
  },

  // Blank boxes (fill-blank mode)
  blankBox: {
    minWidth: 60,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: color.border,
    backgroundColor: color.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  blankBoxSelected: {
    borderColor: METHOD_COLOR,
    backgroundColor: `${METHOD_COLOR}10`,
    borderStyle: 'dashed' as const,
  },
  blankBoxCorrect: {
    borderColor: color.progress,
    backgroundColor: withAlpha(color.progress, 0.08),
    borderStyle: 'solid' as const,
  },
  blankBoxIncorrect: {
    borderColor: color.danger,
    backgroundColor: withAlpha(color.danger, 0.1),
    borderStyle: 'solid' as const,
  },
  blankText: {
    color: color.textMuted,
    fontSize: 22,
    lineHeight: 36,
    textAlign: 'center',
  },

  // Meaning match slots
  meaningRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
    width: '100%',
    marginBottom: 16,
  },
  meaningSlotFilled: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.sm,
    backgroundColor: color.bg,
    borderWidth: 1,
    borderColor: color.border,
  },
  meaningSlotText: {
    color: color.textMuted,
    fontSize: 12,
    textAlign: 'center',
  },
  meaningBlankBox: {
    minWidth: 50,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: color.border,
    backgroundColor: color.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  meaningBlankText: {
    color: color.textMuted,
    fontSize: 12,
    textAlign: 'center',
  },
  meaningContextTranslation: {
    color: color.textMuted,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 12,
    fontStyle: 'italic',
  },

  // Instruction text
  instructionText: {
    color: color.textMuted,
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 16,
    fontStyle: 'italic',
  },

  // Action button
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: `${METHOD_COLOR}15`,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: `${METHOD_COLOR}30`,
    marginTop: 8,
  },
  actionButtonText: {
    color: METHOD_COLOR,
    fontSize: 15,
    fontWeight: '600',
  },

  // Revealed content
  revealedContent: {
    width: '100%',
    alignItems: 'center',
  },
  arabicContainer: {
    width: '100%',
    marginBottom: 16,
  },
  translationText: {
    color: color.textMuted,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: color.border,
    width: '100%',
    marginTop: 8,
  },

  // Detailed fill-blank results
  detailedResults: {
    width: '100%',
    gap: 6,
    marginBottom: 12,
  },
  detailRow: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  detailCorrect: {
    color: color.progress,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  detailWrongRow: {
    alignItems: 'center',
    gap: 2,
  },
  detailWrong: {
    color: color.danger,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    textDecorationLine: 'line-through',
  },
  detailExpected: {
    color: color.textMuted,
    fontSize: 12,
    textAlign: 'center',
  },

  // Word Bank
  wordBankSection: {
    width: '100%',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: color.border,
  },
  wordBankLabel: {
    color: color.textMuted,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
    textAlign: 'center',
  },
  wordBankRow: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  wordBankRowLtr: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  wordBankPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.md,
    backgroundColor: `${METHOD_COLOR}15`,
    borderWidth: 1,
    borderColor: `${METHOD_COLOR}30`,
  },
  wordBankPillText: {
    color: METHOD_COLOR,
    fontSize: 20,
    fontWeight: '500',
  },
  wordBankPillMeaning: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.sm,
    backgroundColor: `${METHOD_COLOR}15`,
    borderWidth: 1,
    borderColor: `${METHOD_COLOR}30`,
  },
  wordBankPillTextMeaning: {
    color: METHOD_COLOR,
    fontSize: 13,
    fontWeight: '500',
  },

  // Word-by-word breakdown card
  breakdownCard: {
    backgroundColor: color.surface,
    borderRadius: radius.md,
    padding: 16,
    borderWidth: 1,
    borderColor: color.border,
  },
  breakdownTitle: {
    color: METHOD_COLOR,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  breakdownWordsRow: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  breakdownWordItem: {
    alignItems: 'center',
    backgroundColor: `${METHOD_COLOR}10`,
    borderRadius: radius.md,
    padding: 10,
    minWidth: 70,
    borderWidth: 1,
    borderColor: `${METHOD_COLOR}25`,
  },
  breakdownWordArabic: {
    fontFamily: font.arabic,
    lineHeight: 48,
    color: color.text,
    fontSize: 28,
    fontWeight: '600',
    marginBottom: 4,
    writingDirection: 'rtl',
  },
  breakdownWordTranslit: {
    color: color.textMuted,
    fontSize: 11,
    fontStyle: 'italic',
    marginBottom: 2,
  },
  breakdownWordMeaning: {
    color: color.textMuted,
    fontSize: 10,
    textAlign: 'center',
    maxWidth: 90,
  },

  // Full Recall Mode
  fullRecallBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: `${METHOD_COLOR}15`,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: `${METHOD_COLOR}30`,
  },
  fullRecallNumber: {
    color: METHOD_COLOR,
    fontSize: 28,
    fontWeight: 'bold',
  },
  fullRecallLabel: {
    color: color.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },

  // Rating section
  ratingSection: {
    marginTop: 8,
  },
  ratingPrompt: {
    color: color.text,
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 14,
  },
  ratingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
  },
  ratingButton: {
    width: '30%',
    paddingVertical: 14,
    borderRadius: radius.md,
    alignItems: 'center',
    borderWidth: 1,
    gap: 4,
  },
  ratingNumber: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  ratingLabel: {
    fontSize: 11,
    fontWeight: '600',
  },

  // Bottom Navigation
  bottomNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: color.border,
  },
  navButton: {
    width: 44,
    height: 44,
    borderRadius: radius.xl,
    backgroundColor: color.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: color.border,
  },
  navButtonDisabled: {
    opacity: 0.4,
  },
  navCounter: {
    color: color.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
});

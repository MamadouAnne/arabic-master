import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocalizedContent } from '../../src/hooks/useLocalizedContent';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { vocabularyWords } from '../../src/data/arabic/vocabulary';
import { useProgressStore } from '../../src/stores/progressStore';
import { useArabicSpeech } from '../../src/hooks/useArabicSpeech';
import { VocabularyWord } from '../../src/types/arabic';
import ArabicWritingInput from '../../src/components/arabic/ArabicWritingInput';
import { font, color, radius } from '../../src/theme/tokens';
import { withAlpha } from '../../src/components/ui/Primitives';

export default function TypingPracticeScreen() {
  const { showVowels, recordExerciseResult, addXp, updateStreak } = useProgressStore();
  const { speak, isSpeaking } = useArabicSpeech();
  const { t } = useTranslation();
  const { lc } = useLocalizedContent();

  const [words, setWords] = useState<VocabularyWord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [isComplete, setIsComplete] = useState(false);

  const shakeX = useSharedValue(0);
  const fadeIn = useSharedValue(0);

  useEffect(() => {
    // Select 10 random words for practice
    const shuffled = [...vocabularyWords].sort(() => Math.random() - 0.5);
    setWords(shuffled.slice(0, 10));
  }, []);

  useEffect(() => {
    fadeIn.value = withTiming(1, { duration: 300 });
  }, [currentIndex]);

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  const fadeStyle = useAnimatedStyle(() => ({
    opacity: fadeIn.value,
  }));

  const currentWord = words[currentIndex];

  const normalizeArabic = (text: string) => {
    return text
      .replace(/[\u064B-\u065F]/g, '')
      .replace(/[أإآ]/g, 'ا')
      .trim();
  };

  const checkAnswer = () => {
    if (!currentWord || !userAnswer.trim() || isAnswered) return;

    const targetWord = showVowels ? currentWord.arabicWithVowels : currentWord.arabic;
    const userNormalized = normalizeArabic(userAnswer);
    const targetNormalized = normalizeArabic(targetWord);

    const correct = userNormalized === targetNormalized;
    setIsCorrect(correct);
    setIsAnswered(true);

    if (correct) {
      addXp(10);
    } else {
      shakeX.value = withSequence(
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(-10, { duration: 50 }),
        withTiming(0, { duration: 50 })
      );
    }

    setScore((prev) => ({
      correct: prev.correct + (correct ? 1 : 0),
      total: prev.total + 1,
    }));

    recordExerciseResult('writing', correct);
  };

  const handleNext = () => {
    if (currentIndex < words.length - 1) {
      fadeIn.value = 0;
      setCurrentIndex((prev) => prev + 1);
      setUserAnswer('');
      setIsAnswered(false);
      setIsCorrect(false);
      setShowHint(false);
    } else {
      updateStreak();
      setIsComplete(true);
    }
  };

  const handleRetry = () => {
    const shuffled = [...vocabularyWords].sort(() => Math.random() - 0.5);
    setWords(shuffled.slice(0, 10));
    setCurrentIndex(0);
    setUserAnswer('');
    setIsAnswered(false);
    setIsCorrect(false);
    setShowHint(false);
    setScore({ correct: 0, total: 0 });
    setIsComplete(false);
  };

  if (words.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loading}>
          <Text style={styles.loadingText}>{t('common.loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isComplete) {
    const accuracy = Math.round((score.correct / score.total) * 100);
    const xpEarned = score.correct * 10;

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.completeContainer}>
          <View
            style={[
              styles.completeIcon,
              {
                backgroundColor:
                  accuracy >= 80 ? '#22c55e20' : accuracy >= 50 ? '#D4AF3720' : '#ef444420',
              },
            ]}
          >
            <Ionicons
              name={accuracy >= 80 ? 'trophy' : accuracy >= 50 ? 'thumbs-up' : 'refresh'}
              size={64}
              color={accuracy >= 80 ? color.progress : accuracy >= 50 ? color.sacred : color.danger}
            />
          </View>
          <Text style={styles.completeTitle}>
            {accuracy >= 80 ? t('exercise.excellent') : accuracy >= 50 ? t('exercise.goodJob') : t('exercise.keepPracticing')}
          </Text>
          <Text style={styles.completeSubtitle}>{t('exercise.typingPractice')}</Text>

          <View style={styles.resultsCard}>
            <View style={styles.resultItem}>
              <Text style={styles.resultValue}>{score.correct}</Text>
              <Text style={styles.resultLabel}>{t('common.correct')}</Text>
            </View>
            <View style={styles.resultDivider} />
            <View style={styles.resultItem}>
              <Text style={styles.resultValue}>{score.total - score.correct}</Text>
              <Text style={styles.resultLabel}>{t('common.wrong')}</Text>
            </View>
            <View style={styles.resultDivider} />
            <View style={styles.resultItem}>
              <Text style={[styles.resultValue, { color: color.accentStrong }]}>{accuracy}%</Text>
              <Text style={styles.resultLabel}>{t('common.accuracy')}</Text>
            </View>
          </View>

          <Text style={styles.xpEarned}>{t('common.xpEarned', { count: xpEarned })}</Text>

          <View style={styles.completeButtons}>
            <Pressable style={styles.retryButton} onPress={handleRetry}>
              <Ionicons name="refresh" size={20} color={color.accentStrong} />
              <Text style={styles.retryButtonText}>{t('common.tryAgain')}</Text>
            </Pressable>
            <Pressable style={styles.doneButton} onPress={() => router.back()}>
              <Text style={styles.doneButtonText}>{t('common.done')}</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.closeButton} onPress={() => router.back()}>
          <Ionicons name="close" size={24} color={color.text} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{t('exercise.typingPractice')}</Text>
          <Text style={styles.headerProgress}>
            {currentIndex + 1} / {words.length}
          </Text>
        </View>
        <View style={styles.scoreBox}>
          <Ionicons name="star" size={16} color={color.accentStrong} />
          <Text style={styles.scoreText}>{score.correct}</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${((currentIndex + 1) / words.length) * 100}%` },
            ]}
          />
        </View>
      </View>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Question */}
        <Animated.View style={[styles.questionContainer, shakeStyle, fadeStyle]}>
          <Text style={styles.instructionText}>{t('exercise.typeInArabic')}</Text>
          <Text style={styles.questionText}>{lc(currentWord.english, (currentWord as any).french)}</Text>
          <View style={styles.questionArabicRow}>
            <Text style={styles.transliteration}>({currentWord.transliteration})</Text>
            <Pressable
              style={[styles.audioButton, isSpeaking && styles.audioButtonActive]}
              onPress={() => speak(currentWord.arabicWithVowels || currentWord.arabic)}
            >
              <Ionicons name="volume-medium" size={20} color={isSpeaking ? color.surface : color.accent} />
            </Pressable>
          </View>
        </Animated.View>

        {/* Hint Button */}
        {!showHint && !isAnswered && (
          <Pressable style={styles.hintButton} onPress={() => setShowHint(true)}>
            <Ionicons name="eye-outline" size={18} color={color.accentStrong} />
            <Text style={styles.hintButtonText}>{t('exercise.showAnswer')}</Text>
          </Pressable>
        )}

        {/* Hint Display */}
        {showHint && !isAnswered && (
          <View style={styles.hintBox}>
            <Text style={styles.hintArabic}>
              {showVowels ? currentWord.arabicWithVowels : currentWord.arabic}
            </Text>
          </View>
        )}

        {/* Feedback */}
        {isAnswered && (
          <View style={[styles.feedbackBox, isCorrect ? styles.feedbackCorrect : styles.feedbackWrong]}>
            <View style={styles.feedbackHeader}>
              <Ionicons
                name={isCorrect ? 'checkmark-circle' : 'close-circle'}
                size={24}
                color={isCorrect ? color.progress : color.danger}
              />
              <Text style={[styles.feedbackTitle, isCorrect ? styles.feedbackTitleCorrect : styles.feedbackTitleWrong]}>
                {isCorrect ? t('exercise.correctFeedback') : t('exercise.notQuite')}
              </Text>
            </View>

            {!isCorrect && (
              <View style={styles.correctAnswerBox}>
                <Text style={styles.correctAnswerLabel}>{t('exercise.correctAnswerLabel')}</Text>
                <Pressable
                  style={styles.correctAnswerRow}
                  onPress={() => speak(currentWord.arabicWithVowels || currentWord.arabic)}
                >
                  <Text style={styles.correctAnswerText}>
                    {showVowels ? currentWord.arabicWithVowels : currentWord.arabic}
                  </Text>
                  <Ionicons name="volume-medium" size={20} color={color.accentStrong} />
                </Pressable>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Arabic Writing Input with Keyboard */}
      {!isAnswered ? (
        <ArabicWritingInput
          value={userAnswer}
          onChange={setUserAnswer}
          onSubmit={checkAnswer}
          placeholder="اكتب إجابتك هنا..."
          disabled={isAnswered}
          isCorrect={isCorrect}
          showResult={isAnswered}
          accentColor={color.accentStrong}
        />
      ) : (
        <View style={styles.actionContainer}>
          <Pressable style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>
              {currentIndex < words.length - 1 ? t('exercise.nextWord') : t('exercise.seeResults')}
            </Text>
            <Ionicons name="arrow-forward" size={20} color={color.text} />
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.bg,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: color.textMuted,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: radius.xl,
    backgroundColor: color.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    color: color.text,
    fontSize: 16,
    fontWeight: '600',
  },
  headerProgress: {
    color: color.textFaint,
    fontSize: 13,
    marginTop: 2,
  },
  scoreBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: withAlpha(color.accentStrong, 0.13),
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.lg,
  },
  scoreText: {
    color: color.accentStrong,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  progressBarContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  progressBar: {
    height: 4,
    backgroundColor: color.surfaceRaised,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: color.accentStrong,
    borderRadius: 2,
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  questionContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  instructionText: {
    color: color.textMuted,
    fontSize: 14,
    marginBottom: 8,
  },
  questionText: {
    color: color.text,
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  questionArabicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  transliteration: {
    fontSize: 16,
    color: color.accentStrong,
  },
  audioButton: {
    width: 36,
    height: 36,
    borderRadius: radius.lg,
    backgroundColor: withAlpha(color.accentStrong, 0.13),
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioButtonActive: {
    backgroundColor: color.accentStrong,
  },
  hintButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginBottom: 16,
  },
  hintButtonText: {
    color: color.accentStrong,
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  hintBox: {
    backgroundColor: color.surface,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: radius.md,
    marginBottom: 20,
    alignItems: 'center',
  },
  hintArabic: {
    fontFamily: font.arabic,
    lineHeight: 62,
    fontSize: 36,
    color: color.sacred,
  },
  feedbackBox: {
    borderRadius: radius.lg,
    padding: 16,
    marginBottom: 20,
  },
  feedbackCorrect: {
    backgroundColor: withAlpha(color.progress, 0.13),
    borderWidth: 1,
    borderColor: withAlpha(color.progress, 0.25),
  },
  feedbackWrong: {
    backgroundColor: withAlpha(color.danger, 0.13),
    borderWidth: 1,
    borderColor: withAlpha(color.danger, 0.25),
  },
  feedbackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  feedbackTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  feedbackTitleCorrect: {
    color: color.progress,
  },
  feedbackTitleWrong: {
    color: color.danger,
  },
  correctAnswerBox: {
    marginBottom: 12,
  },
  correctAnswerLabel: {
    color: color.textMuted,
    fontSize: 12,
    marginBottom: 4,
  },
  correctAnswerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  correctAnswerText: {
    color: color.text,
    fontSize: 24,
    fontWeight: '600',
    marginRight: 12,
  },
  actionContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 12,
  },
  nextButton: {
    backgroundColor: color.accentStrong,
    borderRadius: radius.lg,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonText: {
    color: color.text,
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  completeContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  completeIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  completeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: color.text,
    marginBottom: 8,
  },
  completeSubtitle: {
    fontSize: 16,
    color: color.textMuted,
    marginBottom: 32,
  },
  resultsCard: {
    flexDirection: 'row',
    backgroundColor: color.surface,
    borderRadius: radius.lg,
    padding: 24,
    marginBottom: 24,
    width: '100%',
  },
  resultItem: {
    flex: 1,
    alignItems: 'center',
  },
  resultValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: color.text,
  },
  resultLabel: {
    fontSize: 12,
    color: color.textMuted,
    marginTop: 4,
  },
  resultDivider: {
    width: 1,
    backgroundColor: color.surfaceRaised,
    marginHorizontal: 16,
  },
  xpEarned: {
    fontSize: 18,
    color: color.accentStrong,
    fontWeight: '600',
    marginBottom: 32,
  },
  completeButtons: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
  },
  retryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: color.surface,
    borderRadius: radius.lg,
    padding: 16,
    borderWidth: 2,
    borderColor: color.accentStrong,
  },
  retryButtonText: {
    color: color.accentStrong,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  doneButton: {
    flex: 1,
    backgroundColor: color.accentStrong,
    borderRadius: radius.lg,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneButtonText: {
    color: color.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

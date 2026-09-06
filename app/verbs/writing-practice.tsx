import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { verbExercises } from '../../src/data/arabic/exercises/verbExercises';
import { useProgressStore } from '../../src/stores/progressStore';
import { useArabicSpeech } from '../../src/hooks/useArabicSpeech';
import ArabicWritingInput from '../../src/components/arabic/ArabicWritingInput';
import { QuizPrimaryButton } from '../../src/components/quiz/QuizPrimaryButton';
import { font, color, radius } from '../../src/theme/tokens';
import { withAlpha } from '../../src/components/ui/Primitives';

export default function VerbsWritingPracticeScreen() {
  const { t } = useTranslation();
  const writingExercises = verbExercises.filter(ex => ex.type === 'writing');

  const { addXp, updateStreak, recordExerciseResult } = useProgressStore();
  const { speak, isSpeaking } = useArabicSpeech();

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
    fadeIn.value = withTiming(1, { duration: 300 });
  }, [currentIndex]);

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  const fadeStyle = useAnimatedStyle(() => ({
    opacity: fadeIn.value,
  }));

  if (writingExercises.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{t('verbWriting.noWritingExercises')}</Text>
          <Pressable style={styles.backLink} onPress={() => router.back()}>
            <Text style={styles.backLinkText}>{t('common.goBack')}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const currentExercise = writingExercises[currentIndex];

  const normalizeAnswer = (answer: string): string => {
    return answer
      .trim()
      .replace(/[\u064B-\u0652]/g, '')
      .replace(/\s+/g, ' ')
      .toLowerCase();
  };

  const checkAnswer = () => {
    if (!userAnswer.trim() || isAnswered) return;

    const normalizedUserAnswer = normalizeAnswer(userAnswer);
    const correctAnswers = currentExercise.correctAnswer as string[];

    const correct = correctAnswers.some(
      (ans) => normalizeAnswer(ans) === normalizedUserAnswer
    );

    setIsCorrect(correct);
    setIsAnswered(true);

    if (correct) {
      addXp(currentExercise.xpReward || 20);
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
    if (currentIndex < writingExercises.length - 1) {
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
    setCurrentIndex(0);
    setUserAnswer('');
    setIsAnswered(false);
    setIsCorrect(false);
    setShowHint(false);
    setScore({ correct: 0, total: 0 });
    setIsComplete(false);
  };

  if (isComplete) {
    const accuracy = Math.round((score.correct / score.total) * 100);
    const xpEarned = score.correct * 20;

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
              color={accuracy >= 80 ? '#22c55e' : accuracy >= 50 ? color.sacred : '#ef4444'}
            />
          </View>
          <Text style={styles.completeTitle}>
            {accuracy >= 80 ? t('verbWriting.excellent') : accuracy >= 50 ? t('verbWriting.goodJob') : t('verbWriting.keepPracticing')}
          </Text>
          <Text style={styles.completeSubtitle}>{t('verbWriting.verbWritingPractice')}</Text>

          <View style={styles.resultsCard}>
            <View style={styles.resultItem}>
              <Text style={styles.resultValue}>{score.correct}</Text>
              <Text style={styles.resultLabel}>{t('verbWriting.correct')}</Text>
            </View>
            <View style={styles.resultDivider} />
            <View style={styles.resultItem}>
              <Text style={styles.resultValue}>{score.total - score.correct}</Text>
              <Text style={styles.resultLabel}>{t('verbWriting.wrong')}</Text>
            </View>
            <View style={styles.resultDivider} />
            <View style={styles.resultItem}>
              <Text style={[styles.resultValue, { color: color.accent }]}>{accuracy}%</Text>
              <Text style={styles.resultLabel}>{t('verbWriting.accuracy')}</Text>
            </View>
          </View>

          <Text style={styles.xpEarned}>{t('verbWriting.xpEarned', { count: xpEarned })}</Text>

          <View style={styles.completeButtons}>
            <Pressable style={styles.retryButton} onPress={handleRetry}>
              <Ionicons name="refresh" size={20} color={color.accent} />
              <Text style={styles.retryButtonText}>{t('verbWriting.tryAgain')}</Text>
            </Pressable>
            <Pressable style={styles.doneButton} onPress={() => router.back()}>
              <Text style={styles.doneButtonText}>{t('verbWriting.done')}</Text>
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
          <Text style={styles.headerTitle}>{t('verbWriting.title')}</Text>
          <Text style={styles.headerProgress}>
            {currentIndex + 1} / {writingExercises.length}
          </Text>
        </View>
        <View style={styles.scoreBox}>
          <Ionicons name="star" size={16} color={color.accent} />
          <Text style={styles.scoreText}>{score.correct}</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${((currentIndex + 1) / writingExercises.length) * 100}%` },
            ]}
          />
        </View>
      </View>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Question */}
        <Animated.View style={[styles.questionContainer, shakeStyle, fadeStyle]}>
          <Text style={styles.questionText}>{currentExercise.question}</Text>
          {currentExercise.questionArabic && (
            <View style={styles.questionArabicRow}>
              <Text style={styles.questionArabic}>{currentExercise.questionArabic}</Text>
              <Pressable
                style={[styles.audioButton, isSpeaking && styles.audioButtonActive]}
                onPress={() => speak(currentExercise.questionArabic || '')}
              >
                <Ionicons name="volume-medium" size={20} color={isSpeaking ? '#ffffff' : '#ec4899'} />
              </Pressable>
            </View>
          )}
        </Animated.View>

        {/* Hint Button */}
        {currentExercise.hint && !showHint && !isAnswered && (
          <Pressable style={styles.hintButton} onPress={() => setShowHint(true)}>
            <Ionicons name="bulb-outline" size={18} color={color.accent} />
            <Text style={styles.hintButtonText}>{t('verbWriting.showHint')}</Text>
          </Pressable>
        )}

        {/* Hint Display */}
        {showHint && (
          <View style={styles.hintBox}>
            <Ionicons name="bulb" size={18} color={color.accent} />
            <Text style={styles.hintText}>{currentExercise.hint}</Text>
          </View>
        )}

        {/* Feedback */}
        {isAnswered && (
          <View style={[styles.feedbackBox, isCorrect ? styles.feedbackCorrect : styles.feedbackWrong]}>
            <View style={styles.feedbackHeader}>
              <Ionicons
                name={isCorrect ? 'checkmark-circle' : 'close-circle'}
                size={24}
                color={isCorrect ? '#22c55e' : '#ef4444'}
              />
              <Text style={[styles.feedbackTitle, isCorrect ? styles.feedbackTitleCorrect : styles.feedbackTitleWrong]}>
                {isCorrect ? t('verbWriting.correctFeedback') : t('verbWriting.notQuite')}
              </Text>
            </View>

            {!isCorrect && (
              <View style={styles.correctAnswerBox}>
                <Text style={styles.correctAnswerLabel}>{t('verbWriting.correctAnswer')}</Text>
                <Pressable
                  style={styles.correctAnswerRow}
                  onPress={() => speak((currentExercise.correctAnswer as string[])[0])}
                >
                  <Text style={styles.correctAnswerText}>
                    {(currentExercise.correctAnswer as string[])[0]}
                  </Text>
                  <Ionicons name="volume-medium" size={20} color={color.accent} />
                </Pressable>
              </View>
            )}

            {currentExercise.explanation && (
              <Text style={styles.explanationText}>{currentExercise.explanation}</Text>
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
          accentColor={color.accent}
        />
      ) : (
        <View style={styles.actionContainer}>
          <QuizPrimaryButton
            label={currentIndex < writingExercises.length - 1 ? t('verbWriting.nextQuestion') : t('verbWriting.seeResults')}
            onPress={handleNext}
            style={styles.nextButtonOverride}
          />
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
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: color.danger,
    fontSize: 18,
    marginBottom: 16,
  },
  backLink: {
    padding: 12,
  },
  backLinkText: {
    color: color.accentStrong,
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
    backgroundColor: withAlpha(color.accent, 0.13),
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.lg,
  },
  scoreText: {
    color: color.accent,
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
    backgroundColor: color.accent,
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
  questionText: {
    color: color.text,
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 12,
  },
  questionArabicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  questionArabic: {
    fontFamily: font.arabic,
    lineHeight: 38,
    fontSize: 22,
    color: color.accent,
    textAlign: 'center',
  },
  audioButton: {
    width: 36,
    height: 36,
    borderRadius: radius.lg,
    backgroundColor: withAlpha(color.accent, 0.13),
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioButtonActive: {
    backgroundColor: color.accent,
  },
  hintButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginBottom: 16,
  },
  hintButtonText: {
    color: color.accent,
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  hintBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: withAlpha(color.accent, 0.13),
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: radius.md,
    marginBottom: 20,
  },
  hintText: {
    color: color.accent,
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  feedbackBox: {
    borderRadius: radius.lg,
    padding: 16,
    marginBottom: 20,
    marginHorizontal: 20,
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
  explanationText: {
    color: color.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  actionContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 12,
  },
  nextButtonOverride: {
    marginHorizontal: 0,
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
    color: color.accent,
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
    borderColor: color.accent,
  },
  retryButtonText: {
    color: color.accent,
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

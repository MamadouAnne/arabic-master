import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocalizedContent } from '../../src/hooks/useLocalizedContent';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { arabicLetters } from '../../src/data/arabic/alphabet/letters';
import { vocabularyWords } from '../../src/data/arabic/vocabulary';
import { useProgressStore } from '../../src/stores/progressStore';
import { useArabicSpeech } from '../../src/hooks/useArabicSpeech';
import { QuizOption } from '../../src/components/quiz/QuizOption';
import { QuizPrimaryButton } from '../../src/components/quiz/QuizPrimaryButton';
import { font, color, radius } from '../../src/theme/tokens';
import { withAlpha } from '../../src/components/ui/Primitives';

interface Question {
  id: string;
  type: 'letter_recognition' | 'vocabulary_quiz';
  question: string;
  questionFr?: string;
  questionArabic?: string;
  options: { id: string; text: string; textFr?: string; textArabic?: string }[];
  correctAnswerId: string;
  hint?: string;
  hintFr?: string;
  explanation?: string;
  explanationFr?: string;
}

const generateLetterRecognitionQuestions = (count: number): Question[] => {
  const shuffledLetters = [...arabicLetters].sort(() => Math.random() - 0.5);
  const questions: Question[] = [];

  for (let i = 0; i < Math.min(count, shuffledLetters.length); i++) {
    const correctLetter = shuffledLetters[i];
    const wrongLetters = arabicLetters
      .filter((l) => l.id !== correctLetter.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    const options = [
      { id: correctLetter.id, text: correctLetter.name, textArabic: correctLetter.letter },
      ...wrongLetters.map((l) => ({ id: l.id, text: l.name, textArabic: l.letter })),
    ].sort(() => Math.random() - 0.5);

    questions.push({
      id: `letter-${i}`,
      type: 'letter_recognition',
      question: `What letter is this?`,
      questionFr: `Quelle est cette lettre ?`,
      questionArabic: correctLetter.letter,
      options,
      correctAnswerId: correctLetter.id,
    });
  }

  return questions;
};

const generateVocabularyQuizQuestions = (count: number): Question[] => {
  const shuffledWords = [...vocabularyWords].sort(() => Math.random() - 0.5);
  const questions: Question[] = [];

  for (let i = 0; i < Math.min(count, shuffledWords.length); i++) {
    const correctWord = shuffledWords[i];
    const wrongWords = vocabularyWords
      .filter((w) => w.id !== correctWord.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    const options = [
      { id: correctWord.id, text: correctWord.english, textFr: (correctWord as any).french },
      ...wrongWords.map((w) => ({ id: w.id, text: w.english, textFr: (w as any).french })),
    ].sort(() => Math.random() - 0.5);

    questions.push({
      id: `vocab-${i}`,
      type: 'vocabulary_quiz',
      question: `What does this word mean?`,
      questionFr: `Que signifie ce mot ?`,
      questionArabic: correctWord.arabicWithVowels,
      options,
      correctAnswerId: correctWord.id,
    });
  }

  return questions;
};

export default function ExerciseScreen() {
  const { exerciseId } = useLocalSearchParams<{ exerciseId: string }>();
  const { recordExerciseResult, addXp, updateStreak, showVowels } = useProgressStore();
  const { speak, isSpeaking } = useArabicSpeech();
  const { t } = useTranslation();
  const { lc } = useLocalizedContent();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [isComplete, setIsComplete] = useState(false);

  const shakeX = useSharedValue(0);
  const scaleCorrect = useSharedValue(1);

  useEffect(() => {
    // Generate questions based on exercise type
    let generatedQuestions: Question[] = [];

    switch (exerciseId) {
      case 'letter-recognition':
        generatedQuestions = generateLetterRecognitionQuestions(10);
        break;
      case 'vocabulary-quiz':
        generatedQuestions = generateVocabularyQuizQuestions(10);
        break;
      case 'quick-review':
        // Mix of both
        generatedQuestions = [
          ...generateLetterRecognitionQuestions(5),
          ...generateVocabularyQuizQuestions(5),
        ].sort(() => Math.random() - 0.5);
        break;
      default:
        generatedQuestions = generateVocabularyQuizQuestions(10);
    }

    setQuestions(generatedQuestions);
  }, [exerciseId]);

  const handleSelectAnswer = (optionId: string) => {
    if (isAnswered) return;

    setSelectedAnswer(optionId);
    setIsAnswered(true);

    const currentQuestion = questions[currentIndex];
    const isCorrect = optionId === currentQuestion.correctAnswerId;

    if (isCorrect) {
      scaleCorrect.value = withSequence(
        withTiming(1.2, { duration: 150 }),
        withTiming(1, { duration: 150 })
      );
      addXp(5);
    } else {
      shakeX.value = withSequence(
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(-10, { duration: 50 }),
        withTiming(0, { duration: 50 })
      );
    }

    setScore((prev) => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
    }));

    recordExerciseResult(
      currentQuestion.type === 'letter_recognition' ? 'letter_recognition' : 'multiple_choice',
      isCorrect
    );
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      updateStreak();
      setIsComplete(true);
    }
  };

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  const exerciseTitle = {
    'letter-recognition': t('exercise.letterRecognition'),
    'vocabulary-quiz': t('exercise.vocabularyQuiz'),
    'quick-review': t('exercise.quickReview'),
    listening: t('exercise.listeningPractice'),
    writing: t('exercise.writingPractice'),
    matching: t('exercise.matchingGame'),
    'fill-blank': t('exercise.fillInBlank'),
  }[exerciseId || ''] || t('exercise.exerciseTitle');

  if (questions.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loading}>
          <Text style={styles.loadingText}>{t('exercise.loadingExercise')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isComplete) {
    const accuracy = Math.round((score.correct / score.total) * 100);
    const xpEarned = score.correct * 5;

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
            {accuracy >= 80 ? t('exercise.excellent') : accuracy >= 50 ? t('exercise.goodJob') : t('exercise.keepPracticing')}
          </Text>
          <Text style={styles.completeSubtitle}>{exerciseTitle}</Text>

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
            <Pressable
              style={styles.retryButton}
              onPress={() => {
                setCurrentIndex(0);
                setSelectedAnswer(null);
                setIsAnswered(false);
                setScore({ correct: 0, total: 0 });
                setIsComplete(false);
                // Regenerate questions
                const newQuestions =
                  exerciseId === 'letter-recognition'
                    ? generateLetterRecognitionQuestions(10)
                    : generateVocabularyQuizQuestions(10);
                setQuestions(newQuestions);
              }}
            >
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

  const currentQuestion = questions[currentIndex];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.closeButton} onPress={() => router.back()}>
          <Ionicons name="close" size={24} color={color.text} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{exerciseTitle}</Text>
          <Text style={styles.headerProgress}>
            {currentIndex + 1} / {questions.length}
          </Text>
        </View>
        <View style={styles.scoreBox}>
          <Ionicons name="star" size={16} color={color.sacred} />
          <Text style={styles.scoreText}>{score.correct}</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${((currentIndex + 1) / questions.length) * 100}%` },
            ]}
          />
        </View>
      </View>

      {/* Question */}
      <Animated.View style={[styles.questionContainer, shakeStyle]}>
        <Text style={styles.questionText}>
          {currentQuestion.type === 'letter_recognition' ? t('exercise.whatLetter') : t('exercise.whatMeaning')}
        </Text>
        {currentQuestion.questionArabic && (
          <View style={styles.questionArabicContainer}>
            <Text style={styles.questionArabic}>{currentQuestion.questionArabic}</Text>
            <Pressable
              style={[styles.questionAudioBtn, isSpeaking && styles.questionAudioBtnActive]}
              onPress={() => speak(currentQuestion.questionArabic!)}
            >
              <Ionicons name="volume-high" size={24} color={isSpeaking ? "#ffffff" : "#D4AF37"} />
            </Pressable>
          </View>
        )}
      </Animated.View>

      {/* Options */}
      <View style={styles.optionsContainer}>
        {currentQuestion.options.map((option, index) => {
          const isSelected = selectedAnswer === option.id;
          const isCorrect = option.id === currentQuestion.correctAnswerId;
          const showCorrect = isAnswered && isCorrect;
          const showWrong = isAnswered && isSelected && !isCorrect;
          const state = showCorrect ? 'correct' : showWrong ? 'wrong' : isSelected ? 'selected' : 'idle';

          const hasArabic = !!option.textArabic;
          const translation = lc(option.text, option.textFr);

          return (
            <QuizOption
              key={option.id}
              index={index}
              primary={hasArabic ? option.textArabic! : translation}
              primaryArabic={hasArabic}
              secondary={hasArabic && translation && translation !== option.textArabic ? translation : undefined}
              state={state}
              disabled={isAnswered}
              onPress={() => handleSelectAnswer(option.id)}
              onAudio={hasArabic ? () => speak(option.textArabic!) : undefined}
            />
          );
        })}
      </View>

      {/* Next Button */}
      {isAnswered && (
        <View style={styles.nextButtonContainer}>
          <QuizPrimaryButton
            label={currentIndex < questions.length - 1 ? t('exercise.nextQuestion') : t('exercise.seeResults')}
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
    backgroundColor: withAlpha(color.sacred, 0.13),
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.lg,
  },
  scoreText: {
    color: color.sacred,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  progressBarContainer: {
    paddingHorizontal: 20,
    marginBottom: 32,
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
  questionContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  questionText: {
    color: color.text,
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 24,
  },
  questionArabicContainer: {
    alignItems: 'center',
  },
  questionArabic: {
    fontFamily: font.arabic,
    fontSize: 80,
    lineHeight: 116,
    color: color.text,
    textAlign: 'center',
  },
  questionAudioBtn: {
    marginTop: 16,
    width: 48,
    height: 48,
    borderRadius: radius.xl,
    backgroundColor: withAlpha(color.sacred, 0.13),
    alignItems: 'center',
    justifyContent: 'center',
  },
  questionAudioBtnActive: {
    backgroundColor: color.sacred,
  },
  optionsContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  nextButtonContainer: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
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
    color: color.sacred,
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

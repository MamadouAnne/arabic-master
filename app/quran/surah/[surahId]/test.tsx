import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getSurahById } from '../../../../src/data/arabic/quran';
import { fetchSurahAyahsById } from '../../../../src/services/staticQuranService';
import { useQuranStore } from '../../../../src/stores/quranStore';
import { Ayah } from '../../../../src/types/quran';

type TestType = 'fill_blank' | 'continue_from' | 'what_next';

interface Question {
  type: TestType;
  ayahIndex: number;
  missingWordIndex?: number;
  options: string[];
  correctAnswer: string;
}

export default function TestModeScreen() {
  const { surahId } = useLocalSearchParams<{ surahId: string }>();
  const { t } = useTranslation();

  const surah = getSurahById(surahId);
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [loading, setLoading] = useState(true);

  const { markAyahMemorized, scheduleReview } = useQuranStore();

  useEffect(() => {
    fetchSurahAyahsById(surahId).then((data) => {
      setAyahs(data);
      setLoading(false);
    });
  }, [surahId]);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  // Generate questions
  const questions = useMemo(() => {
    const qs: Question[] = [];

    ayahs.forEach((ayah, ayahIndex) => {
      if (ayah.words.length < 3) return;

      // Fill in the blank - random word missing
      const missingIndex = Math.floor(Math.random() * ayah.words.length);
      const correctWord = ayah.words[missingIndex].text;
      const otherWords = ayah.words
        .filter((_, i) => i !== missingIndex)
        .map((w) => w.text)
        .slice(0, 3);

      qs.push({
        type: 'fill_blank',
        ayahIndex,
        missingWordIndex: missingIndex,
        options: shuffleArray([correctWord, ...otherWords]),
        correctAnswer: correctWord,
      });
    });

    // Continue from - given first words
    if (ayahs.length > 1) {
      ayahs.slice(0, -1).forEach((ayah, index) => {
        const nextAyah = ayahs[index + 1];
        const correctStart = nextAyah.words.slice(0, 2).map((w) => w.text).join(' ');
        const wrongOptions = ayahs
          .filter((_, i) => i !== index + 1)
          .slice(0, 3)
          .map((a) => a.words.slice(0, 2).map((w) => w.text).join(' '));

        qs.push({
          type: 'continue_from',
          ayahIndex: index,
          options: shuffleArray([correctStart, ...wrongOptions]),
          correctAnswer: correctStart,
        });
      });
    }

    return shuffleArray(qs).slice(0, 5); // Limit to 5 questions
  }, [ayahs]);

  const currentQuestion = questions[currentQuestionIndex];

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8b5cf6" />
          <Text style={styles.loadingText}>{t('surahTest.loadingQuestions')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!surah || !currentQuestion) {
    if (isComplete) {
      return (
        <SafeAreaView style={styles.container}>
          <View style={styles.completeContainer}>
            <View style={styles.completeIcon}>
              <Ionicons name="trophy" size={48} color="#f59e0b" />
            </View>
            <Text style={styles.completeTitle}>{t('surahTest.testComplete')}</Text>
            <Text style={styles.completeScore}>
              {t('surahTest.scoreCorrect', { correct: correctAnswers, total: questions.length })}
            </Text>
            <Text style={styles.completePercent}>
              {Math.round((correctAnswers / questions.length) * 100)}%
            </Text>
            <Pressable style={styles.completeButton} onPress={() => router.back()}>
              <Text style={styles.completeButtonText}>{t('surahTest.backToSurah')}</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      );
    }

    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>{t('surahTest.noQuestions')}</Text>
      </SafeAreaView>
    );
  }

  const handleSelectAnswer = (answer: string) => {
    if (showResult) return;
    setSelectedAnswer(answer);
  };

  const handleSubmit = () => {
    if (!selectedAnswer) return;

    setShowResult(true);
    if (selectedAnswer === currentQuestion.correctAnswer) {
      setCorrectAnswers((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setIsComplete(true);
    }
  };

  const renderQuestion = () => {
    const ayah = ayahs[currentQuestion.ayahIndex];

    if (currentQuestion.type === 'fill_blank') {
      return (
        <View style={styles.questionContent}>
          <Text style={styles.questionLabel}>{t('surahTest.fillBlank')}</Text>
          <View style={styles.fillBlankContainer}>
            {ayah.words.map((word, index) => (
              <Text
                key={index}
                style={[
                  styles.fillBlankWord,
                  index === currentQuestion.missingWordIndex && styles.fillBlankMissing,
                ]}
              >
                {index === currentQuestion.missingWordIndex ? '______' : word.text}
              </Text>
            ))}
          </View>
        </View>
      );
    }

    if (currentQuestion.type === 'continue_from') {
      return (
        <View style={styles.questionContent}>
          <Text style={styles.questionLabel}>{t('surahTest.whatNext')}</Text>
          <View style={styles.continueContainer}>
            <Text style={styles.continueAyah}>{ayah.textUthmani}</Text>
          </View>
        </View>
      );
    }

    return null;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.closeButton} onPress={() => router.back()}>
          <Ionicons name="close" size={24} color="#ffffff" />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.surahName}>{surah.nameArabic}</Text>
          <Text style={styles.subtitle}>{t('surahTest.testMode')}</Text>
        </View>
        <View style={styles.headerProgress}>
          <Text style={styles.progressText}>
            {currentQuestionIndex + 1}/{questions.length}
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` },
            ]}
          />
        </View>
      </View>

      {/* Question */}
      <View style={styles.questionCard}>
        {renderQuestion()}
      </View>

      {/* Options */}
      <View style={styles.optionsContainer}>
        {currentQuestion.options.map((option, index) => {
          const isSelected = selectedAnswer === option;
          const isCorrect = option === currentQuestion.correctAnswer;
          const showCorrect = showResult && isCorrect;
          const showWrong = showResult && isSelected && !isCorrect;

          return (
            <Pressable
              key={index}
              style={[
                styles.optionButton,
                isSelected && styles.optionButtonSelected,
                showCorrect && styles.optionButtonCorrect,
                showWrong && styles.optionButtonWrong,
              ]}
              onPress={() => handleSelectAnswer(option)}
              disabled={showResult}
            >
              <Text
                style={[
                  styles.optionText,
                  isSelected && styles.optionTextSelected,
                ]}
              >
                {option}
              </Text>
              {showCorrect && (
                <Ionicons name="checkmark-circle" size={24} color="#10b981" />
              )}
              {showWrong && (
                <Ionicons name="close-circle" size={24} color="#ef4444" />
              )}
            </Pressable>
          );
        })}
      </View>

      {/* Submit/Next Button */}
      <View style={styles.bottomContainer}>
        {!showResult ? (
          <Pressable
            style={[styles.submitButton, !selectedAnswer && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={!selectedAnswer}
          >
            <Text style={styles.submitButtonText}>{t('surahTest.checkAnswer')}</Text>
          </Pressable>
        ) : (
          <Pressable style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>
              {currentQuestionIndex < questions.length - 1 ? t('surahTest.nextQuestion') : t('surahTest.seeResults')}
            </Text>
            <Ionicons name="arrow-forward" size={20} color="#ffffff" />
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#94a3b8',
    fontSize: 16,
    marginTop: 16,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  closeButton: {
    padding: 8,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  surahName: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#8b5cf6',
    fontSize: 12,
    marginTop: 2,
  },
  headerProgress: {
    padding: 8,
  },
  progressText: {
    color: '#64748b',
    fontSize: 14,
  },
  progressContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#334155',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#8b5cf6',
    borderRadius: 2,
  },
  questionCard: {
    backgroundColor: '#1e293b',
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
  },
  questionContent: {
    alignItems: 'center',
  },
  questionLabel: {
    color: '#94a3b8',
    fontSize: 14,
    marginBottom: 20,
  },
  fillBlankContainer: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  fillBlankWord: {
    color: '#ffffff',
    fontSize: 24,
  },
  fillBlankMissing: {
    color: '#8b5cf6',
    textDecorationLine: 'underline',
  },
  continueContainer: {
    padding: 16,
    backgroundColor: '#334155',
    borderRadius: 12,
  },
  continueAyah: {
    color: '#ffffff',
    fontSize: 22,
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  optionsContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionButtonSelected: {
    borderColor: '#8b5cf6',
  },
  optionButtonCorrect: {
    backgroundColor: '#10b98120',
    borderColor: '#10b981',
  },
  optionButtonWrong: {
    backgroundColor: '#ef444420',
    borderColor: '#ef4444',
  },
  optionText: {
    color: '#ffffff',
    fontSize: 20,
    textAlign: 'right',
    flex: 1,
    writingDirection: 'rtl',
  },
  optionTextSelected: {
    fontWeight: '600',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 40,
  },
  submitButton: {
    backgroundColor: '#8b5cf6',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#8b5cf650',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    backgroundColor: '#10b981',
    borderRadius: 16,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  nextButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Complete Screen
  completeContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  completeIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f59e0b20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  completeTitle: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  completeScore: {
    color: '#94a3b8',
    fontSize: 18,
    marginBottom: 8,
  },
  completePercent: {
    color: '#10b981',
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 32,
  },
  completeButton: {
    backgroundColor: '#10b981',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  completeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

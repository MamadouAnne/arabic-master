import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useGrammarQuizStore } from '../../src/stores/grammarQuizStore';
import { useProgressStore } from '../../src/stores/progressStore';
import { useCommunityStore } from '../../src/stores/communityStore';
import { generateGrammarQuiz, getTotalGrammarQuestions } from '../../src/lib/grammarQuizApi';
import { DEFAULT_GRAMMAR_QUIZ_CONFIG } from '../../src/types/grammarQuiz';
import { playArabicAudio } from '../../src/lib/arabicVocabularyApi';
import { useLocalizedContent } from '../../src/hooks/useLocalizedContent';
import { QuizIntro } from '../../src/components/quiz/QuizIntro';
import { font, color, radius } from '../../src/theme/tokens';

type ScreenState = 'loading' | 'ready' | 'playing' | 'feedback' | 'results';

const TIME_PER_QUESTION = 30;

// Normalize a typed answer so Arabic is matched regardless of vowel marks
// (tashkeel), tatweel, or alef variants; Latin answers just get trimmed/lowercased.
const normalizeAnswer = (s: string) =>
  s.trim()
    .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g, "")
    .replace(/[\u0623\u0625\u0622]/g, "\u0627")
    .replace(/\s+/g, " ")
    .toLowerCase();

export default function GrammarQuizScreen() {
  const { t } = useTranslation();
  const { lc } = useLocalizedContent();
  const [screenState, setScreenState] = useState<ScreenState>('loading');
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [fillBlankAnswer, setFillBlankAnswer] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION);
  const [quizResult, setQuizResult] = useState<{ passed: boolean; xpEarned: number } | null>(null);
  const [loadingMessage, setLoadingMessage] = useState(t('grammarQuiz.preparingQuiz'));

  const {
    currentQuestions,
    currentAnswers,
    currentIndex,
    attempts,
    bestScore,
    score,
    streak,
    maxStreak,
    isPlaying,
    error,
    hasActiveQuiz,
    setQuestions,
    setLoading,
    setError,
    startAttempt,
    submitAnswer,
    nextQuestion,
    recordAttempt,
    resetSession,
    clearQuiz,
  } = useGrammarQuizStore();

  const { addXp, updateStreak } = useProgressStore();
  const { contributeToChallenge } = useCommunityStore();

  const currentQuestion = currentQuestions[currentIndex];
  const quizStats = getTotalGrammarQuestions();

  // Load or generate quiz on mount
  useEffect(() => {
    if (hasActiveQuiz()) {
      setScreenState('ready');
    } else {
      clearQuiz();
      generateNewQuiz();
    }
  }, []);

  const generateNewQuiz = useCallback(async () => {
    setScreenState('loading');
    setLoading(true);
    setLoadingMessage(t('grammarQuiz.loadingExercises'));

    try {
      setTimeout(() => setLoadingMessage(t('grammarQuiz.selectingQuestions')), 500);
      setTimeout(() => setLoadingMessage(t('grammarQuiz.shufflingAnswers')), 1000);

      const questions = await generateGrammarQuiz({
        questionCount: 10,
        difficulty: 'mixed',
      });
      setQuestions(questions);
      setScreenState('ready');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate quiz');
      setScreenState('ready');
    }
  }, [setQuestions, setLoading, setError]);

  // Timer effect
  useEffect(() => {
    if (screenState !== 'playing' || !isPlaying) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [screenState, isPlaying, currentQuestion?.id]);

  // Handle timeout
  useEffect(() => {
    if (timeLeft === 0 && screenState === 'playing' && isPlaying) {
      submitAnswer('', TIME_PER_QUESTION * 1000);
      setIsCorrect(false);
      setScreenState('feedback');
    }
  }, [timeLeft, screenState, isPlaying]);

  // Reset state when question changes
  useEffect(() => {
    if (screenState === 'playing' && isPlaying) {
      setTimeLeft(TIME_PER_QUESTION);
      setSelectedOptionId(null);
      setFillBlankAnswer('');
      setIsCorrect(null);
    }
  }, [currentQuestion?.id, isPlaying]);

  const handleStartQuiz = () => {
    startAttempt();
    setScreenState('playing');
  };

  const handleSelectOption = (optionId: string) => {
    if (screenState !== 'playing' || selectedOptionId !== null || !currentQuestion) return;

    const timeSpent = (TIME_PER_QUESTION - timeLeft) * 1000;
    setSelectedOptionId(optionId);

    const correctOption = currentQuestion.options?.find((opt) => opt.isCorrect);
    const correct = optionId === correctOption?.id;
    setIsCorrect(correct);
    submitAnswer(optionId, timeSpent);
    setScreenState('feedback');
  };

  const handleSubmitFillBlank = () => {
    if (screenState !== 'playing' || !currentQuestion || !fillBlankAnswer.trim()) return;

    const timeSpent = (TIME_PER_QUESTION - timeLeft) * 1000;
    const correctAnswer = currentQuestion.correctAnswer;
    const normalizedInput = normalizeAnswer(fillBlankAnswer);

    let correct = false;
    if (Array.isArray(correctAnswer)) {
      correct = correctAnswer.some((ans) => normalizeAnswer(ans) === normalizedInput);
    } else {
      correct = normalizeAnswer(correctAnswer) === normalizedInput;
    }

    setIsCorrect(correct);
    submitAnswer(fillBlankAnswer, timeSpent);
    setScreenState('feedback');
  };

  const handleNext = () => {
    if (currentIndex >= currentQuestions.length - 1) {
      const result = recordAttempt();
      setQuizResult(result);

      if (result.passed) {
        addXp(result.xpEarned);
        updateStreak();

        const correctCount = currentAnswers.filter((a) => a.isCorrect).length;
        contributeToChallenge('exercises', correctCount);
        contributeToChallenge('xp', result.xpEarned);
      }

      setScreenState('results');
    } else {
      nextQuestion();
      setScreenState('playing');
    }
  };

  const handleTryAgain = () => {
    resetSession();
    setQuizResult(null);
    setScreenState('ready');
  };

  const handleGoBack = () => {
    resetSession();
    router.back();
  };

  // Loading Screen
  if (screenState === 'loading') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={color.sacred} />
          <Text style={styles.loadingText}>{t('grammarQuiz.loadingQuiz')}</Text>
          <Text style={styles.loadingSubtext}>{loadingMessage}</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Ready Screen
  if (screenState === 'ready') {
    return (
      <QuizIntro
        icon="book"
        title={t('grammarQuiz.title')}
        titleArabic="اختبار قواعد اللغة العربية"
        subtitle={`${t('grammarQuiz.grammarQuestions')}\n${t('grammarQuiz.passWithScore', { score: DEFAULT_GRAMMAR_QUIZ_CONFIG.passingScore })}`}
        features={[
          { icon: 'library', text: t('grammarQuiz.totalQuestionsAvailable', { count: quizStats.total }) },
          { icon: 'help-circle', text: t('grammarQuiz.multipleChoiceFillBlank') },
          { icon: 'layers', text: t('grammarQuiz.allDifficultyLevels') },
        ]}
        attempts={attempts}
        bestScore={bestScore}
        attemptText={t('grammarQuiz.sameQuizUntilPass', { score: DEFAULT_GRAMMAR_QUIZ_CONFIG.passingScore })}
        attemptsLabel={t('grammarQuiz.attempts')}
        bestScoreLabel={t('grammarQuiz.bestScore')}
        error={error}
        retryLabel={t('common.tryAgain')}
        startLabel={attempts > 0 ? t('common.tryAgain') : t('grammarQuiz.startQuiz')}
        onBack={handleGoBack}
        onStart={handleStartQuiz}
        onRetry={generateNewQuiz}
      />
    );
  }

  // Playing / Feedback Screen
  if ((screenState === 'playing' || screenState === 'feedback') && currentQuestion) {
    const progress = ((currentIndex + 1) / currentQuestions.length) * 100;

    // Some exercises print the answer phrase in questionArabic (e.g. اختر الصحيح: "سيارة جميلة"),
    // which gives the answer away. Hide the Arabic prompt when it contains the correct option
    // (compared with tashkeel/tatweel stripped). The EN/FR prompt still conveys the meaning.
    const stripTashkeel = (s: string) =>
      s.replace(/[ً-ْٰـ]/g, '').replace(/\s+/g, ' ').trim();
    const correctOption = currentQuestion.options?.find((o) => o.isCorrect);
    const questionArabicRevealsAnswer =
      currentQuestion.type === 'multiple_choice' &&
      !!currentQuestion.questionArabic &&
      !!correctOption &&
      (() => {
        const q = stripTashkeel(currentQuestion.questionArabic!);
        const a = stripTashkeel(correctOption.text);
        return a.length > 0 && q.includes(a);
      })();
    const showQuestionArabic = !!currentQuestion.questionArabic && !questionArabicRevealsAnswer;

    return (
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.closeButton} onPress={handleGoBack}>
            <Ionicons name="close" size={24} color={color.textMuted} />
          </Pressable>
          <Text style={styles.headerText}>
            {currentIndex + 1} / {currentQuestions.length}
          </Text>
          <View style={styles.streakBadge}>
            <Ionicons name="flame" size={16} color={color.warning} />
            <Text style={styles.streakText}>{streak}</Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${progress}%` }]} />
        </View>

        {/* Timer */}
        {screenState === 'playing' && (
          <View style={styles.timerContainer}>
            <Ionicons
              name="time-outline"
              size={18}
              color={timeLeft <= 5 ? '#ef4444' : '#94a3b8'}
            />
            <Text style={[styles.timerText, timeLeft <= 5 && styles.timerTextWarning]}>
              {timeLeft}s
            </Text>
          </View>
        )}

        <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Question */}
          <View style={styles.questionContainer}>
            <View style={styles.levelBadge}>
              <Text style={styles.levelBadgeText}>{currentQuestion.level}</Text>
            </View>
            {showQuestionArabic && (
              <View style={styles.arabicQuestionRow}>
                <Text style={styles.questionArabic}>
                  {currentQuestion.type === 'fill_blank'
                    ? // For fill_blank, show only the part with the blank (after = or :)
                      currentQuestion.questionArabic!.split(/[=:→]/)[1]?.trim() || currentQuestion.questionArabic!
                    : currentQuestion.questionArabic!}
                </Text>
                <Pressable
                  style={styles.audioButton}
                  onPress={() => {
                    // Get the displayed Arabic text
                    const displayedText = currentQuestion.type === 'fill_blank'
                      ? currentQuestion.questionArabic!.split(/[=:→]/)[1]?.trim() || currentQuestion.questionArabic!
                      : currentQuestion.questionArabic!;

                    // Extract all Arabic words, excluding blanks
                    const arabicOnly = displayedText.replace(/_+/g, ' ').trim();
                    const arabicMatches = arabicOnly.match(/[\u0600-\u06FF]+/g);

                    if (arabicMatches && arabicMatches.length > 0) {
                      // Join all Arabic words with spaces and play
                      playArabicAudio(arabicMatches.join(' '));
                    }
                  }}
                >
                  <Ionicons name="volume-high" size={22} color={color.sacred} />
                </Pressable>
              </View>
            )}
            <Text style={styles.questionText}>
              {currentQuestion.type === 'fill_blank'
                ? `${t('grammarQuiz.completeTheSentence')} "${lc(currentQuestion.question, currentQuestion.questionFr).split(/[=→]/)[0]?.trim() || lc(currentQuestion.question, currentQuestion.questionFr)}"`
                : lc(currentQuestion.question, currentQuestion.questionFr).split(/[=→]/)[0]?.trim() || lc(currentQuestion.question, currentQuestion.questionFr)}
            </Text>
            {currentQuestion.hint && screenState === 'playing' && (
              <View style={styles.hintBox}>
                <Ionicons name="bulb-outline" size={16} color={color.sacred} />
                <Text style={styles.hintText}>{lc(currentQuestion.hint, currentQuestion.hintFr)}</Text>
              </View>
            )}
          </View>

          {/* Multiple Choice Options */}
          {currentQuestion.type === 'multiple_choice' && currentQuestion.options && (
            <View style={styles.optionsContainer}>
              {currentQuestion.options.map((option) => {
                const isCorrectOption = screenState === 'feedback' && option.isCorrect;
                const isWrongOption = screenState === 'feedback' && option.id === selectedOptionId && !isCorrect;

                const optionStyle = [
                  styles.optionButton,
                  isCorrectOption && styles.optionCorrect,
                  isWrongOption && styles.optionWrong,
                ];
                // Check if option contains Arabic text (has Arabic Unicode characters)
                const hasArabic = /[\u0600-\u06FF]/.test(option.text);

                const textStyle = [
                  hasArabic ? styles.optionTextArabic : styles.optionText,
                  isCorrectOption && styles.optionTextCorrect,
                  isWrongOption && styles.optionTextWrong,
                ];

                return (
                  <Pressable
                    key={option.id}
                    style={optionStyle}
                    onPress={() => handleSelectOption(option.id)}
                    disabled={screenState === 'feedback'}
                  >
                    <View style={styles.optionContent}>
                      <Text style={textStyle}>{lc(option.text, option.textFr)}</Text>
                      {hasArabic && (
                        <Pressable
                          style={styles.optionAudioButton}
                          onPress={(e) => {
                            e.stopPropagation();
                            playArabicAudio(option.text);
                          }}
                        >
                          <Ionicons name="volume-high" size={18} color={color.sacred} />
                        </Pressable>
                      )}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )}

          {/* Fill in the Blank */}
          {currentQuestion.type === 'fill_blank' && (
            <View style={styles.fillBlankContainer}>
              {/* Show the sentence template with blank position */}
              {currentQuestion.questionArabic && (
                <View style={styles.sentenceTemplate}>
                  {(() => {
                    // Get the part with the blank (after = or :)
                    const parts = currentQuestion.questionArabic.split(/[=:→]/);
                    const templatePart = parts[1]?.trim() || currentQuestion.questionArabic;
                    // Split by blank placeholder
                    const segments = templatePart.split(/_+/);

                    return (
                      <Text style={styles.templateText}>
                        {segments.map((segment, idx) => (
                          <Text key={idx}>
                            {segment}
                            {idx < segments.length - 1 && (
                              <Text style={styles.blankIndicator}>
                                {fillBlankAnswer || ' ؟ '}
                              </Text>
                            )}
                          </Text>
                        ))}
                      </Text>
                    );
                  })()}
                </View>
              )}
              <TextInput
                style={[
                  styles.fillBlankInput,
                  screenState === 'feedback' && (isCorrect ? styles.inputCorrect : styles.inputWrong),
                ]}
                value={fillBlankAnswer}
                onChangeText={setFillBlankAnswer}
                placeholder="اكتب إجابتك هنا..."
                placeholderTextColor={color.textFaint}
                editable={screenState === 'playing'}
                autoCapitalize="none"
                autoCorrect={false}
                textAlign="center"
              />
              {screenState === 'playing' && (
                <Pressable
                  style={[styles.submitButton, !fillBlankAnswer.trim() && styles.submitButtonDisabled]}
                  onPress={handleSubmitFillBlank}
                  disabled={!fillBlankAnswer.trim()}
                >
                  <Text style={styles.submitButtonText}>{t('common.submit')}</Text>
                </Pressable>
              )}
              {screenState === 'feedback' && !isCorrect && (
                <View style={styles.correctAnswerBox}>
                  <Text style={styles.correctAnswerLabel}>{t('grammarQuiz.correctAnswerLabel')}</Text>
                  <View style={styles.correctAnswerRow}>
                    <Text style={styles.correctAnswerText}>
                      {Array.isArray(currentQuestion.correctAnswer)
                        ? currentQuestion.correctAnswer[0]
                        : currentQuestion.correctAnswer}
                    </Text>
                    <Pressable
                      style={styles.audioButtonSmall}
                      onPress={() => {
                        const answer = Array.isArray(currentQuestion.correctAnswer)
                          ? currentQuestion.correctAnswer[0]
                          : currentQuestion.correctAnswer;
                        playArabicAudio(answer);
                      }}
                    >
                      <Ionicons name="volume-high" size={18} color={color.sacred} />
                    </Pressable>
                  </View>
                </View>
              )}
            </View>
          )}

          {/* Feedback */}
          {screenState === 'feedback' && (
            <View style={styles.feedbackContainer}>
              <View style={[styles.feedbackBanner, isCorrect ? styles.feedbackCorrect : styles.feedbackWrong]}>
                <Ionicons
                  name={isCorrect ? 'checkmark-circle' : 'close-circle'}
                  size={24}
                  color={isCorrect ? '#22c55e' : '#ef4444'}
                />
                <Text style={[styles.feedbackText, isCorrect ? styles.feedbackTextCorrect : styles.feedbackTextWrong]}>
                  {isCorrect ? t('grammarQuiz.correctFeedback') : t('grammarQuiz.incorrectFeedback')}
                </Text>
              </View>

              {currentQuestion.explanation && (
                <View style={styles.explanationCard}>
                  <View style={styles.explanationHeader}>
                    <Ionicons name="book" size={18} color={color.sacred} />
                    <Text style={styles.explanationTitle}>{t('grammarQuiz.learnThisRule')}</Text>
                  </View>
                  <Text style={styles.explanationText}>{lc(currentQuestion.explanation, currentQuestion.explanationFr)}</Text>

                  {/* Extract and play the first Arabic phrase from explanation */}
                  {/[\u0600-\u06FF]/.test(currentQuestion.explanation) && (
                    <Pressable
                      style={styles.listenButton}
                      onPress={() => {
                        // Extract the first Arabic phrase (words with spaces between them)
                        // This regex captures Arabic text including spaces between Arabic words
                        const phraseMatch = currentQuestion.explanation.match(
                          /[\u0600-\u06FF]+(?:\s+[\u0600-\u06FF]+)*/
                        );
                        if (phraseMatch && phraseMatch[0]) {
                          // Clean up and play the phrase
                          const phrase = phraseMatch[0].trim();
                          if (phrase.length > 0) {
                            playArabicAudio(phrase);
                          }
                        }
                      }}
                    >
                      <Ionicons name="volume-high" size={18} color={color.sacred} />
                      <Text style={styles.listenButtonText}>{t('grammarQuiz.listenToArabic')}</Text>
                    </Pressable>
                  )}
                </View>
              )}

              <Pressable style={styles.nextButton} onPress={handleNext}>
                <Text style={styles.nextButtonText}>
                  {currentIndex >= currentQuestions.length - 1 ? t('grammarQuiz.seeResults') : t('grammarQuiz.nextQuestion')}
                </Text>
                <Ionicons name="arrow-forward" size={20} color={color.textOnAccent} />
              </Pressable>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Results Screen
  if (screenState === 'results' && quizResult) {
    const correctCount = currentAnswers.filter((a) => a.isCorrect).length;
    const accuracy = Math.round((correctCount / currentQuestions.length) * 100);

    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.resultsScroll}>
          {/* Result Header */}
          <View style={styles.resultHeader}>
            <Ionicons
              name={quizResult.passed ? 'trophy' : 'refresh-circle'}
              size={64}
              color={quizResult.passed ? '#D4AF37' : '#94a3b8'}
            />
            <Text style={styles.resultTitle}>
              {quizResult.passed ? t('grammarQuiz.quizPassed') : t('grammarQuiz.keepPracticing')}
            </Text>
            <Text style={styles.resultTitleArabic}>
              {quizResult.passed ? 'أحسنت!' : 'استمر في التدريب!'}
            </Text>
          </View>

          {/* Stats */}
          <View style={styles.resultsStatsRow}>
            <View style={styles.resultStatBox}>
              <Text style={styles.resultStatValue}>{accuracy}%</Text>
              <Text style={styles.resultStatLabel}>{t('grammarQuiz.accuracy')}</Text>
            </View>
            <View style={styles.resultStatBox}>
              <Text style={styles.resultStatValue}>{correctCount}/{currentQuestions.length}</Text>
              <Text style={styles.resultStatLabel}>{t('grammarQuiz.correct')}</Text>
            </View>
            <View style={styles.resultStatBox}>
              <Text style={styles.resultStatValue}>{maxStreak}</Text>
              <Text style={styles.resultStatLabel}>{t('grammarQuiz.bestStreak')}</Text>
            </View>
            {quizResult.passed && (
              <View style={styles.resultStatBox}>
                <Text style={[styles.resultStatValue, styles.xpValue]}>+{quizResult.xpEarned}</Text>
                <Text style={styles.resultStatLabel}>{t('grammarQuiz.xpEarned')}</Text>
              </View>
            )}
          </View>

          {!quizResult.passed && (
            <Text style={styles.passMessage}>
              {t('grammarQuiz.scoreToPass', { score: DEFAULT_GRAMMAR_QUIZ_CONFIG.passingScore })}
            </Text>
          )}

          {/* Questions Review */}
          <View style={styles.reviewSection}>
            <Text style={styles.reviewTitle}>{t('grammarQuiz.reviewAllAnswers')}</Text>

            {currentQuestions.map((question, index) => {
              const answer = currentAnswers[index];
              const wasCorrect = answer?.isCorrect ?? false;

              let userAnswer = t('grammarQuiz.noAnswer');
              let correctAnswer = '';

              if (question.type === 'multiple_choice' && question.options) {
                const selectedOpt = question.options.find((o) => o.id === answer?.selectedAnswer);
                userAnswer = lc(selectedOpt?.text || '', selectedOpt?.textFr) || t('grammarQuiz.noAnswer');
                const correctOpt = question.options.find((o) => o.isCorrect);
                correctAnswer = lc(correctOpt?.text || '', correctOpt?.textFr) || '';
              } else {
                userAnswer = answer?.selectedAnswer || t('grammarQuiz.noAnswer');
                correctAnswer = Array.isArray(question.correctAnswer)
                  ? question.correctAnswer[0]
                  : question.correctAnswer;
              }

              return (
                <View key={question.id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <Ionicons
                      name={wasCorrect ? 'checkmark-circle' : 'close-circle'}
                      size={20}
                      color={wasCorrect ? '#22c55e' : '#ef4444'}
                    />
                    <Text style={styles.reviewQuestionNum}>{t('grammarQuiz.questionNumber', { number: index + 1 })}</Text>
                    <View style={styles.reviewLevelBadge}>
                      <Text style={styles.reviewLevelText}>{question.level}</Text>
                    </View>
                  </View>

                  <Text style={styles.reviewQuestion}>{lc(question.question, question.questionFr)}</Text>

                  {question.questionArabic && (
                    <View style={styles.reviewArabicRow}>
                      <Text style={styles.reviewQuestionArabic}>{question.questionArabic}</Text>
                      <Pressable
                        style={styles.audioButtonSmall}
                        onPress={() => playArabicAudio(question.questionArabic!)}
                      >
                        <Ionicons name="volume-high" size={16} color={color.sacred} />
                      </Pressable>
                    </View>
                  )}

                  <View style={styles.reviewAnswers}>
                    <View style={styles.reviewAnswerRow}>
                      <Text style={styles.reviewAnswerLabel}>{t('grammarQuiz.yourAnswer')}</Text>
                      <View style={styles.reviewAnswerContent}>
                        <Text style={[
                          styles.reviewAnswerValue,
                          wasCorrect ? styles.reviewAnswerCorrect : styles.reviewAnswerWrong
                        ]}>
                          {userAnswer}
                        </Text>
                        {/[\u0600-\u06FF]/.test(userAnswer) && (
                          <Pressable
                            style={styles.audioButtonMini}
                            onPress={() => playArabicAudio(userAnswer)}
                          >
                            <Ionicons name="volume-high" size={14} color={color.sacred} />
                          </Pressable>
                        )}
                      </View>
                    </View>

                    {!wasCorrect && (
                      <View style={styles.reviewAnswerRow}>
                        <Text style={styles.reviewAnswerLabel}>{t('grammarQuiz.correctAnswer')}</Text>
                        <View style={styles.reviewAnswerContent}>
                          <Text style={[styles.reviewAnswerValue, styles.reviewAnswerCorrect]}>
                            {correctAnswer}
                          </Text>
                          {/[\u0600-\u06FF]/.test(correctAnswer) && (
                            <Pressable
                              style={styles.audioButtonMini}
                              onPress={() => playArabicAudio(correctAnswer)}
                            >
                              <Ionicons name="volume-high" size={14} color={color.sacred} />
                            </Pressable>
                          )}
                        </View>
                      </View>
                    )}
                  </View>

                  {question.explanation && (
                    <View style={styles.reviewExplanationBox}>
                      <Text style={styles.reviewExplanation}>{lc(question.explanation, question.explanationFr)}</Text>
                      {/[\u0600-\u06FF]/.test(question.explanation) && (
                        <Pressable
                          style={styles.reviewListenButton}
                          onPress={() => {
                            // Extract the first Arabic phrase (words with spaces)
                            const phraseMatch = question.explanation.match(
                              /[\u0600-\u06FF]+(?:\s+[\u0600-\u06FF]+)*/
                            );
                            if (phraseMatch && phraseMatch[0]) {
                              const phrase = phraseMatch[0].trim();
                              if (phrase.length > 0) {
                                playArabicAudio(phrase);
                              }
                            }
                          }}
                        >
                          <Ionicons name="volume-high" size={14} color={color.sacred} />
                          <Text style={styles.reviewListenText}>{t('grammarQuiz.listen')}</Text>
                        </Pressable>
                      )}
                    </View>
                  )}
                </View>
              );
            })}
          </View>

          {/* Action Buttons */}
          <View style={styles.resultActions}>
            {quizResult.passed ? (
              <Pressable style={styles.startButton} onPress={generateNewQuiz}>
                <Text style={styles.startButtonText}>{t('grammarQuiz.newQuiz')}</Text>
              </Pressable>
            ) : (
              <Pressable style={styles.startButton} onPress={handleTryAgain}>
                <Text style={styles.startButtonText}>{t('grammarQuiz.tryAgain')}</Text>
              </Pressable>
            )}

            <Pressable style={styles.backTextButton} onPress={handleGoBack}>
              <Text style={styles.backTextButtonLabel}>{t('grammarQuiz.backToCommunity')}</Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.bg,
  },
  scrollContent: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    padding: 8,
    zIndex: 10,
  },
  loadingText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: color.text,
    marginTop: 20,
  },
  loadingSubtext: {
    fontSize: 14,
    color: color.textMuted,
    marginTop: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: color.text,
    marginTop: 20,
    textAlign: 'center',
  },
  titleArabic: {
    fontFamily: font.arabic,
    lineHeight: 37,
    fontSize: 22,
    color: color.sacred,
    marginTop: 8,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 14,
    color: color.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
  infoBox: {
    alignItems: 'center',
    marginBottom: 24,
  },
  featureList: {
    marginTop: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 14,
    color: color.textMuted,
    marginLeft: 10,
  },
  errorContainer: {
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 14,
    color: color.warning,
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: color.surfaceRaised,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: radius.sm,
  },
  retryButtonText: {
    fontSize: 14,
    color: color.text,
    fontWeight: '600',
  },
  attemptInfo: {
    alignItems: 'center',
    marginBottom: 32,
  },
  attemptText: {
    fontSize: 14,
    color: color.textMuted,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 24,
  },
  statBox: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: color.textFaint,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: color.text,
  },
  statValueHighlight: {
    fontSize: 20,
    fontWeight: 'bold',
    color: color.sacred,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: color.sacred,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: radius.md,
    gap: 8,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: color.textOnAccent,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  closeButton: {
    padding: 4,
  },
  headerText: {
    fontSize: 16,
    fontWeight: '600',
    color: color.text,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(249, 115, 22, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.md,
    gap: 4,
  },
  streakText: {
    fontSize: 14,
    fontWeight: '600',
    color: color.warning,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: color.surface,
    marginHorizontal: 20,
    borderRadius: 2,
  },
  progressBar: {
    height: '100%',
    backgroundColor: color.sacred,
    borderRadius: 2,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    gap: 6,
  },
  timerText: {
    fontSize: 16,
    fontWeight: '600',
    color: color.textMuted,
  },
  timerTextWarning: {
    color: color.danger,
  },
  questionContainer: {
    padding: 20,
  },
  levelBadge: {
    alignSelf: 'flex-start',
    backgroundColor: color.surfaceRaised,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 12,
  },
  levelBadgeText: {
    fontSize: 12,
    color: color.textMuted,
    textTransform: 'capitalize',
  },
  arabicQuestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: 12,
    gap: 12,
  },
  questionArabic: {
    fontFamily: font.arabic,
    fontSize: 24,
    color: color.sacred,
    textAlign: 'right',
    lineHeight: 36,
    flex: 1,
  },
  audioButton: {
    width: 44,
    height: 44,
    borderRadius: radius.xl,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  questionText: {
    fontSize: 18,
    color: color.text,
    lineHeight: 26,
  },
  hintBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    padding: 12,
    borderRadius: radius.sm,
    marginTop: 16,
    gap: 8,
  },
  hintText: {
    fontSize: 14,
    color: color.sacred,
    flex: 1,
  },
  optionsContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  optionButton: {
    backgroundColor: color.surface,
    padding: 16,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: color.border,
  },
  optionCorrect: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    borderColor: color.progress,
  },
  optionWrong: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: color.danger,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  optionText: {
    fontSize: 16,
    color: color.text,
    textAlign: 'center',
    flex: 1,
  },
  optionTextArabic: {
    fontFamily: font.arabic,
    fontSize: 26,
    lineHeight: 44,
    color: color.text,
    textAlign: 'center',
    writingDirection: 'rtl',
    flex: 1,
  },
  optionTextCorrect: {
    color: color.progress,
  },
  optionTextWrong: {
    color: color.danger,
  },
  optionAudioButton: {
    width: 36,
    height: 36,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fillBlankContainer: {
    paddingHorizontal: 20,
  },
  sentenceTemplate: {
    backgroundColor: color.surface,
    borderRadius: radius.md,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: color.border,
  },
  templateText: {
    fontSize: 22,
    color: color.sacred,
    textAlign: 'center',
    lineHeight: 34,
    writingDirection: 'rtl',
  },
  blankIndicator: {
    color: color.accentStrong,
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    fontSize: 22,
    paddingHorizontal: 4,
  },
  fillBlankInput: {
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.border,
    borderRadius: radius.md,
    padding: 16,
    fontSize: 18,
    color: color.text,
    textAlign: 'center',
  },
  inputCorrect: {
    borderColor: color.progress,
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
  },
  inputWrong: {
    borderColor: color.danger,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  submitButton: {
    backgroundColor: color.accentStrong,
    padding: 16,
    borderRadius: radius.md,
    marginTop: 16,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: color.surfaceRaised,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: color.text,
  },
  correctAnswerBox: {
    marginTop: 16,
    padding: 12,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderRadius: radius.sm,
    alignItems: 'center',
  },
  correctAnswerLabel: {
    fontSize: 12,
    color: color.textMuted,
    marginBottom: 4,
  },
  correctAnswerText: {
    fontSize: 18,
    color: color.progress,
    fontWeight: '600',
  },
  correctAnswerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  audioButtonSmall: {
    width: 32,
    height: 32,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedbackContainer: {
    padding: 20,
  },
  feedbackBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: radius.md,
    gap: 8,
    marginBottom: 16,
  },
  feedbackCorrect: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
  },
  feedbackWrong: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  feedbackText: {
    fontSize: 18,
    fontWeight: '600',
  },
  feedbackTextCorrect: {
    color: color.progress,
  },
  feedbackTextWrong: {
    color: color.danger,
  },
  explanationCard: {
    backgroundColor: color.surface,
    borderRadius: radius.md,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: color.border,
  },
  explanationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  explanationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: color.sacred,
  },
  explanationText: {
    fontSize: 15,
    color: color.text,
    lineHeight: 22,
  },
  listenButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.5)',
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderRadius: radius.md,
    marginTop: 12,
    gap: 8,
  },
  listenButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: color.sacred,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: color.sacred,
    paddingVertical: 17,
    borderRadius: radius.lg,
    marginTop: 4,
    marginHorizontal: 24,
    shadowColor: color.sacred,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 6,
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: '800',
    color: color.textOnAccent,
  },
  resultsScroll: {
    padding: 20,
    paddingBottom: 40,
  },
  resultHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: color.text,
    marginTop: 16,
  },
  resultTitleArabic: {
    fontFamily: font.arabic,
    lineHeight: 34,
    fontSize: 20,
    color: color.sacred,
    marginTop: 4,
  },
  resultsStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: color.surface,
    borderRadius: radius.lg,
    padding: 20,
    marginBottom: 16,
  },
  resultStatBox: {
    alignItems: 'center',
  },
  resultStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: color.text,
  },
  xpValue: {
    color: color.sacred,
  },
  resultStatLabel: {
    fontSize: 12,
    color: color.textMuted,
    marginTop: 4,
  },
  passMessage: {
    fontSize: 14,
    color: color.textMuted,
    textAlign: 'center',
    marginBottom: 20,
  },
  reviewSection: {
    marginTop: 8,
  },
  reviewTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: color.text,
    marginBottom: 16,
  },
  reviewCard: {
    backgroundColor: color.surface,
    borderRadius: radius.md,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: color.border,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  reviewQuestionNum: {
    fontSize: 14,
    fontWeight: '600',
    color: color.textMuted,
    flex: 1,
  },
  reviewLevelBadge: {
    backgroundColor: color.surfaceRaised,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  reviewLevelText: {
    fontSize: 10,
    color: color.textMuted,
    textTransform: 'capitalize',
  },
  reviewQuestion: {
    fontSize: 15,
    color: color.text,
    marginBottom: 8,
    lineHeight: 22,
  },
  reviewArabicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: 12,
    gap: 8,
  },
  reviewQuestionArabic: {
    fontFamily: font.arabic,
    lineHeight: 27,
    fontSize: 16,
    color: color.sacred,
    textAlign: 'right',
    flex: 1,
  },
  reviewAnswers: {
    marginTop: 8,
  },
  reviewAnswerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  reviewAnswerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  audioButtonMini: {
    width: 26,
    height: 26,
    borderRadius: radius.md,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewAnswerLabel: {
    fontSize: 13,
    color: color.textFaint,
    marginRight: 8,
  },
  reviewAnswerValue: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  reviewAnswerCorrect: {
    color: color.progress,
  },
  reviewAnswerWrong: {
    color: color.danger,
  },
  reviewExplanationBox: {
    marginTop: 12,
    padding: 10,
    backgroundColor: color.bg,
    borderRadius: radius.sm,
  },
  reviewExplanation: {
    fontSize: 13,
    color: color.textMuted,
    lineHeight: 20,
  },
  reviewListenButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    marginTop: 10,
    gap: 6,
  },
  reviewListenText: {
    fontSize: 12,
    fontWeight: '600',
    color: color.sacred,
  },
  resultActions: {
    marginTop: 24,
    gap: 12,
  },
  backTextButton: {
    alignItems: 'center',
    padding: 12,
  },
  backTextButtonLabel: {
    fontSize: 14,
    color: color.textMuted,
  },
});

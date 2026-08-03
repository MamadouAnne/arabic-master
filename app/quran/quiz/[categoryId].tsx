import { View, Text, ScrollView, Pressable, StyleSheet, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocalizedContent } from '../../../src/hooks/useLocalizedContent';
import { getRandomQuestions, getCategoryById, getQuestionsBySet, getTotalSets, getSetName } from '../../../src/data/arabic/quran/quizzes';
import { QuizQuestion, QuizCategory, QuizAnswer } from '../../../src/types/quran';
import { useArabicSpeech } from '../../../src/hooks/useArabicSpeech';

// Helper function to extract Arabic text from a string (removes English part)
const extractArabicText = (text: string): string => {
  if (!text) return '';
  // If text contains both Arabic and English (separated by \n or -), extract Arabic
  const lines = text.split('\n');
  for (const line of lines) {
    // Check if line contains Arabic characters
    if (/[\u0600-\u06FF]/.test(line)) {
      // Remove English translations after " - "
      const arabicPart = line.split(' - ')[0].trim();
      return arabicPart;
    }
  }
  // Return original if no Arabic found
  return text;
};

// Helper to check if text contains Arabic
const hasArabicText = (text: string): boolean => {
  return /[\u0600-\u06FF]/.test(text);
};

// Helper to check if text contains English (Latin characters)
const hasEnglishText = (text: string): boolean => {
  return /[a-zA-Z]/.test(text);
};

// Helper to check if text is just letters/numbers (not readable phrases)
const isJustLettersOrNumbers = (text: string): boolean => {
  if (!text) return true;

  // Extract just the Arabic part
  const arabicPart = text.split(' - ')[0].trim();

  // Check if it's Arabic numerals with a word (like "٦ حُرُوفٍ")
  if (/^[٠-٩\d]+\s/.test(arabicPart)) return true;

  // Check if it's just single letters separated by spaces (like "ء هـ ع ح غ خ")
  const words = arabicPart.split(/\s+/);
  if (words.length > 2 && words.every(w => w.length <= 2)) return true;

  // Check if it's a short list of letters (like "ق ط ب ج د")
  if (/^[\u0621-\u064A\s]+$/.test(arabicPart) && words.length >= 3 && words.every(w => w.length === 1)) return true;

  return false;
};

// Helper to check if answer is a "number of letters" type and extract just the number
const extractNumberFromAnswer = (text: string): { isNumberAnswer: boolean; number: string } => {
  if (!text) return { isNumberAnswer: false, number: '' };

  // Match patterns like "٦ حُرُوفٍ - 6 letters" or "١٥ حَرْفًا - 15 letters"
  const arabicNumMatch = text.match(/^([٠-٩]+)\s+حُ?رُ?و?فٍ?|حَرْفً?ا?/);
  if (arabicNumMatch) {
    // Extract the Arabic numeral
    const numMatch = text.match(/^([٠-٩]+)/);
    if (numMatch) {
      return { isNumberAnswer: true, number: numMatch[1] };
    }
  }

  // Match English number pattern "X letters"
  const englishNumMatch = text.match(/(\d+)\s+letters?/i);
  if (englishNumMatch) {
    return { isNumberAnswer: true, number: englishNumMatch[1] };
  }

  // Check for "حَرْفٌ وَاحِدٌ" (one letter)
  if (text.includes('حَرْفٌ وَاحِدٌ') || text.includes('1 letter') || text.includes('one letter')) {
    return { isNumberAnswer: true, number: '1' };
  }

  return { isNumberAnswer: false, number: '' };
};

// Helper to split option into Arabic and English parts
const splitOptionText = (text: string): { arabic: string; english: string | null } => {
  if (!text) return { arabic: '', english: null };

  const hasArabic = hasArabicText(text);
  const hasEnglish = hasEnglishText(text);

  // If has both Arabic and English with " - " separator
  if (hasArabic && hasEnglish && text.includes(' - ')) {
    const parts = text.split(' - ');
    if (parts.length >= 2) {
      const firstPart = parts[0].trim();
      const secondPart = parts.slice(1).join(' - ').trim();

      // Determine which part is Arabic and which is English
      if (hasArabicText(firstPart) && hasEnglishText(secondPart)) {
        return { arabic: firstPart, english: secondPart };
      } else if (hasEnglishText(firstPart) && hasArabicText(secondPart)) {
        return { arabic: secondPart, english: firstPart };
      }
    }
  }

  // If has both but separated by newline
  if (hasArabic && hasEnglish && text.includes('\n')) {
    const lines = text.split('\n');
    const arabicLines = lines.filter(l => hasArabicText(l.trim())).join(' ').trim();
    const englishLines = lines.filter(l => hasEnglishText(l.trim()) && !hasArabicText(l.trim())).join(' ').trim();
    if (arabicLines && englishLines) {
      return { arabic: arabicLines, english: englishLines };
    }
  }

  // Arabic only
  if (hasArabic && !hasEnglish) {
    return { arabic: text, english: null };
  }

  // English only
  if (hasEnglish && !hasArabic) {
    return { arabic: '', english: text };
  }

  // Mixed without clear separator - treat as Arabic
  return { arabic: text, english: null };
};

// Helper to extract English-only text from a question (removes Arabic lines)
const getEnglishOnly = (text: string): string => {
  if (!text) return '';
  const lines = text.split('\n');

  // Find lines that START with English (Latin letter) - these are the English translations
  const englishLines = lines.filter(line => {
    const trimmed = line.trim();
    if (!trimmed) return false;
    // Line starts with English letter or common English patterns
    return /^[A-Za-z"'(]/.test(trimmed) || trimmed.startsWith('In ') || trimmed.startsWith('What ') || trimmed.startsWith('How ') || trimmed.startsWith('Which ');
  });

  return englishLines.join('\n') || text;
};

const PASSING_SCORE = 70; // Percentage required to pass and unlock next set

export default function QuizScreen() {
  const { t } = useTranslation();
  const { lc } = useLocalizedContent();
  const { categoryId, setIndex } = useLocalSearchParams<{ categoryId: string; setIndex?: string }>();
  const category = getCategoryById(categoryId as QuizCategory);
  const { speak, stop, isSpeaking } = useArabicSpeech();

  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [quizComplete, setQuizComplete] = useState(false);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [playingText, setPlayingText] = useState<string | null>(null);
  const [showReview, setShowReview] = useState(false);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const totalSets = categoryId ? getTotalSets(categoryId as QuizCategory) : 1;

  // Audio playback handler
  const handlePlayAudio = async (text: string) => {
    if (isSpeaking && playingText === text) {
      // Stop if same text is playing
      await stop();
      setPlayingText(null);
    } else {
      // Stop any current playback and play new text
      await stop();
      setPlayingText(text);
      const arabicText = extractArabicText(text);
      if (arabicText) {
        await speak(arabicText);
        setPlayingText(null);
      }
    }
  };

  useEffect(() => {
    if (categoryId) {
      // Start at specified set index if provided, otherwise start at 0
      const initialSetIndex = setIndex ? parseInt(setIndex, 10) : 0;
      loadSetQuestions(initialSetIndex);
    }
  }, [categoryId, setIndex]);

  const loadSetQuestions = (setIndex: number) => {
    const quizQuestions = getQuestionsBySet(categoryId as QuizCategory, setIndex);
    // Shuffle questions within the set
    const shuffled = [...quizQuestions].sort(() => Math.random() - 0.5);
    setQuestions(shuffled);
    setCurrentSetIndex(setIndex);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setAnswers([]);
    setQuizComplete(false);
    setShowReview(false);
    setStartTime(Date.now());
    setQuestionStartTime(Date.now());
  };

  if (!category || questions.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>{t('quranQuiz.loadingQuiz')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentQuestion = questions[currentIndex];
  const score = answers.filter(a => a.isCorrect).length;
  const progress = ((currentIndex + 1) / questions.length) * 100;

  const handleSelectAnswer = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const handleNext = () => {
    if (!selectedAnswer) return;

    // Save the answer
    const timeSpent = (Date.now() - questionStartTime) / 1000;
    const answer: QuizAnswer = {
      questionId: currentQuestion.id,
      userAnswer: selectedAnswer,
      isCorrect: selectedAnswer === currentQuestion.correctAnswer,
      timeSpent,
    };
    setAnswers([...answers, answer]);

    if (currentIndex < questions.length - 1) {
      // Animate transition
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();

      setTimeout(() => {
        setCurrentIndex(currentIndex + 1);
        setSelectedAnswer(null);
        setQuestionStartTime(Date.now());
      }, 150);
    } else {
      setQuizComplete(true);
    }
  };

  const handleRestart = () => {
    // Restart the same set
    loadSetQuestions(currentSetIndex);
  };

  const handleNextSet = () => {
    if (currentSetIndex < totalSets - 1) {
      loadSetQuestions(currentSetIndex + 1);
    }
  };

  const getOptionStyle = (option: string) => {
    return selectedAnswer === option ? styles.optionSelected : styles.option;
  };

  const getOptionTextStyle = (option: string) => {
    return selectedAnswer === option ? styles.optionTextSelected : styles.optionText;
  };

  // Quiz Complete Screen
  if (quizComplete) {
    const totalTime = Math.round((Date.now() - startTime) / 1000);
    const percentage = Math.round((score / questions.length) * 100);
    const passed = percentage >= PASSING_SCORE;
    const hasNextSet = currentSetIndex < totalSets - 1;
    const currentSetName = getSetName(categoryId as QuizCategory, currentSetIndex);

    // Helper to get user's answer for a question
    const getUserAnswer = (questionId: string) => {
      return answers.find(a => a.questionId === questionId);
    };

    return (
      <SafeAreaView style={styles.container}>
        {/* Header for results */}
        <View style={styles.reviewHeader}>
          <Pressable style={styles.closeButton} onPress={() => router.back()}>
            <Ionicons name="close" size={24} color="#ffffff" />
          </Pressable>
          <Text style={styles.reviewHeaderTitle}>
            {showReview ? t('quranQuiz.reviewAnswers') : t('quranQuiz.results')}
          </Text>
          <Pressable
            style={styles.reviewToggleBtn}
            onPress={() => setShowReview(!showReview)}
          >
            <Ionicons
              name={showReview ? 'stats-chart' : 'list'}
              size={20}
              color="#10b981"
            />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.resultContainer}>
          {!showReview ? (
            /* Summary View */
            <View style={styles.resultCard}>
              <View style={[styles.resultIcon, { backgroundColor: passed ? '#10b98120' : '#ef444420' }]}>
                <Ionicons
                  name={passed ? 'trophy' : 'refresh'}
                  size={40}
                  color={passed ? '#10b981' : '#ef4444'}
                />
              </View>

              <Text style={styles.resultTitle}>
                {passed ? t('quranQuiz.passed') : percentage >= 50 ? t('quranQuiz.almostThere') : t('quranQuiz.keepLearning')}
              </Text>

              <Text style={styles.resultCategory}>{lc(category.nameEnglish, category.nameFrench)}</Text>
              <View style={styles.resultSetRow}>
                <Text style={styles.resultSetName}>{currentSetName}</Text>
                {totalSets > 1 && (
                  <Text style={styles.resultSetProgress}>({currentSetIndex + 1}/{totalSets})</Text>
                )}
              </View>

              <View style={[styles.scoreCircle, { borderColor: passed ? '#10b981' : '#ef4444' }]}>
                <Text style={[styles.scorePercentage, { color: passed ? '#10b981' : '#ef4444' }]}>{percentage}%</Text>
                <Text style={styles.scoreLabel}>{passed ? t('quranQuiz.passed') : `${t('quranQuiz.need')} ${PASSING_SCORE}%`}</Text>
              </View>

              <View style={styles.resultStats}>
                <View style={styles.resultStat}>
                  <Ionicons name="checkmark-circle" size={22} color="#10b981" />
                  <Text style={styles.resultStatValue}>{score}</Text>
                  <Text style={styles.resultStatLabel}>{t('common.correct')}</Text>
                </View>
                <View style={styles.resultStat}>
                  <Ionicons name="close-circle" size={22} color="#ef4444" />
                  <Text style={styles.resultStatValue}>{questions.length - score}</Text>
                  <Text style={styles.resultStatLabel}>{t('common.wrong')}</Text>
                </View>
                <View style={styles.resultStat}>
                  <Ionicons name="time" size={22} color="#3b82f6" />
                  <Text style={styles.resultStatValue}>{totalTime}s</Text>
                  <Text style={styles.resultStatLabel}>{t('quranQuiz.time')}</Text>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.resultActions}>
                {/* Primary row: Try Again + Next */}
                <View style={styles.primaryButtonRow}>
                  <Pressable style={styles.tryAgainBtn} onPress={handleRestart}>
                    <Ionicons name="refresh" size={16} color="#ffffff" />
                    <Text style={styles.tryAgainBtnText}>{t('common.tryAgain')}</Text>
                  </Pressable>
                  {hasNextSet && (
                    <Pressable
                      style={[styles.nextSetBtn, !passed && styles.nextSetBtnDisabled]}
                      onPress={handleNextSet}
                      disabled={!passed}
                    >
                      <Text style={[styles.nextSetBtnText, !passed && styles.nextSetBtnTextDisabled]}>{t('common.next')}</Text>
                      <Ionicons name="arrow-forward" size={16} color={passed ? '#ffffff' : '#64748b'} />
                    </Pressable>
                  )}
                </View>

                {/* View Answers */}
                <Pressable
                  style={styles.viewAnswersButton}
                  onPress={() => setShowReview(true)}
                >
                  <Ionicons name="list" size={16} color="#10b981" />
                  <Text style={styles.viewAnswersButtonText}>{t('quranQuiz.viewAllAnswers')}</Text>
                </Pressable>

                {/* Back */}
                <Pressable style={styles.backButton} onPress={() => router.back()}>
                  <Text style={styles.backButtonText}>{t('quranQuiz.backToCategories')}</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            /* Review Answers View */
            <View style={styles.reviewContainer}>
              {/* Return button and Summary bar */}
              <View style={styles.reviewTopBar}>
                <Pressable
                  style={styles.returnButton}
                  onPress={() => setShowReview(false)}
                >
                  <Ionicons name="arrow-back" size={16} color="#64748b" />
                  <Text style={styles.returnButtonText}>{t('quranQuiz.backToSummary')}</Text>
                </Pressable>
                <Text style={styles.reviewSummaryText}>
                  {score}/{questions.length} ({percentage}%)
                </Text>
              </View>

              {/* Questions Review */}
              {questions.map((question, index) => {
                const userAnswer = getUserAnswer(question.id);
                const isAnswerCorrect = userAnswer?.isCorrect ?? false;
                // Map English answers to French equivalents for display
                const correctAnswerStr = String(question.correctAnswer);
                const correctAnswerIndex = question.options?.indexOf(correctAnswerStr) ?? -1;
                const displayCorrectAnswer = correctAnswerIndex >= 0
                  ? lc(correctAnswerStr, question.optionsFr?.[correctAnswerIndex])
                  : correctAnswerStr;
                const userAnswerStr = userAnswer?.userAnswer ? String(userAnswer.userAnswer) : '';
                const userAnswerIndex = userAnswerStr ? (question.options?.indexOf(userAnswerStr) ?? -1) : -1;
                const displayUserAnswer = userAnswerStr && userAnswerIndex >= 0
                  ? lc(userAnswerStr, question.optionsFr?.[userAnswerIndex])
                  : userAnswerStr;
                const { arabic: correctArabic, english: correctEnglish } = splitOptionText(displayCorrectAnswer);
                const userAnswerSplit = userAnswer ? splitOptionText(displayUserAnswer) : null;
                const userNumberAnswer = userAnswer ? extractNumberFromAnswer(displayUserAnswer) : { isNumberAnswer: false, number: '' };
                const correctNumberAnswer = extractNumberFromAnswer(displayCorrectAnswer);

                return (
                  <View
                    key={question.id}
                    style={[
                      styles.reviewItem,
                      isAnswerCorrect ? styles.reviewItemCorrect : styles.reviewItemWrong
                    ]}
                  >
                    {/* Question number and status */}
                    <View style={styles.reviewItemHeader}>
                      <View style={styles.reviewQuestionNum}>
                        <Text style={styles.reviewQuestionNumText}>{t('quranQuiz.questionNumber', { number: index + 1 })}</Text>
                      </View>
                      <Ionicons
                        name={isAnswerCorrect ? 'checkmark-circle' : 'close-circle'}
                        size={20}
                        color={isAnswerCorrect ? '#10b981' : '#ef4444'}
                      />
                    </View>

                    {/* Question */}
                    {question.questionArabic && (
                      <Text style={styles.reviewQuestionArabic}>{question.questionArabic}</Text>
                    )}
                    <Text style={styles.reviewQuestionEnglish}>
                      {getEnglishOnly(lc(question.question, question.questionFr))}
                    </Text>

                    {/* Your Answer */}
                    <View style={styles.reviewAnswerSection}>
                      <Text style={styles.reviewAnswerLabel}>{t('quranQuiz.yourAnswer')}</Text>
                      <View style={[
                        styles.reviewAnswerBox,
                        isAnswerCorrect ? styles.reviewAnswerCorrect : styles.reviewAnswerWrong
                      ]}>
                        {userNumberAnswer.isNumberAnswer ? (
                          <View style={styles.reviewNumberAnswer}>
                            <Text style={styles.reviewNumberText}>{userNumberAnswer.number}</Text>
                            {userAnswerSplit?.english && (
                              <Text style={styles.reviewAnswerEnglish}>{userAnswerSplit.english}</Text>
                            )}
                          </View>
                        ) : (
                          <>
                            {userAnswerSplit?.arabic && (
                              <Text style={styles.reviewAnswerArabic}>{userAnswerSplit.arabic}</Text>
                            )}
                            {userAnswerSplit?.english && (
                              <Text style={styles.reviewAnswerEnglish}>{userAnswerSplit.english}</Text>
                            )}
                          </>
                        )}
                      </View>
                    </View>

                    {/* Correct Answer (if wrong) */}
                    {!isAnswerCorrect && (
                      <View style={styles.reviewAnswerSection}>
                        <Text style={styles.reviewAnswerLabel}>{t('quranQuiz.correctAnswer')}</Text>
                        <View style={[styles.reviewAnswerBox, styles.reviewAnswerCorrect]}>
                          {correctNumberAnswer.isNumberAnswer ? (
                            <View style={styles.reviewNumberAnswer}>
                              <Text style={styles.reviewNumberText}>{correctNumberAnswer.number}</Text>
                              {correctEnglish && (
                                <Text style={styles.reviewAnswerEnglish}>{correctEnglish}</Text>
                              )}
                            </View>
                          ) : (
                            <>
                              {correctArabic && (
                                <Text style={styles.reviewAnswerArabic}>{correctArabic}</Text>
                              )}
                              {correctEnglish && (
                                <Text style={styles.reviewAnswerEnglish}>{correctEnglish}</Text>
                              )}
                            </>
                          )}
                        </View>
                      </View>
                    )}

                    {/* Explanation */}
                    {question.explanation && (
                      <View style={styles.reviewExplanation}>
                        <Ionicons name="bulb" size={14} color="#f59e0b" />
                        <Text style={styles.reviewExplanationText}>{lc(question.explanation, question.explanationFr)}</Text>
                      </View>
                    )}
                  </View>
                );
              })}

              {/* Bottom actions */}
              <View style={styles.reviewBottomActions}>
                <Pressable style={styles.restartButton} onPress={handleRestart}>
                  <Ionicons name="refresh" size={16} color="#ffffff" />
                  <Text style={styles.restartButtonText}>{t('common.tryAgain')}</Text>
                </Pressable>
                {hasNextSet && (
                  <Pressable
                    style={[styles.nextSetButton, !passed && styles.nextSetButtonDisabled]}
                    onPress={handleNextSet}
                    disabled={!passed}
                  >
                    <Text style={[styles.nextSetButtonText, !passed && styles.nextSetButtonTextDisabled]}>{t('common.next')}</Text>
                    <Ionicons name="arrow-forward" size={16} color={passed ? '#ffffff' : '#64748b'} />
                  </Pressable>
                )}
              </View>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.closeButton} onPress={() => router.back()}>
          <Ionicons name="close" size={24} color="#ffffff" />
        </Pressable>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {currentIndex + 1}/{questions.length}
          </Text>
        </View>
        <View style={styles.scoreContainer}>
          <Ionicons name="star" size={16} color="#f59e0b" />
          <Text style={styles.scoreText}>{score}</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Category Badge */}
          <View style={styles.badgeRow}>
            <View style={[styles.categoryBadge, { backgroundColor: `${category.color}20` }]}>
              <Ionicons name={category.icon as any} size={16} color={category.color} />
              <Text style={[styles.categoryBadgeText, { color: category.color }]}>
                {lc(category.nameEnglish, category.nameFrench)}
              </Text>
            </View>
            {totalSets > 1 && (
              <View style={styles.setBadge}>
                <Text style={styles.setBadgeText}>
                  {getSetName(categoryId as QuizCategory, currentSetIndex)}
                </Text>
              </View>
            )}
            {totalSets > 1 && (
              <View style={styles.setProgressBadge}>
                <Text style={styles.setProgressText}>
                  {currentSetIndex + 1}/{totalSets}
                </Text>
              </View>
            )}
          </View>

          {/* Question Card */}
          <View style={styles.questionCard}>
            <Text style={styles.difficultyBadge}>
              {currentQuestion.difficulty.toUpperCase()}
            </Text>

            {/* Arabic Question */}
            {currentQuestion.questionArabic && (
              <View style={styles.arabicQuestionBox}>
                <Text style={styles.questionArabic}>{currentQuestion.questionArabic}</Text>
                <Pressable
                  style={[
                    styles.questionAudioBtn,
                    isSpeaking && playingText === currentQuestion.questionArabic && styles.questionAudioBtnActive
                  ]}
                  onPress={() => handlePlayAudio(currentQuestion.questionArabic || '')}
                >
                  <Ionicons
                    name={isSpeaking && playingText === currentQuestion.questionArabic ? 'stop' : 'volume-high'}
                    size={12}
                    color={isSpeaking && playingText === currentQuestion.questionArabic ? '#ffffff' : '#10b981'}
                  />
                </Pressable>
              </View>
            )}

            {/* English Question */}
            <Text style={styles.questionTextEnglish}>
              {currentQuestion.questionArabic
                ? getEnglishOnly(lc(currentQuestion.question, currentQuestion.questionFr))
                : lc(currentQuestion.question, currentQuestion.questionFr)}
            </Text>
          </View>

          {/* Options */}
          <View style={styles.optionsContainer}>
            {currentQuestion.options?.map((option, index) => {
              const displayOption = lc(option, currentQuestion.optionsFr?.[index]);
              const { arabic, english } = splitOptionText(displayOption);
              const showAudio = hasArabicText(displayOption) && !isJustLettersOrNumbers(displayOption);
              const { isNumberAnswer, number } = extractNumberFromAnswer(displayOption);

              return (
                <Pressable
                  key={index}
                  style={getOptionStyle(option)}
                  onPress={() => handleSelectAnswer(option)}
                >
                  <View style={styles.optionLetter}>
                    <Text style={styles.optionLetterText}>
                      {String.fromCharCode(65 + index)}
                    </Text>
                  </View>

                  {/* Option Content */}
                  <View style={styles.optionContent}>
                    {isNumberAnswer ? (
                      /* Number answer - show just the number with English label */
                      <View style={styles.numberAnswerRow}>
                        <Text style={styles.numberAnswerText}>{number}</Text>
                        {english && (
                          <Text style={styles.numberAnswerLabel}>{english}</Text>
                        )}
                      </View>
                    ) : arabic ? (
                      <>
                        <View style={styles.optionArabicRow}>
                          <Text style={styles.optionArabicText}>{arabic}</Text>
                          {showAudio && (
                            <Pressable
                              style={[
                                styles.tinyAudioBtn,
                                isSpeaking && playingText === option && styles.tinyAudioBtnActive
                              ]}
                              onPress={(e) => {
                                e.stopPropagation();
                                handlePlayAudio(option);
                              }}
                            >
                              <Ionicons
                                name={isSpeaking && playingText === option ? 'stop' : 'volume-high'}
                                size={10}
                                color={isSpeaking && playingText === option ? '#ffffff' : '#10b981'}
                              />
                            </Pressable>
                          )}
                        </View>
                        {english && (
                          <Text style={styles.optionEnglishText}>{english}</Text>
                        )}
                      </>
                    ) : (
                      <Text style={styles.optionEnglishOnly}>{english}</Text>
                    )}
                  </View>

                </Pressable>
              );
            })}
          </View>
        </Animated.View>
      </ScrollView>

      {/* Action Button */}
      <View style={styles.actionContainer}>
        <Pressable
          style={[styles.nextButton, !selectedAnswer && styles.nextButtonDisabled]}
          onPress={handleNext}
          disabled={!selectedAnswer}
        >
          <Text style={styles.nextButtonText}>
            {currentIndex < questions.length - 1 ? t('common.next') : t('quranQuiz.finish')}
          </Text>
          <Ionicons name="arrow-forward" size={18} color="#ffffff" />
        </Pressable>
      </View>
    </SafeAreaView>
  );
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  closeButton: {
    padding: 8,
  },
  progressContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#334155',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 4,
  },
  progressText: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '600',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#1e293b',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  scoreText: {
    color: '#f59e0b',
    fontSize: 14,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  setBadge: {
    backgroundColor: '#f59e0b20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  setBadgeText: {
    color: '#f59e0b',
    fontSize: 12,
    fontWeight: '600',
  },
  setProgressBadge: {
    backgroundColor: '#3b82f620',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  setProgressText: {
    color: '#3b82f6',
    fontSize: 12,
    fontWeight: '700',
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  questionCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  difficultyBadge: {
    color: '#64748b',
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 8,
  },
  questionText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
  },
  questionTextEnglish: {
    color: '#94a3b8',
    fontSize: 14,
    lineHeight: 20,
  },
  questionArabic: {
    color: '#10b981',
    fontSize: 20,
    textAlign: 'center',
    lineHeight: 30,
  },
  arabicQuestionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0f172a',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 10,
    gap: 8,
  },
  questionAudioBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#10b98120',
    alignItems: 'center',
    justifyContent: 'center',
  },
  questionAudioBtnActive: {
    backgroundColor: '#10b981',
  },
  inlineAudioBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inlineAudioBtnActive: {
    backgroundColor: '#10b981',
  },
  optionsContainer: {
    gap: 10,
  },
  optionContent: {
    flex: 1,
  },
  optionArabicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  optionArabicText: {
    color: '#10b981',
    fontSize: 18,
    lineHeight: 28,
    textAlign: 'right',
  },
  optionEnglishText: {
    color: '#94a3b8',
    fontSize: 13,
    marginTop: 2,
  },
  optionEnglishOnly: {
    color: '#ffffff',
    fontSize: 15,
  },
  numberAnswerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  numberAnswerText: {
    color: '#10b981',
    fontSize: 28,
    fontWeight: 'bold',
  },
  numberAnswerLabel: {
    color: '#94a3b8',
    fontSize: 14,
  },
  tinyAudioBtn: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#10b98120',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tinyAudioBtnActive: {
    backgroundColor: '#10b981',
  },
  option: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionSelected: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#3b82f6',
  },
  optionCorrect: {
    flex: 1,
    backgroundColor: '#10b98120',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#10b981',
  },
  optionWrong: {
    flex: 1,
    backgroundColor: '#ef444420',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ef4444',
  },
  optionLetter: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  optionLetterText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: 'bold',
  },
  optionText: {
    flex: 1,
    color: '#ffffff',
    fontSize: 16,
  },
  optionTextSelected: {
    flex: 1,
    color: '#3b82f6',
    fontSize: 16,
    fontWeight: '600',
  },
  optionTextCorrect: {
    flex: 1,
    color: '#10b981',
    fontSize: 16,
    fontWeight: '600',
  },
  optionTextWrong: {
    flex: 1,
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
  },
  explanationCard: {
    marginTop: 20,
    borderRadius: 16,
    padding: 16,
  },
  explanationCorrect: {
    backgroundColor: '#10b98115',
    borderWidth: 1,
    borderColor: '#10b98130',
  },
  explanationWrong: {
    backgroundColor: '#f59e0b15',
    borderWidth: 1,
    borderColor: '#f59e0b30',
  },
  explanationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  explanationTitle: {
    flex: 1,
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  explanationContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  explanationText: {
    flex: 1,
    color: '#94a3b8',
    fontSize: 14,
    lineHeight: 22,
  },
  actionContainer: {
    padding: 20,
    paddingBottom: 32,
  },
  confirmButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: '#334155',
  },
  confirmButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    backgroundColor: '#10b981',
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  nextButtonDisabled: {
    backgroundColor: '#334155',
  },
  nextButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  // Result Screen Styles
  resultContainer: {
    flexGrow: 1,
    padding: 16,
  },
  resultCard: {
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  resultIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  resultCategory: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 24,
  },
  scoreCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 3,
    borderColor: '#10b981',
  },
  scorePercentage: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#10b981',
  },
  scoreLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  resultStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  resultStat: {
    alignItems: 'center',
  },
  resultStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 6,
  },
  resultStatLabel: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  resultActions: {
    width: '100%',
    gap: 10,
  },
  primaryButtonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  tryAgainBtn: {
    flex: 1,
    backgroundColor: '#10b981',
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  tryAgainBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  nextSetBtn: {
    flex: 1,
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  nextSetBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  nextSetBtnDisabled: {
    backgroundColor: '#334155',
  },
  nextSetBtnTextDisabled: {
    color: '#64748b',
  },
  restartButton: {
    flex: 1,
    backgroundColor: '#10b981',
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  restartButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  backButton: {
    backgroundColor: '#334155',
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  backButtonText: {
    color: '#64748b',
    fontSize: 15,
    fontWeight: '600',
  },
  resultSetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  resultSetName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f59e0b',
  },
  resultSetProgress: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3b82f6',
  },
  nextSetButton: {
    flex: 1,
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  nextSetButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  nextSetButtonDisabled: {
    backgroundColor: '#334155',
  },
  nextSetButtonTextDisabled: {
    color: '#64748b',
  },
  retryButton: {
    backgroundColor: '#10b98120',
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  retryButtonText: {
    color: '#10b981',
    fontSize: 16,
    fontWeight: '600',
  },
  // Review Styles
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  reviewHeaderTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  reviewToggleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#10b98120',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewAnswersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#10b98115',
    borderWidth: 1,
    borderColor: '#10b98130',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 16,
    width: '100%',
  },
  viewAnswersButtonText: {
    color: '#10b981',
    fontSize: 15,
    fontWeight: '600',
  },
  reviewContainer: {
    paddingBottom: 20,
  },
  reviewTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  returnButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  returnButtonText: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '500',
  },
  reviewSummaryText: {
    color: '#10b981',
    fontSize: 14,
    fontWeight: '600',
  },
  nextQuestionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  nextQuestionBtnText: {
    color: '#3b82f6',
    fontSize: 13,
    fontWeight: '600',
  },
  reviewItem: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  reviewItemCorrect: {
    borderLeftColor: '#10b981',
  },
  reviewItemWrong: {
    borderLeftColor: '#ef4444',
  },
  reviewItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  reviewQuestionNum: {
    backgroundColor: '#334155',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  reviewQuestionNumText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },
  reviewQuestionArabic: {
    color: '#10b981',
    fontSize: 17,
    lineHeight: 26,
    marginBottom: 4,
  },
  reviewQuestionEnglish: {
    color: '#94a3b8',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  reviewAnswerSection: {
    marginBottom: 10,
  },
  reviewAnswerLabel: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  reviewAnswerBox: {
    borderRadius: 8,
    padding: 10,
  },
  reviewAnswerCorrect: {
    backgroundColor: '#10b98115',
    borderWidth: 1,
    borderColor: '#10b98130',
  },
  reviewAnswerWrong: {
    backgroundColor: '#ef444415',
    borderWidth: 1,
    borderColor: '#ef444430',
  },
  reviewAnswerArabic: {
    color: '#10b981',
    fontSize: 16,
    lineHeight: 24,
  },
  reviewAnswerEnglish: {
    color: '#94a3b8',
    fontSize: 13,
    marginTop: 2,
  },
  reviewNumberAnswer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  reviewNumberText: {
    color: '#10b981',
    fontSize: 24,
    fontWeight: 'bold',
  },
  reviewExplanation: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#0f172a',
    borderRadius: 8,
    padding: 10,
    marginTop: 6,
  },
  reviewExplanationText: {
    flex: 1,
    color: '#94a3b8',
    fontSize: 12,
    lineHeight: 18,
  },
  reviewBottomActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
});

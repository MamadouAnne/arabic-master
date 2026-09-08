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
import { font, color, radius } from '../../../src/theme/tokens';
import { withAlpha } from '../../../src/components/ui/Primitives';

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
            <Ionicons name="close" size={24} color={color.text} />
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
              color={color.progress}
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
                  color={passed ? color.progress : color.danger}
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

              <View style={[styles.scoreCircle, { borderColor: passed ? color.progress : color.danger }]}>
                <Text style={[styles.scorePercentage, { color: passed ? color.progress : color.danger }]}>{percentage}%</Text>
                <Text style={styles.scoreLabel}>{passed ? t('quranQuiz.passed') : `${t('quranQuiz.need')} ${PASSING_SCORE}%`}</Text>
              </View>

              <View style={styles.resultStats}>
                <View style={styles.resultStat}>
                  <Ionicons name="checkmark-circle" size={22} color={color.progress} />
                  <Text style={styles.resultStatValue}>{score}</Text>
                  <Text style={styles.resultStatLabel}>{t('common.correct')}</Text>
                </View>
                <View style={styles.resultStat}>
                  <Ionicons name="close-circle" size={22} color={color.danger} />
                  <Text style={styles.resultStatValue}>{questions.length - score}</Text>
                  <Text style={styles.resultStatLabel}>{t('common.wrong')}</Text>
                </View>
                <View style={styles.resultStat}>
                  <Ionicons name="time" size={22} color={color.accent} />
                  <Text style={styles.resultStatValue}>{totalTime}s</Text>
                  <Text style={styles.resultStatLabel}>{t('quranQuiz.time')}</Text>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.resultActions}>
                {/* Primary row: Try Again + Next */}
                <View style={styles.primaryButtonRow}>
                  <Pressable style={styles.tryAgainBtn} onPress={handleRestart}>
                    <Ionicons name="refresh" size={16} color={color.text} />
                    <Text style={styles.tryAgainBtnText}>{t('common.tryAgain')}</Text>
                  </Pressable>
                  {hasNextSet && (
                    <Pressable
                      style={[styles.nextSetBtn, !passed && styles.nextSetBtnDisabled]}
                      onPress={handleNextSet}
                      disabled={!passed}
                    >
                      <Text style={[styles.nextSetBtnText, !passed && styles.nextSetBtnTextDisabled]}>{t('common.next')}</Text>
                      <Ionicons name="arrow-forward" size={16} color={passed ? color.surface : color.textMuted} />
                    </Pressable>
                  )}
                </View>

                {/* View Answers */}
                <Pressable
                  style={styles.viewAnswersButton}
                  onPress={() => setShowReview(true)}
                >
                  <Ionicons name="list" size={16} color={color.progress} />
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
                  <Ionicons name="arrow-back" size={16} color={color.textFaint} />
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
                        color={isAnswerCorrect ? color.progress : color.danger}
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
                        <Ionicons name="bulb" size={14} color={color.warning} />
                        <Text style={styles.reviewExplanationText}>{lc(question.explanation, question.explanationFr)}</Text>
                      </View>
                    )}
                  </View>
                );
              })}

              {/* Bottom actions */}
              <View style={styles.reviewBottomActions}>
                <Pressable style={styles.restartButton} onPress={handleRestart}>
                  <Ionicons name="refresh" size={16} color={color.text} />
                  <Text style={styles.restartButtonText}>{t('common.tryAgain')}</Text>
                </Pressable>
                {hasNextSet && (
                  <Pressable
                    style={[styles.nextSetButton, !passed && styles.nextSetButtonDisabled]}
                    onPress={handleNextSet}
                    disabled={!passed}
                  >
                    <Text style={[styles.nextSetButtonText, !passed && styles.nextSetButtonTextDisabled]}>{t('common.next')}</Text>
                    <Ionicons name="arrow-forward" size={16} color={passed ? color.surface : color.textMuted} />
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
          <Ionicons name="close" size={24} color={color.text} />
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
          <Ionicons name="star" size={16} color={color.warning} />
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
                    color={isSpeaking && playingText === currentQuestion.questionArabic ? color.surface : color.progress}
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
                                color={isSpeaking && playingText === option ? color.surface : color.progress}
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
          <Ionicons name="arrow-forward" size={18} color={color.text} />
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
  loadingText: {
    color: color.textMuted,
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
    backgroundColor: color.surfaceRaised,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: color.progress,
    borderRadius: 4,
  },
  progressText: {
    color: color.textFaint,
    fontSize: 14,
    fontWeight: '600',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: color.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.xl,
  },
  scoreText: {
    color: color.warning,
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
    borderRadius: radius.xl,
    gap: 6,
  },
  setBadge: {
    backgroundColor: withAlpha(color.warning, 0.13),
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.xl,
  },
  setBadgeText: {
    color: color.warning,
    fontSize: 12,
    fontWeight: '600',
  },
  setProgressBadge: {
    backgroundColor: withAlpha(color.accent, 0.13),
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.xl,
  },
  setProgressText: {
    color: color.accent,
    fontSize: 12,
    fontWeight: '700',
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  questionCard: {
    backgroundColor: color.surface,
    borderRadius: radius.lg,
    padding: 16,
    marginBottom: 16,
  },
  difficultyBadge: {
    color: color.textFaint,
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 8,
  },
  questionText: {
    color: color.text,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
  },
  questionTextEnglish: {
    color: color.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  questionArabic: {
    fontFamily: font.arabic,
    color: color.progress,
    fontSize: 24,
    textAlign: 'center',
    lineHeight: 36,
  },
  arabicQuestionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: color.bg,
    borderRadius: radius.sm,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 10,
    gap: 8,
  },
  questionAudioBtn: {
    width: 24,
    height: 24,
    borderRadius: radius.md,
    backgroundColor: withAlpha(color.progress, 0.13),
    alignItems: 'center',
    justifyContent: 'center',
  },
  questionAudioBtnActive: {
    backgroundColor: color.progress,
  },
  inlineAudioBtn: {
    width: 24,
    height: 24,
    borderRadius: radius.md,
    backgroundColor: color.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inlineAudioBtnActive: {
    backgroundColor: color.progress,
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
    fontFamily: font.arabic,
    color: color.progress,
    fontSize: 22,
    lineHeight: 34,
    textAlign: 'right',
  },
  optionEnglishText: {
    color: color.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  optionEnglishOnly: {
    color: color.text,
    fontSize: 15,
  },
  numberAnswerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  numberAnswerText: {
    color: color.progress,
    fontSize: 28,
    fontWeight: 'bold',
  },
  numberAnswerLabel: {
    color: color.textMuted,
    fontSize: 14,
  },
  tinyAudioBtn: {
    width: 18,
    height: 18,
    borderRadius: radius.sm,
    backgroundColor: withAlpha(color.progress, 0.13),
    alignItems: 'center',
    justifyContent: 'center',
  },
  tinyAudioBtnActive: {
    backgroundColor: color.progress,
  },
  option: {
    flex: 1,
    backgroundColor: color.surface,
    borderRadius: radius.lg,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionSelected: {
    flex: 1,
    backgroundColor: color.surface,
    borderRadius: radius.lg,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: color.accent,
  },
  optionCorrect: {
    flex: 1,
    backgroundColor: withAlpha(color.progress, 0.13),
    borderRadius: radius.lg,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: color.progress,
  },
  optionWrong: {
    flex: 1,
    backgroundColor: withAlpha(color.danger, 0.13),
    borderRadius: radius.lg,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: color.danger,
  },
  optionLetter: {
    width: 32,
    height: 32,
    borderRadius: radius.lg,
    backgroundColor: color.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  optionLetterText: {
    color: color.textMuted,
    fontSize: 14,
    fontWeight: 'bold',
  },
  optionText: {
    flex: 1,
    color: color.text,
    fontSize: 16,
  },
  optionTextSelected: {
    flex: 1,
    color: color.accent,
    fontSize: 16,
    fontWeight: '600',
  },
  optionTextCorrect: {
    flex: 1,
    color: color.progress,
    fontSize: 16,
    fontWeight: '600',
  },
  optionTextWrong: {
    flex: 1,
    color: color.danger,
    fontSize: 16,
    fontWeight: '600',
  },
  explanationCard: {
    marginTop: 20,
    borderRadius: radius.lg,
    padding: 16,
  },
  explanationCorrect: {
    backgroundColor: withAlpha(color.progress, 0.08),
    borderWidth: 1,
    borderColor: withAlpha(color.progress, 0.19),
  },
  explanationWrong: {
    backgroundColor: withAlpha(color.warning, 0.08),
    borderWidth: 1,
    borderColor: withAlpha(color.warning, 0.19),
  },
  explanationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  explanationTitle: {
    flex: 1,
    color: color.text,
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
    color: color.textMuted,
    fontSize: 14,
    lineHeight: 22,
  },
  actionContainer: {
    padding: 20,
    paddingBottom: 32,
  },
  confirmButton: {
    backgroundColor: color.accent,
    borderRadius: radius.lg,
    paddingVertical: 16,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: color.surfaceRaised,
  },
  confirmButtonText: {
    color: color.text,
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    backgroundColor: color.progress,
    borderRadius: radius.md,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  nextButtonDisabled: {
    backgroundColor: color.surfaceRaised,
  },
  nextButtonText: {
    color: color.text,
    fontSize: 15,
    fontWeight: '600',
  },
  // Result Screen Styles
  resultContainer: {
    flexGrow: 1,
    padding: 16,
  },
  resultCard: {
    backgroundColor: color.surface,
    borderRadius: radius.xl,
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
    color: color.text,
    marginBottom: 4,
  },
  resultCategory: {
    fontSize: 16,
    color: color.textFaint,
    marginBottom: 24,
  },
  scoreCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: color.bg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 3,
    borderColor: color.progress,
  },
  scorePercentage: {
    fontSize: 28,
    fontWeight: 'bold',
    color: color.progress,
  },
  scoreLabel: {
    fontSize: 14,
    color: color.textFaint,
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
    color: color.text,
    marginTop: 6,
  },
  resultStatLabel: {
    fontSize: 11,
    color: color.textFaint,
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
    backgroundColor: color.progress,
    borderRadius: radius.md,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  tryAgainBtnText: {
    color: color.text,
    fontSize: 15,
    fontWeight: '600',
  },
  nextSetBtn: {
    flex: 1,
    backgroundColor: color.accent,
    borderRadius: radius.md,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  nextSetBtnText: {
    color: color.text,
    fontSize: 15,
    fontWeight: '600',
  },
  nextSetBtnDisabled: {
    backgroundColor: color.surfaceRaised,
  },
  nextSetBtnTextDisabled: {
    color: color.textFaint,
  },
  restartButton: {
    flex: 1,
    backgroundColor: color.progress,
    borderRadius: radius.md,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  restartButtonText: {
    color: color.text,
    fontSize: 15,
    fontWeight: '600',
  },
  backButton: {
    backgroundColor: color.surfaceRaised,
    borderRadius: radius.md,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  backButtonText: {
    color: color.textFaint,
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
    color: color.warning,
  },
  resultSetProgress: {
    fontSize: 16,
    fontWeight: '600',
    color: color.accent,
  },
  nextSetButton: {
    flex: 1,
    backgroundColor: color.accent,
    borderRadius: radius.md,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  nextSetButtonText: {
    color: color.text,
    fontSize: 15,
    fontWeight: '600',
  },
  nextSetButtonDisabled: {
    backgroundColor: color.surfaceRaised,
  },
  nextSetButtonTextDisabled: {
    color: color.textFaint,
  },
  retryButton: {
    backgroundColor: withAlpha(color.progress, 0.13),
    borderRadius: radius.lg,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  retryButtonText: {
    color: color.progress,
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
    borderBottomColor: color.border,
  },
  reviewHeaderTitle: {
    color: color.text,
    fontSize: 18,
    fontWeight: '600',
  },
  reviewToggleBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.xl,
    backgroundColor: withAlpha(color.progress, 0.13),
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewAnswersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: withAlpha(color.progress, 0.08),
    borderWidth: 1,
    borderColor: withAlpha(color.progress, 0.19),
    borderRadius: radius.md,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 16,
    width: '100%',
  },
  viewAnswersButtonText: {
    color: color.progress,
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
    backgroundColor: color.surface,
    borderRadius: radius.md,
    padding: 12,
    marginBottom: 16,
  },
  returnButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  returnButtonText: {
    color: color.textFaint,
    fontSize: 14,
    fontWeight: '500',
  },
  reviewSummaryText: {
    color: color.progress,
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
    borderTopColor: color.border,
  },
  nextQuestionBtnText: {
    color: color.accent,
    fontSize: 13,
    fontWeight: '600',
  },
  reviewItem: {
    backgroundColor: color.surface,
    borderRadius: radius.md,
    padding: 14,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  reviewItemCorrect: {
    borderLeftColor: color.progress,
  },
  reviewItemWrong: {
    borderLeftColor: color.danger,
  },
  reviewItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  reviewQuestionNum: {
    backgroundColor: color.surfaceRaised,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  reviewQuestionNumText: {
    color: color.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  reviewQuestionArabic: {
    fontFamily: font.arabic,
    color: color.progress,
    fontSize: 22,
    lineHeight: 34,
    marginBottom: 4,
  },
  reviewQuestionEnglish: {
    color: color.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  reviewAnswerSection: {
    marginBottom: 10,
  },
  reviewAnswerLabel: {
    color: color.textFaint,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  reviewAnswerBox: {
    borderRadius: radius.sm,
    padding: 10,
  },
  reviewAnswerCorrect: {
    backgroundColor: withAlpha(color.progress, 0.08),
    borderWidth: 1,
    borderColor: withAlpha(color.progress, 0.19),
  },
  reviewAnswerWrong: {
    backgroundColor: withAlpha(color.danger, 0.08),
    borderWidth: 1,
    borderColor: withAlpha(color.danger, 0.19),
  },
  reviewAnswerArabic: {
    fontFamily: font.arabic,
    color: color.progress,
    fontSize: 20,
    lineHeight: 30,
  },
  reviewAnswerEnglish: {
    color: color.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  reviewNumberAnswer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  reviewNumberText: {
    color: color.progress,
    fontSize: 24,
    fontWeight: 'bold',
  },
  reviewExplanation: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: color.bg,
    borderRadius: radius.sm,
    padding: 10,
    marginTop: 6,
  },
  reviewExplanationText: {
    flex: 1,
    color: color.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },
  reviewBottomActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
});

import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocalizedContent } from '../../src/hooks/useLocalizedContent';
import { useProgressStore } from '../../src/stores/progressStore';
import { useArabicSpeech } from '../../src/hooks/useArabicSpeech';
import { getExercisesForGrammarLesson } from '../../src/data/arabic/exercises';
import { Exercise, GrammarLesson, GrammarContent } from '../../src/types/arabic';
import ArabicKeyboard from '../../src/components/arabic/ArabicKeyboard';
import ArabicVowelText from '../../src/components/arabic/ArabicVowelText';
import { getLessonById } from '../../src/data/arabic/grammar/lessons';
import HighlightedText from '../../src/components/ui/HighlightedText';
import { lessonContent, getGrammarId } from '../../src/data/arabic/grammar/lessonContent';
import { QuizOption, QuizOptionState } from '../../src/components/quiz/QuizOption';

// Note: lessonContent and helper functions are now imported from
// '../../src/data/arabic/grammar/lessonContent'

export default function GrammarLessonScreen() {
  const { t } = useTranslation();
  const { lc } = useLocalizedContent();
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const { startLesson, completeLesson, addXp, updateStreak } = useProgressStore();
  const { speak } = useArabicSpeech();
  const [showExercises, setShowExercises] = useState(false);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [writtenAnswer, setWrittenAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [isWritingCorrect, setIsWritingCorrect] = useState(false);
  const [practiceType, setPracticeType] = useState<'regular' | 'writing' | null>(null);
  const [activeExercises, setActiveExercises] = useState<Exercise[]>([]);

  // Try to get lesson from data file first (for grammar-X IDs)
  const dataLesson = getLessonById(lessonId || '');
  // Fall back to hardcoded content for old IDs
  const hardcodedLesson = lessonContent[lessonId || ''];

  // Use data lesson if available, converting its content structure
  const lesson = dataLesson ? {
    title: dataLesson.title,
    titleFr: (dataLesson as any).titleFr,
    titleArabic: dataLesson.titleArabic,
    description: (dataLesson as any).description,
    descriptionFr: (dataLesson as any).descriptionFr,
    contentItems: dataLesson.content, // Keep original GrammarContent for new rendering
    sections: dataLesson.content.reduce((acc: any[], item: GrammarContent, index: number) => {
      if (item.type === 'text' || item.type === 'rule' || item.type === 'note') {
        acc.push({
          title: item.type === 'rule' ? '📌 Rule' : item.type === 'note' ? '💡 Tip' : '',
          content: item.content,
          contentFr: (item as any).contentFr,
          arabicDescription: item.arabicDescription,
          arabicTranslation: item.arabicTranslation,
          arabicTranslationFr: (item as any).arabicTranslationFr,
          examples: [],
          itemType: item.type,
        });
      } else if (item.type === 'description') {
        acc.push({
          title: '',
          content: item.content,
          contentFr: (item as any).contentFr,
          arabicDescription: item.arabicDescription,
          arabicTranslation: item.arabicTranslation,
          arabicTranslationFr: (item as any).arabicTranslationFr,
          examples: [],
          itemType: 'description',
        });
      } else if (item.type === 'letters_grid') {
        acc.push({
          title: item.content,
          titleFr: (item as any).contentFr,
          content: '',
          examples: [],
          letters: item.letters,
          letterType: item.letterType,
          itemType: 'letters_grid',
        });
      } else if (item.type === 'examples_grid') {
        acc.push({
          title: item.content,
          titleFr: (item as any).contentFr,
          content: '',
          examples: (item.examples || []).map((ex: any) => ({
            ...ex,
            french: ex.french,
          })),
          itemType: 'examples_grid',
        });
      } else if (item.type === 'comparison_grid') {
        acc.push({
          title: item.content,
          titleFr: (item as any).contentFr,
          content: '',
          comparisons: (item.comparisons || []).map((comp: any) => ({
            left: { ...comp.left, labelFr: comp.left?.labelFr },
            right: { ...comp.right, labelFr: comp.right?.labelFr },
          })),
          leftLabel: item.leftLabel,
          leftLabelFr: (item as any).leftLabelFr,
          rightLabel: item.rightLabel,
          rightLabelFr: (item as any).rightLabelFr,
          itemType: 'comparison_grid',
        });
      } else if (item.type === 'example') {
        // Add example to the last section or create a new one
        const lastSection = acc[acc.length - 1];
        if (lastSection && lastSection.examples && lastSection.itemType !== 'letters_grid' && lastSection.itemType !== 'examples_grid') {
          lastSection.examples.push({
            arabic: item.arabic || '',
            transliteration: item.transliteration || '',
            english: item.translation || '',
            french: (item as any).translationFr || '',
          });
        } else {
          acc.push({
            title: item.content || 'Examples',
            titleFr: (item as any).contentFr,
            content: '',
            examples: [{
              arabic: item.arabic || '',
              transliteration: item.transliteration || '',
              english: item.translation || '',
              french: (item as any).translationFr || '',
            }],
            itemType: 'example',
          });
        }
      } else if (item.type === 'table' && item.tableData) {
        // Convert table to section with examples
        const examples = item.tableData.rows.map(row => ({
          arabic: row[0] || '',
          transliteration: row[1] || '',
          english: row[row.length - 1] || '',
        }));
        acc.push({
          title: item.content || 'Reference',
          titleFr: (item as any).contentFr,
          content: `Columns: ${item.tableData.headers.join(' | ')}`,
          examples,
          itemType: 'table',
        });
      }
      return acc;
    }, []),
  } : hardcodedLesson;

  const grammarId = getGrammarId(lessonId || '');
  const allExercises = grammarId ? getExercisesForGrammarLesson(grammarId) : [];

  // Check if this is the vowels lesson to enable vowel highlighting
  const isVowelsLesson = lessonId === 'grammar-2' || lessonId === 'arabic-vowels';

  // Separate exercises by type
  const regularExercises = allExercises.filter(ex => ex.type !== 'writing');
  const writingExercises = allExercises.filter(ex => ex.type === 'writing');

  useEffect(() => {
    if (lessonId) {
      startLesson(lessonId);
    }
  }, [lessonId]);

  if (!lesson) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.comingSoon}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </Pressable>
          <View style={styles.comingSoonContent}>
            <Ionicons name="construct" size={64} color="#D4AF37" />
            <Text style={styles.comingSoonTitle}>{t('common.comingSoon')}</Text>
            <Text style={styles.comingSoonText}>
              {t('grammar.comingSoonLesson')}
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const handleComplete = () => {
    if (lessonId) {
      completeLesson(lessonId);
      addXp(50);
      updateStreak();
      router.back();
    }
  };

  const handleStartPractice = (type: 'regular' | 'writing') => {
    const exerciseList = type === 'writing' ? writingExercises : regularExercises;
    if (exerciseList.length === 0) return;

    setPracticeType(type);
    setActiveExercises(exerciseList);
    setShowExercises(true);
    setCurrentExerciseIndex(0);
    setSelectedAnswer(null);
    setWrittenAnswer('');
    setShowResult(false);
    setCorrectAnswers(0);
    setIsWritingCorrect(false);
  };

  const handleSelectAnswer = (answer: string, isCorrect: boolean) => {
    setSelectedAnswer(answer);
    setShowResult(true);
    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
    }
  };

  const handleCheckWrittenAnswer = (exercise: Exercise) => {
    const userAnswer = writtenAnswer.trim();
    const correctAnswersList = Array.isArray(exercise.correctAnswer)
      ? exercise.correctAnswer
      : [exercise.correctAnswer];

    // Check if user's answer matches any correct answer (case-insensitive, trim spaces)
    const isCorrect = correctAnswersList.some(
      (correct) => correct.trim().toLowerCase() === userAnswer.toLowerCase() ||
                   correct.trim() === userAnswer
    );

    setIsWritingCorrect(isCorrect);
    setShowResult(true);
    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
    }
  };

  const handleNextExercise = () => {
    if (currentExerciseIndex < activeExercises.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setWrittenAnswer('');
      setShowResult(false);
      setIsWritingCorrect(false);
    } else {
      const xpEarned = correctAnswers * 10;
      addXp(xpEarned);
      setShowExercises(false);
    }
  };

  // Exercise view
  if (showExercises) {
    if (activeExercises.length === 0) {
      return (
        <SafeAreaView style={styles.container}>
          <View style={styles.header}>
            <Pressable style={styles.backButton} onPress={() => setShowExercises(false)}>
              <Ionicons name="close" size={24} color="#ffffff" />
            </Pressable>
            <View style={styles.headerText}>
              <Text style={styles.title}>{t('common.practice')}</Text>
            </View>
          </View>
          <View style={styles.noExercises}>
            <Ionicons name="document-text-outline" size={48} color="#64748b" />
            <Text style={styles.noExercisesText}>
              {t('grammar.noPractice')}
            </Text>
            <Pressable style={styles.backToLessonBtn} onPress={() => setShowExercises(false)}>
              <Text style={styles.backToLessonText}>{t('grammar.backToLesson')}</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      );
    }

    const currentExercise = activeExercises[currentExerciseIndex];

    // Hide the Arabic prompt when it already contains the correct answer (tashkeel-insensitive),
    // otherwise "choose the correct: '<phrase>'" questions give the answer away.
    const stripTashkeel = (s: string) => s.replace(/[ً-ْٰـ]/g, '').replace(/\s+/g, ' ').trim();
    const correctOpt = currentExercise.options?.find((o) => o.isCorrect);
    const correctText = correctOpt ? (correctOpt.textArabic || lc(correctOpt.text, (correctOpt as any).textFr)) : '';
    const questionArabicRevealsAnswer =
      !!currentExercise.questionArabic &&
      !!correctText &&
      stripTashkeel(currentExercise.questionArabic).includes(stripTashkeel(correctText)) &&
      stripTashkeel(correctText).length > 0;
    const showQuestionArabic = !!currentExercise.questionArabic && !questionArabicRevealsAnswer;

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => setShowExercises(false)}>
            <Ionicons name="close" size={24} color="#ffffff" />
          </Pressable>
          <View style={styles.headerText}>
            <Text style={styles.title}>
              {practiceType === 'writing' ? t('grammar.writingPractice') : t('grammar.quizPractice')}
            </Text>
            <Text style={styles.titleArabic}>{lesson.titleArabic}</Text>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.exerciseScroll}>
          {/* Progress */}
          <View style={styles.exerciseProgress}>
            <Text style={styles.exerciseProgressText}>
              {practiceType === 'writing'
                ? t('grammar.exerciseOf', { current: currentExerciseIndex + 1, total: activeExercises.length })
                : t('grammar.questionOf', { current: currentExerciseIndex + 1, total: activeExercises.length })}
            </Text>
            <View style={styles.exerciseProgressBar}>
              <View
                style={[
                  styles.exerciseProgressFill,
                  { width: `${((currentExerciseIndex + 1) / activeExercises.length) * 100}%` }
                ]}
              />
            </View>
          </View>

          {/* Question */}
          <View style={styles.questionCard}>
            <Text style={styles.questionText}>{lc(currentExercise.question, (currentExercise as any).questionFr)}</Text>
            {showQuestionArabic && (
              <Pressable
                style={styles.questionArabicRow}
                onPress={() => currentExercise.questionArabic && speak(currentExercise.questionArabic)}
              >
                <Text style={styles.questionArabic}>{currentExercise.questionArabic}</Text>
                <Ionicons name="volume-medium" size={20} color="#D4AF37" />
              </Pressable>
            )}
          </View>

          {/* Options for Multiple Choice / Fill-in-the-blank with choices */}
          {(currentExercise.type === 'multiple_choice' || currentExercise.type === 'fill_blank') && currentExercise.options && (
            <View style={styles.optionsContainer}>
              {currentExercise.options.map((option, index) => {
                const isSelected = selectedAnswer === option.id;
                const showCorrect = showResult && option.isCorrect;
                const showWrong = showResult && isSelected && !option.isCorrect;
                const state: QuizOptionState = showCorrect
                  ? 'correct'
                  : showWrong
                  ? 'wrong'
                  : isSelected && !showResult
                  ? 'selected'
                  : 'idle';
                const hasArabic = !!option.textArabic;
                const translation = lc(option.text, (option as any).textFr);

                return (
                  <QuizOption
                    key={option.id}
                    index={index}
                    primary={hasArabic ? option.textArabic! : translation}
                    primaryArabic={hasArabic}
                    state={state}
                    disabled={showResult}
                    onPress={() => !showResult && handleSelectAnswer(option.id, option.isCorrect)}
                    onAudio={hasArabic ? () => speak(option.textArabic!) : undefined}
                  />
                );
              })}
            </View>
          )}

          {/* Fill in the Blank without options - Arabic keyboard input */}
          {currentExercise.type === 'fill_blank' && !currentExercise.options && (
            <View style={styles.writingContainer}>
              {currentExercise.hint && !showResult && (
                <View style={styles.hintBox}>
                  <Ionicons name="bulb-outline" size={16} color="#D4AF37" />
                  <Text style={styles.hintText}>{lc(currentExercise.hint, (currentExercise as any).hintFr)}</Text>
                </View>
              )}

              <View
                style={[
                  styles.writingInput,
                  showResult && isWritingCorrect && styles.writingInputCorrect,
                  showResult && !isWritingCorrect && styles.writingInputWrong,
                ]}
              >
                <Text style={styles.writingInputText}>
                  {writtenAnswer || <Text style={styles.writingPlaceholder}>اكتب إجابتك هنا...</Text>}
                </Text>
              </View>

              {showResult && (
                <View style={[
                  styles.writingResult,
                  isWritingCorrect ? styles.writingResultCorrect : styles.writingResultWrong,
                ]}>
                  <Ionicons
                    name={isWritingCorrect ? "checkmark-circle" : "close-circle"}
                    size={24}
                    color={isWritingCorrect ? "#22c55e" : "#ef4444"}
                  />
                  <View style={styles.writingResultContent}>
                    <Text style={[
                      styles.writingResultLabel,
                      isWritingCorrect ? styles.writingResultLabelCorrect : styles.writingResultLabelWrong,
                    ]}>
                      {isWritingCorrect ? t('grammar.correctAnswer') : t('grammar.incorrectAnswer')}
                    </Text>
                    {!isWritingCorrect && (
                      <Text style={styles.correctAnswerText}>
                        {t('grammar.correctIs', { answer: Array.isArray(currentExercise.correctAnswer)
                          ? currentExercise.correctAnswer[0]
                          : currentExercise.correctAnswer })}
                      </Text>
                    )}
                  </View>
                </View>
              )}
            </View>
          )}

          {/* Writing Exercise - Separate type */}
          {currentExercise.type === 'writing' && (
            <View style={styles.writingContainer}>
              {currentExercise.hint && !showResult && (
                <View style={styles.hintBox}>
                  <Ionicons name="bulb-outline" size={16} color="#D4AF37" />
                  <Text style={styles.hintText}>{lc(currentExercise.hint, (currentExercise as any).hintFr)}</Text>
                </View>
              )}

              <View
                style={[
                  styles.writingInput,
                  showResult && isWritingCorrect && styles.writingInputCorrect,
                  showResult && !isWritingCorrect && styles.writingInputWrong,
                ]}
              >
                <Text style={styles.writingInputText}>
                  {writtenAnswer || <Text style={styles.writingPlaceholder}>اكتب إجابتك هنا...</Text>}
                </Text>
              </View>

              {showResult && (
                <View style={[
                  styles.writingResult,
                  isWritingCorrect ? styles.writingResultCorrect : styles.writingResultWrong,
                ]}>
                  <Ionicons
                    name={isWritingCorrect ? "checkmark-circle" : "close-circle"}
                    size={24}
                    color={isWritingCorrect ? "#22c55e" : "#ef4444"}
                  />
                  <View style={styles.writingResultContent}>
                    <Text style={[
                      styles.writingResultLabel,
                      isWritingCorrect ? styles.writingResultLabelCorrect : styles.writingResultLabelWrong,
                    ]}>
                      {isWritingCorrect ? t('grammar.correctAnswer') : t('grammar.incorrectAnswer')}
                    </Text>
                    {!isWritingCorrect && (
                      <Text style={styles.correctAnswerText}>
                        {t('grammar.correctAnswerIs', { answer: Array.isArray(currentExercise.correctAnswer)
                          ? currentExercise.correctAnswer[0]
                          : currentExercise.correctAnswer })}
                      </Text>
                    )}
                  </View>
                </View>
              )}
            </View>
          )}

          {/* Explanation */}
          {showResult && currentExercise.explanation && (
            <View style={styles.explanationBox}>
              <Ionicons name="bulb" size={20} color="#D4AF37" />
              <Text style={styles.explanationText}>{lc(currentExercise.explanation, (currentExercise as any).explanationFr)}</Text>
            </View>
          )}

          {/* Next Button */}
          {showResult && (
            <Pressable style={styles.nextBtn} onPress={handleNextExercise}>
              <Text style={styles.nextBtnText}>
                {currentExerciseIndex < activeExercises.length - 1 ? t('grammar.nextQuestion') : t('grammar.finishPractice')}
              </Text>
              <Ionicons name="arrow-forward" size={20} color="#ffffff" />
            </Pressable>
          )}
        </ScrollView>

        {/* Arabic Keyboard for writing exercises */}
        {!showResult && ((currentExercise.type === 'fill_blank' && !currentExercise.options) || currentExercise.type === 'writing') && (
          <ArabicKeyboard
            onKeyPress={(key) => setWrittenAnswer(prev => prev + key)}
            onBackspace={() => setWrittenAnswer(prev => prev.slice(0, -1))}
            onSpace={() => setWrittenAnswer(prev => prev + ' ')}
            onSubmit={() => handleCheckWrittenAnswer(currentExercise)}
          />
        )}
      </SafeAreaView>
    );
  }

  // Main lesson view
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </Pressable>
          <View style={styles.headerText}>
            <Text style={styles.title}>{lc(lesson.title, lesson.titleFr)}</Text>
            <Text style={styles.titleArabic}>{lesson.titleArabic}</Text>
          </View>
        </View>

        {/* Lesson Content */}
        {lesson.sections.map((section: any, index: number) => (
          <View key={index} style={styles.section}>
            {/* Section Title */}
            {section.title ? <Text style={styles.sectionTitle}>{lc(section.title, section.titleFr)}</Text> : null}

            {/* Description with Arabic - highlighted */}
            {section.itemType === 'description' ? (
              <View style={styles.descriptionCard}>
                <View style={styles.descriptionHighlight} />
                <HighlightedText text={lc(section.content, section.contentFr)} style={styles.descriptionText} />
                {section.arabicDescription && (
                  <View>
                    <Pressable
                      style={styles.arabicDescriptionRow}
                      onPress={() => speak(section.arabicDescription)}
                    >
                      <Text style={styles.arabicDescriptionText}>{section.arabicDescription}</Text>
                      <View style={styles.audioBtn}>
                        <Ionicons name="volume-medium" size={18} color="#10b981" />
                      </View>
                    </Pressable>
                    {section.arabicTranslation && (
                      <Text style={styles.arabicTranslationText}>{lc(section.arabicTranslation, section.arabicTranslationFr)}</Text>
                    )}
                  </View>
                )}
              </View>
            ) : section.itemType === 'comparison_grid' ? (
              /* Comparison Grid - indefinite vs definite */
              <View style={styles.comparisonContainer}>
                {/* Header labels */}
                <View style={styles.comparisonHeader}>
                  <View style={[styles.comparisonLabelBox, styles.comparisonLabelLeft]}>
                    <Text style={styles.comparisonLabelText}>{lc(section.leftLabel || 'Indefinite', section.leftLabelFr)}</Text>
                  </View>
                  <Ionicons name="arrow-forward" size={20} color="#64748b" />
                  <View style={[styles.comparisonLabelBox, styles.comparisonLabelRight]}>
                    <Text style={styles.comparisonLabelText}>{lc(section.rightLabel || 'Definite', section.rightLabelFr)}</Text>
                  </View>
                </View>
                {/* Comparison rows */}
                {section.comparisons?.map((comp: any, compIndex: number) => (
                  <View key={compIndex} style={styles.comparisonRow}>
                    <Pressable
                      style={[styles.comparisonCard, styles.comparisonCardLeft]}
                      onPress={() => speak(comp.left.arabic)}
                    >
                      {isVowelsLesson ? (
                        <ArabicVowelText text={comp.left.arabic} style={styles.comparisonArabic} />
                      ) : (
                        <Text style={styles.comparisonArabic}>{comp.left.arabic}</Text>
                      )}
                      <Text style={styles.comparisonEnglish}>{lc(comp.left.label, comp.left.labelFr)}</Text>
                    </Pressable>
                    <Ionicons name="arrow-forward" size={16} color="#10b981" />
                    <Pressable
                      style={[styles.comparisonCard, styles.comparisonCardRight]}
                      onPress={() => speak(comp.right.arabic)}
                    >
                      {isVowelsLesson ? (
                        <ArabicVowelText text={comp.right.arabic} style={styles.comparisonArabic} />
                      ) : (
                        <Text style={styles.comparisonArabic}>{comp.right.arabic}</Text>
                      )}
                      <Text style={styles.comparisonEnglish}>{lc(comp.right.label, comp.right.labelFr)}</Text>
                    </Pressable>
                  </View>
                ))}
              </View>
            ) : section.itemType === 'letters_grid' ? (
              /* Letters Grid for Sun/Moon letters */
              <View style={[
                styles.lettersGridCard,
                { borderColor: section.letterType === 'sun' ? '#f59e0b' : '#3b82f6' }
              ]}>
                <View style={styles.lettersGridHeader}>
                  <Ionicons
                    name={section.letterType === 'sun' ? 'sunny' : 'moon'}
                    size={24}
                    color={section.letterType === 'sun' ? '#f59e0b' : '#3b82f6'}
                  />
                </View>
                <View style={styles.lettersGrid}>
                  {section.letters?.map((letter: string, letterIndex: number) => (
                    <Pressable
                      key={letterIndex}
                      style={[
                        styles.letterCell,
                        { backgroundColor: section.letterType === 'sun' ? '#f59e0b20' : '#3b82f620' }
                      ]}
                      onPress={() => speak(letter)}
                    >
                      <Text style={[
                        styles.letterText,
                        { color: section.letterType === 'sun' ? '#f59e0b' : '#3b82f6' }
                      ]}>{letter}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            ) : section.itemType === 'examples_grid' ? (
              /* Examples Grid - multiple example cards */
              <View style={styles.examplesGrid}>
                {section.examples?.map((example: any, exIndex: number) => (
                  <Pressable
                    key={exIndex}
                    style={styles.exampleCard}
                    onPress={() => speak(example.arabic)}
                  >
                    {isVowelsLesson ? (
                      <ArabicVowelText text={example.arabic} style={styles.exampleCardArabic} />
                    ) : (
                      <Text style={styles.exampleCardArabic}>{example.arabic}</Text>
                    )}
                    <HighlightedText text={lc(example.english, example.french)} style={styles.exampleCardEnglish} />
                    <View style={styles.exampleCardAudioIcon}>
                      <Ionicons name="volume-medium" size={16} color="#10b981" />
                    </View>
                  </Pressable>
                ))}
              </View>
            ) : (
              /* Default content rendering */
              <>
                {/* Rules and notes get highlighted cards */}
                {(section.itemType === 'rule' || section.itemType === 'note') && section.content ? (
                  <View style={[
                    styles.highlightedCard,
                    section.itemType === 'rule' ? styles.ruleCard : styles.noteCard
                  ]}>
                    <View style={[
                      styles.highlightedCardBorder,
                      { backgroundColor: section.itemType === 'rule' ? '#10b981' : '#f59e0b' }
                    ]} />
                    <View style={styles.highlightedCardContent}>
                      <View style={styles.highlightedCardHeader}>
                        <Ionicons
                          name={section.itemType === 'rule' ? 'bookmark' : 'bulb'}
                          size={20}
                          color={section.itemType === 'rule' ? '#10b981' : '#f59e0b'}
                        />
                      </View>
                      <HighlightedText
                        text={lc(section.content, section.contentFr)}
                        style={styles.highlightedCardText}
                        highlightColor={section.itemType === 'rule' ? '#10b981' : '#f59e0b'}
                      />
                      {section.arabicDescription && (
                        <View>
                          <Pressable
                            style={[
                              styles.arabicDescriptionRow,
                              { backgroundColor: section.itemType === 'rule' ? '#10b98110' : '#f59e0b10' }
                            ]}
                            onPress={() => speak(section.arabicDescription)}
                          >
                            <Text style={[
                              styles.arabicDescriptionText,
                              { color: section.itemType === 'rule' ? '#10b981' : '#f59e0b' }
                            ]}>{section.arabicDescription}</Text>
                            <View style={styles.audioBtn}>
                              <Ionicons
                                name="volume-medium"
                                size={18}
                                color={section.itemType === 'rule' ? '#10b981' : '#f59e0b'}
                              />
                            </View>
                          </Pressable>
                          {section.arabicTranslation && (
                            <Text style={[
                              styles.arabicTranslationText,
                              { color: section.itemType === 'rule' ? '#10b98199' : '#f59e0b99' }
                            ]}>{lc(section.arabicTranslation, section.arabicTranslationFr)}</Text>
                          )}
                        </View>
                      )}
                    </View>
                  </View>
                ) : section.itemType === 'text' && section.content ? (
                  <Text style={styles.textSectionTitle}>{lc(section.content, section.contentFr)}</Text>
                ) : section.content ? (
                  <Text style={styles.sectionContent}>{lc(section.content, section.contentFr)}</Text>
                ) : null}

                {/* Arabic description for other types (not rule/note) */}
                {section.arabicDescription && section.itemType !== 'rule' && section.itemType !== 'note' && (
                  <Pressable
                    style={styles.arabicDescriptionRow}
                    onPress={() => speak(section.arabicDescription)}
                  >
                    <Text style={styles.arabicDescriptionText}>{section.arabicDescription}</Text>
                    <View style={styles.audioBtn}>
                      <Ionicons name="volume-medium" size={18} color="#10b981" />
                    </View>
                  </Pressable>
                )}

                {section.examples && section.examples.length > 0 && (
                  <View style={styles.examplesBox}>
                    {section.examples.map((example: any, exIndex: number) => (
                      <Pressable
                        key={exIndex}
                        style={[
                          styles.exampleRow,
                          exIndex === section.examples!.length - 1 && styles.exampleRowLast
                        ]}
                        onPress={() => speak(example.arabic)}
                      >
                        <View style={styles.exampleLeft}>
                          {isVowelsLesson ? (
                            <ArabicVowelText text={example.arabic} style={styles.exampleArabic} />
                          ) : (
                            <Text style={styles.exampleArabic}>{example.arabic}</Text>
                          )}
                        </View>
                        <Text style={styles.exampleEnglish}>{lc(example.english, example.french)}</Text>
                        <View style={styles.audioBtn}>
                          <Ionicons name="volume-medium" size={18} color="#10b981" />
                        </View>
                      </Pressable>
                    ))}
                  </View>
                )}
              </>
            )}
          </View>
        ))}

        {/* Practice Section */}
        {allExercises.length > 0 && (
          <View style={styles.practiceSection}>
            <View style={styles.practiceSectionHeader}>
              <Ionicons name="fitness" size={24} color="#22c55e" />
              <Text style={styles.practiceSectionTitle}>{t('grammar.practiceExercises')}</Text>
            </View>
            <Text style={styles.practiceSectionDesc}>
              {t('grammar.practiceDesc')}
            </Text>

            {/* Regular Practice Button */}
            {regularExercises.length > 0 && (
              <Pressable style={styles.practiceRow} onPress={() => handleStartPractice('regular')}>
                <View style={[styles.practiceIconChip, styles.quizChip]}>
                  <Ionicons name="play" size={19} color="#34d399" />
                </View>
                <Text style={styles.practiceRowText}>
                  {t('grammar.quizPracticeCount', { count: regularExercises.length })}
                </Text>
                <Ionicons name="chevron-forward" size={20} color="#64748b" />
              </Pressable>
            )}

            {/* Writing Practice Button */}
            {writingExercises.length > 0 && (
              <Pressable style={styles.practiceRow} onPress={() => handleStartPractice('writing')}>
                <View style={[styles.practiceIconChip, styles.writingChip]}>
                  <Ionicons name="create" size={19} color="#818cf8" />
                </View>
                <Text style={styles.practiceRowText}>
                  {t('grammar.writingPracticeCount', { count: writingExercises.length })}
                </Text>
                <Ionicons name="chevron-forward" size={20} color="#64748b" />
              </Pressable>
            )}
          </View>
        )}

        {/* Complete Button */}
        <View style={[styles.section, { marginBottom: 100 }]}>
          <Pressable style={styles.completeButton} onPress={handleComplete}>
            <Ionicons name="checkmark-circle" size={22} color="#0f172a" />
            <Text style={styles.completeButtonText}>{t('grammar.markComplete')}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  titleArabic: {
    fontSize: 16,
    color: '#D4AF37',
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
  },
  sectionContent: {
    fontSize: 15,
    color: '#94a3b8',
    lineHeight: 24,
    marginBottom: 16,
  },
  textSectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
    marginTop: 8,
  },
  examplesBox: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
  },
  exampleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  exampleRowLast: {
    borderBottomWidth: 0,
  },
  exampleLeft: {
    flex: 1,
  },
  exampleArabic: {
    fontSize: 28,
    lineHeight: 48,
    color: '#ffffff',
  },
  exampleTranslit: {
    fontSize: 12,
    color: '#6366f1',
    marginTop: 2,
  },
  exampleEnglish: {
    fontSize: 14,
    color: '#94a3b8',
    marginRight: 12,
    flex: 1,
    textAlign: 'right',
  },
  audioBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#10b98120',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Description card styles
  descriptionCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  descriptionHighlight: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: '#10b981',
  },
  descriptionText: {
    fontSize: 16,
    color: '#e2e8f0',
    lineHeight: 26,
    paddingLeft: 8,
  },
  // Highlighted card styles (for rules and notes)
  highlightedCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  highlightedCardBorder: {
    width: 4,
  },
  highlightedCardContent: {
    flex: 1,
    padding: 16,
  },
  highlightedCardHeader: {
    marginBottom: 8,
  },
  highlightedCardText: {
    fontSize: 15,
    color: '#e2e8f0',
    lineHeight: 24,
  },
  ruleCard: {
    borderColor: '#10b981',
  },
  noteCard: {
    borderColor: '#f59e0b',
  },
  // Comparison grid styles
  comparisonContainer: {
    gap: 12,
  },
  comparisonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 8,
  },
  comparisonLabelBox: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  comparisonLabelLeft: {
    backgroundColor: '#64748b30',
  },
  comparisonLabelRight: {
    backgroundColor: '#10b98130',
  },
  comparisonLabelText: {
    color: '#e2e8f0',
    fontSize: 13,
    fontWeight: '600',
  },
  comparisonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  comparisonCard: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
  },
  comparisonCardLeft: {
    borderWidth: 1,
    borderColor: '#334155',
  },
  comparisonCardRight: {
    borderWidth: 1,
    borderColor: '#10b98140',
    backgroundColor: '#10b98108',
  },
  comparisonArabic: {
    fontSize: 28,
    lineHeight: 48,
    color: '#ffffff',
    marginBottom: 4,
  },
  comparisonEnglish: {
    fontSize: 12,
    color: '#94a3b8',
  },
  arabicDescriptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    backgroundColor: '#10b98110',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#10b98130',
  },
  arabicDescriptionText: {
    fontSize: 26,
    lineHeight: 44,
    color: '#10b981',
    flex: 1,
    textAlign: 'right',
    marginRight: 12,
  },
  arabicTranslationText: {
    fontSize: 11,
    color: '#64748b',
    textAlign: 'right',
    marginTop: 4,
    marginRight: 44,
    fontStyle: 'italic',
  },
  // Letters grid styles
  lettersGridCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
  },
  lettersGridHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  lettersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  letterCell: {
    width: 50,
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  letterText: {
    fontSize: 24,
    fontWeight: '600',
  },
  // Examples grid styles
  examplesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  exampleCard: {
    backgroundColor: '#1e293b',
    borderRadius: 14,
    padding: 16,
    width: '47%',
    minHeight: 90,
    position: 'relative',
  },
  exampleCardArabic: {
    fontSize: 26,
    lineHeight: 46,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  exampleCardEnglish: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
  },
  exampleCardAudioIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
    opacity: 0.6,
  },
  practiceSection: {
    backgroundColor: '#1e293b',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  practiceSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  practiceSectionTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  practiceSectionDesc: {
    color: '#94a3b8',
    fontSize: 14,
    marginBottom: 16,
  },
  practiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#0f172a',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 12,
  },
  practiceIconChip: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quizChip: {
    backgroundColor: 'rgba(52, 211, 153, 0.14)',
  },
  writingChip: {
    backgroundColor: 'rgba(129, 140, 248, 0.14)',
  },
  practiceRowText: {
    flex: 1,
    color: '#f1f5f9',
    fontSize: 15,
    fontWeight: '700',
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#D4AF37',
    borderRadius: 16,
    paddingVertical: 17,
    marginHorizontal: 24,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 6,
  },
  completeButtonText: {
    color: '#0f172a',
    fontSize: 17,
    fontWeight: '800',
  },
  comingSoon: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  comingSoonContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 100,
  },
  comingSoonTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 24,
    marginBottom: 12,
  },
  comingSoonText: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  // Exercise Styles
  exerciseScroll: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  exerciseProgress: {
    marginBottom: 24,
  },
  exerciseProgressText: {
    color: '#94a3b8',
    fontSize: 14,
    marginBottom: 8,
  },
  exerciseProgressBar: {
    height: 6,
    backgroundColor: '#334155',
    borderRadius: 3,
    overflow: 'hidden',
  },
  exerciseProgressFill: {
    height: '100%',
    backgroundColor: '#22c55e',
  },
  questionCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  questionText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 26,
  },
  questionArabicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    justifyContent: 'space-between',
  },
  questionArabic: {
    color: '#D4AF37',
    fontSize: 24,
  },
  optionsContainer: {
    marginBottom: 20,
  },
  explanationBox: {
    backgroundColor: '#D4AF3720',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  explanationText: {
    color: '#e2e8f0',
    fontSize: 14,
    flex: 1,
    marginLeft: 12,
    lineHeight: 20,
  },
  nextBtn: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  noExercises: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  noExercisesText: {
    color: '#94a3b8',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  backToLessonBtn: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  backToLessonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  // Writing Exercise Styles
  writingContainer: {
    marginBottom: 20,
  },
  hintBox: {
    backgroundColor: '#D4AF3715',
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  hintText: {
    color: '#D4AF37',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  writingInput: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#334155',
    minHeight: 60,
    justifyContent: 'center',
  },
  writingInputText: {
    fontSize: 20,
    color: '#ffffff',
    textAlign: 'right',
  },
  writingPlaceholder: {
    fontSize: 18,
    color: '#64748b',
    textAlign: 'right',
  },
  writingInputCorrect: {
    borderColor: '#22c55e',
    backgroundColor: '#22c55e10',
  },
  writingInputWrong: {
    borderColor: '#ef4444',
    backgroundColor: '#ef444410',
  },
  checkAnswerBtn: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  checkAnswerBtnDisabled: {
    backgroundColor: '#334155',
    opacity: 0.6,
  },
  checkAnswerText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  writingResult: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  writingResultCorrect: {
    backgroundColor: '#22c55e20',
  },
  writingResultWrong: {
    backgroundColor: '#ef444420',
  },
  writingResultContent: {
    marginLeft: 12,
    flex: 1,
  },
  writingResultLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  writingResultLabelCorrect: {
    color: '#22c55e',
  },
  writingResultLabelWrong: {
    color: '#ef4444',
  },
  correctAnswerText: {
    color: '#94a3b8',
    fontSize: 14,
    marginTop: 4,
  },
});

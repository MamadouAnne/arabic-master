import { View, Text, Pressable, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocalizedContent } from '../../src/hooks/useLocalizedContent';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import {
  vocabularyWords,
  getWordsByTheme,
  getThemeById,
} from '../../src/data/arabic/vocabulary';
import { useProgressStore } from '../../src/stores/progressStore';
import { useArabicSpeech } from '../../src/hooks/useArabicSpeech';
import { VocabularyWord } from '../../src/types/arabic';
import { font, color, radius } from '../../src/theme/tokens';
import { withAlpha } from '../../src/components/ui/Primitives';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;

export default function FlashcardsScreen() {
  const { t } = useTranslation();
  const { lc } = useLocalizedContent();
  const { themeId } = useLocalSearchParams<{ themeId?: string }>();
  const { showVowels, markWordLearned, addXp, updateStreak, scheduleVocabularyReview } = useProgressStore();

  const [words, setWords] = useState<VocabularyWord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [stats, setStats] = useState({ known: 0, learning: 0 });
  const { speak, isSpeaking } = useArabicSpeech();

  const theme = themeId ? getThemeById(themeId) : null;

  useEffect(() => {
    const wordList = themeId ? getWordsByTheme(themeId) : vocabularyWords;
    // Shuffle words
    const shuffled = [...wordList].sort(() => Math.random() - 0.5);
    setWords(shuffled);
  }, [themeId]);

  const translateX = useSharedValue(0);
  const rotateY = useSharedValue(0);

  const handleNext = (known: boolean) => {
    const currentWord = words[currentIndex];

    // Always schedule word for SRS review
    scheduleVocabularyReview(currentWord.id, currentWord.themeId);

    if (known) {
      setStats((prev) => ({ ...prev, known: prev.known + 1 }));
      markWordLearned(currentWord.id);
      addXp(2);
    } else {
      setStats((prev) => ({ ...prev, learning: prev.learning + 1 }));
    }

    if (currentIndex < words.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setIsFlipped(false);
      translateX.value = 0;
    }
  };

  const flipCard = () => {
    rotateY.value = withSpring(isFlipped ? 0 : 180);
    setIsFlipped(!isFlipped);
  };

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
    })
    .onEnd((event) => {
      if (event.translationX > SWIPE_THRESHOLD) {
        translateX.value = withSpring(SCREEN_WIDTH, {}, () => {
          runOnJS(handleNext)(true);
        });
      } else if (event.translationX < -SWIPE_THRESHOLD) {
        translateX.value = withSpring(-SCREEN_WIDTH, {}, () => {
          runOnJS(handleNext)(false);
        });
      } else {
        translateX.value = withSpring(0);
      }
    });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { rotateZ: `${interpolate(translateX.value, [-SCREEN_WIDTH, 0, SCREEN_WIDTH], [-15, 0, 15])}deg` },
    ],
  }));

  const frontAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotateY: `${rotateY.value}deg` }],
    backfaceVisibility: 'hidden',
  }));

  const backAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotateY: `${rotateY.value + 180}deg` }],
    backfaceVisibility: 'hidden',
  }));

  if (words.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loading}>
          <Text style={styles.loadingText}>{t('vocabulary.loadingFlashcards')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isComplete = currentIndex >= words.length - 1 && (stats.known + stats.learning) === words.length;

  if (isComplete) {
    updateStreak();
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.completeContainer}>
          <View style={styles.completeIcon}>
            <Ionicons name="trophy" size={64} color={color.sacred} />
          </View>
          <Text style={styles.completeTitle}>{t('vocabulary.sessionComplete')}</Text>
          <Text style={styles.completeSubtitle}>
            {theme ? lc(theme.name, theme.nameFr) : t('vocabulary.allVocabulary')}
          </Text>

          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.known}</Text>
              <Text style={styles.statLabel}>{t('vocabulary.known')}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: color.warning }]}>
                {stats.learning}
              </Text>
              <Text style={styles.statLabel}>{t('vocabulary.stillLearning')}</Text>
            </View>
          </View>

          <Text style={styles.xpEarned}>{t('common.xpEarned', { count: stats.known * 2 })}</Text>

          <Pressable style={styles.doneButton} onPress={() => router.back()}>
            <Text style={styles.doneButtonText}>{t('common.done')}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const currentWord = words[currentIndex];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.closeButton} onPress={() => router.back()}>
          <Ionicons name="close" size={24} color={color.text} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>
            {theme ? lc(theme.name, theme.nameFr) : t('vocabulary.allVocabulary')}
          </Text>
          <Text style={styles.headerProgress}>
            {currentIndex + 1} / {words.length}
          </Text>
        </View>
        <View style={styles.headerRight} />
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

      {/* Card */}
      <View style={styles.cardContainer}>
        <GestureDetector gesture={panGesture}>
          <Animated.View style={[styles.cardWrapper, cardStyle]}>
            <Pressable onPress={flipCard} style={styles.cardPressable}>
              {/* Front of Card (Arabic) */}
              <Animated.View style={[styles.card, frontAnimatedStyle]}>
                <View style={styles.cardContent}>
                  <Text style={styles.cardArabic}>
                    {showVowels ? currentWord.arabicWithVowels : currentWord.arabic}
                  </Text>
                  <Text style={styles.cardTranslit}>
                    {currentWord.transliteration}
                  </Text>
                  <Pressable
                    style={[styles.cardAudioBtn, isSpeaking && styles.cardAudioBtnActive]}
                    onPress={(e) => {
                      e.stopPropagation();
                      speak(currentWord.arabicWithVowels || currentWord.arabic);
                    }}
                  >
                    <Ionicons name="volume-high" size={28} color={isSpeaking ? "#ffffff" : "#D4AF37"} />
                  </Pressable>
                </View>
                <Text style={styles.tapHint}>{t('vocabulary.tapToReveal')}</Text>
              </Animated.View>

              {/* Back of Card (English) */}
              <Animated.View style={[styles.card, styles.cardBack, backAnimatedStyle]}>
                <View style={styles.cardContent}>
                  <Text style={styles.cardEnglish}>{lc(currentWord.english, currentWord.french)}</Text>
                  <View style={styles.backArabic}>
                    <Text style={styles.backArabicText}>
                      {showVowels ? currentWord.arabicWithVowels : currentWord.arabic}
                    </Text>
                  </View>
                  {currentWord.exampleSentence && (
                    <View style={styles.exampleBox}>
                      <Text style={styles.exampleArabic}>
                        {currentWord.exampleSentence.arabic}
                      </Text>
                      <Text style={styles.exampleEnglish}>
                        {lc(currentWord.exampleSentence.english, currentWord.exampleSentence.french)}
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={styles.swipeHint}>{t('vocabulary.swipeHint')}</Text>
              </Animated.View>
            </Pressable>
          </Animated.View>
        </GestureDetector>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <Pressable
          style={[styles.actionButton, styles.learningButton]}
          onPress={() => handleNext(false)}
        >
          <Ionicons name="refresh" size={24} color={color.warning} />
          <Text style={styles.learningButtonText}>{t('vocabulary.stillLearning')}</Text>
        </Pressable>
        <Pressable
          style={[styles.actionButton, styles.knowButton]}
          onPress={() => handleNext(true)}
        >
          <Ionicons name="checkmark" size={24} color={color.progress} />
          <Text style={styles.knowButtonText}>{t('vocabulary.knowIt')}</Text>
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
  headerRight: {
    width: 40,
  },
  progressBarContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
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
  cardContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  cardWrapper: {
    width: '100%',
    height: 400,
  },
  cardPressable: {
    width: '100%',
    height: '100%',
  },
  card: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: color.surface,
    borderRadius: radius.xl,
    padding: 24,
    justifyContent: 'space-between',
  },
  cardBack: {
    backgroundColor: color.accentSoft,
  },
  cardContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardArabic: {
    fontFamily: font.arabic,
    lineHeight: 95,
    fontSize: 56,
    color: color.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  cardTranslit: {
    fontSize: 20,
    color: color.accentStrong,
    marginBottom: 24,
  },
  cardAudioBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: withAlpha(color.sacred, 0.13),
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardAudioBtnActive: {
    backgroundColor: color.sacred,
  },
  tapHint: {
    textAlign: 'center',
    color: color.textFaint,
    fontSize: 14,
  },
  swipeHint: {
    textAlign: 'center',
    color: color.textFaint,
    fontSize: 14,
  },
  cardEnglish: {
    fontSize: 32,
    color: color.text,
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  backArabic: {
    marginBottom: 20,
  },
  backArabicText: {
    fontFamily: font.arabic,
    lineHeight: 48,
    fontSize: 28,
    color: color.sacred,
    textAlign: 'center',
  },
  exampleBox: {
    backgroundColor: color.bg,
    borderRadius: radius.md,
    padding: 16,
    width: '100%',
  },
  exampleArabic: {
    fontFamily: font.arabic,
    lineHeight: 31,
    fontSize: 18,
    color: color.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  exampleEnglish: {
    fontSize: 14,
    color: color.textMuted,
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: radius.lg,
    borderWidth: 2,
  },
  learningButton: {
    backgroundColor: withAlpha(color.warning, 0.13),
    borderColor: color.warning,
  },
  learningButtonText: {
    color: color.warning,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  knowButton: {
    backgroundColor: withAlpha(color.progress, 0.13),
    borderColor: color.progress,
  },
  knowButtonText: {
    color: color.progress,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
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
    backgroundColor: withAlpha(color.sacred, 0.13),
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
  statsCard: {
    flexDirection: 'row',
    backgroundColor: color.surface,
    borderRadius: radius.lg,
    padding: 24,
    marginBottom: 24,
    width: '100%',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: color.progress,
  },
  statLabel: {
    fontSize: 14,
    color: color.textMuted,
    marginTop: 4,
  },
  statDivider: {
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
  doneButton: {
    backgroundColor: color.accentStrong,
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: radius.lg,
  },
  doneButtonText: {
    color: color.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

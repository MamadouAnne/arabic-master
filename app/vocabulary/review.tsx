import { View, Text, Pressable, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
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
import { getWordById } from '../../src/data/arabic/vocabulary';
import { useProgressStore } from '../../src/stores/progressStore';
import { useArabicSpeech } from '../../src/hooks/useArabicSpeech';
import { VocabularyWord, VocabularyReviewItem, ReviewRating } from '../../src/types/arabic';
import { font, color, radius } from '../../src/theme/tokens';
import { withAlpha } from '../../src/components/ui/Primitives';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Rating descriptions for SM-2 scale
const RATING_DESCRIPTIONS: Record<ReviewRating, { label: string; color: string; icon: string }> = {
  0: { label: 'Blackout', color: color.danger, icon: 'close-circle' },
  1: { label: 'Wrong', color: color.warning, icon: 'close' },
  2: { label: 'Hard', color: color.warning, icon: 'help' },
  3: { label: 'OK', color: '#84cc16', icon: 'checkmark' },
  4: { label: 'Good', color: color.progress, icon: 'checkmark-circle' },
  5: { label: 'Perfect', color: color.progress, icon: 'star' },
};

export default function VocabularyReviewScreen() {
  const { t } = useTranslation();
  const { lc } = useLocalizedContent();
  const {
    showVowels,
    getDueVocabularyReviews,
    updateVocabularyReviewItem,
    addXp,
    updateStreak,
  } = useProgressStore();

  const [dueReviews, setDueReviews] = useState<VocabularyReviewItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [currentWord, setCurrentWord] = useState<VocabularyWord | null>(null);
  const [stats, setStats] = useState({ correct: 0, incorrect: 0, totalXp: 0 });
  const { speak, isSpeaking } = useArabicSpeech();

  const rotateY = useSharedValue(0);

  useEffect(() => {
    const reviews = getDueVocabularyReviews();
    setDueReviews(reviews);
  }, []);

  useEffect(() => {
    if (dueReviews.length > 0 && currentIndex < dueReviews.length) {
      const word = getWordById(dueReviews[currentIndex].wordId);
      setCurrentWord(word || null);
    }
  }, [dueReviews, currentIndex]);

  const flipCard = () => {
    rotateY.value = withSpring(isFlipped ? 0 : 180);
    setIsFlipped(!isFlipped);
  };

  const handleRating = (rating: ReviewRating) => {
    if (!currentWord || currentIndex >= dueReviews.length) return;

    const reviewItem = dueReviews[currentIndex];
    updateVocabularyReviewItem(reviewItem.wordId, rating);

    // Calculate XP based on rating
    let xpEarned = 0;
    if (rating >= 3) {
      xpEarned = rating === 5 ? 5 : rating === 4 ? 3 : 2;
      setStats((prev) => ({
        ...prev,
        correct: prev.correct + 1,
        totalXp: prev.totalXp + xpEarned,
      }));
      addXp(xpEarned);
    } else {
      setStats((prev) => ({ ...prev, incorrect: prev.incorrect + 1 }));
    }

    // Move to next card
    if (currentIndex < dueReviews.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setIsFlipped(false);
      rotateY.value = 0;
    } else {
      // Session complete
      setCurrentIndex(dueReviews.length);
    }
  };

  const frontAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotateY: `${rotateY.value}deg` }],
    backfaceVisibility: 'hidden',
  }));

  const backAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotateY: `${rotateY.value + 180}deg` }],
    backfaceVisibility: 'hidden',
  }));

  // No reviews due
  if (dueReviews.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <Ionicons name="checkmark-done-circle" size={64} color={color.progress} />
          </View>
          <Text style={styles.emptyTitle}>{t('vocabulary.allCaughtUp')}</Text>
          <Text style={styles.emptyTitleArabic}>لا مراجعات اليوم</Text>
          <Text style={styles.emptySubtitle}>
            {t('vocabulary.noReviewsDue')}
          </Text>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>{t('vocabulary.backToVocabulary')}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // Session complete
  if (currentIndex >= dueReviews.length) {
    updateStreak();
    const accuracy = dueReviews.length > 0
      ? Math.round((stats.correct / dueReviews.length) * 100)
      : 0;

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.completeContainer}>
          <View style={styles.completeIcon}>
            <Ionicons name="trophy" size={64} color={color.sacred} />
          </View>
          <Text style={styles.completeTitle}>{t('vocabulary.reviewComplete')}</Text>
          <Text style={styles.completeTitleArabic}>اكتملت المراجعة</Text>

          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.correct}</Text>
              <Text style={styles.statLabel}>{t('common.correct')}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: color.warning }]}>
                {stats.incorrect}
              </Text>
              <Text style={styles.statLabel}>{t('vocabulary.needPractice')}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: color.accentStrong }]}>
                {accuracy}%
              </Text>
              <Text style={styles.statLabel}>{t('common.accuracy')}</Text>
            </View>
          </View>

          <Text style={styles.xpEarned}>{t('common.xpEarned', { count: stats.totalXp })}</Text>

          <Pressable style={styles.doneButton} onPress={() => router.back()}>
            <Text style={styles.doneButtonText}>{t('common.done')}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (!currentWord) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loading}>
          <Text style={styles.loadingText}>{t('common.loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const reviewItem = dueReviews[currentIndex];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.closeButton} onPress={() => router.back()}>
          <Ionicons name="close" size={24} color={color.text} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{t('vocabulary.spacedReview')}</Text>
          <Text style={styles.headerProgress}>
            {currentIndex + 1} / {dueReviews.length}
          </Text>
        </View>
        <View style={styles.headerBadge}>
          <Ionicons name="repeat" size={16} color={color.accentStrong} />
          <Text style={styles.headerBadgeText}>{reviewItem.repetitions}</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${((currentIndex + 1) / dueReviews.length) * 100}%` },
            ]}
          />
        </View>
      </View>

      {/* Card */}
      <View style={styles.cardContainer}>
        <Pressable onPress={flipCard} style={styles.cardWrapper}>
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
            <Text style={styles.rateHint}>{t('vocabulary.rateHint')}</Text>
          </Animated.View>
        </Pressable>
      </View>

      {/* Rating Buttons - Only show when flipped */}
      {isFlipped && (
        <View style={styles.ratingContainer}>
          <Text style={styles.ratingTitle}>{t('vocabulary.howWellRemember')}</Text>
          <View style={styles.ratingButtons}>
            {([0, 1, 2, 3, 4, 5] as ReviewRating[]).map((rating) => {
              const config = RATING_DESCRIPTIONS[rating];
              return (
                <Pressable
                  key={rating}
                  style={[styles.ratingButton, { borderColor: config.color }]}
                  onPress={() => handleRating(rating)}
                >
                  <Ionicons name={config.icon as any} size={20} color={config.color} />
                  <Text style={[styles.ratingLabel, { color: config.color }]}>
                    {config.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
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
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: withAlpha(color.accentStrong, 0.13),
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.md,
  },
  headerBadgeText: {
    color: color.accentStrong,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
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
    height: 350,
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
    backgroundColor: '#1e3a5f',
  },
  cardContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardArabic: {
    fontFamily: font.arabic,
    lineHeight: 88,
    fontSize: 52,
    color: color.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  cardTranslit: {
    fontSize: 18,
    color: color.accentStrong,
    marginBottom: 20,
  },
  cardAudioBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
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
  rateHint: {
    textAlign: 'center',
    color: color.textFaint,
    fontSize: 14,
  },
  cardEnglish: {
    fontSize: 28,
    color: color.text,
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 16,
  },
  backArabic: {
    marginBottom: 16,
  },
  backArabicText: {
    fontFamily: font.arabic,
    lineHeight: 41,
    fontSize: 24,
    color: color.sacred,
    textAlign: 'center',
  },
  exampleBox: {
    backgroundColor: color.bg,
    borderRadius: radius.md,
    padding: 14,
    width: '100%',
  },
  exampleArabic: {
    fontFamily: font.arabic,
    lineHeight: 27,
    fontSize: 16,
    color: color.text,
    textAlign: 'center',
    marginBottom: 6,
  },
  exampleEnglish: {
    fontSize: 13,
    color: color.textMuted,
    textAlign: 'center',
  },
  ratingContainer: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  ratingTitle: {
    color: color.textMuted,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
  },
  ratingButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  ratingButton: {
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: radius.md,
    borderWidth: 2,
    backgroundColor: color.surface,
    minWidth: 60,
  },
  ratingLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
  // Empty state
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: withAlpha(color.progress, 0.13),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: color.text,
    marginBottom: 8,
  },
  emptyTitleArabic: {
    fontFamily: font.arabic,
    lineHeight: 34,
    fontSize: 20,
    color: color.progress,
    marginBottom: 16,
  },
  emptySubtitle: {
    fontSize: 15,
    color: color.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  backButton: {
    backgroundColor: color.accentStrong,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: radius.md,
  },
  backButtonText: {
    color: color.text,
    fontSize: 16,
    fontWeight: '600',
  },
  // Complete state
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
    marginBottom: 4,
  },
  completeTitleArabic: {
    fontFamily: font.arabic,
    lineHeight: 34,
    fontSize: 20,
    color: color.sacred,
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
    fontSize: 32,
    fontWeight: 'bold',
    color: color.progress,
  },
  statLabel: {
    fontSize: 12,
    color: color.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: color.surfaceRaised,
    marginHorizontal: 12,
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

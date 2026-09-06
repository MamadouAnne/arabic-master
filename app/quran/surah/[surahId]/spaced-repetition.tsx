import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { getSurahById } from '../../../../src/data/arabic/quran';
import { useQuranSurah } from '../../../../src/hooks/useQuranData';
import { useQuranStore } from '../../../../src/stores/quranStore';
import { useAyahTranslations } from '../../../../src/hooks/useAyahTranslations';
import { useLocalizedContent } from '../../../../src/hooks/useLocalizedContent';
import { TajweedText } from '../../../../src/components/quran/TajweedText';
import { ReviewRating } from '../../../../src/types/quran';
import { font, color, radius } from '../../../../src/theme/tokens';
import { withAlpha } from '../../../../src/components/ui/Primitives';

const METHOD_COLOR = '#6366f1';

const RATING_CONFIG: { rating: ReviewRating; labelKey: string; color: string }[] = [
  { rating: 0, labelKey: 'spacedRepetition.rating0', color: '#e11d48' },
  { rating: 1, labelKey: 'spacedRepetition.rating1', color: '#f43f5e' },
  { rating: 2, labelKey: 'spacedRepetition.rating2', color: '#fb7185' },
  { rating: 3, labelKey: 'spacedRepetition.rating3', color: color.accent },
  { rating: 4, labelKey: 'spacedRepetition.rating4', color: color.accentStrong },
  { rating: 5, labelKey: 'spacedRepetition.rating5', color: '#4f46e5' },
];

export default function SpacedRepetitionScreen() {
  const { t } = useTranslation();
  const { lc } = useLocalizedContent();
  const { surahId } = useLocalSearchParams<{ surahId: string }>();

  const surah = getSurahById(surahId);
  const { ayahs, isLoading } = useQuranSurah(surahId);
  const {
    progress,
    getDueReviews,
    updateReviewItem,
    scheduleReview,
    updateMemorizationStreak,
    isAyahLearned,
  } = useQuranStore();
  const { translations: langTranslations } = useAyahTranslations(surah?.surahNumber ?? null);

  const [sessionItems, setSessionItems] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [lastRatingInfo, setLastRatingInfo] = useState<{ days: number } | null>(null);
  const [sessionRatings, setSessionRatings] = useState<number[]>([]);
  const [isSessionComplete, setIsSessionComplete] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const rateTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (rateTimeoutRef.current) clearTimeout(rateTimeoutRef.current);
    };
  }, []);

  // Initialize session: find due reviews or auto-schedule learned ayahs
  useEffect(() => {
    if (isInitialized || !surahId || ayahs.length === 0) return;

    const dueReviews = getDueReviews().filter((item) => item.surahId === surahId);
    const existingScheduleIds = new Set(
      progress.memorizationProgress.reviewSchedule.map((r) => r.ayahId)
    );

    if (dueReviews.length > 0) {
      setSessionItems(dueReviews.map((r) => r.ayahId));
    } else {
      // Auto-schedule all learned ayahs not yet in review schedule
      const learnedNotScheduled = ayahs
        .filter((a) => isAyahLearned(surahId, a.id) && !existingScheduleIds.has(a.id))
        .map((a) => a.id);

      for (const ayahId of learnedNotScheduled) {
        scheduleReview(ayahId, surahId);
      }

      // Re-check due reviews after scheduling
      const newDue = getDueReviews().filter((item) => item.surahId === surahId);
      setSessionItems(newDue.map((r) => r.ayahId));
    }

    setIsInitialized(true);
  }, [surahId, ayahs.length, isInitialized]);

  const currentAyah = useMemo(() => {
    if (sessionItems.length === 0 || currentIndex >= sessionItems.length) return null;
    return ayahs.find((a) => a.id === sessionItems[currentIndex]) ?? null;
  }, [ayahs, sessionItems, currentIndex]);

  const ayahTranslation = currentAyah
    ? langTranslations.get(currentAyah.ayahNumber)
      || lc(currentAyah.translation, currentAyah.translationFr)
      || currentAyah.words.map(w => w.translation).join(' ')
    : '';

  const handleReveal = () => {
    setIsRevealed(true);
  };

  const handleRate = (rating: ReviewRating) => {
    if (!currentAyah) return;

    updateReviewItem(currentAyah.id, rating);
    updateMemorizationStreak();

    // Find the updated item to get the new interval
    const updatedSchedule = useQuranStore.getState().progress.memorizationProgress.reviewSchedule;
    const updatedItem = updatedSchedule.find((r) => r.ayahId === currentAyah.id);
    const days = updatedItem?.interval ?? 1;

    setSessionRatings((prev) => [...prev, rating]);
    setLastRatingInfo({ days });

    // Show interval briefly, then advance
    if (rateTimeoutRef.current) clearTimeout(rateTimeoutRef.current);
    rateTimeoutRef.current = setTimeout(() => {
      setLastRatingInfo(null);
      setIsRevealed(false);

      if (currentIndex + 1 >= sessionItems.length) {
        setIsSessionComplete(true);
      } else {
        setCurrentIndex((prev) => prev + 1);
      }
    }, 1500);
  };

  const handleStartNewSession = () => {
    const dueReviews = getDueReviews().filter((item) => item.surahId === surahId);
    if (dueReviews.length > 0) {
      setSessionItems(dueReviews.map((r) => r.ayahId));
      setCurrentIndex(0);
      setIsRevealed(false);
      setLastRatingInfo(null);
      setSessionRatings([]);
      setIsSessionComplete(false);
    }
  };

  // --- Guards ---

  if (!surah) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>{t('common.notFound')}</Text>
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={METHOD_COLOR} />
        </View>
      </SafeAreaView>
    );
  }

  if (isInitialized && sessionItems.length === 0) {
    const hasLearnedAyahs = ayahs.some((a) => isAyahLearned(surahId, a.id));
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable style={styles.closeButton} onPress={() => router.back()}>
            <Ionicons name="close" size={24} color={color.text} />
          </Pressable>
          <View style={styles.headerCenter}>
            <Text style={styles.surahNameArabic}>{surah.nameArabic}</Text>
            <Text style={styles.methodTitle}>{t('spacedRepetition.title')}</Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar-outline" size={64} color={color.textFaint} />
          <Text style={styles.emptyTitle}>
            {hasLearnedAyahs ? t('spacedRepetition.noDueReviews') : t('spacedRepetition.noLearnedAyahs')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // --- Session Complete ---

  if (isSessionComplete) {
    const avgRating =
      sessionRatings.length > 0
        ? (sessionRatings.reduce((a, b) => a + b, 0) / sessionRatings.length).toFixed(1)
        : '0.0';
    const streak = progress.memorizationProgress.currentStreak;
    const newDueCount = getDueReviews().filter((item) => item.surahId === surahId).length;

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable style={styles.closeButton} onPress={() => router.back()}>
            <Ionicons name="close" size={24} color={color.text} />
          </Pressable>
          <View style={styles.headerCenter}>
            <Text style={styles.surahNameArabic}>{surah.nameArabic}</Text>
            <Text style={styles.methodTitle}>{t('spacedRepetition.title')}</Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <View style={styles.completeCard}>
            <View style={styles.completeIconCircle}>
              <Ionicons name="checkmark-circle" size={56} color={METHOD_COLOR} />
            </View>
            <Text style={styles.completeTitle}>{t('spacedRepetition.sessionComplete')}</Text>

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{sessionRatings.length}</Text>
                <Text style={styles.statLabel}>{t('spacedRepetition.reviewed')}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{avgRating}</Text>
                <Text style={styles.statLabel}>{t('spacedRepetition.avgRating')}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{streak}</Text>
                <Text style={styles.statLabel}>{t('spacedRepetition.streak')}</Text>
              </View>
            </View>

            {newDueCount > 0 && (
              <Pressable style={styles.newSessionButton} onPress={handleStartNewSession}>
                <Ionicons name="refresh" size={20} color={color.text} />
                <Text style={styles.newSessionButtonText}>
                  {t('spacedRepetition.startNewSession')}
                </Text>
              </Pressable>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // --- Main Flashcard UI ---

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.closeButton} onPress={() => router.back()}>
          <Ionicons name="close" size={24} color={color.text} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.surahNameArabic}>{surah.nameArabic}</Text>
          <Text style={styles.methodTitle}>{t('spacedRepetition.title')}</Text>
        </View>
        <View style={styles.cardCounter}>
          <Text style={styles.cardCounterText}>
            {currentIndex + 1}/{sessionItems.length}
          </Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Progress bar */}
        <View style={styles.progressBarBg}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${((currentIndex + 1) / sessionItems.length) * 100}%` },
            ]}
          />
        </View>

        {/* Remaining count */}
        <Text style={styles.remainingText}>
          {t('spacedRepetition.cardsRemaining', { count: sessionItems.length - currentIndex })}
        </Text>

        {/* Flashcard */}
        {currentAyah && (
          <View style={styles.flashcard}>
            {/* Ayah number badge */}
            <View style={styles.ayahBadge}>
              <Text style={styles.ayahBadgeText}>{currentAyah.ayahNumber}</Text>
            </View>

            {/* Transliteration hint (always visible) */}
            <Text style={styles.transliterationHint}>{currentAyah.transliteration}</Text>

            {/* Arabic text: hidden or revealed */}
            {!isRevealed ? (
              <Pressable style={styles.revealButton} onPress={handleReveal}>
                <Ionicons name="eye-outline" size={24} color={METHOD_COLOR} />
                <Text style={styles.revealButtonText}>{t('spacedRepetition.reveal')}</Text>
              </Pressable>
            ) : (
              <View style={styles.revealedContent}>
                <View style={styles.arabicContainer}>
                  <TajweedText
                    text={currentAyah.textUthmani}
                    tajweedRules={currentAyah.tajweedRules}
                    showTajweed={progress.settings.showTajweedColors}
                    fontSize={32}
                  />
                </View>
                <Text style={styles.translationText}>{ayahTranslation}</Text>
              </View>
            )}

            {/* Next review info overlay */}
            {lastRatingInfo && (
              <View style={styles.ratingInfoOverlay}>
                <Ionicons name="time-outline" size={20} color={METHOD_COLOR} />
                <Text style={styles.ratingInfoText}>
                  {lastRatingInfo.days === 0
                    ? t('spacedRepetition.nextReviewToday')
                    : t('spacedRepetition.nextReview', { days: lastRatingInfo.days })}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Rating buttons */}
        {isRevealed && !lastRatingInfo && (
          <View style={styles.ratingSection}>
            <Text style={styles.ratingPrompt}>{t('spacedRepetition.rateRecall')}</Text>
            <View style={styles.ratingGrid}>
              {RATING_CONFIG.map(({ rating, labelKey, color }) => (
                <Pressable
                  key={rating}
                  style={[styles.ratingButton, { backgroundColor: `${color}20`, borderColor: `${color}40` }]}
                  onPress={() => handleRate(rating)}
                >
                  <Text style={[styles.ratingNumber, { color }]}>{rating}</Text>
                  <Text style={[styles.ratingLabel, { color }]}>{t(labelKey)}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
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
  errorText: {
    color: color.textMuted,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 100,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: color.borderSubtle,
  },
  closeButton: {
    padding: 8,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  surahNameArabic: {
    fontFamily: font.arabic,
    lineHeight: 40,
    color: color.sacred,
    fontSize: 24,
    fontWeight: 'bold',
  },
  methodTitle: {
    color: METHOD_COLOR,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  headerSpacer: {
    width: 40,
  },
  cardCounter: {
    padding: 8,
  },
  cardCounterText: {
    color: color.textFaint,
    fontSize: 14,
    fontWeight: '600',
  },

  // Empty state
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 16,
  },
  emptyTitle: {
    color: color.textMuted,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },

  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  // Progress bar
  progressBarBg: {
    height: 4,
    backgroundColor: color.surface,
    borderRadius: 2,
    marginTop: 16,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 4,
    backgroundColor: METHOD_COLOR,
    borderRadius: 2,
  },
  remainingText: {
    color: color.textFaint,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 16,
  },

  // Flashcard
  flashcard: {
    backgroundColor: color.surface,
    borderRadius: radius.xl,
    padding: 24,
    borderWidth: 1,
    borderColor: color.border,
    alignItems: 'center',
    minHeight: 240,
  },
  ayahBadge: {
    width: 40,
    height: 40,
    borderRadius: radius.xl,
    backgroundColor: `${METHOD_COLOR}20`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  ayahBadgeText: {
    color: METHOD_COLOR,
    fontSize: 16,
    fontWeight: 'bold',
  },
  transliterationHint: {
    color: color.textMuted,
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },

  // Reveal button
  revealButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: `${METHOD_COLOR}15`,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: `${METHOD_COLOR}30`,
    marginTop: 12,
  },
  revealButtonText: {
    color: METHOD_COLOR,
    fontSize: 16,
    fontWeight: '600',
  },

  // Revealed content
  revealedContent: {
    width: '100%',
    alignItems: 'center',
  },
  arabicContainer: {
    width: '100%',
    marginBottom: 16,
  },
  translationText: {
    color: color.textMuted,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: color.border,
    width: '100%',
  },

  // Rating info overlay
  ratingInfoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: withAlpha(color.bg, 0.93),
    paddingVertical: 14,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  ratingInfoText: {
    color: METHOD_COLOR,
    fontSize: 14,
    fontWeight: '600',
  },

  // Rating section
  ratingSection: {
    marginTop: 20,
  },
  ratingPrompt: {
    color: color.text,
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 14,
  },
  ratingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
  },
  ratingButton: {
    width: '30%',
    paddingVertical: 14,
    borderRadius: radius.md,
    alignItems: 'center',
    borderWidth: 1,
    gap: 4,
  },
  ratingNumber: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  ratingLabel: {
    fontSize: 11,
    fontWeight: '600',
  },

  // Session complete
  completeCard: {
    backgroundColor: color.surface,
    borderRadius: radius.xl,
    padding: 32,
    marginTop: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: color.border,
  },
  completeIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${METHOD_COLOR}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  completeTitle: {
    color: color.text,
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'space-around',
    marginBottom: 28,
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    color: METHOD_COLOR,
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    color: color.textFaint,
    fontSize: 12,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: color.surfaceRaised,
  },
  newSessionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: METHOD_COLOR,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: radius.md,
  },
  newSessionButtonText: {
    color: color.text,
    fontSize: 15,
    fontWeight: '600',
  },
});

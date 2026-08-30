import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { getSurahById } from '../../../../src/data/arabic/quran';
import { useQuranSurah } from '../../../../src/hooks/useQuranData';
import { useQuranStore } from '../../../../src/stores/quranStore';
import { useAyahTranslations } from '../../../../src/hooks/useAyahTranslations';
import { useLocalizedContent } from '../../../../src/hooks/useLocalizedContent';
import { TajweedText } from '../../../../src/components/quran/TajweedText';
import { ReviewRating } from '../../../../src/types/quran';
import { buildAyahScene, AnchorWord } from '../../../../src/utils/sceneBuilder';
import { font, color, radius } from '../../../../src/theme/tokens';
import { withAlpha } from '../../../../src/components/ui/Primitives';

// ============ Types & Constants ============

type VisualizationMode = 'study' | 'review';

const METHOD_COLOR = '#3b82f6';

// ============ Anchor Word Chip ============

function AnchorChip({ anchor, index, hidden, onReveal }: { anchor: AnchorWord; index: number; hidden?: boolean; onReveal?: () => void }) {
  const { t } = useTranslation();
  if (hidden) {
    return (
      <Pressable style={styles.hiddenAnchorChip} onPress={onReveal} accessibilityRole="button" accessibilityLabel={t('common.revealWord', { index })}>
        <Text style={styles.hiddenAnchorIndex}>{index}</Text>
        <Ionicons name="eye-off-outline" size={22} color={color.textFaint} />
        <Text style={styles.hiddenAnchorLabel}>{t('common.tapToReveal')}</Text>
      </Pressable>
    );
  }
  if (onReveal) {
    return (
      <Pressable style={styles.anchorChip} onPress={onReveal} accessibilityRole="button" accessibilityLabel={`Hide word ${index}`}>
        <Text style={styles.anchorIndex}>{index}</Text>
        <Text style={styles.anchorArabic}>{anchor.arabic}</Text>
        <Text style={styles.anchorMeaning} numberOfLines={2}>{anchor.meaning}</Text>
      </Pressable>
    );
  }
  return (
    <View style={styles.anchorChip}>
      <Text style={styles.anchorIndex}>{index}</Text>
      <Text style={styles.anchorArabic}>{anchor.arabic}</Text>
      <Text style={styles.anchorMeaning} numberOfLines={2}>{anchor.meaning}</Text>
    </View>
  );
}

// ============ Component ============

export default function VisualizationScreen() {
  const { t } = useTranslation();
  const { lc } = useLocalizedContent();
  const { surahId } = useLocalSearchParams<{ surahId: string }>();
  const surah = getSurahById(surahId);
  const { ayahs, isLoading } = useQuranSurah(surahId);
  const { progress, markAyahLearned, scheduleReview, updateReviewItem } = useQuranStore();
  const { translations: langTranslations } = useAyahTranslations(surah?.surahNumber ?? null);

  const [currentAyahIndex, setCurrentAyahIndex] = useState(0);
  const [vizMode, setVizMode] = useState<VisualizationMode>('study');
  const [isAyahRevealed, setIsAyahRevealed] = useState(false);
  const [sceneMemorized, setSceneMemorized] = useState(false);
  const [revealedAnchors, setRevealedAnchors] = useState<Set<number>>(new Set());

  const currentAyah = ayahs[currentAyahIndex];
  const totalAyahs = ayahs.length;

  const ayahTranslation = currentAyah
    ? langTranslations.get(currentAyah.ayahNumber)
      || lc(currentAyah.translation, currentAyah.translationFr)
      || currentAyah.words.map(w => w.translation).join(' ')
    : '';

  // Build the scene for the current ayah
  const scene = useMemo(() => {
    if (!currentAyah) return null;
    return buildAyahScene(currentAyah);
  }, [currentAyah?.id]);

  const dominantColor = scene?.dominantColor ?? '#a3a398';

  // ---- Guards ----

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
          <Text style={styles.loadingText}>{t('surahLearnMode.loadingVerses')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!currentAyah || !scene) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>{t('common.notFound')}</Text>
      </SafeAreaView>
    );
  }

  // ---- Handlers ----

  const handleMemorized = () => {
    setSceneMemorized(true);
    markAyahLearned(surahId, currentAyah.id);
    advanceAyah();
  };

  const handleReveal = () => {
    setIsAyahRevealed(true);
  };

  const handleRate = (rating: ReviewRating) => {
    scheduleReview(currentAyah.id, surahId);
    updateReviewItem(currentAyah.id, rating);
    advanceAyah();
  };

  const advanceAyah = () => {
    if (currentAyahIndex < totalAyahs - 1) {
      setCurrentAyahIndex((prev) => prev + 1);
    } else {
      router.back();
      return;
    }
    setIsAyahRevealed(false);
    setSceneMemorized(false);
    setRevealedAnchors(new Set());
  };

  const handlePrevAyah = () => {
    if (currentAyahIndex > 0) {
      setCurrentAyahIndex((prev) => prev - 1);
      setIsAyahRevealed(false);
      setSceneMemorized(false);
      setRevealedAnchors(new Set());
    }
  };

  const handleNextAyah = () => {
    if (currentAyahIndex < totalAyahs - 1) {
      setCurrentAyahIndex((prev) => prev + 1);
      setIsAyahRevealed(false);
      setSceneMemorized(false);
      setRevealedAnchors(new Set());
    }
  };

  const handleToggleAnchor = (index: number) => {
    setRevealedAnchors((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  // The dominant element — one icon per room
  const mainElement = scene?.elements?.[0];

  // ---- Render ----

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={styles.closeButton}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel={t('common.back')}
        >
          <Ionicons name="close" size={24} color={color.text} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.surahNameArabic}>{surah.nameArabic}</Text>
          <Text style={styles.headerMethodLabel}>{t('visualization.title')}</Text>
        </View>
        <View style={styles.ayahCounter}>
          <Text style={styles.ayahCounterText}>
            {currentAyahIndex + 1}/{totalAyahs}
          </Text>
        </View>
      </View>

      {/* Mode Toggle */}
      <View style={styles.modeToggleContainer}>
        <View style={styles.modeToggle}>
          <Pressable
            style={[styles.modePill, vizMode === 'study' && styles.modePillActive]}
            onPress={() => {
              setVizMode('study');
              setIsAyahRevealed(false);
              setSceneMemorized(false);
              setRevealedAnchors(new Set());
            }}
            accessibilityRole="button"
            accessibilityLabel={t('visualization.modeStudy')}
          >
            <Ionicons
              name="book-outline"
              size={16}
              color={vizMode === 'study' ? '#ffffff' : '#94a3b8'}
            />
            <Text style={[styles.modePillText, vizMode === 'study' && styles.modePillTextActive]}>
              {t('visualization.modeStudy')}
            </Text>
          </Pressable>
          <Pressable
            style={[styles.modePill, vizMode === 'review' && styles.modePillActive]}
            onPress={() => {
              setVizMode('review');
              setIsAyahRevealed(false);
              setSceneMemorized(false);
              setRevealedAnchors(new Set());
            }}
            accessibilityRole="button"
            accessibilityLabel={t('visualization.modeReview')}
          >
            <Ionicons
              name="refresh-outline"
              size={16}
              color={vizMode === 'review' ? '#ffffff' : '#94a3b8'}
            />
            <Text style={[styles.modePillText, vizMode === 'review' && styles.modePillTextActive]}>
              {t('visualization.modeReview')}
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Room Card — Spatial Loci */}
        <View style={[styles.roomCard, { borderTopColor: dominantColor }]}>
          {/* Room header */}
          <View style={styles.roomHeader}>
            <Text style={[styles.sceneSummary, { color: dominantColor }]}>
              {scene.sceneSummary}
            </Text>
            <Text style={styles.roomLabel}>
              {t('visualization.room', { number: currentAyahIndex + 1 })} — {t('activeRecall.ayahNumber', { number: currentAyah.ayahNumber })}
            </Text>
          </View>

          {/* Single Room Icon */}
          {mainElement && (
            <View style={styles.roomIconArea}>
              <View style={[styles.roomIconCircle, { backgroundColor: mainElement.color + '15', borderColor: mainElement.color + '25' }]}>
                <Text style={styles.roomIconEmoji}>{mainElement.emoji}</Text>
                <Ionicons name={mainElement.ionicon as any} size={22} color={mainElement.color} style={{ marginTop: 4 }} />
                <Text style={[styles.roomIconLabel, { color: mainElement.color }]}>{mainElement.label}</Text>
              </View>
            </View>
          )}

          {/* Memory Anchors */}
          {/* Study mode: show anchors */}
          {scene.anchorWords.length > 0 && vizMode === 'study' && (
            <View style={styles.anchorsSection}>
              <View style={[styles.anchorsDivider, { backgroundColor: dominantColor + '30' }]} />
              <Text style={styles.anchorsTitle}>{t('visualization.memoryAnchors')}</Text>
              <View style={styles.anchorsRow}>
                {scene.anchorWords.map((anchor, i) => (
                  <AnchorChip key={`anchor-${i}`} anchor={anchor} index={i + 1} />
                ))}
              </View>
            </View>
          )}

          {/* Review mode: tap each chip to reveal */}
          {scene.anchorWords.length > 0 && vizMode === 'review' && (
            <View style={styles.anchorsSection}>
              <View style={[styles.anchorsDivider, { backgroundColor: dominantColor + '30' }]} />
              <Text style={styles.anchorsTitle}>{t('visualization.memoryAnchors')}</Text>
              <View style={styles.anchorsRow}>
                {scene.anchorWords.map((anchor, i) => (
                  <AnchorChip
                    key={`anchor-${i}`}
                    anchor={anchor}
                    index={i + 1}
                    hidden={!revealedAnchors.has(i)}
                    onReveal={() => handleToggleAnchor(i)}
                  />
                ))}
              </View>
              {revealedAnchors.size > 0 && revealedAnchors.size < scene.anchorWords.length && (
                <Text style={styles.revealProgress}>
                  {revealedAnchors.size}/{scene.anchorWords.length} revealed
                </Text>
              )}
            </View>
          )}
        </View>

        {/* Ayah Text — Study mode shows full, Review mode shows ayah to help recall anchors */}
        {vizMode === 'study' && (
          <View style={[styles.ayahTextContainer, { borderLeftColor: dominantColor }]}>
            <View style={styles.ayahTextContent}>
              <TajweedText
                text={currentAyah.textUthmani}
                tajweedRules={currentAyah.tajweedRules}
                showTajweed={progress.settings.showTajweedColors}
                fontSize={24}
              />
              {currentAyah.transliteration && (
                <Text style={styles.transliteration}>{currentAyah.transliteration}</Text>
              )}
              <Text style={styles.translation}>{ayahTranslation}</Text>
            </View>
          </View>
        )}

        {vizMode === 'review' && (
          <View style={[styles.ayahTextContainer, { borderLeftColor: dominantColor }]}>
            <View style={styles.ayahTextContent}>
              <TajweedText
                text={currentAyah.textUthmani}
                tajweedRules={currentAyah.tajweedRules}
                showTajweed={progress.settings.showTajweedColors}
                fontSize={24}
              />
              <Text style={styles.translation}>{ayahTranslation}</Text>
            </View>
          </View>
        )}

        {/* Instruction & Actions */}
        {vizMode === 'study' && (
          <View style={styles.instructionCard}>
            <Ionicons name="eye-outline" size={20} color={METHOD_COLOR} />
            <Text style={styles.instructionText}>
              {t('visualization.studyInstruction')}
            </Text>
          </View>
        )}

        {vizMode === 'study' && !sceneMemorized && (
          <Pressable style={styles.actionButton} onPress={handleMemorized}>
            <Ionicons name="checkmark-circle-outline" size={20} color={color.text} />
            <Text style={styles.actionButtonText}>
              {t('visualization.memorizedScene')}
            </Text>
          </Pressable>
        )}

        {vizMode === 'review' && revealedAnchors.size < (scene?.anchorWords.length ?? 0) && (
          <View style={styles.instructionCard}>
            <Ionicons name="hand-left-outline" size={20} color={METHOD_COLOR} />
            <Text style={styles.instructionText}>
              {t('visualization.reviewInstruction', 'Tap each card to reveal the word. Try to recall before tapping!')}
            </Text>
          </View>
        )}

        {vizMode === 'review' && revealedAnchors.size === (scene?.anchorWords.length ?? 0) && (scene?.anchorWords.length ?? 0) > 0 && (
          <View style={styles.ratingSection}>
            <Text style={styles.ratingTitle}>{t('visualization.rateRecall')}</Text>
            <View style={styles.ratingButtons}>
              <Pressable
                style={[styles.ratingButton, styles.ratingYes]}
                onPress={() => handleRate(5)}
              >
                <Ionicons name="checkmark-circle-outline" size={22} color={color.progress} />
                <Text style={[styles.ratingButtonText, { color: color.progress }]}>
                  {t('visualization.recallYes')}
                </Text>
              </Pressable>
              <Pressable
                style={[styles.ratingButton, styles.ratingPartial]}
                onPress={() => handleRate(3)}
              >
                <Ionicons name="remove-circle-outline" size={22} color={color.sacredBright} />
                <Text style={[styles.ratingButtonText, { color: color.sacredBright }]}>
                  {t('visualization.recallPartial')}
                </Text>
              </Pressable>
              <Pressable
                style={[styles.ratingButton, styles.ratingNo]}
                onPress={() => handleRate(1)}
              >
                <Ionicons name="close-circle-outline" size={22} color="#fb7185" />
                <Text style={[styles.ratingButtonText, { color: '#fb7185' }]}>
                  {t('visualization.recallNo')}
                </Text>
              </Pressable>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <Pressable
          style={[styles.navButton, currentAyahIndex === 0 && styles.navButtonDisabled]}
          onPress={handlePrevAyah}
          disabled={currentAyahIndex === 0}
          accessibilityRole="button"
          accessibilityLabel={t('common.previous')}
        >
          <Ionicons
            name="chevron-back"
            size={20}
            color={currentAyahIndex === 0 ? '#475569' : '#f5f5f0'}
          />
          <Text
            style={[styles.navButtonText, currentAyahIndex === 0 && styles.navButtonTextDisabled]}
          >
            {t('common.previous')}
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.navButton,
            currentAyahIndex >= totalAyahs - 1 && styles.navButtonDisabled,
          ]}
          onPress={handleNextAyah}
          disabled={currentAyahIndex >= totalAyahs - 1}
          accessibilityRole="button"
          accessibilityLabel={t('common.next')}
        >
          <Text
            style={[
              styles.navButtonText,
              currentAyahIndex >= totalAyahs - 1 && styles.navButtonTextDisabled,
            ]}
          >
            {t('common.next')}
          </Text>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={currentAyahIndex >= totalAyahs - 1 ? '#475569' : '#f5f5f0'}
          />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

// ============ Styles ============

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.bg,
  },
  errorText: {
    color: color.textMuted,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: color.textMuted,
    fontSize: 16,
    marginTop: 16,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
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
    flex: 1,
    alignItems: 'center',
  },
  surahNameArabic: {
    fontFamily: font.arabic,
    lineHeight: 37,
    color: color.sacred,
    fontSize: 22,
    fontWeight: 'bold',
  },
  headerMethodLabel: {
    color: METHOD_COLOR,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  ayahCounter: {
    backgroundColor: color.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: color.border,
  },
  ayahCounterText: {
    color: color.text,
    fontSize: 13,
    fontWeight: '600',
  },

  // Mode Toggle
  modeToggleContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: color.surface,
    borderRadius: radius.md,
    padding: 4,
    borderWidth: 1,
    borderColor: color.border,
  },
  modePill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: radius.md,
    gap: 6,
  },
  modePillActive: {
    backgroundColor: METHOD_COLOR,
  },
  modePillText: {
    color: color.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  modePillTextActive: {
    color: color.text,
  },

  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 16,
  },

  // Room Card — the spatial container
  roomCard: {
    backgroundColor: color.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: color.border,
    borderTopWidth: 3,
    overflow: 'hidden',
  },
  roomHeader: {
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 8,
    paddingHorizontal: 16,
  },
  sceneSummary: {
    fontSize: 18,
    fontWeight: '700',
  },
  roomLabel: {
    color: color.textMuted,
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },

  // Single Room Icon
  roomIconArea: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  roomIconCircle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roomIconEmoji: {
    fontSize: 56,
    lineHeight: 62,
  },
  roomIconLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },

  // Anchors Section
  anchorsSection: {
    paddingHorizontal: 12,
    paddingBottom: 16,
  },
  anchorsDivider: {
    height: 1,
    marginBottom: 10,
  },
  anchorsTitle: {
    color: color.textMuted,
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  anchorsRow: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    justifyContent: 'center',
    rowGap: 10,
    columnGap: 10,
  },

  // Anchor Chip — clean word-by-word display
  anchorChip: {
    backgroundColor: color.bg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: color.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexBasis: '30%',
    flexGrow: 1,
    minHeight: 90,
  },
  anchorIndex: {
    color: color.textFaint,
    fontSize: 9,
    fontWeight: '700',
    marginBottom: 3,
  },
  anchorArabic: {
    fontFamily: font.arabic,
    lineHeight: 29,
    color: color.sacred,
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
  },
  anchorMeaning: {
    color: color.textMuted,
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 15,
  },
  hiddenAnchorChip: {
    backgroundColor: color.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: color.border,
    borderStyle: 'dashed',
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexBasis: '30%',
    flexGrow: 1,
    minHeight: 90,
  },
  hiddenAnchorIndex: {
    color: color.textFaint,
    fontSize: 9,
    fontWeight: '700',
    marginBottom: 3,
  },
  hiddenAnchorLabel: {
    color: color.textFaint,
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },
  revealProgress: {
    color: color.textMuted,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 8,
  },

  // Ayah Text
  ayahTextContainer: {
    width: '100%',
    borderLeftWidth: 4,
    borderRadius: radius.md,
    backgroundColor: color.surface,
    paddingLeft: 16,
    paddingRight: 16,
    paddingVertical: 16,
  },
  ayahTextContent: {
    gap: 12,
  },
  transliteration: {
    color: color.textMuted,
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 22,
  },
  translation: {
    color: color.textMuted,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },

  // Instruction Card
  instructionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${METHOD_COLOR}10`,
    borderRadius: radius.md,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: `${METHOD_COLOR}30`,
  },
  instructionText: {
    color: METHOD_COLOR,
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },

  // Action Button
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: METHOD_COLOR,
    borderRadius: radius.md,
    paddingVertical: 16,
    gap: 8,
  },
  actionButtonText: {
    color: color.text,
    fontSize: 16,
    fontWeight: '700',
  },

  // Rating Section
  ratingSection: {
    gap: 12,
  },
  ratingTitle: {
    color: color.text,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  ratingButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  ratingButton: {
    flex: 1,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
  },
  ratingYes: {
    backgroundColor: withAlpha(color.progress, 0.08),
    borderColor: withAlpha(color.progress, 0.19),
  },
  ratingPartial: {
    backgroundColor: withAlpha(color.sacredBright, 0.08),
    borderColor: withAlpha(color.sacredBright, 0.19),
  },
  ratingNo: {
    backgroundColor: '#fb718515',
    borderColor: '#fb718530',
  },
  ratingButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Bottom Navigation
  bottomNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: color.border,
    backgroundColor: color.bg,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  navButtonDisabled: {
    opacity: 0.4,
  },
  navButtonText: {
    color: color.text,
    fontSize: 14,
    fontWeight: '500',
  },
  navButtonTextDisabled: {
    color: color.textFaint,
  },
});

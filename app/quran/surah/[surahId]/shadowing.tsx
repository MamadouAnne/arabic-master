import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { getSurahById } from '../../../../src/data/arabic/quran';
import { useQuranSurah } from '../../../../src/hooks/useQuranData';
import { useQuranStore } from '../../../../src/stores/quranStore';
import { TajweedText } from '../../../../src/components/quran/TajweedText';
import { quranAudioService, AudioState } from '../../../../src/services/quranAudioService';
import { font, color, radius } from '../../../../src/theme/tokens';
import { withAlpha } from '../../../../src/components/ui/Primitives';

type ShadowPhase = 'listen' | 'shadow' | 'solo';

const METHOD_COLOR = color.accent;

export default function ShadowingScreen() {
  const { t } = useTranslation();
  const { surahId } = useLocalSearchParams<{ surahId: string }>();
  const surah = getSurahById(surahId);
  const { ayahs, isLoading } = useQuranSurah(surahId);
  const { markAyahLearned, updateReviewItem, scheduleReview, isAyahLearned } = useQuranStore();

  const isMountedRef = useRef(true);

  const [currentAyahIndex, setCurrentAyahIndex] = useState(0);
  const [phase, setPhase] = useState<ShadowPhase>('listen');
  const [audioState, setAudioState] = useState<AudioState>('idle');
  const [phaseComplete, setPhaseComplete] = useState(false);

  const currentAyah = ayahs[currentAyahIndex];
  const totalAyahs = ayahs.length;

  // Reset state when phase or ayah changes (no auto-play)
  useEffect(() => {
    if (!currentAyah || !surah) return;
    setPhaseComplete(false);
    if (phase === 'solo') {
      quranAudioService.stop();
    }
  }, [phase, currentAyahIndex]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      quranAudioService.stop();
    };
  }, []);

  const playAudio = () => {
    if (!surah || !currentAyah) return;
    quranAudioService.playAyah(surah.surahNumber, currentAyah.ayahNumber, {
      rate: 0.75,
      onStateChange: (state: AudioState) => {
        if (isMountedRef.current) setAudioState(state);
      },
      onComplete: () => {
        if (isMountedRef.current) {
          setAudioState('idle');
          setPhaseComplete(true);
        }
      },
      onError: () => {
        if (isMountedRef.current) setAudioState('idle');
      },
    });
  };

  const handleNextPhase = () => {
    if (phase === 'listen') {
      setPhase('shadow');
    } else if (phase === 'shadow') {
      setPhase('solo');
    }
  };

  const handleRate = (rating: 'needsWork' | 'good' | 'mastered') => {
    if (!currentAyah) return;
    const ayahId = currentAyah.id;

    if (rating === 'needsWork') {
      scheduleReview(ayahId, surahId);
      updateReviewItem(ayahId, 2);
    } else if (rating === 'good') {
      markAyahLearned(surahId, ayahId);
      scheduleReview(ayahId, surahId);
      updateReviewItem(ayahId, 4);
    } else if (rating === 'mastered') {
      markAyahLearned(surahId, ayahId);
      scheduleReview(ayahId, surahId);
      updateReviewItem(ayahId, 5);
    }

    // Advance to next ayah or go back if last
    if (currentAyahIndex < totalAyahs - 1) {
      setCurrentAyahIndex((prev) => prev + 1);
      setPhase('listen');
    } else {
      router.back();
    }
  };

  const handlePrevAyah = () => {
    if (currentAyahIndex > 0) {
      quranAudioService.stop();
      setCurrentAyahIndex((prev) => prev - 1);
      setPhase('listen');
    }
  };

  const handleNextAyah = () => {
    if (currentAyahIndex < totalAyahs - 1) {
      quranAudioService.stop();
      setCurrentAyahIndex((prev) => prev + 1);
      setPhase('listen');
    }
  };

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
        <ActivityIndicator size="large" color={METHOD_COLOR} style={styles.loader} />
      </SafeAreaView>
    );
  }

  if (!currentAyah) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>{t('common.notFound')}</Text>
      </SafeAreaView>
    );
  }

  const phases: ShadowPhase[] = ['listen', 'shadow', 'solo'];
  const currentPhaseIndex = phases.indexOf(phase);

  const getPhaseInstruction = () => {
    switch (phase) {
      case 'listen':
        return audioState === 'playing'
          ? t('shadowing.playing')
          : t('shadowing.tapToPlay');
      case 'shadow':
        return t('shadowing.speakAlong');
      case 'solo':
        return t('shadowing.reciteAlone');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={styles.closeButton}
          onPress={() => {
            quranAudioService.stop();
            router.back();
          }}
          accessibilityRole="button"
          accessibilityLabel={t('common.back')}
        >
          <Ionicons name="close" size={24} color={color.text} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.surahNameArabic}>{surah.nameArabic}</Text>
          <Text style={styles.headerMethodLabel}>{t('shadowing.title')}</Text>
        </View>
        <View style={styles.ayahCounter}>
          <Text style={styles.ayahCounterText}>
            {currentAyahIndex + 1}/{totalAyahs}
          </Text>
        </View>
      </View>

      {/* Phase Indicator */}
      <View style={styles.phaseIndicator}>
        {phases.map((p, index) => {
          const isActive = index === currentPhaseIndex;
          const isCompleted = index < currentPhaseIndex;
          return (
            <Pressable
              key={p}
              style={styles.phaseStep}
              onPress={() => {
                quranAudioService.stop();
                setPhase(p);
              }}
              accessibilityRole="button"
              accessibilityLabel={p}
            >
              <View
                style={[
                  styles.phaseDot,
                  isActive && styles.phaseDotActive,
                  isCompleted && styles.phaseDotCompleted,
                  !isActive && !isCompleted && styles.phaseDotFuture,
                ]}
              >
                {isCompleted ? (
                  <Ionicons name="checkmark" size={14} color={color.text} />
                ) : null}
              </View>
              <Text
                style={[
                  styles.phaseLabel,
                  isActive && styles.phaseLabelActive,
                ]}
              >
                {p === 'listen'
                  ? t('shadowing.phaseListenTitle')
                  : p === 'shadow'
                  ? t('shadowing.phaseShadowTitle')
                  : t('shadowing.phaseSoloTitle')}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Speed Badge */}
      {(phase === 'listen' || phase === 'shadow') && (
        <View style={styles.speedBadge}>
          <Ionicons name="speedometer-outline" size={14} color={METHOD_COLOR} />
          <Text style={styles.speedBadgeText}>
            {t('shadowing.speed')}: 0.75x
          </Text>
        </View>
      )}

      {/* Main Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Ayah Text */}
        <View style={phase === 'solo' ? styles.soloTextWrapper : undefined}>
          <View style={styles.ayahCard}>
            <TajweedText
              text={currentAyah.textUthmani}
              tajweedRules={currentAyah.tajweedRules}
              showTajweed={true}
              fontSize={38}
            />
          </View>
        </View>

        {/* Transliteration */}
        {phase !== 'solo' && currentAyah.transliteration && (
          <View style={styles.transliterationCard}>
            <Text style={styles.transliterationText}>
              {currentAyah.transliteration}
            </Text>
          </View>
        )}

        {/* Phase Instruction — tappable to play audio in listen/shadow */}
        {(phase === 'listen' || phase === 'shadow') ? (
          <Pressable
            style={styles.instructionCard}
            onPress={audioState === 'idle' ? playAudio : undefined}
            disabled={audioState !== 'idle'}
          >
            <Ionicons
              name={audioState === 'playing' ? 'volume-high' : 'play-circle-outline'}
              size={24}
              color={METHOD_COLOR}
            />
            <Text style={styles.instructionText}>{getPhaseInstruction()}</Text>
          </Pressable>
        ) : (
          <View style={styles.instructionCard}>
            <Ionicons name="person-outline" size={24} color={METHOD_COLOR} />
            <Text style={styles.instructionText}>{getPhaseInstruction()}</Text>
          </View>
        )}

        {/* Loading indicator */}
        {audioState === 'loading' && (
          <ActivityIndicator size="small" color={METHOD_COLOR} style={styles.audioLoader} />
        )}

        {/* Self-rating in Solo phase */}
        {phase === 'solo' && (
          <View style={styles.ratingSection}>
            <Text style={styles.ratingTitle}>{t('shadowing.rateYourself')}</Text>
            <View style={styles.ratingButtons}>
              <Pressable
                style={[styles.ratingButton, styles.ratingNeedsWork]}
                onPress={() => handleRate('needsWork')}
              >
                <Ionicons name="refresh-outline" size={20} color={color.danger} />
                <Text style={[styles.ratingButtonText, { color: color.danger }]}>
                  {t('shadowing.needsWork')}
                </Text>
              </Pressable>
              <Pressable
                style={[styles.ratingButton, styles.ratingGood]}
                onPress={() => handleRate('good')}
              >
                <Ionicons name="thumbs-up-outline" size={20} color={color.sacredBright} />
                <Text style={[styles.ratingButtonText, { color: color.sacredBright }]}>
                  {t('shadowing.good')}
                </Text>
              </Pressable>
              <Pressable
                style={[styles.ratingButton, styles.ratingMastered]}
                onPress={() => handleRate('mastered')}
              >
                <Ionicons name="star-outline" size={20} color={color.progress} />
                <Text style={[styles.ratingButtonText, { color: color.progress }]}>
                  {t('shadowing.mastered')}
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
        >
          <Ionicons
            name="chevron-back"
            size={20}
            color={currentAyahIndex === 0 ? color.borderStrong : color.accent}
          />
          <Text
            style={[
              styles.navButtonText,
              currentAyahIndex === 0 && styles.navButtonTextDisabled,
            ]}
          >
            {t('common.previous')}
          </Text>
        </Pressable>

        {/* Phase action button (Next Phase for listen/shadow) */}
        {phase !== 'solo' && (
          <Pressable
            style={[
              styles.nextPhaseButton,
              !phaseComplete && styles.nextPhaseButtonDisabled,
            ]}
            onPress={handleNextPhase}
            disabled={!phaseComplete}
          >
            <Text
              style={[
                styles.nextPhaseButtonText,
                !phaseComplete && styles.nextPhaseButtonTextDisabled,
              ]}
            >
              {t('shadowing.nextPhase')}
            </Text>
            <Ionicons
              name="arrow-forward"
              size={18}
              color={phaseComplete ? color.textOnAccent : color.borderStrong}
            />
          </Pressable>
        )}

        <Pressable
          style={[
            styles.navButton,
            currentAyahIndex >= totalAyahs - 1 && styles.navButtonDisabled,
          ]}
          onPress={handleNextAyah}
          disabled={currentAyahIndex >= totalAyahs - 1}
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
            color={currentAyahIndex >= totalAyahs - 1 ? color.borderStrong : color.accent}
          />
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
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: color.textMuted,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
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
    lineHeight: 48,
    color: color.sacred,
    fontSize: 28,
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

  // Phase Indicator
  phaseIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 32,
  },
  phaseStep: {
    alignItems: 'center',
    gap: 6,
  },
  phaseDot: {
    width: 28,
    height: 28,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  phaseDotActive: {
    backgroundColor: METHOD_COLOR,
  },
  phaseDotCompleted: {
    backgroundColor: METHOD_COLOR,
  },
  phaseDotFuture: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: color.border,
  },
  phaseLabel: {
    color: color.textMuted,
    fontSize: 12,
    fontWeight: '500',
  },
  phaseLabelActive: {
    color: METHOD_COLOR,
    fontWeight: '700',
  },

  // Speed Badge
  speedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: `${METHOD_COLOR}15`,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radius.md,
    gap: 6,
    marginBottom: 8,
  },
  speedBadgeText: {
    color: METHOD_COLOR,
    fontSize: 12,
    fontWeight: '600',
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

  // Ayah Card
  ayahCard: {
    backgroundColor: color.surface,
    borderRadius: radius.lg,
    padding: 24,
    borderWidth: 1,
    borderColor: color.border,
    alignItems: 'center',
  },
  soloTextWrapper: {
    opacity: 0.3,
  },

  // Transliteration
  transliterationCard: {
    backgroundColor: color.surface,
    borderRadius: radius.md,
    padding: 16,
    borderWidth: 1,
    borderColor: color.border,
  },
  transliterationText: {
    color: color.textMuted,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    fontStyle: 'italic',
  },

  // Instruction
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
  },

  // Play Button
  playButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: METHOD_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  audioLoader: {
    marginVertical: 8,
  },

  // Rating Section
  ratingSection: {
    marginTop: 8,
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
  ratingNeedsWork: {
    backgroundColor: withAlpha(color.danger, 0.08),
    borderColor: withAlpha(color.danger, 0.19),
  },
  ratingGood: {
    backgroundColor: withAlpha(color.sacredBright, 0.08),
    borderColor: withAlpha(color.sacredBright, 0.19),
  },
  ratingMastered: {
    backgroundColor: withAlpha(color.progress, 0.08),
    borderColor: withAlpha(color.progress, 0.19),
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
  nextPhaseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: METHOD_COLOR,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: radius.md,
    gap: 8,
  },
  nextPhaseButtonDisabled: {
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.border,
  },
  nextPhaseButtonText: {
    color: color.text,
    fontSize: 14,
    fontWeight: '600',
  },
  nextPhaseButtonTextDisabled: {
    color: color.textFaint,
  },
});

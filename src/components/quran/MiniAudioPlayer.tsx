import { View, Text, Pressable, StyleSheet, Animated, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useSegments } from 'expo-router';
import { useCallback, useEffect, useRef } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAudioPlayerStore, startContinuousPlay, advanceToNextSurah } from '../../stores/audioPlayerStore';
import { quranAudioService } from '../../services/quranAudioService';
import { getSurahByNumber } from '../../data/arabic/quran';
import { font, color, radius } from '../../theme/tokens';

export function MiniAudioPlayer() {
  const router = useRouter();
  const segments = useSegments();
  const insets = useSafeAreaInsets();
  const {
    currentlyPlaying,
    isPlaying,
    isPaused,
    isLoading,
    progress,
    setCurrentlyPlaying,
    updatePlaybackState,
    clearPlayer,
  } = useAudioPlayerStore();

  const slideAnim = useRef(new Animated.Value(100)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Detect if tab bar is visible (we're in the tabs section)
  const isInTabs = segments[0] === '(tabs)';
  const tabBarHeight = Platform.OS === 'ios' ? 60 : 60;
  const tabBarPadding = Platform.OS === 'ios' ? 28 : Math.max(insets.bottom, 24);
  const bottomOffset = isInTabs
    ? tabBarHeight + tabBarPadding
    : insets.bottom;

  // Animate in/out
  useEffect(() => {
    const anim = Animated.spring(slideAnim, {
      toValue: currentlyPlaying ? 0 : 100,
      useNativeDriver: true,
      tension: 80,
      friction: 12,
    });
    anim.start();
    return () => anim.stop();
  }, [currentlyPlaying, isPlaying, isPaused, isLoading]);

  // Animate progress bar
  useEffect(() => {
    const anim = Animated.timing(progressAnim, {
      toValue: progress,
      duration: 200,
      useNativeDriver: false,
    });
    anim.start();
    return () => anim.stop();
  }, [progress]);

  const handlePlayPause = async () => {
    if (!currentlyPlaying) return;

    if (isPlaying) {
      await quranAudioService.pause();
      updatePlaybackState({ isPaused: true, isPlaying: false, isLoading: false });
    } else if (isPaused) {
      await quranAudioService.resume();
      updatePlaybackState({ isPlaying: true, isPaused: false, isLoading: false });
    }
  };

  const handleClose = async () => {
    await quranAudioService.stop();
    clearPlayer();
  };

  // Use shared continuous playback functions from audioPlayerStore

  const handlePreviousAyah = async () => {
    if (!currentlyPlaying || currentlyPlaying.ayahNumber <= 1) return;
    startContinuousPlay(currentlyPlaying.surahNumber, currentlyPlaying.ayahNumber - 1, currentlyPlaying.totalAyahs);
  };

  const handleNextAyah = async () => {
    if (!currentlyPlaying || currentlyPlaying.ayahNumber >= currentlyPlaying.totalAyahs) return;
    startContinuousPlay(currentlyPlaying.surahNumber, currentlyPlaying.ayahNumber + 1, currentlyPlaying.totalAyahs);
  };

  const handlePreviousSurah = async () => {
    if (!currentlyPlaying || currentlyPlaying.surahNumber <= 1) return;
    const prevSurah = getSurahByNumber(currentlyPlaying.surahNumber - 1);
    if (!prevSurah) return;

    await quranAudioService.stop();
    setCurrentlyPlaying({
      surahId: prevSurah.id,
      surahNumber: prevSurah.surahNumber,
      surahNameArabic: prevSurah.nameArabic,
      surahNameEnglish: prevSurah.nameEnglish,
      ayahNumber: 1,
      totalAyahs: prevSurah.ayahCount,
      reciterName: currentlyPlaying.reciterName,
      reciterNameArabic: currentlyPlaying.reciterNameArabic,
      isPlayingAll: true,
    });
    startContinuousPlay(prevSurah.surahNumber, 1, prevSurah.ayahCount);
  };

  const handleNextSurah = async () => {
    if (!currentlyPlaying || currentlyPlaying.surahNumber >= 114) return;
    const nextSurah = getSurahByNumber(currentlyPlaying.surahNumber + 1);
    if (!nextSurah) return;

    await quranAudioService.stop();
    setCurrentlyPlaying({
      surahId: nextSurah.id,
      surahNumber: nextSurah.surahNumber,
      surahNameArabic: nextSurah.nameArabic,
      surahNameEnglish: nextSurah.nameEnglish,
      ayahNumber: 1,
      totalAyahs: nextSurah.ayahCount,
      reciterName: currentlyPlaying.reciterName,
      reciterNameArabic: currentlyPlaying.reciterNameArabic,
      isPlayingAll: true,
    });
    startContinuousPlay(nextSurah.surahNumber, 1, nextSurah.ayahCount);
  };

  const handleNavigateToSurah = () => {
    if (currentlyPlaying) {
      if (currentlyPlaying.source === 'learn') {
        router.push(`/quran/surah/${currentlyPlaying.surahId}/learn` as any);
      } else {
        router.push(`/quran/surah/${currentlyPlaying.surahId}` as any);
      }
    }
  };

  if (!currentlyPlaying) return null;

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          bottom: bottomOffset,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <Animated.View style={[styles.progressBar, { width: progressWidth }]} />
      </View>

      {/* Main Content */}
      <Pressable style={styles.content} onPress={handleNavigateToSurah} accessibilityRole="button" accessibilityLabel={`Now playing ${currentlyPlaying.surahNameEnglish}, ayah ${currentlyPlaying.ayahNumber}. Tap to open surah`}>
        {/* Ayah Number Badge */}
        <View style={styles.ayahBadge}>
          <Text style={styles.ayahNumberText}>{currentlyPlaying.ayahNumber}</Text>
        </View>

        {/* Surah Info */}
        <View style={styles.info}>
          <Text style={styles.surahArabic} numberOfLines={1}>
            {currentlyPlaying.surahNameArabic}
          </Text>
          <View style={styles.metaRow}>
            <Text style={styles.surahName} numberOfLines={1}>
              {currentlyPlaying.surahNameEnglish}
              {currentlyPlaying.isPlayingAll && `: ${currentlyPlaying.ayahNumber}`}
            </Text>
            <Text style={styles.separator}>•</Text>
            <Text style={styles.reciter} numberOfLines={1}>
              {currentlyPlaying.reciterName}
            </Text>
          </View>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          {currentlyPlaying.source !== 'learn' && (
            <Pressable
              style={[styles.skipButton, currentlyPlaying.surahNumber <= 1 && styles.disabledButton]}
              disabled={currentlyPlaying.surahNumber <= 1}
              onPress={(e) => { e.stopPropagation(); handlePreviousSurah(); }}
              accessibilityRole="button"
              accessibilityLabel="Previous surah"
            >
              <Ionicons name="play-skip-back" size={14} color={currentlyPlaying.surahNumber > 1 ? color.textMuted : color.borderStrong} />
            </Pressable>
          )}
          <Pressable
            style={[styles.controlButton, currentlyPlaying.ayahNumber <= 1 && styles.disabledButton]}
            disabled={currentlyPlaying.ayahNumber <= 1}
            onPress={(e) => { e.stopPropagation(); handlePreviousAyah(); }}
            accessibilityRole="button"
            accessibilityLabel="Previous ayah"
          >
            <Ionicons name="chevron-back" size={18} color={currentlyPlaying.ayahNumber > 1 ? color.text : color.borderStrong} />
          </Pressable>
          <Pressable
            style={styles.playPauseButton}
            onPress={(e) => { e.stopPropagation(); handlePlayPause(); }}
            accessibilityRole="button"
            accessibilityLabel={isPlaying ? 'Pause' : 'Play'}
          >
            {isLoading ? (
              <View style={styles.loadingIndicator}>
                <View style={styles.loadingDot} />
                <View style={[styles.loadingDot, styles.loadingDotDelay1]} />
                <View style={[styles.loadingDot, styles.loadingDotDelay2]} />
              </View>
            ) : (
              <Ionicons name={isPlaying ? 'pause' : 'play'} size={20} color={color.text} />
            )}
          </Pressable>
          <Pressable
            style={[styles.controlButton, currentlyPlaying.ayahNumber >= currentlyPlaying.totalAyahs && styles.disabledButton]}
            disabled={currentlyPlaying.ayahNumber >= currentlyPlaying.totalAyahs}
            onPress={(e) => { e.stopPropagation(); handleNextAyah(); }}
            accessibilityRole="button"
            accessibilityLabel="Next ayah"
          >
            <Ionicons name="chevron-forward" size={18} color={currentlyPlaying.ayahNumber < currentlyPlaying.totalAyahs ? color.text : color.borderStrong} />
          </Pressable>
          {currentlyPlaying.source !== 'learn' && (
            <Pressable
              style={[styles.skipButton, currentlyPlaying.surahNumber >= 114 && styles.disabledButton]}
              disabled={currentlyPlaying.surahNumber >= 114}
              onPress={(e) => { e.stopPropagation(); handleNextSurah(); }}
              accessibilityRole="button"
              accessibilityLabel="Next surah"
            >
              <Ionicons name="play-skip-forward" size={14} color={currentlyPlaying.surahNumber < 114 ? color.textMuted : color.borderStrong} />
            </Pressable>
          )}
          <Pressable
            style={styles.closeButton}
            onPress={(e) => { e.stopPropagation(); handleClose(); }}
            accessibilityRole="button"
            accessibilityLabel="Close audio player"
          >
            <Ionicons name="close" size={18} color={color.textFaint} />
          </Pressable>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: color.surface,
    borderTopWidth: 1,
    borderTopColor: color.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
    zIndex: 999,
  },
  progressBarContainer: {
    height: 3,
    backgroundColor: color.surfaceSunken,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: color.progress,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
  },
  ayahBadge: {
    width: 38,
    height: 38,
    borderRadius: radius.xl,
    backgroundColor: color.surfaceSunken,
    borderWidth: 2,
    borderColor: color.progress,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ayahNumberText: {
    color: color.progress,
    fontSize: 14,
    fontWeight: 'bold',
  },
  info: {
    flex: 1,
    gap: 4,
  },
  surahArabic: {
    fontFamily: font.arabic,
    lineHeight: 27,
    color: color.text,
    fontSize: 16,
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  surahName: {
    color: color.textMuted,
    fontSize: 12,
    fontWeight: '500',
    flexShrink: 1,
  },
  separator: {
    color: color.textFaint,
    fontSize: 10,
  },
  reciter: {
    color: color.textFaint,
    fontSize: 11,
    flexShrink: 1,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  skipButton: {
    width: 30,
    height: 30,
    borderRadius: radius.lg,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlButton: {
    width: 34,
    height: 34,
    borderRadius: radius.lg,
    backgroundColor: color.surfaceSunken,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    opacity: 0.4,
  },
  playPauseButton: {
    width: 42,
    height: 42,
    borderRadius: radius.xl,
    backgroundColor: color.progress,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: radius.lg,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  loadingIndicator: {
    flexDirection: 'row',
    gap: 4,
  },
  loadingDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: color.text,
    opacity: 0.4,
  },
  loadingDotDelay1: {
    opacity: 0.6,
  },
  loadingDotDelay2: {
    opacity: 0.8,
  },
});

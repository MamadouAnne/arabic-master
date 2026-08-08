import { View, Text, FlatList, Pressable, StyleSheet, ActivityIndicator, Modal, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocalizedContent } from '../../../src/hooks/useLocalizedContent';
import { getSurahById, getSurahByNumber } from '../../../src/data/arabic/quran';
import { useQuranSurah } from '../../../src/hooks/useQuranData';
import { useQuranStore } from '../../../src/stores/quranStore';
import { AyahCard } from '../../../src/components/quran/AyahCard';
import { ShareToGroupModal } from '../../../src/components/community/ShareToGroupModal';
import type { SharedContent } from '../../../src/data/community/socialData';
import { quranAudioService, AudioState, QURAN_RECITERS, ReciterId } from '../../../src/services/quranAudioService';
import { useAudioPlayerStore, advanceToNextSurah } from '../../../src/stores/audioPlayerStore';
import { useAyahTranslations } from '../../../src/hooks/useAyahTranslations';
import { showInterstitialIfReady } from '../../../src/services/adService';

export default function SurahDetailScreen() {
  const { t } = useTranslation();
  const { lc } = useLocalizedContent();
  const { surahId } = useLocalSearchParams<{ surahId: string }>();
  const [activeAyahId, setActiveAyahId] = useState<string | null>(null);
  const [audioState, setAudioState] = useState<AudioState>('idle');
  const [isPlayingAll, setIsPlayingAll] = useState(false);
  const [currentPlayingAyah, setCurrentPlayingAyah] = useState<number | null>(null);
  const [showReciterModal, setShowReciterModal] = useState(false);
  const [shareContent, setShareContent] = useState<SharedContent | null>(null);

  // Refs to track state in callbacks (avoids stale closures)
  const isPlayingAllRef = useRef(false);
  const currentPlayingIndexRef = useRef(0);
  const flatListRef = useRef<FlatList>(null);
  const ayahPositions = useRef<{ [key: string]: number }>({});
  const ayahsContainerOffset = useRef(0);

  // Show interstitial ad on entry (frequency-capped every 4th navigation)
  useEffect(() => {
    showInterstitialIfReady();
  }, []);

  // Get surah metadata from static data (always available)
  const surah = getSurahById(surahId);

  // Fetch ayahs from API (verified Quran text)
  const { ayahs, isLoading, error, refetch } = useQuranSurah(surahId);

  // Fetch translations based on user's language (EN or FR)
  const { translations: langTranslations } = useAyahTranslations(surah?.surahNumber ?? null);

  const {
    getSurahProgress,
    isAyahLearned,
    isAyahMemorized,
    startSurah,
    bookmarkAyah,
    unbookmarkAyah,
    progress,
    setReciter,
    toggleTranslation,
    toggleTransliteration,
  } = useQuranStore();

  const {
    setCurrentlyPlaying,
    updatePlaybackState,
    clearPlayer,
  } = useAudioPlayerStore();

  const playbackSpeedRef = useRef<number>(progress.settings.playbackSpeed);

  // Get current reciter info
  const currentReciterId = progress.settings.reciterId as ReciterId;
  const currentReciter = QURAN_RECITERS[currentReciterId] || QURAN_RECITERS['mishary-alafasy'];

  // Handle reciter change
  const handleReciterChange = useCallback((reciterId: ReciterId) => {
    setReciter(reciterId);
    quranAudioService.setReciter(reciterId);
    setShowReciterModal(false);
  }, [setReciter]);

  // Sync screen with currently playing surah (handles background auto-advance)
  const currentlyPlayingSurahId = useAudioPlayerStore((s) => s.currentlyPlaying?.surahId);
  const storeIsPlaying = useAudioPlayerStore((s) => s.isPlaying);
  const storeIsPaused = useAudioPlayerStore((s) => s.isPaused);
  const storeIsLoading = useAudioPlayerStore((s) => s.isLoading);
  const storeCurrentlyPlaying = useAudioPlayerStore((s) => s.currentlyPlaying);
  const storeAyahNumber = useAudioPlayerStore((s) => s.currentlyPlaying?.ayahNumber);

  useEffect(() => {
    if (currentlyPlayingSurahId && currentlyPlayingSurahId !== surahId) {
      router.replace(`/quran/surah/${currentlyPlayingSurahId}` as any);
    }
  }, [currentlyPlayingSurahId, surahId]);

  // Sync playback state from mini player (pause/resume)
  useEffect(() => {
    if (!storeCurrentlyPlaying || storeCurrentlyPlaying.surahId !== surahId) return;
    if (storeIsPlaying) setAudioState('playing');
    else if (storeIsPaused) setAudioState('paused');
    else if (storeIsLoading) setAudioState('loading');
  }, [storeIsPlaying, storeIsPaused, storeIsLoading, storeCurrentlyPlaying, surahId]);

  // Reset local state when mini player is closed
  useEffect(() => {
    if (storeCurrentlyPlaying === null) {
      setAudioState('idle');
      setActiveAyahId(null);
      setIsPlayingAll(false);
      setCurrentPlayingAyah(null);
      isPlayingAllRef.current = false;
    }
  }, [storeCurrentlyPlaying]);

  // Sync active ayah when mini player navigates (prev/next)
  useEffect(() => {
    if (!storeCurrentlyPlaying || storeCurrentlyPlaying.surahId !== surahId || !storeAyahNumber) return;
    const ayah = ayahs.find(a => a.ayahNumber === storeAyahNumber);
    if (ayah) {
      setActiveAyahId(ayah.id);
      setCurrentPlayingAyah(storeAyahNumber);
    }
  }, [storeAyahNumber, storeCurrentlyPlaying, surahId, ayahs]);

  // Play/Pause ayah using reciter audio - must be before any returns
  const handlePlayAyah = useCallback(async (ayahId: string, ayahNumber: number) => {
    if (!surah) return;

    // Update global audio player state
    setCurrentlyPlaying({
      surahId: surah.id,
      surahNumber: surah.surahNumber,
      surahNameArabic: surah.nameArabic,
      surahNameEnglish: surah.nameEnglish,
      ayahNumber,
      totalAyahs: surah.ayahCount,
      reciterName: currentReciter.nameEnglish,
      reciterNameArabic: currentReciter.nameArabic,
      isPlayingAll: false,
      source: 'surah',
    });

    // Use togglePlayPause for smart play/pause behavior
    await quranAudioService.togglePlayPause(surah.surahNumber, ayahNumber, {
      rate: playbackSpeedRef.current,
      onStateChange: (state) => {
        setAudioState(state);
        if (state === 'idle') {
          setActiveAyahId(null);
          clearPlayer();
        } else {
          setActiveAyahId(ayahId);
          if (state === 'loading') updatePlaybackState({ isLoading: true, isPlaying: false, isPaused: false });
          else if (state === 'playing') updatePlaybackState({ isPlaying: true, isLoading: false, isPaused: false });
          else if (state === 'paused') updatePlaybackState({ isPaused: true, isLoading: false, isPlaying: false });
        }
      },
      onComplete: () => {
        setActiveAyahId(null);
        setAudioState('idle');
        clearPlayer();
      },
      onError: () => {
        setActiveAyahId(null);
        setAudioState('idle');
        clearPlayer();
      },
    });
  }, [surah, currentReciter, setCurrentlyPlaying, updatePlaybackState, clearPlayer]);

  // Get surah progress - must call after useQuranStore
  const surahProgress = surah
    ? getSurahProgress(surahId)
    : { bookmarkedAyahs: [] as string[], ayahsLearned: [] as string[], ayahsMemorized: [] as string[], completionPercent: 0 };

  // Handler functions
  const handleLearn = useCallback(() => {
    router.push(`/quran/surah/${surahId}/methods` as any);
  }, [surahId]);

  const handleWrite = useCallback(() => {
    router.push(`/quran/surah/${surahId}/write` as any);
  }, [surahId]);

  const handleAyahPress = useCallback((ayahId: string) => {
    // Could open ayah detail or start learning from this ayah
  }, []);

  const handleBookmark = useCallback((ayahId: string) => {
    if (surahProgress.bookmarkedAyahs.includes(ayahId)) {
      unbookmarkAyah(surahId, ayahId);
    } else {
      bookmarkAyah(surahId, ayahId);
    }
  }, [surahId, surahProgress.bookmarkedAyahs, unbookmarkAyah, bookmarkAyah]);

  const handleSpeedChange = useCallback((speed: number) => {
    playbackSpeedRef.current = speed;
    useQuranStore.getState().setPlaybackSpeed(speed as 0.75 | 1 | 1.25 | 1.5 | 1.75);
    quranAudioService.setRate(speed);
  }, []);

  // Scroll to a specific ayah
  const scrollToAyah = useCallback((ayahId: string) => {
    const index = ayahs.findIndex(a => a.id === ayahId);
    if (index !== -1 && flatListRef.current) {
      flatListRef.current.scrollToIndex({ index, animated: true, viewPosition: 0.3 });
    }
  }, [ayahs]);

  // Play a specific ayah by index and chain to next on completion
  const playAyahAtIndex = useCallback(async (index: number) => {
    if (!surah || !ayahs[index]) return;

    const ayah = ayahs[index];
    currentPlayingIndexRef.current = index;
    setCurrentPlayingAyah(ayah.ayahNumber);
    setActiveAyahId(ayah.id);

    // Update global audio player state
    setCurrentlyPlaying({
      surahId: surah.id,
      surahNumber: surah.surahNumber,
      surahNameArabic: surah.nameArabic,
      surahNameEnglish: surah.nameEnglish,
      ayahNumber: ayah.ayahNumber,
      totalAyahs: surah.ayahCount,
      reciterName: currentReciter.nameEnglish,
      reciterNameArabic: currentReciter.nameArabic,
      isPlayingAll: true,
      source: 'surah',
    });

    // Auto-scroll to the current ayah
    scrollToAyah(ayah.id);

    await quranAudioService.playAyah(surah.surahNumber, ayah.ayahNumber, {
      rate: playbackSpeedRef.current,
      onStateChange: (state) => {
        setAudioState(state);
        if (state === 'loading') updatePlaybackState({ isLoading: true, isPlaying: false, isPaused: false });
        else if (state === 'playing') updatePlaybackState({ isPlaying: true, isLoading: false, isPaused: false });
        else if (state === 'paused') updatePlaybackState({ isPaused: true, isLoading: false, isPlaying: false });
      },
      onComplete: () => {
        // Check if we should continue to next ayah
        if (!isPlayingAllRef.current) return;

        const nextIndex = currentPlayingIndexRef.current + 1;
        if (nextIndex < ayahs.length) {
          // Chain immediately — no gap keeps audio session alive for background playback
          playAyahAtIndex(nextIndex);
        } else {
          // Finished all ayahs — hand off to shared continuous playback for next surah
          isPlayingAllRef.current = false;
          setIsPlayingAll(false);
          setCurrentPlayingAyah(null);
          setActiveAyahId(null);
          setAudioState('idle');
          advanceToNextSurah();
        }
      },
      onError: () => {
        isPlayingAllRef.current = false;
        setIsPlayingAll(false);
        setCurrentPlayingAyah(null);
        setActiveAyahId(null);
        setAudioState('idle');
        clearPlayer();
      },
    });
  }, [surah, surahId, ayahs, currentReciter, setCurrentlyPlaying, updatePlaybackState, clearPlayer]);

  // Play/Stop entire surah
  const handlePlayAllToggle = useCallback(async () => {
    if (!surah) return;

    if (isPlayingAll || audioState === 'playing' || audioState === 'loading') {
      // Stop playback
      isPlayingAllRef.current = false;
      await quranAudioService.stop();
      setIsPlayingAll(false);
      setCurrentPlayingAyah(null);
      setActiveAyahId(null);
      setAudioState('idle');
      clearPlayer();
    } else {
      // Start playing all ayahs from the beginning
      isPlayingAllRef.current = true;
      setIsPlayingAll(true);
      playAyahAtIndex(0);
    }
  }, [surah, isPlayingAll, audioState, playAyahAtIndex, clearPlayer]);

  // Navigation to previous/next surah
  const handlePreviousSurah = useCallback(() => {
    if (surah && surah.surahNumber > 1) {
      const prevSurah = getSurahByNumber(surah.surahNumber - 1);
      if (prevSurah) {
        quranAudioService.stop();
        router.replace(`/quran/surah/${prevSurah.id}` as any);
      }
    }
  }, [surah]);

  const handleNextSurah = useCallback(() => {
    if (surah && surah.surahNumber < 114) {
      const nextSurah = getSurahByNumber(surah.surahNumber + 1);
      if (nextSurah) {
        quranAudioService.stop();
        router.replace(`/quran/surah/${nextSurah.id}` as any);
      }
    }
  }, [surah]);

  // Early returns after all hooks
  if (!surah) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>{t('common.notFound')}</Text>
      </SafeAreaView>
    );
  }

  if (isLoading && ayahs.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10b981" />
          <Text style={styles.loadingText}>{t('common.loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && ayahs.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="cloud-offline" size={48} color="#64748b" />
          <Text style={styles.errorText}>{error}</Text>
          <Pressable style={styles.retryButton} onPress={refetch} accessibilityRole="button" accessibilityLabel="Retry loading surah">
            <Text style={styles.retryButtonText}>{t('common.retry')}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // Render item for FlatList
  const renderAyahItem = useCallback(({ item: ayah }: { item: typeof ayahs[0] }) => {
    // Override translation with language-specific version if available
    const translatedAyah = langTranslations.size > 0
      ? { ...ayah, translation: langTranslations.get(ayah.ayahNumber) || lc(ayah.translation, ayah.translationFr) }
      : ayah;

    return (
      <AyahCard
        ayah={translatedAyah}
        showTransliteration={progress.settings.showTransliteration}
        showTranslation={progress.settings.showTranslation}
        showTajweed={progress.settings.showTajweedColors}
        isLearned={isAyahLearned(surahId, ayah.id)}
        isMemorized={isAyahMemorized(surahId, ayah.id)}
        isBookmarked={surahProgress.bookmarkedAyahs.includes(ayah.id)}
        isLoading={activeAyahId === ayah.id && audioState === 'loading'}
        isPlaying={activeAyahId === ayah.id && audioState === 'playing'}
        isPaused={activeAyahId === ayah.id && audioState === 'paused'}
        playbackSpeed={progress.settings.playbackSpeed}
        onPlay={() => handlePlayAyah(ayah.id, ayah.ayahNumber)}
        onBookmark={() => handleBookmark(ayah.id)}
        onPress={() => handleAyahPress(ayah.id)}
        onShare={() => setShareContent({
          kind: 'verse',
          arabic: ayah.textUthmani,
          translit: ayah.transliteration,
          translation: translatedAyah.translation,
          audioText: ayah.textUthmani,
          ref: surah ? `${surah.nameEnglish} · ${ayah.ayahNumber}` : `Ayah ${ayah.ayahNumber}`,
          route: `/quran/surah/${surahId}`,
        })}
        onSpeedChange={handleSpeedChange}
      />
    );
  }, [progress.settings, surahId, surah, surahProgress.bookmarkedAyahs, activeAyahId, audioState, isAyahLearned, isAyahMemorized, handlePlayAyah, handleBookmark, handleAyahPress, handleSpeedChange, langTranslations, lc]);

  // List header component
  const ListHeader = useCallback(() => (
    <>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Go back">
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </Pressable>
        <View style={styles.headerTitle}>
          <Text style={styles.surahNameArabic}>{surah.nameArabic}</Text>
          <Text style={styles.surahNameEnglish}>{surah.nameEnglish}</Text>
        </View>
        <View style={styles.headerNav}>
          <Pressable
            style={[styles.navButton, surah.surahNumber <= 1 && styles.navButtonDisabled]}
            onPress={handlePreviousSurah}
            disabled={surah.surahNumber <= 1}
            accessibilityRole="button"
            accessibilityLabel="Previous surah"
          >
            <Ionicons
              name="chevron-back"
              size={20}
              color={surah.surahNumber <= 1 ? '#334155' : '#10b981'}
            />
          </Pressable>
          <Text style={styles.surahNumber}>#{surah.surahNumber}</Text>
          <Pressable
            style={[styles.navButton, surah.surahNumber >= 114 && styles.navButtonDisabled]}
            onPress={handleNextSurah}
            disabled={surah.surahNumber >= 114}
            accessibilityRole="button"
            accessibilityLabel="Next surah"
          >
            <Ionicons
              name="chevron-forward"
              size={20}
              color={surah.surahNumber >= 114 ? '#334155' : '#10b981'}
            />
          </Pressable>
        </View>
      </View>

      {/* Surah Info Card */}
      <View style={styles.infoCard}>
        <Text style={styles.bismillah}>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</Text>
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Ionicons name="list" size={16} color="#10b981" />
            <Text style={styles.infoText}>{surah.ayahCount} {t('surahFeature.verses')}</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="location" size={16} color="#10b981" />
            <Text style={styles.infoText}>{surah.revelationType === 'Meccan' ? t('surahFeature.meccan') : t('surahFeature.medinan')}</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="book" size={16} color="#10b981" />
            <Text style={styles.infoText}>{t('juzFeature.juz')} {surah.juz}</Text>
          </View>
        </View>
      </View>

      {/* Reciter Selector */}
      <Pressable style={styles.reciterCard} onPress={() => setShowReciterModal(true)} accessibilityRole="button" accessibilityLabel={`${t('surahFeature.reciter')}: ${currentReciter.nameEnglish}. ${t('surahFeature.change')}`}>
        <View style={styles.reciterInfo}>
          <View style={styles.reciterIcon}>
            <Ionicons name="mic" size={20} color="#10b981" />
          </View>
          <View style={styles.reciterDetails}>
            <Text style={styles.reciterLabel}>{t('surahFeature.reciter')}</Text>
            <Text style={styles.reciterName}>{currentReciter.nameEnglish}</Text>
            <Text style={styles.reciterNameArabic}>{currentReciter.nameArabic}</Text>
          </View>
        </View>
        <View style={styles.reciterAction}>
          <Text style={styles.changeText}>{t('surahFeature.change')}</Text>
          <Ionicons name="chevron-forward" size={18} color="#64748b" />
        </View>
      </Pressable>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <Pressable style={styles.primaryButton} onPress={handleLearn} accessibilityRole="button" accessibilityLabel={t('surahFeature.learn')}>
          <Ionicons name="school" size={20} color="#0f172a" />
          <Text style={styles.primaryButtonText}>{t('surahFeature.learn')}</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={handleWrite} accessibilityRole="button" accessibilityLabel={t('surahFeature.write')}>
          <Ionicons name="pencil" size={20} color="#0f172a" />
          <Text style={styles.secondaryButtonText}>{t('surahFeature.write')}</Text>
        </Pressable>
      </View>

      {/* View Toggle */}
      <View style={styles.viewToggle}>
        <Text style={styles.sectionTitle}>{t('surahFeature.verses')}</Text>
        <Pressable
          style={[
            styles.playAllButton,
            (isPlayingAll || audioState === 'playing') && styles.playAllButtonActive,
          ]}
          onPress={handlePlayAllToggle}
          accessibilityRole="button"
          accessibilityLabel={isPlayingAll || audioState === 'playing' ? t('surahFeature.stop') : t('surahFeature.playAll')}
        >
          {audioState === 'loading' && isPlayingAll ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Ionicons
              name={isPlayingAll || audioState === 'playing' ? 'stop' : 'play'}
              size={14}
              color="#ffffff"
            />
          )}
          <Text style={styles.playAllButtonText}>
            {isPlayingAll || audioState === 'playing'
              ? currentPlayingAyah
                ? `${currentPlayingAyah}/${surah.ayahCount}`
                : t('surahFeature.stop')
              : t('surahFeature.playAll')}
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.translateButton,
            (progress.settings.showTranslation || progress.settings.showTransliteration) && styles.translateButtonActive,
          ]}
          onPress={() => {
            const isOn = progress.settings.showTranslation || progress.settings.showTransliteration;
            if (isOn) {
              if (progress.settings.showTranslation) toggleTranslation();
              if (progress.settings.showTransliteration) toggleTransliteration();
            } else {
              if (!progress.settings.showTranslation) toggleTranslation();
              if (!progress.settings.showTransliteration) toggleTransliteration();
            }
          }}
          accessibilityRole="button"
          accessibilityLabel={(progress.settings.showTranslation || progress.settings.showTransliteration) ? 'Hide translation' : 'Show translation'}
        >
          <Ionicons
            name="language"
            size={18}
            color={(progress.settings.showTranslation || progress.settings.showTransliteration) ? '#ffffff' : '#64748b'}
          />
          <Text style={[
            styles.translateButtonText,
            (progress.settings.showTranslation || progress.settings.showTransliteration) && styles.translateButtonTextActive,
          ]}>
            {(progress.settings.showTranslation || progress.settings.showTransliteration) ? t('surahFeature.translationOn') : t('surahFeature.translationOff')}
          </Text>
        </Pressable>
      </View>
    </>
  ), [surah, currentReciter, isPlayingAll, audioState, currentPlayingAyah, progress.settings, handlePreviousSurah, handleNextSurah, handleLearn, handleWrite, handlePlayAllToggle, toggleTranslation, toggleTransliteration, t]);

  // List footer component
  const ListFooter = useCallback(() => (
    <Pressable
      style={styles.backToTopButton}
      onPress={() => flatListRef.current?.scrollToOffset({ offset: 0, animated: true })}
      accessibilityRole="button"
      accessibilityLabel={t('surahFeature.backToTop')}
    >
      <Ionicons name="arrow-up" size={18} color="#10b981" />
      <Text style={styles.backToTopText}>{t('surahFeature.backToTop')}</Text>
    </Pressable>
  ), [t]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Reciter Selection Modal */}
      <Modal
        visible={showReciterModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowReciterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('surahFeature.selectReciter')}</Text>
              <Pressable onPress={() => setShowReciterModal(false)} accessibilityRole="button" accessibilityLabel="Close reciter selection">
                <Ionicons name="close" size={24} color="#ffffff" />
              </Pressable>
            </View>
            <ScrollView style={styles.reciterList}>
              {Object.values(QURAN_RECITERS).map((reciter) => (
                <Pressable
                  key={reciter.id}
                  style={[
                    styles.reciterOption,
                    currentReciterId === reciter.id && styles.reciterOptionActive,
                  ]}
                  onPress={() => handleReciterChange(reciter.id as ReciterId)}
                  accessibilityRole="button"
                  accessibilityLabel={`Select reciter ${reciter.nameEnglish}`}
                >
                  <View style={styles.reciterOptionInfo}>
                    <Text style={styles.reciterOptionName}>{reciter.nameEnglish}</Text>
                    <Text style={styles.reciterOptionArabic}>{reciter.nameArabic}</Text>
                    <View style={styles.reciterMeta}>
                      <View style={styles.styleBadge}>
                        <Text style={styles.reciterStyle}>{reciter.style}</Text>
                        <Text style={styles.styleDesc}>
                          {reciter.style === 'murattal' ? `• ${t('surahFeature.steadyPaceForLearning')}` : `• ${t('surahFeature.melodicArtistic')}`}
                        </Text>
                      </View>
                      {reciter.recommended && (
                        <View style={styles.recommendedBadge}>
                          <Ionicons name="star" size={10} color="#f59e0b" />
                          <Text style={styles.recommendedText}>{t('surahFeature.recommended')}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                  {currentReciterId === reciter.id && (
                    <Ionicons name="checkmark-circle" size={24} color="#10b981" />
                  )}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <FlatList
        ref={flatListRef}
        data={ayahs}
        renderItem={renderAyahItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={ListHeader}
        ListFooterComponent={ListFooter}
        contentContainerStyle={styles.ayahsContainer}
        showsVerticalScrollIndicator={false}
        initialNumToRender={5}
        maxToRenderPerBatch={10}
        windowSize={10}
        removeClippedSubviews={true}
        onScrollToIndexFailed={(info) => {
          flatListRef.current?.scrollToOffset({ offset: info.averageItemLength * info.index, animated: true });
        }}
      />

      <ShareToGroupModal
        visible={!!shareContent}
        content={shareContent}
        onClose={() => setShareContent(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  errorText: {
    color: '#94a3b8',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#94a3b8',
    fontSize: 16,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  retryButton: {
    backgroundColor: '#10b981',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 20,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    alignItems: 'center',
  },
  surahNameArabic: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  surahNameEnglish: {
    color: '#10b981',
    fontSize: 14,
    marginTop: 2,
  },
  headerNav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  navButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonDisabled: {
    opacity: 0.4,
  },
  surahNumber: {
    color: '#64748b',
    fontSize: 14,
    minWidth: 36,
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  bismillah: {
    color: '#10b981',
    fontSize: 22,
    textAlign: 'center',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    color: '#94a3b8',
    fontSize: 13,
  },
  reciterCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reciterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  reciterIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#10b98120',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reciterDetails: {
    marginLeft: 12,
    flex: 1,
  },
  reciterLabel: {
    color: '#64748b',
    fontSize: 12,
  },
  reciterName: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
    marginTop: 2,
  },
  reciterNameArabic: {
    color: '#10b981',
    fontSize: 14,
    marginTop: 2,
  },
  reciterAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  changeText: {
    color: '#64748b',
    fontSize: 13,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1e293b',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  modalTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  reciterList: {
    padding: 16,
  },
  reciterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#0f172a',
    borderRadius: 12,
    marginBottom: 10,
  },
  reciterOptionActive: {
    borderWidth: 1,
    borderColor: '#10b981',
  },
  reciterOptionInfo: {
    flex: 1,
  },
  reciterOptionName: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  reciterOptionArabic: {
    color: '#94a3b8',
    fontSize: 14,
    marginTop: 2,
  },
  reciterMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 6,
  },
  styleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reciterStyle: {
    color: '#64748b',
    fontSize: 12,
    textTransform: 'capitalize',
    fontWeight: '600',
  },
  styleDesc: {
    color: '#4b5563',
    fontSize: 11,
  },
  recommendedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f59e0b20',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  recommendedText: {
    color: '#f59e0b',
    fontSize: 10,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#D4AF37',
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryButtonText: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#D4AF37',
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  secondaryButtonText: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '700',
  },
  playAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b981',
    borderRadius: 14,
    paddingVertical: 6,
    paddingHorizontal: 10,
    gap: 5,
  },
  playAllButtonActive: {
    backgroundColor: '#ef4444',
  },
  playAllButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  translateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#334155',
    borderRadius: 14,
    paddingVertical: 6,
    paddingHorizontal: 10,
    gap: 5,
  },
  translateButtonActive: {
    backgroundColor: '#10b981',
  },
  translateButtonText: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '600',
  },
  translateButtonTextActive: {
    color: '#ffffff',
  },
  viewToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  ayahsContainer: {
    paddingHorizontal: 12,
  },
  backToTopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
  },
  backToTopText: {
    color: '#10b981',
    fontSize: 14,
    fontWeight: '600',
  },
});

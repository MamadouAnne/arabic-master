import { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator, LayoutChangeEvent } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useLocalizedContent } from '../../../src/hooks/useLocalizedContent';
import { getProphetStory, hasProphetStory } from '../../../src/data/arabic/prophets';
import { SubStoryNav, StoryContentBlock } from '../../../src/components/prophetStories';
import { useProphetStoriesStore } from '../../../src/stores/prophetStoriesStore';
import { SubStory, QuranReference } from '../../../src/types/prophetStories';
import { quranAudioService, AudioState } from '../../../src/services/quranAudioService';
import { useStoryNarration, NarrationSpeed } from '../../../src/hooks/useStoryNarration';
import { ListenBar, ListenSheet } from '../../../src/components/listen';
import { font, color, radius } from '../../../src/theme/tokens';
import { withAlpha } from '../../../src/components/ui/Primitives';

export default function ProphetStoryScreen() {
  const { t } = useTranslation();
  const { lc, lcArray } = useLocalizedContent();
  const { prophetId } = useLocalSearchParams<{ prophetId: string }>();
  const scrollViewRef = useRef<ScrollView>(null);

  const [currentSubStoryId, setCurrentSubStoryId] = useState<string | null>(null);
  const [playingSourceId, setPlayingSourceId] = useState<string | null>(null);
  const [audioState, setAudioState] = useState<AudioState>('idle');

  const {
    startStory,
    markSubStoryCompleted,
    getStoryProgress,
    isSubStoryCompleted,
    progress,
  } = useProphetStoriesStore();

  // Get prophet story data
  const storyData = prophetId ? getProphetStory(prophetId) : undefined;
  const hasFullStory = prophetId ? hasProphetStory(prophetId) : false;
  const prophet = storyData?.prophet;
  const subStories = storyData?.subStories || [];

  // Initialize first sub-story
  useEffect(() => {
    if (prophetId && subStories.length > 0 && !currentSubStoryId) {
      startStory(prophetId);
      const savedProgress = getStoryProgress(prophetId);
      setCurrentSubStoryId(savedProgress.currentSubStoryId || subStories[0].id);
    }
  }, [prophetId, subStories, currentSubStoryId]);

  // Current sub-story content
  const currentSubStory = subStories.find((s) => s.id === currentSubStoryId);
  const currentContent = currentSubStory?.content || [];

  // Get completed sub-stories
  const storyProgress = prophetId ? getStoryProgress(prophetId) : null;
  const completedSubStories = storyProgress?.subStoriesCompleted || [];

  // Calculate source count
  const sourceCount = currentContent.filter((block) => block.type !== 'narrative').length;

  // Listening. The queue is rebuilt whenever the chapter changes.
  const narration = useStoryNarration(currentContent);
  const [playerOpen, setPlayerOpen] = useState(false);

  // Where each block sits in the scroll view, so the spoken one can be kept
  // in sight without the reader chasing it.
  const blockOffsets = useRef<Record<string, number>>({});
  const blocksTop = useRef(0);

  const onBlockLayout = useCallback(
    (id: string) => (e: LayoutChangeEvent) => {
      blockOffsets.current[id] = e.nativeEvent.layout.y;
    },
    []
  );

  useEffect(() => {
    if (!narration.isActive || !narration.currentBlockId) return;
    const y = blockOffsets.current[narration.currentBlockId];
    if (y == null) return;
    scrollViewRef.current?.scrollTo({ y: Math.max(0, blocksTop.current + y - 140), animated: true });
  }, [narration.currentBlockId, narration.isActive]);

  const cycleSpeed = useCallback(() => {
    const order: NarrationSpeed[] = [0.75, 1, 1.25, 1.5];
    narration.setSpeed(order[(order.indexOf(narration.speed) + 1) % order.length]);
  }, [narration]);

  // Handle sub-story selection
  const handleSubStorySelect = useCallback((subStoryId: string) => {
    setCurrentSubStoryId(subStoryId);
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  }, []);

  // Mark sub-story as completed when reaching the end
  const handleMarkComplete = useCallback(() => {
    if (prophetId && currentSubStoryId) {
      markSubStoryCompleted(prophetId, currentSubStoryId);
    }
  }, [prophetId, currentSubStoryId, markSubStoryCompleted]);

  // Handle play Quran audio
  const handlePlayQuranAudio = useCallback(async (source: QuranReference, blockId: string) => {
    // If same source is playing, toggle pause/resume
    if (playingSourceId === blockId) {
      if (audioState === 'playing') {
        await quranAudioService.pause();
        setAudioState('paused');
      } else if (audioState === 'paused') {
        await quranAudioService.resume();
        setAudioState('playing');
      }
      return;
    }

    // Stop any current playback
    await quranAudioService.stop();

    // Set the new playing source
    setPlayingSourceId(blockId);
    setAudioState('loading');

    // Play the ayah range
    await quranAudioService.playAyahRange(
      source.surahNumber,
      source.ayahStart,
      source.ayahEnd,
      {
        onStateChange: (state) => {
          setAudioState(state);
          if (state === 'idle') {
            setPlayingSourceId(null);
          }
        },
        onComplete: () => {
          setPlayingSourceId(null);
          setAudioState('idle');
        },
        onError: () => {
          setPlayingSourceId(null);
          setAudioState('idle');
        },
      }
    );
  }, [playingSourceId, audioState]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      quranAudioService.stop();
    };
  }, []);

  if (!prophet) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={color.accentStrong} />
          <Text style={styles.loadingText}>{t('prophetsFeature.loadingStory')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isCurrentSubStoryCompleted = currentSubStoryId
    ? isSubStoryCompleted(prophetId!, currentSubStoryId)
    : false;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={color.text} />
        </Pressable>
        <View style={styles.headerTitle}>
          <View style={styles.prophetNameRow}>
            <Text style={styles.prophetNameArabic}>{prophet.nameArabic}</Text>
            <Text style={styles.prophetNameEnglish}>{lc(prophet.nameEnglish, prophet.nameFrench)}</Text>
          </View>
          <Text style={styles.prophetTitle}>{lc(prophet.title, prophet.titleFr)}</Text>
        </View>
        <View style={styles.headerMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={14} color={color.textFaint} />
            <Text style={styles.metaText}>{prophet.estimatedReadTime} {t('common.min')}</Text>
          </View>
        </View>
      </View>

      {/* Sub-story Navigation - only show if there are multiple sub-stories */}
      {subStories.length > 1 && currentSubStoryId && (
        <SubStoryNav
          subStories={subStories}
          currentSubStoryId={currentSubStoryId}
          completedSubStories={completedSubStories}
          onSubStorySelect={handleSubStorySelect}
        />
      )}

      {/* Story Content */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Sub-story Title */}
        {currentSubStory && (
          <View style={styles.subStoryHeader}>
            <Text style={styles.subStoryTitle}>{lc(currentSubStory.title, currentSubStory.titleFr)}</Text>
            {currentSubStory.titleArabic && (
              <Text style={styles.subStoryTitleArabic}>{currentSubStory.titleArabic}</Text>
            )}
            <View style={styles.subStoryMeta}>
              <View style={styles.metaItem}>
                <Ionicons name="book-outline" size={12} color={color.textFaint} />
                <Text style={styles.metaText}>{sourceCount} {t('prophetsFeature.sources')}</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={12} color={color.textFaint} />
                <Text style={styles.metaText}>{currentSubStory.estimatedReadTime} {t('common.min')}</Text>
              </View>
            </View>

            {hasFullStory && currentContent.length > 0 && (
              <Pressable
                style={styles.listenButton}
                onPress={() => (narration.isActive ? setPlayerOpen(true) : narration.start(0))}
                accessibilityRole="button"
              >
                <Ionicons name="headset" size={18} color={color.textOnAccent} />
                <Text style={styles.listenButtonText}>{t('listen.listen')}</Text>
              </Pressable>
            )}
          </View>
        )}

        {/* Content Blocks */}
        {!hasFullStory ? (
          <View style={styles.comingSoonContainer}>
            <Ionicons name="construct-outline" size={48} color={color.textFaint} />
            <Text style={styles.comingSoonTitle}>{t('prophetsFeature.comingSoon')}</Text>
            <Text style={styles.comingSoonText}>
              {t('prophetsFeature.fullStoryOf')} {lc(prophet.nameEnglish, prophet.nameFrench)} {t('prophetsFeature.beingPrepared')}
            </Text>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>{t('prophetsFeature.summary')}</Text>
              <Text style={styles.summaryText}>{lc(prophet.summary, prophet.summaryFr)}</Text>
            </View>
            {prophet.lessons.length > 0 && (
              <View style={styles.lessonsCard}>
                <Text style={styles.lessonsTitle}>{t('prophetsFeature.keyLessons')}</Text>
                {lcArray(prophet.lessons, prophet.lessonsFr).map((lesson, index) => (
                  <View key={index} style={styles.lessonItem}>
                    <Ionicons name="checkmark-circle" size={16} color={color.progress} />
                    <Text style={styles.lessonText}>{lesson}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        ) : (
          <View
            style={styles.blocksContainer}
            onLayout={(e) => {
              blocksTop.current = e.nativeEvent.layout.y;
            }}
          >
            {currentContent.map((block) => (
              <View key={block.id} onLayout={onBlockLayout(block.id)}>
              <StoryContentBlock
                block={block}
                isHighlighted={narration.isActive && narration.currentBlockId === block.id}
                onPlayQuranAudio={
                  block.source?.type === 'quran'
                    ? () => handlePlayQuranAudio(block.source as QuranReference, block.id)
                    : undefined
                }
                isQuranPlaying={playingSourceId === block.id && audioState === 'playing'}
                isQuranLoading={playingSourceId === block.id && audioState === 'loading'}
              />
              </View>
            ))}

            {/* Mark Complete Button */}
            {currentContent.length > 0 && !isCurrentSubStoryCompleted && (
              <Pressable style={styles.completeButton} onPress={handleMarkComplete}>
                <Ionicons name="checkmark-circle-outline" size={20} color={color.progress} />
                <Text style={styles.completeButtonText}>{t('prophetsFeature.markComplete')}</Text>
              </Pressable>
            )}

            {isCurrentSubStoryCompleted && (
              <View style={styles.completedBadge}>
                <Ionicons name="checkmark-circle" size={20} color={color.progress} />
                <Text style={styles.completedText}>{t('prophetsFeature.sectionCompleted')}</Text>
              </View>
            )}
          </View>
        )}

        <View style={{ height: narration.isActive ? 104 : 40 }} />
      </ScrollView>

      {narration.isActive && (
        <SafeAreaView edges={['bottom']} style={styles.listenDock}>
          <ListenBar
            title={currentSubStory ? lc(currentSubStory.title, currentSubStory.titleFr) : lc(prophet.nameEnglish, prophet.nameFrench)}
            status={narration.status}
            progress={narration.progress}
            blockIndex={narration.currentBlockIndex}
            blockCount={narration.blockCount}
            remainingSeconds={narration.remainingSeconds}
            speed={narration.speed}
            onToggle={narration.toggle}
            onExpand={() => setPlayerOpen(true)}
            onCycleSpeed={cycleSpeed}
          />
        </SafeAreaView>
      )}

      <ListenSheet
        visible={playerOpen}
        title={currentSubStory ? lc(currentSubStory.title, currentSubStory.titleFr) : ''}
        subtitle={lc(prophet.nameEnglish, prophet.nameFrench)}
        arabicTitle={prophet.nameArabic}
        status={narration.status}
        progress={narration.progress}
        elapsedSeconds={narration.elapsedSeconds}
        remainingSeconds={narration.remainingSeconds}
        blockIndex={narration.currentBlockIndex}
        blockCount={narration.blockCount}
        speed={narration.speed}
        sleep={narration.sleep}
        voice={narration.voice}
        usingDeviceVoice={narration.usingDeviceVoice}
        voiceApplies={narration.voiceApplies}
        onClose={() => setPlayerOpen(false)}
        onToggle={narration.toggle}
        onSkip={narration.skipBlocks}
        onSeek={narration.seekToFraction}
        onSpeed={narration.setSpeed}
        onSleep={narration.setSleep}
        onVoice={narration.setVoice}
        onStop={() => {
          void narration.stop();
          setPlayerOpen(false);
        }}
      />
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
    gap: 16,
  },
  loadingText: {
    color: color.textMuted,
    fontSize: 14,
  },
  listenDock: {
    backgroundColor: color.surface,
  },
  listenButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    height: 48,
    borderRadius: radius.lg,
    backgroundColor: color.accentStrong,
    marginTop: 16,
  },
  listenButtonText: {
    color: color.textOnAccent,
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: color.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    marginLeft: 8,
  },
  prophetNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  prophetNameArabic: {
    fontFamily: font.arabic,
    lineHeight: 48,
    fontSize: 28,
    fontWeight: 'bold',
    color: color.text,
  },
  prophetNameEnglish: {
    fontSize: 18,
    color: color.textMuted,
  },
  prophetTitle: {
    fontSize: 12,
    color: color.accent,
    marginTop: 2,
  },
  headerMeta: {
    alignItems: 'flex-end',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    color: color.textFaint,
    fontSize: 11,
  },
  contentContainer: {
    flex: 1,
  },
  subStoryHeader: {
    padding: 20,
    paddingBottom: 12,
  },
  subStoryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: color.text,
  },
  subStoryTitleArabic: {
    fontFamily: font.arabic,
    lineHeight: 34,
    fontSize: 20,
    color: color.accent,
    marginTop: 4,
  },
  subStoryMeta: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  blocksContainer: {
    paddingHorizontal: 16,
  },
  comingSoonContainer: {
    padding: 24,
    alignItems: 'center',
  },
  comingSoonTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: color.text,
    marginTop: 16,
  },
  comingSoonText: {
    fontSize: 14,
    color: color.textMuted,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  summaryCard: {
    backgroundColor: color.surface,
    borderRadius: radius.md,
    padding: 16,
    marginTop: 24,
    width: '100%',
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: color.accent,
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    color: color.text,
    lineHeight: 22,
  },
  lessonsCard: {
    backgroundColor: color.surface,
    borderRadius: radius.md,
    padding: 16,
    marginTop: 16,
    width: '100%',
  },
  lessonsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: color.progress,
    marginBottom: 12,
  },
  lessonItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 10,
  },
  lessonText: {
    flex: 1,
    fontSize: 14,
    color: color.text,
    lineHeight: 20,
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withAlpha(color.progress, 0.13),
    borderRadius: radius.md,
    paddingVertical: 14,
    marginTop: 24,
    gap: 8,
    borderWidth: 1,
    borderColor: withAlpha(color.progress, 0.25),
  },
  completeButtonText: {
    color: color.progress,
    fontSize: 15,
    fontWeight: '600',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withAlpha(color.progress, 0.13),
    borderRadius: radius.md,
    paddingVertical: 14,
    marginTop: 24,
    gap: 8,
  },
  completedText: {
    color: color.progress,
    fontSize: 15,
    fontWeight: '600',
  },
});

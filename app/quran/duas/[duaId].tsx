import { useEffect, useCallback, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useLocalizedContent } from '../../../src/hooks/useLocalizedContent';
import { getDuaById, getAllDuas } from '../../../src/data/arabic/duas';
import { useDuasStore } from '../../../src/stores/duasStore';
import { useArabicSpeech } from '../../../src/hooks/useArabicSpeech';
import { ShareToGroupModal } from '../../../src/components/community/ShareToGroupModal';
import type { SharedContent } from '../../../src/data/community/socialData';
import {
  DUA_CATEGORY_LABELS,
  HADITH_COLLECTION_NAMES,
} from '../../../src/types/duas';

export default function DuaDetailScreen() {
  const { t } = useTranslation();
  const { lc } = useLocalizedContent();
  const { duaId } = useLocalSearchParams<{ duaId: string }>();

  const {
    isFavorite,
    isMemorized,
    toggleFavorite,
    toggleMemorized,
    setLastViewed,
  } = useDuasStore();

  // Audio/Speech functionality
  const { speak, stop, isSpeaking, voiceGender, setVoiceGender, swapVoices, hasMultipleVoices } = useArabicSpeech();
  const [showVoiceHelp, setShowVoiceHelp] = useState(false);
  const [shareContent, setShareContent] = useState<SharedContent | null>(null);

  // Get dua data
  const dua = duaId ? getDuaById(duaId) : undefined;
  const allDuas = getAllDuas();
  const currentIndex = dua ? allDuas.findIndex(d => d.id === dua.id) : -1;
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < allDuas.length - 1;

  // Track view
  useEffect(() => {
    if (duaId && dua) {
      setLastViewed(duaId);
    }
  }, [duaId, dua, setLastViewed]);

  const handleToggleFavorite = useCallback(() => {
    if (duaId) {
      toggleFavorite(duaId);
    }
  }, [duaId, toggleFavorite]);

  const handleToggleMemorized = useCallback(() => {
    if (duaId) {
      toggleMemorized(duaId);
    }
  }, [duaId, toggleMemorized]);

  // Handle playing the Arabic text
  const handlePlayDua = useCallback(async () => {
    if (!dua) return;

    if (isSpeaking) {
      await stop();
    } else {
      await speak(dua.arabicText);
    }
  }, [dua, isSpeaking, speak, stop]);

  // Toggle voice gender
  const handleToggleVoice = useCallback(() => {
    if (!hasMultipleVoices) {
      // Only one voice available, show help
      Alert.alert(
        t('duasFeature.downloadMoreVoices'),
        t('duasFeature.downloadVoicesInstructions'),
        [{ text: t('duasFeature.ok') }]
      );
      return;
    }
    setVoiceGender(voiceGender === 'female' ? 'male' : 'female');
  }, [voiceGender, setVoiceGender, hasMultipleVoices]);

  // Swap voices if detection was wrong (long-press)
  const handleSwapVoices = useCallback(() => {
    if (!hasMultipleVoices) {
      // Only one voice available, show help
      Alert.alert(
        t('duasFeature.onlyOneVoice'),
        t('duasFeature.onlyOneVoiceDesc'),
        [{ text: t('duasFeature.ok') }]
      );
      return;
    }
    swapVoices();
    Alert.alert(
      t('duasFeature.voicesSwapped'),
      t('duasFeature.voicesSwappedDesc'),
      [{ text: t('duasFeature.ok') }]
    );
  }, [swapVoices, hasMultipleVoices]);

  // Stop speech when leaving screen
  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  // Navigation handlers
  const handlePrevious = useCallback(async () => {
    if (hasPrevious) {
      await stop();
      const prevDua = allDuas[currentIndex - 1];
      router.replace(`/quran/duas/${prevDua.id}` as any);
    }
  }, [hasPrevious, currentIndex, allDuas, stop]);

  const handleNext = useCallback(async () => {
    if (hasNext) {
      await stop();
      const nextDua = allDuas[currentIndex + 1];
      router.replace(`/quran/duas/${nextDua.id}` as any);
    }
  }, [hasNext, currentIndex, allDuas, stop]);

  if (!dua) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#f59e0b" />
          <Text style={styles.loadingText}>{t('duasFeature.loadingDua')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const favorite = duaId ? isFavorite(duaId) : false;
  const memorized = duaId ? isMemorized(duaId) : false;
  const categoryLabel = DUA_CATEGORY_LABELS[dua.category];
  const collectionName = HADITH_COLLECTION_NAMES[dua.source.collection];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </Pressable>
        <View style={styles.headerTitle}>
          <Text style={styles.duaNameArabic}>{dua.titleArabic}</Text>
          <Text style={styles.duaNameEnglish}>{lc(dua.titleEnglish, dua.titleFrench)}</Text>
        </View>
        <Pressable
          style={styles.backButton}
          onPress={() => setShareContent({
            kind: 'dua',
            arabic: dua.arabicText,
            translit: dua.transliteration,
            translation: lc(dua.translation, dua.translationFr),
            audioText: dua.arabicText,
            ref: dua.titleArabic,
            route: `/quran/duas/${dua.id}`,
          })}
          accessibilityLabel={t('community.shareToGroup', { defaultValue: 'Share to group' })}
        >
          <Ionicons name="paper-plane-outline" size={22} color="#818cf8" />
        </Pressable>
      </View>

      {/* Category Badge + Navigation */}
      <View style={styles.subHeader}>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{lc(categoryLabel.english, categoryLabel.french)}</Text>
          <Text style={styles.categoryTextArabic}>{categoryLabel.arabic}</Text>
        </View>
        <View style={{ flex: 1 }} />
        <View style={styles.headerNav}>
          <Pressable
            style={[styles.navButton, !hasPrevious && styles.navButtonDisabled]}
            onPress={handlePrevious}
            disabled={!hasPrevious}
          >
            <Ionicons
              name="chevron-back"
              size={20}
              color={hasPrevious ? '#f59e0b' : '#334155'}
            />
          </Pressable>
          <Text style={styles.duaNumber}>{dua.order}/{allDuas.length}</Text>
          <Pressable
            style={[styles.navButton, !hasNext && styles.navButtonDisabled]}
            onPress={handleNext}
            disabled={!hasNext}
          >
            <Ionicons
              name="chevron-forward"
              size={20}
              color={hasNext ? '#f59e0b' : '#334155'}
            />
          </Pressable>
        </View>
        </View>

      {/* Content */}
      <ScrollView
        style={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Arabic Text */}
        <View style={styles.arabicCard}>
          <Text style={styles.arabicText}>{dua.arabicText}</Text>

          {/* Audio Controls */}
          <View style={styles.audioControls}>
            <Pressable
              style={[styles.voiceButton, !hasMultipleVoices && styles.voiceButtonDisabled]}
              onPress={handleToggleVoice}
              onLongPress={handleSwapVoices}
              delayLongPress={500}
            >
              {!hasMultipleVoices ? (
                <>
                  <Ionicons name="alert-circle" size={18} color="#f59e0b" />
                  <Text style={styles.voiceTextWarning}>{t('duasFeature.oneVoice')}</Text>
                </>
              ) : (
                <>
                  <Ionicons
                    name={voiceGender === 'female' ? 'woman' : 'man'}
                    size={18}
                    color={voiceGender === 'female' ? '#ec4899' : '#3b82f6'}
                  />
                  <Text style={[styles.voiceText, voiceGender === 'female' ? styles.voiceTextFemale : styles.voiceTextMale]}>
                    {voiceGender === 'female' ? t('duasFeature.female') : t('duasFeature.male')}
                  </Text>
                </>
              )}
            </Pressable>


            <Pressable
              style={[styles.playButton, isSpeaking && styles.playButtonActive]}
              onPress={handlePlayDua}
            >
              <Ionicons
                name={isSpeaking ? 'stop' : 'play'}
                size={24}
                color="#ffffff"
              />
              <Text style={styles.playButtonText}>
                {isSpeaking ? t('duasFeature.stop') : t('duasFeature.listen')}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Transliteration */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('duasFeature.transliteration')}</Text>
          <Text style={styles.transliterationText}>{dua.transliteration}</Text>
        </View>

        {/* Translation */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('duasFeature.translation')}</Text>
          <Text style={styles.translationText}>{lc(dua.translation, dua.translationFr)}</Text>
        </View>

        {/* Source Card */}
        <View style={styles.sourceCard}>
          <View style={styles.sourceHeader}>
            <Ionicons name="book" size={18} color="#818cf8" />
            <Text style={styles.sourceTitle}>{t('duasFeature.source')}</Text>
          </View>
          <Text style={styles.sourceCollection}>{collectionName}</Text>
          <Text style={styles.sourceHadith}>{t('duasFeature.hadithNumber', { number: dua.source.hadithNumber })}</Text>
          {dua.source.narrator && (
            <Text style={styles.sourceNarrator}>
              {t('duasFeature.narratedBy')} {dua.source.narrator}
            </Text>
          )}
        </View>

        {/* Occasion */}
        {dua.occasion && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="time" size={18} color="#f59e0b" />
              <Text style={[styles.sectionTitle, { marginLeft: 8, marginBottom: 0 }]}>
                {t('duasFeature.whenToRecite')}
              </Text>
            </View>
            <Text style={styles.occasionText}>{lc(dua.occasion, dua.occasionFr)}</Text>
          </View>
        )}

        {/* Virtues */}
        {dua.virtues && (
          <View style={styles.virtuesCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="star" size={18} color="#10b981" />
              <Text style={[styles.sectionTitle, { color: '#10b981', marginLeft: 8, marginBottom: 0 }]}>
                {t('duasFeature.virtuesRewards')}
              </Text>
            </View>
            <Text style={styles.virtuesText}>{lc(dua.virtues, dua.virtuesFr)}</Text>
          </View>
        )}

        {/* Story */}
        {dua.story && (
          <View style={styles.storyCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="book-outline" size={18} color="#8b5cf6" />
              <Text style={[styles.sectionTitle, { color: '#8b5cf6', marginLeft: 8, marginBottom: 0 }]}>
                {t('duasFeature.backgroundStory')}
              </Text>
            </View>
            <Text style={styles.storyText}>{lc(dua.story, dua.storyFr)}</Text>
          </View>
        )}

        {/* Memorized Toggle */}
        <Pressable
          style={[
            styles.memorizedButton,
            memorized && styles.memorizedButtonActive,
          ]}
          onPress={handleToggleMemorized}
        >
          <Ionicons
            name={memorized ? 'checkmark-circle' : 'checkmark-circle-outline'}
            size={22}
            color={memorized ? '#10b981' : '#94a3b8'}
          />
          <Text
            style={[
              styles.memorizedButtonText,
              memorized && styles.memorizedButtonTextActive,
            ]}
          >
            {memorized ? t('duasFeature.memorized') : t('duasFeature.markMemorized')}
          </Text>
        </Pressable>

        <View style={{ height: 40 }} />
      </ScrollView>

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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingText: {
    color: '#94a3b8',
    fontSize: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    marginLeft: 8,
  },
  duaNameArabic: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  duaNameEnglish: {
    fontSize: 14,
    color: '#cbd5e1',
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
  duaNumber: {
    color: '#64748b',
    fontSize: 13,
    minWidth: 44,
    textAlign: 'center',
  },
  subHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f59e0b20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  categoryText: {
    color: '#f59e0b',
    fontSize: 12,
    fontWeight: '600',
  },
  categoryTextArabic: {
    color: '#f59e0b',
    fontSize: 12,
  },
  favoriteButton: {
    padding: 8,
    backgroundColor: '#1e293b',
    borderRadius: 10,
  },
  contentContainer: {
    flex: 1,
  },
  arabicCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 24,
    margin: 16,
    borderWidth: 1,
    borderColor: '#f59e0b30',
  },
  arabicText: {
    fontSize: 26,
    lineHeight: 48,
    color: '#ffffff',
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  audioControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    gap: 12,
  },
  voiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#334155',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  voiceText: {
    fontSize: 13,
    fontWeight: '600',
  },
  voiceTextFemale: {
    color: '#ec4899',
  },
  voiceTextMale: {
    color: '#3b82f6',
  },
  voiceButtonDisabled: {
    borderWidth: 1,
    borderColor: '#f59e0b40',
  },
  voiceTextWarning: {
    color: '#f59e0b',
    fontSize: 13,
    fontWeight: '600',
  },
  speedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#334155',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  speedText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '600',
  },
  speedTextActive: {
    color: '#f59e0b',
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f59e0b',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 8,
  },
  playButtonActive: {
    backgroundColor: '#ef4444',
  },
  playButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f59e0b',
    marginBottom: 10,
  },
  transliterationText: {
    fontSize: 15,
    fontStyle: 'italic',
    color: '#94a3b8',
    lineHeight: 24,
  },
  translationText: {
    fontSize: 15,
    color: '#cbd5e1',
    lineHeight: 24,
  },
  sourceCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 20,
  },
  sourceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  sourceTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#818cf8',
  },
  sourceCollection: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
  },
  sourceHadith: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 4,
  },
  sourceNarrator: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 4,
    fontStyle: 'italic',
  },
  occasionText: {
    fontSize: 14,
    color: '#e2e8f0',
    lineHeight: 22,
    marginTop: 8,
  },
  virtuesCard: {
    backgroundColor: '#10b98110',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#10b98130',
  },
  virtuesText: {
    fontSize: 14,
    color: '#e2e8f0',
    lineHeight: 22,
    marginTop: 8,
  },
  storyCard: {
    backgroundColor: '#8b5cf610',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#8b5cf630',
  },
  storyText: {
    fontSize: 14,
    color: '#e2e8f0',
    lineHeight: 22,
    marginTop: 8,
  },
  memorizedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 12,
    paddingVertical: 16,
    marginHorizontal: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  memorizedButtonActive: {
    backgroundColor: '#10b98120',
    borderColor: '#10b98140',
  },
  memorizedButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#94a3b8',
  },
  memorizedButtonTextActive: {
    color: '#10b981',
  },
});

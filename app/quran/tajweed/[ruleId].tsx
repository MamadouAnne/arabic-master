import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Modal, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { speakGoogleArabic } from '../../../src/services/speech/googleArabicTts';
import { useTranslation } from 'react-i18next';
import { useLocalizedContent } from '../../../src/hooks/useLocalizedContent';
import { getTajweedRuleById } from '../../../src/data/arabic/quran/tajweed/rules';
import { useQuranStore } from '../../../src/stores/quranStore';
import { TajweedRuleId, TajweedExample } from '../../../src/types/quran';
import {
  quranAudioService,
  QURAN_RECITERS,
  ReciterId,
  AudioState
} from '../../../src/services/quranAudioService';

// Recommended reciters for Tajweed learning (clear pronunciation)
const TAJWEED_RECITERS = [
  {
    id: 'mahmoud-khalil-husary' as ReciterId,
    name: 'Al-Husary',
    nameArabic: 'الحصري',
    descriptionKey: 'tajweedFeature.classicStyle',
    icon: 'school-outline',
  },
  {
    id: 'mishary-alafasy' as ReciterId,
    name: 'Alafasy',
    nameArabic: 'العفاسي',
    descriptionKey: 'tajweedFeature.clearMelodic',
    icon: 'musical-notes-outline',
  },
  {
    id: 'abdul-basit-murattal' as ReciterId,
    name: 'Abdul Basit',
    nameArabic: 'عبد الباسط',
    descriptionKey: 'tajweedFeature.traditionalMurattal',
    icon: 'mic-outline',
  },
  {
    id: 'minshawi-murattal' as ReciterId,
    name: 'Al-Minshawi',
    nameArabic: 'المنشاوي',
    descriptionKey: 'tajweedFeature.beautifulTajweed',
    icon: 'heart-outline',
  },
];

export default function TajweedRuleDetailScreen() {
  const { t } = useTranslation();
  const { lc } = useLocalizedContent();
  const { ruleId } = useLocalSearchParams<{ ruleId: string }>();
  const [selectedReciter, setSelectedReciter] = useState<ReciterId>('mahmoud-khalil-husary');
  const [showReciterModal, setShowReciterModal] = useState(false);
  const [playingExample, setPlayingExample] = useState<number | null>(null);
  const [audioState, setAudioState] = useState<AudioState>('idle');

  const rule = getTajweedRuleById(ruleId as TajweedRuleId);
  const {
    markTajweedRuleLearned,
    markTajweedRuleMastered,
    isTajweedRuleLearned,
    isTajweedRuleMastered,
  } = useQuranStore();

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      quranAudioService.stop();
    };
  }, []);

  if (!rule) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>{t('tajweedFeature.ruleNotFound')}</Text>
      </SafeAreaView>
    );
  }

  const isLearned = isTajweedRuleLearned(rule.id);
  const isMastered = isTajweedRuleMastered(rule.id);

  // Play individual letter using free Google TTS (for letter buttons)
  const playLetter = (letter: string) => {
    speakGoogleArabic(letter, { rate: 0.7 });
  };

  // Play Quran verse example using real reciter audio
  const playExample = async (example: TajweedExample, index: number) => {
    // If already playing this example, stop it
    if (playingExample === index && audioState === 'playing') {
      await quranAudioService.stop();
      setPlayingExample(null);
      setAudioState('idle');
      return;
    }

    // Stop any current playback
    await quranAudioService.stop();

    setPlayingExample(index);
    setAudioState('loading');

    await quranAudioService.playAyah(
      example.surahNumber,
      example.ayahNumber,
      {
        reciterId: selectedReciter,
        rate: 0.85, // Slightly slower for learning
        onStateChange: (state) => {
          setAudioState(state);
          if (state === 'idle') {
            setPlayingExample(null);
          }
        },
        onComplete: () => {
          setPlayingExample(null);
          setAudioState('idle');
        },
        onError: (error) => {
          __DEV__ && console.error('Audio error:', error);
          setPlayingExample(null);
          setAudioState('idle');
        },
      }
    );
  };

  const handleMarkLearned = () => {
    markTajweedRuleLearned(rule.id);
  };

  const handleMarkMastered = () => {
    markTajweedRuleMastered(rule.id);
  };

  const selectedReciterInfo = TAJWEED_RECITERS.find(r => r.id === selectedReciter);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </Pressable>
          <View style={styles.headerCenter}>
            <Text style={styles.ruleName}>{lc(rule.nameEnglish, rule.nameFrench)}</Text>
            <Text style={[styles.ruleArabic, { color: rule.colorCode }]}>
              {rule.nameArabic}
            </Text>
          </View>
          <View style={styles.headerRight}>
            {isMastered && <Ionicons name="star" size={24} color="#f59e0b" />}
            {isLearned && !isMastered && (
              <Ionicons name="checkmark-circle" size={24} color="#10b981" />
            )}
          </View>
        </View>

        {/* Reciter Selection */}
        <Pressable
          style={styles.reciterSelector}
          onPress={() => setShowReciterModal(true)}
        >
          <View style={styles.reciterInfo}>
            <Ionicons name="person-circle-outline" size={24} color="#10b981" />
            <View style={styles.reciterText}>
              <Text style={styles.reciterLabel}>{t('tajweedFeature.reciter')}</Text>
              <Text style={styles.reciterName}>
                {selectedReciterInfo?.name} ({selectedReciterInfo?.nameArabic})
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-down" size={20} color="#64748b" />
        </Pressable>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('tajweedFeature.description')}</Text>
          <View style={styles.descriptionCard}>
            <Text style={styles.description}>{lc(rule.description, rule.descriptionFr)}</Text>
            {rule.descriptionArabic && (
              <Text style={styles.descriptionArabic}>{rule.descriptionArabic}</Text>
            )}
          </View>
        </View>

        {/* Letters */}
        {rule.letters && rule.letters.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('tajweedFeature.lettersInvolved')}</Text>
            <Text style={styles.sectionHint}>{t('tajweedFeature.tapLetterToHear')}</Text>
            <View style={styles.lettersContainer}>
              {rule.letters.map((letter, index) => (
                <Pressable
                  key={index}
                  style={styles.letterButton}
                  onPress={() => playLetter(letter)}
                >
                  <Text style={styles.letterText}>{letter}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* Duration */}
        {rule.duration && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('tajweedFeature.duration')}</Text>
            <View style={styles.durationCard}>
              <Ionicons name="time-outline" size={24} color="#10b981" />
              <Text style={styles.durationText}>{rule.duration} {t('tajweedFeature.harakat')}</Text>
              <View style={styles.durationDots}>
                {Array.from({ length: rule.duration }).map((_, i) => (
                  <View key={i} style={styles.durationDot} />
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Examples with Real Quran Audio */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('tajweedFeature.examplesFromQuran')}</Text>
          <Text style={styles.sectionHint}>
            {t('tajweedFeature.listenToRecitation')}
          </Text>
          {rule.examples.map((example, index) => {
            const isCurrentlyPlaying = playingExample === index;
            const isLoading = isCurrentlyPlaying && audioState === 'loading';
            const isPlaying = isCurrentlyPlaying && audioState === 'playing';

            // Render full ayah text with highlighted portion
            const renderHighlightedAyah = () => {
              const fullText = example.fullAyahText || example.text;
              const highlightText = example.highlightText;

              if (!highlightText || !fullText.includes(highlightText)) {
                return <Text style={styles.fullAyahText}>{fullText}</Text>;
              }

              const parts = fullText.split(highlightText);
              return (
                <Text style={styles.fullAyahText}>
                  {parts.map((part, i) => (
                    <Text key={i}>
                      {part}
                      {i < parts.length - 1 && (
                        <Text style={[styles.highlightedPortion, { color: '#FFFF00', backgroundColor: '#FFFF0030' }]}>
                          {highlightText}
                        </Text>
                      )}
                    </Text>
                  ))}
                </Text>
              );
            };

            return (
              <View key={index} style={styles.exampleCard}>
                {/* Surah/Ayah reference at top */}
                <View style={styles.exampleSourceTop}>
                  <Ionicons name="book-outline" size={14} color="#10b981" />
                  <Text style={styles.exampleSourceTextTop}>
                    {t('tajweedFeature.surah')} {example.surahName} ({example.surahNumber}:{example.ayahNumber})
                  </Text>
                </View>

                {/* Full Ayah Text with Highlighted Rule */}
                <View style={styles.fullAyahContainer}>
                  {renderHighlightedAyah()}
                </View>

                {/* Play button and controls */}
                <View style={styles.audioControlsRow}>
                  <Pressable
                    style={[
                      styles.playButton,
                      isPlaying && styles.playButtonActive,
                      isLoading && styles.playButtonLoading,
                    ]}
                    onPress={() => playExample(example, index)}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator size="small" color="#10b981" />
                    ) : (
                      <Ionicons
                        name={isPlaying ? "pause" : "play"}
                        size={24}
                        color={isPlaying ? "#10b981" : "#ffffff"}
                      />
                    )}
                  </Pressable>
                  <Text style={styles.playHintText}>
                    {isPlaying ? t('tajweedFeature.playing') : isLoading ? t('common.loading') : t('tajweedFeature.tapToListen')}
                  </Text>
                </View>

                {/* Rule highlight badge */}
                {example.highlightText && (
                  <View style={styles.ruleHighlightSection}>
                    <View style={[styles.highlightBadge, { borderColor: '#FFFF00' }]}>
                      <Text style={[styles.highlightText, { color: '#FFFF00' }]}>
                        {example.highlightText}
                      </Text>
                      <Text style={styles.highlightLabel}>{t('tajweedFeature.ruleAppliedHere')}</Text>
                    </View>
                  </View>
                )}

                {example.explanation && (
                  <View style={styles.explanationContainer}>
                    <Ionicons name="information-circle-outline" size={16} color="#10b981" />
                    <Text style={styles.exampleExplanation}>{lc(example.explanation, example.explanationFr)}</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Action Buttons */}
        <View style={[styles.actionsContainer, { marginBottom: 100 }]}>
          {!isLearned && (
            <Pressable style={styles.primaryButton} onPress={handleMarkLearned}>
              <Ionicons name="checkmark" size={20} color="#ffffff" />
              <Text style={styles.primaryButtonText}>{t('tajweedFeature.markLearned')}</Text>
            </Pressable>
          )}
          {isLearned && !isMastered && (
            <Pressable style={styles.masterButton} onPress={handleMarkMastered}>
              <Ionicons name="star" size={20} color="#ffffff" />
              <Text style={styles.masterButtonText}>{t('tajweedFeature.markMastered')}</Text>
            </Pressable>
          )}
          {isMastered && (
            <View style={styles.masteredBadge}>
              <Ionicons name="star" size={24} color="#f59e0b" />
              <Text style={styles.masteredText}>{t('tajweedFeature.masteredRule')}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Reciter Selection Modal */}
      <Modal
        visible={showReciterModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowReciterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('tajweedFeature.chooseReciter')}</Text>
              <Pressable onPress={() => setShowReciterModal(false)}>
                <Ionicons name="close" size={24} color="#ffffff" />
              </Pressable>
            </View>
            <Text style={styles.modalSubtitle}>
              {t('tajweedFeature.selectReciter')}
            </Text>

            {TAJWEED_RECITERS.map((reciter) => (
              <Pressable
                key={reciter.id}
                style={[
                  styles.reciterOption,
                  selectedReciter === reciter.id && styles.reciterOptionSelected,
                ]}
                onPress={() => {
                  setSelectedReciter(reciter.id);
                  setShowReciterModal(false);
                }}
              >
                <View style={styles.reciterOptionIcon}>
                  <Ionicons
                    name={reciter.icon as any}
                    size={24}
                    color={selectedReciter === reciter.id ? '#10b981' : '#64748b'}
                  />
                </View>
                <View style={styles.reciterOptionInfo}>
                  <Text style={styles.reciterOptionName}>
                    {reciter.name} ({reciter.nameArabic})
                  </Text>
                  <Text style={styles.reciterOptionDesc}>{t(reciter.descriptionKey)}</Text>
                </View>
                {selectedReciter === reciter.id && (
                  <Ionicons name="checkmark-circle" size={24} color="#10b981" />
                )}
              </Pressable>
            ))}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  ruleName: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  ruleArabic: {
    fontSize: 18,
    marginTop: 4,
  },
  headerRight: {
    width: 40,
    alignItems: 'flex-end',
  },
  reciterSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1e293b',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  reciterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  reciterText: {
    gap: 2,
  },
  reciterLabel: {
    color: '#64748b',
    fontSize: 12,
  },
  reciterName: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  sectionHint: {
    color: '#64748b',
    fontSize: 12,
    marginBottom: 12,
  },
  descriptionCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
  },
  description: {
    color: '#cbd5e1',
    fontSize: 15,
    lineHeight: 24,
  },
  descriptionArabic: {
    color: '#10b981',
    fontSize: 16,
    marginTop: 12,
    textAlign: 'right',
    lineHeight: 28,
  },
  lettersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  letterButton: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  letterText: {
    color: '#ffffff',
    fontSize: 24,
  },
  durationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  durationText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '500',
  },
  durationDots: {
    flexDirection: 'row',
    gap: 6,
    marginLeft: 'auto',
  },
  durationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10b981',
  },
  exampleCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  exampleSourceTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  exampleSourceTextTop: {
    color: '#10b981',
    fontSize: 13,
    fontWeight: '500',
  },
  fullAyahContainer: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  fullAyahText: {
    color: '#ffffff',
    fontSize: 24,
    textAlign: 'right',
    lineHeight: 42,
    fontFamily: undefined, // Uses system Arabic font
  },
  highlightedPortion: {
    fontWeight: '700',
    borderRadius: 4,
    paddingHorizontal: 2,
  },
  audioControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  playHintText: {
    color: '#64748b',
    fontSize: 13,
  },
  ruleHighlightSection: {
    marginBottom: 12,
  },
  highlightBadge: {
    backgroundColor: '#FFFF0015',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  highlightText: {
    fontSize: 26,
    fontWeight: '600',
  },
  highlightLabel: {
    color: '#64748b',
    fontSize: 11,
    marginTop: 4,
  },
  playButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButtonActive: {
    backgroundColor: '#10b98130',
    borderWidth: 2,
    borderColor: '#10b981',
  },
  playButtonLoading: {
    backgroundColor: '#10b98130',
  },
  explanationContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  exampleExplanation: {
    color: '#94a3b8',
    fontSize: 13,
    flex: 1,
    lineHeight: 20,
  },
  actionsContainer: {
    paddingHorizontal: 20,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10b981',
    borderRadius: 16,
    paddingVertical: 16,
    gap: 8,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  masterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f59e0b',
    borderRadius: 16,
    paddingVertical: 16,
    gap: 8,
  },
  masterButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  masteredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f59e0b20',
    borderRadius: 16,
    paddingVertical: 20,
    gap: 10,
  },
  masteredText: {
    color: '#f59e0b',
    fontSize: 16,
    fontWeight: '600',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1e293b',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  modalTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalSubtitle: {
    color: '#64748b',
    fontSize: 14,
    marginBottom: 20,
  },
  reciterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  reciterOptionSelected: {
    borderWidth: 2,
    borderColor: '#10b981',
  },
  reciterOptionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reciterOptionInfo: {
    flex: 1,
    marginLeft: 12,
  },
  reciterOptionName: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '500',
  },
  reciterOptionDesc: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 2,
  },
});

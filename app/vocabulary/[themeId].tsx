import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useLocalizedContent } from '../../src/hooks/useLocalizedContent';
import { getThemeById, getWordsByTheme } from '../../src/data/arabic/vocabulary';
import { getWritingExercisesForVocabularyTheme } from '../../src/data/arabic/exercises';
import { useProgressStore } from '../../src/stores/progressStore';
import { useArabicSpeech } from '../../src/hooks/useArabicSpeech';
import { useEffect, useState, memo, useCallback } from 'react';
import { VocabularyWord } from '../../src/types/arabic';
import HighlightedText from '../../src/components/ui/HighlightedText';
import { ShareToGroupModal } from '../../src/components/community/ShareToGroupModal';
import type { SharedContent } from '../../src/data/community/socialData';
import { font, color, radius } from '../../src/theme/tokens';
import { withAlpha } from '../../src/components/ui/Primitives';

// Part of speech labels with colors
const partOfSpeechConfig: Record<string, { label: string; labelArabic: string; color: string }> = {
  noun: { label: 'Noun', labelArabic: 'اِسْم', color: color.progress },
  verb: { label: 'Verb', labelArabic: 'فِعْل', color: color.accentStrong },
  adjective: { label: 'Adjective', labelArabic: 'صِفَة', color: color.warning },
  adverb: { label: 'Adverb', labelArabic: 'ظَرْف', color: color.accent },
  preposition: { label: 'Preposition', labelArabic: 'حَرْف جَرّ', color: color.accent },
  pronoun: { label: 'Pronoun', labelArabic: 'ضَمِير', color: color.progress },
  other: { label: 'Phrase', labelArabic: 'عِبَارَة', color: color.textFaint },
};

export default function ThemeDetailScreen() {
  const { t } = useTranslation();
  const { lc } = useLocalizedContent();
  const { themeId } = useLocalSearchParams<{ themeId: string }>();
  const theme = getThemeById(themeId || '');
  const words = getWordsByTheme(themeId || '');

  const {
    progress,
    showVowels,
    markWordLearned,
    markWordMastered,
    startTheme,
    addXp,
    updateStreak,
  } = useProgressStore();

  const [expandedWordId, setExpandedWordId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'all' | 'nouns' | 'verbs' | 'adjectives' | 'other'>('all');
  const [shareContent, setShareContent] = useState<SharedContent | null>(null);
  const { speak } = useArabicSpeech();

  const shareWord = useCallback((word: VocabularyWord) => {
    setShareContent({
      kind: 'word',
      arabic: word.arabicWithVowels || word.arabic,
      translit: word.transliteration,
      translation: lc(word.english, word.french),
      example: word.exampleSentence?.arabic,
      exampleTranslation: word.exampleSentence ? lc(word.exampleSentence.english, word.exampleSentence.french) : undefined,
      audioText: word.arabicWithVowels || word.arabic,
      ref: lc(theme?.name, theme?.nameFr) || undefined,
      route: `/vocabulary/${themeId}`,
    });
  }, [lc, theme, themeId]);

  useEffect(() => {
    if (theme && !progress.vocabularyProgress.themesStarted.includes(theme.id)) {
      startTheme(theme.id);
    }
  }, [theme]);

  if (!theme) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{t('common.notFound')}</Text>
          <Pressable style={styles.backLink} onPress={() => router.back()}>
            <Text style={styles.backLinkText}>{t('common.goBack')}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const learnedWords = progress.vocabularyProgress.wordsLearned;
  const masteredWords = progress.vocabularyProgress.wordsMastered;

  const getWordStatus = (wordId: string) => {
    if (masteredWords.includes(wordId)) return 'mastered';
    if (learnedWords.includes(wordId)) return 'learned';
    return 'new';
  };

  const themeWordsLearned = words.filter((w) => learnedWords.includes(w.id)).length;
  const progressPercent = Math.round((themeWordsLearned / words.length) * 100);

  const handleMarkLearned = (wordId: string) => {
    markWordLearned(wordId);
    addXp(5);
    updateStreak();
  };

  const handleMarkMastered = (wordId: string) => {
    markWordMastered(wordId);
    addXp(15);
    updateStreak();
  };

  // Filter words by view mode
  const filteredWords = words.filter(word => {
    if (viewMode === 'all') return true;
    if (viewMode === 'nouns') return word.partOfSpeech === 'noun';
    if (viewMode === 'verbs') return word.partOfSpeech === 'verb';
    if (viewMode === 'adjectives') return word.partOfSpeech === 'adjective';
    return !['noun', 'verb', 'adjective'].includes(word.partOfSpeech);
  });

  // Group words by part of speech for stats
  const wordsByType = {
    nouns: words.filter(w => w.partOfSpeech === 'noun').length,
    verbs: words.filter(w => w.partOfSpeech === 'verb').length,
    adjectives: words.filter(w => w.partOfSpeech === 'adjective').length,
    other: words.filter(w => !['noun', 'verb', 'adjective'].includes(w.partOfSpeech)).length,
  };

  // Get words with examples for showcase
  const wordsWithExamples = words.filter(w => w.exampleSentence);

  const writingExercises = getWritingExercisesForVocabularyTheme(theme.id);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={color.text} />
          </Pressable>
          <View style={styles.headerText}>
            <Text style={styles.title}>{lc(theme.name, theme.nameFr)}</Text>
            <Text style={styles.titleArabic}>{theme.nameArabic}</Text>
          </View>
        </View>

        {/* Theme Introduction Card */}
        <View style={[styles.introCard, { borderLeftColor: theme.color }]}>
          <View style={styles.introCardContent}>
            <View style={styles.introIconContainer}>
              <Text style={styles.themeIcon}>{theme.icon}</Text>
            </View>
            <View style={styles.introTextContainer}>
              <Text style={styles.introDesc}>{theme.description}</Text>
              <View style={styles.introMeta}>
                <View style={styles.introBadge}>
                  <Text style={styles.introBadgeText}>{theme.level}</Text>
                </View>
                <Text style={styles.introWordCount}>{t('vocabulary.wordsCount', { count: words.length })}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Progress Card */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Ionicons name="stats-chart" size={20} color={color.progress} />
            <Text style={styles.progressTitle}>{t('common.yourProgress')}</Text>
          </View>
          <View style={styles.progressStats}>
            <View style={styles.progressStat}>
              <Text style={styles.progressStatValue}>{themeWordsLearned}</Text>
              <Text style={styles.progressStatLabel}>{t('common.learned')}</Text>
            </View>
            <View style={styles.progressDivider} />
            <View style={styles.progressStat}>
              <Text style={styles.progressStatValue}>{words.filter(w => masteredWords.includes(w.id)).length}</Text>
              <Text style={styles.progressStatLabel}>{t('common.mastered')}</Text>
            </View>
            <View style={styles.progressDivider} />
            <View style={styles.progressStat}>
              <Text style={[styles.progressStatValue, { color: color.progress }]}>{progressPercent}%</Text>
              <Text style={styles.progressStatLabel}>{t('common.complete')}</Text>
            </View>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${progressPercent}%`, backgroundColor: theme.color },
              ]}
            />
          </View>
        </View>

        {/* Word Type Filter */}
        <View style={styles.filterSection}>
          <Text style={styles.filterTitle}>{t('vocabulary.filterByType')}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            <Pressable
              style={[styles.filterChip, viewMode === 'all' && styles.filterChipActive]}
              onPress={() => setViewMode('all')}
            >
              <Text style={[styles.filterChipText, viewMode === 'all' && styles.filterChipTextActive]}>
                {t('common.all')} ({words.length})
              </Text>
            </Pressable>
            {wordsByType.nouns > 0 && (
              <Pressable
                style={[styles.filterChip, viewMode === 'nouns' && { backgroundColor: withAlpha(color.progress, 0.19), borderColor: color.progress }]}
                onPress={() => setViewMode('nouns')}
              >
                <Text style={[styles.filterChipText, viewMode === 'nouns' && { color: color.progress }]}>
                  {t('vocabulary.nouns')} ({wordsByType.nouns})
                </Text>
              </Pressable>
            )}
            {wordsByType.adjectives > 0 && (
              <Pressable
                style={[styles.filterChip, viewMode === 'adjectives' && { backgroundColor: withAlpha(color.warning, 0.19), borderColor: color.warning }]}
                onPress={() => setViewMode('adjectives')}
              >
                <Text style={[styles.filterChipText, viewMode === 'adjectives' && { color: color.warning }]}>
                  {t('vocabulary.adjectives')} ({wordsByType.adjectives})
                </Text>
              </Pressable>
            )}
            {wordsByType.other > 0 && (
              <Pressable
                style={[styles.filterChip, viewMode === 'other' && { backgroundColor: withAlpha(color.textFaint, 0.19), borderColor: color.textFaint }]}
                onPress={() => setViewMode('other')}
              >
                <Text style={[styles.filterChipText, viewMode === 'other' && { color: color.textMuted }]}>
                  {t('vocabulary.phrases')} ({wordsByType.other})
                </Text>
              </Pressable>
            )}
          </ScrollView>
        </View>

        {/* Tip Card */}
        <View style={styles.tipCard}>
          <View style={styles.tipCardBorder} />
          <View style={styles.tipCardContent}>
            <View style={styles.tipCardHeader}>
              <Ionicons name="bulb" size={20} color={color.warning} />
              <Text style={styles.tipCardTitle}>{t('vocabulary.learningTip')}</Text>
            </View>
            <Text style={styles.tipCardText}>
              {t('vocabulary.learningTipText')}
            </Text>
          </View>
        </View>

        {/* Featured Examples Section */}
        {wordsWithExamples.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="chatbubble-ellipses" size={20} color={color.progress} />
              <Text style={styles.sectionTitle}>{t('vocabulary.exampleSentences')}</Text>
            </View>
            <Text style={styles.sectionSubtitle}>
              {t('vocabulary.exampleSentencesDesc')}
            </Text>
            <View style={styles.examplesGrid}>
              {wordsWithExamples.slice(0, 6).map((word) => (
                <Pressable
                  key={word.id}
                  style={styles.exampleCard}
                  onPress={() => speak(word.exampleSentence!.arabic)}
                >
                  <View style={styles.exampleCardHeader}>
                    <Text style={styles.exampleCardWord}>{word.arabicWithVowels}</Text>
                    <Text style={styles.exampleCardMeaning}>{lc(word.english, word.french)}</Text>
                  </View>
                  <View style={styles.exampleCardDivider} />
                  <Text style={styles.exampleCardArabic}>{word.exampleSentence!.arabic}</Text>
                  <Text style={styles.exampleCardEnglish}>{lc(word.exampleSentence!.english, word.exampleSentence!.french)}</Text>
                  <View style={styles.exampleCardAudioIcon}>
                    <Ionicons name="volume-medium" size={16} color={color.progress} />
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* Word List */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="list" size={20} color={color.progress} />
            <Text style={styles.sectionTitle}>
              {viewMode === 'all' ? t('vocabulary.allWords') : `${viewMode.charAt(0).toUpperCase() + viewMode.slice(1)}`} ({filteredWords.length})
            </Text>
          </View>

          {filteredWords.map((word) => {
            const status = getWordStatus(word.id);
            const isExpanded = expandedWordId === word.id;
            const posConfig = partOfSpeechConfig[word.partOfSpeech] || partOfSpeechConfig.other;

            return (
              <View key={word.id} style={styles.wordCard}>
                {/* Word Header */}
                <Pressable
                  style={styles.wordHeader}
                  onPress={() => setExpandedWordId(isExpanded ? null : word.id)}
                >
                  <View style={styles.wordMain}>
                    {/* Arabic and Audio */}
                    <Pressable
                      style={styles.wordArabicContainer}
                      onPress={(e) => {
                        e.stopPropagation();
                        speak(word.arabicWithVowels || word.arabic);
                      }}
                    >
                      <Text style={styles.wordArabic}>
                        {showVowels ? word.arabicWithVowels : word.arabic}
                      </Text>
                      <View style={styles.wordAudioBtn}>
                        <Ionicons name="volume-medium" size={16} color={color.progress} />
                      </View>
                    </Pressable>

                  </View>

                  <View style={styles.wordRight}>
                    {/* English meaning */}
                    <Text style={styles.wordEnglish} numberOfLines={2}>{lc(word.english, word.french)}</Text>

                    {/* Badges row */}
                    <View style={styles.wordBadges}>
                      {/* Part of speech badge */}
                      <View style={[styles.posBadge, { backgroundColor: posConfig.color + '20' }]}>
                        <Text style={[styles.posBadgeText, { color: posConfig.color }]}>
                          {posConfig.label}
                        </Text>
                      </View>

                      {/* Gender badge */}
                      {word.gender && (
                        <View style={[styles.genderBadge, {
                          backgroundColor: word.gender === 'masculine' ? '#3b82f620' : '#ec489920'
                        }]}>
                          <Text style={[styles.genderBadgeText, {
                            color: word.gender === 'masculine' ? '#3b82f6' : '#ec4899'
                          }]}>
                            {word.gender === 'masculine' ? 'm' : 'f'}
                          </Text>
                        </View>
                      )}

                      {/* Status indicator */}
                      {status !== 'new' && (
                        <Ionicons
                          name={status === 'mastered' ? 'star' : 'checkmark-circle'}
                          size={16}
                          color={status === 'mastered' ? '#10b981' : '#D4AF37'}
                        />
                      )}
                    </View>
                  </View>

                  {/* Expand indicator */}
                  <Ionicons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={color.textFaint}
                  />
                </Pressable>

                {/* Expanded Content */}
                {isExpanded && (
                  <View style={styles.wordExpanded}>
                    {/* Word details grid */}
                    <View style={styles.wordDetailsGrid}>
                      {word.plural && (
                        <View style={styles.wordDetail}>
                          <Text style={styles.wordDetailLabel}>{t('vocabulary.plural')}</Text>
                          <Pressable
                            style={styles.wordDetailValue}
                            onPress={() => speak(word.plural!)}
                          >
                            <Text style={styles.wordDetailArabic}>{word.plural}</Text>
                            <Ionicons name="volume-medium" size={14} color={color.progress} />
                          </Pressable>
                        </View>
                      )}
                      <View style={styles.wordDetail}>
                        <Text style={styles.wordDetailLabel}>{t('vocabulary.type')}</Text>
                        <View style={styles.wordDetailValue}>
                          <Text style={[styles.wordDetailText, { color: posConfig.color }]}>
                            {posConfig.labelArabic} ({posConfig.label})
                          </Text>
                        </View>
                      </View>
                      {word.gender && (
                        <View style={styles.wordDetail}>
                          <Text style={styles.wordDetailLabel}>{t('vocabulary.gender')}</Text>
                          <View style={styles.wordDetailValue}>
                            <Text style={styles.wordDetailText}>
                              {word.gender === 'masculine' ? `مُذَكَّر (${t('vocabulary.masculine')})` : `مُؤَنَّث (${t('vocabulary.feminine')})`}
                            </Text>
                          </View>
                        </View>
                      )}
                    </View>

                    {/* Example sentence */}
                    {word.exampleSentence && (
                      <Pressable
                        style={styles.exampleSection}
                        onPress={() => speak(word.exampleSentence!.arabic)}
                      >
                        <View style={styles.exampleSectionHeader}>
                          <Ionicons name="chatbubble-outline" size={16} color={color.progress} />
                          <Text style={styles.exampleLabel}>{t('vocabulary.exampleSentence')}</Text>
                          <Ionicons name="volume-medium" size={16} color={color.progress} />
                        </View>
                        <Text style={styles.exampleArabic}>
                          {word.exampleSentence.arabic}
                        </Text>
                        <Text style={styles.exampleEnglish}>
                          {lc(word.exampleSentence.english, word.exampleSentence.french)}
                        </Text>
                      </Pressable>
                    )}

                    {/* Action buttons */}
                    <View style={styles.actionButtons}>
                      {status === 'new' && (
                        <Pressable
                          style={styles.learnButton}
                          onPress={() => handleMarkLearned(word.id)}
                        >
                          <Ionicons name="checkmark" size={18} color={color.text} />
                          <Text style={styles.learnButtonText}>{t('vocabulary.markLearned')}</Text>
                        </Pressable>
                      )}
                      {status === 'learned' && (
                        <Pressable
                          style={styles.masterButton}
                          onPress={() => handleMarkMastered(word.id)}
                        >
                          <Ionicons name="star" size={18} color={color.textOnAccent} />
                          <Text style={styles.masterButtonText}>
                            {t('vocabulary.markMastered')}
                          </Text>
                        </Pressable>
                      )}
                      {status === 'mastered' && (
                        <View style={styles.masteredLabel}>
                          <Ionicons name="star" size={16} color={color.progress} />
                          <Text style={styles.masteredText}>{t('vocabulary.masteredBadge')}</Text>
                        </View>
                      )}
                      <Pressable
                        style={styles.shareButton}
                        onPress={() => shareWord(word)}
                        accessibilityLabel={t('community.shareToGroup', { defaultValue: 'Share to group' })}
                      >
                        <Ionicons name="paper-plane-outline" size={18} color={color.accent} />
                        <Text style={styles.shareButtonText}>{t('community.shareToGroup', { defaultValue: 'Share to group' })}</Text>
                      </Pressable>
                    </View>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Practice Buttons */}
        <View style={[styles.section, { marginBottom: 100 }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="fitness" size={20} color={color.progress} />
            <Text style={styles.sectionTitle}>{t('common.practice')}</Text>
          </View>

          <Pressable
            style={[styles.practiceButton, { backgroundColor: theme.color }]}
            onPress={() => router.push(`/vocabulary/flashcards?themeId=${theme.id}`)}
          >
            <Ionicons name="layers" size={20} color={color.text} />
            <Text style={styles.practiceButtonText}>{t('vocabulary.practiceFlashcards')}</Text>
            <Ionicons name="arrow-forward" size={20} color={color.text} />
          </Pressable>

          {writingExercises.length > 0 && (
            <Pressable
              style={[styles.practiceButton, styles.writingPracticeButton]}
              onPress={() => router.push(`/vocabulary/writing-practice?themeId=${theme.id}`)}
            >
              <Ionicons name="pencil" size={20} color={color.text} />
              <Text style={styles.practiceButtonText}>{t('vocabulary.writingPractice')}</Text>
              <View style={styles.exerciseCount}>
                <Text style={styles.exerciseCountText}>
                  {writingExercises.length}
                </Text>
              </View>
            </Pressable>
          )}
        </View>
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
    backgroundColor: color.bg,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: color.danger,
    fontSize: 18,
    marginBottom: 16,
  },
  backLink: {
    padding: 12,
  },
  backLinkText: {
    color: color.progress,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: radius.xl,
    backgroundColor: color.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: color.text,
  },
  titleArabic: {
    fontFamily: font.arabic,
    lineHeight: 27,
    fontSize: 16,
    color: color.progress,
    marginTop: 4,
  },
  // Introduction Card
  introCard: {
    backgroundColor: color.surface,
    marginHorizontal: 20,
    borderRadius: radius.lg,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
  },
  introCardContent: {
    flexDirection: 'row',
  },
  introIconContainer: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    backgroundColor: color.bg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  themeIcon: {
    fontSize: 28,
  },
  introTextContainer: {
    flex: 1,
  },
  introTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: color.textMuted,
    marginBottom: 4,
  },
  introDesc: {
    fontSize: 14,
    color: color.text,
    lineHeight: 20,
    marginBottom: 8,
  },
  introMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  introBadge: {
    backgroundColor: withAlpha(color.progress, 0.13),
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  introBadgeText: {
    fontSize: 11,
    color: color.progress,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  introWordCount: {
    fontSize: 12,
    color: color.textFaint,
  },
  // Progress Card
  progressCard: {
    backgroundColor: color.surface,
    marginHorizontal: 20,
    borderRadius: radius.lg,
    padding: 16,
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: color.text,
  },
  progressStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  progressStat: {
    alignItems: 'center',
  },
  progressStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: color.text,
  },
  progressStatLabel: {
    fontSize: 11,
    color: color.textFaint,
    marginTop: 2,
  },
  progressDivider: {
    width: 1,
    height: 32,
    backgroundColor: color.surfaceRaised,
  },
  progressBar: {
    height: 6,
    backgroundColor: color.surfaceRaised,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  // Filter Section
  filterSection: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  filterTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: color.textFaint,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  filterScroll: {
    flexDirection: 'row',
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.xl,
    backgroundColor: color.surface,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterChipActive: {
    backgroundColor: withAlpha(color.progress, 0.19),
    borderColor: color.progress,
  },
  filterChipText: {
    fontSize: 13,
    color: color.textMuted,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: color.progress,
  },
  // Tip Card
  tipCard: {
    backgroundColor: color.surface,
    marginHorizontal: 20,
    borderRadius: radius.md,
    marginBottom: 20,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  tipCardBorder: {
    width: 4,
    backgroundColor: color.warning,
  },
  tipCardContent: {
    flex: 1,
    padding: 14,
  },
  tipCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  tipCardTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: color.warning,
  },
  tipCardText: {
    fontSize: 13,
    color: color.textMuted,
    lineHeight: 19,
  },
  // Section
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    color: color.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  sectionSubtitle: {
    color: color.textFaint,
    fontSize: 13,
    marginBottom: 12,
  },
  // Examples Grid
  examplesGrid: {
    gap: 10,
  },
  exampleCard: {
    backgroundColor: color.surface,
    borderRadius: radius.md,
    padding: 14,
    position: 'relative',
  },
  exampleCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingRight: 44,
  },
  exampleCardWord: {
    fontSize: 20,
    color: color.progress,
    fontWeight: '600',
  },
  exampleCardMeaning: {
    fontSize: 12,
    color: color.textFaint,
  },
  exampleCardDivider: {
    height: 1,
    backgroundColor: color.surfaceRaised,
    marginBottom: 10,
  },
  exampleCardArabic: {
    fontFamily: font.arabic,
    fontSize: 24,
    color: color.text,
    marginBottom: 4,
    lineHeight: 42,
  },
  exampleCardTranslit: {
    fontSize: 12,
    color: color.progress,
    marginBottom: 4,
  },
  exampleCardEnglish: {
    fontSize: 13,
    color: color.textMuted,
  },
  exampleCardAudioIcon: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 28,
    height: 28,
    borderRadius: radius.md,
    backgroundColor: withAlpha(color.progress, 0.13),
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Word Card
  wordCard: {
    backgroundColor: color.surface,
    borderRadius: radius.md,
    marginBottom: 10,
    overflow: 'hidden',
  },
  wordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 16,
  },
  wordMain: {
    flex: 1,
    maxWidth: '50%',
  },
  wordArabicContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  wordArabic: {
    fontFamily: font.arabic,
    fontSize: 30,
    lineHeight: 50,
    color: color.text,
    fontWeight: '500',
  },
  wordAudioBtn: {
    width: 28,
    height: 28,
    borderRadius: radius.md,
    backgroundColor: withAlpha(color.progress, 0.13),
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordTranslit: {
    fontSize: 12,
    color: color.progress,
  },
  wordRight: {
    alignItems: 'flex-start',
    marginLeft: 'auto',
    maxWidth: '40%',
  },
  wordEnglish: {
    fontSize: 14,
    color: color.text,
    fontWeight: '500',
    textAlign: 'left',
    marginBottom: 4,
  },
  wordBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  posBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  posBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  genderBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  genderBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  // Word Expanded
  wordExpanded: {
    backgroundColor: color.bg,
    padding: 14,
    borderTopWidth: 1,
    borderTopColor: color.border,
  },
  wordDetailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 14,
  },
  wordDetail: {
    minWidth: '45%',
  },
  wordDetailLabel: {
    fontSize: 11,
    color: color.textFaint,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  wordDetailValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  wordDetailArabic: {
    fontFamily: font.arabic,
    lineHeight: 27,
    fontSize: 16,
    color: color.text,
  },
  wordDetailText: {
    fontSize: 13,
    color: color.textMuted,
  },
  // Example Section in Word
  exampleSection: {
    backgroundColor: color.surface,
    borderRadius: radius.sm,
    padding: 12,
    marginBottom: 14,
  },
  exampleSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  exampleLabel: {
    flex: 1,
    fontSize: 12,
    color: color.progress,
    fontWeight: '600',
  },
  exampleArabic: {
    fontFamily: font.arabic,
    lineHeight: 31,
    fontSize: 18,
    color: color.text,
    marginBottom: 4,
  },
  exampleTranslit: {
    fontSize: 12,
    color: color.progress,
    marginBottom: 4,
  },
  exampleEnglish: {
    fontSize: 13,
    color: color.textMuted,
  },
  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radius.sm,
    gap: 6,
    borderWidth: 1,
    borderColor: withAlpha(color.accent, 0.31),
    backgroundColor: withAlpha(color.accent, 0.08),
  },
  shareButtonText: {
    color: color.accent,
    fontWeight: '600',
    fontSize: 14,
  },
  learnButton: {
    backgroundColor: color.progress,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radius.sm,
    gap: 6,
  },
  learnButtonText: {
    color: color.text,
    fontWeight: '600',
    fontSize: 14,
  },
  masterButton: {
    backgroundColor: color.sacred,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radius.sm,
    gap: 6,
  },
  masterButtonText: {
    color: color.textOnAccent,
    fontWeight: '600',
    fontSize: 14,
  },
  masteredLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  masteredText: {
    color: color.progress,
    fontWeight: '600',
    fontSize: 14,
  },
  // Practice Buttons
  practiceButton: {
    borderRadius: radius.lg,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    gap: 10,
  },
  writingPracticeButton: {
    backgroundColor: color.sacred,
  },
  practiceButtonText: {
    color: color.text,
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  exerciseCount: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.md,
  },
  exerciseCountText: {
    color: color.text,
    fontSize: 12,
    fontWeight: 'bold',
  },
});

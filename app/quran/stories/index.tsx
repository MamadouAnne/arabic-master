import { useState, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useLocalizedContent } from '../../../src/hooks/useLocalizedContent';
import { PROPHETS, TOTAL_PROPHETS } from '../../../src/data/arabic/prophets';
import { QURAN_STORIES, TOTAL_QURAN_STORIES } from '../../../src/data/arabic/quranStories';
import { ProphetCard } from '../../../src/components/prophetStories';
import { QuranStoryCard } from '../../../src/components/quranStories';
import { useProphetStoriesStore } from '../../../src/stores/prophetStoriesStore';
import { useQuranStoriesStore } from '../../../src/stores/quranStoriesStore';
import { ProphetListItem } from '../../../src/types/prophetStories';
import { QuranStoryListItem } from '../../../src/types/quranStories';
import { font, color, radius } from '../../../src/theme/tokens';
import { withAlpha } from '../../../src/components/ui/Primitives';

type TabType = 'prophets' | 'other';

export default function StoriesScreen() {
  const { t } = useTranslation();
  const { lc } = useLocalizedContent();
  const [activeTab, setActiveTab] = useState<TabType>('prophets');
  const [searchQuery, setSearchQuery] = useState('');

  const { getStoryProgress, isStoryCompleted, getTotalStoriesCompleted } = useProphetStoriesStore();
  const {
    getStoryProgress: getQuranStoryProgress,
    isStoryCompleted: isQuranStoryCompleted,
    getTotalStoriesCompleted: getTotalQuranStoriesCompleted
  } = useQuranStoriesStore();

  // Filter prophets based on search query
  const filteredProphets = useMemo(() => {
    if (!searchQuery.trim()) return PROPHETS;

    const query = searchQuery.toLowerCase();
    return PROPHETS.filter(
      (prophet) =>
        prophet.nameEnglish.toLowerCase().includes(query) ||
        prophet.nameArabic.includes(searchQuery) ||
        (prophet.title && prophet.title.toLowerCase().includes(query))
    );
  }, [searchQuery]);

  // Filter other Quran stories based on search query
  const filteredQuranStories = useMemo(() => {
    if (!searchQuery.trim()) return QURAN_STORIES;

    const query = searchQuery.toLowerCase();
    return QURAN_STORIES.filter(
      (story) =>
        story.titleEnglish.toLowerCase().includes(query) ||
        story.titleArabic.includes(searchQuery) ||
        (story.description && story.description.toLowerCase().includes(query))
    );
  }, [searchQuery]);

  // Transform prophets to list items with progress
  const prophetListItems: ProphetListItem[] = useMemo(() => {
    return filteredProphets.map((prophet) => {
      const progress = getStoryProgress(prophet.id);
      const subStoryCount = prophet.subStories?.length || 1;
      const completionPercent = isStoryCompleted(prophet.id)
        ? 100
        : Math.round((progress.subStoriesCompleted.length / subStoryCount) * 100);

      return {
        id: prophet.id,
        nameEnglish: lc(prophet.nameEnglish, prophet.nameFrench),
        nameArabic: prophet.nameArabic,
        order: prophet.order,
        title: lc(prophet.title, prophet.titleFr),
        summary: lc(prophet.summary, prophet.summaryFr),
        isCompleted: isStoryCompleted(prophet.id),
        progress: completionPercent,
        estimatedReadTime: prophet.estimatedReadTime,
      };
    });
  }, [filteredProphets, getStoryProgress, isStoryCompleted, lc]);

  // Transform Quran stories to list items with progress
  const quranStoryListItems: QuranStoryListItem[] = useMemo(() => {
    return filteredQuranStories.map((story) => {
      const progress = getQuranStoryProgress(story.id);
      const isCompleted = isQuranStoryCompleted(story.id);

      return {
        id: story.id,
        titleEnglish: lc(story.titleEnglish, story.titleFrench),
        titleArabic: story.titleArabic,
        order: story.order,
        category: story.category,
        description: lc(story.description, story.descriptionFr),
        isCompleted,
        progress: isCompleted ? 100 : progress.percentComplete,
        estimatedReadTime: story.estimatedReadTime,
        icon: story.icon,
      };
    });
  }, [filteredQuranStories, getQuranStoryProgress, isQuranStoryCompleted, lc]);

  const prophetStoriesCompleted = getTotalStoriesCompleted();
  const quranStoriesCompleted = getTotalQuranStoriesCompleted();

  const currentTotal = activeTab === 'prophets' ? TOTAL_PROPHETS : TOTAL_QURAN_STORIES;
  const currentCompleted = activeTab === 'prophets' ? prophetStoriesCompleted : quranStoriesCompleted;
  const overallProgress = Math.round((currentCompleted / currentTotal) * 100);

  const handleProphetPress = (prophetId: string) => {
    router.push(`/quran/prophets/${prophetId}` as any);
  };

  const handleQuranStoryPress = (storyId: string) => {
    router.push(`/quran/stories/${storyId}` as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={color.text} />
        </Pressable>
        <View style={styles.headerTitle}>
          <Text style={styles.title}>{t('storiesFeature.title')}</Text>
          <Text style={styles.titleArabic}>قصص القرآن</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <Pressable
          style={[styles.tab, activeTab === 'prophets' && styles.activeTab]}
          onPress={() => { setActiveTab('prophets'); setSearchQuery(''); }}
        >
          <Ionicons
            name="person"
            size={18}
            color={activeTab === 'prophets' ? color.accent : color.textMuted}
          />
          <Text style={[styles.tabText, activeTab === 'prophets' && styles.activeTabText]}>
            {t('storiesFeature.prophets')}
          </Text>
          <View style={[styles.tabBadge, activeTab === 'prophets' && styles.activeTabBadge]}>
            <Text style={[styles.tabBadgeText, activeTab === 'prophets' && styles.activeTabBadgeText]}>
              {prophetStoriesCompleted}/{TOTAL_PROPHETS}
            </Text>
          </View>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === 'other' && styles.activeTab]}
          onPress={() => { setActiveTab('other'); setSearchQuery(''); }}
        >
          <Ionicons
            name="book"
            size={18}
            color={activeTab === 'other' ? color.accent : color.textMuted}
          />
          <Text style={[styles.tabText, activeTab === 'other' && styles.activeTabText]}>
            {t('storiesFeature.otherStories')}
          </Text>
          <View style={[styles.tabBadge, activeTab === 'other' && styles.activeTabBadge]}>
            <Text style={[styles.tabBadgeText, activeTab === 'other' && styles.activeTabBadgeText]}>
              {quranStoriesCompleted}/{TOTAL_QURAN_STORIES}
            </Text>
          </View>
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Progress Card */}
        <View style={styles.progressCard}>
          <View style={styles.progressInfo}>
            <View style={styles.progressCircle}>
              <Text style={styles.progressNumber}>{currentCompleted}</Text>
              <Text style={styles.progressTotal}>/{currentTotal}</Text>
            </View>
            <View style={styles.progressDetails}>
              <Text style={styles.progressTitle}>
                {activeTab === 'prophets' ? t('storiesFeature.prophetStories') : t('storiesFeature.quranStories')} {t('common.completed')}
              </Text>
              <Text style={styles.progressSubtitle}>
                {activeTab === 'prophets'
                  ? t('storiesFeature.learnAboutProphets')
                  : t('storiesFeature.discoverStories')}
              </Text>
            </View>
          </View>
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${overallProgress}%` }]} />
            </View>
            <Text style={styles.progressPercent}>{overallProgress}%</Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={18} color={color.textFaint} />
            <TextInput
              style={styles.searchInput}
              placeholder={activeTab === 'prophets' ? t('storiesFeature.searchProphets') : t('storiesFeature.searchStories')}
              placeholderTextColor={color.textFaint}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color={color.textFaint} />
              </Pressable>
            )}
          </View>
        </View>

        {/* Content */}
        <View style={styles.listContainer}>
          {activeTab === 'prophets' ? (
            prophetListItems.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="search-outline" size={48} color={color.textFaint} />
                <Text style={styles.emptyStateText}>{t('storiesFeature.noProphetsFound')}</Text>
                <Text style={styles.emptyStateSubtext}>{t('storiesFeature.tryDifferentSearch')}</Text>
              </View>
            ) : (
              prophetListItems.map((prophet) => (
                <ProphetCard
                  key={prophet.id}
                  prophet={prophet}
                  onPress={() => handleProphetPress(prophet.id)}
                />
              ))
            )
          ) : (
            quranStoryListItems.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="search-outline" size={48} color={color.textFaint} />
                <Text style={styles.emptyStateText}>{t('storiesFeature.noStoriesFound')}</Text>
                <Text style={styles.emptyStateSubtext}>{t('storiesFeature.tryDifferentSearch')}</Text>
              </View>
            ) : (
              quranStoryListItems.map((story) => (
                <QuranStoryCard
                  key={story.id}
                  story={story}
                  onPress={() => handleQuranStoryPress(story.id)}
                />
              ))
            )
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.bg,
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
  headerTitle: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: color.text,
  },
  titleArabic: {
    fontFamily: font.arabic,
    lineHeight: 34,
    fontSize: 20,
    color: color.accent,
    marginTop: 2,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: color.surface,
    borderRadius: radius.md,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: radius.sm,
    gap: 6,
  },
  activeTab: {
    backgroundColor: withAlpha(color.accent, 0.13),
  },
  tabText: {
    color: color.textFaint,
    fontSize: 13,
    fontWeight: '600',
  },
  activeTabText: {
    color: color.accent,
  },
  tabBadge: {
    backgroundColor: color.surfaceRaised,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  activeTabBadge: {
    backgroundColor: withAlpha(color.accent, 0.19),
  },
  tabBadgeText: {
    color: color.textFaint,
    fontSize: 10,
    fontWeight: '600',
  },
  activeTabBadgeText: {
    color: color.accent,
  },
  progressCard: {
    backgroundColor: color.surface,
    marginHorizontal: 20,
    borderRadius: radius.lg,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: withAlpha(color.accent, 0.19),
  },
  progressInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: withAlpha(color.accent, 0.13),
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  progressNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: color.accent,
  },
  progressTotal: {
    fontSize: 14,
    color: color.textFaint,
  },
  progressDetails: {
    flex: 1,
    marginLeft: 16,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: color.text,
  },
  progressSubtitle: {
    fontSize: 13,
    color: color.textMuted,
    marginTop: 4,
    lineHeight: 18,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: color.surfaceRaised,
    borderRadius: 3,
  },
  progressFill: {
    height: '100%',
    backgroundColor: color.accent,
    borderRadius: 3,
  },
  progressPercent: {
    color: color.accent,
    fontSize: 13,
    fontWeight: '600',
    minWidth: 40,
    textAlign: 'right',
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchBar: {
    backgroundColor: color.surface,
    borderRadius: radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    color: color.text,
    fontSize: 15,
  },
  listContainer: {
    paddingHorizontal: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyStateText: {
    color: color.textMuted,
    fontSize: 16,
    fontWeight: '500',
    marginTop: 12,
  },
  emptyStateSubtext: {
    color: color.textFaint,
    fontSize: 13,
    marginTop: 4,
  },
});

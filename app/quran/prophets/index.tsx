import { useState, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useLocalizedContent } from '../../../src/hooks/useLocalizedContent';
import { PROPHETS } from '../../../src/data/arabic/prophets';
import { ProphetCard } from '../../../src/components/prophetStories';
import { useProphetStoriesStore } from '../../../src/stores/prophetStoriesStore';
import { ProphetListItem } from '../../../src/types/prophetStories';
import { font, color, radius } from '../../../src/theme/tokens';
import { withAlpha } from '../../../src/components/ui/Primitives';

export default function ProphetListScreen() {
  const { t } = useTranslation();
  const { lc } = useLocalizedContent();
  const [searchQuery, setSearchQuery] = useState('');
  const { getStoryProgress, isStoryCompleted, getTotalStoriesCompleted } = useProphetStoriesStore();

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

  const totalCompleted = getTotalStoriesCompleted();
  const overallProgress = Math.round((totalCompleted / PROPHETS.length) * 100);

  const handleProphetPress = (prophetId: string) => {
    router.push(`/quran/prophets/${prophetId}` as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={color.text} />
        </Pressable>
        <View style={styles.headerTitle}>
          <Text style={styles.title}>{t('prophetsFeature.title')}</Text>
          <Text style={styles.titleArabic}>قصص الأنبياء</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Progress Card */}
        <View style={styles.progressCard}>
          <View style={styles.progressInfo}>
            <View style={styles.progressCircle}>
              <Text style={styles.progressNumber}>{totalCompleted}</Text>
              <Text style={styles.progressTotal}>/{PROPHETS.length}</Text>
            </View>
            <View style={styles.progressDetails}>
              <Text style={styles.progressTitle}>{t('prophetsFeature.storiesCompleted')}</Text>
              <Text style={styles.progressSubtitle}>
                {t('prophetsFeature.learnAboutProphets')}
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
              placeholder={t('prophetsFeature.searchProphets')}
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

        {/* Prophet List */}
        <View style={styles.listContainer}>
          {prophetListItems.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={48} color={color.textFaint} />
              <Text style={styles.emptyStateText}>{t('prophetsFeature.noProphetsFound')}</Text>
              <Text style={styles.emptyStateSubtext}>{t('prophetsFeature.tryDifferentSearch')}</Text>
            </View>
          ) : (
            prophetListItems.map((prophet) => (
              <ProphetCard
                key={prophet.id}
                prophet={prophet}
                onPress={() => handleProphetPress(prophet.id)}
              />
            ))
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
    lineHeight: 27,
    fontSize: 16,
    color: color.accent,
    marginTop: 2,
  },
  progressCard: {
    backgroundColor: color.surface,
    marginHorizontal: 20,
    borderRadius: radius.lg,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: withAlpha(color.accentStrong, 0.19),
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
    backgroundColor: withAlpha(color.accentStrong, 0.13),
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
    backgroundColor: color.accentStrong,
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

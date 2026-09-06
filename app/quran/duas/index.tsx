import { useState, useMemo, useCallback } from 'react';
import { View, Text, ScrollView, FlatList, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useLocalizedContent } from '../../../src/hooks/useLocalizedContent';
import { getAllDuas, getAvailableCategories } from '../../../src/data/arabic/duas';
import { DuaCard } from '../../../src/components/duas';
import { useDuasStore } from '../../../src/stores/duasStore';
import { DuaCategory, DUA_CATEGORY_LABELS, DuaListItem } from '../../../src/types/duas';
import { font, color, radius } from '../../../src/theme/tokens';
import { withAlpha } from '../../../src/components/ui/Primitives';

type FilterCategory = 'all' | DuaCategory;

export default function DuasListScreen() {
  const { t } = useTranslation();
  const { lc } = useLocalizedContent();
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>('all');

  const {
    isFavorite,
    isMemorized,
    getMemorizedCount,
  } = useDuasStore();

  const duas = getAllDuas();
  const categories = getAvailableCategories();
  const memorizedCount = getMemorizedCount();

  // Filter duas by category
  const filteredDuas = useMemo(() => {
    if (selectedCategory === 'all') {
      return duas;
    }
    return duas.filter((dua) => dua.category === selectedCategory);
  }, [duas, selectedCategory]);

  // Convert to list items with favorite/memorized status
  const duaListItems: DuaListItem[] = useMemo(() => {
    return filteredDuas.map((dua) => ({
      ...dua,
      isFavorite: isFavorite(dua.id),
      isMemorized: isMemorized(dua.id),
    }));
  }, [filteredDuas, isFavorite, isMemorized]);

  const handleDuaPress = useCallback((duaId: string) => {
    router.push(`/quran/duas/${duaId}` as any);
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={color.text} />
        </Pressable>
        <View style={styles.headerTitle}>
          <Text style={styles.title}>{t('duasFeature.title')}</Text>
          <Text style={styles.titleArabic}>الأدعية النبوية</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      {/* Progress Card */}
      <View style={styles.progressCard}>
        <View style={styles.progressIconContainer}>
          <Ionicons name="checkmark-done-circle" size={28} color={color.progress} />
        </View>
        <View style={styles.progressContent}>
          <Text style={styles.progressTitle}>{t('duasFeature.memorized')}</Text>
          <Text style={styles.progressSubtitle}>
            {memorizedCount} {t('duasFeature.ofDuas', { total: duas.length })}
          </Text>
        </View>
        <View style={styles.progressPercent}>
          <Text style={styles.progressPercentText}>
            {Math.round((memorizedCount / duas.length) * 100)}%
          </Text>
        </View>
      </View>

      {/* Category Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        <Pressable
          style={[
            styles.filterChip,
            selectedCategory === 'all' && styles.filterChipActive,
          ]}
          onPress={() => setSelectedCategory('all')}
        >
          <Text
            style={[
              styles.filterChipText,
              selectedCategory === 'all' && styles.filterChipTextActive,
            ]}
          >
            {t('common.all')}
          </Text>
        </Pressable>
        {categories.map((category) => (
          <Pressable
            key={category}
            style={[
              styles.filterChip,
              selectedCategory === category && styles.filterChipActive,
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text
              style={[
                styles.filterChipText,
                selectedCategory === category && styles.filterChipTextActive,
              ]}
            >
              {lc(DUA_CATEGORY_LABELS[category].english, DUA_CATEGORY_LABELS[category].french)}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Duas List */}
      <FlatList
        data={duaListItems}
        keyExtractor={(item) => item.id}
        style={styles.listContainer}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        initialNumToRender={10}
        maxToRenderPerBatch={8}
        windowSize={5}
        renderItem={({ item: dua }) => (
          <DuaCard
            dua={dua}
            onPress={() => handleDuaPress(dua.id)}
          />
        )}
        ListFooterComponent={<View style={{ height: 40 }} />}
      />
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
    borderBottomWidth: 1,
    borderBottomColor: color.border,
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
    color: color.warning,
    marginTop: 2,
  },
  headerSpacer: {
    width: 40,
  },
  progressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: color.surface,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: radius.md,
    padding: 16,
    borderWidth: 1,
    borderColor: withAlpha(color.progress, 0.19),
  },
  progressIconContainer: {
    width: 48,
    height: 48,
    borderRadius: radius.xl,
    backgroundColor: withAlpha(color.progress, 0.13),
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressContent: {
    flex: 1,
    marginLeft: 12,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: color.text,
  },
  progressSubtitle: {
    fontSize: 13,
    color: color.textMuted,
    marginTop: 2,
  },
  progressPercent: {
    backgroundColor: withAlpha(color.progress, 0.13),
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.sm,
  },
  progressPercentText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: color.progress,
  },
  filterContainer: {
    maxHeight: 50,
    marginTop: 16,
  },
  filterContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radius.xl,
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.border,
  },
  filterChipActive: {
    backgroundColor: withAlpha(color.warning, 0.13),
    borderColor: color.warning,
  },
  filterChipText: {
    fontSize: 13,
    color: color.textMuted,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: color.warning,
  },
  listContainer: {
    flex: 1,
    marginTop: 16,
  },
  listContent: {
    paddingHorizontal: 16,
  },
});

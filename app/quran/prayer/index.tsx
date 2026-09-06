import { useState, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useLocalizedContent } from '../../../src/hooks/useLocalizedContent';
import { getAllPrayerLessons } from '../../../src/data/arabic/prayer';
import { usePrayerStore } from '../../../src/stores/prayerStore';
import { PrayerCategory, PrayerLesson } from '../../../src/types/prayer';
import { font, color, radius } from '../../../src/theme/tokens';
import { withAlpha } from '../../../src/components/ui/Primitives';

type TabFilter = 'prayer_guide' | 'sujud_sahw';

export default function PrayerIndexScreen() {
  const { t } = useTranslation();
  const { lc } = useLocalizedContent();
  const { tab } = useLocalSearchParams<{ tab?: string }>();
  const [activeTab, setActiveTab] = useState<TabFilter>(
    tab === 'sujud-sahw' ? 'sujud_sahw' : 'prayer_guide'
  );

  const { isCompleted, getCompletedCount } = usePrayerStore();
  const lessons = getAllPrayerLessons();
  const completedCount = getCompletedCount();

  const filteredLessons = useMemo(() => {
    return lessons.filter((lesson) => lesson.category === activeTab);
  }, [lessons, activeTab]);

  const handleLessonPress = (lessonId: string) => {
    router.push(`/quran/prayer/${lessonId}` as any);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={color.text} />
        </Pressable>
        <View style={styles.headerTitle}>
          <Text style={styles.title}>{t('prayerFeature.title')}</Text>
          <Text style={styles.titleArabic}>تعلم الصلاة</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      {/* Progress Card */}
      <View style={styles.progressCard}>
        <View style={styles.progressIconContainer}>
          <Ionicons name="checkmark-done-circle" size={28} color={color.progress} />
        </View>
        <View style={styles.progressContent}>
          <Text style={styles.progressTitle}>{t('prayerFeature.progress')}</Text>
          <Text style={styles.progressSubtitle}>
            {completedCount} {t('prayerFeature.ofLessons', { total: lessons.length })}
          </Text>
        </View>
        <View style={styles.progressPercent}>
          <Text style={styles.progressPercentText}>
            {Math.round((completedCount / lessons.length) * 100)}%
          </Text>
        </View>
      </View>

      {/* Tab Filter */}
      <View style={styles.tabContainer}>
        <Pressable
          style={[styles.tab, activeTab === 'prayer_guide' && styles.tabActiveGreen]}
          onPress={() => setActiveTab('prayer_guide')}
        >
          <Ionicons
            name="body"
            size={16}
            color={activeTab === 'prayer_guide' ? '#10b981' : '#64748b'}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'prayer_guide' && styles.tabTextActiveGreen,
            ]}
          >
            {t('prayerFeature.prayerGuide')}
          </Text>
          <View style={[styles.tabBadge, activeTab === 'prayer_guide' && styles.tabBadgeActiveGreen]}>
            <Text style={[styles.tabBadgeText, activeTab === 'prayer_guide' && styles.tabBadgeTextActiveGreen]}>5</Text>
          </View>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === 'sujud_sahw' && styles.tabActiveGold]}
          onPress={() => setActiveTab('sujud_sahw')}
        >
          <Ionicons
            name="alert-circle"
            size={16}
            color={activeTab === 'sujud_sahw' ? color.sacred : '#64748b'}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'sujud_sahw' && styles.tabTextActiveGold,
            ]}
          >
            {t('prayerFeature.correctingMistakes')}
          </Text>
          <View style={[styles.tabBadge, activeTab === 'sujud_sahw' && styles.tabBadgeActiveGold]}>
            <Text style={[styles.tabBadgeText, activeTab === 'sujud_sahw' && styles.tabBadgeTextActiveGold]}>2</Text>
          </View>
        </Pressable>
      </View>

      {/* Lesson List */}
      <ScrollView
        style={styles.listContainer}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredLessons.map((lesson) => {
          const completed = isCompleted(lesson.id);
          return (
            <Pressable
              key={lesson.id}
              style={styles.lessonCard}
              onPress={() => handleLessonPress(lesson.id)}
            >
              <View style={[styles.lessonOrder, { backgroundColor: lesson.color + '20' }]}>
                {completed ? (
                  <Ionicons name="checkmark-circle" size={24} color={color.progress} />
                ) : (
                  <Text style={[styles.lessonOrderText, { color: lesson.color }]}>
                    {lesson.order}
                  </Text>
                )}
              </View>
              <View style={styles.lessonContent}>
                <View style={styles.lessonNameRow}>
                  <Text style={styles.lessonTitle}>{lc(lesson.title, lesson.titleFr)}</Text>
                  <Text style={styles.lessonTitleArabic}>{lesson.titleArabic}</Text>
                </View>
                <Text style={styles.lessonDescription} numberOfLines={2}>
                  {lc(lesson.description, lesson.descriptionFr)}
                </Text>
                <View style={styles.lessonMeta}>
                  <View style={styles.lessonMetaItem}>
                    <Ionicons name="time-outline" size={12} color={color.textFaint} />
                    <Text style={styles.lessonMetaText}>{lesson.estimatedMinutes} {t('prayerFeature.min')}</Text>
                  </View>
                  <View style={styles.lessonMetaItem}>
                    <Ionicons name={lesson.icon as any} size={12} color={color.textFaint} />
                    <Text style={styles.lessonMetaText}>
                      {lesson.content.length} {t('prayerFeature.sections')}
                    </Text>
                  </View>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={color.textFaint} />
            </Pressable>
          );
        })}
        <View style={{ height: 40 }} />
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
    color: color.progress,
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
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 16,
    gap: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: radius.md,
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.border,
    gap: 6,
  },
  tabActiveGreen: {
    backgroundColor: withAlpha(color.progress, 0.08),
    borderColor: color.progress,
  },
  tabActiveGold: {
    backgroundColor: withAlpha(color.sacred, 0.08),
    borderColor: color.sacred,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: color.textFaint,
  },
  tabTextActiveGreen: {
    color: color.progress,
  },
  tabTextActiveGold: {
    color: color.sacred,
  },
  tabBadge: {
    backgroundColor: color.surfaceRaised,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: radius.sm,
  },
  tabBadgeActiveGreen: {
    backgroundColor: withAlpha(color.progress, 0.19),
  },
  tabBadgeActiveGold: {
    backgroundColor: withAlpha(color.sacred, 0.19),
  },
  tabBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: color.textFaint,
  },
  tabBadgeTextActiveGreen: {
    color: color.progress,
  },
  tabBadgeTextActiveGold: {
    color: color.sacred,
  },
  listContainer: {
    flex: 1,
    marginTop: 16,
  },
  listContent: {
    paddingHorizontal: 16,
  },
  lessonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: color.surface,
    borderRadius: radius.md,
    padding: 14,
    marginBottom: 10,
    gap: 12,
  },
  lessonOrder: {
    width: 44,
    height: 44,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lessonOrderText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  lessonContent: {
    flex: 1,
  },
  lessonNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  lessonTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: color.text,
  },
  lessonTitleArabic: {
    fontFamily: font.arabic,
    lineHeight: 30,
    fontSize: 18,
    color: color.sacred,
  },
  lessonDescription: {
    fontSize: 12,
    color: color.textMuted,
    marginTop: 4,
    lineHeight: 18,
  },
  lessonMeta: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 6,
  },
  lessonMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  lessonMetaText: {
    fontSize: 11,
    color: color.textFaint,
  },
});

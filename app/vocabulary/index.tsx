import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { vocabularyThemes } from '../../src/data/arabic/vocabulary';
import { useProgressStore } from '../../src/stores/progressStore';
import { useLocalizedContent } from '../../src/hooks/useLocalizedContent';
import { font, color, radius } from '../../src/theme/tokens';
import { withAlpha } from '../../src/components/ui/Primitives';

export default function VocabularyScreen() {
  const { t } = useTranslation();
  const { lc } = useLocalizedContent();
  const { progress, getVocabularyCompletionPercent, getVocabularyReviewStats } = useProgressStore();
  const startedThemes = progress.vocabularyProgress.themesStarted;
  const completedThemes = progress.vocabularyProgress.themesCompleted;
  const wordsLearned = progress.vocabularyProgress.wordsLearned.length;
  const reviewStats = getVocabularyReviewStats();

  const getThemeStatus = (themeId: string) => {
    if (completedThemes.includes(themeId)) return 'completed';
    if (startedThemes.includes(themeId)) return 'in_progress';
    return 'new';
  };

  const LEVELS: { key: 'beginner' | 'intermediate' | 'advanced'; label: string; ar: string; color: string }[] = [
    { key: 'beginner', label: t('common.beginner'), ar: 'الْمُبْتَدِئ', color: color.progress },
    { key: 'intermediate', label: t('common.intermediate'), ar: 'الْمُتَوَسِّط', color: color.accentStrong },
    { key: 'advanced', label: t('common.advanced'), ar: 'الْمُتَقَدِّم', color: color.sacred },
  ];

  const renderThemeCard = (theme: (typeof vocabularyThemes)[number]) => {
    const status = getThemeStatus(theme.id);
    return (
      <Pressable
        key={theme.id}
        style={styles.themeCard}
        onPress={() => router.push(`/vocabulary/${theme.id}` as any)}
      >
        <View style={[styles.themeIconBg, { backgroundColor: theme.color + '20' }]}>
          <Text style={styles.themeIcon}>{theme.icon}</Text>
        </View>
        <Text style={styles.themeName}>{lc(theme.name, theme.nameFr)}</Text>
        <Text style={styles.themeNameAr}>{theme.nameArabic}</Text>
        <View style={styles.themeFooter}>
          <Text style={styles.themeWordCount}>{t('vocabulary.wordsCount', { count: theme.wordCount })}</Text>
          {status === 'completed' && (
            <View style={styles.completedBadge}>
              <Ionicons name="checkmark-circle" size={14} color={color.progress} />
            </View>
          )}
          {status === 'in_progress' && (
            <View style={styles.progressBadge}>
              <Ionicons name="time" size={14} color={color.sacred} />
            </View>
          )}
        </View>
        <View style={[styles.themeColorBar, { backgroundColor: theme.color }]} />
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={color.text} />
          </Pressable>
          <View style={styles.headerText}>
            <Text style={styles.title}>{t('vocabulary.title')}</Text>
            <Text style={styles.titleArabic}>الْمُفْرَدَات</Text>
          </View>
        </View>

        {/* Progress Card */}
        <View style={styles.progressCard}>
          <View style={styles.progressStats}>
            <View style={styles.progressStat}>
              <Text style={styles.progressStatValue}>{wordsLearned}</Text>
              <Text style={styles.progressStatLabel}>{t('vocabulary.wordsLearned')}</Text>
            </View>
            <View style={styles.progressDivider} />
            <View style={styles.progressStat}>
              <Text style={styles.progressStatValue}>
                {completedThemes.length}/{vocabularyThemes.length}
              </Text>
              <Text style={styles.progressStatLabel}>{t('vocabulary.themesComplete')}</Text>
            </View>
            <View style={styles.progressDivider} />
            <View style={styles.progressStat}>
              <Text style={styles.progressStatValue}>
                {getVocabularyCompletionPercent()}%
              </Text>
              <Text style={styles.progressStatLabel}>{t('vocabulary.overall')}</Text>
            </View>
          </View>
        </View>

        {/* Theme Grid — grouped by level */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('vocabulary.vocabularyThemes')}</Text>
          <Text style={styles.sectionSubtitle}>
            {t('vocabulary.themesSubtitle')}
          </Text>

          {LEVELS.map((lvl) => {
            const group = vocabularyThemes.filter((th) => th.level === lvl.key);
            if (group.length === 0) return null;
            return (
              <View key={lvl.key} style={styles.levelGroup}>
                <View style={styles.levelGroupHeader}>
                  <View style={styles.levelGroupLeft}>
                    <View style={[styles.levelGroupDot, { backgroundColor: lvl.color }]} />
                    <Text style={styles.levelGroupTitle}>{lvl.label}</Text>
                    <View style={styles.levelGroupCount}>
                      <Text style={styles.levelGroupCountText}>{group.length}</Text>
                    </View>
                  </View>
                  <Text style={styles.levelGroupAr}>{lvl.ar}</Text>
                </View>
                <View style={styles.themeGrid}>
                  {group.map(renderThemeCard)}
                </View>
              </View>
            );
          })}
        </View>

        {/* Spaced Review */}
        {reviewStats.dueToday > 0 && (
          <View style={styles.section}>
            <Pressable
              style={styles.reviewCard}
              onPress={() => router.push('/vocabulary/review' as any)}
            >
              <View style={styles.reviewContent}>
                <View style={styles.reviewIcon}>
                  <Ionicons name="timer" size={28} color={color.accentStrong} />
                </View>
                <View style={styles.reviewText}>
                  <Text style={styles.reviewTitle}>{t('vocabulary.spacedReview')}</Text>
                  <Text style={styles.reviewTitleArabic}>المراجعة المتكررة</Text>
                  <Text style={styles.reviewDesc}>
                    {t('vocabulary.wordsDueReview', { count: reviewStats.dueToday })}
                  </Text>
                </View>
                <View style={styles.reviewBadge}>
                  <Text style={styles.reviewBadgeText}>{reviewStats.dueToday}</Text>
                </View>
              </View>
              <View style={styles.reviewStats}>
                <View style={styles.reviewStatItem}>
                  <Text style={styles.reviewStatValue}>{reviewStats.learned}</Text>
                  <Text style={styles.reviewStatLabel}>{t('vocabulary.learning')}</Text>
                </View>
                <View style={styles.reviewStatItem}>
                  <Text style={[styles.reviewStatValue, { color: color.progress }]}>{reviewStats.mastered}</Text>
                  <Text style={styles.reviewStatLabel}>{t('common.mastered')}</Text>
                </View>
              </View>
            </Pressable>
          </View>
        )}

        {/* Quick Practice */}
        <View style={[styles.section, { marginBottom: 100 }]}>
          <Text style={styles.sectionTitle}>{t('vocabulary.practiceMode')}</Text>

          {/* SRS Review - always visible */}
          <Pressable
            style={[styles.practiceCard, { marginBottom: 12, borderColor: reviewStats.dueToday > 0 ? '#6366f1' : 'transparent', borderWidth: reviewStats.dueToday > 0 ? 1 : 0 }]}
            onPress={() => router.push('/vocabulary/review' as any)}
          >
            <View style={styles.practiceContent}>
              <View style={[styles.practiceIcon, { backgroundColor: withAlpha(color.accentStrong, 0.13) }]}>
                <Ionicons name="timer" size={28} color={color.accentStrong} />
              </View>
              <View style={styles.practiceText}>
                <Text style={styles.practiceTitle}>{t('vocabulary.spacedReview')}</Text>
                <Text style={styles.practiceDesc}>
                  {reviewStats.dueToday > 0
                    ? t('vocabulary.wordsDueToday', { count: reviewStats.dueToday })
                    : t('vocabulary.noDueWords')}
                </Text>
              </View>
              {reviewStats.dueToday > 0 && (
                <View style={styles.dueBadge}>
                  <Text style={styles.dueBadgeText}>{reviewStats.dueToday}</Text>
                </View>
              )}
              <Ionicons name="chevron-forward" size={24} color={color.textFaint} />
            </View>
          </Pressable>

          <Pressable
            style={[styles.practiceCard, { marginBottom: 12 }]}
            onPress={() => router.push('/vocabulary/flashcards' as any)}
          >
            <View style={styles.practiceContent}>
              <View style={styles.practiceIcon}>
                <Ionicons name="layers" size={28} color={color.sacred} />
              </View>
              <View style={styles.practiceText}>
                <Text style={styles.practiceTitle}>{t('vocabulary.flashcards')}</Text>
                <Text style={styles.practiceDesc}>
                  {t('vocabulary.flashcardsDesc')}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={color.textFaint} />
            </View>
          </Pressable>

          <Pressable
            style={styles.practiceCard}
            onPress={() => router.push('/vocabulary/speaking-practice' as any)}
          >
            <View style={styles.practiceContent}>
              <View style={[styles.practiceIcon, { backgroundColor: withAlpha(color.progress, 0.13) }]}>
                <Ionicons name="mic" size={28} color={color.progress} />
              </View>
              <View style={styles.practiceText}>
                <Text style={styles.practiceTitle}>{t('vocabulary.speakingPractice')}</Text>
                <Text style={styles.practiceDesc}>
                  {t('vocabulary.speakingPracticeDesc')}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={color.textFaint} />
            </View>
          </Pressable>
        </View>
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
    fontSize: 24,
    fontWeight: 'bold',
    color: color.text,
  },
  titleArabic: {
    fontFamily: font.arabic,
    lineHeight: 31,
    fontSize: 18,
    color: color.progress,
    marginTop: 4,
  },
  progressCard: {
    backgroundColor: color.surface,
    marginHorizontal: 20,
    borderRadius: radius.lg,
    padding: 20,
    marginBottom: 24,
  },
  progressStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressStat: {
    flex: 1,
    alignItems: 'center',
  },
  progressStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: color.text,
  },
  progressStatLabel: {
    fontSize: 11,
    color: color.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
  progressDivider: {
    width: 1,
    height: 40,
    backgroundColor: color.surfaceRaised,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    color: color.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionSubtitle: {
    color: color.textMuted,
    fontSize: 14,
    marginBottom: 16,
  },
  levelGroup: {
    marginBottom: 8,
  },
  levelGroupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 12,
  },
  levelGroupLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  levelGroupDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  levelGroupTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: color.text,
    textTransform: 'capitalize',
  },
  levelGroupCount: {
    minWidth: 22,
    height: 22,
    paddingHorizontal: 6,
    borderRadius: radius.md,
    backgroundColor: color.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelGroupCountText: {
    fontSize: 12,
    fontWeight: '700',
    color: color.textMuted,
  },
  levelGroupAr: {
    fontSize: 13,
    color: color.textFaint,
  },
  themeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  themeCard: {
    width: '48%',
    backgroundColor: color.surface,
    borderRadius: radius.lg,
    padding: 16,
    margin: '1%',
    position: 'relative',
    overflow: 'hidden',
  },
  themeIconBg: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  themeIcon: {
    fontSize: 24,
  },
  themeName: {
    fontSize: 14,
    fontWeight: '600',
    color: color.text,
    marginBottom: 4,
  },
  themeNameAr: {
    fontSize: 12,
    color: color.progress,
    marginBottom: 8,
  },
  themeFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  themeWordCount: {
    fontSize: 11,
    color: color.textFaint,
  },
  completedBadge: {
    width: 20,
    height: 20,
    borderRadius: radius.sm,
    backgroundColor: withAlpha(color.progress, 0.13),
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressBadge: {
    width: 20,
    height: 20,
    borderRadius: radius.sm,
    backgroundColor: withAlpha(color.sacred, 0.13),
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeColorBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  practiceCard: {
    backgroundColor: color.surface,
    borderRadius: radius.lg,
    padding: 16,
  },
  practiceContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  practiceIcon: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    backgroundColor: withAlpha(color.sacred, 0.13),
    alignItems: 'center',
    justifyContent: 'center',
  },
  practiceText: {
    flex: 1,
    marginLeft: 16,
  },
  practiceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: color.text,
  },
  practiceDesc: {
    fontSize: 13,
    color: color.textMuted,
    marginTop: 4,
  },
  // SRS Review styles
  reviewCard: {
    backgroundColor: color.surface,
    borderRadius: radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: withAlpha(color.accentStrong, 0.25),
  },
  reviewContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewIcon: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    backgroundColor: withAlpha(color.accentStrong, 0.13),
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewText: {
    flex: 1,
    marginLeft: 16,
  },
  reviewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: color.text,
  },
  reviewTitleArabic: {
    fontFamily: font.arabic,
    lineHeight: 22,
    fontSize: 13,
    color: color.accentStrong,
    marginTop: 2,
  },
  reviewDesc: {
    fontSize: 13,
    color: color.textMuted,
    marginTop: 4,
  },
  reviewBadge: {
    backgroundColor: color.accentStrong,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.md,
  },
  reviewBadgeText: {
    color: color.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  reviewStats: {
    flexDirection: 'row',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: color.border,
    gap: 24,
  },
  reviewStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  reviewStatValue: {
    color: color.warning,
    fontSize: 16,
    fontWeight: 'bold',
  },
  reviewStatLabel: {
    color: color.textFaint,
    fontSize: 12,
  },
  dueBadge: {
    backgroundColor: color.accentStrong,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.sm,
    marginRight: 8,
  },
  dueBadgeText: {
    color: color.text,
    fontSize: 14,
    fontWeight: 'bold',
  },
});

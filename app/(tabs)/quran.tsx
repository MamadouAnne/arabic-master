import { useMemo } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useQuranStore } from '../../src/stores/quranStore';
import { useProphetStoriesStore } from '../../src/stores/prophetStoriesStore';
import { useQuranStoriesStore } from '../../src/stores/quranStoriesStore';
import { useDuasStore } from '../../src/stores/duasStore';
import { usePrayerStore } from '../../src/stores/prayerStore';
import { TOTAL_PROPHETS } from '../../src/data/arabic/prophets';
import { TOTAL_QURAN_STORIES } from '../../src/data/arabic/quranStories';
import { TOTAL_DUAS } from '../../src/types/duas';
import { TOTAL_PRAYER_LESSONS } from '../../src/types/prayer';

export default function QuranScreen() {
  const { t } = useTranslation();
  const progress = useQuranStore((s) => s.progress);
  const {
    getOverallCompletionPercent,
    getTotalSurahsCompleted,
    getJuzCompleted,
    getHizbCompleted,
  } = useQuranStore();

  const { getTotalStoriesCompleted: getProphetStoriesCompleted } = useProphetStoriesStore();
  const { getTotalStoriesCompleted: getQuranStoriesCompleted } = useQuranStoriesStore();
  const { getMemorizedCount } = useDuasStore();
  const { getCompletedCount: getPrayerCompletedCount } = usePrayerStore();

  const overallProgress = useMemo(() => getOverallCompletionPercent(), [progress]);
  const surahsCompleted = useMemo(() => getTotalSurahsCompleted(), [progress]);
  const juzCompleted = useMemo(() => getJuzCompleted(), [progress]);
  const hizbCompleted = useMemo(() => getHizbCompleted(), [progress]);
  const duasMemorized = useMemo(() => getMemorizedCount(), [getMemorizedCount]);
  const prophetStoriesCompleted = useMemo(() => getProphetStoriesCompleted(), [getProphetStoriesCompleted]);
  const quranStoriesCompleted = useMemo(() => getQuranStoriesCompleted(), [getQuranStoriesCompleted]);
  const totalStoriesCompleted = prophetStoriesCompleted + quranStoriesCompleted;
  const totalStories = TOTAL_PROPHETS + TOTAL_QURAN_STORIES;
  const prayerCompleted = useMemo(() => getPrayerCompletedCount(), [getPrayerCompletedCount]);

  const handleLearnQuranPress = () => {
    router.push('/quran/all-surahs' as any);
  };

  const handleQuizPress = () => {
    router.push('/quran/quiz' as any);
  };

  const handleStoriesPress = () => {
    router.push('/quran/stories' as any);
  };

  const handleDuasPress = () => {
    router.push('/quran/duas' as any);
  };

  const handlePrayerPress = () => {
    router.push('/quran/prayer' as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{t('quran.title')}</Text>
          <Text style={styles.titleArabic}>القرآن الكريم</Text>
        </View>

        {/* Progress Overview */}
        <View style={styles.statsCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.statsTitle}>{t('quran.yourProgress')}</Text>
            <Text style={styles.progressPercent}>{overallProgress}%</Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBarFill, { width: `${overallProgress}%` }]} />
          </View>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#10b981' }]}>{surahsCompleted}</Text>
              <Text style={styles.statLabel}>{t('quran.surahs')}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#3b82f6' }]}>{juzCompleted}</Text>
              <Text style={styles.statLabel}>{t('quran.juz')}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#f59e0b' }]}>{hizbCompleted}</Text>
              <Text style={styles.statLabel}>{t('quran.hizb')}</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions - 2x2 Grid */}
        <View style={styles.quickActionsGrid}>
          <View style={styles.quickActionsRow}>
            <Pressable style={styles.actionCardGrid} onPress={handleLearnQuranPress} accessibilityRole="button" accessibilityLabel={t('quran.quranTitle')}>
              <View style={[styles.actionIcon, { backgroundColor: '#3b82f622' }]}>
                <Ionicons name="book" size={24} color="#3b82f6" />
              </View>
              <Text style={styles.actionTitle}>{t('quran.quranTitle')}</Text>
              <Text style={styles.actionDesc}>{t('quran.allSurahs')}</Text>
            </Pressable>
            <Pressable style={styles.actionCardGrid} onPress={handleStoriesPress} accessibilityRole="button" accessibilityLabel={t('quran.stories')}>
              <View style={[styles.actionIcon, { backgroundColor: '#8b5cf622' }]}>
                <Ionicons name="library" size={24} color="#8b5cf6" />
              </View>
              <View style={styles.actionBadge}>
                <Text style={styles.actionBadgeText}>{totalStoriesCompleted}/{totalStories}</Text>
              </View>
              <Text style={styles.actionTitle}>{t('quran.stories')}</Text>
              <Text style={styles.actionDesc}>{t('quran.prophetsAndMore')}</Text>
            </Pressable>
          </View>
          <View style={styles.quickActionsRow}>
            <Pressable style={styles.actionCardGrid} onPress={handleDuasPress} accessibilityRole="button" accessibilityLabel={t('quran.duas')}>
              <View style={[styles.actionIcon, { backgroundColor: '#f59e0b22' }]}>
                <Ionicons name="hand-left" size={24} color="#f59e0b" />
              </View>
              <View style={[styles.actionBadge, { backgroundColor: '#f59e0b30' }]}>
                <Text style={[styles.actionBadgeText, { color: '#fbbf24' }]}>{duasMemorized}/{TOTAL_DUAS}</Text>
              </View>
              <Text style={styles.actionTitle}>{t('quran.duas')}</Text>
              <Text style={styles.actionDesc}>{t('quran.propheticPrayers')}</Text>
            </Pressable>
            <Pressable style={styles.actionCardGrid} onPress={handleQuizPress} accessibilityRole="button" accessibilityLabel={t('quran.quizzes')}>
              <View style={[styles.actionIcon, { backgroundColor: '#06b6d422' }]}>
                <Ionicons name="help-circle" size={24} color="#06b6d4" />
              </View>
              <Text style={styles.actionTitle}>{t('quran.quizzes')}</Text>
              <Text style={styles.actionDesc}>{t('quran.testKnowledge')}</Text>
            </Pressable>
          </View>
        </View>

        {/* Islamic Practice Section */}
        <View style={styles.practiceSection}>
          <View style={styles.practiceSectionHeader}>
            <View style={styles.practiceSectionTitleRow}>
              <Ionicons name="moon" size={18} color="#10b981" />
              <Text style={styles.practiceSectionTitle}>{t('quran.islamicPractice')}</Text>
            </View>
            <Text style={styles.practiceSectionTitleArabic}>العبادات</Text>
          </View>
          <Pressable style={styles.practiceCardWide} onPress={handlePrayerPress} accessibilityRole="button" accessibilityLabel={t('quran.prayerPractice')}>
            <View style={styles.practiceCardAccent} />
            <View style={[styles.practiceCardIcon, { backgroundColor: '#10b98122' }]}>
              <Ionicons name="body" size={24} color="#10b981" />
            </View>
            <View style={styles.practiceCardContent}>
              <Text style={styles.practiceCardTitle}>{t('quran.prayerPractice')}</Text>
              <Text style={styles.practiceCardArabic}>تعلم الصلاة</Text>
              <Text style={styles.practiceCardDesc}>{t('quran.lessonsCount', { count: TOTAL_PRAYER_LESSONS })}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#64748b" />
          </Pressable>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#ffffff',
  },
  titleArabic: {
    fontSize: 22,
    color: '#10b981',
  },
  statsCard: {
    backgroundColor: '#1e293b',
    marginHorizontal: 20,
    borderRadius: 18,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#334155',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statsTitle: {
    color: '#94a3b8',
    fontSize: 14,
  },
  progressPercent: {
    color: '#10b981',
    fontSize: 18,
    fontWeight: 'bold',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#334155',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 20,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#64748b',
    fontSize: 10,
    marginTop: 4,
    textAlign: 'center',
  },
  quickActionsGrid: {
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 12,
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionCardGrid: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderRadius: 18,
    padding: 16,
    alignItems: 'flex-start',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#334155',
    minHeight: 116,
  },
  actionIcon: {
    width: 46,
    height: 46,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  actionBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#8b5cf630',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  actionBadgeText: {
    color: '#a78bfa',
    fontSize: 10,
    fontWeight: '600',
  },
  actionTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  actionDesc: {
    color: '#94a3b8',
    fontSize: 13,
    marginTop: 3,
  },
  practiceSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  practiceSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  practiceSectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  practiceSectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
  },
  practiceSectionTitleArabic: {
    fontSize: 14,
    color: '#10b981',
  },
  practiceCardWide: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 18,
    padding: 16,
    paddingLeft: 20,
    gap: 14,
    borderWidth: 1,
    borderColor: '#334155',
    overflow: 'hidden',
  },
  practiceCardAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
    backgroundColor: '#10b981',
  },
  practiceCardIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  practiceCardContent: {
    flex: 1,
  },
  practiceCardTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  practiceCardArabic: {
    color: '#D4AF37',
    fontSize: 13,
    marginTop: 2,
  },
  practiceCardDesc: {
    color: '#64748b',
    fontSize: 11,
    marginTop: 2,
  },
});

import { useMemo } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useQuranStore } from '../../src/stores/quranStore';
import { useProphetStoriesStore } from '../../src/stores/prophetStoriesStore';
import { useQuranStoriesStore } from '../../src/stores/quranStoriesStore';
import { useDuasStore } from '../../src/stores/duasStore';
import { TOTAL_PROPHETS } from '../../src/data/arabic/prophets';
import { TOTAL_QURAN_STORIES } from '../../src/data/arabic/quranStories';
import { TOTAL_DUAS } from '../../src/types/duas';
import { TOTAL_PRAYER_LESSONS } from '../../src/types/prayer';
import {
  Txt,
  Arabic,
  Section,
  Card,
  IconTile,
  ProgressBar,
  Stat,
  IlluminatedRule,
  MastheadWash,
  withAlpha,
} from '../../src/components/ui/Primitives';
import { color, space, radius, gutter } from '../../src/theme/tokens';

/**
 * Colour carries meaning on this screen: gold for revealed text, indigo for
 * study activities, emerald for practice. The previous six-hue mix (cyan
 * quizzes, violet stories, amber duas) grouped nothing.
 */
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

  const overallProgress = useMemo(() => getOverallCompletionPercent(), [progress]);
  const surahsCompleted = useMemo(() => getTotalSurahsCompleted(), [progress]);
  const juzCompleted = useMemo(() => getJuzCompleted(), [progress]);
  const hizbCompleted = useMemo(() => getHizbCompleted(), [progress]);
  const duasMemorized = useMemo(() => getMemorizedCount(), [getMemorizedCount]);
  const prophetStoriesCompleted = useMemo(() => getProphetStoriesCompleted(), [getProphetStoriesCompleted]);
  const quranStoriesCompleted = useMemo(() => getQuranStoriesCompleted(), [getQuranStoriesCompleted]);
  const totalStoriesCompleted = prophetStoriesCompleted + quranStoriesCompleted;
  const totalStories = TOTAL_PROPHETS + TOTAL_QURAN_STORIES;

  const actions = [
    {
      key: 'quran',
      icon: 'book' as const,
      tint: color.sacred,
      title: t('quran.quranTitle'),
      desc: t('quran.allSurahs'),
      onPress: () => router.push('/quran/all-surahs' as any),
    },
    {
      key: 'stories',
      icon: 'library' as const,
      tint: color.accent,
      title: t('quran.stories'),
      desc: t('quran.prophetsAndMore'),
      badge: `${totalStoriesCompleted}/${totalStories}`,
      onPress: () => router.push('/quran/stories' as any),
    },
    {
      key: 'duas',
      icon: 'hand-left' as const,
      tint: color.sacred,
      title: t('quran.duas'),
      desc: t('quran.propheticPrayers'),
      badge: `${duasMemorized}/${TOTAL_DUAS}`,
      onPress: () => router.push('/quran/duas' as any),
    },
    {
      key: 'quiz',
      icon: 'help-circle' as const,
      tint: color.accent,
      title: t('quran.quizzes'),
      desc: t('quran.testKnowledge'),
      onPress: () => router.push('/quran/quiz' as any),
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <MastheadWash />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Masthead — the most reverent moment in the app: the Arabic title set
            centred in the Quranic cut, framed by the illuminated rule. */}
        <View style={styles.header}>
          <Arabic size="hero" quranic align="center" style={styles.titleArabic}>
            القرآن الكريم
          </Arabic>
          <Txt variant="caption" tone="faint" style={styles.titleLatin}>
            {t('quran.title')}
          </Txt>
          <IlluminatedRule style={styles.rule} />
        </View>

        {/* Progress */}
        <Section style={styles.firstSection}>
          <Card>
            <View style={styles.progressHead}>
              <Txt variant="caption" tone="muted">{t('quran.yourProgress')}</Txt>
              <Txt variant="bodyLarge" weight="bold" tone="progress">{overallProgress}%</Txt>
            </View>
            <ProgressBar value={overallProgress} style={styles.progressBar} />
            <View style={styles.statsRow}>
              <Stat value={surahsCompleted} label={t('quran.surahs')} tint={color.progress} />
              <View style={styles.statDivider} />
              <Stat value={juzCompleted} label={t('quran.juz')} tint={color.progress} />
              <View style={styles.statDivider} />
              <Stat value={hizbCompleted} label={t('quran.hizb')} tint={color.progress} />
            </View>
          </Card>
        </Section>

        {/* Quick actions */}
        <Section>
          <View style={styles.grid}>
            {actions.map((a) => (
              <Card
                key={a.key}
                onPress={a.onPress}
                accessibilityLabel={a.title}
                style={styles.actionCard}
              >
                <View style={styles.actionTop}>
                  <IconTile name={a.icon} tint={a.tint} />
                  {a.badge ? (
                    <View style={[styles.badge, { backgroundColor: withAlpha(a.tint, 0.16) }]}>
                      <Txt variant="micro" weight="semibold" style={{ color: a.tint }}>{a.badge}</Txt>
                    </View>
                  ) : null}
                </View>
                <Txt variant="body" weight="semibold" style={styles.actionTitle}>{a.title}</Txt>
                <Txt variant="caption" tone="faint">{a.desc}</Txt>
              </Card>
            ))}
          </View>
        </Section>

        {/* Islamic practice */}
        <Section title={t('quran.islamicPractice')}>
          <Card
            onPress={() => router.push('/quran/prayer' as any)}
            accent={color.progress}
            accessibilityLabel={t('quran.prayerPractice')}
            style={styles.practiceCard}
          >
            <IconTile name="body" tint={color.progress} />
            <View style={styles.practiceContent}>
              <Txt variant="body" weight="semibold">{t('quran.prayerPractice')}</Txt>
              <Arabic size="inline" align="left" style={styles.practiceArabic}>تعلم الصلاة</Arabic>
              <Txt variant="caption" tone="faint">
                {t('quran.lessonsCount', { count: TOTAL_PRAYER_LESSONS })}
              </Txt>
            </View>
            <Ionicons name="chevron-forward" size={20} color={color.textFaint} />
          </Card>
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.bg,
  },
  scroll: {
    paddingBottom: 110,
  },

  // Masthead
  header: {
    paddingHorizontal: gutter,
    paddingTop: space.md,
    paddingBottom: space['2xl'],
    alignItems: 'center',
  },
  titleArabic: {
    alignSelf: 'stretch',
  },
  titleLatin: {
    marginTop: space.xs,
    textTransform: 'uppercase',
    letterSpacing: 1.6,
  },
  rule: {
    alignSelf: 'stretch',
    marginTop: space.xl,
  },
  firstSection: {
    marginBottom: space['3xl'],
  },

  // Progress
  progressHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: space.md,
  },
  progressBar: {
    marginBottom: space.xl,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statDivider: {
    width: StyleSheet.hairlineWidth * 2,
    alignSelf: 'stretch',
    backgroundColor: color.border,
  },

  // Actions
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: space.md,
  },
  actionCard: {
    width: '48%',
    minHeight: 132,
  },
  actionTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  badge: {
    paddingHorizontal: space.sm,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  actionTitle: {
    marginTop: space.md,
  },

  // Practice
  practiceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.lg,
    paddingLeft: space.xl,
  },
  practiceContent: {
    flex: 1,
  },
  practiceArabic: {
    marginTop: 1,
    marginBottom: 1,
  },
});

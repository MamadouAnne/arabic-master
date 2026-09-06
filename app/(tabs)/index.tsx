import { useMemo } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useProgressStore, ModuleType } from '../../src/stores/progressStore';
import {
  Txt,
  Arabic,
  Section,
  Card,
  IconTile,
  IlluminatedRule,
  MastheadWash,
  withAlpha,
} from '../../src/components/ui/Primitives';
import { color, type, weight, space, radius, gutter } from '../../src/theme/tokens';

/**
 * Module colour is semantic, not decorative: gold marks sacred content, indigo
 * marks language study. The old per-module rainbow (pink verbs, teal practice,
 * amber reading) encoded nothing — here the large Arabic glyph on each card
 * carries the individuality instead.
 */
const MODULES: Record<ModuleType, {
  titleKey: string;
  titleArabic: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  route: string;
  arabicChar: string;
}> = {
  alphabet: { titleKey: 'home.alphabet', titleArabic: 'الْحُرُوف', icon: 'text', color: color.accent, route: '/alphabet', arabicChar: 'أ' },
  vocabulary: { titleKey: 'home.vocabulary', titleArabic: 'الْمُفْرَدَات', icon: 'library', color: color.accent, route: '/vocabulary', arabicChar: 'ك' },
  numbers: { titleKey: 'learn.numbers', titleArabic: 'الْأَرْقَام', icon: 'keypad', color: color.accent, route: '/numbers', arabicChar: '٥' },
  grammar: { titleKey: 'learn.grammar', titleArabic: 'الْقَوَاعِد', icon: 'git-branch', color: color.accent, route: '/grammar', arabicChar: 'ق' },
  verbs: { titleKey: 'learn.verbConjugations', titleArabic: 'تَصْرِيفُ الْأَفْعَال', icon: 'swap-horizontal', color: color.accent, route: '/verbs', arabicChar: 'ف' },
  reading: { titleKey: 'learn.reading', titleArabic: 'الْقِرَاءَة', icon: 'document-text', color: color.accent, route: '/reading', arabicChar: 'ر' },
  writing: { titleKey: 'learn.writing', titleArabic: 'الْكِتَابَة', icon: 'create', color: color.accent, route: '/writing', arabicChar: 'خ' },
  practice: { titleKey: 'home.practice', titleArabic: 'التَّدْرِيب', icon: 'pencil', color: color.progress, route: '/practice', arabicChar: 'د' },
};

type ExploreCard = { titleKey: string; titleArabic: string; icon: keyof typeof Ionicons.glyphMap; color: string; route: string; arabicChar: string };
const EXPLORE: ExploreCard[] = [
  MODULES.alphabet,
  { titleKey: 'home.quran', titleArabic: 'الْقُرْآن', icon: 'book', color: color.sacred, route: '/quran', arabicChar: '۞' },
  MODULES.grammar,
  MODULES.verbs,
];
const TIPS_COUNT = 5;

export default function HomeScreen() {
  const { t } = useTranslation();
  const { progress, lastAccessed } = useProgressStore();

  const tipIndex = useMemo(() => {
    const now = new Date();
    const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000);
    return dayOfYear % TIPS_COUNT;
  }, []);

  const currentModule = MODULES[lastAccessed?.module || 'alphabet'];

  const getModuleName = () => lastAccessed?.moduleName || t(currentModule.titleKey);
  const hasLesson = lastAccessed?.lessonTitle && lastAccessed?.lessonTitleArabic;

  const getDisplaySubtitle = () => {
    switch (lastAccessed?.module) {
      case 'alphabet': return t('home.lettersLearned', { count: progress.alphabetProgress.lettersLearned.length });
      case 'vocabulary': return t('home.themesCompleted', { count: progress.vocabularyProgress.themesCompleted.length });
      case 'grammar': return t('home.lessonsCompletedCount', { count: progress.grammarProgress.lessonsCompleted.length });
      case 'verbs': return t('home.verbsLearned', { count: progress.verbProgress.verbsLearned.length });
      case 'reading': return t('home.textsCompleted', { count: progress.readingProgress.textsCompleted.length });
      case 'practice': return t('home.continuePracticing');
      default: return t('home.lettersLearned', { count: progress.alphabetProgress.lettersLearned.length });
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <MastheadWash />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Masthead — Arabic leads, English supports. The illuminated rule sits
            here and nowhere else on this screen, marking the head of the page
            the way a Mushaf does. */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.headerText}>
              <Arabic size="display" align="left" style={styles.greetingArabic}>
                {t('home.greeting')}
              </Arabic>
              <Txt variant="body" tone="muted" style={styles.greetingEnglish}>
                {t('home.greetingEnglish')}
              </Txt>
            </View>
            {progress.currentStreak > 0 ? (
              <View style={styles.streak} accessibilityLabel={`${progress.currentStreak} ${t('home.dayStreak')}`}>
                <Ionicons name="flame" size={15} color={color.sacred} />
                <Text style={styles.streakCount}>{progress.currentStreak}</Text>
              </View>
            ) : null}
          </View>
          <IlluminatedRule style={styles.rule} />
        </View>

        {/* Continue */}
        <Section title={t('home.continueLearning')}>
          <Card
            onPress={() => router.push(currentModule.route as any)}
            accent={currentModule.color}
            raised
            accessibilityLabel={`${t('home.continueLearning')}: ${getModuleName()}`}
            style={styles.continueCard}
          >
            <IconTile name={currentModule.icon} tint={currentModule.color} size="lg" />
            <View style={styles.continueText}>
              <Txt variant="bodyLarge" weight="semibold" numberOfLines={1}>
                {hasLesson && lastAccessed.lessonTitle !== getModuleName() ? lastAccessed.lessonTitle : getModuleName()}
              </Txt>
              <Arabic size="inline" align="left" numberOfLines={1} style={styles.continueArabic}>
                {hasLesson && lastAccessed.lessonTitle !== getModuleName() ? lastAccessed.lessonTitleArabic : currentModule.titleArabic}
              </Arabic>
              <Txt variant="caption" tone="faint" numberOfLines={1}>{getDisplaySubtitle()}</Txt>
            </View>
            <View style={[styles.playButton, { backgroundColor: currentModule.color }]}>
              <Ionicons name="play" size={17} color={color.textOnAccent} />
            </View>
          </Card>
        </Section>

        {/* Explore */}
        <Section title={t('home.explore')}>
          <View style={styles.grid}>
            {EXPLORE.map((m) => (
              <Card
                key={m.route}
                onPress={() => router.push(m.route as any)}
                accessibilityLabel={t(m.titleKey)}
                style={styles.moduleCard}
              >
                <Text style={styles.moduleWatermark} allowFontScaling={false}>{m.arabicChar}</Text>
                <IconTile name={m.icon} tint={m.color} />
                <Txt variant="body" weight="semibold" style={styles.moduleTitle}>{t(m.titleKey)}</Txt>
                <Arabic
                  size="inline"
                  align="left"
                  tone={m.color === color.sacred ? 'sacred' : 'accent'}
                  style={styles.moduleArabic}
                >
                  {m.titleArabic}
                </Arabic>
              </Card>
            ))}
          </View>
        </Section>

        {/* Tip of the day */}
        <Section title={t('home.tipOfTheDay')}>
          <Card style={styles.tipCard}>
            <IconTile name="bulb" tint={color.sacred} />
            <View style={styles.tipContent}>
              <Txt variant="body" weight="semibold" style={styles.tipTitle}>{t(`home.tips.${tipIndex}.title`)}</Txt>
              <Txt variant="body" tone="muted">{t(`home.tips.${tipIndex}.text`)}</Txt>
            </View>
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
    paddingTop: space.sm,
    paddingBottom: space['2xl'],
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: space.lg,
  },
  headerText: {
    flex: 1,
  },
  greetingArabic: {
    // Amiri sits high in its em box; a negative top margin optically centres it.
    marginTop: -space.xs,
  },
  greetingEnglish: {
    marginTop: space.xs,
  },
  streak: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    borderRadius: radius.full,
    backgroundColor: color.sacredSoft,
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderColor: withAlpha(color.sacred, 0.3),
    marginTop: space.sm,
  },
  streakCount: {
    ...type.caption,
    color: color.sacred,
    fontWeight: weight.bold,
  },
  rule: {
    marginTop: space.xl,
  },

  // Continue
  continueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.lg,
    paddingLeft: space.xl,
  },
  continueText: {
    flex: 1,
  },
  continueArabic: {
    marginTop: 1,
  },
  playButton: {
    width: 42,
    height: 42,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    // Nudge the glyph off-centre so the triangle reads as centred.
    paddingLeft: 3,
  },

  // Explore grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: space.md,
  },
  moduleCard: {
    width: '48%',
    minHeight: 124,
  },
  moduleWatermark: {
    position: 'absolute',
    right: 4,
    bottom: -18,
    fontSize: 88,
    lineHeight: 104,
    color: withAlpha(color.accent, 0.06),
    fontWeight: weight.bold,
  },
  moduleTitle: {
    marginTop: space.md,
  },
  moduleArabic: {
    marginTop: 1,
  },

  // Tip
  tipCard: {
    flexDirection: 'row',
    gap: space.lg,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    marginBottom: space.xs,
  },
});

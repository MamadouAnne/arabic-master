import { useMemo } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useProgressStore, ModuleType } from '../../src/stores/progressStore';

// Module configuration data
const MODULES: Record<ModuleType, {
  titleKey: string;
  titleArabic: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  route: string;
  arabicChar: string;
}> = {
  alphabet: { titleKey: 'home.alphabet', titleArabic: 'الْحُرُوف', icon: 'text', color: '#818cf8', route: '/alphabet', arabicChar: 'أ' },
  vocabulary: { titleKey: 'home.vocabulary', titleArabic: 'الْمُفْرَدَات', icon: 'library', color: '#D4AF37', route: '/vocabulary', arabicChar: 'ك' },
  numbers: { titleKey: 'learn.numbers', titleArabic: 'الْأَرْقَام', icon: 'keypad', color: '#14b8a6', route: '/numbers', arabicChar: '٥' },
  grammar: { titleKey: 'learn.grammar', titleArabic: 'الْقَوَاعِد', icon: 'git-branch', color: '#34d399', route: '/grammar', arabicChar: 'ق' },
  verbs: { titleKey: 'learn.verbConjugations', titleArabic: 'تَصْرِيفُ الْأَفْعَال', icon: 'swap-horizontal', color: '#f472b6', route: '/verbs', arabicChar: 'ف' },
  reading: { titleKey: 'learn.reading', titleArabic: 'الْقِرَاءَة', icon: 'document-text', color: '#fbbf24', route: '/reading', arabicChar: 'ر' },
  practice: { titleKey: 'home.practice', titleArabic: 'التَّدْرِيب', icon: 'pencil', color: '#2dd4bf', route: '/practice', arabicChar: 'د' },
};

const MODULE_ORDER: ModuleType[] = ['alphabet', 'vocabulary', 'grammar', 'verbs', 'reading', 'practice'];

// Cards shown in the "Explore" grid (independent of the learning modules above).
type ExploreCard = { titleKey: string; titleArabic: string; icon: keyof typeof Ionicons.glyphMap; color: string; route: string; arabicChar: string };
const EXPLORE: ExploreCard[] = [
  MODULES.alphabet,
  { titleKey: 'home.quran', titleArabic: 'الْقُرْآن', icon: 'book', color: '#D4AF37', route: '/quran', arabicChar: '۞' },
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
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.greeting}>{t('home.greeting')}</Text>
            <Text style={styles.greetingEnglish}>{t('home.greetingEnglish')}</Text>
          </View>
          <Image source={require('../../assets/images/adaptive-icon.png')} style={styles.appIcon} />
        </View>

        {/* Continue Learning */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('home.continueLearning')}</Text>
          <Pressable
            style={styles.continueCard}
            onPress={() => router.push(currentModule.route as any)}
            accessibilityRole="button"
            accessibilityLabel={`${t('home.continueLearning')}: ${getModuleName()}`}
          >
            <View style={[styles.continueAccent, { backgroundColor: currentModule.color }]} />
            <View style={[styles.continueIcon, { backgroundColor: currentModule.color + '22' }]}>
              <Ionicons name={currentModule.icon} size={26} color={currentModule.color} />
            </View>
            <View style={styles.continueText}>
              <Text style={styles.continueModuleName} numberOfLines={1}>
                {hasLesson && lastAccessed.lessonTitle !== getModuleName() ? lastAccessed.lessonTitle : getModuleName()}
              </Text>
              <Text style={styles.continueModuleNameArabic} numberOfLines={1}>
                {hasLesson && lastAccessed.lessonTitle !== getModuleName() ? lastAccessed.lessonTitleArabic : currentModule.titleArabic}
              </Text>
              <Text style={styles.continueSub} numberOfLines={1}>{getDisplaySubtitle()}</Text>
            </View>
            <View style={[styles.playButton, { backgroundColor: currentModule.color }]}>
              <Ionicons name="play" size={18} color="#0f172a" />
            </View>
          </Pressable>
        </View>

        {/* Explore modules */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('home.explore')}</Text>
          <View style={styles.grid}>
            {EXPLORE.map((m) => {
              return (
                <Pressable
                  key={m.route}
                  style={styles.moduleCard}
                  onPress={() => router.push(m.route as any)}
                  accessibilityRole="button"
                  accessibilityLabel={t(m.titleKey)}
                >
                  <Text style={styles.moduleWatermark} allowFontScaling={false}>{m.arabicChar}</Text>
                  <View style={[styles.moduleIcon, { backgroundColor: m.color + '22' }]}>
                    <Ionicons name={m.icon} size={22} color={m.color} />
                  </View>
                  <Text style={styles.moduleTitle}>{t(m.titleKey)}</Text>
                  <Text style={[styles.moduleArabic, { color: m.color }]}>{m.titleArabic}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Tip of the day */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('home.tipOfTheDay')}</Text>
          <View style={styles.tipCard}>
            <View style={styles.tipAccent} />
            <View style={styles.tipIcon}>
              <Ionicons name="bulb" size={22} color="#D4AF37" />
            </View>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>{t(`home.tips.${tipIndex}.title`)}</Text>
              <Text style={styles.tipText}>{t(`home.tips.${tipIndex}.text`)}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  scroll: {
    paddingBottom: 110,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
  },
  headerText: {
    flex: 1,
  },
  greeting: {
    fontSize: 30,
    color: '#ffffff',
    fontWeight: '800',
  },
  greetingEnglish: {
    fontSize: 15,
    color: '#94a3b8',
    marginTop: 4,
  },
  appIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
  },

  // Sections
  section: {
    paddingHorizontal: 20,
    marginBottom: 26,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 14,
  },

  // Continue card
  continueCard: {
    backgroundColor: '#1e293b',
    borderRadius: 18,
    padding: 16,
    paddingLeft: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderColor: '#334155',
    overflow: 'hidden',
  },
  continueAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
  },
  continueIcon: {
    width: 54,
    height: 54,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueText: {
    flex: 1,
  },
  continueModuleName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  continueModuleNameArabic: {
    color: '#D4AF37',
    fontSize: 15,
    lineHeight: 24,
    marginTop: 1,
  },
  continueSub: {
    color: '#94a3b8',
    fontSize: 13,
    marginTop: 3,
  },
  playButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Modules grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 14,
  },
  moduleCard: {
    width: '48%',
    backgroundColor: '#1e293b',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
    overflow: 'hidden',
    minHeight: 116,
  },
  moduleWatermark: {
    position: 'absolute',
    right: 6,
    bottom: -14,
    fontSize: 84,
    color: 'rgba(255, 255, 255, 0.04)',
    fontWeight: '700',
  },
  moduleIcon: {
    width: 46,
    height: 46,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  moduleTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  moduleArabic: {
    fontSize: 15,
    lineHeight: 26,
    marginTop: 2,
    fontWeight: '600',
  },

  // Tip card
  tipCard: {
    backgroundColor: '#1e293b',
    borderRadius: 18,
    padding: 16,
    paddingLeft: 20,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#334155',
    overflow: 'hidden',
  },
  tipAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
    backgroundColor: '#D4AF37',
  },
  tipIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#D4AF3722',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipContent: {
    flex: 1,
    marginLeft: 14,
  },
  tipTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  tipText: {
    color: '#94a3b8',
    fontSize: 14,
    lineHeight: 20,
  },
});

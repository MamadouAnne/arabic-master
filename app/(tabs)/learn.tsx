import { memo, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useProgressStore, ModuleType, LastAccessedInfo } from '../../src/stores/progressStore';

interface ModuleCardProps {
  moduleId: ModuleType;
  title: string;
  titleArabic: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  progress: number;
  route: string;
  locked?: boolean;
  onPress: (moduleId: ModuleType, title: string) => void;
}

const ModuleCard = memo(function ModuleCard({
  moduleId,
  title,
  titleArabic,
  description,
  icon,
  color,
  progress,
  route,
  locked = false,
  onPress,
}: ModuleCardProps) {
  const handlePress = () => {
    if (!locked) {
      onPress(moduleId, title);
      router.push(route as any);
    }
  };

  return (
    <Pressable
      style={[styles.moduleCard, locked && styles.moduleCardLocked]}
      onPress={handlePress}
      disabled={locked}
      accessibilityRole="button"
      accessibilityLabel={`${title}${locked ? ', locked' : ''}`}
      accessibilityState={{ disabled: locked }}
    >
      <View style={styles.moduleHeader}>
        <View style={[styles.moduleIcon, { backgroundColor: color + '20' }]}>
          <Ionicons name={icon} size={28} color={locked ? '#64748b' : color} />
        </View>
        {locked && (
          <View style={styles.lockBadge}>
            <Ionicons name="lock-closed" size={14} color="#64748b" />
          </View>
        )}
      </View>

      <View style={styles.moduleContent}>
        <Text style={[styles.moduleTitle, locked && styles.textLocked]}>{title}</Text>
        <Text style={[styles.moduleTitleArabic, locked && styles.textLocked]}>{titleArabic}</Text>
        <Text style={[styles.moduleDescription, locked && styles.textLocked]}>{description}</Text>
      </View>

      {!locked && (
        <View style={styles.moduleProgress}>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progress}%`, backgroundColor: color }]} />
          </View>
          <Text style={styles.progressText}>{progress}%</Text>
        </View>
      )}

      <View style={styles.moduleArrow}>
        <Ionicons name="chevron-forward" size={24} color={locked ? '#334155' : '#64748b'} />
      </View>
    </Pressable>
  );
});

export default function LearnScreen() {
  const { t } = useTranslation();
  const { getAlphabetCompletionPercent, getVocabularyCompletionPercent, getGrammarCompletionPercent, setLastAccessed } = useProgressStore();

  const handleModulePress = (moduleId: ModuleType, title: string) => {
    setLastAccessed({
      module: moduleId,
      moduleName: title,
      lessonId: undefined,
      lessonTitle: undefined,
      lessonTitleArabic: undefined,
    });
  };

  const alphabetProgress = getAlphabetCompletionPercent();
  const grammarProgress = getGrammarCompletionPercent();
  const vocabularyProgress = getVocabularyCompletionPercent();

  const modules = useMemo(() => [
    {
      id: 'alphabet',
      title: t('learn.alphabetWriting'),
      titleArabic: 'الْحُرُوفُ وَالْكِتَابَة',
      description: t('learn.alphabetWritingDesc'),
      icon: 'text' as const,
      color: '#6366f1',
      progress: alphabetProgress,
      route: '/alphabet',
      locked: false,
    },
    {
      id: 'grammar',
      title: t('learn.grammar'),
      titleArabic: 'الْقَوَاعِد',
      description: t('learn.grammarDesc'),
      icon: 'git-branch' as const,
      color: '#22c55e',
      progress: grammarProgress,
      route: '/grammar',
      locked: false,
    },
    {
      id: 'verbs',
      title: t('learn.verbConjugations'),
      titleArabic: 'تَصْرِيفُ الْأَفْعَال',
      description: t('learn.verbConjugationsDesc'),
      icon: 'swap-horizontal' as const,
      color: '#ec4899',
      progress: 0,
      route: '/verbs',
      locked: false,
    },
    {
      id: 'vocabulary',
      title: t('learn.vocabulary'),
      titleArabic: 'الْمُفْرَدَات',
      description: t('learn.vocabularyDesc'),
      icon: 'library' as const,
      color: '#D4AF37',
      progress: vocabularyProgress,
      route: '/vocabulary',
      locked: false,
    },
    {
      id: 'numbers',
      title: t('learn.numbers'),
      titleArabic: 'الْأَرْقَام',
      description: t('learn.numbersDesc'),
      icon: 'keypad' as const,
      color: '#14b8a6',
      progress: 0,
      route: '/numbers',
      locked: false,
    },
    {
      id: 'reading',
      title: t('learn.reading'),
      titleArabic: 'الْقِرَاءَة',
      description: t('learn.readingDesc'),
      icon: 'document-text' as const,
      color: '#f59e0b',
      progress: 0,
      route: '/reading',
      locked: false,
    },
    {
      id: 'practice',
      title: t('learn.practice'),
      titleArabic: 'التَّدْرِيب',
      description: t('learn.practiceDesc'),
      icon: 'pencil' as const,
      color: '#ec4899',
      progress: 0,
      route: '/practice',
      locked: false,
    },
  ], [t, alphabetProgress, grammarProgress, vocabularyProgress]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={styles.title}>{t('learn.title')}</Text>
          <Text style={styles.titleArabic}>تَعَلَّمِ الْعَرَبِيَّة</Text>
        </View>
        <View style={styles.subtitleContainer}>
          <Text style={styles.subtitle}>{t('learn.subtitle')}</Text>
        </View>

        {/* Modules */}
        <View style={styles.modulesSection}>
          <Text style={styles.sectionTitle}>{t('learn.learningModules')}</Text>
          {modules.map((module) => (
            <ModuleCard
              key={module.id}
              moduleId={module.id as ModuleType}
              title={module.title}
              titleArabic={module.titleArabic}
              description={module.description}
              icon={module.icon}
              color={module.color}
              progress={module.progress}
              route={module.route}
              locked={module.locked}
              onPress={handleModulePress}
            />
          ))}
        </View>

        {/* Vowels Toggle Info */}
        <View style={styles.vowelsInfo}>
          <Ionicons name="information-circle" size={20} color="#6366f1" />
          <Text style={styles.vowelsInfoText}>{t('learn.vowelsInfo')}</Text>
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  titleArabic: {
    fontSize: 22,
    color: '#D4AF37',
  },
  subtitleContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 8,
  },
  modulesSection: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  moduleCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  moduleCardLocked: {
    opacity: 0.6,
  },
  moduleHeader: {
    position: 'relative',
  },
  moduleIcon: {
    width: 56,
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#1e293b',
    borderWidth: 2,
    borderColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moduleContent: {
    flex: 1,
    marginLeft: 16,
  },
  moduleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  moduleTitleArabic: {
    fontSize: 14,
    color: '#D4AF37',
    marginTop: 2,
  },
  moduleDescription: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
  },
  textLocked: {
    color: '#64748b',
  },
  moduleProgress: {
    alignItems: 'flex-end',
    marginRight: 8,
  },
  progressBarBg: {
    width: 60,
    height: 6,
    backgroundColor: '#334155',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
  },
  moduleArrow: {
    marginLeft: 4,
  },
  vowelsInfo: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 12,
    padding: 16,
    alignItems: 'flex-start',
  },
  vowelsInfoText: {
    flex: 1,
    fontSize: 13,
    color: '#94a3b8',
    marginLeft: 12,
    lineHeight: 20,
  },
});

import { memo, useMemo } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
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
  ProgressBar,
  IlluminatedRule,
} from '../../src/components/ui/Primitives';
import { color, space, radius, gutter } from '../../src/theme/tokens';

interface ModuleCardProps {
  moduleId: ModuleType;
  title: string;
  titleArabic: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  /** Percent complete, or null when this module does not track progress. */
  progress: number | null;
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
  progress,
  route,
  locked = false,
  onPress,
}: ModuleCardProps) {
  const handlePress = () => {
    if (locked) return;
    onPress(moduleId, title);
    router.push(route as any);
  };

  return (
    <Card
      onPress={locked ? undefined : handlePress}
      accessibilityLabel={`${title}${locked ? ', locked' : ''}`}
      accessibilityState={{ disabled: locked }}
      style={[styles.moduleCard, locked && styles.moduleCardLocked]}
    >
      <View>
        <IconTile name={icon} tint={locked ? color.textFaint : color.accent} size="lg" />
        {locked ? (
          <View style={styles.lockBadge}>
            <Ionicons name="lock-closed" size={12} color={color.textFaint} />
          </View>
        ) : null}
      </View>

      <View style={styles.moduleContent}>
        <Txt variant="body" weight="semibold" tone={locked ? 'faint' : 'text'}>{title}</Txt>
        <Arabic size="inline" align="left" tone={locked ? 'muted' : 'sacred'} style={styles.moduleArabic}>
          {titleArabic}
        </Arabic>
        <Txt variant="caption" tone="faint">{description}</Txt>

        {/* Only modules that actually record progress get a progress bar —
            five of these previously showed a permanent 0%. */}
        {progress !== null && !locked ? (
          <View style={styles.progressRow}>
            <ProgressBar value={progress} height={5} style={styles.progressBar} />
            <Txt variant="micro" tone="faint">{progress}%</Txt>
          </View>
        ) : null}
      </View>

      <Ionicons name="chevron-forward" size={20} color={locked ? color.border : color.textFaint} />
    </Card>
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
      progress: alphabetProgress,
      route: '/alphabet',
    },
    {
      id: 'writing',
      title: t('learn.writing'),
      titleArabic: 'الْكِتَابَة',
      description: t('learn.writingDesc'),
      icon: 'create' as const,
      progress: null,
      route: '/writing',
    },
    {
      id: 'reading',
      title: t('learn.reading'),
      titleArabic: 'الْقِرَاءَة',
      description: t('learn.readingDesc'),
      icon: 'document-text' as const,
      progress: null,
      route: '/reading',
    },
    {
      id: 'grammar',
      title: t('learn.grammar'),
      titleArabic: 'الْقَوَاعِد',
      description: t('learn.grammarDesc'),
      icon: 'git-branch' as const,
      progress: grammarProgress,
      route: '/grammar',
    },
    {
      id: 'verbs',
      title: t('learn.verbConjugations'),
      titleArabic: 'تَصْرِيفُ الْأَفْعَال',
      description: t('learn.verbConjugationsDesc'),
      icon: 'swap-horizontal' as const,
      progress: null,
      route: '/verbs',
    },
    {
      id: 'vocabulary',
      title: t('learn.vocabulary'),
      titleArabic: 'الْمُفْرَدَات',
      description: t('learn.vocabularyDesc'),
      icon: 'library' as const,
      progress: vocabularyProgress,
      route: '/vocabulary',
    },
    {
      id: 'numbers',
      title: t('learn.numbers'),
      titleArabic: 'الْأَرْقَام',
      description: t('learn.numbersDesc'),
      icon: 'keypad' as const,
      progress: null,
      route: '/numbers',
    },
    {
      id: 'practice',
      title: t('learn.practice'),
      titleArabic: 'التَّدْرِيب',
      description: t('learn.practiceDesc'),
      icon: 'pencil' as const,
      progress: null,
      route: '/practice',
    },
  ], [t, alphabetProgress, grammarProgress, vocabularyProgress]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Masthead */}
        <View style={styles.header}>
          <Arabic size="display" align="left" style={styles.titleArabic}>
            تَعَلَّمِ الْعَرَبِيَّة
          </Arabic>
          <Txt variant="body" tone="muted" style={styles.subtitle}>{t('learn.subtitle')}</Txt>
          <IlluminatedRule style={styles.rule} />
        </View>

        <Section title={t('learn.learningModules')}>
          <View style={styles.moduleList}>
            {modules.map((module) => (
              <ModuleCard
                key={module.id}
                moduleId={module.id as ModuleType}
                title={module.title}
                titleArabic={module.titleArabic}
                description={module.description}
                icon={module.icon}
                progress={module.progress}
                route={module.route}
                onPress={handleModulePress}
              />
            ))}
          </View>
        </Section>

        <Section>
          <Card style={styles.info}>
            <Ionicons name="information-circle" size={20} color={color.accent} />
            <Txt variant="caption" tone="muted" style={styles.infoText}>{t('learn.vowelsInfo')}</Txt>
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
  titleArabic: {
    marginTop: -space.xs,
  },
  subtitle: {
    marginTop: space.xs,
  },
  rule: {
    marginTop: space.xl,
  },

  // Modules
  moduleList: {
    gap: space.md,
  },
  moduleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.lg,
  },
  moduleCardLocked: {
    opacity: 0.55,
  },
  lockBadge: {
    position: 'absolute',
    bottom: -3,
    right: -3,
    width: 22,
    height: 22,
    borderRadius: radius.full,
    backgroundColor: color.surface,
    borderWidth: 2,
    borderColor: color.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moduleContent: {
    flex: 1,
  },
  moduleArabic: {
    marginTop: 1,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    marginTop: space.sm,
  },
  progressBar: {
    flex: 1,
  },

  // Info
  info: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space.md,
  },
  infoText: {
    flex: 1,
  },
});

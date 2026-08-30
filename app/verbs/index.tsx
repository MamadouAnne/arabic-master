import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useLocalizedContent } from '../../src/hooks/useLocalizedContent';
import { verbExercises } from '../../src/data/arabic/exercises/verbExercises';
import { arabicVerbs } from '../../src/data/arabic/verbs/conjugations';
import { verbLessons } from '../../src/data/arabic/verbs/verbLessons';
import { useArabicSpeech } from '../../src/hooks/useArabicSpeech';
import { font, color as tk, radius } from '../../src/theme/tokens';
import { withAlpha } from '../../src/components/ui/Primitives';

export default function VerbsScreen() {
  const { t } = useTranslation();
  const { lc } = useLocalizedContent();
  const { speak } = useArabicSpeech();
  const writingExercises = verbExercises.filter(ex => ex.type === 'writing');
  const quizExercises = verbExercises.filter(ex => ex.type !== 'writing');

  const tenseCategories = [
    {
      id: 'present',
      title: t('verbs.presentTense'),
      titleArabic: 'الْمُضَارِع',
      description: t('verbs.presentTenseDesc'),
      icon: 'reload-outline' as const,
      color: tk.accentStrong,
    },
    {
      id: 'past',
      title: t('verbs.pastTense'),
      titleArabic: 'الْمَاضِي',
      description: t('verbs.pastTenseDesc'),
      icon: 'time-outline' as const,
      color: tk.progress,
    },
    {
      id: 'future',
      title: t('verbs.futureTense'),
      titleArabic: 'الْمُسْتَقْبَل',
      description: t('verbs.futureTenseDesc'),
      icon: 'arrow-forward-outline' as const,
      color: tk.sacred,
    },
    {
      id: 'imperative',
      title: t('verbs.commands'),
      titleArabic: 'الْأَمْر',
      description: t('verbs.commandsDesc'),
      icon: 'megaphone-outline' as const,
      color: tk.warning,
    },
  ];

  // Verb lessons grouped by level, numbered continuously by teaching order
  const sortedLessons = [...verbLessons].sort((a, b) => a.order - b.order);
  const lessonNumber: Record<string, number> = {};
  sortedLessons.forEach((l, i) => { lessonNumber[l.id] = i + 1; });

  const LEVELS: { key: string; label: string; ar: string; color: string }[] = [
    { key: 'beginner', label: t('common.beginner'), ar: 'الْمُبْتَدِئ', color: tk.progress },
    { key: 'intermediate', label: t('common.intermediate'), ar: 'الْمُتَوَسِّط', color: tk.accentStrong },
    { key: 'advanced', label: t('common.advanced'), ar: 'الْمُتَقَدِّم', color: tk.sacred },
  ];

  const renderLessonCard = (lesson: (typeof verbLessons)[number], color: string) => (
    <Pressable
      key={lesson.id}
      style={styles.lessonCard}
      onPress={() => router.push(`/grammar/${lesson.id}` as any)}
    >
      <View style={[styles.lessonNumber, { backgroundColor: color + '30' }]}>
        <Text style={[styles.lessonNumberText, { color }]}>{lessonNumber[lesson.id]}</Text>
      </View>
      <View style={styles.lessonContent}>
        <Text style={styles.lessonTitle}>{lc(lesson.title, (lesson as any).titleFr)}</Text>
        <Text style={styles.lessonTitleArabic}>{lesson.titleArabic}</Text>
        <Text style={styles.lessonDescription} numberOfLines={2}>
          {lc(lesson.description, (lesson as any).descriptionFr)}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={tk.textFaint} />
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={tk.text} />
          </Pressable>
          <View style={styles.headerText}>
            <Text style={styles.title}>{t('verbs.title')}</Text>
            <Text style={styles.titleArabic}>تَصْرِيفُ الْأَفْعَال</Text>
          </View>
        </View>

        {/* Intro Card */}
        <View style={styles.introCard}>
          <Ionicons name="information-circle" size={24} color={tk.progress} />
          <View style={styles.introContent}>
            <Text style={styles.introTitle}>{t('verbs.introTitle')}</Text>
            <Text style={styles.introText}>
              {t('verbs.introText')}
            </Text>
          </View>
        </View>

        {/* Verb Lessons */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('verbs.verbLessons')}</Text>
          <Text style={styles.sectionSubtitle}>{t('verbs.verbLessonsDesc')}</Text>
          {LEVELS.map((lvl) => {
            const group = sortedLessons.filter((l) => l.level === lvl.key);
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
                <View style={styles.lessonsGrid}>
                  {group.map((lesson) => renderLessonCard(lesson, lvl.color))}
                </View>
              </View>
            );
          })}
        </View>

        {/* Tense Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('verbs.tensesAndMoods')}</Text>
          {tenseCategories.map((category) => (
            <Pressable
              key={category.id}
              style={styles.categoryCard}
              onPress={() => router.push(`/verbs/${category.id}` as any)}
            >
              <View style={[styles.categoryIcon, { backgroundColor: category.color + '20' }]}>
                <Ionicons name={category.icon} size={24} color={category.color} />
              </View>
              <View style={styles.categoryContent}>
                <Text style={styles.categoryTitle}>{category.title}</Text>
                <Text style={styles.categoryTitleArabic}>{category.titleArabic}</Text>
                <Text style={styles.categoryDescription}>{category.description}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={tk.textFaint} />
            </Pressable>
          ))}
        </View>

        {/* All Verbs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('verbs.allVerbs', { count: arabicVerbs.length })}</Text>
          <Text style={styles.sectionSubtitle}>{t('verbs.allVerbsDesc')}</Text>
          <View style={styles.verbsGrid}>
            {arabicVerbs.map((verb) => (
              <Pressable
                key={verb.id}
                style={styles.verbCard}
                onPress={() => router.push(`/verbs/verb/${verb.id}` as any)}
              >
                <Pressable
                  style={styles.verbAudioButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    speak(verb.pastTense);
                  }}
                >
                  <Ionicons name="volume-high" size={16} color={tk.progress} />
                </Pressable>
                <Text style={styles.verbArabicText}>{verb.pastTense}</Text>
                <Text style={styles.verbMeaningText}>{lc(verb.meaning, (verb as any).meaningFr)}</Text>
                <Text style={styles.verbRootText}>{verb.root}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Key Concepts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('verbs.keyConcepts')}</Text>
          <View style={styles.conceptsGrid}>
            <View style={[styles.conceptCard, { borderLeftColor: tk.progress }]}>
              <Text style={[styles.conceptEmoji, { backgroundColor: withAlpha(tk.progress, 0.13) }]}>🔤</Text>
              <View style={styles.conceptContent}>
                <Text style={styles.conceptTitle}>{t('verbs.rootSystem')}</Text>
                <Text style={styles.conceptText}>
                  {t('verbs.rootSystemDesc')}
                </Text>
              </View>
            </View>
            <View style={[styles.conceptCard, { borderLeftColor: tk.accentStrong }]}>
              <Text style={[styles.conceptEmoji, { backgroundColor: withAlpha(tk.accentStrong, 0.13) }]}>👤</Text>
              <View style={styles.conceptContent}>
                <Text style={styles.conceptTitle}>{t('verbs.person')}</Text>
                <Text style={styles.conceptText}>
                  {t('verbs.personDesc')}
                </Text>
              </View>
            </View>
            <View style={[styles.conceptCard, { borderLeftColor: tk.sacred }]}>
              <Text style={[styles.conceptEmoji, { backgroundColor: withAlpha(tk.sacred, 0.13) }]}>⚥</Text>
              <View style={styles.conceptContent}>
                <Text style={styles.conceptTitle}>{t('verbs.genderConcept')}</Text>
                <Text style={styles.conceptText}>
                  {t('verbs.genderDesc')}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Practice Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('common.practice')}</Text>

          {/* Quiz Practice */}
          <Pressable
            style={[styles.practiceButton, { backgroundColor: tk.progress }]}
            onPress={() =>
              router.push({
                pathname: '/verbs/quiz-practice',
              } as any)
            }
          >
            <Ionicons name="help-circle" size={24} color={tk.text} />
            <View style={styles.practiceButtonContent}>
              <Text style={styles.practiceButtonText}>{t('verbs.quizPractice')}</Text>
              <Text style={styles.practiceButtonSubtext}>
                {t('verbs.quizPracticeDesc')}
              </Text>
            </View>
            <View style={styles.exerciseCount}>
              <Text style={styles.exerciseCountText}>{quizExercises.length}</Text>
            </View>
          </Pressable>

          {/* Writing Practice */}
          <Pressable
            style={[styles.practiceButton, { backgroundColor: tk.sacred }]}
            onPress={() =>
              router.push({
                pathname: '/verbs/writing-practice',
              } as any)
            }
          >
            <Ionicons name="pencil" size={24} color={tk.text} />
            <View style={styles.practiceButtonContent}>
              <Text style={styles.practiceButtonText}>{t('verbs.writingPractice')}</Text>
              <Text style={styles.practiceButtonSubtext}>
                {t('verbs.writingPracticeDesc')}
              </Text>
            </View>
            <View style={styles.exerciseCount}>
              <Text style={styles.exerciseCountText}>{writingExercises.length}</Text>
            </View>
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
    backgroundColor: tk.bg,
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
    backgroundColor: tk.surface,
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
    color: tk.text,
  },
  titleArabic: {
    fontFamily: font.arabic,
    lineHeight: 31,
    fontSize: 18,
    color: tk.progress,
    marginTop: 4,
  },
  introCard: {
    flexDirection: 'row',
    backgroundColor: withAlpha(tk.progress, 0.13),
    marginHorizontal: 20,
    borderRadius: radius.lg,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: withAlpha(tk.progress, 0.25),
  },
  introContent: {
    flex: 1,
    marginLeft: 12,
  },
  introTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: tk.progress,
    marginBottom: 4,
  },
  introText: {
    fontSize: 13,
    color: tk.textMuted,
    lineHeight: 20,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: tk.text,
    marginBottom: 16,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tk.surface,
    borderRadius: radius.lg,
    padding: 16,
    marginBottom: 12,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryContent: {
    flex: 1,
    marginLeft: 16,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: tk.text,
  },
  categoryTitleArabic: {
    fontFamily: font.arabic,
    lineHeight: 24,
    fontSize: 14,
    color: tk.sacred,
    marginTop: 2,
  },
  categoryDescription: {
    fontSize: 12,
    color: tk.textMuted,
    marginTop: 4,
  },
  practiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.lg,
    padding: 18,
    marginBottom: 12,
  },
  practiceButtonContent: {
    flex: 1,
    marginLeft: 12,
  },
  practiceButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: tk.text,
  },
  practiceButtonSubtext: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 2,
  },
  exerciseCount: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.md,
  },
  exerciseCountText: {
    color: tk.text,
    fontSize: 14,
    fontWeight: 'bold',
  },
  sectionSubtitle: {
    fontSize: 13,
    color: tk.textFaint,
    marginBottom: 16,
    marginTop: -8,
  },
  verbsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  verbCard: {
    width: '31%',
    backgroundColor: tk.surface,
    borderRadius: radius.md,
    padding: 12,
    alignItems: 'center',
    position: 'relative',
  },
  verbAudioButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: radius.md,
    backgroundColor: withAlpha(tk.progress, 0.13),
    alignItems: 'center',
    justifyContent: 'center',
  },
  verbArabicText: {
    fontFamily: font.arabic,
    fontSize: 26,
    lineHeight: 44,
    color: tk.text,
    fontWeight: '600',
    marginBottom: 4,
    marginTop: 4,
  },
  verbMeaningText: {
    fontSize: 11,
    color: tk.textMuted,
    textAlign: 'center',
  },
  verbRootText: {
    fontSize: 10,
    color: tk.textFaint,
    marginTop: 4,
  },
  conceptsGrid: {
    gap: 14,
  },
  conceptCard: {
    backgroundColor: tk.surface,
    borderRadius: radius.lg,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    borderLeftWidth: 4,
    borderLeftColor: tk.progress,
  },
  conceptEmoji: {
    fontSize: 28,
    width: 48,
    height: 48,
    backgroundColor: withAlpha(tk.progress, 0.13),
    borderRadius: radius.md,
    textAlign: 'center',
    lineHeight: 48,
    overflow: 'hidden',
  },
  conceptContent: {
    flex: 1,
  },
  conceptTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: tk.text,
    marginBottom: 6,
  },
  conceptText: {
    fontSize: 13,
    color: tk.textMuted,
    lineHeight: 20,
  },
  // Verb Lessons styles
  levelGroup: {
    marginBottom: 6,
  },
  levelGroupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 10,
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
    color: tk.text,
    textTransform: 'capitalize',
  },
  levelGroupCount: {
    minWidth: 22,
    height: 22,
    paddingHorizontal: 6,
    borderRadius: radius.md,
    backgroundColor: tk.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelGroupCountText: {
    fontSize: 12,
    fontWeight: '700',
    color: tk.textMuted,
  },
  levelGroupAr: {
    fontSize: 13,
    color: tk.textFaint,
  },
  lessonsGrid: {
    gap: 12,
  },
  lessonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tk.surface,
    borderRadius: radius.lg,
    padding: 16,
  },
  lessonNumber: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lessonNumberText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  lessonContent: {
    flex: 1,
    marginLeft: 14,
  },
  lessonTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: tk.text,
  },
  lessonTitleArabic: {
    fontFamily: font.arabic,
    lineHeight: 22,
    fontSize: 13,
    color: tk.sacred,
    marginTop: 2,
  },
  lessonDescription: {
    fontSize: 12,
    color: tk.textMuted,
    marginTop: 4,
    lineHeight: 18,
  },
});

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
      color: '#6366f1',
    },
    {
      id: 'past',
      title: t('verbs.pastTense'),
      titleArabic: 'الْمَاضِي',
      description: t('verbs.pastTenseDesc'),
      icon: 'time-outline' as const,
      color: '#10b981',
    },
    {
      id: 'future',
      title: t('verbs.futureTense'),
      titleArabic: 'الْمُسْتَقْبَل',
      description: t('verbs.futureTenseDesc'),
      icon: 'arrow-forward-outline' as const,
      color: '#D4AF37',
    },
    {
      id: 'imperative',
      title: t('verbs.commands'),
      titleArabic: 'الْأَمْر',
      description: t('verbs.commandsDesc'),
      icon: 'megaphone-outline' as const,
      color: '#f59e0b',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </Pressable>
          <View style={styles.headerText}>
            <Text style={styles.title}>{t('verbs.title')}</Text>
            <Text style={styles.titleArabic}>تَصْرِيفُ الْأَفْعَال</Text>
          </View>
        </View>

        {/* Intro Card */}
        <View style={styles.introCard}>
          <Ionicons name="information-circle" size={24} color="#10b981" />
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
          <View style={styles.lessonsGrid}>
            {[...verbLessons].sort((a, b) => a.order - b.order).map((lesson, index) => (
              <Pressable
                key={lesson.id}
                style={styles.lessonCard}
                onPress={() => router.push(`/grammar/${lesson.id}` as any)}
              >
                <View style={[styles.lessonNumber, { backgroundColor: index < 4 ? '#10b98130' : '#6366f130' }]}>
                  <Text style={[styles.lessonNumberText, { color: index < 4 ? '#10b981' : '#6366f1' }]}>{index + 1}</Text>
                </View>
                <View style={styles.lessonContent}>
                  <Text style={styles.lessonTitle}>{lc(lesson.title, (lesson as any).titleFr)}</Text>
                  <Text style={styles.lessonTitleArabic}>{lesson.titleArabic}</Text>
                  <Text style={styles.lessonDescription} numberOfLines={2}>
                    {lc(lesson.description, (lesson as any).descriptionFr)}
                  </Text>
                  <View style={styles.lessonMeta}>
                    <View style={[styles.levelBadge, { backgroundColor: lesson.level === 'beginner' ? '#10b98130' : '#6366f130' }]}>
                      <Text style={[styles.levelText, { color: lesson.level === 'beginner' ? '#10b981' : '#6366f1' }]}>
                        {lesson.level}
                      </Text>
                    </View>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#64748b" />
              </Pressable>
            ))}
          </View>
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
              <Ionicons name="chevron-forward" size={20} color="#64748b" />
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
                  <Ionicons name="volume-high" size={16} color="#10b981" />
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
            <View style={[styles.conceptCard, { borderLeftColor: '#10b981' }]}>
              <Text style={[styles.conceptEmoji, { backgroundColor: '#10b98120' }]}>🔤</Text>
              <View style={styles.conceptContent}>
                <Text style={styles.conceptTitle}>{t('verbs.rootSystem')}</Text>
                <Text style={styles.conceptText}>
                  {t('verbs.rootSystemDesc')}
                </Text>
              </View>
            </View>
            <View style={[styles.conceptCard, { borderLeftColor: '#6366f1' }]}>
              <Text style={[styles.conceptEmoji, { backgroundColor: '#6366f120' }]}>👤</Text>
              <View style={styles.conceptContent}>
                <Text style={styles.conceptTitle}>{t('verbs.person')}</Text>
                <Text style={styles.conceptText}>
                  {t('verbs.personDesc')}
                </Text>
              </View>
            </View>
            <View style={[styles.conceptCard, { borderLeftColor: '#D4AF37' }]}>
              <Text style={[styles.conceptEmoji, { backgroundColor: '#D4AF3720' }]}>⚥</Text>
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
            style={[styles.practiceButton, { backgroundColor: '#10b981' }]}
            onPress={() =>
              router.push({
                pathname: '/verbs/quiz-practice',
              } as any)
            }
          >
            <Ionicons name="help-circle" size={24} color="#ffffff" />
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
            style={[styles.practiceButton, { backgroundColor: '#D4AF37' }]}
            onPress={() =>
              router.push({
                pathname: '/verbs/writing-practice',
              } as any)
            }
          >
            <Ionicons name="pencil" size={24} color="#ffffff" />
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
    backgroundColor: '#0f172a',
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
    borderRadius: 20,
    backgroundColor: '#1e293b',
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
    color: '#ffffff',
  },
  titleArabic: {
    fontSize: 18,
    color: '#10b981',
    marginTop: 4,
  },
  introCard: {
    flexDirection: 'row',
    backgroundColor: '#10b98120',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#10b98140',
  },
  introContent: {
    flex: 1,
    marginLeft: 12,
  },
  introTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10b981',
    marginBottom: 4,
  },
  introText: {
    fontSize: 13,
    color: '#94a3b8',
    lineHeight: 20,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
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
    color: '#ffffff',
  },
  categoryTitleArabic: {
    fontSize: 14,
    color: '#D4AF37',
    marginTop: 2,
  },
  categoryDescription: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
  },
  practiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
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
    color: '#ffffff',
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
    borderRadius: 12,
  },
  exerciseCountText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#64748b',
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
    backgroundColor: '#1e293b',
    borderRadius: 12,
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
    borderRadius: 12,
    backgroundColor: '#10b98120',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verbArabicText: {
    fontSize: 26,
    lineHeight: 44,
    color: '#ffffff',
    fontWeight: '600',
    marginBottom: 4,
    marginTop: 4,
  },
  verbMeaningText: {
    fontSize: 11,
    color: '#94a3b8',
    textAlign: 'center',
  },
  verbRootText: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 4,
  },
  conceptsGrid: {
    gap: 14,
  },
  conceptCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  conceptEmoji: {
    fontSize: 28,
    width: 48,
    height: 48,
    backgroundColor: '#10b98120',
    borderRadius: 12,
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
    color: '#ffffff',
    marginBottom: 6,
  },
  conceptText: {
    fontSize: 13,
    color: '#94a3b8',
    lineHeight: 20,
  },
  // Verb Lessons styles
  lessonsGrid: {
    gap: 12,
  },
  lessonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
  },
  lessonNumber: {
    width: 40,
    height: 40,
    borderRadius: 12,
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
    color: '#ffffff',
  },
  lessonTitleArabic: {
    fontSize: 13,
    color: '#D4AF37',
    marginTop: 2,
  },
  lessonDescription: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
    lineHeight: 18,
  },
  lessonMeta: {
    flexDirection: 'row',
    marginTop: 8,
  },
  levelBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  levelText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});

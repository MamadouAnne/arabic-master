import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useLocalizedContent } from '../../../src/hooks/useLocalizedContent';
import { QUIZ_CATEGORIES } from '../../../src/data/arabic/quran/quizzes';
import { QuizCategoryInfo } from '../../../src/types/quran';
import { font, color, radius } from '../../../src/theme/tokens';
import { withAlpha } from '../../../src/components/ui/Primitives';

interface CategoryCardProps {
  category: QuizCategoryInfo;
  onPress: () => void;
}

function CategoryCard({ category, onPress }: CategoryCardProps) {
  const { t } = useTranslation();
  const { lc } = useLocalizedContent();
  return (
    <Pressable style={styles.categoryCard} onPress={onPress}>
      <View style={[styles.categoryIcon, { backgroundColor: `${category.color}20` }]}>
        <Ionicons name={category.icon as any} size={28} color={category.color} />
      </View>
      <View style={styles.categoryInfo}>
        <Text style={styles.categoryName}>{lc(category.nameEnglish, category.nameFrench)}</Text>
        <Text style={styles.categoryNameArabic}>{category.nameArabic}</Text>
        <Text style={styles.categoryDesc}>{lc(category.description, category.descriptionFr)}</Text>
        <View style={styles.questionCount}>
          <Ionicons name="help-circle-outline" size={14} color={color.textFaint} />
          <Text style={styles.questionCountText}>{category.questionCount} {t('quranQuiz.questions')}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={color.textFaint} />
    </Pressable>
  );
}

export default function QuizCategoriesScreen() {
  const { t } = useTranslation();
  const handleCategoryPress = (categoryId: string) => {
    // Juz category has its own dedicated learning screen with Learn/Quiz tabs
    if (categoryId === 'juz') {
      router.push('/quran/juz' as any);
      return;
    }
    // Surah Structure category has its own dedicated learning screen with Learn/Quiz tabs
    if (categoryId === 'surah_structure') {
      router.push('/quran/surah-learn' as any);
      return;
    }
    // Tajweed category has its own dedicated learning screen with Learn/Quiz tabs
    if (categoryId === 'tajweed') {
      router.push('/quran/tajweed-learn' as any);
      return;
    }
    router.push(`/quran/quiz/${categoryId}` as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={color.text} />
          </Pressable>
          <View style={styles.headerTitle}>
            <Text style={styles.title}>{t('quranQuiz.title')}</Text>
            <Text style={styles.titleArabic}>اختبارات القرآن</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        {/* Intro Card */}
        <View style={styles.introCard}>
          <Ionicons name="trophy" size={32} color={color.warning} />
          <Text style={styles.introTitle}>{t('quranQuiz.testYourKnowledge')}</Text>
          <Text style={styles.introDesc}>
            {t('quranQuiz.challengeDescription')}
          </Text>
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('quranQuiz.chooseCategory')}</Text>
          {QUIZ_CATEGORIES.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              onPress={() => handleCategoryPress(category.id)}
            />
          ))}
        </View>

        <View style={{ height: 100 }} />
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
    lineHeight: 27,
    fontSize: 16,
    color: color.warning,
    marginTop: 2,
  },
  introCard: {
    backgroundColor: color.surface,
    marginHorizontal: 20,
    borderRadius: radius.lg,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: withAlpha(color.warning, 0.19),
  },
  introTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: color.text,
    marginTop: 12,
  },
  introDesc: {
    fontSize: 14,
    color: color.textMuted,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  section: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: color.textMuted,
    marginBottom: 16,
  },
  categoryCard: {
    backgroundColor: color.surface,
    borderRadius: radius.lg,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryInfo: {
    flex: 1,
    marginLeft: 14,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: color.text,
  },
  categoryNameArabic: {
    fontFamily: font.arabic,
    lineHeight: 24,
    fontSize: 14,
    color: color.textFaint,
    marginTop: 2,
  },
  categoryDesc: {
    fontSize: 12,
    color: color.textMuted,
    marginTop: 4,
  },
  questionCount: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 4,
  },
  questionCountText: {
    fontSize: 12,
    color: color.textFaint,
  },
});

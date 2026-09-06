import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { useLocalizedContent } from '../../../src/hooks/useLocalizedContent';
import {
  TAJWEED_RULES,
  getAllTajweedCategories,
  getTajweedRulesByCategory,
} from '../../../src/data/arabic/quran/tajweed/rules';
import { TAJWEED_CATEGORY_COLORS } from '../../../src/data/arabic/quran/tajweed/colors';
import { useQuranStore } from '../../../src/stores/quranStore';
import { TajweedRuleId } from '../../../src/types/quran';
import {
  getTotalSets,
  getSetName,
  getQuestionsBySet,
} from '../../../src/data/arabic/quran/quizzes';
import { font, color, radius } from '../../../src/theme/tokens';
import { withAlpha } from '../../../src/components/ui/Primitives';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type TabType = 'learn' | 'quiz';

const CATEGORY_ARABIC: Record<string, string> = {
  noon_sakinah: 'النون الساكنة والتنوين',
  meem_sakinah: 'الميم الساكنة',
  madd: 'المد',
  qalqalah: 'القلقلة',
  ghunnah: 'الغنة',
  lam_shamsiyyah: 'اللام',
  recitation_styles: 'أساليب التلاوة',
  other: 'قواعد أخرى',
};

const CATEGORY_I18N_KEYS: Record<string, string> = {
  noon_sakinah: 'tajweedFeature.noonSakinah',
  meem_sakinah: 'tajweedFeature.meemSakinah',
  madd: 'tajweedFeature.madd',
  qalqalah: 'tajweedFeature.qalqalah',
  ghunnah: 'tajweedFeature.ghunnah',
  lam_shamsiyyah: 'tajweedFeature.lamRules',
  recitation_styles: 'tajweedFeature.recitationStyles',
  other: 'tajweedFeature.otherRules',
};

// Quiz Set Card Component
function QuizSetCard({
  setIndex,
  setName,
  questionCount,
  onPress,
}: {
  setIndex: number;
  setName: string;
  questionCount: number;
  onPress: () => void;
}) {
  const { t } = useTranslation();
  return (
    <Pressable style={styles.quizSetCard} onPress={onPress}>
      <View style={styles.quizSetIcon}>
        <Text style={styles.quizSetNumber}>{setIndex + 1}</Text>
      </View>
      <View style={styles.quizSetInfo}>
        <Text style={styles.quizSetName}>{setName}</Text>
        <Text style={styles.quizSetCount}>{questionCount} {t('quranQuiz.questions')}</Text>
      </View>
      <Ionicons name="play-circle" size={28} color={color.progress} />
    </Pressable>
  );
}

export default function TajweedLearnScreen() {
  const { t } = useTranslation();
  const { lc } = useLocalizedContent();
  const [activeTab, setActiveTab] = useState<TabType>('learn');
  const slideAnim = useRef(new Animated.Value(0)).current;
  const { isTajweedRuleLearned, isTajweedRuleMastered, progress } = useQuranStore();

  const categories = getAllTajweedCategories();

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    Animated.spring(slideAnim, {
      toValue: tab === 'learn' ? 0 : 1,
      useNativeDriver: true,
      friction: 8,
    }).start();
  };

  const handleRulePress = (ruleId: TajweedRuleId) => {
    router.push(`/quran/tajweed/${ruleId}` as any);
  };

  const handleQuizSetPress = (setIndex: number) => {
    router.push(`/quran/quiz/tajweed?setIndex=${setIndex}` as any);
  };

  const getTotalProgress = () => {
    const total = TAJWEED_RULES.length;
    const learned = progress.tajweedProgress.rulesLearned.length;
    return Math.round((learned / total) * 100);
  };

  const totalSets = getTotalSets('tajweed');

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={color.text} />
        </Pressable>
        <View style={styles.headerTitle}>
          <Text style={styles.title}>{t('tajweedFeature.title')}</Text>
          <Text style={styles.titleArabic}>أحكام التجويد</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <View style={styles.tabBackground}>
          <Animated.View
            style={[
              styles.tabIndicator,
              {
                transform: [
                  {
                    translateX: slideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, (SCREEN_WIDTH - 48) / 2],
                    }),
                  },
                ],
              },
            ]}
          />
          <Pressable
            style={styles.tab}
            onPress={() => handleTabChange('learn')}
          >
            <Ionicons
              name="school"
              size={18}
              color={activeTab === 'learn' ? '#ffffff' : '#64748b'}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === 'learn' && styles.tabTextActive,
              ]}
            >
              {t('tajweedFeature.learn')}
            </Text>
          </Pressable>
          <Pressable
            style={styles.tab}
            onPress={() => handleTabChange('quiz')}
          >
            <Ionicons
              name="help-circle"
              size={18}
              color={activeTab === 'quiz' ? '#ffffff' : '#64748b'}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === 'quiz' && styles.tabTextActive,
              ]}
            >
              {t('tajweedFeature.quiz')}
            </Text>
          </Pressable>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {activeTab === 'learn' ? (
          /* Learn Tab Content */
          <View style={styles.content}>
            {/* Progress Overview */}
            <View style={styles.progressCard}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressTitle}>{t('common.yourProgress')}</Text>
                <Text style={styles.progressPercent}>{getTotalProgress()}%</Text>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${getTotalProgress()}%` }]} />
              </View>
              <View style={styles.progressStats}>
                <View style={styles.progressStat}>
                  <Text style={styles.progressStatValue}>
                    {progress.tajweedProgress.rulesLearned.length}
                  </Text>
                  <Text style={styles.progressStatLabel}>{t('common.learned')}</Text>
                </View>
                <View style={styles.progressStat}>
                  <Text style={[styles.progressStatValue, { color: color.warning }]}>
                    {progress.tajweedProgress.rulesMastered.length}
                  </Text>
                  <Text style={styles.progressStatLabel}>{t('common.mastered')}</Text>
                </View>
                <View style={styles.progressStat}>
                  <Text style={[styles.progressStatValue, { color: color.accent }]}>
                    {TAJWEED_RULES.length}
                  </Text>
                  <Text style={styles.progressStatLabel}>{t('tajweedFeature.total')}</Text>
                </View>
              </View>
            </View>

            {/* Categories */}
            <View style={styles.categoriesContainer}>
              {categories.map((category) => {
                const rules = getTajweedRulesByCategory(category);
                const categoryArabic = CATEGORY_ARABIC[category] || '';
                const categoryI18nKey = CATEGORY_I18N_KEYS[category];
                const categoryColor = TAJWEED_CATEGORY_COLORS[category as keyof typeof TAJWEED_CATEGORY_COLORS] || '#64748b';

                return (
                  <View key={category} style={styles.categorySection}>
                    <View style={styles.categoryHeader}>
                      <View style={[styles.categoryIcon, { backgroundColor: categoryColor + '20' }]}>
                        <View style={[styles.categoryDot, { backgroundColor: categoryColor }]} />
                      </View>
                      <View style={styles.categoryTitles}>
                        <Text style={styles.categoryTitle}>{categoryI18nKey ? t(categoryI18nKey) : category}</Text>
                        <Text style={[styles.categoryArabic, { color: categoryColor }]}>
                          {categoryArabic}
                        </Text>
                      </View>
                    </View>

                    {/* Rules in Category */}
                    {rules.map((rule) => {
                      const isLearned = isTajweedRuleLearned(rule.id);
                      const isMastered = isTajweedRuleMastered(rule.id);

                      return (
                        <Pressable
                          key={rule.id}
                          style={[styles.ruleCard, isLearned && styles.ruleCardLearned]}
                          onPress={() => handleRulePress(rule.id)}
                        >
                          <View style={[styles.ruleColor, { backgroundColor: rule.colorCode }]} />
                          <View style={styles.ruleContent}>
                            <View style={styles.ruleHeader}>
                              <Text style={styles.ruleName}>{lc(rule.nameEnglish, rule.nameFrench)}</Text>
                              <Text style={styles.ruleArabic}>{rule.nameArabic}</Text>
                            </View>
                            <Text style={styles.ruleDesc} numberOfLines={2}>
                              {lc(rule.description, rule.descriptionFr)}
                            </Text>
                          </View>
                          <View style={styles.ruleStatus}>
                            {isMastered ? (
                              <Ionicons name="star" size={20} color={color.warning} />
                            ) : isLearned ? (
                              <Ionicons name="checkmark-circle" size={20} color={color.progress} />
                            ) : (
                              <Ionicons name="chevron-forward" size={20} color={color.textFaint} />
                            )}
                          </View>
                        </Pressable>
                      );
                    })}
                  </View>
                );
              })}
            </View>
          </View>
        ) : (
          /* Quiz Tab Content */
          <View style={styles.content}>
            {/* Quiz Header Card */}
            <View style={styles.quizHeaderCard}>
              <View style={styles.quizHeaderIcon}>
                <Ionicons name="trophy" size={40} color={color.warning} />
              </View>
              <Text style={styles.quizHeaderTitle}>{t('tajweedFeature.testYourTajweed')}</Text>
              <Text style={styles.quizHeaderSubtitle}>
                {t('tajweedFeature.challengeWith')} {totalSets} {t('tajweedFeature.setsOfQuestions')}
              </Text>
            </View>

            {/* Quiz Sets */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="list" size={20} color={color.progress} />
                <Text style={styles.sectionTitle}>{t('tajweedFeature.quizSets')}</Text>
              </View>
              <Text style={styles.sectionSubtitle}>
                {t('tajweedFeature.completeEachSet')}
              </Text>

              {Array.from({ length: totalSets }).map((_, index) => {
                const questions = getQuestionsBySet('tajweed', index);
                return (
                  <QuizSetCard
                    key={index}
                    setIndex={index}
                    setName={getSetName('tajweed', index)}
                    questionCount={questions.length}
                    onPress={() => handleQuizSetPress(index)}
                  />
                );
              })}
            </View>

            {/* Random Quiz Option */}
            <Pressable
              style={styles.randomQuizButton}
              onPress={() => router.push('/quran/quiz/tajweed' as any)}
            >
              <LinearGradient
                colors={[color.progress, color.accent]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.randomQuizGradient}
              >
                <Ionicons name="shuffle" size={24} color={color.text} />
                <View style={styles.randomQuizText}>
                  <Text style={styles.randomQuizTitle}>{t('quranQuiz.randomQuiz')}</Text>
                  <Text style={styles.randomQuizSubtitle}>
                    {t('quranQuiz.mixOfAll')}
                  </Text>
                </View>
                <Ionicons name="arrow-forward" size={24} color={color.text} />
              </LinearGradient>
            </Pressable>
          </View>
        )}

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
    color: color.progress,
    marginTop: 2,
  },
  tabContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  tabBackground: {
    flexDirection: 'row',
    backgroundColor: color.surface,
    borderRadius: radius.md,
    padding: 4,
    position: 'relative',
  },
  tabIndicator: {
    position: 'absolute',
    top: 4,
    left: 4,
    width: (SCREEN_WIDTH - 48) / 2 - 4,
    height: '100%',
    backgroundColor: color.progress,
    borderRadius: radius.sm,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
    zIndex: 1,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: color.textFaint,
  },
  tabTextActive: {
    color: color.text,
  },
  content: {
    paddingHorizontal: 20,
  },
  // Progress Card Styles
  progressCard: {
    backgroundColor: color.surface,
    borderRadius: radius.lg,
    padding: 20,
    marginBottom: 24,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    color: color.textMuted,
    fontSize: 14,
  },
  progressPercent: {
    color: color.progress,
    fontSize: 18,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    backgroundColor: color.surfaceRaised,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressFill: {
    height: '100%',
    backgroundColor: color.progress,
    borderRadius: 4,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  progressStat: {
    alignItems: 'center',
  },
  progressStatValue: {
    color: color.progress,
    fontSize: 20,
    fontWeight: 'bold',
  },
  progressStatLabel: {
    color: color.textFaint,
    fontSize: 12,
    marginTop: 2,
  },
  // Categories Styles
  categoriesContainer: {
    marginBottom: 24,
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  categoryTitles: {
    marginLeft: 12,
  },
  categoryTitle: {
    color: color.text,
    fontSize: 16,
    fontWeight: '600',
  },
  categoryArabic: {
    fontFamily: font.arabic,
    lineHeight: 24,
    fontSize: 14,
    marginTop: 2,
  },
  // Rule Card Styles
  ruleCard: {
    backgroundColor: color.surface,
    borderRadius: radius.md,
    padding: 14,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  ruleCardLearned: {
    borderWidth: 1,
    borderColor: withAlpha(color.progress, 0.19),
  },
  ruleColor: {
    width: 6,
    height: 40,
    borderRadius: 3,
    marginRight: 12,
  },
  ruleContent: {
    flex: 1,
  },
  ruleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ruleName: {
    color: color.text,
    fontSize: 15,
    fontWeight: '500',
  },
  ruleArabic: {
    fontFamily: font.arabic,
    lineHeight: 24,
    color: color.progress,
    fontSize: 14,
  },
  ruleDesc: {
    color: color.textFaint,
    fontSize: 12,
    marginTop: 4,
    lineHeight: 18,
  },
  ruleStatus: {
    marginLeft: 8,
  },
  // Section Styles
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: color.text,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: color.textFaint,
    marginBottom: 16,
  },
  // Quiz Header Card Styles
  quizHeaderCard: {
    backgroundColor: color.surface,
    borderRadius: radius.lg,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: withAlpha(color.warning, 0.19),
  },
  quizHeaderIcon: {
    marginBottom: 12,
  },
  quizHeaderTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: color.text,
    marginBottom: 8,
  },
  quizHeaderSubtitle: {
    fontSize: 14,
    color: color.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  // Quiz Set Card Styles
  quizSetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: color.surface,
    borderRadius: radius.md,
    padding: 16,
    marginBottom: 10,
  },
  quizSetIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: withAlpha(color.progress, 0.13),
    alignItems: 'center',
    justifyContent: 'center',
  },
  quizSetNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: color.progress,
  },
  quizSetInfo: {
    flex: 1,
    marginLeft: 14,
  },
  quizSetName: {
    fontSize: 16,
    fontWeight: '600',
    color: color.text,
  },
  quizSetCount: {
    fontSize: 13,
    color: color.textFaint,
    marginTop: 2,
  },
  // Random Quiz Button Styles
  randomQuizButton: {
    marginTop: 8,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  randomQuizGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 12,
  },
  randomQuizText: {
    flex: 1,
  },
  randomQuizTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: color.text,
  },
  randomQuizSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
});

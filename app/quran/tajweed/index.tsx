import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useLocalizedContent } from '../../../src/hooks/useLocalizedContent';
import { TAJWEED_RULES, getAllTajweedCategories, getTajweedRulesByCategory } from '../../../src/data/arabic/quran/tajweed/rules';
import { TAJWEED_CATEGORY_COLORS } from '../../../src/data/arabic/quran/tajweed/colors';
import { useQuranStore } from '../../../src/stores/quranStore';
import { TajweedRuleId } from '../../../src/types/quran';
import { font, color, radius } from '../../../src/theme/tokens';
import { withAlpha } from '../../../src/components/ui/Primitives';

const CATEGORY_KEYS: Record<string, { key: string; arabic: string }> = {
  noon_sakinah: { key: 'tajweedFeature.noonSakinah', arabic: 'النون الساكنة والتنوين' },
  meem_sakinah: { key: 'tajweedFeature.meemSakinah', arabic: 'الميم الساكنة' },
  madd: { key: 'tajweedFeature.madd', arabic: 'المد' },
  qalqalah: { key: 'tajweedFeature.qalqalah', arabic: 'القلقلة' },
  ghunnah: { key: 'tajweedFeature.ghunnah', arabic: 'الغنة' },
  lam_shamsiyyah: { key: 'tajweedFeature.lamRules', arabic: 'اللام' },
  recitation_styles: { key: 'tajweedFeature.recitationStyles', arabic: 'أساليب التلاوة' },
  other: { key: 'tajweedFeature.otherRules', arabic: 'قواعد أخرى' },
};

export default function TajweedRulesScreen() {
  const { t } = useTranslation();
  const { lc } = useLocalizedContent();
  const { isTajweedRuleLearned, isTajweedRuleMastered, progress } = useQuranStore();

  const categories = getAllTajweedCategories();

  const handleRulePress = (ruleId: TajweedRuleId) => {
    router.push(`/quran/tajweed/${ruleId}` as any);
  };

  const getTotalProgress = () => {
    const total = TAJWEED_RULES.length;
    const learned = progress.tajweedProgress.rulesLearned.length;
    return Math.round((learned / total) * 100);
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
            <Text style={styles.title}>{t('tajweedFeature.title')}</Text>
            <Text style={styles.titleArabic}>أحكام التجويد</Text>
          </View>
          <View style={styles.headerRight} />
        </View>

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
        <View style={[styles.categoriesContainer, { marginBottom: 100 }]}>
          {categories.map((category) => {
            const rules = getTajweedRulesByCategory(category);
            const categoryKeyInfo = CATEGORY_KEYS[category] || { key: category, arabic: '' };
            const categoryColor = TAJWEED_CATEGORY_COLORS[category as keyof typeof TAJWEED_CATEGORY_COLORS] || '#64748b';

            return (
              <View key={category} style={styles.categorySection}>
                <View style={styles.categoryHeader}>
                  <View style={[styles.categoryIcon, { backgroundColor: categoryColor + '20' }]}>
                    <View style={[styles.categoryDot, { backgroundColor: categoryColor }]} />
                  </View>
                  <View style={styles.categoryTitles}>
                    <Text style={styles.categoryTitle}>{t(categoryKeyInfo.key)}</Text>
                    <Text style={[styles.categoryArabic, { color: categoryColor }]}>
                      {categoryKeyInfo.arabic}
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
    color: color.text,
    fontSize: 20,
    fontWeight: 'bold',
  },
  titleArabic: {
    fontFamily: font.arabic,
    lineHeight: 34,
    color: color.progress,
    fontSize: 20,
    marginTop: 2,
  },
  headerRight: {
    width: 40,
  },
  progressCard: {
    backgroundColor: color.surface,
    marginHorizontal: 20,
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
  categoriesContainer: {
    paddingHorizontal: 20,
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
    lineHeight: 30,
    fontSize: 18,
    marginTop: 2,
  },
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
    lineHeight: 30,
    color: color.progress,
    fontSize: 18,
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
});

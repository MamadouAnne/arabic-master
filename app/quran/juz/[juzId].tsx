import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useLocalizedContent } from '../../../src/hooks/useLocalizedContent';
import { LinearGradient } from 'expo-linear-gradient';
import { JUZ_LESSONS, getJuzLesson } from '../../../src/data/arabic/quran/lessons/juzLessons';
import { font, color, radius } from '../../../src/theme/tokens';
import { withAlpha } from '../../../src/components/ui/Primitives';

// Expandable Section Component
function ExpandableSection({
  title,
  icon,
  iconColor,
  children,
  defaultExpanded = false,
}: {
  title: string;
  icon: string;
  iconColor: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <View style={styles.expandableSection}>
      <Pressable
        style={styles.expandableHeader}
        onPress={() => setExpanded(!expanded)}
      >
        <View style={[styles.sectionIcon, { backgroundColor: `${iconColor}20` }]}>
          <Ionicons name={icon as any} size={18} color={iconColor} />
        </View>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={color.textFaint}
        />
      </Pressable>
      {expanded && <View style={styles.expandableContent}>{children}</View>}
    </View>
  );
}

// Static Section Component (always expanded, no collapse button)
function StaticSection({
  title,
  icon,
  iconColor,
  children,
}: {
  title: string;
  icon: string;
  iconColor: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.expandableSection}>
      <View style={styles.staticHeader}>
        <View style={[styles.sectionIcon, { backgroundColor: `${iconColor}20` }]}>
          <Ionicons name={icon as any} size={18} color={iconColor} />
        </View>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <View style={styles.expandableContent}>{children}</View>
    </View>
  );
}

// Famous Verse Card
function VerseCard({
  verse,
}: {
  verse: { arabic: string; translation: string; translationFr?: string; reference: string };
}) {
  const { lc } = useLocalizedContent();
  return (
    <View style={styles.verseCard}>
      <Text style={styles.verseArabic}>{verse.arabic}</Text>
      <Text style={styles.verseTranslation}>"{lc(verse.translation, verse.translationFr)}"</Text>
      <View style={styles.verseReference}>
        <Ionicons name="bookmark" size={12} color={color.accent} />
        <Text style={styles.verseReferenceText}>{verse.reference}</Text>
      </View>
    </View>
  );
}

export default function JuzDetailScreen() {
  const { t } = useTranslation();
  const { lc, lcArray } = useLocalizedContent();
  const { juzId } = useLocalSearchParams<{ juzId: string }>();
  const juzNumber = parseInt(juzId || '1', 10);

  const juz = getJuzLesson(juzNumber);

  if (!juz) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{t('juzFeature.juzNotFound')}</Text>
          <Pressable style={styles.backButtonError} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>{t('common.goBack')}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return color.progress;
      case 'medium':
        return color.warning;
      case 'hard':
        return color.danger;
      default:
        return color.textMuted;
    }
  };

  const prevJuz = JUZ_LESSONS.find((j) => j.id === juzNumber - 1);
  const nextJuz = JUZ_LESSONS.find((j) => j.id === juzNumber + 1);

  const handleNavigation = (id: number) => {
    router.replace(`/quran/juz/${id}` as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={color.text} />
        </Pressable>
        <View style={styles.headerTitle}>
          <Text style={styles.headerText}>{t('juzFeature.juz')} {juz.id}</Text>
        </View>
        <View style={styles.headerNav}>
          <Pressable
            style={[styles.navArrow, !prevJuz && styles.navArrowDisabled]}
            onPress={() => prevJuz && handleNavigation(prevJuz.id)}
            disabled={!prevJuz}
          >
            <Ionicons
              name="chevron-back"
              size={20}
              color={prevJuz ? color.accent : color.borderStrong}
            />
          </Pressable>
          <Pressable
            style={[styles.navArrow, !nextJuz && styles.navArrowDisabled]}
            onPress={() => nextJuz && handleNavigation(nextJuz.id)}
            disabled={!nextJuz}
          >
            <Ionicons
              name="chevron-forward"
              size={20}
              color={nextJuz ? color.accent : color.borderStrong}
            />
          </Pressable>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Card */}
        <View style={styles.heroCard}>
          <LinearGradient
            colors={[color.progress, color.accent, color.accentStrong]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroGradient}
          >
            <View style={styles.heroNumber}>
              <Text style={styles.heroNumberText}>{juz.id}</Text>
            </View>
            <Text style={styles.heroNameEnglish}>{juz.nameEnglish}</Text>
            <Text style={styles.heroNameArabic}>{juz.nameArabic}</Text>
            {juz.alternativeName && (
              <Text style={styles.heroAltName}>{t('juzFeature.alsoKnownAs', { name: juz.alternativeName })}</Text>
            )}

            <View style={styles.heroDivider} />

            <View style={styles.heroStats}>
              <View style={styles.heroStat}>
                <Ionicons name="book" size={16} color="rgba(255,255,255,0.8)" />
                <Text style={styles.heroStatText}>
                  {juz.startSurah} {juz.startVerse} → {juz.endSurah} {juz.endVerse}
                </Text>
              </View>
              <View style={styles.heroStat}>
                <Ionicons name="layers" size={16} color="rgba(255,255,255,0.8)" />
                <Text style={styles.heroStatText}>{juz.totalSurahs} {t('juzFeature.surahs')}</Text>
              </View>
            </View>

            <View
              style={[
                styles.difficultyBadge,
                { backgroundColor: `${getDifficultyColor(juz.memorization.difficulty)}30` },
              ]}
            >
              <Ionicons
                name="fitness"
                size={14}
                color={getDifficultyColor(juz.memorization.difficulty)}
              />
              <Text
                style={[
                  styles.difficultyText,
                  { color: getDifficultyColor(juz.memorization.difficulty) },
                ]}
              >
                {t(`juzFeature.${juz.memorization.difficulty}`)} {t('juzFeature.difficulty')}
              </Text>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.content}>
          {/* Key Themes */}
          <ExpandableSection
            title={t('juzFeature.keyThemes')}
            icon="bulb"
            iconColor={color.warning}
            defaultExpanded={true}
          >
            <View style={styles.themesList}>
              {lcArray(juz.keyThemes, juz.keyThemesFr).map((theme, index) => (
                <View key={index} style={styles.themeItem}>
                  <View style={styles.themeBullet} />
                  <Text style={styles.themeText}>{theme}</Text>
                </View>
              ))}
            </View>
          </ExpandableSection>

          {/* Highlights */}
          <ExpandableSection
            title={t('juzFeature.highlights')}
            icon="star"
            iconColor={color.accent}
            defaultExpanded={true}
          >
            <View style={styles.highlightsList}>
              {lcArray(juz.highlights, juz.highlightsFr).map((highlight, index) => (
                <View key={index} style={styles.highlightCard}>
                  <Ionicons name="checkmark-circle" size={18} color={color.progress} />
                  <Text style={styles.highlightText}>{highlight}</Text>
                </View>
              ))}
            </View>
          </ExpandableSection>

          {/* Famous Verses */}
          {juz.famousVerses && juz.famousVerses.length > 0 && (
            <ExpandableSection
              title={t('juzFeature.famousVerses')}
              icon="heart"
              iconColor={color.accent}
              defaultExpanded={true}
            >
              {juz.famousVerses.map((verse, index) => (
                <VerseCard key={index} verse={verse} />
              ))}
            </ExpandableSection>
          )}

          {/* Stories */}
          {juz.stories && juz.stories.length > 0 && (
            <StaticSection
              title={t('juzFeature.storiesNarratives')}
              icon="book"
              iconColor={color.accent}
            >
              <View style={styles.storiesList}>
                {lcArray(juz.stories!, juz.storiesFr).map((story, index) => (
                  <View key={index} style={styles.storyItem}>
                    <View style={styles.storyIcon}>
                      <Ionicons name="chatbubbles" size={14} color={color.accent} />
                    </View>
                    <Text style={styles.storyText}>{story}</Text>
                  </View>
                ))}
              </View>
            </StaticSection>
          )}

          {/* Memorization Tips */}
          <StaticSection
            title={t('juzFeature.memorizationGuide')}
            icon="school"
            iconColor={color.progress}
          >
            <View style={styles.memorizationContent}>
              <View style={styles.memorizationHeader}>
                <View style={styles.memorizationStat}>
                  <Ionicons name="time" size={20} color={color.accent} />
                  <Text style={styles.memorizationStatValue}>
                    ~{juz.memorization.estimatedDays}
                  </Text>
                  <Text style={styles.memorizationStatLabel}>{t('juzFeature.days')}</Text>
                </View>
                <View style={styles.memorizationStatDivider} />
                <View style={styles.memorizationStat}>
                  <Ionicons
                    name="speedometer"
                    size={20}
                    color={getDifficultyColor(juz.memorization.difficulty)}
                  />
                  <Text style={styles.memorizationStatValue}>
                    {t(`juzFeature.${juz.memorization.difficulty}`)}
                  </Text>
                  <Text style={styles.memorizationStatLabel}>{t('juzFeature.level')}</Text>
                </View>
              </View>

              <Text style={styles.tipsTitle}>{t('juzFeature.tipsForSuccess')}</Text>
              {lcArray(juz.memorization.tips, juz.memorization.tipsFr).map((tip, index) => (
                <View key={index} style={styles.tipCard}>
                  <View style={styles.tipNumber}>
                    <Text style={styles.tipNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.tipText}>{tip}</Text>
                </View>
              ))}
            </View>
          </StaticSection>

          {/* Quick Navigation */}
          <View style={styles.quickNav}>
            <Text style={styles.quickNavTitle}>{t('juzFeature.quickNavigation')}</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.quickNavContent}
            >
              {JUZ_LESSONS.map((j) => (
                <Pressable
                  key={j.id}
                  style={[
                    styles.quickNavItem,
                    j.id === juz.id && styles.quickNavItemActive,
                  ]}
                  onPress={() => handleNavigation(j.id)}
                >
                  <Text
                    style={[
                      styles.quickNavText,
                      j.id === juz.id && styles.quickNavTextActive,
                    ]}
                  >
                    {j.id}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
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
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: color.text,
  },
  headerNav: {
    flexDirection: 'row',
    gap: 4,
  },
  navArrow: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: color.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navArrowDisabled: {
    opacity: 0.5,
  },
  heroCard: {
    marginHorizontal: 20,
    borderRadius: radius.xl,
    overflow: 'hidden',
    marginBottom: 24,
  },
  heroGradient: {
    padding: 24,
    alignItems: 'center',
  },
  heroNumber: {
    width: 64,
    height: 64,
    borderRadius: radius.xl,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  heroNumberText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: color.text,
  },
  heroNameEnglish: {
    fontSize: 24,
    fontWeight: 'bold',
    color: color.text,
  },
  heroNameArabic: {
    fontFamily: font.arabic,
    lineHeight: 62,
    fontSize: 36,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 8,
    fontWeight: '600',
  },
  heroAltName: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 8,
    fontStyle: 'italic',
  },
  heroDivider: {
    width: 80,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginVertical: 20,
  },
  heroStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 16,
  },
  heroStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroStatText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
  },
  difficultyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.xl,
    gap: 6,
  },
  difficultyText: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  content: {
    paddingHorizontal: 20,
  },
  expandableSection: {
    backgroundColor: color.surface,
    borderRadius: radius.lg,
    marginBottom: 12,
    overflow: 'hidden',
  },
  expandableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  staticHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 0,
  },
  sectionIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: color.text,
    marginLeft: 12,
  },
  expandableContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  themesList: {
    gap: 10,
  },
  themeItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  themeBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: color.warning,
    marginTop: 6,
  },
  themeText: {
    flex: 1,
    fontSize: 14,
    color: color.text,
    lineHeight: 22,
  },
  highlightsList: {
    gap: 10,
  },
  highlightCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: withAlpha(color.progress, 0.06),
    padding: 12,
    borderRadius: radius.md,
    gap: 10,
  },
  highlightText: {
    flex: 1,
    fontSize: 14,
    color: color.text,
    lineHeight: 20,
  },
  verseCard: {
    backgroundColor: color.bg,
    borderRadius: radius.lg,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: color.accent,
  },
  verseArabic: {
    fontFamily: font.arabic,
    fontSize: 28,
    color: color.text,
    textAlign: 'right',
    lineHeight: 48,
    marginBottom: 12,
    fontWeight: '500',
  },
  verseTranslation: {
    fontSize: 14,
    color: color.textMuted,
    fontStyle: 'italic',
    lineHeight: 22,
    marginBottom: 12,
  },
  verseReference: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  verseReferenceText: {
    fontSize: 12,
    color: color.accent,
    fontWeight: '500',
  },
  storiesList: {
    gap: 10,
  },
  storyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  storyIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: withAlpha(color.accent, 0.13),
    alignItems: 'center',
    justifyContent: 'center',
  },
  storyText: {
    flex: 1,
    fontSize: 14,
    color: color.text,
  },
  memorizationContent: {
    gap: 16,
  },
  memorizationHeader: {
    flexDirection: 'row',
    backgroundColor: color.bg,
    borderRadius: radius.md,
    padding: 16,
  },
  memorizationStat: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  memorizationStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: color.text,
    textTransform: 'capitalize',
  },
  memorizationStatLabel: {
    fontSize: 12,
    color: color.textFaint,
  },
  memorizationStatDivider: {
    width: 1,
    backgroundColor: color.surfaceRaised,
    marginHorizontal: 16,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: color.textMuted,
    marginTop: 8,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  tipNumber: {
    width: 24,
    height: 24,
    borderRadius: radius.sm,
    backgroundColor: withAlpha(color.progress, 0.13),
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipNumberText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: color.progress,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: color.text,
    lineHeight: 22,
  },
  quickNav: {
    marginTop: 24,
    marginBottom: 16,
  },
  quickNavTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: color.textFaint,
    marginBottom: 12,
  },
  quickNavContent: {
    gap: 8,
  },
  quickNavItem: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: color.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickNavItemActive: {
    backgroundColor: color.accent,
  },
  quickNavText: {
    fontSize: 14,
    fontWeight: '600',
    color: color.textFaint,
  },
  quickNavTextActive: {
    color: color.text,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 18,
    color: color.danger,
    marginBottom: 20,
  },
  backButtonError: {
    backgroundColor: color.accent,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: radius.md,
  },
  backButtonText: {
    color: color.text,
    fontWeight: '600',
  },
});

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useLocalizedContent } from '../../../../src/hooks/useLocalizedContent';
import { LinearGradient } from 'expo-linear-gradient';
import { JUZ_INTRO_LESSONS, JuzIntroLesson } from '../../../../src/data/arabic/quran/lessons/juzLessons';
import { font, color, radius } from '../../../../src/theme/tokens';
import { withAlpha } from '../../../../src/components/ui/Primitives';

// Content Block Component
function ContentBlock({ item }: { item: { type: string; text: string; textFr?: string; icon?: string } }) {
  const { t } = useTranslation();
  const { lc } = useLocalizedContent();
  const getBlockStyle = () => {
    switch (item.type) {
      case 'fact':
        return {
          bg: withAlpha(color.accent, 0.08),
          border: withAlpha(color.accent, 0.19),
          iconBg: withAlpha(color.accent, 0.13),
          iconColor: color.accent,
        };
      case 'tip':
        return {
          bg: withAlpha(color.progress, 0.08),
          border: withAlpha(color.progress, 0.19),
          iconBg: withAlpha(color.progress, 0.13),
          iconColor: color.progress,
        };
      case 'example':
        return {
          bg: withAlpha(color.warning, 0.08),
          border: withAlpha(color.warning, 0.19),
          iconBg: withAlpha(color.warning, 0.13),
          iconColor: color.warning,
        };
      default:
        return null;
    }
  };

  const style = getBlockStyle();

  if (!style) {
    // Regular text block
    return (
      <View style={styles.textBlock}>
        <Text style={styles.textContent}>{lc(item.text, item.textFr)}</Text>
      </View>
    );
  }

  // Styled block (fact, tip, example)
  return (
    <View
      style={[
        styles.styledBlock,
        { backgroundColor: style.bg, borderColor: style.border },
      ]}
    >
      <View style={[styles.blockIconContainer, { backgroundColor: style.iconBg }]}>
        <Ionicons
          name={item.icon as any || 'information-circle'}
          size={20}
          color={style.iconColor}
        />
      </View>
      <View style={styles.blockContent}>
        <Text style={styles.blockLabel}>
          {item.type === 'fact' ? t('juzFeature.didYouKnow') : item.type === 'tip' ? t('juzFeature.tip') : t('juzFeature.example')}
        </Text>
        <Text style={styles.blockText}>{lc(item.text, item.textFr)}</Text>
      </View>
    </View>
  );
}

export default function IntroLessonScreen() {
  const { t } = useTranslation();
  const { lc } = useLocalizedContent();
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();

  const lesson = JUZ_INTRO_LESSONS.find((l) => l.id === lessonId);

  if (!lesson) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{t('juzFeature.lessonNotFound')}</Text>
          <Pressable style={styles.backButtonError} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>{t('common.goBack')}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // Find current and next lesson
  const currentIndex = JUZ_INTRO_LESSONS.findIndex((l) => l.id === lessonId);
  const nextLesson = JUZ_INTRO_LESSONS[currentIndex + 1];
  const prevLesson = JUZ_INTRO_LESSONS[currentIndex - 1];

  const handleNext = () => {
    if (nextLesson) {
      router.replace(`/quran/juz/intro/${nextLesson.id}` as any);
    }
  };

  const handlePrev = () => {
    if (prevLesson) {
      router.replace(`/quran/juz/intro/${prevLesson.id}` as any);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={color.text} />
        </Pressable>
        <View style={styles.headerProgress}>
          <Text style={styles.headerProgressText}>
            {currentIndex + 1} / {JUZ_INTRO_LESSONS.length}
          </Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Title Card */}
        <View style={styles.titleCard}>
          <LinearGradient
            colors={['#3b82f6', '#1d4ed8']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.titleGradient}
          >
            <Text style={styles.lessonTitle}>{lc(lesson.title, lesson.titleFr)}</Text>
            <Text style={styles.lessonTitleArabic}>{lesson.titleArabic}</Text>
            <View style={styles.divider} />
            <Text style={styles.lessonDescription}>{lc(lesson.description, lesson.descriptionFr)}</Text>
          </LinearGradient>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {lesson.content.map((item, index) => (
            <ContentBlock key={index} item={item} />
          ))}
        </View>

        {/* Navigation Buttons */}
        <View style={styles.navigationContainer}>
          {prevLesson ? (
            <Pressable style={styles.navButtonPrev} onPress={handlePrev}>
              <Ionicons name="arrow-back" size={20} color={color.accent} />
              <View style={styles.navButtonContent}>
                <Text style={styles.navButtonLabel}>{t('common.previous')}</Text>
                <Text style={styles.navButtonTitle} numberOfLines={1}>
                  {lc(prevLesson.title, prevLesson.titleFr)}
                </Text>
              </View>
            </Pressable>
          ) : (
            <View style={styles.navButtonPlaceholder} />
          )}

          {nextLesson ? (
            <Pressable style={styles.navButtonNext} onPress={handleNext}>
              <View style={styles.navButtonContent}>
                <Text style={[styles.navButtonLabel, { textAlign: 'right' }]}>{t('common.next')}</Text>
                <Text style={[styles.navButtonTitle, { textAlign: 'right' }]} numberOfLines={1}>
                  {lc(nextLesson.title, nextLesson.titleFr)}
                </Text>
              </View>
              <Ionicons name="arrow-forward" size={20} color={color.text} />
            </Pressable>
          ) : (
            <Pressable
              style={styles.navButtonComplete}
              onPress={() => router.back()}
            >
              <Text style={styles.navButtonCompleteText}>{t('common.complete')}</Text>
              <Ionicons name="checkmark-circle" size={20} color={color.text} />
            </Pressable>
          )}
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  headerProgress: {
    backgroundColor: color.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.xl,
  },
  headerProgressText: {
    fontSize: 12,
    color: color.textMuted,
    fontWeight: '600',
  },
  titleCard: {
    marginHorizontal: 20,
    borderRadius: radius.xl,
    overflow: 'hidden',
    marginBottom: 24,
  },
  titleGradient: {
    padding: 24,
    alignItems: 'center',
  },
  lessonTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: color.text,
    textAlign: 'center',
  },
  lessonTitleArabic: {
    fontFamily: font.arabic,
    lineHeight: 34,
    fontSize: 20,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 8,
    fontWeight: '600',
  },
  divider: {
    width: 60,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    marginVertical: 16,
  },
  lessonDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    lineHeight: 20,
  },
  content: {
    paddingHorizontal: 20,
  },
  textBlock: {
    marginBottom: 20,
  },
  textContent: {
    fontSize: 16,
    color: color.text,
    lineHeight: 26,
  },
  styledBlock: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: radius.lg,
    borderWidth: 1,
    marginBottom: 16,
  },
  blockIconContainer: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  blockContent: {
    flex: 1,
    marginLeft: 12,
  },
  blockLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: color.textMuted,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  blockText: {
    fontSize: 14,
    color: color.text,
    lineHeight: 22,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 32,
    gap: 12,
  },
  navButtonPrev: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: color.surface,
    borderRadius: radius.md,
    padding: 14,
    gap: 10,
  },
  navButtonNext: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    backgroundColor: color.accent,
    borderRadius: radius.md,
    padding: 14,
    gap: 10,
  },
  navButtonPlaceholder: {
    flex: 1,
  },
  navButtonContent: {
    flex: 1,
  },
  navButtonLabel: {
    fontSize: 10,
    color: color.textFaint,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  navButtonTitle: {
    fontSize: 14,
    color: color.text,
    fontWeight: '600',
    marginTop: 2,
  },
  navButtonComplete: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: color.progress,
    borderRadius: radius.md,
    padding: 14,
    gap: 8,
  },
  navButtonCompleteText: {
    fontSize: 16,
    fontWeight: '600',
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

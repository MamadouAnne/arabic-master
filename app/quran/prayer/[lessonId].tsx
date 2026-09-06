import { useEffect, useCallback, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useLocalizedContent } from '../../../src/hooks/useLocalizedContent';
import { getPrayerLessonById, getAllPrayerLessons } from '../../../src/data/arabic/prayer';
import { usePrayerStore } from '../../../src/stores/prayerStore';
import { useArabicSpeech } from '../../../src/hooks/useArabicSpeech';
import { ShareToGroupModal } from '../../../src/components/community/ShareToGroupModal';
import type { SharedContent } from '../../../src/data/community/socialData';
import {
  PrayerContent,
  PrayerStepData,
  StepListItem,
  PrayerTimesRow,
} from '../../../src/types/prayer';
import { font, color as tk, radius } from '../../../src/theme/tokens';
import { withAlpha } from '../../../src/components/ui/Primitives';

export default function PrayerLessonScreen() {
  const { t } = useTranslation();
  const { lc } = useLocalizedContent();
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const { isCompleted, completeLesson, startLesson, setLastViewed } = usePrayerStore();
  const { speak, stop, isSpeaking } = useArabicSpeech();
  const [speakingText, setSpeakingText] = useState<string | null>(null);
  const [shareContent, setShareContent] = useState<SharedContent | null>(null);

  const lesson = lessonId ? getPrayerLessonById(lessonId) : undefined;
  const allLessons = getAllPrayerLessons();
  const currentIndex = lesson ? allLessons.findIndex((l) => l.id === lesson.id) : -1;
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < allLessons.length - 1;

  useEffect(() => {
    if (lessonId && lesson) {
      startLesson(lessonId);
      setLastViewed(lessonId);
    }
  }, [lessonId, lesson, startLesson, setLastViewed]);

  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  const handlePlayArabic = useCallback(
    async (text: string) => {
      if (isSpeaking) {
        await stop();
        setSpeakingText(null);
      } else {
        setSpeakingText(text);
        await speak(text);
        setSpeakingText(null);
      }
    },
    [isSpeaking, speak, stop]
  );

  const handleComplete = useCallback(() => {
    if (lessonId) {
      completeLesson(lessonId);
    }
  }, [lessonId, completeLesson]);

  const handlePrevious = useCallback(async () => {
    if (hasPrevious) {
      await stop();
      const prev = allLessons[currentIndex - 1];
      router.replace(`/quran/prayer/${prev.id}` as any);
    }
  }, [hasPrevious, currentIndex, allLessons, stop]);

  const handleNext = useCallback(async () => {
    if (hasNext) {
      await stop();
      const next = allLessons[currentIndex + 1];
      router.replace(`/quran/prayer/${next.id}` as any);
    }
  }, [hasNext, currentIndex, allLessons, stop]);

  if (!lesson) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={tk.progress} />
          <Text style={styles.loadingText}>{t('prayerFeature.loadingLesson')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const completed = lessonId ? isCompleted(lessonId) : false;

  // ====== Content Renderers ======

  const renderText = (block: PrayerContent & { type: 'text' }, index: number) => (
    <View key={index} style={styles.sectionBlock}>
      {block.title && <Text style={styles.sectionTitle}>{lc(block.title, block.titleFr)}</Text>}
      <Text style={styles.textContent}>{lc(block.content, block.contentFr)}</Text>
    </View>
  );

  const renderDescription = (block: PrayerContent & { type: 'description' }, index: number) => (
    <View key={index} style={styles.descriptionCard}>
      <View style={styles.descriptionBorder} />
      <View style={styles.descriptionContent}>
        {block.title && (
          <View style={styles.descriptionHeader}>
            <Text style={styles.descriptionTitle}>{lc(block.title, block.titleFr)}</Text>
            {block.titleArabic && (
              <Text style={styles.descriptionTitleArabic}>{block.titleArabic}</Text>
            )}
          </View>
        )}
        {block.arabic && (
          <Pressable onPress={() => handlePlayArabic(block.arabic!)}>
            <View style={styles.arabicTextContainer}>
              <Text style={styles.arabicText}>{block.arabic}</Text>
              <Ionicons
                name={isSpeaking && speakingText === block.arabic ? 'stop-circle' : 'volume-high'}
                size={18}
                color={tk.sacred}
              />
            </View>
          </Pressable>
        )}
        <Text style={styles.descriptionText}>{lc(block.content, block.contentFr)}</Text>
      </View>
    </View>
  );

  const renderRule = (block: PrayerContent & { type: 'rule' }, index: number) => (
    <View key={index} style={styles.ruleCard}>
      <View style={styles.ruleHeader}>
        <Ionicons name={(block.icon as any) || 'shield-checkmark'} size={18} color={tk.progress} />
        {block.title && <Text style={styles.ruleTitle}>{lc(block.title, block.titleFr)}</Text>}
      </View>
      <Text style={styles.ruleContent}>{lc(block.content, block.contentFr)}</Text>
    </View>
  );

  const renderNote = (block: PrayerContent & { type: 'note' }, index: number) => (
    <View key={index} style={styles.noteCard}>
      <View style={styles.noteHeader}>
        <Ionicons name="information-circle" size={18} color={tk.warning} />
        {block.title && <Text style={styles.noteTitle}>{lc(block.title, block.titleFr)}</Text>}
      </View>
      <Text style={styles.noteContent}>{lc(block.content, block.contentFr)}</Text>
    </View>
  );

  const renderTable = (block: PrayerContent & { type: 'table' }, index: number) => {
    const localizedHeaders = block.headersFr ? lc(block.headers, block.headersFr) : block.headers;
    const localizedRows = block.rowsFr ? lc(block.rows, block.rowsFr) : block.rows;
    return (
    <View key={index} style={styles.sectionBlock}>
      {block.title && (
        <View style={styles.tableTitleRow}>
          <Text style={styles.sectionTitle}>{lc(block.title, block.titleFr)}</Text>
          {block.titleArabic && (
            <Text style={styles.sectionTitleArabic}>{block.titleArabic}</Text>
          )}
        </View>
      )}
      <View style={styles.tableContainer}>
        <View style={styles.tableHeaderRow}>
          {localizedHeaders.map((header, i) => (
            <View key={i} style={[styles.tableCell, { flex: i === 0 ? 1.2 : 1 }]}>
              <Text style={styles.tableHeaderText}>{header}</Text>
            </View>
          ))}
        </View>
        {localizedRows.map((row, rowIdx) => (
          <View
            key={rowIdx}
            style={[
              styles.tableRow,
              rowIdx % 2 === 0 && styles.tableRowAlt,
            ]}
          >
            {row.map((cell, cellIdx) => (
              <View key={cellIdx} style={[styles.tableCell, { flex: cellIdx === 0 ? 1.2 : 1 }]}>
                <Text style={styles.tableCellText}>{cell}</Text>
              </View>
            ))}
          </View>
        ))}
      </View>
    </View>
    );
  };

  const renderExamplesGrid = (block: PrayerContent & { type: 'examples_grid' }, index: number) => (
    <View key={index} style={styles.sectionBlock}>
      {block.title && (
        <View style={styles.tableTitleRow}>
          <Text style={styles.sectionTitle}>{lc(block.title, block.titleFr)}</Text>
          {block.titleArabic && (
            <Text style={styles.sectionTitleArabic}>{block.titleArabic}</Text>
          )}
        </View>
      )}
      <View style={styles.examplesContainer}>
        {block.examples.map((example, i) => (
          <Pressable
            key={i}
            style={styles.exampleCard}
            onPress={() => handlePlayArabic(example.arabic)}
          >
            <View style={styles.exampleArabicRow}>
              <Text style={styles.exampleArabic}>{example.arabic}</Text>
              <Ionicons
                name={isSpeaking && speakingText === example.arabic ? 'stop-circle' : 'volume-high'}
                size={14}
                color={tk.sacred}
              />
            </View>
            <Text style={styles.exampleTransliteration}>{example.transliteration}</Text>
            <Text style={styles.exampleTranslation}>{lc(example.translation, example.translationFr)}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );

  const renderPrayerStep = (block: PrayerContent & { type: 'prayer_step' }, index: number) => {
    const step = block.step;
    return (
      <View key={index} style={styles.prayerStepCard}>
        {/* Step Header */}
        <View style={styles.prayerStepHeader}>
          <View style={styles.prayerStepBadge}>
            <Text style={styles.prayerStepBadgeText}>{step.stepNumber}</Text>
          </View>
          <View style={styles.prayerStepNames}>
            <Text style={styles.prayerStepName}>{lc(step.positionName, step.positionNameFr)}</Text>
            <Text style={styles.prayerStepNameArabic}>{step.positionNameArabic}</Text>
          </View>
          {step.isSunnah && (
            <View style={styles.sunnahBadge}>
              <Text style={styles.sunnahBadgeText}>{t('prayerFeature.sunnah')}</Text>
            </View>
          )}
        </View>

        {/* Arabic Text */}
        <Pressable
          style={styles.prayerStepArabicContainer}
          onPress={() => handlePlayArabic(step.arabic)}
        >
          <Text style={styles.prayerStepArabic}>{step.arabic}</Text>
          <Ionicons
            name={isSpeaking && speakingText === step.arabic ? 'stop-circle' : 'volume-high'}
            size={20}
            color={tk.sacred}
            style={styles.prayerStepSpeaker}
          />
        </Pressable>

        {/* Transliteration */}
        <Text style={styles.prayerStepTransliteration}>{step.transliteration}</Text>

        {/* Translation */}
        <Text style={styles.prayerStepTranslation}>"{lc(step.translation, step.translationFr)}"</Text>

        {/* Repetitions */}
        {step.repetitions && (
          <View style={styles.repetitionBadge}>
            <Ionicons name="repeat" size={14} color={tk.progress} />
            <Text style={styles.repetitionText}>{t('prayerFeature.repeat')} {step.repetitions} {t('prayerFeature.times')}</Text>
          </View>
        )}

        {/* Instruction */}
        {step.instruction && (
          <View style={styles.instructionBox}>
            <Ionicons name="information-circle" size={16} color={tk.textMuted} />
            <Text style={styles.instructionText}>{lc(step.instruction, step.instructionFr)}</Text>
          </View>
        )}
      </View>
    );
  };

  const renderStepList = (block: PrayerContent & { type: 'step_list' }, index: number) => (
    <View key={index} style={styles.sectionBlock}>
      {block.title && (
        <View style={styles.tableTitleRow}>
          <Text style={styles.sectionTitle}>{lc(block.title, block.titleFr)}</Text>
          {block.titleArabic && (
            <Text style={styles.sectionTitleArabic}>{block.titleArabic}</Text>
          )}
        </View>
      )}
      <View style={styles.stepListContainer}>
        {block.steps.map((step, i) => (
          <View key={i} style={styles.stepListItem}>
            {/* Connecting Line */}
            {i < block.steps.length - 1 && <View style={styles.stepListLine} />}
            {/* Step Number */}
            <View style={styles.stepListNumber}>
              <Text style={styles.stepListNumberText}>{step.stepNumber}</Text>
            </View>
            {/* Step Content */}
            <View style={styles.stepListContent}>
              <View style={styles.stepListTitleRow}>
                <Text style={styles.stepListTitle}>{lc(step.title, step.titleFr)}</Text>
                {step.titleArabic && (
                  <Text style={styles.stepListTitleArabic}>{step.titleArabic}</Text>
                )}
              </View>
              <Text style={styles.stepListDescription}>{lc(step.description, step.descriptionFr)}</Text>
              {step.arabic && (
                <Pressable
                  onPress={() => handlePlayArabic(step.arabic!)}
                  style={styles.stepListArabicContainer}
                >
                  <Text style={styles.stepListArabic}>{step.arabic}</Text>
                  <Ionicons
                    name={isSpeaking && speakingText === step.arabic ? 'stop-circle' : 'volume-high'}
                    size={14}
                    color={tk.sacred}
                  />
                </Pressable>
              )}
              {step.transliteration && (
                <Text style={styles.stepListTransliteration}>{step.transliteration}</Text>
              )}
              {step.translation && (
                <Text style={styles.stepListTranslation}>{lc(step.translation, step.translationFr)}</Text>
              )}
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  const renderPrayerTimesTable = (
    block: PrayerContent & { type: 'prayer_times_table' },
    index: number
  ) => (
    <View key={index} style={styles.sectionBlock}>
      {block.title && (
        <View style={styles.tableTitleRow}>
          <Text style={styles.sectionTitle}>{lc(block.title, block.titleFr)}</Text>
          {block.titleArabic && (
            <Text style={styles.sectionTitleArabic}>{block.titleArabic}</Text>
          )}
        </View>
      )}
      <View style={styles.prayerTimesContainer}>
        {block.rows.map((row, i) => {
          const colors = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899'];
          const color = colors[i % colors.length];
          return (
            <View key={i} style={[styles.prayerTimeCard, { borderLeftColor: color }]}>
              <View style={styles.prayerTimeHeader}>
                <Text style={[styles.prayerTimeName, { color }]}>{lc(row.name, row.nameFr)}</Text>
                <Text style={styles.prayerTimeArabic}>{row.nameArabic}</Text>
                <View style={[styles.rakaatBadge, { backgroundColor: color + '20' }]}>
                  <Text style={[styles.rakaatText, { color }]}>{row.rakaat} {t('prayerFeature.rakaat')}</Text>
                </View>
              </View>
              <View style={styles.prayerTimeDetails}>
                <View style={styles.prayerTimeDetail}>
                  <Ionicons name="time-outline" size={12} color={tk.textFaint} />
                  <Text style={styles.prayerTimeDetailText}>{lc(row.time, row.timeFr)}</Text>
                </View>
                <View style={styles.prayerTimeDetail}>
                  <Ionicons name="volume-medium-outline" size={12} color={tk.textFaint} />
                  <Text style={styles.prayerTimeDetailText}>{lc(row.recitation, row.recitationFr)}</Text>
                </View>
              </View>
              {(row.sunnahBefore || row.sunnahAfter) && (
                <View style={styles.sunnahRow}>
                  {row.sunnahBefore && (
                    <Text style={styles.sunnahText}>
                      {row.sunnahBefore} {t('prayerFeature.sunnahBefore')}
                    </Text>
                  )}
                  {row.sunnahAfter && (
                    <Text style={styles.sunnahText}>
                      {row.sunnahAfter} {t('prayerFeature.sunnahAfter')}
                    </Text>
                  )}
                </View>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );

  const renderContent = (block: PrayerContent, index: number) => {
    switch (block.type) {
      case 'text':
        return renderText(block, index);
      case 'description':
        return renderDescription(block, index);
      case 'rule':
        return renderRule(block, index);
      case 'note':
        return renderNote(block, index);
      case 'table':
        return renderTable(block, index);
      case 'examples_grid':
        return renderExamplesGrid(block, index);
      case 'prayer_step':
        return renderPrayerStep(block, index);
      case 'step_list':
        return renderStepList(block, index);
      case 'prayer_times_table':
        return renderPrayerTimesTable(block, index);
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={tk.text} />
        </Pressable>
        <View style={styles.headerTitle}>
          <Text style={styles.headerTitleText} numberOfLines={1}>
            {lc(lesson.title, lesson.titleFr)}
          </Text>
          <Text style={styles.headerTitleArabic}>{lesson.titleArabic}</Text>
        </View>
        <Pressable
          style={styles.backButton}
          onPress={() => setShareContent({
            kind: 'prayer',
            arabic: lesson.titleArabic,
            translation: lc(lesson.description, lesson.descriptionFr),
            audioText: lesson.titleArabic,
            ref: lc(lesson.title, lesson.titleFr),
            route: `/quran/prayer/${lesson.id}`,
          })}
          accessibilityLabel={t('community.shareToGroup', { defaultValue: 'Share to group' })}
        >
          <Ionicons name="paper-plane-outline" size={22} color={tk.accent} />
        </Pressable>
        <View style={styles.headerNav}>
          <Pressable
            style={[styles.navButton, !hasPrevious && styles.navButtonDisabled]}
            onPress={handlePrevious}
            disabled={!hasPrevious}
          >
            <Ionicons
              name="chevron-back"
              size={18}
              color={hasPrevious ? tk.accent : tk.borderStrong}
            />
          </Pressable>
          <Text style={styles.lessonNumber}>
            {lesson.order}/{allLessons.length}
          </Text>
          <Pressable
            style={[styles.navButton, !hasNext && styles.navButtonDisabled]}
            onPress={handleNext}
            disabled={!hasNext}
          >
            <Ionicons
              name="chevron-forward"
              size={18}
              color={hasNext ? tk.accent : tk.borderStrong}
            />
          </Pressable>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.contentContainer}
        contentContainerStyle={styles.contentPadding}
        showsVerticalScrollIndicator={false}
      >
        {lesson.content.map((block, index) => renderContent(block, index))}

        {/* Complete Button */}
        <Pressable
          style={[styles.completeButton, completed && styles.completeButtonActive]}
          onPress={handleComplete}
        >
          <Ionicons
            name={completed ? 'checkmark-circle' : 'checkmark-circle-outline'}
            size={22}
            color={completed ? '#10b981' : '#94a3b8'}
          />
          <Text
            style={[
              styles.completeButtonText,
              completed && styles.completeButtonTextActive,
            ]}
          >
            {completed ? t('common.completed') : t('prayerFeature.markComplete')}
          </Text>
        </Pressable>

        <View style={{ height: 40 }} />
      </ScrollView>

      <ShareToGroupModal
        visible={!!shareContent}
        content={shareContent}
        onClose={() => setShareContent(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tk.bg,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingText: {
    color: tk.textMuted,
    fontSize: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: tk.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    marginLeft: 4,
  },
  headerTitleText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: tk.text,
  },
  headerTitleArabic: {
    fontFamily: font.arabic,
    lineHeight: 28,
    fontSize: 16,
    color: tk.sacred,
    marginTop: 1,
  },
  headerNav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  navButton: {
    width: 30,
    height: 30,
    borderRadius: radius.lg,
    backgroundColor: tk.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonDisabled: {
    opacity: 0.4,
  },
  lessonNumber: {
    color: tk.textFaint,
    fontSize: 12,
    minWidth: 32,
    textAlign: 'center',
  },
  contentContainer: {
    flex: 1,
  },
  contentPadding: {
    padding: 16,
  },

  // Section Block
  sectionBlock: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: tk.progress,
    marginBottom: 10,
  },
  sectionTitleArabic: {
    fontFamily: font.arabic,
    lineHeight: 30,
    fontSize: 18,
    color: tk.sacred,
    marginBottom: 10,
  },
  textContent: {
    fontSize: 14,
    color: tk.text,
    lineHeight: 22,
  },

  // Description Card
  descriptionCard: {
    flexDirection: 'row',
    backgroundColor: tk.surface,
    borderRadius: radius.md,
    marginBottom: 16,
    overflow: 'hidden',
  },
  descriptionBorder: {
    width: 4,
    backgroundColor: tk.progress,
  },
  descriptionContent: {
    flex: 1,
    padding: 16,
  },
  descriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: tk.text,
  },
  descriptionTitleArabic: {
    fontFamily: font.arabic,
    lineHeight: 30,
    fontSize: 18,
    color: tk.sacred,
  },
  arabicTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tk.bg,
    borderRadius: radius.sm,
    padding: 12,
    marginBottom: 10,
    gap: 8,
  },
  arabicText: {
    fontFamily: font.arabic,
    fontSize: 24,
    color: tk.sacred,
    textAlign: 'center',
    lineHeight: 40,
    flex: 1,
  },
  descriptionText: {
    fontSize: 14,
    color: tk.textMuted,
    lineHeight: 22,
  },

  // Rule Card
  ruleCard: {
    backgroundColor: withAlpha(tk.progress, 0.06),
    borderRadius: radius.md,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: withAlpha(tk.progress, 0.19),
  },
  ruleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  ruleTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: tk.progress,
  },
  ruleContent: {
    fontSize: 14,
    color: tk.text,
    lineHeight: 22,
  },

  // Note Card
  noteCard: {
    backgroundColor: withAlpha(tk.warning, 0.06),
    borderRadius: radius.md,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: withAlpha(tk.warning, 0.19),
  },
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  noteTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: tk.warning,
  },
  noteContent: {
    fontSize: 14,
    color: tk.text,
    lineHeight: 22,
  },

  // Table
  tableTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
    flexWrap: 'wrap',
  },
  tableContainer: {
    backgroundColor: tk.surface,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: tk.surfaceRaised,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: tk.border,
  },
  tableRowAlt: {
    backgroundColor: withAlpha(tk.surface, 0.5),
  },
  tableCell: {
    flex: 1,
    paddingHorizontal: 4,
    overflow: 'hidden',
  },
  tableHeaderText: {
    fontSize: 11,
    fontWeight: '700',
    color: tk.textMuted,
  },
  tableCellText: {
    fontSize: 11,
    color: tk.textMuted,
    lineHeight: 16,
  },

  // Examples Grid
  examplesContainer: {
    gap: 10,
  },
  exampleCard: {
    backgroundColor: tk.surface,
    borderRadius: radius.sm,
    padding: 14,
  },
  exampleArabicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 6,
  },
  exampleArabic: {
    fontFamily: font.arabic,
    fontSize: 22,
    color: tk.sacred,
    textAlign: 'center',
    lineHeight: 36,
  },
  exampleTransliteration: {
    fontSize: 13,
    fontStyle: 'italic',
    color: tk.textMuted,
    textAlign: 'center',
    marginBottom: 4,
  },
  exampleTranslation: {
    fontSize: 13,
    color: tk.textMuted,
    textAlign: 'center',
  },

  // Prayer Step Card
  prayerStepCard: {
    backgroundColor: tk.surface,
    borderRadius: radius.md,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: tk.border,
  },
  prayerStepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  prayerStepBadge: {
    width: 36,
    height: 36,
    borderRadius: radius.lg,
    backgroundColor: withAlpha(tk.progress, 0.13),
    alignItems: 'center',
    justifyContent: 'center',
  },
  prayerStepBadgeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: tk.progress,
  },
  prayerStepNames: {
    flex: 1,
  },
  prayerStepName: {
    fontSize: 15,
    fontWeight: '700',
    color: tk.text,
  },
  prayerStepNameArabic: {
    fontFamily: font.arabic,
    lineHeight: 30,
    fontSize: 18,
    color: tk.sacred,
    marginTop: 1,
  },
  sunnahBadge: {
    backgroundColor: withAlpha(tk.sacred, 0.13),
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  sunnahBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: tk.sacred,
    letterSpacing: 0.5,
  },
  prayerStepArabicContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tk.bg,
    borderRadius: radius.sm,
    padding: 16,
    marginBottom: 10,
    gap: 10,
  },
  prayerStepArabic: {
    fontFamily: font.arabic,
    fontSize: 28,
    color: tk.sacred,
    textAlign: 'center',
    lineHeight: 48,
    flex: 1,
  },
  prayerStepSpeaker: {
    padding: 4,
  },
  prayerStepTransliteration: {
    fontSize: 14,
    fontStyle: 'italic',
    color: tk.textMuted,
    textAlign: 'center',
    marginBottom: 6,
  },
  prayerStepTranslation: {
    fontSize: 14,
    color: tk.text,
    textAlign: 'center',
    marginBottom: 10,
  },
  repetitionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: withAlpha(tk.progress, 0.08),
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radius.sm,
    alignSelf: 'center',
    marginBottom: 10,
  },
  repetitionText: {
    fontSize: 12,
    fontWeight: '600',
    color: tk.progress,
  },
  instructionBox: {
    flexDirection: 'row',
    backgroundColor: tk.surfaceRaised,
    borderRadius: radius.sm,
    padding: 12,
    gap: 8,
  },
  instructionText: {
    fontSize: 13,
    color: tk.textMuted,
    lineHeight: 20,
    flex: 1,
  },

  // Step List
  stepListContainer: {
    paddingLeft: 4,
  },
  stepListItem: {
    flexDirection: 'row',
    marginBottom: 6,
    position: 'relative',
  },
  stepListLine: {
    position: 'absolute',
    left: 15,
    top: 32,
    bottom: -6,
    width: 2,
    backgroundColor: tk.surfaceRaised,
  },
  stepListNumber: {
    width: 32,
    height: 32,
    borderRadius: radius.lg,
    backgroundColor: withAlpha(tk.progress, 0.13),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  stepListNumberText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: tk.progress,
  },
  stepListContent: {
    flex: 1,
    backgroundColor: tk.surface,
    borderRadius: radius.sm,
    padding: 12,
  },
  stepListTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  stepListTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: tk.text,
  },
  stepListTitleArabic: {
    fontFamily: font.arabic,
    lineHeight: 28,
    fontSize: 16,
    color: tk.sacred,
  },
  stepListDescription: {
    fontSize: 13,
    color: tk.textMuted,
    lineHeight: 20,
  },
  stepListArabicContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    backgroundColor: tk.bg,
    borderRadius: 6,
    padding: 8,
  },
  stepListArabic: {
    fontFamily: font.arabic,
    fontSize: 20,
    color: tk.sacred,
    flex: 1,
    lineHeight: 36,
  },
  stepListTransliteration: {
    fontSize: 12,
    fontStyle: 'italic',
    color: tk.textMuted,
    marginTop: 4,
  },
  stepListTranslation: {
    fontSize: 12,
    color: tk.textMuted,
    marginTop: 2,
  },

  // Prayer Times Table
  prayerTimesContainer: {
    gap: 10,
  },
  prayerTimeCard: {
    backgroundColor: tk.surface,
    borderRadius: radius.sm,
    padding: 14,
    borderLeftWidth: 4,
  },
  prayerTimeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  prayerTimeName: {
    fontSize: 16,
    fontWeight: '700',
  },
  prayerTimeArabic: {
    fontFamily: font.arabic,
    lineHeight: 30,
    fontSize: 18,
    color: tk.sacred,
  },
  rakaatBadge: {
    marginLeft: 'auto',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  rakaatText: {
    fontSize: 11,
    fontWeight: '700',
  },
  prayerTimeDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    rowGap: 4,
  },
  prayerTimeDetail: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 4,
    flex: 1,
    minWidth: '45%' as any,
  },
  prayerTimeDetailText: {
    fontSize: 12,
    color: tk.textMuted,
    flexShrink: 1,
  },
  sunnahRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    rowGap: 4,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: tk.border,
  },
  sunnahText: {
    fontSize: 11,
    color: tk.progress,
    fontStyle: 'italic',
    flexShrink: 1,
  },

  // Complete Button
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tk.surface,
    borderRadius: radius.md,
    paddingVertical: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: tk.border,
    marginTop: 8,
  },
  completeButtonActive: {
    backgroundColor: withAlpha(tk.progress, 0.13),
    borderColor: withAlpha(tk.progress, 0.25),
  },
  completeButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: tk.textMuted,
  },
  completeButtonTextActive: {
    color: tk.progress,
  },
});

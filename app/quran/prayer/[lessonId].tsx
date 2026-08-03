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
import {
  PrayerContent,
  PrayerStepData,
  StepListItem,
  PrayerTimesRow,
} from '../../../src/types/prayer';

export default function PrayerLessonScreen() {
  const { t } = useTranslation();
  const { lc } = useLocalizedContent();
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const { isCompleted, completeLesson, startLesson, setLastViewed } = usePrayerStore();
  const { speak, stop, isSpeaking } = useArabicSpeech();
  const [speakingText, setSpeakingText] = useState<string | null>(null);

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
          <ActivityIndicator size="large" color="#10b981" />
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
                color="#D4AF37"
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
        <Ionicons name={(block.icon as any) || 'shield-checkmark'} size={18} color="#10b981" />
        {block.title && <Text style={styles.ruleTitle}>{lc(block.title, block.titleFr)}</Text>}
      </View>
      <Text style={styles.ruleContent}>{lc(block.content, block.contentFr)}</Text>
    </View>
  );

  const renderNote = (block: PrayerContent & { type: 'note' }, index: number) => (
    <View key={index} style={styles.noteCard}>
      <View style={styles.noteHeader}>
        <Ionicons name="information-circle" size={18} color="#f59e0b" />
        {block.title && <Text style={styles.noteTitle}>{lc(block.title, block.titleFr)}</Text>}
      </View>
      <Text style={styles.noteContent}>{lc(block.content, block.contentFr)}</Text>
    </View>
  );

  const renderTable = (block: PrayerContent & { type: 'table' }, index: number) => {
    const localizedHeaders = block.headersFr ? lc(block.headers, block.headersFr) : block.headers;
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
        {block.rows.map((row, rowIdx) => (
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
                color="#D4AF37"
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
              <Text style={styles.sunnahBadgeText}>SUNNAH</Text>
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
            color="#D4AF37"
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
            <Ionicons name="repeat" size={14} color="#10b981" />
            <Text style={styles.repetitionText}>{t('prayerFeature.repeat')} {step.repetitions} {t('prayerFeature.times')}</Text>
          </View>
        )}

        {/* Instruction */}
        {step.instruction && (
          <View style={styles.instructionBox}>
            <Ionicons name="information-circle" size={16} color="#94a3b8" />
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
                    color="#D4AF37"
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
                  <Text style={[styles.rakaatText, { color }]}>{row.rakaat} rak'ahs</Text>
                </View>
              </View>
              <View style={styles.prayerTimeDetails}>
                <View style={styles.prayerTimeDetail}>
                  <Ionicons name="time-outline" size={12} color="#64748b" />
                  <Text style={styles.prayerTimeDetailText}>{lc(row.time, row.timeFr)}</Text>
                </View>
                <View style={styles.prayerTimeDetail}>
                  <Ionicons name="volume-medium-outline" size={12} color="#64748b" />
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
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </Pressable>
        <View style={styles.headerTitle}>
          <Text style={styles.headerTitleText} numberOfLines={1}>
            {lc(lesson.title, lesson.titleFr)}
          </Text>
          <Text style={styles.headerTitleArabic}>{lesson.titleArabic}</Text>
        </View>
        <View style={styles.headerNav}>
          <Pressable
            style={[styles.navButton, !hasPrevious && styles.navButtonDisabled]}
            onPress={handlePrevious}
            disabled={!hasPrevious}
          >
            <Ionicons
              name="chevron-back"
              size={18}
              color={hasPrevious ? '#10b981' : '#334155'}
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
              color={hasNext ? '#10b981' : '#334155'}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingText: {
    color: '#94a3b8',
    fontSize: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
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
    color: '#ffffff',
  },
  headerTitleArabic: {
    fontSize: 13,
    color: '#D4AF37',
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
    borderRadius: 15,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonDisabled: {
    opacity: 0.4,
  },
  lessonNumber: {
    color: '#64748b',
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
    color: '#10b981',
    marginBottom: 10,
  },
  sectionTitleArabic: {
    fontSize: 14,
    color: '#D4AF37',
    marginBottom: 10,
  },
  textContent: {
    fontSize: 14,
    color: '#e2e8f0',
    lineHeight: 22,
  },

  // Description Card
  descriptionCard: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  descriptionBorder: {
    width: 4,
    backgroundColor: '#10b981',
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
    color: '#ffffff',
  },
  descriptionTitleArabic: {
    fontSize: 14,
    color: '#D4AF37',
  },
  arabicTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0f172a',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    gap: 8,
  },
  arabicText: {
    fontSize: 20,
    color: '#D4AF37',
    textAlign: 'center',
    lineHeight: 34,
    flex: 1,
  },
  descriptionText: {
    fontSize: 14,
    color: '#cbd5e1',
    lineHeight: 22,
  },

  // Rule Card
  ruleCard: {
    backgroundColor: '#10b98110',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#10b98130',
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
    color: '#10b981',
  },
  ruleContent: {
    fontSize: 14,
    color: '#e2e8f0',
    lineHeight: 22,
  },

  // Note Card
  noteCard: {
    backgroundColor: '#f59e0b10',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f59e0b30',
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
    color: '#f59e0b',
  },
  noteContent: {
    fontSize: 14,
    color: '#e2e8f0',
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
    backgroundColor: '#1e293b',
    borderRadius: 12,
    overflow: 'hidden',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#334155',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  tableRowAlt: {
    backgroundColor: '#1e293b80',
  },
  tableCell: {
    flex: 1,
    paddingHorizontal: 4,
    overflow: 'hidden',
  },
  tableHeaderText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94a3b8',
  },
  tableCellText: {
    fontSize: 11,
    color: '#cbd5e1',
    lineHeight: 16,
  },

  // Examples Grid
  examplesContainer: {
    gap: 10,
  },
  exampleCard: {
    backgroundColor: '#1e293b',
    borderRadius: 10,
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
    fontSize: 18,
    color: '#D4AF37',
    textAlign: 'center',
    lineHeight: 30,
  },
  exampleTransliteration: {
    fontSize: 13,
    fontStyle: 'italic',
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 4,
  },
  exampleTranslation: {
    fontSize: 13,
    color: '#cbd5e1',
    textAlign: 'center',
  },

  // Prayer Step Card
  prayerStepCard: {
    backgroundColor: '#1e293b',
    borderRadius: 14,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
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
    borderRadius: 18,
    backgroundColor: '#10b98120',
    alignItems: 'center',
    justifyContent: 'center',
  },
  prayerStepBadgeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10b981',
  },
  prayerStepNames: {
    flex: 1,
  },
  prayerStepName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
  prayerStepNameArabic: {
    fontSize: 14,
    color: '#D4AF37',
    marginTop: 1,
  },
  sunnahBadge: {
    backgroundColor: '#D4AF3720',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  sunnahBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#D4AF37',
    letterSpacing: 0.5,
  },
  prayerStepArabicContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0f172a',
    borderRadius: 10,
    padding: 16,
    marginBottom: 10,
    gap: 10,
  },
  prayerStepArabic: {
    fontSize: 22,
    color: '#D4AF37',
    textAlign: 'center',
    lineHeight: 38,
    flex: 1,
  },
  prayerStepSpeaker: {
    padding: 4,
  },
  prayerStepTransliteration: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 6,
  },
  prayerStepTranslation: {
    fontSize: 14,
    color: '#e2e8f0',
    textAlign: 'center',
    marginBottom: 10,
  },
  repetitionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#10b98115',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'center',
    marginBottom: 10,
  },
  repetitionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10b981',
  },
  instructionBox: {
    flexDirection: 'row',
    backgroundColor: '#334155',
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  instructionText: {
    fontSize: 13,
    color: '#94a3b8',
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
    backgroundColor: '#334155',
  },
  stepListNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#10b98120',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  stepListNumberText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#10b981',
  },
  stepListContent: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderRadius: 10,
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
    color: '#ffffff',
  },
  stepListTitleArabic: {
    fontSize: 13,
    color: '#D4AF37',
  },
  stepListDescription: {
    fontSize: 13,
    color: '#94a3b8',
    lineHeight: 20,
  },
  stepListArabicContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    backgroundColor: '#0f172a',
    borderRadius: 6,
    padding: 8,
  },
  stepListArabic: {
    fontSize: 16,
    color: '#D4AF37',
    flex: 1,
    lineHeight: 28,
  },
  stepListTransliteration: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#94a3b8',
    marginTop: 4,
  },
  stepListTranslation: {
    fontSize: 12,
    color: '#cbd5e1',
    marginTop: 2,
  },

  // Prayer Times Table
  prayerTimesContainer: {
    gap: 10,
  },
  prayerTimeCard: {
    backgroundColor: '#1e293b',
    borderRadius: 10,
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
    fontSize: 14,
    color: '#D4AF37',
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
    color: '#94a3b8',
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
    borderTopColor: '#334155',
  },
  sunnahText: {
    fontSize: 11,
    color: '#10b981',
    fontStyle: 'italic',
    flexShrink: 1,
  },

  // Complete Button
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 12,
    paddingVertical: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: '#334155',
    marginTop: 8,
  },
  completeButtonActive: {
    backgroundColor: '#10b98120',
    borderColor: '#10b98140',
  },
  completeButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#94a3b8',
  },
  completeButtonTextActive: {
    color: '#10b981',
  },
});

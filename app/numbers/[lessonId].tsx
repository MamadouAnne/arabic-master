import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useLocalizedContent } from '../../src/hooks/useLocalizedContent';
import { useArabicSpeech } from '../../src/hooks/useArabicSpeech';
import { getNumbersLesson, NUMBERS_LESSONS, NumbersBlock } from '../../src/data/arabic/numbers/numbersCourse';
import { font, color, radius } from '../../src/theme/tokens';

export default function NumbersLessonScreen() {
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const { t } = useTranslation();
  const { lc } = useLocalizedContent();
  const { speak } = useArabicSpeech();

  const lesson = getNumbersLesson(lessonId);
  const index = lesson ? NUMBERS_LESSONS.findIndex((l) => l.id === lesson.id) : -1;
  const prev = index > 0 ? NUMBERS_LESSONS[index - 1] : null;
  const next = index >= 0 && index < NUMBERS_LESSONS.length - 1 ? NUMBERS_LESSONS[index + 1] : null;

  if (!lesson) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()} hitSlop={8}>
            <Ionicons name="arrow-back" size={24} color={color.textMuted} />
          </Pressable>
          <View style={{ flex: 1 }} />
        </View>
        <Text style={styles.notFound}>{t('numbersFeature.notFound')}</Text>
      </SafeAreaView>
    );
  }

  const renderBlock = (block: NumbersBlock, i: number) => {
    switch (block.type) {
      case 'intro':
        return (
          <Text key={i} style={styles.introText}>{lc(block.text, block.textFr)}</Text>
        );

      case 'numbers':
        return (
          <View key={i} style={styles.section}>
            {block.title && <Text style={styles.blockTitle}>{lc(block.title, block.titleFr)}</Text>}
            <View style={styles.numberGrid}>
              {block.items.map((item, j) => (
                <Pressable key={j} style={styles.numberCard} onPress={() => speak(item.arabic)}>
                  <View style={styles.numberTopRow}>
                    {!!item.digit && <Text style={styles.numberDigit}>{item.digit}</Text>}
                    {!!item.value && <Text style={styles.numberValue}>{item.value}</Text>}
                    <View style={{ flex: 1 }} />
                    <Ionicons name="volume-medium" size={16} color={color.sacred} />
                  </View>
                  <Text style={styles.numberArabic}>{item.arabic}</Text>
                  <Text style={styles.numberTranslit}>{item.translit}</Text>
                  <Text style={styles.numberMeaning}>{lc(item.en, item.fr)}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        );

      case 'rule':
        return (
          <View key={i} style={styles.ruleCard}>
            <View style={styles.ruleAccent} />
            <Text style={styles.ruleTitle}>{lc(block.title, block.titleFr)}</Text>
            <Text style={styles.ruleText}>{lc(block.text, block.textFr)}</Text>
          </View>
        );

      case 'examples':
        return (
          <View key={i} style={styles.section}>
            {block.title && <Text style={styles.blockTitle}>{lc(block.title, block.titleFr)}</Text>}
            {block.items.map((ex, j) => (
              <Pressable key={j} style={styles.exampleRow} onPress={() => speak(ex.arabic)}>
                <View style={styles.exampleText}>
                  <Text style={styles.exampleArabic}>{ex.arabic}</Text>
                  <Text style={styles.exampleTranslit}>{ex.translit}</Text>
                  <Text style={styles.exampleMeaning}>{lc(ex.en, ex.fr)}</Text>
                </View>
                <View style={styles.exampleAudio}>
                  <Ionicons name="volume-high" size={18} color={color.sacred} />
                </View>
              </Pressable>
            ))}
          </View>
        );

      case 'table': {
        const headers = lc(block.headers, block.headersFr);
        const rows = lc(block.rows, block.rowsFr);
        return (
          <View key={i} style={styles.section}>
            {block.title && <Text style={styles.blockTitle}>{lc(block.title, block.titleFr)}</Text>}
            <View style={styles.table}>
              <View style={styles.tableHeaderRow}>
                {headers.map((h, k) => (
                  <View key={k} style={[styles.tableCell, { flex: k === 0 ? 0.9 : 1 }]}>
                    <Text style={styles.tableHeaderText}>{h}</Text>
                  </View>
                ))}
              </View>
              {rows.map((row, r) => (
                <View key={r} style={[styles.tableRow, r % 2 === 0 && styles.tableRowAlt]}>
                  {row.map((cell, c) => (
                    <View key={c} style={[styles.tableCell, { flex: c === 0 ? 0.9 : 1 }]}>
                      <Text style={[styles.tableCellText, c === 0 && styles.tableCellFirst]}>{cell}</Text>
                    </View>
                  ))}
                </View>
              ))}
            </View>
          </View>
        );
      }

      case 'tip':
        return (
          <View key={i} style={styles.tipCard}>
            <Ionicons name="bulb" size={18} color={color.sacred} />
            <Text style={styles.tipText}>{lc(block.text, block.textFr)}</Text>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color={color.textMuted} />
        </Pressable>
        <View style={styles.headerTitles}>
          <Text style={styles.headerTitle} numberOfLines={1}>{lc(lesson.title, lesson.titleFr)}</Text>
          <Text style={styles.headerTitleArabic}>{lesson.titleArabic}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {lesson.blocks.map(renderBlock)}

        {/* Prev / Next */}
        <View style={styles.navRow}>
          {prev ? (
            <Pressable style={styles.navBtn} onPress={() => router.replace(`/numbers/${prev.id}` as any)}>
              <Ionicons name="chevron-back" size={18} color={color.textMuted} />
              <Text style={styles.navText} numberOfLines={1}>{lc(prev.title, prev.titleFr)}</Text>
            </Pressable>
          ) : <View style={{ flex: 1 }} />}
          {next ? (
            <Pressable style={[styles.navBtn, styles.navBtnNext]} onPress={() => router.replace(`/numbers/${next.id}` as any)}>
              <Text style={styles.navText} numberOfLines={1}>{lc(next.title, next.titleFr)}</Text>
              <Ionicons name="chevron-forward" size={18} color={color.textMuted} />
            </Pressable>
          ) : <View style={{ flex: 1 }} />}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: color.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40, height: 40, borderRadius: radius.xl,
    backgroundColor: color.surface, alignItems: 'center', justifyContent: 'center',
  },
  headerTitles: { flex: 1, alignItems: 'center', paddingHorizontal: 8 },
  headerTitle: { fontSize: 17, fontWeight: 'bold', color: color.text },
  headerTitleArabic: {
    fontFamily: font.arabic,
    lineHeight: 24, fontSize: 14, color: color.sacred, marginTop: 2 },
  content: { paddingHorizontal: 20, paddingTop: 4 },
  notFound: { color: color.textMuted, textAlign: 'center', marginTop: 40 },

  introText: { fontSize: 15, color: color.textMuted, lineHeight: 24, marginBottom: 20 },
  section: { marginBottom: 22 },
  blockTitle: { fontSize: 16, fontWeight: '700', color: color.text, marginBottom: 12 },

  // Number grid
  numberGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 12 },
  numberCard: {
    width: '48%',
    backgroundColor: color.surface,
    borderRadius: radius.md,
    padding: 12,
    borderWidth: 1,
    borderColor: color.border,
  },
  numberTopRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  numberDigit: { fontSize: 22, fontWeight: '800', color: color.sacred },
  numberValue: { fontSize: 13, color: color.textFaint, fontWeight: '600' },
  numberArabic: {
    fontFamily: font.arabic, fontSize: 26, lineHeight: 42, color: color.text, textAlign: 'right' },
  numberTranslit: { fontSize: 13, color: color.accent, fontStyle: 'italic', marginTop: 2 },
  numberMeaning: { fontSize: 13, color: color.textMuted, marginTop: 2 },

  // Rule card
  ruleCard: {
    backgroundColor: color.surface,
    borderRadius: radius.lg,
    padding: 16,
    paddingLeft: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: color.border,
    overflow: 'hidden',
  },
  ruleAccent: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, backgroundColor: color.sacred },
  ruleTitle: { fontSize: 15, fontWeight: '800', color: color.sacred, marginBottom: 6 },
  ruleText: { fontSize: 14, color: color.text, lineHeight: 22 },

  // Examples
  exampleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: color.surface,
    borderRadius: radius.md,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: color.border,
  },
  exampleText: { flex: 1 },
  exampleArabic: {
    fontFamily: font.arabic, fontSize: 24, lineHeight: 42, color: color.text, textAlign: 'right' },
  exampleTranslit: { fontSize: 13, color: color.accent, fontStyle: 'italic', marginTop: 2 },
  exampleMeaning: { fontSize: 13, color: color.textMuted, marginTop: 2 },
  exampleAudio: {
    width: 40, height: 40, borderRadius: radius.xl,
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    alignItems: 'center', justifyContent: 'center',
  },

  // Table
  table: { borderRadius: radius.md, overflow: 'hidden', borderWidth: 1, borderColor: color.border },
  tableHeaderRow: { flexDirection: 'row', backgroundColor: color.bg },
  tableRow: { flexDirection: 'row', backgroundColor: color.surface },
  tableRowAlt: { backgroundColor: '#1a2536' },
  tableCell: { paddingVertical: 10, paddingHorizontal: 10 },
  tableHeaderText: { fontSize: 12, fontWeight: '700', color: color.textMuted },
  tableCellText: { fontSize: 13, color: color.text },
  tableCellFirst: { fontWeight: '700', color: color.text },

  // Tip
  tipCard: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: 'rgba(212, 175, 55, 0.10)',
    borderRadius: radius.md,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  tipText: { flex: 1, fontSize: 14, color: color.text, lineHeight: 21 },

  // Nav
  navRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  navBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: color.surface,
    borderRadius: radius.md,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: color.border,
  },
  navBtnNext: { justifyContent: 'flex-end' },
  navText: { flex: 1, fontSize: 13, fontWeight: '600', color: color.textMuted },
});

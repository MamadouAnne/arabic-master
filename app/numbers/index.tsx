import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useLocalizedContent } from '../../src/hooks/useLocalizedContent';
import { NUMBERS_LESSONS } from '../../src/data/arabic/numbers/numbersCourse';
import { font, color, radius } from '../../src/theme/tokens';

export default function NumbersIndexScreen() {
  const { t } = useTranslation();
  const { lc } = useLocalizedContent();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color={color.textMuted} />
        </Pressable>
        <View style={styles.headerTitles}>
          <Text style={styles.headerTitle}>{t('numbersFeature.title')}</Text>
          <Text style={styles.headerTitleArabic}>الْأَرْقَامُ الْعَرَبِيَّة</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>{t('numbersFeature.subtitle')}</Text>

        {NUMBERS_LESSONS.map((lesson, index) => (
          <Pressable
            key={lesson.id}
            style={styles.lessonCard}
            onPress={() => router.push(`/numbers/${lesson.id}` as any)}
            accessibilityRole="button"
            accessibilityLabel={lc(lesson.title, lesson.titleFr)}
          >
            <View style={[styles.lessonIcon, { backgroundColor: lesson.color + '22' }]}>
              <Ionicons name={lesson.icon as any} size={22} color={lesson.color} />
            </View>
            <View style={styles.lessonText}>
              <Text style={styles.lessonTitle}>{lc(lesson.title, lesson.titleFr)}</Text>
              <Text style={styles.lessonSubtitle} numberOfLines={1}>{lc(lesson.subtitle, lesson.subtitleFr)}</Text>
              <Text style={[styles.lessonArabic, { color: lesson.color }]}>{lesson.titleArabic}</Text>
            </View>
            <View style={styles.lessonNumber}>
              <Text style={styles.lessonNumberText}>{index + 1}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={color.textFaint} />
          </Pressable>
        ))}

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
    width: 40,
    height: 40,
    borderRadius: radius.xl,
    backgroundColor: color.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitles: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: color.text },
  headerTitleArabic: {
    fontFamily: font.arabic,
    lineHeight: 32, fontSize: 18, color: color.sacred, marginTop: 2 },
  content: { paddingHorizontal: 20, paddingTop: 4 },
  intro: {
    fontSize: 14,
    color: color.textMuted,
    lineHeight: 21,
    marginBottom: 18,
  },
  lessonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: color.surface,
    borderRadius: radius.lg,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: color.border,
  },
  lessonIcon: {
    width: 46,
    height: 46,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lessonText: { flex: 1 },
  lessonTitle: { fontSize: 15, fontWeight: '700', color: color.text },
  lessonSubtitle: { fontSize: 12, color: color.textMuted, marginTop: 2 },
  lessonArabic: {
    fontFamily: font.arabic,
    lineHeight: 30, fontSize: 18, marginTop: 3, fontWeight: '600' },
  lessonNumber: {
    width: 26,
    height: 26,
    borderRadius: radius.md,
    backgroundColor: color.bg,
    borderWidth: 1,
    borderColor: color.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lessonNumberText: { fontSize: 12, fontWeight: '700', color: color.textFaint },
});

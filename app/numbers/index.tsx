import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useLocalizedContent } from '../../src/hooks/useLocalizedContent';
import { NUMBERS_LESSONS } from '../../src/data/arabic/numbers/numbersCourse';

export default function NumbersIndexScreen() {
  const { t } = useTranslation();
  const { lc } = useLocalizedContent();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color="#94a3b8" />
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
            <Ionicons name="chevron-forward" size={20} color="#64748b" />
          </Pressable>
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitles: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#ffffff' },
  headerTitleArabic: { fontSize: 15, color: '#D4AF37', marginTop: 2 },
  content: { paddingHorizontal: 20, paddingTop: 4 },
  intro: {
    fontSize: 14,
    color: '#94a3b8',
    lineHeight: 21,
    marginBottom: 18,
  },
  lessonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  lessonIcon: {
    width: 46,
    height: 46,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lessonText: { flex: 1 },
  lessonTitle: { fontSize: 15, fontWeight: '700', color: '#ffffff' },
  lessonSubtitle: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
  lessonArabic: { fontSize: 14, marginTop: 3, fontWeight: '600' },
  lessonNumber: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lessonNumberText: { fontSize: 12, fontWeight: '700', color: '#64748b' },
});

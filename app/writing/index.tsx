import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useLocalizedContent } from '../../src/hooks/useLocalizedContent';
import { useProgressStore } from '../../src/stores/progressStore';
import { writingLessons } from '../../src/data/arabic/writing/writingLessons';
import { font, color, radius } from '../../src/theme/tokens';

const ACCENT = '#f472b6';

export default function WritingScreen() {
  const { t } = useTranslation();
  const { lc } = useLocalizedContent();
  const { progress } = useProgressStore();
  const completed = progress.grammarProgress.lessonsCompleted;

  const lessons = [...writingLessons].sort((a, b) => a.order - b.order);

  const UNITS: { title: string; titleFr: string; ar: string; from: number; to: number }[] = [
    { title: 'Foundations', titleFr: 'Les bases', ar: 'الْأَسَاسِيَّات', from: 1, to: 3 },
    { title: 'The Letters', titleFr: 'Les lettres', ar: 'الْحُرُوف', from: 4, to: 8 },
    { title: 'Connections & Special Cases', titleFr: 'Liaisons et cas particuliers', ar: 'الْوَصْلُ وَالْحَالَاتُ الْخَاصَّة', from: 9, to: 11 },
    { title: 'Vowels & Marks', titleFr: 'Voyelles et signes', ar: 'الْحَرَكَات', from: 12, to: 14 },
    { title: 'Words & Beyond', titleFr: 'Mots et au-delà', ar: 'الْكَلِمَات', from: 15, to: 17 },
  ];

  const renderCard = (lesson: (typeof lessons)[number]) => {
    const isDone = completed.includes(lesson.id);
    const number = lessons.findIndex((l) => l.id === lesson.id) + 1;
    return (
      <Pressable
        key={lesson.id}
        style={styles.lessonCard}
        onPress={() => router.push(`/grammar/${lesson.id}` as any)}
      >
        <View style={styles.lessonNumber}>
          <Text style={styles.lessonNumberText}>{number}</Text>
        </View>
        <View style={styles.lessonContent}>
          <View style={styles.lessonTitleRow}>
            <Text style={styles.lessonTitle}>{lc(lesson.title, (lesson as any).titleFr)}</Text>
            {isDone && <Ionicons name="checkmark-circle" size={18} color={color.progress} />}
          </View>
          <Text style={styles.lessonTitleArabic}>{lesson.titleArabic}</Text>
          <Text style={styles.lessonDescription} numberOfLines={2}>
            {lc(lesson.description, (lesson as any).descriptionFr)}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={color.textFaint} />
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={color.text} />
          </Pressable>
          <View style={styles.headerText}>
            <Text style={styles.title}>{t('learn.writing')}</Text>
            <Text style={styles.titleArabic}>الْكِتَابَة</Text>
          </View>
        </View>

        {/* Intro */}
        <View style={styles.introCard}>
          <Ionicons name="create" size={22} color={ACCENT} />
          <View style={styles.introContent}>
            <Text style={styles.introTitle}>{t('learn.writing')}</Text>
            <Text style={styles.introText}>{t('learn.writingDesc')}</Text>
          </View>
        </View>

        {/* Lessons grouped by unit */}
        {UNITS.map((u) => {
          const unitLessons = lessons.filter((l) => l.order >= u.from && l.order <= u.to);
          if (unitLessons.length === 0) return null;
          return (
            <View key={u.title} style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{lc(u.title, u.titleFr)}</Text>
                <View style={styles.sectionCount}>
                  <Text style={styles.sectionCountText}>{unitLessons.length}</Text>
                </View>
                <Text style={styles.sectionTitleAr}>{u.ar}</Text>
              </View>
              {unitLessons.map(renderCard)}
            </View>
          );
        })}

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: color.bg },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 16 },
  backButton: { width: 40, height: 40, borderRadius: radius.xl, backgroundColor: color.surface, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  headerText: { flex: 1 },
  title: { fontSize: 24, fontWeight: 'bold', color: color.text },
  titleArabic: {
    fontFamily: font.arabic,
    lineHeight: 31, fontSize: 18, color: ACCENT, marginTop: 4 },
  introCard: { flexDirection: 'row', backgroundColor: `${ACCENT}18`, marginHorizontal: 20, borderRadius: radius.lg, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: `${ACCENT}40`, gap: 12 },
  introContent: { flex: 1 },
  introTitle: { fontSize: 16, fontWeight: '700', color: ACCENT, marginBottom: 4 },
  introText: { fontSize: 13, color: color.textMuted, lineHeight: 19 },
  section: { paddingHorizontal: 20, marginBottom: 20 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: color.text, textTransform: 'capitalize' },
  sectionCount: { minWidth: 24, height: 24, paddingHorizontal: 7, borderRadius: radius.md, backgroundColor: color.surface, alignItems: 'center', justifyContent: 'center' },
  sectionCountText: { fontSize: 12, fontWeight: '700', color: color.textMuted },
  sectionTitleAr: { fontSize: 14, color: color.textFaint, marginLeft: 'auto' },
  lessonCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: color.surface, borderRadius: radius.lg, padding: 16, marginBottom: 12 },
  lessonNumber: { width: 40, height: 40, borderRadius: radius.md, backgroundColor: `${ACCENT}30`, alignItems: 'center', justifyContent: 'center' },
  lessonNumberText: { fontSize: 18, fontWeight: 'bold', color: ACCENT },
  lessonContent: { flex: 1, marginLeft: 14 },
  lessonTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  lessonTitle: { fontSize: 15, fontWeight: '600', color: color.text },
  lessonTitleArabic: {
    fontFamily: font.arabic,
    lineHeight: 24, fontSize: 14, color: ACCENT, marginTop: 2 },
  lessonDescription: { fontSize: 12, color: color.textMuted, marginTop: 4, lineHeight: 18 },
});

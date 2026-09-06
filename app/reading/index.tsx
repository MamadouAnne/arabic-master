import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useLocalizedContent } from '../../src/hooks/useLocalizedContent';
import { useProgressStore } from '../../src/stores/progressStore';
import { font, color, radius } from '../../src/theme/tokens';
import { withAlpha } from '../../src/components/ui/Primitives';

const readingTexts = [
  {
    id: 'intro-1',
    title: 'Introducing Yourself',
    titleFr: 'Se presenter',
    titleArabic: 'التَّعْرِيفُ بِالنَّفْس',
    level: 'beginner',
    wordCount: 25,
    preview: 'مَرْحَبًا، اِسْمِي...',
    color: color.progress,
    icon: '👋',
  },
  {
    id: 'family-1',
    title: 'My Family',
    titleFr: 'Ma famille',
    titleArabic: 'عَائِلَتِي',
    level: 'beginner',
    wordCount: 40,
    preview: 'هَذِهِ عَائِلَتِي...',
    color: color.accentStrong,
    icon: '👨‍👩‍👧‍👦',
  },
  {
    id: 'daily-routine',
    title: 'Daily Routine',
    titleFr: 'Routine quotidienne',
    titleArabic: 'الرُّوتِينُ الْيَوْمِي',
    level: 'beginner',
    wordCount: 50,
    preview: 'أَسْتَيْقِظُ صَبَاحًا...',
    color: color.warning,
    icon: '☀️',
  },
  {
    id: 'at-school',
    title: 'At School',
    titleFr: "A l'ecole",
    titleArabic: 'فِي الْمَدْرَسَة',
    level: 'intermediate',
    wordCount: 75,
    preview: 'أَذْهَبُ إِلَى الْمَدْرَسَة...',
    color: color.accent,
    icon: '🏫',
  },
  {
    id: 'at-market',
    title: 'At the Market',
    titleFr: 'Au marche',
    titleArabic: 'فِي السُّوق',
    level: 'intermediate',
    wordCount: 80,
    preview: 'أُحِبُّ الذَّهَابَ إِلَى السُّوق...',
    color: color.accent,
    icon: '🛒',
  },
  {
    id: 'weather',
    title: 'The Weather',
    titleFr: 'La meteo',
    titleArabic: 'الطَّقْس',
    level: 'intermediate',
    wordCount: 60,
    preview: 'الطَّقْسُ جَمِيلٌ الْيَوْم...',
    color: color.progress,
    icon: '🌤️',
  },
  {
    id: 'travel-story',
    title: 'A Travel Story',
    titleFr: 'Une histoire de voyage',
    titleArabic: 'قِصَّةُ سَفَر',
    level: 'advanced',
    wordCount: 150,
    preview: 'سَافَرْتُ إِلَى مِصْر...',
    color: color.sacred,
    icon: '✈️',
  },
  {
    id: 'arab-culture',
    title: 'Arab Culture',
    titleFr: 'Culture arabe',
    titleArabic: 'الثَّقَافَةُ الْعَرَبِيَّة',
    level: 'advanced',
    wordCount: 120,
    preview: 'الثَّقَافَةُ الْعَرَبِيَّةُ غَنِيَّة...',
    color: color.danger,
    icon: '🕌',
  },
  {
    id: 'my-house',
    title: 'My House',
    titleFr: 'Ma maison',
    titleArabic: 'بَيْتِي',
    level: 'beginner',
    wordCount: 45,
    preview: 'هَذَا بَيْتِي، وَهُوَ جَمِيل...',
    color: color.progress,
    icon: '🏠',
  },
  {
    id: 'at-hospital',
    title: 'At the Hospital',
    titleFr: "À l'hôpital",
    titleArabic: 'فِي الْمُسْتَشْفَى',
    level: 'intermediate',
    wordCount: 70,
    preview: 'ذَهَبْتُ إِلَى الْمُسْتَشْفَى...',
    color: color.accentStrong,
    icon: '🏥',
  },
  {
    id: 'ramadan',
    title: 'The Month of Ramadan',
    titleFr: 'Le mois du Ramadan',
    titleArabic: 'شَهْرُ رَمَضَان',
    level: 'advanced',
    wordCount: 75,
    preview: 'رَمَضَانُ هُوَ الشَّهْرُ التَّاسِع...',
    color: color.sacred,
    icon: '🌙',
  },
  {
    id: 'value-of-time',
    title: 'The Value of Time',
    titleFr: 'La valeur du temps',
    titleArabic: 'قِيمَةُ الْوَقْت',
    level: 'advanced',
    wordCount: 70,
    preview: 'الْوَقْتُ مِنْ أَثْمَنِ مَا يَمْلِكُهُ الْإِنْسَان...',
    color: '#f43f5e',
    icon: '⏳',
  },
];

export default function ReadingScreen() {
  const { t } = useTranslation();
  const { lc } = useLocalizedContent();
  const { progress } = useProgressStore();
  const completedTexts = progress.readingProgress.textsCompleted;
  const startedTexts = progress.readingProgress.textsStarted;

  const beginnerTexts = readingTexts.filter((item) => item.level === 'beginner');
  const intermediateTexts = readingTexts.filter((item) => item.level === 'intermediate');
  const advancedTexts = readingTexts.filter((item) => item.level === 'advanced');

  const getTextStatus = (textId: string) => {
    if (completedTexts.includes(textId)) return 'completed';
    if (startedTexts.includes(textId)) return 'in_progress';
    return 'new';
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
            <Text style={styles.title}>{t('reading.title')}</Text>
            <Text style={styles.titleArabic}>الْقِرَاءَة</Text>
          </View>
        </View>

        {/* Intro Card */}
        <View style={styles.introCard}>
          <View style={styles.introCardBorder} />
          <View style={styles.introCardContent}>
            <Ionicons name="book" size={24} color={color.progress} />
            <View style={styles.introTextContent}>
              <Text style={styles.introTitle}>{t('reading.introTitle')}</Text>
              <Text style={styles.introText}>
                {t('reading.introText')}
              </Text>
            </View>
          </View>
        </View>

        {/* Arabic memorization entry */}
        <Pressable
          style={styles.arabicCardWrap}
          onPress={() => router.push('/reading/arabic' as any)}
        >
          <LinearGradient
            colors={[color.progress, color.accent]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.arabicCard}
          >
            <View style={styles.arabicIconWrap}>
              <Ionicons name="bookmark" size={22} color={color.text} />
            </View>
            <View style={styles.arabicTextWrap}>
              <Text style={styles.arabicTitle}>{t('reading.memo.entryTitle')}</Text>
              <Text style={styles.arabicSubtitle}>
                {t('reading.memo.entrySubtitle')}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.85)" />
          </LinearGradient>
        </Pressable>

        {/* Beginner Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <View style={[styles.levelBadge, { backgroundColor: withAlpha(color.progress, 0.13) }]}>
                <Ionicons name="leaf" size={16} color={color.progress} />
              </View>
              <Text style={styles.sectionTitle}>{t('common.beginner')}</Text>
              <Text style={styles.sectionTitleAr}>الْمُبْتَدِئ</Text>
            </View>
            <Text style={styles.sectionCount}>{t('reading.textsCount', { count: beginnerTexts.length })}</Text>
          </View>

          {beginnerTexts.map((text) => {
            const status = getTextStatus(text.id);
            return (
              <Pressable
                key={text.id}
                style={[styles.textCard, { borderLeftColor: text.color }]}
                onPress={() => router.push(`/reading/${text.id}` as any)}
              >
                <View style={[styles.textIconContainer, { backgroundColor: text.color + '20' }]}>
                  <Text style={styles.textIcon}>{text.icon}</Text>
                </View>
                <View style={styles.textContent}>
                  <View style={styles.textHeader}>
                    <Text style={styles.textTitle}>{lc(text.title, text.titleFr)}</Text>
                    {status === 'completed' && (
                      <Ionicons name="checkmark-circle" size={20} color={color.progress} />
                    )}
                    {status === 'in_progress' && (
                      <Ionicons name="time" size={20} color={color.sacred} />
                    )}
                  </View>
                  <Text style={styles.textTitleAr}>{text.titleArabic}</Text>
                  <Text style={styles.textPreview}>{text.preview}</Text>
                  <View style={styles.textMetaRow}>
                    <View style={styles.wordCountBadge}>
                      <Ionicons name="document-text-outline" size={12} color={color.textFaint} />
                      <Text style={styles.textMeta}>{text.wordCount} {t('common.words')}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={color.textFaint} />
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* Intermediate Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <View style={[styles.levelBadge, { backgroundColor: withAlpha(color.accentStrong, 0.13) }]}>
                <Ionicons name="trending-up" size={16} color={color.accentStrong} />
              </View>
              <Text style={styles.sectionTitle}>{t('common.intermediate')}</Text>
              <Text style={styles.sectionTitleAr}>الْمُتَوَسِّط</Text>
            </View>
            <Text style={styles.sectionCount}>{t('reading.textsCount', { count: intermediateTexts.length })}</Text>
          </View>

          {intermediateTexts.map((text) => {
            const status = getTextStatus(text.id);
            return (
              <Pressable
                key={text.id}
                style={[styles.textCard, { borderLeftColor: text.color }]}
                onPress={() => router.push(`/reading/${text.id}` as any)}
              >
                <View style={[styles.textIconContainer, { backgroundColor: text.color + '20' }]}>
                  <Text style={styles.textIcon}>{text.icon}</Text>
                </View>
                <View style={styles.textContent}>
                  <View style={styles.textHeader}>
                    <Text style={styles.textTitle}>{lc(text.title, text.titleFr)}</Text>
                    {status === 'completed' && (
                      <Ionicons name="checkmark-circle" size={20} color={color.progress} />
                    )}
                    {status === 'in_progress' && (
                      <Ionicons name="time" size={20} color={color.sacred} />
                    )}
                  </View>
                  <Text style={styles.textTitleAr}>{text.titleArabic}</Text>
                  <Text style={styles.textPreview}>{text.preview}</Text>
                  <View style={styles.textMetaRow}>
                    <View style={styles.wordCountBadge}>
                      <Ionicons name="document-text-outline" size={12} color={color.textFaint} />
                      <Text style={styles.textMeta}>{text.wordCount} {t('common.words')}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={color.textFaint} />
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* Advanced Section */}
        <View style={[styles.section, { marginBottom: 100 }]}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <View style={[styles.levelBadge, { backgroundColor: withAlpha(color.sacred, 0.13) }]}>
                <Ionicons name="trophy" size={16} color={color.sacred} />
              </View>
              <Text style={styles.sectionTitle}>{t('common.advanced')}</Text>
              <Text style={styles.sectionTitleAr}>الْمُتَقَدِّم</Text>
            </View>
            <Text style={styles.sectionCount}>{t('reading.textsCount', { count: advancedTexts.length })}</Text>
          </View>

          {advancedTexts.map((text) => {
            const status = getTextStatus(text.id);
            return (
              <Pressable
                key={text.id}
                style={[styles.textCard, { borderLeftColor: text.color }]}
                onPress={() => router.push(`/reading/${text.id}` as any)}
              >
                <View style={[styles.textIconContainer, { backgroundColor: text.color + '20' }]}>
                  <Text style={styles.textIcon}>{text.icon}</Text>
                </View>
                <View style={styles.textContent}>
                  <View style={styles.textHeader}>
                    <Text style={styles.textTitle}>{lc(text.title, text.titleFr)}</Text>
                    {status === 'completed' && (
                      <Ionicons name="checkmark-circle" size={20} color={color.progress} />
                    )}
                    {status === 'in_progress' && (
                      <Ionicons name="time" size={20} color={color.sacred} />
                    )}
                  </View>
                  <Text style={styles.textTitleAr}>{text.titleArabic}</Text>
                  <Text style={styles.textPreview}>{text.preview}</Text>
                  <View style={styles.textMetaRow}>
                    <View style={styles.wordCountBadge}>
                      <Ionicons name="document-text-outline" size={12} color={color.textFaint} />
                      <Text style={styles.textMeta}>{text.wordCount} {t('common.words')}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={color.textFaint} />
                  </View>
                </View>
              </Pressable>
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
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: radius.xl,
    backgroundColor: color.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: color.text,
  },
  titleArabic: {
    fontFamily: font.arabic,
    lineHeight: 31,
    fontSize: 18,
    color: color.progress,
    marginTop: 4,
  },
  introCard: {
    backgroundColor: color.surface,
    marginHorizontal: 20,
    borderRadius: radius.lg,
    marginBottom: 16,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  introCardBorder: {
    width: 4,
    backgroundColor: color.progress,
  },
  introCardContent: {
    flex: 1,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  introTextContent: {
    flex: 1,
  },
  introTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: color.text,
    marginBottom: 6,
  },
  introText: {
    fontSize: 13,
    color: color.textMuted,
    lineHeight: 20,
  },
  vowelToggle: {
    backgroundColor: color.surface,
    marginHorizontal: 20,
    borderRadius: radius.lg,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  vowelLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  vowelText: {
    marginLeft: 12,
    flex: 1,
  },
  vowelTitle: {
    color: color.text,
    fontSize: 15,
    fontWeight: '600',
  },
  vowelDesc: {
    color: color.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  toggle: {
    width: 48,
    height: 28,
    borderRadius: radius.md,
    backgroundColor: color.surfaceRaised,
    padding: 2,
  },
  toggleActive: {
    backgroundColor: color.progress,
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: radius.md,
    backgroundColor: color.textMuted,
  },
  toggleThumbActive: {
    backgroundColor: color.text,
    marginLeft: 20,
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
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  progressTitle: {
    color: color.text,
    fontSize: 16,
    fontWeight: '600',
  },
  progressStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressStat: {
    flex: 1,
    alignItems: 'center',
  },
  progressValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: color.text,
  },
  progressLabel: {
    fontSize: 12,
    color: color.textFaint,
    marginTop: 4,
  },
  progressDivider: {
    width: 1,
    height: 40,
    backgroundColor: color.surfaceRaised,
  },
  arabicCardWrap: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  arabicCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  arabicIconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arabicTextWrap: { flex: 1, marginLeft: 14 },
  arabicTitle: {
    fontFamily: font.arabic,
    lineHeight: 26, fontSize: 15.5, fontWeight: '700', color: color.text },
  arabicSubtitle: {
    fontFamily: font.arabic,
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 3,
    lineHeight: 16,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  levelBadge: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    color: color.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  sectionTitleAr: {
    color: color.textFaint,
    fontSize: 14,
  },
  sectionCount: {
    color: color.textFaint,
    fontSize: 12,
  },
  textCard: {
    backgroundColor: color.surface,
    borderRadius: radius.lg,
    marginBottom: 12,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderLeftWidth: 4,
    gap: 14,
  },
  textIconContainer: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textIcon: {
    fontSize: 24,
  },
  textContent: {
    flex: 1,
  },
  textHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textTitle: {
    color: color.text,
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  textTitleAr: {
    color: color.progress,
    fontSize: 14,
    marginTop: 2,
  },
  textPreview: {
    color: color.textMuted,
    fontSize: 16,
    marginTop: 8,
  },
  textMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  wordCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  textMeta: {
    color: color.textFaint,
    fontSize: 12,
  },
});

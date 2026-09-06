import { View, Text, ScrollView, Pressable, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useArabicSpeech } from '../../src/hooks/useArabicSpeech';
import { font, color, radius } from '../../src/theme/tokens';
import { withAlpha } from '../../src/components/ui/Primitives';
const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Sun Letters (الحروف الشمسية) - 14 letters
// The "ل" in "ال" assimilates to these letters
const sunLetters = [
  { letter: 'ت', name: 'Ta', transliteration: 't', example: 'التِّين', exampleTrans: 'at-tīn', meaning: 'the fig' },
  { letter: 'ث', name: 'Tha', transliteration: 'th', example: 'الثَّوْب', exampleTrans: 'ath-thawb', meaning: 'the dress' },
  { letter: 'د', name: 'Dal', transliteration: 'd', example: 'الدَّار', exampleTrans: 'ad-dār', meaning: 'the home' },
  { letter: 'ذ', name: 'Dhal', transliteration: 'dh', example: 'الذَّهَب', exampleTrans: 'adh-dhahab', meaning: 'the gold' },
  { letter: 'ر', name: 'Ra', transliteration: 'r', example: 'الرَّجُل', exampleTrans: 'ar-rajul', meaning: 'the man' },
  { letter: 'ز', name: 'Zay', transliteration: 'z', example: 'الزَّهْرَة', exampleTrans: 'az-zahra', meaning: 'the flower' },
  { letter: 'س', name: 'Sin', transliteration: 's', example: 'السَّلَام', exampleTrans: 'as-salām', meaning: 'the peace' },
  { letter: 'ش', name: 'Shin', transliteration: 'sh', example: 'الشَّمْس', exampleTrans: 'ash-shams', meaning: 'the sun' },
  { letter: 'ص', name: 'Sad', transliteration: 'ṣ', example: 'الصَّبَاح', exampleTrans: 'aṣ-ṣabāḥ', meaning: 'the morning' },
  { letter: 'ض', name: 'Dad', transliteration: 'ḍ', example: 'الضَّوْء', exampleTrans: 'aḍ-ḍawʾ', meaning: 'the light' },
  { letter: 'ط', name: 'Ta', transliteration: 'ṭ', example: 'الطَّعَام', exampleTrans: 'aṭ-ṭaʿām', meaning: 'the food' },
  { letter: 'ظ', name: 'Dha', transliteration: 'ẓ', example: 'الظُّهْر', exampleTrans: 'aẓ-ẓuhr', meaning: 'the noon' },
  { letter: 'ل', name: 'Lam', transliteration: 'l', example: 'اللَّيْل', exampleTrans: 'al-layl', meaning: 'the night' },
  { letter: 'ن', name: 'Nun', transliteration: 'n', example: 'النَّار', exampleTrans: 'an-nār', meaning: 'the fire' },
];

// Moon Letters (الحروف القمرية) - 14 letters
// The "ل" in "ال" is pronounced with these letters
const moonLetters = [
  { letter: 'ا', name: 'Alif', transliteration: 'ā', example: 'الْأَب', exampleTrans: 'al-ab', meaning: 'the father' },
  { letter: 'ب', name: 'Ba', transliteration: 'b', example: 'الْبَيْت', exampleTrans: 'al-bayt', meaning: 'the house' },
  { letter: 'ج', name: 'Jim', transliteration: 'j', example: 'الْجَبَل', exampleTrans: 'al-jabal', meaning: 'the mountain' },
  { letter: 'ح', name: 'Ha', transliteration: 'ḥ', example: 'الْحُبّ', exampleTrans: 'al-ḥubb', meaning: 'the love' },
  { letter: 'خ', name: 'Kha', transliteration: 'kh', example: 'الْخُبْز', exampleTrans: 'al-khubz', meaning: 'the bread' },
  { letter: 'ع', name: 'Ayn', transliteration: 'ʿ', example: 'الْعَيْن', exampleTrans: 'al-ʿayn', meaning: 'the eye' },
  { letter: 'غ', name: 'Ghayn', transliteration: 'gh', example: 'الْغُرْفَة', exampleTrans: 'al-ghurfa', meaning: 'the room' },
  { letter: 'ف', name: 'Fa', transliteration: 'f', example: 'الْفَم', exampleTrans: 'al-fam', meaning: 'the mouth' },
  { letter: 'ق', name: 'Qaf', transliteration: 'q', example: 'الْقَلْب', exampleTrans: 'al-qalb', meaning: 'the heart' },
  { letter: 'ك', name: 'Kaf', transliteration: 'k', example: 'الْكِتَاب', exampleTrans: 'al-kitāb', meaning: 'the book' },
  { letter: 'م', name: 'Mim', transliteration: 'm', example: 'الْمَاء', exampleTrans: 'al-māʾ', meaning: 'the water' },
  { letter: 'ه', name: 'Ha', transliteration: 'h', example: 'الْهَوَاء', exampleTrans: 'al-hawāʾ', meaning: 'the air' },
  { letter: 'و', name: 'Waw', transliteration: 'w', example: 'الْوَرْد', exampleTrans: 'al-ward', meaning: 'the rose' },
  { letter: 'ي', name: 'Ya', transliteration: 'y', example: 'الْيَد', exampleTrans: 'al-yad', meaning: 'the hand' },
];

export default function SunMoonLettersScreen() {
  const { t } = useTranslation();
  const { speak, isSpeaking } = useArabicSpeech();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={color.text} />
          </Pressable>
          <View style={styles.headerText}>
            <Text style={styles.title}>{t('alphabet.sunMoonLetters')}</Text>
            <Text style={styles.titleArabic}>الْحُرُوفُ الشَّمْسِيَّة وَالْقَمَرِيَّة</Text>
          </View>
        </View>

        {/* Explanation Card */}
        <View style={styles.explanationCard}>
          <View style={styles.explanationHeader}>
            <Ionicons name="information-circle" size={24} color={color.accentStrong} />
            <Text style={styles.explanationTitle}>{t('alphabet.whatAreSunMoon')}</Text>
          </View>
          <Text style={styles.explanationText}>
            {t('alphabet.sunMoonExplanation')}
          </Text>
          <View style={styles.ruleBox}>
            <View style={styles.ruleItem}>
              <Ionicons name="sunny" size={20} color={color.warning} />
              <Text style={styles.ruleText}>
                <Text style={styles.ruleBold}>{t('alphabet.sunLetters')}:</Text> {t('alphabet.sunLettersRule')}
              </Text>
            </View>
            <View style={styles.ruleItem}>
              <Ionicons name="moon" size={20} color={color.accent} />
              <Text style={styles.ruleText}>
                <Text style={styles.ruleBold}>{t('alphabet.moonLetters')}:</Text> {t('alphabet.moonLettersRule')}
              </Text>
            </View>
          </View>
        </View>

        {/* Sun Letters Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconContainer}>
              <Ionicons name="sunny" size={28} color={color.warning} />
            </View>
            <View>
              <Text style={styles.sectionTitle}>{t('alphabet.sunLetters')}</Text>
              <Text style={styles.sectionTitleArabic}>الْحُرُوفُ الشَّمْسِيَّة</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>14</Text>
            </View>
          </View>

          <View style={styles.sectionNote}>
            <Text style={styles.noteText}>
              {t('alphabet.sunLettersNote')}
            </Text>
          </View>

          <View style={styles.letterGrid}>
            {sunLetters.map((item, index) => (
              <Pressable
                key={index}
                style={[styles.letterCard, styles.sunCard]}
                onPress={() => speak(item.example)}
              >
                <View style={styles.letterMain}>
                  <Text style={styles.letterArabic}>{item.letter}</Text>
                  <Pressable
                    style={[styles.audioBtn, styles.sunAudioBtn]}
                    onPress={() => speak(item.example)}
                  >
                    <Ionicons name="volume-medium" size={14} color={color.warning} />
                  </Pressable>
                </View>
                <Text style={styles.letterName}>{item.name}</Text>
                <View style={styles.exampleContainer}>
                  <Text style={styles.exampleArabic}>{item.example}</Text>
                  <Text style={styles.exampleTrans}>{item.exampleTrans}</Text>
                  <Text style={styles.exampleMeaning}>{item.meaning}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Moon Letters Section */}
        <View style={[styles.section, { marginBottom: 100 }]}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconContainer, styles.moonIconContainer]}>
              <Ionicons name="moon" size={28} color={color.accent} />
            </View>
            <View>
              <Text style={styles.sectionTitle}>{t('alphabet.moonLetters')}</Text>
              <Text style={styles.sectionTitleArabic}>الْحُرُوفُ الْقَمَرِيَّة</Text>
            </View>
            <View style={[styles.badge, styles.moonBadge]}>
              <Text style={styles.badgeText}>14</Text>
            </View>
          </View>

          <View style={[styles.sectionNote, styles.moonNote]}>
            <Text style={styles.noteText}>
              {t('alphabet.moonLettersNote')}
            </Text>
          </View>

          <View style={styles.letterGrid}>
            {moonLetters.map((item, index) => (
              <Pressable
                key={index}
                style={[styles.letterCard, styles.moonCard]}
                onPress={() => speak(item.example)}
              >
                <View style={styles.letterMain}>
                  <Text style={styles.letterArabic}>{item.letter}</Text>
                  <Pressable
                    style={[styles.audioBtn, styles.moonAudioBtn]}
                    onPress={() => speak(item.example)}
                  >
                    <Ionicons name="volume-medium" size={14} color={color.accent} />
                  </Pressable>
                </View>
                <Text style={styles.letterName}>{item.name}</Text>
                <View style={[styles.exampleContainer, styles.moonExample]}>
                  <Text style={styles.exampleArabic}>{item.example}</Text>
                  <Text style={styles.exampleTrans}>{item.exampleTrans}</Text>
                  <Text style={styles.exampleMeaning}>{item.meaning}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Mnemonic Card */}
        <View style={[styles.mnemonicCard, { marginBottom: 100 }]}>
          <View style={styles.mnemonicHeader}>
            <Ionicons name="bulb" size={24} color={color.sacred} />
            <Text style={styles.mnemonicTitle}>{t('alphabet.memoryTip')}</Text>
          </View>
          <Text style={styles.mnemonicText}>
            {t('alphabet.memoryTipIntro')}{'\n'}
            <Text style={styles.mnemonicArabic}>طِبْ ثُمَّ صِلْ رَحِمًا تَفُزْ ضِفْ ذَا نِعَمْ دَعْ سُوءَ ظَنٍّ زُرْ شَرِيفًا لِلْكَرَمْ</Text>
            {'\n\n'}
            {t('alphabet.memoryTipConclusion')}
          </Text>
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
    fontSize: 22,
    fontWeight: 'bold',
    color: color.text,
  },
  titleArabic: {
    fontFamily: font.arabic,
    lineHeight: 34,
    fontSize: 20,
    color: color.sacred,
    marginTop: 4,
  },
  explanationCard: {
    backgroundColor: color.surface,
    marginHorizontal: 20,
    borderRadius: radius.lg,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: withAlpha(color.accentStrong, 0.25),
  },
  explanationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  explanationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: color.text,
    marginLeft: 10,
  },
  explanationText: {
    color: color.textMuted,
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 16,
  },
  highlight: {
    color: color.sacred,
    fontWeight: '600',
  },
  ruleBox: {
    backgroundColor: color.bg,
    borderRadius: radius.md,
    padding: 16,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  ruleText: {
    color: color.text,
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  ruleBold: {
    fontWeight: '700',
    color: color.text,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: radius.xl,
    backgroundColor: withAlpha(color.warning, 0.13),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  moonIconContainer: {
    backgroundColor: withAlpha(color.accent, 0.13),
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: color.text,
  },
  sectionTitleArabic: {
    fontFamily: font.arabic,
    lineHeight: 30,
    fontSize: 18,
    color: color.sacred,
    marginTop: 2,
  },
  badge: {
    marginLeft: 'auto',
    backgroundColor: color.warning,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: radius.md,
  },
  moonBadge: {
    backgroundColor: color.accentStrong,
  },
  badgeText: {
    color: color.text,
    fontWeight: 'bold',
    fontSize: 14,
  },
  sectionNote: {
    backgroundColor: withAlpha(color.warning, 0.08),
    borderRadius: radius.md,
    padding: 14,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: color.warning,
  },
  moonNote: {
    backgroundColor: withAlpha(color.accentStrong, 0.08),
    borderLeftColor: color.accentStrong,
  },
  noteText: {
    color: color.text,
    fontSize: 13,
    lineHeight: 20,
  },
  letterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  letterCard: {
    width: (SCREEN_WIDTH - 52) / 2,
    backgroundColor: color.surface,
    borderRadius: radius.lg,
    padding: 14,
    margin: 6,
    borderWidth: 2,
  },
  sunCard: {
    borderColor: withAlpha(color.warning, 0.25),
  },
  moonCard: {
    borderColor: withAlpha(color.accentStrong, 0.25),
  },
  letterMain: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  letterArabic: {
    fontFamily: font.arabic,
    lineHeight: 82,
    fontSize: 48,
    color: color.text,
  },
  audioBtn: {
    width: 28,
    height: 28,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sunAudioBtn: {
    backgroundColor: withAlpha(color.warning, 0.13),
  },
  moonAudioBtn: {
    backgroundColor: withAlpha(color.accentStrong, 0.13),
  },
  letterName: {
    fontSize: 12,
    color: color.textMuted,
    marginBottom: 10,
  },
  exampleContainer: {
    backgroundColor: withAlpha(color.warning, 0.06),
    borderRadius: radius.sm,
    padding: 10,
  },
  moonExample: {
    backgroundColor: withAlpha(color.accentStrong, 0.06),
  },
  exampleArabic: {
    fontFamily: font.arabic,
    lineHeight: 40,
    fontSize: 24,
    color: color.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  exampleTrans: {
    fontSize: 11,
    color: color.sacred,
    textAlign: 'center',
    marginBottom: 2,
  },
  exampleMeaning: {
    fontSize: 10,
    color: color.textFaint,
    textAlign: 'center',
  },
  mnemonicCard: {
    backgroundColor: color.surface,
    marginHorizontal: 20,
    borderRadius: radius.lg,
    padding: 20,
    borderWidth: 2,
    borderColor: withAlpha(color.sacred, 0.25),
  },
  mnemonicHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  mnemonicTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: color.text,
    marginLeft: 10,
  },
  mnemonicText: {
    color: color.textMuted,
    fontSize: 14,
    lineHeight: 22,
  },
  mnemonicArabic: {
    fontFamily: font.arabic,
    color: color.sacred,
    fontSize: 20,
    lineHeight: 36,
  },
});

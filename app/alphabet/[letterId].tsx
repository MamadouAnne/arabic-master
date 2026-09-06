import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { getLetterById, arabicLetters } from '../../src/data/arabic/alphabet/letters';
import { useProgressStore } from '../../src/stores/progressStore';
import { useArabicSpeech } from '../../src/hooks/useArabicSpeech';
import { useLocalizedContent } from '../../src/hooks/useLocalizedContent';
import { useEffect, useState } from 'react';
import { useFonts } from 'expo-font';
import { ARABIC_SCRIPT_FONTS, SCRIPT_META, scriptFontFamily, ArabicScript } from '../../src/data/arabic/alphabet/scriptFonts';
import { ShareToGroupModal } from '../../src/components/community/ShareToGroupModal';
import type { SharedContent } from '../../src/data/community/socialData';
import { font, color, radius } from '../../src/theme/tokens';
import { withAlpha } from '../../src/components/ui/Primitives';

export default function LetterDetailScreen() {
  const { letterId } = useLocalSearchParams<{ letterId: string }>();
  const letter = getLetterById(letterId || '');
  const {
    progress,
    markLetterLearned,
    markLetterMastered,
    addXp,
    updateStreak,
  } = useProgressStore();

  const { t } = useTranslation();
  const { lc } = useLocalizedContent();
  const [isLearned, setIsLearned] = useState(false);
  const [isMastered, setIsMastered] = useState(false);
  const [shareContent, setShareContent] = useState<SharedContent | null>(null);
  const [script, setScript] = useState<ArabicScript>('naskh');
  useFonts(ARABIC_SCRIPT_FONTS); // custom scripts fall back to system until loaded
  const arabicFont = scriptFontFamily(script);
  const { speak, isSpeaking } = useArabicSpeech();

  useEffect(() => {
    if (letter) {
      setIsLearned(progress.alphabetProgress.lettersLearned.includes(letter.id));
      setIsMastered(progress.alphabetProgress.masteredLetters.includes(letter.id));
    }
  }, [letter, progress]);

  if (!letter) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{t('common.notFound')}</Text>
          <Pressable style={styles.backLink} onPress={() => router.back()}>
            <Text style={styles.backLinkText}>{t('common.goBack')}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const handleMarkLearned = () => {
    markLetterLearned(letter.id);
    addXp(10);
    updateStreak();
    setIsLearned(true);
  };

  const handleMarkMastered = () => {
    markLetterMastered(letter.id);
    addXp(25);
    updateStreak();
    setIsMastered(true);
  };

  // Navigate to next/prev letter
  const currentIndex = arabicLetters.findIndex((l) => l.id === letter.id);
  const prevLetter = currentIndex > 0 ? arabicLetters[currentIndex - 1] : null;
  const nextLetter =
    currentIndex < arabicLetters.length - 1 ? arabicLetters[currentIndex + 1] : null;

  const forms = [
    { key: 'isolated', label: t('alphabet.isolated'), labelAr: 'مُنْفَرِد', form: letter.forms.isolated },
    { key: 'initial', label: t('alphabet.initial'), labelAr: 'بِدَايَة', form: letter.forms.initial },
    { key: 'medial', label: t('alphabet.medial'), labelAr: 'وَسَط', form: letter.forms.medial },
    { key: 'final', label: t('alphabet.final'), labelAr: 'نِهَايَة', form: letter.forms.final },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={color.text} />
          </Pressable>
          <View style={styles.headerText}>
            <Text style={styles.title}>{lc(letter.name, letter.nameFr)}</Text>
            <Text style={styles.titleArabic}>{letter.nameArabic}</Text>
          </View>
          <Pressable
            style={styles.shareHeaderButton}
            onPress={() => setShareContent({
              kind: 'letter',
              arabic: letter.letter,
              translit: letter.transliteration,
              translation: lc(letter.name, letter.nameFr),
              audioText: letter.nameArabic,
              ref: letter.nameArabic,
              route: `/alphabet/${letter.id}`,
            })}
            accessibilityLabel={t('community.shareToGroup', { defaultValue: 'Share to group' })}
          >
            <Ionicons name="paper-plane-outline" size={22} color={color.accent} />
          </Pressable>
          <Pressable
            style={[styles.audioButton, isSpeaking && styles.audioButtonActive]}
            onPress={() => {
              // Speak the letter name for better pronunciation
              __DEV__ && console.log('Audio button pressed for letter:', letter.nameArabic);
              speak(letter.nameArabic);
            }}
          >
            <Ionicons name="volume-high" size={24} color={isSpeaking ? "#ffffff" : "#D4AF37"} />
          </Pressable>
        </View>

        {/* Main Letter Display */}
        <View style={styles.mainLetterCard}>
          <Text style={[styles.mainLetter, arabicFont ? { fontFamily: arabicFont } : null]}>{letter.letter}</Text>
          <Text style={styles.transliteration}>{letter.transliteration}</Text>
          {isMastered && (
            <View style={styles.masteredBadge}>
              <Ionicons name="star" size={16} color={color.progress} />
              <Text style={styles.masteredText}>{t('common.mastered')}</Text>
            </View>
          )}
          {isLearned && !isMastered && (
            <View style={styles.learnedBadge}>
              <Ionicons name="checkmark-circle" size={16} color={color.sacred} />
              <Text style={styles.learnedText}>{t('common.learned')}</Text>
            </View>
          )}

          {/* Writing-style selector — applies to the letter, its forms and examples */}
          <View style={styles.scriptRow}>
            {SCRIPT_META.map((s) => (
              <Pressable
                key={s.key}
                style={[styles.scriptPill, script === s.key && { backgroundColor: `${s.color}22`, borderColor: s.color }]}
                onPress={() => setScript(s.key)}
              >
                <Text style={[styles.scriptPillText, script === s.key && { color: s.color }]}>{t(s.nameKey)}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Sound Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('alphabet.pronunciation')}</Text>
          <View style={styles.soundCard}>
            <Ionicons name="mic" size={24} color={color.accentStrong} />
            <Text style={styles.soundDescription}>{lc(letter.soundDescription, letter.soundDescriptionFr)}</Text>
          </View>
        </View>

        {/* Letter Forms */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('alphabet.letterForms')}</Text>
          <Text style={styles.sectionSubtitle}>
            {letter.connectable
              ? t('alphabet.connectsBothSides')
              : t('alphabet.connectsRightOnly')}
          </Text>
          <View style={styles.formsGrid}>
            {forms.map((form) => (
              <View key={form.key} style={styles.formCard}>
                <Text style={[styles.formLetter, arabicFont ? { fontFamily: arabicFont } : null]}>{form.form}</Text>
                <Text style={styles.formLabel}>{form.label}</Text>
                <Text style={styles.formLabelAr}>{form.labelAr}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Examples */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('alphabet.examples')}</Text>
          {letter.examples.map((example, index) => (
            <View key={index} style={styles.exampleCard}>
              <View style={styles.exampleLeft}>
                <Text style={[styles.exampleArabic, arabicFont ? { fontFamily: arabicFont } : null]}>{example.word}</Text>
                <Text style={styles.exampleTranslit}>{example.transliteration}</Text>
              </View>
              <View style={styles.exampleRight}>
                <Text style={styles.exampleMeaning}>{lc(example.meaning, example.meaningFr)}</Text>
                <View style={styles.positionBadge}>
                  <Text style={styles.positionText}>{example.position}</Text>
                </View>
              </View>
              <Pressable
                style={styles.exampleAudioBtn}
                onPress={() => speak(example.word)}
              >
                <Ionicons name="volume-medium" size={20} color={color.sacred} />
              </Pressable>
            </View>
          ))}
        </View>

        {/* Writing Practice Button */}
        <View style={styles.section}>
          <Pressable
            style={styles.writingButton}
            onPress={() =>
              router.push({
                pathname: '/alphabet/writing-practice',
                params: { letterId: letter.id },
              } as any)
            }
          >
            <Ionicons name="pencil" size={20} color={color.accent} />
            <Text style={styles.writingButtonText}>{t('alphabet.practiceWriting')}</Text>
          </Pressable>
        </View>

        {/* Action Buttons */}
        <View style={styles.section}>
          {!isLearned && (
            <Pressable style={styles.primaryButton} onPress={handleMarkLearned}>
              <Ionicons name="checkmark-circle" size={20} color={color.text} />
              <Text style={styles.primaryButtonText}>{t('alphabet.markLearned')}</Text>
            </Pressable>
          )}
          {isLearned && !isMastered && (
            <Pressable style={styles.masterButton} onPress={handleMarkMastered}>
              <Ionicons name="star" size={20} color={color.textOnAccent} />
              <Text style={styles.masterButtonText}>{t('alphabet.markMastered')}</Text>
            </Pressable>
          )}
        </View>

        {/* Navigation */}
        <View style={[styles.section, { marginBottom: 100 }]}>
          <View style={styles.navButtons}>
            {prevLetter ? (
              <Pressable
                style={styles.navButton}
                onPress={() => router.replace(`/alphabet/${prevLetter.id}` as any)}
              >
                <Ionicons name="chevron-back" size={20} color={color.text} />
                <Text style={styles.navButtonText}>{lc(prevLetter.name, prevLetter.nameFr)}</Text>
              </Pressable>
            ) : (
              <View style={styles.navButtonPlaceholder} />
            )}
            {nextLetter ? (
              <Pressable
                style={styles.navButton}
                onPress={() => router.replace(`/alphabet/${nextLetter.id}` as any)}
              >
                <Text style={styles.navButtonText}>{lc(nextLetter.name, nextLetter.nameFr)}</Text>
                <Ionicons name="chevron-forward" size={20} color={color.text} />
              </Pressable>
            ) : (
              <View style={styles.navButtonPlaceholder} />
            )}
          </View>
        </View>
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
    backgroundColor: color.bg,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: color.danger,
    fontSize: 18,
    marginBottom: 16,
  },
  backLink: {
    padding: 12,
  },
  backLinkText: {
    color: color.accentStrong,
    fontSize: 16,
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
  },
  headerText: {
    flex: 1,
    marginLeft: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: color.text,
  },
  titleArabic: {
    fontFamily: font.arabic,
    lineHeight: 38,
    fontSize: 22,
    color: color.sacred,
    marginTop: 2,
  },
  audioButton: {
    width: 48,
    height: 48,
    borderRadius: radius.xl,
    backgroundColor: withAlpha(color.sacred, 0.13),
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioButtonActive: {
    backgroundColor: color.sacred,
  },
  shareHeaderButton: {
    width: 48,
    height: 48,
    borderRadius: radius.xl,
    backgroundColor: withAlpha(color.accent, 0.13),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  mainLetterCard: {
    backgroundColor: color.surface,
    marginHorizontal: 20,
    borderRadius: radius.xl,
    padding: 40,
    alignItems: 'center',
    marginBottom: 24,
  },
  mainLetter: {
    fontSize: 120,
    lineHeight: 160, // room for tall scripts (Nastaliq) so glyphs don't clip
    color: color.text,
    marginBottom: 8,
  },
  scriptRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  scriptPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radius.lg,
    backgroundColor: color.bg,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  scriptPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: color.textMuted,
  },
  transliteration: {
    fontSize: 24,
    color: color.accentStrong,
    fontWeight: '600',
  },
  masteredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: withAlpha(color.progress, 0.13),
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radius.xl,
    marginTop: 16,
  },
  masteredText: {
    color: color.progress,
    fontWeight: '600',
    marginLeft: 6,
  },
  learnedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: withAlpha(color.sacred, 0.13),
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radius.xl,
    marginTop: 16,
  },
  learnedText: {
    color: color.sacred,
    fontWeight: '600',
    marginLeft: 6,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    color: color.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionSubtitle: {
    color: color.textMuted,
    fontSize: 14,
    marginBottom: 16,
  },
  soundCard: {
    backgroundColor: color.surface,
    borderRadius: radius.lg,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  soundDescription: {
    flex: 1,
    color: color.text,
    fontSize: 15,
    marginLeft: 16,
    lineHeight: 22,
  },
  formsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  formCard: {
    width: '23%',
    backgroundColor: color.surface,
    borderRadius: radius.md,
    padding: 16,
    margin: '1%',
    alignItems: 'center',
  },
  formLetter: {
    fontSize: 40,
    lineHeight: 62,
    color: color.text,
    marginBottom: 8,
  },
  formLabel: {
    fontSize: 12,
    color: color.textMuted,
    fontWeight: '600',
  },
  formLabelAr: {
    fontSize: 11,
    color: color.sacred,
    marginTop: 2,
  },
  exampleCard: {
    backgroundColor: color.surface,
    borderRadius: radius.lg,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  exampleLeft: {
    flex: 1,
  },
  exampleArabic: {
    fontFamily: font.arabic,
    fontSize: 36,
    lineHeight: 60,
    color: color.text,
    textAlign: 'left',
  },
  exampleTranslit: {
    fontSize: 14,
    color: color.accentStrong,
    marginTop: 4,
  },
  exampleRight: {
    alignItems: 'flex-end',
    marginRight: 12,
  },
  exampleMeaning: {
    fontSize: 14,
    color: color.text,
    fontWeight: '600',
  },
  positionBadge: {
    backgroundColor: color.surfaceRaised,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.sm,
    marginTop: 4,
  },
  positionText: {
    fontSize: 10,
    color: color.textMuted,
    textTransform: 'capitalize',
  },
  exampleAudioBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.xl,
    backgroundColor: withAlpha(color.sacred, 0.13),
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: color.accentStrong,
    borderRadius: radius.lg,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: color.text,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  masterButton: {
    backgroundColor: color.sacred,
    borderRadius: radius.lg,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  masterButtonText: {
    color: color.textOnAccent,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  navButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  navButton: {
    backgroundColor: color.surface,
    borderRadius: radius.md,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  navButtonText: {
    color: color.text,
    fontSize: 14,
    fontWeight: '600',
    marginHorizontal: 4,
  },
  navButtonPlaceholder: {
    width: 100,
  },
  writingButton: {
    backgroundColor: color.surface,
    borderRadius: radius.lg,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: withAlpha(color.accent, 0.25),
  },
  writingButtonText: {
    color: color.accent,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

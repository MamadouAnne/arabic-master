import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { arabicVerbs, getVerbById } from '../../../src/data/arabic/verbs/conjugations';
import { useArabicSpeech } from '../../../src/hooks/useArabicSpeech';
import { useLocalizedContent } from '../../../src/hooks/useLocalizedContent';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ShareToGroupModal } from '../../../src/components/community/ShareToGroupModal';
import type { SharedContent } from '../../../src/data/community/socialData';
import { font, color, radius } from '../../../src/theme/tokens';
import { withAlpha } from '../../../src/components/ui/Primitives';

type TenseType = 'past' | 'present' | 'future' | 'imperative';

const tenseColors: Record<TenseType, string> = {
  past: color.progress,
  present: color.accentStrong,
  future: color.sacred,
  imperative: color.warning,
};

const tenseLabels: Record<TenseType, { en: string; ar: string }> = {
  past: { en: 'Past', ar: 'الْمَاضِي' },
  present: { en: 'Present', ar: 'الْمُضَارِع' },
  future: { en: 'Future', ar: 'الْمُسْتَقْبَل' },
  imperative: { en: 'Command', ar: 'الْأَمْر' },
};

const personLabels = {
  full: [
    { key: 'firstPersonSingular', label: 'I', labelArabic: 'أَنَا' },
    { key: 'secondPersonMasculineSingular', label: 'You (m)', labelArabic: 'أَنْتَ' },
    { key: 'secondPersonFeminineSingular', label: 'You (f)', labelArabic: 'أَنْتِ' },
    { key: 'thirdPersonMasculineSingular', label: 'He', labelArabic: 'هُوَ' },
    { key: 'thirdPersonFeminineSingular', label: 'She', labelArabic: 'هِيَ' },
    { key: 'secondPersonDual', label: 'You two', labelArabic: 'أَنْتُمَا' },
    { key: 'thirdPersonMasculineDual', label: 'They two (m)', labelArabic: 'هُمَا' },
    { key: 'thirdPersonFeminineDual', label: 'They two (f)', labelArabic: 'هُمَا' },
    { key: 'firstPersonPlural', label: 'We', labelArabic: 'نَحْنُ' },
    { key: 'secondPersonMasculinePlural', label: 'You all (m)', labelArabic: 'أَنْتُمْ' },
    { key: 'secondPersonFemininePlural', label: 'You all (f)', labelArabic: 'أَنْتُنَّ' },
    { key: 'thirdPersonMasculinePlural', label: 'They (m)', labelArabic: 'هُمْ' },
    { key: 'thirdPersonFemininePlural', label: 'They (f)', labelArabic: 'هُنَّ' },
  ],
  imperative: [
    { key: 'secondPersonMasculineSingular', label: 'You (m)', labelArabic: 'أَنْتَ' },
    { key: 'secondPersonFeminineSingular', label: 'You (f)', labelArabic: 'أَنْتِ' },
    { key: 'secondPersonDual', label: 'You two', labelArabic: 'أَنْتُمَا' },
    { key: 'secondPersonMasculinePlural', label: 'You all (m)', labelArabic: 'أَنْتُمْ' },
    { key: 'secondPersonFemininePlural', label: 'You all (f)', labelArabic: 'أَنْتُنَّ' },
  ],
};

export default function VerbDetailScreen() {
  const { t } = useTranslation();
  const { lc } = useLocalizedContent();
  const { verbId } = useLocalSearchParams<{ verbId: string }>();
  const { speak, isSpeaking } = useArabicSpeech();
  const [activeTense, setActiveTense] = useState<TenseType>('present');
  const [shareContent, setShareContent] = useState<SharedContent | null>(null);

  const verb = getVerbById(verbId);

  if (!verb) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>{t('verbDetail.verbNotFound')}</Text>
      </SafeAreaView>
    );
  }

  const getConjugation = (tense: TenseType, personKey: string): string => {
    if (tense === 'imperative') {
      return (verb.conjugations.imperative as any)?.[personKey] || '-';
    }
    return (verb.conjugations[tense] as any)?.[personKey] || '-';
  };

  const getExamplesForTense = (tense: TenseType) => {
    return verb.examples?.filter(ex => ex.tense === tense) || [];
  };

  const currentLabels = activeTense === 'imperative' ? personLabels.imperative : personLabels.full;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={color.text} />
          </Pressable>
          <View style={styles.headerText}>
            <Pressable
              style={styles.verbTitleContainer}
              onPress={() => speak(verb.pastTense)}
            >
              <Text style={styles.verbTitle}>{verb.pastTense}</Text>
              <Ionicons name="volume-high" size={20} color={color.progress} />
            </Pressable>
            <Text style={styles.verbMeaning}>{lc(verb.meaning, verb.meaningFr)}</Text>
          </View>
          <Pressable
            style={styles.shareHeaderButton}
            onPress={() => {
              const pastExample = verb.examples?.find((ex) => ex.tense === 'past');
              setShareContent({
                kind: 'word',
                arabic: verb.pastTense,
                translit: pastExample?.transliteration,
                translation: lc(verb.meaning, verb.meaningFr),
                example: pastExample?.arabic,
                exampleTranslation: pastExample ? lc(pastExample.english, pastExample.french) : undefined,
                audioText: verb.pastTense,
                ref: `${t('verbs.title', { defaultValue: 'Verb' })} · ${verb.root}`,
                route: `/verbs/verb/${verb.id}`,
              });
            }}
            accessibilityLabel={t('community.shareToGroup', { defaultValue: 'Share to group' })}
          >
            <Ionicons name="paper-plane-outline" size={22} color={color.accent} />
          </Pressable>
        </View>

        {/* Verb Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>{t('verbDetail.root')}</Text>
              <Text style={styles.infoValue}>{verb.root}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>{t('verbDetail.form')}</Text>
              <Text style={styles.infoValue}>{verb.form}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>{t('verbDetail.level')}</Text>
              <Text style={styles.infoValue}>{verb.level}</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <Pressable style={styles.tensePreview} onPress={() => speak(verb.presentTense)}>
              <Text style={styles.tensePreviewLabel}>{t('verbDetail.present')}</Text>
              <Text style={styles.tensePreviewValue}>{verb.presentTense}</Text>
            </Pressable>
            <Pressable style={styles.tensePreview} onPress={() => speak(verb.pastTense)}>
              <Text style={styles.tensePreviewLabel}>{t('verbDetail.past')}</Text>
              <Text style={styles.tensePreviewValue}>{verb.pastTense}</Text>
            </Pressable>
          </View>
        </View>

        {/* Tense Tabs */}
        <View style={styles.tenseTabs}>
          {(['present', 'past', 'future', 'imperative'] as TenseType[]).map((tense) => (
            <Pressable
              key={tense}
              style={[
                styles.tenseTab,
                activeTense === tense && { backgroundColor: tenseColors[tense] + '30', borderColor: tenseColors[tense] },
              ]}
              onPress={() => setActiveTense(tense)}
            >
              <Text
                style={[
                  styles.tenseTabText,
                  activeTense === tense && { color: tenseColors[tense] },
                ]}
              >
                {tenseLabels[tense].en}
              </Text>
              <Text
                style={[
                  styles.tenseTabArabic,
                  activeTense === tense && { color: tenseColors[tense] },
                ]}
              >
                {tenseLabels[tense].ar}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Conjugation Table */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: tenseColors[activeTense] }]}>
            {t('verbDetail.tenseConjugations', { tense: tenseLabels[activeTense].en })}
          </Text>

          <View style={styles.conjugationTable}>
            {currentLabels.map((person) => {
              const conjugation = getConjugation(activeTense, person.key);
              return (
                <Pressable
                  key={person.key}
                  style={styles.conjugationRow}
                  onPress={() => speak(conjugation)}
                >
                  <View style={styles.personInfo}>
                    <Text style={styles.personLabel}>{person.label}</Text>
                    <Text style={styles.personArabic}>{person.labelArabic}</Text>
                  </View>
                  <View style={styles.conjugationValue}>
                    <Text style={styles.conjugationText}>{conjugation}</Text>
                    <Ionicons name="volume-high" size={16} color={tenseColors[activeTense]} />
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Examples */}
        {getExamplesForTense(activeTense).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('verbDetail.examples')}</Text>
            {getExamplesForTense(activeTense).map((example, idx) => (
              <Pressable
                key={idx}
                style={styles.exampleCard}
                onPress={() => speak(example.arabic)}
              >
                <View style={styles.exampleContent}>
                  <Text style={styles.exampleArabic}>{example.arabic}</Text>
                  <Text style={styles.exampleEnglish}>{example.english}</Text>
                </View>
                <Ionicons name="volume-high" size={20} color={tenseColors[activeTense]} />
              </Pressable>
            ))}
          </View>
        )}

        {/* All Examples Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('verbDetail.allExamples')}</Text>
          {verb.examples?.map((example, idx) => (
            <Pressable
              key={idx}
              style={styles.exampleCard}
              onPress={() => speak(example.arabic)}
            >
              <View style={styles.exampleContent}>
                <View style={[styles.tenseBadge, { backgroundColor: tenseColors[example.tense as TenseType] + '30' }]}>
                  <Text style={[styles.tenseBadgeText, { color: tenseColors[example.tense as TenseType] }]}>
                    {example.tense}
                  </Text>
                </View>
                <Text style={styles.exampleArabic}>{example.arabic}</Text>
                <Text style={styles.exampleEnglish}>{example.english}</Text>
              </View>
              <Ionicons name="volume-high" size={20} color={color.textFaint} />
            </Pressable>
          ))}
        </View>

        <View style={{ height: 100 }} />
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
  shareHeaderButton: {
    width: 40,
    height: 40,
    borderRadius: radius.xl,
    backgroundColor: withAlpha(color.accent, 0.13),
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
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
  verbTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  verbTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: color.text,
  },
  verbMeaning: {
    fontSize: 16,
    color: color.textMuted,
    marginTop: 4,
  },
  errorText: {
    color: color.danger,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
  },
  infoCard: {
    marginHorizontal: 20,
    backgroundColor: color.surface,
    borderRadius: radius.lg,
    padding: 16,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  infoItem: {
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 12,
    color: color.textFaint,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: color.text,
    fontWeight: '600',
  },
  tensePreview: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: color.bg,
    borderRadius: radius.sm,
    padding: 12,
    marginHorizontal: 4,
  },
  tensePreviewLabel: {
    fontSize: 11,
    color: color.textFaint,
    marginBottom: 4,
  },
  tensePreviewValue: {
    fontSize: 20,
    color: color.text,
    fontWeight: '600',
  },
  tenseTabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 24,
  },
  tenseTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: radius.md,
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tenseTabText: {
    fontSize: 12,
    color: color.textFaint,
    fontWeight: '600',
  },
  tenseTabArabic: {
    fontFamily: font.arabic,
    lineHeight: 19,
    fontSize: 11,
    color: color.textFaint,
    marginTop: 2,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: color.text,
    marginBottom: 16,
  },
  conjugationTable: {
    backgroundColor: color.surface,
    borderRadius: radius.lg,
    padding: 4,
  },
  conjugationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: color.border,
  },
  personInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  personLabel: {
    fontSize: 13,
    color: color.textMuted,
    width: 90,
  },
  personArabic: {
    fontFamily: font.arabic,
    lineHeight: 26,
    fontSize: 15,
    color: color.textFaint,
  },
  conjugationValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  conjugationText: {
    fontSize: 26,
    lineHeight: 44,
    color: color.text,
    fontWeight: '500',
  },
  exampleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: color.surface,
    borderRadius: radius.md,
    padding: 16,
    marginBottom: 8,
  },
  exampleContent: {
    flex: 1,
  },
  exampleArabic: {
    fontFamily: font.arabic,
    fontSize: 24,
    lineHeight: 42,
    color: color.text,
    marginBottom: 4,
  },
  exampleEnglish: {
    fontSize: 13,
    color: color.textFaint,
  },
  tenseBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 6,
  },
  tenseBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});

import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { arabicVerbs } from '../../src/data/arabic/verbs/conjugations';
import { useArabicSpeech } from '../../src/hooks/useArabicSpeech';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { font, color, radius } from '../../src/theme/tokens';

type TenseType = 'past' | 'present' | 'future' | 'imperative';

interface TenseInfo {
  id: TenseType;
  title: string;
  titleArabic: string;
  description: string;
  color: string;
  icon: keyof typeof Ionicons.glyphMap;
  personLabels: { key: string; label: string; labelArabic: string }[];
}

const tenseData: Record<TenseType, TenseInfo> = {
  past: {
    id: 'past',
    title: 'Past Tense',
    titleArabic: 'الْمَاضِي',
    description: 'Actions that have been completed. The base form of Arabic verbs.',
    color: color.progress,
    icon: 'time-outline',
    personLabels: [
      { key: 'firstPersonSingular', label: 'I', labelArabic: 'أَنَا' },
      { key: 'secondPersonMasculineSingular', label: 'You (m)', labelArabic: 'أَنْتَ' },
      { key: 'secondPersonFeminineSingular', label: 'You (f)', labelArabic: 'أَنْتِ' },
      { key: 'thirdPersonMasculineSingular', label: 'He', labelArabic: 'هُوَ' },
      { key: 'thirdPersonFeminineSingular', label: 'She', labelArabic: 'هِيَ' },
      { key: 'firstPersonPlural', label: 'We', labelArabic: 'نَحْنُ' },
      { key: 'thirdPersonMasculinePlural', label: 'They (m)', labelArabic: 'هُمْ' },
    ],
  },
  present: {
    id: 'present',
    title: 'Present Tense',
    titleArabic: 'الْمُضَارِع',
    description: 'Ongoing actions or habits. Uses prefixes (أ، ت، ي، ن).',
    color: color.accentStrong,
    icon: 'reload-outline',
    personLabels: [
      { key: 'firstPersonSingular', label: 'I', labelArabic: 'أَنَا' },
      { key: 'secondPersonMasculineSingular', label: 'You (m)', labelArabic: 'أَنْتَ' },
      { key: 'secondPersonFeminineSingular', label: 'You (f)', labelArabic: 'أَنْتِ' },
      { key: 'thirdPersonMasculineSingular', label: 'He', labelArabic: 'هُوَ' },
      { key: 'thirdPersonFeminineSingular', label: 'She', labelArabic: 'هِيَ' },
      { key: 'firstPersonPlural', label: 'We', labelArabic: 'نَحْنُ' },
      { key: 'thirdPersonMasculinePlural', label: 'They (m)', labelArabic: 'هُمْ' },
    ],
  },
  future: {
    id: 'future',
    title: 'Future Tense',
    titleArabic: 'الْمُسْتَقْبَل',
    description: 'Actions that will happen. Add سَـ or سَوْفَ before present tense.',
    color: color.sacred,
    icon: 'arrow-forward-outline',
    personLabels: [
      { key: 'firstPersonSingular', label: 'I will', labelArabic: 'أَنَا' },
      { key: 'secondPersonMasculineSingular', label: 'You will (m)', labelArabic: 'أَنْتَ' },
      { key: 'secondPersonFeminineSingular', label: 'You will (f)', labelArabic: 'أَنْتِ' },
      { key: 'thirdPersonMasculineSingular', label: 'He will', labelArabic: 'هُوَ' },
      { key: 'thirdPersonFeminineSingular', label: 'She will', labelArabic: 'هِيَ' },
      { key: 'firstPersonPlural', label: 'We will', labelArabic: 'نَحْنُ' },
      { key: 'thirdPersonMasculinePlural', label: 'They will', labelArabic: 'هُمْ' },
    ],
  },
  imperative: {
    id: 'imperative',
    title: 'Commands',
    titleArabic: 'الْأَمْر',
    description: 'Direct orders or requests. Only for "you" forms.',
    color: color.warning,
    icon: 'megaphone-outline',
    personLabels: [
      { key: 'secondPersonMasculineSingular', label: 'You (m)', labelArabic: 'أَنْتَ' },
      { key: 'secondPersonFeminineSingular', label: 'You (f)', labelArabic: 'أَنْتِ' },
      { key: 'secondPersonDual', label: 'You two', labelArabic: 'أَنْتُمَا' },
      { key: 'secondPersonMasculinePlural', label: 'You all (m)', labelArabic: 'أَنْتُمْ' },
      { key: 'secondPersonFemininePlural', label: 'You all (f)', labelArabic: 'أَنْتُنَّ' },
    ],
  },
};

export default function TenseDetailScreen() {
  const { t } = useTranslation();
  const { tenseId } = useLocalSearchParams<{ tenseId: string }>();
  const { speak, isSpeaking } = useArabicSpeech();
  const [selectedVerb, setSelectedVerb] = useState<string | null>(null);

  const tense = tenseData[tenseId as TenseType];

  if (!tense) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>{t('verbTense.tenseNotFound')}</Text>
      </SafeAreaView>
    );
  }

  const getConjugation = (verb: typeof arabicVerbs[0], personKey: string): string => {
    if (tenseId === 'imperative') {
      return (verb.conjugations.imperative as any)?.[personKey] || '-';
    }
    return (verb.conjugations[tenseId as 'past' | 'present' | 'future'] as any)?.[personKey] || '-';
  };

  const getExamplesForTense = (verb: typeof arabicVerbs[0]) => {
    return verb.examples?.filter(ex => ex.tense === tenseId) || [];
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
            <Text style={styles.title}>{tense.title}</Text>
            <Text style={[styles.titleArabic, { color: tense.color }]}>{tense.titleArabic}</Text>
          </View>
        </View>

        {/* Description Card */}
        <View style={[styles.descCard, { borderColor: tense.color + '40' }]}>
          <Ionicons name={tense.icon} size={24} color={tense.color} />
          <Text style={styles.descText}>{tense.description}</Text>
        </View>

        {/* Pattern Explanation */}
        {tenseId === 'past' && (
          <View style={styles.patternCard}>
            <Text style={styles.patternTitle}>{t('verbTense.patternRecognition')}</Text>
            <Text style={styles.patternText}>
              {t('verbTense.pastTenseEndings')} <Text style={styles.highlight}>ـتُ</Text> (I), <Text style={styles.highlight}>ـتَ</Text> (you m), <Text style={styles.highlight}>ـتِ</Text> (you f), <Text style={styles.highlight}>ـنَا</Text> (we), <Text style={styles.highlight}>ـوا</Text> (they)
            </Text>
          </View>
        )}
        {tenseId === 'present' && (
          <View style={styles.patternCard}>
            <Text style={styles.patternTitle}>{t('verbTense.patternRecognition')}</Text>
            <Text style={styles.patternText}>
              {t('verbTense.presentPrefixes')} <Text style={styles.highlight}>أَ</Text> (I), <Text style={styles.highlight}>تَ</Text> (you/she), <Text style={styles.highlight}>يَ</Text> (he/they), <Text style={styles.highlight}>نَ</Text> (we)
            </Text>
          </View>
        )}
        {tenseId === 'future' && (
          <View style={styles.patternCard}>
            <Text style={styles.patternTitle}>{t('verbTense.patternRecognition')}</Text>
            <Text style={styles.patternText}>
              Future = <Text style={styles.highlight}>سَـ</Text> + present tense. Example: يَكْتُبُ → <Text style={styles.highlight}>سَـ</Text>يَكْتُبُ
            </Text>
          </View>
        )}
        {tenseId === 'imperative' && (
          <View style={styles.patternCard}>
            <Text style={styles.patternTitle}>{t('verbTense.patternRecognition')}</Text>
            <Text style={styles.patternText}>
              Commands drop the present prefix and may add <Text style={styles.highlight}>اِ</Text> at the start. Only for "you" forms!
            </Text>
          </View>
        )}

        {/* Verbs List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('verbTense.allVerbsIn', { tense: tense.title })}</Text>

          {arabicVerbs.map((verb) => (
            <View key={verb.id} style={styles.verbCard}>
              {/* Verb Header */}
              <Pressable
                style={styles.verbHeader}
                onPress={() => setSelectedVerb(selectedVerb === verb.id ? null : verb.id)}
              >
                <View style={styles.verbInfo}>
                  <Pressable
                    style={[styles.verbArabic, { backgroundColor: tense.color + '20' }]}
                    onPress={() => speak(verb.pastTense)}
                  >
                    <Text style={[styles.verbArabicText, { color: tense.color }]}>
                      {tenseId === 'present' ? verb.presentTense : verb.pastTense}
                    </Text>
                    <Ionicons name="volume-high" size={16} color={tense.color} />
                  </Pressable>
                  <View>
                    <Text style={styles.verbMeaning}>{verb.meaning}</Text>
                    <Text style={styles.verbRoot}>{t('verbTense.root')} {verb.root}</Text>
                  </View>
                </View>
                <Ionicons
                  name={selectedVerb === verb.id ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={color.textFaint}
                />
              </Pressable>

              {/* Expanded Content */}
              {selectedVerb === verb.id && (
                <View style={styles.verbExpanded}>
                  {/* Conjugation Table */}
                  <View style={styles.conjugationTable}>
                    {tense.personLabels.map((person) => (
                      <Pressable
                        key={person.key}
                        style={styles.conjugationRow}
                        onPress={() => speak(getConjugation(verb, person.key))}
                      >
                        <View style={styles.personInfo}>
                          <Text style={styles.personLabel}>{person.label}</Text>
                          <Text style={styles.personArabic}>{person.labelArabic}</Text>
                        </View>
                        <View style={styles.conjugationValue}>
                          <Text style={styles.conjugationText}>
                            {getConjugation(verb, person.key)}
                          </Text>
                          <Ionicons name="volume-high" size={14} color={color.textFaint} />
                        </View>
                      </Pressable>
                    ))}
                  </View>

                  {/* Examples */}
                  {getExamplesForTense(verb).length > 0 && (
                    <View style={styles.examplesSection}>
                      <Text style={styles.examplesTitle}>{t('verbTense.examples')}</Text>
                      {getExamplesForTense(verb).map((example, idx) => (
                        <Pressable
                          key={idx}
                          style={styles.exampleCard}
                          onPress={() => speak(example.arabic)}
                        >
                          <View style={styles.exampleContent}>
                            <Text style={styles.exampleArabic}>{example.arabic}</Text>
                            <Text style={styles.exampleEnglish}>{example.english}</Text>
                          </View>
                          <Ionicons name="volume-high" size={18} color={tense.color} />
                        </Pressable>
                      ))}
                    </View>
                  )}
                </View>
              )}
            </View>
          ))}
        </View>

        <View style={{ height: 100 }} />
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
    lineHeight: 40,
    fontSize: 24,
    marginTop: 4,
  },
  errorText: {
    color: color.danger,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
  },
  descCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    backgroundColor: color.surface,
    borderRadius: radius.md,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    gap: 12,
  },
  descText: {
    flex: 1,
    color: color.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  patternCard: {
    marginHorizontal: 20,
    backgroundColor: color.surface,
    borderRadius: radius.md,
    padding: 16,
    marginBottom: 24,
  },
  patternTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: color.text,
    marginBottom: 8,
  },
  patternText: {
    fontSize: 13,
    color: color.textMuted,
    lineHeight: 20,
  },
  highlight: {
    color: color.progress,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: color.text,
    marginBottom: 16,
  },
  verbCard: {
    backgroundColor: color.surface,
    borderRadius: radius.lg,
    marginBottom: 12,
    overflow: 'hidden',
  },
  verbHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  verbInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  verbArabic: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.sm,
    gap: 6,
  },
  verbArabicText: {
    fontFamily: font.arabic,
    lineHeight: 40,
    fontSize: 24,
    fontWeight: '600',
  },
  verbMeaning: {
    fontSize: 14,
    color: color.text,
    fontWeight: '500',
  },
  verbRoot: {
    fontSize: 12,
    color: color.textFaint,
    marginTop: 2,
  },
  verbExpanded: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: color.border,
  },
  conjugationTable: {
    marginTop: 12,
  },
  conjugationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: color.border,
  },
  personInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  personLabel: {
    fontSize: 13,
    color: color.textMuted,
    width: 80,
  },
  personArabic: {
    fontFamily: font.arabic,
    lineHeight: 30,
    fontSize: 18,
    color: color.textFaint,
  },
  conjugationValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  conjugationText: {
    fontSize: 18,
    color: color.text,
    fontWeight: '500',
  },
  examplesSection: {
    marginTop: 16,
  },
  examplesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: color.textMuted,
    marginBottom: 8,
  },
  exampleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: color.bg,
    borderRadius: radius.sm,
    padding: 12,
    marginBottom: 8,
  },
  exampleContent: {
    flex: 1,
  },
  exampleArabic: {
    fontFamily: font.arabic,
    lineHeight: 34,
    fontSize: 20,
    color: color.text,
    marginBottom: 4,
  },
  exampleEnglish: {
    fontSize: 12,
    color: color.textFaint,
  },
});

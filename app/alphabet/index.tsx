import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { arabicLetters } from '../../src/data/arabic/alphabet/letters';
import { useProgressStore } from '../../src/stores/progressStore';
import { useArabicSpeech } from '../../src/hooks/useArabicSpeech';
import { useLocalizedContent } from '../../src/hooks/useLocalizedContent';
import { font, color, radius } from '../../src/theme/tokens';
import { withAlpha } from '../../src/components/ui/Primitives';

export default function AlphabetScreen() {
  const { t } = useTranslation();
  const { lc } = useLocalizedContent();
  const { progress, getAlphabetCompletionPercent } = useProgressStore();
  const { speak, isSpeaking } = useArabicSpeech();
  const learnedLetters = progress.alphabetProgress.lettersLearned;
  const masteredLetters = progress.alphabetProgress.masteredLetters;

  const getLetterStatus = (letterId: string) => {
    if (masteredLetters.includes(letterId)) return 'mastered';
    if (learnedLetters.includes(letterId)) return 'learned';
    return 'new';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'mastered':
        return '#22c55e';
      case 'learned':
        return color.sacred;
      default:
        return '#6366f1';
    }
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
            <Text style={styles.title}>{t('alphabet.title')}</Text>
            <Text style={styles.titleArabic}>الْحُرُوفُ الْعَرَبِيَّة</Text>
          </View>
        </View>

        {/* Progress Card */}
        <View style={styles.progressCard}>
          <View style={styles.progressInfo}>
            <Text style={styles.progressLabel}>{t('common.yourProgress')}</Text>
            <Text style={styles.progressValue}>
              {t('alphabet.lettersLearnedCount', { count: learnedLetters.length })}
            </Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${getAlphabetCompletionPercent()}%` },
                ]}
              />
            </View>
            <Text style={styles.progressPercent}>
              {getAlphabetCompletionPercent()}%
            </Text>
          </View>
        </View>

        {/* Print vs Handwriting entry */}
        <Pressable style={styles.scriptsCard} onPress={() => router.push('/alphabet/styles' as any)}>
          <View style={styles.scriptsIcon}>
            <Ionicons name="brush" size={20} color={color.accentStrong} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.scriptsTitle}>{t('alphabet.scriptsCardTitle')}</Text>
            <Text style={styles.scriptsDesc}>{t('alphabet.scriptsCardDesc')}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={color.textFaint} />
        </Pressable>

        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: color.accentStrong }]} />
            <Text style={styles.legendText}>{t('common.new')}</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: color.sacred }]} />
            <Text style={styles.legendText}>{t('common.learned')}</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: color.progress }]} />
            <Text style={styles.legendText}>{t('common.mastered')}</Text>
          </View>
        </View>

        {/* Letter Grid - 28 Letters */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('alphabet.lettersCount')}</Text>
          <View style={styles.letterGrid}>
            {arabicLetters.map((letter) => {
              const status = getLetterStatus(letter.id);
              const statusColor = getStatusColor(status);
              return (
                <Pressable
                  key={letter.id}
                  style={[styles.letterCard, { borderColor: statusColor }]}
                  onPress={() => router.push(`/alphabet/${letter.id}` as any)}
                >
                  <Text style={styles.letterArabic}>{letter.letter}</Text>
                  <Text style={styles.letterName}>{lc(letter.name, letter.nameFr)}</Text>
                  <Text style={styles.letterTranslit}>{letter.transliteration}</Text>
                  <Pressable
                    style={styles.letterAudioBtn}
                    onPress={(e) => {
                      e.stopPropagation();
                      speak(letter.letter);
                    }}
                  >
                    <Ionicons name="volume-medium" size={14} color={color.sacred} />
                  </Pressable>
                  {status !== 'new' && (
                    <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                      <Ionicons
                        name={status === 'mastered' ? 'star' : 'checkmark'}
                        size={10}
                        color="white"
                      />
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Sun & Moon Letters Card */}
        <View style={styles.specialSection}>
          <Pressable
            style={styles.sunMoonCard}
            onPress={() => router.push('/alphabet/sun-moon-letters' as any)}
          >
            <View style={styles.sunMoonIcons}>
              <View style={styles.sunIcon}>
                <Ionicons name="sunny" size={24} color={color.warning} />
              </View>
              <View style={styles.moonIcon}>
                <Ionicons name="moon" size={24} color={color.accent} />
              </View>
            </View>
            <View style={styles.sunMoonContent}>
              <Text style={styles.sunMoonTitle}>{t('alphabet.sunMoonLetters')}</Text>
              <Text style={styles.sunMoonTitleAr}>الْحُرُوفُ الشَّمْسِيَّة وَالْقَمَرِيَّة</Text>
              <Text style={styles.sunMoonDesc}>{t('alphabet.sunMoonDesc')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={color.textFaint} />
          </Pressable>
        </View>


        {/* Study Tips */}
        <View style={[styles.section, { marginBottom: 100 }]}>
          <Text style={styles.sectionTitle}>{t('alphabet.studyTips')}</Text>
          <View style={styles.tipCard}>
            <View style={styles.tipIcon}>
              <Ionicons name="bulb" size={24} color={color.sacred} />
            </View>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>{t('alphabet.letterForms')}</Text>
              <Text style={styles.tipText}>
                {t('alphabet.letterFormsDesc')}
              </Text>
            </View>
          </View>
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
    color: color.sacred,
    marginTop: 4,
  },
  progressCard: {
    backgroundColor: color.surface,
    marginHorizontal: 20,
    borderRadius: radius.lg,
    padding: 20,
    marginBottom: 16,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  progressLabel: {
    color: color.textMuted,
    fontSize: 14,
  },
  progressValue: {
    color: color.text,
    fontSize: 14,
    fontWeight: '600',
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: color.surfaceRaised,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: color.accentStrong,
    borderRadius: 4,
  },
  progressPercent: {
    color: color.textMuted,
    fontSize: 12,
    marginLeft: 12,
    width: 36,
    textAlign: 'right',
  },
  scriptsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 16,
    marginBottom: 20,
    padding: 14,
    backgroundColor: color.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: color.border,
  },
  scriptsIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(99,102,241,0.15)',
  },
  scriptsTitle: { fontSize: 15, fontWeight: '700', color: color.text },
  scriptsDesc: { fontSize: 12.5, color: color.textMuted, marginTop: 2 },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
    gap: 24,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  legendText: {
    color: color.textMuted,
    fontSize: 12,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    color: color.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  letterGrid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  letterCard: {
    width: '23%',
    aspectRatio: 0.85,
    backgroundColor: color.surface,
    borderRadius: radius.md,
    padding: 8,
    margin: '1%',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    position: 'relative',
  },
  letterArabic: {
    fontFamily: font.arabic,
    lineHeight: 54,
    fontSize: 32,
    color: color.text,
    marginBottom: 4,
  },
  letterName: {
    fontSize: 10,
    color: color.textMuted,
    textAlign: 'center',
  },
  letterTranslit: {
    fontSize: 9,
    color: color.textFaint,
    textAlign: 'center',
  },
  letterAudioBtn: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    width: 22,
    height: 22,
    borderRadius: radius.md,
    backgroundColor: withAlpha(color.sacred, 0.13),
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipCard: {
    backgroundColor: color.surface,
    borderRadius: radius.lg,
    padding: 16,
    flexDirection: 'row',
  },
  tipIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.xl,
    backgroundColor: withAlpha(color.sacred, 0.13),
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipContent: {
    flex: 1,
    marginLeft: 16,
  },
  tipTitle: {
    color: color.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  tipText: {
    color: color.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  specialSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sunMoonCard: {
    backgroundColor: color.surface,
    borderRadius: radius.lg,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: withAlpha(color.accentStrong, 0.25),
    overflow: 'hidden',
  },
  sunMoonIcons: {
    flexDirection: 'row',
    marginRight: 14,
  },
  sunIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.xl,
    backgroundColor: withAlpha(color.warning, 0.13),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: -10,
    zIndex: 1,
  },
  moonIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.xl,
    backgroundColor: withAlpha(color.accentStrong, 0.13),
    alignItems: 'center',
    justifyContent: 'center',
  },
  sunMoonContent: {
    flex: 1,
  },
  sunMoonTitle: {
    color: color.text,
    fontSize: 16,
    fontWeight: '600',
  },
  sunMoonTitleAr: {
    color: color.sacred,
    fontSize: 13,
    marginTop: 2,
  },
  sunMoonDesc: {
    color: color.textMuted,
    fontSize: 12,
    marginTop: 4,
  },
});

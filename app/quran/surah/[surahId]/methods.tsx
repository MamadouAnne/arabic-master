import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { getSurahById } from '../../../../src/data/arabic/quran';
import { useQuranStore } from '../../../../src/stores/quranStore';
import { LEARNING_METHODS, LearningMethodOption, AgeGroup } from '../../../../src/types/learningMethod';
import { font, color, radius } from '../../../../src/theme/tokens';

export default function MethodPickerScreen() {
  const { t } = useTranslation();
  const { surahId } = useLocalSearchParams<{ surahId: string }>();
  const surah = getSurahById(surahId);
  const { setLastSelectedMethod, startSurah } = useQuranStore();

  const AGE_LABELS: Record<AgeGroup, string> = {
    under_25: t('learningMethods.ageUnder25'),
    age_25_40: t('learningMethods.age25to40'),
    age_40_plus: t('learningMethods.age40plus'),
  };

  if (!surah) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>{t('common.notFound')}</Text>
      </SafeAreaView>
    );
  }

  const handleMethodSelect = (method: LearningMethodOption) => {
    setLastSelectedMethod(method.id);
    startSurah(surahId);
    router.push(`/quran/surah/${surahId}/${method.route}` as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel={t('common.back')}
        >
          <Ionicons name="arrow-back" size={24} color={color.text} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.surahNameArabic}>{surah.nameArabic}</Text>
          <Text style={styles.subtitle}>{t('learningMethods.title')}</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      {/* Method Cards */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {LEARNING_METHODS.map((method) => (
          <Pressable
            key={method.id}
            style={styles.methodCard}
            onPress={() => handleMethodSelect(method)}
            accessibilityRole="button"
            accessibilityLabel={t(method.nameKey)}
          >
            <View style={[styles.accentBorder, { backgroundColor: method.color }]} />

            <View style={styles.methodContent}>
              {/* Icon */}
              <View style={[styles.iconCircle, { backgroundColor: `${method.color}20` }]}>
                <Ionicons
                  name={method.icon as any}
                  size={24}
                  color={method.color}
                />
              </View>

              {/* Text content */}
              <View style={styles.methodInfo}>
                <Text style={styles.methodName}>
                  {t(method.nameKey)}
                </Text>
                <Text style={styles.methodDesc}>
                  {t(method.descriptionKey)}
                </Text>
                {/* Best for badge */}
                <View style={[styles.bestForBadge, { backgroundColor: `${method.color}15` }]}>
                  <Text style={[styles.bestForText, { color: method.color }]}>
                    {t(method.bestForKey)}
                  </Text>
                </View>
                {/* Age group pills */}
                <View style={styles.agePillsRow}>
                  {method.recommendedAges.map((age) => (
                    <View
                      key={age}
                      style={[styles.agePill, { backgroundColor: `${method.color}15` }]}
                    >
                      <Text style={[styles.agePillText, { color: method.color }]}>
                        {AGE_LABELS[age]}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Right indicator */}
              <View style={styles.rightIndicator}>
                <Ionicons name="chevron-forward" size={20} color={color.textMuted} />
              </View>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.bg,
  },
  errorText: {
    color: color.textMuted,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  surahNameArabic: {
    fontFamily: font.arabic,
    lineHeight: 37,
    color: color.sacred,
    fontSize: 22,
    fontWeight: 'bold',
  },
  subtitle: {
    color: color.textMuted,
    fontSize: 14,
    marginTop: 4,
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 10,
  },
  methodCard: {
    backgroundColor: color.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: color.border,
  },
  accentBorder: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  methodContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingLeft: 16,
    gap: 14,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodInfo: {
    flex: 1,
  },
  methodName: {
    color: color.text,
    fontSize: 16,
    fontWeight: '600',
  },
  methodDesc: {
    color: color.textMuted,
    fontSize: 13,
    marginTop: 3,
    lineHeight: 18,
  },
  bestForBadge: {
    alignSelf: 'flex-start',
    borderRadius: radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginTop: 8,
  },
  bestForText: {
    fontSize: 11,
    fontWeight: '600',
  },
  agePillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  agePill: {
    borderRadius: radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  agePillText: {
    fontSize: 10,
    fontWeight: '600',
  },
  rightIndicator: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 4,
  },
});

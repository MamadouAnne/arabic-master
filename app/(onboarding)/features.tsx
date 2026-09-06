import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useRef, useState } from 'react';
import { font, color, radius } from '../../src/theme/tokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface FeaturePage {
  titleKey: string;
  descKey: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  arabic: string;
}

const FEATURES: FeaturePage[] = [
  {
    titleKey: 'onboarding.feature1Title',
    descKey: 'onboarding.feature1Desc',
    icon: 'text',
    color: color.accentStrong,
    arabic: 'اللغة العربية',
  },
  {
    titleKey: 'onboarding.feature2Title',
    descKey: 'onboarding.feature2Desc',
    icon: 'book',
    color: color.progress,
    arabic: 'القرآن والعلم',
  },
  {
    titleKey: 'onboarding.feature3Title',
    descKey: 'onboarding.feature3Desc',
    icon: 'calendar',
    color: color.warning,
    arabic: 'التدريب اليومي',
  },
];

export default function FeaturesScreen() {
  const { t } = useTranslation();
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const activeColor = FEATURES[activeIndex].color;
  const isLast = activeIndex === FEATURES.length - 1;

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SCREEN_WIDTH);
    setActiveIndex(index);
  };

  const handleNext = () => {
    if (!isLast) {
      scrollRef.current?.scrollTo({ x: (activeIndex + 1) * SCREEN_WIDTH, animated: true });
    } else {
      router.push('/(onboarding)/goals');
    }
  };

  const handleSkip = () => {
    router.push('/(onboarding)/goals');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Skip button */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.skipButton}
          activeOpacity={0.7}
          onPress={handleSkip}
          accessibilityRole="button"
          accessibilityLabel={t('common.skip')}
        >
          <Text style={styles.skipText}>{t('common.skip')}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        style={styles.scrollView}
      >
        {FEATURES.map((feature, index) => (
          <View key={index} style={[styles.page, { width: SCREEN_WIDTH }]}>
            <View style={[styles.iconCircle, { backgroundColor: feature.color + '20' }]}>
              <Ionicons name={feature.icon} size={48} color={feature.color} />
            </View>
            <Text style={styles.arabicTitle}>{feature.arabic}</Text>
            <Text style={styles.featureTitle}>{t(feature.titleKey)}</Text>
            <Text style={styles.featureDesc}>{t(feature.descKey)}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.bottomSection}>
        {/* Progress dots */}
        <View style={styles.dotsRow}>
          {FEATURES.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                { backgroundColor: index === activeIndex ? activeColor: color.textFaint },
                index === activeIndex && { width: 24 },
              ]}
            />
          ))}
        </View>

        {/* Next button */}
        <TouchableOpacity
          style={[styles.nextButton, { backgroundColor: activeColor }]}
          activeOpacity={0.8}
          onPress={handleNext}
          accessibilityRole="button"
          accessibilityLabel={isLast ? t('common.continue') : t('common.next')}
        >
          <Text style={styles.nextButtonText}>
            {isLast ? t('common.continue') : t('common.next')}
          </Text>
          <View style={styles.nextButtonIcon}>
            <Ionicons
              name={isLast ? 'checkmark' : 'arrow-forward'}
              size={18}
              color={activeColor}
            />
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.bg,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  skipButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radius.xl,
    backgroundColor: color.surface,
  },
  skipText: {
    color: color.textMuted,
    fontSize: 14,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  page: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  arabicTitle: {
    fontFamily: font.arabic,
    lineHeight: 40,
    color: color.sacred,
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
  },
  featureTitle: {
    color: color.text,
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 14,
  },
  featureDesc: {
    color: color.textMuted,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 8,
  },
  bottomSection: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    alignItems: 'center',
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  nextButton: {
    paddingVertical: 18,
    borderRadius: radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
  },
  nextButtonText: {
    color: color.text,
    fontSize: 17,
    fontWeight: '700',
    marginRight: 10,
  },
  nextButtonIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.lg,
    backgroundColor: color.text,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

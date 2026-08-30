import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { color, radius } from '../../src/theme/tokens';
import { withAlpha } from '../../src/components/ui/Primitives';

export default function WelcomeScreen() {
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.logoSection}>
        <Image
          source={require('../../assets/images/adaptive-icon.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />
        <Text style={styles.appName}>Iqra AI</Text>
        <Text style={styles.tagline}>{t('onboarding.welcomeTagline')}</Text>
      </View>

      <View style={styles.bottomSection}>
        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.8}
          onPress={() => router.push('/(onboarding)/features')}
          accessibilityRole="button"
          accessibilityLabel={t('common.getStarted')}
        >
          <Text style={styles.buttonText}>{t('common.getStarted')}</Text>
          <View style={styles.buttonIcon}>
            <Ionicons name="arrow-forward" size={18} color={color.sacred} />
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
  logoSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  logoImage: {
    width: 190,
    height: 190,
    marginBottom: 16,
  },
  appName: {
    color: color.text,
    fontSize: 36,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 12,
  },
  tagline: {
    color: color.textMuted,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 24,
  },
  bottomSection: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  button: {
    backgroundColor: color.sacred,
    paddingVertical: 18,
    borderRadius: radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: color.textOnAccent,
    fontSize: 17,
    fontWeight: '700',
    marginRight: 10,
  },
  buttonIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.lg,
    backgroundColor: withAlpha(color.bg, 0.13),
    alignItems: 'center',
    justifyContent: 'center',
  },
});

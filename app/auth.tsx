import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { signUpWithEmail, signInWithEmail, resetPassword, signInWithGoogle, signInWithApple } from '../src/services/authService';
import { color, radius } from '../src/theme/tokens';

// Feature flag: set to true once Google/Apple OAuth credentials are configured
const ENABLE_SOCIAL_LOGIN = false;

export default function AuthScreen() {
  const { t } = useTranslation();
  const [mode, setMode] = useState<'signIn' | 'signUp'>('signIn');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<'google' | 'apple' | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  const isSignUp = mode === 'signUp';
  const isAnyLoading = loading || socialLoading !== null;

  const validate = () => {
    if (isSignUp && !fullName.trim()) {
      Alert.alert(t('common.error'), t('auth.fullNameRequired'));
      return false;
    }
    if (!email.trim()) {
      Alert.alert(t('common.error'), t('auth.emailRequired'));
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      Alert.alert(t('common.error'), t('auth.invalidEmail'));
      return false;
    }
    if (!password) {
      Alert.alert(t('common.error'), t('auth.passwordRequired'));
      return false;
    }
    if (isSignUp && password.length < 6) {
      Alert.alert(t('common.error'), t('auth.passwordMinLength'));
      return false;
    }
    if (isSignUp && email.toLowerCase() !== confirmEmail.toLowerCase()) {
      Alert.alert(t('common.error'), t('auth.emailsDoNotMatch'));
      return false;
    }
    if (isSignUp && password !== confirmPassword) {
      Alert.alert(t('common.error'), t('auth.passwordsDoNotMatch'));
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate() || isAnyLoading) return;
    setLoading(true);
    try {
      if (isSignUp) {
        const data = await signUpWithEmail(email, password, fullName.trim());
        // If email confirmation is required, the session will be null
        if (data.session) {
          router.replace('/(tabs)');
        } else {
          Alert.alert(t('auth.checkEmail'), t('auth.confirmEmailSent'));
          setMode('signIn');
        }
      } else {
        await signInWithEmail(email, password);
        router.replace('/(tabs)');
      }
    } catch (err: any) {
      const msg = (err.message || '').toLowerCase();
      let userMessage = t('auth.genericError');
      if (msg.includes('invalid login') || msg.includes('invalid password') || msg.includes('unauthorized')) {
        userMessage = t('auth.invalidCredentials');
      } else if (msg.includes('email not confirmed')) {
        userMessage = t('auth.emailNotConfirmed');
      } else if (msg.includes('already registered') || msg.includes('duplicate') || msg.includes('already exists')) {
        userMessage = t('auth.emailAlreadyRegistered');
      } else if (msg.includes('network') || msg.includes('fetch') || msg.includes('timeout')) {
        userMessage = t('auth.networkError');
      } else if (msg.includes('rate') || msg.includes('too many')) {
        userMessage = t('auth.tooManyAttempts');
      } else if (err.message) {
        // Show actual error for unhandled cases
        userMessage = err.message;
      }
      Alert.alert(t('common.error'), userMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetEmail.trim()) {
      Alert.alert(t('common.error'), t('auth.emailRequired'));
      return;
    }
    setLoading(true);
    try {
      await resetPassword(resetEmail);
      Alert.alert('', t('auth.resetSent'));
      setShowResetModal(false);
      setResetEmail('');
    } catch (err: any) {
      const msg = (err.message || '').toLowerCase();
      let userMessage = t('auth.genericError');
      if (msg.includes('rate') || msg.includes('too many')) {
        userMessage = t('auth.tooManyAttempts');
      } else if (err.message) {
        userMessage = err.message;
      }
      Alert.alert(t('common.error'), userMessage);
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode(isSignUp ? 'signIn' : 'signUp');
    setFullName('');
    setConfirmEmail('');
    setConfirmPassword('');
  };

  const handleGoogleSignIn = async () => {
    if (isAnyLoading) return;
    setSocialLoading('google');
    try {
      await signInWithGoogle();
      router.replace('/(tabs)');
    } catch (err: any) {
      // statusCodes.SIGN_IN_CANCELLED = '12501', IN_PROGRESS = '12502'
      const code = err?.code;
      if (code === '12501' || code === 'SIGN_IN_CANCELLED') return;
      if (code === '12502' || code === 'IN_PROGRESS') return;

      const msg = (err.message || '').toLowerCase();
      if (msg.includes('canceled') || msg.includes('cancelled')) return;
      if (msg.includes('play services')) {
        Alert.alert(t('common.error'), t('auth.googlePlayServicesError'));
      } else {
        Alert.alert(t('common.error'), t('auth.genericError'));
      }
    } finally {
      setSocialLoading(null);
    }
  };

  const handleAppleSignIn = async () => {
    if (isAnyLoading) return;
    setSocialLoading('apple');
    try {
      await signInWithApple();
      router.replace('/(tabs)');
    } catch (err: any) {
      // ERR_REQUEST_CANCELED = user dismissed the Apple prompt
      if (err?.code === 'ERR_REQUEST_CANCELED' || err?.code === 'ERR_CANCELED') return;
      const msg = (err.message || '').toLowerCase();
      if (msg.includes('canceled') || msg.includes('cancelled')) return;
      Alert.alert(t('common.error'), t('auth.genericError'));
    } finally {
      setSocialLoading(null);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Image
              source={require('../assets/images/adaptive-icon.png')}
              style={styles.logoImage}
            />
            <Text style={styles.headerTitle}>
              {isSignUp ? t('auth.createAccount') : t('auth.welcomeBack')}
            </Text>
            <Text style={styles.headerSubtitle}>
              {isSignUp ? t('auth.signUpSubtitle') : t('auth.signInSubtitle')}
            </Text>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            {/* Toggle */}
            <View style={styles.toggleRow}>
              <TouchableOpacity
                style={[styles.toggleButton, !isSignUp && styles.toggleActive]}
                activeOpacity={0.7}
                onPress={() => !isAnyLoading && setMode('signIn')}
                accessibilityRole="button"
                accessibilityLabel={t('auth.signIn')}
              >
                <Text style={[styles.toggleText, !isSignUp && styles.toggleTextActive]}>
                  {t('auth.signIn')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleButton, isSignUp && styles.toggleActive]}
                activeOpacity={0.7}
                onPress={() => !isAnyLoading && setMode('signUp')}
                accessibilityRole="button"
                accessibilityLabel={t('auth.signUp')}
              >
                <Text style={[styles.toggleText, isSignUp && styles.toggleTextActive]}>
                  {t('auth.signUp')}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Full Name (signup only) */}
            {isSignUp && (
              <View style={styles.inputBox}>
                <Ionicons name="person-outline" size={20} color={color.textFaint} />
                <TextInput
                  style={styles.input}
                  placeholder={t('auth.fullName')}
                  placeholderTextColor={color.textFaint}
                  value={fullName}
                  onChangeText={setFullName}
                  autoCapitalize="words"
                  autoComplete="name"
                  accessibilityLabel={t('auth.fullName')}
                />
              </View>
            )}

            {/* Email */}
            <View style={styles.inputBox}>
              <Ionicons name="mail-outline" size={20} color={color.textFaint} />
              <TextInput
                style={styles.input}
                placeholder={t('auth.email')}
                placeholderTextColor={color.textFaint}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                accessibilityLabel={t('auth.email')}
              />
            </View>

            {/* Confirm Email (signup only) */}
            {isSignUp && (
              <View style={styles.inputBox}>
                <Ionicons name="mail-outline" size={20} color={color.textFaint} />
                <TextInput
                  style={styles.input}
                  placeholder={t('auth.confirmEmail')}
                  placeholderTextColor={color.textFaint}
                  value={confirmEmail}
                  onChangeText={setConfirmEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  accessibilityLabel={t('auth.confirmEmail')}
                />
              </View>
            )}

            {/* Password */}
            <View style={styles.inputBox}>
              <Ionicons name="lock-closed-outline" size={20} color={color.textFaint} />
              <TextInput
                style={styles.input}
                placeholder={t('auth.password')}
                placeholderTextColor={color.textFaint}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                accessibilityLabel={t('auth.password')}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                activeOpacity={0.6}
                accessibilityRole="button"
                accessibilityLabel={showPassword ? "Hide password" : "Show password"}
              >
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={color.textFaint} />
              </TouchableOpacity>
            </View>

            {/* Confirm Password (signup only) */}
            {isSignUp && (
              <View style={styles.inputBox}>
                <Ionicons name="shield-checkmark-outline" size={20} color={color.textFaint} />
                <TextInput
                  style={styles.input}
                  placeholder={t('auth.confirmPassword')}
                  placeholderTextColor={color.textFaint}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  accessibilityLabel={t('auth.confirmPassword')}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  activeOpacity={0.6}
                  accessibilityRole="button"
                  accessibilityLabel={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                >
                  <Ionicons name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={color.textFaint} />
                </TouchableOpacity>
              </View>
            )}

            {/* Forgot password */}
            {!isSignUp && (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => { setResetEmail(email); setShowResetModal(true); }}
                accessibilityRole="button"
                accessibilityLabel={t('auth.forgotPassword')}
              >
                <Text style={styles.forgotText}>{t('auth.forgotPassword')}</Text>
              </TouchableOpacity>
            )}

            {/* Submit */}
            <TouchableOpacity
              style={[styles.submitButton, isAnyLoading && { opacity: 0.7 }]}
              activeOpacity={0.8}
              onPress={handleSubmit}
              disabled={isAnyLoading}
              accessibilityRole="button"
              accessibilityLabel={isSignUp ? t('auth.signUp') : t('auth.signIn')}
            >
              {loading ? (
                <ActivityIndicator color={color.text} />
              ) : (
                <>
                  <Text style={styles.submitText}>
                    {isSignUp ? t('auth.signUp') : t('auth.signIn')}
                  </Text>
                  <View style={styles.submitIcon}>
                    <Ionicons name="arrow-forward" size={18} color={color.sacred} />
                  </View>
                </>
              )}
            </TouchableOpacity>

            {/* Switch mode */}
            <View style={styles.switchRow}>
              <Text style={styles.switchText}>
                {isSignUp ? t('auth.haveAccount') : t('auth.noAccount')}
              </Text>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={switchMode}
                accessibilityRole="button"
                accessibilityLabel={isSignUp ? t('auth.signIn') : t('auth.signUp')}
              >
                <Text style={styles.switchLink}>
                  {isSignUp ? t('auth.signIn') : t('auth.signUp')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Social Login - Hidden until OAuth credentials are configured.
              To re-enable: set ENABLE_SOCIAL_LOGIN to true and configure:
              1. Google: Set EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID & EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID in .env
              2. Apple: Enable Sign in with Apple capability in Apple Developer portal
              3. Supabase: Enable Google & Apple providers in Supabase Auth settings */}
          {ENABLE_SOCIAL_LOGIN && (
            <>
              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>{t('common.or')}</Text>
                <View style={styles.dividerLine} />
              </View>

              <TouchableOpacity
                style={[styles.socialButton, isAnyLoading && { opacity: 0.7 }]}
                activeOpacity={0.7}
                onPress={handleGoogleSignIn}
                disabled={isAnyLoading}
                accessibilityRole="button"
                accessibilityLabel={t('auth.continueWithGoogle')}
              >
                {socialLoading === 'google' ? (
                  <ActivityIndicator color={color.text} size="small" />
                ) : (
                  <>
                    <Ionicons name="logo-google" size={20} color={color.text} />
                    <Text style={styles.socialText}>{t('auth.continueWithGoogle')}</Text>
                  </>
                )}
              </TouchableOpacity>

              {Platform.OS === 'ios' && (
                <TouchableOpacity
                  style={[styles.appleButton, isAnyLoading && { opacity: 0.7 }]}
                  activeOpacity={0.7}
                  onPress={handleAppleSignIn}
                  disabled={isAnyLoading}
                  accessibilityRole="button"
                  accessibilityLabel={t('auth.continueWithApple')}
                >
                  {socialLoading === 'apple' ? (
                    <ActivityIndicator color={color.text} size="small" />
                  ) : (
                    <>
                      <Ionicons name="logo-apple" size={22} color={color.text} />
                      <Text style={styles.socialText}>{t('auth.continueWithApple')}</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </>
          )}

          {/* Legal Footer */}
          <View style={styles.legalFooter}>
            <Text style={styles.legalText}>
              {t('legal.agreePrefix')}{' '}
            </Text>
            <View style={styles.legalLinks}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => router.push('/terms-of-service' as any)}
                accessibilityRole="button"
                accessibilityLabel={t('legal.termsOfService')}
              >
                <Text style={styles.legalLink}>{t('legal.termsOfService')}</Text>
              </TouchableOpacity>
              <Text style={styles.legalText}> {t('legal.and')} </Text>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => router.push('/privacy-policy' as any)}
                accessibilityRole="button"
                accessibilityLabel={t('legal.privacyPolicy')}
              >
                <Text style={styles.legalLink}>{t('legal.privacyPolicy')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Reset Password Modal */}
      {showResetModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Ionicons name="mail-outline" size={32} color={color.accent} />
              <Text style={styles.modalTitle}>{t('auth.resetPassword')}</Text>
              <Text style={styles.modalDesc}>{t('auth.resetPasswordDesc')}</Text>
            </View>
            <View style={styles.inputBox}>
              <Ionicons name="mail-outline" size={20} color={color.textFaint} />
              <TextInput
                style={styles.input}
                placeholder={t('auth.email')}
                placeholderTextColor={color.textFaint}
                value={resetEmail}
                onChangeText={setResetEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                accessibilityLabel={t('auth.email')}
              />
            </View>
            <TouchableOpacity
              style={[styles.submitButton, loading && { opacity: 0.7 }]}
              activeOpacity={0.8}
              onPress={handleResetPassword}
              disabled={loading}
              accessibilityRole="button"
              accessibilityLabel={t('auth.sendResetLink')}
            >
              {loading ? (
                <ActivityIndicator color={color.text} />
              ) : (
                <Text style={styles.submitText}>{t('auth.sendResetLink')}</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setShowResetModal(false)}
              accessibilityRole="button"
              accessibilityLabel={t('common.cancel')}
            >
              <Text style={styles.cancelText}>{t('common.cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.bg,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 10,
    marginTop: -20,
  },

  // Header
  header: {
    alignItems: 'center',
    paddingTop: 0,
    marginBottom: 4,
  },
  logoImage: {
    width: 190,
    height: 190,
    marginBottom: -10,
  },
  headerTitle: {
    color: color.text,
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  headerSubtitle: {
    color: color.textMuted,
    fontSize: 14,
    textAlign: 'center',
  },

  // Form card
  formCard: {
    backgroundColor: color.surface,
    borderRadius: radius.xl,
    padding: 16,
    marginBottom: 10,
  },

  // Toggle
  toggleRow: {
    flexDirection: 'row',
    backgroundColor: color.bg,
    borderRadius: radius.md,
    padding: 4,
    marginBottom: 14,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radius.sm,
    alignItems: 'center',
  },
  toggleActive: {
    backgroundColor: color.sacred,
  },
  toggleText: {
    color: color.textFaint,
    fontSize: 15,
    fontWeight: '600',
  },
  toggleTextActive: {
    color: color.textOnAccent,
    fontWeight: '700',
  },

  // Inputs
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: color.bg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: color.border,
    paddingHorizontal: 14,
    marginBottom: 12,
    gap: 10,
  },
  input: {
    flex: 1,
    color: color.text,
    fontSize: 15,
    paddingVertical: 12,
  },

  // Forgot
  forgotText: {
    color: color.accent,
    fontSize: 13,
    textAlign: 'right',
    marginBottom: 18,
    marginTop: -4,
  },

  // Submit
  submitButton: {
    backgroundColor: color.sacred,
    paddingVertical: 14,
    borderRadius: radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    marginTop: 2,
  },
  submitText: {
    color: color.textOnAccent,
    fontSize: 16,
    fontWeight: '700',
    marginRight: 10,
  },
  submitIcon: {
    width: 30,
    height: 30,
    borderRadius: radius.lg,
    backgroundColor: color.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Switch mode
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  switchText: {
    color: color.textMuted,
    fontSize: 14,
  },
  switchLink: {
    color: color.accent,
    fontSize: 14,
    fontWeight: '600',
  },

  // Divider
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: color.surfaceRaised,
  },
  dividerText: {
    color: color.textFaint,
    fontSize: 13,
    marginHorizontal: 14,
  },

  // Social
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: color.surface,
    paddingVertical: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: color.border,
    gap: 10,
    marginBottom: 10,
  },
  appleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
    paddingVertical: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#333333',
    gap: 10,
    marginBottom: 10,
  },
  socialText: {
    color: color.text,
    fontSize: 15,
    fontWeight: '600',
  },

  // Legal footer
  legalFooter: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  legalLinks: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  legalText: {
    color: color.textFaint,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  legalLink: {
    color: color.accent,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 18,
  },

  // Modal
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    backgroundColor: color.surface,
    borderRadius: radius.xl,
    padding: 24,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    color: color.text,
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 6,
  },
  modalDesc: {
    color: color.textMuted,
    fontSize: 14,
    textAlign: 'center',
  },
  cancelText: {
    color: color.textMuted,
    fontSize: 15,
    textAlign: 'center',
    paddingVertical: 8,
  },
});

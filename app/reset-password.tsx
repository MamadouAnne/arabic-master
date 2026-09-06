import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { updatePassword } from '../src/services/authService';
import { color, radius } from '../src/theme/tokens';
import { withAlpha } from '../src/components/ui/Primitives';

export default function ResetPasswordScreen() {
  const { t } = useTranslation();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validate = () => {
    if (!password) {
      Alert.alert(t('common.error'), t('auth.passwordRequired'));
      return false;
    }
    if (
      password.length < 7 ||
      !/[A-Z]/.test(password) ||
      !/[a-z]/.test(password) ||
      !/\d/.test(password)
    ) {
      Alert.alert(t('common.error'), t('auth.passwordMinLength'));
      return false;
    }
    if (password !== confirmPassword) {
      Alert.alert(t('common.error'), t('auth.passwordsDoNotMatch'));
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate() || loading) return;
    setLoading(true);
    try {
      await updatePassword(password);
      setSuccess(true);
      setTimeout(() => {
        router.replace('/auth');
      }, 2000);
    } catch (err: any) {
      const msg = (err.message || '').toLowerCase();
      let userMessage = t('auth.genericError');
      if (msg.includes('same password') || msg.includes('different')) {
        userMessage = t('auth.samePasswordError');
      }
      Alert.alert(t('common.error'), userMessage);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={64} color={color.progress} />
          </View>
          <Text style={styles.successTitle}>{t('auth.passwordResetSuccess')}</Text>
          <Text style={styles.successSubtitle}>{t('auth.passwordResetSuccessDesc')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <Ionicons name="lock-open-outline" size={40} color={color.sacred} />
            </View>
            <Text style={styles.title}>{t('auth.setNewPassword')}</Text>
            <Text style={styles.subtitle}>{t('auth.setNewPasswordDesc')}</Text>
          </View>

          {/* Form */}
          <View style={styles.formCard}>
            {/* New Password */}
            <View style={styles.inputBox}>
              <Ionicons name="lock-closed-outline" size={20} color={color.textFaint} />
              <TextInput
                style={styles.input}
                placeholder={t('auth.newPassword')}
                placeholderTextColor={color.textFaint}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                accessibilityLabel={t('auth.newPassword')}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                activeOpacity={0.6}
                accessibilityRole="button"
              >
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={color.textFaint} />
              </TouchableOpacity>
            </View>

            {/* Password Requirements */}
            <View style={styles.requirements}>
              <RequirementItem met={password.length >= 7} text={t('auth.req7Chars')} />
              <RequirementItem met={/[A-Z]/.test(password)} text={t('auth.reqUppercase')} />
              <RequirementItem met={/[a-z]/.test(password)} text={t('auth.reqLowercase')} />
              <RequirementItem met={/\d/.test(password)} text={t('auth.reqNumber')} />
            </View>

            {/* Confirm Password */}
            <View style={styles.inputBox}>
              <Ionicons name="shield-checkmark-outline" size={20} color={color.textFaint} />
              <TextInput
                style={styles.input}
                placeholder={t('auth.confirmNewPassword')}
                placeholderTextColor={color.textFaint}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                accessibilityLabel={t('auth.confirmNewPassword')}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                activeOpacity={0.6}
                accessibilityRole="button"
              >
                <Ionicons name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={color.textFaint} />
              </TouchableOpacity>
            </View>

            {/* Submit */}
            <TouchableOpacity
              style={[styles.submitButton, loading && { opacity: 0.7 }]}
              activeOpacity={0.8}
              onPress={handleSubmit}
              disabled={loading}
              accessibilityRole="button"
              accessibilityLabel={t('auth.resetPassword')}
            >
              {loading ? (
                <ActivityIndicator color={color.textOnAccent} />
              ) : (
                <Text style={styles.submitText}>{t('auth.resetPassword')}</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function RequirementItem({ met, text }: { met: boolean; text: string }) {
  return (
    <View style={styles.requirementRow}>
      <Ionicons
        name={met ? 'checkmark-circle' : 'ellipse-outline'}
        size={16}
        color={met ? color.progress : color.borderStrong}
      />
      <Text style={[styles.requirementText, met && styles.requirementMet]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.bg,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  headerIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: withAlpha(color.sacred, 0.13),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    color: color.text,
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: color.textMuted,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  formCard: {
    backgroundColor: color.surface,
    borderRadius: radius.xl,
    padding: 16,
  },
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
  requirements: {
    marginBottom: 12,
    paddingHorizontal: 4,
    gap: 6,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  requirementText: {
    color: color.textFaint,
    fontSize: 12,
  },
  requirementMet: {
    color: color.progress,
  },
  submitButton: {
    backgroundColor: color.sacred,
    paddingVertical: 14,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  submitText: {
    color: color.textOnAccent,
    fontSize: 16,
    fontWeight: '700',
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  successIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: withAlpha(color.progress, 0.13),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  successTitle: {
    color: color.text,
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  successSubtitle: {
    color: color.textMuted,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});

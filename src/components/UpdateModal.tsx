import { useCallback, useEffect, useRef, useState } from 'react';
import { Modal, View, Text, Pressable, StyleSheet, Animated, Easing, AppState } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import * as Updates from 'expo-updates';
import { color, radius } from '../theme/tokens';

/**
 * Self-contained EAS Update (OTA) prompt. On launch and each time the app is
 * foregrounded it checks for a new update; when one is found it downloads it
 * quietly, then asks the user to restart to apply. Driven by the reactive
 * `Updates.useUpdates()` state (not a one-shot check) so the prompt reliably
 * appears the moment a downloaded update is pending. No-op in Expo Go / dev
 * builds where `Updates.isEnabled` is false.
 */
export function UpdateModal() {
  const { t } = useTranslation();
  const { isUpdateAvailable, isUpdatePending } = Updates.useUpdates();
  const [dismissed, setDismissed] = useState(false);
  const [reloading, setReloading] = useState(false);

  const scale = useRef(new Animated.Value(0.96)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const check = useCallback(() => {
    if (!Updates.isEnabled) return;
    Updates.checkForUpdateAsync().catch(() => {});
  }, []);

  // Check on mount and whenever the app returns to the foreground.
  useEffect(() => {
    check();
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') check();
    });
    return () => sub.remove();
  }, [check]);

  // Download in the background as soon as an update is found.
  useEffect(() => {
    if (isUpdateAvailable) {
      setDismissed(false);
      Updates.fetchUpdateAsync().catch(() => {});
    }
  }, [isUpdateAvailable]);

  const visible = isUpdatePending && !dismissed;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 220,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(scale, { toValue: 1, friction: 8, tension: 80, useNativeDriver: true }),
      ]).start();
    } else {
      scale.setValue(0.96);
      opacity.setValue(0);
    }
  }, [visible, opacity, scale]);

  const apply = async () => {
    setReloading(true);
    try {
      await Updates.reloadAsync();
    } catch {
      setReloading(false);
    }
  };

  if (!visible) return null;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={() => setDismissed(true)}>
      <View style={styles.overlay}>
        <Animated.View style={[styles.card, { opacity, transform: [{ scale }] }]}>
          <View style={styles.iconWrap}>
            <Ionicons name="rocket" size={28} color={color.progress} />
          </View>

          <Text style={styles.title}>{t('profile.updateReadyTitle')}</Text>
          <Text style={styles.message}>{t('profile.updateReadyMessage')}</Text>

          <View style={styles.actions}>
            <Pressable
              style={styles.secondaryButton}
              onPress={() => setDismissed(true)}
              disabled={reloading}
              accessibilityRole="button"
              accessibilityLabel={t('profile.later')}
            >
              <Text style={styles.secondaryText}>{t('profile.later')}</Text>
            </Pressable>
            <Pressable
              style={[styles.primaryButton, reloading && styles.primaryButtonDisabled]}
              onPress={apply}
              disabled={reloading}
              accessibilityRole="button"
              accessibilityLabel={t('profile.updateNow')}
            >
              <Ionicons name="refresh" size={18} color={color.textOnAccent} />
              <Text style={styles.primaryText}>{t('profile.updateNow')}</Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: color.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: color.border,
    padding: 24,
    alignItems: 'center',
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    color: color.text,
    fontSize: 19,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    color: color.textMuted,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 24,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: radius.md,
    backgroundColor: color.bg,
    borderWidth: 1,
    borderColor: color.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryText: {
    color: color.text,
    fontSize: 15,
    fontWeight: '600',
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    paddingVertical: 13,
    borderRadius: radius.md,
    backgroundColor: color.progress,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  primaryText: {
    color: color.textOnAccent,
    fontSize: 15,
    fontWeight: '700',
  },
});

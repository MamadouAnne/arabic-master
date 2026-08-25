import { useEffect, useRef } from 'react';
import { Modal, View, Text, Pressable, StyleSheet, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

interface UpdateModalProps {
  visible: boolean;
  /** Apply the downloaded update (restarts the app). */
  onRestart: () => void;
  /** Dismiss and keep the current version until next launch. */
  onLater: () => void;
}

/**
 * Styled OTA "update ready" prompt. Shown after a new bundle has already been
 * downloaded in the background — restarting applies it. Replaces the native
 * Alert so the prompt matches the app's design and is localized.
 */
export function UpdateModal({ visible, onRestart, onLater }: UpdateModalProps) {
  const { t } = useTranslation();
  const scale = useRef(new Animated.Value(0.96)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 220,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          friction: 8,
          tension: 80,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scale.setValue(0.96);
      opacity.setValue(0);
    }
  }, [visible, opacity, scale]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onLater}>
      <View style={styles.overlay}>
        <Animated.View style={[styles.card, { opacity, transform: [{ scale }] }]}>
          <View style={styles.iconWrap}>
            <Ionicons name="rocket" size={28} color="#10b981" />
          </View>

          <Text style={styles.title}>{t('profile.updateReadyTitle')}</Text>
          <Text style={styles.message}>{t('profile.updateReadyMessage')}</Text>

          <View style={styles.actions}>
            <Pressable
              style={styles.secondaryButton}
              onPress={onLater}
              accessibilityRole="button"
              accessibilityLabel={t('profile.later')}
            >
              <Text style={styles.secondaryText}>{t('profile.later')}</Text>
            </Pressable>
            <Pressable
              style={styles.primaryButton}
              onPress={onRestart}
              accessibilityRole="button"
              accessibilityLabel={t('profile.updateNow')}
            >
              <Ionicons name="refresh" size={18} color="#0f172a" />
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
    backgroundColor: '#1e293b',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#334155',
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
    color: '#ffffff',
    fontSize: 19,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    color: '#94a3b8',
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
    borderRadius: 14,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryText: {
    color: '#e2e8f0',
    fontSize: 15,
    fontWeight: '600',
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    paddingVertical: 13,
    borderRadius: 14,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: {
    color: '#0f172a',
    fontSize: 15,
    fontWeight: '700',
  },
});

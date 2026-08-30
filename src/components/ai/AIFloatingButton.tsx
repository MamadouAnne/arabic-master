import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Animated, Platform, View, Image, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSegments, useGlobalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAIChatStore } from '../../stores/aiChatStore';
import { useAudioPlayerStore } from '../../stores/audioPlayerStore';
import { getModuleFromSegments } from '../../services/aiContextService';
import { AIModelChoice } from '../../types/aiChat';
import { color, radius } from '../../theme/tokens';

const TEACHER_AVATARS: Record<AIModelChoice, any> = {
  haiku: require('../../../assets/images/teachers/ustadh-ali.png'),
  sonnet: require('../../../assets/images/teachers/ustadh-ibrahim.png'),
};

const TEACHER_COLORS: Record<AIModelChoice, { border: [string, string, string, string]; glow: string }> = {
  haiku: {
    border: ['#10b981', '#34d399', '#f59e0b', '#10b981'],
    glow: color.progress,
  },
  sonnet: {
    border: ['#D4AF37', '#f59e0b', '#D4AF37', '#f59e0b'],
    glow: color.sacred,
  },
};

export function AIFloatingButton() {
  const segments = useSegments();
  const params = useGlobalSearchParams();
  const insets = useSafeAreaInsets();
  const { openChat, isOpen, setActiveModule, setActiveSegments, preferredModel } = useAIChatStore();
  const currentlyPlaying = useAudioPlayerStore((s) => s.currentlyPlaying);
  const [expanded, setExpanded] = useState(false);

  // Resolve template segments to actual param values
  const resolvedSegs = (segments as string[]).map((seg) => {
    if (seg.startsWith('[') && seg.endsWith(']')) {
      const paramName = seg.slice(1, -1);
      const value = params[paramName];
      return typeof value === 'string' ? value : seg;
    }
    return seg;
  });

  // Keep activeModule + activeSegments in sync as the user navigates
  useEffect(() => {
    const module = getModuleFromSegments(resolvedSegs);
    setActiveModule(module);
    setActiveSegments(resolvedSegs);
  }, [resolvedSegs.join('/')]);

  // Subtle scale breathing (native driver only — no JS thread cost)
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (expanded) return;
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.05, duration: 2000, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [expanded]);

  // Hide during onboarding/auth screens and when chat is already open
  const firstSegment = segments[0] as string;
  const hiddenRoutes = ['(onboarding)', 'auth', '+not-found'];
  if (isOpen || hiddenRoutes.includes(firstSegment)) return null;

  // Position: above tab bar, adjusted if MiniAudioPlayer is showing
  const isInTabs = segments[0] === '(tabs)';
  const tabBarHeight = Platform.OS === 'ios' ? 60 : 60;
  const tabBarPadding = Platform.OS === 'ios' ? 28 : Math.max(insets.bottom, 24);
  let bottomOffset = isInTabs ? tabBarHeight + tabBarPadding + 12 : insets.bottom + 12;

  if (currentlyPlaying) {
    bottomOffset += 64;
  }

  const handleMainPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setExpanded(!expanded);
  };

  const handleChat = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpanded(false);
    const module = getModuleFromSegments(resolvedSegs);
    openChat(module, resolvedSegs, false);
  };

  const handleVoice = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpanded(false);
    const module = getModuleFromSegments(resolvedSegs);
    openChat(module, resolvedSegs, true);
  };

  const colors = TEACHER_COLORS[preferredModel];

  return (
    <>
      {/* Transparent modal backdrop — renders in its own native layer, no overflow issues */}
      <Modal
        visible={expanded}
        transparent
        animationType="none"
        onRequestClose={() => setExpanded(false)}
        statusBarTranslucent
      >
        <Pressable style={styles.backdrop} onPress={() => setExpanded(false)}>
          {/* Options + main button rendered inside the modal so they sit above the backdrop */}
          <View style={[styles.menuContainer, { bottom: bottomOffset, right: 16 }]}>
            {/* Voice option */}
            <Pressable
              onPress={handleVoice}
              style={styles.optionBtn}
            >
              <LinearGradient
                colors={['#8b5cf6', '#7c3aed']}
                style={styles.optionGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="mic" size={20} color={color.text} />
              </LinearGradient>
            </Pressable>

            {/* Chat option */}
            <Pressable
              onPress={handleChat}
              style={styles.optionBtn}
            >
              <LinearGradient
                colors={colors.border.slice(0, 2) as [string, string]}
                style={styles.optionGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="chatbubble" size={20} color={color.text} />
              </LinearGradient>
            </Pressable>

            {/* Close button (replaces avatar) */}
            <Pressable
              onPress={() => setExpanded(false)}
              
            >
              <View style={[styles.glow, { backgroundColor: colors.glow }]} />
              <LinearGradient
                colors={colors.border}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientBorder}
              >
                <View style={styles.closeWrap}>
                  <Ionicons name="close" size={22} color={color.text} />
                </View>
              </LinearGradient>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      {/* Main floating button (collapsed state) */}
      <Animated.View
        style={[
          styles.container,
          {
            bottom: bottomOffset,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={[styles.glow, { backgroundColor: colors.glow }]} />

        <Pressable
          onPress={handleMainPress}
          
        >
          <LinearGradient
            colors={colors.border}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientBorder}
          >
            <View style={styles.avatarWrap}>
              <Image
                source={TEACHER_AVATARS[preferredModel]}
                style={styles.avatar}
              />
            </View>
          </LinearGradient>
        </Pressable>
      </Animated.View>
    </>
  );
}

const BTN_SIZE = 44;
const BORDER_WIDTH = 2;

const styles = StyleSheet.create({
  // ── Backdrop (full-screen transparent modal) ───────────────
  backdrop: {
    flex: 1,
  },

  // ── Expanded menu (positioned inside modal) ────────────────
  menuContainer: {
    position: 'absolute',
    alignItems: 'center',
    gap: 12,
  },

  // ── Collapsed FAB container ────────────────────────────────
  container: {
    position: 'absolute',
    right: 16,
    zIndex: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Option buttons ─────────────────────────────────────────
  optionBtn: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  optionPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.93 }],
  },
  optionGradient: {
    width: 40,
    height: 40,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Glow ─────────────────────────────────────────────────────
  glow: {
    position: 'absolute',
    width: BTN_SIZE + 12,
    height: BTN_SIZE + 12,
    borderRadius: (BTN_SIZE + 12) / 2,
    opacity: 0.25,
    alignSelf: 'center',
    bottom: -6,
  },

  // ── Gradient border ──────────────────────────────────────────
  gradientBorder: {
    width: BTN_SIZE,
    height: BTN_SIZE,
    borderRadius: BTN_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 10,
  },

  // ── Avatar ───────────────────────────────────────────────────
  avatarWrap: {
    width: BTN_SIZE - BORDER_WIDTH * 2,
    height: BTN_SIZE - BORDER_WIDTH * 2,
    borderRadius: (BTN_SIZE - BORDER_WIDTH * 2) / 2,
    overflow: 'hidden',
    backgroundColor: '#0d0d0a',
  },
  avatar: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  // ── Close icon (when expanded) ─────────────────────────────
  closeWrap: {
    width: BTN_SIZE - BORDER_WIDTH * 2,
    height: BTN_SIZE - BORDER_WIDTH * 2,
    borderRadius: (BTN_SIZE - BORDER_WIDTH * 2) / 2,
    backgroundColor: '#0d0d0a',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Press state ──────────────────────────────────────────────
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.93 }],
  },
});

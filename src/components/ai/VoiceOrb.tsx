import React, { useEffect } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withSpring,
  withDelay,
  Easing,
  interpolate,
  cancelAnimation,
  SharedValue,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import type { VoiceStatus } from '../../hooks/useVoiceChat';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface VoiceOrbProps {
  status: VoiceStatus;
  onPress: () => void;
}

const COLORS = {
  listening: '#3b82f6',
  listeningDark: '#2563eb',
  speaking: '#10b981',
  speakingDark: '#059669',
  thinking: '#f59e0b',
  thinkingDark: '#d97706',
  idle: '#334155',
  idleDark: '#1e293b',
  text: '#f1f5f9',
  bg: '#0f172a',
  elevated: '#1e293b',
};

function PulseRing({
  scaleVal,
  opacityVal,
  size,
  status,
}: {
  scaleVal: SharedValue<number>;
  opacityVal: SharedValue<number>;
  size: number;
  status: VoiceStatus;
}) {
  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleVal.value }],
    opacity: opacityVal.value,
  }));

  const borderColor =
    status === 'listening'
      ? COLORS.listening
      : status === 'speaking'
      ? COLORS.speaking
      : COLORS.thinking;

  return (
    <Animated.View
      style={[
        styles.ring,
        { width: size, height: size, borderRadius: size / 2, borderColor },
        ringStyle,
      ]}
    />
  );
}

function WaveformBar({
  value,
  color,
}: {
  value: SharedValue<number>;
  color: string;
}) {
  const barStyle = useAnimatedStyle(() => ({
    height: interpolate(value.value, [0, 1], [4, 24]),
    opacity: interpolate(value.value, [0, 1], [0.3, 0.9]),
  }));

  return (
    <Animated.View
      style={[styles.waveformBar, { backgroundColor: color }, barStyle]}
    />
  );
}

export function VoiceOrb({ status, onPress }: VoiceOrbProps) {
  const orbScale = useSharedValue(1);

  const ring0Scale = useSharedValue(1);
  const ring0Opacity = useSharedValue(0);
  const ring1Scale = useSharedValue(1);
  const ring1Opacity = useSharedValue(0);
  const ring2Scale = useSharedValue(1);
  const ring2Opacity = useSharedValue(0);

  const bar0 = useSharedValue(0.3);
  const bar1 = useSharedValue(0.3);
  const bar2 = useSharedValue(0.3);
  const bar3 = useSharedValue(0.3);
  const bar4 = useSharedValue(0.3);

  const rings = [
    { scale: ring0Scale, opacity: ring0Opacity },
    { scale: ring1Scale, opacity: ring1Opacity },
    { scale: ring2Scale, opacity: ring2Opacity },
  ];
  const bars = [bar0, bar1, bar2, bar3, bar4];

  const isActive = status !== 'idle';

  useEffect(() => {
    return () => {
      rings.forEach((ring) => {
        cancelAnimation(ring.scale);
        cancelAnimation(ring.opacity);
      });
      bars.forEach((v) => cancelAnimation(v));
      cancelAnimation(orbScale);
    };
  }, []);

  useEffect(() => {
    rings.forEach((ring) => {
      cancelAnimation(ring.scale);
      cancelAnimation(ring.opacity);
    });
    bars.forEach((v) => cancelAnimation(v));

    if (status === 'listening') {
      rings.forEach((ring, i) => {
        ring.scale.value = withRepeat(
          withDelay(
            i * 300,
            withSequence(
              withTiming(1, { duration: 0 }),
              withTiming(1.6 + i * 0.2, { duration: 1500, easing: Easing.out(Easing.ease) }),
            ),
          ),
          -1,
        );
        ring.opacity.value = withRepeat(
          withDelay(
            i * 300,
            withSequence(
              withTiming(0.4 - i * 0.1, { duration: 100 }),
              withTiming(0, { duration: 1400, easing: Easing.in(Easing.ease) }),
            ),
          ),
          -1,
        );
      });
      bars.forEach((v, i) => {
        v.value = withRepeat(
          withSequence(
            withTiming(0.3 + Math.random() * 0.7, { duration: 200 + i * 50 }),
            withTiming(0.1 + Math.random() * 0.3, { duration: 200 + i * 50 }),
          ),
          -1,
          true,
        );
      });
    } else if (status === 'processing' || status === 'thinking') {
      rings.forEach((ring, i) => {
        ring.scale.value = withRepeat(
          withSequence(
            withTiming(1.1 + i * 0.05, { duration: 500 }),
            withTiming(1, { duration: 500 }),
          ),
          -1,
        );
        ring.opacity.value = withRepeat(
          withSequence(
            withTiming(0.2 - i * 0.05, { duration: 500 }),
            withTiming(0.05, { duration: 500 }),
          ),
          -1,
        );
      });
      bars.forEach((v) => {
        v.value = withRepeat(
          withSequence(
            withTiming(0.4, { duration: 400 }),
            withTiming(0.2, { duration: 400 }),
          ),
          -1,
          true,
        );
      });
    } else if (status === 'speaking') {
      rings.forEach((ring, i) => {
        ring.scale.value = withRepeat(
          withDelay(
            i * 200,
            withSequence(
              withTiming(1.08 + i * 0.04, { duration: 600 }),
              withTiming(1, { duration: 600 }),
            ),
          ),
          -1,
        );
        ring.opacity.value = withRepeat(
          withDelay(
            i * 200,
            withSequence(
              withTiming(0.25 - i * 0.06, { duration: 600 }),
              withTiming(0.08, { duration: 600 }),
            ),
          ),
          -1,
        );
      });
      bars.forEach((v, i) => {
        v.value = withRepeat(
          withDelay(
            i * 80,
            withSequence(
              withTiming(0.5 + Math.random() * 0.5, { duration: 250 }),
              withTiming(0.15, { duration: 300 }),
            ),
          ),
          -1,
          true,
        );
      });
    } else {
      rings.forEach((ring) => {
        ring.scale.value = withTiming(1, { duration: 300 });
        ring.opacity.value = withTiming(0, { duration: 300 });
      });
      bars.forEach((v) => {
        v.value = withTiming(0.3, { duration: 300 });
      });
    }
  }, [status]);

  const orbPressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: orbScale.value }],
  }));

  const barColor =
    status === 'speaking'
      ? COLORS.speaking
      : status === 'listening'
      ? COLORS.listening
      : COLORS.thinking;

  const gradientColors: [string, string] =
    isActive
      ? status === 'speaking'
        ? [COLORS.speaking, COLORS.speakingDark]
        : status === 'thinking' || status === 'processing'
        ? [COLORS.thinking, COLORS.thinkingDark]
        : [COLORS.listening, COLORS.listeningDark]
      : [COLORS.elevated, COLORS.bg];

  const iconName =
    status === 'listening'
      ? 'mic'
      : status === 'speaking'
      ? 'volume-high'
      : status === 'thinking' || status === 'processing'
      ? 'sparkles'
      : ('mic-outline' as const);

  return (
    <View style={styles.container}>
      {rings.map((ring, i) => (
        <PulseRing
          key={`ring-${i}`}
          scaleVal={ring.scale}
          opacityVal={ring.opacity}
          size={140 + i * 20}
          status={status}
        />
      ))}

      <AnimatedPressable
        onPress={onPress}
        onPressIn={() => {
          orbScale.value = withTiming(0.92, { duration: 80 });
        }}
        onPressOut={() => {
          orbScale.value = withSpring(1, { damping: 10, stiffness: 300 });
        }}
        style={orbPressStyle}
      >
        <LinearGradient
          colors={gradientColors}
          style={styles.orb}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name={iconName} size={44} color={COLORS.text} />
        </LinearGradient>
      </AnimatedPressable>

      {isActive && (
        <View style={styles.waveform}>
          {bars.map((v, i) => (
            <WaveformBar key={`bar-${i}`} value={v} color={barColor} />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 220,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    borderWidth: 1.5,
  },
  orb: {
    width: 130,
    height: 130,
    borderRadius: 65,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  waveform: {
    position: 'absolute',
    bottom: -8,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
    height: 28,
  },
  waveformBar: {
    width: 4,
    borderRadius: 2,
  },
});

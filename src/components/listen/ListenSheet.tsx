/**
 * The full player. Opened from the bar, dismissed back to it.
 *
 * The plate at the top carries the Arabic name of the story — the one place
 * gold belongs, since gold is reserved for sacred script. Everything the
 * listener can act on is emerald.
 */
import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Modal, ScrollView, LayoutChangeEvent, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { color, radius, type, weight, space, gutter, font, arabicType } from '../../theme/tokens';
import { NarrationSpeed, NarrationStatus, SleepOption } from '../../hooks/useStoryNarration';
import type { VoiceGender } from '../../services/storyAudioService';
import { formatClock } from './format';

const SPEEDS: NarrationSpeed[] = [0.75, 1, 1.25, 1.5];
const SLEEP_OPTIONS: SleepOption[] = ['off', 5, 15, 30, 45];
const VOICES: VoiceGender[] = ['female', 'male'];

interface Props {
  visible: boolean;
  title: string;
  subtitle: string;
  arabicTitle?: string;
  status: NarrationStatus;
  progress: number;
  elapsedSeconds: number;
  remainingSeconds: number;
  blockIndex: number;
  blockCount: number;
  speed: NarrationSpeed;
  sleep: SleepOption;
  voice: VoiceGender;
  usingDeviceVoice: boolean;
  /**
   * False when a male voice is selected but a female one is reading, which
   * happens when the neural voice cannot be reached. Optional so a caller
   * that has not been updated renders no note rather than crashing.
   */
  voiceApplies?: boolean;
  onClose: () => void;
  onToggle: () => void;
  onSkip: (delta: number) => void;
  onSeek: (fraction: number) => void;
  onSpeed: (speed: NarrationSpeed) => void;
  onSleep: (option: SleepOption) => void;
  onVoice: (voice: VoiceGender) => void;
  onStop: () => void;
}

export function ListenSheet({
  visible,
  title,
  subtitle,
  arabicTitle,
  status,
  progress,
  elapsedSeconds,
  remainingSeconds,
  blockIndex,
  blockCount,
  speed,
  sleep,
  voice,
  usingDeviceVoice,
  voiceApplies,
  onClose,
  onToggle,
  onSkip,
  onSeek,
  onSpeed,
  onSleep,
  onVoice,
  onStop,
}: Props) {
  const { t } = useTranslation();
  const [trackWidth, setTrackWidth] = useState(0);
  const playing = status === 'playing';
  const loading = status === 'loading';

  const sleepLabel = useMemo(() => {
    if (sleep === 'off') return t('listen.sleepOff');
    return t('listen.minutes', { count: sleep });
  }, [sleep, t]);

  const cycleSleep = () => {
    const at = SLEEP_OPTIONS.indexOf(sleep);
    onSleep?.(SLEEP_OPTIONS[(at + 1) % SLEEP_OPTIONS.length]);
  };

  const onTrackLayout = (e: LayoutChangeEvent) => setTrackWidth(e.nativeEvent.layout.width);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.scrim}>
        <View style={styles.sheet}>
          <SafeAreaView edges={['bottom']} style={styles.safe}>
            <View style={styles.handleRow}>
              <View style={styles.handle} />
            </View>

            <View style={styles.topRow}>
              <Pressable onPress={() => onClose?.()} hitSlop={10} accessibilityRole="button" accessibilityLabel={t('listen.close')}>
                <Ionicons name="chevron-down" size={24} color={color.textMuted} />
              </Pressable>
              <Text style={styles.kicker} numberOfLines={1}>
                {subtitle}
              </Text>
              <Pressable onPress={() => onStop?.()} hitSlop={10} accessibilityRole="button" accessibilityLabel={t('listen.stop')}>
                <Ionicons name="close" size={22} color={color.textMuted} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body}>
              <View style={styles.plate}>
                <Text style={styles.plateArabic} numberOfLines={1}>
                  {arabicTitle || '﷽'}
                </Text>
              </View>

              <Text style={styles.title} numberOfLines={2}>
                {title}
              </Text>

              <View style={styles.trackWrap} onLayout={onTrackLayout}>
                <Pressable
                  style={styles.trackHit}
                  onPress={(e) => {
                    if (trackWidth > 0) onSeek?.(e.nativeEvent.locationX / trackWidth);
                  }}
                >
                  <View style={styles.track}>
                    <View style={[styles.trackFill, { width: `${Math.max(0, Math.min(1, progress)) * 100}%` }]} />
                  </View>
                </Pressable>
                <View style={styles.times}>
                  <Text style={styles.time}>{formatClock(elapsedSeconds)}</Text>
                  <Text style={styles.time}>−{formatClock(remainingSeconds)}</Text>
                </View>
              </View>

              <View style={styles.transport}>
                <Pressable onPress={() => onSkip?.(-1)} style={styles.skip} accessibilityRole="button">
                  <Ionicons name="play-back" size={22} color={color.accentStrong} />
                </Pressable>

                <Pressable onPress={() => onToggle?.()} style={styles.play} accessibilityRole="button">
                  <Ionicons
                    name={loading ? 'ellipsis-horizontal' : playing ? 'pause' : 'play'}
                    size={30}
                    color={color.textOnAccent}
                    style={!loading && !playing ? styles.playNudge : undefined}
                  />
                </Pressable>

                <Pressable onPress={() => onSkip?.(1)} style={styles.skip} accessibilityRole="button">
                  <Ionicons name="play-forward" size={22} color={color.accentStrong} />
                </Pressable>
              </View>

              <Text style={styles.counter}>
                {t('listen.paragraphOf', { current: blockIndex + 1, total: blockCount })}
              </Text>

              <View style={styles.segment}>
                {SPEEDS.map((option) => {
                  const active = option === speed;
                  return (
                    <Pressable
                      key={option}
                      onPress={() => onSpeed?.(option)}
                      style={[styles.segmentItem, active && styles.segmentItemActive]}
                      accessibilityRole="button"
                      accessibilityState={{ selected: active }}
                    >
                      <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{option}×</Text>
                    </Pressable>
                  );
                })}
              </View>

              <View style={styles.settingHeader}>
                <Ionicons name="person-circle-outline" size={20} color={color.textMuted} />
                <Text style={styles.settingLabel}>{t('listen.voice')}</Text>
              </View>
              <View style={styles.segment}>
                {VOICES.map((option) => {
                  const active = option === voice;
                  return (
                    <Pressable
                      key={option}
                      onPress={() => onVoice?.(option)}
                      style={[styles.segmentItem, active && styles.segmentItemActive]}
                      accessibilityRole="button"
                      accessibilityState={{ selected: active }}
                    >
                      <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
                        {t(`listen.${option}`)}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {voiceApplies === false && (
                <Text style={styles.settingNote}>{t('listen.maleNeedsConnection')}</Text>
              )}

              {Platform.OS === 'ios' && usingDeviceVoice === true && (
                <Text style={styles.settingNote}>{t('listen.voiceQualityNote')}</Text>
              )}

              <Pressable style={styles.settingRow} onPress={cycleSleep} accessibilityRole="button">
                <Ionicons name="moon-outline" size={20} color={color.textMuted} />
                <Text style={styles.settingLabel}>{t('listen.sleepTimer')}</Text>
                <Text style={styles.settingValue}>{sleepLabel}</Text>
                <Ionicons name="chevron-forward" size={18} color={color.borderStrong} />
              </Pressable>
            </ScrollView>
          </SafeAreaView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: {
    flex: 1,
    backgroundColor: 'rgba(20, 38, 28, 0.28)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: color.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    maxHeight: '92%',
  },
  safe: {
    paddingHorizontal: gutter,
  },
  handleRow: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 6,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: radius.full,
    backgroundColor: color.border,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    gap: space.md,
  },
  kicker: {
    flex: 1,
    textAlign: 'center',
    ...type.micro,
    fontWeight: weight.semibold,
    color: color.textFaint,
    textTransform: 'uppercase',
  },
  body: {
    paddingBottom: space.xl,
  },
  plate: {
    height: 168,
    borderRadius: radius.lg,
    backgroundColor: color.surfaceSunken,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: color.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: space.sm,
  },
  plateArabic: {
    fontFamily: font.arabic,
    fontSize: arabicType.display.fontSize,
    lineHeight: arabicType.display.lineHeight,
    color: color.sacred,
  },
  title: {
    ...type.title,
    fontWeight: weight.bold,
    color: color.text,
    marginTop: space.lg,
  },
  trackWrap: {
    marginTop: space.xl,
  },
  trackHit: {
    paddingVertical: space.sm,
  },
  track: {
    height: 4,
    borderRadius: radius.full,
    backgroundColor: color.surfaceSunken,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  trackFill: {
    backgroundColor: color.accent,
    borderRadius: radius.full,
  },
  times: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: space.xs,
  },
  time: {
    ...type.micro,
    color: color.textFaint,
  },
  transport: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space['2xl'],
    marginTop: space.md,
  },
  skip: {
    width: 56,
    height: 56,
    borderRadius: radius.full,
    backgroundColor: color.surfaceSunken,
    alignItems: 'center',
    justifyContent: 'center',
  },
  play: {
    width: 76,
    height: 76,
    borderRadius: radius.full,
    backgroundColor: color.accentStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playNudge: {
    marginLeft: 3,
  },
  counter: {
    ...type.micro,
    color: color.textFaint,
    textAlign: 'center',
    marginTop: space.sm,
  },
  segment: {
    flexDirection: 'row',
    padding: 3,
    borderRadius: radius.full,
    backgroundColor: color.surfaceSunken,
    gap: 3,
    marginTop: space.lg,
  },
  segmentItem: {
    flex: 1,
    height: 34,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentItemActive: {
    backgroundColor: color.surface,
  },
  segmentText: {
    ...type.caption,
    fontWeight: weight.medium,
    color: color.textMuted,
  },
  segmentTextActive: {
    fontWeight: weight.semibold,
    color: color.accentStrong,
  },
  settingNote: {
    ...type.micro,
    color: color.textFaint,
    marginTop: space.sm,
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    marginTop: space.xl,
    marginBottom: space.sm,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    height: 52,
    marginTop: space.sm,
  },
  settingLabel: {
    flex: 1,
    ...type.body,
    color: color.text,
  },
  settingValue: {
    ...type.caption,
    color: color.textFaint,
  },
});

export default ListenSheet;

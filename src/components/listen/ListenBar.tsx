/**
 * The bar that stays with you while a story reads itself aloud.
 *
 * It is deliberately quiet: a hairline of progress, one primary control, and
 * where you are in the story. Everything else lives behind the chevron.
 */
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { color, radius, type, weight, space, gutter } from '../../theme/tokens';
import { NarrationSpeed, NarrationStatus } from '../../hooks/useStoryNarration';
import { formatMinutesLeft } from './format';

interface Props {
  title: string;
  status: NarrationStatus;
  progress: number;
  blockIndex: number;
  blockCount: number;
  remainingSeconds: number;
  speed: NarrationSpeed;
  onToggle: () => void;
  onExpand: () => void;
  onCycleSpeed: () => void;
}

export function ListenBar({
  title,
  status,
  progress,
  blockIndex,
  blockCount,
  remainingSeconds,
  speed,
  onToggle,
  onExpand,
  onCycleSpeed,
}: Props) {
  const { t } = useTranslation();
  const playing = status === 'playing';
  const loading = status === 'loading';

  return (
    <View style={styles.container}>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${Math.max(0, Math.min(1, progress)) * 100}%` }]} />
      </View>

      <View style={styles.row}>
        <Pressable
          onPress={onToggle}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={playing ? t('listen.pause') : t('listen.play')}
          style={styles.primary}
        >
          <Ionicons
            name={loading ? 'ellipsis-horizontal' : playing ? 'pause' : 'play'}
            size={18}
            color={color.textOnAccent}
            style={!loading && !playing ? styles.playNudge : undefined}
          />
        </Pressable>

        <Pressable style={styles.labels} onPress={onExpand} accessibilityRole="button">
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.meta} numberOfLines={1}>
            {t('listen.paragraphOf', { current: blockIndex + 1, total: blockCount })}
            {remainingSeconds > 0 ? ` · ${formatMinutesLeft(remainingSeconds, t)}` : ''}
          </Text>
        </Pressable>

        <View style={styles.right}>
          <Pressable onPress={onCycleSpeed} hitSlop={6} style={styles.speed} accessibilityRole="button">
            <Text style={styles.speedText}>{speed}×</Text>
          </Pressable>
          <Pressable onPress={onExpand} hitSlop={8} style={styles.chevron} accessibilityRole="button">
            <Ionicons name="chevron-up" size={20} color={color.textMuted} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: color.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: color.border,
  },
  track: {
    height: 3,
    backgroundColor: color.surfaceSunken,
    flexDirection: 'row',
  },
  fill: {
    backgroundColor: color.accent,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: gutter,
    paddingTop: space.md,
    paddingBottom: space.sm,
  },
  primary: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: color.accentStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playNudge: {
    marginLeft: 2,
  },
  labels: {
    flex: 1,
    gap: 2,
  },
  title: {
    ...type.body,
    fontWeight: weight.semibold,
    color: color.text,
  },
  meta: {
    ...type.micro,
    color: color.textFaint,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
  },
  speed: {
    height: 30,
    minWidth: 44,
    paddingHorizontal: 10,
    borderRadius: radius.full,
    backgroundColor: color.surfaceSunken,
    alignItems: 'center',
    justifyContent: 'center',
  },
  speedText: {
    ...type.caption,
    fontWeight: weight.semibold,
    color: color.accentStrong,
  },
  chevron: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ListenBar;

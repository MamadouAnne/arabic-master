/**
 * Shared UI primitives built on src/theme/tokens.
 *
 * Screens should compose these rather than hand-rolling another StyleSheet —
 * that is how the palette drifted to 5,000+ hardcoded hex values before.
 */

import { ReactNode, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StyleProp,
  PressableProps,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { color, palette, type, arabicType, font, weight, space, radius, gutter, elevation, pressedOpacity } from '../../theme/tokens';

// ---------------------------------------------------------------------------
// Text
// ---------------------------------------------------------------------------

type TypeVariant = keyof typeof type;

export function Txt({
  variant = 'body',
  weight: w = 'regular',
  tone = 'text',
  style,
  children,
  ...props
}: {
  variant?: TypeVariant;
  weight?: keyof typeof weight;
  tone?: 'text' | 'muted' | 'faint' | 'accent' | 'sacred' | 'progress';
  style?: StyleProp<TextStyle>;
  children: ReactNode;
} & Omit<React.ComponentProps<typeof Text>, 'style'>) {
  const tones = {
    text: color.text,
    muted: color.textMuted,
    faint: color.textFaint,
    accent: color.accent,
    sacred: color.sacred,
    progress: color.progress,
  };
  return (
    <Text style={[type[variant], { color: tones[tone], fontWeight: weight[w] }, style]} {...props}>
      {children}
    </Text>
  );
}

/**
 * Arabic script. Always Amiri — never the system face, which renders Arabic
 * with the wrong proportions and no naskh character.
 *
 * `quranic` switches to the AmiriQuran cut, which is spaced so that stacked
 * harakat in vocalised verses do not collide.
 */
export function Arabic({
  size = 'inline',
  quranic = false,
  tone = 'sacred',
  align = 'right',
  style,
  children,
  ...props
}: {
  size?: keyof typeof arabicType;
  quranic?: boolean;
  tone?: 'text' | 'muted' | 'sacred' | 'accent';
  align?: 'right' | 'center' | 'left';
  style?: StyleProp<TextStyle>;
  children: ReactNode;
} & Omit<React.ComponentProps<typeof Text>, 'style'>) {
  const tones = {
    text: color.text,
    muted: color.textMuted,
    sacred: color.sacred,
    accent: color.accent,
  };
  return (
    <Text
      style={[
        arabicType[size],
        {
          fontFamily: quranic ? font.quran : font.arabic,
          color: tones[tone],
          textAlign: align,
          writingDirection: 'rtl',
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
}

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------

export function Section({
  title,
  action,
  onAction,
  style,
  children,
}: {
  title?: string;
  action?: string;
  onAction?: () => void;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
}) {
  return (
    <View style={[styles.section, style]}>
      {title ? (
        <View style={styles.sectionHead}>
          <Txt variant="title" weight="bold">{title}</Txt>
          {action && onAction ? (
            <Pressable
              onPress={onAction}
              accessibilityRole="button"
              accessibilityLabel={action}
              hitSlop={8}
            >
              <Txt variant="caption" weight="semibold" tone="accent">{action}</Txt>
            </Pressable>
          ) : null}
        </View>
      ) : null}
      {children}
    </View>
  );
}

/**
 * The house card. One radius, one border, one background — the previous mix of
 * 15 radii and ad-hoc borders is what made the app read as unfinished.
 */
export function Card({
  onPress,
  accent,
  raised = false,
  style,
  children,
  accessibilityLabel,
  ...props
}: {
  onPress?: () => void;
  /** Draws a 3px spine down the leading edge. Use to encode meaning, not decoration. */
  accent?: string;
  raised?: boolean;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
} & Omit<PressableProps, 'style' | 'children' | 'onPress'>) {
  // Pressed state is tracked explicitly rather than via Pressable's
  // style={({pressed}) => ...} callback. NativeWind's css-interop wraps
  // Pressable (see patches/react-native-css-interop) and rewrites its style
  // prop; the function form is never invoked, so every style passed that way
  // is silently dropped on device. Plain arrays are honoured.
  const [pressed, setPressed] = useState(false);

  const body = (
    <>
      {accent ? <View style={[styles.cardAccent, { backgroundColor: accent }]} /> : null}
      {children}
    </>
  );

  if (!onPress) {
    return <View style={[styles.card, raised && elevation.raised, style]}>{body}</View>;
  }

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      {...props}
      style={[
        styles.card,
        raised && elevation.raised,
        pressed && styles.cardPressed,
        style,
      ]}
    >
      {body}
    </Pressable>
  );
}

/** Tinted square that holds an icon. Tint is always the icon colour at low alpha. */
export function IconTile({
  name,
  tint,
  size = 'md',
  style,
}: {
  name: keyof typeof Ionicons.glyphMap;
  tint: string;
  size?: 'sm' | 'md' | 'lg';
  style?: StyleProp<ViewStyle>;
}) {
  const dims = { sm: 36, md: 46, lg: 56 };
  const glyph = { sm: 18, md: 22, lg: 26 };
  const box = dims[size];
  return (
    <View
      style={[
        {
          width: box,
          height: box,
          borderRadius: radius.md,
          backgroundColor: withAlpha(tint, 0.12),
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
      ]}
    >
      <Ionicons name={name} size={glyph[size]} color={tint} />
    </View>
  );
}

// ---------------------------------------------------------------------------
// Progress
// ---------------------------------------------------------------------------

export function ProgressBar({
  value,
  tint = color.progress,
  height = 6,
  style,
}: {
  /** 0–100. */
  value: number;
  tint?: string;
  height?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <View
      style={[{ height, borderRadius: radius.full, backgroundColor: color.surfaceSunken, overflow: 'hidden' }, style]}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped) }}
    >
      <View style={{ width: `${clamped}%`, height: '100%', borderRadius: radius.full, backgroundColor: tint }} />
    </View>
  );
}

export function Stat({ value, label, tint = color.text }: { value: string | number; label: string; tint?: string }) {
  return (
    <View style={styles.stat}>
      <Text style={[type.stat, { color: tint, fontWeight: weight.bold }]}>{value}</Text>
      <Txt variant="caption" tone="faint" style={styles.statLabel}>{label}</Txt>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Signature: the masthead wash
// ---------------------------------------------------------------------------

/**
 * A deeper mint wash that fades into the page behind the head of each tab —
 * light through leaves at the top of the garden. Place it as the first child
 * of a screen's root container; it positions itself and never takes touches.
 * Tab screens only: stack screens stay plain so the wash keeps meaning "home".
 */
export function MastheadWash({ height = 260 }: { height?: number }) {
  return (
    <LinearGradient
      colors={[palette.mint150, color.bg]}
      style={{ position: 'absolute', top: 0, left: 0, right: 0, height }}
      pointerEvents="none"
    />
  );
}

// ---------------------------------------------------------------------------
// Signature: the illuminated rule
// ---------------------------------------------------------------------------

/**
 * A gold hairline broken by a centred lozenge — the ornament that separates
 * suras in a printed Mushaf. This is the app's signature mark: it appears only
 * where content is sacred or a milestone has been reached, so it stays
 * meaningful. Do not use it as a generic divider.
 */
export function IlluminatedRule({ style, tint = color.sacred }: { style?: StyleProp<ViewStyle>; tint?: string }) {
  return (
    <View style={[styles.ruleRow, style]} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <View style={[styles.ruleLine, { backgroundColor: withAlpha(tint, 0.35) }]} />
      <View style={[styles.ruleDiamondOuter, { borderColor: withAlpha(tint, 0.55) }]}>
        <View style={[styles.ruleDiamondInner, { backgroundColor: tint }]} />
      </View>
      <View style={[styles.ruleLine, { backgroundColor: withAlpha(tint, 0.35) }]} />
    </View>
  );
}

// ---------------------------------------------------------------------------
// Utils
// ---------------------------------------------------------------------------

/** Blend a hex colour with an alpha channel. Accepts #rgb or #rrggbb. */
export function withAlpha(hex: string, alpha: number): string {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: gutter,
    marginBottom: space['3xl'],
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: space.lg,
  },
  card: {
    backgroundColor: color.surface,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderColor: color.border,
    padding: space.lg,
    overflow: 'hidden',
    ...elevation.subtle,
  },
  cardPressed: {
    opacity: pressedOpacity,
    backgroundColor: color.surfaceRaised,
  },
  cardAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    marginTop: 2,
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
  },
  ruleLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth * 2,
  },
  ruleDiamondOuter: {
    width: 14,
    height: 14,
    borderWidth: StyleSheet.hairlineWidth * 2,
    transform: [{ rotate: '45deg' }],
    alignItems: 'center',
    justifyContent: 'center',
  },
  ruleDiamondInner: {
    width: 5,
    height: 5,
  },
});

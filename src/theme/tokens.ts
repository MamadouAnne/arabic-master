/**
 * Iqra AI design tokens — "Illuminated"
 *
 * The visual language borrows from the Mushaf: a deep ink ground, gold reserved
 * for what is sacred, and Arabic set as the hero rather than as a subtitle.
 *
 * Colour is semantic, not decorative. Before adding a hue, check it earns a
 * meaning below — the previous rainbow of module accents (pink/teal/violet)
 * carried no information and is deliberately gone.
 */

// ---------------------------------------------------------------------------
// Palette
// ---------------------------------------------------------------------------

/** Raw ramp. Prefer the semantic aliases below; reach here only for one-offs. */
export const palette = {
  // Ink — the ground. Deeper than the old #0f172a to buy contrast headroom.
  ink900: '#0B1220',
  ink800: '#0F1728',
  ink700: '#131C2E',
  ink600: '#1B2740',
  ink500: '#263349',
  ink400: '#37475F',

  // Gold — precious metal. Sacred text, mastery, illumination. Never filler.
  gold500: '#D4AF37',
  gold400: '#E3C55C',
  gold300: '#F0DC9A',

  // Indigo — interaction. Anything the user can act on.
  indigo500: '#6366F1',
  indigo400: '#818CF8',
  indigo300: '#A5B4FC',

  // Emerald — progress and mastery.
  emerald500: '#10B981',
  emerald400: '#34D399',

  // Feedback
  amber500: '#F59E0B',
  rose500: '#EF4444',

  // Type
  white: '#FFFFFF',
  slate100: '#F2F5FA',
  slate300: '#C3CEDE',
  slate400: '#8FA0B8',
  slate500: '#64748B',
} as const;

/** Semantic aliases — use these. */
export const color = {
  /** App background. */
  bg: palette.ink900,
  /** Default card / raised panel. */
  surface: palette.ink700,
  /** A panel sitting on top of a surface. */
  surfaceRaised: palette.ink600,
  /** Inset wells: progress tracks, input fields. */
  surfaceSunken: palette.ink800,

  /** Hairline borders. Card edges sit at `border`, dividers at `borderSubtle`. */
  border: palette.ink500,
  borderSubtle: palette.ink600,
  borderStrong: palette.ink400,

  /** Primary reading colour. */
  text: palette.slate100,
  /** Secondary copy, descriptions. */
  textMuted: palette.slate400,
  /** Labels, metadata, timestamps. */
  textFaint: palette.slate500,
  /** Text on a filled indigo/gold surface. */
  textOnAccent: palette.ink900,

  /** Interactive. Buttons, links, active tabs, selection. */
  accent: palette.indigo400,
  accentStrong: palette.indigo500,
  accentSoft: 'rgba(129, 140, 248, 0.14)',

  /** Sacred. Arabic script, Quran, illumination, achievement. */
  sacred: palette.gold500,
  sacredBright: palette.gold400,
  sacredSoft: 'rgba(212, 175, 55, 0.13)',

  /** Progress and mastery. */
  progress: palette.emerald500,
  progressSoft: 'rgba(16, 185, 129, 0.14)',

  warning: palette.amber500,
  danger: palette.rose500,
} as const;

// ---------------------------------------------------------------------------
// Typography
// ---------------------------------------------------------------------------

/**
 * Font families. Loaded globally in app/_layout.tsx — keep the keys in sync
 * with the `useFonts` map there.
 */
export const font = {
  /** Latin UI text. System face is the right call on mobile: it is already
   *  optimised for the platform and costs no bundle weight. */
  ui: undefined as string | undefined,
  /** General Arabic — naskh, the standard for Arabic bookwork. */
  arabic: 'Amiri',
  arabicBold: 'Amiri-Bold',
  /** Quranic Arabic. Cut for dense vocalisation so harakat do not collide. */
  quran: 'AmiriQuran',
} as const;

/**
 * Type scale. Eight steps replacing the 19 ad-hoc sizes previously in use.
 * `tracking` tightens as size grows, which is what keeps large text from
 * reading as loose and amateurish.
 */
export const type = {
  /** Metadata, badge text. */
  micro: { fontSize: 11, lineHeight: 14, letterSpacing: 0.3 },
  /** Labels, captions, tab bar. */
  caption: { fontSize: 13, lineHeight: 18, letterSpacing: 0.1 },
  /** Body copy. */
  body: { fontSize: 15, lineHeight: 22, letterSpacing: 0 },
  /** Emphasised body, list titles. */
  bodyLarge: { fontSize: 17, lineHeight: 24, letterSpacing: -0.2 },
  /** Section headings. */
  title: { fontSize: 20, lineHeight: 26, letterSpacing: -0.4 },
  /** Screen headings. */
  heading: { fontSize: 24, lineHeight: 30, letterSpacing: -0.6 },
  /** Screen hero. */
  display: { fontSize: 32, lineHeight: 38, letterSpacing: -0.9 },
  /** Numerals in stat tiles. */
  stat: { fontSize: 28, lineHeight: 32, letterSpacing: -0.8 },
} as const;

/**
 * Arabic needs its own scale: Amiri runs optically smaller than the system
 * face at the same point size, and vocalised text needs far more leading so
 * harakat above and sukun below do not clip.
 */
export const arabicType = {
  inline: { fontSize: 19, lineHeight: 34 },
  title: { fontSize: 24, lineHeight: 44 },
  display: { fontSize: 34, lineHeight: 62 },
  hero: { fontSize: 44, lineHeight: 80 },
} as const;

export const weight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

// ---------------------------------------------------------------------------
// Space, radius, elevation
// ---------------------------------------------------------------------------

/** 4pt grid. */
export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
} as const;

/** Screen gutter. Consistent across every screen. */
export const gutter = 20;

/** Five steps replacing the 15 previously in use. */
export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
} as const;

/**
 * Elevation. On a dark ground a lifted border reads as depth far better than
 * a drop shadow, so `raised` brightens the edge and keeps the shadow soft.
 */
export const elevation = {
  raised: {
    shadowColor: '#000000',
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  floating: {
    shadowColor: '#000000',
    shadowOpacity: 0.45,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
  },
} as const;

/** Opacity applied to a Pressable while held. */
export const pressedOpacity = 0.72;

export const theme = {
  color,
  palette,
  font,
  type,
  arabicType,
  weight,
  space,
  gutter,
  radius,
  elevation,
  pressedOpacity,
} as const;

export default theme;

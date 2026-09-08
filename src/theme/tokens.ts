/**
 * Iqra AI design tokens — "Light garden"
 *
 * The visual language borrows from two objects: the pale green of a prayer rug
 * and the cream page of a Mushaf. The ground is mint paper, cards are white
 * leaves floating on it, deep emerald marks anything the reader can act on,
 * and gold is reserved for what is sacred — Arabic script, Quran, milestones.
 *
 * Colour is semantic, not decorative. Before adding a hue, check it earns a
 * meaning below.
 */

// ---------------------------------------------------------------------------
// Palette
// ---------------------------------------------------------------------------

/** Raw ramp. Prefer the semantic aliases below; reach here only for one-offs. */
export const palette = {
  // Mint — the ground and its wells.
  mint50: '#F3F8F4',
  mint100: '#E6F0E9',
  mint150: '#DCEBE0',
  mint200: '#D2E2D7',
  mint300: '#B5CCBD',

  // Ink — green-black reading colour.
  ink900: '#14261C',
  ink700: '#1F3527',

  // Moss — secondary text.
  moss500: '#5C7466',
  moss400: '#7E9488',

  // Emerald — interaction and progress.
  emerald700: '#176340',
  emerald600: '#1F7A4D',
  emerald500: '#22A05F',
  emerald100: '#DCEFE3',

  // Gold — precious metal. Sacred text, mastery, illumination. Never filler.
  gold600: '#AD8626',
  gold500: '#C9A23A',
  gold100: '#F6EED6',

  // Feedback
  amber600: '#C77D0B',
  rose600: '#D23F3F',

  white: '#FFFFFF',
} as const;

/** Semantic aliases — use these. */
export const color = {
  /** App background. */
  bg: palette.mint50,
  /** Default card / raised panel. */
  surface: palette.white,
  /** A panel sitting on top of a surface. */
  surfaceRaised: palette.white,
  /** Inset wells: progress tracks, input fields. */
  surfaceSunken: palette.mint100,

  /** Hairline borders. Card edges sit at `border`, dividers at `borderSubtle`. */
  border: palette.mint200,
  borderSubtle: '#E8F0EA',
  borderStrong: palette.mint300,

  /** Primary reading colour. */
  text: palette.ink900,
  /** Secondary copy, descriptions. */
  textMuted: palette.moss500,
  /** Labels, metadata, timestamps. */
  textFaint: palette.moss400,
  /** Text on a filled emerald/gold surface. */
  textOnAccent: palette.white,

  /** Interactive. Buttons, links, active tabs, selection. */
  accent: palette.emerald600,
  accentStrong: palette.emerald700,
  accentSoft: 'rgba(31, 122, 77, 0.12)',

  /** Sacred. Arabic script, Quran, illumination, achievement. */
  sacred: palette.gold600,
  sacredBright: palette.gold500,
  sacredSoft: 'rgba(173, 134, 38, 0.14)',

  /** Progress and mastery. */
  progress: palette.emerald500,
  progressSoft: 'rgba(34, 160, 95, 0.14)',

  warning: palette.amber600,
  danger: palette.rose600,
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
  /** General Arabic — the platform face (SF Arabic on iOS, Noto Sans Arabic
   *  on Android). A modern simplified naskh: even stroke, open letterforms,
   *  no calligraphic ligatures. Beginners found Amiri's hairline joins and
   *  stacked ligatures hard to parse, so learning content stays on the
   *  system face; `undefined` selects it. */
  arabic: undefined as string | undefined,
  arabicBold: undefined as string | undefined,
  /** Quranic verses only. The Amiri Quran cut is spaced for dense
   *  vocalisation so stacked harakat do not collide. */
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
  title: { fontSize: 22, lineHeight: 28, letterSpacing: -0.4 },
  /** Screen headings. */
  heading: { fontSize: 26, lineHeight: 32, letterSpacing: -0.6 },
  /** Screen hero. */
  display: { fontSize: 36, lineHeight: 42, letterSpacing: -0.9 },
  /** Numerals in stat tiles. */
  stat: { fontSize: 28, lineHeight: 32, letterSpacing: -0.8 },
} as const;

/**
 * Arabic needs its own scale: it is set a step larger than Latin so learners
 * can see letter shapes, and vocalised text needs far more leading so harakat
 * above and sukun below do not clip.
 */
export const arabicType = {
  inline: { fontSize: 22, lineHeight: 38 },
  title: { fontSize: 28, lineHeight: 48 },
  display: { fontSize: 40, lineHeight: 68 },
  hero: { fontSize: 52, lineHeight: 88 },
} as const;

/**
 * Podium metals. The only colours outside the palette: gold, silver and bronze
 * mean rank, and no emerald or gold token can stand in without destroying the
 * meaning. Leaderboards only. Three files were repeating the raw values, and
 * one of them mixed `color.warning` in for first place.
 */
export const medal = {
  gold: '#D4A017',
  silver: '#9CA3AF',
  bronze: '#B87333',
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
 * Elevation. On a light ground depth comes from a soft, green-tinted shadow
 * rather than a brightened edge: the card should look like it is resting on
 * the paper, not cut out of it.
 */
export const elevation = {
  /** Every card: a whisper of green shadow so white reads as resting on paper. */
  subtle: {
    shadowColor: palette.emerald600,
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  raised: {
    shadowColor: palette.emerald600,
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  floating: {
    shadowColor: palette.ink900,
    shadowOpacity: 0.14,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
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

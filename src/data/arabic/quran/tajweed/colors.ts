// Tajweed Color Scheme
// Colors follow common Tajweed color-coding standards.
//
// One deliberate deviation: the printed convention encodes madd severity as
// progressively *darker* red, which assumes white paper. On this app's dark
// ground that logic inverts — the most severe rule became the least visible.
// madd_lazim is therefore lightened just enough to clear WCAG 3:1 for large
// text against the ayah card, while staying visibly deeper than madd_wajib.
// Every other hue is unchanged, since learners recognise them from the Mushaf.

export const TAJWEED_COLORS = {
  // Ghunnah - Nasalization (2 harakat)
  ghunnah: '#FF7F27',

  // Noon Sakinah & Tanween Rules
  izhar: '#FFFF00', // Yellow - Clear pronunciation
  ikhfa: '#C0C0C0', // Gray - Hidden/soft
  iqlab: '#FFC8DB', // Pink - Conversion (noon to meem)
  idgham_with_ghunnah: '#76FF76', // Green - Merging with nasalization
  idgham_without_ghunnah: '#90EE90', // Light green - Merging without nasalization

  // Meem Sakinah Rules
  ikhfa_shafawi: '#A9A9A9', // Dark gray - Labial hiding
  idgham_shafawi: '#98FB98', // Pale green - Labial merging
  izhar_shafawi: '#FFFACD', // Lemon - Labial clear

  // Madd (Elongation) Rules
  madd_tabii: '#FFFFFF', // White - Natural elongation (2 harakat)
  madd_wajib: '#FF0000', // Red - Required elongation (4-5 harakat)
  madd_jaiz: '#FF9999', // Light red - Permissible elongation (2-4-6)
  madd_lazim: '#D62839', // Deep crimson - Obligatory elongation (6 harakat).
                         // Was #8B0000, which scored 1.70:1 on the dark card.
  madd_arid: '#FFB6C1', // Light pink - Elongation due to stop
  madd_leen: '#FFA07A', // Light salmon - Soft elongation

  // Qalqalah (Echo sound)
  qalqalah_sughra: '#00BFFF', // Deep sky blue - Minor echo
  qalqalah_kubra: '#1E90FF', // Dodger blue - Major echo

  // Lam Rules
  lam_shamsiyyah: '#FFD700', // Gold - Sun letters (assimilation)
  lam_qamariyyah: '#E6E6FA', // Lavender - Moon letters (clear)

  // Recitation Styles
  recitation_tahqiq: '#9C27B0', // Purple - Very slow (learning)
  recitation_tartil: '#673AB7', // Deep purple - Slow measured
  recitation_tadwir: '#3F51B5', // Indigo - Medium pace
  recitation_hadr: '#2196F3', // Blue - Fast pace
} as const;

export type TajweedColorKey = keyof typeof TAJWEED_COLORS;

// Category colors for grouping in UI
export const TAJWEED_CATEGORY_COLORS = {
  noon_sakinah: '#4CAF50', // Green
  meem_sakinah: '#2196F3', // Blue
  madd: '#F44336', // Red
  qalqalah: '#00BCD4', // Cyan
  ghunnah: '#FF9800', // Orange
  lam_shamsiyyah: '#FFC107', // Amber
  recitation_styles: '#9C27B0', // Purple
  other: '#9E9E9E', // Gray
} as const;

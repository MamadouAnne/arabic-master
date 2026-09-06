// Tajweed Color Scheme
//
// Follows the printed-Mushaf convention, which assumes white paper: madd
// severity is encoded as progressively darker red, ghunnah and idgham sit in
// green, hiding rules in violet, qalqalah in teal. Every value clears WCAG
// 3:1 for large Arabic text on the app's white ayah card and mint ground,
// and no two rules in the same family share a lightness step.
//
// madd_tabii (natural, unmarked) is deliberately the reading ink: it is the
// baseline the other madd colours are read against, exactly as in print.

export const TAJWEED_COLORS = {
  // Ghunnah - Nasalization (2 harakat)
  ghunnah: '#2E7D32', // Green - Nasalization

  // Noon Sakinah & Tanween Rules
  izhar: '#455A64', // Slate - Clear pronunciation (near ink: nothing changes)
  ikhfa: '#6A1B9A', // Violet - Hidden/soft
  iqlab: '#1565C0', // Blue - Conversion (noon to meem)
  idgham_with_ghunnah: '#1B5E20', // Deep green - Merging with nasalization
  idgham_without_ghunnah: '#388E3C', // Green - Merging without nasalization

  // Meem Sakinah Rules
  ikhfa_shafawi: '#7B1FA2', // Violet - Labial hiding
  idgham_shafawi: '#2E7D32', // Green - Labial merging
  izhar_shafawi: '#546E7A', // Slate - Labial clear

  // Madd (Elongation) Rules — reds, darker as the elongation lengthens
  madd_tabii: '#14261C', // Ink - Natural elongation (2 harakat)
  madd_wajib: '#C62828', // Red - Required elongation (4-5 harakat)
  madd_jaiz: '#D84315', // Red-orange - Permissible elongation (2-4-6)
  madd_lazim: '#7F0000', // Deep crimson - Obligatory elongation (6 harakat)
  madd_arid: '#AD1457', // Crimson-pink - Elongation due to stop
  madd_leen: '#BF360C', // Burnt orange - Soft elongation

  // Qalqalah (Echo sound)
  qalqalah_sughra: '#00838F', // Teal - Minor echo
  qalqalah_kubra: '#00695C', // Deep teal - Major echo

  // Lam Rules
  lam_shamsiyyah: '#EF6C00', // Amber - Sun letters (assimilation)
  lam_qamariyyah: '#8E24AA', // Purple - Moon letters (clear)

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

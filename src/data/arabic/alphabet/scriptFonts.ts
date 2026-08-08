// Shared registry of the Arabic writing styles used across the alphabet screens.
// Fonts are runtime-loaded (expo-font useFonts) so they work in Expo Go and dev
// builds without a native rebuild; Naskh uses the system Arabic font.

export type ArabicScript = 'naskh' | 'ruqah' | 'nastaliq';

// Passed to useFonts(...). Keys become the fontFamily names.
export const ARABIC_SCRIPT_FONTS = {
  ArefRuqaa: require('../../../../assets/fonts/ArefRuqaa-Regular.ttf'),
  NotoNastaliq: require('../../../../assets/fonts/NotoNastaliqUrdu.ttf'),
};

export interface ScriptMeta {
  key: ArabicScript;
  font?: string;       // fontFamily; undefined = system (Naskh)
  nameKey: string;     // i18n key
  descKey: string;     // i18n key
  color: string;
}

export const SCRIPT_META: ScriptMeta[] = [
  { key: 'naskh', font: undefined, nameKey: 'alphabet.scriptNaskh', descKey: 'alphabet.scriptNaskhDesc', color: '#6366f1' },
  { key: 'ruqah', font: 'ArefRuqaa', nameKey: 'alphabet.scriptRuqah', descKey: 'alphabet.scriptRuqahDesc', color: '#10b981' },
  { key: 'nastaliq', font: 'NotoNastaliq', nameKey: 'alphabet.scriptNastaliq', descKey: 'alphabet.scriptNastaliqDesc', color: '#f59e0b' },
];

/** fontFamily for a script (undefined = system Naskh). */
export function scriptFontFamily(script: ArabicScript): string | undefined {
  return SCRIPT_META.find((s) => s.key === script)?.font;
}

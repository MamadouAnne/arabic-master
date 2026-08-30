import { View, Text, Pressable, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRef } from 'react';
import { color, radius } from '../../theme/tokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ArabicKeyboardProps {
  onKeyPress: (key: string) => void;
  onBackspace: () => void;
  onSpace: () => void;
  onSubmit: () => void;
  onCursorLeft?: () => void;
  onCursorRight?: () => void;
}

// Modern Arabic keyboard layout (matches iOS/Android)
const keyboardRows = [
  ['ض', 'ص', 'ث', 'ق', 'ف', 'غ', 'ع', 'ه', 'خ', 'ح', 'ج'],
  ['ش', 'س', 'ي', 'ب', 'ل', 'ا', 'ت', 'ن', 'م', 'ك', 'ة'],
  ['ء', 'ظ', 'ط', 'ذ', 'د', 'ز', 'ر', 'و', 'ى'],
];

// Row 1: All diacritics / tashkeel (combining marks that go ON letters)
const diacritics = [
  { key: 'َ', display: 'ـَ' },   // Fatha
  { key: 'ُ', display: 'ـُ' },   // Damma
  { key: 'ِ', display: 'ـِ' },   // Kasra
  { key: 'ْ', display: 'ـْ' },   // Sukun
  { key: 'ّ', display: 'ـّ' },   // Shadda
  { key: 'ً', display: 'ـً' },   // Tanwin Fath
  { key: 'ٌ', display: 'ـٌ' },   // Tanwin Damm
  { key: 'ٍ', display: 'ـٍ' },   // Tanwin Kasr
  { key: 'ٰ', display: 'ـٰ' },   // Superscript Alef
  { key: '\u0654', display: 'ـٔ' }, // Hamza Above
  { key: '\u0655', display: 'ـٕ' }, // Hamza Below
];

// Row 2: Special letters (hamza carriers) + Quranic marks
const specialChars = [
  { key: 'أ', display: 'أ', isLetter: true },   // Alif Hamza Above
  { key: 'إ', display: 'إ', isLetter: true },   // Alif Hamza Below
  { key: 'ؤ', display: 'ؤ', isLetter: true },   // Waw Hamza
  { key: 'ئ', display: 'ئ', isLetter: true },   // Ya Hamza
  { key: 'آ', display: 'آ', isLetter: true },   // Alif Maddah
  { key: 'ٱ', display: 'ٱ', isLetter: true },   // Alif Wasla
  { key: 'ٓ', display: 'ـٓ', isLetter: false },  // Maddah
  { key: 'ۡ', display: 'ـۡ', isLetter: false },  // Sukun Qurani
  { key: 'ۢ', display: 'ـۢ', isLetter: false },  // Meem Iqlab
  { key: 'ۥ', display: 'ـۥ', isLetter: false },  // Small Waw
  { key: 'ۦ', display: 'ـۦ', isLetter: false },  // Small Ya
];

export default function ArabicKeyboard({
  onKeyPress,
  onBackspace,
  onSpace,
  onSubmit,
  onCursorLeft,
  onCursorRight,
}: ArabicKeyboardProps) {
  const keyWidth = (SCREEN_WIDTH - 24) / 11 - 3;
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handlePressIn = (handler: (() => void) | undefined) => {
    if (!handler) return;
    handler();
    // Delay before repeat starts so quick taps only fire once
    timeoutRef.current = setTimeout(() => {
      intervalRef.current = setInterval(handler, 100);
    }, 400);
  };

  const handlePressOut = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Row 1: Diacritics / Tashkeel */}
      <View style={styles.specialRow}>
        {diacritics.map((item) => (
          <Pressable
            key={item.key}
            style={[styles.specialKey, { width: keyWidth, height: keyWidth * 1.35 }]}
            onPress={() => onKeyPress(item.key)}
          >
            <Text style={styles.diacriticText}>{item.display}</Text>
          </Pressable>
        ))}
      </View>

      {/* Row 2: Hamza carriers + Quranic marks */}
      <View style={styles.specialRow}>
        {specialChars.map((item) => (
          <Pressable
            key={item.key}
            style={[styles.specialKey, { width: keyWidth, height: keyWidth * 1.35 }]}
            onPress={() => onKeyPress(item.key)}
          >
            <Text style={[styles.specialCharText, item.isLetter && styles.letterText]}>
              {item.display}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Main Keyboard */}
      {keyboardRows.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((key, keyIndex) => (
            <Pressable
              key={`${key}-${keyIndex}`}
              style={[styles.key, { width: keyWidth, height: keyWidth * 1.4 }]}
              onPress={() => onKeyPress(key)}
            >
              <Text style={styles.keyText}>{key}</Text>
            </Pressable>
          ))}
          {rowIndex === keyboardRows.length - 1 && (
            <Pressable
              style={[styles.backspaceKey, { height: keyWidth * 1.4 }]}
              onPress={onBackspace}
            >
              <Ionicons name="backspace" size={22} color={color.text} />
            </Pressable>
          )}
        </View>
      ))}

      {/* Bottom Row */}
      <View style={styles.bottomRow}>
        {onCursorLeft && (
          <Pressable
            style={styles.arrowKey}
            onPressIn={() => handlePressIn(onCursorLeft)}
            onPressOut={handlePressOut}
          >
            <Ionicons name="chevron-back" size={22} color={color.text} />
          </Pressable>
        )}
        {onCursorRight && (
          <Pressable
            style={styles.arrowKey}
            onPressIn={() => handlePressIn(onCursorRight)}
            onPressOut={handlePressOut}
          >
            <Ionicons name="chevron-forward" size={22} color={color.text} />
          </Pressable>
        )}
        <Pressable style={styles.spaceKey} onPress={onSpace}>
          <Text style={styles.spaceKeyText}>مسافة</Text>
        </Pressable>
        <Pressable style={styles.submitKey} onPress={onSubmit}>
          <Ionicons name="checkmark" size={24} color={color.text} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: color.surface,
    paddingHorizontal: 3,
    paddingTop: 8,
    paddingBottom: 4,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  // Special rows (diacritics + special chars) - same width grid as main keys
  specialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 5,
    gap: 3,
  },
  specialKey: {
    backgroundColor: '#293548',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  diacriticText: {
    fontSize: 22,
    color: color.sacred,
    textAlign: 'center',
  },
  specialCharText: {
    fontSize: 20,
    color: color.progress,
    textAlign: 'center',
  },
  letterText: {
    fontSize: 22,
    color: color.warning,
  },
  // Main keyboard rows
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 5,
    gap: 3,
  },
  key: {
    backgroundColor: color.surfaceRaised,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyText: {
    fontSize: 24,
    color: color.text,
  },
  // Bottom row
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 4,
    paddingHorizontal: 4,
    gap: 4,
  },
  arrowKey: {
    backgroundColor: color.borderStrong,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backspaceKey: {
    backgroundColor: color.danger,
    paddingHorizontal: 16,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spaceKey: {
    flex: 1,
    backgroundColor: color.surfaceRaised,
    marginHorizontal: 4,
    paddingVertical: 14,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spaceKeyText: {
    fontSize: 18,
    color: color.textMuted,
  },
  submitKey: {
    backgroundColor: color.progress,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

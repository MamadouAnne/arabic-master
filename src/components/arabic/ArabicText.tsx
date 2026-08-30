import { Text, TextProps, Pressable, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useProgressStore } from '../../stores/progressStore';
import { color, font, radius, space, type } from '../../theme/tokens';

interface ArabicTextProps extends TextProps {
  children: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  withVowels?: string; // The voweled version of the text
  showSpeaker?: boolean;
  onPlayAudio?: () => void;
  isPlaying?: boolean;
  color?: string;
  centered?: boolean;
  /** Use the AmiriQuran cut, spaced for dense Quranic vocalisation. */
  quranic?: boolean;
}

// Amiri renders optically smaller than the system face, so each step is set a
// little larger than the previous system-font values, with extra leading to
// clear stacked harakat.
const fontSizes = {
  sm: 17,
  md: 21,
  lg: 25,
  xl: 30,
  '2xl': 36,
  '3xl': 44,
  '4xl': 54,
};

const lineHeights = {
  sm: 30,
  md: 38,
  lg: 46,
  xl: 54,
  '2xl': 64,
  '3xl': 80,
  '4xl': 96,
};

export function ArabicText({
  children,
  size = 'lg',
  withVowels,
  showSpeaker = false,
  onPlayAudio,
  isPlaying = false,
  color: textColor = color.text,
  centered = false,
  quranic = false,
  style,
  ...props
}: ArabicTextProps) {
  const { showVowels } = useProgressStore();

  // Use voweled text if available and showVowels is true
  const displayText = showVowels && withVowels ? withVowels : children;

  const textStyle = StyleSheet.flatten([
    {
      // Amiri (naskh) app-wide; the AmiriQuran cut for verses, which is spaced
      // so dense vocalisation does not collide.
      fontFamily: quranic ? font.quran : font.arabic,
      fontSize: fontSizes[size],
      lineHeight: lineHeights[size],
      color: textColor,
      writingDirection: 'rtl' as const,
      textAlign: centered ? 'center' as const : 'right' as const,
    },
    style,
  ]);

  const textElement = (
    <Text style={textStyle} {...props}>
      {displayText}
    </Text>
  );

  if (showSpeaker && onPlayAudio) {
    return (
      <View style={styles.speakerContainer}>
        <Pressable
          onPress={onPlayAudio}
          style={[
            styles.speakerButton,
            isPlaying && styles.speakerButtonActive,
          ]}
        >
          <Ionicons
            name={isPlaying ? 'volume-high' : 'volume-medium'}
            size={18}
            color={isPlaying ? color.text : color.sacred}
          />
        </Pressable>
        {textElement}
      </View>
    );
  }

  return textElement;
}

// Tappable version that plays audio when pressed
interface TappableArabicTextProps extends ArabicTextProps {
  onPress?: () => void;
}

export function TappableArabicText({
  children,
  onPress,
  onPlayAudio,
  isPlaying,
  ...props
}: TappableArabicTextProps) {
  const handlePress = () => {
    if (onPlayAudio) {
      onPlayAudio();
    }
    if (onPress) {
      onPress();
    }
  };

  return (
    <Pressable onPress={handlePress} style={styles.tappable}>
      <View style={styles.tappableContent}>
        <ArabicText {...props}>{children}</ArabicText>
        {onPlayAudio && (
          <View style={[styles.miniSpeaker, isPlaying && styles.miniSpeakerActive]}>
            <Ionicons
              name="volume-medium"
              size={14}
              color={isPlaying ? color.text : color.sacred}
            />
          </View>
        )}
      </View>
    </Pressable>
  );
}

// Large display for learning screens
interface ArabicDisplayProps {
  text: string;
  textWithVowels?: string;
  transliteration?: string;
  translation?: string;
  size?: 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  onPlayAudio?: () => void;
  isPlaying?: boolean;
}

export function ArabicDisplay({
  text,
  textWithVowels,
  transliteration,
  translation,
  size = '3xl',
  onPlayAudio,
  isPlaying,
}: ArabicDisplayProps) {
  return (
    <View style={styles.displayContainer}>
      <Pressable
        onPress={onPlayAudio}
        disabled={!onPlayAudio}
        style={styles.displayPressable}
      >
        <ArabicText
          size={size}
          withVowels={textWithVowels}
          centered
          color={color.text}
        >
          {text}
        </ArabicText>
        {onPlayAudio && (
          <View style={[styles.displaySpeaker, isPlaying && styles.displaySpeakerActive]}>
            <Ionicons
              name={isPlaying ? 'volume-high' : 'volume-medium'}
              size={24}
              color={isPlaying ? color.text : color.sacred}
            />
          </View>
        )}
      </Pressable>
      {transliteration && (
        <Text style={styles.transliteration}>{transliteration}</Text>
      )}
      {translation && (
        <Text style={styles.translation}>{translation}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  speakerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  speakerButton: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: color.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: space.sm,
  },
  speakerButtonActive: {
    backgroundColor: color.accentStrong,
  },
  tappable: {
    opacity: 1,
  },
  tappableContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  miniSpeaker: {
    width: 24,
    height: 24,
    borderRadius: radius.full,
    backgroundColor: color.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: space.sm,
  },
  miniSpeakerActive: {
    backgroundColor: color.accentStrong,
  },
  displayContainer: {
    alignItems: 'center',
    paddingVertical: space.xl,
  },
  displayPressable: {
    alignItems: 'center',
  },
  displaySpeaker: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    backgroundColor: color.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: space.lg,
  },
  displaySpeakerActive: {
    backgroundColor: color.accentStrong,
  },
  transliteration: {
    ...type.bodyLarge,
    color: color.sacred,
    marginTop: space.md,
    fontStyle: 'italic',
  },
  translation: {
    ...type.body,
    color: color.textMuted,
    marginTop: space.sm,
  },
});

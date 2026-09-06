import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { ArabicLetter } from '../../types/arabic';
import { useProgressStore } from '../../stores/progressStore';
import { font, color, radius } from '../../theme/tokens';

interface LetterCardProps {
  letter: ArabicLetter;
  onPress?: () => void;
  onPlayAudio?: () => void;
  isPlaying?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showStatus?: boolean;
}

export function LetterCard({
  letter,
  onPress,
  onPlayAudio,
  isPlaying = false,
  size = 'md',
  showStatus = true,
}: LetterCardProps) {
  const { isLetterLearned, progress } = useProgressStore();
  const isLearned = isLetterLearned(letter.id);
  const isMastered = progress.alphabetProgress.masteredLetters.includes(letter.id);

  const sizeStyles = {
    sm: { card: styles.cardSm, letter: styles.letterSm, name: styles.nameSm },
    md: { card: styles.cardMd, letter: styles.letterMd, name: styles.nameMd },
    lg: { card: styles.cardLg, letter: styles.letterLg, name: styles.nameLg },
  };

  const currentSize = sizeStyles[size];

  return (
    <Pressable
      onPress={onPress}
      // Plain array, not style={({pressed}) => ...}: NativeWind's css-interop
      // wraps Pressable and never invokes the function form, so those styles
      // are dropped on device.
      style={[
        styles.card,
        currentSize.card,
        isMastered && styles.cardMastered,
        isLearned && !isMastered && styles.cardLearned,
      ]}
    >
      {/* Status indicator */}
      {showStatus && (isLearned || isMastered) && (
        <View style={[styles.statusBadge, isMastered ? styles.statusMastered : styles.statusLearned]}>
          <Ionicons
            name={isMastered ? 'star' : 'checkmark'}
            size={12}
            color={color.text}
          />
        </View>
      )}

      {/* Arabic letter */}
      <Text style={[styles.letter, currentSize.letter]}>
        {letter.letter}
      </Text>

      {/* Letter name */}
      <Text style={[styles.name, currentSize.name]}>
        {letter.name}
      </Text>

      {/* Audio button */}
      {onPlayAudio && (
        <Pressable
          onPress={(e) => {
            e.stopPropagation();
            onPlayAudio();
          }}
          style={[styles.audioButton, isPlaying && styles.audioButtonActive]}
        >
          <Ionicons
            name={isPlaying ? 'volume-high' : 'volume-medium'}
            size={16}
            color={isPlaying ? '#ffffff' : color.sacred}
          />
        </Pressable>
      )}
    </Pressable>
  );
}

// Grid of letter cards
interface LetterGridProps {
  letters: ArabicLetter[];
  onLetterPress?: (letter: ArabicLetter) => void;
  onPlayAudio?: (letter: ArabicLetter) => void;
  playingLetterId?: string | null;
  columns?: number;
}

export function LetterGrid({
  letters,
  onLetterPress,
  onPlayAudio,
  playingLetterId,
  columns = 4,
}: LetterGridProps) {
  return (
    <View style={[styles.grid, { flexDirection: 'row', flexWrap: 'wrap' }]}>
      {letters.map((letter) => (
        <View
          key={letter.id}
          style={{ width: `${100 / columns}%`, padding: 4 }}
        >
          <LetterCard
            letter={letter}
            onPress={() => onLetterPress?.(letter)}
            onPlayAudio={() => onPlayAudio?.(letter)}
            isPlaying={playingLetterId === letter.id}
            size="md"
          />
        </View>
      ))}
    </View>
  );
}

// Detailed letter display for learning
interface LetterDetailProps {
  letter: ArabicLetter;
  onPlayAudio?: () => void;
  isPlaying?: boolean;
}

export function LetterDetail({ letter, onPlayAudio, isPlaying }: LetterDetailProps) {
  const { t } = useTranslation();
  return (
    <View style={styles.detailContainer}>
      {/* Main letter display */}
      <Pressable onPress={onPlayAudio} style={styles.mainLetterContainer}>
        <Text style={styles.mainLetter}>{letter.letter}</Text>
        {onPlayAudio && (
          <View style={[styles.detailAudioButton, isPlaying && styles.audioButtonActive]}>
            <Ionicons
              name={isPlaying ? 'volume-high' : 'volume-medium'}
              size={24}
              color={isPlaying ? '#ffffff' : color.sacred}
            />
          </View>
        )}
      </Pressable>

      {/* Letter info */}
      <View style={styles.infoSection}>
        <Text style={styles.letterName}>{letter.name}</Text>
        <Text style={styles.letterNameArabic}>{letter.nameArabic}</Text>
        <Text style={styles.transliteration}>/{letter.transliteration}/</Text>
      </View>

      {/* Sound description */}
      <View style={styles.descriptionSection}>
        <Text style={styles.descriptionTitle}>{t('alphabet.howToPronounce')}</Text>
        <Text style={styles.descriptionText}>{letter.soundDescription}</Text>
      </View>

      {/* Letter forms */}
      <View style={styles.formsSection}>
        <Text style={styles.formsTitle}>{t('alphabet.letterForms')}</Text>
        <View style={styles.formsGrid}>
          <View style={styles.formItem}>
            <Text style={styles.formLabel}>{t('alphabet.isolated')}</Text>
            <Text style={styles.formLetter}>{letter.forms.isolated}</Text>
          </View>
          <View style={styles.formItem}>
            <Text style={styles.formLabel}>{t('alphabet.initial')}</Text>
            <Text style={styles.formLetter}>{letter.forms.initial}</Text>
          </View>
          <View style={styles.formItem}>
            <Text style={styles.formLabel}>{t('alphabet.medial')}</Text>
            <Text style={styles.formLetter}>{letter.forms.medial}</Text>
          </View>
          <View style={styles.formItem}>
            <Text style={styles.formLabel}>{t('alphabet.final')}</Text>
            <Text style={styles.formLetter}>{letter.forms.final}</Text>
          </View>
        </View>
      </View>

      {/* Examples */}
      <View style={styles.examplesSection}>
        <Text style={styles.examplesTitle}>{t('alphabet.examples')}</Text>
        {letter.examples.map((example, index) => (
          <View key={index} style={styles.exampleItem}>
            <Text style={styles.exampleArabic}>{example.word}</Text>
            <Text style={styles.exampleTranslit}>{example.transliteration}</Text>
            <Text style={styles.exampleMeaning}>{example.meaning}</Text>
            <Text style={styles.examplePosition}>({example.position})</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: color.surface,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: color.border,
    position: 'relative',
  },
  cardSm: {
    padding: 8,
    minHeight: 60,
  },
  cardMd: {
    padding: 12,
    minHeight: 80,
  },
  cardLg: {
    padding: 16,
    minHeight: 100,
  },
  cardPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  cardLearned: {
    borderColor: color.accentStrong,
    backgroundColor: color.accentSoft,
  },
  cardMastered: {
    borderColor: color.sacred,
    backgroundColor: color.sacredSoft,
  },
  letter: {
    color: color.text,
    fontWeight: '400',
  },
  letterSm: {
    fontSize: 24,
  },
  letterMd: {
    fontSize: 32,
  },
  letterLg: {
    fontSize: 40,
  },
  name: {
    color: color.textMuted,
    marginTop: 4,
  },
  nameSm: {
    fontSize: 10,
  },
  nameMd: {
    fontSize: 12,
  },
  nameLg: {
    fontSize: 14,
  },
  statusBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusLearned: {
    backgroundColor: color.accentStrong,
  },
  statusMastered: {
    backgroundColor: color.sacred,
  },
  audioButton: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: radius.md,
    backgroundColor: color.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioButtonActive: {
    backgroundColor: color.accentStrong,
  },
  grid: {
    padding: 4,
  },
  detailContainer: {
    padding: 20,
  },
  mainLetterContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  mainLetter: {
    fontSize: 120,
    color: color.text,
  },
  detailAudioButton: {
    width: 48,
    height: 48,
    borderRadius: radius.xl,
    backgroundColor: color.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  infoSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  letterName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: color.text,
  },
  letterNameArabic: {
    fontFamily: font.arabic,
    lineHeight: 34,
    fontSize: 20,
    color: color.sacred,
    marginTop: 4,
  },
  transliteration: {
    fontSize: 16,
    color: color.textMuted,
    marginTop: 4,
    fontStyle: 'italic',
  },
  descriptionSection: {
    backgroundColor: color.surface,
    borderRadius: radius.md,
    padding: 16,
    marginBottom: 20,
  },
  descriptionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: color.sacred,
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 16,
    color: color.text,
    lineHeight: 24,
  },
  formsSection: {
    marginBottom: 20,
  },
  formsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: color.text,
    marginBottom: 12,
  },
  formsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  formItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: color.surface,
    borderRadius: radius.md,
    padding: 12,
    marginHorizontal: 4,
  },
  formLabel: {
    fontSize: 12,
    color: color.textMuted,
    marginBottom: 8,
  },
  formLetter: {
    fontSize: 36,
    color: color.text,
  },
  examplesSection: {
    marginTop: 10,
  },
  examplesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: color.text,
    marginBottom: 12,
  },
  exampleItem: {
    backgroundColor: color.surface,
    borderRadius: radius.md,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  exampleArabic: {
    fontFamily: font.arabic,
    lineHeight: 41,
    fontSize: 24,
    color: color.text,
  },
  exampleTranslit: {
    fontSize: 14,
    color: color.sacred,
    fontStyle: 'italic',
  },
  exampleMeaning: {
    fontSize: 14,
    color: color.text,
  },
  examplePosition: {
    fontSize: 12,
    color: color.textFaint,
  },
});

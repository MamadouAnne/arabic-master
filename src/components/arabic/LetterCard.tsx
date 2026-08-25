import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { ArabicLetter } from '../../types/arabic';
import { useProgressStore } from '../../stores/progressStore';

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
      style={({ pressed }) => [
        styles.card,
        currentSize.card,
        pressed && styles.cardPressed,
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
            color="#ffffff"
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
            color={isPlaying ? '#ffffff' : '#D4AF37'}
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
              color={isPlaying ? '#ffffff' : '#D4AF37'}
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
    backgroundColor: '#1e293b',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#334155',
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
    borderColor: '#6366f1',
    backgroundColor: '#1e1b4b',
  },
  cardMastered: {
    borderColor: '#D4AF37',
    backgroundColor: '#1c1a00',
  },
  letter: {
    color: '#ffffff',
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
    color: '#94a3b8',
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
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusLearned: {
    backgroundColor: '#6366f1',
  },
  statusMastered: {
    backgroundColor: '#D4AF37',
  },
  audioButton: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioButtonActive: {
    backgroundColor: '#6366f1',
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
    color: '#ffffff',
  },
  detailAudioButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#334155',
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
    color: '#ffffff',
  },
  letterNameArabic: {
    fontSize: 20,
    color: '#D4AF37',
    marginTop: 4,
  },
  transliteration: {
    fontSize: 16,
    color: '#94a3b8',
    marginTop: 4,
    fontStyle: 'italic',
  },
  descriptionSection: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  descriptionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D4AF37',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 16,
    color: '#e2e8f0',
    lineHeight: 24,
  },
  formsSection: {
    marginBottom: 20,
  },
  formsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
  },
  formsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  formItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 4,
  },
  formLabel: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 8,
  },
  formLetter: {
    fontSize: 36,
    color: '#ffffff',
  },
  examplesSection: {
    marginTop: 10,
  },
  examplesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
  },
  exampleItem: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  exampleArabic: {
    fontSize: 24,
    color: '#ffffff',
  },
  exampleTranslit: {
    fontSize: 14,
    color: '#D4AF37',
    fontStyle: 'italic',
  },
  exampleMeaning: {
    fontSize: 14,
    color: '#e2e8f0',
  },
  examplePosition: {
    fontSize: 12,
    color: '#64748b',
  },
});

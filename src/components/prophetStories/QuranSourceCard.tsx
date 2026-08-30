import React from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { QuranReference } from '../../types/prophetStories';
import { useLocalizedContent } from '../../hooks/useLocalizedContent';
import { font, color, radius } from '../../theme/tokens';
import { withAlpha } from '../ui/Primitives';

interface QuranSourceCardProps {
  source: QuranReference;
  isPlaying?: boolean;
  isLoading?: boolean;
  onPlayArabic?: () => void;
}

export function QuranSourceCard({
  source,
  isPlaying = false,
  isLoading = false,
  onPlayArabic,
}: QuranSourceCardProps) {
  const { lc } = useLocalizedContent();
  const ayahRange = source.ayahStart === source.ayahEnd
    ? `${source.ayahStart}`
    : `${source.ayahStart}-${source.ayahEnd}`;

  return (
    <View style={styles.container}>
      {/* Header with Surah reference */}
      <View style={styles.header}>
        <View style={styles.referenceContainer}>
          <Ionicons name="book" size={14} color={color.progress} />
          <Text style={styles.referenceText}>
            {source.surahNameEnglish} {source.surahNumber}:{ayahRange}
          </Text>
          <Text style={styles.referenceArabic}>
            {source.surahNameArabic}
          </Text>
        </View>
        {onPlayArabic && (
          <Pressable
            style={[styles.playButton, isPlaying && styles.playButtonActive]}
            onPress={onPlayArabic}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={color.text} />
            ) : (
              <Ionicons
                name={isPlaying ? 'pause' : 'play'}
                size={14}
                color={color.text}
              />
            )}
          </Pressable>
        )}
      </View>

      {/* Arabic Text - render words separately to avoid RTL wrapping bug */}
      <View style={styles.arabicContainer}>
        {source.arabicText.split(' ').map((word, index) => (
          <Text key={index} style={styles.arabicWord}>{word}</Text>
        ))}
      </View>

      {/* Translation */}
      <Text style={styles.translation}>{lc(source.translation, source.translationFr)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: withAlpha(color.progress, 0.06),
    borderRadius: radius.md,
    padding: 12,
    marginVertical: 8,
    borderLeftWidth: 3,
    borderLeftColor: color.progress,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  referenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  referenceText: {
    color: color.progress,
    fontSize: 12,
    fontWeight: '600',
  },
  referenceArabic: {
    fontFamily: font.arabic,
    lineHeight: 20,
    color: '#6ee7b7',
    fontSize: 12,
    marginLeft: 4,
  },
  playButton: {
    width: 28,
    height: 28,
    borderRadius: radius.md,
    backgroundColor: color.progress,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButtonActive: {
    backgroundColor: color.accent,
  },
  arabicContainer: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginBottom: 14,
    gap: 8,
  },
  arabicWord: {
    fontFamily: font.arabic,
    color: color.text,
    fontSize: 22,
    lineHeight: 44,
  },
  translation: {
    color: color.textMuted,
    fontSize: 14,
    lineHeight: 22,
    fontStyle: 'italic',
  },
});

export default QuranSourceCard;

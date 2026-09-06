import React from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StoryContentBlock as ContentBlock, QuranReference, HadithReference } from '../../types/quranStories';
import { useLocalizedContent } from '../../hooks/useLocalizedContent';
import { useTranslation } from 'react-i18next';
import { font, color, radius } from '../../theme/tokens';
import { withAlpha } from '../ui/Primitives';

interface StoryContentBlockProps {
  block: ContentBlock;
  isHighlighted?: boolean;
  onPlayQuranAudio?: (source: QuranReference) => void;
  isQuranPlaying?: boolean;
  isQuranLoading?: boolean;
}

// Quran Source Card Component
function QuranSourceCard({
  source,
  isPlaying = false,
  isLoading = false,
  onPlayArabic,
}: {
  source: QuranReference;
  isPlaying?: boolean;
  isLoading?: boolean;
  onPlayArabic?: () => void;
}) {
  const { lc } = useLocalizedContent();
  const ayahRange = source.ayahStart === source.ayahEnd
    ? `${source.ayahStart}`
    : `${source.ayahStart}-${source.ayahEnd}`;

  return (
    <View style={quranStyles.container}>
      <View style={quranStyles.header}>
        <View style={quranStyles.referenceContainer}>
          <Ionicons name="book" size={14} color={color.progress} />
          <Text style={quranStyles.referenceText}>
            {source.surahNameEnglish} {source.surahNumber}:{ayahRange}
          </Text>
          <Text style={quranStyles.referenceArabic}>
            {source.surahNameArabic}
          </Text>
        </View>
        {onPlayArabic && (
          <Pressable
            style={[quranStyles.playButton, isPlaying && quranStyles.playButtonActive]}
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

      <View style={quranStyles.arabicContainer}>
        {source.arabicText.split(' ').map((word, index) => (
          <Text key={index} style={quranStyles.arabicWord}>{word}</Text>
        ))}
      </View>

      <Text style={quranStyles.translation}>{lc(source.translation, source.translationFr)}</Text>
    </View>
  );
}

// Hadith Source Card Component
function HadithSourceCard({ source }: { source: HadithReference }) {
  const { lc } = useLocalizedContent();
  const { t } = useTranslation();
  return (
    <View style={hadithStyles.container}>
      <View style={hadithStyles.header}>
        <View style={hadithStyles.referenceContainer}>
          <Ionicons name="document-text" size={14} color={color.warning} />
          <Text style={hadithStyles.referenceText}>{source.collection}</Text>
        </View>
        {source.grade && (
          <View style={hadithStyles.gradeBadge}>
            <Text style={hadithStyles.gradeText}>
              {source.grade.charAt(0).toUpperCase() + source.grade.slice(1)}
            </Text>
          </View>
        )}
      </View>

      {source.narrator && (
        <View style={hadithStyles.narratorContainer}>
          <Ionicons name="person-outline" size={12} color={color.textMuted} />
          <Text style={hadithStyles.narratorText}>{t('stories.narratedBy', { narrator: source.narrator })}</Text>
        </View>
      )}

      {source.arabicText && (
        <View style={hadithStyles.arabicContainer}>
          {source.arabicText.split(' ').map((word, index) => (
            <Text key={index} style={hadithStyles.arabicWord}>{word}</Text>
          ))}
        </View>
      )}

      <Text style={hadithStyles.translation}>"{lc(source.translation, source.translationFr)}"</Text>
    </View>
  );
}

export function StoryContentBlock({
  block,
  isHighlighted = false,
  onPlayQuranAudio,
  isQuranPlaying = false,
  isQuranLoading = false,
}: StoryContentBlockProps) {
  const { lc } = useLocalizedContent();

  if (block.type === 'narrative') {
    return (
      <View style={[styles.narrativeContainer, isHighlighted && styles.highlighted]}>
        <Text style={styles.narrativeText}>{lc(block.content, block.contentFr)}</Text>
      </View>
    );
  }

  if (block.type === 'quran_source' && block.source?.type === 'quran') {
    return (
      <View style={[styles.sourceContainer, isHighlighted && styles.highlighted]}>
        <QuranSourceCard
          source={block.source as QuranReference}
          onPlayArabic={onPlayQuranAudio ? () => onPlayQuranAudio(block.source as QuranReference) : undefined}
          isPlaying={isQuranPlaying}
          isLoading={isQuranLoading}
        />
      </View>
    );
  }

  if (block.type === 'hadith_source' && block.source?.type === 'hadith') {
    return (
      <View style={[styles.sourceContainer, isHighlighted && styles.highlighted]}>
        <HadithSourceCard source={block.source as HadithReference} />
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  narrativeContainer: {
    marginVertical: 8,
    paddingVertical: 4,
    paddingHorizontal: 2,
    borderRadius: radius.sm,
  },
  narrativeText: {
    color: color.text,
    fontSize: 16,
    lineHeight: 26,
  },
  sourceContainer: {
    borderRadius: radius.sm,
  },
  highlighted: {
    backgroundColor: withAlpha(color.accent, 0.13),
    borderRadius: radius.md,
    paddingHorizontal: 8,
    marginHorizontal: -8,
  },
});

const quranStyles = StyleSheet.create({
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
    lineHeight: 26,
    color: '#6ee7b7',
    fontSize: 16,
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
    fontSize: 28,
    lineHeight: 56,
  },
  translation: {
    color: color.textMuted,
    fontSize: 14,
    lineHeight: 22,
    fontStyle: 'italic',
  },
});

const hadithStyles = StyleSheet.create({
  container: {
    backgroundColor: withAlpha(color.warning, 0.06),
    borderRadius: radius.md,
    padding: 14,
    marginVertical: 8,
    borderLeftWidth: 3,
    borderLeftColor: color.warning,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  referenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  referenceText: {
    color: color.warning,
    fontSize: 12,
    fontWeight: '600',
  },
  gradeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: withAlpha(color.progress, 0.13),
  },
  gradeText: {
    fontSize: 10,
    fontWeight: '600',
    color: color.progress,
  },
  narratorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 10,
  },
  narratorText: {
    color: color.textMuted,
    fontSize: 11,
    fontStyle: 'italic',
  },
  arabicContainer: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginBottom: 10,
    gap: 6,
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

export default StoryContentBlock;

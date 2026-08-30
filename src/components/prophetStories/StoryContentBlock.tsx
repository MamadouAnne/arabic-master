import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { StoryContentBlock as ContentBlock, QuranReference, HadithReference } from '../../types/prophetStories';
import { QuranSourceCard } from './QuranSourceCard';
import { HadithSourceCard } from './HadithSourceCard';
import { useLocalizedContent } from '../../hooks/useLocalizedContent';
import { color, radius } from '../../theme/tokens';
import { withAlpha } from '../ui/Primitives';

interface StoryContentBlockProps {
  block: ContentBlock;
  isHighlighted?: boolean;
  onPlayQuranAudio?: (source: QuranReference) => void;
  isQuranPlaying?: boolean;
  isQuranLoading?: boolean;
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

export default StoryContentBlock;

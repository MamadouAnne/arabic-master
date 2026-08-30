import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { QuranStoryListItem, STORY_CATEGORY_LABELS } from '../../types/quranStories';
import { font, color, radius } from '../../theme/tokens';
import { withAlpha } from '../ui/Primitives';

interface QuranStoryCardProps {
  story: QuranStoryListItem;
  onPress: () => void;
}

export function QuranStoryCard({ story, onPress }: QuranStoryCardProps) {
  const categoryLabel = STORY_CATEGORY_LABELS[story.category];

  return (
    <Pressable style={styles.container} onPress={onPress}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{story.icon}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.nameRow}>
          <Text style={styles.nameArabic}>{story.titleArabic}</Text>
          <Text style={styles.nameEnglish}>{story.titleEnglish}</Text>
        </View>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{categoryLabel.english}</Text>
        </View>
        <Text style={styles.description} numberOfLines={2}>
          {story.description}
        </Text>
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={12} color={color.textFaint} />
            <Text style={styles.metaText}>{story.estimatedReadTime} min</Text>
          </View>
          {story.progress > 0 && story.progress < 100 && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${story.progress}%` }]} />
              </View>
              <Text style={styles.progressText}>{story.progress}%</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.statusContainer}>
        {story.isCompleted ? (
          <View style={styles.completedBadge}>
            <Ionicons name="checkmark-circle" size={24} color={color.progress} />
          </View>
        ) : (
          <Ionicons name="chevron-forward" size={20} color={color.textFaint} />
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: color.surface,
    borderRadius: radius.lg,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: radius.xl,
    backgroundColor: withAlpha(color.accent, 0.13),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  icon: {
    fontSize: 20,
  },
  content: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 2,
  },
  nameArabic: {
    fontFamily: font.arabic,
    lineHeight: 31,
    color: color.text,
    fontSize: 18,
    fontWeight: '600',
  },
  nameEnglish: {
    color: color.textMuted,
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: withAlpha(color.accent, 0.08),
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 10,
    color: color.accent,
    fontWeight: '500',
  },
  description: {
    color: color.textMuted,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    color: color.textFaint,
    fontSize: 11,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: color.surfaceRaised,
    borderRadius: 2,
    maxWidth: 80,
  },
  progressFill: {
    height: '100%',
    backgroundColor: color.accent,
    borderRadius: 2,
  },
  progressText: {
    color: color.accent,
    fontSize: 11,
    fontWeight: '500',
  },
  statusContainer: {
    marginLeft: 12,
  },
  completedBadge: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default QuranStoryCard;

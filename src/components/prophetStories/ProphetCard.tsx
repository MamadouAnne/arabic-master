import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ProphetListItem } from '../../types/prophetStories';
import { font, color, radius } from '../../theme/tokens';
import { withAlpha } from '../ui/Primitives';

interface ProphetCardProps {
  prophet: ProphetListItem;
  onPress?: () => void;
}

export function ProphetCard({ prophet, onPress }: ProphetCardProps) {
  return (
    <Pressable style={styles.container} onPress={onPress}>
      <View style={styles.orderContainer}>
        <Text style={styles.orderNumber}>{prophet.order}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.nameRow}>
          <Text style={styles.nameArabic}>{prophet.nameArabic}</Text>
          <Text style={styles.nameEnglish}>{prophet.nameEnglish}</Text>
        </View>
        {prophet.title && (
          <Text style={styles.title}>{prophet.title}</Text>
        )}
        <Text style={styles.summary} numberOfLines={2}>
          {prophet.summary}
        </Text>
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={12} color={color.textFaint} />
            <Text style={styles.metaText}>{prophet.estimatedReadTime} min</Text>
          </View>
          {prophet.progress > 0 && prophet.progress < 100 && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${prophet.progress}%` }]} />
              </View>
              <Text style={styles.progressText}>{prophet.progress}%</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.statusContainer}>
        {prophet.isCompleted ? (
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
  orderContainer: {
    width: 40,
    height: 40,
    borderRadius: radius.xl,
    backgroundColor: withAlpha(color.accentStrong, 0.13),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  orderNumber: {
    color: color.accent,
    fontSize: 16,
    fontWeight: 'bold',
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
    lineHeight: 40,
    color: color.text,
    fontSize: 24,
    fontWeight: '600',
  },
  nameEnglish: {
    color: color.textMuted,
    fontSize: 16,
    fontWeight: '500',
  },
  title: {
    color: color.accent,
    fontSize: 12,
    marginBottom: 4,
  },
  summary: {
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
    backgroundColor: color.progress,
    borderRadius: 2,
  },
  progressText: {
    color: color.progress,
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

export default ProphetCard;

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DuaListItem, DUA_CATEGORY_LABELS, HADITH_COLLECTION_NAMES } from '../../types/duas';
import { font, color, radius } from '../../theme/tokens';
import { withAlpha } from '../ui/Primitives';

interface DuaCardProps {
  dua: DuaListItem;
  onPress?: () => void;
}

export function DuaCard({ dua, onPress }: DuaCardProps) {
  const categoryLabel = DUA_CATEGORY_LABELS[dua.category];
  const collectionName = HADITH_COLLECTION_NAMES[dua.source.collection];

  return (
    <Pressable style={styles.container} onPress={onPress}>
      <View style={styles.orderContainer}>
        <Text style={styles.orderNumber}>{dua.order}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.nameRow}>
          <Text style={styles.nameArabic}>{dua.titleArabic}</Text>
          <Text style={styles.nameEnglish}>{dua.titleEnglish}</Text>
        </View>

        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{categoryLabel.english}</Text>
        </View>

        <Text style={styles.arabicPreview} numberOfLines={1}>
          {dua.arabicText}
        </Text>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="book-outline" size={12} color={color.textFaint} />
            <Text style={styles.metaText}>{collectionName}</Text>
          </View>
        </View>
      </View>

      <View style={styles.statusContainer}>
        {dua.isMemorized ? (
          <View style={styles.memorizedBadge}>
            <Ionicons name="checkmark-circle" size={24} color={color.progress} />
          </View>
        ) : dua.isFavorite ? (
          <View style={styles.favoriteBadge}>
            <Ionicons name="heart" size={20} color={color.warning} />
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
    backgroundColor: withAlpha(color.warning, 0.13),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  orderNumber: {
    color: color.warning,
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
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  nameArabic: {
    fontFamily: font.arabic,
    lineHeight: 31,
    color: color.text,
    fontSize: 18,
    fontWeight: '600',
  },
  nameEnglish: {
    color: color.progress,
    fontSize: 14,
    fontWeight: '500',
  },
  categoryBadge: {
    backgroundColor: withAlpha(color.warning, 0.13),
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  categoryText: {
    color: color.warning,
    fontSize: 10,
    fontWeight: '600',
  },
  arabicPreview: {
    fontFamily: font.arabic,
    lineHeight: 24,
    color: color.textMuted,
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'right',
    writingDirection: 'rtl',
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
  statusContainer: {
    marginLeft: 12,
  },
  memorizedBadge: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteBadge: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default DuaCard;

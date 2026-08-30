import React from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Ayah } from '../../types/quran';
import { TajweedText } from './TajweedText';
import { useQuranStore } from '../../stores/quranStore';
import { withAlpha } from '../ui/Primitives';
import { color, font, radius, space, type, weight } from '../../theme/tokens';

interface AyahCardProps {
  ayah: Ayah;
  showTransliteration?: boolean;
  showTranslation?: boolean;
  showTajweed?: boolean;
  isLearned?: boolean;
  isMemorized?: boolean;
  isBookmarked?: boolean;
  isLoading?: boolean;
  isPlaying?: boolean;
  isPaused?: boolean;
  playbackSpeed?: number;
  onPlay?: () => void;
  onBookmark?: () => void;
  onPress?: () => void;
  onShare?: () => void;
  onSpeedChange?: (speed: number) => void;
}

const SPEED_OPTIONS = [0.75, 1, 1.25, 1.5, 1.75];

export function AyahCard({
  ayah,
  showTransliteration = true,
  showTranslation = true,
  showTajweed = true,
  isLearned = false,
  isMemorized = false,
  isBookmarked = false,
  isLoading = false,
  isPlaying = false,
  isPaused = false,
  playbackSpeed = 1,
  onPlay,
  onBookmark,
  onPress,
  onShare,
  onSpeedChange,
}: AyahCardProps) {
  const { t } = useTranslation();
  const isAudioActive = isPlaying || isPaused || isLoading;

  const handleSpeedDecrease = () => {
    const currentIndex = SPEED_OPTIONS.indexOf(playbackSpeed);
    if (currentIndex > 0) {
      onSpeedChange?.(SPEED_OPTIONS[currentIndex - 1]);
    }
  };

  const handleSpeedIncrease = () => {
    const currentIndex = SPEED_OPTIONS.indexOf(playbackSpeed);
    if (currentIndex < SPEED_OPTIONS.length - 1) {
      onSpeedChange?.(SPEED_OPTIONS[currentIndex + 1]);
    }
  };
  // Determine button icon based on state
  const getPlayButtonIcon = () => {
    if (isLoading) return null; // Show loading indicator
    if (isPlaying) return 'pause';
    if (isPaused) return 'play';
    return 'play';
  };

  // The button used to change colour across four states (emerald, blue, amber,
  // indigo) for what is one control. The icon already says play vs pause, so
  // the fill stays constant and only dims while loading.
  const getPlayButtonStyle = () => [styles.playButton, isLoading && styles.playButtonLoading];
  return (
    <Pressable
      style={[styles.container, isLearned && styles.containerLearned]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Ayah ${ayah.ayahNumber}`}
    >
      {/* Header with Ayah Number and Actions */}
      <View style={styles.header}>
        <View style={styles.ayahNumberContainer}>
          <Text style={styles.ayahNumber}>{ayah.ayahNumber}</Text>
        </View>
        <View style={styles.actions}>
          {isMemorized && (
            <View style={styles.memorizedBadge}>
              <Ionicons name="heart" size={16} color={color.sacred} />
            </View>
          )}
          {onShare && (
            <Pressable style={styles.actionButton} onPress={onShare} accessibilityRole="button" accessibilityLabel={`Share ayah ${ayah.ayahNumber} to a group`}>
              <Ionicons name="paper-plane-outline" size={19} color={color.textFaint} />
            </Pressable>
          )}
          <Pressable style={styles.actionButton} onPress={onBookmark} accessibilityRole="button" accessibilityLabel={isBookmarked ? `Remove bookmark from ayah ${ayah.ayahNumber}` : `Bookmark ayah ${ayah.ayahNumber}`}>
            <Ionicons
              name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
              size={20}
              color={isBookmarked ? color.sacred : color.textFaint}
            />
          </Pressable>
          <Pressable
            style={getPlayButtonStyle()}
            onPress={onPlay}
            disabled={isLoading}
            accessibilityRole="button"
            accessibilityLabel={isPlaying ? `Pause ayah ${ayah.ayahNumber}` : isPaused ? `Resume ayah ${ayah.ayahNumber}` : `Play ayah ${ayah.ayahNumber}`}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={color.textOnAccent} />
            ) : (
              <Ionicons name={getPlayButtonIcon() as any} size={18} color={color.textOnAccent} />
            )}
          </Pressable>
        </View>
      </View>

      {/* Arabic Text with Tajweed */}
      <View style={styles.arabicContainer}>
        <TajweedText
          text={ayah.textUthmani}
          tajweedRules={ayah.tajweedRules}
          showTajweed={showTajweed}
          fontSize={24}
        />
      </View>

      {/* Transliteration */}
      {showTransliteration && (
        <Text style={styles.transliteration}>{ayah.transliteration}</Text>
      )}

      {/* Translation */}
      {showTranslation && (
        <Text style={styles.translation}>
          {ayah.translation || ayah.words.map(w => w.translation).join(' ')}
        </Text>
      )}

      {/* Speed Controls - show when audio is active */}
      {isAudioActive && (
        <View style={styles.speedControlContainer}>
          <Text style={styles.speedLabel}>{t('common.speed')}</Text>
          <View style={styles.speedControls}>
            <Pressable
              style={[
                styles.speedButton,
                playbackSpeed <= SPEED_OPTIONS[0] && styles.speedButtonDisabled,
              ]}
              onPress={handleSpeedDecrease}
              disabled={playbackSpeed <= SPEED_OPTIONS[0]}
              accessibilityRole="button"
              accessibilityLabel="Decrease playback speed"
            >
              <Ionicons
                name="remove"
                size={16}
                color={playbackSpeed <= SPEED_OPTIONS[0] ? color.borderStrong : color.text}
              />
            </Pressable>
            <View style={styles.speedValueContainer}>
              <Text style={styles.speedValue}>{playbackSpeed}x</Text>
            </View>
            <Pressable
              style={[
                styles.speedButton,
                playbackSpeed >= SPEED_OPTIONS[SPEED_OPTIONS.length - 1] && styles.speedButtonDisabled,
              ]}
              onPress={handleSpeedIncrease}
              disabled={playbackSpeed >= SPEED_OPTIONS[SPEED_OPTIONS.length - 1]}
              accessibilityRole="button"
              accessibilityLabel="Increase playback speed"
            >
              <Ionicons
                name="add"
                size={16}
                color={playbackSpeed >= SPEED_OPTIONS[SPEED_OPTIONS.length - 1] ? color.borderStrong : color.text}
              />
            </Pressable>
          </View>
        </View>
      )}

      {/* Status Indicator */}
      {isLearned && (
        <View style={styles.statusContainer}>
          <View style={styles.learnedIndicator}>
            <Ionicons name="checkmark-circle" size={14} color={color.progress} />
            <Text style={styles.statusText}>{t('common.learned')}</Text>
          </View>
        </View>
      )}
    </Pressable>
  );
}

// Compact version for lists
interface AyahListItemProps {
  ayah: Ayah;
  isLearned?: boolean;
  isMemorized?: boolean;
  onPress?: () => void;
}

export function AyahListItem({
  ayah,
  isLearned = false,
  isMemorized = false,
  onPress,
}: AyahListItemProps) {
  return (
    <Pressable
      style={[styles.listItem, isLearned && styles.listItemLearned]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Ayah ${ayah.ayahNumber}`}
    >
      <View style={styles.listItemNumber}>
        <Text style={styles.listItemNumberText}>{ayah.ayahNumber}</Text>
      </View>
      <View style={styles.listItemContent}>
        <Text style={styles.listItemArabic} numberOfLines={1}>
          {ayah.textUthmani}
        </Text>
        <Text style={styles.listItemTranslation} numberOfLines={1}>
          {ayah.translation}
        </Text>
      </View>
      <View style={styles.listItemIcons}>
        {isMemorized && <Ionicons name="heart" size={16} color={color.sacred} />}
        {isLearned && <Ionicons name="checkmark-circle" size={16} color={color.progress} />}
        <Ionicons name="chevron-forward" size={16} color={color.textFaint} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: color.surface,
    borderRadius: radius.lg,
    padding: space.lg,
    marginBottom: space.md,
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderColor: color.border,
  },
  containerLearned: {
    borderColor: withAlpha(color.progress, 0.35),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: space.lg,
  },
  /** Gold rosette — the Mushaf convention for marking a verse number. */
  ayahNumberContainer: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: color.sacredSoft,
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderColor: withAlpha(color.sacred, 0.45),
    alignItems: 'center',
    justifyContent: 'center',
  },
  ayahNumber: {
    color: color.sacred,
    ...type.caption,
    fontWeight: weight.bold,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
  },
  actionButton: {
    padding: space.sm,
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: color.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButtonLoading: {
    opacity: 0.6,
  },
  memorizedBadge: {
    padding: space.xs,
  },
  arabicContainer: {
    marginBottom: 16,
    width: '100%',
  },
  transliteration: {
    color: color.textMuted,
    fontSize: 14,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  translation: {
    color: color.textMuted,
    fontSize: 14,
    lineHeight: 22,
  },
  speedControlContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: color.surfaceRaised,
    gap: 12,
  },
  speedLabel: {
    color: color.textFaint,
    fontSize: 12,
  },
  speedControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: color.surfaceRaised,
    borderRadius: radius.sm,
    padding: 4,
  },
  speedButton: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: color.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  speedButtonDisabled: {
    backgroundColor: color.surfaceRaised,
  },
  speedValueContainer: {
    paddingHorizontal: 12,
    minWidth: 50,
    alignItems: 'center',
  },
  speedValue: {
    color: color.text,
    fontSize: 14,
    fontWeight: '600',
  },
  statusContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: color.surfaceRaised,
    flexDirection: 'row',
  },
  learnedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    color: color.progress,
    fontSize: 12,
    fontWeight: '500',
  },
  // List Item Styles
  listItem: {
    backgroundColor: color.surface,
    borderRadius: radius.md,
    padding: 14,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  listItemLearned: {
    borderColor: withAlpha(color.progress, 0.19),
    borderWidth: 1,
  },
  listItemNumber: {
    width: 32,
    height: 32,
    borderRadius: radius.lg,
    backgroundColor: withAlpha(color.progress, 0.13),
    alignItems: 'center',
    justifyContent: 'center',
  },
  listItemNumberText: {
    color: color.progress,
    fontSize: 12,
    fontWeight: 'bold',
  },
  listItemContent: {
    flex: 1,
    marginLeft: 12,
  },
  listItemArabic: {
    // Single-line preview, so the compact Amiri cut is enough; the full
    // AmiriQuran face is reserved for the reading view.
    fontFamily: font.arabic,
    color: color.text,
    fontSize: 19,
    lineHeight: 30,
    textAlign: 'right',
    writingDirection: 'rtl',
    flex: 1,
  },
  listItemTranslation: {
    color: color.textFaint,
    fontSize: 12,
    marginTop: 4,
  },
  listItemIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginLeft: 8,
  },
});

export default AyahCard;

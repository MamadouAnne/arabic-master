import React from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Ayah } from '../../types/quran';
import { TajweedText } from './TajweedText';
import { useQuranStore } from '../../stores/quranStore';

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

  const getPlayButtonStyle = () => {
    if (isPlaying) return [styles.playButton, styles.playButtonPlaying];
    if (isPaused) return [styles.playButton, styles.playButtonPaused];
    if (isLoading) return [styles.playButton, styles.playButtonLoading];
    return styles.playButton;
  };
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
              <Ionicons name="heart" size={16} color="#8b5cf6" />
            </View>
          )}
          {onShare && (
            <Pressable style={styles.actionButton} onPress={onShare} accessibilityRole="button" accessibilityLabel={`Share ayah ${ayah.ayahNumber} to a group`}>
              <Ionicons name="paper-plane-outline" size={19} color="#64748b" />
            </Pressable>
          )}
          <Pressable style={styles.actionButton} onPress={onBookmark} accessibilityRole="button" accessibilityLabel={isBookmarked ? `Remove bookmark from ayah ${ayah.ayahNumber}` : `Bookmark ayah ${ayah.ayahNumber}`}>
            <Ionicons
              name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
              size={20}
              color={isBookmarked ? '#f59e0b' : '#64748b'}
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
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Ionicons name={getPlayButtonIcon() as any} size={18} color="#ffffff" />
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
          <Text style={styles.speedLabel}>Speed</Text>
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
                color={playbackSpeed <= SPEED_OPTIONS[0] ? '#475569' : '#ffffff'}
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
                color={playbackSpeed >= SPEED_OPTIONS[SPEED_OPTIONS.length - 1] ? '#475569' : '#ffffff'}
              />
            </Pressable>
          </View>
        </View>
      )}

      {/* Status Indicator */}
      {isLearned && (
        <View style={styles.statusContainer}>
          <View style={styles.learnedIndicator}>
            <Ionicons name="checkmark-circle" size={14} color="#10b981" />
            <Text style={styles.statusText}>Learned</Text>
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
        {isMemorized && <Ionicons name="heart" size={16} color="#8b5cf6" />}
        {isLearned && <Ionicons name="checkmark-circle" size={16} color="#10b981" />}
        <Ionicons name="chevron-forward" size={16} color="#64748b" />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  containerLearned: {
    borderColor: '#10b98130',
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  ayahNumberContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#10b98120',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ayahNumber: {
    color: '#10b981',
    fontSize: 14,
    fontWeight: 'bold',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButtonPlaying: {
    backgroundColor: '#3b82f6',
  },
  playButtonPaused: {
    backgroundColor: '#f59e0b',
  },
  playButtonLoading: {
    backgroundColor: '#6366f1',
  },
  playButtonActive: {
    backgroundColor: '#ef4444',
  },
  memorizedBadge: {
    padding: 4,
  },
  arabicContainer: {
    marginBottom: 16,
    width: '100%',
  },
  transliteration: {
    color: '#94a3b8',
    fontSize: 14,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  translation: {
    color: '#cbd5e1',
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
    borderTopColor: '#334155',
    gap: 12,
  },
  speedLabel: {
    color: '#64748b',
    fontSize: 12,
  },
  speedControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#334155',
    borderRadius: 8,
    padding: 4,
  },
  speedButton: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#475569',
    alignItems: 'center',
    justifyContent: 'center',
  },
  speedButtonDisabled: {
    backgroundColor: '#334155',
  },
  speedValueContainer: {
    paddingHorizontal: 12,
    minWidth: 50,
    alignItems: 'center',
  },
  speedValue: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  statusContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#334155',
    flexDirection: 'row',
  },
  learnedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    color: '#10b981',
    fontSize: 12,
    fontWeight: '500',
  },
  // List Item Styles
  listItem: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  listItemLearned: {
    borderColor: '#10b98130',
    borderWidth: 1,
  },
  listItemNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#10b98120',
    alignItems: 'center',
    justifyContent: 'center',
  },
  listItemNumberText: {
    color: '#10b981',
    fontSize: 12,
    fontWeight: 'bold',
  },
  listItemContent: {
    flex: 1,
    marginLeft: 12,
  },
  listItemArabic: {
    color: '#ffffff',
    fontSize: 18,
    textAlign: 'right',
    writingDirection: 'rtl',
    flex: 1,
  },
  listItemTranslation: {
    color: '#64748b',
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

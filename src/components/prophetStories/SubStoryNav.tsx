import React, { useRef, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SubStory } from '../../types/prophetStories';
import { color, radius } from '../../theme/tokens';
import { withAlpha } from '../ui/Primitives';

interface SubStoryNavProps {
  subStories: SubStory[];
  currentSubStoryId: string;
  completedSubStories: string[];
  onSubStorySelect: (subStoryId: string) => void;
}

export function SubStoryNav({
  subStories,
  currentSubStoryId,
  completedSubStories,
  onSubStorySelect,
}: SubStoryNavProps) {
  const scrollViewRef = useRef<ScrollView>(null);

  const currentIndex = subStories.findIndex(s => s.id === currentSubStoryId);

  // Scroll to current sub-story when it changes
  useEffect(() => {
    if (scrollViewRef.current && currentIndex >= 0) {
      // Approximate scroll position based on tab width
      const tabWidth = 120;
      const scrollPosition = Math.max(0, (currentIndex * tabWidth) - 100);
      scrollViewRef.current.scrollTo({ x: scrollPosition, animated: true });
    }
  }, [currentSubStoryId, currentIndex]);

  const handlePrevious = () => {
    if (currentIndex > 0) {
      onSubStorySelect(subStories[currentIndex - 1].id);
    }
  };

  const handleNext = () => {
    if (currentIndex < subStories.length - 1) {
      onSubStorySelect(subStories[currentIndex + 1].id);
    }
  };

  return (
    <View style={styles.container}>
      {/* Navigation Arrows and Tabs */}
      <View style={styles.navRow}>
        <Pressable
          style={[styles.arrowButton, currentIndex === 0 && styles.arrowButtonDisabled]}
          onPress={handlePrevious}
          disabled={currentIndex === 0}
        >
          <Ionicons
            name="chevron-back"
            size={20}
            color={currentIndex === 0 ? color.borderStrong : color.accent}
          />
        </Pressable>

        <ScrollView
          ref={scrollViewRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContainer}
        >
          {subStories.map((subStory, index) => {
            const isActive = subStory.id === currentSubStoryId;
            const isCompleted = completedSubStories.includes(subStory.id);

            return (
              <Pressable
                key={subStory.id}
                style={[
                  styles.tab,
                  isActive && styles.tabActive,
                  isCompleted && !isActive && styles.tabCompleted,
                ]}
                onPress={() => onSubStorySelect(subStory.id)}
              >
                <View style={styles.tabContent}>
                  <Text
                    style={[
                      styles.tabText,
                      isActive && styles.tabTextActive,
                      isCompleted && !isActive && styles.tabTextCompleted,
                    ]}
                    numberOfLines={1}
                  >
                    {subStory.title}
                  </Text>
                  {isCompleted && !isActive && (
                    <Ionicons name="checkmark-circle" size={12} color={color.progress} style={styles.checkIcon} />
                  )}
                </View>
              </Pressable>
            );
          })}
        </ScrollView>

        <Pressable
          style={[styles.arrowButton, currentIndex === subStories.length - 1 && styles.arrowButtonDisabled]}
          onPress={handleNext}
          disabled={currentIndex === subStories.length - 1}
        >
          <Ionicons
            name="chevron-forward"
            size={20}
            color={currentIndex === subStories.length - 1 ? color.borderStrong : color.accent}
          />
        </Pressable>
      </View>

      {/* Progress Indicator */}
      <View style={styles.progressRow}>
        <Text style={styles.progressText}>
          {currentIndex + 1} of {subStories.length}
        </Text>
        <View style={styles.progressDots}>
          {subStories.map((subStory, index) => (
            <View
              key={subStory.id}
              style={[
                styles.dot,
                index === currentIndex && styles.dotActive,
                completedSubStories.includes(subStory.id) && styles.dotCompleted,
              ]}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: color.surface,
    borderBottomWidth: 1,
    borderBottomColor: color.border,
    paddingVertical: 8,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  arrowButton: {
    width: 36,
    height: 36,
    borderRadius: radius.lg,
    backgroundColor: color.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  arrowButtonDisabled: {
    backgroundColor: color.surface,
  },
  tabsContainer: {
    paddingHorizontal: 4,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.xl,
    backgroundColor: color.surfaceRaised,
    minWidth: 80,
  },
  tabActive: {
    backgroundColor: color.accentStrong,
  },
  tabCompleted: {
    backgroundColor: withAlpha(color.progress, 0.13),
    borderWidth: 1,
    borderColor: withAlpha(color.progress, 0.25),
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    color: color.textMuted,
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
  tabTextActive: {
    color: color.text,
  },
  tabTextCompleted: {
    color: color.progress,
  },
  checkIcon: {
    marginLeft: 4,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    gap: 12,
  },
  progressText: {
    color: color.textFaint,
    fontSize: 11,
  },
  progressDots: {
    flexDirection: 'row',
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: color.borderStrong,
  },
  dotActive: {
    backgroundColor: color.accentStrong,
    width: 16,
  },
  dotCompleted: {
    backgroundColor: color.progress,
  },
});

export default SubStoryNav;

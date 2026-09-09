// Hook for Prophet Story data fetching and audio control
import { useState, useEffect, useCallback, useRef } from 'react';
import { getProphetStory, hasProphetStory } from '../data/arabic/prophets';
import { useProphetStoriesStore } from '../stores/prophetStoriesStore';
import { Prophet, SubStory, StoryContentBlock } from '../types/prophetStories';

interface UseProphetStoryReturn {
  // Data
  prophet: Prophet | null;
  subStories: SubStory[];
  currentSubStory: SubStory | null;
  currentContent: StoryContentBlock[];
  hasFullStory: boolean;
  isLoading: boolean;

  // Progress
  completedSubStories: string[];
  isStoryCompleted: boolean;
  storyProgress: number;

  // Navigation
  currentSubStoryId: string | null;
  setCurrentSubStoryId: (id: string) => void;
  goToNextSubStory: () => void;
  goToPreviousSubStory: () => void;

  // Actions
  markSubStoryComplete: () => void;
  markStoryComplete: () => void;
}

export function useProphetStory(prophetId: string | undefined): UseProphetStoryReturn {
  const [isLoading, setIsLoading] = useState(true);
  const [currentSubStoryId, setCurrentSubStoryId] = useState<string | null>(null);

  const {
    startStory,
    completeStory,
    markSubStoryCompleted,
    getStoryProgress,
    isStoryCompleted: checkStoryCompleted,
    isSubStoryCompleted,
    progress,
  } = useProphetStoriesStore();

  // Get prophet story data
  const storyData = prophetId ? getProphetStory(prophetId) : undefined;
  const hasFullStory = prophetId ? hasProphetStory(prophetId) : false;
  const prophet = storyData?.prophet || null;
  const subStories = storyData?.subStories || [];

  // Current sub-story
  const currentSubStory = subStories.find((s) => s.id === currentSubStoryId) || null;
  const currentContent = currentSubStory?.content || [];

  // Progress
  const storyProgress = prophetId ? getStoryProgress(prophetId) : null;
  const completedSubStories = storyProgress?.subStoriesCompleted || [];
  const isStoryCompleted = prophetId ? checkStoryCompleted(prophetId) : false;

  // Calculate overall progress percentage
  const progressPercent =
    subStories.length > 0
      ? Math.round((completedSubStories.length / subStories.length) * 100)
      : 0;

  // Initialize on mount
  useEffect(() => {
    if (prophetId && subStories.length > 0) {
      setIsLoading(true);
      startStory(prophetId);

      // Set initial sub-story (from progress or first)
      const savedProgress = getStoryProgress(prophetId);
      const initialSubStoryId = savedProgress.currentSubStoryId || subStories[0].id;
      setCurrentSubStoryId(initialSubStoryId);

      setIsLoading(false);
    } else if (prophetId && subStories.length === 0) {
      setIsLoading(false);
    }
  }, [prophetId, subStories.length]);

  // Navigation
  const goToNextSubStory = useCallback(() => {
    if (!currentSubStoryId || subStories.length === 0) return;

    const currentIndex = subStories.findIndex((s) => s.id === currentSubStoryId);
    if (currentIndex < subStories.length - 1) {
      setCurrentSubStoryId(subStories[currentIndex + 1].id);
    }
  }, [currentSubStoryId, subStories]);

  const goToPreviousSubStory = useCallback(() => {
    if (!currentSubStoryId || subStories.length === 0) return;

    const currentIndex = subStories.findIndex((s) => s.id === currentSubStoryId);
    if (currentIndex > 0) {
      setCurrentSubStoryId(subStories[currentIndex - 1].id);
    }
  }, [currentSubStoryId, subStories]);

  // Progress actions
  const markSubStoryComplete = useCallback(() => {
    if (prophetId && currentSubStoryId) {
      markSubStoryCompleted(prophetId, currentSubStoryId);
    }
  }, [prophetId, currentSubStoryId, markSubStoryCompleted]);

  const markStoryComplete = useCallback(() => {
    if (prophetId) {
      completeStory(prophetId);
    }
  }, [prophetId, completeStory]);

  return {
    // Data
    prophet,
    subStories,
    currentSubStory,
    currentContent,
    hasFullStory,
    isLoading,

    // Progress
    completedSubStories,
    isStoryCompleted,
    storyProgress: progressPercent,

    // Navigation
    currentSubStoryId,
    setCurrentSubStoryId,
    goToNextSubStory,
    goToPreviousSubStory,

    // Actions
    markSubStoryComplete,
    markStoryComplete,
  };
}

export default useProphetStory;

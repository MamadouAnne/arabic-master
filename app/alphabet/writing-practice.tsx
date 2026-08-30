import { View, Text, Pressable, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { arabicLetters, getLetterById } from '../../src/data/arabic/alphabet/letters';
import { useProgressStore } from '../../src/stores/progressStore';
import { useArabicSpeech } from '../../src/hooks/useArabicSpeech';
import { useLocalizedContent } from '../../src/hooks/useLocalizedContent';
import { color, radius } from '../../src/theme/tokens';
import { withAlpha } from '../../src/components/ui/Primitives';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CANVAS_SIZE = SCREEN_WIDTH - 80;

export default function WritingPracticeScreen() {
  const { t } = useTranslation();
  const { lc } = useLocalizedContent();
  const { letterId } = useLocalSearchParams<{ letterId?: string }>();
  const { markLetterPracticed, addXp, updateStreak } = useProgressStore();
  const { speak, isSpeaking } = useArabicSpeech();

  // If no specific letter, start with first letter
  const [currentLetterIndex, setCurrentLetterIndex] = useState(() => {
    if (letterId) {
      const index = arabicLetters.findIndex((l) => l.id === letterId);
      return index >= 0 ? index : 0;
    }
    return 0;
  });

  const [paths, setPaths] = useState<string[]>([]);
  const [currentPath, setCurrentPath] = useState<string>('');
  const [showGuide, setShowGuide] = useState(true);
  const [practiceCount, setPracticeCount] = useState(0);

  const currentLetter = arabicLetters[currentLetterIndex];

  const handlePathStart = (x: number, y: number) => {
    setCurrentPath(`M${x},${y}`);
  };

  const handlePathMove = (x: number, y: number) => {
    setCurrentPath((prev) => `${prev} L${x},${y}`);
  };

  const handlePathEnd = () => {
    if (currentPath) {
      setPaths((prev) => [...prev, currentPath]);
      setCurrentPath('');
    }
  };

  const panGesture = Gesture.Pan()
    .onStart((event) => {
      runOnJS(handlePathStart)(event.x, event.y);
    })
    .onUpdate((event) => {
      runOnJS(handlePathMove)(event.x, event.y);
    })
    .onEnd(() => {
      runOnJS(handlePathEnd)();
    });

  const clearCanvas = () => {
    setPaths([]);
    setCurrentPath('');
  };

  const handleSubmit = () => {
    // Mark as practiced and give XP
    markLetterPracticed(currentLetter.id);
    addXp(10);
    setPracticeCount((prev) => prev + 1);
    clearCanvas();

    // Move to next letter after 3 practices or if user wants
    if (practiceCount >= 2) {
      if (currentLetterIndex < arabicLetters.length - 1) {
        setCurrentLetterIndex((prev) => prev + 1);
        setPracticeCount(0);
      } else {
        // Completed all letters
        updateStreak();
        router.back();
      }
    }
  };

  const goToNextLetter = () => {
    if (currentLetterIndex < arabicLetters.length - 1) {
      setCurrentLetterIndex((prev) => prev + 1);
      setPracticeCount(0);
      clearCanvas();
    }
  };

  const goToPrevLetter = () => {
    if (currentLetterIndex > 0) {
      setCurrentLetterIndex((prev) => prev - 1);
      setPracticeCount(0);
      clearCanvas();
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="close" size={24} color={color.text} />
          </Pressable>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>{t('alphabet.writingPractice')}</Text>
            <Text style={styles.headerProgress}>
              {t('alphabet.letterOf', { current: currentLetterIndex + 1, total: arabicLetters.length })}
            </Text>
          </View>
          <Pressable
            style={[styles.guideButton, showGuide && styles.guideButtonActive]}
            onPress={() => setShowGuide(!showGuide)}
          >
            <Ionicons
              name={showGuide ? 'eye' : 'eye-off'}
              size={20}
              color={showGuide ? '#ffffff' : '#94a3b8'}
            />
          </Pressable>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${((currentLetterIndex + 1) / arabicLetters.length) * 100}%` },
              ]}
            />
          </View>
        </View>

        {/* Letter Info */}
        <View style={styles.letterInfo}>
          <Text style={styles.letterName}>{lc(currentLetter.name, currentLetter.nameFr)}</Text>
          <Text style={styles.letterNameAr}>{currentLetter.nameArabic}</Text>
          <Pressable
            style={[styles.audioButton, isSpeaking && styles.audioButtonActive]}
            onPress={() => speak(currentLetter.letter)}
          >
            <Ionicons name="volume-high" size={24} color={isSpeaking ? "#ffffff" : "#D4AF37"} />
          </Pressable>
        </View>

        {/* Writing Canvas */}
        <View style={styles.canvasContainer}>
          {/* Guide Letter */}
          {showGuide && (
            <Text style={styles.guideLetter}>{currentLetter.letter}</Text>
          )}

          {/* Drawing Canvas */}
          <GestureDetector gesture={panGesture}>
            <View style={styles.canvas}>
              <Svg width={CANVAS_SIZE} height={CANVAS_SIZE}>
                {/* Drawn paths */}
                {paths.map((path, index) => (
                  <Path
                    key={index}
                    d={path}
                    stroke="#6366f1"
                    strokeWidth={8}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                ))}
                {/* Current path being drawn */}
                {currentPath && (
                  <Path
                    d={currentPath}
                    stroke="#6366f1"
                    strokeWidth={8}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}
              </Svg>
            </View>
          </GestureDetector>

          {/* Practice Counter */}
          <View style={styles.practiceCounter}>
            {[0, 1, 2].map((i) => (
              <View
                key={i}
                style={[
                  styles.practiceCircle,
                  practiceCount > i && styles.practiceCircleActive,
                ]}
              />
            ))}
          </View>
        </View>

        {/* Letter Forms Reference */}
        <View style={styles.formsContainer}>
          <Text style={styles.formsTitle}>{t('alphabet.letterForms')}</Text>
          <View style={styles.formsRow}>
            <View style={styles.formItem}>
              <Text style={styles.formLetter}>{currentLetter.forms.isolated}</Text>
              <Text style={styles.formLabel}>{t('alphabet.isolated')}</Text>
            </View>
            <View style={styles.formItem}>
              <Text style={styles.formLetter}>{currentLetter.forms.initial}</Text>
              <Text style={styles.formLabel}>{t('alphabet.initial')}</Text>
            </View>
            <View style={styles.formItem}>
              <Text style={styles.formLetter}>{currentLetter.forms.medial}</Text>
              <Text style={styles.formLabel}>{t('alphabet.medial')}</Text>
            </View>
            <View style={styles.formItem}>
              <Text style={styles.formLetter}>{currentLetter.forms.final}</Text>
              <Text style={styles.formLabel}>{t('alphabet.final')}</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Pressable style={styles.clearButton} onPress={clearCanvas}>
            <Ionicons name="refresh" size={20} color={color.danger} />
            <Text style={styles.clearButtonText}>{t('common.clear')}</Text>
          </Pressable>

          <Pressable style={styles.submitButton} onPress={handleSubmit}>
            <Ionicons name="checkmark" size={20} color={color.text} />
            <Text style={styles.submitButtonText}>{t('alphabet.submitXp')}</Text>
          </Pressable>
        </View>

        {/* Navigation */}
        <View style={styles.navigation}>
          <Pressable
            style={[styles.navButton, currentLetterIndex === 0 && styles.navButtonDisabled]}
            onPress={goToPrevLetter}
            disabled={currentLetterIndex === 0}
          >
            <Ionicons
              name="chevron-back"
              size={20}
              color={currentLetterIndex === 0 ? '#334155' : '#ffffff'}
            />
            <Text
              style={[
                styles.navButtonText,
                currentLetterIndex === 0 && styles.navButtonTextDisabled,
              ]}
            >
              {t('common.previous')}
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.navButton,
              currentLetterIndex === arabicLetters.length - 1 && styles.navButtonDisabled,
            ]}
            onPress={goToNextLetter}
            disabled={currentLetterIndex === arabicLetters.length - 1}
          >
            <Text
              style={[
                styles.navButtonText,
                currentLetterIndex === arabicLetters.length - 1 && styles.navButtonTextDisabled,
              ]}
            >
              {t('common.next')}
            </Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={currentLetterIndex === arabicLetters.length - 1 ? '#334155' : '#ffffff'}
            />
          </Pressable>
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: radius.xl,
    backgroundColor: color.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    color: color.text,
    fontSize: 18,
    fontWeight: '600',
  },
  headerProgress: {
    color: color.textFaint,
    fontSize: 13,
    marginTop: 2,
  },
  guideButton: {
    width: 40,
    height: 40,
    borderRadius: radius.xl,
    backgroundColor: color.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guideButtonActive: {
    backgroundColor: color.accentStrong,
  },
  progressBarContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  progressBar: {
    height: 4,
    backgroundColor: color.surfaceRaised,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: color.accentStrong,
    borderRadius: 2,
  },
  letterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  letterName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: color.text,
    marginRight: 8,
  },
  letterNameAr: {
    fontSize: 18,
    color: color.sacred,
    marginRight: 12,
  },
  audioButton: {
    width: 40,
    height: 40,
    borderRadius: radius.xl,
    backgroundColor: withAlpha(color.sacred, 0.13),
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioButtonActive: {
    backgroundColor: color.sacred,
  },
  canvasContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  guideLetter: {
    position: 'absolute',
    fontSize: 200,
    color: color.textFaint,
    zIndex: 0,
    top: '50%',
    marginTop: -120,
  },
  canvas: {
    width: CANVAS_SIZE,
    height: CANVAS_SIZE,
    backgroundColor: color.surface,
    borderRadius: radius.xl,
    borderWidth: 2,
    borderColor: color.border,
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  practiceCounter: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  practiceCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: color.surfaceRaised,
  },
  practiceCircleActive: {
    backgroundColor: color.progress,
  },
  formsContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  formsTitle: {
    color: color.textMuted,
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'center',
  },
  formsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: color.surface,
    borderRadius: radius.lg,
    padding: 16,
  },
  formItem: {
    alignItems: 'center',
  },
  formLetter: {
    fontSize: 32,
    color: color.text,
    marginBottom: 4,
  },
  formLabel: {
    fontSize: 10,
    color: color.textFaint,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 16,
  },
  clearButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: color.surface,
    borderRadius: radius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: withAlpha(color.danger, 0.25),
  },
  clearButtonText: {
    color: color.danger,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  submitButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: color.progress,
    borderRadius: radius.md,
    padding: 14,
  },
  submitButtonText: {
    color: color.text,
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: color.surface,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radius.sm,
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    color: color.text,
    fontSize: 14,
    fontWeight: '600',
    marginHorizontal: 4,
  },
  navButtonTextDisabled: {
    color: color.textFaint,
  },
});

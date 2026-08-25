import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState, useCallback, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getSurahById } from '../../../../src/data/arabic/quran';
import { useQuranSurah } from '../../../../src/hooks/useQuranData';
import ArabicKeyboard from '../../../../src/components/arabic/ArabicKeyboard';
import { getHintText } from '../../../../src/utils/arabicTextUtils';

type WritingMode = 'hints_only' | 'with_reference';

interface MistakeInfo {
  position: number;
  expected: string;
  received: string;
  type: 'missing' | 'extra' | 'wrong' | 'diacritic';
  explanation: string;
}

interface WordComparison {
  word: string;
  isCorrect: boolean;
  userWord?: string;
}

interface ComparisonResult {
  isCorrect: boolean;
  mistakes: MistakeInfo[];
  accuracy: number;
  userChars: { char: string; status: 'correct' | 'wrong' | 'extra' }[];
  expectedChars: { char: string; status: 'correct' | 'missing' }[];
  wordComparison: WordComparison[];
  correctWords: number;
  totalWords: number;
}

// Arabic diacritics (tashkeel)
const ARABIC_DIACRITICS = [
  '\u064B', // Fathatan
  '\u064C', // Dammatan
  '\u064D', // Kasratan
  '\u064E', // Fatha
  '\u064F', // Damma
  '\u0650', // Kasra
  '\u0651', // Shadda
  '\u0652', // Sukun
  '\u0653', // Maddah
  '\u0654', // Hamza above
  '\u0655', // Hamza below
  '\u0670', // Superscript alef
];

// Remove diacritics for base comparison
function removeDiacritics(text: string): string {
  let result = text;
  ARABIC_DIACRITICS.forEach((d) => {
    result = result.replace(new RegExp(d, 'g'), '');
  });
  return result;
}

// Normalize Arabic text for comparison
function normalizeArabic(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .replace(/ٱ/g, 'ا') // Alef wasla to alef
    .replace(/إ|أ|آ/g, 'ا') // Various alef forms
    .replace(/ة/g, 'ه') // Ta marbuta to ha
    .replace(/ى/g, 'ي') // Alef maksura to ya
    .trim();
}

// Compare user input with expected text
function compareTexts(userText: string, expectedText: string): ComparisonResult {
  const normalizedUser = normalizeArabic(removeDiacritics(userText));
  const normalizedExpected = normalizeArabic(removeDiacritics(expectedText));

  const mistakes: MistakeInfo[] = [];
  const userChars: { char: string; status: 'correct' | 'wrong' | 'extra' }[] = [];
  const expectedChars: { char: string; status: 'correct' | 'missing' }[] = [];

  // Use dynamic programming for optimal alignment (simplified LCS-based)
  const userArr = normalizedUser.split('');
  const expectedArr = normalizedExpected.split('');

  let i = 0;
  let j = 0;
  let correctCount = 0;

  while (i < userArr.length || j < expectedArr.length) {
    if (i >= userArr.length) {
      // Missing characters at the end
      expectedChars.push({ char: expectedArr[j], status: 'missing' });
      mistakes.push({
        position: j,
        expected: expectedArr[j],
        received: '',
        type: 'missing',
        explanation: `Missing letter "${expectedArr[j]}" at position ${j + 1}`,
      });
      j++;
    } else if (j >= expectedArr.length) {
      // Extra characters at the end
      userChars.push({ char: userArr[i], status: 'extra' });
      mistakes.push({
        position: i,
        expected: '',
        received: userArr[i],
        type: 'extra',
        explanation: `Extra letter "${userArr[i]}" at position ${i + 1}`,
      });
      i++;
    } else if (userArr[i] === expectedArr[j]) {
      // Correct character
      userChars.push({ char: userArr[i], status: 'correct' });
      expectedChars.push({ char: expectedArr[j], status: 'correct' });
      correctCount++;
      i++;
      j++;
    } else {
      // Check if it's a simple swap or missing/extra
      const lookAhead = expectedArr.slice(j, j + 3).indexOf(userArr[i]);
      const lookAheadUser = userArr.slice(i, i + 3).indexOf(expectedArr[j]);

      if (lookAhead === 1) {
        // Missing one character
        expectedChars.push({ char: expectedArr[j], status: 'missing' });
        mistakes.push({
          position: j,
          expected: expectedArr[j],
          received: '',
          type: 'missing',
          explanation: `Missing letter "${expectedArr[j]}"`,
        });
        j++;
      } else if (lookAheadUser === 1) {
        // Extra one character
        userChars.push({ char: userArr[i], status: 'extra' });
        mistakes.push({
          position: i,
          expected: '',
          received: userArr[i],
          type: 'extra',
          explanation: `Extra letter "${userArr[i]}"`,
        });
        i++;
      } else {
        // Wrong character
        userChars.push({ char: userArr[i], status: 'wrong' });
        expectedChars.push({ char: expectedArr[j], status: 'correct' });
        mistakes.push({
          position: i,
          expected: expectedArr[j],
          received: userArr[i],
          type: 'wrong',
          explanation: `Wrong letter: wrote "${userArr[i]}" instead of "${expectedArr[j]}"`,
        });
        i++;
        j++;
      }
    }
  }

  const totalChars = Math.max(normalizedExpected.length, 1);
  const accuracy = Math.round((correctCount / totalChars) * 100);

  // Word-by-word comparison
  const expectedWords = expectedText.trim().split(/\s+/);
  const userWords = userText.trim().split(/\s+/);
  const wordComparison: WordComparison[] = [];
  let correctWords = 0;

  expectedWords.forEach((expectedWord, index) => {
    const userWord = userWords[index] || '';
    const normalizedExpectedWord = normalizeArabic(removeDiacritics(expectedWord));
    const normalizedUserWord = normalizeArabic(removeDiacritics(userWord));
    const isWordCorrect = normalizedExpectedWord === normalizedUserWord;

    if (isWordCorrect) correctWords++;

    wordComparison.push({
      word: expectedWord,
      isCorrect: isWordCorrect,
      userWord: userWord || undefined,
    });
  });

  return {
    isCorrect: mistakes.length === 0,
    mistakes,
    accuracy,
    userChars,
    expectedChars,
    wordComparison,
    correctWords,
    totalWords: expectedWords.length,
  };
}

export default function WritingExerciseScreen() {
  const { surahId } = useLocalSearchParams<{ surahId: string }>();
  const { t } = useTranslation();

  const surah = getSurahById(surahId);
  const { ayahs, isLoading } = useQuranSurah(surahId);

  const [selectedAyahIndex, setSelectedAyahIndex] = useState(0);
  const [writingMode, setWritingMode] = useState<WritingMode>('hints_only');
  const [userInput, setUserInput] = useState('');
  const [showAyahPicker, setShowAyahPicker] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);
  const [showSolution, setShowSolution] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(true);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [inputAreaY, setInputAreaY] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const innerTapRef = useRef(false);

  // Blinking cursor effect
  useEffect(() => {
    if (hasSubmitted) return;
    const interval = setInterval(() => {
      setCursorVisible((prev) => !prev);
    }, 530);
    return () => clearInterval(interval);
  }, [hasSubmitted]);

  // Scroll to input area when keyboard becomes visible
  useEffect(() => {
    if (isKeyboardVisible && scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: inputAreaY - 100, animated: true });
    }
  }, [isKeyboardVisible, inputAreaY]);

  const selectedAyah = ayahs[selectedAyahIndex];

  // Keyboard handlers - insert at cursor position
  const handleKeyPress = useCallback((key: string) => {
    if (hasSubmitted) return;
    setUserInput((prev) => {
      const before = prev.slice(0, cursorPosition);
      const after = prev.slice(cursorPosition);
      return before + key + after;
    });
    setCursorPosition((prev) => prev + key.length);
  }, [hasSubmitted, cursorPosition]);

  const handleBackspace = useCallback(() => {
    if (hasSubmitted || cursorPosition === 0) return;
    setUserInput((prev) => {
      const before = prev.slice(0, cursorPosition - 1);
      const after = prev.slice(cursorPosition);
      return before + after;
    });
    setCursorPosition((prev) => prev - 1);
  }, [hasSubmitted, cursorPosition]);

  const handleSpace = useCallback(() => {
    if (hasSubmitted) return;
    setUserInput((prev) => {
      const before = prev.slice(0, cursorPosition);
      const after = prev.slice(cursorPosition);
      return before + ' ' + after;
    });
    setCursorPosition((prev) => prev + 1);
  }, [hasSubmitted, cursorPosition]);

  // Handle tap on text to move cursor
  const handleTextTap = useCallback((position: number) => {
    if (hasSubmitted) return;
    setCursorPosition(position);
  }, [hasSubmitted]);

  // Cursor navigation - move left in text (towards end for RTL)
  const handleCursorLeft = useCallback(() => {
    if (hasSubmitted) return;
    setCursorPosition((prev) => Math.min(prev + 1, userInput.length));
  }, [hasSubmitted, userInput.length]);

  // Cursor navigation - move right in text (towards start for RTL)
  const handleCursorRight = useCallback(() => {
    if (hasSubmitted) return;
    setCursorPosition((prev) => Math.max(prev - 1, 0));
  }, [hasSubmitted]);

  const handleSubmit = useCallback(() => {
    if (!selectedAyah || !userInput.trim()) return;

    const result = compareTexts(userInput, selectedAyah.textUthmani);
    setComparisonResult(result);
    setHasSubmitted(true);
    // Scroll to show results
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [userInput, selectedAyah]);

  const handleReset = useCallback(() => {
    setUserInput('');
    setHasSubmitted(false);
    setComparisonResult(null);
    setShowSolution(false);
    setCursorPosition(0);
  }, []);

  const handleNextAyah = useCallback(() => {
    if (selectedAyahIndex < ayahs.length - 1) {
      setSelectedAyahIndex((prev) => prev + 1);
      handleReset();
    }
  }, [selectedAyahIndex, ayahs.length, handleReset]);

  const handlePreviousAyah = useCallback(() => {
    if (selectedAyahIndex > 0) {
      setSelectedAyahIndex((prev) => prev - 1);
      handleReset();
    }
  }, [selectedAyahIndex, handleReset]);

  const handleSelectAyah = useCallback((index: number) => {
    setSelectedAyahIndex(index);
    setShowAyahPicker(false);
    handleReset();
  }, [handleReset]);

  if (!surah) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>{t('surahWrite.surahNotFound')}</Text>
      </SafeAreaView>
    );
  }

  if (isLoading || ayahs.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>{t('surahWrite.loadingAyahs')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mainContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.closeButton} onPress={() => router.back()}>
            <Ionicons name="close" size={24} color="#ffffff" />
          </Pressable>
          <View style={styles.headerCenter}>
            <Text style={styles.surahName}>{surah.nameArabic}</Text>
            <Text style={styles.subtitle}>{t('surahWrite.writingPractice')}</Text>
          </View>
          <View style={styles.headerRight}>
            <Ionicons name="pencil" size={20} color="#10b981" />
          </View>
        </View>

        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <TouchableWithoutFeedback onPress={() => setIsKeyboardVisible(false)}>
            <View>
          {/* Ayah Selector */}
          <Pressable style={styles.ayahSelector} onPress={() => setShowAyahPicker(true)}>
            <View style={styles.ayahSelectorLeft}>
              <View style={styles.ayahNumber}>
                <Text style={styles.ayahNumberText}>{selectedAyahIndex + 1}</Text>
              </View>
              <View>
                <Text style={styles.ayahLabel}>{t('surahWrite.ayah')}</Text>
                <Text style={styles.ayahRange}>
                  {selectedAyahIndex + 1} of {ayahs.length}
                </Text>
              </View>
            </View>
            <View style={styles.ayahNavButtons}>
              <Pressable
                style={[styles.navBtn, selectedAyahIndex === 0 && styles.navBtnDisabled]}
                onPress={handlePreviousAyah}
                disabled={selectedAyahIndex === 0}
              >
                <Ionicons
                  name="chevron-back"
                  size={20}
                  color={selectedAyahIndex === 0 ? '#334155' : '#ffffff'}
                />
              </Pressable>
              <Pressable
                style={[styles.navBtn, selectedAyahIndex === ayahs.length - 1 && styles.navBtnDisabled]}
                onPress={handleNextAyah}
                disabled={selectedAyahIndex === ayahs.length - 1}
              >
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={selectedAyahIndex === ayahs.length - 1 ? '#334155' : '#ffffff'}
                />
              </Pressable>
              <Pressable style={styles.selectBtn} onPress={() => setShowAyahPicker(true)}>
                <Text style={styles.selectBtnText}>{t('surahWrite.select')}</Text>
              </Pressable>
            </View>
          </Pressable>

          {/* Mode Toggle */}
          <View style={styles.modeContainer}>
            <Pressable
              style={[styles.modeButton, writingMode === 'hints_only' && styles.modeButtonActive]}
              onPress={() => setWritingMode('hints_only')}
            >
              <Ionicons
                name="eye-off"
                size={18}
                color={writingMode === 'hints_only' ? '#ffffff' : '#64748b'}
              />
              <Text style={[styles.modeText, writingMode === 'hints_only' && styles.modeTextActive]}>
                {t('surahWrite.fromMemory')}
              </Text>
            </Pressable>
            <Pressable
              style={[styles.modeButton, writingMode === 'with_reference' && styles.modeButtonActive]}
              onPress={() => setWritingMode('with_reference')}
            >
              <Ionicons
                name="eye"
                size={18}
                color={writingMode === 'with_reference' ? '#ffffff' : '#64748b'}
              />
              <Text style={[styles.modeText, writingMode === 'with_reference' && styles.modeTextActive]}>
                {t('surahWrite.showAyah')}
              </Text>
            </Pressable>
          </View>

          {/* First-letter hints (from memory mode) */}
          {writingMode === 'hints_only' && selectedAyah && (
            <View style={styles.hintCard}>
              <View style={styles.referenceHeader}>
                <Ionicons name="bulb-outline" size={16} color="#f59e0b" />
                <Text style={styles.hintLabel}>{t('surahWrite.firstLetterHints')}</Text>
              </View>
              <View style={styles.hintWordsRow}>
                {selectedAyah.words.map((word, i) => (
                  <Text key={word.id || i} style={styles.hintWordText}>
                    {getHintText(word.text)}
                  </Text>
                ))}
              </View>
            </View>
          )}

          {/* Full ayah reference (show ayah mode) */}
          {writingMode === 'with_reference' && selectedAyah && (
            <View style={styles.referenceCard}>
              <View style={styles.referenceHeader}>
                <Ionicons name="book" size={16} color="#10b981" />
                <Text style={styles.referenceLabel}>{t('surahWrite.reference')}</Text>
              </View>
              <Text style={styles.referenceText}>{selectedAyah.textUthmani}</Text>
            </View>
          )}

          {/* Writing Display */}
          <View
            style={styles.inputCard}
            onLayout={(e) => setInputAreaY(e.nativeEvent.layout.y)}
          >
            <View style={styles.inputHeader}>
              <Text style={styles.inputLabel}>{t('surahWrite.writeTheAyah')}</Text>
              {userInput.length > 0 && !hasSubmitted && (
                <Pressable onPress={() => { setUserInput(''); setCursorPosition(0); }}>
                  <Text style={styles.clearText}>{t('surahWrite.clear')}</Text>
                </Pressable>
              )}
            </View>
            <Pressable
              style={[styles.textDisplay, isKeyboardVisible && styles.textDisplayFocused]}
              onPress={() => {
                // Skip if an inner character was tapped (prevents event bubbling conflict)
                if (innerTapRef.current) {
                  innerTapRef.current = false;
                  return;
                }
                setIsKeyboardVisible(true);
                handleTextTap(userInput.length);
              }}
            >
              <Text style={styles.textDisplayText}>
                {!hasSubmitted && isKeyboardVisible && cursorPosition === 0 && (
                  <Text style={[styles.cursorText, { opacity: cursorVisible ? 1 : 0 }]}>|</Text>
                )}
                {userInput.split('').map((char, index) => (
                  <Text key={`char-${index}`} onPress={() => {
                    innerTapRef.current = true;
                    setIsKeyboardVisible(true);
                    handleTextTap(index + 1);
                  }}>
                    {char}
                    {!hasSubmitted && isKeyboardVisible && cursorPosition === index + 1 && (
                      <Text style={[styles.cursorText, { opacity: cursorVisible ? 1 : 0 }]}>|</Text>
                    )}
                  </Text>
                ))}
              </Text>
            </Pressable>
          </View>

          {/* Result Section */}
          {hasSubmitted && comparisonResult && (
            <View style={styles.resultCard}>
              {/* Word Accuracy Score */}
              <View
                style={[
                  styles.accuracyBadge,
                  comparisonResult.correctWords === comparisonResult.totalWords
                    ? styles.accuracyPerfect
                    : comparisonResult.correctWords >= comparisonResult.totalWords * 0.8
                    ? styles.accuracyGood
                    : comparisonResult.correctWords >= comparisonResult.totalWords * 0.5
                    ? styles.accuracyMedium
                    : styles.accuracyLow,
                ]}
              >
                <Ionicons
                  name={comparisonResult.correctWords === comparisonResult.totalWords ? 'checkmark-circle' : 'analytics'}
                  size={24}
                  color="#ffffff"
                />
                <Text style={styles.accuracyText}>
                  {comparisonResult.correctWords === comparisonResult.totalWords
                    ? t('surahWrite.perfect')
                    : t('surahWrite.wordsCorrect', { correct: comparisonResult.correctWords, total: comparisonResult.totalWords })}
                </Text>
              </View>

              {/* Word Comparison Display */}
              {comparisonResult.correctWords < comparisonResult.totalWords && (
                <View style={styles.wordComparisonSection}>
                  <Text style={styles.wordComparisonTitle}>{t('surahWrite.yourAnswer')}</Text>
                  <Text style={styles.wordComparisonText}>
                    {comparisonResult.wordComparison.map((wordInfo, index) => (
                      <Text key={index}>
                        <Text
                          style={[
                            wordInfo.isCorrect ? styles.wordCorrectInline : styles.wordIncorrectInline,
                          ]}
                        >
                          {wordInfo.userWord || '___'}
                        </Text>
                        {index < comparisonResult.wordComparison.length - 1 && ' '}
                      </Text>
                    ))}
                  </Text>
                </View>
              )}

              {/* Show Solution Button */}
              {!comparisonResult.isCorrect && (
                <Pressable
                  style={styles.solutionButton}
                  onPress={() => setShowSolution(!showSolution)}
                >
                  <Ionicons
                    name={showSolution ? 'eye-off' : 'eye'}
                    size={18}
                    color="#10b981"
                  />
                  <Text style={styles.solutionButtonText}>
                    {showSolution ? t('surahWrite.hideSolution') : t('surahWrite.showSolution')}
                  </Text>
                </Pressable>
              )}

              {/* Solution */}
              {showSolution && selectedAyah && comparisonResult && (
                <View style={styles.solutionCard}>
                  <Text style={styles.solutionLabel}>{t('surahWrite.wordByWord')}</Text>

                  {/* Show incorrect words with explanation */}
                  {comparisonResult.wordComparison
                    .filter((w) => !w.isCorrect)
                    .map((wordInfo, index) => (
                      <View key={index} style={styles.wordCorrectionItem}>
                        <View style={styles.wordCorrectionRow}>
                          <View style={styles.wordCorrectionBox}>
                            <Text style={styles.wordCorrectionLabel}>{t('surahWrite.youWrote')}</Text>
                            <Text style={styles.wordWrong}>
                              {wordInfo.userWord || '(missing)'}
                            </Text>
                          </View>
                          <Ionicons name="arrow-forward" size={20} color="#64748b" />
                          <View style={styles.wordCorrectionBox}>
                            <Text style={styles.wordCorrectionLabel}>{t('surahWrite.correctLabel')}</Text>
                            <Text style={styles.wordRight}>{wordInfo.word}</Text>
                          </View>
                        </View>
                      </View>
                    ))}

                  {/* Full correct ayah */}
                  <View style={styles.fullAyahSection}>
                    <Text style={styles.fullAyahLabel}>{t('surahWrite.completeAyah')}</Text>
                    <Text style={styles.fullAyahText}>{selectedAyah.textUthmani}</Text>
                  </View>
                </View>
              )}
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            {!hasSubmitted ? (
              <Pressable
                style={[styles.submitButton, !userInput.trim() && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={!userInput.trim()}
              >
                <Ionicons name="checkmark" size={20} color="#ffffff" />
                <Text style={styles.submitButtonText}>{t('surahWrite.checkWriting')}</Text>
              </Pressable>
            ) : (
              <View style={styles.postSubmitButtons}>
                <Pressable style={styles.tryAgainButton} onPress={handleReset}>
                  <Ionicons name="refresh" size={18} color="#10b981" />
                  <Text style={styles.tryAgainText}>{t('common.tryAgain')}</Text>
                </Pressable>
                {selectedAyahIndex < ayahs.length - 1 && (
                  <Pressable style={styles.nextAyahButton} onPress={handleNextAyah}>
                    <Text style={styles.nextAyahText}>{t('surahWrite.nextAyah')}</Text>
                    <Ionicons name="arrow-forward" size={18} color="#ffffff" />
                  </Pressable>
                )}
              </View>
            )}
          </View>

          <View style={{ height: 100 }} />
            </View>
          </TouchableWithoutFeedback>
        </ScrollView>

        {/* Ayah Picker Modal */}
        <Modal
          visible={showAyahPicker}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowAyahPicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{t('surahWrite.selectAyah')}</Text>
                <Pressable onPress={() => setShowAyahPicker(false)}>
                  <Ionicons name="close" size={24} color="#ffffff" />
                </Pressable>
              </View>
              <ScrollView style={styles.ayahList}>
                {ayahs.map((ayah, index) => (
                  <Pressable
                    key={ayah.id}
                    style={[
                      styles.ayahOption,
                      selectedAyahIndex === index && styles.ayahOptionActive,
                    ]}
                    onPress={() => handleSelectAyah(index)}
                  >
                    <View style={styles.ayahOptionNumber}>
                      <Text style={styles.ayahOptionNumberText}>{index + 1}</Text>
                    </View>
                    <Text style={styles.ayahOptionText} numberOfLines={2}>
                      {ayah.textUthmani}
                    </Text>
                    {selectedAyahIndex === index && (
                      <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                    )}
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Arabic Keyboard - only show when focused and not submitted */}
        {!hasSubmitted && isKeyboardVisible && (
          <ArabicKeyboard
            onKeyPress={handleKeyPress}
            onBackspace={handleBackspace}
            onSpace={handleSpace}
            onSubmit={handleSubmit}
            onCursorLeft={handleCursorLeft}
            onCursorRight={handleCursorRight}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  mainContainer: {
    flex: 1,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 100,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#94a3b8',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  closeButton: {
    padding: 8,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  surahName: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#10b981',
    fontSize: 12,
    marginTop: 2,
  },
  headerRight: {
    padding: 8,
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  // Ayah Selector
  ayahSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  ayahSelectorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  ayahNumber: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#10b98120',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ayahNumberText: {
    color: '#10b981',
    fontSize: 18,
    fontWeight: 'bold',
  },
  ayahLabel: {
    color: '#64748b',
    fontSize: 12,
  },
  ayahRange: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  ayahNavButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBtnDisabled: {
    opacity: 0.4,
  },
  selectBtn: {
    backgroundColor: '#10b981',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  selectBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  // Mode Toggle
  modeContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#1e293b',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  modeButtonActive: {
    borderColor: '#10b981',
    backgroundColor: '#10b98120',
  },
  modeText: {
    color: '#64748b',
    fontSize: 13,
    fontWeight: '600',
  },
  modeTextActive: {
    color: '#10b981',
  },
  // Reference Card
  referenceCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  referenceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  referenceLabel: {
    color: '#10b981',
    fontSize: 13,
    fontWeight: '600',
  },
  referenceText: {
    color: '#ffffff',
    fontSize: 22,
    lineHeight: 40,
    textAlign: 'right',
  },
  // Hint Card (from_memory mode)
  hintCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  hintLabel: {
    color: '#f59e0b',
    fontSize: 13,
    fontWeight: '600',
  },
  hintWordsRow: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  hintWordText: {
    color: '#D4AF37',
    fontSize: 22,
    lineHeight: 40,
    opacity: 0.85,
  },
  // Input Card
  inputCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  inputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  inputLabel: {
    color: '#94a3b8',
    fontSize: 14,
  },
  clearText: {
    color: '#ef4444',
    fontSize: 13,
  },
  textDisplay: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 16,
    minHeight: 120,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  textDisplayFocused: {
    borderColor: '#10b981',
  },
  textDisplayText: {
    color: '#ffffff',
    fontSize: 22,
    lineHeight: 40,
    textAlign: 'right',
    flex: 1,
  },
  textDisplayPlaceholder: {
    color: '#4b5563',
    fontSize: 22,
    lineHeight: 40,
    textAlign: 'right',
    flex: 1,
  },
  cursorText: {
    color: '#10b981',
    fontWeight: '300',
  },
  // Result Card
  resultCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  accuracyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  accuracyPerfect: {
    backgroundColor: '#10b981',
  },
  accuracyGood: {
    backgroundColor: '#22c55e',
  },
  accuracyMedium: {
    backgroundColor: '#10b981',
  },
  accuracyLow: {
    backgroundColor: '#ef4444',
  },
  accuracyText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  // Mistakes Section
  mistakesSection: {
    marginBottom: 16,
  },
  mistakesTitle: {
    color: '#94a3b8',
    fontSize: 14,
    marginBottom: 12,
  },
  mistakeItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 10,
    backgroundColor: '#0f172a',
    padding: 12,
    borderRadius: 10,
  },
  mistakeIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mistakeMissing: {
    backgroundColor: '#10b981',
  },
  mistakeExtra: {
    backgroundColor: '#8b5cf6',
  },
  mistakeWrong: {
    backgroundColor: '#ef4444',
  },
  mistakeContent: {
    flex: 1,
  },
  mistakeType: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  mistakeExplanation: {
    color: '#94a3b8',
    fontSize: 13,
  },
  moreMistakes: {
    color: '#64748b',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
  },
  // Solution
  solutionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  solutionButtonText: {
    color: '#10b981',
    fontSize: 14,
    fontWeight: '600',
  },
  solutionCard: {
    backgroundColor: '#10b98115',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#10b98130',
  },
  solutionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  solutionLabel: {
    color: '#10b981',
    fontSize: 13,
  },
  wordScore: {
    color: '#94a3b8',
    fontSize: 12,
  },
  solutionText: {
    fontSize: 22,
    lineHeight: 40,
    textAlign: 'right',
  },
  solutionWord: {
    paddingHorizontal: 2,
  },
  wordCorrect: {
    color: '#10b981',
  },
  wordIncorrect: {
    color: '#ef4444',
    textDecorationLine: 'underline',
  },
  wordComparisonSection: {
    marginBottom: 16,
  },
  wordComparisonTitle: {
    color: '#94a3b8',
    fontSize: 14,
    marginBottom: 8,
  },
  wordComparisonText: {
    backgroundColor: '#0f172a',
    padding: 12,
    borderRadius: 10,
    fontSize: 20,
    lineHeight: 36,
    textAlign: 'right',
  },
  wordCorrectInline: {
    color: '#10b981',
  },
  wordIncorrectInline: {
    color: '#ef4444',
    backgroundColor: '#ef444420',
  },
  wordCorrectionItem: {
    marginBottom: 12,
  },
  wordCorrectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  wordCorrectionBox: {
    flex: 1,
    backgroundColor: '#0f172a',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  wordCorrectionLabel: {
    color: '#64748b',
    fontSize: 11,
    marginBottom: 4,
  },
  wordWrong: {
    color: '#ef4444',
    fontSize: 20,
    fontWeight: '600',
  },
  wordRight: {
    color: '#10b981',
    fontSize: 20,
    fontWeight: '600',
  },
  fullAyahSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#10b98130',
  },
  fullAyahLabel: {
    color: '#10b981',
    fontSize: 12,
    marginBottom: 8,
  },
  fullAyahText: {
    color: '#ffffff',
    fontSize: 20,
    lineHeight: 36,
    textAlign: 'right',
  },
  // Action Buttons
  actionButtons: {
    marginBottom: 20,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#10b981',
    paddingVertical: 18,
    borderRadius: 16,
  },
  submitButtonDisabled: {
    backgroundColor: '#10b98150',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  postSubmitButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  tryAgainButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#10b98120',
    paddingVertical: 16,
    borderRadius: 14,
  },
  tryAgainText: {
    color: '#10b981',
    fontSize: 15,
    fontWeight: '600',
  },
  nextAyahButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#10b981',
    paddingVertical: 16,
    borderRadius: 14,
  },
  nextAyahText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1e293b',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  modalTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  ayahList: {
    padding: 16,
  },
  ayahOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: '#0f172a',
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
  },
  ayahOptionActive: {
    borderWidth: 1,
    borderColor: '#10b981',
  },
  ayahOptionNumber: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ayahOptionNumberText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  ayahOptionText: {
    flex: 1,
    color: '#94a3b8',
    fontSize: 16,
    textAlign: 'right',
  },
});

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Animated, useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { useLocalizedContent } from '../../../src/hooks/useLocalizedContent';
import { SURAHS } from '../../../src/data/arabic/quran/surahs';
import {
  getTotalSets,
  getSetName,
  getQuestionsBySet,
} from '../../../src/data/arabic/quran/quizzes';
import { font, color, radius } from '../../../src/theme/tokens';

const CARD_HEIGHT = 280;

type TabType = 'learn' | 'quiz';

// Flashcard Component
function SurahFlashcard({
  surah,
  isFlipped,
  onFlip,
  onNext,
  onPrev,
  currentIndex,
  totalCount,
}: {
  surah: typeof SURAHS[0];
  isFlipped: boolean;
  onFlip: () => void;
  onNext: () => void;
  onPrev: () => void;
  currentIndex: number;
  totalCount: number;
}) {
  const { t } = useTranslation();
  const { lc } = useLocalizedContent();
  const flipAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.spring(flipAnim, {
      toValue: isFlipped ? 1 : 0,
      useNativeDriver: true,
      friction: 8,
      tension: 10,
    }).start();
  }, [isFlipped]);

  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });

  const frontAnimatedStyle = {
    transform: [{ rotateY: frontInterpolate }],
  };

  const backAnimatedStyle = {
    transform: [{ rotateY: backInterpolate }],
  };

  return (
    <View style={styles.flashcardContainer}>
      {/* Progress indicator */}
      <View style={styles.progressRow}>
        <Text style={styles.progressText}>
          {currentIndex + 1} / {totalCount}
        </Text>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${((currentIndex + 1) / totalCount) * 100}%` },
            ]}
          />
        </View>
      </View>

      {/* Flashcard */}
      <Pressable onPress={onFlip} style={styles.cardPressable}>
        <View style={styles.cardWrapper}>
          {/* Front of card - Surah Number */}
          <Animated.View style={[styles.card, styles.cardFront, frontAnimatedStyle]}>
            <LinearGradient
              colors={[color.progress, color.accent]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cardGradient}
            >
              <Text style={styles.cardLabel}>سُورَة رَقْم</Text>
              <Text style={styles.cardLabelEn}>{t('surahLearn.surahNumber')}</Text>
              <Text style={styles.cardNumber}>{surah.surahNumber}</Text>
              <View style={styles.tapHint}>
                <Ionicons name="sync" size={16} color="rgba(255,255,255,0.6)" />
                <Text style={styles.tapHintText}>{t('surahLearn.tapToFlip')}</Text>
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Back of card - Surah Info */}
          <Animated.View style={[styles.card, styles.cardBack, backAnimatedStyle]}>
            <LinearGradient
              colors={[color.accent, color.accentStrong]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cardGradient}
            >
              {/* Surah Name */}
              <Text style={styles.cardNameArabic}>{surah.nameArabic}</Text>
              <Text style={styles.cardNameEnglish}>{surah.nameEnglish}</Text>

              {/* Meaning */}
              <View style={styles.meaningContainer}>
                <Text style={styles.meaningText}>{lc(surah.meaning, surah.meaningFr)}</Text>
              </View>

              {/* Details Row */}
              <View style={styles.detailsRow}>
                <View style={styles.detailBox}>
                  <Text style={styles.detailBoxLabel}>{surah.ayahCount} آيات</Text>
                </View>
                <View style={styles.detailBox}>
                  <Text style={styles.detailBoxLabel}>
                    {surah.revelationType === 'Meccan'
                      ? `مَكِّيَّة - ${t('surahLearn.meccan')}`
                      : `مَدَنِيَّة - ${t('surahLearn.medinan')}`}
                  </Text>
                </View>
              </View>

              <View style={styles.tapHint}>
                <Ionicons name="sync" size={16} color="rgba(255,255,255,0.6)" />
                <Text style={styles.tapHintText}>{t('surahLearn.tapToFlip')}</Text>
              </View>
            </LinearGradient>
          </Animated.View>
        </View>
      </Pressable>

      {/* Navigation buttons */}
      <View style={styles.navRow}>
        <Pressable
          style={[styles.navButton, currentIndex === 0 && styles.navButtonDisabled]}
          onPress={onPrev}
          disabled={currentIndex === 0}
        >
          <Ionicons
            name="chevron-back"
            size={24}
            color={currentIndex === 0 ? color.borderStrong : color.accent}
          />
          <Text style={[styles.navButtonText, currentIndex === 0 && styles.navButtonTextDisabled]}>
            {t('common.previous')}
          </Text>
        </Pressable>
        <Pressable
          style={[styles.navButton, currentIndex === totalCount - 1 && styles.navButtonDisabled]}
          onPress={onNext}
          disabled={currentIndex === totalCount - 1}
        >
          <Text style={[styles.navButtonText, currentIndex === totalCount - 1 && styles.navButtonTextDisabled]}>
            {t('common.next')}
          </Text>
          <Ionicons
            name="chevron-forward"
            size={24}
            color={currentIndex === totalCount - 1 ? color.borderStrong : color.accent}
          />
        </Pressable>
      </View>
    </View>
  );
}

// Range Selector Component
function RangeSelector({
  selectedRange,
  onSelectRange,
}: {
  selectedRange: string;
  onSelectRange: (range: string) => void;
}) {
  const { t } = useTranslation();
  const ranges = [
    { id: 'all', label: 'All 114', labelAr: 'الكل' },
    { id: '1-10', label: '1-10', labelAr: '١-١٠' },
    { id: '11-20', label: '11-20', labelAr: '١١-٢٠' },
    { id: '21-30', label: '21-30', labelAr: '٢١-٣٠' },
    { id: '31-40', label: '31-40', labelAr: '٣١-٤٠' },
    { id: '41-50', label: '41-50', labelAr: '٤١-٥٠' },
    { id: '51-60', label: '51-60', labelAr: '٥١-٦٠' },
    { id: '61-70', label: '61-70', labelAr: '٦١-٧٠' },
    { id: '71-80', label: '71-80', labelAr: '٧١-٨٠' },
    { id: '81-90', label: '81-90', labelAr: '٨١-٩٠' },
    { id: '91-100', label: '91-100', labelAr: '٩١-١٠٠' },
    { id: '101-114', label: '101-114', labelAr: '١٠١-١١٤' },
  ];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.rangeSelector}
      contentContainerStyle={styles.rangeSelectorContent}
    >
      {ranges.map((range) => (
        <Pressable
          key={range.id}
          style={[
            styles.rangeButton,
            selectedRange === range.id && styles.rangeButtonActive,
          ]}
          onPress={() => onSelectRange(range.id)}
        >
          <Text
            style={[
              styles.rangeButtonText,
              selectedRange === range.id && styles.rangeButtonTextActive,
            ]}
          >
            {range.id === 'all' ? t('surahLearn.all114') : range.label}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

// Quiz Set Card Component
function QuizSetCard({
  setIndex,
  setName,
  questionCount,
  onPress,
}: {
  setIndex: number;
  setName: string;
  questionCount: number;
  onPress: () => void;
}) {
  const { t } = useTranslation();
  return (
    <Pressable style={styles.quizSetCard} onPress={onPress}>
      <View style={styles.quizSetIcon}>
        <Text style={styles.quizSetNumber}>{setIndex + 1}</Text>
      </View>
      <View style={styles.quizSetInfo}>
        <Text style={styles.quizSetName}>{setName}</Text>
        <Text style={styles.quizSetCount}>{questionCount} {t('surahLearn.questions')}</Text>
      </View>
      <Ionicons name="play-circle" size={28} color={color.progress} />
    </Pressable>
  );
}

type FilterType = 'all' | 'meccan' | 'medinan';

export default function SurahLearnScreen() {
  // The sliding tab indicator needs a pixel offset, so it reads the live
  // width rather than one captured when the module was imported.
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabType>('learn');
  const [selectedRange, setSelectedRange] = useState('all');
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    Animated.spring(slideAnim, {
      toValue: tab === 'learn' ? 0 : 1,
      useNativeDriver: true,
      friction: 8,
    }).start();
  };

  const handleFilterChange = (filter: FilterType) => {
    setSelectedFilter(filter);
    setCurrentCardIndex(0);
    setIsFlipped(false);
  };

  const getFilteredSurahs = () => {
    let filtered = SURAHS;

    // Apply range filter
    if (selectedRange !== 'all') {
      const [start, end] = selectedRange.split('-').map(Number);
      filtered = filtered.filter((s) => s.surahNumber >= start && s.surahNumber <= end);
    }

    // Apply revelation type filter
    if (selectedFilter === 'meccan') {
      filtered = filtered.filter((s) => s.revelationType === 'Meccan');
    } else if (selectedFilter === 'medinan') {
      filtered = filtered.filter((s) => s.revelationType === 'Medinan');
    }

    return filtered;
  };

  const filteredSurahs = getFilteredSurahs();

  const handleNextCard = () => {
    if (currentCardIndex < filteredSurahs.length - 1) {
      setIsFlipped(false);
      setCurrentCardIndex(currentCardIndex + 1);
    }
  };

  const handlePrevCard = () => {
    if (currentCardIndex > 0) {
      setIsFlipped(false);
      setCurrentCardIndex(currentCardIndex - 1);
    }
  };

  const handleRangeChange = (range: string) => {
    setSelectedRange(range);
    setCurrentCardIndex(0);
    setIsFlipped(false);
  };

  const handleQuizSetPress = (setIndex: number) => {
    router.push(`/quran/quiz/surah_structure?setIndex=${setIndex}` as any);
  };

  const totalSets = getTotalSets('surah_structure');

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={color.text} />
        </Pressable>
        <View style={styles.headerTitle}>
          <Text style={styles.title}>{t('surahLearn.title')}</Text>
          <Text style={styles.titleArabic}>السُّوَر والتَّرْكِيب</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <View style={styles.tabBackground}>
          <Animated.View
            style={[
              styles.tabIndicator,
              {
                transform: [
                  {
                    translateX: slideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, (SCREEN_WIDTH - 48) / 2],
                    }),
                  },
                ],
              },
            ]}
          />
          <Pressable
            style={styles.tab}
            onPress={() => handleTabChange('learn')}
          >
            <Ionicons
              name="school"
              size={18}
              color={activeTab === 'learn' ? '#ffffff' : '#64748b'}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === 'learn' && styles.tabTextActive,
              ]}
            >
              {t('surahLearn.learn')}
            </Text>
          </Pressable>
          <Pressable
            style={styles.tab}
            onPress={() => handleTabChange('quiz')}
          >
            <Ionicons
              name="help-circle"
              size={18}
              color={activeTab === 'quiz' ? '#ffffff' : '#64748b'}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === 'quiz' && styles.tabTextActive,
              ]}
            >
              {t('surahLearn.quiz')}
            </Text>
          </Pressable>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        {activeTab === 'learn' ? (
          /* Learn Tab Content */
          <View style={styles.content}>
            {/* Type Filter - Meccan/Medinan */}
            <View style={styles.filterRow}>
              <Pressable
                style={[styles.filterButton, selectedFilter === 'all' && styles.filterButtonActive]}
                onPress={() => handleFilterChange('all')}
              >
                <Text style={[styles.filterButtonText, selectedFilter === 'all' && styles.filterButtonTextActive]}>
                  {t('surahLearn.all114')}
                </Text>
              </Pressable>
              <Pressable
                style={[styles.filterButton, selectedFilter === 'meccan' && styles.filterButtonActive]}
                onPress={() => handleFilterChange('meccan')}
              >
                <Text style={[styles.filterButtonText, selectedFilter === 'meccan' && styles.filterButtonTextActive]}>
                  {t('surahLearn.meccan86')}
                </Text>
              </Pressable>
              <Pressable
                style={[styles.filterButton, selectedFilter === 'medinan' && styles.filterButtonActive]}
                onPress={() => handleFilterChange('medinan')}
              >
                <Text style={[styles.filterButtonText, selectedFilter === 'medinan' && styles.filterButtonTextActive]}>
                  {t('surahLearn.medinan28')}
                </Text>
              </Pressable>
            </View>

            {/* Range Selector */}
            <RangeSelector
              selectedRange={selectedRange}
              onSelectRange={handleRangeChange}
            />

            {/* Flashcard */}
            {filteredSurahs.length > 0 && (
              <SurahFlashcard
                surah={filteredSurahs[currentCardIndex]}
                isFlipped={isFlipped}
                onFlip={() => setIsFlipped(!isFlipped)}
                onNext={handleNextCard}
                onPrev={handlePrevCard}
                currentIndex={currentCardIndex}
                totalCount={filteredSurahs.length}
              />
            )}

            {/* Shuffle Button */}
            <Pressable
              style={styles.shuffleButton}
              onPress={() => {
                const randomIndex = Math.floor(Math.random() * filteredSurahs.length);
                setCurrentCardIndex(randomIndex);
                setIsFlipped(false);
              }}
            >
              <Ionicons name="shuffle" size={20} color={color.progress} />
              <Text style={styles.shuffleButtonText}>{t('surahLearn.shuffle')}</Text>
            </Pressable>

            <View style={{ height: 100 }} />
          </View>
        ) : (
          /* Quiz Tab Content */
          <View style={styles.content}>
            {/* Quiz Header Card */}
            <View style={styles.quizHeaderCard}>
              <View style={styles.quizHeaderIcon}>
                <Ionicons name="trophy" size={40} color={color.warning} />
              </View>
              <Text style={styles.quizHeaderTitle}>{t('surahLearn.testYourKnowledge')}</Text>
              <Text style={styles.quizHeaderSubtitle}>
                {t('surahLearn.challengeDescription', { count: totalSets })}
              </Text>
            </View>

            {/* Quiz Sets */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="list" size={20} color={color.progress} />
                <Text style={styles.sectionTitle}>{t('surahLearn.quizSets')}</Text>
              </View>
              <Text style={styles.sectionSubtitle}>
                {t('surahLearn.completeEachSet')}
              </Text>

              {Array.from({ length: totalSets }).map((_, index) => {
                const questions = getQuestionsBySet('surah_structure', index);
                return (
                  <QuizSetCard
                    key={index}
                    setIndex={index}
                    setName={getSetName('surah_structure', index)}
                    questionCount={questions.length}
                    onPress={() => handleQuizSetPress(index)}
                  />
                );
              })}
            </View>

            {/* Random Quiz Option */}
            <Pressable
              style={styles.randomQuizButton}
              onPress={() => router.push('/quran/quiz/surah_structure' as any)}
            >
              <LinearGradient
                colors={[color.progress, color.accent]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.randomQuizGradient}
              >
                <Ionicons name="shuffle" size={24} color={color.text} />
                <View style={styles.randomQuizText}>
                  <Text style={styles.randomQuizTitle}>{t('surahLearn.randomQuiz')}</Text>
                  <Text style={styles.randomQuizSubtitle}>
                    {t('surahLearn.mixOfAll')}
                  </Text>
                </View>
                <Ionicons name="arrow-forward" size={24} color={color.text} />
              </LinearGradient>
            </Pressable>

            <View style={{ height: 100 }} />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.bg,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: color.text,
  },
  titleArabic: {
    fontFamily: font.arabic,
    lineHeight: 34,
    fontSize: 20,
    color: color.progress,
    marginTop: 2,
  },
  tabContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  tabBackground: {
    flexDirection: 'row',
    backgroundColor: color.surface,
    borderRadius: radius.md,
    padding: 4,
    position: 'relative',
  },
  tabIndicator: {
    position: 'absolute',
    top: 4,
    left: 4,
    width: '48%',
    height: 40,
    backgroundColor: color.progress,
    borderRadius: radius.sm,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
    zIndex: 1,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: color.textFaint,
  },
  tabTextActive: {
    color: color.text,
  },
  content: {
    paddingHorizontal: 20,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  filterButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: color.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: color.border,
  },
  filterButtonActive: {
    backgroundColor: color.progress,
    borderColor: color.progress,
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: color.textMuted,
  },
  filterButtonTextActive: {
    color: color.text,
  },
  // Range Selector
  rangeSelector: {
    marginBottom: 16,
  },
  rangeSelectorContent: {
    paddingRight: 20,
    gap: 8,
  },
  rangeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: color.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: color.border,
  },
  rangeButtonActive: {
    backgroundColor: color.progress,
    borderColor: color.progress,
  },
  rangeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: color.textMuted,
  },
  rangeButtonTextActive: {
    color: color.text,
  },
  // Flashcard
  flashcardContainer: {
    marginBottom: 16,
  },
  progressRow: {
    marginBottom: 12,
  },
  progressText: {
    fontSize: 14,
    color: color.textMuted,
    textAlign: 'center',
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: color.surfaceRaised,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: color.progress,
    borderRadius: 2,
  },
  cardPressable: {
    height: CARD_HEIGHT,
  },
  cardWrapper: {
    height: CARD_HEIGHT,
    position: 'relative',
  },
  card: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: CARD_HEIGHT,
    borderRadius: radius.xl,
    overflow: 'hidden',
    backfaceVisibility: 'hidden',
  },
  cardFront: {
    zIndex: 2,
  },
  cardBack: {
    zIndex: 1,
  },
  cardGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  cardLabel: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
  },
  cardLabelEn: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 4,
    marginBottom: 16,
  },
  cardNumber: {
    fontSize: 80,
    fontWeight: 'bold',
    color: color.text,
  },
  cardNameArabic: {
    fontFamily: font.arabic,
    lineHeight: 74,
    fontSize: 44,
    fontWeight: 'bold',
    color: color.text,
    marginBottom: 4,
  },
  cardNameEnglish: {
    fontSize: 20,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 14,
  },
  meaningContainer: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  meaningText: {
    fontSize: 16,
    fontWeight: '600',
    color: color.text,
  },
  detailsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  detailBox: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.sm,
    alignItems: 'center',
  },
  detailBoxLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: color.text,
  },
  tapHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    position: 'absolute',
    bottom: 16,
  },
  tapHintText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: color.surface,
    borderRadius: radius.md,
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: color.text,
  },
  navButtonTextDisabled: {
    color: color.textFaint,
  },
  shuffleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    backgroundColor: color.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: color.progress,
  },
  shuffleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: color.progress,
  },
  // Quiz Tab
  quizHeaderCard: {
    backgroundColor: color.surface,
    borderRadius: radius.xl,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  quizHeaderIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  quizHeaderTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: color.text,
    marginBottom: 8,
  },
  quizHeaderSubtitle: {
    fontSize: 14,
    color: color.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: color.text,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: color.textFaint,
    marginBottom: 16,
  },
  quizSetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: color.surface,
    borderRadius: radius.lg,
    padding: 16,
    marginBottom: 12,
  },
  quizSetIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quizSetNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: color.progress,
  },
  quizSetInfo: {
    flex: 1,
    marginLeft: 14,
  },
  quizSetName: {
    fontSize: 16,
    fontWeight: '600',
    color: color.text,
  },
  quizSetCount: {
    fontSize: 14,
    color: color.textFaint,
    marginTop: 2,
  },
  randomQuizButton: {
    marginBottom: 24,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  randomQuizGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  randomQuizText: {
    flex: 1,
  },
  randomQuizTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: color.text,
  },
  randomQuizSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
});

import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { LEARNING_GOALS, LearningGoalId } from '../../src/types/onboarding';
import { useSettingsStore } from '../../src/stores/settingsStore';
import { font, color, radius } from '../../src/theme/tokens';
import { withAlpha } from '../../src/components/ui/Primitives';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_GAP = 12;
const HORIZONTAL_PADDING = 20;
const CARD_WIDTH = (SCREEN_WIDTH - HORIZONTAL_PADDING * 2 - CARD_GAP) / 2;

export default function GoalsScreen() {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<LearningGoalId[]>([]);
  const { setLearningGoals, completeOnboarding } = useSettingsStore();

  const toggleGoal = (id: LearningGoalId) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  };

  const handleContinue = () => {
    if (selected.length === 0) {
      Alert.alert('', t('common.selectAtLeastOne'));
      return;
    }
    setLearningGoals(selected);
    completeOnboarding();
    router.replace('/auth');
  };

  const hasSelection = selected.length > 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.headerSection}>
          <Text style={styles.title}>{t('onboarding.selectGoals')}</Text>
          <Text style={styles.subtitle}>{t('onboarding.selectGoalsSubtitle')}</Text>
        </View>

        {/* Goal grid */}
        <View style={styles.grid}>
          {LEARNING_GOALS.map((goal) => {
            const isSelected = selected.includes(goal.id);
            return (
              <TouchableOpacity
                key={goal.id}
                style={[
                  styles.goalCard,
                  isSelected && {
                    borderColor: goal.color,
                    backgroundColor: goal.color + '15',
                  },
                ]}
                activeOpacity={0.7}
                onPress={() => toggleGoal(goal.id)}
                accessibilityRole="button"
                accessibilityLabel={`${t(goal.labelKey)}${isSelected ? ', selected' : ''}`}
              >
                <View
                  style={[
                    styles.goalIcon,
                    { backgroundColor: goal.color + '20' },
                  ]}
                >
                  <Ionicons name={goal.icon as any} size={24} color={goal.color} />
                </View>
                <Text style={[styles.goalLabel, isSelected && { color: color.text }]}>
                  {t(goal.labelKey)}
                </Text>
                <Text style={[styles.goalArabic, isSelected && { opacity: 1 }]}>
                  {goal.arabic}
                </Text>
                {isSelected && (
                  <View style={[styles.checkmark, { backgroundColor: goal.color }]}>
                    <Ionicons name="checkmark" size={12} color={color.text} />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.bottomSection}>
        {hasSelection && (
          <Text style={styles.selectionText}>
            {selected.length} {selected.length === 1 ? 'goal' : 'goals'} selected
          </Text>
        )}

        <TouchableOpacity
          style={[
            styles.continueButton,
            !hasSelection && styles.continueButtonDisabled,
          ]}
          activeOpacity={0.8}
          onPress={handleContinue}
          accessibilityRole="button"
          accessibilityLabel={t('common.continue')}
        >
          <Text style={[styles.continueText, !hasSelection && { opacity: 0.4 }]}>
            {t('common.continue')}
          </Text>
          <View style={[styles.continueIcon, !hasSelection && { opacity: 0.4 }]}>
            <Ionicons name="arrow-forward" size={18} color={color.progress} />
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.bg,
  },
  scrollContent: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingTop: 16,
    paddingBottom: 20,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    color: color.text,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    color: color.textMuted,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  goalCard: {
    width: CARD_WIDTH,
    backgroundColor: color.surface,
    borderRadius: radius.lg,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: color.border,
    marginBottom: CARD_GAP,
  },
  goalIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  goalLabel: {
    color: color.textMuted,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 18,
  },
  goalArabic: {
    fontFamily: font.arabic,
    lineHeight: 24,
    color: color.sacred,
    fontSize: 14,
    marginTop: 4,
    opacity: 0.7,
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomSection: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 12,
    alignItems: 'center',
  },
  selectionText: {
    color: color.progress,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 12,
  },
  continueButton: {
    backgroundColor: color.progress,
    paddingVertical: 18,
    borderRadius: radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
  },
  continueButtonDisabled: {
    backgroundColor: color.surface,
  },
  continueText: {
    color: color.text,
    fontSize: 17,
    fontWeight: '700',
    marginRight: 10,
  },
  continueIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.lg,
    backgroundColor: withAlpha(color.text, 0.13),
    alignItems: 'center',
    justifyContent: 'center',
  },
});

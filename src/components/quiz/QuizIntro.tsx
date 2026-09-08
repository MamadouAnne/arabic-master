import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { font, color, radius } from '../../theme/tokens';

export interface QuizIntroFeature {
  icon: string;
  text: string;
}

interface QuizIntroProps {
  icon: string;
  title: string;
  titleArabic: string;
  /** Short supporting line(s) under the title (e.g. "10 questions · pass with 70%"). */
  subtitle: string;
  features: QuizIntroFeature[];
  attempts: number;
  bestScore: number;
  attemptText: string;
  attemptsLabel: string;
  bestScoreLabel: string;
  error?: string | null;
  retryLabel: string;
  startLabel: string;
  onBack: () => void;
  onStart: () => void;
  onRetry: () => void;
}

/**
 * Shared intro / "ready" screen for the vocabulary and grammar quizzes.
 * Presentational only — all copy is passed in already localized.
 */
export function QuizIntro({
  icon,
  title,
  titleArabic,
  subtitle,
  features,
  attempts,
  bestScore,
  attemptText,
  attemptsLabel,
  bestScoreLabel,
  error,
  retryLabel,
  startLabel,
  onBack,
  onStart,
  onRetry,
}: QuizIntroProps) {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Pressable style={styles.backButton} onPress={onBack} hitSlop={8}>
        <Ionicons name="arrow-back" size={24} color={color.textMuted} />
      </Pressable>

      <View style={styles.content}>
        {/* Hero */}
        <View style={styles.heroOuter}>
          <View style={styles.heroInner}>
            <Ionicons name={icon as any} size={48} color={color.sacred} />
          </View>
        </View>

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.titleArabic}>{titleArabic}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>

        {error ? (
          <View style={styles.errorCard}>
            <Ionicons name="warning" size={24} color={color.warning} />
            <Text style={styles.errorText}>{error}</Text>
            <Pressable style={styles.retryButton} onPress={onRetry}>
              <Text style={styles.retryButtonText}>{retryLabel}</Text>
            </Pressable>
          </View>
        ) : attempts > 0 ? (
          <>
            <Text style={styles.attemptText}>{attemptText}</Text>
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{attempts}</Text>
                <Text style={styles.statLabel}>{attemptsLabel}</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={[styles.statValue, styles.statValueGold]}>{bestScore}%</Text>
                <Text style={styles.statLabel}>{bestScoreLabel}</Text>
              </View>
            </View>
          </>
        ) : (
          <View style={styles.featureCard}>
            {features.map((f, i) => (
              <View key={i} style={[styles.featureItem, i > 0 && styles.featureItemBorder]}>
                <View style={styles.featureIconChip}>
                  <Ionicons name={f.icon as any} size={17} color={color.accent} />
                </View>
                <Text style={styles.featureText}>{f.text}</Text>
              </View>
            ))}
          </View>
        )}

        {!error && (
          <Pressable style={styles.startButton} onPress={onStart}>
            <Text style={styles.startButtonText}>{startLabel}</Text>
            <Ionicons name="arrow-forward" size={20} color={color.textOnAccent} />
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}

const GOLD = color.sacred;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.bg,
  },
  backButton: {
    position: 'absolute',
    top: 56,
    left: 20,
    padding: 8,
    zIndex: 10,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },

  // Hero
  heroOuter: {
    width: 116,
    height: 116,
    borderRadius: 36,
    backgroundColor: 'rgba(212, 175, 55, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  heroInner: {
    width: 88,
    height: 88,
    borderRadius: 26,
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  title: {
    fontSize: 30,
    fontWeight: '700',
    color: color.text,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  titleArabic: {
    fontFamily: font.arabic,
    fontSize: 30,
    lineHeight: 50,
    color: GOLD,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 6,
  },
  subtitle: {
    fontSize: 15,
    color: color.textMuted,
    textAlign: 'center',
    lineHeight: 23,
    marginTop: 14,
  },

  // Feature card
  featureCard: {
    width: '100%',
    backgroundColor: color.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: color.border,
    paddingHorizontal: 18,
    marginTop: 28,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 16,
  },
  featureItemBorder: {
    borderTopWidth: 1,
    borderTopColor: color.border,
  },
  featureIconChip: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: 'rgba(129, 140, 248, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    flex: 1,
    fontSize: 15,
    color: color.text,
    fontWeight: '500',
  },

  // Attempt stats
  attemptText: {
    fontSize: 14,
    color: color.textMuted,
    textAlign: 'center',
    marginTop: 24,
    lineHeight: 21,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    width: '100%',
  },
  statBox: {
    flex: 1,
    backgroundColor: color.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: color.border,
    paddingVertical: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 26,
    fontWeight: '700',
    color: color.text,
  },
  statValueGold: {
    color: GOLD,
  },
  statLabel: {
    fontSize: 12,
    color: color.textFaint,
    marginTop: 4,
  },

  // Error
  errorCard: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: 'rgba(249, 115, 22, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.4)',
    borderRadius: radius.lg,
    padding: 20,
    marginTop: 24,
  },
  errorText: {
    fontSize: 14,
    color: color.warning,
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: color.surfaceRaised,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: radius.sm,
  },
  retryButtonText: {
    fontSize: 14,
    color: color.text,
    fontWeight: '600',
  },

  // Start button
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: GOLD,
    paddingVertical: 17,
    borderRadius: radius.lg,
    width: '100%',
    marginTop: 32,
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 6,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: color.textOnAccent,
  },
});

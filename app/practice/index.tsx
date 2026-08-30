import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { font, color as tk, radius } from '../../src/theme/tokens';
import { withAlpha } from '../../src/components/ui/Primitives';

interface PracticeCardProps {
  title: string;
  titleArabic: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  route: string;
}

function PracticeCard({ title, titleArabic, description, icon, color, route }: PracticeCardProps) {
  return (
    <Pressable
      style={[styles.practiceCard, { borderColor: color + '40' }]}
      onPress={() => router.push(route as any)}
    >
      <View style={[styles.practiceIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={28} color={color} />
      </View>
      <View style={styles.practiceContent}>
        <Text style={styles.practiceTitle}>{title}</Text>
        <Text style={[styles.practiceTitleArabic, { color }]}>{titleArabic}</Text>
        <Text style={styles.practiceDescription}>{description}</Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color={tk.textFaint} />
    </Pressable>
  );
}

export default function PracticeScreen() {
  const { t } = useTranslation();

  const practiceOptions = [
    {
      id: 'handwriting',
      title: t('practiceScreen.handwritingPractice'),
      titleArabic: 'الْخَطُّ الْيَدَوِي',
      description: t('practiceScreen.handwritingDesc'),
      icon: 'pencil' as const,
      color: tk.accent,
      route: '/alphabet/writing-practice',
    },
    {
      id: 'typing',
      title: t('practiceScreen.keyboardTyping'),
      titleArabic: 'الْكِتَابَةُ بِالْمِفْتَاح',
      description: t('practiceScreen.keyboardTypingDesc'),
      icon: 'keypad' as const,
      color: tk.progress,
      route: '/exercise/typing-practice',
    },
    {
      id: 'listening',
      title: t('practiceScreen.listeningPractice'),
      titleArabic: 'تَدْرِيبُ الاِسْتِمَاع',
      description: t('practiceScreen.listeningPracticeDesc'),
      icon: 'headset' as const,
      color: tk.accent,
      route: '/exercise/listening',
    },
    {
      id: 'speaking',
      title: t('practiceScreen.speakingPractice'),
      titleArabic: 'تَدْرِيبُ التَّحَدُّث',
      description: t('practiceScreen.speakingPracticeDesc'),
      icon: 'mic' as const,
      color: tk.warning,
      route: '/speaking',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={tk.text} />
          </Pressable>
          <View style={styles.headerText}>
            <Text style={styles.title}>{t('practiceScreen.title')}</Text>
            <Text style={styles.titleArabic}>التَّدْرِيب</Text>
          </View>
        </View>

        {/* Intro Card */}
        <View style={styles.introCard}>
          <View style={styles.introIcon}>
            <Ionicons name="fitness" size={32} color={tk.accent} />
          </View>
          <Text style={styles.introTitle}>{t('practiceScreen.buildYourSkills')}</Text>
          <Text style={styles.introText}>
            {t('practiceScreen.buildYourSkillsDesc')}
          </Text>
        </View>

        {/* Practice Options */}
        <View style={styles.practiceSection}>
          <Text style={styles.sectionTitle}>{t('practiceScreen.practiceExercises')}</Text>
          {practiceOptions.map((option) => (
            <PracticeCard
              key={option.id}
              title={option.title}
              titleArabic={option.titleArabic}
              description={option.description}
              icon={option.icon}
              color={option.color}
              route={option.route}
            />
          ))}
        </View>

        {/* Tip Card */}
        <View style={styles.tipCard}>
          <Ionicons name="bulb" size={24} color={tk.sacred} />
          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>{t('practiceScreen.dailyPracticeTip')}</Text>
            <Text style={styles.tipText}>
              {t('practiceScreen.dailyPracticeTipText')}
            </Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tk.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: radius.xl,
    backgroundColor: tk.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: tk.text,
  },
  titleArabic: {
    fontFamily: font.arabic,
    lineHeight: 31,
    fontSize: 18,
    color: tk.accent,
    marginTop: 4,
  },
  introCard: {
    backgroundColor: tk.surface,
    marginHorizontal: 20,
    borderRadius: radius.lg,
    padding: 20,
    marginBottom: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: withAlpha(tk.accent, 0.19),
  },
  introIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: withAlpha(tk.accent, 0.13),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  introTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: tk.text,
    marginBottom: 8,
  },
  introText: {
    fontSize: 14,
    color: tk.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
  practiceSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: tk.text,
    marginBottom: 16,
  },
  practiceCard: {
    backgroundColor: tk.surface,
    borderRadius: radius.lg,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
  },
  practiceIcon: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  practiceContent: {
    flex: 1,
    marginLeft: 16,
  },
  practiceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: tk.text,
  },
  practiceTitleArabic: {
    fontFamily: font.arabic,
    lineHeight: 24,
    fontSize: 14,
    marginTop: 2,
  },
  practiceDescription: {
    fontSize: 12,
    color: tk.textMuted,
    marginTop: 4,
    lineHeight: 18,
  },
  tipCard: {
    backgroundColor: tk.surface,
    marginHorizontal: 20,
    borderRadius: radius.lg,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tipContent: {
    flex: 1,
    marginLeft: 12,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: tk.sacred,
    marginBottom: 4,
  },
  tipText: {
    fontSize: 13,
    color: tk.textMuted,
    lineHeight: 20,
  },
});

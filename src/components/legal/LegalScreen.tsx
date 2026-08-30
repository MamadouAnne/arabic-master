import { View, Text, ScrollView, StyleSheet, Pressable, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { LEGAL_CONSTANTS, LegalSection } from '../../data/legal';
import { color, radius } from '../../theme/tokens';
import { withAlpha } from '../ui/Primitives';

interface LegalScreenProps {
  title: string;
  sections: LegalSection[];
}

export function LegalScreen({ title, sections }: LegalScreenProps) {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={color.text} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Effective Date */}
        <View style={styles.dateBadge}>
          <Ionicons name="calendar-outline" size={14} color={color.textMuted} />
          <Text style={styles.dateText}>
            {t('legal.effectiveDate')}: {LEGAL_CONSTANTS.effectiveDate}
          </Text>
        </View>

        {/* Sections */}
        {sections.map((section, index) => (
          <View key={index} style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.content.map((paragraph, pIndex) => (
              <Text key={pIndex} style={styles.paragraph}>
                {paragraph}
              </Text>
            ))}
          </View>
        ))}

        {/* Contact Footer */}
        <View style={styles.contactFooter}>
          <Text style={styles.contactLabel}>{t('legal.contactUs')}</Text>
          <Pressable
            onPress={() => Linking.openURL(`mailto:${LEGAL_CONSTANTS.email}`)}
            style={styles.emailButton}
          >
            <Ionicons name="mail-outline" size={16} color={color.progress} />
            <Text style={styles.emailText}>{LEGAL_CONSTANTS.email}</Text>
          </Pressable>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: color.border,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: color.text,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  dateText: {
    fontSize: 13,
    color: color.textMuted,
  },
  sectionCard: {
    backgroundColor: color.surface,
    borderRadius: radius.md,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: color.border,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: color.text,
    marginBottom: 10,
  },
  paragraph: {
    fontSize: 14,
    color: color.textMuted,
    lineHeight: 22,
    marginBottom: 8,
  },
  contactFooter: {
    alignItems: 'center',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: color.border,
    marginTop: 8,
  },
  contactLabel: {
    fontSize: 14,
    color: color.textMuted,
    marginBottom: 8,
  },
  emailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: withAlpha(color.progress, 0.13),
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radius.sm,
  },
  emailText: {
    fontSize: 14,
    color: color.progress,
    fontWeight: '600',
  },
});

import { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useFonts } from 'expo-font';
import { useTranslation } from 'react-i18next';
import { arabicLetters } from '../../src/data/arabic/alphabet/letters';
import { ARABIC_SCRIPT_FONTS, SCRIPT_META } from '../../src/data/arabic/alphabet/scriptFonts';
import { useLocalizedContent } from '../../src/hooks/useLocalizedContent';

const FONT_ASSETS = ARABIC_SCRIPT_FONTS;
const STYLES = SCRIPT_META;

type FormKey = 'isolated' | 'initial' | 'medial' | 'final';
const FORMS: FormKey[] = ['isolated', 'initial', 'medial', 'final'];

export default function AlphabetStylesScreen() {
  const { t } = useTranslation();
  const { lc } = useLocalizedContent();
  const [fontsLoaded, fontError] = useFonts(FONT_ASSETS);
  const ready = fontsLoaded || !!fontError; // on error, fall back to system fonts rather than hang
  const [form, setForm] = useState<FormKey>('isolated');

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </Pressable>
        <View style={styles.headerText}>
          <Text style={styles.title}>{t('alphabet.scriptsTitle')}</Text>
          <Text style={styles.titleArabic}>خُطُوطُ الْكِتَابَة</Text>
        </View>
      </View>

      {!ready ? (
        <View style={styles.loading}>
          <ActivityIndicator color="#6366f1" size="large" />
          <Text style={styles.loadingText}>{t('alphabet.scriptsLoading')}</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          <Text style={styles.subtitle}>{t('alphabet.scriptsSubtitle')}</Text>

          {/* Style legend */}
          <View style={styles.legend}>
            {STYLES.map((s) => (
              <View key={s.key} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: s.color }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.legendName}>{t(s.nameKey)}</Text>
                  <Text style={styles.legendDesc}>{t(s.descKey)}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Form selector */}
          <Text style={styles.formLabel}>{t('alphabet.scriptsForm')}</Text>
          <View style={styles.formRow}>
            {FORMS.map((f) => (
              <Pressable
                key={f}
                style={[styles.formPill, form === f && styles.formPillActive]}
                onPress={() => setForm(f)}
              >
                <Text style={[styles.formPillText, form === f && styles.formPillTextActive]}>{t(`alphabet.${f}`)}</Text>
              </Pressable>
            ))}
          </View>

          {/* Column headers */}
          <View style={styles.tableHeader}>
            <View style={styles.nameCol} />
            {STYLES.map((s) => (
              <Text key={s.key} style={[styles.colHead, { color: s.color }]} numberOfLines={1}>{t(s.nameKey)}</Text>
            ))}
          </View>

          {/* Rows: each letter across the three styles */}
          {arabicLetters.map((letter) => {
            const glyph = (letter.forms as Record<FormKey, string>)[form];
            return (
              <View key={letter.id} style={styles.row}>
                <View style={styles.nameCol}>
                  <Text style={styles.letterName}>{lc(letter.name, letter.nameFr)}</Text>
                  <Text style={styles.letterTranslit}>{letter.transliteration}</Text>
                </View>
                {STYLES.map((s) => (
                  <View key={s.key} style={styles.glyphCell}>
                    <Text style={[styles.glyph, s.font ? { fontFamily: s.font } : null]}>{glyph}</Text>
                  </View>
                ))}
              </View>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerText: { flex: 1, marginLeft: 8 },
  title: { fontSize: 22, fontWeight: '800', color: '#f8fafc' },
  titleArabic: { fontSize: 15, color: '#94a3b8', marginTop: 2, textAlign: 'left' },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14 },
  loadingText: { color: '#94a3b8', fontSize: 14 },
  subtitle: { fontSize: 14, color: '#cbd5e1', lineHeight: 20, paddingHorizontal: 16, marginBottom: 14 },
  legend: { marginHorizontal: 16, backgroundColor: '#1e293b', borderRadius: 14, borderWidth: 1, borderColor: '#334155', padding: 12, gap: 12, marginBottom: 18 },
  legendItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  legendDot: { width: 10, height: 10, borderRadius: 5, marginTop: 4 },
  legendName: { fontSize: 14, fontWeight: '700', color: '#e2e8f0' },
  legendDesc: { fontSize: 12.5, color: '#94a3b8', marginTop: 1, lineHeight: 17 },
  formLabel: { fontSize: 12, fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, paddingHorizontal: 16, marginBottom: 8 },
  formRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 18 },
  formPill: { flex: 1, alignItems: 'center', paddingVertical: 9, borderRadius: 10, backgroundColor: '#1e293b', borderWidth: 1.5, borderColor: 'transparent' },
  formPillActive: { backgroundColor: 'rgba(99,102,241,0.18)', borderColor: '#6366f1' },
  formPillText: { fontSize: 13, fontWeight: '600', color: '#94a3b8' },
  formPillTextActive: { color: '#a5b4fc' },
  tableHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: '#1e293b', marginBottom: 4 },
  colHead: { flex: 1, fontSize: 12, fontWeight: '700', textAlign: 'center', textTransform: 'uppercase', letterSpacing: 0.3 },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#1e293b' },
  nameCol: { width: 92 },
  letterName: { fontSize: 14, fontWeight: '700', color: '#e2e8f0' },
  letterTranslit: { fontSize: 12, color: '#64748b', fontStyle: 'italic', marginTop: 1 },
  glyphCell: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  glyph: { fontSize: 34, color: '#f8fafc', lineHeight: 56, textAlign: 'center', writingDirection: 'rtl' },
});

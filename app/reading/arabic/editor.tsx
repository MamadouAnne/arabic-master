import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useArabicTextsStore } from '../../../src/stores/arabicTextsStore';
import { color, radius } from '../../../src/theme/tokens';

const BRAND = color.progress;

export default function ArabicEditorScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const existing = useArabicTextsStore((s) =>
    id ? s.texts.find((item) => item.id === id) : undefined
  );
  const addText = useArabicTextsStore((s) => s.addText);
  const updateText = useArabicTextsStore((s) => s.updateText);

  const isEditing = !!existing;
  const [draftTitle, setDraftTitle] = useState(existing?.title ?? '');
  const [draftContent, setDraftContent] = useState(existing?.content ?? '');

  const verseCount = useMemo(
    () => draftContent.split('\n').filter((l) => l.trim().length > 0).length,
    [draftContent]
  );
  const canSave = draftContent.trim().length > 0;

  const handleSave = useCallback(() => {
    if (!canSave) {
      Alert.alert(t('reading.memo.emptyAlertTitle'), t('reading.memo.emptyAlertMsg'));
      return;
    }
    if (isEditing && existing) {
      updateText(existing.id, { title: draftTitle, content: draftContent });
      router.back();
    } else {
      const newId = addText({ title: draftTitle, content: draftContent });
      // Replace so Back returns to the library, not this editor.
      router.replace(`/reading/arabic/${newId}` as any);
    }
  }, [canSave, isEditing, existing, draftTitle, draftContent, updateText, addText, t]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.iconBtn} hitSlop={8} onPress={() => router.back()}>
          <Ionicons name="close" size={26} color={color.text} />
        </Pressable>
        <Text style={styles.headerTitle}>
          {isEditing ? t('reading.memo.editTitle') : t('reading.memo.newTitle')}
        </Text>
        <View style={styles.iconBtn} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Title */}
          <Text style={styles.label}>{t('reading.memo.titleLabel')}</Text>
          <TextInput
            style={styles.titleInput}
            value={draftTitle}
            onChangeText={setDraftTitle}
            placeholder={t('reading.memo.titlePlaceholder')}
            placeholderTextColor={color.textFaint}
            maxLength={80}
          />

          {/* Content */}
          <View style={styles.contentLabelRow}>
            <Text style={styles.label}>{t('reading.memo.contentLabel')}</Text>
            {verseCount > 0 && (
              <View style={styles.versePill}>
                <Ionicons name="list-outline" size={12} color={BRAND} />
                <Text style={styles.versePillText}>
                  {t('reading.memo.verseCount', { count: verseCount })}
                </Text>
              </View>
            )}
          </View>
          <TextInput
            style={styles.contentInput}
            value={draftContent}
            onChangeText={setDraftContent}
            placeholder="الصق النص العربي هنا…"
            placeholderTextColor={color.textFaint}
            multiline
            textAlign="right"
            textAlignVertical="top"
          />

          <View style={styles.tipRow}>
            <Ionicons name="bulb-outline" size={15} color={color.textFaint} />
            <Text style={styles.tipText}>{t('reading.memo.tip')}</Text>
          </View>
        </ScrollView>

        {/* Save */}
        <View style={styles.footer}>
          <Pressable onPress={handleSave} disabled={!canSave}>
            <LinearGradient
              colors={canSave ? [color.progress, color.accent] : [color.borderStrong, color.borderStrong]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.saveBtn}
            >
              <Ionicons
                name={isEditing ? 'checkmark' : 'play'}
                size={20}
                color={canSave ? '#fff' : '#64748b'}
              />
              <Text style={[styles.saveText, !canSave && styles.saveTextDisabled]}>
                {isEditing ? t('reading.memo.save') : t('reading.memo.saveAndListen')}
              </Text>
            </LinearGradient>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: color.bg },
  flex: { flex: 1 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: color.borderSubtle,
  },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: color.text },

  scrollContent: { padding: 20, paddingBottom: 40 },

  label: {
    fontSize: 12,
    fontWeight: '600',
    color: color.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 8,
  },
  titleInput: {
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.border,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: color.text,
    marginBottom: 22,
  },

  contentLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  versePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16,185,129,0.14)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.xl,
  },
  versePillText: { fontSize: 11.5, fontWeight: '700', color: BRAND },
  contentInput: {
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.border,
    borderRadius: radius.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 22,
    lineHeight: 38,
    color: color.text,
    minHeight: 260,
    writingDirection: 'rtl',
  },
  tipRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 12 },
  tipText: { flex: 1, fontSize: 12.5, color: color.textFaint, lineHeight: 18 },

  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
    backgroundColor: color.bg,
    borderTopWidth: 1,
    borderTopColor: color.borderSubtle,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: radius.lg,
    paddingVertical: 16,
  },
  saveText: { fontSize: 16, fontWeight: '700', color: color.text },
  saveTextDisabled: { color: color.textFaint },
});

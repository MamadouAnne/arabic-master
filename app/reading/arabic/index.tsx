import React, { useCallback } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useArabicTextsStore } from '../../../src/stores/arabicTextsStore';
import { SavedArabicText } from '../../../src/types/arabicText';
import { font, color, radius } from '../../../src/theme/tokens';

const BRAND = '#10b981';

function countLines(content: string): number {
  return content.split('\n').filter((l) => l.trim().length > 0).length;
}

// ─── Saved text card ────────────────────────────────────────────────
const TextCard = React.memo(
  ({
    item,
    onOpen,
    onEdit,
    onDelete,
  }: {
    item: SavedArabicText;
    onOpen: (id: string) => void;
    onEdit: (id: string) => void;
    onDelete: (item: SavedArabicText) => void;
  }) => {
    const { t } = useTranslation();
    const preview = item.content.replace(/\n+/g, ' ').trim();
    return (
      <Pressable style={styles.card} onPress={() => onOpen(item.id)}>
        <View style={styles.cardTopRow}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <View style={styles.cardActions}>
            <Pressable hitSlop={8} onPress={() => onEdit(item.id)} style={styles.cardIconBtn}>
              <Ionicons name="create-outline" size={18} color={color.textMuted} />
            </Pressable>
            <Pressable hitSlop={8} onPress={() => onDelete(item)} style={styles.cardIconBtn}>
              <Ionicons name="trash-outline" size={18} color="#f43f5e" />
            </Pressable>
          </View>
        </View>

        <Text style={styles.cardArabic} numberOfLines={2}>
          {preview}
        </Text>

        <View style={styles.cardFooter}>
          <View style={styles.metaRow}>
            <Ionicons name="list-outline" size={13} color={color.textMuted} />
            <Text style={styles.metaText}>
              {t('reading.memo.linesCount', { count: countLines(item.content) })}
            </Text>
          </View>
          <View style={styles.playChip}>
            <Ionicons name="play" size={12} color={color.text} />
            <Text style={styles.playChipText}>{t('reading.memo.listen')}</Text>
          </View>
        </View>
      </Pressable>
    );
  }
);

export default function ArabicLibraryScreen() {
  const { t } = useTranslation();
  const texts = useArabicTextsStore((s) => s.texts);
  const deleteText = useArabicTextsStore((s) => s.deleteText);

  const openNew = useCallback(() => {
    router.push('/reading/arabic/editor' as any);
  }, []);

  const openEdit = useCallback((id: string) => {
    router.push({ pathname: '/reading/arabic/editor', params: { id } } as any);
  }, []);

  const openText = useCallback((id: string) => {
    router.push(`/reading/arabic/${id}` as any);
  }, []);

  const handleDelete = useCallback(
    (item: SavedArabicText) => {
      Alert.alert(
        t('reading.memo.deleteTitle'),
        t('reading.memo.deleteConfirm', { title: item.title }),
        [
          { text: t('common.cancel'), style: 'cancel' },
          {
            text: t('reading.memo.deleteTitle'),
            style: 'destructive',
            onPress: () => deleteText(item.id),
          },
        ]
      );
    },
    [deleteText, t]
  );

  const renderItem = useCallback(
    ({ item }: { item: SavedArabicText }) => (
      <TextCard item={item} onOpen={openText} onEdit={openEdit} onDelete={handleDelete} />
    ),
    [openText, openEdit, handleDelete]
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={color.text} />
        </Pressable>
        <View style={styles.headerText}>
          <Text style={styles.title}>{t('reading.memo.libraryTitle')}</Text>
          <Text style={styles.titleAr}>حفظ النصوص</Text>
        </View>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>{texts.length}</Text>
        </View>
      </View>

      <FlatList
        data={texts}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <Pressable onPress={openNew}>
            <LinearGradient
              colors={['#10b981', '#0d9488']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.addCard}
            >
              <View style={styles.addIconWrap}>
                <Ionicons name="add" size={26} color={color.text} />
              </View>
              <View style={styles.addTextWrap}>
                <Text style={styles.addTitle}>{t('reading.memo.addTitle')}</Text>
                <Text style={styles.addSubtitle}>{t('reading.memo.addSubtitle')}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.85)" />
            </LinearGradient>
          </Pressable>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Ionicons name="book-outline" size={30} color={BRAND} />
            </View>
            <Text style={styles.emptyTitle}>{t('reading.memo.emptyTitle')}</Text>
            <Text style={styles.emptyText}>{t('reading.memo.emptyText')}</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: color.bg },
  listContent: { padding: 20, paddingBottom: 100 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: radius.xl,
    backgroundColor: color.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerText: { flex: 1 },
  title: { fontSize: 22, fontWeight: 'bold', color: color.text },
  titleAr: { fontSize: 15, color: BRAND, marginTop: 2, writingDirection: 'rtl' },
  headerBadge: {
    minWidth: 34,
    alignItems: 'center',
    backgroundColor: color.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.md,
  },
  headerBadgeText: { color: color.text, fontWeight: 'bold', fontSize: 14 },

  // Add CTA
  addCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.lg,
    padding: 16,
    marginBottom: 20,
  },
  addIconWrap: {
    width: 46,
    height: 46,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addTextWrap: { flex: 1, marginLeft: 14 },
  addTitle: { fontSize: 16, fontWeight: '700', color: color.text },
  addSubtitle: { fontSize: 12.5, color: 'rgba(255,255,255,0.9)', marginTop: 3 },

  // Card
  card: {
    backgroundColor: color.surface,
    borderRadius: radius.lg,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: color.border,
  },
  cardTopRow: { flexDirection: 'row', alignItems: 'center' },
  cardTitle: { flex: 1, fontSize: 15, fontWeight: '700', color: color.text },
  cardActions: { flexDirection: 'row', gap: 6 },
  cardIconBtn: { padding: 4 },
  cardArabic: {
    fontFamily: font.arabic,
    fontSize: 20,
    lineHeight: 34,
    color: color.text,
    textAlign: 'right',
    writingDirection: 'rtl',
    marginTop: 10,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: { fontSize: 12, color: color.textMuted, fontWeight: '500' },
  playChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: BRAND,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.xl,
  },
  playChipText: { fontSize: 12, color: color.text, fontWeight: '700' },

  // Empty
  empty: { alignItems: 'center', paddingTop: 40, paddingHorizontal: 20 },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: radius.xl,
    backgroundColor: 'rgba(16,185,129,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: color.text },
  emptyText: {
    fontSize: 13.5,
    color: color.textMuted,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
});

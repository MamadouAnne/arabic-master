import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useCommunityStore } from '../../src/stores/communityStore';
import { DiscussionCategory } from '../../src/types/community';
import { color, radius } from '../../src/theme/tokens';
import { withAlpha } from '../../src/components/ui/Primitives';

const CATEGORIES: { key: DiscussionCategory | 'all'; icon: string; color: string }[] = [
  { key: 'all', icon: 'apps', color: color.textMuted },
  { key: 'general', icon: 'globe', color: color.textFaint },
  { key: 'quran', icon: 'book', color: color.progress },
  { key: 'arabic', icon: 'language', color: color.warning },
  { key: 'prayer', icon: 'moon', color: color.accent },
  { key: 'tips', icon: 'bulb', color: color.warning },
];

export default function DiscussionsScreen() {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState<DiscussionCategory | 'all'>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postBody, setPostBody] = useState('');
  const [postCategory, setPostCategory] = useState<DiscussionCategory>('general');
  const [isPosting, setIsPosting] = useState(false);

  const {
    discussions,
    isLoadingDiscussions,
    loadDiscussions,
    postThread,
    toggleLikeThread,
  } = useCommunityStore();

  useEffect(() => {
    loadDiscussions(selectedCategory === 'all' ? undefined : selectedCategory);
  }, [selectedCategory]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadDiscussions(selectedCategory === 'all' ? undefined : selectedCategory);
    setRefreshing(false);
  }, [selectedCategory, loadDiscussions]);

  const handlePost = async () => {
    if (!postTitle.trim() || !postBody.trim()) return;
    setIsPosting(true);
    await postThread(postTitle.trim(), postBody.trim(), postCategory);
    setIsPosting(false);
    setPostTitle('');
    setPostBody('');
    setPostCategory('general');
    setShowPostModal(false);
  };

  // Sort: pinned first, then by recency
  const sorted = [...discussions].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const categoryColors: Record<string, string> = {
    general: color.textFaint,
    quran: color.progress,
    arabic: color.warning,
    prayer: color.accent,
    tips: color.warning,
  };

  const getTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return t('community.justNow');
    if (hours < 24) return t('community.hoursAgo', { count: hours });
    return `${Math.floor(hours / 24)}d`;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={color.text} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Ionicons name="chatbubbles" size={20} color={color.progress} />
          <Text style={styles.headerTitle}>{t('community.discussions')}</Text>
        </View>
        <View style={{ width: 32 }} />
      </View>

      {/* Category filter */}
      <View style={styles.categoryWrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryRow}
      >
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat.key;
          const label = cat.key === 'all'
            ? t('common.all')
            : t(`community.category${cat.key.charAt(0).toUpperCase() + cat.key.slice(1)}`);
          return (
            <Pressable
              key={cat.key}
              style={[styles.categoryChip, isActive && styles.categoryChipActive]}
              onPress={() => setSelectedCategory(cat.key)}
            >
              <Ionicons
                name={cat.icon as any}
                size={14}
                color={isActive ? color.surface : cat.color}
              />
              <Text style={[styles.categoryChipText, isActive && styles.categoryChipTextActive]}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
      </View>

      {/* Threads list */}
      {isLoadingDiscussions ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={color.progress} size="large" />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.threadList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={color.warning} />
          }
        >
          {sorted.length === 0 ? (
            <Text style={styles.emptyText}>{t('community.noDiscussions')}</Text>
          ) : (
            sorted.map((thread) => (
              <Pressable
                key={thread.id}
                style={styles.threadCard}
                onPress={() => router.push(`/community/thread/${thread.id}` as any)}
              >
                {/* Pinned indicator */}
                {thread.isPinned && (
                  <View style={styles.pinnedRow}>
                    <Ionicons name="pin" size={12} color={color.warning} />
                    <Text style={styles.pinnedText}>{t('community.pinned')}</Text>
                  </View>
                )}

                <Text style={styles.threadTitle}>{thread.title}</Text>
                <Text style={styles.threadBody} numberOfLines={2}>{thread.body}</Text>

                <View style={styles.threadFooter}>
                  <View style={[styles.catBadge, { backgroundColor: `${categoryColors[thread.category] || color.textMuted}20` }]}>
                    <Text style={[styles.catBadgeText, { color: categoryColors[thread.category] || color.textMuted }]}>
                      {t(`community.category${thread.category.charAt(0).toUpperCase() + thread.category.slice(1)}`)}
                    </Text>
                  </View>
                  <Text style={styles.threadAuthor}>{thread.authorName}</Text>
                  <Text style={styles.threadDot}>{'\u00b7'}</Text>
                  <Text style={styles.threadTime}>{getTimeAgo(thread.createdAt)}</Text>
                  <View style={styles.threadStats}>
                    <Pressable
                      onPress={(e) => {
                        e.stopPropagation?.();
                        toggleLikeThread(thread.id);
                      }}
                      hitSlop={8}
                    >
                      <Ionicons name="heart-outline" size={13} color={color.textFaint} />
                    </Pressable>
                    <Text style={styles.threadStatNum}>{thread.likeCount}</Text>
                    <Ionicons name="chatbubble-outline" size={13} color={color.textFaint} />
                    <Text style={styles.threadStatNum}>{thread.replyCount}</Text>
                  </View>
                </View>

                {thread.isHot && (
                  <View style={styles.hotTag}>
                    <Ionicons name="flame" size={11} color={color.warning} />
                    <Text style={styles.hotTagText}>{t('community.hot')}</Text>
                  </View>
                )}
              </Pressable>
            ))
          )}
        </ScrollView>
      )}

      {/* FAB — New Post */}
      <Pressable style={styles.fab} onPress={() => setShowPostModal(true)}>
        <Ionicons name="add" size={24} color={color.text} />
      </Pressable>

      {/* ── New Post Modal ──────────────────────────────────── */}
      <Modal visible={showPostModal} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Pressable onPress={() => setShowPostModal(false)}>
                <Ionicons name="close" size={24} color={color.textMuted} />
              </Pressable>
              <Text style={styles.modalTitle}>{t('community.newDiscussion')}</Text>
              <Pressable
                style={[styles.postBtn, (!postTitle.trim() || !postBody.trim() || isPosting) && styles.postBtnDisabled]}
                onPress={handlePost}
                disabled={!postTitle.trim() || !postBody.trim() || isPosting}
              >
                <Text style={styles.postBtnText}>
                  {isPosting ? t('community.posting') : t('community.post')}
                </Text>
              </Pressable>
            </View>

            {/* Category picker */}
            <Text style={styles.inputLabel}>{t('community.postCategory')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catPickerRow}>
              {CATEGORIES.filter((c) => c.key !== 'all').map((cat) => {
                const isSelected = postCategory === cat.key;
                return (
                  <Pressable
                    key={cat.key}
                    style={[styles.catPickerChip, isSelected && { backgroundColor: cat.color, borderColor: cat.color }]}
                    onPress={() => setPostCategory(cat.key as DiscussionCategory)}
                  >
                    <Text style={[styles.catPickerText, isSelected && { color: color.text }]}>
                      {t(`community.category${cat.key.charAt(0).toUpperCase() + cat.key.slice(1)}`)}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <TextInput
              style={styles.titleInput}
              placeholder={t('community.postTitle')}
              placeholderTextColor={color.textFaint}
              value={postTitle}
              onChangeText={setPostTitle}
              maxLength={120}
            />
            <TextInput
              style={styles.bodyInput}
              placeholder={t('community.postBody')}
              placeholderTextColor={color.textFaint}
              value={postBody}
              onChangeText={setPostBody}
              multiline
              textAlignVertical="top"
              maxLength={2000}
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
    paddingBottom: 12,
  },
  backBtn: {
    padding: 4,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: color.text,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: color.textFaint,
    textAlign: 'center',
    paddingVertical: 40,
  },

  // Category filter
  categoryWrapper: {
    flexShrink: 0,
  },
  categoryRow: {
    paddingHorizontal: 16,
    gap: 8,
    paddingBottom: 14,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.xl,
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.border,
  },
  categoryChipActive: {
    backgroundColor: color.progress,
    borderColor: color.progress,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: color.textMuted,
  },
  categoryChipTextActive: {
    color: color.text,
  },

  // Thread list
  threadList: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  threadCard: {
    backgroundColor: color.surface,
    borderRadius: radius.md,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: color.border,
    position: 'relative',
  },
  pinnedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  pinnedText: {
    fontSize: 11,
    fontWeight: '600',
    color: color.warning,
  },
  threadTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: color.text,
    marginBottom: 6,
  },
  threadBody: {
    fontSize: 13,
    color: color.textMuted,
    lineHeight: 18,
    marginBottom: 10,
  },
  threadFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  catBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  catBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  threadAuthor: {
    fontSize: 12,
    color: color.textFaint,
  },
  threadDot: {
    fontSize: 12,
    color: color.textFaint,
  },
  threadTime: {
    fontSize: 12,
    color: color.textFaint,
  },
  threadStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 'auto',
  },
  threadStatNum: {
    fontSize: 12,
    color: color.textFaint,
    marginRight: 6,
  },
  hotTag: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: withAlpha(color.warning, 0.08),
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  hotTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: color.warning,
  },

  // FAB
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: color.progress,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: color.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: color.text,
  },
  postBtn: {
    backgroundColor: color.progress,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: radius.md,
  },
  postBtnDisabled: {
    opacity: 0.4,
  },
  postBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: color.text,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: color.textMuted,
    marginBottom: 8,
  },
  catPickerRow: {
    marginBottom: 16,
    maxHeight: 40,
  },
  catPickerChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.xl,
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.border,
    marginRight: 8,
  },
  catPickerText: {
    fontSize: 13,
    fontWeight: '600',
    color: color.textMuted,
  },
  titleInput: {
    backgroundColor: color.bg,
    borderRadius: radius.md,
    padding: 14,
    fontSize: 16,
    fontWeight: '600',
    color: color.text,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: color.border,
  },
  bodyInput: {
    backgroundColor: color.bg,
    borderRadius: radius.md,
    padding: 14,
    fontSize: 14,
    color: color.text,
    minHeight: 120,
    borderWidth: 1,
    borderColor: color.border,
  },
});

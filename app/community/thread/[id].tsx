import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useLocalizedContent } from '../../../src/hooks/useLocalizedContent';
import { useCommunityStore } from '../../../src/stores/communityStore';
import { color, radius } from '../../../src/theme/tokens';

const categoryColors: Record<string, string> = {
  general: color.textFaint,
  quran: color.progress,
  arabic: color.warning,
  prayer: color.accent,
  tips: color.warning,
};

export default function ThreadDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { lc } = useLocalizedContent();
  const scrollRef = useRef<ScrollView>(null);

  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);

  const {
    currentThread,
    replies,
    isLoadingReplies,
    loadThread,
    loadReplies,
    postReply,
    toggleLikeThread,
    toggleLikeReply,
  } = useCommunityStore();

  useEffect(() => {
    if (id) {
      loadThread(id);
      loadReplies(id);
    }
  }, [id]);

  const handleReply = async () => {
    if (!replyText.trim() || !id) return;
    setIsSending(true);
    await postReply(id, replyText.trim());
    setReplyText('');
    setIsSending(false);
    // Scroll to bottom after reply
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 200);
  };

  const getTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return t('community.justNow');
    if (mins < 60) return t('community.minutesAgo', { count: mins });
    const hours = Math.floor(mins / 60);
    if (hours < 24) return t('community.hoursAgo', { count: hours });
    return `${Math.floor(hours / 24)}d`;
  };

  if (!currentThread) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={color.text} />
          </Pressable>
          <Text style={styles.headerTitle}>{t('community.discussions')}</Text>
          <View style={{ width: 32 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={color.progress} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  const catColor = categoryColors[currentThread.category] || '#64748b';

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={color.text} />
        </Pressable>
        <View style={styles.headerCenter}>
          <View style={[styles.catDot, { backgroundColor: catColor }]} />
          <Text style={styles.headerTitle} numberOfLines={1}>
            {t(`community.category${currentThread.category.charAt(0).toUpperCase() + currentThread.category.slice(1)}`)}
          </Text>
        </View>
        <View style={{ width: 32 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
        keyboardVerticalOffset={90}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Thread */}
          <View style={styles.threadCard}>
            {currentThread.isPinned && (
              <View style={styles.pinnedRow}>
                <Ionicons name="pin" size={12} color={color.warning} />
                <Text style={styles.pinnedText}>{t('community.pinned')}</Text>
              </View>
            )}

            <Text style={styles.threadTitle}>{lc(currentThread.title, currentThread.titleFr)}</Text>
            <Text style={styles.threadBody}>{lc(currentThread.body, currentThread.bodyFr)}</Text>

            <View style={styles.threadMeta}>
              <Text style={styles.authorName}>{currentThread.authorName}</Text>
              <Text style={styles.dot}>{'\u00b7'}</Text>
              <Text style={styles.timeText}>{getTimeAgo(currentThread.createdAt)}</Text>
            </View>

            <View style={styles.threadActions}>
              <Pressable
                style={styles.actionBtn}
                onPress={() => toggleLikeThread(currentThread.id)}
              >
                <Ionicons name="heart-outline" size={18} color="#f43e5e" />
                <Text style={styles.actionCount}>{currentThread.likeCount}</Text>
              </Pressable>
              <View style={styles.actionBtn}>
                <Ionicons name="chatbubble-outline" size={18} color={color.progress} />
                <Text style={styles.actionCount}>{currentThread.replyCount}</Text>
              </View>
            </View>
          </View>

          {/* Replies */}
          <View style={styles.repliesSection}>
            <Text style={styles.repliesHeader}>
              {t('community.replies', { count: replies.length })}
            </Text>

            {isLoadingReplies ? (
              <ActivityIndicator color={color.progress} style={{ marginTop: 20 }} />
            ) : replies.length === 0 ? (
              <Text style={styles.emptyText}>{t('community.noRepliesYet')}</Text>
            ) : (
              replies.map((reply) => (
                <View key={reply.id} style={styles.replyCard}>
                  <View style={styles.replyHeader}>
                    <View style={styles.replyAvatar}>
                      <Text style={styles.replyAvatarText}>{reply.authorName.charAt(0)}</Text>
                    </View>
                    <View style={styles.replyMeta}>
                      <Text style={styles.replyAuthor}>{reply.authorName}</Text>
                      <Text style={styles.replyTime}>{getTimeAgo(reply.createdAt)}</Text>
                    </View>
                    <Pressable
                      style={styles.replyLikeBtn}
                      onPress={() => toggleLikeReply(reply.id)}
                    >
                      <Ionicons
                        name={reply.isLiked ? 'heart' : 'heart-outline'}
                        size={14}
                        color={reply.isLiked ? '#f43e5e' : '#64748b'}
                      />
                      {reply.likeCount > 0 && (
                        <Text style={[styles.replyLikeCount, reply.isLiked && { color: '#f43e5e' }]}>
                          {reply.likeCount}
                        </Text>
                      )}
                    </Pressable>
                  </View>
                  <Text style={styles.replyBody}>{reply.body}</Text>
                </View>
              ))
            )}
          </View>
        </ScrollView>

        {/* Reply input */}
        <View style={styles.replyInputContainer}>
          <TextInput
            style={styles.replyInput}
            placeholder={t('community.replyPlaceholder')}
            placeholderTextColor={color.textFaint}
            value={replyText}
            onChangeText={setReplyText}
            multiline
            maxLength={1000}
          />
          <Pressable
            style={[styles.sendBtn, (!replyText.trim() || isSending) && styles.sendBtnDisabled]}
            onPress={handleReply}
            disabled={!replyText.trim() || isSending}
          >
            {isSending ? (
              <ActivityIndicator color={color.text} size="small" />
            ) : (
              <Ionicons name="send" size={18} color={color.text} />
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.bg,
  },
  flex: {
    flex: 1,
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
    flex: 1,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: color.text,
  },
  catDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  emptyText: {
    fontSize: 14,
    color: color.textFaint,
    textAlign: 'center',
    paddingVertical: 20,
  },

  // Thread
  threadCard: {
    backgroundColor: color.surface,
    borderRadius: radius.lg,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: color.border,
  },
  pinnedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  pinnedText: {
    fontSize: 11,
    fontWeight: '600',
    color: color.warning,
  },
  threadTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: color.text,
    marginBottom: 10,
    lineHeight: 26,
  },
  threadBody: {
    fontSize: 15,
    color: color.textMuted,
    lineHeight: 22,
    marginBottom: 16,
  },
  threadMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 14,
  },
  authorName: {
    fontSize: 13,
    fontWeight: '600',
    color: color.text,
  },
  dot: {
    fontSize: 12,
    color: color.textFaint,
  },
  timeText: {
    fontSize: 12,
    color: color.textFaint,
  },
  threadActions: {
    flexDirection: 'row',
    gap: 20,
    borderTopWidth: 1,
    borderTopColor: color.border,
    paddingTop: 12,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionCount: {
    fontSize: 14,
    fontWeight: '600',
    color: color.textMuted,
  },

  // Replies
  repliesSection: {
    marginBottom: 20,
  },
  repliesHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: color.text,
    marginBottom: 14,
  },
  replyCard: {
    backgroundColor: color.surface,
    borderRadius: radius.md,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: color.border,
  },
  replyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  replyAvatar: {
    width: 32,
    height: 32,
    borderRadius: radius.lg,
    backgroundColor: color.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  replyAvatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: color.text,
  },
  replyMeta: {
    flex: 1,
  },
  replyAuthor: {
    fontSize: 13,
    fontWeight: '700',
    color: color.text,
  },
  replyTime: {
    fontSize: 11,
    color: color.textFaint,
  },
  replyLikeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 4,
  },
  replyLikeCount: {
    fontSize: 12,
    color: color.textFaint,
  },
  replyBody: {
    fontSize: 14,
    color: color.textMuted,
    lineHeight: 20,
  },

  // Reply input
  replyInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: color.surface,
    borderTopWidth: 1,
    borderTopColor: color.border,
    gap: 10,
  },
  replyInput: {
    flex: 1,
    backgroundColor: color.bg,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: color.text,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: color.border,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.xl,
    backgroundColor: color.progress,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.4,
  },
});

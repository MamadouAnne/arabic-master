import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useLocalizedContent } from '../../../src/hooks/useLocalizedContent';
import { localizeGoal } from '../../../src/data/community/goalLocalization';
import { useCommunityStore } from '../../../src/stores/communityStore';
import { useSettingsStore } from '../../../src/stores/settingsStore';
import { SIMULATED_GROUPS } from '../../../src/data/community/socialData';
import type { GroupMember, GroupMessage, GroupLeaderboardEntry, SharedContent } from '../../../src/data/community/socialData';
import {
  fetchGroupMessages,
  sendGroupMessage,
  subscribeToGroupMessages,
  fetchGroupMembers,
  updateMemberRole,
  removeMember,
  generateInviteCode,
  addReaction,
  removeReaction,
  fetchReactions,
  fetchGroupLeaderboard,
  fetchSessions,
  rsvpSession,
  createSession,
  fetchChallenges,
  createChallenge,
  sendVoiceMessage,
  uploadVoiceNote,
  subscribeToReactions,
  editGroupMessage,
  deleteGroupMessage,
  sendClassContent,
  updateClassContent,
  markGroupRead,
  subscribeToGroupPresence,
  GroupMessageRow,
  PresenceUser,
} from '../../../src/services/communitySocialService';
import { StudySession, GroupChallenge, MessageReaction } from '../../../src/types/community';
import { MessageBubble, MessageBubbleMessage } from '../../../src/components/community/MessageBubble';
import { MemberRow, MemberRowData } from '../../../src/components/community/MemberRow';
import { ChatInputBar } from '../../../src/components/community/ChatInputBar';
import { GroupInfoTab } from '../../../src/components/community/GroupInfoTab';
import { ReactionPicker } from '../../../src/components/community/ReactionPicker';
import { ReactionBadges } from '../../../src/components/community/ReactionBadges';
import { GroupLeaderboard } from '../../../src/components/community/GroupLeaderboard';
import { VoiceRecorder } from '../../../src/components/community/VoiceRecorder';
import { MessageActionSheet } from '../../../src/components/community/MessageActionSheet';
import { ReplyPreviewBar } from '../../../src/components/community/ReplyPreviewBar';
import { MentionAutocomplete } from '../../../src/components/community/MentionAutocomplete';
import { TypingIndicator } from '../../../src/components/community/TypingIndicator';
import { DateSeparator } from '../../../src/components/community/DateSeparator';
import { NewMessagesPill } from '../../../src/components/community/NewMessagesPill';
import { ImageLightbox } from '../../../src/components/community/ImageLightbox';
import { activeMentionQuery, applyMention } from '../../../src/components/community/chatText';
import { CreateContentSheet } from '../../../src/components/community/class/CreateContentSheet';
import { LessonEditor } from '../../../src/components/community/class/LessonEditor';
import { QuizEditor } from '../../../src/components/community/class/QuizEditor';
import { PollEditor } from '../../../src/components/community/class/PollEditor';
import { BoardEditor } from '../../../src/components/community/board/BoardEditor';
import type { ClassContent, ClassContentKind } from '../../../src/types/classContent';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { color, radius } from '../../../src/theme/tokens';
import { withAlpha } from '../../../src/components/ui/Primitives';

type Tab = 'chat' | 'members' | 'info';

type MappedMessage = GroupMessage & {
  isPinned?: boolean;
  audioUrl?: string;
  durationMs?: number;
  waveform?: number[] | null;
  imageUrl?: string;
  imageW?: number;
  imageH?: number;
  replyToId?: string | null;
  editedAt?: string | null;
  isDeleted?: boolean;
  classContent?: any | null;
};

// A chat list row is either a message or an injected date separator.
type ChatRow =
  | { kind: 'msg'; msg: MappedMessage; showAvatar: boolean }
  | { kind: 'date'; id: string; label: string };

function rowToMessage(row: GroupMessageRow): MappedMessage {
  return {
    id: row.id,
    userId: row.user_id,
    authorName: row.author_name,
    avatar: row.avatar || row.author_name.charAt(0).toUpperCase(),
    body: row.body,
    type: row.type as GroupMessage['type'],
    createdAt: row.created_at,
    audioUrl: row.audio_url,
    durationMs: row.duration_ms,
    waveform: row.waveform,
    imageUrl: row.image_url || undefined,
    imageW: row.image_w || undefined,
    imageH: row.image_h || undefined,
    replyToId: row.reply_to_id,
    editedAt: row.edited_at,
    isDeleted: row.is_deleted,
    mentions: row.mentions || undefined,
    sharedContent: row.shared_content || undefined,
    classContent: row.class_content || undefined,
  };
}

// Short label for date separators.
function dayLabel(dateStr: string): string {
  const d = new Date(dateStr);
  const today = new Date();
  const yest = new Date();
  yest.setDate(today.getDate() - 1);
  const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();
  if (sameDay(d, today)) return 'Today';
  if (sameDay(d, yest)) return 'Yesterday';
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: d.getFullYear() !== today.getFullYear() ? 'numeric' : undefined });
}

export default function GroupDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { lc, language } = useLocalizedContent();
  const flatListRef = useRef<FlatList>(null);

  const user = useSettingsStore((s) => s.user);
  const { groups, joinGroup, leaveGroup } = useCommunityStore();

  const [activeTab, setActiveTab] = useState<Tab>('chat');
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState<MappedMessage[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(true);
  const [memberSearch, setMemberSearch] = useState('');
  // FIX #7: seenIds cleared on group change via useEffect cleanup
  const seenIds = useRef(new Set<string>());
  const reactionSubRef = useRef<{ unsubscribe: () => void; addMessageId: (id: string) => void } | null>(null);

  // Feature state
  const [reactions, setReactions] = useState<Record<string, MessageReaction[]>>({});
  const [reactionPickerMsgId, setReactionPickerMsgId] = useState<string | null>(null);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [challenges, setChallenges] = useState<GroupChallenge[]>([]);
  const [leaderboard, setLeaderboard] = useState<GroupLeaderboardEntry[]>([]);
  const [memberTab, setMemberTab] = useState<'members' | 'leaderboard'>('members');
  const [isRecording, setIsRecording] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showChallengeModal, setShowChallengeModal] = useState(false);

  // Chat overhaul state
  const [replyingTo, setReplyingTo] = useState<MappedMessage | null>(null);
  const [editingMessage, setEditingMessage] = useState<MappedMessage | null>(null);
  const [actionSheetMsg, setActionSheetMsg] = useState<MappedMessage | null>(null);
  const [lightboxUri, setLightboxUri] = useState<string | null>(null);
  const [typingUsers, setTypingUsers] = useState<PresenceUser[]>([]);
  const [onlineIds, setOnlineIds] = useState<Set<string>>(new Set());
  const [unreadCount, setUnreadCount] = useState(0);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);
  const [hasMoreOlder, setHasMoreOlder] = useState(true);
  // Class content (lesson/quiz/poll) creation & editing
  const [showCreateSheet, setShowCreateSheet] = useState(false);
  const [editorKind, setEditorKind] = useState<ClassContentKind | null>(null);
  const [editorInitial, setEditorInitial] = useState<ClassContent | null>(null);
  const [editingClassMsgId, setEditingClassMsgId] = useState<string | null>(null);
  const [boardSeedText, setBoardSeedText] = useState<string | null>(null);
  const presenceRef = useRef<{ unsubscribe: () => void; setTyping: (t: boolean) => void } | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef(false);
  const isAtBottomRef = useRef(true);
  const pendingJumpRef = useRef(false); // keep chasing the bottom while a jump-to-latest is in flight

  // Find group
  const group = groups.find((g) => g.id === id) || SIMULATED_GROUPS.find((g) => g.id === id);
  const isJoined = group?.isJoined || false;
  const myMember = members.find((m) => m.userId === user?.id || m.id === user?.id);
  const myRole = myMember?.role || 'member';
  const isAdmin = myRole === 'admin';
  const isModerator = myRole === 'moderator';
  const canManage = isAdmin || isModerator;
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'You';

  // FIX #4: Memoized deduplication
  const dedupedMessages = useMemo(() => {
    const seen = new Set<string>();
    return messages.filter((m) => {
      if (seen.has(m.id)) return false;
      seen.add(m.id);
      return true;
    });
  }, [messages]);

  // Lookup for resolving reply previews.
  const messagesById = useMemo(() => {
    const map: Record<string, MappedMessage> = {};
    for (const m of dedupedMessages) map[m.id] = m;
    return map;
  }, [dedupedMessages]);

  // Build the render list: messages + injected date separators + avatar grouping.
  const chatRows = useMemo<ChatRow[]>(() => {
    const rows: ChatRow[] = [];
    let lastDay = '';
    dedupedMessages.forEach((msg, i) => {
      const day = new Date(msg.createdAt).toDateString();
      if (day !== lastDay) {
        rows.push({ kind: 'date', id: `date-${day}`, label: dayLabel(msg.createdAt) });
        lastDay = day;
      }
      const prev = i > 0 ? dedupedMessages[i - 1] : null;
      const prevSameDay = prev && new Date(prev.createdAt).toDateString() === day;
      const isChatty = (tp: string) => tp === 'chat' || tp === 'message' || tp === 'voice' || tp === 'image' || tp === 'shared';
      const showAvatar = !prev || !prevSameDay || prev.authorName !== msg.authorName || !isChatty(prev.type);
      rows.push({ kind: 'msg', msg, showAvatar });
    });
    return rows;
  }, [dedupedMessages]);

  // Recent text conversation, for AI "generate quiz from this chat".
  const chatContextText = useMemo(() => {
    const texts = dedupedMessages
      .filter((m) => (m.type === 'chat' || m.type === 'message') && !m.isDeleted && m.body.trim())
      .slice(-24)
      .map((m) => `${m.authorName}: ${m.body.trim()}`);
    return texts.join('\n').slice(-2400);
  }, [dedupedMessages]);

  const mentionQuery = useMemo(() => activeMentionQuery(messageText), [messageText]);

  // FIX #8: Memoized reaction groups
  const reactionGroupsMap = useMemo(() => {
    const map: Record<string, { emoji: string; count: number; hasReacted: boolean }[]> = {};
    for (const msgId of Object.keys(reactions)) {
      const msgReactions = reactions[msgId];
      const groups: Record<string, { emoji: string; count: number; hasReacted: boolean }> = {};
      for (const r of msgReactions) {
        if (!groups[r.emoji]) groups[r.emoji] = { emoji: r.emoji, count: 0, hasReacted: false };
        groups[r.emoji].count++;
        if (r.userId === user?.id) groups[r.emoji].hasReacted = true;
      }
      map[msgId] = Object.values(groups);
    }
    return map;
  }, [reactions, user?.id]);

  // FIX #8: Memoized filtered members
  const filteredMembers = useMemo(() => {
    if (!memberSearch.trim()) return members;
    const q = memberSearch.trim().toLowerCase();
    return members.filter((m) => m.name.toLowerCase().includes(q));
  }, [members, memberSearch]);

  const topContributorId = leaderboard.length > 0 ? leaderboard[0].userId : null;

  // FIX #6: Single parallelized load for all data
  useEffect(() => {
    if (!id) return;
    let unsubMessages: (() => void) | null = null;
    // FIX #7: Clear seenIds on group change
    seenIds.current.clear();

    (async () => {
      try {
        setIsLoadingMessages(true);
        setIsLoadingMembers(true);

        // Parallel fetch: messages, members, sessions, challenges, leaderboard
        const [rows, membersData, sessData, challData, lbData] = await Promise.all([
          fetchGroupMessages(id),
          fetchGroupMembers(id),
          fetchSessions(id),
          fetchChallenges(id),
          fetchGroupLeaderboard(id),
        ]);

        // Process messages
        const mapped = (rows || []).map(rowToMessage);
        mapped.forEach((m) => seenIds.current.add(m.id));

        if (mapped.length > 0) {
          setMessages(mapped);
          // Fetch reactions in parallel (needs message IDs)
          const reactionData = await fetchReactions(mapped.map((m) => m.id));
          setReactions(Object.keys(reactionData).length > 0 ? reactionData : {});
        } else {
          // FIX #9: Lazy-load simulated data only when needed
          const { SIMULATED_GROUP_MESSAGES, SIMULATED_REACTIONS } = require('../../../src/data/community/socialData');
          setMessages(SIMULATED_GROUP_MESSAGES[id] || []);
          setReactions(SIMULATED_REACTIONS);
        }
        setIsLoadingMessages(false);

        // Process members
        if (Array.isArray(membersData) && membersData.length > 0) {
          setMembers(membersData);
        } else {
          const { SIMULATED_GROUP_MEMBERS } = require('../../../src/data/community/socialData');
          setMembers(SIMULATED_GROUP_MEMBERS[id] || []);
        }
        setIsLoadingMembers(false);

        // Process sessions/challenges/leaderboard
        if (Array.isArray(sessData) && sessData.length > 0) setSessions(sessData);
        else {
          const { SIMULATED_SESSIONS } = require('../../../src/data/community/socialData');
          setSessions(SIMULATED_SESSIONS[id] || []);
        }
        if (Array.isArray(challData) && challData.length > 0) setChallenges(challData);
        else {
          const { SIMULATED_CHALLENGES } = require('../../../src/data/community/socialData');
          setChallenges(SIMULATED_CHALLENGES[id] || []);
        }
        if (Array.isArray(lbData) && lbData.length > 0) setLeaderboard(lbData);
        else {
          const { SIMULATED_GROUP_LEADERBOARD } = require('../../../src/data/community/socialData');
          setLeaderboard(SIMULATED_GROUP_LEADERBOARD[id] || []);
        }

        // Subscribe to new + updated messages
        unsubMessages = subscribeToGroupMessages(
          id,
          (newRow) => {
            if (seenIds.current.has(newRow.id)) return;
            seenIds.current.add(newRow.id);
            // Register new message ID with reaction subscription
            reactionSubRef.current?.addMessageId(newRow.id);
            const isMine = newRow.user_id === user?.id;
            setMessages((prev) => {
              if (prev.some((m) => m.id === newRow.id)) return prev;
              return [...prev, rowToMessage(newRow)];
            });
            // Track unread when not viewing the bottom of the chat.
            if (!isMine && !isAtBottomRef.current) setUnreadCount((c) => c + 1);
          },
          // UPDATE: edits, soft-deletes, pin toggles
          (updRow) => {
            setMessages((prev) => prev.map((m) => (m.id === updRow.id ? { ...m, ...rowToMessage(updRow) } : m)));
          }
        );

        // FIX #1: Subscribe to reactions scoped to this group's messages
        const msgIds = mapped.map((m) => m.id);
        const reactionSub = subscribeToReactions(id, msgIds, (payload) => {
          if (payload.eventType === 'INSERT' && payload.new) {
            const r = payload.new;
            setReactions((prev) => ({
              ...prev,
              [r.message_id]: [...(prev[r.message_id] || []), {
                id: r.id,
                messageId: r.message_id,
                userId: r.user_id,
                emoji: r.emoji,
                createdAt: r.created_at,
              }],
            }));
          } else if (payload.eventType === 'DELETE' && payload.old) {
            const r = payload.old;
            setReactions((prev) => ({
              ...prev,
              [r.message_id]: (prev[r.message_id] || []).filter((rx) => rx.id !== r.id),
            }));
          }
        });
        reactionSubRef.current = reactionSub;
      } catch (e) {
        if (__DEV__) console.warn('[GroupDetail] Load error:', e);
        // Fallback to simulated data on any error
        const { SIMULATED_GROUP_MESSAGES, SIMULATED_REACTIONS, SIMULATED_GROUP_MEMBERS, SIMULATED_SESSIONS, SIMULATED_CHALLENGES, SIMULATED_GROUP_LEADERBOARD } = require('../../../src/data/community/socialData');
        setMessages(SIMULATED_GROUP_MESSAGES[id] || []);
        setReactions(SIMULATED_REACTIONS);
        setMembers(SIMULATED_GROUP_MEMBERS[id] || []);
        setSessions(SIMULATED_SESSIONS[id] || []);
        setChallenges(SIMULATED_CHALLENGES[id] || []);
        setLeaderboard(SIMULATED_GROUP_LEADERBOARD[id] || []);
        setIsLoadingMessages(false);
        setIsLoadingMembers(false);
      }
    })();

    return () => {
      if (unsubMessages) unsubMessages();
      reactionSubRef.current?.unsubscribe();
      reactionSubRef.current = null;
    };
  }, [id]);

  // Presence + typing: track online roster and who is typing.
  useEffect(() => {
    if (!id || !user || !isJoined) return;
    const sub = subscribeToGroupPresence(
      id,
      { userId: user.id, name: displayName },
      (users) => {
        setOnlineIds(new Set(users.map((u) => u.userId)));
        const now = Date.now();
        setTypingUsers(users.filter((u) => u.typing && u.userId !== user.id && (!u.typingAt || now - u.typingAt < 6000)));
      }
    );
    presenceRef.current = sub;
    return () => {
      sub.unsubscribe();
      presenceRef.current = null;
    };
  }, [id, isJoined, user?.id]);

  // Mark the group read when opening the chat.
  useEffect(() => {
    if (id && user && isJoined) markGroupRead(id, user.id);
  }, [id, isJoined, user?.id]);

  // Reload members when join state changes
  useEffect(() => {
    if (!id || !isJoined) return;
    (async () => {
      const membersData = await fetchGroupMembers(id);
      if (membersData.length > 0) setMembers(membersData);
    })();
  }, [isJoined]);

  const scrollToEnd = useCallback(() => {
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  }, []);

  useEffect(() => {
    if (activeTab === 'chat') {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: false }), 100);
    }
  }, [activeTab]);

  // Resolve @mention tokens in the text to member user ids.
  const resolveMentions = useCallback((text: string): string[] => {
    const tokens = text.match(/@([\p{L}\p{N}._-]+)/gu) || [];
    const ids = new Set<string>();
    for (const tok of tokens) {
      const handle = tok.slice(1).toLowerCase();
      const m = members.find((mm) => mm.name.replace(/\s+/g, '').toLowerCase().startsWith(handle));
      if (m) ids.add(m.userId || m.id);
    }
    return Array.from(ids);
  }, [members]);

  const handleSend = useCallback(async () => {
    const text = messageText.trim();
    if (!text || isSending || !id || !user) return;

    // Edit mode: update the existing message instead of sending a new one.
    if (editingMessage) {
      const target = editingMessage;
      setEditingMessage(null);
      setMessageText('');
      setMessages((prev) => prev.map((m) => (m.id === target.id ? { ...m, body: text, editedAt: new Date().toISOString() } : m)));
      await editGroupMessage(target.id, text);
      return;
    }

    setIsSending(true);
    setMessageText('');
    isTypingRef.current = false;
    presenceRef.current?.setTyping(false);
    const replyId = replyingTo?.id || null;
    const mentions = resolveMentions(text);
    setReplyingTo(null);

    const sent = await sendGroupMessage(id, user.id, displayName, text, { replyToId: replyId, mentions });

    if (!sent) {
      const fallbackMsg: MappedMessage = {
        id: `local-${Date.now()}`,
        userId: user.id,
        authorName: displayName,
        avatar: displayName.charAt(0).toUpperCase(),
        body: text,
        type: 'message',
        createdAt: new Date().toISOString(),
        replyToId: replyId,
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    }
    setIsSending(false);
    scrollToEnd();
  }, [messageText, isSending, id, user, displayName, scrollToEnd, editingMessage, replyingTo, resolveMentions]);

  // Text change: broadcast typing (only on state transitions to avoid spamming presence).
  const handleChangeText = useCallback((text: string) => {
    setMessageText(text);
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      presenceRef.current?.setTyping(true);
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
      presenceRef.current?.setTyping(false);
    }, 3000);
  }, []);

  const handleSelectMention = useCallback((member: GroupMember) => {
    setMessageText((prev) => applyMention(prev, member.name));
  }, []);

  const handleJoinLeave = useCallback(() => {
    if (!id) return;
    if (isJoined) {
      Alert.alert(
        t('community.leaveGroup'),
        t('community.leaveGroupConfirm', { defaultValue: 'Are you sure you want to leave this group?' }),
        [
          { text: t('common.cancel', { defaultValue: 'Cancel' }), style: 'cancel' },
          { text: t('community.leaveGroup'), style: 'destructive', onPress: () => leaveGroup(id) },
        ]
      );
    } else {
      joinGroup(id);
    }
  }, [id, isJoined, t, leaveGroup, joinGroup]);

  const handleMemberAction = useCallback((member: GroupMember) => {
    if (!id || !canManage || member.userId === user?.id || member.id === user?.id) return;
    if (isModerator && member.role === 'admin') return;

    const buttons: any[] = [];
    if (isAdmin) {
      if (member.role === 'member') {
        buttons.push({ text: 'Make Moderator', onPress: async () => {
          await updateMemberRole(id, member.userId || member.id, 'moderator');
          setMembers((prev) => prev.map((m) => m.id === member.id ? { ...m, role: 'moderator' as const } : m));
        }});
      }
      if (member.role === 'moderator') {
        buttons.push({ text: 'Make Admin', onPress: async () => {
          await updateMemberRole(id, member.userId || member.id, 'admin');
          setMembers((prev) => prev.map((m) => m.id === member.id ? { ...m, role: 'admin' as const } : m));
        }});
        buttons.push({ text: 'Remove Moderator', onPress: async () => {
          await updateMemberRole(id, member.userId || member.id, 'member');
          setMembers((prev) => prev.map((m) => m.id === member.id ? { ...m, role: 'member' as const } : m));
        }});
      }
    }
    if (canManage && member.role !== 'admin') {
      buttons.push({ text: 'Remove from Group', style: 'destructive', onPress: async () => {
        await removeMember(id, member.userId || member.id);
        setMembers((prev) => prev.filter((m) => m.id !== member.id));
      }});
    }
    buttons.push({ text: t('common.cancel', { defaultValue: 'Cancel' }), style: 'cancel' });
    Alert.alert(member.name, `Role: ${member.role}`, buttons);
  }, [id, canManage, isAdmin, isModerator, user?.id, t]);

  const handleMessageLongPress = useCallback((msg: MappedMessage) => {
    if (msg.type === 'system' || msg.type === 'milestone' || msg.isDeleted) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setActionSheetMsg(msg);
  }, []);

  const handleCopyMessage = useCallback(async (msg: MappedMessage) => {
    await Clipboard.setStringAsync(msg.body || '');
  }, []);

  const handleStartEdit = useCallback((msg: MappedMessage) => {
    setReplyingTo(null);
    setEditingMessage(msg);
    setMessageText(msg.body);
  }, []);

  const handleStartReply = useCallback((msg: MappedMessage) => {
    setEditingMessage(null);
    setReplyingTo(msg);
  }, []);

  const handleDeleteMessage = useCallback((msg: MappedMessage) => {
    Alert.alert(
      t('community.deleteMessage', { defaultValue: 'Delete message?' }),
      t('community.deleteMessageConfirm', { defaultValue: 'This message will be removed for everyone.' }),
      [
        { text: t('common.cancel', { defaultValue: 'Cancel' }), style: 'cancel' },
        {
          text: t('common.delete', { defaultValue: 'Delete' }),
          style: 'destructive',
          onPress: async () => {
            setMessages((prev) => prev.map((m) => (m.id === msg.id ? { ...m, isDeleted: true, body: '' } : m)));
            await deleteGroupMessage(msg.id);
          },
        },
      ]
    );
  }, [t]);

  // Scroll to the original message when a reply quote is tapped.
  const handleReplyPress = useCallback((targetId: string) => {
    const idx = chatRows.findIndex((r) => r.kind === 'msg' && r.msg.id === targetId);
    if (idx >= 0) flatListRef.current?.scrollToIndex({ index: idx, animated: true, viewPosition: 0.5 });
  }, [chatRows]);

  const handleReaction = useCallback(async (emoji: string) => {
    if (!reactionPickerMsgId || !user) return;
    const msgId = reactionPickerMsgId;
    const existing = (reactions[msgId] || []).find((r) => r.userId === user.id && r.emoji === emoji);

    if (existing) {
      await removeReaction(msgId, user.id, emoji);
      setReactions((prev) => ({
        ...prev,
        [msgId]: (prev[msgId] || []).filter((r) => !(r.userId === user.id && r.emoji === emoji)),
      }));
    } else {
      await addReaction(msgId, user.id, emoji);
      const newReaction: MessageReaction = {
        id: `rx-${Date.now()}`,
        messageId: msgId,
        userId: user.id,
        emoji,
        createdAt: new Date().toISOString(),
      };
      setReactions((prev) => ({
        ...prev,
        [msgId]: [...(prev[msgId] || []), newReaction],
      }));
    }
  }, [reactionPickerMsgId, user, reactions]);

  // FIX #5: Stable callback for reaction toggling
  const handleToggleReaction = useCallback(async (msgId: string, emoji: string) => {
    if (!user) return;
    setReactions((prev) => {
      const existing = (prev[msgId] || []).find((r) => r.userId === user.id && r.emoji === emoji);
      if (existing) {
        removeReaction(msgId, user.id, emoji);
        return { ...prev, [msgId]: (prev[msgId] || []).filter((r) => !(r.userId === user.id && r.emoji === emoji)) };
      } else {
        addReaction(msgId, user.id, emoji);
        return { ...prev, [msgId]: [...(prev[msgId] || []), { id: `rx-${Date.now()}`, messageId: msgId, userId: user.id, emoji, createdAt: new Date().toISOString() }] };
      }
    });
  }, [user]);

  const handleVoiceSend = useCallback(async (uri: string, durationMs: number, waveform: number[]) => {
    if (!id || !user) { setIsRecording(false); return; }
    setIsRecording(false);

    const audioUrl = await uploadVoiceNote(id, user.id, uri);
    if (audioUrl) {
      const sent = await sendVoiceMessage(id, user.id, displayName, audioUrl, durationMs, waveform);
      if (sent) {
        seenIds.current.add(sent.id);
        reactionSubRef.current?.addMessageId(sent.id);
        setMessages((prev) => [...prev, rowToMessage(sent)]);
      }
    } else {
      const fallback: MappedMessage = {
        id: `local-voice-${Date.now()}`,
        userId: user.id,
        authorName: displayName,
        avatar: displayName.charAt(0).toUpperCase(),
        body: 'Voice note',
        type: 'voice' as any,
        createdAt: new Date().toISOString(),
        audioUrl: uri,
        durationMs,
        waveform,
      };
      setMessages((prev) => [...prev, fallback]);
    }
    scrollToEnd();
  }, [id, user, displayName, scrollToEnd]);

  const handleCreateSession = useCallback(async (title: string, description: string, scheduledAt: string, durationMinutes: number) => {
    if (!id || !user) return;
    const result = await createSession(id, user.id, displayName, title, description, scheduledAt, durationMinutes);
    if (result) {
      const newSession: StudySession = {
        id: result.id || `sess-${Date.now()}`,
        groupId: id, creatorId: user.id, creatorName: displayName,
        title, description, scheduledAt, durationMinutes,
        attendeeCount: 0, userRsvp: null, createdAt: new Date().toISOString(),
      };
      setSessions((prev) => [newSession, ...prev]);
    }
  }, [id, user, displayName]);

  const handleCreateChallenge = useCallback(async (title: string, targetType: string, targetValue: number, startDate: string, endDate: string) => {
    if (!id || !user) return;
    const result = await createChallenge(id, user.id, displayName, title, targetType, targetValue, startDate, endDate);
    if (result) {
      const newChallenge: GroupChallenge = {
        id: result.id || `ch-${Date.now()}`,
        groupId: id, creatorId: user.id, creatorName: displayName,
        title, targetType: targetType as any, targetValue,
        currentValue: 0, participantCount: 0,
        startDate, endDate, isActive: true, createdAt: new Date().toISOString(),
      };
      setChallenges((prev) => [newChallenge, ...prev]);
    }
  }, [id, user, displayName]);

  // "Practice together": spin up a 7-day group challenge from a shared item.
  const handlePracticeShared = useCallback(async (content: SharedContent) => {
    if (!id || !user) return;
    const label = content.translation || content.arabic || 'this';
    const title = t('community.practiceChallengeTitle', { defaultValue: 'Practice: {{item}}', item: label });
    const start = new Date().toISOString();
    const end = new Date(Date.now() + 7 * 24 * 3600000).toISOString();
    const memberTarget = Math.max(3, members.length || 3);
    const result = await createChallenge(id, user.id, displayName, title, 'custom', memberTarget, start, end);
    const newChallenge: GroupChallenge = {
      id: result?.id || `ch-${Date.now()}`,
      groupId: id, creatorId: user.id, creatorName: displayName,
      title, targetType: 'custom', targetValue: memberTarget,
      currentValue: 0, participantCount: 0,
      startDate: start, endDate: end, isActive: true, createdAt: new Date().toISOString(),
    };
    setChallenges((prev) => [newChallenge, ...prev]);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    Alert.alert(
      t('community.practiceStartedTitle', { defaultValue: 'Challenge started' }),
      t('community.practiceStartedBody', { defaultValue: 'The group can now practice "{{item}}" together this week.', item: label })
    );
  }, [id, user, displayName, members.length, t]);

  // ── Class content (lesson / quiz / poll) ──────────────────────
  const openCreateContent = useCallback((kind: ClassContentKind) => {
    setEditorInitial(null);
    setEditingClassMsgId(null);
    setBoardSeedText(null);
    setEditorKind(kind);
  }, []);

  // Long-press a text message → drop its text onto a fresh board to style/annotate.
  const handleOpenOnBoard = useCallback((msg: MappedMessage) => {
    setActionSheetMsg(null);
    setEditorInitial(null);
    setEditingClassMsgId(null);
    setBoardSeedText(msg.body);
    setEditorKind('board');
  }, []);

  const openEditClass = useCallback((msg: { id: string; classContent?: any }) => {
    if (!msg.classContent) return;
    setEditorInitial(msg.classContent);
    setEditingClassMsgId(msg.id);
    setEditorKind(msg.classContent.kind);
  }, []);

  const closeEditor = useCallback(() => {
    setEditorKind(null);
    setEditorInitial(null);
    setEditingClassMsgId(null);
    setBoardSeedText(null);
  }, []);

  const handleSaveClass = useCallback(async (content: ClassContent) => {
    if (!id || !user) { closeEditor(); return; }
    const editingId = editingClassMsgId;
    closeEditor();

    if (editingId) {
      // Edit existing content in place.
      setMessages((prev) => prev.map((m) => (m.id === editingId ? { ...m, classContent: content, body: (content as any).title || (content as any).question || m.body } : m)));
      await updateClassContent(editingId, content as any);
      return;
    }

    // Post new content.
    const sent = await sendClassContent(id, user.id, displayName, content.kind, content as any);
    if (sent) {
      seenIds.current.add(sent.id);
      reactionSubRef.current?.addMessageId(sent.id);
      setMessages((prev) => [...prev, rowToMessage(sent)]);
    } else {
      const fallback: MappedMessage = {
        id: `local-class-${Date.now()}`,
        userId: user.id,
        authorName: displayName,
        avatar: displayName.charAt(0).toUpperCase(),
        body: (content as any).title || (content as any).question || 'Class content',
        type: content.kind,
        createdAt: new Date().toISOString(),
        classContent: content,
      };
      setMessages((prev) => [...prev, fallback]);
    }
    scrollToEnd();
  }, [id, user, displayName, editingClassMsgId, closeEditor, scrollToEnd]);

  const handleRsvp = useCallback(async (sessionId: string, status: 'going' | 'not_going') => {
    if (!user) return;
    await rsvpSession(sessionId, user.id, status);
    setSessions((prev) => prev.map((s) =>
      s.id === sessionId
        ? { ...s, userRsvp: status, attendeeCount: status === 'going' ? s.attendeeCount + 1 : Math.max(0, s.attendeeCount - 1) }
        : s
    ));
  }, [user]);

  const handleGenerateInvite = useCallback(async () => {
    if (!id) return;
    const code = await generateInviteCode(id);
    if (code) setInviteCode(code);
  }, [id]);

  const getTimeAgo = useCallback((dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return t('community.justNow');
    if (mins < 60) return t('community.minutesAgo', { count: mins });
    const hours = Math.floor(mins / 60);
    if (hours < 24) return t('community.hoursAgo', { count: hours });
    return `${Math.floor(hours / 24)}d`;
  }, [t]);

  const getDaysAgo = useCallback((dateStr: string) => {
    const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / (24 * 3600000));
    if (days === 0) return 'today';
    if (days === 1) return '1 day ago';
    return `${days} days ago`;
  }, []);

  // FIX #3: FlatList renderItem for chat rows (messages + date separators)
  const renderMessage = useCallback(({ item }: { item: ChatRow }) => {
    if (item.kind === 'date') {
      return <DateSeparator label={item.label} />;
    }
    const msg = item.msg;
    const isMe = msg.userId === user?.id || msg.authorName === displayName;
    const reactionGroups = reactionGroupsMap[msg.id] || [];
    const replyTarget = msg.replyToId ? messagesById[msg.replyToId] : null;
    const bubbleMsg: MessageBubbleMessage = {
      ...(msg as MessageBubbleMessage),
      replyPreview: replyTarget
        ? { authorName: replyTarget.authorName, body: replyTarget.body, type: replyTarget.type }
        : msg.replyToId
          ? { authorName: '', body: 'Message', type: undefined }
          : null,
    };

    return (
      <MessageBubble
        msg={bubbleMsg}
        getTimeAgo={getTimeAgo}
        groupColor={group?.color || color.accent}
        isMe={isMe}
        showAvatar={item.showAvatar}
        onLongPress={() => handleMessageLongPress(msg)}
        onImagePress={setLightboxUri}
        onReplyPress={handleReplyPress}
        onPracticeShared={isJoined ? handlePracticeShared : undefined}
        groupId={id}
        currentUserId={user?.id}
        currentUserName={displayName}
        onEditClass={openEditClass}
        reactionRow={
          reactionGroups.length > 0 ? (
            <ReactionBadges
              reactions={reactionGroups}
              onToggle={(emoji) => handleToggleReaction(msg.id, emoji)}
            />
          ) : undefined
        }
      />
    );
  }, [user?.id, displayName, reactionGroupsMap, messagesById, group?.color, getTimeAgo, handleMessageLongPress, handleToggleReaction, handleReplyPress, handlePracticeShared, isJoined, id, openEditClass]);

  const keyExtractor = useCallback((item: ChatRow) => (item.kind === 'date' ? item.id : item.msg.id), []);

  // Track whether the user is near the bottom, to decide unread/pill behavior.
  const handleScroll = useCallback((e: any) => {
    const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
    const distanceFromBottom = contentSize.height - (contentOffset.y + layoutMeasurement.height);
    const atBottom = distanceFromBottom < 80;
    isAtBottomRef.current = atBottom;
    setIsAtBottom(atBottom);
    if (atBottom) pendingJumpRef.current = false; // reached bottom — stop chasing
    if (atBottom && unreadCount > 0) {
      setUnreadCount(0);
      if (id && user) markGroupRead(id, user.id);
    }
  }, [unreadCount, id, user]);

  const jumpToLatest = useCallback(() => {
    const list = flatListRef.current;
    if (!list) return;
    // Tall quiz/board rows below the fold render/measure only as we approach them,
    // so one scrollToEnd lands short. Set a "jump pending" flag: onContentSizeChange
    // keeps re-scrolling to the growing bottom until handleScroll confirms we're there.
    pendingJumpRef.current = true;
    setIsAtBottom(true);
    list.scrollToEnd({ animated: true });
    // Safety net: stop chasing after a second even if we never register at-bottom.
    setTimeout(() => { pendingJumpRef.current = false; }, 1200);
    setUnreadCount(0);
    if (id && user) markGroupRead(id, user.id);
  }, [id, user]);

  // Load older messages when scrolling to the top.
  const loadOlder = useCallback(async () => {
    if (!id || isLoadingOlder || !hasMoreOlder || dedupedMessages.length === 0) return;
    const oldest = dedupedMessages[0];
    if (!oldest || oldest.id.startsWith('local-')) return;
    setIsLoadingOlder(true);
    const older = await fetchGroupMessages(id, { before: oldest.createdAt, limit: 30 });
    if (older.length === 0) setHasMoreOlder(false);
    else {
      const mapped = older.map(rowToMessage).filter((m) => !seenIds.current.has(m.id));
      mapped.forEach((m) => seenIds.current.add(m.id));
      if (mapped.length === 0) setHasMoreOlder(false);
      else setMessages((prev) => [...mapped, ...prev]);
    }
    setIsLoadingOlder(false);
  }, [id, isLoadingOlder, hasMoreOlder, dedupedMessages]);

  if (!group) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={color.text} />
          </Pressable>
          <Text style={styles.headerTitle}>{t('community.studyGroups')}</Text>
          <View style={{ width: 32 }} />
        </View>
        <View style={styles.centered}>
          <ActivityIndicator color={color.accent} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.headerTopRow}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={color.text} />
        </Pressable>
        <Text style={styles.headerTopTitle} numberOfLines={1}>{t('community.studyGroups')}</Text>
        {isJoined ? (
          <Pressable
            onPress={() => setActiveTab((prev) => (prev === 'chat' ? 'info' : 'chat'))}
            style={styles.backBtn}
            accessibilityLabel={t('community.groupSettings', { defaultValue: 'Group settings' })}
          >
            <Ionicons name={activeTab === 'chat' ? 'settings-outline' : 'close'} size={22} color={color.text} />
          </Pressable>
        ) : (
          <View style={{ width: 32 }} />
        )}
      </View>

      <View style={styles.headerGroupInfo}>
        <View style={[styles.headerIcon, { backgroundColor: `${group.color}20` }]}>
          <Ionicons name={group.icon as any} size={22} color={group.color} />
        </View>
        <View style={styles.headerInfoBlock}>
          <Text style={styles.headerTitle} numberOfLines={2}>{lc(group.name, group.nameFr)}</Text>
          <View style={styles.headerSubRow}>
            <Ionicons name="people" size={13} color={color.textMuted} />
            <Text style={styles.headerSub}>
              {t('community.members', { count: group.memberCount })}
            </Text>
            {group.isActive && (
              <>
                <View style={styles.headerActiveDot} />
                <Text style={styles.headerActiveText}>{t('community.activeNow')}</Text>
              </>
            )}
          </View>
        </View>
        <Pressable
          style={[styles.headerAction, isJoined ? styles.headerActionLeave : null]}
          onPress={handleJoinLeave}
        >
          <Text style={[styles.headerActionText, isJoined ? styles.headerActionTextLeave : null]}>
            {isJoined ? t('community.leaveGroup') : t('community.joinGroup')}
          </Text>
        </Pressable>
      </View>

      {/* Non-member preview */}
      {!isJoined ? (
        <ScrollView contentContainerStyle={styles.previewContent} showsVerticalScrollIndicator={false}>
          <View style={styles.previewCard}>
            <View style={[styles.previewIconLarge, { backgroundColor: `${group.color}20` }]}>
              <Ionicons name={group.icon as any} size={40} color={group.color} />
            </View>
            <Text style={styles.previewName}>{lc(group.name, group.nameFr)}</Text>
            <Text style={styles.previewTopic}>{lc(group.topic, group.topicFr)}</Text>
            <Text style={styles.previewDesc}>{lc(group.description, group.descriptionFr)}</Text>
          </View>

          <View style={styles.previewStatsRow}>
            <View style={styles.previewStat}>
              <Ionicons name="people" size={18} color={color.accent} />
              <Text style={styles.previewStatValue}>{group.memberCount}</Text>
              <Text style={styles.previewStatLabel}>{t('community.groupMembers')}</Text>
            </View>
            <View style={styles.previewStat}>
              <Ionicons name="flag" size={18} color={color.progress} />
              <Text style={styles.previewStatValue}>{group.maxMembers}</Text>
              <Text style={styles.previewStatLabel}>{t('community.max')}</Text>
            </View>
          </View>

          {group.goal ? (
            <View style={styles.previewGoal}>
              <Ionicons name="flag-outline" size={16} color={group.color} />
              <Text style={styles.previewGoalText}>{localizeGoal(lc(group.goal, group.goalFr), language)}</Text>
            </View>
          ) : null}

          <Pressable style={[styles.previewJoinBtn, { backgroundColor: group.color }]} onPress={() => joinGroup(id!)}>
            <Ionicons name="people" size={20} color={color.text} />
            <Text style={styles.previewJoinText}>{t('community.joinGroup')}</Text>
          </Pressable>

          <Text style={styles.previewHint}>{t('community.joinToSeeMessages')}</Text>
        </ScrollView>
      ) : (
      <>
      {/* Settings sub-header (shown when viewing About / Members) */}
      {activeTab !== 'chat' && (
        <View style={styles.settingsHeader}>
          <Pressable onPress={() => setActiveTab('chat')} style={styles.settingsBackBtn}>
            <Ionicons name="chevron-back" size={20} color={group.color} />
            <Text style={[styles.settingsBackText, { color: group.color }]}>
              {t('community.backToChat', { defaultValue: 'Chat' })}
            </Text>
          </Pressable>
          <View style={styles.settingsSeg}>
            <Pressable
              style={[styles.settingsSegBtn, activeTab === 'info' && { backgroundColor: `${group.color}25` }]}
              onPress={() => setActiveTab('info')}
            >
              <Text style={[styles.settingsSegText, activeTab === 'info' && { color: group.color }]}>
                {t('community.groupInfo')}
              </Text>
            </Pressable>
            <Pressable
              style={[styles.settingsSegBtn, activeTab === 'members' && { backgroundColor: `${group.color}25` }]}
              onPress={() => setActiveTab('members')}
            >
              <Text style={[styles.settingsSegText, activeTab === 'members' && { color: group.color }]}>
                {t('community.groupMembers')}
              </Text>
            </Pressable>
          </View>
        </View>
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
        keyboardVerticalOffset={90}
      >
        {/* ── Chat tab ────────────────────────────────────── */}
        {activeTab === 'chat' && (
          <>
            {isLoadingMessages ? (
              <View style={styles.centered}>
                <ActivityIndicator color={group.color} size="large" />
              </View>
            ) : (
              <View style={styles.flex}>
                {/* FIX #3: FlatList with virtualization instead of ScrollView */}
                <FlatList
                  ref={flatListRef}
                  data={chatRows}
                  renderItem={renderMessage}
                  keyExtractor={keyExtractor}
                  contentContainerStyle={styles.chatList}
                  showsVerticalScrollIndicator={false}
                  onScroll={handleScroll}
                  scrollEventThrottle={16}
                  onContentSizeChange={() => { if (isAtBottomRef.current || pendingJumpRef.current) flatListRef.current?.scrollToEnd({ animated: false }); }}
                  onScrollToIndexFailed={() => {}}
                  onStartReached={loadOlder}
                  onStartReachedThreshold={0.2}
                  ListHeaderComponent={isLoadingOlder ? <ActivityIndicator color={group.color} style={{ marginVertical: 12 }} /> : null}
                  maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
                  removeClippedSubviews={false}
                  initialNumToRender={12}
                  maxToRenderPerBatch={10}
                  updateCellsBatchingPeriod={50}
                  windowSize={11}
                />

                {typingUsers.length > 0 && (
                  <TypingIndicator names={typingUsers.map((u) => u.name)} groupColor={group.color} />
                )}

                {!isAtBottom && (
                  <NewMessagesPill count={unreadCount} groupColor={group.color} onPress={jumpToLatest} />
                )}
              </View>
            )}

            {/* Mention autocomplete (above input while typing @) */}
            {mentionQuery !== null && !editingMessage && (
              <MentionAutocomplete
                members={members}
                query={mentionQuery}
                groupColor={group.color}
                onSelect={handleSelectMention}
              />
            )}

            {/* Reply preview (above input) */}
            {replyingTo && (
              <ReplyPreviewBar
                target={{ id: replyingTo.id, authorName: replyingTo.authorName, body: replyingTo.body, type: replyingTo.type }}
                groupColor={group.color}
                onCancel={() => setReplyingTo(null)}
              />
            )}

            {isRecording ? (
              <VoiceRecorder
                onSend={handleVoiceSend}
                onCancel={() => setIsRecording(false)}
              />
            ) : (
              <ChatInputBar
                isJoined={isJoined}
                messageText={messageText}
                onChangeText={handleChangeText}
                onSend={handleSend}
                isSending={isSending}
                placeholder={t('community.messagePlaceholder')}
                joinLabel={t('community.joinGroup')}
                onMicPress={() => setIsRecording(true)}
                isRecording={isRecording}
                editing={!!editingMessage}
                onCancelEdit={() => { setEditingMessage(null); setMessageText(''); }}
                onCreate={() => setShowCreateSheet(true)}
                groupColor={group.color}
              />
            )}

            {reactionPickerMsgId && (
              <ReactionPicker
                onSelect={handleReaction}
                onClose={() => setReactionPickerMsgId(null)}
              />
            )}
          </>
        )}

        {/* ── Members tab ─────────────────────────────────── */}
        {activeTab === 'members' && (
          <>
            <View style={styles.segmentedControl}>
              <Pressable
                style={[styles.segment, memberTab === 'members' && { backgroundColor: `${group.color}25` }]}
                onPress={() => setMemberTab('members')}
              >
                <Text style={[styles.segmentText, memberTab === 'members' && { color: group.color }]}>
                  {t('community.allMembers', { defaultValue: 'All Members' })}
                </Text>
              </Pressable>
              <Pressable
                style={[styles.segment, memberTab === 'leaderboard' && { backgroundColor: `${group.color}25` }]}
                onPress={() => setMemberTab('leaderboard')}
              >
                <Ionicons name="trophy" size={14} color={memberTab === 'leaderboard' ? group.color: color.textFaint} />
                <Text style={[styles.segmentText, memberTab === 'leaderboard' && { color: group.color }]}>
                  {t('community.groupLeaderboard', { defaultValue: 'Leaderboard' })}
                </Text>
              </Pressable>
            </View>

            {memberTab === 'members' ? (
              <>
                <View style={styles.memberSearchBar}>
                  <Ionicons name="search" size={16} color={color.textFaint} />
                  <TextInput
                    style={styles.memberSearchInput}
                    placeholder={t('community.searchMembers')}
                    placeholderTextColor={color.textFaint}
                    value={memberSearch}
                    onChangeText={setMemberSearch}
                    autoCorrect={false}
                  />
                  {memberSearch.length > 0 && (
                    <Pressable onPress={() => setMemberSearch('')}>
                      <Ionicons name="close-circle" size={16} color={color.textFaint} />
                    </Pressable>
                  )}
                </View>

                <ScrollView contentContainerStyle={styles.membersList} showsVerticalScrollIndicator={false}>
                  {isLoadingMembers ? (
                    <View style={styles.centered}>
                      <ActivityIndicator color={group.color} size="large" />
                    </View>
                  ) : filteredMembers.length === 0 ? (
                    <Text style={styles.emptyMembersText}>{t('community.noMembersFound')}</Text>
                  ) : (
                    filteredMembers.map((member) => (
                      <MemberRow
                        key={member.id}
                        member={{ ...member, isTopContributor: member.userId === topContributorId || member.id === topContributorId } as MemberRowData}
                        groupColor={group.color}
                        getDaysAgo={getDaysAgo}
                        canManage={canManage}
                        onAction={() => handleMemberAction(member)}
                      />
                    ))
                  )}
                </ScrollView>
              </>
            ) : (
              <ScrollView contentContainerStyle={styles.membersList} showsVerticalScrollIndicator={false}>
                <GroupLeaderboard
                  entries={leaderboard}
                  groupColor={group.color}
                  currentUserId={user?.id}
                />
              </ScrollView>
            )}
          </>
        )}

        {/* ── Info tab ────────────────────────────────────── */}
        {activeTab === 'info' && (
          <ScrollView contentContainerStyle={styles.infoContent} showsVerticalScrollIndicator={false}>
            <GroupInfoTab
              group={group}
              messages={messages}
              sessions={sessions}
              challenges={challenges}
              getDaysAgo={getDaysAgo}
              t={t}
              canManage={canManage}
              inviteCode={inviteCode}
              onGenerateInvite={handleGenerateInvite}
              onRsvpSession={handleRsvp}
              onCreateSession={() => setShowSessionModal(true)}
              onCreateChallenge={() => setShowChallengeModal(true)}
            />
          </ScrollView>
        )}
      </KeyboardAvoidingView>
      </>
      )}

      {/* FIX #10: Only render modals when visible */}
      {showSessionModal && (
        <CreateSessionModalLazy
          visible={showSessionModal}
          onClose={() => setShowSessionModal(false)}
          onCreate={handleCreateSession}
          groupColor={group?.color || color.accent}
        />
      )}
      {showChallengeModal && (
        <CreateChallengeModalLazy
          visible={showChallengeModal}
          onClose={() => setShowChallengeModal(false)}
          onCreate={handleCreateChallenge}
          groupColor={group?.color || color.accent}
        />
      )}

      {/* Message long-press actions */}
      {actionSheetMsg && (() => {
        const m = actionSheetMsg;
        const isMine = m.userId === user?.id || m.authorName === displayName;
        const isText = m.type === 'chat' || m.type === 'message';
        return (
          <MessageActionSheet
            visible={!!actionSheetMsg}
            groupColor={group?.color || color.accent}
            actions={{
              canReply: true,
              canReact: true,
              canCopy: isText && !!m.body,
              canBoard: isText && !!m.body.trim(),
              canPin: false,
              isPinned: false,
              canEdit: isMine && isText,
              canDelete: isMine || canManage,
            }}
            onReact={(emoji) => handleToggleReaction(m.id, emoji)}
            onReply={() => handleStartReply(m)}
            onCopy={() => handleCopyMessage(m)}
            onBoard={() => handleOpenOnBoard(m)}
            onPinToggle={() => {}}
            onEdit={() => handleStartEdit(m)}
            onDelete={() => handleDeleteMessage(m)}
            onClose={() => setActionSheetMsg(null)}
          />
        );
      })()}

      <ImageLightbox uri={lightboxUri} onClose={() => setLightboxUri(null)} />

      {/* Class content creation */}
      <CreateContentSheet
        visible={showCreateSheet}
        groupColor={group?.color || color.accent}
        onSelect={openCreateContent}
        onClose={() => setShowCreateSheet(false)}
      />
      {editorKind === 'lesson' && (
        <LessonEditor
          visible
          groupColor={group?.color || color.accent}
          initial={editorInitial?.kind === 'lesson' ? editorInitial : null}
          onSave={handleSaveClass}
          onClose={closeEditor}
        />
      )}
      {editorKind === 'quiz' && (
        <QuizEditor
          visible
          groupColor={group?.color || color.accent}
          initial={editorInitial?.kind === 'quiz' ? editorInitial : null}
          chatContext={chatContextText}
          onSave={handleSaveClass}
          onClose={closeEditor}
        />
      )}
      {editorKind === 'poll' && (
        <PollEditor
          visible
          groupColor={group?.color || color.accent}
          initial={editorInitial?.kind === 'poll' ? editorInitial : null}
          onSave={handleSaveClass}
          onClose={closeEditor}
        />
      )}
      {editorKind === 'board' && (
        <BoardEditor
          visible
          groupColor={group?.color || color.accent}
          initial={editorInitial?.kind === 'board' ? editorInitial : null}
          seedText={boardSeedText}
          onSave={handleSaveClass}
          onClose={closeEditor}
        />
      )}
    </SafeAreaView>
  );
}

// FIX #10: Lazy-loaded modal wrappers
function CreateSessionModalLazy(props: any) {
  const { CreateSessionModal } = require('../../../src/components/community/CreateSessionModal');
  return <CreateSessionModal {...props} />;
}

function CreateChallengeModalLazy(props: any) {
  const { CreateChallengeModal } = require('../../../src/components/community/CreateChallengeModal');
  return <CreateChallengeModal {...props} />;
}

// ── Styles ────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: color.bg },
  flex: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // Header
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 4 },
  headerTopRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 4 },
  backBtn: { padding: 4 },
  headerTopTitle: { flex: 1, textAlign: 'center', fontSize: 15, fontWeight: '600', color: color.textMuted },
  headerGroupInfo: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 14, gap: 12 },
  headerIcon: { width: 42, height: 42, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  headerInfoBlock: { flex: 1 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: color.text },
  headerSubRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  headerSub: { fontSize: 12, color: color.textMuted },
  headerActiveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: color.progress, marginLeft: 4 },
  headerActiveText: { fontSize: 12, color: color.progress, fontWeight: '500' },
  headerAction: { flexDirection: 'row', alignItems: 'center', backgroundColor: color.accent, paddingHorizontal: 12, paddingVertical: 7, borderRadius: radius.sm },
  headerActionLeave: { backgroundColor: withAlpha(color.danger, 0.13), borderWidth: 1, borderColor: color.danger },
  headerActionText: { fontSize: 13, fontWeight: '600', color: color.text },
  headerActionTextLeave: { color: color.danger },

  // Tab bar
  tabBar: { flexDirection: 'row', paddingHorizontal: 16, gap: 4, marginBottom: 4 },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3, paddingVertical: 8, paddingHorizontal: 4, borderRadius: radius.sm, backgroundColor: color.surface },
  tabActive: { backgroundColor: color.surfaceRaised },
  tabText: { fontSize: 11, fontWeight: '600', color: color.textFaint, textAlign: 'center' },
  settingsHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 4 },
  settingsBackBtn: { flexDirection: 'row', alignItems: 'center', gap: 2, paddingVertical: 4, paddingRight: 4 },
  settingsBackText: { fontSize: 14, fontWeight: '600' },
  settingsSeg: { flex: 1, flexDirection: 'row', gap: 4, backgroundColor: color.surface, borderRadius: radius.md, padding: 3 },
  settingsSegBtn: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 8, borderRadius: radius.sm },
  settingsSegText: { fontSize: 13, fontWeight: '600', color: color.textFaint },

  // Chat
  chatList: { paddingHorizontal: 12, paddingVertical: 12, paddingBottom: 8 },

  // Segmented control
  segmentedControl: { flexDirection: 'row', marginHorizontal: 16, marginTop: 8, marginBottom: 4, gap: 4, backgroundColor: color.surface, borderRadius: radius.sm, padding: 3 },
  segment: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 8, borderRadius: radius.sm },
  segmentText: { fontSize: 13, fontWeight: '600', color: color.textFaint },

  // Members
  memberSearchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: color.surface, borderRadius: radius.sm, marginHorizontal: 16, marginTop: 8, marginBottom: 4, paddingHorizontal: 10, paddingVertical: 8, gap: 6, borderWidth: 1, borderColor: color.border },
  memberSearchInput: { flex: 1, fontSize: 14, color: color.text, padding: 0 },
  emptyMembersText: { fontSize: 14, color: color.textFaint, textAlign: 'center', paddingVertical: 24 },
  membersList: { paddingHorizontal: 16, paddingVertical: 8 },

  // Info
  infoContent: { paddingHorizontal: 16, paddingVertical: 12, paddingBottom: 40 },

  // Non-member preview
  previewContent: { paddingHorizontal: 20, paddingVertical: 16, paddingBottom: 40, alignItems: 'center' },
  previewCard: { backgroundColor: color.surface, borderRadius: radius.xl, padding: 28, alignItems: 'center', borderWidth: 1, borderColor: color.border, width: '100%', marginBottom: 16 },
  previewIconLarge: { width: 72, height: 72, borderRadius: radius.xl, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  previewName: { fontSize: 22, fontWeight: '700', color: color.text, marginBottom: 6, textAlign: 'center' },
  previewTopic: { fontSize: 14, fontWeight: '600', color: color.textMuted, marginBottom: 12 },
  previewDesc: { fontSize: 14, color: color.textFaint, lineHeight: 21, textAlign: 'center' },
  previewStatsRow: { flexDirection: 'row', gap: 12, width: '100%', marginBottom: 16 },
  previewStat: { flex: 1, backgroundColor: color.surface, borderRadius: radius.md, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: color.border },
  previewStatValue: { fontSize: 20, fontWeight: '700', color: color.text, marginTop: 6 },
  previewStatLabel: { fontSize: 11, color: color.textFaint, marginTop: 2 },
  previewGoal: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: color.surface, borderRadius: radius.md, padding: 16, width: '100%', marginBottom: 24, borderWidth: 1, borderColor: color.border },
  previewGoalText: { fontSize: 14, fontWeight: '600', color: color.text, flex: 1 },
  previewJoinBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, width: '100%', paddingVertical: 16, borderRadius: radius.md },
  previewJoinText: { fontSize: 16, fontWeight: '700', color: color.text },
  previewHint: { fontSize: 13, color: color.textFaint, textAlign: 'center', marginTop: 12 },
});

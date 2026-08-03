import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Image, GestureResponderEvent } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import type { AudioPlayer } from 'expo-audio';
import type { SharedContent } from '../../data/community/socialData';
import { SharedContentCard } from './SharedContentCard';
import { LessonCard } from './class/LessonCard';
import { QuizCard } from './class/QuizCard';
import { PollCard } from './class/PollCard';
import { BoardCard } from './board/BoardCard';
import { renderMessageText, isPredominantlyArabic } from './chatText';

export interface MessageBubbleMessage {
  id: string;
  userId?: string;
  authorName: string;
  avatar: string;
  body: string;
  type: 'message' | 'milestone' | 'system' | 'chat' | 'voice' | 'image' | 'shared' | 'lesson' | 'quiz' | 'poll' | 'board';
  createdAt: string;
  audioUrl?: string;
  durationMs?: number;
  waveform?: number[] | null;
  isPinned?: boolean;
  // overhaul fields
  replyToId?: string | null;
  replyPreview?: { authorName: string; body: string; type?: string } | null;
  editedAt?: string | null;
  isDeleted?: boolean;
  imageUrl?: string;
  imageW?: number;
  imageH?: number;
  sharedContent?: SharedContent | null;
  classContent?: any | null;
}

interface Props {
  msg: MessageBubbleMessage;
  getTimeAgo: (d: string) => string;
  groupColor: string;
  isMe: boolean;
  showAvatar: boolean;
  onLongPress?: () => void;
  onImagePress?: (uri: string) => void;
  onReplyPress?: (id: string) => void;
  onPracticeShared?: (content: SharedContent) => void;
  // class content
  groupId?: string;
  currentUserId?: string;
  currentUserName?: string;
  onEditClass?: (msg: MessageBubbleMessage) => void;
  reactionRow?: React.ReactNode;
}

function ReplyQuote({ preview, groupColor, isMe, onPress }: { preview: NonNullable<MessageBubbleMessage['replyPreview']>; groupColor: string; isMe: boolean; onPress?: () => void }) {
  const snippet = preview.type === 'voice' ? '🎤 Voice note' : preview.type === 'image' ? '📷 Photo' : preview.type === 'shared' ? '📖 Shared content' : preview.body;
  return (
    <Pressable onPress={onPress} style={[styles.replyQuote, { borderLeftColor: isMe ? 'rgba(255,255,255,0.6)' : groupColor }]}>
      <Text style={[styles.replyAuthor, { color: isMe ? 'rgba(255,255,255,0.9)' : groupColor }]} numberOfLines={1}>{preview.authorName}</Text>
      <Text style={[styles.replySnippet, isMe && { color: 'rgba(255,255,255,0.7)' }]} numberOfLines={1}>{snippet}</Text>
    </Pressable>
  );
}

export const MessageBubble = React.memo(function MessageBubble({ msg, getTimeAgo, groupColor, isMe, showAvatar, onLongPress, onImagePress, onReplyPress, onPracticeShared, groupId, currentUserId, currentUserName, onEditClass, reactionRow }: Props) {
  // Class content (lesson / quiz / poll / board) renders full-width, not as a chat bubble.
  if ((msg.type === 'lesson' || msg.type === 'quiz' || msg.type === 'poll' || msg.type === 'board') && msg.classContent && !msg.isDeleted) {
    return (
      <Pressable style={styles.classRow} onLongPress={onLongPress} delayLongPress={300}>
        {msg.type === 'board' && (
          <BoardCard
            board={msg.classContent}
            groupColor={groupColor}
            authorName={msg.authorName}
            canEdit={isMe}
            onEdit={() => onEditClass?.(msg)}
            onLongPress={onLongPress}
          />
        )}
        {msg.type === 'lesson' && (
          <LessonCard
            lesson={msg.classContent}
            groupColor={groupColor}
            authorName={msg.authorName}
            canEdit={isMe}
            onEdit={() => onEditClass?.(msg)}
          />
        )}
        {msg.type === 'quiz' && (
          <QuizCard
            messageId={msg.id}
            groupId={groupId || ''}
            quiz={msg.classContent}
            groupColor={groupColor}
            authorName={msg.authorName}
            userId={currentUserId}
            userName={currentUserName || 'You'}
            isAuthor={isMe}
          />
        )}
        {msg.type === 'poll' && (
          <PollCard
            messageId={msg.id}
            groupId={groupId || ''}
            poll={msg.classContent}
            groupColor={groupColor}
            authorName={msg.authorName}
            userId={currentUserId}
            userName={currentUserName || 'You'}
          />
        )}
        {reactionRow}
      </Pressable>
    );
  }

  if (msg.type === 'system') {
    return (
      <View style={styles.systemMsg}>
        <Text style={styles.systemMsgText}>{msg.body}</Text>
      </View>
    );
  }

  if (msg.type === 'milestone') {
    return (
      <View style={[styles.milestoneMsg, { borderColor: `${groupColor}40` }]}>
        <Ionicons name="trophy" size={16} color={groupColor} />
        <Text style={[styles.milestoneMsgText, { color: groupColor }]}>{msg.body}</Text>
      </View>
    );
  }

  if (msg.type === 'voice' && !msg.isDeleted) {
    return (
      <VoiceBubble msg={msg} getTimeAgo={getTimeAgo} groupColor={groupColor} isMe={isMe} showAvatar={showAvatar} onLongPress={onLongPress} onReplyPress={onReplyPress} reactionRow={reactionRow} />
    );
  }

  const deleted = msg.isDeleted;
  const arabic = !deleted && isPredominantlyArabic(msg.body);
  const reply = msg.replyPreview ? (
    <ReplyQuote preview={msg.replyPreview} groupColor={groupColor} isMe={isMe} onPress={() => msg.replyToId && onReplyPress?.(msg.replyToId)} />
  ) : null;

  const inner = (
    <>
      {msg.isPinned && (
        <View style={styles.pinnedIndicator}>
          <Ionicons name="pin" size={10} color={isMe ? 'rgba(255,255,255,0.6)' : '#94a3b8'} />
        </View>
      )}
      {!isMe && showAvatar && <Text style={[styles.bubbleOtherName, { color: groupColor }]}>{msg.authorName}</Text>}
      {reply}

      {deleted ? (
        <Text style={[styles.deletedText, isMe && { color: 'rgba(255,255,255,0.7)' }]}>
          <Ionicons name="ban-outline" size={13} color={isMe ? 'rgba(255,255,255,0.7)' : '#64748b'} /> This message was deleted
        </Text>
      ) : msg.type === 'shared' && msg.sharedContent ? (
        <SharedContentCard
          content={msg.sharedContent}
          groupColor={groupColor}
          isMe={isMe}
          onPractice={onPracticeShared ? () => onPracticeShared(msg.sharedContent!) : undefined}
        />
      ) : msg.type === 'image' && msg.imageUrl ? (
        <ImageContent msg={msg} onImagePress={onImagePress} isMe={isMe} groupColor={groupColor} />
      ) : (
        <Text style={[isMe ? styles.bubbleMeBody : styles.bubbleOtherBody, arabic && styles.arabicBody]}>
          {renderMessageText(msg.body, {
            arabicStyle: styles.arabicInline,
            mentionStyle: [styles.mention, { color: isMe ? '#d1fae5' : groupColor }],
          })}
        </Text>
      )}

      <View style={styles.metaRow}>
        {msg.editedAt && !deleted && <Text style={[styles.editedLabel, isMe && { color: 'rgba(255,255,255,0.5)' }]}>edited</Text>}
        <Text style={isMe ? styles.bubbleMeTime : styles.bubbleOtherTime}>{getTimeAgo(msg.createdAt)}</Text>
      </View>
    </>
  );

  // Image/shared bubbles get a transparent container so the media defines the shape.
  const isMedia = !deleted && (msg.type === 'image' || msg.type === 'shared');

  if (isMe) {
    return (
      <View style={[styles.bubbleRowMe, !showAvatar && { marginTop: 2 }]}>
        <Pressable style={[styles.bubbleMe, isMedia && styles.bubbleMedia, deleted && styles.bubbleDeleted]} onLongPress={onLongPress} delayLongPress={250}>
          {inner}
        </Pressable>
        {reactionRow}
      </View>
    );
  }

  return (
    <View style={[styles.bubbleRowOther, !showAvatar && { marginTop: 2 }]}>
      {showAvatar ? (
        <View style={[styles.msgAvatar, { backgroundColor: `${groupColor}25` }]}>
          <Text style={[styles.msgAvatarText, { color: groupColor }]}>{msg.avatar}</Text>
        </View>
      ) : (
        <View style={styles.avatarSpacer} />
      )}
      <View style={{ flex: 1, alignItems: 'flex-start' }}>
        <Pressable style={[styles.bubbleOther, isMedia && styles.bubbleMedia, deleted && styles.bubbleDeleted]} onLongPress={onLongPress} delayLongPress={250}>
          {inner}
        </Pressable>
        {reactionRow}
      </View>
    </View>
  );
});

function ImageContent({ msg, onImagePress, isMe, groupColor }: { msg: MessageBubbleMessage; onImagePress?: (uri: string) => void; isMe: boolean; groupColor: string }) {
  const maxW = 240;
  const ratio = msg.imageW && msg.imageH ? msg.imageH / msg.imageW : 0.75;
  const h = Math.min(320, maxW * ratio);
  return (
    <View>
      <Pressable onPress={() => msg.imageUrl && onImagePress?.(msg.imageUrl)}>
        <Image source={{ uri: msg.imageUrl }} style={[styles.image, { width: maxW, height: h }]} resizeMode="cover" />
      </Pressable>
      {msg.body ? (
        <Text style={[isMe ? styles.bubbleMeBody : styles.bubbleOtherBody, { marginTop: 6, paddingHorizontal: 2 }]}>
          {renderMessageText(msg.body, { arabicStyle: styles.arabicInline, mentionStyle: [styles.mention, { color: isMe ? '#d1fae5' : groupColor }] })}
        </Text>
      ) : null}
    </View>
  );
}

// Build exactly `n` bars for the waveform: resample real samples when we have
// them, otherwise synthesize a stable pseudo-waveform seeded by the message id.
function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h;
}
function buildDisplayBars(src: number[] | null | undefined, n: number, seed: string): number[] {
  if (src && src.length) {
    const out: number[] = [];
    for (let i = 0; i < n; i++) out.push(src[Math.floor((i * src.length) / n)] ?? 0.4);
    return out;
  }
  let h = hashString(seed) || 1;
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    h = (h * 1103515245 + 12345) & 0x7fffffff;
    out.push(0.22 + ((h >> 8) % 100) / 100 * 0.78);
  }
  return out;
}

// ── Voice bubble (real waveform + seek + speed) ─────────────────
function VoiceBubble({ msg, getTimeAgo, groupColor, isMe, showAvatar, onLongPress, onReplyPress, reactionRow }: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0..1
  const [rate, setRate] = useState(1);
  const playerRef = useRef<AudioPlayer | null>(null);
  const subRef = useRef<{ remove: () => void } | null>(null);
  const barLayout = useRef<{ x: number; width: number }>({ x: 0, width: 1 });

  useEffect(() => {
    return () => {
      subRef.current?.remove();
      subRef.current = null;
      if (playerRef.current) {
        try { playerRef.current.remove(); } catch {}
        playerRef.current = null;
      }
    };
  }, []);

  const durationSec = Math.round((msg.durationMs || 0) / 1000);
  const durationStr = `${Math.floor(durationSec / 60)}:${(durationSec % 60).toString().padStart(2, '0')}`;

  // Waveform length scales with the clip's duration (~2.5 bars/sec, clamped).
  const barCount = Math.min(38, Math.max(10, Math.round(Math.max(1, durationSec) * 2.5)));
  const bars = buildDisplayBars(msg.waveform, barCount, msg.id);
  // Exact rendered width of the bars (3px bar + 2px gap) so the scrubber can't overshoot.
  const waveWidth = barCount * 3 + (barCount - 1) * 2;

  const ensureLoaded = (): AudioPlayer | null => {
    if (playerRef.current) return playerRef.current;
    if (!msg.audioUrl) return null;
    setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
    const player = createAudioPlayer({ uri: msg.audioUrl });
    player.setPlaybackRate(rate);
    subRef.current = player.addListener('playbackStatusUpdate', (status: any) => {
      if (!status.isLoaded) return;
      const dur = status.duration || 0;
      if (dur > 0) setProgress(Math.min(1, (status.currentTime || 0) / dur));
      const finished = dur > 0 && status.currentTime > 0 && status.currentTime >= dur - 0.15;
      if (finished) {
        setIsPlaying(false);
        setProgress(0);
        try { player.seekTo(0); } catch {}
      }
    });
    playerRef.current = player;
    return player;
  };

  const handlePlay = () => {
    try {
      if (isPlaying && playerRef.current) {
        playerRef.current.pause();
        setIsPlaying(false);
        return;
      }
      const player = ensureLoaded();
      if (!player) return;
      setIsPlaying(true);
      player.play();
    } catch {
      setIsPlaying(false);
    }
  };

  const cycleRate = () => {
    const next = rate === 1 ? 1.5 : rate === 1.5 ? 2 : 1;
    setRate(next);
    try { playerRef.current?.setPlaybackRate(next); } catch {}
  };

  const seekTo = (e: GestureResponderEvent) => {
    const frac = Math.min(1, Math.max(0, (e.nativeEvent.locationX) / barLayout.current.width));
    setProgress(frac);
    const player = ensureLoaded();
    if (player && msg.durationMs) {
      try { player.seekTo((frac * msg.durationMs) / 1000); } catch {}
    }
  };

  const activeBars = Math.floor(progress * bars.length);
  const elapsedSec = Math.round((progress * (msg.durationMs || 0)) / 1000);
  const elapsedStr = `${Math.floor(elapsedSec / 60)}:${(elapsedSec % 60).toString().padStart(2, '0')}`;
  const timeLabel = isPlaying || progress > 0 ? elapsedStr : durationStr;

  const voiceInner = (
    <Pressable style={isMe ? styles.voiceBubbleMe : styles.voiceBubbleOther} onLongPress={onLongPress} delayLongPress={250}>
      {/* Row 1: play button aligned with the waveform's vertical center */}
      <View style={styles.voiceTopRow}>
        <Pressable style={styles.playBtn} onPress={handlePlay} hitSlop={8}>
          <Ionicons
            name={isPlaying ? 'pause' : 'play'}
            size={26}
            color={isMe ? '#ffffff' : groupColor}
          />
        </Pressable>
        <Pressable
          style={[styles.waveformContainer, { width: waveWidth }]}
          onLayout={(ev) => { barLayout.current.width = ev.nativeEvent.layout.width; }}
          onPress={seekTo}
          hitSlop={10}
        >
          {bars.map((hgt, i) => {
            const played = i <= activeBars;
            return (
              <View
                key={i}
                style={[styles.waveformBar, {
                  height: Math.max(3, hgt * 24),
                  backgroundColor: isMe
                    ? (played ? '#ffffff' : 'rgba(255,255,255,0.4)')
                    : (played ? groupColor : '#475569'),
                }]}
              />
            );
          })}
          <View
            style={[styles.waveThumb, {
              left: `${Math.min(100, Math.max(0, progress * 100))}%`,
              backgroundColor: isMe ? '#0f172a' : groupColor,
            }]}
            pointerEvents="none"
          />
        </Pressable>
      </View>

      {/* Row 2: mic + timer on the left, speed pill on the right */}
      <View style={styles.voiceMeta}>
        <Ionicons name="mic" size={11} color={isMe ? 'rgba(255,255,255,0.75)' : '#64748b'} />
        <Text style={isMe ? styles.voiceDurationMe : styles.voiceDurationOther}>{timeLabel}</Text>
        <View style={{ flex: 1 }} />
        <Pressable
          onPress={cycleRate}
          hitSlop={8}
          style={[styles.rateBtn, {
            backgroundColor: isMe ? 'rgba(255,255,255,0.22)' : `${groupColor}22`,
            opacity: rate === 1 ? 0.7 : 1,
          }]}
        >
          <Text style={[styles.rateText, { color: isMe ? '#ffffff' : groupColor }]}>{rate}×</Text>
        </Pressable>
      </View>
    </Pressable>
  );

  if (isMe) {
    return (
      <View style={[styles.bubbleRowMe, !showAvatar && { marginTop: 2 }]}>
        {voiceInner}
        <Text style={styles.bubbleMeTime}>{getTimeAgo(msg.createdAt)}</Text>
        {reactionRow}
      </View>
    );
  }

  return (
    <View style={[styles.bubbleRowOther, !showAvatar && { marginTop: 2 }]}>
      {showAvatar ? (
        <View style={[styles.msgAvatar, { backgroundColor: `${groupColor}25` }]}>
          <Text style={[styles.msgAvatarText, { color: groupColor }]}>{msg.avatar}</Text>
        </View>
      ) : (
        <View style={styles.avatarSpacer} />
      )}
      <View style={{ flex: 1 }}>
        {showAvatar && <Text style={[styles.bubbleOtherName, { color: groupColor, marginBottom: 4, marginLeft: 4 }]}>{msg.authorName}</Text>}
        {voiceInner}
        <Text style={styles.bubbleOtherTime}>{getTimeAgo(msg.createdAt)}</Text>
        {reactionRow}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  systemMsg: { alignSelf: 'center', backgroundColor: '#334155', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, marginVertical: 8 },
  systemMsgText: { fontSize: 12, color: '#94a3b8', textAlign: 'center' },
  milestoneMsg: { flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'center', backgroundColor: '#1e293b', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, borderWidth: 1, marginVertical: 8 },
  milestoneMsgText: { fontSize: 13, fontWeight: '600' },
  bubbleRowMe: { flexDirection: 'column', alignItems: 'flex-end', marginTop: 8, paddingLeft: 50 },
  bubbleMe: { backgroundColor: '#10b981', borderRadius: 18, borderBottomRightRadius: 4, paddingHorizontal: 14, paddingVertical: 10, maxWidth: '100%' },
  bubbleMeBody: { fontSize: 15, color: '#ffffff', lineHeight: 21 },
  bubbleMeTime: { fontSize: 11, color: 'rgba(255,255,255,0.55)', marginTop: 4 },
  bubbleRowOther: { flexDirection: 'row', alignItems: 'flex-end', marginTop: 8, paddingRight: 50, gap: 8 },
  classRow: { marginTop: 10, paddingHorizontal: 2 },
  msgAvatar: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  msgAvatarText: { fontSize: 13, fontWeight: '700' },
  avatarSpacer: { width: 32 },
  bubbleOther: { alignSelf: 'flex-start', backgroundColor: '#1e293b', borderRadius: 18, borderBottomLeftRadius: 4, paddingHorizontal: 14, paddingVertical: 10, maxWidth: '100%', borderWidth: 1, borderColor: '#334155' },
  bubbleMedia: { paddingHorizontal: 6, paddingVertical: 6, backgroundColor: 'transparent', borderWidth: 0 },
  bubbleDeleted: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#334155', borderStyle: 'dashed' },
  bubbleOtherName: { fontSize: 12, fontWeight: '700', marginBottom: 3 },
  bubbleOtherBody: { fontSize: 15, color: '#e2e8f0', lineHeight: 21 },
  bubbleOtherTime: { fontSize: 11, color: '#64748b', marginTop: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-end' },
  editedLabel: { fontSize: 10, color: '#64748b', fontStyle: 'italic', marginTop: 4 },
  deletedText: { fontSize: 14, color: '#64748b', fontStyle: 'italic' },
  pinnedIndicator: { position: 'absolute', top: 4, right: 6, zIndex: 1 },
  // Arabic
  arabicBody: { writingDirection: 'rtl', textAlign: 'right' },
  arabicInline: { fontSize: 19, lineHeight: 30 },
  // Mentions
  mention: { fontWeight: '700' },
  // Reply quote
  replyQuote: { borderLeftWidth: 3, paddingLeft: 8, paddingVertical: 2, marginBottom: 6, opacity: 0.95 },
  replyAuthor: { fontSize: 12, fontWeight: '700', marginBottom: 1 },
  replySnippet: { fontSize: 13, color: '#94a3b8' },
  // Image
  image: { borderRadius: 12, backgroundColor: '#0f172a' },
  // Voice
  voiceBubbleMe: {
    flexDirection: 'column', alignItems: 'stretch', gap: 4, backgroundColor: '#10b981',
    borderRadius: 22, borderBottomRightRadius: 8, paddingLeft: 10, paddingRight: 14, paddingVertical: 10,
    alignSelf: 'flex-end', maxWidth: '100%',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.18, shadowRadius: 3, elevation: 2,
  },
  voiceBubbleOther: {
    flexDirection: 'column', alignItems: 'stretch', gap: 4, backgroundColor: '#1e293b',
    borderRadius: 22, borderBottomLeftRadius: 8, paddingLeft: 10, paddingRight: 14, paddingVertical: 10,
    borderWidth: 1, borderColor: '#334155', alignSelf: 'flex-start', maxWidth: '100%',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.18, shadowRadius: 3, elevation: 2,
  },
  voiceTopRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  playBtn: { width: 30, height: 34, alignItems: 'center', justifyContent: 'center' },
  waveformContainer: { flexDirection: 'row', alignItems: 'center', gap: 2, height: 28, position: 'relative' },
  waveformBar: { width: 3, borderRadius: 2 },
  waveThumb: {
    position: 'absolute', width: 14, height: 14, borderRadius: 7, top: 7, marginLeft: -7, borderWidth: 2.5, borderColor: '#ffffff',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.3, shadowRadius: 2, elevation: 4,
  },
  voiceMeta: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  rateBtn: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 12 },
  rateText: { fontSize: 11, fontWeight: '700' },
  voiceDurationMe: { fontSize: 11, color: 'rgba(255,255,255,0.85)', fontWeight: '600', fontVariant: ['tabular-nums'] },
  voiceDurationOther: { fontSize: 11, color: '#94a3b8', fontWeight: '600', fontVariant: ['tabular-nums'] },
});

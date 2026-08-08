import { supabase } from '../lib/supabase';
import {
  DiscussionThread,
  DiscussionCategory,
  StudyGroup,
  StudyPartner,
  ActivityFeedItem,
  ActivityType,
} from '../types/community';
import {
  SIMULATED_DISCUSSIONS,
  SIMULATED_REPLIES,
  SIMULATED_GROUPS,
  SIMULATED_PARTNERS,
  SIMULATED_ACTIVITY,
} from '../data/community/socialData';

function getClient() {
  if (!supabase) throw new Error('Supabase not configured');
  return supabase;
}

// ── Discussions ──────────────────────────────────────────────────

export interface DiscussionReply {
  id: string;
  threadId: string;
  userId: string;
  authorName: string;
  body: string;
  likeCount: number;
  isLiked: boolean;
  createdAt: string;
}

export async function fetchThreads(category?: DiscussionCategory): Promise<DiscussionThread[]> {
  try {
    const client = getClient();
    let query = client
      .from('discussion_threads')
      .select('*')
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(50);

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;
    if (error) throw error;

    return (data || []).map(mapThread);
  } catch (e) {
    if (__DEV__) console.warn('[communitySocial] fetchThreads fallback:', e);
    const threads = category
      ? SIMULATED_DISCUSSIONS.filter((d) => d.category === category)
      : SIMULATED_DISCUSSIONS;
    return threads;
  }
}

export async function fetchThread(threadId: string): Promise<DiscussionThread | null> {
  try {
    const client = getClient();
    const { data, error } = await client
      .from('discussion_threads')
      .select('*')
      .eq('id', threadId)
      .single();

    if (error) throw error;
    return data ? mapThread(data) : null;
  } catch (e) {
    if (__DEV__) console.warn('[communitySocial] fetchThread fallback:', e);
    return SIMULATED_DISCUSSIONS.find((d) => d.id === threadId) || null;
  }
}

export async function fetchReplies(threadId: string, userId?: string): Promise<DiscussionReply[]> {
  try {
    const client = getClient();
    const { data, error } = await client
      .from('discussion_replies')
      .select('*')
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Check which replies user has liked
    let likedReplyIds = new Set<string>();
    if (userId) {
      const { data: likes } = await client
        .from('discussion_likes')
        .select('reply_id')
        .eq('user_id', userId)
        .not('reply_id', 'is', null);
      likedReplyIds = new Set((likes || []).map((l: any) => l.reply_id));
    }

    return (data || []).map((r: any) => ({
      id: r.id,
      threadId: r.thread_id,
      userId: r.user_id,
      authorName: r.author_name,
      body: r.body,
      likeCount: r.like_count || 0,
      isLiked: likedReplyIds.has(r.id),
      createdAt: r.created_at,
    }));
  } catch (e) {
    if (__DEV__) console.warn('[communitySocial] fetchReplies fallback:', e);
    return SIMULATED_REPLIES[threadId] || [];
  }
}

export async function createThread(
  userId: string,
  authorName: string,
  title: string,
  body: string,
  category: DiscussionCategory
): Promise<DiscussionThread | null> {
  try {
    const client = getClient();
    const { data, error } = await client
      .from('discussion_threads')
      .insert({ user_id: userId, author_name: authorName, title, body, category })
      .select()
      .single();

    if (error) throw error;
    return data ? mapThread(data) : null;
  } catch (e) {
    if (__DEV__) console.warn('[communitySocial] createThread error:', e);
    return null;
  }
}

export async function createReply(
  threadId: string,
  userId: string,
  authorName: string,
  body: string
): Promise<DiscussionReply | null> {
  try {
    const client = getClient();
    const { data, error } = await client
      .from('discussion_replies')
      .insert({ thread_id: threadId, user_id: userId, author_name: authorName, body })
      .select()
      .single();

    if (error) throw error;
    return data
      ? {
          id: data.id,
          threadId: data.thread_id,
          userId: data.user_id,
          authorName: data.author_name,
          body: data.body,
          likeCount: 0,
          isLiked: false,
          createdAt: data.created_at,
        }
      : null;
  } catch (e) {
    if (__DEV__) console.warn('[communitySocial] createReply error:', e);
    return null;
  }
}

export async function toggleLikeThread(threadId: string, userId: string): Promise<boolean> {
  try {
    const client = getClient();
    // Check if already liked
    const { data: existing } = await client
      .from('discussion_likes')
      .select('user_id')
      .eq('user_id', userId)
      .eq('thread_id', threadId)
      .maybeSingle();

    if (existing) {
      // Unlike — the trg_discussion_like_count trigger decrements like_count.
      await client.from('discussion_likes').delete().eq('user_id', userId).eq('thread_id', threadId);
      return false;
    } else {
      // Like — the trg_discussion_like_count trigger increments like_count.
      await client.from('discussion_likes').insert({ user_id: userId, thread_id: threadId });
      return true;
    }
  } catch (e) {
    if (__DEV__) console.warn('[communitySocial] toggleLikeThread error:', e);
    return false;
  }
}

export async function toggleLikeReply(replyId: string, userId: string): Promise<boolean> {
  try {
    const client = getClient();
    const { data: existing } = await client
      .from('discussion_likes')
      .select('user_id')
      .eq('user_id', userId)
      .eq('reply_id', replyId)
      .maybeSingle();

    if (existing) {
      await client.from('discussion_likes').delete().eq('user_id', userId).eq('reply_id', replyId);
      return false;
    } else {
      await client.from('discussion_likes').insert({ user_id: userId, reply_id: replyId });
      return true;
    }
  } catch (e) {
    if (__DEV__) console.warn('[communitySocial] toggleLikeReply error:', e);
    return false;
  }
}

// ── Study Groups ─────────────────────────────────────────────────

export async function fetchGroups(): Promise<StudyGroup[]> {
  try {
    const client = getClient();
    const { data, error } = await client
      .from('study_groups')
      .select('*')
      .order('is_active', { ascending: false })
      .order('member_count', { ascending: false })
      .limit(50);

    if (error) throw error;
    return (data || []).map(mapGroup);
  } catch (e) {
    if (__DEV__) console.warn('[communitySocial] fetchGroups fallback:', e);
    return SIMULATED_GROUPS;
  }
}

export async function fetchUserGroupIds(userId: string): Promise<Set<string>> {
  try {
    const client = getClient();
    const { data, error } = await client
      .from('study_group_members')
      .select('group_id')
      .eq('user_id', userId);

    if (error) throw error;
    return new Set((data || []).map((r: any) => r.group_id));
  } catch (e) {
    if (__DEV__) console.warn('[communitySocial] fetchUserGroupIds error:', e);
    return new Set();
  }
}

export async function joinGroup(groupId: string, userId: string): Promise<boolean> {
  try {
    const client = getClient();
    const { error } = await client
      .from('study_group_members')
      .insert({ group_id: groupId, user_id: userId });

    if (error) throw error;
    return true;
  } catch (e) {
    if (__DEV__) console.warn('[communitySocial] joinGroup error:', e);
    return false;
  }
}

export async function leaveGroup(groupId: string, userId: string): Promise<boolean> {
  try {
    const client = getClient();
    const { error } = await client
      .from('study_group_members')
      .delete()
      .eq('group_id', groupId)
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  } catch (e) {
    if (__DEV__) console.warn('[communitySocial] leaveGroup error:', e);
    return false;
  }
}

export async function createGroup(
  creatorId: string,
  name: string,
  description: string,
  topic: string,
  goal: string,
  icon: string = 'book',
  color: string = '#10b981'
): Promise<StudyGroup | null> {
  try {
    const client = getClient();
    const { data, error } = await client
      .from('study_groups')
      .insert({ creator_id: creatorId, name, description, topic, goal, icon, color, member_count: 0 })
      .select()
      .single();

    if (error) throw error;

    // Auto-join creator as admin
    if (data) {
      await client.from('study_group_members').insert({ group_id: data.id, user_id: creatorId, role: 'admin' });
    }

    return data ? mapGroup(data) : null;
  } catch (e) {
    if (__DEV__) console.warn('[communitySocial] createGroup error:', e);
    return null;
  }
}

// ── Study Partners ───────────────────────────────────────────────

export async function fetchPartnerSuggestions(userId: string): Promise<StudyPartner[]> {
  try {
    const client = getClient();
    // Get users with progress, exclude self and already connected
    const { data: connected } = await client
      .from('study_partner_connections')
      .select('requester_id, target_id')
      .or(`requester_id.eq.${userId},target_id.eq.${userId}`)
      .in('status', ['pending', 'accepted']);

    const excludeIds = new Set<string>([userId]);
    (connected || []).forEach((c: any) => {
      excludeIds.add(c.requester_id);
      excludeIds.add(c.target_id);
    });

    const { data: users, error } = await client
      .from('user_profiles')
      .select('id, display_name')
      .not('id', 'in', `(${Array.from(excludeIds).join(',')})`)
      .limit(20);

    if (error) throw error;

    // Get progress data for these users
    const userIds = (users || []).map((u: any) => u.id);
    const { data: progress } = await client
      .from('user_arabic_progress')
      .select('user_id, total_xp, current_streak')
      .in('user_id', userIds);

    const progressMap = new Map<string, any>();
    (progress || []).forEach((p: any) => progressMap.set(p.user_id, p));

    return (users || []).map((u: any) => {
      const prog = progressMap.get(u.id) || { total_xp: 0, current_streak: 0 };
      const xp = prog.total_xp || 0;
      const level = xp > 5000 ? 'advanced' : xp > 1000 ? 'intermediate' : 'beginner';
      return {
        id: u.id,
        name: u.display_name || 'Learner',
        level,
        streak: prog.current_streak || 0,
        xp,
        interests: ['Quran', 'Arabic'],
        matchScore: Math.floor(50 + Math.random() * 50),
        isConnected: false,
        lastActive: new Date().toISOString(),
      } as StudyPartner;
    });
  } catch (e) {
    if (__DEV__) console.warn('[communitySocial] fetchPartnerSuggestions fallback:', e);
    return SIMULATED_PARTNERS;
  }
}

export async function sendConnection(requesterId: string, targetId: string): Promise<boolean> {
  try {
    const client = getClient();
    const { error } = await client
      .from('study_partner_connections')
      .insert({ requester_id: requesterId, target_id: targetId, status: 'accepted' });

    if (error) throw error;
    return true;
  } catch (e) {
    if (__DEV__) console.warn('[communitySocial] sendConnection error:', e);
    return false;
  }
}

export async function removeConnection(requesterId: string, targetId: string): Promise<boolean> {
  try {
    const client = getClient();
    const { error } = await client
      .from('study_partner_connections')
      .delete()
      .or(`and(requester_id.eq.${requesterId},target_id.eq.${targetId}),and(requester_id.eq.${targetId},target_id.eq.${requesterId})`);

    if (error) throw error;
    return true;
  } catch (e) {
    if (__DEV__) console.warn('[communitySocial] removeConnection error:', e);
    return false;
  }
}

export async function fetchConnectedPartnerIds(userId: string): Promise<Set<string>> {
  try {
    const client = getClient();
    const { data, error } = await client
      .from('study_partner_connections')
      .select('requester_id, target_id')
      .or(`requester_id.eq.${userId},target_id.eq.${userId}`)
      .eq('status', 'accepted');

    if (error) throw error;
    const ids = new Set<string>();
    (data || []).forEach((c: any) => {
      if (c.requester_id !== userId) ids.add(c.requester_id);
      if (c.target_id !== userId) ids.add(c.target_id);
    });
    return ids;
  } catch (e) {
    if (__DEV__) console.warn('[communitySocial] fetchConnectedPartnerIds error:', e);
    return new Set();
  }
}

// ── Activity Feed ────────────────────────────────────────────────

export async function fetchActivityFeed(limit: number = 20): Promise<ActivityFeedItem[]> {
  try {
    const client = getClient();
    const { data, error } = await client
      .from('activity_feed')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    if (!data || data.length === 0) return SIMULATED_ACTIVITY;

    return data.map((item: any) => {
      const diff = Date.now() - new Date(item.created_at).getTime();
      const mins = Math.floor(diff / 60000);
      let timeAgo = '';
      if (mins < 1) timeAgo = 'just now';
      else if (mins < 60) timeAgo = `${mins}m`;
      else if (mins < 1440) timeAgo = `${Math.floor(mins / 60)}h`;
      else timeAgo = `${Math.floor(mins / 1440)}d`;

      return {
        id: item.id,
        userName: item.user_name,
        type: item.type as ActivityType,
        detail: item.detail,
        timeAgo,
        icon: item.icon || 'star',
        color: item.color || '#10b981',
      };
    });
  } catch (e) {
    if (__DEV__) console.warn('[communitySocial] fetchActivityFeed fallback:', e);
    return SIMULATED_ACTIVITY;
  }
}

export async function postActivity(
  userId: string,
  userName: string,
  type: ActivityType,
  detail: string,
  icon: string = 'star',
  color: string = '#10b981'
): Promise<void> {
  try {
    const client = getClient();
    await client.from('activity_feed').insert({
      user_id: userId,
      user_name: userName,
      type,
      detail,
      icon,
      color,
    });
  } catch (e) {
    if (__DEV__) console.warn('[communitySocial] postActivity error:', e);
  }
}

// ── Group Members & Roles ────────────────────────────────────────

export async function fetchGroupMembers(groupId: string): Promise<any[]> {
  try {
    const client = getClient();
    const { data, error } = await client
      .from('study_group_members')
      .select('user_id, role, joined_at')
      .eq('group_id', groupId)
      .order('joined_at', { ascending: true });

    if (error) throw error;
    if (!data || data.length === 0) return [];

    // Fetch display names from user_profiles and XP from user_arabic_progress
    const userIds = data.map((m: any) => m.user_id);

    const [profilesRes, progressRes] = await Promise.all([
      client.from('user_profiles').select('user_id, display_name').in('user_id', userIds),
      client.from('user_arabic_progress').select('user_id, total_xp, current_streak').in('user_id', userIds),
    ]);

    const nameMap = new Map<string, string>();
    (profilesRes.data || []).forEach((p: any) => nameMap.set(p.user_id, p.display_name));

    const progressMap = new Map<string, any>();
    (progressRes.data || []).forEach((p: any) => progressMap.set(p.user_id, p));

    // Fallback: get names from group messages for users without a profile name
    const missingNameIds = userIds.filter((id: string) => !nameMap.get(id));
    if (missingNameIds.length > 0) {
      const { data: msgs } = await client
        .from('group_messages')
        .select('user_id, author_name')
        .eq('group_id', groupId)
        .in('user_id', missingNameIds)
        .limit(100);
      (msgs || []).forEach((msg: any) => {
        if (msg.author_name && !nameMap.has(msg.user_id)) {
          nameMap.set(msg.user_id, msg.author_name);
        }
      });
    }

    return data.map((m: any) => {
      const prog = progressMap.get(m.user_id) || {};
      const name = nameMap.get(m.user_id) || 'Member';
      return {
        id: m.user_id,
        userId: m.user_id,
        name,
        avatar: name.charAt(0).toUpperCase(),
        role: m.role || 'member',
        joinedAt: m.joined_at,
        streak: prog.current_streak || 0,
        xp: prog.total_xp || 0,
      };
    });
  } catch (e) {
    if (__DEV__) console.warn('[communitySocial] fetchGroupMembers fallback:', e);
    return [];
  }
}

export async function updateMemberRole(
  groupId: string,
  userId: string,
  role: 'admin' | 'moderator' | 'member'
): Promise<boolean> {
  try {
    const client = getClient();
    const { error } = await client
      .from('study_group_members')
      .update({ role })
      .eq('group_id', groupId)
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  } catch (e) {
    if (__DEV__) console.warn('[communitySocial] updateMemberRole error:', e);
    return false;
  }
}

export async function removeMember(groupId: string, userId: string): Promise<boolean> {
  try {
    const client = getClient();
    const { error } = await client
      .from('study_group_members')
      .delete()
      .eq('group_id', groupId)
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  } catch (e) {
    if (__DEV__) console.warn('[communitySocial] removeMember error:', e);
    return false;
  }
}

// ── Group Messages ──────────────────────────────────────────────

export interface GroupMessageRow {
  id: string;
  group_id: string;
  user_id: string;
  author_name: string;
  avatar: string;
  body: string;
  type: 'chat' | 'system' | 'milestone' | 'voice' | 'image' | 'shared' | 'lesson' | 'quiz' | 'poll' | 'board';
  is_pinned?: boolean;
  audio_url?: string;
  duration_ms?: number;
  created_at: string;
  // Chat overhaul columns
  reply_to_id?: string | null;
  edited_at?: string | null;
  is_deleted?: boolean;
  image_url?: string | null;
  image_w?: number | null;
  image_h?: number | null;
  mentions?: string[] | null;
  shared_content?: any | null;
  waveform?: number[] | null;
  class_content?: any | null;
}

/**
 * Fetch group messages. By default returns the latest page (ascending order for
 * rendering). Pass `before` (an ISO created_at cursor) to page backwards through
 * older messages when the user scrolls up.
 */
export async function fetchGroupMessages(
  groupId: string,
  opts: { before?: string; limit?: number } = {}
): Promise<GroupMessageRow[]> {
  const { before, limit = 40 } = opts;
  try {
    const client = getClient();
    let query = client
      .from('group_messages')
      .select('*')
      .eq('group_id', groupId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (before) query = query.lt('created_at', before);

    const { data, error } = await query;
    if (error) throw error;
    // Reverse to ascending (oldest → newest) for chat rendering.
    return (data || []).slice().reverse();
  } catch (e) {
    if (__DEV__) console.warn('[communitySocial] fetchGroupMessages fallback:', e);
    return [];
  }
}

export async function sendGroupMessage(
  groupId: string,
  userId: string,
  authorName: string,
  body: string,
  opts: { replyToId?: string | null; mentions?: string[] } = {}
): Promise<GroupMessageRow | null> {
  try {
    const client = getClient();
    const avatar = authorName.charAt(0).toUpperCase();
    const { data, error } = await client
      .from('group_messages')
      .insert({
        group_id: groupId,
        user_id: userId,
        author_name: authorName,
        avatar,
        body,
        type: 'chat',
        reply_to_id: opts.replyToId || null,
        mentions: opts.mentions && opts.mentions.length ? opts.mentions : [],
      })
      .select()
      .single();

    if (error) throw error;
    return data || null;
  } catch (e) {
    if (__DEV__) console.warn('[communitySocial] sendGroupMessage error:', e);
    return null;
  }
}

// ── Edit / Delete ───────────────────────────────────────────────

export async function editGroupMessage(messageId: string, newBody: string): Promise<boolean> {
  try {
    const client = getClient();
    const { error } = await client
      .from('group_messages')
      .update({ body: newBody, edited_at: new Date().toISOString() })
      .eq('id', messageId);
    if (error) throw error;
    return true;
  } catch (e) {
    if (__DEV__) console.warn('[communitySocial] editGroupMessage error:', e);
    return false;
  }
}

/** Soft-delete: keeps the row so replies pointing at it stay valid. */
export async function deleteGroupMessage(messageId: string): Promise<boolean> {
  try {
    const client = getClient();
    const { error } = await client
      .from('group_messages')
      .update({ is_deleted: true, body: '', audio_url: null, image_url: null, shared_content: null })
      .eq('id', messageId);
    if (error) throw error;
    return true;
  } catch (e) {
    if (__DEV__) console.warn('[communitySocial] deleteGroupMessage error:', e);
    return false;
  }
}

// ── Image messages ──────────────────────────────────────────────

export async function uploadChatImage(
  groupId: string,
  userId: string,
  fileUri: string
): Promise<string | null> {
  try {
    const client = getClient();
    const ext = fileUri.split('.').pop()?.split('?')[0]?.toLowerCase() || 'jpg';
    const contentType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
    const fileName = `${groupId}/${userId}/${Date.now()}.${ext}`;

    const response = await fetch(fileUri);
    const arrayBuffer = await response.arrayBuffer();

    const { error } = await client.storage
      .from('chat-images')
      .upload(fileName, arrayBuffer, { contentType, upsert: true });
    if (error) throw error;

    const { data: urlData } = client.storage.from('chat-images').getPublicUrl(fileName);
    return urlData?.publicUrl || null;
  } catch (e) {
    if (__DEV__) console.warn('[communitySocial] uploadChatImage error:', e);
    return null;
  }
}

export async function sendImageMessage(
  groupId: string,
  userId: string,
  authorName: string,
  imageUrl: string,
  width: number,
  height: number,
  caption: string = ''
): Promise<GroupMessageRow | null> {
  try {
    const client = getClient();
    const avatar = authorName.charAt(0).toUpperCase();
    const { data, error } = await client
      .from('group_messages')
      .insert({
        group_id: groupId,
        user_id: userId,
        author_name: authorName,
        avatar,
        body: caption,
        type: 'image',
        image_url: imageUrl,
        image_w: Math.round(width),
        image_h: Math.round(height),
      })
      .select()
      .single();
    if (error) throw error;
    return data || null;
  } catch (e) {
    if (__DEV__) console.warn('[communitySocial] sendImageMessage error:', e);
    return null;
  }
}

// ── Shared content (share-from-app) ─────────────────────────────

export async function sendSharedContentMessage(
  groupId: string,
  userId: string,
  authorName: string,
  sharedContent: Record<string, any>
): Promise<GroupMessageRow | null> {
  try {
    const client = getClient();
    const avatar = authorName.charAt(0).toUpperCase();
    const { data, error } = await client
      .from('group_messages')
      .insert({
        group_id: groupId,
        user_id: userId,
        author_name: authorName,
        avatar,
        body: sharedContent.ref || 'Shared',
        type: 'shared',
        shared_content: sharedContent,
      })
      .select()
      .single();
    if (error) throw error;
    return data || null;
  } catch (e) {
    if (__DEV__) console.warn('[communitySocial] sendSharedContentMessage error:', e);
    return null;
  }
}

// ── Class content (lessons / quizzes / polls) ───────────────────

export async function sendClassContent(
  groupId: string,
  userId: string,
  authorName: string,
  kind: 'lesson' | 'quiz' | 'poll' | 'board',
  content: Record<string, any>
): Promise<GroupMessageRow | null> {
  try {
    const client = getClient();
    const avatar = authorName.charAt(0).toUpperCase();
    const bodyMap: Record<string, string> = { lesson: '📘 Lesson', quiz: '📝 Quiz', poll: '📊 Poll', board: '🖌️ Board' };
    const { data, error } = await client
      .from('group_messages')
      .insert({
        group_id: groupId,
        user_id: userId,
        author_name: authorName,
        avatar,
        body: content.title || content.question || bodyMap[kind] || 'Class content',
        type: kind,
        class_content: content,
      })
      .select()
      .single();
    if (error) throw error;
    return data || null;
  } catch (e) {
    if (__DEV__) console.warn('[communitySocial] sendClassContent error:', e);
    return null;
  }
}

export async function updateClassContent(messageId: string, content: Record<string, any>): Promise<boolean> {
  // Local (unsynced) messages have non-UUID ids — nothing to update in the DB.
  if (messageId.startsWith('local-')) return true;
  try {
    const bodyMap: Record<string, string> = { lesson: '📘 Lesson', quiz: '📝 Quiz', poll: '📊 Poll', board: '🖌️ Board' };
    const client = getClient();
    const { error } = await client
      .from('group_messages')
      .update({ class_content: content, body: content.title || content.question || bodyMap[content.kind] || 'Class content', edited_at: new Date().toISOString() })
      .eq('id', messageId);
    if (error) throw error;
    return true;
  } catch (e) {
    if (__DEV__) console.warn('[communitySocial] updateClassContent error:', e);
    return false;
  }
}

export interface ClassResponseRow {
  id: string;
  message_id: string;
  user_id: string;
  user_name: string;
  response: { answers?: Record<string, number | string>; choices?: number[] };
  is_correct?: boolean | null;
  score?: number | null;
  created_at: string;
}

// Short-lived cache of quiz/poll responses, keyed by message id. Cards re-mount
// as they scroll in/out of the virtualized list, so this avoids a DB read on
// every remount. Invalidated on submit so results stay fresh.
const RESPONSE_CACHE_TTL = 60_000;
const responseCache = new Map<string, { at: number; rows: ClassResponseRow[] }>();

export function invalidateClassResponses(messageId: string): void {
  responseCache.delete(messageId);
}

export async function submitClassResponse(
  messageId: string,
  groupId: string,
  userId: string,
  userName: string,
  response: Record<string, any>,
  isCorrect?: boolean,
  score?: number
): Promise<boolean> {
  try {
    const client = getClient();
    const { error } = await client
      .from('class_responses')
      .upsert(
        {
          message_id: messageId,
          group_id: groupId,
          user_id: userId,
          user_name: userName,
          response,
          is_correct: isCorrect ?? null,
          score: score ?? null,
        },
        { onConflict: 'message_id,user_id' }
      );
    if (error) throw error;
    invalidateClassResponses(messageId); // next fetch reflects this answer
    return true;
  } catch (e) {
    if (__DEV__) console.warn('[communitySocial] submitClassResponse error:', e);
    return false;
  }
}

export async function fetchClassResponses(messageId: string, force = false): Promise<ClassResponseRow[]> {
  const cached = responseCache.get(messageId);
  if (!force && cached && Date.now() - cached.at < RESPONSE_CACHE_TTL) {
    return cached.rows;
  }
  try {
    const client = getClient();
    const { data, error } = await client
      .from('class_responses')
      .select('*')
      .eq('message_id', messageId);
    if (error) throw error;
    const rows = data || [];
    responseCache.set(messageId, { at: Date.now(), rows });
    return rows;
  } catch (e) {
    if (__DEV__) console.warn('[communitySocial] fetchClassResponses error:', e);
    return cached?.rows || [];
  }
}

// ── Read markers (unread + seen-by) ─────────────────────────────

export async function markGroupRead(groupId: string, userId: string): Promise<void> {
  try {
    const client = getClient();
    await client
      .from('group_reads')
      .upsert(
        { group_id: groupId, user_id: userId, last_read_at: new Date().toISOString() },
        { onConflict: 'group_id,user_id' }
      );
  } catch (e) {
    if (__DEV__) console.warn('[communitySocial] markGroupRead error:', e);
  }
}

export async function fetchGroupReads(groupId: string): Promise<{ user_id: string; last_read_at: string }[]> {
  try {
    const client = getClient();
    const { data, error } = await client
      .from('group_reads')
      .select('user_id, last_read_at')
      .eq('group_id', groupId);
    if (error) throw error;
    return data || [];
  } catch (e) {
    if (__DEV__) console.warn('[communitySocial] fetchGroupReads error:', e);
    return [];
  }
}

export function subscribeToGroupMessages(
  groupId: string,
  onNewMessage: (msg: GroupMessageRow) => void,
  onUpdateMessage?: (msg: GroupMessageRow) => void
) {
  try {
    const client = getClient();
    const channel = client
      .channel(`group-messages-${groupId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'group_messages',
          filter: `group_id=eq.${groupId}`,
        },
        (payload) => {
          onNewMessage(payload.new as GroupMessageRow);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'group_messages',
          filter: `group_id=eq.${groupId}`,
        },
        (payload) => {
          onUpdateMessage?.(payload.new as GroupMessageRow);
        }
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  } catch (e) {
    if (__DEV__) console.warn('[communitySocial] subscribeToGroupMessages error:', e);
    return () => {};
  }
}

// ── Presence + typing (Realtime, no DB) ─────────────────────────

export interface PresenceUser {
  userId: string;
  name: string;
  typing?: boolean;
  typingAt?: number;
}

/**
 * Track this user's presence in a group and receive the live roster.
 * `onSync` fires whenever anyone joins/leaves or updates their typing state.
 * Call the returned `setTyping` to broadcast typing on/off.
 */
export function subscribeToGroupPresence(
  groupId: string,
  me: { userId: string; name: string },
  onSync: (users: PresenceUser[]) => void
): { unsubscribe: () => void; setTyping: (typing: boolean) => void } {
  try {
    const client = getClient();
    const channel = client.channel(`group-presence-${groupId}`, {
      config: { presence: { key: me.userId } },
    });

    const flatten = () => {
      const state = channel.presenceState() as Record<string, any[]>;
      const users: PresenceUser[] = [];
      for (const key of Object.keys(state)) {
        const entry = state[key]?.[0];
        if (entry) users.push({ userId: entry.userId, name: entry.name, typing: entry.typing, typingAt: entry.typingAt });
      }
      onSync(users);
    };

    channel
      .on('presence', { event: 'sync' }, flatten)
      .on('presence', { event: 'join' }, flatten)
      .on('presence', { event: 'leave' }, flatten)
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ userId: me.userId, name: me.name, typing: false, typingAt: 0 });
        }
      });

    return {
      unsubscribe: () => client.removeChannel(channel),
      setTyping: (typing: boolean) => {
        channel.track({ userId: me.userId, name: me.name, typing, typingAt: typing ? Date.now() : 0 }).catch(() => {});
      },
    };
  } catch (e) {
    if (__DEV__) console.warn('[communitySocial] subscribeToGroupPresence error:', e);
    return { unsubscribe: () => {}, setTyping: () => {} };
  }
}

// ── Pinned Messages ─────────────────────────────────────────────

export async function pinMessage(messageId: string): Promise<boolean> {
  try {
    const client = getClient();
    const { error } = await client
      .from('group_messages')
      .update({ is_pinned: true })
      .eq('id', messageId);

    if (error) throw error;
    return true;
  } catch (e) {
    if (__DEV__) console.warn('[communitySocial] pinMessage error:', e);
    return false;
  }
}

export async function unpinMessage(messageId: string): Promise<boolean> {
  try {
    const client = getClient();
    const { error } = await client
      .from('group_messages')
      .update({ is_pinned: false })
      .eq('id', messageId);

    if (error) throw error;
    return true;
  } catch (e) {
    if (__DEV__) console.warn('[communitySocial] unpinMessage error:', e);
    return false;
  }
}

export async function fetchPinnedMessages(groupId: string): Promise<GroupMessageRow[]> {
  try {
    const client = getClient();
    const { data, error } = await client
      .from('group_messages')
      .select('*')
      .eq('group_id', groupId)
      .eq('is_pinned', true)
      .order('created_at', { ascending: false })
      .limit(3);

    if (error) throw error;
    return data || [];
  } catch (e) {
    if (__DEV__) console.warn('[communitySocial] fetchPinnedMessages fallback:', e);
    return [];
  }
}

// ── Invite Links ────────────────────────────────────────────────

export async function generateInviteCode(groupId: string): Promise<string | null> {
  try {
    const client = getClient();
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    const { error } = await client
      .from('study_groups')
      .update({ invite_code: code, invites_enabled: true })
      .eq('id', groupId);

    if (error) throw error;
    return code;
  } catch (e) {
    if (__DEV__) console.warn('[communitySocial] generateInviteCode error:', e);
    return null;
  }
}

export async function fetchGroupByInviteCode(code: string): Promise<StudyGroup | null> {
  try {
    const client = getClient();
    const { data, error } = await client
      .from('study_groups')
      .select('*')
      .eq('invite_code', code)
      .eq('invites_enabled', true)
      .single();

    if (error) throw error;
    return data ? mapGroup(data) : null;
  } catch (e) {
    if (__DEV__) console.warn('[communitySocial] fetchGroupByInviteCode error:', e);
    return null;
  }
}

// ── Reactions ───────────────────────────────────────────────────

export async function addReaction(messageId: string, userId: string, emoji: string): Promise<boolean> {
  try {
    const client = getClient();
    const { error } = await client
      .from('message_reactions')
      .insert({ message_id: messageId, user_id: userId, emoji });

    if (error) throw error;
    return true;
  } catch (e) {
    if (__DEV__) console.warn('[communitySocial] addReaction error:', e);
    return false;
  }
}

export async function removeReaction(messageId: string, userId: string, emoji: string): Promise<boolean> {
  try {
    const client = getClient();
    const { error } = await client
      .from('message_reactions')
      .delete()
      .eq('message_id', messageId)
      .eq('user_id', userId)
      .eq('emoji', emoji);

    if (error) throw error;
    return true;
  } catch (e) {
    if (__DEV__) console.warn('[communitySocial] removeReaction error:', e);
    return false;
  }
}

export async function fetchReactions(messageIds: string[]): Promise<Record<string, any[]>> {
  try {
    if (messageIds.length === 0) return {};
    const client = getClient();
    const { data, error } = await client
      .from('message_reactions')
      .select('*')
      .in('message_id', messageIds);

    if (error) throw error;

    const grouped: Record<string, any[]> = {};
    (data || []).forEach((r: any) => {
      if (!grouped[r.message_id]) grouped[r.message_id] = [];
      grouped[r.message_id].push({
        id: r.id,
        messageId: r.message_id,
        userId: r.user_id,
        emoji: r.emoji,
        createdAt: r.created_at,
      });
    });
    return grouped;
  } catch (e) {
    if (__DEV__) console.warn('[communitySocial] fetchReactions fallback:', e);
    return {};
  }
}

// FIX #1: Scope reaction subscription to this group's messages only
export function subscribeToReactions(
  groupId: string,
  messageIds: string[],
  onReactionChange: (payload: any) => void
) {
  try {
    const client = getClient();
    // Use a Set for fast lookups to filter events client-side
    const msgIdSet = new Set(messageIds);

    const channel = client
      .channel(`group-reactions-${groupId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'message_reactions',
        },
        (payload) => {
          // Only process reactions belonging to messages in this group
          const msgId = (payload.new as any)?.message_id || (payload.old as any)?.message_id;
          if (msgId && msgIdSet.has(msgId)) {
            onReactionChange(payload);
          }
        }
      )
      .subscribe();

    // Allow adding new message IDs dynamically as new messages arrive
    const addMessageId = (id: string) => msgIdSet.add(id);

    return { unsubscribe: () => client.removeChannel(channel), addMessageId };
  } catch (e) {
    if (__DEV__) console.warn('[communitySocial] subscribeToReactions error:', e);
    return { unsubscribe: () => {}, addMessageId: () => {} };
  }
}

// ── Group Leaderboard ───────────────────────────────────────────

export async function fetchGroupLeaderboard(
  groupId: string,
  _metric: 'xp' | 'streak' | 'messages' = 'xp'
): Promise<any[]> {
  try {
    const client = getClient();
    const { data: members, error } = await client
      .from('study_group_members')
      .select('user_id, role, joined_at')
      .eq('group_id', groupId);

    if (error) throw error;
    if (!members || members.length === 0) return [];

    const userIds = members.map((m: any) => m.user_id);

    const [profilesRes, progressRes] = await Promise.all([
      client.from('user_profiles').select('user_id, display_name').in('user_id', userIds),
      client.from('user_arabic_progress').select('user_id, total_xp, current_streak').in('user_id', userIds),
    ]);

    const nameMap = new Map<string, string>();
    (profilesRes.data || []).forEach((p: any) => nameMap.set(p.user_id, p.display_name));

    const progressMap = new Map<string, any>();
    (progressRes.data || []).forEach((p: any) => progressMap.set(p.user_id, p));

    return members.map((m: any) => {
      const prog = progressMap.get(m.user_id) || {};
      const name = nameMap.get(m.user_id) || 'Member';
      return {
        userId: m.user_id,
        name,
        avatar: name.charAt(0).toUpperCase(),
        xp: prog.total_xp || 0,
        streak: prog.current_streak || 0,
        messageCount: 0,
      };
    }).sort((a: any, b: any) => b.xp - a.xp);
  } catch (e) {
    if (__DEV__) console.warn('[communitySocial] fetchGroupLeaderboard fallback:', e);
    return [];
  }
}

// ── Study Sessions ──────────────────────────────────────────────

export async function createSession(
  groupId: string,
  creatorId: string,
  creatorName: string,
  title: string,
  description: string,
  scheduledAt: string,
  durationMinutes: number
): Promise<any | null> {
  try {
    const client = getClient();
    const { data, error } = await client
      .from('group_sessions')
      .insert({
        group_id: groupId,
        creator_id: creatorId,
        creator_name: creatorName,
        title,
        description,
        scheduled_at: scheduledAt,
        duration_minutes: durationMinutes,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (e) {
    if (__DEV__) console.warn('[communitySocial] createSession error:', e);
    return null;
  }
}

export async function fetchSessions(groupId: string): Promise<any[]> {
  try {
    const client = getClient();
    const { data, error } = await client
      .from('group_sessions')
      .select('*')
      .eq('group_id', groupId)
      .order('scheduled_at', { ascending: true });

    if (error) throw error;
    return (data || []).map((s: any) => ({
      id: s.id,
      groupId: s.group_id,
      creatorId: s.creator_id,
      creatorName: s.creator_name,
      title: s.title,
      description: s.description,
      scheduledAt: s.scheduled_at,
      durationMinutes: s.duration_minutes,
      attendeeCount: s.attendee_count || 0,
      userRsvp: null,
      createdAt: s.created_at,
    }));
  } catch (e) {
    if (__DEV__) console.warn('[communitySocial] fetchSessions fallback:', e);
    return [];
  }
}

export async function rsvpSession(
  sessionId: string,
  userId: string,
  status: 'going' | 'not_going'
): Promise<boolean> {
  try {
    const client = getClient();
    const { error } = await client
      .from('session_rsvps')
      .upsert({ session_id: sessionId, user_id: userId, status }, { onConflict: 'session_id,user_id' });

    if (error) throw error;
    return true;
  } catch (e) {
    if (__DEV__) console.warn('[communitySocial] rsvpSession error:', e);
    return false;
  }
}

// ── Group Challenges ────────────────────────────────────────────

export async function createChallenge(
  groupId: string,
  creatorId: string,
  creatorName: string,
  title: string,
  targetType: string,
  targetValue: number,
  startDate: string,
  endDate: string
): Promise<any | null> {
  try {
    const client = getClient();
    const { data, error } = await client
      .from('group_challenges')
      .insert({
        group_id: groupId,
        creator_id: creatorId,
        creator_name: creatorName,
        title,
        target_type: targetType,
        target_value: targetValue,
        start_date: startDate,
        end_date: endDate,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (e) {
    if (__DEV__) console.warn('[communitySocial] createChallenge error:', e);
    return null;
  }
}

export async function fetchChallenges(groupId: string): Promise<any[]> {
  try {
    const client = getClient();
    const { data, error } = await client
      .from('group_challenges')
      .select('*')
      .eq('group_id', groupId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map((c: any) => ({
      id: c.id,
      groupId: c.group_id,
      creatorId: c.creator_id,
      creatorName: c.creator_name,
      title: c.title,
      targetType: c.target_type,
      targetValue: c.target_value,
      currentValue: c.current_value || 0,
      participantCount: c.participant_count || 0,
      startDate: c.start_date,
      endDate: c.end_date,
      isActive: c.is_active,
      createdAt: c.created_at,
    }));
  } catch (e) {
    if (__DEV__) console.warn('[communitySocial] fetchChallenges fallback:', e);
    return [];
  }
}

export async function updateChallengeProgress(
  challengeId: string,
  userId: string,
  userName: string,
  progress: number
): Promise<boolean> {
  try {
    const client = getClient();
    const { error } = await client
      .from('challenge_progress')
      .upsert(
        { challenge_id: challengeId, user_id: userId, user_name: userName, progress, updated_at: new Date().toISOString() },
        { onConflict: 'challenge_id,user_id' }
      );

    if (error) throw error;
    return true;
  } catch (e) {
    if (__DEV__) console.warn('[communitySocial] updateChallengeProgress error:', e);
    return false;
  }
}

// ── Voice Notes ─────────────────────────────────────────────────

export async function sendVoiceMessage(
  groupId: string,
  userId: string,
  authorName: string,
  audioUrl: string,
  durationMs: number,
  waveform?: number[]
): Promise<GroupMessageRow | null> {
  try {
    const client = getClient();
    const avatar = authorName.charAt(0).toUpperCase();
    const { data, error } = await client
      .from('group_messages')
      .insert({
        group_id: groupId,
        user_id: userId,
        author_name: authorName,
        avatar,
        body: '🎤 Voice note',
        type: 'voice',
        audio_url: audioUrl,
        duration_ms: durationMs,
        waveform: waveform && waveform.length ? waveform : null,
      })
      .select()
      .single();

    if (error) throw error;
    return data || null;
  } catch (e) {
    if (__DEV__) console.warn('[communitySocial] sendVoiceMessage error:', e);
    return null;
  }
}

export async function uploadVoiceNote(
  groupId: string,
  userId: string,
  fileUri: string
): Promise<string | null> {
  try {
    const client = getClient();
    const fileName = `${groupId}/${userId}/${Date.now()}.m4a`;

    // React Native: fetch local file URI and convert to ArrayBuffer (more reliable than .blob())
    const response = await fetch(fileUri);
    const arrayBuffer = await response.arrayBuffer();

    const { error } = await client.storage
      .from('voice-notes')
      .upload(fileName, arrayBuffer, { contentType: 'audio/m4a', upsert: true });

    if (error) throw error;

    const { data: urlData } = client.storage
      .from('voice-notes')
      .getPublicUrl(fileName);

    return urlData?.publicUrl || null;
  } catch (e) {
    if (__DEV__) console.warn('[communitySocial] uploadVoiceNote error:', e);
    return null;
  }
}

// ── Helpers ──────────────────────────────────────────────────────

function mapThread(row: any): DiscussionThread {
  const createdAt = row.created_at || new Date().toISOString();
  const hoursSinceCreated = (Date.now() - new Date(createdAt).getTime()) / 3600000;
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    authorName: row.author_name,
    category: row.category,
    replyCount: row.reply_count || 0,
    likeCount: row.like_count || 0,
    isPinned: row.is_pinned || false,
    isHot: (row.reply_count || 0) > 5 && hoursSinceCreated < 48,
    createdAt,
  };
}

function mapGroup(row: any): StudyGroup {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    topic: row.topic,
    memberCount: row.member_count || 1,
    maxMembers: row.max_members || 50,
    isActive: row.is_active ?? true,
    isJoined: false,
    goal: row.goal,
    icon: row.icon || 'book',
    color: row.color || '#10b981',
    createdAt: row.created_at,
    inviteCode: row.invite_code || undefined,
    invitesEnabled: row.invites_enabled ?? true,
  };
}

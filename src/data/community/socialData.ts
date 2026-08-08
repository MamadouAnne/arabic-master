import {
  DiscussionThread,
  DiscussionReply,
  StudyGroup,
  StudyPartner,
  ActivityFeedItem,
  MessageReaction,
  StudySession,
  GroupChallenge,
} from '../../types/community';

// ── Simulated Activity Feed ─────────────────────────────────────
export const SIMULATED_ACTIVITY: ActivityFeedItem[] = [
  { id: 'a1', userName: 'Amina K.', type: 'completed_surah', detail: 'Al-Mulk', timeAgo: '2m', icon: 'book', color: '#10b981' },
  { id: 'a2', userName: 'Yusuf B.', type: 'streak', detail: '30', timeAgo: '5m', icon: 'flame', color: '#f59e0b' },
  { id: 'a3', userName: 'Fatima R.', type: 'joined_group', detail: 'Juz Amma Study', timeAgo: '12m', icon: 'people', color: '#818cf8' },
  { id: 'a4', userName: 'Omar H.', type: 'earned_xp', detail: '450', timeAgo: '18m', icon: 'star', color: '#f97316' },
  { id: 'a5', userName: 'Khadija M.', type: 'discussion_post', detail: 'Tajweed tips', timeAgo: '25m', icon: 'chatbubble', color: '#14b8a6' },
  { id: 'a6', userName: 'Ibrahim S.', type: 'completed_surah', detail: 'Yasin', timeAgo: '32m', icon: 'book', color: '#10b981' },
  { id: 'a7', userName: 'Aisha L.', type: 'streak', detail: '14', timeAgo: '45m', icon: 'flame', color: '#f59e0b' },
  { id: 'a8', userName: 'Hassan D.', type: 'earned_xp', detail: '280', timeAgo: '1h', icon: 'star', color: '#f97316' },
];

// ── Simulated Discussions ───────────────────────────────────────
export const SIMULATED_DISCUSSIONS: DiscussionThread[] = [
  {
    id: 'd1',
    title: 'Best tips for memorizing Juz Amma?',
    titleFr: 'Meilleurs conseils pour mémoriser le Juz ʿAmma ?',
    body: 'I\'ve been trying to memorize the last juz. What methods work best for you?',
    bodyFr: 'J\'essaie de mémoriser le dernier juz. Quelles méthodes fonctionnent le mieux pour vous ?',
    authorName: 'Amina K.',
    category: 'quran',
    replyCount: 23,
    likeCount: 45,
    isPinned: true,
    isHot: true,
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: 'd2',
    title: 'How to pronounce ع correctly?',
    titleFr: 'Comment prononcer ع correctement ?',
    body: 'I struggle with the Ayn letter. Any exercises or tips?',
    bodyFr: 'J\'ai du mal avec la lettre ʿayn. Des exercices ou des conseils ?',
    authorName: 'David M.',
    category: 'arabic',
    replyCount: 18,
    likeCount: 32,
    isPinned: false,
    isHot: true,
    createdAt: new Date(Date.now() - 5 * 3600000).toISOString(),
  },
  {
    id: 'd3',
    title: 'Daily Quran reading habit - how do you stay consistent?',
    titleFr: 'Habitude de lecture quotidienne du Coran — comment rester régulier ?',
    body: 'Looking for accountability tips and routines.',
    bodyFr: 'Je cherche des conseils de responsabilisation et des routines.',
    authorName: 'Fatima R.',
    category: 'tips',
    replyCount: 31,
    likeCount: 67,
    isPinned: false,
    isHot: true,
    createdAt: new Date(Date.now() - 8 * 3600000).toISOString(),
  },
  {
    id: 'd4',
    title: 'Understanding Makharij al-Huroof',
    titleFr: 'Comprendre les Makharij al-Hurūf',
    body: 'Can someone explain the points of articulation for Arabic letters?',
    bodyFr: 'Quelqu\'un peut-il expliquer les points d\'articulation des lettres arabes ?',
    authorName: 'Yusuf B.',
    category: 'arabic',
    replyCount: 12,
    likeCount: 28,
    isPinned: false,
    isHot: false,
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
  },
  {
    id: 'd5',
    title: 'Prayer focus - how to improve khushoo?',
    titleFr: 'Concentration dans la prière — comment améliorer le khushūʿ ?',
    body: 'I find my mind wandering during salah. What helps you concentrate?',
    bodyFr: 'Mon esprit vagabonde pendant la salât. Qu\'est-ce qui vous aide à vous concentrer ?',
    authorName: 'Omar H.',
    category: 'prayer',
    replyCount: 27,
    likeCount: 54,
    isPinned: false,
    isHot: false,
    createdAt: new Date(Date.now() - 48 * 3600000).toISOString(),
  },
  {
    id: 'd6',
    title: 'Welcome to Iqra Community!',
    titleFr: 'Bienvenue dans la communauté Iqra !',
    body: 'Introduce yourself and share your learning goals.',
    bodyFr: 'Présentez-vous et partagez vos objectifs d\'apprentissage.',
    authorName: 'Iqra Team',
    category: 'general',
    replyCount: 156,
    likeCount: 210,
    isPinned: true,
    isHot: false,
    createdAt: new Date(Date.now() - 7 * 24 * 3600000).toISOString(),
  },
];

// ── Simulated Replies (per thread) ────────────────────────────────
export const SIMULATED_REPLIES: Record<string, DiscussionReply[]> = {
  d1: [
    { id: 'r1', threadId: 'd1', userId: 'u2', authorName: 'Yusuf B.', body: 'I use the repetition method — read each ayah 20 times, then move to the next. After 5 ayahs, go back and read them all together.', likeCount: 12, isLiked: false, createdAt: new Date(Date.now() - 1.5 * 3600000).toISOString() },
    { id: 'r2', threadId: 'd1', userId: 'u3', authorName: 'Fatima R.', body: 'Listening before memorizing helps a lot! I listen to the surah on repeat while commuting, then sit down to memorize. It goes much faster.', likeCount: 9, isLiked: false, createdAt: new Date(Date.now() - 1.2 * 3600000).toISOString() },
    { id: 'r3', threadId: 'd1', userId: 'u4', authorName: 'Omar H.', body: 'Write it out by hand! Writing engages a different part of your brain and makes retention stronger.', likeCount: 15, isLiked: false, createdAt: new Date(Date.now() - 1 * 3600000).toISOString() },
    { id: 'r4', threadId: 'd1', userId: 'u5', authorName: 'Khadija M.', body: 'Start with the shorter surahs at the end and work backwards. Each small win motivates you for the next one!', likeCount: 7, isLiked: false, createdAt: new Date(Date.now() - 0.5 * 3600000).toISOString() },
    { id: 'r5', threadId: 'd1', userId: 'u6', authorName: 'Ibrahim S.', body: 'Recite what you memorized in your salah. It\'s the best way to review and you get double the reward in sha Allah.', likeCount: 20, isLiked: false, createdAt: new Date(Date.now() - 0.3 * 3600000).toISOString() },
  ],
  d2: [
    { id: 'r6', threadId: 'd2', userId: 'u1', authorName: 'Amina K.', body: 'The Ayn comes from deep in the throat. Try placing your hand on your throat and feel the vibration. Practice saying "aaa" from the deepest point.', likeCount: 8, isLiked: false, createdAt: new Date(Date.now() - 4 * 3600000).toISOString() },
    { id: 'r7', threadId: 'd2', userId: 'u4', authorName: 'Omar H.', body: 'Watch YouTube videos on makharij — seeing the mouth position makes a huge difference. Sheikh Ayman Suwaid has great lessons.', likeCount: 11, isLiked: false, createdAt: new Date(Date.now() - 3.5 * 3600000).toISOString() },
    { id: 'r8', threadId: 'd2', userId: 'u6', authorName: 'Ibrahim S.', body: 'Record yourself and compare with a native speaker. You\'ll notice the difference and can adjust.', likeCount: 6, isLiked: false, createdAt: new Date(Date.now() - 3 * 3600000).toISOString() },
  ],
  d3: [
    { id: 'r9', threadId: 'd3', userId: 'u2', authorName: 'Yusuf B.', body: 'I read one page after Fajr every day. It\'s become a habit now — I can\'t start my day without it.', likeCount: 18, isLiked: false, createdAt: new Date(Date.now() - 7 * 3600000).toISOString() },
    { id: 'r10', threadId: 'd3', userId: 'u1', authorName: 'Amina K.', body: 'Having an accountability partner helped me so much! We check in with each other daily on what we\'ve read.', likeCount: 14, isLiked: false, createdAt: new Date(Date.now() - 6 * 3600000).toISOString() },
    { id: 'r11', threadId: 'd3', userId: 'u5', authorName: 'Khadija M.', body: 'Start small — even 5 minutes counts. Once it becomes a habit, you\'ll naturally want to do more.', likeCount: 10, isLiked: false, createdAt: new Date(Date.now() - 5 * 3600000).toISOString() },
    { id: 'r12', threadId: 'd3', userId: 'u4', authorName: 'Omar H.', body: 'I keep my Quran app on my phone\'s home screen. Every time I pick up my phone, it reminds me.', likeCount: 8, isLiked: false, createdAt: new Date(Date.now() - 4 * 3600000).toISOString() },
  ],
  d4: [
    { id: 'r13', threadId: 'd4', userId: 'u1', authorName: 'Amina K.', body: 'There are 17 points of articulation. Start with the throat (halq) letters: ء ه ع ح غ خ — they are the deepest.', likeCount: 9, isLiked: false, createdAt: new Date(Date.now() - 20 * 3600000).toISOString() },
    { id: 'r14', threadId: 'd4', userId: 'u6', authorName: 'Ibrahim S.', body: 'The tongue tip letters are the trickiest: ت ط د ض ن ل ر — practice each one slowly with a mirror.', likeCount: 7, isLiked: false, createdAt: new Date(Date.now() - 18 * 3600000).toISOString() },
  ],
  d5: [
    { id: 'r15', threadId: 'd5', userId: 'u3', authorName: 'Fatima R.', body: 'Understanding the meaning of what you recite is a game changer. Learn the translation of the surahs you read most in salah.', likeCount: 22, isLiked: false, createdAt: new Date(Date.now() - 40 * 3600000).toISOString() },
    { id: 'r16', threadId: 'd5', userId: 'u2', authorName: 'Yusuf B.', body: 'Pray as if it\'s your last prayer — this advice from the Prophet ﷺ has stuck with me.', likeCount: 30, isLiked: false, createdAt: new Date(Date.now() - 38 * 3600000).toISOString() },
    { id: 'r17', threadId: 'd5', userId: 'u5', authorName: 'Khadija M.', body: 'I make dua before starting salah asking Allah to help me focus. It really helps set the intention.', likeCount: 16, isLiked: false, createdAt: new Date(Date.now() - 36 * 3600000).toISOString() },
  ],
  d6: [
    { id: 'r18', threadId: 'd6', userId: 'u1', authorName: 'Amina K.', body: 'Assalamu alaikum everyone! I\'m Amina, a revert from Canada. My goal is to memorize Juz Amma this year in sha Allah!', likeCount: 25, isLiked: false, createdAt: new Date(Date.now() - 6 * 24 * 3600000).toISOString() },
    { id: 'r19', threadId: 'd6', userId: 'u2', authorName: 'Yusuf B.', body: 'Wa alaikum assalam! I\'m Yusuf from Malaysia. Been studying Arabic for 3 years. Happy to help anyone with grammar questions!', likeCount: 18, isLiked: false, createdAt: new Date(Date.now() - 5.5 * 24 * 3600000).toISOString() },
    { id: 'r20', threadId: 'd6', userId: 'u3', authorName: 'Fatima R.', body: 'Welcome everyone! I\'m Fatima. I want to be able to read the Quran fluently without relying on transliteration.', likeCount: 15, isLiked: false, createdAt: new Date(Date.now() - 5 * 24 * 3600000).toISOString() },
    { id: 'r21', threadId: 'd6', userId: 'u4', authorName: 'Omar H.', body: 'Great to meet you all. I\'m Omar — just started learning Arabic alphabet last month. This app is amazing!', likeCount: 20, isLiked: false, createdAt: new Date(Date.now() - 4 * 24 * 3600000).toISOString() },
  ],
};

// ── Simulated Study Groups ──────────────────────────────────────
export const SIMULATED_GROUPS: StudyGroup[] = [
  {
    id: 'g1',
    name: 'Juz Amma Circle',
    nameFr: 'Cercle Juz ʿAmma',
    description: 'Memorize the 30th Juz together, one surah at a time',
    descriptionFr: 'Mémorisez le 30e Juz ensemble, une sourate à la fois',
    topic: 'Quran Memorization',
    topicFr: 'Mémorisation du Coran',
    memberCount: 48,
    maxMembers: 50,
    isActive: true,
    isJoined: false,
    goal: 'Memorize 1 surah/week',
    goalFr: 'Mémoriser 1 sourate/semaine',
    icon: 'book',
    color: '#10b981',
    createdAt: new Date(Date.now() - 14 * 24 * 3600000).toISOString(),
  },
  {
    id: 'g2',
    name: 'Arabic Grammar Club',
    nameFr: 'Club de grammaire arabe',
    description: 'Work through grammar lessons and practice together',
    descriptionFr: 'Travaillez les leçons de grammaire et pratiquez ensemble',
    topic: 'Arabic Grammar',
    topicFr: 'Grammaire arabe',
    memberCount: 32,
    maxMembers: 40,
    isActive: true,
    isJoined: false,
    goal: 'Complete 2 lessons/week',
    goalFr: 'Terminer 2 leçons/semaine',
    icon: 'school',
    color: '#f59e0b',
    createdAt: new Date(Date.now() - 21 * 24 * 3600000).toISOString(),
  },
  {
    id: 'g3',
    name: 'Tajweed Practice',
    nameFr: 'Pratique du Tajwid',
    description: 'Perfect your Quran recitation with tajweed rules',
    descriptionFr: 'Perfectionnez votre récitation du Coran avec les règles du tajwid',
    topic: 'Tajweed',
    topicFr: 'Tajwid',
    memberCount: 25,
    maxMembers: 30,
    isActive: true,
    isJoined: false,
    goal: 'Master 1 rule/week',
    goalFr: 'Maîtriser 1 règle/semaine',
    icon: 'mic',
    color: '#f97316',
    createdAt: new Date(Date.now() - 10 * 24 * 3600000).toISOString(),
  },
  {
    id: 'g4',
    name: 'Daily Vocabulary',
    nameFr: 'Vocabulaire quotidien',
    description: 'Learn 5 new Arabic words every day as a group',
    descriptionFr: 'Apprenez 5 nouveaux mots arabes chaque jour en groupe',
    topic: 'Vocabulary',
    topicFr: 'Vocabulaire',
    memberCount: 67,
    maxMembers: 100,
    isActive: true,
    isJoined: false,
    goal: '5 words/day',
    goalFr: '5 mots/jour',
    icon: 'language',
    color: '#818cf8',
    createdAt: new Date(Date.now() - 30 * 24 * 3600000).toISOString(),
  },
  {
    id: 'g5',
    name: 'Prayer Perfection',
    nameFr: 'Perfectionner la prière',
    description: 'Learn and perfect all parts of salah together',
    descriptionFr: 'Apprenez et perfectionnez toutes les parties de la salât ensemble',
    topic: 'Prayer',
    topicFr: 'Prière',
    memberCount: 19,
    maxMembers: 25,
    isActive: false,
    isJoined: false,
    goal: 'Complete prayer guide',
    goalFr: 'Terminer le guide de prière',
    icon: 'moon',
    color: '#14b8a6',
    createdAt: new Date(Date.now() - 45 * 24 * 3600000).toISOString(),
  },
];

// ── Simulated Group Members ─────────────────────────────────────
export interface GroupMember {
  id: string;
  userId?: string;
  name: string;
  avatar: string; // first letter
  role: 'admin' | 'moderator' | 'member';
  joinedAt: string;
  streak: number;
  xp: number;
}

export interface GroupMessage {
  id: string;
  userId: string;
  authorName: string;
  avatar: string;
  body: string;
  createdAt: string;
  type: 'message' | 'milestone' | 'system' | 'chat' | 'voice' | 'image' | 'shared' | 'lesson' | 'quiz' | 'poll' | 'board';
  // Chat overhaul additions
  replyToId?: string | null;
  replyPreview?: { authorName: string; body: string; type?: string } | null;
  editedAt?: string | null;
  isDeleted?: boolean;
  imageUrl?: string;
  imageW?: number;
  imageH?: number;
  mentions?: string[];
  sharedContent?: SharedContent | null;
  classContent?: any | null;
  audioUrl?: string;
  durationMs?: number;
  waveform?: number[] | null;
}

// Rich card payload for content shared from elsewhere in the app.
export interface SharedContent {
  kind: 'word' | 'letter' | 'phrase' | 'lesson' | 'verse' | 'dua' | 'tajweed' | 'prayer';
  arabic?: string;        // headline Arabic (word, letter, phrase)
  translit?: string;      // transliteration
  translation?: string;   // meaning
  example?: string;       // optional example sentence (Arabic)
  exampleTranslation?: string;
  audioText?: string;     // Arabic text to pronounce via TTS (defaults to `arabic`)
  ref?: string;           // small caption, e.g. theme name or "Letter 3"
  route?: string;         // deep link back into the app
}

export const SIMULATED_GROUP_MEMBERS: Record<string, GroupMember[]> = {
  g1: [
    { id: 'u1', name: 'Amina K.', avatar: 'A', role: 'admin', joinedAt: new Date(Date.now() - 14 * 24 * 3600000).toISOString(), streak: 42, xp: 3200 },
    { id: 'u2', name: 'Yusuf B.', avatar: 'Y', role: 'member', joinedAt: new Date(Date.now() - 12 * 24 * 3600000).toISOString(), streak: 78, xp: 8500 },
    { id: 'u3', name: 'Fatima R.', avatar: 'F', role: 'member', joinedAt: new Date(Date.now() - 10 * 24 * 3600000).toISOString(), streak: 15, xp: 1200 },
    { id: 'u4', name: 'Omar H.', avatar: 'O', role: 'member', joinedAt: new Date(Date.now() - 8 * 24 * 3600000).toISOString(), streak: 25, xp: 2100 },
    { id: 'u5', name: 'Khadija M.', avatar: 'K', role: 'member', joinedAt: new Date(Date.now() - 6 * 24 * 3600000).toISOString(), streak: 12, xp: 850 },
    { id: 'u6', name: 'Ibrahim S.', avatar: 'I', role: 'member', joinedAt: new Date(Date.now() - 5 * 24 * 3600000).toISOString(), streak: 33, xp: 4100 },
  ],
  g2: [
    { id: 'u2', name: 'Yusuf B.', avatar: 'Y', role: 'admin', joinedAt: new Date(Date.now() - 21 * 24 * 3600000).toISOString(), streak: 78, xp: 8500 },
    { id: 'u1', name: 'Amina K.', avatar: 'A', role: 'member', joinedAt: new Date(Date.now() - 18 * 24 * 3600000).toISOString(), streak: 42, xp: 3200 },
    { id: 'u4', name: 'Omar H.', avatar: 'O', role: 'member', joinedAt: new Date(Date.now() - 15 * 24 * 3600000).toISOString(), streak: 25, xp: 2100 },
    { id: 'u7', name: 'Layla A.', avatar: 'L', role: 'member', joinedAt: new Date(Date.now() - 10 * 24 * 3600000).toISOString(), streak: 19, xp: 1600 },
  ],
  g3: [
    { id: 'u6', name: 'Ibrahim S.', avatar: 'I', role: 'admin', joinedAt: new Date(Date.now() - 10 * 24 * 3600000).toISOString(), streak: 33, xp: 4100 },
    { id: 'u3', name: 'Fatima R.', avatar: 'F', role: 'member', joinedAt: new Date(Date.now() - 8 * 24 * 3600000).toISOString(), streak: 15, xp: 1200 },
    { id: 'u5', name: 'Khadija M.', avatar: 'K', role: 'member', joinedAt: new Date(Date.now() - 5 * 24 * 3600000).toISOString(), streak: 12, xp: 850 },
  ],
  g4: [
    { id: 'u3', name: 'Fatima R.', avatar: 'F', role: 'admin', joinedAt: new Date(Date.now() - 30 * 24 * 3600000).toISOString(), streak: 15, xp: 1200 },
    { id: 'u1', name: 'Amina K.', avatar: 'A', role: 'member', joinedAt: new Date(Date.now() - 25 * 24 * 3600000).toISOString(), streak: 42, xp: 3200 },
    { id: 'u2', name: 'Yusuf B.', avatar: 'Y', role: 'member', joinedAt: new Date(Date.now() - 20 * 24 * 3600000).toISOString(), streak: 78, xp: 8500 },
    { id: 'u6', name: 'Ibrahim S.', avatar: 'I', role: 'member', joinedAt: new Date(Date.now() - 18 * 24 * 3600000).toISOString(), streak: 33, xp: 4100 },
    { id: 'u4', name: 'Omar H.', avatar: 'O', role: 'member', joinedAt: new Date(Date.now() - 12 * 24 * 3600000).toISOString(), streak: 25, xp: 2100 },
  ],
  g5: [
    { id: 'u4', name: 'Omar H.', avatar: 'O', role: 'admin', joinedAt: new Date(Date.now() - 45 * 24 * 3600000).toISOString(), streak: 25, xp: 2100 },
    { id: 'u5', name: 'Khadija M.', avatar: 'K', role: 'member', joinedAt: new Date(Date.now() - 40 * 24 * 3600000).toISOString(), streak: 12, xp: 850 },
  ],
};

export const SIMULATED_GROUP_MESSAGES: Record<string, GroupMessage[]> = {
  g1: [
    { id: 'gm1', userId: 'sys', authorName: 'System', avatar: '', body: 'Amina K. created this group', createdAt: new Date(Date.now() - 14 * 24 * 3600000).toISOString(), type: 'system' },
    { id: 'gm2', userId: 'u1', authorName: 'Amina K.', avatar: 'A', body: 'Assalamu alaikum everyone! Let\'s start with Surah An-Nas this week. Who\'s in?', createdAt: new Date(Date.now() - 13 * 24 * 3600000).toISOString(), type: 'message' },
    { id: 'gm3', userId: 'u2', authorName: 'Yusuf B.', avatar: 'Y', body: 'Wa alaikum assalam! I\'m in. I already know it but happy to revise with everyone.', createdAt: new Date(Date.now() - 13 * 24 * 3600000 + 3600000).toISOString(), type: 'message' },
    { id: 'gm4', userId: 'sys', authorName: 'System', avatar: '', body: 'Yusuf B. completed Surah An-Nas!', createdAt: new Date(Date.now() - 12 * 24 * 3600000).toISOString(), type: 'milestone' },
    { id: 'gm5', userId: 'u3', authorName: 'Fatima R.', avatar: 'F', body: 'I\'m struggling with the last ayah. Can someone share a recording?', createdAt: new Date(Date.now() - 11 * 24 * 3600000).toISOString(), type: 'message' },
    { id: 'gm6', userId: 'u6', authorName: 'Ibrahim S.', avatar: 'I', body: 'Try listening to Mishary Rashid\'s recitation — it\'s very clear and slow.', createdAt: new Date(Date.now() - 11 * 24 * 3600000 + 1800000).toISOString(), type: 'message' },
    { id: 'gm7', userId: 'sys', authorName: 'System', avatar: '', body: 'Amina K. completed Surah An-Nas!', createdAt: new Date(Date.now() - 10 * 24 * 3600000).toISOString(), type: 'milestone' },
    { id: 'gm8', userId: 'u1', authorName: 'Amina K.', avatar: 'A', body: 'Alhamdulillah done! Moving on to Surah Al-Falaq this week. Let\'s keep the momentum!', createdAt: new Date(Date.now() - 7 * 24 * 3600000).toISOString(), type: 'message' },
    { id: 'gm9', userId: 'u4', authorName: 'Omar H.', avatar: 'O', body: 'JazakAllahu khairan for the motivation. I memorized 3 surahs since joining!', createdAt: new Date(Date.now() - 3 * 24 * 3600000).toISOString(), type: 'message' },
    { id: 'gm10', userId: 'sys', authorName: 'System', avatar: '', body: 'The group has collectively memorized 12 surahs!', createdAt: new Date(Date.now() - 2 * 24 * 3600000).toISOString(), type: 'milestone' },
    { id: 'gm11', userId: 'u5', authorName: 'Khadija M.', avatar: 'K', body: 'SubhanAllah this group keeps me accountable. Best decision to join!', createdAt: new Date(Date.now() - 1 * 24 * 3600000).toISOString(), type: 'message' },
    { id: 'gm12', userId: 'u2', authorName: 'Yusuf B.', avatar: 'Y', body: 'Who wants to pair up for revision this weekend? We can quiz each other.', createdAt: new Date(Date.now() - 3 * 3600000).toISOString(), type: 'message' },
  ],
  g2: [
    { id: 'gm20', userId: 'sys', authorName: 'System', avatar: '', body: 'Yusuf B. created this group', createdAt: new Date(Date.now() - 21 * 24 * 3600000).toISOString(), type: 'system' },
    { id: 'gm21', userId: 'u2', authorName: 'Yusuf B.', avatar: 'Y', body: 'Welcome! This week we\'re covering the definite article (ال) and sun/moon letters.', createdAt: new Date(Date.now() - 20 * 24 * 3600000).toISOString(), type: 'message' },
    { id: 'gm22', userId: 'u1', authorName: 'Amina K.', avatar: 'A', body: 'I always mix up sun and moon letters. Any tricks to remember?', createdAt: new Date(Date.now() - 19 * 24 * 3600000).toISOString(), type: 'message' },
    { id: 'gm23', userId: 'u2', authorName: 'Yusuf B.', avatar: 'Y', body: 'Sun letters are the ones where your tongue touches your teeth/palate: ت ث د ذ ر ز س ش ص ض ط ظ ل ن. Moon letters are the rest!', createdAt: new Date(Date.now() - 19 * 24 * 3600000 + 3600000).toISOString(), type: 'message' },
    { id: 'gm24', userId: 'sys', authorName: 'System', avatar: '', body: 'Omar H. completed the grammar lesson on definite articles!', createdAt: new Date(Date.now() - 15 * 24 * 3600000).toISOString(), type: 'milestone' },
    { id: 'gm25', userId: 'u7', authorName: 'Layla A.', avatar: 'L', body: 'This week\'s lesson on nominal sentences was really helpful. The exercises in the app are great.', createdAt: new Date(Date.now() - 5 * 24 * 3600000).toISOString(), type: 'message' },
    { id: 'gm26', userId: 'u4', authorName: 'Omar H.', avatar: 'O', body: 'Can we do verbal sentences next? I keep confusing the verb forms.', createdAt: new Date(Date.now() - 2 * 24 * 3600000).toISOString(), type: 'message' },
  ],
  g3: [
    { id: 'gm30', userId: 'sys', authorName: 'System', avatar: '', body: 'Ibrahim S. created this group', createdAt: new Date(Date.now() - 10 * 24 * 3600000).toISOString(), type: 'system' },
    { id: 'gm31', userId: 'u6', authorName: 'Ibrahim S.', avatar: 'I', body: 'This week\'s focus: Ikhfa (concealment). Practice with Surah Al-Baqarah ayah 1-5.', createdAt: new Date(Date.now() - 9 * 24 * 3600000).toISOString(), type: 'message' },
    { id: 'gm32', userId: 'u3', authorName: 'Fatima R.', avatar: 'F', body: 'How do I know when to apply ikhfa vs idgham? They sound similar to me.', createdAt: new Date(Date.now() - 8 * 24 * 3600000).toISOString(), type: 'message' },
    { id: 'gm33', userId: 'u6', authorName: 'Ibrahim S.', avatar: 'I', body: 'Ikhfa = noon sakin followed by any letter except ي ر م ل و ن ب. The sound is between izhar and idgham — like a nasal hum.', createdAt: new Date(Date.now() - 8 * 24 * 3600000 + 1800000).toISOString(), type: 'message' },
    { id: 'gm34', userId: 'sys', authorName: 'System', avatar: '', body: 'Khadija M. completed the Ikhfa practice session!', createdAt: new Date(Date.now() - 4 * 24 * 3600000).toISOString(), type: 'milestone' },
  ],
  g4: [
    { id: 'gm40', userId: 'sys', authorName: 'System', avatar: '', body: 'Fatima R. created this group', createdAt: new Date(Date.now() - 30 * 24 * 3600000).toISOString(), type: 'system' },
    { id: 'gm41', userId: 'u3', authorName: 'Fatima R.', avatar: 'F', body: 'Today\'s words: كتاب (book), قلم (pen), مدرسة (school), طالب (student), معلم (teacher)', createdAt: new Date(Date.now() - 2 * 24 * 3600000).toISOString(), type: 'message' },
    { id: 'gm42', userId: 'u1', authorName: 'Amina K.', avatar: 'A', body: 'I learned 150 words this month thanks to this group! The daily format really works.', createdAt: new Date(Date.now() - 1 * 24 * 3600000).toISOString(), type: 'message' },
    { id: 'gm43', userId: 'sys', authorName: 'System', avatar: '', body: 'The group has learned over 500 words collectively!', createdAt: new Date(Date.now() - 12 * 3600000).toISOString(), type: 'milestone' },
    { id: 'gm44', userId: 'u6', authorName: 'Ibrahim S.', avatar: 'I', body: 'Suggestion: can we do food vocabulary this week? Would be useful for everyday conversations.', createdAt: new Date(Date.now() - 5 * 3600000).toISOString(), type: 'message' },
  ],
  g5: [
    { id: 'gm50', userId: 'sys', authorName: 'System', avatar: '', body: 'Omar H. created this group', createdAt: new Date(Date.now() - 45 * 24 * 3600000).toISOString(), type: 'system' },
    { id: 'gm51', userId: 'u4', authorName: 'Omar H.', avatar: 'O', body: 'We\'re starting with the basics of wudu. Make sure to watch the video lesson first.', createdAt: new Date(Date.now() - 44 * 24 * 3600000).toISOString(), type: 'message' },
    { id: 'gm52', userId: 'u5', authorName: 'Khadija M.', avatar: 'K', body: 'Thanks for creating this group! I really need to improve my salah.', createdAt: new Date(Date.now() - 43 * 24 * 3600000).toISOString(), type: 'message' },
  ],
};

// ── Simulated Reactions (by message ID) ─────────────────────────
export const SIMULATED_REACTIONS: Record<string, MessageReaction[]> = {
  gm2: [
    { id: 'rx1', messageId: 'gm2', userId: 'u2', emoji: '❤️', createdAt: new Date(Date.now() - 13 * 24 * 3600000).toISOString() },
    { id: 'rx2', messageId: 'gm2', userId: 'u3', emoji: '🤲', createdAt: new Date(Date.now() - 13 * 24 * 3600000).toISOString() },
    { id: 'rx3', messageId: 'gm2', userId: 'u6', emoji: '🔥', createdAt: new Date(Date.now() - 12 * 24 * 3600000).toISOString() },
  ],
  gm8: [
    { id: 'rx4', messageId: 'gm8', userId: 'u2', emoji: '🔥', createdAt: new Date(Date.now() - 7 * 24 * 3600000).toISOString() },
    { id: 'rx5', messageId: 'gm8', userId: 'u4', emoji: '👍', createdAt: new Date(Date.now() - 7 * 24 * 3600000).toISOString() },
  ],
  gm9: [
    { id: 'rx6', messageId: 'gm9', userId: 'u1', emoji: 'ماشاءالله', createdAt: new Date(Date.now() - 3 * 24 * 3600000).toISOString() },
    { id: 'rx7', messageId: 'gm9', userId: 'u6', emoji: '❤️', createdAt: new Date(Date.now() - 3 * 24 * 3600000).toISOString() },
    { id: 'rx8', messageId: 'gm9', userId: 'u3', emoji: 'بارك الله', createdAt: new Date(Date.now() - 3 * 24 * 3600000).toISOString() },
  ],
  gm11: [
    { id: 'rx9', messageId: 'gm11', userId: 'u1', emoji: '❤️', createdAt: new Date(Date.now() - 1 * 24 * 3600000).toISOString() },
    { id: 'rx10', messageId: 'gm11', userId: 'u2', emoji: '👍', createdAt: new Date(Date.now() - 1 * 24 * 3600000).toISOString() },
  ],
  gm12: [
    { id: 'rx11', messageId: 'gm12', userId: 'u1', emoji: '👍', createdAt: new Date(Date.now() - 3 * 3600000).toISOString() },
    { id: 'rx12', messageId: 'gm12', userId: 'u5', emoji: '🔥', createdAt: new Date(Date.now() - 2 * 3600000).toISOString() },
  ],
};

// ── Simulated Sessions (by group ID) ───────────────────────────
export const SIMULATED_SESSIONS: Record<string, StudySession[]> = {
  g1: [
    {
      id: 'sess1',
      groupId: 'g1',
      creatorId: 'u1',
      creatorName: 'Amina K.',
      title: 'Surah Al-Mulk Revision',
      description: 'Let\'s revise Surah Al-Mulk together and quiz each other',
      scheduledAt: new Date(Date.now() + 2 * 24 * 3600000).toISOString(),
      durationMinutes: 60,
      attendeeCount: 4,
      userRsvp: null,
      createdAt: new Date(Date.now() - 1 * 24 * 3600000).toISOString(),
    },
    {
      id: 'sess2',
      groupId: 'g1',
      creatorId: 'u2',
      creatorName: 'Yusuf B.',
      title: 'Weekend Memorization Sprint',
      description: 'Dedicated session to memorize new ayahs together',
      scheduledAt: new Date(Date.now() + 5 * 24 * 3600000).toISOString(),
      durationMinutes: 90,
      attendeeCount: 2,
      userRsvp: null,
      createdAt: new Date(Date.now() - 3 * 3600000).toISOString(),
    },
  ],
  g2: [
    {
      id: 'sess3',
      groupId: 'g2',
      creatorId: 'u2',
      creatorName: 'Yusuf B.',
      title: 'Verbal Sentences Workshop',
      description: 'Deep dive into Arabic verbal sentences and verb forms',
      scheduledAt: new Date(Date.now() + 3 * 24 * 3600000).toISOString(),
      durationMinutes: 45,
      attendeeCount: 3,
      userRsvp: null,
      createdAt: new Date(Date.now() - 2 * 24 * 3600000).toISOString(),
    },
  ],
};

// ── Simulated Challenges (by group ID) ─────────────────────────
export const SIMULATED_CHALLENGES: Record<string, GroupChallenge[]> = {
  g1: [
    {
      id: 'ch1',
      groupId: 'g1',
      creatorId: 'u1',
      creatorName: 'Amina K.',
      title: 'Memorize 5 Surahs This Month',
      targetType: 'surah',
      targetValue: 5,
      currentValue: 3,
      participantCount: 6,
      startDate: new Date(Date.now() - 15 * 24 * 3600000).toISOString(),
      endDate: new Date(Date.now() + 15 * 24 * 3600000).toISOString(),
      isActive: true,
      createdAt: new Date(Date.now() - 15 * 24 * 3600000).toISOString(),
    },
  ],
  g2: [
    {
      id: 'ch2',
      groupId: 'g2',
      creatorId: 'u2',
      creatorName: 'Yusuf B.',
      title: 'Complete 10 Grammar Lessons',
      targetType: 'lessons',
      targetValue: 10,
      currentValue: 7,
      participantCount: 4,
      startDate: new Date(Date.now() - 10 * 24 * 3600000).toISOString(),
      endDate: new Date(Date.now() + 4 * 24 * 3600000).toISOString(),
      isActive: true,
      createdAt: new Date(Date.now() - 10 * 24 * 3600000).toISOString(),
    },
  ],
  g4: [
    {
      id: 'ch3',
      groupId: 'g4',
      creatorId: 'u3',
      creatorName: 'Fatima R.',
      title: 'Learn 100 New Words',
      targetType: 'words',
      targetValue: 100,
      currentValue: 68,
      participantCount: 5,
      startDate: new Date(Date.now() - 20 * 24 * 3600000).toISOString(),
      endDate: new Date(Date.now() + 10 * 24 * 3600000).toISOString(),
      isActive: true,
      createdAt: new Date(Date.now() - 20 * 24 * 3600000).toISOString(),
    },
  ],
};

// ── Simulated Group Leaderboard (by group ID) ──────────────────
export interface GroupLeaderboardEntry {
  userId: string;
  name: string;
  avatar: string;
  xp: number;
  streak: number;
  messageCount: number;
}

export const SIMULATED_GROUP_LEADERBOARD: Record<string, GroupLeaderboardEntry[]> = {
  g1: [
    { userId: 'u2', name: 'Yusuf B.', avatar: 'Y', xp: 8500, streak: 78, messageCount: 45 },
    { userId: 'u6', name: 'Ibrahim S.', avatar: 'I', xp: 4100, streak: 33, messageCount: 32 },
    { userId: 'u1', name: 'Amina K.', avatar: 'A', xp: 3200, streak: 42, messageCount: 28 },
    { userId: 'u4', name: 'Omar H.', avatar: 'O', xp: 2100, streak: 25, messageCount: 15 },
    { userId: 'u3', name: 'Fatima R.', avatar: 'F', xp: 1200, streak: 15, messageCount: 12 },
    { userId: 'u5', name: 'Khadija M.', avatar: 'K', xp: 850, streak: 12, messageCount: 8 },
  ],
  g2: [
    { userId: 'u2', name: 'Yusuf B.', avatar: 'Y', xp: 8500, streak: 78, messageCount: 38 },
    { userId: 'u1', name: 'Amina K.', avatar: 'A', xp: 3200, streak: 42, messageCount: 20 },
    { userId: 'u4', name: 'Omar H.', avatar: 'O', xp: 2100, streak: 25, messageCount: 18 },
    { userId: 'u7', name: 'Layla A.', avatar: 'L', xp: 1600, streak: 19, messageCount: 10 },
  ],
  g3: [
    { userId: 'u6', name: 'Ibrahim S.', avatar: 'I', xp: 4100, streak: 33, messageCount: 25 },
    { userId: 'u3', name: 'Fatima R.', avatar: 'F', xp: 1200, streak: 15, messageCount: 14 },
    { userId: 'u5', name: 'Khadija M.', avatar: 'K', xp: 850, streak: 12, messageCount: 6 },
  ],
  g4: [
    { userId: 'u2', name: 'Yusuf B.', avatar: 'Y', xp: 8500, streak: 78, messageCount: 22 },
    { userId: 'u6', name: 'Ibrahim S.', avatar: 'I', xp: 4100, streak: 33, messageCount: 20 },
    { userId: 'u1', name: 'Amina K.', avatar: 'A', xp: 3200, streak: 42, messageCount: 18 },
    { userId: 'u4', name: 'Omar H.', avatar: 'O', xp: 2100, streak: 25, messageCount: 12 },
    { userId: 'u3', name: 'Fatima R.', avatar: 'F', xp: 1200, streak: 15, messageCount: 10 },
  ],
};

// ── Simulated Study Partners ────────────────────────────────────
export const SIMULATED_PARTNERS: StudyPartner[] = [
  {
    id: 'p1',
    name: 'Amina K.',
    level: 'intermediate',
    streak: 42,
    xp: 3200,
    interests: ['Quran', 'Tajweed', 'Vocabulary'],
    matchScore: 92,
    isConnected: false,
    lastActive: new Date(Date.now() - 300000).toISOString(),
  },
  {
    id: 'p2',
    name: 'Yusuf B.',
    level: 'advanced',
    streak: 78,
    xp: 8500,
    interests: ['Grammar', 'Reading', 'Quran'],
    matchScore: 85,
    isConnected: false,
    lastActive: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: 'p3',
    name: 'Khadija M.',
    level: 'beginner',
    streak: 12,
    xp: 850,
    interests: ['Alphabet', 'Vocabulary', 'Prayer'],
    matchScore: 78,
    isConnected: false,
    lastActive: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'p4',
    name: 'Hassan D.',
    level: 'intermediate',
    streak: 25,
    xp: 2100,
    interests: ['Quran', 'Grammar', 'Duas'],
    matchScore: 73,
    isConnected: false,
    lastActive: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'p5',
    name: 'Fatima R.',
    level: 'beginner',
    streak: 8,
    xp: 420,
    interests: ['Alphabet', 'Vocabulary'],
    matchScore: 68,
    isConnected: false,
    lastActive: new Date(Date.now() - 14400000).toISOString(),
  },
];

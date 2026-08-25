import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { PollContent } from '../../../types/classContent';
import { submitClassResponse, fetchClassResponses, ClassResponseRow } from '../../../services/communitySocialService';

interface Props {
  messageId: string;
  groupId: string;
  poll: PollContent;
  groupColor: string;
  authorName: string;
  userId?: string;
  userName: string;
}

export const PollCard = React.memo(function PollCard({ messageId, groupId, poll, groupColor, authorName, userId, userName }: Props) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<number[]>([]);
  const [voted, setVoted] = useState(false);
  const [responses, setResponses] = useState<ClassResponseRow[]>([]);
  const [loading, setLoading] = useState(true);

  const isLocal = messageId.startsWith('local-');

  useEffect(() => {
    let alive = true;
    (async () => {
      if (isLocal) { setLoading(false); return; }
      const rows = await fetchClassResponses(messageId);
      if (!alive) return;
      setResponses(rows);
      const mine = rows.find((r) => r.user_id === userId);
      if (mine?.response.choices) { setSelected(mine.response.choices); setVoted(true); }
      setLoading(false);
    })();
    return () => { alive = false; };
  }, [messageId, userId, isLocal]);

  const toggle = (i: number) => {
    if (voted) return;
    setSelected((prev) => {
      if (poll.allowMultiple) return prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i];
      return [i];
    });
  };

  const handleVote = async () => {
    if (selected.length === 0) return;
    setVoted(true);
    if (!isLocal && userId) {
      await submitClassResponse(messageId, groupId, userId, userName, { choices: selected });
      const rows = await fetchClassResponses(messageId, true);
      setResponses(rows);
    }
  };

  // Tally
  const counts = poll.options.map((_, i) => responses.filter((r) => (r.response.choices || []).includes(i)).length);
  const totalVoters = responses.length || (voted ? 1 : 0);
  const showResults = voted;

  return (
    <View style={styles.card}>
      <View style={[styles.band, { backgroundColor: `${groupColor}18` }]}>
        <View style={[styles.badge, { backgroundColor: groupColor }]}>
          <Ionicons name="stats-chart" size={13} color="#ffffff" />
          <Text style={styles.badgeText}>{t('community.badgePoll')}</Text>
        </View>
        <Text style={styles.byline} numberOfLines={1}>{authorName}</Text>
      </View>

      <View style={styles.body}>
        <Text style={styles.question}>{poll.question}</Text>

        {loading ? (
          <ActivityIndicator color={groupColor} style={{ marginVertical: 12 }} />
        ) : (
          <>
            {poll.options.map((opt, i) => {
              const pct = totalVoters > 0 ? Math.round((counts[i] / totalVoters) * 100) : 0;
              const isSel = selected.includes(i);
              return (
                <Pressable key={i} onPress={() => toggle(i)} style={[styles.option, isSel && !voted && { borderColor: groupColor }]}>
                  {showResults && <View style={[styles.fill, { width: `${pct}%`, backgroundColor: `${groupColor}2e` }]} />}
                  <View style={styles.optContent}>
                    {!voted && (
                      <Ionicons
                        name={poll.allowMultiple ? (isSel ? 'checkbox' : 'square-outline') : (isSel ? 'radio-button-on' : 'radio-button-off')}
                        size={18}
                        color={isSel ? groupColor : '#475569'}
                      />
                    )}
                    <Text style={[styles.optText, isSel && voted && { fontWeight: '700' }]}>{opt}</Text>
                    {showResults && <Text style={styles.pct}>{pct}%</Text>}
                  </View>
                </Pressable>
              );
            })}

            {!voted ? (
              <Pressable disabled={selected.length === 0} onPress={handleVote} style={[styles.voteBtn, { backgroundColor: groupColor }, selected.length === 0 && { opacity: 0.4 }]}>
                <Text style={styles.voteText}>{t('community.vote')}</Text>
              </Pressable>
            ) : (
              <Text style={styles.totalText}>{totalVoters} vote{totalVoters === 1 ? '' : 's'}</Text>
            )}
          </>
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: { width: '100%', backgroundColor: '#1e293b', borderRadius: 16, borderWidth: 1, borderColor: '#334155', overflow: 'hidden' },
  band: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 8 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  badgeText: { fontSize: 10, fontWeight: '800', color: '#ffffff', letterSpacing: 0.6 },
  byline: { fontSize: 12, color: '#94a3b8', maxWidth: 130 },
  body: { padding: 14 },
  question: { fontSize: 17, fontWeight: '800', color: '#f8fafc', marginBottom: 12, lineHeight: 23 },
  option: { borderRadius: 10, borderWidth: 1, borderColor: '#334155', backgroundColor: '#0f172a', marginBottom: 8, overflow: 'hidden', minHeight: 44, justifyContent: 'center' },
  fill: { position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: 9 },
  optContent: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, paddingVertical: 11 },
  optText: { flex: 1, fontSize: 14.5, color: '#e2e8f0', lineHeight: 20 },
  pct: { fontSize: 13, fontWeight: '700', color: '#cbd5e1' },
  voteBtn: { paddingVertical: 11, borderRadius: 12, alignItems: 'center', marginTop: 4 },
  voteText: { color: '#ffffff', fontWeight: '700', fontSize: 15 },
  totalText: { fontSize: 12, color: '#64748b', textAlign: 'center', marginTop: 4 },
});

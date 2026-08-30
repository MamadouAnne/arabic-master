import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StudySession } from '../../types/community';
import { color, radius } from '../../theme/tokens';
import { withAlpha } from '../ui/Primitives';

interface Props {
  session: StudySession;
  groupColor: string;
  onRsvp: (sessionId: string, status: 'going' | 'not_going') => void;
  isPast?: boolean;
}

export function SessionCard({ session, groupColor, onRsvp, isPast }: Props) {
  const { t } = useTranslation();
  const [countdown, setCountdown] = useState('');

  useEffect(() => {
    const update = () => {
      const diff = new Date(session.scheduledAt).getTime() - Date.now();
      if (diff <= 0) {
        setCountdown('Now');
        return;
      }
      const days = Math.floor(diff / (24 * 3600000));
      const hours = Math.floor((diff % (24 * 3600000)) / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      if (days > 0) setCountdown(`${days}d ${hours}h`);
      else if (hours > 0) setCountdown(`${hours}h ${mins}m`);
      else setCountdown(`${mins}m`);
    };
    update();
    const timer = setInterval(update, 60000);
    return () => clearInterval(timer);
  }, [session.scheduledAt]);

  const date = new Date(session.scheduledAt);
  const dateStr = date.toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' });
  const timeStr = date.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' });

  return (
    <View style={[styles.card, isPast && styles.cardPast]}>
      <View style={styles.topRow}>
        <View style={[styles.iconCircle, { backgroundColor: `${groupColor}20` }]}>
          <Ionicons name="calendar" size={18} color={isPast ? '#64748b' : groupColor} />
        </View>
        <View style={styles.info}>
          <Text style={[styles.title, isPast && styles.textPast]}>{session.title}</Text>
          <Text style={styles.datetime}>{dateStr} at {timeStr} · {session.durationMinutes}min</Text>
        </View>
        {!isPast && (
          <View style={[styles.countdownBadge, { backgroundColor: `${groupColor}20` }]}>
            <Text style={[styles.countdownText, { color: groupColor }]}>{countdown}</Text>
          </View>
        )}
      </View>

      {session.description ? (
        <Text style={styles.description} numberOfLines={2}>{session.description}</Text>
      ) : null}

      <View style={styles.bottomRow}>
        <View style={styles.attendeeInfo}>
          <Ionicons name="people" size={14} color={color.textFaint} />
          <Text style={styles.attendeeText}>{session.attendeeCount === 0 ? 'No one yet — be the first!' : `${session.attendeeCount} going`}</Text>
        </View>

        {!isPast && (
          <View style={styles.rsvpRow}>
            <Pressable
              style={[styles.rsvpBtn, session.userRsvp === 'going' && { backgroundColor: `${groupColor}25`, borderColor: groupColor }]}
              onPress={() => onRsvp(session.id, 'going')}
            >
              <Ionicons name="checkmark" size={14} color={session.userRsvp === 'going' ? groupColor: color.textFaint} />
              <Text style={[styles.rsvpText, session.userRsvp === 'going' && { color: groupColor }]}>{t('community.going')}</Text>
            </Pressable>
            <Pressable
              style={[styles.rsvpBtn, session.userRsvp === 'not_going' && { backgroundColor: withAlpha(color.danger, 0.13), borderColor: color.danger }]}
              onPress={() => onRsvp(session.id, 'not_going')}
            >
              <Ionicons name="close" size={14} color={session.userRsvp === 'not_going' ? '#ef4444' : '#64748b'} />
              <Text style={[styles.rsvpText, session.userRsvp === 'not_going' && { color: color.danger }]}>{t('community.cant')}</Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: color.surface, borderRadius: radius.md, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: color.border },
  cardPast: { opacity: 0.6 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  iconCircle: { width: 36, height: 36, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1 },
  title: { fontSize: 14, fontWeight: '700', color: color.text, marginBottom: 2 },
  textPast: { color: color.textMuted },
  datetime: { fontSize: 12, color: color.textFaint },
  countdownBadge: { borderRadius: radius.sm, paddingHorizontal: 8, paddingVertical: 4 },
  countdownText: { fontSize: 12, fontWeight: '700' },
  description: { fontSize: 13, color: color.textMuted, lineHeight: 18, marginBottom: 10 },
  bottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  attendeeInfo: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  attendeeText: { fontSize: 12, color: color.textFaint },
  rsvpRow: { flexDirection: 'row', gap: 6 },
  rsvpBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: radius.sm, borderWidth: 1, borderColor: color.border },
  rsvpText: { fontSize: 12, fontWeight: '600', color: color.textFaint },
});

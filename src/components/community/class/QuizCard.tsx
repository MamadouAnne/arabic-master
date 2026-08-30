import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet, Pressable, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { QuizContent } from '../../../types/classContent';
import { submitClassResponse, fetchClassResponses, ClassResponseRow } from '../../../services/communitySocialService';
import { renderRichText } from './richText';
import { color, radius } from '../../../theme/tokens';

interface Props {
  messageId: string;
  groupId: string;
  quiz: QuizContent;
  groupColor: string;
  authorName: string;
  userId?: string;
  userName: string;
  isAuthor: boolean;
}

export const QuizCard = React.memo(function QuizCard({ messageId, groupId, quiz, groupColor, authorName, userId, userName, isAuthor }: Props) {
  const { t } = useTranslation();
  const [answers, setAnswers] = useState<Record<string, number | string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [responses, setResponses] = useState<ClassResponseRow[]>([]);
  const [showResults, setShowResults] = useState(false);

  const isLocal = messageId.startsWith('local-');

  // Hydrate any prior answer in the background — the quiz renders at full height
  // immediately so scrolling never sees a spinner→content resize jump.
  useEffect(() => {
    let alive = true;
    if (isLocal) return;
    (async () => {
      const rows = await fetchClassResponses(messageId);
      if (!alive) return;
      setResponses(rows);
      const mine = rows.find((r) => r.user_id === userId);
      if (mine) {
        setAnswers(mine.response.answers || {});
        setScore(mine.score ?? null);
        setSubmitted(true);
      }
    })();
    return () => { alive = false; };
  }, [messageId, userId, isLocal]);

  const grade = useCallback(() => {
    let correct = 0;
    for (const q of quiz.questions) {
      const a = answers[q.id];
      if (q.type === 'multiple_choice') {
        if (a === q.correctIndex) correct++;
      } else if (typeof a === 'string' && q.correctText) {
        if (a.trim().toLowerCase() === q.correctText.trim().toLowerCase()) correct++;
      }
    }
    return Math.round((correct / quiz.questions.length) * 100);
  }, [answers, quiz]);

  const handleSubmit = async () => {
    const s = grade();
    setScore(s);
    setSubmitted(true);
    if (!isLocal && userId) {
      await submitClassResponse(messageId, groupId, userId, userName, { answers }, s >= quiz.passingScore, s);
      const rows = await fetchClassResponses(messageId, true);
      setResponses(rows);
    }
  };

  const answeredAll = quiz.questions.every((q) => answers[q.id] !== undefined && answers[q.id] !== '');
  const passed = score !== null && score >= quiz.passingScore;

  const isCorrect = (qId: string, val: number | string, q: QuizContent['questions'][number]) =>
    q.type === 'multiple_choice' ? val === q.correctIndex : typeof val === 'string' && !!q.correctText && val.trim().toLowerCase() === q.correctText.trim().toLowerCase();

  return (
    <View style={styles.card}>
      <View style={[styles.band, { backgroundColor: `${groupColor}18` }]}>
        <View style={[styles.badge, { backgroundColor: groupColor }]}>
          <Ionicons name="help-circle" size={13} color={color.text} />
          <Text style={styles.badgeText}>{t('community.badgeQuiz')}</Text>
        </View>
        <Text style={styles.byline} numberOfLines={1}>{authorName}</Text>
      </View>

      <View style={styles.body}>
        <Text style={styles.title}>{quiz.title}</Text>

        <>
            {quiz.questions.map((q, qi) => {
              const a = answers[q.id];
              return (
                <View key={q.id} style={styles.question}>
                  <Text style={styles.prompt}>{qi + 1}. {renderRichText(q.prompt)}</Text>

                  {q.type === 'multiple_choice' ? (
                    (q.options || []).map((opt, oi) => {
                      const selected = a === oi;
                      const revealCorrect = submitted && oi === q.correctIndex;
                      const revealWrong = submitted && selected && oi !== q.correctIndex;
                      return (
                        <Pressable
                          key={oi}
                          disabled={submitted}
                          onPress={() => setAnswers((prev) => ({ ...prev, [q.id]: oi }))}
                          style={[
                            styles.option,
                            selected && !submitted && { borderColor: groupColor, backgroundColor: `${groupColor}18` },
                            revealCorrect && styles.optCorrect,
                            revealWrong && styles.optWrong,
                          ]}
                        >
                          <Ionicons
                            name={revealCorrect ? 'checkmark-circle' : revealWrong ? 'close-circle' : selected ? 'radio-button-on' : 'radio-button-off'}
                            size={18}
                            color={revealCorrect ? '#10b981' : revealWrong ? '#ef4444' : selected ? groupColor: color.textFaint}
                          />
                          <Text style={styles.optText}>{renderRichText(opt)}</Text>
                        </Pressable>
                      );
                    })
                  ) : (
                    <TextInput
                      style={[styles.blankInput, submitted && (isCorrect(q.id, a, q) ? styles.optCorrect : styles.optWrong)]}
                      placeholder={t('community.yourAnswerPlaceholder')}
                      placeholderTextColor={color.textFaint}
                      value={(a as string) || ''}
                      editable={!submitted}
                      onChangeText={(t) => setAnswers((prev) => ({ ...prev, [q.id]: t }))}
                    />
                  )}

                  {submitted && q.explanation ? (
                    <View style={styles.explBox}>
                      <Ionicons name="information-circle" size={14} color="#38bdf8" />
                      <Text style={styles.explText}>{q.explanation}</Text>
                    </View>
                  ) : null}
                </View>
              );
            })}

            {!submitted ? (
              <Pressable
                disabled={!answeredAll}
                onPress={handleSubmit}
                style={[styles.submitBtn, { backgroundColor: groupColor }, !answeredAll && { opacity: 0.4 }]}
              >
                <Text style={styles.submitText}>{t('community.submitAnswers')}</Text>
              </Pressable>
            ) : (
              <View style={[styles.scoreBox, { borderColor: passed ? '#10b981' : '#f59e0b' }]}>
                <Ionicons name={passed ? 'trophy' : 'ribbon'} size={20} color={passed ? '#10b981' : '#f59e0b'} />
                <Text style={styles.scoreText}>{t('community.youScored', { score })}{passed ? t('community.passedSuffix') : ''}</Text>
              </View>
            )}

            {isAuthor && !isLocal && (
              <Pressable style={styles.resultsToggle} onPress={() => setShowResults((v) => !v)}>
                <Ionicons name="bar-chart" size={15} color={groupColor} />
                <Text style={[styles.resultsText, { color: groupColor }]}>
                  {showResults ? 'Hide' : 'View'} results ({responses.length} answered)
                </Text>
              </Pressable>
            )}

            {isAuthor && showResults && (
              <View style={styles.resultsBox}>
                <Text style={styles.resultsLine}>
                  {responses.length} student{responses.length === 1 ? '' : 's'} answered
                  {responses.length > 0 ? ` · avg ${Math.round(responses.reduce((s, r) => s + (r.score || 0), 0) / responses.length)}%` : ''}
                </Text>
                {responses.map((r) => (
                  <View key={r.id} style={styles.resultRow}>
                    <Text style={styles.resultName} numberOfLines={1}>{r.user_name}</Text>
                    <Text style={[styles.resultScore, { color: (r.score || 0) >= quiz.passingScore ? '#10b981' : '#f59e0b' }]}>{r.score}%</Text>
                  </View>
                ))}
              </View>
            )}
        </>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: { width: '100%', backgroundColor: color.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: color.border, overflow: 'hidden' },
  band: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 8 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.sm },
  badgeText: { fontSize: 10, fontWeight: '800', color: color.text, letterSpacing: 0.6 },
  byline: { fontSize: 12, color: color.textMuted, maxWidth: 130 },
  body: { padding: 14 },
  title: { fontSize: 18, fontWeight: '800', color: color.text, marginBottom: 12 },
  question: { marginBottom: 16 },
  prompt: { fontSize: 15, fontWeight: '600', color: color.text, lineHeight: 22, marginBottom: 8 },
  option: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, paddingVertical: 10, borderRadius: radius.sm, borderWidth: 1, borderColor: color.border, backgroundColor: color.bg, marginBottom: 6 },
  optText: { flex: 1, fontSize: 14.5, color: color.text, lineHeight: 20 },
  optCorrect: { borderColor: color.progress, backgroundColor: 'rgba(16,185,129,0.12)' },
  optWrong: { borderColor: color.danger, backgroundColor: 'rgba(239,68,68,0.12)' },
  blankInput: { backgroundColor: color.bg, borderRadius: radius.sm, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, color: color.text, borderWidth: 1, borderColor: color.border },
  explBox: { flexDirection: 'row', gap: 6, marginTop: 8, padding: 8, borderRadius: radius.sm, backgroundColor: 'rgba(56,189,248,0.1)' },
  explText: { flex: 1, fontSize: 13, color: color.textMuted, lineHeight: 19 },
  submitBtn: { paddingVertical: 12, borderRadius: radius.md, alignItems: 'center', marginTop: 4 },
  submitText: { color: color.text, fontWeight: '700', fontSize: 15 },
  scoreBox: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1.5, borderRadius: radius.md, padding: 12, justifyContent: 'center' },
  scoreText: { fontSize: 15, fontWeight: '700', color: color.text },
  resultsToggle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 12, paddingVertical: 6 },
  resultsText: { fontSize: 13, fontWeight: '600' },
  resultsBox: { marginTop: 8, padding: 10, borderRadius: radius.sm, backgroundColor: color.bg },
  resultsLine: { fontSize: 13, fontWeight: '700', color: color.text, marginBottom: 8 },
  resultRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 4 },
  resultName: { flex: 1, fontSize: 13, color: color.textMuted },
  resultScore: { fontSize: 13, fontWeight: '700' },
});

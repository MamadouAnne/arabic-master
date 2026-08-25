import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ChatMessage } from '../../types/aiChat';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n';

/** Blinking gold cursor shown at end of streaming text */
function StreamingCursor() {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0, duration: 400, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <Animated.Text style={[styles.streamingCursor, { opacity }]}>|</Animated.Text>
  );
}

export interface QuizOptionData {
  letter: string;
  text: string;
}

interface Props {
  message: ChatMessage;
  speakingMessageId?: string | null;
  onSpeak?: (messageId: string, arabicText: string) => void;
  onQuizAnswer?: (answer: string) => void;
  isStreamingMessage?: boolean;
  isLatestAssistant?: boolean;
  /** Quiz options to re-attach on "try again" messages */
  retryOptions?: QuizOptionData[];
}

/** Detect Arabic characters to style them with gold color */
const ARABIC_REGEX = /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]+(?:\s+[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]+)*/g;

/** Detect MCQ option lines: A) text, B) text, etc. */
const MCQ_OPTION_REGEX = /^([A-D])\)\s+(.+)$/;

/** Check if content is an error sentinel */
function getErrorKey(content: string): string | null {
  const match = content.match(/^__error:(\w+)__$/);
  return match ? match[1] : null;
}

/** Extract all Arabic text segments from content */
function extractArabicText(content: string): string {
  const matches = content.match(ARABIC_REGEX);
  if (!matches) return '';
  return matches.join('\u060C '); // Arabic comma separator
}

/**
 * Strip unsupported markdown syntax so it doesn't leak as raw text.
 */
function cleanMarkdown(text: string): string {
  return text
    .replace(/\[\[(.*?)\]\]/g, '$1')
    .replace(/(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g, '$1')
    .replace(/^#{1,3}\s+(.+)$/gm, '**$1**')
    .replace(/^---+$/gm, '');
}

interface QuizOption {
  letter: string;
  text: string;
}

/**
 * Extract MCQ options from a paragraph's lines.
 * Returns null if the paragraph doesn't contain a valid MCQ block.
 */
function extractQuizOptions(lines: string[]): { questionLines: string[]; options: QuizOption[] } | null {
  const options: QuizOption[] = [];
  const questionLines: string[] = [];

  for (const line of lines) {
    const match = line.trim().match(MCQ_OPTION_REGEX);
    if (match) {
      options.push({ letter: match[1], text: match[2] });
    } else {
      // Only count as question line if we haven't started seeing options yet
      if (options.length === 0) {
        questionLines.push(line);
      }
    }
  }

  // Need at least 2 options to be a valid MCQ
  if (options.length >= 2) {
    return { questionLines, options };
  }
  return null;
}

export function AIChatBubble({
  message,
  speakingMessageId,
  onSpeak,
  onQuizAnswer,
  isStreamingMessage,
  isLatestAssistant,
  retryOptions,
}: Props) {
  const { t } = useTranslation();
  const isUser = message.role === 'user';

  // Handle error messages
  const errorKey = getErrorKey(message.content);
  if (errorKey) {
    const errorMessages: Record<string, string> = {
      offline: t('ai.offline'),
      rate_limit: t('ai.rateLimit'),
      no_credits: t('ai.noCredits'),
      auth: t('ai.errorAuth'),
      generic: t('ai.errorGeneric'),
    };
    return (
      <View style={[styles.bubble, styles.errorBubble]}>
        <Text style={styles.errorText}>
          {errorMessages[errorKey] || errorMessages.generic}
        </Text>
      </View>
    );
  }

  const arabicText = !isUser && !isStreamingMessage ? extractArabicText(message.content) : '';
  const isSpeaking = speakingMessageId === message.id;

  return (
    <View style={[styles.bubble, isUser ? styles.userBubble : styles.assistantBubble]}>
      <View style={[styles.contentContainer, isUser && styles.userContent]}>
        {isUser
          ? <Text style={styles.userText}>{message.content}</Text>
          : renderAssistantContent(message.content, isLatestAssistant && !isStreamingMessage ? onQuizAnswer : undefined)
        }
        {isStreamingMessage && <StreamingCursor />}
        {retryOptions && retryOptions.length > 0 && onQuizAnswer && (
          <>
            <Text style={styles.tapHint}>{t('ai.tapTryAgain')}</Text>
            <View style={styles.quizOptionsContainer}>
              {retryOptions.map((opt) => (
                <Pressable
                  key={opt.letter}
                  style={({ pressed }) => [
                    styles.quizOption,
                    pressed && styles.quizOptionPressed,
                  ]}
                  onPress={() => onQuizAnswer(`${opt.letter}) ${opt.text}`)}
                >
                  <View style={styles.quizOptionRow}>
                    <View style={styles.quizOptionLetterBadge}>
                      <Text style={styles.quizOptionLetterText}>{opt.letter}</Text>
                    </View>
                    <Text style={styles.quizOptionText}>{opt.text}</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </>
        )}
        {arabicText.length > 0 && onSpeak && (
          <Pressable
            style={styles.speakButton}
            onPress={() => onSpeak(message.id, arabicText)}
            hitSlop={8}
          >
            <Ionicons
              name={isSpeaking ? 'stop-circle-outline' : 'volume-high-outline'}
              size={18}
              color={isSpeaking ? '#f59e0b' : '#64748b'}
            />
          </Pressable>
        )}
      </View>
    </View>
  );
}

/**
 * Renders assistant content as structured blocks.
 * Detects MCQ options and renders them as interactive buttons.
 */
function renderAssistantContent(content: string, onQuizAnswer?: (answer: string) => void) {
  const cleaned = cleanMarkdown(content);
  const paragraphs = cleaned.split(/\n{2,}/);

  return (
    <View>
      {paragraphs.map((para, pIdx) => {
        const trimmed = para.trim();
        if (!trimmed) return null;

        const lines = trimmed.split('\n');

        // Check for MCQ options
        const quiz = extractQuizOptions(lines);
        if (quiz) {
          return (
            <View key={pIdx} style={pIdx > 0 ? styles.paragraphSpacing : undefined}>
              {/* Render question text above options */}
              {quiz.questionLines.length > 0 && (
                <Text style={styles.assistantText}>
                  {quiz.questionLines.map((line, lIdx) => (
                    <React.Fragment key={lIdx}>
                      {lIdx > 0 && '\n'}
                      {renderRichText(line)}
                    </React.Fragment>
                  ))}
                </Text>
              )}
              {/* Render interactive option lines */}
              {onQuizAnswer && (
                <Text style={styles.tapHint}>{i18n.t('ai.tapSelectAnswer')}</Text>
              )}
              <View style={styles.quizOptionsContainer}>
                {quiz.options.map((opt) => (
                  <Pressable
                    key={opt.letter}
                    style={({ pressed }) => [
                      styles.quizOption,
                      pressed && styles.quizOptionPressed,
                      !onQuizAnswer && styles.quizOptionDisabled,
                    ]}
                    onPress={() => onQuizAnswer?.(`${opt.letter}) ${opt.text}`)}
                    disabled={!onQuizAnswer}
                  >
                    <View style={styles.quizOptionRow}>
                      <View style={styles.quizOptionLetterBadge}>
                        <Text style={styles.quizOptionLetterText}>{opt.letter}</Text>
                      </View>
                      <Text style={styles.quizOptionText}>{opt.text}</Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            </View>
          );
        }

        // Check if paragraph is a bullet list
        const isBulletList = lines.every(
          l => l.trim().startsWith('- ') || l.trim().startsWith('• ') || l.trim() === ''
        );

        if (isBulletList) {
          return (
            <View key={pIdx} style={pIdx > 0 ? styles.paragraphSpacing : undefined}>
              {lines.map((line, lIdx) => {
                const bulletText = line.trim().replace(/^[-•]\s+/, '');
                if (!bulletText) return null;
                return (
                  <View key={lIdx} style={styles.bulletRow}>
                    <Text style={styles.bulletDot}>{'  •  '}</Text>
                    <Text style={[styles.assistantText, styles.bulletText]}>
                      {renderRichText(bulletText)}
                    </Text>
                  </View>
                );
              })}
            </View>
          );
        }

        // Regular paragraph
        return (
          <Text
            key={pIdx}
            style={[styles.assistantText, pIdx > 0 ? styles.paragraphSpacing : undefined]}
          >
            {lines.map((line, lIdx) => (
              <React.Fragment key={lIdx}>
                {lIdx > 0 && '\n'}
                {renderRichText(line)}
              </React.Fragment>
            ))}
          </Text>
        );
      })}
    </View>
  );
}

/**
 * Renders a single line of text with Arabic highlighting and bold support.
 */
function renderRichText(text: string): React.ReactNode[] {
  const segments: { text: string; isArabic: boolean }[] = [];
  let lastIndex = 0;

  text.replace(ARABIC_REGEX, (match, offset) => {
    if (offset > lastIndex) {
      segments.push({ text: text.slice(lastIndex, offset), isArabic: false });
    }
    segments.push({ text: match, isArabic: true });
    lastIndex = offset + match.length;
    return match;
  });

  if (lastIndex < text.length) {
    segments.push({ text: text.slice(lastIndex), isArabic: false });
  }

  if (segments.length === 0) {
    segments.push({ text, isArabic: false });
  }

  return segments.map((seg, i) => {
    if (seg.isArabic) {
      return <Text key={i} style={styles.arabicText}>{seg.text}</Text>;
    }
    return <Text key={i}>{renderBold(seg.text)}</Text>;
  });
}

/** Render **bold** markers */
function renderBold(text: string): React.ReactNode[] {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <Text key={i} style={styles.boldText}>{part}</Text>
    ) : (
      <Text key={i}>{part}</Text>
    )
  );
}

const styles = StyleSheet.create({
  bubble: {
    flexDirection: 'row',
    marginVertical: 4,
    marginHorizontal: 12,
  },
  userBubble: {
    justifyContent: 'flex-end',
  },
  assistantBubble: {
    justifyContent: 'flex-start',
  },
  errorBubble: {
    justifyContent: 'center',
  },
  contentContainer: {
    backgroundColor: '#334155',
    borderRadius: 16,
    borderTopLeftRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flex: 1,
  },
  userContent: {
    backgroundColor: '#10b981',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 4,
    flex: 0,
    maxWidth: '80%',
  },
  userText: {
    color: '#fff',
    fontSize: 15,
    lineHeight: 22,
  },
  assistantText: {
    color: '#e2e8f0',
    fontSize: 15,
    lineHeight: 22,
  },
  arabicText: {
    color: '#D4AF37',
    fontSize: 22,
    lineHeight: 34,
    fontWeight: '600',
  },
  boldText: {
    fontWeight: '700',
    color: '#f8fafc',
  },
  paragraphSpacing: {
    marginTop: 12,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 4,
  },
  bulletDot: {
    color: '#10b981',
    fontSize: 14,
    lineHeight: 22,
  },
  bulletText: {
    flex: 1,
  },
  speakButton: {
    alignSelf: 'flex-start',
    marginTop: 8,
    padding: 4,
  },
  tapHint: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '500',
    marginTop: 14,
    marginBottom: 4,
  },
  // Quiz option styles
  quizOptionsContainer: {
    marginTop: 14,
    gap: 8,
  },
  quizOption: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#475569',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  quizOptionPressed: {
    backgroundColor: '#10b98115',
    borderColor: '#10b981',
  },
  quizOptionDisabled: {
    opacity: 0.45,
  },
  quizOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quizOptionLetterBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quizOptionLetterText: {
    color: '#10b981',
    fontWeight: '800',
    fontSize: 15,
  },
  quizOptionText: {
    color: '#f5f5f0',
    fontSize: 20,
    lineHeight: 32,
    fontWeight: '500',
    flex: 1,
  },
  errorText: {
    color: '#f87171',
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  streamingCursor: {
    color: '#D4AF37',
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 22,
  },
});

import { useRef, useEffect, useCallback } from 'react';
import { FlatList, View, Text, StyleSheet, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ChatMessage, AIModuleContext, AIModelChoice } from '../../types/aiChat';
import { AIChatBubble, QuizOptionData } from './AIChatBubble';
import { AIChatTypingIndicator } from './AIChatTypingIndicator';
import { getWelcomeMessage } from '../../data/ai/systemPrompts';
import { useSettingsStore } from '../../stores/settingsStore';
import { useAIChatStore } from '../../stores/aiChatStore';
import { getContextualSuggestions } from '../../services/aiContextService';
import audioService from '../../services/audioService';
import { color, radius } from '../../theme/tokens';

interface Props {
  messages: ChatMessage[];
  isStreaming: boolean;
  streamingContent: string;
  module: AIModuleContext;
  model: AIModelChoice;
  segments: string[];
  onSuggestionPress: (text: string) => void;
}

export function AIChatMessageList({
  messages,
  isStreaming,
  streamingContent,
  module,
  model,
  segments,
  onSuggestionPress,
}: Props) {
  const flatListRef = useRef<FlatList>(null);
  const language = useSettingsStore((s) => s.language);
  const speakingMessageId = useAIChatStore((s) => s.speakingMessageId);
  const setSpeakingMessageId = useAIChatStore((s) => s.setSpeakingMessageId);

  // Auto-scroll to bottom on new messages or streaming
  useEffect(() => {
    if (messages.length > 0 || isStreaming) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages.length, isStreaming, streamingContent]);

  const handleSpeak = useCallback((messageId: string, arabicText: string) => {
    if (speakingMessageId === messageId) {
      audioService.stop();
      setSpeakingMessageId(null);
      return;
    }

    if (speakingMessageId) {
      audioService.stop();
    }

    setSpeakingMessageId(messageId);
    audioService.speakArabic({
      text: arabicText,
      onDone: () => setSpeakingMessageId(null),
    });
  }, [speakingMessageId, setSpeakingMessageId]);

  const handleQuizAnswer = useCallback((answer: string) => {
    onSuggestionPress(answer);
  }, [onSuggestionPress]);

  // Determine which quiz message should have active buttons, and
  // extract retry options for "try again" messages.
  const MCQ_LINE_RE = /^([A-D])\)\s+(.+)$/gm;
  const TRY_AGAIN_PATTERN = /not quite|try again|almost|hint:/i;

  const { activeQuizMessageId, retryMessageId, retryOptions } = (() => {
    if (messages.length === 0 || isStreaming) {
      return { activeQuizMessageId: null, retryMessageId: null, retryOptions: [] as QuizOptionData[] };
    }

    const lastMsg = messages[messages.length - 1];

    // If the last message is an assistant message with quiz options, it's the active quiz
    if (lastMsg.role === 'assistant' && MCQ_LINE_RE.test(lastMsg.content)) {
      MCQ_LINE_RE.lastIndex = 0; // reset regex
      return { activeQuizMessageId: lastMsg.id, retryMessageId: null, retryOptions: [] as QuizOptionData[] };
    }

    // If the last assistant message is a "try again" hint, find previous quiz options
    if (lastMsg.role === 'assistant' && TRY_AGAIN_PATTERN.test(lastMsg.content)) {
      for (let i = messages.length - 2; i >= 0; i--) {
        MCQ_LINE_RE.lastIndex = 0;
        const content = messages[i].content;
        if (messages[i].role === 'assistant' && MCQ_LINE_RE.test(content)) {
          // Extract options from that quiz message
          MCQ_LINE_RE.lastIndex = 0;
          const opts: QuizOptionData[] = [];
          let match;
          while ((match = MCQ_LINE_RE.exec(content)) !== null) {
            opts.push({ letter: match[1], text: match[2] });
          }
          return { activeQuizMessageId: null, retryMessageId: lastMsg.id, retryOptions: opts };
        }
      }
    }

    return { activeQuizMessageId: null, retryMessageId: null, retryOptions: [] as QuizOptionData[] };
  })();

  // Empty state
  if (messages.length === 0 && !isStreaming) {
    const welcome = getWelcomeMessage(module, language, model);
    const suggestions = getContextualSuggestions(segments, language as 'en' | 'fr');

    return (
      <View style={styles.emptyContainer}>
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeEmoji}>📚</Text>
          <Text style={styles.welcomeText}>{welcome}</Text>
        </View>
        <View style={styles.suggestionsContainer}>
          {suggestions.map((suggestion, i) => (
            <Pressable
              key={i}
              style={styles.suggestionChip}
              onPress={() => onSuggestionPress(suggestion)}
            >
              <Text style={styles.suggestionText}>{suggestion}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    );
  }

  // Build data array with streaming message appended
  const data: (ChatMessage | { id: string; type: 'streaming'; content: string })[] = [
    ...messages,
  ];

  if (isStreaming) {
    if (streamingContent) {
      data.push({
        id: 'streaming',
        type: 'streaming',
        content: streamingContent,
      });
    } else {
      data.push({
        id: 'typing',
        type: 'streaming',
        content: '',
      });
    }
  }

  return (
    <FlatList
      ref={flatListRef}
      data={data}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => {
        if ('type' in item && item.type === 'streaming') {
          if (!item.content) {
            return <AIChatTypingIndicator />;
          }
          return (
            <AIChatBubble
              message={{
                id: 'streaming',
                role: 'assistant',
                content: item.content,
                timestamp: Date.now(),
              }}
              isStreamingMessage
            />
          );
        }

        const msg = item as ChatMessage;
        const isActiveQuiz = msg.id === activeQuizMessageId;
        const isRetryMessage = msg.id === retryMessageId;

        return (
          <AIChatBubble
            message={msg}
            speakingMessageId={speakingMessageId}
            onSpeak={handleSpeak}
            onQuizAnswer={(isActiveQuiz || isRetryMessage) ? handleQuizAnswer : undefined}
            isLatestAssistant={isActiveQuiz}
            retryOptions={isRetryMessage ? retryOptions : undefined}
          />
        );
      }}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      onContentSizeChange={() =>
        flatListRef.current?.scrollToEnd({ animated: true })
      }
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingVertical: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  welcomeCard: {
    backgroundColor: color.surfaceRaised,
    borderRadius: radius.lg,
    padding: 20,
    alignItems: 'center',
    maxWidth: 320,
  },
  welcomeEmoji: {
    fontSize: 32,
    marginBottom: 12,
  },
  welcomeText: {
    color: color.text,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  suggestionsContainer: {
    marginTop: 20,
    gap: 8,
    width: '100%',
    maxWidth: 320,
  },
  suggestionChip: {
    backgroundColor: color.bg,
    borderWidth: 1,
    borderColor: color.border,
    borderRadius: radius.xl,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  suggestionText: {
    color: color.textMuted,
    fontSize: 14,
    textAlign: 'center',
  },
});

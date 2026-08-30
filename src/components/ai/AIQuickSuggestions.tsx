import { useEffect, useRef, useState } from 'react';
import { View, ScrollView, TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ChatMessage, AIModuleContext } from '../../types/aiChat';
import { getContextualSuggestions } from '../../services/aiContextService';
import { useSettingsStore } from '../../stores/settingsStore';
import { color, radius } from '../../theme/tokens';

const MCQ_LINE_RE = /^[A-D]\)\s+.+$/m;
const AUTO_DISMISS_MS = 8000;

interface Props {
  messages: ChatMessage[];
  isStreaming: boolean;
  activeModule: AIModuleContext;
  segments: string[];
  onPress: (text: string) => void;
}

export function AIQuickSuggestions({ messages, isStreaming, activeModule, segments, onPress }: Props) {
  const { t } = useTranslation();
  const language = useSettingsStore((s) => s.language);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [dismissed, setDismissed] = useState(false);
  const lastMsgId = messages.length > 0 ? messages[messages.length - 1].id : '';

  // Reset visibility when a new assistant message arrives
  useEffect(() => {
    setDismissed(false);
    fadeAnim.setValue(1);
  }, [lastMsgId]);

  // Auto-dismiss after delay
  useEffect(() => {
    if (isStreaming || dismissed || messages.length === 0) return;

    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role !== 'assistant') return;

    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setDismissed(true));
    }, AUTO_DISMISS_MS);

    return () => clearTimeout(timer);
  }, [lastMsgId, isStreaming, dismissed]);

  if (dismissed || isStreaming || messages.length === 0) return null;

  const lastMessage = messages[messages.length - 1];
  if (lastMessage.role !== 'assistant') return null;
  if (MCQ_LINE_RE.test(lastMessage.content)) return null;

  const suggestions = getContextualSuggestions(segments, language);

  return (
    <Animated.View style={[styles.wrapper, { opacity: fadeAnim }]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {suggestions.map((label, i) => (
          <TouchableOpacity
            key={`${activeModule}-${i}`}
            style={styles.chip}
            onPress={() => onPress(label)}
            activeOpacity={0.7}
          >
            <Text style={styles.chipText}>{label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: color.bg,
    height: 52,
  },
  scrollContent: {
    paddingHorizontal: 12,
    alignItems: 'center',
    height: 52,
  },
  chip: {
    backgroundColor: color.surface,
    borderRadius: radius.xl,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    borderWidth: 1,
    borderColor: color.border,
  },
  chipText: {
    fontSize: 13,
    color: color.textMuted,
    fontWeight: '500',
  },
});

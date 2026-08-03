import { useRef } from 'react';
import { View, TextInput, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

interface Props {
  value: string;
  onChangeText: (text: string) => void;
  onSend: (message: string) => void;
  isStreaming: boolean;
  onStopStreaming: () => void;
  hasCredits?: boolean;
  onVoicePress?: () => void;
}

export function AIChatInput({ value, onChangeText, onSend, isStreaming, onStopStreaming, hasCredits = true, onVoicePress }: Props) {
  const { t } = useTranslation();
  const inputRef = useRef<TextInput>(null);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || isStreaming || !hasCredits) return;
    onSend(trimmed);
    onChangeText('');
  };

  const hasText = value.trim().length > 0;
  const canSend = hasText && hasCredits;

  return (
    <View style={styles.container}>
      <View style={styles.inputRow}>
        {/* Voice mode button */}
        {onVoicePress && !isStreaming && (
          <Pressable
            onPress={onVoicePress}
            style={styles.voiceButton}
            hitSlop={4}
          >
            <Ionicons name="mic-outline" size={22} color="#3b82f6" />
          </Pressable>
        )}

        {/* Text input */}
        <TextInput
          ref={inputRef}
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={!hasCredits ? t('ai.noCreditsPlaceholder') : t('ai.placeholder')}
          placeholderTextColor={!hasCredits ? '#f8717180' : '#64748b'}
          multiline
          maxLength={500}
          editable={!isStreaming && hasCredits}
          returnKeyType="default"
        />

        {/* Send or Stop button */}
        {isStreaming ? (
          <Pressable onPress={onStopStreaming} style={styles.stopButton}>
            <Ionicons name="stop" size={18} color="#fff" />
          </Pressable>
        ) : (
          <Pressable
            onPress={handleSend}
            style={[styles.sendButton, !canSend && styles.sendButtonDisabled]}
            disabled={!canSend}
          >
            <Ionicons name="arrow-up" size={20} color="#fff" />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#334155',
    backgroundColor: '#1e293b',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  voiceButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3b82f615',
    borderWidth: 1,
    borderColor: '#3b82f630',
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#0f172a',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#e2e8f0',
    fontSize: 15,
    maxHeight: 100,
    minHeight: 40,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#334155',
  },
  stopButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

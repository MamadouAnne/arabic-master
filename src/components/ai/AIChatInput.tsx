import { useRef } from 'react';
import { View, TextInput, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { color, radius } from '../../theme/tokens';
import { withAlpha } from '../ui/Primitives';

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
            <Ionicons name="mic-outline" size={22} color={color.accent} />
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
            <Ionicons name="stop" size={18} color={color.text} />
          </Pressable>
        ) : (
          <Pressable
            onPress={handleSend}
            style={[styles.sendButton, !canSend && styles.sendButtonDisabled]}
            disabled={!canSend}
          >
            <Ionicons name="arrow-up" size={20} color={color.text} />
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
    borderTopColor: color.border,
    backgroundColor: color.surface,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  voiceButton: {
    width: 40,
    height: 40,
    borderRadius: radius.xl,
    backgroundColor: withAlpha(color.accent, 0.08),
    borderWidth: 1,
    borderColor: withAlpha(color.accent, 0.19),
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: color.bg,
    borderRadius: radius.xl,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: color.text,
    fontSize: 15,
    maxHeight: 100,
    minHeight: 40,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: radius.xl,
    backgroundColor: color.progress,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: color.surfaceRaised,
  },
  stopButton: {
    width: 40,
    height: 40,
    borderRadius: radius.xl,
    backgroundColor: color.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

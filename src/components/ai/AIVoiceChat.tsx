import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Pressable } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeOut } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useVoiceChat, VoiceStatus } from '../../hooks/useVoiceChat';
import { VoiceOrb } from './VoiceOrb';
import { useAIChatStore } from '../../stores/aiChatStore';
import { color, radius } from '../../theme/tokens';
import { withAlpha } from '../ui/Primitives';

interface AIVoiceChatProps {
  onClose: () => void;
}

const STATUS_TEXT_KEYS: Record<VoiceStatus, string> = {
  idle: 'voice.tapToSpeak',
  listening: 'voice.listening',
  processing: 'voice.processing',
  thinking: 'voice.thinking',
  speaking: 'voice.speaking',
};

const STATUS_FALLBACK: Record<VoiceStatus, string> = {
  idle: 'Tap to speak',
  listening: 'Listening...',
  processing: 'Processing speech...',
  thinking: 'Thinking...',
  speaking: 'Speaking...',
};

const STATUS_COLOR: Record<VoiceStatus, string> = {
  idle: color.textFaint,
  listening: color.accent,
  processing: color.warning,
  thinking: color.warning,
  speaking: color.progress,
};

export function AIVoiceChat({ onClose }: AIVoiceChatProps) {
  const { t } = useTranslation();
  const activeModule = useAIChatStore((s) => s.activeModule);

  const {
    status,
    lastTranscript,
    lastResponse,
    toggleListening,
    cancel,
    error,
  } = useVoiceChat();

  const isActive = status !== 'idle';
  const statusText = t(STATUS_TEXT_KEYS[status], STATUS_FALLBACK[status]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.voiceBadge}>
            <Ionicons name="mic" size={12} color={color.accent} />
            <Text style={styles.voiceBadgeText}>{t('voice.mode', 'Voice Mode')}</Text>
          </View>
        </View>
        <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={8}>
          <Ionicons name="close" size={22} color={color.textMuted} />
        </Pressable>
      </View>

      <View style={styles.content}>
        {/* Status */}
        <Animated.Text
          key={status}
          entering={FadeIn.duration(200)}
          style={[styles.statusText, { color: STATUS_COLOR[status] }]}
        >
          {statusText}
        </Animated.Text>

        {/* Error */}
        {error && (
          <Animated.Text entering={FadeInDown.duration(200)} style={styles.errorText}>
            {error}
          </Animated.Text>
        )}

        {/* Voice Orb */}
        <VoiceOrb status={status} onPress={toggleListening} />

        {/* Transcript & Response */}
        <ScrollView
          style={styles.transcriptScroll}
          contentContainerStyle={styles.transcriptContainer}
          showsVerticalScrollIndicator={false}
        >
          {lastTranscript ? (
            <Animated.View entering={FadeInDown.duration(300).delay(100)} style={styles.transcriptBox}>
              <Text style={styles.transcriptLabel}>{t('voice.youSaid', 'You said:')}</Text>
              <Text style={styles.transcriptText}>{lastTranscript}</Text>
            </Animated.View>
          ) : null}

          {lastResponse ? (
            <Animated.View entering={FadeInDown.duration(300).delay(200)} style={styles.responseBox}>
              <Text style={styles.responseLabel}>{t('voice.aiResponse', 'Ustadh:')}</Text>
              <Text style={styles.responseText}>{lastResponse}</Text>
            </Animated.View>
          ) : null}

          {!lastTranscript && !lastResponse && !isActive && (
            <Animated.View entering={FadeIn.duration(400)} style={styles.hintBox}>
              <Ionicons name="information-circle-outline" size={18} color={color.textFaint} />
              <Text style={styles.hintText}>
                {t('voice.hint', 'Tap the orb to start speaking. Tap again when done to get a response.')}
              </Text>
            </Animated.View>
          )}
        </ScrollView>

        {/* Cancel button */}
        {isActive && (
          <Animated.View
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(150)}
            style={styles.cancelWrap}
          >
            <TouchableOpacity style={styles.cancelButton} onPress={cancel}>
              <Ionicons name="close" size={18} color={color.text} />
              <Text style={styles.cancelText}>{t('common.cancel', 'Cancel')}</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: color.borderSubtle,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  voiceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: withAlpha(color.accent, 0.08),
    borderRadius: radius.md,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: withAlpha(color.accent, 0.19),
  },
  voiceBadgeText: {
    color: color.accent,
    fontSize: 12,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 4,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 24,
    paddingHorizontal: 20,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 32,
    height: 24,
  },
  errorText: {
    fontSize: 13,
    color: color.danger,
    marginBottom: 12,
    textAlign: 'center',
  },
  transcriptScroll: {
    flex: 1,
    width: '100%',
    marginTop: 24,
  },
  transcriptContainer: {
    gap: 12,
    paddingBottom: 100,
  },
  transcriptBox: {
    backgroundColor: color.surface,
    borderRadius: radius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: color.border,
  },
  transcriptLabel: {
    fontSize: 11,
    color: color.textFaint,
    marginBottom: 4,
    fontWeight: '600',
  },
  transcriptText: {
    fontSize: 15,
    color: color.text,
    lineHeight: 22,
  },
  responseBox: {
    backgroundColor: color.bg,
    borderRadius: radius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: withAlpha(color.progress, 0.19),
  },
  responseLabel: {
    fontSize: 11,
    color: color.progress,
    marginBottom: 4,
    fontWeight: '600',
  },
  responseText: {
    fontSize: 15,
    color: color.text,
    lineHeight: 22,
  },
  hintBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: color.surface,
    borderRadius: radius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: color.border,
  },
  hintText: {
    flex: 1,
    fontSize: 13,
    color: color.textFaint,
    lineHeight: 19,
  },
  cancelWrap: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: color.danger,
    borderRadius: radius.xl,
  },
  cancelText: {
    fontSize: 14,
    color: color.text,
    fontWeight: '600',
  },
});

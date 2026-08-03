import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Pressable } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeOut } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useVoiceChat, VoiceStatus } from '../../hooks/useVoiceChat';
import { VoiceOrb } from './VoiceOrb';
import { useAIChatStore } from '../../stores/aiChatStore';

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
  idle: '#64748b',
  listening: '#3b82f6',
  processing: '#f59e0b',
  thinking: '#f59e0b',
  speaking: '#10b981',
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
            <Ionicons name="mic" size={12} color="#3b82f6" />
            <Text style={styles.voiceBadgeText}>{t('voice.mode', 'Voice Mode')}</Text>
          </View>
        </View>
        <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={8}>
          <Ionicons name="close" size={22} color="#94a3b8" />
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
              <Ionicons name="information-circle-outline" size={18} color="#475569" />
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
              <Ionicons name="close" size={18} color="#fff" />
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
    backgroundColor: '#0f172a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
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
    backgroundColor: '#3b82f615',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#3b82f630',
  },
  voiceBadgeText: {
    color: '#3b82f6',
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
    color: '#ef4444',
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
    backgroundColor: '#1e293b',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  transcriptLabel: {
    fontSize: 11,
    color: '#64748b',
    marginBottom: 4,
    fontWeight: '600',
  },
  transcriptText: {
    fontSize: 15,
    color: '#e2e8f0',
    lineHeight: 22,
  },
  responseBox: {
    backgroundColor: '#0f172a',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#10b98130',
  },
  responseLabel: {
    fontSize: 11,
    color: '#10b981',
    marginBottom: 4,
    fontWeight: '600',
  },
  responseText: {
    fontSize: 15,
    color: '#e2e8f0',
    lineHeight: 22,
  },
  hintBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  hintText: {
    flex: 1,
    fontSize: 13,
    color: '#64748b',
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
    backgroundColor: '#ef4444',
    borderRadius: 20,
  },
  cancelText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
});

import React from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, TextInput, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  isJoined: boolean;
  messageText: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  isSending: boolean;
  placeholder: string;
  joinLabel: string;
  onMicPress?: () => void;
  isRecording?: boolean;
  editing?: boolean;
  onCancelEdit?: () => void;
  onCreate?: () => void;
  groupColor?: string;
}

export function ChatInputBar({
  isJoined, messageText, onChangeText, onSend, isSending, placeholder, joinLabel,
  onMicPress, isRecording, editing, onCancelEdit, onCreate, groupColor = '#818cf8',
}: Props) {
  const { t } = useTranslation();
  const hasText = !!messageText.trim();
  return (
    <View>
      {editing && (
        <View style={styles.editBanner}>
          <Ionicons name="create-outline" size={14} color={groupColor} />
          <Text style={[styles.editBannerText, { color: groupColor }]}>{t('community.editingMessage')}</Text>
          <Pressable onPress={onCancelEdit} hitSlop={8}>
            <Ionicons name="close" size={16} color="#94a3b8" />
          </Pressable>
        </View>
      )}
      <View style={styles.inputBar}>
        {isJoined ? (
          <>
            {!editing && (
              <Pressable style={styles.createBtn} onPress={onCreate} hitSlop={6}>
                <Ionicons name="add" size={26} color={groupColor} />
              </Pressable>
            )}
            <TextInput
              style={styles.messageInput}
              placeholder={placeholder}
              placeholderTextColor="#64748b"
              value={messageText}
              onChangeText={onChangeText}
              multiline
              maxLength={500}
            />
            {hasText ? (
              <Pressable
                style={[styles.sendBtn, { backgroundColor: groupColor }, (isSending) && styles.sendBtnDisabled]}
                disabled={!hasText || isSending}
                onPress={onSend}
              >
                {isSending ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <Ionicons name={editing ? 'checkmark' : 'send'} size={18} color="#ffffff" />
                )}
              </Pressable>
            ) : (
              <Pressable
                style={[styles.micBtn, { backgroundColor: groupColor }, isRecording && styles.micBtnRecording]}
                onPress={onMicPress}
              >
                <Ionicons name={isRecording ? 'stop' : 'mic'} size={20} color={isRecording ? '#ef4444' : '#ffffff'} />
              </Pressable>
            )}
          </>
        ) : (
          <View style={styles.joinPrompt}>
            <Ionicons name="people" size={16} color="#64748b" />
            <Text style={styles.joinPromptText}>{joinLabel} to participate</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  inputBar: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#0f172a', borderTopWidth: 1, borderTopColor: '#1e293b', gap: 8 },
  editBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 6, backgroundColor: '#0f172a', borderTopWidth: 1, borderTopColor: '#1e293b' },
  editBannerText: { flex: 1, fontSize: 12, fontWeight: '600' },
  createBtn: { width: 36, height: 42, alignItems: 'center', justifyContent: 'center' },
  messageInput: { flex: 1, backgroundColor: '#1e293b', borderRadius: 22, paddingHorizontal: 16, paddingVertical: 10, fontSize: 15, color: '#ffffff', maxHeight: 100, borderWidth: 1, borderColor: '#334155' },
  sendBtn: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { opacity: 0.35 },
  micBtn: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  micBtnRecording: { backgroundColor: '#ef444440', borderWidth: 2, borderColor: '#ef4444' },
  joinPrompt: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 8 },
  joinPromptText: { fontSize: 13, color: '#64748b' },
});

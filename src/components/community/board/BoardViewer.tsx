import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet, Pressable, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { BoardCanvas, boardContentHeight } from './BoardCanvas';
import type { BoardContent } from '../../../types/classContent';
import { BOARD_BG } from '../../../types/classContent';

interface Props {
  visible: boolean;
  board: BoardContent;
  groupColor: string;
  authorName: string;
  canEdit: boolean;
  onEdit?: () => void;
  onClose: () => void;
}

export function BoardViewer({ visible, board, groupColor, authorName, canEdit, onEdit, onClose }: Props) {
  const { t } = useTranslation();
  const [w, setW] = useState(0);
  // Scale the board to the full screen width; height crops to the drawn content
  // (no wasted empty space), and the ScrollView handles tall boards.
  const effHeight = boardContentHeight(board.elements, board.width);
  const drawBoard = effHeight !== board.height ? { ...board, height: effHeight } : board;
  const ratio = board.width > 0 ? effHeight / board.width : 1;
  const h = Math.round(w * ratio);
  const bg = BOARD_BG[board.background];

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaProvider style={{ flex: 1 }}>
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
          <View style={styles.header}>
            <Pressable onPress={onClose} hitSlop={8}><Ionicons name="chevron-down" size={26} color="#e2e8f0" /></Pressable>
            <Text style={styles.headerLabel}>{t('community.boardBy', { author: authorName })}</Text>
            {canEdit ? (
              <Pressable onPress={onEdit} hitSlop={8} style={styles.editBtn}>
                <Ionicons name="create-outline" size={18} color={groupColor} />
                <Text style={[styles.editText, { color: groupColor }]}>{t('community.edit')}</Text>
              </Pressable>
            ) : <View style={{ width: 40 }} />}
          </View>
          <ScrollView
            style={{ flex: 1, backgroundColor: bg }}
            contentContainerStyle={{ backgroundColor: bg, flexGrow: 1 }}
            maximumZoomScale={3}
            minimumZoomScale={1}
            showsVerticalScrollIndicator={false}
          >
            <View onLayout={(e) => setW(Math.round(e.nativeEvent.layout.width))}>
              {w > 0 && <BoardCanvas content={drawBoard} width={w} height={h} />}
            </View>
          </ScrollView>
        </SafeAreaView>
      </SafeAreaProvider>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b1220' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#0f172a', borderBottomWidth: 1, borderBottomColor: '#1e293b' },
  headerLabel: { fontSize: 13, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 },
  editBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  editText: { fontSize: 14, fontWeight: '600' },
});

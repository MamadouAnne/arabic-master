import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BoardCanvas, boardContentBounds } from './BoardCanvas';
import { BoardViewer } from './BoardViewer';
import type { BoardContent } from '../../../types/classContent';
import { BOARD_BG } from '../../../types/classContent';

interface Props {
  board: BoardContent;
  groupColor: string;
  authorName: string;
  canEdit: boolean;
  onEdit?: () => void;
  onLongPress?: () => void;
}

const MAX_H = 260;
const MIN_H = 90;

export const BoardCard = React.memo(function BoardCard({ board, groupColor, authorName, canEdit, onEdit, onLongPress }: Props) {
  const [open, setOpen] = useState(false);
  const [w, setW] = useState(1);

  // Compact thumbnail cropped tightly to the drawn content (no huge empty canvas).
  const bounds = boardContentBounds(board.elements, board.width);
  const viewBox = bounds ? `${bounds.x} ${bounds.y} ${bounds.w} ${bounds.h}` : undefined;
  const aspect = bounds ? bounds.h / bounds.w : 0.5;
  const thumbH = Math.min(MAX_H, Math.max(MIN_H, Math.round(w * aspect)));

  return (
    <>
      <Pressable style={styles.card} onPress={() => setOpen(true)} onLongPress={onLongPress} delayLongPress={300}>
        <View style={[styles.band, { backgroundColor: `${groupColor}18` }]}>
          <View style={[styles.badge, { backgroundColor: groupColor }]}>
            <Ionicons name="brush" size={13} color="#ffffff" />
            <Text style={styles.badgeText}>BOARD</Text>
          </View>
          <Text style={styles.byline} numberOfLines={1}>{authorName}</Text>
        </View>

        <View style={[styles.preview, { height: thumbH, backgroundColor: BOARD_BG[board.background] }]} onLayout={(e) => setW(Math.round(e.nativeEvent.layout.width))}>
          <BoardCanvas content={board} width={w} height={thumbH} viewBox={viewBox} />
          <View style={styles.expandHint}>
            <Ionicons name="expand" size={14} color="#ffffff" />
          </View>
        </View>
      </Pressable>

      {open && (
        <BoardViewer
          visible={open}
          board={board}
          groupColor={groupColor}
          authorName={authorName}
          canEdit={canEdit}
          onEdit={() => { setOpen(false); onEdit?.(); }}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
});

const styles = StyleSheet.create({
  card: { width: '100%', backgroundColor: '#1e293b', borderRadius: 16, borderWidth: 1, borderColor: '#334155', overflow: 'hidden' },
  band: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 8 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  badgeText: { fontSize: 10, fontWeight: '800', color: '#ffffff', letterSpacing: 0.6 },
  byline: { fontSize: 12, color: '#94a3b8', maxWidth: 130 },
  preview: { backgroundColor: '#0b1220', overflow: 'hidden' },
  expandHint: { position: 'absolute', right: 8, bottom: 8, width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center' },
});

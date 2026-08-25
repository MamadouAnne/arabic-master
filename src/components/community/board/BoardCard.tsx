import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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

// Fixed teaser height — the preview shows the TOP of the board at full width,
// like a document preview, and fades out if there's more below.
const PREVIEW_H = 200;

export const BoardCard = React.memo(function BoardCard({ board, groupColor, authorName, canEdit, onEdit, onLongPress }: Props) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [w, setW] = useState(1);

  const bg = BOARD_BG[board.background];
  const bounds = boardContentBounds(board.elements, board.width);

  // Scale the content so its width fills the card, then show only the top slice.
  const scale = bounds ? w / bounds.w : 1;
  const fullH = bounds ? bounds.h * scale : PREVIEW_H;
  const previewH = Math.max(60, Math.min(PREVIEW_H, Math.round(fullH)));
  const cropped = fullH > PREVIEW_H + 8;
  const vbH = bounds ? previewH / scale : 0;
  const viewBox = bounds ? `${bounds.x} ${bounds.y} ${bounds.w} ${vbH}` : undefined;

  return (
    <>
      <Pressable style={styles.card} onPress={() => setOpen(true)} onLongPress={onLongPress} delayLongPress={300}>
        <View style={[styles.band, { backgroundColor: `${groupColor}18` }]}>
          <View style={[styles.badge, { backgroundColor: groupColor }]}>
            <Ionicons name="brush" size={13} color="#ffffff" />
            <Text style={styles.badgeText}>{t('community.badgeBoard')}</Text>
          </View>
          <Text style={styles.byline} numberOfLines={1}>{authorName}</Text>
        </View>

        <View
          style={[styles.preview, { height: previewH, backgroundColor: bg }]}
          onLayout={(e) => setW(Math.round(e.nativeEvent.layout.width))}
        >
          <BoardCanvas content={board} width={w} height={previewH} viewBox={viewBox} />
          {cropped && (
            <LinearGradient
              colors={['transparent', bg]}
              style={styles.fade}
              pointerEvents="none"
            />
          )}
        </View>

        <View style={styles.footer}>
          <Ionicons name="expand" size={15} color={groupColor} />
          <Text style={[styles.footerText, { color: groupColor }]}>{t('community.openFullBoard')}</Text>
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
  preview: { width: '100%', overflow: 'hidden' },
  fade: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 56 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#334155' },
  footerText: { fontSize: 13, fontWeight: '700', letterSpacing: 0.2 },
});

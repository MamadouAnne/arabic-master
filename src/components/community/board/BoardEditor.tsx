import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, PanResponder, ScrollView, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import Svg from 'react-native-svg';
import { BoardCanvas, renderBoardElement, boardContentHeight, wrapBoardText } from './BoardCanvas';
import type { BoardContent, BoardElement, BoardBackground, BoardGrid, BoardStroke, BoardShape } from '../../../types/classContent';
import { BOARD_BG, BOARD_DEFAULT_INK } from '../../../types/classContent';

type Tool = 'move' | 'pen' | 'highlighter' | 'eraser' | 'line' | 'arrow' | 'rect' | 'circle' | 'text';

interface Props {
  visible: boolean;
  groupColor: string;
  initial?: BoardContent | null;
  seedText?: string | null;
  onSave: (content: BoardContent) => void;
  onClose: () => void;
}

const SHAPE_TOOLS: Tool[] = ['line', 'arrow', 'rect', 'circle'];
const PRIMARY: { tool: Tool | 'shapes'; icon: string; label: string }[] = [
  { tool: 'move', icon: 'move', label: 'Move' },
  { tool: 'pen', icon: 'pencil', label: 'Draw' },
  { tool: 'highlighter', icon: 'color-wand', label: 'Highlight' },
  { tool: 'eraser', icon: 'backspace-outline', label: 'Erase' },
  { tool: 'text', icon: 'text', label: 'Text' },
  { tool: 'shapes', icon: 'shapes', label: 'Shapes' },
];
const SHAPES: { tool: Tool; icon: string; label: string }[] = [
  { tool: 'line', icon: 'remove-outline', label: 'Line' },
  { tool: 'arrow', icon: 'arrow-forward', label: 'Arrow' },
  { tool: 'rect', icon: 'square-outline', label: 'Box' },
  { tool: 'circle', icon: 'ellipse-outline', label: 'Circle' },
];
const SIZES = [{ v: 3, label: 'S' }, { v: 6, label: 'M' }, { v: 11, label: 'L' }];
const PALETTE = ['#f8fafc', '#0f172a', '#ef4444', '#f97316', '#facc15', '#22c55e', '#38bdf8', '#a855f7'];
const WIDTHS = [3, 6, 11];
const BACKGROUNDS: BoardBackground[] = ['dark', 'chalk', 'white', 'cream'];

export function BoardEditor({ visible, groupColor, initial, seedText, onSave, onClose }: Props) {
  const [background, setBackground] = useState<BoardBackground>(initial?.background || 'dark');
  const [grid, setGrid] = useState<BoardGrid>(initial?.grid || 'none');
  const [tool, setTool] = useState<Tool>(seedText ? 'move' : 'pen');
  const [color, setColor] = useState<string>(BOARD_DEFAULT_INK[initial?.background || 'dark']);
  const [width, setWidth] = useState<number>(WIDTHS[1]);
  const [elements, setElements] = useState<BoardElement[]>(initial?.elements || []);
  const [live, setLive] = useState<BoardElement | null>(null);
  const [canvas, setCanvas] = useState({ w: 1, h: 1 });
  const [textModal, setTextModal] = useState<{ x: number; y: number } | null>(null);
  const [textValue, setTextValue] = useState('');
  const [textSize, setTextSize] = useState(28);
  const [textColor, setTextColor] = useState('#f8fafc');

  const redo = useRef<BoardElement[]>([]);
  const liveRef = useRef<BoardElement | null>(null);
  const bboxRef = useRef<[number, number, number, number]>([0, 0, 0, 0]);
  // Refs so PanResponder (created once) always reads the latest tool/state.
  const toolRef = useRef(tool); toolRef.current = tool;
  const colorRef = useRef(color); colorRef.current = color;
  const widthRef = useRef(width); widthRef.current = width;
  const elementsRef = useRef(elements); elementsRef.current = elements;
  const canvasRef = useRef(canvas); canvasRef.current = canvas;
  const dragRef = useRef<{ index: number; orig: BoardElement; sx: number; sy: number } | null>(null);
  const seededRef = useRef(false);

  // Drop a message's text onto the board (once the canvas is measured).
  useEffect(() => {
    if (!seedText || seededRef.current || canvas.w < 2) return;
    seededRef.current = true;
    // Left-aligned, readable size that uses the full width and wraps naturally.
    const text = seedText.trim();
    const len = text.length;
    const base = len > 200 ? 20 : len > 110 ? 22 : len > 55 ? 24 : len > 22 ? 27 : 34;
    const size = Math.round(base * Math.min(1.1, canvas.w / 380));
    setElements((prev) => [...prev, { type: 'text', x: 16, y: size + 20, text, color: BOARD_DEFAULT_INK[background], size }]);
  }, [seedText, canvas.w]);

  const commit = (el: BoardElement) => {
    setElements((prev) => [...prev, el]);
    redo.current = [];
  };

  const eraseAt = (x: number, y: number) => {
    const cw = canvasRef.current.w;
    setElements((prev) => {
      for (let i = prev.length - 1; i >= 0; i--) {
        if (hitTest(prev[i], x, y, cw)) { const next = [...prev]; next.splice(i, 1); return next; }
      }
      return prev;
    });
  };

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => {
        const { locationX: x, locationY: y } = e.nativeEvent;
        const t = toolRef.current, c = colorRef.current, w0 = widthRef.current;
        if (t === 'text') {
          setTextValue('');
          setTextColor(colorRef.current);
          setTextSize(Math.round(Math.min(40, Math.max(20, canvasRef.current.w / 13))));
          setTextModal({ x, y });
          return;
        }
        if (t === 'eraser') { eraseAt(x, y); return; }
        if (t === 'move') {
          const els = elementsRef.current;
          const cw = canvasRef.current.w;
          for (let i = els.length - 1; i >= 0; i--) {
            if (hitTest(els[i], x, y, cw)) { dragRef.current = { index: i, orig: els[i], sx: x, sy: y }; break; }
          }
          return;
        }
        if (t === 'pen' || t === 'highlighter') {
          const w = t === 'highlighter' ? w0 * 3.5 : w0;
          const el: BoardStroke = { type: 'stroke', tool: t, d: `M ${r(x)} ${r(y)}`, color: c, width: w, bbox: [x, y, x, y] };
          bboxRef.current = [x, y, x, y];
          liveRef.current = el; setLive(el);
        } else {
          const el: BoardShape = { type: t, x1: x, y1: y, x2: x, y2: y, color: c, width: w0 };
          liveRef.current = el; setLive(el);
        }
      },
      onPanResponderMove: (e) => {
        const { locationX: x, locationY: y } = e.nativeEvent;
        const t = toolRef.current;
        if (t === 'eraser') { eraseAt(x, y); return; }
        if (t === 'move') {
          const d = dragRef.current;
          if (!d) return;
          const moved = translateElement(d.orig, x - d.sx, y - d.sy);
          setElements((prev) => prev.map((el, i) => (i === d.index ? moved : el)));
          return;
        }
        const cur = liveRef.current;
        if (!cur) return;
        if (cur.type === 'stroke') {
          const bb = bboxRef.current;
          bboxRef.current = [Math.min(bb[0], x), Math.min(bb[1], y), Math.max(bb[2], x), Math.max(bb[3], y)];
          const next: BoardStroke = { ...cur, d: `${cur.d} L ${r(x)} ${r(y)}`, bbox: bboxRef.current };
          liveRef.current = next; setLive(next);
        } else {
          const next = { ...cur, x2: x, y2: y } as BoardElement;
          liveRef.current = next; setLive(next);
        }
      },
      onPanResponderRelease: () => {
        if (toolRef.current === 'move') { dragRef.current = null; return; }
        const cur = liveRef.current;
        if (cur) {
          // Ignore near-zero shapes (accidental taps). Text is never live here.
          if (cur.type !== 'stroke' && cur.type !== 'text' && Math.hypot(cur.x2 - cur.x1, cur.y2 - cur.y1) < 4) {
            // skip
          } else {
            commit(cur);
          }
        }
        liveRef.current = null; setLive(null);
      },
    })
  ).current;

  const undo = () => setElements((prev) => {
    if (prev.length === 0) return prev;
    redo.current.push(prev[prev.length - 1]);
    return prev.slice(0, -1);
  });
  const doRedo = () => {
    const el = redo.current.pop();
    if (el) setElements((prev) => [...prev, el]);
  };
  const clearAll = () => Alert.alert('Clear board?', 'Remove everything you drew.', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Clear', style: 'destructive', onPress: () => { setElements([]); redo.current = []; } },
  ]);

  const addText = () => {
    if (textModal && textValue.trim()) {
      // Clamp x so text always has room to wrap into full lines (no cutting).
      const x = Math.min(textModal.x, Math.max(16, canvas.w * 0.34));
      commit({ type: 'text', x, y: textModal.y, text: textValue.trim(), color: textColor, size: textSize });
    }
    setTextModal(null); setTextValue('');
  };

  const handleSave = () => {
    if (elements.length === 0) { Alert.alert('Empty board', 'Draw something first.'); return; }
    // Crop the stored height to the drawn content (no wasted empty space).
    const height = boardContentHeight(elements, canvas.w);
    onSave({ kind: 'board', background, grid, width: canvas.w, height, elements });
  };

  const baseContent: BoardContent = useMemo(
    () => ({ kind: 'board', background, grid, width: canvas.w, height: canvas.h, elements }),
    [background, grid, canvas.w, canvas.h, elements]
  );

  const isShape = SHAPE_TOOLS.includes(tool);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaProvider style={{ flex: 1 }}><SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={onClose} hitSlop={8}><Ionicons name="close" size={24} color="#e2e8f0" /></Pressable>
          <Text style={styles.headerTitle}>{initial ? 'Edit board' : 'Board'}</Text>
          <Pressable onPress={handleSave} style={[styles.postBtn, { backgroundColor: groupColor }]}>
            <Text style={styles.postText}>{initial ? 'Update' : 'Post'}</Text>
          </Pressable>
        </View>

        {/* Canvas */}
        <View
          style={styles.canvasWrap}
          onLayout={(ev) => setCanvas({ w: Math.round(ev.nativeEvent.layout.width), h: Math.round(ev.nativeEvent.layout.height) })}
        >
          <View style={StyleSheet.absoluteFill}>
            <BoardCanvas content={baseContent} width={canvas.w} height={canvas.h} />
          </View>
          {/* Live overlay (1:1 with canvas) */}
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            {live && (
              <Svg width={canvas.w} height={canvas.h} viewBox={`0 0 ${canvas.w} ${canvas.h}`}>
                {renderBoardElement(live, 'live', canvas.w)}
              </Svg>
            )}
          </View>
          {/* Touch layer */}
          <View style={StyleSheet.absoluteFill} {...pan.panHandlers} />
        </View>

        {/* ── Bottom control panel ─────────────────────────── */}
        <View style={styles.panel}>
          {/* Shape picker (only when Shapes tool active) */}
          {isShape && (
            <View style={styles.shapeRow}>
              {SHAPES.map((s) => {
                const on = tool === s.tool;
                return (
                  <Pressable key={s.tool} onPress={() => setTool(s.tool)} style={[styles.shapeBtn, on && { backgroundColor: `${groupColor}22`, borderColor: groupColor }]}>
                    <Ionicons name={s.icon as any} size={16} color={on ? groupColor : '#cbd5e1'} />
                    <Text style={[styles.shapeText, on && { color: groupColor }]}>{s.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          )}

          {/* Primary tools (labeled) */}
          <View style={styles.toolsRow}>
            {PRIMARY.map((t) => {
              const active = t.tool === 'shapes' ? isShape : tool === t.tool;
              return (
                <Pressable
                  key={t.tool}
                  style={styles.toolCol}
                  onPress={() => (t.tool === 'shapes' ? (!isShape && setTool('arrow')) : setTool(t.tool as Tool))}
                >
                  <View style={[styles.toolIcon, active && { backgroundColor: groupColor }]}>
                    <Ionicons name={t.icon as any} size={22} color={active ? '#ffffff' : '#cbd5e1'} />
                  </View>
                  <Text style={[styles.toolLabel, active && { color: groupColor }]}>{t.label}</Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.divider} />

          {/* Colour + size */}
          <View style={styles.controlsRow}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.swatches}>
              {PALETTE.map((c) => (
                <Pressable key={c} onPress={() => setColor(c)} style={[styles.swatch, { backgroundColor: c }, color === c && styles.swatchActive]} />
              ))}
            </ScrollView>
            <View style={styles.sizeGroup}>
              {SIZES.map((s) => (
                <Pressable key={s.label} onPress={() => setWidth(s.v)} style={[styles.sizeBtn, width === s.v && { backgroundColor: `${groupColor}30` }]}>
                  <Text style={[styles.sizeText, width === s.v && { color: groupColor }]}>{s.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Actions (labeled) */}
          <View style={styles.actionsRow}>
            <Pressable style={styles.action} onPress={undo}><Ionicons name="arrow-undo" size={19} color="#cbd5e1" /><Text style={styles.actionText}>Undo</Text></Pressable>
            <Pressable style={styles.action} onPress={doRedo}><Ionicons name="arrow-redo" size={19} color="#cbd5e1" /><Text style={styles.actionText}>Redo</Text></Pressable>
            <Pressable style={styles.action} onPress={() => setBackground((b) => BACKGROUNDS[(BACKGROUNDS.indexOf(b) + 1) % BACKGROUNDS.length])}>
              <View style={[styles.paperSwatch, { backgroundColor: BOARD_BG[background] }]} /><Text style={styles.actionText}>Paper</Text>
            </Pressable>
            <Pressable style={styles.action} onPress={() => setGrid((g) => (g === 'none' ? 'lines' : g === 'lines' ? 'grid' : 'none'))}>
              <Ionicons name={grid === 'grid' ? 'grid' : grid === 'lines' ? 'reorder-four' : 'square-outline'} size={19} color="#cbd5e1" /><Text style={styles.actionText}>Grid</Text>
            </Pressable>
            <Pressable style={styles.action} onPress={clearAll}><Ionicons name="trash-outline" size={19} color="#ef4444" /><Text style={[styles.actionText, { color: '#ef4444' }]}>Clear</Text></Pressable>
          </View>
        </View>

        {/* Text entry */}
        {textModal && (
          <Modal transparent animationType="fade" onRequestClose={() => setTextModal(null)}>
            <KeyboardAvoidingView style={styles.textBackdrop} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
              <Pressable style={StyleSheet.absoluteFill} onPress={() => setTextModal(null)} />
              <View style={styles.textCard}>
                <Text style={styles.textLabel}>Add text</Text>

                {/* Live preview of how it will look on the board */}
                <View style={[styles.textPreview, { backgroundColor: BOARD_BG[background] }]}>
                  <Text style={{ color: textColor, fontSize: Math.min(textSize, 34), lineHeight: Math.min(textSize, 34) * 1.28, fontWeight: '700' }}>
                    {textValue || 'Preview'}
                  </Text>
                </View>

                <TextInput style={styles.textInput} value={textValue} onChangeText={setTextValue} placeholder="Type a word or a full sentence…" placeholderTextColor="#64748b" autoFocus multiline />

                {/* Size stepper */}
                <View style={styles.textCtrlRow}>
                  <Text style={styles.textCtrlLabel}>Size</Text>
                  <Pressable style={styles.stepBtn} onPress={() => setTextSize((s) => Math.max(14, s - 3))}><Ionicons name="remove" size={20} color="#e2e8f0" /></Pressable>
                  <Text style={styles.stepVal}>{textSize}</Text>
                  <Pressable style={styles.stepBtn} onPress={() => setTextSize((s) => Math.min(80, s + 3))}><Ionicons name="add" size={20} color="#e2e8f0" /></Pressable>
                </View>

                {/* Color */}
                <View style={styles.textCtrlRow}>
                  <Text style={styles.textCtrlLabel}>Color</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, alignItems: 'center' }}>
                    {PALETTE.map((c) => (
                      <Pressable key={c} onPress={() => setTextColor(c)} style={[styles.swatch, { backgroundColor: c }, textColor === c && styles.swatchActive]} />
                    ))}
                  </ScrollView>
                </View>

                <View style={styles.textActions}>
                  <Pressable onPress={() => setTextModal(null)}><Text style={styles.textCancel}>Cancel</Text></Pressable>
                  <Pressable onPress={addText} style={[styles.textAdd, { backgroundColor: groupColor }]}><Text style={styles.textAddText}>Add</Text></Pressable>
                </View>
              </View>
            </KeyboardAvoidingView>
          </Modal>
        )}
      </SafeAreaView></SafeAreaProvider>
    </Modal>
  );
}

function r(n: number) { return Math.round(n * 10) / 10; }

// Translate any element by (dx, dy) from its original position.
function translateElement(orig: BoardElement, dx: number, dy: number): BoardElement {
  if (orig.type === 'text') return { ...orig, x: orig.x + dx, y: orig.y + dy };
  if (orig.type === 'stroke') {
    const d = orig.d.replace(/-?\d+(\.\d+)?/g, (() => {
      let i = 0;
      return (m: string) => { const v = parseFloat(m); const out = i % 2 === 0 ? v + dx : v + dy; i++; return r(out).toString(); };
    })());
    const bb = orig.bbox;
    return { ...orig, d, bbox: [bb[0] + dx, bb[1] + dy, bb[2] + dx, bb[3] + dy] };
  }
  return { ...orig, x1: orig.x1 + dx, y1: orig.y1 + dy, x2: orig.x2 + dx, y2: orig.y2 + dy };
}

function hitTest(el: BoardElement, x: number, y: number, canvasWidth: number): boolean {
  const pad = 14;
  let bb: [number, number, number, number];
  if (el.type === 'stroke') {
    bb = el.bbox;
  } else if (el.type === 'text') {
    // Real multi-line bounds so text can be grabbed anywhere on any line.
    const avail = Math.max(80, canvasWidth - el.x - 12);
    const lines = wrapBoardText(el.text, el.size, avail);
    const longest = Math.max(...lines.map((l) => l.length), 1);
    const w = longest * el.size * 0.55;
    const h = lines.length * el.size * 1.28;
    const top = el.y - el.size;
    bb = [el.x, top, el.x + w, top + h];
  } else {
    bb = [Math.min(el.x1, el.x2), Math.min(el.y1, el.y2), Math.max(el.x1, el.x2), Math.max(el.y1, el.y2)];
  }
  return x >= bb[0] - pad && x <= bb[2] + pad && y >= bb[1] - pad && y <= bb[3] + pad;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b1220' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 10 },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: '700', color: '#f8fafc' },
  postBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
  postText: { color: '#ffffff', fontWeight: '700', fontSize: 14 },
  canvasWrap: { flex: 1, overflow: 'hidden' },
  // Bottom panel
  panel: { backgroundColor: '#0f172a', borderTopWidth: 1, borderTopColor: '#1e293b', paddingTop: 8 },
  shapeRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, paddingHorizontal: 12, paddingBottom: 8 },
  shapeBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, backgroundColor: '#1e293b', borderWidth: 1.5, borderColor: 'transparent' },
  shapeText: { fontSize: 13, fontWeight: '600', color: '#cbd5e1' },
  toolsRow: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 6, paddingBottom: 6 },
  toolCol: { alignItems: 'center', gap: 4, width: 60 },
  toolIcon: { width: 46, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#1e293b' },
  toolLabel: { fontSize: 11, fontWeight: '600', color: '#94a3b8' },
  divider: { height: 1, backgroundColor: '#1e293b', marginVertical: 4 },
  controlsRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 8 },
  swatches: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingRight: 6 },
  swatch: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: 'rgba(255,255,255,0.15)' },
  swatchActive: { borderColor: '#ffffff', transform: [{ scale: 1.18 }] },
  sizeGroup: { flexDirection: 'row', gap: 4, backgroundColor: '#1e293b', borderRadius: 12, padding: 3 },
  sizeBtn: { width: 34, height: 30, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  sizeText: { fontSize: 14, fontWeight: '800', color: '#94a3b8' },
  actionsRow: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 8, paddingTop: 2, paddingBottom: 6 },
  action: { alignItems: 'center', gap: 3, paddingHorizontal: 8, paddingVertical: 4 },
  actionText: { fontSize: 11, fontWeight: '600', color: '#94a3b8' },
  paperSwatch: { width: 19, height: 19, borderRadius: 5, borderWidth: 1, borderColor: '#475569' },
  textBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', paddingHorizontal: 22 },
  textCard: { backgroundColor: '#1e293b', borderRadius: 18, padding: 16, borderWidth: 1, borderColor: '#334155' },
  textLabel: { fontSize: 15, fontWeight: '700', color: '#f8fafc', marginBottom: 10 },
  textPreview: { minHeight: 60, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, justifyContent: 'center', marginBottom: 10, borderWidth: 1, borderColor: '#334155' },
  textInput: { backgroundColor: '#0f172a', borderRadius: 10, padding: 12, fontSize: 16, color: '#f8fafc', borderWidth: 1, borderColor: '#334155', minHeight: 48, maxHeight: 120 },
  textCtrlRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 12 },
  textCtrlLabel: { fontSize: 13, fontWeight: '700', color: '#94a3b8', width: 46 },
  stepBtn: { width: 38, height: 34, borderRadius: 9, backgroundColor: '#0f172a', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#334155' },
  stepVal: { fontSize: 15, fontWeight: '800', color: '#f8fafc', minWidth: 34, textAlign: 'center', fontVariant: ['tabular-nums'] },
  textActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 16, marginTop: 16 },
  textCancel: { fontSize: 15, color: '#94a3b8', fontWeight: '600' },
  textAdd: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 10 },
  textAddText: { color: '#ffffff', fontWeight: '700' },
});

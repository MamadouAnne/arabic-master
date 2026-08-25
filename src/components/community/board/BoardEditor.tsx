import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet, Pressable, Modal, PanResponder, ScrollView, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import Svg, { Rect } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { BoardCanvas, renderBoardElement, boardContentHeight, wrapBoardText, elementOk } from './BoardCanvas';
import type { BoardContent, BoardElement, BoardBackground, BoardGrid, BoardStroke, BoardShape } from '../../../types/classContent';
import { BOARD_BG, BOARD_DEFAULT_INK } from '../../../types/classContent';
import { AICoursePromptModal, CourseGenRequest } from './AICoursePromptModal';
import { CourseBuilderModal } from './CourseBuilderModal';
import { generateCourseSpec } from '../../../services/aiBoardService';
import { buildBoardFromCourse } from './courseLayout';
import type { CourseSpec } from '../../../types/aiBoard';
import { listCurriculum, getCurriculumDigest } from '../../../data/arabic/curriculumSource';
import { useSettingsStore } from '../../../stores/settingsStore';

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
  const { t } = useTranslation();
  const [background, setBackground] = useState<BoardBackground>(initial?.background || 'dark');
  const [grid, setGrid] = useState<BoardGrid>(initial?.grid || 'none');
  // Existing boards open in Move mode (pan/scroll + reposition); new blank boards in Draw.
  const [tool, setTool] = useState<Tool>(seedText || initial ? 'move' : 'pen');
  const [color, setColor] = useState<string>(BOARD_DEFAULT_INK[initial?.background || 'dark']);
  const [width, setWidth] = useState<number>(WIDTHS[1]);
  const [elements, setElements] = useState<BoardElement[]>((initial?.elements || []).filter(elementOk));
  const [live, setLive] = useState<BoardElement | null>(null);
  const [canvas, setCanvas] = useState({ w: 1, h: 1 });
  const [editing, setEditing] = useState<{ x: number; y: number } | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null); // index of the text element being re-edited (null = new)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null); // element selected in Move mode (tap to select, drag to move)
  const [textValue, setTextValue] = useState('');
  const [textSize, setTextSize] = useState(28);
  const [textColor, setTextColor] = useState('#f8fafc');
  // AI course drafting
  const [aiModal, setAiModal] = useState<null | 'draft' | 'refine'>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [builderOpen, setBuilderOpen] = useState(false);
  const language = useSettingsStore((s) => s.language);
  const curriculum = useMemo(() => listCurriculum(language), [language]);
  const lastSpecRef = useRef<CourseSpec | null>(null);
  const aiCountRef = useRef(0); // number of leading AI-generated elements

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
  const editingRef = useRef(editing); editingRef.current = editing;
  const scrollRef = useRef<ScrollView>(null);
  const scrollYRef = useRef(0);       // current vertical scroll offset
  const contentHRef = useRef(1);      // virtual content height (set after contentH)
  const panStartScrollRef = useRef(0); // scroll offset when a Move gesture began
  const movedRef = useRef(false);     // finger moved past the tap threshold
  const longPressRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingHitRef = useRef<{ index: number; orig: BoardElement } | null>(null);
  const momentumRef = useRef<number | null>(null); // rAF id for inertial scrolling
  const tapRef = useRef<{ x: number; y: number } | null>(null); // where a Text-tool touch began
  const selectedIndexRef = useRef(selectedIndex); selectedIndexRef.current = selectedIndex;

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

  // Cancel any pending animations/timers on unmount.
  useEffect(() => () => { stopMomentum(); clearLongPress(); }, []);

  // Selection only applies to the Move tool and never while typing.
  useEffect(() => { if (tool !== 'move' || editing) setSelectedIndex(null); }, [tool, editing]);

  // Bring the caret into view above the keyboard when inline text editing starts.
  useEffect(() => {
    if (!editing) return;
    stopMomentum();
    const maxScroll = Math.max(0, contentH - canvas.h);
    // Keep the caret ~60px below the top of the view (well above the keyboard).
    const target = Math.max(0, Math.min(maxScroll, editing.y - 60));
    scrollYRef.current = target;
    requestAnimationFrame(() => scrollRef.current?.scrollTo({ y: target, animated: true }));
  }, [editing]);

  const eraseAt = (x: number, y: number) => {
    const cw = canvasRef.current.w;
    setElements((prev) => {
      for (let i = prev.length - 1; i >= 0; i--) {
        if (hitTest(prev[i], x, y, cw)) { const next = [...prev]; next.splice(i, 1); return next; }
      }
      return prev;
    });
  };

  const clearLongPress = () => { if (longPressRef.current) { clearTimeout(longPressRef.current); longPressRef.current = null; } };
  const stopMomentum = () => { if (momentumRef.current) { cancelAnimationFrame(momentumRef.current); momentumRef.current = null; } };

  // Inertial scroll after a flick (manual pan has no native momentum).
  const startMomentum = (v0: number) => {
    stopMomentum();
    let v = v0; // px per ms in scroll space
    let last = Date.now();
    const step = () => {
      const now = Date.now();
      const dt = Math.max(1, now - last);
      last = now;
      v *= Math.pow(0.95, dt / 16); // friction
      const maxScroll = Math.max(0, contentHRef.current - canvasRef.current.h);
      let next = scrollYRef.current + v * dt;
      if (next <= 0) { next = 0; v = 0; }
      if (next >= maxScroll) { next = maxScroll; v = 0; }
      scrollYRef.current = next;
      scrollRef.current?.scrollTo({ y: next, animated: false });
      if (Math.abs(v) < 0.015) { momentumRef.current = null; return; }
      momentumRef.current = requestAnimationFrame(step);
    };
    momentumRef.current = requestAnimationFrame(step);
  };

  // The draw layer always grabs the touch (except while typing). In Move mode we
  // pan the board ourselves and only start moving an element after a long-press,
  // so a normal drag scrolls the board instead of dragging whatever it lands on.
  const shouldClaim = (e: any) => {
    if (editingRef.current) return false; // typing: let taps reach the input
    const { locationX: x, locationY: y } = e.nativeEvent;
    return Number.isFinite(x) && Number.isFinite(y);
  };

  // Open the inline caret at (x,y): edit a tapped text element, else start a new one.
  const openTextEditorAt = (x: number, y: number) => {
    const els = elementsRef.current, cw = canvasRef.current.w;
    let hitIdx = -1;
    for (let i = els.length - 1; i >= 0; i--) {
      const el = els[i];
      // Only re-edit normal left-aligned text (skip centered headings/badges).
      if (el.type === 'text' && (el as any).align !== 'center' && hitTest(el, x, y, cw)) { hitIdx = i; break; }
    }
    if (hitIdx >= 0) {
      const el = els[hitIdx] as Extract<BoardElement, { type: 'text' }>;
      setTextValue(el.text);
      setTextColor(el.color);
      setTextSize(el.size);
      setEditingIndex(hitIdx);
      setEditing({ x: el.x, y: el.y - el.size * 0.82 });
    } else {
      setTextValue('');
      setTextColor(colorRef.current);
      setTextSize(Math.round(Math.min(40, Math.max(20, canvasRef.current.w / 13))));
      setEditingIndex(null);
      // New text starts at the top-left of the current view (top-right handled by RTL).
      setEditing({ x: 16, y: scrollYRef.current + 60 });
    }
  };

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: shouldClaim,
      onMoveShouldSetPanResponder: shouldClaim,
      onPanResponderTerminationRequest: () => false, // keep the gesture through a whole stroke/pan
      onPanResponderGrant: (e) => {
        stopMomentum(); // a new touch halts any ongoing fling
        const { locationX: x, locationY: y } = e.nativeEvent;
        if (!Number.isFinite(x) || !Number.isFinite(y)) return;
        const t = toolRef.current, c = colorRef.current, w0 = widthRef.current;
        if (t === 'eraser') { eraseAt(x, y); return; }
        if (t === 'move' || t === 'text') {
          // Move: tap an element to select it, then drag the SELECTED element to move
          // it; drag elsewhere scrolls. Text: tap opens the caret.
          movedRef.current = false;
          panStartScrollRef.current = scrollYRef.current;
          dragRef.current = null;
          pendingHitRef.current = null;
          tapRef.current = { x, y };
          const els = elementsRef.current, cw = canvasRef.current.w;
          for (let i = els.length - 1; i >= 0; i--) {
            if (hitTest(els[i], x, y, cw)) { pendingHitRef.current = { index: i, orig: els[i] }; break; }
          }
          // Grabbing the already-selected element starts a move immediately.
          if (t === 'move' && pendingHitRef.current && pendingHitRef.current.index === selectedIndexRef.current) {
            dragRef.current = { index: pendingHitRef.current.index, orig: pendingHitRef.current.orig, sx: x, sy: y };
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
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
      onPanResponderMove: (e, g) => {
        const { locationX: x, locationY: y } = e.nativeEvent;
        if (!Number.isFinite(x) || !Number.isFinite(y)) return;
        const t = toolRef.current;
        if (t === 'eraser') { eraseAt(x, y); return; }
        if (t === 'move' || t === 'text') {
          if (!movedRef.current && Math.hypot(g.dx, g.dy) > 6) movedRef.current = true;
          if (dragRef.current) {
            // Long-press engaged → move the picked-up element by the finger delta.
            const d = dragRef.current;
            const moved = translateElement(d.orig, g.dx, g.dy);
            setElements((prev) => prev.map((el, i) => (i === d.index ? moved : el)));
          } else {
            // Panning the board: a real drag cancels the pending long-press.
            if (movedRef.current) clearLongPress();
            const maxScroll = Math.max(0, contentHRef.current - canvasRef.current.h);
            const target = Math.max(0, Math.min(maxScroll, panStartScrollRef.current - g.dy));
            scrollYRef.current = target;
            scrollRef.current?.scrollTo({ y: target, animated: false });
          }
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
      onPanResponderTerminate: () => { clearLongPress(); dragRef.current = null; pendingHitRef.current = null; },
      onPanResponderRelease: (e, g) => {
        const t = toolRef.current;
        if (t === 'move' || t === 'text') {
          const wasDragging = !!dragRef.current;
          const tapped = !movedRef.current;
          const hit = pendingHitRef.current;
          clearLongPress(); dragRef.current = null; pendingHitRef.current = null;
          if (t === 'text' && tapped && tapRef.current) {
            openTextEditorAt(tapRef.current.x, tapRef.current.y);
          } else if (t === 'move' && tapped) {
            // Tap selects the element under the finger (or clears the selection).
            setSelectedIndex(hit ? hit.index : null);
            if (hit) Haptics.selectionAsync().catch(() => {});
          } else if (!wasDragging && movedRef.current && Math.abs(g.vy) > 0.05) {
            startMomentum(-g.vy); // fling the board
          }
          return;
        }
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

  // Arabic → right-aligned (top-right); Latin → left-aligned (top-left).
  const rtl = /[\u0600-\u06FF\u0750-\u077F]/.test(textValue);
  // Clamp the caret x so text always has room to wrap into full lines (no cutting).
  const inlineX = editing ? Math.min(editing.x, Math.max(16, canvas.w * 0.34)) : 0;

  const commitInlineText = () => {
    if (editing) {
      const txt = textValue.trim();
      const el: BoardElement = rtl
        ? { type: 'text', x: 16, y: editing.y + textSize * 0.82, text: txt, color: textColor, size: textSize, align: 'right' }
        : { type: 'text', x: inlineX, y: editing.y + textSize * 0.82, text: txt, color: textColor, size: textSize };
      if (editingIndex != null) {
        // Editing an existing element: replace it, or delete it if emptied.
        setElements((prev) => {
          if (editingIndex >= prev.length) return prev;
          if (!txt) return prev.filter((_, i) => i !== editingIndex);
          const next = [...prev];
          next[editingIndex] = el;
          return next;
        });
        redo.current = [];
      } else if (txt) {
        commit(el);
      }
    }
    setEditing(null); setEditingIndex(null); setTextValue('');
  };
  const cancelInlineText = () => { setEditing(null); setEditingIndex(null); setTextValue(''); };

  // Switching tools must finish any open text first (e.g. if the keyboard was
  // swiped away without pressing Done, `editing` would otherwise stay set and
  // block the next tool's gestures).
  const changeTool = (next: Tool) => {
    if (editing) commitInlineText();
    setTool(next);
  };

  // ── Selected-element actions (Move tool) ───────────────────────
  const resizeSelected = (dir: 1 | -1) => {
    if (selectedIndex == null) return;
    setElements((prev) => prev.map((el, i) => {
      if (i !== selectedIndex) return el;
      if (el.type === 'text') return { ...el, size: Math.max(12, Math.min(96, el.size + dir * 3)) };
      if (el.type === 'stroke') return el; // freehand strokes aren't resized
      const cx = (el.x1 + el.x2) / 2, cy = (el.y1 + el.y2) / 2, f = dir > 0 ? 1.12 : 0.89;
      return { ...el, x1: cx + (el.x1 - cx) * f, y1: cy + (el.y1 - cy) * f, x2: cx + (el.x2 - cx) * f, y2: cy + (el.y2 - cy) * f };
    }));
    redo.current = [];
  };
  const editSelected = () => {
    if (selectedIndex == null) return;
    const el = elements[selectedIndex];
    if (!el || el.type !== 'text') return;
    setTextValue(el.text); setTextColor(el.color); setTextSize(el.size);
    setEditingIndex(selectedIndex);
    setEditing({ x: el.x, y: el.y - el.size * 0.82 });
    setSelectedIndex(null);
  };
  const deleteSelected = () => {
    if (selectedIndex == null) return;
    setElements((prev) => prev.filter((_, i) => i !== selectedIndex));
    redo.current = [];
    setSelectedIndex(null);
  };

  // Render a CourseSpec onto the board (shared by AI + manual builder), keeping
  // freehand drawings added after the previous course.
  const renderCourse = (spec: CourseSpec, keepManual: boolean) => {
    const bg = background === 'white' || background === 'cream' ? background : 'dark';
    const board = buildBoardFromCourse(spec, canvasRef.current.w || 360, bg);
    lastSpecRef.current = spec;
    const manual = keepManual ? elements.slice(aiCountRef.current) : [];
    aiCountRef.current = board.elements.length;
    setElements([...board.elements, ...manual]);
    setBackground(bg);
    redo.current = [];
  };

  const handleBuilderSave = (spec: CourseSpec) => {
    renderCourse(spec, true);
    setBuilderOpen(false);
  };

  // ── AI course drafting / refining ──────────────────────────────
  const handleAiSubmit = async (req: CourseGenRequest) => {
    const refine = req.mode === 'refine';
    setAiLoading(true);
    try {
      const args =
        req.mode === 'refine'
          ? { topic: lastSpecRef.current?.title || 'lesson', refineInstruction: req.instruction, priorSpec: lastSpecRef.current || undefined }
          : req.source === 'lesson'
            ? { topic: req.title, sourceMaterial: getCurriculumDigest(req.lessonId, language) }
            : { topic: req.topic, level: req.level };
      const spec = await generateCourseSpec({ ...args, language, model: 'sonnet' });
      renderCourse(spec, refine); // draft: clean · refine: keep manual drawings
      setAiModal(null);
    } catch (e: any) {
      const msg = e?.message === 'no_credits' ? 'You are out of AI credits.'
        : e?.message === 'auth_required' ? 'Please sign in to use AI.'
        : e?.message === 'rate_limit' ? 'Too many requests — try again shortly.'
        : e?.message === 'bad_response' ? 'The AI response could not be read. Try again or rephrase.'
        : 'Could not generate the course. Please try again.';
      Alert.alert('AI course', msg);
    } finally {
      setAiLoading(false);
    }
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

  // Virtual canvas height: at least the viewport, plus headroom below the drawn
  // content so the board can be scrolled and extended in edit mode.
  // Keep a full extra viewport of bottom headroom so ANY caret position (even a
  // tap at the very bottom) can be scrolled up above the keyboard, and there is
  // always room to draw/type below existing content — even on an empty board.
  const contentH = useMemo(
    () => (canvas.w < 2 ? canvas.h : Math.max(canvas.h, boardContentHeight(elements, canvas.w)) + canvas.h),
    [elements, canvas.w, canvas.h]
  );
  contentHRef.current = contentH;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaProvider style={{ flex: 1 }}><SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={onClose} hitSlop={8}><Ionicons name="close" size={24} color="#e2e8f0" /></Pressable>
          <Text style={styles.headerTitle}>{initial ? 'Edit board' : 'Board'}</Text>
          <Pressable onPress={() => setBuilderOpen(true)} style={styles.iconBtn} hitSlop={6}>
            <Ionicons name="list" size={20} color="#cbd5e1" />
          </Pressable>
          <Pressable onPress={() => setAiModal(lastSpecRef.current ? 'refine' : 'draft')} style={styles.aiBtn} hitSlop={6}>
            <Ionicons name="sparkles" size={18} color={groupColor} />
            <Text style={[styles.aiBtnText, { color: groupColor }]}>{t('community.ai')}</Text>
          </Pressable>
          <Pressable onPress={handleSave} style={[styles.postBtn, { backgroundColor: groupColor }]}>
            <Text style={styles.postText}>{initial ? 'Update' : 'Post'}</Text>
          </Pressable>
        </View>

        {/* Canvas */}
        <View
          style={styles.canvasWrap}
          onLayout={(ev) => setCanvas({ w: Math.round(ev.nativeEvent.layout.width), h: Math.round(ev.nativeEvent.layout.height) })}
        >
          <ScrollView
            ref={scrollRef}
            style={StyleSheet.absoluteFill}
            scrollEnabled={editing != null}
            onScroll={(e) => { scrollYRef.current = e.nativeEvent.contentOffset.y; }}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="none"
          >
            <View style={{ width: canvas.w, height: contentH }}>
              <View style={StyleSheet.absoluteFill}>
                <BoardCanvas
                  content={{ ...baseContent, height: contentH, elements: editingIndex != null ? elements.filter((_, i) => i !== editingIndex) : elements }}
                  width={canvas.w}
                  height={contentH}
                />
              </View>
              {/* Live overlay (1:1 with canvas): in-progress strokes + picked-up highlight */}
              <View style={StyleSheet.absoluteFill} pointerEvents="none">
                {(live || (selectedIndex != null && elements[selectedIndex])) && (
                  <Svg width={canvas.w} height={contentH} viewBox={`0 0 ${canvas.w} ${contentH}`}>
                    {live ? renderBoardElement(live, 'live', canvas.w) : null}
                    {selectedIndex != null && elements[selectedIndex] ? (() => {
                      const b = boundsOf(elements[selectedIndex], canvas.w);
                      return <Rect x={b[0] - 6} y={b[1] - 6} width={(b[2] - b[0]) + 12} height={(b[3] - b[1]) + 12} rx={8} stroke={groupColor} strokeWidth={2} strokeDasharray="6 5" fill={`${groupColor}18`} />;
                    })() : null}
                  </Svg>
                )}
              </View>
              {/* Touch layer (disabled while typing so taps reach the caret) */}
              {!editing && <View style={StyleSheet.absoluteFill} {...pan.panHandlers} />}
              {/* Inline text caret — type directly on the board */}
              {editing && (
                <TextInput
                  style={[
                    styles.inlineInput,
                    {
                      left: rtl ? 16 : inlineX,
                      top: editing.y,
                      width: rtl ? Math.max(60, canvas.w - 32) : Math.max(60, canvas.w - inlineX - 8),
                      color: textColor,
                      fontSize: Math.min(textSize, 44),
                      lineHeight: Math.min(textSize, 44) * 1.28,
                      textAlign: rtl ? 'right' : 'left',
                      writingDirection: rtl ? 'rtl' : 'ltr',
                    },
                  ]}
                  value={textValue}
                  onChangeText={setTextValue}
                  autoFocus
                  multiline
                  blurOnSubmit={false}
                  selectionColor={groupColor}
                  placeholder={t('community.typePlaceholder')}
                  placeholderTextColor="#64748b"
                />
              )}
            </View>
          </ScrollView>

          {/* Empty-state: draft with AI or build manually */}
          {elements.length === 0 && !live && !editing && (
            <View style={styles.emptyState} pointerEvents="box-none">
              <Pressable style={[styles.draftBtn, { backgroundColor: groupColor }]} onPress={() => setAiModal('draft')}>
                <Ionicons name="sparkles" size={18} color="#ffffff" />
                <Text style={styles.draftText}>{t('community.draftCourseAI')}</Text>
              </Pressable>
              <Pressable style={styles.buildBtn} onPress={() => setBuilderOpen(true)}>
                <Ionicons name="list" size={17} color="#cbd5e1" />
                <Text style={styles.buildText}>{t('community.buildCourseManually')}</Text>
              </Pressable>
              <Text style={styles.emptyHint}>{t('community.orDrawFreely')}</Text>
            </View>
          )}
        </View>

        {/* ── Bottom control panel ─────────────────────────── */}
        <View style={styles.panel}>
          {/* Shape picker (only when Shapes tool active) */}
          {isShape && (
            <View style={styles.shapeRow}>
              {SHAPES.map((s) => {
                const on = tool === s.tool;
                return (
                  <Pressable key={s.tool} onPress={() => changeTool(s.tool)} style={[styles.shapeBtn, on && { backgroundColor: `${groupColor}22`, borderColor: groupColor }]}>
                    <Ionicons name={s.icon as any} size={16} color={on ? groupColor : '#cbd5e1'} />
                    <Text style={[styles.shapeText, on && { color: groupColor }]}>{s.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          )}

          {/* Selected-element action bar (Move tool) */}
          {tool === 'move' && !editing && selectedIndex != null && elements[selectedIndex] ? (
            <View style={styles.selBar}>
              {elements[selectedIndex].type !== 'stroke' && (
                <View style={styles.selResize}>
                  <Pressable style={styles.stepBtn} onPress={() => resizeSelected(-1)}><Ionicons name="remove" size={18} color="#e2e8f0" /></Pressable>
                  <Text style={styles.selResizeLabel}>{t('community.size')}</Text>
                  <Pressable style={styles.stepBtn} onPress={() => resizeSelected(1)}><Ionicons name="add" size={18} color="#e2e8f0" /></Pressable>
                </View>
              )}
              {elements[selectedIndex].type === 'text' && (
                <Pressable style={styles.selAction} onPress={editSelected}><Ionicons name="create-outline" size={17} color="#cbd5e1" /><Text style={styles.selActionText}>{t('community.edit')}</Text></Pressable>
              )}
              <Pressable style={styles.selAction} onPress={deleteSelected}><Ionicons name="trash-outline" size={17} color="#ef4444" /><Text style={[styles.selActionText, { color: '#ef4444' }]}>{t('community.delete')}</Text></Pressable>
              <Pressable style={styles.selAction} onPress={() => setSelectedIndex(null)}><Text style={[styles.selActionText, { color: groupColor }]}>{t('common.done')}</Text></Pressable>
            </View>
          ) : tool === 'move' && !editing ? (
            <Text style={styles.moveHint}>{t('community.moveHintSelect')}</Text>
          ) : null}
          {/* Text-mode hint */}
          {tool === 'text' && !editing && (
            <Text style={styles.moveHint}>{t('community.moveHintText')}</Text>
          )}

          {/* Primary tools (labeled) */}
          <View style={styles.toolsRow}>
            {PRIMARY.map((t) => {
              const active = t.tool === 'shapes' ? isShape : tool === t.tool;
              return (
                <Pressable
                  key={t.tool}
                  style={styles.toolCol}
                  onPress={() => (t.tool === 'shapes' ? (!isShape && changeTool('arrow')) : changeTool(t.tool as Tool))}
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
            <Pressable style={styles.action} onPress={undo}><Ionicons name="arrow-undo" size={19} color="#cbd5e1" /><Text style={styles.actionText}>{t('community.undo')}</Text></Pressable>
            <Pressable style={styles.action} onPress={doRedo}><Ionicons name="arrow-redo" size={19} color="#cbd5e1" /><Text style={styles.actionText}>{t('community.redo')}</Text></Pressable>
            <Pressable style={styles.action} onPress={() => setBackground((b) => BACKGROUNDS[(BACKGROUNDS.indexOf(b) + 1) % BACKGROUNDS.length])}>
              <View style={[styles.paperSwatch, { backgroundColor: BOARD_BG[background] }]} /><Text style={styles.actionText}>{t('community.paper')}</Text>
            </Pressable>
            <Pressable style={styles.action} onPress={() => setGrid((g) => (g === 'none' ? 'lines' : g === 'lines' ? 'grid' : 'none'))}>
              <Ionicons name={grid === 'grid' ? 'grid' : grid === 'lines' ? 'reorder-four' : 'square-outline'} size={19} color="#cbd5e1" /><Text style={styles.actionText}>{t('community.grid')}</Text>
            </Pressable>
            <Pressable style={styles.action} onPress={clearAll}><Ionicons name="trash-outline" size={19} color="#ef4444" /><Text style={[styles.actionText, { color: '#ef4444' }]}>{t('common.clear')}</Text></Pressable>
          </View>
        </View>

        {/* Inline text controls — float above the keyboard while typing on the board */}
        {editing && (
          <KeyboardAvoidingView
            style={styles.textBarWrap}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            pointerEvents="box-none"
          >
            <View style={styles.textBar}>
              <Pressable style={styles.stepBtn} onPress={() => setTextSize((s) => Math.max(14, s - 3))}><Ionicons name="remove" size={20} color="#e2e8f0" /></Pressable>
              <Text style={styles.stepVal}>{textSize}</Text>
              <Pressable style={styles.stepBtn} onPress={() => setTextSize((s) => Math.min(80, s + 3))}><Ionicons name="add" size={20} color="#e2e8f0" /></Pressable>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.textBarSwatches} contentContainerStyle={{ gap: 10, alignItems: 'center', paddingHorizontal: 4 }} keyboardShouldPersistTaps="handled">
                {PALETTE.map((c) => (
                  <Pressable key={c} onPress={() => setTextColor(c)} style={[styles.swatch, { backgroundColor: c }, textColor === c && styles.swatchActive]} />
                ))}
              </ScrollView>
              <Pressable onPress={cancelInlineText} hitSlop={6}><Text style={styles.textCancel}>{t('common.cancel')}</Text></Pressable>
              <Pressable onPress={commitInlineText} style={[styles.textAdd, { backgroundColor: groupColor }]}><Text style={styles.textAddText}>{t('common.done')}</Text></Pressable>
            </View>
          </KeyboardAvoidingView>
        )}

        {/* AI course drafting / refining */}
        {aiModal && (
          <AICoursePromptModal
            visible
            mode={aiModal}
            groupColor={groupColor}
            loading={aiLoading}
            curriculum={curriculum}
            onSubmit={handleAiSubmit}
            onClose={() => { if (!aiLoading) setAiModal(null); }}
          />
        )}

        {/* Manual course builder (same layout engine as AI) */}
        {builderOpen && (
          <CourseBuilderModal
            visible
            groupColor={groupColor}
            initial={lastSpecRef.current}
            onSave={handleBuilderSave}
            onClose={() => setBuilderOpen(false)}
          />
        )}
      </SafeAreaView></SafeAreaProvider>
    </Modal>
  );
}

function r(n: number) { return Math.round(n * 10) / 10; }

// Translate any element by (dx, dy) from its original position.
function translateElement(orig: BoardElement, dx: number, dy: number): BoardElement {
  if (!Number.isFinite(dx) || !Number.isFinite(dy)) return orig; // never corrupt with NaN
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

// Bounding box of an element in board coordinates (used for the picked-up highlight).
function textBounds(el: Extract<BoardElement, { type: 'text' }>, canvasWidth: number): [number, number, number, number] {
  const RM = 16;
  const right = el.align === 'right';
  const avail = right ? Math.max(80, canvasWidth - 2 * RM) : Math.max(80, canvasWidth - el.x - 12);
  const lines = wrapBoardText(el.text, el.size, avail);
  const longest = Math.max(...lines.map((l) => l.length), 1);
  const w = longest * el.size * 0.55;
  const h = lines.length * el.size * 1.28;
  const top = el.y - el.size;
  // Right-aligned text is anchored to the right margin and grows leftward.
  return right ? [canvasWidth - RM - w, top, canvasWidth - RM, top + h] : [el.x, top, el.x + w, top + h];
}

function boundsOf(el: BoardElement, canvasWidth: number): [number, number, number, number] {
  if (el.type === 'stroke') return el.bbox;
  if (el.type === 'text') return textBounds(el, canvasWidth);
  return [Math.min(el.x1, el.x2), Math.min(el.y1, el.y2), Math.max(el.x1, el.x2), Math.max(el.y1, el.y2)];
}

function hitTest(el: BoardElement, x: number, y: number, canvasWidth: number): boolean {
  const pad = 14;
  const bb = boundsOf(el, canvasWidth);
  return x >= bb[0] - pad && x <= bb[2] + pad && y >= bb[1] - pad && y <= bb[3] + pad;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b1220' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 10 },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: '700', color: '#f8fafc' },
  iconBtn: { width: 36, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155', marginRight: 8 },
  aiBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 11, backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155', marginRight: 8 },
  aiBtnText: { fontWeight: '800', fontSize: 13 },
  buildBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 18, paddingVertical: 11, borderRadius: 14, backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155' },
  buildText: { color: '#cbd5e1', fontWeight: '700', fontSize: 14 },
  postBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
  postText: { color: '#ffffff', fontWeight: '700', fontSize: 14 },
  emptyState: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', gap: 12 },
  draftBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, paddingVertical: 13, borderRadius: 16, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 5 },
  draftText: { color: '#ffffff', fontWeight: '800', fontSize: 15 },
  emptyHint: { fontSize: 12.5, color: '#64748b' },
  canvasWrap: { flex: 1, overflow: 'hidden' },
  // Bottom panel
  panel: { backgroundColor: '#0f172a', borderTopWidth: 1, borderTopColor: '#1e293b', paddingTop: 8 },
  shapeRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, paddingHorizontal: 12, paddingBottom: 8 },
  moveHint: { fontSize: 11.5, color: '#64748b', textAlign: 'center', paddingBottom: 6 },
  selBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 12, paddingBottom: 8, flexWrap: 'wrap' },
  selResize: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  selResizeLabel: { fontSize: 12, fontWeight: '700', color: '#94a3b8' },
  selAction: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 8, paddingVertical: 6 },
  selActionText: { fontSize: 13, fontWeight: '700', color: '#cbd5e1' },
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
  // Inline text caret (typed directly on the board)
  inlineInput: { position: 'absolute', padding: 0, margin: 0, fontWeight: '700', textAlignVertical: 'top', includeFontPadding: false },
  // Floating text controls above the keyboard
  textBarWrap: { position: 'absolute', left: 0, right: 0, bottom: 0, justifyContent: 'flex-end' },
  textBar: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#0f172a', borderTopWidth: 1, borderTopColor: '#1e293b', paddingHorizontal: 12, paddingVertical: 10 },
  textBarSwatches: { flex: 1 },
  stepBtn: { width: 38, height: 34, borderRadius: 9, backgroundColor: '#1e293b', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#334155' },
  stepVal: { fontSize: 15, fontWeight: '800', color: '#f8fafc', minWidth: 30, textAlign: 'center', fontVariant: ['tabular-nums'] },
  textCancel: { fontSize: 15, color: '#94a3b8', fontWeight: '600' },
  textAdd: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 },
  textAddText: { color: '#ffffff', fontWeight: '700' },
});

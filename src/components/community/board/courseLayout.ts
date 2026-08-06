import type { BoardContent, BoardElement, BoardBackground } from '../../../types/classContent';
import type { CourseSpec, CourseSection } from '../../../types/aiBoard';
import { wrapBoardText } from './BoardCanvas';

// A deterministic layout: turns an AI CourseSpec into a cleanly designed board.
// The AI writes the content; this engine owns all positioning & visual design.

interface Palette {
  title: string;
  ink: string;
  muted: string;
  divider: string;
  accent: string;
  headings: string[];
  arabic: string;
  boxFill: string;
  boxBorder: string;
  summaryFill: string;
  badgeText: string;
}

function palette(bg: BoardBackground): Palette {
  const light = bg === 'white' || bg === 'cream';
  return light
    ? {
        title: '#0f172a', ink: '#1f2937', muted: '#64748b', divider: '#cbd5e1', accent: '#0ea5e9',
        headings: ['#0284c7', '#059669', '#d97706', '#db2777', '#7c3aed', '#ea580c'],
        arabic: '#7c2d12', boxFill: '#ffffff', boxBorder: '#e2e8f0', summaryFill: 'rgba(14,165,233,0.10)', badgeText: '#ffffff',
      }
    : {
        title: '#ffffff', ink: '#e2e8f0', muted: '#94a3b8', divider: '#334155', accent: '#34d399',
        headings: ['#38bdf8', '#34d399', '#fbbf24', '#f472b6', '#a78bfa', '#fb923c'],
        arabic: '#fde68a', boxFill: '#1e293b', boxBorder: '#334155', summaryFill: 'rgba(52,211,153,0.14)', badgeText: '#0b1220',
      };
}

type TextWeight = '400' | '500' | '600' | '700' | '800';

const LH = 1.28; // line-height factor
const lines = (t: string, size: number, w: number) => wrapBoardText(t, size, Math.max(60, w)).length;
const blockH = (t: string, size: number, w: number) => lines(t, size, w) * size * LH;

export function buildBoardFromCourse(spec: CourseSpec, canvasWidth: number, background: BoardBackground = 'dark'): BoardContent {
  const W = Math.max(300, canvasWidth);
  const M = 20;
  const contentW = W - 2 * M;
  const c = palette(background);
  const els: BoardElement[] = [];
  let y = 34;

  const addText = (x: number, top: number, text: string, size: number, color: string, weight: TextWeight = '700', availW = W - x - M) => {
    els.push({ type: 'text', x, y: top + size * 0.82, text, size, color, weight });
    return blockH(text, size, availW);
  };

  // ── Title ──────────────────────────────────────────────
  y += addText(M, y, spec.title, 28, c.title, '800', contentW);
  y += 8;
  els.push({ type: 'rect', x1: M, y1: y, x2: M + 52, y2: y + 5, color: c.accent, width: 0, fill: c.accent, radius: 3 });
  y += 5;
  if (spec.subtitle) { y += 12; y += addText(M, y, spec.subtitle, 15, c.muted, '600', contentW); }
  y += 20;
  els.push({ type: 'line', x1: M, y1: y, x2: W - M, y2: y, color: c.divider, width: 1 });
  y += 22;

  // ── Sections ───────────────────────────────────────────
  spec.sections.forEach((s: CourseSection, i: number) => {
    const hColor = c.headings[i % c.headings.length];
    const badgeR = 13;
    const badgeCx = M + badgeR;
    const badgeCy = y + badgeR;
    els.push({ type: 'circle', x1: M, y1: y, x2: M + 2 * badgeR, y2: y + 2 * badgeR, color: hColor, width: 0, fill: hColor });
    els.push({ type: 'text', x: badgeCx, y: badgeCy + 14 * 0.36, text: String(i + 1), size: 14, color: c.badgeText, weight: '800', align: 'center' } as BoardElement);
    const hx = M + 2 * badgeR + 12;
    const hHeight = addText(hx, y + 2, s.heading, 18, hColor, '700', W - M - hx);
    y += Math.max(2 * badgeR, hHeight) + 10;

    // Bullet points
    for (const p of s.points) {
      els.push({ type: 'circle', x1: M + 4, y1: y + 6, x2: M + 4 + 5, y2: y + 6 + 5, color: c.muted, width: 0, fill: c.muted });
      y += addText(M + 18, y, p, 15, c.ink, '500', W - M - (M + 18)) + 6;
    }

    // Arabic example box
    if (s.arabic) {
      y += 4;
      y += addArabicBox(els, M, y, contentW, s, c);
    }

    y += 18;
    if (i < spec.sections.length - 1) {
      els.push({ type: 'line', x1: M, y1: y - 9, x2: W - M, y2: y - 9, color: c.divider, width: 1 });
    }
  });

  // ── Summary ────────────────────────────────────────────
  if (spec.summary) {
    const padX = 14, padY = 12;
    const txt = `★  ${spec.summary}`;
    const innerH = blockH(txt, 15, contentW - 2 * padX);
    const boxH = innerH + 2 * padY;
    els.push({ type: 'rect', x1: M, y1: y, x2: W - M, y2: y + boxH, color: c.accent, width: 1.5, fill: c.summaryFill, radius: 12 });
    els.push({ type: 'text', x: M + padX, y: y + padY + 15 * 0.82, text: txt, size: 15, color: c.ink, weight: '600' } as BoardElement);
    y += boxH;
  }

  y += 24;
  return { kind: 'board', background, grid: 'none', width: W, height: Math.ceil(y), elements: els };
}

function addArabicBox(els: BoardElement[], x: number, top: number, boxW: number, s: CourseSection, c: Palette): number {
  const padX = 14, padY = 12;
  const innerW = boxW - 2 * padX;
  let iy = top + padY;
  const parts: { text: string; size: number; color: string; weight: any }[] = [];

  const aSize = 26;
  parts.push({ text: s.arabic!, size: aSize, color: c.arabic, weight: '700' });
  let contentH = blockH(s.arabic!, aSize, innerW) + 6;
  if (s.translit) { parts.push({ text: s.translit, size: 13, color: c.muted, weight: '400' }); contentH += blockH(s.translit, 13, innerW) + 3; }
  if (s.translation) { parts.push({ text: s.translation, size: 15, color: c.ink, weight: '600' }); contentH += blockH(s.translation, 15, innerW); }

  const boxH = contentH + 2 * padY - 6;
  els.push({ type: 'rect', x1: x, y1: top, x2: x + boxW, y2: top + boxH, color: c.boxBorder, width: 1, fill: c.boxFill, radius: 12 });

  for (const p of parts) {
    els.push({ type: 'text', x: x + padX, y: iy + p.size * 0.82, text: p.text, size: p.size, color: p.color, weight: p.weight } as BoardElement);
    iy += blockH(p.text, p.size, innerW) + (p.size >= 20 ? 6 : 3);
  }
  return boxH;
}

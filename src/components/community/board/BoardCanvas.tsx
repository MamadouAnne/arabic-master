import React from 'react';
import Svg, { Rect, Path, Line, Circle, Text as SvgText, TSpan, G } from 'react-native-svg';
import type { BoardContent, BoardElement } from '../../../types/classContent';
import { BOARD_BG } from '../../../types/classContent';

// Height that just fits the drawn content (so the board crops to what was drawn,
// with a small bottom margin and a sensible minimum).
export function boardContentHeight(elements: BoardElement[], width: number, minHeight = 160): number {
  let maxY = 0;
  for (const el of elements) {
    if (el.type === 'text') {
      const lines = wrapBoardText(el.text, el.size, Math.max(80, width - el.x - 12)).length;
      maxY = Math.max(maxY, el.y + lines * el.size * 1.28);
    } else if (el.type === 'stroke') {
      maxY = Math.max(maxY, el.bbox[3]);
    } else {
      maxY = Math.max(maxY, el.y1, el.y2);
    }
  }
  return Math.max(minHeight, Math.ceil(maxY + 28));
}

// Wrap board text into lines (honors explicit newlines + soft-wraps long lines).
export function wrapBoardText(text: string, size: number, maxWidth: number): string[] {
  const maxChars = Math.max(6, Math.floor(maxWidth / (size * 0.52)));
  const out: string[] = [];
  for (const raw of text.split('\n')) {
    const words = raw.split(' ');
    let line = '';
    for (const w of words) {
      const cand = line ? `${line} ${w}` : w;
      if (cand.length > maxChars && line) { out.push(line); line = w; }
      else line = cand;
    }
    out.push(line);
  }
  return out.length ? out : [text];
}

interface Props {
  content: BoardContent;
  live?: BoardElement | null;
  width: number;
  height: number;
  viewBox?: string; // override to show a sub-region (e.g. a content-cropped thumbnail)
}

// Tight bounding box of all drawn content (for compact chat thumbnails).
export function boardContentBounds(elements: BoardElement[], width: number, pad = 18): { x: number; y: number; w: number; h: number } | null {
  if (!elements.length) return null;
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const el of elements) {
    if (el.type === 'text') {
      const lines = wrapBoardText(el.text, el.size, Math.max(80, width - el.x - 12));
      const longest = Math.max(...lines.map((l) => l.length), 1);
      minX = Math.min(minX, el.x);
      maxX = Math.max(maxX, el.x + longest * el.size * 0.52);
      minY = Math.min(minY, el.y - el.size);
      maxY = Math.max(maxY, el.y + (lines.length - 1) * el.size * 1.28 + el.size * 0.3);
    } else if (el.type === 'stroke') {
      minX = Math.min(minX, el.bbox[0]); minY = Math.min(minY, el.bbox[1]);
      maxX = Math.max(maxX, el.bbox[2]); maxY = Math.max(maxY, el.bbox[3]);
    } else {
      minX = Math.min(minX, el.x1, el.x2); minY = Math.min(minY, el.y1, el.y2);
      maxX = Math.max(maxX, el.x1, el.x2); maxY = Math.max(maxY, el.y1, el.y2);
    }
  }
  const x = Math.max(0, minX - pad), y = Math.max(0, minY - pad);
  return { x, y, w: Math.max(40, maxX + pad - x), h: Math.max(30, maxY + pad - y) };
}

export function renderBoardElement(el: BoardElement, key: string, canvasWidth = 360) {
  if (el.type === 'stroke') {
    return (
      <Path
        key={key}
        d={el.d}
        stroke={el.color}
        strokeWidth={el.width}
        strokeOpacity={el.tool === 'highlighter' ? 0.35 : 1}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    );
  }
  if (el.type === 'line' || el.type === 'arrow') {
    const nodes = [<Line key={`${key}l`} x1={el.x1} y1={el.y1} x2={el.x2} y2={el.y2} stroke={el.color} strokeWidth={el.width} strokeLinecap="round" />];
    if (el.type === 'arrow') {
      const angle = Math.atan2(el.y2 - el.y1, el.x2 - el.x1);
      const len = 10 + el.width * 2;
      const a1 = angle + Math.PI - 0.5;
      const a2 = angle + Math.PI + 0.5;
      nodes.push(<Line key={`${key}a1`} x1={el.x2} y1={el.y2} x2={el.x2 + len * Math.cos(a1)} y2={el.y2 + len * Math.sin(a1)} stroke={el.color} strokeWidth={el.width} strokeLinecap="round" />);
      nodes.push(<Line key={`${key}a2`} x1={el.x2} y1={el.y2} x2={el.x2 + len * Math.cos(a2)} y2={el.y2 + len * Math.sin(a2)} stroke={el.color} strokeWidth={el.width} strokeLinecap="round" />);
    }
    return <G key={key}>{nodes}</G>;
  }
  if (el.type === 'rect') {
    const x = Math.min(el.x1, el.x2), y = Math.min(el.y1, el.y2);
    return <Rect key={key} x={x} y={y} width={Math.abs(el.x2 - el.x1)} height={Math.abs(el.y2 - el.y1)} stroke={el.color} strokeWidth={el.width} fill="none" rx={4} />;
  }
  if (el.type === 'circle') {
    const cx = (el.x1 + el.x2) / 2, cy = (el.y1 + el.y2) / 2;
    const r = Math.hypot(el.x2 - el.x1, el.y2 - el.y1) / 2;
    return <Circle key={key} cx={cx} cy={cy} r={r} stroke={el.color} strokeWidth={el.width} fill="none" />;
  }
  if (el.type === 'text') {
    const lines = wrapBoardText(el.text, el.size, Math.max(80, canvasWidth - el.x - 12));
    const lh = el.size * 1.28;
    return (
      <SvgText key={key} x={el.x} y={el.y} fill={el.color} fontSize={el.size} fontWeight="700">
        {lines.map((ln, i) => (
          <TSpan key={i} x={el.x} dy={i === 0 ? 0 : lh}>{ln}</TSpan>
        ))}
      </SvgText>
    );
  }
  return null;
}

function gridLines(content: BoardContent) {
  const lines: React.ReactNode[] = [];
  const stroke = content.background === 'white' || content.background === 'cream' ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.09)';
  const step = 28;
  if (content.grid === 'lines' || content.grid === 'grid') {
    for (let y = step; y < content.height; y += step) lines.push(<Line key={`h${y}`} x1={0} y1={y} x2={content.width} y2={y} stroke={stroke} strokeWidth={1} />);
  }
  if (content.grid === 'grid') {
    for (let x = step; x < content.width; x += step) lines.push(<Line key={`v${x}`} x1={x} y1={0} x2={x} y2={content.height} stroke={stroke} strokeWidth={1} />);
  }
  return lines;
}

export function BoardCanvas({ content, live, width, height, viewBox }: Props) {
  return (
    <Svg width={width} height={height} viewBox={viewBox || `0 0 ${content.width} ${content.height}`} preserveAspectRatio="xMidYMid meet">
      <Rect x={0} y={0} width={content.width} height={content.height} fill={BOARD_BG[content.background]} />
      {gridLines(content)}
      {content.elements.map((el, i) => renderBoardElement(el, `e${i}`, content.width))}
      {live ? renderBoardElement(live, "live", content.width) : null}
    </Svg>
  );
}

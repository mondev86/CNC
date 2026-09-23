import { Point2D, ToolpathLoop, WorkpieceConfig } from '../types';

export function rotatePoint(p: Point2D, pivot: Point2D, angleRad: number): Point2D {
  if (Math.abs(angleRad) < 1e-6) return { ...p };
  const cos = Math.cos(angleRad);
  const sin = Math.sin(angleRad);
  const dx = p.x - pivot.x;
  const dy = p.y - pivot.y;
  return {
    x: pivot.x + (dx * cos - dy * sin),
    y: pivot.y + (dx * sin + dy * cos)
  };
}

export function computeBounds(loops: ToolpathLoop[]) {
  if (!loops || loops.length === 0) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 };
  }
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  loops.forEach(loop => {
    loop.segments.forEach(seg => {
      [seg.start, seg.end].forEach(pt => {
        if (pt.x < minX) minX = pt.x;
        if (pt.x > maxX) maxX = pt.x;
        if (pt.y < minY) minY = pt.y;
        if (pt.y > maxY) maxY = pt.y;
      });
    });
  });

  if (minX === Infinity) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 };
  }

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: Math.max(0, maxX - minX),
    height: Math.max(0, maxY - minY)
  };
}

export function transformLoops(
  rawLoops: ToolpathLoop[],
  scaleFactor: number,
  workpiece: WorkpieceConfig
): { transformedLoops: ToolpathLoop[]; rawBounds: ReturnType<typeof computeBounds> } {
  const scaledLoops: ToolpathLoop[] = rawLoops.map(loop => ({
    ...loop,
    piercePoint: { x: loop.piercePoint.x * scaleFactor, y: loop.piercePoint.y * scaleFactor },
    startPoint: { x: loop.startPoint.x * scaleFactor, y: loop.startPoint.y * scaleFactor },
    leadIn: loop.leadIn ? {
      ...loop.leadIn,
      start: { x: loop.leadIn.start.x * scaleFactor, y: loop.leadIn.start.y * scaleFactor },
      end: { x: loop.leadIn.end.x * scaleFactor, y: loop.leadIn.end.y * scaleFactor }
    } : undefined,
    leadOut: loop.leadOut ? {
      ...loop.leadOut,
      start: { x: loop.leadOut.start.x * scaleFactor, y: loop.leadOut.start.y * scaleFactor },
      end: { x: loop.leadOut.end.x * scaleFactor, y: loop.leadOut.end.y * scaleFactor }
    } : undefined,
    segments: loop.segments.map(s => ({
      ...s,
      start: { x: s.start.x * scaleFactor, y: s.start.y * scaleFactor },
      end: { x: s.end.x * scaleFactor, y: s.end.y * scaleFactor },
      center: s.center ? { x: s.center.x * scaleFactor, y: s.center.y * scaleFactor } : undefined,
      radius: s.radius ? s.radius * scaleFactor : undefined
    }))
  }));

  const initialBounds = computeBounds(scaledLoops);
  const normalizedLoops: ToolpathLoop[] = scaledLoops.map(loop => ({
    ...loop,
    piercePoint: { x: loop.piercePoint.x - initialBounds.minX, y: loop.piercePoint.y - initialBounds.minY },
    startPoint: { x: loop.startPoint.x - initialBounds.minX, y: loop.startPoint.y - initialBounds.minY },
    leadIn: loop.leadIn ? {
      ...loop.leadIn,
      start: { x: loop.leadIn.start.x - initialBounds.minX, y: loop.leadIn.start.y - initialBounds.minY },
      end: { x: loop.leadIn.end.x - initialBounds.minX, y: loop.leadIn.end.y - initialBounds.minY }
    } : undefined,
    leadOut: loop.leadOut ? {
      ...loop.leadOut,
      start: { x: loop.leadOut.start.x - initialBounds.minX, y: loop.leadOut.start.y - initialBounds.minY },
      end: { x: loop.leadOut.end.x - initialBounds.minX, y: loop.leadOut.end.y - initialBounds.minY }
    } : undefined,
    segments: loop.segments.map(s => ({
      ...s,
      start: { x: s.start.x - initialBounds.minX, y: s.start.y - initialBounds.minY },
      end: { x: s.end.x - initialBounds.minX, y: s.end.y - initialBounds.minY },
      center: s.center ? { x: s.center.x - initialBounds.minX, y: s.center.y - initialBounds.minY } : undefined
    }))
  }));

  const normBounds = computeBounds(normalizedLoops);
  const angleDeg = workpiece.rotationAngle || 0;
  const angleRad = (angleDeg * Math.PI) / 180;
  const pivot: Point2D = workpiece.rotationPivot === 'origin'
    ? { x: 0, y: 0 }
    : { x: normBounds.width / 2, y: normBounds.height / 2 };

  const rotatedLoops: ToolpathLoop[] = normalizedLoops.map(loop => ({
    ...loop,
    piercePoint: rotatePoint(loop.piercePoint, pivot, angleRad),
    startPoint: rotatePoint(loop.startPoint, pivot, angleRad),
    leadIn: loop.leadIn ? {
      ...loop.leadIn,
      start: rotatePoint(loop.leadIn.start, pivot, angleRad),
      end: rotatePoint(loop.leadIn.end, pivot, angleRad)
    } : undefined,
    leadOut: loop.leadOut ? {
      ...loop.leadOut,
      start: rotatePoint(loop.leadOut.start, pivot, angleRad),
      end: rotatePoint(loop.leadOut.end, pivot, angleRad)
    } : undefined,
    segments: loop.segments.map(s => ({
      ...s,
      start: rotatePoint(s.start, pivot, angleRad),
      end: rotatePoint(s.end, pivot, angleRad),
      center: s.center ? rotatePoint(s.center, pivot, angleRad) : undefined
    }))
  }));

  const rotBounds = computeBounds(rotatedLoops);
  const rebasedLoops: ToolpathLoop[] = rotatedLoops.map(loop => ({
    ...loop,
    piercePoint: { x: loop.piercePoint.x - rotBounds.minX, y: loop.piercePoint.y - rotBounds.minY },
    startPoint: { x: loop.startPoint.x - rotBounds.minX, y: loop.startPoint.y - rotBounds.minY },
    leadIn: loop.leadIn ? {
      ...loop.leadIn,
      start: { x: loop.leadIn.start.x - rotBounds.minX, y: loop.leadIn.start.y - rotBounds.minY },
      end: { x: loop.leadIn.end.x - rotBounds.minX, y: loop.leadIn.end.y - rotBounds.minY }
    } : undefined,
    leadOut: loop.leadOut ? {
      ...loop.leadOut,
      start: { x: loop.leadOut.start.x - rotBounds.minX, y: loop.leadOut.start.y - rotBounds.minY },
      end: { x: loop.leadOut.end.x - rotBounds.minX, y: loop.leadOut.end.y - rotBounds.minY }
    } : undefined,
    segments: loop.segments.map(s => ({
      ...s,
      start: { x: s.start.x - rotBounds.minX, y: s.start.y - rotBounds.minY },
      end: { x: s.end.x - rotBounds.minX, y: s.end.y - rotBounds.minY },
      center: s.center ? { x: s.center.x - rotBounds.minX, y: s.center.y - rotBounds.minY } : undefined
    }))
  }));

  const pieceW = rotBounds.width;
  const pieceH = rotBounds.height;

  let baseOriginX = 0;
  let baseOriginY = 0;

  if (workpiece.enabled) {
    if (workpiece.positionMode === 'center') {
      baseOriginX = (workpiece.width - pieceW) / 2;
      baseOriginY = (workpiece.height - pieceH) / 2;
    } else if (workpiece.positionMode === 'origin_with_margin') {
      baseOriginX = workpiece.margin;
      baseOriginY = workpiece.margin;
    } else if (workpiece.positionMode === 'absolute_zero') {
      baseOriginX = 0;
      baseOriginY = 0;
    } else if (workpiece.positionMode === 'manual_offset') {
      baseOriginX = workpiece.offsetX || 0;
      baseOriginY = workpiece.offsetY || 0;
    }
  }

  const shiftX = baseOriginX + (workpiece.offsetX || 0);
  const shiftY = baseOriginY + (workpiece.offsetY || 0);

  const cols = Math.max(1, workpiece.arrayCols || 1);
  const rows = Math.max(1, workpiece.arrayRows || 1);
  const gapX = workpiece.arrayGapX !== undefined ? workpiece.arrayGapX : 10;
  const gapY = workpiece.arrayGapY !== undefined ? workpiece.arrayGapY : 10;

  const resultLoops: ToolpathLoop[] = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const offsetX = shiftX + c * (pieceW + gapX);
      const offsetY = shiftY + r * (pieceH + gapY);
      const suffix = cols > 1 || rows > 1 ? `_r${r}c${c}` : '';

      rebasedLoops.forEach(l => {
        resultLoops.push({
          ...l,
          id: `${l.id}${suffix}`,
          piercePoint: { x: l.piercePoint.x + offsetX, y: l.piercePoint.y + offsetY },
          startPoint: { x: l.startPoint.x + offsetX, y: l.startPoint.y + offsetY },
          leadIn: l.leadIn ? {
            ...l.leadIn,
            start: { x: l.leadIn.start.x + offsetX, y: l.leadIn.start.y + offsetY },
            end: { x: l.leadIn.end.x + offsetX, y: l.leadIn.end.y + offsetY }
          } : undefined,
          leadOut: l.leadOut ? {
            ...l.leadOut,
            start: { x: l.leadOut.start.x + offsetX, y: l.leadOut.start.y + offsetY },
            end: { x: l.leadOut.end.x + offsetX, y: l.leadOut.end.y + offsetY }
          } : undefined,
          segments: l.segments.map(s => ({
            ...s,
            start: { x: s.start.x + offsetX, y: s.start.y + offsetY },
            end: { x: s.end.x + offsetX, y: s.end.y + offsetY },
            center: s.center ? { x: s.center.x + offsetX, y: s.center.y + offsetY } : undefined
          }))
        });
      });
    }
  }

  return {
    transformedLoops: resultLoops,
    rawBounds: normBounds
  };
}

export interface AutoFitTextResult {
  recommendedFontSize: number;
  usableWidth: number;
  usableHeight: number;
  splitTextRecommendation?: string;
  splitFontSizeRecommendation?: number;
}

export interface AutoFitSvgResult {
  targetWidth: number;
  targetHeight: number;
  scale: number;
}

export function calculateOptimalTextSize(
  text: string,
  fontType: import('../types').FontStyleType,
  workpieceW: number,
  workpieceH: number,
  margin: number,
  letterSpacing: number,
  lineSpacing: number,
  rotationAngleDeg: number = 0
): AutoFitTextResult {
  const usableW = Math.max(10, workpieceW - margin * 2);
  const usableH = Math.max(10, workpieceH - margin * 2);
  const sampleFontSize = 40;
  const lines = (text || 'A').split('\n');
  const longestLine = lines.reduce((a, b) => (a.length > b.length ? a : b), 'A');
  const estWidth = longestLine.length * (sampleFontSize * 0.7 + letterSpacing);
  const estHeight = lines.length * sampleFontSize * lineSpacing;

  const rad = Math.abs((rotationAngleDeg * Math.PI) / 180);
  const rotW = estWidth * Math.cos(rad) + estHeight * Math.sin(rad);
  const rotH = estWidth * Math.sin(rad) + estHeight * Math.cos(rad);

  const scaleW = usableW / Math.max(1, rotW);
  const scaleH = usableH / Math.max(1, rotH);
  const factor = Math.min(scaleW, scaleH) * 0.92;
  const recommended = Math.max(10, Math.min(250, Math.round(sampleFontSize * factor)));

  let splitTextRec: string | undefined = undefined;
  let splitFontSizeRec: number | undefined = undefined;

  if (lines.length === 1 && text.trim().includes(' ')) {
    const words = text.trim().split(/\s+/);
    if (words.length >= 2) {
      const mid = Math.ceil(words.length / 2);
      const l1 = words.slice(0, mid).join(' ');
      const l2 = words.slice(mid).join(' ');
      splitTextRec = `${l1}\n${l2}`;

      const longestSplit = l1.length > l2.length ? l1 : l2;
      const splitW = longestSplit.length * (sampleFontSize * 0.7 + letterSpacing);
      const splitH = 2 * sampleFontSize * lineSpacing;
      const sRotW = splitW * Math.cos(rad) + splitH * Math.sin(rad);
      const sRotH = splitW * Math.sin(rad) + splitH * Math.cos(rad);
      const sFactor = Math.min(usableW / Math.max(1, sRotW), usableH / Math.max(1, sRotH)) * 0.92;
      splitFontSizeRec = Math.max(10, Math.min(250, Math.round(sampleFontSize * sFactor)));
    }
  }

  return {
    recommendedFontSize: recommended,
    usableWidth: usableW,
    usableHeight: usableH,
    splitTextRecommendation: splitTextRec,
    splitFontSizeRecommendation: splitFontSizeRec
  };
}

export function calculateOptimalSvgDimensions(
  rawSvgWidth: number,
  rawSvgHeight: number,
  workpieceW: number,
  workpieceH: number,
  margin: number,
  rotationAngleDeg: number = 0
): AutoFitSvgResult {
  const usableW = Math.max(10, workpieceW - margin * 2);
  const usableH = Math.max(10, workpieceH - margin * 2);
  const w = Math.max(1, rawSvgWidth);
  const h = Math.max(1, rawSvgHeight);

  const rad = Math.abs((rotationAngleDeg * Math.PI) / 180);
  const rotW = w * Math.cos(rad) + h * Math.sin(rad);
  const rotH = w * Math.sin(rad) + h * Math.cos(rad);

  const scale = Math.min(usableW / rotW, usableH / rotH) * 0.95;

  return {
    targetWidth: Math.round(w * scale),
    targetHeight: Math.round(h * scale),
    scale
  };
}

import { FontStyleType, WorkpieceConfig, Point2D } from '../types';
import { generateTextVectorLoops } from './plasmaFonts';

export interface AutoFitTextResult {
  recommendedFontSize: number;
  estimatedWidth: number;
  estimatedHeight: number;
  fitsInside: boolean;
  canSplitLines: boolean;
  splitTextRecommendation?: string;
  splitFontSizeRecommendation?: number;
}

export interface AutoFitSvgResult {
  targetWidth: number;
  targetHeight: number;
  scaleFactor: number;
  fitsInside: boolean;
}

/**
 * Rotates a 2D point around a given pivot by angle in radians
 */
export function rotatePoint(p: Point2D, pivot: Point2D, angleRad: number): Point2D {
  if (Math.abs(angleRad) < 1e-6) return { x: p.x, y: p.y };
  const cos = Math.cos(angleRad);
  const sin = Math.sin(angleRad);
  const dx = p.x - pivot.x;
  const dy = p.y - pivot.y;
  return {
    x: pivot.x + dx * cos - dy * sin,
    y: pivot.y + dx * sin + dy * cos
  };
}

/**
 * Calculates transformed and positioned loops according to scale, rotation angle, pivot, and workpiece plate
 */
export function transformLoops(
  rawLoops: { points: Point2D[]; isClosed: boolean }[],
  scale: number,
  workpiece: WorkpieceConfig
): {
  transformedLoops: { points: Point2D[]; isClosed: boolean }[];
  bounds: { minX: number; minY: number; maxX: number; maxY: number; width: number; height: number };
} {
  if (rawLoops.length === 0) {
    return {
      transformedLoops: [],
      bounds: { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 }
    };
  }

  // 1. Compute initial bounding box of scaled points
  let rawMinX = Infinity;
  let rawMinY = Infinity;
  let rawMaxX = -Infinity;
  let rawMaxY = -Infinity;

  rawLoops.forEach(loop => {
    loop.points.forEach(p => {
      const sx = p.x * scale;
      const sy = p.y * scale;
      if (sx < rawMinX) rawMinX = sx;
      if (sy < rawMinY) rawMinY = sy;
      if (sx > rawMaxX) rawMaxX = sx;
      if (sy > rawMaxY) rawMaxY = sy;
    });
  });

  if (!isFinite(rawMinX)) {
    rawMinX = 0; rawMinY = 0; rawMaxX = 10; rawMaxY = 10;
  }

  const rawCenterX = (rawMinX + rawMaxX) / 2;
  const rawCenterY = (rawMinY + rawMaxY) / 2;

  // Pivot selection
  const pivot: Point2D = workpiece.rotationPivot === 'origin'
    ? { x: 0, y: 0 }
    : { x: rawCenterX, y: rawCenterY };

  const angleRad = ((workpiece.rotationAngle || 0) * Math.PI) / 180;

  // 2. Rotate all points
  const rotatedLoops = rawLoops.map(loop => ({
    isClosed: loop.isClosed,
    points: loop.points.map(p => {
      const sx = p.x * scale;
      const sy = p.y * scale;
      return rotatePoint({ x: sx, y: sy }, pivot, angleRad);
    })
  }));

  // 3. Find rotated bounds
  let rotMinX = Infinity;
  let rotMinY = Infinity;
  let rotMaxX = -Infinity;
  let rotMaxY = -Infinity;

  rotatedLoops.forEach(loop => {
    loop.points.forEach(p => {
      if (p.x < rotMinX) rotMinX = p.x;
      if (p.y < rotMinY) rotMinY = p.y;
      if (p.x > rotMaxX) rotMaxX = p.x;
      if (p.y > rotMaxY) rotMaxY = p.y;
    });
  });

  const rotWidth = rotMaxX - rotMinX;
  const rotHeight = rotMaxY - rotMinY;
  const rotCenterX = (rotMinX + rotMaxX) / 2;
  const rotCenterY = (rotMinY + rotMaxY) / 2;

  // 4. Calculate translation offsets based on workpiece configuration
  let shiftX = 0;
  let shiftY = 0;

  if (workpiece.enabled && workpiece.positionMode !== 'absolute_zero') {
    if (workpiece.positionMode === 'center') {
      const targetCenterX = workpiece.width / 2;
      const targetCenterY = workpiece.height / 2;
      shiftX = targetCenterX - rotCenterX;
      shiftY = targetCenterY - rotCenterY;
    } else {
      // 'origin_with_margin'
      shiftX = workpiece.margin - rotMinX;
      shiftY = workpiece.margin - rotMinY;
    }
  }

  // 5. Apply final shift
  let finalMinX = Infinity;
  let finalMinY = Infinity;
  let finalMaxX = -Infinity;
  let finalMaxY = -Infinity;

  const transformedLoops = rotatedLoops.map(loop => ({
    isClosed: loop.isClosed,
    points: loop.points.map(p => {
      const fx = p.x + shiftX;
      const fy = p.y + shiftY;
      if (fx < finalMinX) finalMinX = fx;
      if (fy < finalMinY) finalMinY = fy;
      if (fx > finalMaxX) finalMaxX = fx;
      if (fy > finalMaxY) finalMaxY = fy;
      return { x: fx, y: fy };
    })
  }));

  return {
    transformedLoops,
    bounds: {
      minX: finalMinX,
      minY: finalMinY,
      maxX: finalMaxX,
      maxY: finalMaxY,
      width: Math.max(0, finalMaxX - finalMinX),
      height: Math.max(0, finalMaxY - finalMinY)
    }
  };
}

/**
 * Calculates optimal font size so that the text (even when rotated)
 * fits comfortably inside the selected standard workpiece/sheet with safety margins.
 */
export function calculateOptimalTextSize(
  text: string,
  fontType: FontStyleType,
  workpieceWidth: number,
  workpieceHeight: number,
  margin: number = 20,
  letterSpacing: number = 4,
  lineSpacing: number = 1.3,
  rotationAngle: number = 0
): AutoFitTextResult {
  const cleanText = text.trim();
  if (!cleanText) {
    return {
      recommendedFontSize: 50,
      estimatedWidth: 0,
      estimatedHeight: 0,
      fitsInside: true,
      canSplitLines: false
    };
  }

  const usableWidth = Math.max(50, workpieceWidth - margin * 2);
  const usableHeight = Math.max(30, workpieceHeight - margin * 2);

  const angleRad = (rotationAngle * Math.PI) / 180;

  // Helper to measure rotated bounding box dimensions of loops
  const measureRotatedDims = (loops: { points: Point2D[] }[]) => {
    let minX = Infinity; let minY = Infinity;
    let maxX = -Infinity; let maxY = -Infinity;
    loops.forEach(l => {
      l.points.forEach(p => {
        if (p.x < minX) minX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.x > maxX) maxX = p.x;
        if (p.y > maxY) maxY = p.y;
      });
    });
    const pivot = { x: (minX + maxX) / 2, y: (minY + maxY) / 2 };

    let rMinX = Infinity; let rMinY = Infinity;
    let rMaxX = -Infinity; let rMaxY = -Infinity;
    loops.forEach(l => {
      l.points.forEach(p => {
        const rp = rotatePoint(p, pivot, angleRad);
        if (rp.x < rMinX) rMinX = rp.x;
        if (rp.y < rMinY) rMinY = rp.y;
        if (rp.x > rMaxX) rMaxX = rp.x;
        if (rp.y > rMaxY) rMaxY = rp.y;
      });
    });
    return {
      w: Math.max(1, rMaxX - rMinX),
      h: Math.max(1, rMaxY - rMinY)
    };
  };

  // Measure text at standard reference size (100mm)
  const refResult = generateTextVectorLoops(cleanText, fontType, 100, letterSpacing, lineSpacing);
  const refRot = measureRotatedDims(refResult.loops);

  // Ratio to fit inside usable box
  const scaleX = usableWidth / refRot.w;
  const scaleY = usableHeight / refRot.h;
  const optimalRatio = Math.min(scaleX, scaleY);

  // Calculate font size (clamped between 15mm and 200mm)
  let recommendedFontSize = Math.floor(100 * optimalRatio);
  recommendedFontSize = Math.max(15, Math.min(200, recommendedFontSize));

  // Compute estimated dimensions at recommended font size
  const actualResult = generateTextVectorLoops(cleanText, fontType, recommendedFontSize, letterSpacing, lineSpacing);
  const actualRot = measureRotatedDims(actualResult.loops);

  // Check if splitting into multiple lines is possible and beneficial
  const words = cleanText.split(/\s+/);
  let canSplitLines = false;
  let splitTextRecommendation: string | undefined;
  let splitFontSizeRecommendation: number | undefined;

  if (words.length >= 2 && !cleanText.includes('\n')) {
    canSplitLines = true;
    const mid = Math.ceil(words.length / 2);
    const line1 = words.slice(0, mid).join(' ');
    const line2 = words.slice(mid).join(' ');
    const candidate2Lines = `${line1}\n${line2}`;

    const ref2Lines = generateTextVectorLoops(candidate2Lines, fontType, 100, letterSpacing, lineSpacing);
    const ref2Rot = measureRotatedDims(ref2Lines.loops);
    const scale2X = usableWidth / ref2Rot.w;
    const scale2Y = usableHeight / ref2Rot.h;
    const ratio2 = Math.min(scale2X, scale2Y);
    let optFont2 = Math.floor(100 * ratio2);
    optFont2 = Math.max(15, Math.min(200, optFont2));

    // If 2 lines gives a significantly bigger font (e.g. >= 20% larger), recommend it!
    if (optFont2 > recommendedFontSize * 1.15) {
      splitTextRecommendation = candidate2Lines;
      splitFontSizeRecommendation = optFont2;
    }
  }

  return {
    recommendedFontSize,
    estimatedWidth: Math.round(actualRot.w),
    estimatedHeight: Math.round(actualRot.h),
    fitsInside: actualRot.w <= usableWidth && actualRot.h <= usableHeight,
    canSplitLines,
    splitTextRecommendation,
    splitFontSizeRecommendation
  };
}

/**
 * Calculates optimal SVG dimensions to fit within the workpiece (accounting for rotation)
 */
export function calculateOptimalSvgDimensions(
  originalWidth: number,
  originalHeight: number,
  workpieceWidth: number,
  workpieceHeight: number,
  margin: number = 20,
  rotationAngle: number = 0
): AutoFitSvgResult {
  const usableWidth = Math.max(50, workpieceWidth - margin * 2);
  const usableHeight = Math.max(30, workpieceHeight - margin * 2);

  const safeW = Math.max(1, originalWidth);
  const safeH = Math.max(1, originalHeight);

  const rad = (rotationAngle * Math.PI) / 180;
  const rotW = Math.abs(safeW * Math.cos(rad)) + Math.abs(safeH * Math.sin(rad));
  const rotH = Math.abs(safeW * Math.sin(rad)) + Math.abs(safeH * Math.cos(rad));

  const scaleX = usableWidth / Math.max(1, rotW);
  const scaleY = usableHeight / Math.max(1, rotH);
  const scaleFactor = Math.min(scaleX, scaleY);

  const targetWidth = Math.round(safeW * scaleFactor);
  const targetHeight = Math.round(safeH * scaleFactor);

  return {
    targetWidth,
    targetHeight,
    scaleFactor,
    fitsInside: (rotW * scaleFactor) <= usableWidth && (rotH * scaleFactor) <= usableHeight
  };
}

/**
 * Legacy compatibility helper
 */
export function calculateWorkpieceOffsets(
  contentWidth: number,
  contentHeight: number,
  workpiece: WorkpieceConfig
): { offsetX: number; offsetY: number } {
  if (!workpiece.enabled || workpiece.positionMode === 'absolute_zero') {
    return { offsetX: 0, offsetY: 0 };
  }

  if (workpiece.positionMode === 'center') {
    const rawOffsetX = (workpiece.width - contentWidth) / 2;
    const rawOffsetY = (workpiece.height - contentHeight) / 2;
    return {
      offsetX: Math.max(workpiece.margin, Math.round(rawOffsetX * 10) / 10),
      offsetY: Math.max(workpiece.margin, Math.round(rawOffsetY * 10) / 10)
    };
  }

  // 'origin_with_margin'
  return {
    offsetX: workpiece.margin,
    offsetY: workpiece.margin
  };
}

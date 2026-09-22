import { FontStyleType, WorkpieceConfig, Point2D } from '../types';
import { generateTextVectorLoops } from './plasmaFonts';

/**
 * ============================================================================
 * MÓDULO: CALCULADORA GEOMÉTRICA DE CHAPA, ROTACIÓN Y MATRIZ
 * Archivo: src/utils/workpieceCalculator.ts
 * ============================================================================
 * Este módulo contiene toda la lógica matemática 2D para:
 * 1. Rotar figuras a cualquier ángulo respetando un punto pivote.
 * 2. Calcular desplazamientos manuales (X/Y) para aprovechar retazos.
 * 3. Replicar figuras en matrices de filas y columnas (Nesting simple).
 * 4. Calcular el escalado óptimo de textos y archivos SVG para no salirse de la chapa.
 */

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
 * Rota un punto 2D (p) alrededor de un centro pivote usando trigonometría pura.
 * Matriz de rotación en 2D:
 * x' = pivot.x + (dx * cos - dy * sin)
 * y' = pivot.y + (dx * sin + dy * cos)
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
 * Transforma los bucles vectoriales originales según:
 * - Escala deseada
 * - Ángulo de inclinación (° rotación)
 * - Modo de anclaje en la chapa (centrado, origen con margen, etc.)
 * - Desplazamiento manual en X e Y
 * - Matriz de piezas (filas × columnas con separación)
 */
export function transformLoops(
  rawLoops: { points: Point2D[]; isClosed: boolean }[],
  scale: number,
  workpiece: WorkpieceConfig
): {
  transformedLoops: { points: Point2D[]; isClosed: boolean }[];
  bounds: { minX: number; minY: number; maxX: number; maxY: number; width: number; height: number };
} {
  // Retorno seguro en caso de no haber trayectorias cargadas
  if (rawLoops.length === 0) {
    return {
      transformedLoops: [],
      bounds: { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 }
    };
  }

  // --------------------------------------------------------------------------
  // BLOQUE 1: Calcular la envolvente (Bounding Box) de la figura original escalada
  // --------------------------------------------------------------------------
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

  // --------------------------------------------------------------------------
  // BLOQUE 2: Determinar el pivote y rotar cada punto
  // --------------------------------------------------------------------------
  const pivot: Point2D = workpiece.rotationPivot === 'origin'
    ? { x: 0, y: 0 }
    : { x: rawCenterX, y: rawCenterY };

  const angleRad = ((workpiece.rotationAngle || 0) * Math.PI) / 180;

  const rotatedLoops = rawLoops.map(loop => ({
    isClosed: loop.isClosed,
    points: loop.points.map(p => {
      const sx = p.x * scale;
      const sy = p.y * scale;
      return rotatePoint({ x: sx, y: sy }, pivot, angleRad);
    })
  }));

  // --------------------------------------------------------------------------
  // BLOQUE 3: Calcular límites de la figura ya rotada
  // --------------------------------------------------------------------------
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

  // --------------------------------------------------------------------------
  // BLOQUE 4: Calcular desplazamientos base según la chapa y el desplazamiento manual
  // --------------------------------------------------------------------------
  let shiftX = 0;
  let shiftY = 0;

  const userOffsetX = workpiece.offsetX || 0;
  const userOffsetY = workpiece.offsetY || 0;

  if (workpiece.enabled && workpiece.positionMode !== 'absolute_zero') {
    if (workpiece.positionMode === 'center') {
      const targetCenterX = workpiece.width / 2;
      const targetCenterY = workpiece.height / 2;
      shiftX = (targetCenterX - rotCenterX) + userOffsetX;
      shiftY = (targetCenterY - rotCenterY) + userOffsetY;
    } else if (workpiece.positionMode === 'manual_offset') {
      shiftX = userOffsetX - rotMinX;
      shiftY = userOffsetY - rotMinY;
    } else {
      // 'origin_with_margin' (esquina inferior izquierda respetando margen de seguridad)
      shiftX = workpiece.margin - rotMinX + userOffsetX;
      shiftY = workpiece.margin - rotMinY + userOffsetY;
    }
  } else {
    // Modo cero absoluto directo
    shiftX = userOffsetX;
    shiftY = userOffsetY;
  }

  // --------------------------------------------------------------------------
  // BLOQUE 5: Replicación en matriz (Columnas en X, Filas en Y)
  // --------------------------------------------------------------------------
  const cols = Math.max(1, workpiece.arrayCols || 1);
  const rows = Math.max(1, workpiece.arrayRows || 1);
  const gapX = workpiece.arrayGapX !== undefined ? workpiece.arrayGapX : 10;
  const gapY = workpiece.arrayGapY !== undefined ? workpiece.arrayGapY : 10;

  const pitchX = rotWidth + gapX;
  const pitchY = rotHeight + gapY;

  const allLoops: { points: Point2D[]; isClosed: boolean }[] = [];

  let finalMinX = Infinity;
  let finalMinY = Infinity;
  let finalMaxX = -Infinity;
  let finalMaxY = -Infinity;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const stepX = shiftX + c * pitchX;
      const stepY = shiftY + r * pitchY;

      rotatedLoops.forEach(loop => {
        const shiftedPoints = loop.points.map(p => {
          const fx = p.x + stepX;
          const fy = p.y + stepY;
          if (fx < finalMinX) finalMinX = fx;
          if (fy < finalMinY) finalMinY = fy;
          if (fx > finalMaxX) finalMaxX = fx;
          if (fy > finalMaxY) finalMaxY = fy;
          return { x: fx, y: fy };
        });
        allLoops.push({
          isClosed: loop.isClosed,
          points: shiftedPoints
        });
      });
    }
  }

  return {
    transformedLoops: allLoops,
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
 * Calcula la altura de letra óptima para que un texto quepa perfectamente en la chapa,
 * teniendo en cuenta el ángulo de inclinación seleccionado y los márgenes de seguridad.
 * Admite parámetros directos o el objeto WorkpieceConfig.
 */
export function calculateOptimalTextSize(
  text: string,
  fontType: FontStyleType,
  widthOrLetterSpacing: number,
  heightOrLineSpacing: number,
  marginOrWorkpiece: number | WorkpieceConfig,
  letterSpacing?: number,
  lineSpacing?: number,
  rotationAngle?: number
): AutoFitTextResult {
  // Manejo polimórfico de argumentos
  let plateWidth = 600;
  let plateHeight = 400;
  let plateMargin = 20;
  let plateAngle = 0;
  let lSpacing = 1.0;
  let lnSpacing = 1.3;

  if (typeof marginOrWorkpiece === 'object') {
    // Firma: (text, fontType, letterSpacing, lineSpacing, workpiece)
    lSpacing = widthOrLetterSpacing;
    lnSpacing = heightOrLineSpacing;
    plateWidth = marginOrWorkpiece.width;
    plateHeight = marginOrWorkpiece.height;
    plateMargin = marginOrWorkpiece.margin;
    plateAngle = marginOrWorkpiece.rotationAngle || 0;
  } else {
    // Firma: (text, fontType, width, height, margin, letterSpacing, lineSpacing, rotationAngle)
    plateWidth = widthOrLetterSpacing;
    plateHeight = heightOrLineSpacing;
    plateMargin = marginOrWorkpiece;
    lSpacing = letterSpacing !== undefined ? letterSpacing : 1.0;
    lnSpacing = lineSpacing !== undefined ? lineSpacing : 1.3;
    plateAngle = rotationAngle || 0;
  }

  const trimmed = text.trim();
  if (!trimmed) {
    return {
      recommendedFontSize: 50,
      estimatedWidth: 0,
      estimatedHeight: 0,
      fitsInside: true,
      canSplitLines: false
    };
  }

  const usableW = Math.max(50, plateWidth - plateMargin * 2);
  const usableH = Math.max(50, plateHeight - plateMargin * 2);

  // Generar bucles de prueba con altura de referencia 100 mm
  const sampleFontSize = 100;
  const sampleLoops = generateTextVectorLoops(trimmed, fontType, sampleFontSize, lSpacing, lnSpacing);

  const testConfig: WorkpieceConfig = {
    enabled: true,
    width: plateWidth,
    height: plateHeight,
    margin: plateMargin,
    positionMode: 'absolute_zero',
    rotationAngle: plateAngle,
    rotationPivot: 'center',
    arrayCols: 1,
    arrayRows: 1,
    offsetX: 0,
    offsetY: 0
  };

  const { bounds: sampleBounds } = transformLoops(sampleLoops.loops, 1.0, testConfig);

  const sampleW = Math.max(1, sampleBounds.width);
  const sampleH = Math.max(1, sampleBounds.height);

  const scaleByWidth = usableW / sampleW;
  const scaleByHeight = usableH / sampleH;
  const idealScale = Math.min(scaleByWidth, scaleByHeight) * 0.95; // 95% de factor de seguridad

  const recommendedFontSize = Math.max(15, Math.min(400, Math.floor(sampleFontSize * idealScale)));

  const estimatedWidth = Math.round((sampleW / sampleFontSize) * recommendedFontSize);
  const estimatedHeight = Math.round((sampleH / sampleFontSize) * recommendedFontSize);
  const fitsInside = estimatedWidth <= usableW && estimatedHeight <= usableH;

  // Evaluar recomendación de división en dos líneas si el texto es muy largo
  const words = trimmed.split(/\s+/);
  let canSplitLines = false;
  let splitTextRecommendation: string | undefined;
  let splitFontSizeRecommendation: number | undefined;

  if (words.length >= 2 && !trimmed.includes('\n')) {
    const mid = Math.ceil(words.length / 2);
    const line1 = words.slice(0, mid).join(' ');
    const line2 = words.slice(mid).join(' ');
    const splitText = `${line1}\n${line2}`;

    const splitLoops = generateTextVectorLoops(splitText, fontType, sampleFontSize, lSpacing, lnSpacing);
    const { bounds: splitBounds } = transformLoops(splitLoops.loops, 1.0, testConfig);

    const splitW = Math.max(1, splitBounds.width);
    const splitH = Math.max(1, splitBounds.height);
    const splitIdealScale = Math.min(usableW / splitW, usableH / splitH) * 0.95;
    const splitFontSize = Math.max(15, Math.min(400, Math.floor(sampleFontSize * splitIdealScale)));

    if (splitFontSize > recommendedFontSize * 1.2) {
      canSplitLines = true;
      splitTextRecommendation = splitText;
      splitFontSizeRecommendation = splitFontSize;
    }
  }

  return {
    recommendedFontSize,
    estimatedWidth,
    estimatedHeight,
    fitsInside,
    canSplitLines,
    splitTextRecommendation,
    splitFontSizeRecommendation
  };
}

/**
 * Calcula las dimensiones óptimas para un archivo SVG para que quepa dentro de la chapa.
 * Exportada para compatibilidad directa con App.tsx.
 */
export function calculateOptimalSvgDimensions(
  svgWidth: number,
  svgHeight: number,
  workpieceWidth: number,
  workpieceHeight: number,
  margin: number,
  rotationAngle: number = 0
): AutoFitSvgResult {
  const usableW = Math.max(50, workpieceWidth - margin * 2);
  const usableH = Math.max(50, workpieceHeight - margin * 2);

  const rawW = Math.max(1, svgWidth);
  const rawH = Math.max(1, svgHeight);

  // Considerar rotación geométrica
  const rad = (Math.abs(rotationAngle) * Math.PI) / 180;
  const sin = Math.sin(rad);
  const cos = Math.cos(rad);

  const rotatedW = rawW * cos + rawH * sin;
  const rotatedH = rawW * sin + rawH * cos;

  const scaleX = usableW / Math.max(1, rotatedW);
  const scaleY = usableH / Math.max(1, rotatedH);
  const fitScale = Math.min(scaleX, scaleY) * 0.98;

  const targetWidth = Math.max(10, Math.round(rawW * fitScale));
  const targetHeight = Math.max(10, Math.round(rawH * fitScale));

  return {
    targetWidth,
    targetHeight,
    scaleFactor: fitScale,
    fitsInside: targetWidth <= usableW && targetHeight <= usableH
  };
}

/**
 * Alias de calculateOptimalSvgDimensions
 */
export const calculateOptimalSvgScale = calculateOptimalSvgDimensions;

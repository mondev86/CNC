import { Point2D } from '../types';

export interface ParsedSvgPath {
  points: Point2D[];
  isClosed: boolean;
}

/**
 * Tokenizes and parses SVG path data string ("d" attribute)
 */
export function parseSvgPathData(d: string): ParsedSvgPath[] {
  const paths: ParsedSvgPath[] = [];
  let currentPoints: Point2D[] = [];
  let currentX = 0;
  let currentY = 0;
  let startX = 0;
  let startY = 0;
  let lastControlX = 0;
  let lastControlY = 0;
  let lastCommand = '';

  // Regex to extract command letters and numbers
  const commandRegex = /([a-df-z])|([+-]?(?:\d*\.\d+|\d+)(?:[eE][+-]?\d+)?)/gi;
  const tokens: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = commandRegex.exec(d)) !== null) {
    tokens.push(match[0]);
  }

  let i = 0;
  let currentCmd = '';

  const getNumber = (): number => {
    if (i >= tokens.length) return 0;
    const val = parseFloat(tokens[i]);
    i++;
    return isNaN(val) ? 0 : val;
  };

  while (i < tokens.length) {
    const token = tokens[i];
    if (/^[a-df-z]$/i.test(token)) {
      currentCmd = token;
      i++;
    } else if (!currentCmd) {
      i++;
      continue;
    }

    const isRelative = currentCmd === currentCmd.toLowerCase();
    const cmd = currentCmd.toUpperCase();

    switch (cmd) {
      case 'M': {
        const x = getNumber();
        const y = getNumber();
        const targetX = isRelative ? currentX + x : x;
        const targetY = isRelative ? currentY + y : y;

        if (currentPoints.length > 0) {
          paths.push({ points: currentPoints, isClosed: false });
          currentPoints = [];
        }

        currentX = targetX;
        currentY = targetY;
        startX = targetX;
        startY = targetY;
        currentPoints.push({ x: currentX, y: currentY });

        // Subsequent coordinates are treated as L/l
        currentCmd = isRelative ? 'l' : 'L';
        break;
      }
      case 'L': {
        const x = getNumber();
        const y = getNumber();
        currentX = isRelative ? currentX + x : x;
        currentY = isRelative ? currentY + y : y;
        currentPoints.push({ x: currentX, y: currentY });
        break;
      }
      case 'H': {
        const x = getNumber();
        currentX = isRelative ? currentX + x : x;
        currentPoints.push({ x: currentX, y: currentY });
        break;
      }
      case 'V': {
        const y = getNumber();
        currentY = isRelative ? currentY + y : y;
        currentPoints.push({ x: currentX, y: currentY });
        break;
      }
      case 'C': { // Cubic Bezier
        const x1 = isRelative ? currentX + getNumber() : getNumber();
        const y1 = isRelative ? currentY + getNumber() : getNumber();
        const x2 = isRelative ? currentX + getNumber() : getNumber();
        const y2 = isRelative ? currentY + getNumber() : getNumber();
        const x = isRelative ? currentX + getNumber() : getNumber();
        const y = isRelative ? currentY + getNumber() : getNumber();

        // Sample cubic bezier into linear segments for CNC
        const steps = 16;
        for (let s = 1; s <= steps; s++) {
          const t = s / steps;
          const px =
            (1 - t) ** 3 * currentX +
            3 * (1 - t) ** 2 * t * x1 +
            3 * (1 - t) * t ** 2 * x2 +
            t ** 3 * x;
          const py =
            (1 - t) ** 3 * currentY +
            3 * (1 - t) ** 2 * t * y1 +
            3 * (1 - t) * t ** 2 * y2 +
            t ** 3 * y;
          currentPoints.push({ x: px, y: py });
        }

        lastControlX = x2;
        lastControlY = y2;
        currentX = x;
        currentY = y;
        break;
      }
      case 'S': { // Smooth Cubic Bezier
        let x1 = currentX;
        let y1 = currentY;
        if (lastCommand === 'C' || lastCommand === 'S') {
          x1 = 2 * currentX - lastControlX;
          y1 = 2 * currentY - lastControlY;
        }
        const x2 = isRelative ? currentX + getNumber() : getNumber();
        const y2 = isRelative ? currentY + getNumber() : getNumber();
        const x = isRelative ? currentX + getNumber() : getNumber();
        const y = isRelative ? currentY + getNumber() : getNumber();

        const steps = 16;
        for (let s = 1; s <= steps; s++) {
          const t = s / steps;
          const px =
            (1 - t) ** 3 * currentX +
            3 * (1 - t) ** 2 * t * x1 +
            3 * (1 - t) * t ** 2 * x2 +
            t ** 3 * x;
          const py =
            (1 - t) ** 3 * currentY +
            3 * (1 - t) ** 2 * t * y1 +
            3 * (1 - t) * t ** 2 * y2 +
            t ** 3 * y;
          currentPoints.push({ x: px, y: py });
        }

        lastControlX = x2;
        lastControlY = y2;
        currentX = x;
        currentY = y;
        break;
      }
      case 'Q': { // Quadratic Bezier
        const x1 = isRelative ? currentX + getNumber() : getNumber();
        const y1 = isRelative ? currentY + getNumber() : getNumber();
        const x = isRelative ? currentX + getNumber() : getNumber();
        const y = isRelative ? currentY + getNumber() : getNumber();

        const steps = 12;
        for (let s = 1; s <= steps; s++) {
          const t = s / steps;
          const px = (1 - t) ** 2 * currentX + 2 * (1 - t) * t * x1 + t ** 2 * x;
          const py = (1 - t) ** 2 * currentY + 2 * (1 - t) * t * y1 + t ** 2 * y;
          currentPoints.push({ x: px, y: py });
        }

        lastControlX = x1;
        lastControlY = y1;
        currentX = x;
        currentY = y;
        break;
      }
      case 'A': { // Arc
        const rx = Math.abs(getNumber());
        const ry = Math.abs(getNumber());
        const xAxisRotation = (getNumber() * Math.PI) / 180;
        const largeArcFlag = getNumber() !== 0;
        const sweepFlag = getNumber() !== 0;
        const x = isRelative ? currentX + getNumber() : getNumber();
        const y = isRelative ? currentY + getNumber() : getNumber();

        // Approximate arc via segments
        const arcPoints = approximateArc(
          currentX,
          currentY,
          rx,
          ry,
          xAxisRotation,
          largeArcFlag,
          sweepFlag,
          x,
          y
        );
        arcPoints.forEach(pt => currentPoints.push(pt));

        currentX = x;
        currentY = y;
        break;
      }
      case 'Z': {
        if (currentPoints.length > 0) {
          currentPoints.push({ x: startX, y: startY });
          paths.push({ points: currentPoints, isClosed: true });
          currentPoints = [];
        }
        currentX = startX;
        currentY = startY;
        break;
      }
      default:
        // Skip unrecognized
        i++;
        break;
    }

    lastCommand = cmd;
  }

  if (currentPoints.length > 1) {
    paths.push({ points: currentPoints, isClosed: false });
  }

  return paths;
}

/**
 * Approximates an SVG elliptical arc into points
 */
function approximateArc(
  x1: number,
  y1: number,
  rx: number,
  ry: number,
  angle: number,
  largeArc: boolean,
  sweep: boolean,
  x2: number,
  y2: number
): Point2D[] {
  if (rx === 0 || ry === 0) {
    return [{ x: x2, y: y2 }];
  }

  const cosAngle = Math.cos(angle);
  const sinAngle = Math.sin(angle);

  const dx2 = (x1 - x2) / 2.0;
  const dy2 = (y1 - y2) / 2.0;

  const x1Prime = cosAngle * dx2 + sinAngle * dy2;
  const y1Prime = -sinAngle * dx2 + cosAngle * dy2;

  let rxSq = rx * rx;
  let rySq = ry * ry;
  const x1PrimeSq = x1Prime * x1Prime;
  const y1PrimeSq = y1Prime * y1Prime;

  const radiiCheck = x1PrimeSq / rxSq + y1PrimeSq / rySq;
  if (radiiCheck > 1) {
    const scale = Math.sqrt(radiiCheck);
    rx *= scale;
    ry *= scale;
    rxSq = rx * rx;
    rySq = ry * ry;
  }

  const sign = largeArc === sweep ? -1 : 1;
  const sq = Math.max(
    0,
    (rxSq * rySq - rxSq * y1PrimeSq - rySq * x1PrimeSq) /
      (rxSq * y1PrimeSq + rySq * x1PrimeSq)
  );
  const coef = sign * Math.sqrt(sq);
  const cxPrime = coef * ((rx * y1Prime) / ry);
  const cyPrime = coef * -((ry * x1Prime) / rx);

  const cx = cosAngle * cxPrime - sinAngle * cyPrime + (x1 + x2) / 2.0;
  const cy = sinAngle * cxPrime + cosAngle * cyPrime + (y1 + y2) / 2.0;

  const ux = (x1Prime - cxPrime) / rx;
  const uy = (y1Prime - cyPrime) / ry;
  const vx = (-x1Prime - cxPrime) / rx;
  const vy = (-y1Prime - cyPrime) / ry;

  let startAngle = Math.atan2(uy, ux);
  let dAngle = Math.atan2(ux * vy - uy * vx, ux * vx + uy * vy);

  if (!sweep && dAngle > 0) {
    dAngle -= 2 * Math.PI;
  } else if (sweep && dAngle < 0) {
    dAngle += 2 * Math.PI;
  }

  const steps = Math.max(8, Math.ceil(Math.abs(dAngle) / (Math.PI / 12)));
  const points: Point2D[] = [];

  for (let step = 1; step <= steps; step++) {
    const theta = startAngle + (dAngle * step) / steps;
    const pxPrime = rx * Math.cos(theta);
    const pyPrime = ry * Math.sin(theta);
    const px = cosAngle * pxPrime - sinAngle * pyPrime + cx;
    const py = sinAngle * pxPrime + cosAngle * pyPrime + cy;
    points.push({ x: px, y: py });
  }

  return points;
}

/**
 * Parses any SVG string, extracting paths, circles, rectangles, polygons, etc.
 * Normalizes coordinate system to LinuxCNC (Cartesian: Y goes UP, (0,0) at bottom-left)
 */
export function parseSvgContent(svgString: string): {
  paths: ParsedSvgPath[];
  bounds: { minX: number; minY: number; maxX: number; maxY: number; width: number; height: number };
} {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgString, 'image/svg+xml');

  const parsedPaths: ParsedSvgPath[] = [];

  // 1. Process <path> elements
  const pathElements = doc.querySelectorAll('path');
  pathElements.forEach(el => {
    const d = el.getAttribute('d');
    if (d) {
      const extracted = parseSvgPathData(d);
      parsedPaths.push(...extracted);
    }
  });

  // 2. Process <rect> elements
  const rectElements = doc.querySelectorAll('rect');
  rectElements.forEach(el => {
    const x = parseFloat(el.getAttribute('x') || '0');
    const y = parseFloat(el.getAttribute('y') || '0');
    const w = parseFloat(el.getAttribute('width') || '0');
    const h = parseFloat(el.getAttribute('height') || '0');
    if (w > 0 && h > 0) {
      parsedPaths.push({
        isClosed: true,
        points: [
          { x, y },
          { x: x + w, y },
          { x: x + w, y: y + h },
          { x, y: y + h },
          { x, y }
        ]
      });
    }
  });

  // 3. Process <circle> elements
  const circleElements = doc.querySelectorAll('circle');
  circleElements.forEach(el => {
    const cx = parseFloat(el.getAttribute('cx') || '0');
    const cy = parseFloat(el.getAttribute('cy') || '0');
    const r = parseFloat(el.getAttribute('r') || '0');
    if (r > 0) {
      const pts: Point2D[] = [];
      const segments = 32;
      for (let s = 0; s <= segments; s++) {
        const rad = (s / segments) * 2 * Math.PI;
        pts.push({
          x: cx + r * Math.cos(rad),
          y: cy + r * Math.sin(rad)
        });
      }
      parsedPaths.push({ isClosed: true, points: pts });
    }
  });

  // 4. Process <ellipse> elements
  const ellipseElements = doc.querySelectorAll('ellipse');
  ellipseElements.forEach(el => {
    const cx = parseFloat(el.getAttribute('cx') || '0');
    const cy = parseFloat(el.getAttribute('cy') || '0');
    const rx = parseFloat(el.getAttribute('rx') || '0');
    const ry = parseFloat(el.getAttribute('ry') || '0');
    if (rx > 0 && ry > 0) {
      const pts: Point2D[] = [];
      const segments = 32;
      for (let s = 0; s <= segments; s++) {
        const rad = (s / segments) * 2 * Math.PI;
        pts.push({
          x: cx + rx * Math.cos(rad),
          y: cy + ry * Math.sin(rad)
        });
      }
      parsedPaths.push({ isClosed: true, points: pts });
    }
  });

  // 5. Process <line> elements
  const lineElements = doc.querySelectorAll('line');
  lineElements.forEach(el => {
    const x1 = parseFloat(el.getAttribute('x1') || '0');
    const y1 = parseFloat(el.getAttribute('y1') || '0');
    const x2 = parseFloat(el.getAttribute('x2') || '0');
    const y2 = parseFloat(el.getAttribute('y2') || '0');
    parsedPaths.push({
      isClosed: false,
      points: [{ x: x1, y: y1 }, { x: x2, y: y2 }]
    });
  });

  // 6. Process <polyline> and <polygon> elements
  const polyElements = doc.querySelectorAll('polyline, polygon');
  polyElements.forEach(el => {
    const rawPoints = el.getAttribute('points') || '';
    const coords = rawPoints
      .trim()
      .split(/[\s,]+/)
      .map(Number)
      .filter(n => !isNaN(n));
    const pts: Point2D[] = [];
    for (let k = 0; k < coords.length; k += 2) {
      if (k + 1 < coords.length) {
        pts.push({ x: coords[k], y: coords[k + 1] });
      }
    }
    const isPolygon = el.tagName.toLowerCase() === 'polygon';
    if (pts.length > 1) {
      if (isPolygon) {
        pts.push({ ...pts[0] });
      }
      parsedPaths.push({ isClosed: isPolygon, points: pts });
    }
  });

  // Filter out empty or single-point paths
  const validPaths = parsedPaths.filter(p => p.points.length >= 2);

  if (validPaths.length === 0) {
    return {
      paths: [],
      bounds: { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 }
    };
  }

  // Find bounding box in original SVG coordinates
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  validPaths.forEach(p => {
    p.points.forEach(pt => {
      if (pt.x < minX) minX = pt.x;
      if (pt.y < minY) minY = pt.y;
      if (pt.x > maxX) maxX = pt.x;
      if (pt.y > maxY) maxY = pt.y;
    });
  });

  const width = Math.max(1, maxX - minX);
  const height = Math.max(1, maxY - minY);

  // Convert SVG coordinates (Y down) to CNC coordinates (Y up, (0,0) at bottom-left)
  const normalizedPaths = validPaths.map(p => ({
    isClosed: p.isClosed,
    points: p.points.map(pt => ({
      x: pt.x - minX,
      y: (maxY - pt.y) // Invert Y axis for LinuxCNC standard
    }))
  }));

  return {
    paths: normalizedPaths,
    bounds: {
      minX: 0,
      minY: 0,
      maxX: width,
      maxY: height,
      width,
      height
    }
  };
}

import { ToolpathLoop, Segment, Point2D } from '../types';

export function parseSvgContent(svgString: string): {
  paths: ToolpathLoop[];
  bounds: { minX: number; minY: number; maxX: number; maxY: number; width: number; height: number };
} {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgString, 'image/svg+xml');
  const svgEl = doc.querySelector('svg');

  let viewBoxWidth = 100;
  let viewBoxHeight = 100;

  if (svgEl) {
    const vb = svgEl.getAttribute('viewBox');
    if (vb) {
      const parts = vb.trim().split(/[\s,]+/).map(Number);
      if (parts.length >= 4) {
        viewBoxWidth = parts[2];
        viewBoxHeight = parts[3];
      }
    } else {
      const w = parseFloat(svgEl.getAttribute('width') || '100');
      const h = parseFloat(svgEl.getAttribute('height') || '100');
      if (!isNaN(w) && w > 0) viewBoxWidth = w;
      if (!isNaN(h) && h > 0) viewBoxHeight = h;
    }
  }

  const loops: ToolpathLoop[] = [];
  let pathIdCounter = 0;

  const toCncPt = (x: number, y: number): Point2D => ({
    x,
    y: viewBoxHeight - y
  });

  const circles = doc.querySelectorAll('circle');
  circles.forEach(c => {
    const cx = parseFloat(c.getAttribute('cx') || '0');
    const cy = parseFloat(c.getAttribute('cy') || '0');
    const r = parseFloat(c.getAttribute('r') || '0');
    if (r <= 0) return;

    const segments: Segment[] = [];
    const steps = 36;
    for (let i = 0; i < steps; i++) {
      const a1 = (i / steps) * 2 * Math.PI;
      const a2 = ((i + 1) / steps) * 2 * Math.PI;
      segments.push({
        type: 'cut',
        start: toCncPt(cx + r * Math.cos(a1), cy + r * Math.sin(a1)),
        end: toCncPt(cx + r * Math.cos(a2), cy + r * Math.sin(a2))
      });
    }

    loops.push({
      id: `svg_circle_${++pathIdCounter}`,
      isClosed: true,
      piercePoint: toCncPt(cx, cy),
      startPoint: { ...segments[0].start },
      segments,
      cutLength: 2 * Math.PI * r
    });
  });

  const rects = doc.querySelectorAll('rect');
  rects.forEach(r => {
    const x = parseFloat(r.getAttribute('x') || '0');
    const y = parseFloat(r.getAttribute('y') || '0');
    const w = parseFloat(r.getAttribute('width') || '0');
    const h = parseFloat(r.getAttribute('height') || '0');
    if (w <= 0 || h <= 0) return;

    const p1 = toCncPt(x, y);
    const p2 = toCncPt(x + w, y);
    const p3 = toCncPt(x + w, y + h);
    const p4 = toCncPt(x, y + h);

    const segments: Segment[] = [
      { type: 'cut', start: p1, end: p2 },
      { type: 'cut', start: p2, end: p3 },
      { type: 'cut', start: p3, end: p4 },
      { type: 'cut', start: p4, end: p1 }
    ];

    loops.push({
      id: `svg_rect_${++pathIdCounter}`,
      isClosed: true,
      piercePoint: toCncPt(x + w / 2, y + h / 2),
      startPoint: { ...p1 },
      segments,
      cutLength: 2 * (w + h)
    });
  });

  const paths = doc.querySelectorAll('path');
  paths.forEach(p => {
    const d = p.getAttribute('d');
    if (!d) return;

    const commandRegex = /([a-df-z])([^a-df-z]*)/gi;
    let match;
    const poly: Point2D[] = [];
    let curX = 0;
    let curY = 0;

    while ((match = commandRegex.exec(d)) !== null) {
      const cmd = match[1];
      const args = match[2].trim().split(/[\s,]+/).filter(Boolean).map(Number);

      if (cmd === 'M' || cmd === 'm') {
        if (args.length >= 2) {
          curX = cmd === 'm' ? curX + args[0] : args[0];
          curY = cmd === 'm' ? curY + args[1] : args[1];
          poly.push({ x: curX, y: curY });
        }
      } else if (cmd === 'L' || cmd === 'l') {
        for (let i = 0; i < args.length; i += 2) {
          curX = cmd === 'l' ? curX + args[i] : args[i];
          curY = cmd === 'l' ? curY + args[i + 1] : args[i + 1];
          poly.push({ x: curX, y: curY });
        }
      } else if (cmd === 'C' || cmd === 'c') {
        for (let i = 0; i < args.length; i += 6) {
          const p0 = { x: curX, y: curY };
          const p1 = { x: cmd === 'c' ? curX + args[i] : args[i], y: cmd === 'c' ? curY + args[i + 1] : args[i + 1] };
          const p2 = { x: cmd === 'c' ? curX + args[i + 2] : args[i + 2], y: cmd === 'c' ? curY + args[i + 3] : args[i + 3] };
          const p3 = { x: cmd === 'c' ? curX + args[i + 4] : args[i + 4], y: cmd === 'c' ? curY + args[i + 5] : args[i + 5] };

          for (let step = 1; step <= 8; step++) {
            const t = step / 8;
            const mt = 1 - t;
            const bx = mt * mt * mt * p0.x + 3 * mt * mt * t * p1.x + 3 * mt * t * t * p2.x + t * t * t * p3.x;
            const by = mt * mt * mt * p0.y + 3 * mt * mt * t * p1.y + 3 * mt * t * t * p2.y + t * t * t * p3.y;
            poly.push({ x: bx, y: by });
          }
          curX = p3.x;
          curY = p3.y;
        }
      } else if (cmd === 'Z' || cmd === 'z') {
        if (poly.length > 0) {
          poly.push({ ...poly[0] });
        }
      }
    }

    if (poly.length >= 2) {
      const segments: Segment[] = [];
      for (let i = 0; i < poly.length - 1; i++) {
        segments.push({
          type: 'cut',
          start: toCncPt(poly[i].x, poly[i].y),
          end: toCncPt(poly[i + 1].x, poly[i + 1].y)
        });
      }

      const isClosed = Math.hypot(
        poly[0].x - poly[poly.length - 1].x,
        poly[0].y - poly[poly.length - 1].y
      ) < 0.5;

      loops.push({
        id: `svg_path_${++pathIdCounter}`,
        isClosed,
        piercePoint: { ...segments[0].start },
        startPoint: { ...segments[0].start },
        segments,
        cutLength: segments.reduce((acc, s) => acc + Math.hypot(s.end.x - s.start.x, s.end.y - s.start.y), 0)
      });
    }
  });

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  loops.forEach(l => {
    l.segments.forEach(s => {
      [s.start, s.end].forEach(pt => {
        if (pt.x < minX) minX = pt.x;
        if (pt.x > maxX) maxX = pt.x;
        if (pt.y < minY) minY = pt.y;
        if (pt.y > maxY) maxY = pt.y;
      });
    });
  });

  if (minX === Infinity) {
    minX = 0; minY = 0; maxX = viewBoxWidth; maxY = viewBoxHeight;
  }

  return {
    paths: loops,
    bounds: {
      minX,
      minY,
      maxX,
      maxY,
      width: Math.max(1, maxX - minX),
      height: Math.max(1, maxY - minY)
    }
  };
}

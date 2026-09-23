import { ToolpathLoop, Segment, Point2D, FontStyleType } from '../types';

interface GlyphDef {
  paths: { x: number; y: number }[][];
  width: number;
}

const GLYPHS: Record<string, GlyphDef> = {
  'A': {
    paths: [
      [{ x: 0, y: 0 }, { x: 5, y: 18 }, { x: 6, y: 18 }, { x: 10, y: 0 }],
      [{ x: 2, y: 6 }, { x: 4, y: 6 }],
      [{ x: 6, y: 6 }, { x: 8, y: 6 }]
    ],
    width: 11
  },
  'B': {
    paths: [
      [{ x: 0, y: 0 }, { x: 0, y: 18 }],
      [{ x: 0, y: 18 }, { x: 6, y: 18 }, { x: 8, y: 14 }, { x: 6, y: 10 }, { x: 0, y: 10 }],
      [{ x: 0, y: 10 }, { x: 7, y: 10 }, { x: 9, y: 5 }, { x: 7, y: 0 }, { x: 0, y: 0 }]
    ],
    width: 10
  },
  'C': {
    paths: [
      [{ x: 9, y: 15 }, { x: 6, y: 18 }, { x: 2, y: 18 }, { x: 0, y: 14 }, { x: 0, y: 4 }, { x: 2, y: 0 }, { x: 6, y: 0 }, { x: 9, y: 3 }]
    ],
    width: 10
  },
  'D': {
    paths: [
      [{ x: 0, y: 0 }, { x: 0, y: 18 }],
      [{ x: 0, y: 18 }, { x: 5, y: 18 }, { x: 9, y: 13 }, { x: 9, y: 5 }, { x: 5, y: 0 }, { x: 0, y: 0 }]
    ],
    width: 10
  },
  'E': {
    paths: [
      [{ x: 0, y: 0 }, { x: 0, y: 18 }, { x: 8, y: 18 }],
      [{ x: 0, y: 9 }, { x: 6, y: 9 }],
      [{ x: 0, y: 0 }, { x: 8, y: 0 }]
    ],
    width: 9
  },
  'F': {
    paths: [
      [{ x: 0, y: 0 }, { x: 0, y: 18 }, { x: 8, y: 18 }],
      [{ x: 0, y: 9 }, { x: 6, y: 9 }]
    ],
    width: 9
  },
  'G': {
    paths: [
      [{ x: 9, y: 15 }, { x: 6, y: 18 }, { x: 2, y: 18 }, { x: 0, y: 14 }, { x: 0, y: 4 }, { x: 2, y: 0 }, { x: 7, y: 0 }, { x: 9, y: 2 }, { x: 9, y: 8 }, { x: 5, y: 8 }]
    ],
    width: 10
  },
  'H': {
    paths: [
      [{ x: 0, y: 0 }, { x: 0, y: 18 }],
      [{ x: 8, y: 0 }, { x: 8, y: 18 }],
      [{ x: 0, y: 9 }, { x: 8, y: 9 }]
    ],
    width: 9
  },
  'I': {
    paths: [
      [{ x: 2, y: 0 }, { x: 2, y: 18 }]
    ],
    width: 5
  },
  'J': {
    paths: [
      [{ x: 1, y: 4 }, { x: 3, y: 0 }, { x: 6, y: 0 }, { x: 7, y: 3 }, { x: 7, y: 18 }]
    ],
    width: 8
  },
  'K': {
    paths: [
      [{ x: 0, y: 0 }, { x: 0, y: 18 }],
      [{ x: 8, y: 18 }, { x: 1, y: 9 }, { x: 8, y: 0 }]
    ],
    width: 9
  },
  'L': {
    paths: [
      [{ x: 0, y: 18 }, { x: 0, y: 0 }, { x: 8, y: 0 }]
    ],
    width: 9
  },
  'M': {
    paths: [
      [{ x: 0, y: 0 }, { x: 0, y: 18 }, { x: 5, y: 8 }, { x: 10, y: 18 }, { x: 10, y: 0 }]
    ],
    width: 11
  },
  'N': {
    paths: [
      [{ x: 0, y: 0 }, { x: 0, y: 18 }, { x: 8, y: 0 }, { x: 8, y: 18 }]
    ],
    width: 9
  },
  'O': {
    paths: [
      [{ x: 4, y: 18 }, { x: 1, y: 14 }, { x: 0, y: 9 }, { x: 1, y: 4 }, { x: 4, y: 0 }],
      [{ x: 6, y: 0 }, { x: 9, y: 4 }, { x: 10, y: 9 }, { x: 9, y: 14 }, { x: 6, y: 18 }]
    ],
    width: 11
  },
  'P': {
    paths: [
      [{ x: 0, y: 0 }, { x: 0, y: 18 }, { x: 6, y: 18 }, { x: 8, y: 14 }, { x: 6, y: 9 }, { x: 0, y: 9 }]
    ],
    width: 9
  },
  'Q': {
    paths: [
      [{ x: 4, y: 18 }, { x: 1, y: 14 }, { x: 0, y: 9 }, { x: 1, y: 4 }, { x: 4, y: 0 }],
      [{ x: 6, y: 0 }, { x: 9, y: 4 }, { x: 10, y: 9 }, { x: 9, y: 14 }, { x: 6, y: 18 }],
      [{ x: 5, y: 4 }, { x: 9, y: 0 }]
    ],
    width: 11
  },
  'R': {
    paths: [
      [{ x: 0, y: 0 }, { x: 0, y: 18 }, { x: 6, y: 18 }, { x: 8, y: 14 }, { x: 6, y: 9 }, { x: 0, y: 9 }],
      [{ x: 3, y: 9 }, { x: 8, y: 0 }]
    ],
    width: 9
  },
  'S': {
    paths: [
      [{ x: 8, y: 16 }, { x: 6, y: 18 }, { x: 2, y: 18 }, { x: 0, y: 14 }, { x: 2, y: 10 }, { x: 6, y: 8 }, { x: 8, y: 4 }, { x: 6, y: 0 }, { x: 2, y: 0 }, { x: 0, y: 2 }]
    ],
    width: 9
  },
  'T': {
    paths: [
      [{ x: 0, y: 18 }, { x: 8, y: 18 }],
      [{ x: 4, y: 18 }, { x: 4, y: 0 }]
    ],
    width: 9
  },
  'U': {
    paths: [
      [{ x: 0, y: 18 }, { x: 0, y: 4 }, { x: 2, y: 0 }, { x: 6, y: 0 }, { x: 8, y: 4 }, { x: 8, y: 18 }]
    ],
    width: 9
  },
  'V': {
    paths: [
      [{ x: 0, y: 18 }, { x: 4, y: 0 }, { x: 8, y: 18 }]
    ],
    width: 9
  },
  'W': {
    paths: [
      [{ x: 0, y: 18 }, { x: 2.5, y: 0 }, { x: 5, y: 11 }, { x: 7.5, y: 0 }, { x: 10, y: 18 }]
    ],
    width: 11
  },
  'X': {
    paths: [
      [{ x: 0, y: 0 }, { x: 8, y: 18 }],
      [{ x: 8, y: 0 }, { x: 0, y: 18 }]
    ],
    width: 9
  },
  'Y': {
    paths: [
      [{ x: 0, y: 18 }, { x: 4, y: 9 }, { x: 8, y: 18 }],
      [{ x: 4, y: 9 }, { x: 4, y: 0 }]
    ],
    width: 9
  },
  'Z': {
    paths: [
      [{ x: 0, y: 18 }, { x: 8, y: 18 }, { x: 0, y: 0 }, { x: 8, y: 0 }]
    ],
    width: 9
  },
  '0': {
    paths: [
      [{ x: 4, y: 18 }, { x: 1, y: 14 }, { x: 0, y: 9 }, { x: 1, y: 4 }, { x: 4, y: 0 }],
      [{ x: 6, y: 0 }, { x: 9, y: 4 }, { x: 10, y: 9 }, { x: 9, y: 14 }, { x: 6, y: 18 }],
      [{ x: 2, y: 3 }, { x: 8, y: 15 }]
    ],
    width: 11
  },
  '1': {
    paths: [
      [{ x: 1, y: 14 }, { x: 4, y: 18 }, { x: 4, y: 0 }],
      [{ x: 1, y: 0 }, { x: 7, y: 0 }]
    ],
    width: 8
  },
  '2': {
    paths: [
      [{ x: 0, y: 14 }, { x: 2, y: 18 }, { x: 6, y: 18 }, { x: 8, y: 14 }, { x: 8, y: 11 }, { x: 0, y: 0 }, { x: 8, y: 0 }]
    ],
    width: 9
  },
  '3': {
    paths: [
      [{ x: 1, y: 18 }, { x: 8, y: 18 }, { x: 4, y: 10 }, { x: 7, y: 8 }, { x: 8, y: 4 }, { x: 6, y: 0 }, { x: 1, y: 0 }]
    ],
    width: 9
  },
  '4': {
    paths: [
      [{ x: 6, y: 0 }, { x: 6, y: 18 }, { x: 0, y: 5 }, { x: 8, y: 5 }]
    ],
    width: 9
  },
  '5': {
    paths: [
      [{ x: 8, y: 18 }, { x: 0, y: 18 }, { x: 0, y: 10 }, { x: 6, y: 10 }, { x: 8, y: 6 }, { x: 8, y: 2 }, { x: 5, y: 0 }, { x: 0, y: 0 }]
    ],
    width: 9
  },
  '6': {
    paths: [
      [{ x: 7, y: 16 }, { x: 5, y: 18 }, { x: 2, y: 18 }, { x: 0, y: 12 }, { x: 0, y: 4 }, { x: 3, y: 0 }, { x: 7, y: 0 }, { x: 8, y: 4 }, { x: 7, y: 8 }, { x: 0, y: 8 }]
    ],
    width: 9
  },
  '7': {
    paths: [
      [{ x: 0, y: 18 }, { x: 8, y: 18 }, { x: 3, y: 0 }]
    ],
    width: 9
  },
  '8': {
    paths: [
      [{ x: 3, y: 18 }, { x: 6, y: 18 }, { x: 8, y: 14 }, { x: 6, y: 10 }, { x: 2, y: 10 }, { x: 0, y: 14 }, { x: 3, y: 18 }],
      [{ x: 2, y: 10 }, { x: 6, y: 10 }, { x: 8, y: 5 }, { x: 6, y: 0 }, { x: 2, y: 0 }, { x: 0, y: 5 }, { x: 2, y: 10 }]
    ],
    width: 9
  },
  '9': {
    paths: [
      [{ x: 8, y: 10 }, { x: 1, y: 10 }, { x: 0, y: 14 }, { x: 2, y: 18 }, { x: 6, y: 18 }, { x: 8, y: 14 }, { x: 8, y: 5 }, { x: 6, y: 0 }, { x: 2, y: 0 }]
    ],
    width: 9
  },
  ' ': {
    paths: [],
    width: 6
  },
  '-': {
    paths: [
      [{ x: 1, y: 9 }, { x: 7, y: 9 }]
    ],
    width: 8
  },
  '.': {
    paths: [
      [{ x: 2, y: 0 }, { x: 3, y: 0 }, { x: 3, y: 1 }, { x: 2, y: 1 }, { x: 2, y: 0 }]
    ],
    width: 5
  }
};

export function generateTextVectorLoops(
  text: string,
  fontType: FontStyleType,
  fontSize: number,
  letterSpacing: number,
  lineSpacing: number
): { loops: ToolpathLoop[] } {
  const loops: ToolpathLoop[] = [];
  const lines = text.toUpperCase().split('\n');
  const baseGlyphHeight = 18;
  const scale = fontSize / baseGlyphHeight;
  const linePitch = fontSize * lineSpacing;

  let currentY = (lines.length - 1) * linePitch;

  lines.forEach((line, lineIdx) => {
    let currentX = 0;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const glyph = GLYPHS[char] || GLYPHS['-'] || { paths: [], width: 6 };

      glyph.paths.forEach((poly, pIdx) => {
        if (poly.length < 2) return;
        const segments: Segment[] = [];
        for (let s = 0; s < poly.length - 1; s++) {
          segments.push({
            type: 'cut',
            start: {
              x: currentX + poly[s].x * scale,
              y: currentY + poly[s].y * scale
            },
            end: {
              x: currentX + poly[s + 1].x * scale,
              y: currentY + poly[s + 1].y * scale
            }
          });
        }

        const isClosed = Math.hypot(
          poly[0].x - poly[poly.length - 1].x,
          poly[0].y - poly[poly.length - 1].y
        ) < 0.5;

        const startPt = segments[0].start;
        loops.push({
          id: `txt_l${lineIdx}_c${i}_p${pIdx}`,
          isClosed,
          piercePoint: { ...startPt },
          startPoint: { ...startPt },
          segments,
          cutLength: segments.reduce((sum, seg) => sum + Math.hypot(seg.end.x - seg.start.x, seg.end.y - seg.start.y), 0)
        });
      });

      currentX += glyph.width * scale + letterSpacing;
    }
    currentY -= linePitch;
  });

  return { loops };
}

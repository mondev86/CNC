import { Point2D, FontStyleType } from '../types';

// Normalized grid coordinates for glyphs (0 to 100 on Y, variable width on X)
// 1. Single Line / Stroke Glyphs (Hershey-style vector strokes for CNC plasma marking or clean single cuts)
interface StrokeGlyph {
  width: number;
  strokes: Point2D[][];
}

export const SINGLE_LINE_FONT: Record<string, StrokeGlyph> = {
  'A': { width: 60, strokes: [[{x: 5, y: 0}, {x: 30, y: 100}, {x: 55, y: 0}], [{x: 17, y: 38}, {x: 43, y: 38}]] },
  'B': { width: 55, strokes: [[{x: 10, y: 0}, {x: 10, y: 100}], [{x: 10, y: 100}, {x: 38, y: 100}, {x: 48, y: 85}, {x: 48, y: 65}, {x: 38, y: 52}, {x: 10, y: 52}], [{x: 38, y: 52}, {x: 48, y: 38}, {x: 48, y: 15}, {x: 38, y: 0}, {x: 10, y: 0}]] },
  'C': { width: 55, strokes: [[{x: 48, y: 81}, {x: 35, y: 100}, {x: 18, y: 100}, {x: 8, y: 81}, {x: 8, y: 19}, {x: 18, y: 0}, {x: 38, y: 0}, {x: 48, y: 19}]] },
  'D': { width: 55, strokes: [[{x: 10, y: 0}, {x: 10, y: 100}], [{x: 10, y: 100}, {x: 32, y: 100}, {x: 48, y: 78}, {x: 48, y: 22}, {x: 32, y: 0}, {x: 10, y: 0}]] },
  'E': { width: 50, strokes: [[{x: 10, y: 0}, {x: 10, y: 100}], [{x: 10, y: 100}, {x: 45, y: 100}], [{x: 10, y: 52}, {x: 38, y: 52}], [{x: 10, y: 0}, {x: 45, y: 0}]] },
  'F': { width: 48, strokes: [[{x: 10, y: 0}, {x: 10, y: 100}], [{x: 10, y: 100}, {x: 45, y: 100}], [{x: 10, y: 52}, {x: 35, y: 52}]] },
  'G': { width: 58, strokes: [[{x: 50, y: 81}, {x: 36, y: 100}, {x: 18, y: 100}, {x: 8, y: 81}, {x: 8, y: 19}, {x: 18, y: 0}, {x: 40, y: 0}, {x: 50, y: 19}, {x: 50, y: 50}, {x: 32, y: 50}]] },
  'H': { width: 55, strokes: [[{x: 10, y: 0}, {x: 10, y: 100}], [{x: 48, y: 0}, {x: 48, y: 100}], [{x: 10, y: 50}, {x: 48, y: 50}]] },
  'I': { width: 25, strokes: [[{x: 5, y: 100}, {x: 20, y: 100}], [{x: 12.5, y: 100}, {x: 12.5, y: 0}], [{x: 5, y: 0}, {x: 20, y: 0}]] },
  'J': { width: 45, strokes: [[{x: 10, y: 100}, {x: 38, y: 100}], [{x: 32, y: 100}, {x: 32, y: 25}, {x: 25, y: 0}, {x: 12, y: 0}, {x: 6, y: 15}]] },
  'K': { width: 52, strokes: [[{x: 10, y: 0}, {x: 10, y: 100}], [{x: 45, y: 95}, {x: 10, y: 50}], [{x: 18, y: 58}, {x: 46, y: 0}]] },
  'L': { width: 45, strokes: [[{x: 10, y: 100}, {x: 10, y: 0}, {x: 42, y: 0}]] },
  'M': { width: 68, strokes: [[{x: 8, y: 0}, {x: 8, y: 100}, {x: 34, y: 40}, {x: 60, y: 100}, {x: 60, y: 0}]] },
  'N': { width: 56, strokes: [[{x: 10, y: 0}, {x: 10, y: 100}, {x: 46, y: 0}, {x: 46, y: 100}]] },
  'Ñ': { width: 56, strokes: [[{x: 10, y: 0}, {x: 10, y: 100}, {x: 46, y: 0}, {x: 46, y: 100}], [{x: 12, y: 110}, {x: 25, y: 116}, {x: 35, y: 108}, {x: 45, y: 115}]] },
  'O': { width: 58, strokes: [[{x: 18, y: 0}, {x: 8, y: 21}, {x: 8, y: 79}, {x: 18, y: 100}, {x: 40, y: 100}, {x: 50, y: 79}, {x: 50, y: 21}, {x: 40, y: 0}, {x: 18, y: 0}]] },
  'P': { width: 52, strokes: [[{x: 10, y: 0}, {x: 10, y: 100}], [{x: 10, y: 100}, {x: 36, y: 100}, {x: 46, y: 85}, {x: 46, y: 65}, {x: 36, y: 50}, {x: 10, y: 50}]] },
  'Q': { width: 58, strokes: [[{x: 18, y: 0}, {x: 8, y: 21}, {x: 8, y: 79}, {x: 18, y: 100}, {x: 40, y: 100}, {x: 50, y: 79}, {x: 50, y: 21}, {x: 40, y: 0}, {x: 18, y: 0}], [{x: 32, y: 28}, {x: 52, y: -6}]] },
  'R': { width: 54, strokes: [[{x: 10, y: 0}, {x: 10, y: 100}], [{x: 10, y: 100}, {x: 36, y: 100}, {x: 46, y: 85}, {x: 46, y: 65}, {x: 36, y: 50}, {x: 10, y: 50}], [{x: 28, y: 50}, {x: 48, y: 0}]] },
  'S': { width: 50, strokes: [[{x: 42, y: 85}, {x: 34, y: 100}, {x: 18, y: 100}, {x: 8, y: 85}, {x: 8, y: 65}, {x: 26, y: 50}, {x: 44, y: 35}, {x: 44, y: 15}, {x: 34, y: 0}, {x: 18, y: 0}, {x: 10, y: 15}]] },
  'T': { width: 50, strokes: [[{x: 5, y: 100}, {x: 45, y: 100}], [{x: 25, y: 100}, {x: 25, y: 0}]] },
  'U': { width: 55, strokes: [[{x: 10, y: 100}, {x: 10, y: 25}, {x: 18, y: 0}, {x: 38, y: 0}, {x: 46, y: 25}, {x: 46, y: 100}]] },
  'V': { width: 55, strokes: [[{x: 6, y: 100}, {x: 27.5, y: 0}, {x: 49, y: 100}]] },
  'W': { width: 72, strokes: [[{x: 6, y: 100}, {x: 20, y: 0}, {x: 36, y: 65}, {x: 52, y: 0}, {x: 66, y: 100}]] },
  'X': { width: 54, strokes: [[{x: 8, y: 0}, {x: 46, y: 100}], [{x: 8, y: 100}, {x: 46, y: 0}]] },
  'Y': { width: 54, strokes: [[{x: 8, y: 100}, {x: 27, y: 50}], [{x: 46, y: 100}, {x: 27, y: 50}, {x: 27, y: 0}]] },
  'Z': { width: 50, strokes: [[{x: 8, y: 100}, {x: 42, y: 100}, {x: 8, y: 0}, {x: 42, y: 0}]] },
  '0': { width: 54, strokes: [[{x: 18, y: 0}, {x: 8, y: 21}, {x: 8, y: 79}, {x: 18, y: 100}, {x: 36, y: 100}, {x: 46, y: 79}, {x: 46, y: 21}, {x: 36, y: 0}, {x: 18, y: 0}], [{x: 10, y: 18}, {x: 44, y: 82}]] },
  '1': { width: 35, strokes: [[{x: 10, y: 75}, {x: 22, y: 100}, {x: 22, y: 0}], [{x: 10, y: 0}, {x: 34, y: 0}]] },
  '2': { width: 50, strokes: [[{x: 8, y: 80}, {x: 16, y: 100}, {x: 35, y: 100}, {x: 44, y: 82}, {x: 44, y: 61}, {x: 8, y: 0}, {x: 45, y: 0}]] },
  '3': { width: 50, strokes: [[{x: 8, y: 86}, {x: 20, y: 100}, {x: 36, y: 100}, {x: 44, y: 83}, {x: 40, y: 59}, {x: 22, y: 53}, {x: 40, y: 47}, {x: 44, y: 20}, {x: 34, y: 0}, {x: 16, y: 0}, {x: 8, y: 14}]] },
  '4': { width: 52, strokes: [[{x: 36, y: 0}, {x: 36, y: 100}, {x: 8, y: 35}, {x: 46, y: 35}]] },
  '5': { width: 50, strokes: [[{x: 42, y: 100}, {x: 10, y: 100}, {x: 10, y: 55}, {x: 34, y: 55}, {x: 44, y: 39}, {x: 44, y: 17}, {x: 34, y: 0}, {x: 14, y: 0}, {x: 8, y: 14}]] },
  '6': { width: 52, strokes: [[{x: 40, y: 86}, {x: 30, y: 100}, {x: 16, y: 100}, {x: 8, y: 76}, {x: 8, y: 19}, {x: 18, y: 0}, {x: 36, y: 0}, {x: 44, y: 17}, {x: 44, y: 37}, {x: 36, y: 53}, {x: 8, y: 53}]] },
  '7': { width: 50, strokes: [[{x: 8, y: 100}, {x: 44, y: 100}, {x: 22, y: 0}], [{x: 15, y: 50}, {x: 34, y: 50}]] },
  '8': { width: 52, strokes: [[{x: 26, y: 52}, {x: 14, y: 65}, {x: 14, y: 87}, {x: 24, y: 100}, {x: 34, y: 87}, {x: 34, y: 65}, {x: 26, y: 52}, {x: 10, y: 37}, {x: 10, y: 13}, {x: 22, y: 0}, {x: 38, y: 0}, {x: 44, y: 13}, {x: 44, y: 37}, {x: 26, y: 52}]] },
  '9': { width: 52, strokes: [[{x: 44, y: 51}, {x: 18, y: 51}, {x: 8, y: 65}, {x: 8, y: 85}, {x: 18, y: 100}, {x: 36, y: 100}, {x: 44, y: 83}, {x: 44, y: 19}, {x: 36, y: 0}, {x: 20, y: 0}, {x: 10, y: 14}]] },
  '-': { width: 35, strokes: [[{x: 6, y: 50}, {x: 30, y: 50}]] },
  '+': { width: 45, strokes: [[{x: 8, y: 50}, {x: 37, y: 50}], [{x: 22.5, y: 25}, {x: 22.5, y: 75}]] },
  '.': { width: 20, strokes: [[{x: 8, y: 0}, {x: 12, y: 0}, {x: 12, y: 6}, {x: 8, y: 6}, {x: 8, y: 0}]] },
  ',': { width: 22, strokes: [[{x: 10, y: 10}, {x: 14, y: 10}, {x: 10, y: -6}]] },
  ':': { width: 20, strokes: [[{x: 8, y: 25}, {x: 12, y: 25}], [{x: 8, y: 65}, {x: 12, y: 65}]] },
  '/': { width: 40, strokes: [[{x: 6, y: 0}, {x: 34, y: 100}]] },
  ' ': { width: 35, strokes: [] },
};

// 2. Plasma Stencil Closed Paths:
// Letters specifically crafted for Plasma Cutting with Bridge Cutouts!
// For letters with inner islands (O, A, B, D, P, Q, R, 0, 4, 6, 8, 9),
// the paths include built-in bridges or split cuts so the inner metal sheet stays attached!
interface StencilGlyph {
  width: number;
  loops: Point2D[][]; // closed cut loops
}

export const STENCIL_PLASMA_FONT: Record<string, StencilGlyph> = {
  // Letter A: Clean Stencil cut with central vertical bridge to retain inner triangle
  'A': {
    width: 62,
    loops: [
      [
        { x: 4, y: 0 },
        { x: 26, y: 100 },
        { x: 36, y: 100 },
        { x: 58, y: 0 },
        { x: 47, y: 0 },
        { x: 40, y: 34 },
        { x: 45, y: 34 },
        { x: 45, y: 46 },
        { x: 37, y: 46 },
        { x: 31, y: 75 },
        { x: 25, y: 46 },
        { x: 17, y: 46 },
        { x: 17, y: 34 },
        { x: 22, y: 34 },
        { x: 15, y: 0 },
        { x: 4, y: 0 }
      ]
    ]
  },
  // Letter B: Stencil with 2 vertical bridges connecting center spine
  'B': {
    width: 62,
    loops: [
      // Vertical left spine
      [{x: 8, y: 0}, {x: 18, y: 0}, {x: 18, y: 100}, {x: 8, y: 100}, {x: 8, y: 0}],
      // Top lobe with horizontal entry bridge
      [{x: 24, y: 92}, {x: 44, y: 92}, {x: 54, y: 80}, {x: 54, y: 66}, {x: 44, y: 56}, {x: 24, y: 56}, {x: 24, y: 66}, {x: 40, y: 66}, {x: 45, y: 72}, {x: 45, y: 76}, {x: 40, y: 82}, {x: 24, y: 82}, {x: 24, y: 92}],
      // Bottom lobe with horizontal entry bridge
      [{x: 24, y: 46}, {x: 45, y: 46}, {x: 56, y: 34}, {x: 56, y: 16}, {x: 45, y: 6}, {x: 24, y: 6}, {x: 24, y: 16}, {x: 41, y: 16}, {x: 46, y: 22}, {x: 46, y: 28}, {x: 41, y: 34}, {x: 24, y: 34}, {x: 24, y: 46}]
    ]
  },
  'C': {
    width: 60,
    loops: [
      [{x: 52, y: 84}, {x: 42, y: 100}, {x: 20, y: 100}, {x: 8, y: 82}, {x: 8, y: 18}, {x: 20, y: 0}, {x: 42, y: 0}, {x: 52, y: 16}, {x: 44, y: 23}, {x: 36, y: 11}, {x: 24, y: 11}, {x: 18, y: 23}, {x: 18, y: 77}, {x: 24, y: 89}, {x: 36, y: 89}, {x: 44, y: 77}, {x: 52, y: 84}]
    ]
  },
  // Letter D: Split into two C-shaped pieces so inner center doesn't drop!
  'D': {
    width: 62,
    loops: [
      // Left spine
      [{x: 8, y: 0}, {x: 18, y: 0}, {x: 18, y: 100}, {x: 8, y: 100}, {x: 8, y: 0}],
      // Right bow with bridges at top & bottom
      [{x: 25, y: 92}, {x: 42, y: 92}, {x: 55, y: 75}, {x: 55, y: 25}, {x: 42, y: 8}, {x: 25, y: 8}, {x: 25, y: 18}, {x: 38, y: 18}, {x: 45, y: 30}, {x: 45, y: 70}, {x: 38, y: 82}, {x: 25, y: 82}, {x: 25, y: 92}]
    ]
  },
  'E': {
    width: 55,
    loops: [
      [{x: 8, y: 0}, {x: 48, y: 0}, {x: 48, y: 12}, {x: 18, y: 12}, {x: 18, y: 44}, {x: 42, y: 44}, {x: 42, y: 56}, {x: 18, y: 56}, {x: 18, y: 88}, {x: 48, y: 88}, {x: 48, y: 100}, {x: 8, y: 100}, {x: 8, y: 0}]
    ]
  },
  'F': {
    width: 52,
    loops: [
      [{x: 8, y: 0}, {x: 18, y: 0}, {x: 18, y: 44}, {x: 42, y: 44}, {x: 42, y: 56}, {x: 18, y: 56}, {x: 18, y: 88}, {x: 48, y: 88}, {x: 48, y: 100}, {x: 8, y: 100}, {x: 8, y: 0}]
    ]
  },
  'G': {
    width: 62,
    loops: [
      [{x: 52, y: 84}, {x: 42, y: 100}, {x: 20, y: 100}, {x: 8, y: 82}, {x: 8, y: 18}, {x: 20, y: 0}, {x: 44, y: 0}, {x: 54, y: 14}, {x: 54, y: 55}, {x: 34, y: 55}, {x: 34, y: 43}, {x: 44, y: 43}, {x: 44, y: 18}, {x: 38, y: 11}, {x: 24, y: 11}, {x: 18, y: 23}, {x: 18, y: 77}, {x: 24, y: 89}, {x: 36, y: 89}, {x: 44, y: 77}, {x: 52, y: 84}]
    ]
  },
  'H': {
    width: 60,
    loops: [
      [{x: 8, y: 0}, {x: 18, y: 0}, {x: 18, y: 44}, {x: 42, y: 44}, {x: 42, y: 0}, {x: 52, y: 0}, {x: 52, y: 100}, {x: 42, y: 100}, {x: 42, y: 56}, {x: 18, y: 56}, {x: 18, y: 100}, {x: 8, y: 100}, {x: 8, y: 0}]
    ]
  },
  'I': {
    width: 32,
    loops: [
      [{x: 6, y: 100}, {x: 26, y: 100}, {x: 26, y: 88}, {x: 19, y: 88}, {x: 19, y: 12}, {x: 26, y: 12}, {x: 26, y: 0}, {x: 6, y: 0}, {x: 6, y: 12}, {x: 13, y: 12}, {x: 13, y: 88}, {x: 6, y: 88}, {x: 6, y: 100}]
    ]
  },
  'J': {
    width: 48,
    loops: [
      [{x: 18, y: 100}, {x: 44, y: 100}, {x: 44, y: 88}, {x: 36, y: 88}, {x: 36, y: 24}, {x: 28, y: 0}, {x: 14, y: 0}, {x: 6, y: 12}, {x: 14, y: 18}, {x: 20, y: 12}, {x: 26, y: 24}, {x: 26, y: 88}, {x: 18, y: 88}, {x: 18, y: 100}]
    ]
  },
  'K': {
    width: 58,
    loops: [
      [{x: 8, y: 0}, {x: 18, y: 0}, {x: 18, y: 44}, {x: 42, y: 0}, {x: 54, y: 0}, {x: 28, y: 50}, {x: 52, y: 100}, {x: 40, y: 100}, {x: 18, y: 58}, {x: 18, y: 100}, {x: 8, y: 100}, {x: 8, y: 0}]
    ]
  },
  'L': {
    width: 50,
    loops: [
      [{x: 8, y: 0}, {x: 45, y: 0}, {x: 45, y: 12}, {x: 18, y: 12}, {x: 18, y: 100}, {x: 8, y: 100}, {x: 8, y: 0}]
    ]
  },
  'M': {
    width: 72,
    loops: [
      [{x: 6, y: 0}, {x: 16, y: 0}, {x: 16, y: 70}, {x: 32, y: 35}, {x: 40, y: 35}, {x: 56, y: 70}, {x: 56, y: 0}, {x: 66, y: 0}, {x: 66, y: 100}, {x: 54, y: 100}, {x: 36, y: 58}, {x: 18, y: 100}, {x: 6, y: 100}, {x: 6, y: 0}]
    ]
  },
  'N': {
    width: 60,
    loops: [
      [{x: 8, y: 0}, {x: 18, y: 0}, {x: 18, y: 64}, {x: 42, y: 0}, {x: 52, y: 0}, {x: 52, y: 100}, {x: 42, y: 100}, {x: 42, y: 36}, {x: 18, y: 100}, {x: 8, y: 100}, {x: 8, y: 0}]
    ]
  },
  'Ñ': {
    width: 60,
    loops: [
      [{x: 8, y: 0}, {x: 18, y: 0}, {x: 18, y: 64}, {x: 42, y: 0}, {x: 52, y: 0}, {x: 52, y: 100}, {x: 42, y: 100}, {x: 42, y: 36}, {x: 18, y: 100}, {x: 8, y: 100}, {x: 8, y: 0}],
      [{x: 10, y: 110}, {x: 24, y: 118}, {x: 36, y: 108}, {x: 50, y: 116}, {x: 50, y: 122}, {x: 36, y: 114}, {x: 24, y: 124}, {x: 10, y: 116}, {x: 10, y: 110}]
    ]
  },
  // Letter O: Bridged top and bottom (2 half shells) so middle island stays connected!
  'O': {
    width: 64,
    loops: [
      // Left half-shell
      [{x: 26, y: 100}, {x: 16, y: 89}, {x: 8, y: 70}, {x: 8, y: 30}, {x: 16, y: 11}, {x: 26, y: 0}, {x: 26, y: 11}, {x: 20, y: 20}, {x: 17, y: 34}, {x: 17, y: 66}, {x: 20, y: 80}, {x: 26, y: 89}, {x: 26, y: 100}],
      // Right half-shell
      [{x: 38, y: 100}, {x: 48, y: 89}, {x: 56, y: 70}, {x: 56, y: 30}, {x: 48, y: 11}, {x: 38, y: 0}, {x: 38, y: 11}, {x: 44, y: 20}, {x: 47, y: 34}, {x: 47, y: 66}, {x: 44, y: 80}, {x: 38, y: 89}, {x: 38, y: 100}]
    ]
  },
  // Letter P: Stencil split so loop doesn't drop
  'P': {
    width: 58,
    loops: [
      // Spine
      [{x: 8, y: 0}, {x: 18, y: 0}, {x: 18, y: 100}, {x: 8, y: 100}, {x: 8, y: 0}],
      // Lobe with bridge
      [{x: 25, y: 92}, {x: 44, y: 92}, {x: 54, y: 78}, {x: 54, y: 62}, {x: 44, y: 48}, {x: 25, y: 48}, {x: 25, y: 58}, {x: 40, y: 58}, {x: 44, y: 65}, {x: 44, y: 75}, {x: 40, y: 82}, {x: 25, y: 82}, {x: 25, y: 92}]
    ]
  },
  // Letter Q: Bridged O + tail
  'Q': {
    width: 64,
    loops: [
      [{x: 26, y: 100}, {x: 16, y: 89}, {x: 8, y: 70}, {x: 8, y: 30}, {x: 16, y: 11}, {x: 26, y: 0}, {x: 26, y: 11}, {x: 20, y: 20}, {x: 17, y: 34}, {x: 17, y: 66}, {x: 20, y: 80}, {x: 26, y: 89}, {x: 26, y: 100}],
      [{x: 38, y: 100}, {x: 48, y: 89}, {x: 56, y: 70}, {x: 56, y: 30}, {x: 48, y: 11}, {x: 38, y: 0}, {x: 38, y: 11}, {x: 44, y: 20}, {x: 47, y: 34}, {x: 47, y: 66}, {x: 44, y: 80}, {x: 38, y: 89}, {x: 38, y: 100}],
      [{x: 36, y: 22}, {x: 56, y: -4}, {x: 60, y: 2}, {x: 44, y: 28}, {x: 36, y: 22}]
    ]
  },
  // Letter R: Stencil spine + bridged lobe + diagonal leg
  'R': {
    width: 60,
    loops: [
      [{x: 8, y: 0}, {x: 18, y: 0}, {x: 18, y: 100}, {x: 8, y: 100}, {x: 8, y: 0}],
      [{x: 25, y: 92}, {x: 44, y: 92}, {x: 54, y: 78}, {x: 54, y: 64}, {x: 44, y: 50}, {x: 25, y: 50}, {x: 25, y: 60}, {x: 40, y: 60}, {x: 44, y: 67}, {x: 44, y: 75}, {x: 40, y: 82}, {x: 25, y: 82}, {x: 25, y: 92}],
      [{x: 24, y: 44}, {x: 42, y: 44}, {x: 56, y: 0}, {x: 44, y: 0}, {x: 32, y: 34}, {x: 24, y: 34}, {x: 24, y: 44}]
    ]
  },
  'S': {
    width: 60,
    loops: [
      [
        { x: 53.8, y: 77.4 },
        { x: 52.5, y: 87.2 },
        { x: 48.5, y: 94.7 },
        { x: 42.3, y: 98.6 },
        { x: 36.1, y: 99.8 },
        { x: 30, y: 100 },
        { x: 21.8, y: 98.6 },
        { x: 14.9, y: 94.4 },
        { x: 9.9, y: 87.8 },
        { x: 7.1, y: 79.7 },
        { x: 6.3, y: 70.5 },
        { x: 7.5, y: 61.4 },
        { x: 11.3, y: 54.4 },
        { x: 16.5, y: 49.9 },
        { x: 21.9, y: 47 },
        { x: 27.4, y: 44.1 },
        { x: 33.4, y: 40.9 },
        { x: 37.8, y: 38.5 },
        { x: 40.4, y: 36.3 },
        { x: 41.7, y: 33.9 },
        { x: 42.3, y: 29.4 },
        { x: 41.7, y: 23.2 },
        { x: 40.2, y: 18.7 },
        { x: 37.9, y: 15.8 },
        { x: 34.7, y: 13.8 },
        { x: 30, y: 13.1 },
        { x: 24.6, y: 13.3 },
        { x: 21, y: 13.8 },
        { x: 19.4, y: 14.7 },
        { x: 18.4, y: 16.8 },
        { x: 17.8, y: 22.5 },
        { x: 6.3, y: 22.5 },
        { x: 7.5, y: 12.7 },
        { x: 11.5, y: 5.1 },
        { x: 17.7, y: 1.3 },
        { x: 23.9, y: 0.1 },
        { x: 30, y: 0 },
        { x: 38.2, y: 1.3 },
        { x: 45.1, y: 5.5 },
        { x: 50.1, y: 12.1 },
        { x: 52.9, y: 20.2 },
        { x: 53.8, y: 29.4 },
        { x: 52.5, y: 38.5 },
        { x: 48.7, y: 45.5 },
        { x: 43.5, y: 49.9 },
        { x: 38.1, y: 52.9 },
        { x: 32.6, y: 55.8 },
        { x: 26.6, y: 59 },
        { x: 22.2, y: 61.4 },
        { x: 19.6, y: 63.5 },
        { x: 18.3, y: 65.9 },
        { x: 17.8, y: 70.5 },
        { x: 18.3, y: 76.7 },
        { x: 19.8, y: 81.1 },
        { x: 22.1, y: 84.1 },
        { x: 25.3, y: 86.1 },
        { x: 30, y: 86.9 },
        { x: 35.4, y: 86.6 },
        { x: 39, y: 86.1 },
        { x: 40.6, y: 85.1 },
        { x: 41.6, y: 83.1 },
        { x: 42.3, y: 77.4 },
        { x: 53.8, y: 77.4 }
      ]
    ]
  },
  'T': {
    width: 56,
    loops: [
      [{x: 6, y: 100}, {x: 50, y: 100}, {x: 50, y: 88}, {x: 33, y: 88}, {x: 33, y: 0}, {x: 23, y: 0}, {x: 23, y: 88}, {x: 6, y: 88}, {x: 6, y: 100}]
    ]
  },
  'U': {
    width: 60,
    loops: [
      [{x: 8, y: 100}, {x: 18, y: 100}, {x: 18, y: 28}, {x: 26, y: 14}, {x: 34, y: 14}, {x: 42, y: 28}, {x: 42, y: 100}, {x: 52, y: 100}, {x: 52, y: 24}, {x: 42, y: 0}, {x: 18, y: 0}, {x: 8, y: 24}, {x: 8, y: 100}]
    ]
  },
  'V': {
    width: 60,
    loops: [
      [{x: 6, y: 100}, {x: 17, y: 100}, {x: 30, y: 26}, {x: 43, y: 100}, {x: 54, y: 100}, {x: 35, y: 0}, {x: 25, y: 0}, {x: 6, y: 100}]
    ]
  },
  'W': {
    width: 76,
    loops: [
      [{x: 4, y: 100}, {x: 14, y: 100}, {x: 22, y: 26}, {x: 32, y: 72}, {x: 42, y: 72}, {x: 52, y: 26}, {x: 60, y: 100}, {x: 70, y: 100}, {x: 58, y: 0}, {x: 46, y: 0}, {x: 37, y: 46}, {x: 28, y: 0}, {x: 16, y: 0}, {x: 4, y: 100}]
    ]
  },
  'X': {
    width: 58,
    loops: [
      [{x: 6, y: 0}, {x: 18, y: 0}, {x: 29, y: 38}, {x: 40, y: 0}, {x: 52, y: 0}, {x: 36, y: 50}, {x: 52, y: 100}, {x: 40, y: 100}, {x: 29, y: 62}, {x: 18, y: 100}, {x: 6, y: 100}, {x: 22, y: 50}, {x: 6, y: 0}]
    ]
  },
  'Y': {
    width: 58,
    loops: [
      [
        { x: 6, y: 100 },
        { x: 17, y: 100 },
        { x: 29, y: 56 },
        { x: 41, y: 100 },
        { x: 52, y: 100 },
        { x: 34, y: 48 },
        { x: 34, y: 0 },
        { x: 24, y: 0 },
        { x: 24, y: 48 },
        { x: 6, y: 100 }
      ]
    ]
  },
  'Z': {
    width: 56,
    loops: [
      [{x: 8, y: 100}, {x: 48, y: 100}, {x: 48, y: 88}, {x: 22, y: 14}, {x: 48, y: 14}, {x: 48, y: 0}, {x: 8, y: 0}, {x: 8, y: 12}, {x: 34, y: 86}, {x: 8, y: 86}, {x: 8, y: 100}]
    ]
  },
  // Digits with plasma bridges:
  '0': {
    width: 60,
    loops: [
      [{x: 24, y: 100}, {x: 14, y: 89}, {x: 8, y: 70}, {x: 8, y: 30}, {x: 14, y: 11}, {x: 24, y: 0}, {x: 24, y: 11}, {x: 18, y: 20}, {x: 16, y: 34}, {x: 16, y: 66}, {x: 18, y: 80}, {x: 24, y: 89}, {x: 24, y: 100}],
      [{x: 36, y: 100}, {x: 46, y: 89}, {x: 52, y: 70}, {x: 52, y: 30}, {x: 46, y: 11}, {x: 36, y: 0}, {x: 36, y: 11}, {x: 42, y: 20}, {x: 44, y: 34}, {x: 44, y: 66}, {x: 42, y: 80}, {x: 36, y: 89}, {x: 36, y: 100}]
    ]
  },
  '1': {
    width: 38,
    loops: [
      [{x: 6, y: 80}, {x: 20, y: 100}, {x: 24, y: 100}, {x: 24, y: 14}, {x: 34, y: 14}, {x: 34, y: 0}, {x: 10, y: 0}, {x: 10, y: 14}, {x: 16, y: 14}, {x: 16, y: 83}, {x: 8, y: 77}, {x: 6, y: 80}]
    ]
  },
  '2': {
    width: 56,
    loops: [
      [{x: 8, y: 83}, {x: 16, y: 100}, {x: 40, y: 100}, {x: 48, y: 87}, {x: 48, y: 70}, {x: 20, y: 14}, {x: 48, y: 14}, {x: 48, y: 0}, {x: 8, y: 0}, {x: 8, y: 14}, {x: 34, y: 68}, {x: 36, y: 79}, {x: 32, y: 87}, {x: 20, y: 87}, {x: 14, y: 79}, {x: 8, y: 83}]
    ]
  },
  '3': {
    width: 56,
    loops: [
      [{x: 8, y: 89}, {x: 18, y: 100}, {x: 42, y: 100}, {x: 48, y: 84}, {x: 44, y: 61}, {x: 30, y: 55}, {x: 44, y: 45}, {x: 48, y: 20}, {x: 40, y: 0}, {x: 16, y: 0}, {x: 8, y: 14}, {x: 16, y: 18}, {x: 24, y: 11}, {x: 36, y: 11}, {x: 38, y: 23}, {x: 34, y: 36}, {x: 22, y: 43}, {x: 22, y: 55}, {x: 34, y: 61}, {x: 38, y: 75}, {x: 34, y: 86}, {x: 22, y: 86}, {x: 14, y: 80}, {x: 8, y: 89}]
    ]
  },
  '4': {
    width: 58,
    loops: [
      // Left diagonal with bridge
      [{x: 6, y: 38}, {x: 38, y: 94}, {x: 38, y: 48}, {x: 18, y: 48}, {x: 6, y: 38}],
      // Main cross & vertical spine
      [{x: 36, y: 0}, {x: 46, y: 0}, {x: 46, y: 38}, {x: 54, y: 38}, {x: 54, y: 48}, {x: 46, y: 48}, {x: 46, y: 100}, {x: 36, y: 100}, {x: 36, y: 0}]
    ]
  },
  '5': {
    width: 56,
    loops: [
      [{x: 48, y: 100}, {x: 12, y: 100}, {x: 12, y: 51}, {x: 38, y: 51}, {x: 46, y: 38}, {x: 46, y: 15}, {x: 38, y: 0}, {x: 14, y: 0}, {x: 8, y: 13}, {x: 16, y: 17}, {x: 22, y: 11}, {x: 34, y: 11}, {x: 36, y: 19}, {x: 36, y: 34}, {x: 28, y: 40}, {x: 12, y: 40}, {x: 12, y: 87}, {x: 48, y: 87}, {x: 48, y: 100}]
    ]
  },
  '6': {
    width: 56,
    loops: [
      // Outer spine
      [{x: 44, y: 89}, {x: 34, y: 100}, {x: 18, y: 100}, {x: 8, y: 77}, {x: 8, y: 18}, {x: 18, y: 0}, {x: 40, y: 0}, {x: 48, y: 16}, {x: 48, y: 36}, {x: 40, y: 50}, {x: 18, y: 50}, {x: 18, y: 68}, {x: 24, y: 86}, {x: 36, y: 86}, {x: 42, y: 77}, {x: 44, y: 89}],
      // Inner island with bridge
      [{x: 24, y: 36}, {x: 36, y: 36}, {x: 38, y: 27}, {x: 38, y: 20}, {x: 34, y: 11}, {x: 24, y: 11}, {x: 24, y: 36}]
    ]
  },
  '7': {
    width: 54,
    loops: [
      [{x: 8, y: 100}, {x: 48, y: 100}, {x: 48, y: 88}, {x: 28, y: 0}, {x: 18, y: 0}, {x: 34, y: 88}, {x: 8, y: 88}, {x: 8, y: 100}]
    ]
  },
  '8': {
    width: 58,
    loops: [
      // Outer figure-8
      [{x: 29, y: 52}, {x: 16, y: 66}, {x: 12, y: 84}, {x: 20, y: 100}, {x: 38, y: 100}, {x: 46, y: 84}, {x: 42, y: 66}, {x: 29, y: 52}, {x: 44, y: 36}, {x: 48, y: 16}, {x: 38, y: 0}, {x: 20, y: 0}, {x: 10, y: 16}, {x: 14, y: 36}, {x: 29, y: 52}],
      // Top inner lobe with bridge
      [{x: 24, y: 86}, {x: 34, y: 86}, {x: 34, y: 70}, {x: 24, y: 70}, {x: 24, y: 86}],
      // Bottom inner lobe with bridge
      [{x: 22, y: 30}, {x: 36, y: 30}, {x: 36, y: 11}, {x: 22, y: 11}, {x: 22, y: 30}]
    ]
  },
  '9': {
    width: 56,
    loops: [
      [{x: 48, y: 82}, {x: 48, y: 23}, {x: 38, y: 0}, {x: 20, y: 0}, {x: 12, y: 11}, {x: 18, y: 20}, {x: 24, y: 11}, {x: 36, y: 11}, {x: 38, y: 27}, {x: 38, y: 48}, {x: 16, y: 48}, {x: 8, y: 64}, {x: 8, y: 84}, {x: 18, y: 100}, {x: 38, y: 100}, {x: 48, y: 82}],
      [{x: 20, y: 61}, {x: 34, y: 61}, {x: 36, y: 70}, {x: 36, y: 86}, {x: 24, y: 86}, {x: 18, y: 80}, {x: 18, y: 70}, {x: 20, y: 61}]
    ]
  },
  '-': {
    width: 38,
    loops: [
      [{x: 6, y: 44}, {x: 32, y: 44}, {x: 32, y: 56}, {x: 6, y: 56}, {x: 6, y: 44}]
    ]
  },
  '+': {
    width: 48,
    loops: [
      [{x: 18, y: 22}, {x: 28, y: 22}, {x: 28, y: 42}, {x: 42, y: 42}, {x: 42, y: 54}, {x: 28, y: 54}, {x: 28, y: 74}, {x: 18, y: 74}, {x: 18, y: 54}, {x: 6, y: 54}, {x: 6, y: 42}, {x: 18, y: 42}, {x: 18, y: 22}]
    ]
  },
  '.': {
    width: 24,
    loops: [
      [{x: 6, y: 0}, {x: 18, y: 0}, {x: 18, y: 12}, {x: 6, y: 12}, {x: 6, y: 0}]
    ]
  },
  ' ': {
    width: 35,
    loops: []
  }
};

/**
 * Converts user text into vector loops (scaled in mm according to options)
 */
export function generateTextVectorLoops(
  text: string,
  fontType: FontStyleType,
  fontSizeMm: number,
  letterSpacingMm: number,
  lineSpacingMultiplier: number = 1.3
): { loops: { points: Point2D[]; isClosed: boolean }[]; width: number; height: number } {
  const lines = text.split('\n');
  const scale = fontSizeMm / 100; // our glyphs are designed in 0-100 height
  const lineHeightMm = fontSizeMm * lineSpacingMultiplier;

  const resultLoops: { points: Point2D[]; isClosed: boolean }[] = [];
  let maxWidth = 0;

  // Process line by line
  lines.forEach((lineText, lineIndex) => {
    let currentX = 0;
    // In CNC LinuxCNC, Y positive is UP!
    // We position line 0 at the top and lines below it
    const lineBaseY = (lines.length - 1 - lineIndex) * lineHeightMm;

    for (let i = 0; i < lineText.length; i++) {
      const char = lineText[i].toUpperCase();

      if (char === ' ') {
        currentX += (SINGLE_LINE_FONT[' ']?.width || 35) * scale + letterSpacingMm;
        continue;
      }

      if (fontType === 'single_line') {
        // Hershey single line
        const glyph = SINGLE_LINE_FONT[char] || SINGLE_LINE_FONT[' '];
        if (glyph && glyph.strokes) {
          glyph.strokes.forEach(stroke => {
            const transformedPoints = stroke.map(pt => ({
              x: currentX + pt.x * scale,
              y: lineBaseY + pt.y * scale
            }));
            resultLoops.push({
              points: transformedPoints,
              isClosed: false
            });
          });
          currentX += glyph.width * scale + letterSpacingMm;
        }
      } else {
        // Stencil Font (Default for Plasma!)
        const stencilGlyph = STENCIL_PLASMA_FONT[char];
        if (stencilGlyph && stencilGlyph.loops) {
          stencilGlyph.loops.forEach(loop => {
            const transformedPoints = loop.map(pt => ({
              x: currentX + pt.x * scale,
              y: lineBaseY + pt.y * scale
            }));
            resultLoops.push({
              points: transformedPoints,
              isClosed: true
            });
          });
          currentX += stencilGlyph.width * scale + letterSpacingMm;
        } else {
          // Fallback to single-line stroke font
          const strokeGlyph = SINGLE_LINE_FONT[char] || SINGLE_LINE_FONT[' '];
          if (strokeGlyph && strokeGlyph.strokes) {
            strokeGlyph.strokes.forEach(stroke => {
              const transformedPoints = stroke.map(pt => ({
                x: currentX + pt.x * scale,
                y: lineBaseY + pt.y * scale
              }));
              resultLoops.push({
                points: transformedPoints,
                isClosed: false
              });
            });
            currentX += strokeGlyph.width * scale + letterSpacingMm;
          }
        }
      }
    }

    if (currentX > maxWidth) {
      maxWidth = currentX;
    }
  });

  const totalHeight = lines.length * lineHeightMm;

  return {
    loops: resultLoops,
    width: maxWidth,
    height: totalHeight
  };
}

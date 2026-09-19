export type MeasurementUnit = 'mm' | 'inch';

export type FontStyleType = 'stencil' | 'single_line' | 'industrial_stencil';

export interface PlasmaConfig {
  unit: MeasurementUnit;
  cutFeedRate: number;        // e.g. 1800 mm/min
  rapidFeedRate: number;      // e.g. 6000 mm/min
  safeZ: number;              // e.g. 25 mm
  pierceHeightZ: number;      // e.g. 3.8 mm
  cutHeightZ: number;         // e.g. 1.5 mm
  pierceDelay: number;        // seconds, e.g. 0.6s
  torchOnCommand: string;     // 'M3 S1' or 'M3'
  torchOffCommand: string;    // 'M5'
  enableTouchOff: boolean;    // LinuxCNC floating head / ohmic probe cycle
  probeFeedRate: number;      // e.g. 400 mm/min
  switchOffset: number;       // e.g. 1.2 mm
  leadInType: 'straight' | 'arc' | 'none';
  leadInLength: number;       // mm, e.g. 3.0
  leadInAngle: number;        // degrees, e.g. 45 or 90
  leadOutLength: number;      // mm, e.g. 1.5
  kerfWidth: number;          // mm, e.g. 1.2 mm
  g64Tolerance: number;       // LinuxCNC path blending, e.g. 0.1 mm
}

export interface Point2D {
  x: number;
  y: number;
}

export interface Segment {
  type: 'rapid' | 'cut' | 'arc_cw' | 'arc_ccw' | 'lead_in' | 'lead_out';
  start: Point2D;
  end: Point2D;
  center?: Point2D; // for arcs
  radius?: number;
}

export interface ToolpathLoop {
  id: string;
  isClosed: boolean;
  piercePoint: Point2D;
  startPoint: Point2D;
  leadIn?: Segment;
  segments: Segment[];
  leadOut?: Segment;
  cutLength: number;
}

export interface ToolpathData {
  loops: ToolpathLoop[];
  bounds: {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
    width: number;
    height: number;
  };
  totalCutLength: number;
  totalRapidLength: number;
  pierceCount: number;
  estimatedTimeSeconds: number;
  gcode: string;
}

export interface TextOptions {
  text: string;
  fontType: FontStyleType;
  fontSize: number;          // mm
  letterSpacing: number;     // mm
  lineSpacing: number;       // multiplier, e.g. 1.3
  origin: 'bottom_left' | 'top_left' | 'center';
  bridgeWidth: number;       // stencil bridge width in mm
}

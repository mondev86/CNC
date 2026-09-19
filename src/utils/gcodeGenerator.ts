import { Point2D, PlasmaConfig, ToolpathData, ToolpathLoop, Segment } from '../types';

/**
 * Calculates Euclidean distance between two 2D points
 */
export function distance(p1: Point2D, p2: Point2D): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Computes lead-in starting point given the first segment of a loop
 */
function computeLeadIn(
  startPt: Point2D,
  nextPt: Point2D,
  leadInLength: number,
  leadInAngleDeg: number
): Point2D {
  const dx = nextPt.x - startPt.x;
  const dy = nextPt.y - startPt.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len === 0) {
    return { x: startPt.x - leadInLength, y: startPt.y };
  }

  // Tangent vector
  const tx = dx / len;
  const ty = dy / len;

  // Normal vector (pointing perpendicular to path)
  const nx = -ty;
  const ny = tx;

  const rad = (leadInAngleDeg * Math.PI) / 180;
  const dirX = -tx * Math.cos(rad) + nx * Math.sin(rad);
  const dirY = -ty * Math.cos(rad) + ny * Math.sin(rad);

  return {
    x: startPt.x + dirX * leadInLength,
    y: startPt.y + dirY * leadInLength
  };
}

/**
 * Converts raw vector loops into full plasma toolpath and LinuxCNC .ngc code
 */
export function generatePlasmaToolpath(
  rawLoops: { points: Point2D[]; isClosed: boolean }[],
  config: PlasmaConfig,
  customScale: number = 1.0,
  offsetX: number = 0,
  offsetY: number = 0
): ToolpathData {
  const loops: ToolpathLoop[] = [];
  let totalCutLength = 0;
  let totalRapidLength = 0;
  let lastRapidEnd: Point2D = { x: 0, y: 0 };

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  rawLoops.forEach((raw, loopIdx) => {
    if (raw.points.length < 2) return;

    // Apply scaling and offsets
    const pts = raw.points.map(p => {
      const x = p.x * customScale + offsetX;
      const y = p.y * customScale + offsetY;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
      return { x, y };
    });

    const isClosed = raw.isClosed || distance(pts[0], pts[pts.length - 1]) < 0.05;
    const startPoint = pts[0];
    let piercePoint = { ...startPoint };
    let leadInSegment: Segment | undefined;

    // Add lead-in for closed plasma contours
    if (isClosed && config.leadInType !== 'none' && config.leadInLength > 0 && pts.length > 1) {
      const leadInStart = computeLeadIn(
        startPoint,
        pts[1],
        config.leadInLength,
        config.leadInAngle
      );
      piercePoint = leadInStart;
      leadInSegment = {
        type: 'lead_in',
        start: leadInStart,
        end: startPoint
      };
    }

    // Rapid traverse to pierce point
    totalRapidLength += distance(lastRapidEnd, piercePoint);

    const segments: Segment[] = [];
    let loopCutLen = 0;

    if (leadInSegment) {
      const d = distance(leadInSegment.start, leadInSegment.end);
      totalCutLength += d;
      loopCutLen += d;
    }

    // Cut contour segments
    for (let i = 0; i < pts.length - 1; i++) {
      const pA = pts[i];
      const pB = pts[i + 1];
      const segLen = distance(pA, pB);
      if (segLen > 0.001) {
        segments.push({
          type: 'cut',
          start: pA,
          end: pB
        });
        totalCutLength += segLen;
        loopCutLen += segLen;
      }
    }

    // Lead-out segment for closed paths
    let leadOutSegment: Segment | undefined;
    if (isClosed && config.leadOutLength > 0 && segments.length > 0) {
      const lastSeg = segments[segments.length - 1];
      const dx = lastSeg.end.x - lastSeg.start.x;
      const dy = lastSeg.end.y - lastSeg.start.y;
      const len = Math.sqrt(dx * dx + dy * dy);
      if (len > 0) {
        const leadOutEnd = {
          x: lastSeg.end.x + (dx / len) * config.leadOutLength,
          y: lastSeg.end.y + (dy / len) * config.leadOutLength
        };
        leadOutSegment = {
          type: 'lead_out',
          start: lastSeg.end,
          end: leadOutEnd
        };
        const d = distance(leadOutSegment.start, leadOutSegment.end);
        totalCutLength += d;
        loopCutLen += d;
      }
    }

    lastRapidEnd = leadOutSegment ? leadOutSegment.end : pts[pts.length - 1];

    loops.push({
      id: `loop_${loopIdx}`,
      isClosed,
      piercePoint,
      startPoint,
      leadIn: leadInSegment,
      segments,
      leadOut: leadOutSegment,
      cutLength: loopCutLen
    });
  });

  // Calculate return to origin rapid
  totalRapidLength += distance(lastRapidEnd, { x: 0, y: 0 });

  if (minX === Infinity) {
    minX = 0;
    minY = 0;
    maxX = 0;
    maxY = 0;
  }

  // Calculate estimated time in seconds:
  // Time = (pierce delays) + (cut length / cut feed rate) + (rapid length / rapid feed rate) + (Z movements)
  const cutTimeSeconds = (totalCutLength / Math.max(100, config.cutFeedRate)) * 60;
  const rapidTimeSeconds = (totalRapidLength / Math.max(500, config.rapidFeedRate)) * 60;
  const pierceDelaySeconds = loops.length * (config.pierceDelay + 0.3); // delay + height transition
  const estimatedTimeSeconds = Math.round(cutTimeSeconds + rapidTimeSeconds + pierceDelaySeconds);

  // Generate LinuxCNC .ngc G-Code
  const gcode = formatLinuxCncGcode(loops, config, {
    minX,
    minY,
    maxX,
    maxY,
    width: Math.max(0, maxX - minX),
    height: Math.max(0, maxY - minY)
  }, totalCutLength, estimatedTimeSeconds);

  return {
    loops,
    bounds: {
      minX,
      minY,
      maxX,
      maxY,
      width: Math.max(0, maxX - minX),
      height: Math.max(0, maxY - minY)
    },
    totalCutLength,
    totalRapidLength,
    pierceCount: loops.length,
    estimatedTimeSeconds,
    gcode
  };
}

/**
 * Formats standard, clean LinuxCNC G-Code for plasma
 */
function formatLinuxCncGcode(
  loops: ToolpathLoop[],
  config: PlasmaConfig,
  bounds: { minX: number; minY: number; maxX: number; maxY: number; width: number; height: number },
  totalCutLen: number,
  estSeconds: number
): string {
  const u = config.unit === 'inch' ? 'G20 (Imperial Units - Inches)' : 'G21 (Metric Units - mm)';
  const unitLabel = config.unit === 'inch' ? 'in' : 'mm';
  const unitPerMin = config.unit === 'inch' ? 'IPM' : 'mm/min';

  const f3 = (n: number) => n.toFixed(3);

  const lines: string[] = [
    `( ------------------------------------------------------------ )`,
    `( PROGRAMA DE CORTE PLASMA - LINUXCNC NGC                      )`,
    `( Generado para cortadora CNC de plasma con control de antorcha )`,
    `( ------------------------------------------------------------ )`,
    `( Dimensiones X: ${f3(bounds.minX)} a ${f3(bounds.maxX)} ${unitLabel} [Ancho: ${f3(bounds.width)} ${unitLabel}] )`,
    `( Dimensiones Y: ${f3(bounds.minY)} a ${f3(bounds.maxY)} ${unitLabel} [Alto: ${f3(bounds.height)} ${unitLabel}] )`,
    `( Longitud total de corte: ${f3(totalCutLen)} ${unitLabel} )`,
    `( Cantidad de perforaciones (pierces): ${loops.length} )`,
    `( Tiempo estimado de mecanizado: ~${Math.floor(estSeconds / 60)}m ${estSeconds % 60}s )`,
    `( ------------------------------------------------------------ )`,
    ``,
    `G90 (Modo absoluto)`,
    u,
    `G64 P${f3(config.g64Tolerance)} (Tolerancia de trayectoria continua)`,
    `G17 (Plano XY)`,
    `G40 (Compensacion de radio cancelada)`,
    `G49 (Compensacion de longitud de herramienta cancelada)`,
    `G80 (Ciclo fijo cancelado)`,
    `G94 (Velocidad de avance por minuto)`,
    ``,
    `( Retraer eje Z a altura segura antes de iniciar )`,
    `G0 Z${f3(config.safeZ)}`,
    ``
  ];

  loops.forEach((loop, idx) => {
    lines.push(`( === Trayectoria ${idx + 1} de ${loops.length} === )`);

    // Rapid to pierce point
    lines.push(`G0 X${f3(loop.piercePoint.x)} Y${f3(loop.piercePoint.y)}`);

    // Optional Touch-Off probe routine for LinuxCNC floating head
    if (config.enableTouchOff) {
      lines.push(`( Ciclo de contacto - Floating Head / Ohmic Probe )`);
      lines.push(`G38.2 Z-50.000 F${f3(config.probeFeedRate)} (Busqueda de chapa)`);
      lines.push(`G92 Z0.000 (Cero en contacto de interruptor)`);
      lines.push(`G0 Z${f3(config.switchOffset)} (Compensar carrera del interruptor flotante)`);
      lines.push(`G92 Z0.000 (Definir superficie real de la chapa Z0)`);
    }

    // Move to pierce height
    lines.push(`G0 Z${f3(config.pierceHeightZ)} (Altura de perforacion / Pierce Height)`);

    // Torch on
    lines.push(`${config.torchOnCommand} (Encender antorcha de plasma)`);

    // Pierce delay
    if (config.pierceDelay > 0) {
      lines.push(`G4 P${config.pierceDelay.toFixed(2)} (Retardo de perforacion / Pierce Delay)`);
    }

    // Plunge to cutting height
    lines.push(`G1 Z${f3(config.cutHeightZ)} F1200.0 (Bajar a altura de corte / Cut Height)`);

    // Cut lead-in if present
    if (loop.leadIn) {
      lines.push(`( Entrada / Lead-in )`);
      lines.push(`G1 X${f3(loop.leadIn.end.x)} Y${f3(loop.leadIn.end.y)} F${f3(config.cutFeedRate)}`);
    }

    // Cut segments
    lines.push(`( Corte de contorno - F${f3(config.cutFeedRate)} ${unitPerMin} )`);
    loop.segments.forEach(seg => {
      lines.push(`G1 X${f3(seg.end.x)} Y${f3(seg.end.y)} F${f3(config.cutFeedRate)}`);
    });

    // Cut lead-out if present
    if (loop.leadOut) {
      lines.push(`( Salida / Lead-out )`);
      lines.push(`G1 X${f3(loop.leadOut.end.x)} Y${f3(loop.leadOut.end.y)}`);
    }

    // Torch off
    lines.push(`${config.torchOffCommand} (Apagar antorcha de plasma)`);

    // Retract to safe Z
    lines.push(`G0 Z${f3(config.safeZ)} (Subir a altura segura)`);
    lines.push(``);
  });

  // End of program
  lines.push(`( ------------------------------------------------------------ )`);
  lines.push(`( Fin del programa )`);
  lines.push(`${config.torchOffCommand} (Garantizar antorcha apagada)`);
  lines.push(`G0 Z${f3(config.safeZ)} (Retraccion segura)`);
  lines.push(`G0 X0.000 Y0.000 (Retorno a origen de la mesa)`);
  lines.push(`M2 (Fin de programa LinuxCNC)`);
  lines.push(`%`);

  return lines.join('\n');
}

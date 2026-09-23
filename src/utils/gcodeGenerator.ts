import { ToolpathData, ToolpathLoop, PlasmaConfig, Segment, Point2D } from '../types';

export function generatePlasmaToolpath(
  loops: ToolpathLoop[],
  config: PlasmaConfig,
  scale: number = 1.0,
  offsetX: number = 0,
  offsetY: number = 0,
  g10RotationAngle?: number
): ToolpathData {
  let totalCutLength = 0;
  let totalRapidLength = 0;
  let pierceCount = loops.length;
  let lastX = 0;
  let lastY = 0;

  const processedLoops: ToolpathLoop[] = loops.map(loop => {
    let leadInSeg: Segment | undefined = undefined;
    let effectivePierce = { ...loop.piercePoint };

    if (config.leadInType !== 'none' && config.leadInLength > 0 && loop.segments.length > 0) {
      const firstSeg = loop.segments[0];
      const dx = firstSeg.end.x - firstSeg.start.x;
      const dy = firstSeg.end.y - firstSeg.start.y;
      const len = Math.hypot(dx, dy);

      if (len > 0.001) {
        const tx = dx / len;
        const ty = dy / len;
        const nx = -ty;
        const ny = tx;

        const rad = (config.leadInAngle * Math.PI) / 180;
        const dirX = -tx * Math.cos(rad) + nx * Math.sin(rad);
        const dirY = -ty * Math.cos(rad) + ny * Math.sin(rad);

        const pStart: Point2D = {
          x: firstSeg.start.x + dirX * config.leadInLength,
          y: firstSeg.start.y + dirY * config.leadInLength
        };

        leadInSeg = {
          type: 'lead_in',
          start: pStart,
          end: { ...firstSeg.start }
        };
        effectivePierce = { ...pStart };
      }
    }

    return {
      ...loop,
      piercePoint: effectivePierce,
      leadIn: leadInSeg
    };
  });

  processedLoops.forEach(l => {
    totalRapidLength += Math.hypot(l.piercePoint.x - lastX, l.piercePoint.y - lastY);
    if (l.leadIn) {
      totalCutLength += Math.hypot(l.leadIn.end.x - l.leadIn.start.x, l.leadIn.end.y - l.leadIn.start.y);
    }
    l.segments.forEach(s => {
      totalCutLength += Math.hypot(s.end.x - s.start.x, s.end.y - s.start.y);
    });
    const lastSeg = l.segments[l.segments.length - 1];
    if (lastSeg) {
      lastX = lastSeg.end.x;
      lastY = lastSeg.end.y;
    }
  });

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  processedLoops.forEach(l => {
    [l.piercePoint, l.startPoint].forEach(p => {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    });
    l.segments.forEach(s => {
      [s.start, s.end].forEach(p => {
        if (p.x < minX) minX = p.x;
        if (p.x > maxX) maxX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.y > maxY) maxY = p.y;
      });
    });
  });

  if (minX === Infinity) {
    minX = 0; minY = 0; maxX = 0; maxY = 0;
  }

  const cutMinutes = totalCutLength / Math.max(10, config.cutFeedRate);
  const rapidMinutes = totalRapidLength / Math.max(10, config.rapidFeedRate);
  const pierceSeconds = pierceCount * (config.pierceDelay + (config.enableTouchOff ? 2.5 : 0.5));
  const estimatedTimeSeconds = Math.round(cutMinutes * 60 + rapidMinutes * 60 + pierceSeconds);

  const gcodeLines: string[] = [];
  gcodeLines.push('%');
  gcodeLines.push('( PlasmaNGC Studio - LinuxCNC G-Code Generator )');
  gcodeLines.push(`( Loops / Contornos: ${loops.length} | Perforaciones: ${pierceCount} )`);
  gcodeLines.push(`( Longitud de Corte: ${totalCutLength.toFixed(1)} mm | Tiempo Estimado: ${Math.floor(estimatedTimeSeconds / 60)}m ${estimatedTimeSeconds % 60}s )`);
  gcodeLines.push('');
  gcodeLines.push(config.unit === 'mm' ? 'G21 (Unidades metricas en mm)' : 'G20 (Unidades en pulgadas)');
  gcodeLines.push('G90 (Modo coordenadas absolutas)');
  gcodeLines.push(`G64 P${config.g64Tolerance.toFixed(3)} Q0.100 (Trayectoria continua sin vibracion)`);
  gcodeLines.push('G17 (Plano de trabajo XY)');

  if (g10RotationAngle && Math.abs(g10RotationAngle) > 0.001) {
    gcodeLines.push(`G10 L2 P1 R${g10RotationAngle.toFixed(3)} (Rotacion nativa LinuxCNC en Sistema G54)`);
  }

  gcodeLines.push(`G0 Z${config.safeZ.toFixed(3)} (Altura de seguridad)`);
  gcodeLines.push('');

  processedLoops.forEach((l, idx) => {
    gcodeLines.push(`( --- Contorno ${idx + 1}/${processedLoops.length} --- )`);
    gcodeLines.push(`G0 X${l.piercePoint.x.toFixed(3)} Y${l.piercePoint.y.toFixed(3)}`);

    if (config.controllerMode === 'qtplasmac') {
      gcodeLines.push(config.torchOnCommand || 'M3 $0 S1');
      if (config.pierceDelay > 0) {
        gcodeLines.push(`G4 P${config.pierceDelay.toFixed(2)} (Retardo perforacion)`);
      }
    } else {
      gcodeLines.push(`G0 Z${config.pierceHeightZ.toFixed(3)}`);
      gcodeLines.push(config.torchOnCommand || 'M3');
      if (config.pierceDelay > 0) {
        gcodeLines.push(`G4 P${config.pierceDelay.toFixed(2)}`);
      }
      gcodeLines.push(`G1 Z${config.cutHeightZ.toFixed(3)} F${config.cutFeedRate.toFixed(1)}`);
    }

    if (l.leadIn) {
      gcodeLines.push(`G1 X${l.leadIn.end.x.toFixed(3)} Y${l.leadIn.end.y.toFixed(3)} F${config.cutFeedRate.toFixed(1)} (Lead-in)`);
    }

    l.segments.forEach(s => {
      gcodeLines.push(`G1 X${s.end.x.toFixed(3)} Y${s.end.y.toFixed(3)} F${config.cutFeedRate.toFixed(1)}`);
    });

    gcodeLines.push(config.torchOffCommand || 'M5 $0');
    if (config.controllerMode !== 'qtplasmac') {
      gcodeLines.push(`G0 Z${config.safeZ.toFixed(3)}`);
    }
    gcodeLines.push('');
  });

  gcodeLines.push('G0 X0.000 Y0.000 (Retorno a origen)');
  gcodeLines.push('M2 (Fin de programa LinuxCNC)');
  gcodeLines.push('%');

  return {
    loops: processedLoops,
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
    pierceCount,
    estimatedTimeSeconds,
    gcode: gcodeLines.join('\n')
  };
}

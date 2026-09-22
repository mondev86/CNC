import { Point2D, PlasmaConfig, ToolpathData, ToolpathLoop, Segment } from '../types';

/**
 * ============================================================================
 * MÓDULO: GENERADOR DE TRAYECTORIAS Y CÓDIGO G (LINUXCNC / QTPLASMAC)
 * Archivo: src/utils/gcodeGenerator.ts
 * ============================================================================
 * Este módulo es el núcleo CAM de la aplicación. Se encarga de:
 * 1. Tomar contornos vectoriales 2D (puntos X, Y).
 * 2. Calcular los puntos de perforación previa (Lead-in) y salida (Lead-out).
 * 3. Calcular movimientos rápidos en vacío (G0) y cortes activos (G1).
 * 4. Formatear el archivo de texto en formato estándar RS274/NGC de LinuxCNC.
 * 5. Adaptar el código si el usuario utiliza QtPlasmaC en Modo 0 (sin eje Z).
 */

/**
 * Calcula la distancia euclidiana entre dos puntos 2D en milímetros o pulgadas.
 * Fórmula: d = sqrt((x2 - x1)^2 + (y2 - y1)^2)
 */
export function distance(p1: Point2D, p2: Point2D): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calcula el punto de inicio de la perforación previa (Lead-In).
 * El Lead-In permite que el arco de plasma perfore el metal en la zona de descarte
 * antes de entrar en la línea de corte definitiva, evitando morder la pieza terminada.
 * 
 * @param startPt Punto donde comenzará el corte real de la figura.
 * @param nextPt Siguiente punto de la figura (para calcular el vector tangente).
 * @param leadInLength Distancia en mm desde la perforación hasta el inicio del corte.
 * @param leadInAngleDeg Ángulo en grados con respecto a la línea de corte.
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

  // Vector tangente unitario
  const tx = dx / len;
  const ty = dy / len;

  // Vector normal unitario perpendicular
  const nx = -ty;
  const ny = tx;

  // Rotación del vector de entrada según el ángulo configurado
  const rad = (leadInAngleDeg * Math.PI) / 180;
  const dirX = -tx * Math.cos(rad) + nx * Math.sin(rad);
  const dirY = -ty * Math.cos(rad) + ny * Math.sin(rad);

  return {
    x: startPt.x + dirX * leadInLength,
    y: startPt.y + dirY * leadInLength
  };
}

/**
 * Convierte bucles vectoriales en una trayectoria CAM completa y genera el G-Code.
 * 
 * @param rawLoops Arreglo de bucles vectoriales con sus puntos y condición de cierre.
 * @param config Configuración de parámetros de la máquina de plasma.
 * @param customScale Escala multiplicadora (por defecto 1.0).
 * @param offsetX Desplazamiento adicional en eje X.
 * @param offsetY Desplazamiento adicional en eje Y.
 * @param g10Angle Ángulo para comando G10 opcional.
 */
export function generatePlasmaToolpath(
  rawLoops: { points: Point2D[]; isClosed: boolean }[],
  config: PlasmaConfig,
  customScale: number = 1.0,
  offsetX: number = 0,
  offsetY: number = 0,
  g10Angle?: number
): ToolpathData {
  const loops: ToolpathLoop[] = [];
  let totalCutLength = 0;
  let totalRapidLength = 0;
  let lastRapidEnd: Point2D = { x: 0, y: 0 };

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  // Bucle principal: Procesar cada contorno a cortar
  rawLoops.forEach((raw, loopIdx) => {
    if (raw.points.length < 2) return;

    // 1. Aplicar escala y desplazamientos a cada punto
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

    // 2. Insertar Lead-In si la figura es cerrada y está configurado
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

    // Acumular distancia de traslado rápido en vacío (G0)
    totalRapidLength += distance(lastRapidEnd, piercePoint);

    const segments: Segment[] = [];
    let loopCutLen = 0;

    if (leadInSegment) {
      const d = distance(leadInSegment.start, leadInSegment.end);
      totalCutLength += d;
      loopCutLen += d;
    }

    // 3. Crear los segmentos de corte activo (G1)
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

    // 4. Crear segmento de salida (Lead-Out) si está configurado
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

    // Guardar el último punto para calcular el siguiente movimiento rápido
    lastRapidEnd = leadOutSegment ? leadOutSegment.end : pts[pts.length - 1];

    loops.push({
      id: `loop_${loopIdx + 1}`,
      startPoint,
      isClosed,
      leadIn: leadInSegment,
      leadOut: leadOutSegment,
      piercePoint,
      cutLength: loopCutLen,
      segments
    });
  });

  // Si no hay puntos válidos, asignar límites neutros
  if (minX === Infinity) {
    minX = 0;
    minY = 0;
    maxX = 0;
    maxY = 0;
  }

  // 5. Cálculo estimado del tiempo de corte en segundos:
  // Tiempo = (Retardos de perforación) + (Corte / Velocidad Corte) + (Vacío / Velocidad Rápida)
  const cutTimeSeconds = (totalCutLength / Math.max(100, config.cutFeedRate)) * 60;
  const rapidTimeSeconds = (totalRapidLength / Math.max(500, config.rapidFeedRate)) * 60;
  const pierceDelaySeconds = loops.length * (config.pierceDelay + 0.3);
  const estimatedTimeSeconds = Math.round(cutTimeSeconds + rapidTimeSeconds + pierceDelaySeconds);

  // 6. Formatear las líneas en texto G-Code para LinuxCNC
  const gcode = formatLinuxCncGcode(loops, config, {
    minX,
    minY,
    maxX,
    maxY,
    width: Math.max(0, maxX - minX),
    height: Math.max(0, maxY - minY)
  }, totalCutLength, estimatedTimeSeconds, g10Angle);

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
 * Genera el código G estructurado según las normas RS274/NGC de LinuxCNC.
 * Incluye cabecera técnica, comandos de máquina, ciclos de encendido y fin seguro.
 */
function formatLinuxCncGcode(
  loops: ToolpathLoop[],
  config: PlasmaConfig,
  bounds: { minX: number; minY: number; maxX: number; maxY: number; width: number; height: number },
  totalCutLen: number,
  estSeconds: number,
  g10Angle?: number
): string {
  const isQtPlasmaC = config.controllerMode === 'qtplasmac';
  const u = config.unit === 'inch' ? 'G20 (Unidades imperiales en pulgadas)' : 'G21 (Unidades métricas en mm)';
  const unitLabel = config.unit === 'inch' ? 'in' : 'mm';
  const unitPerMin = config.unit === 'inch' ? 'IPM' : 'mm/min';

  // Formateador de números a exactamente 3 decimales (estándar milimétrico CNC)
  const f3 = (n: number) => n.toFixed(3);

  // Normalización de comandos de antorcha para QtPlasmaC (Spindle 0: M3 $0 S1 / M5 $0)
  const torchOnCmd = isQtPlasmaC && !config.torchOnCommand.includes('$')
    ? 'M3 $0 S1'
    : config.torchOnCommand;
  const torchOffCmd = isQtPlasmaC && !config.torchOffCommand.includes('$')
    ? 'M5 $0'
    : config.torchOffCommand;

  const hasG10 = g10Angle !== undefined && Math.abs(g10Angle) > 0.001;

  const lines: string[] = [
    `( ------------------------------------------------------------ )`,
    isQtPlasmaC
      ? `( PROGRAMA DE CORTE PLASMA - LINUXCNC QTPLASMAC (MODO 0)       )`
      : `( PROGRAMA DE CORTE PLASMA - LINUXCNC NGC                      )`,
    isQtPlasmaC
      ? `( Perfil: QtPlasmaC nativo sin eje Z (IHS, Altura y THC por pantalla) )`
      : `( Generado para cortadora CNC de plasma con control de antorcha )`,
    `( ------------------------------------------------------------ )`,
    `( Dimensiones X: ${f3(bounds.minX)} a ${f3(bounds.maxX)} ${unitLabel} [Ancho: ${f3(bounds.width)} ${unitLabel}] )`,
    `( Dimensiones Y: ${f3(bounds.minY)} a ${f3(bounds.maxY)} ${unitLabel} [Alto: ${f3(bounds.height)} ${unitLabel}] )`,
    `( Contornos a cortar: ${loops.length} | Perforaciones: ${loops.length} )`,
    `( Longitud total de corte: ${f3(totalCutLen)} ${unitLabel} )`,
    `( Tiempo estimado aproximado: ~${Math.floor(estSeconds / 60)}m ${estSeconds % 60}s )`,
    `( ------------------------------------------------------------ )`,
    ``,
    `( BLOQUE DE INICIALIZACIÓN Y SEGURIDAD )`,
    u,
    `G90 (Programación en coordenadas absolutas)`,
    `G64 P0.200 Q0.100 (Modo de trayectoria continua con tolerancia para esquinas)`,
    `G17 (Selección del plano de trabajo XY)`,
    `G40 (Cancelar compensación de radio previa si existía)`,
    `G49 (Cancelar compensación de longitud de herramienta)`,
    `G80 (Cancelar cualquier ciclo enlatado activo)`
  ];

  // Inserción de rotación de coordenadas de pieza G10 si fue activada
  if (hasG10) {
    lines.push(
      ``,
      `( ROTACIÓN DE COORDENADAS G54 VÍA G10 L2 P1 )`,
      `G10 L2 P1 R${f3(g10Angle!)} (Alineación con ángulo de chapa en mesa)`
    );
  }

  // En modo estándar que no sea QtPlasmaC, asegurar que la antorcha esté arriba antes de empezar
  if (!isQtPlasmaC) {
    lines.push(
      ``,
      `( ELEVACIÓN INICIAL DE SEGURIDAD )`,
      `G0 Z${f3(config.safeZ)} (Subir antorcha a altura segura antes de mover X/Y)`
    );
  }

  lines.push(
    ``,
    `( ============================================================ )`,
    `( COMIENZO DE LA SECUENCIA DE CORTE                            )`,
    `( ============================================================ )`
  );

  // Bucle por cada contorno a cortar
  loops.forEach((loop, idx) => {
    lines.push(
      ``,
      `( --- Contorno #${idx + 1} de ${loops.length} [Longitud: ${f3(loop.cutLength)} ${unitLabel}] --- )`
    );

    // 1. Moverse en rápido (G0) al punto de perforación (Pierce Point)
    lines.push(
      `G0 X${f3(loop.piercePoint.x)} Y${f3(loop.piercePoint.y)}`
    );

    // 2. Manejo de Altura y Encendido de Antorcha
    if (isQtPlasmaC) {
      // EN QTPLASMAC (MODO 0):
      // No emitimos movimientos Z. El comando M3 $0 S1 dispara la rutina de palpado IHS,
      // la subida a pierce height, la activación del plasma y el descenso a cut height.
      lines.push(
        `${torchOnCmd} (Disparar ciclo de antorcha QtPlasmaC)`
      );
    } else {
      // EN MODO ESTÁNDAR (CON CONTROL MANUAL DE Z):
      lines.push(
        `G0 Z${f3(config.pierceHeightZ)} (Bajar a altura de perforación)`,
        `${torchOnCmd} (Encender plasma)`
      );
      if (config.pierceDelay > 0) {
        lines.push(`G4 P${config.pierceDelay.toFixed(2)} (Pausa para perforar la chapa)`);
      }
      lines.push(
        `G1 Z${f3(config.cutHeightZ)} F${config.cutFeedRate} (Bajar a altura de corte)`
      );
    }

    // 3. Cortar segmento de Lead-In si existe
    if (loop.leadIn) {
      lines.push(
        `G1 X${f3(loop.leadIn.end.x)} Y${f3(loop.leadIn.end.y)} F${config.cutFeedRate} (Lead-in tangencial)`
      );
    }

    // 4. Cortar todos los segmentos del contorno de la figura
    loop.segments.forEach(seg => {
      lines.push(
        `G1 X${f3(seg.end.x)} Y${f3(seg.end.y)} F${config.cutFeedRate}`
      );
    });

    // 5. Cortar segmento de Lead-Out si existe
    if (loop.leadOut) {
      lines.push(
        `G1 X${f3(loop.leadOut.end.x)} Y${f3(loop.leadOut.end.y)} F${config.cutFeedRate} (Lead-out de salida)`
      );
    }

    // 6. Apagar Antorcha
    lines.push(
      `${torchOffCmd} (Apagar arco de plasma)`
    );

    // 7. En modo estándar, subir inmediatamente a altura segura
    if (!isQtPlasmaC) {
      lines.push(
        `G0 Z${f3(config.safeZ)} (Retirar antorcha a altura segura)`
      );
    }
  });

  // Bloque final de cierre de programa
  lines.push(
    ``,
    `( ============================================================ )`,
    `( FIN DEL PROGRAMA Y RETORNO SEGURO                           )`,
    `( ============================================================ )`
  );

  // Restablecer ángulo de rotación si se usó G10
  if (hasG10) {
    lines.push(
      `G10 L2 P1 R0 (Restablecer rotación de coordenadas a 0 grados)`
    );
  }

  lines.push(
    `G0 X0.000 Y0.000 (Regreso al origen de la pieza)`,
    `M2 (Fin de programa estándar LinuxCNC)`,
    `%`
  );

  return lines.join('\n');
}

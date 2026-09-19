import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ToolpathData, Point2D } from '../types';
import { Play, Pause, RotateCcw, ZoomIn, ZoomOut, Maximize2, Flame } from 'lucide-react';

interface CanvasVisualizerProps {
  toolpath: ToolpathData;
  unit: 'mm' | 'inch';
  cutFeedRate: number;
}

export const CanvasVisualizer: React.FC<CanvasVisualizerProps> = ({
  toolpath,
  unit,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Viewport transform
  const [scale, setScale] = useState<number>(2.5);
  const [offset, setOffset] = useState<Point2D>({ x: 60, y: 60 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<Point2D>({ x: 0, y: 0 });
  const [mouseCoord, setMouseCoord] = useState<Point2D>({ x: 0, y: 0 });

  // Simulation state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0); // 0 to 1
  const [simSpeed, setSimSpeed] = useState<number>(2); // 1x, 2x, 5x, 10x

  // Compute all linear segments in toolpath sequence for animation
  const flatAnimationSteps = React.useMemo(() => {
    const steps: {
      type: 'rapid' | 'cut' | 'lead_in' | 'lead_out' | 'pierce';
      start: Point2D;
      end: Point2D;
      durationWeight: number;
    }[] = [];

    let currentPos: Point2D = { x: 0, y: 0 };

    toolpath.loops.forEach(loop => {
      // 1. Rapid to pierce point
      steps.push({
        type: 'rapid',
        start: currentPos,
        end: loop.piercePoint,
        durationWeight: 0.5
      });
      currentPos = loop.piercePoint;

      // 2. Pierce dwell
      steps.push({
        type: 'pierce',
        start: currentPos,
        end: currentPos,
        durationWeight: 0.8
      });

      // 3. Lead-in if exists
      if (loop.leadIn) {
        steps.push({
          type: 'lead_in',
          start: loop.leadIn.start,
          end: loop.leadIn.end,
          durationWeight: 0.4
        });
        currentPos = loop.leadIn.end;
      }

      // 4. Contour cuts
      loop.segments.forEach(seg => {
        steps.push({
          type: 'cut',
          start: seg.start,
          end: seg.end,
          durationWeight: 1.0
        });
        currentPos = seg.end;
      });

      // 5. Lead-out if exists
      if (loop.leadOut) {
        steps.push({
          type: 'lead_out',
          start: loop.leadOut.start,
          end: loop.leadOut.end,
          durationWeight: 0.4
        });
        currentPos = loop.leadOut.end;
      }
    });

    // Rapid return to origin
    steps.push({
      type: 'rapid',
      start: currentPos,
      end: { x: 0, y: 0 },
      durationWeight: 0.6
    });

    return steps;
  }, [toolpath]);

  // Fit to screen handler
  const handleFitToScreen = useCallback(() => {
    if (!containerRef.current) return;
    const { clientWidth, clientHeight } = containerRef.current;
    const { width, height } = toolpath.bounds;

    const padding = 80;
    const w = Math.max(20, width);
    const h = Math.max(20, height);

    const scaleX = (clientWidth - padding * 2) / w;
    const scaleY = (clientHeight - padding * 2) / h;
    const newScale = Math.min(scaleX, scaleY, 8);
    const clampedScale = Math.max(0.5, Math.min(newScale, 15));

    setScale(clampedScale);
    // Center bounding box
    const centerX = (clientWidth - w * clampedScale) / 2 - toolpath.bounds.minX * clampedScale;
    const centerY = (clientHeight + h * clampedScale) / 2 + toolpath.bounds.minY * clampedScale;
    setOffset({ x: centerX, y: centerY });
  }, [toolpath.bounds]);

  // Initial fit on toolpath change
  useEffect(() => {
    handleFitToScreen();
    setProgress(0);
    setIsPlaying(false);
  }, [toolpath, handleFitToScreen]);

  // Animation frame loop
  useEffect(() => {
    if (!isPlaying) return;

    let animId: number;
    let lastTime = performance.now();

    const animate = (time: number) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      setProgress(prev => {
        const next = prev + (dt * 0.05 * simSpeed);
        if (next >= 1) {
          setIsPlaying(false);
          return 1;
        }
        return next;
      });

      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, simSpeed]);

  // Render canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !containerRef.current) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Dark high-precision CAD workspace background
    ctx.fillStyle = '#0f172a'; // slate-900
    ctx.fillRect(0, 0, width, height);

    // World coordinate helpers (Y up, standard CNC Cartesian)
    const toScreenX = (wx: number) => offset.x + wx * scale;
    const toScreenY = (wy: number) => offset.y - wy * scale;

    // Draw Grid
    const gridSpacing = unit === 'inch' ? 1 : 10; // 10mm or 1 in
    const majorGridSpacing = gridSpacing * 5;

    ctx.lineWidth = 1;

    // Visible world bounds
    const worldLeft = (0 - offset.x) / scale;
    const worldRight = (width - offset.x) / scale;
    const worldBottom = (offset.y - height) / scale;
    const worldTop = offset.y / scale;

    const startGridX = Math.floor(worldLeft / gridSpacing) * gridSpacing;
    const endGridX = Math.ceil(worldRight / gridSpacing) * gridSpacing;
    const startGridY = Math.floor(worldBottom / gridSpacing) * gridSpacing;
    const endGridY = Math.ceil(worldTop / gridSpacing) * gridSpacing;

    // Minor grid lines
    ctx.strokeStyle = '#1e293b'; // slate-800
    ctx.beginPath();
    for (let x = startGridX; x <= endGridX; x += gridSpacing) {
      ctx.moveTo(toScreenX(x), 0);
      ctx.lineTo(toScreenX(x), height);
    }
    for (let y = startGridY; y <= endGridY; y += gridSpacing) {
      ctx.moveTo(0, toScreenY(y));
      ctx.lineTo(width, toScreenY(y));
    }
    ctx.stroke();

    // Major grid lines
    ctx.strokeStyle = '#334155'; // slate-700
    ctx.beginPath();
    for (let x = Math.floor(worldLeft / majorGridSpacing) * majorGridSpacing; x <= endGridX; x += majorGridSpacing) {
      ctx.moveTo(toScreenX(x), 0);
      ctx.lineTo(toScreenX(x), height);
    }
    for (let y = Math.floor(worldBottom / majorGridSpacing) * majorGridSpacing; y <= endGridY; y += majorGridSpacing) {
      ctx.moveTo(0, toScreenY(y));
      ctx.lineTo(width, toScreenY(y));
    }
    ctx.stroke();

    // Coordinate Origin Axes (0,0)
    // X Axis (Red)
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(toScreenX(0), toScreenY(0));
    ctx.lineTo(toScreenX(50), toScreenY(0));
    ctx.stroke();

    // Y Axis (Green)
    ctx.strokeStyle = '#10b981';
    ctx.beginPath();
    ctx.moveTo(toScreenX(0), toScreenY(0));
    ctx.lineTo(toScreenX(0), toScreenY(50));
    ctx.stroke();

    // Origin Marker (0,0)
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(toScreenX(0), toScreenY(0), 4, 0, Math.PI * 2);
    ctx.fill();

    // Axis labels
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px monospace';
    ctx.fillText('X (0,0)', toScreenX(8), toScreenY(-12));

    // Draw Toolpath Bounding Box
    if (toolpath.bounds.width > 0) {
      ctx.strokeStyle = '#475569';
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1;
      const bMinX = toScreenX(toolpath.bounds.minX);
      const bMaxY = toScreenY(toolpath.bounds.maxY);
      const bWidth = toolpath.bounds.width * scale;
      const bHeight = toolpath.bounds.height * scale;
      ctx.strokeRect(bMinX, bMaxY, bWidth, bHeight);
      ctx.setLineDash([]);
    }

    // Draw Static Toolpaths:
    // 1. Rapid moves (Dashed cyan)
    ctx.strokeStyle = '#38bdf8';
    ctx.setLineDash([5, 5]);
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    let currentPt: Point2D = { x: 0, y: 0 };
    toolpath.loops.forEach(loop => {
      ctx.moveTo(toScreenX(currentPt.x), toScreenY(currentPt.y));
      ctx.lineTo(toScreenX(loop.piercePoint.x), toScreenY(loop.piercePoint.y));
      currentPt = loop.leadOut ? loop.leadOut.end : loop.startPoint;
    });
    // Return to origin
    ctx.moveTo(toScreenX(currentPt.x), toScreenY(currentPt.y));
    ctx.lineTo(toScreenX(0), toScreenY(0));
    ctx.stroke();
    ctx.setLineDash([]);

    // 2. Cut toolpaths (Vibrant plasma orange / yellow)
    toolpath.loops.forEach(loop => {
      // Lead-in (Purple/Magenta)
      if (loop.leadIn) {
        ctx.strokeStyle = '#ec4899';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(toScreenX(loop.leadIn.start.x), toScreenY(loop.leadIn.start.y));
        ctx.lineTo(toScreenX(loop.leadIn.end.x), toScreenY(loop.leadIn.end.y));
        ctx.stroke();
      }

      // Contour segments
      ctx.strokeStyle = '#f97316'; // Orange flame
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      loop.segments.forEach((seg, sIdx) => {
        if (sIdx === 0) {
          ctx.moveTo(toScreenX(seg.start.x), toScreenY(seg.start.y));
        }
        ctx.lineTo(toScreenX(seg.end.x), toScreenY(seg.end.y));
      });
      ctx.stroke();

      // Lead-out (Magenta)
      if (loop.leadOut) {
        ctx.strokeStyle = '#ec4899';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(toScreenX(loop.leadOut.start.x), toScreenY(loop.leadOut.start.y));
        ctx.lineTo(toScreenX(loop.leadOut.end.x), toScreenY(loop.leadOut.end.y));
        ctx.stroke();
      }

      // Pierce Points (Red flame target dot)
      const px = toScreenX(loop.piercePoint.x);
      const py = toScreenY(loop.piercePoint.y);
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(px, py, 4.5, 0, Math.PI * 2);
      ctx.fill();

      // Target ring
      ctx.strokeStyle = '#fca5a5';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(px, py, 7, 0, Math.PI * 2);
      ctx.stroke();
    });

    // 3. Draw Animated Simulation Torch Head & Cut Progress
    if (flatAnimationSteps.length > 0) {
      const totalSteps = flatAnimationSteps.length;
      const currentStepIndex = Math.min(totalSteps - 1, Math.floor(progress * totalSteps));
      const stepFraction = (progress * totalSteps) - currentStepIndex;

      const activeStep = flatAnimationSteps[currentStepIndex];
      let torchX = activeStep.start.x + (activeStep.end.x - activeStep.start.x) * stepFraction;
      let torchY = activeStep.start.y + (activeStep.end.y - activeStep.start.y) * stepFraction;

      const tScrX = toScreenX(torchX);
      const tScrY = toScreenY(torchY);

      // Draw Torch Head Crosshair & Plasma Glow
      if (activeStep.type !== 'rapid') {
        // Plasma arc active!
        const grad = ctx.createRadialGradient(tScrX, tScrY, 2, tScrX, tScrY, 22);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.2, '#38bdf8');
        grad.addColorStop(0.6, 'rgba(249, 115, 22, 0.6)');
        grad.addColorStop(1, 'rgba(249, 115, 22, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(tScrX, tScrY, 22, 0, Math.PI * 2);
        ctx.fill();
      }

      // Cutting Head Nozzle
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.arc(tScrX, tScrY, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = activeStep.type === 'rapid' ? '#38bdf8' : '#ef4444';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(tScrX, tScrY, 9, 0, Math.PI * 2);
      ctx.stroke();
    }
  }, [toolpath, scale, offset, progress, flatAnimationSteps, unit]);

  // Mouse pan & zoom handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) { // Left click to drag
      setIsDragging(true);
      setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    // Convert mouse to world coords
    const wx = (mx - offset.x) / scale;
    const wy = (offset.y - my) / scale;
    setMouseCoord({ x: wx, y: wy });

    if (isDragging) {
      setOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.85;
    const newScale = Math.max(0.2, Math.min(scale * zoomFactor, 30));

    // Zoom centered around mouse cursor
    const newOffsetX = mx - (mx - offset.x) * (newScale / scale);
    const newOffsetY = my - (my - offset.y) * (newScale / scale);

    setScale(newScale);
    setOffset({ x: newOffsetX, y: newOffsetY });
  };

  return (
    <div
      id="canvas-visualizer-container"
      ref={containerRef}
      className="relative w-full h-[460px] lg:h-[540px] rounded-xl overflow-hidden bg-slate-900 border border-slate-800 select-none shadow-inner flex flex-col justify-between"
    >
      <canvas
        id="cnc-toolpath-canvas"
        ref={canvasRef}
        className="absolute inset-0 w-full h-full cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      />

      {/* Top HUD Overlay: Coordinate readout & Legend */}
      <div
        id="canvas-top-hud"
        className="relative z-10 p-3 flex flex-wrap items-center justify-between pointer-events-none gap-2"
      >
        <div className="flex items-center gap-2 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/50 text-xs font-mono text-slate-300">
          <span className="text-amber-400 font-semibold">X: {mouseCoord.x.toFixed(2)} {unit}</span>
          <span className="text-emerald-400 font-semibold">Y: {mouseCoord.y.toFixed(2)} {unit}</span>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/50 text-xs text-slate-300">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-sm" />
            <span>Corte</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-pink-500" />
            <span>Lead-in</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span>Perforación</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-0.5 bg-sky-400" />
            <span>G0 Rápido</span>
          </div>
        </div>
      </div>

      {/* Viewport Zoom & Pan Floating Controls */}
      <div
        id="viewport-controls"
        className="absolute right-3 top-16 z-10 flex flex-col gap-1.5 bg-slate-950/80 backdrop-blur-md p-1.5 rounded-lg border border-slate-700/50 shadow-md"
      >
        <button
          id="btn-zoom-in"
          type="button"
          onClick={() => setScale(s => Math.min(s * 1.25, 30))}
          className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
          title="Acercar (Zoom In)"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          id="btn-zoom-out"
          type="button"
          onClick={() => setScale(s => Math.max(s * 0.8, 0.2))}
          className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
          title="Alejar (Zoom Out)"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          id="btn-fit-screen"
          type="button"
          onClick={handleFitToScreen}
          className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
          title="Ajustar a pantalla"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Bottom HUD: CNC Simulation Playback Toolbar */}
      <div
        id="simulation-toolbar"
        className="relative z-10 p-3 bg-slate-950/85 backdrop-blur-md border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs"
      >
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            id="btn-play-pause-simulation"
            type="button"
            onClick={() => {
              if (progress >= 1) setProgress(0);
              setIsPlaying(!isPlaying);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-medium transition-colors shadow-sm"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlaying ? 'Pausar' : progress >= 1 ? 'Reiniciar' : 'Simular'}</span>
          </button>

          <button
            id="btn-reset-simulation"
            type="button"
            onClick={() => {
              setIsPlaying(false);
              setProgress(0);
            }}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors border border-slate-700/50"
            title="Rebobinar simulación"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Speed Selector */}
          <div className="flex items-center border border-slate-700/50 rounded-lg overflow-hidden bg-slate-900">
            {[1, 2, 5, 10].map(sp => (
              <button
                key={sp}
                id={`speed-btn-${sp}x`}
                type="button"
                onClick={() => setSimSpeed(sp)}
                className={`px-2 py-1 text-xs transition-colors ${
                  simSpeed === sp ? 'bg-slate-700 text-amber-400 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {sp}x
              </button>
            ))}
          </div>
        </div>

        {/* Timeline Scrubber */}
        <div className="flex items-center gap-3 w-full sm:max-w-md">
          <Flame className={`w-4 h-4 ${isPlaying ? 'text-orange-500 animate-pulse' : 'text-slate-500'}`} />
          <input
            id="simulation-timeline-slider"
            type="range"
            min="0"
            max="1"
            step="0.002"
            value={progress}
            onChange={e => {
              setProgress(parseFloat(e.target.value));
              if (isPlaying) setIsPlaying(false);
            }}
            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
          />
          <span className="font-mono text-slate-400 text-xs w-10 text-right">
            {Math.round(progress * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
};

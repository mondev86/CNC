import React, { useState } from 'react';
import { ToolpathData } from '../types';
import { Download, Copy, Check, FileCode, Clock, Scissors, Target, Maximize } from 'lucide-react';

interface GCodeViewerProps {
  toolpath: ToolpathData;
  unit: 'mm' | 'inch';
  fileName?: string;
}

export const GCodeViewer: React.FC<GCodeViewerProps> = ({
  toolpath,
  unit,
  fileName = 'corte_plasma.ngc'
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(toolpath.gcode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadNgc = () => {
    const blob = new Blob([toolpath.gcode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName.endsWith('.ngc') ? fileName : `${fileName}.ngc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const gcodeLines = toolpath.gcode.split('\n');
  const minutes = Math.floor(toolpath.estimatedTimeSeconds / 60);
  const seconds = toolpath.estimatedTimeSeconds % 60;

  return (
    <div id="gcode-viewer-container" className="flex flex-col h-full bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs">
      {/* Quick Statistics Strip */}
      <div id="gcode-stats-strip" className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-stone-50 border-b border-stone-200 text-xs">
        <div id="stat-dimensions" className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-stone-200/70 text-stone-700">
            <Maximize className="w-4 h-4" />
          </div>
          <div>
            <div className="text-stone-500 font-medium">Dimensiones</div>
            <div className="font-semibold text-stone-900 font-mono">
              {toolpath.bounds.width.toFixed(1)} × {toolpath.bounds.height.toFixed(1)} {unit}
            </div>
          </div>
        </div>

        <div id="stat-cut-length" className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-orange-100 text-orange-700">
            <Scissors className="w-4 h-4" />
          </div>
          <div>
            <div className="text-stone-500 font-medium">Longitud de Corte</div>
            <div className="font-semibold text-stone-900 font-mono">
              {toolpath.totalCutLength.toFixed(1)} {unit}
            </div>
          </div>
        </div>

        <div id="stat-pierces" className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-red-100 text-red-700">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <div className="text-stone-500 font-medium">Perforaciones</div>
            <div className="font-semibold text-stone-900 font-mono">
              {toolpath.pierceCount} pierces
            </div>
          </div>
        </div>

        <div id="stat-time" className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-amber-100 text-amber-700">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="text-stone-500 font-medium">Tiempo Estimado</div>
            <div className="font-semibold text-stone-900 font-mono">
              ~{minutes}m {seconds}s
            </div>
          </div>
        </div>
      </div>

      {/* Code Header & Action Buttons */}
      <div id="gcode-actions-bar" className="flex items-center justify-between px-4 py-3 border-b border-stone-200 bg-white">
        <div className="flex items-center gap-2">
          <FileCode className="w-4 h-4 text-stone-600" />
          <span className="font-medium text-sm text-stone-800 font-mono">{fileName}</span>
          <span className="text-xs text-stone-500">({gcodeLines.length} líneas)</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-copy-gcode"
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-300 hover:bg-stone-50 text-xs font-medium text-stone-700 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copiado' : 'Copiar'}</span>
          </button>

          <button
            id="btn-download-ngc"
            type="button"
            onClick={handleDownloadNgc}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-xs font-medium text-white transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Descargar .NGC</span>
          </button>
        </div>
      </div>

      {/* G-Code Monospace Scrollable Area */}
      <div id="gcode-editor-area" className="flex-1 max-h-[380px] lg:max-h-[460px] overflow-y-auto bg-stone-950 text-stone-200 font-mono text-xs p-3 select-text">
        <div className="space-y-0.5">
          {gcodeLines.map((line, idx) => {
            const isComment = line.trim().startsWith('(') || line.trim().startsWith(';');
            const isMCode = /M\d+/i.test(line);
            const isGCode = /G[0-3]\b/i.test(line);
            const isG0 = /G0\b/i.test(line);

            return (
              <div key={idx} className="flex leading-5 hover:bg-stone-900/60 px-1 rounded-xs">
                <span className="w-10 text-stone-600 select-none text-right pr-3 shrink-0">
                  {idx + 1}
                </span>
                <span
                  className={
                    isComment
                      ? 'text-stone-500 italic'
                      : isMCode
                      ? 'text-red-400 font-semibold'
                      : isG0
                      ? 'text-sky-400'
                      : isGCode
                      ? 'text-amber-300'
                      : 'text-stone-200'
                  }
                >
                  {line}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

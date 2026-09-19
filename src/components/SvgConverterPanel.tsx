import React, { useState } from 'react';
import { SAMPLE_SVGS } from '../utils/sampleSvgs';
import { Upload, FileCode, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';

interface SvgConverterPanelProps {
  svgContent: string;
  onSvgChange: (content: string, fileName?: string) => void;
  targetWidth: number;
  onTargetWidthChange: (val: number) => void;
  targetHeight: number;
  onTargetHeightChange: (val: number) => void;
  lockAspectRatio: boolean;
  onLockAspectRatioChange: (val: boolean) => void;
  unit: 'mm' | 'inch';
  detectedPathsCount: number;
}

export const SvgConverterPanel: React.FC<SvgConverterPanelProps> = ({
  svgContent,
  onSvgChange,
  targetWidth,
  onTargetWidthChange,
  targetHeight,
  onTargetHeightChange,
  lockAspectRatio,
  onLockAspectRatioChange,
  unit,
  detectedPathsCount
}) => {
  const [dragOver, setDragOver] = useState<boolean>(false);
  const [pastedCode, setPastedCode] = useState<string>('');
  const [showPasteBox, setShowPasteBox] = useState<boolean>(false);

  const handleFileUpload = (file: File) => {
    if (!file.name.toLowerCase().endsWith('.svg')) {
      alert('Por favor selecciona un archivo con extensión .svg');
      return;
    }
    const reader = new FileReader();
    reader.onload = e => {
      const text = e.target?.result as string;
      if (text) {
        onSvgChange(text, file.name);
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handlePasteSubmit = () => {
    if (pastedCode.trim()) {
      onSvgChange(pastedCode.trim(), 'pegado_manual.svg');
      setShowPasteBox(false);
      setPastedCode('');
    }
  };

  return (
    <div id="svg-converter-panel" className="bg-white rounded-xl border border-stone-200 p-5 space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-stone-200">
        <div className="flex items-center gap-2">
          <FileCode className="w-4 h-4 text-orange-600" />
          <h2 className="text-sm font-semibold text-stone-900">Conversor SVG a NGC (LinuxCNC)</h2>
        </div>
        <span className="text-[11px] text-stone-500 font-medium">Vectores a Código G</span>
      </div>

      {/* Drag and Drop Zone */}
      <div
        id="svg-dropzone"
        onDragOver={e => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all ${
          dragOver
            ? 'border-orange-500 bg-orange-50/60'
            : 'border-stone-300 hover:border-stone-400 bg-stone-50/50'
        }`}
      >
        <input
          id="svg-file-input"
          type="file"
          accept=".svg,image/svg+xml"
          onChange={e => {
            if (e.target.files && e.target.files[0]) {
              handleFileUpload(e.target.files[0]);
            }
          }}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div className="flex flex-col items-center pointer-events-none">
          <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-600 mb-2">
            <Upload className="w-5 h-5" />
          </div>
          <p className="text-xs font-semibold text-stone-900 mb-0.5">
            Arrastra tu archivo SVG aquí o haz clic para seleccionarlo
          </p>
          <p className="text-[11px] text-stone-500">
            Compatible con Inkscape, Fusion 360, AutoCAD, Illustrator y QCAD
          </p>
        </div>
      </div>

      {/* Preset SVGs */}
      <div>
        <div className="text-xs font-medium text-stone-700 mb-2 flex items-center justify-between">
          <span>O prueba una pieza predefinida para plasma:</span>
          <button
            type="button"
            onClick={() => setShowPasteBox(!showPasteBox)}
            className="text-orange-600 hover:text-orange-700 text-[11px] font-medium underline cursor-pointer"
          >
            {showPasteBox ? 'Ocultar editor de código' : 'Pegar código SVG directamente'}
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {SAMPLE_SVGS.map(sample => (
            <button
              key={sample.id}
              type="button"
              onClick={() => onSvgChange(sample.svg, `${sample.id}.svg`)}
              className="p-2 text-left rounded-lg border border-stone-200 hover:border-stone-300 bg-stone-50 hover:bg-white text-xs transition-colors"
            >
              <div className="font-medium text-stone-800 truncate">{sample.name}</div>
              <div className="text-[10px] text-stone-500">{sample.category}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Raw SVG Paste box */}
      {showPasteBox && (
        <div className="p-3 bg-stone-50 border border-stone-200 rounded-lg space-y-2">
          <label className="block text-xs font-medium text-stone-700">
            Pega aquí el código XML del SVG:
          </label>
          <textarea
            value={pastedCode}
            onChange={e => setPastedCode(e.target.value)}
            rows={4}
            className="w-full px-3 py-1.5 bg-white border border-stone-200 rounded-lg font-mono text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-orange-500"
            placeholder="<svg ...> ... </svg>"
          />
          <button
            type="button"
            onClick={handlePasteSubmit}
            className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-medium transition-colors"
          >
            Cargar SVG Pegado
          </button>
        </div>
      )}

      {/* Conversion Status */}
      <div className="p-3 rounded-lg bg-stone-50 border border-stone-200 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-stone-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>
            <strong>{detectedPathsCount}</strong> contornos/trayectorias vectoriales detectadas
          </span>
        </div>
        <span className="text-stone-500 text-[11px]">
          Eje Y invertido automáticamente a estándar CNC (Y positivo hacia arriba)
        </span>
      </div>
    </div>
  );
};

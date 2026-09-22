import React, { useState } from 'react';
import { WorkpieceConfig, SheetPreset, STANDARD_SHEET_PRESETS, ToolpathData } from '../types';
import { AutoFitTextResult, AutoFitSvgResult } from '../utils/workpieceCalculator';
import { TableAlignmentModal } from './TableAlignmentModal';
import {
  LayoutGrid,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Sliders,
  Split,
  Eye,
  EyeOff,
  RotateCw,
  RotateCcw,
  Compass,
  HelpCircle
} from 'lucide-react';

interface WorkpieceBarProps {
  workpiece: WorkpieceConfig;
  onWorkpieceChange: (cfg: WorkpieceConfig) => void;
  toolpath: ToolpathData;
  activeTab: 'text' | 'svg';
  text: string;
  onTextChange: (txt: string) => void;
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  autoFitTextResult?: AutoFitTextResult;
  autoFitSvgResult?: AutoFitSvgResult;
  onApplySvgAutoFit?: () => void;
  unit: 'mm' | 'inch';
}

export const WorkpieceBar: React.FC<WorkpieceBarProps> = ({
  workpiece,
  onWorkpieceChange,
  toolpath,
  activeTab,
  text,
  onTextChange,
  fontSize,
  onFontSizeChange,
  autoFitTextResult,
  autoFitSvgResult,
  onApplySvgAutoFit,
  unit
}) => {
  const [showCustomModal, setShowCustomModal] = useState<boolean>(false);
  const [showAlignmentHelp, setShowAlignmentHelp] = useState<boolean>(false);

  const bounds = toolpath?.bounds || { width: 0, height: 0, maxX: 0, maxY: 0, minX: 0, minY: 0 };
  const cutWidth = Math.round(bounds.width);
  const cutHeight = Math.round(bounds.height);

  const usableWidth = workpiece.width - workpiece.margin * 2;
  const usableHeight = workpiece.height - workpiece.margin * 2;

  const exceedsWidth = cutWidth > usableWidth;
  const exceedsHeight = cutHeight > usableHeight;
  const exceedsPizarra = exceedsWidth || exceedsHeight;

  const currentAngle = workpiece.rotationAngle || 0;

  const currentPreset = STANDARD_SHEET_PRESETS.find(
    p => p.width === workpiece.width && p.height === workpiece.height
  );

  const handleSelectPreset = (preset: SheetPreset) => {
    onWorkpieceChange({
      ...workpiece,
      width: preset.width,
      height: preset.height
    });
  };

  const handleSetAngle = (deg: number) => {
    // Normalize to -180 to 180
    let norm = deg % 360;
    if (norm > 180) norm -= 360;
    if (norm < -180) norm += 360;
    onWorkpieceChange({
      ...workpiece,
      rotationAngle: norm
    });
  };

  const handleAutoFitTextSingle = () => {
    if (autoFitTextResult) {
      onFontSizeChange(autoFitTextResult.recommendedFontSize);
    }
  };

  const handleAutoFitTextSplit = () => {
    if (autoFitTextResult?.splitTextRecommendation && autoFitTextResult.splitFontSizeRecommendation) {
      onTextChange(autoFitTextResult.splitTextRecommendation);
      onFontSizeChange(autoFitTextResult.splitFontSizeRecommendation);
    }
  };

  return (
    <>
      <div
        id="workpiece-calculator-bar"
        className={`rounded-xl border p-4 transition-all space-y-3.5 ${
          exceedsPizarra
            ? 'bg-amber-50/80 border-amber-300 shadow-xs'
            : 'bg-white border-stone-200 shadow-xs'
        }`}
      >
        {/* Row 1: Title, current plate, standards and sheet presets */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-200">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg ${exceedsPizarra ? 'bg-amber-100 text-amber-800' : 'bg-stone-100 text-stone-700'}`}>
              <LayoutGrid className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-xs text-stone-900">
                  Pizarra / Chapa de Trabajo
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full font-mono font-medium bg-stone-100 text-stone-700 border border-stone-200">
                  {workpiece.width} × {workpiece.height} {unit}
                </span>
                {currentPreset && (
                  <span className="text-[10px] text-stone-500 hidden sm:inline">
                    ({currentPreset.description})
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Sheet Presets */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-stone-500 font-medium mr-1">Estándares:</span>
            {STANDARD_SHEET_PRESETS.slice(0, 4).map(preset => {
              const isSelected = workpiece.width === preset.width && workpiece.height === preset.height;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className={`px-2 py-1 rounded-md text-[11px] font-mono font-medium transition-colors ${
                    isSelected
                      ? 'bg-orange-600 text-white shadow-xs'
                      : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                  }`}
                  title={preset.description}
                >
                  {preset.name}
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => setShowCustomModal(!showCustomModal)}
              className="px-2 py-1 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-700 text-[11px] font-medium flex items-center gap-1 cursor-pointer"
              title="Medidas personalizadas de chapa o más formatos"
            >
              <Sliders className="w-3 h-3" />
              <span>Opciones</span>
            </button>

            <button
              type="button"
              onClick={() => onWorkpieceChange({ ...workpiece, enabled: !workpiece.enabled })}
              className={`p-1 rounded-md border text-[11px] transition-colors cursor-pointer ${
                workpiece.enabled
                  ? 'border-stone-300 text-stone-700 hover:bg-stone-100'
                  : 'border-stone-200 text-stone-400 hover:bg-stone-50'
              }`}
              title={workpiece.enabled ? 'Ocultar pizarra en el visualizador' : 'Mostrar pizarra en el visualizador'}
            >
              {workpiece.enabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Row 2: Angle & Orientation Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-0.5">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-800">
              <Compass className="w-4 h-4 text-orange-600 shrink-0" />
              <span>Ángulo de Corte / Mesa:</span>
            </div>

            {/* Quick Angle presets */}
            <div className="flex items-center gap-1">
              {[
                { label: '0°', deg: 0, title: 'Horizontal estándar' },
                { label: '45°', deg: 45, title: 'Diagonal 45°' },
                { label: '90°', deg: 90, title: 'Vertical 90° (Ideal para ahorrar ancho)' },
                { label: '-45°', deg: -45, title: 'Diagonal invertida -45°' },
                { label: '180°', deg: 180, title: 'Invertido 180°' },
              ].map(item => (
                <button
                  key={item.deg}
                  type="button"
                  onClick={() => handleSetAngle(item.deg)}
                  className={`px-2 py-1 rounded text-[11px] font-mono font-medium transition-colors cursor-pointer ${
                    currentAngle === item.deg
                      ? 'bg-orange-600 text-white font-bold shadow-xs'
                      : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                  }`}
                  title={item.title}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Fine step rotate buttons */}
            <div className="flex items-center gap-1 border-l border-stone-200 pl-1.5 ml-0.5">
              <button
                type="button"
                onClick={() => handleSetAngle(currentAngle - 15)}
                className="p-1 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 text-[11px] font-mono flex items-center gap-0.5 cursor-pointer"
                title="Girar 15 grados antihorario"
              >
                <RotateCcw className="w-3 h-3" />
                <span>-15°</span>
              </button>
              <button
                type="button"
                onClick={() => handleSetAngle(currentAngle + 15)}
                className="p-1 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 text-[11px] font-mono flex items-center gap-0.5 cursor-pointer"
                title="Girar 15 grados horario"
              >
                <RotateCw className="w-3 h-3" />
                <span>+15°</span>
              </button>
            </div>

            {/* Angle Slider & Number Input */}
            <div className="flex items-center gap-1.5 bg-stone-100/90 px-2 py-1 rounded-lg border border-stone-200">
              <input
                type="range"
                min="-180"
                max="180"
                step="1"
                value={currentAngle}
                onChange={e => handleSetAngle(parseInt(e.target.value, 10) || 0)}
                className="w-20 accent-orange-600 h-1.5 cursor-pointer"
                title="Ajuste fino de rotación (-180° a +180°)"
              />
              <div className="flex items-center">
                <input
                  type="number"
                  min="-180"
                  max="180"
                  value={currentAngle}
                  onChange={e => handleSetAngle(parseInt(e.target.value, 10) || 0)}
                  className="w-12 text-center text-xs font-mono font-bold bg-white border border-stone-300 rounded px-1 py-0.5"
                />
                <span className="text-xs font-semibold text-stone-600 ml-0.5">°</span>
              </div>
            </div>
          </div>

          {/* Guide Modal Trigger */}
          <button
            type="button"
            onClick={() => setShowAlignmentHelp(true)}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-orange-700 hover:text-orange-900 bg-orange-50 hover:bg-orange-100 px-2.5 py-1 rounded-lg border border-orange-200 transition-colors cursor-pointer shrink-0"
            title="Aprende cómo alinear en la mesa física con LinuxCNC o en el código"
          >
            <HelpCircle className="w-3.5 h-3.5 text-orange-600" />
            <span>¿Cómo ubicarse en la mesa?</span>
          </button>
        </div>

        {/* Custom Workpiece Dimensions & Positioning Dropdown */}
        {showCustomModal && (
          <div className="p-3 bg-stone-50 rounded-lg border border-stone-200 space-y-3 text-xs">
            <div className="font-semibold text-stone-800 text-[11px]">
              Formatos Estándar y Medidas de Chapa:
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {STANDARD_SHEET_PRESETS.map(preset => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className={`p-2 rounded-lg border text-left transition-colors ${
                    workpiece.width === preset.width && workpiece.height === preset.height
                      ? 'border-orange-500 bg-orange-50/60 font-semibold text-orange-900'
                      : 'border-stone-200 bg-white hover:border-stone-300 text-stone-700'
                  }`}
                >
                  <div className="text-[11px] font-mono">{preset.name}</div>
                  <div className="text-[10px] text-stone-500 leading-tight mt-0.5">{preset.description}</div>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 border-t border-stone-200">
              <div>
                <label className="block text-stone-600 text-[11px] mb-1">Ancho Chapa (X en {unit}):</label>
                <input
                  type="number"
                  value={workpiece.width}
                  onChange={e => onWorkpieceChange({ ...workpiece, width: Math.max(50, parseInt(e.target.value, 10) || 100) })}
                  className="w-full px-2.5 py-1 bg-white border border-stone-300 rounded font-mono text-xs"
                />
              </div>
              <div>
                <label className="block text-stone-600 text-[11px] mb-1">Alto Chapa (Y en {unit}):</label>
                <input
                  type="number"
                  value={workpiece.height}
                  onChange={e => onWorkpieceChange({ ...workpiece, height: Math.max(50, parseInt(e.target.value, 10) || 100) })}
                  className="w-full px-2.5 py-1 bg-white border border-stone-300 rounded font-mono text-xs"
                />
              </div>
              <div>
                <label className="block text-stone-600 text-[11px] mb-1">Margen Seguridad ({unit}):</label>
                <input
                  type="number"
                  value={workpiece.margin}
                  onChange={e => onWorkpieceChange({ ...workpiece, margin: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                  className="w-full px-2.5 py-1 bg-white border border-stone-300 rounded font-mono text-xs"
                />
              </div>
              <div>
                <label className="block text-stone-600 text-[11px] mb-1">Posición en Chapa:</label>
                <select
                  value={workpiece.positionMode}
                  onChange={e => onWorkpieceChange({ ...workpiece, positionMode: e.target.value as any })}
                  className="w-full px-2 py-1 bg-white border border-stone-300 rounded text-xs"
                >
                  <option value="origin_with_margin">Con margen (X:{workpiece.margin} Y:{workpiece.margin})</option>
                  <option value="center">Centrado en Chapa</option>
                  <option value="absolute_zero">Origen Cero Directo (0,0)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-stone-200">
              <div>
                <label className="block text-stone-600 text-[11px] mb-1">Pivote de Rotación:</label>
                <select
                  value={workpiece.rotationPivot || 'center'}
                  onChange={e => onWorkpieceChange({ ...workpiece, rotationPivot: e.target.value as any })}
                  className="w-full px-2 py-1 bg-white border border-stone-300 rounded text-xs"
                >
                  <option value="center">Centro de la figura (Recomendado)</option>
                  <option value="origin">Origen de coordenadas (0,0)</option>
                </select>
              </div>
              <div className="flex items-center gap-2 pt-4">
                <input
                  type="checkbox"
                  id="chk-g10"
                  checked={Boolean(workpiece.useG10Rotation)}
                  onChange={e => onWorkpieceChange({ ...workpiece, useG10Rotation: e.target.checked })}
                  className="w-4 h-4 accent-orange-600 rounded"
                />
                <label htmlFor="chk-g10" className="text-[11px] text-stone-700 cursor-pointer">
                  Insertar comando <code className="font-mono bg-stone-200 px-1 rounded">G10 L2 P1 R...</code> en G-Code
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Row 3: Status Comparison & Action Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1 border-t border-stone-200">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              {exceedsPizarra ? (
                <span className="inline-flex items-center gap-1 font-semibold text-amber-800 bg-amber-100/90 px-2 py-0.5 rounded text-[11px]">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                  <span>NO ALCANZA EN LA PIZARRA</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 font-semibold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span>Cabe dentro de la pizarra</span>
                </span>
              )}

              <span className="text-stone-600 text-[11px]">
                Corte rotado a {currentAngle}°:{' '}
                <strong className="font-mono text-stone-800">{cutWidth} × {cutHeight} {unit}</strong>
                {' '}(Área útil: <span className="font-mono text-stone-700">{usableWidth} × {usableHeight} {unit}</span>)
              </span>
            </div>

            {exceedsPizarra && (
              <p className="text-[11px] text-amber-900 leading-tight">
                {exceedsWidth && `• El ancho (${cutWidth} mm) excede la chapa por ${cutWidth - usableWidth} mm.`}
                {exceedsHeight && ` • La altura (${cutHeight} mm) excede la chapa por ${cutHeight - usableHeight} mm.`}
              </p>
            )}
          </div>

          {/* Action Buttons: Auto-Calculate Standard to Fit */}
          <div className="flex items-center gap-2 flex-wrap">
            {activeTab === 'text' && autoFitTextResult && (
              <>
                <button
                  type="button"
                  id="btn-autofit-standard"
                  onClick={handleAutoFitTextSingle}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium text-xs shadow-xs transition-colors cursor-pointer"
                  title={`Calcula y ajusta la altura de letra a ${autoFitTextResult.recommendedFontSize} mm para que quepa a ${currentAngle}° en la chapa`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>
                    Ajustar a Estándar (Letra {autoFitTextResult.recommendedFontSize} mm)
                  </span>
                </button>

                {autoFitTextResult.splitTextRecommendation && autoFitTextResult.splitFontSizeRecommendation && (
                  <button
                    type="button"
                    id="btn-autofit-split"
                    onClick={handleAutoFitTextSplit}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg font-medium text-xs transition-colors cursor-pointer"
                    title="Divide el texto en 2 líneas para que las letras puedan ser más grandes y legibles"
                  >
                    <Split className="w-3.5 h-3.5" />
                    <span>
                      En 2 líneas (Letra {autoFitTextResult.splitFontSizeRecommendation} mm)
                    </span>
                  </button>
                )}
              </>
            )}

            {activeTab === 'svg' && autoFitSvgResult && onApplySvgAutoFit && (
              <button
                type="button"
                id="btn-autofit-svg"
                onClick={onApplySvgAutoFit}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium text-xs shadow-xs transition-colors cursor-pointer"
                title={`Escala el SVG a ${autoFitSvgResult.targetWidth} × ${autoFitSvgResult.targetHeight} mm para que quepa a ${currentAngle}°`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>
                  Escalar SVG ({autoFitSvgResult.targetWidth} × {autoFitSvgResult.targetHeight} mm)
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Alignment and Angle Guide Modal */}
      <TableAlignmentModal
        isOpen={showAlignmentHelp}
        onClose={() => setShowAlignmentHelp(false)}
        currentAngle={currentAngle}
        onSelectAngle={handleSetAngle}
      />
    </>
  );
};

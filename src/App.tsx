/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { PlasmaConfig, FontStyleType, ToolpathData } from './types';
import { generateTextVectorLoops } from './utils/plasmaFonts';
import { parseSvgContent } from './utils/svgParser';
import { generatePlasmaToolpath } from './utils/gcodeGenerator';
import { SAMPLE_SVGS } from './utils/sampleSvgs';
import { CanvasVisualizer } from './components/CanvasVisualizer';
import { GCodeViewer } from './components/GCodeViewer';
import { TextInputPanel } from './components/TextInputPanel';
import { SvgConverterPanel } from './components/SvgConverterPanel';
import { PlasmaSettingsPanel } from './components/PlasmaSettingsPanel';
import { DesktopInstallModal } from './components/DesktopInstallModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { Type, FileCode, Settings2, Flame, Wrench, ShieldCheck, Laptop } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'text' | 'svg'>('text');
  const [showSettings, setShowSettings] = useState<boolean>(false);

  // Text generator state
  const [text, setText] = useState<string>('LINUXCNC PLASMA');
  const [fontType, setFontType] = useState<FontStyleType>('stencil');
  const [fontSize, setFontSize] = useState<number>(45);
  const [letterSpacing, setLetterSpacing] = useState<number>(4);
  const [lineSpacing, setLineSpacing] = useState<number>(1.3);

  // SVG converter state
  const [svgContent, setSvgContent] = useState<string>(SAMPLE_SVGS[0].svg);
  const [svgFileName, setSvgFileName] = useState<string>('soporte_escuadra.svg');
  const [targetWidth, setTargetWidth] = useState<number>(150);
  const [targetHeight, setTargetHeight] = useState<number>(100);
  const [lockAspectRatio, setLockAspectRatio] = useState<boolean>(true);

  // LinuxCNC Plasma machine configuration
  const [plasmaConfig, setPlasmaConfig] = useState<PlasmaConfig>({
    unit: 'mm',
    cutFeedRate: 1800,
    rapidFeedRate: 6000,
    safeZ: 25.0,
    pierceHeightZ: 3.8,
    cutHeightZ: 1.5,
    pierceDelay: 0.6,
    torchOnCommand: 'M3 S1',
    torchOffCommand: 'M5',
    enableTouchOff: false,
    probeFeedRate: 400,
    switchOffset: 1.2,
    leadInType: 'straight',
    leadInLength: 3.0,
    leadInAngle: 45,
    leadOutLength: 1.5,
    kerfWidth: 1.2,
    g64Tolerance: 0.1
  });

  // Calculate toolpath based on current mode
  const { toolpath, detectedPathsCount } = useMemo(() => {
    if (activeTab === 'text') {
      const textResult = generateTextVectorLoops(
        text.trim() || ' ',
        fontType,
        fontSize,
        letterSpacing,
        lineSpacing
      );

      const generated = generatePlasmaToolpath(
        textResult.loops,
        plasmaConfig
      );

      return {
        toolpath: generated,
        detectedPathsCount: textResult.loops.length
      };
    } else {
      // SVG mode
      const svgResult = parseSvgContent(svgContent);
      const generated = generatePlasmaToolpath(
        svgResult.paths,
        plasmaConfig
      );

      return {
        toolpath: generated,
        detectedPathsCount: svgResult.paths.length
      };
    }
  }, [
    activeTab,
    text,
    fontType,
    fontSize,
    letterSpacing,
    lineSpacing,
    svgContent,
    plasmaConfig
  ]);

  const currentDownloadName = activeTab === 'text'
    ? `${text.slice(0, 12).replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'texto'}_plasma.ngc`
    : svgFileName.replace(/\.svg$/i, '.ngc');

  return (
    <div id="plasma-app-root" className="min-h-screen bg-stone-100 text-stone-900 flex flex-col font-sans">
      {/* Top Header */}
      <header id="app-header" className="bg-stone-900 text-white border-b border-stone-800 px-4 sm:px-8 py-3.5 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div id="app-logo" className="w-9 h-9 rounded-lg bg-orange-600 flex items-center justify-center text-white shadow-sm">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold tracking-tight text-white">
                  PlasmaNGC Studio
                </h1>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-stone-800 text-orange-400 font-mono font-medium border border-stone-700">
                  LinuxCNC G-Code
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Generador de trayectorias y código G (.ngc) para corte por plasma
              </p>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div id="mode-switcher" className="flex items-center bg-stone-800/90 p-1 rounded-xl border border-stone-700">
            <button
              id="tab-mode-text"
              type="button"
              onClick={() => setActiveTab('text')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'text'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              <Type className="w-4 h-4" />
              <span>Texto a NGC</span>
            </button>

            <button
              id="tab-mode-svg"
              type="button"
              onClick={() => setActiveTab('svg')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'svg'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              <FileCode className="w-4 h-4" />
              <span>SVG a NGC</span>
            </button>

            <div className="w-px h-5 bg-stone-700 mx-1" />

            <button
              id="toggle-settings-btn"
              type="button"
              onClick={() => setShowSettings(!showSettings)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                showSettings
                  ? 'bg-stone-700 text-amber-300'
                  : 'text-stone-300 hover:text-white'
              }`}
              title="Ajustes de máquina"
            >
              <Settings2 className="w-4 h-4" />
              <span className="hidden sm:inline">Parámetros Plasma</span>
            </button>

            <div className="w-px h-5 bg-stone-700 mx-1" />

            <div>
              <DesktopInstallModal />
            </div>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Input Panel & Settings (5 cols) */}
          <div id="left-controls-column" className="lg:col-span-5 space-y-5">
            {activeTab === 'text' ? (
              <TextInputPanel
                text={text}
                onTextChange={setText}
                fontType={fontType}
                onFontTypeChange={setFontType}
                fontSize={fontSize}
                onFontSizeChange={setFontSize}
                letterSpacing={letterSpacing}
                onLetterSpacingChange={setLetterSpacing}
                lineSpacing={lineSpacing}
                onLineSpacingChange={setLineSpacing}
                unit={plasmaConfig.unit}
              />
            ) : (
              <SvgConverterPanel
                svgContent={svgContent}
                onSvgChange={(newSvg, name) => {
                  setSvgContent(newSvg);
                  if (name) setSvgFileName(name);
                }}
                targetWidth={targetWidth}
                onTargetWidthChange={setTargetWidth}
                targetHeight={targetHeight}
                onTargetHeightChange={setTargetHeight}
                lockAspectRatio={lockAspectRatio}
                onLockAspectRatioChange={setLockAspectRatio}
                unit={plasmaConfig.unit}
                detectedPathsCount={detectedPathsCount}
              />
            )}

            {/* Plasma Machine Parameters Panel */}
            <PlasmaSettingsPanel
              config={plasmaConfig}
              onChange={setPlasmaConfig}
            />

            {/* LinuxCNC Compliance info badge */}
            <div className="p-4 rounded-xl bg-white border border-stone-200 text-xs text-stone-600 space-y-2 shadow-xs">
              <div className="flex items-center gap-2 font-semibold text-stone-900">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Compatibilidad LinuxCNC Certificada</span>
              </div>
              <p className="text-[11px] leading-relaxed text-stone-500">
                El archivo <code>.ngc</code> generado incluye G90, G21/G20, G64 (trayectoria continua), control de antorcha M3/M5, alturas de perforación/corte y ciclo opcional G38.2 para sensor flotante (THC).
              </p>
            </div>
          </div>

          {/* Right Column: Visualizer & G-Code Inspector (7 cols) */}
          <div id="right-workspace-column" className="lg:col-span-7 space-y-5">
            {/* 2D Interactive CAD/CAM Visualizer */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                  Simulación de Trayectoria 2D (LinuxCNC)
                </h2>
                <span className="text-[11px] font-mono text-stone-500">
                  {toolpath.loops.length} contornos • {toolpath.totalCutLength.toFixed(1)} {plasmaConfig.unit} de corte
                </span>
              </div>
              <CanvasVisualizer
                toolpath={toolpath}
                unit={plasmaConfig.unit}
                cutFeedRate={plasmaConfig.cutFeedRate}
              />
            </div>

            {/* G-Code NGC Viewer & Download */}
            <div className="space-y-2">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                Código G Saliente (.NGC)
              </h2>
              <GCodeViewer
                toolpath={toolpath}
                unit={plasmaConfig.unit}
                fileName={currentDownloadName}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer id="app-footer" className="bg-white border-t border-stone-200 py-4 px-4 text-xs text-stone-500 text-center">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>PlasmaNGC Studio • Diseñado para mesas de corte CNC plasma y LinuxCNC (Axis / Gmoccapy)</span>
          <span className="font-mono text-stone-400">Salida: G-Code estándar RS274/NGC</span>
        </div>
      </footer>

      {/* Offline Status Alert */}
      <OfflineIndicator />
    </div>
  );
}



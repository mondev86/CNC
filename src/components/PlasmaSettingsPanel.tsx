import React from 'react';
import { PlasmaConfig } from '../types';
import { Settings, Flame, ShieldAlert, Sliders } from 'lucide-react';

interface PlasmaSettingsPanelProps {
  config: PlasmaConfig;
  onChange: (updated: PlasmaConfig) => void;
}

export const PlasmaSettingsPanel: React.FC<PlasmaSettingsPanelProps> = ({
  config,
  onChange
}) => {
  const handleChange = <K extends keyof PlasmaConfig>(key: K, value: PlasmaConfig[K]) => {
    onChange({
      ...config,
      [key]: value
    });
  };

  // Plasma cut presets for common steel sheet thicknesses
  const applyPreset = (preset: 'sheet_1mm' | 'sheet_3mm' | 'sheet_6mm') => {
    if (preset === 'sheet_1mm') {
      onChange({
        ...config,
        cutFeedRate: 2600,
        pierceDelay: 0.3,
        pierceHeightZ: 3.0,
        cutHeightZ: 1.2,
        leadInLength: 2.5
      });
    } else if (preset === 'sheet_3mm') {
      onChange({
        ...config,
        cutFeedRate: 1600,
        pierceDelay: 0.6,
        pierceHeightZ: 3.8,
        cutHeightZ: 1.5,
        leadInLength: 3.5
      });
    } else if (preset === 'sheet_6mm') {
      onChange({
        ...config,
        cutFeedRate: 900,
        pierceDelay: 1.2,
        pierceHeightZ: 4.5,
        cutHeightZ: 1.8,
        leadInLength: 4.5
      });
    }
  };

  return (
    <div id="plasma-settings-panel" className="bg-white rounded-xl border border-stone-200 p-5 space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-stone-200">
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-orange-600" />
          <h2 className="text-sm font-semibold text-stone-900">Parámetros de Plasma LinuxCNC</h2>
        </div>
        <div className="flex items-center gap-1">
          <button
            id="btn-unit-mm"
            type="button"
            onClick={() => handleChange('unit', 'mm')}
            className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
              config.unit === 'mm'
                ? 'bg-stone-900 text-white'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            mm (G21)
          </button>
          <button
            id="btn-unit-inch"
            type="button"
            onClick={() => handleChange('unit', 'inch')}
            className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
              config.unit === 'inch'
                ? 'bg-stone-900 text-white'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            pulgadas (G20)
          </button>
        </div>
      </div>

      {/* Quick Material Presets */}
      <div>
        <div className="text-xs font-medium text-stone-500 mb-2 flex items-center gap-1.5">
          <Sliders className="w-3.5 h-3.5" />
          <span>Ajustes rápidos según espesor de chapa:</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => applyPreset('sheet_1mm')}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-stone-200 hover:border-stone-400 bg-stone-50 hover:bg-white text-stone-700 font-medium transition-colors text-center"
          >
            Chapa Fina (1 mm)
          </button>
          <button
            type="button"
            onClick={() => applyPreset('sheet_3mm')}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-stone-200 hover:border-stone-400 bg-stone-50 hover:bg-white text-stone-700 font-medium transition-colors text-center"
          >
            Media (3 mm / 1/8")
          </button>
          <button
            type="button"
            onClick={() => applyPreset('sheet_6mm')}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-stone-200 hover:border-stone-400 bg-stone-50 hover:bg-white text-stone-700 font-medium transition-colors text-center"
          >
            Gruesa (6 mm / 1/4")
          </button>
        </div>
      </div>

      {/* Speed & Heights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div>
          <label className="block text-stone-600 font-medium mb-1">
            Velocidad de Corte (F - {config.unit === 'mm' ? 'mm/min' : 'IPM'})
          </label>
          <input
            type="number"
            value={config.cutFeedRate}
            onChange={e => handleChange('cutFeedRate', Math.max(10, parseFloat(e.target.value) || 1000))}
            className="w-full px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 font-mono focus:bg-white focus:outline-none focus:ring-1 focus:ring-orange-500"
          />
        </div>

        <div>
          <label className="block text-stone-600 font-medium mb-1">
            Retardo de Perforación / Pierce Delay (segundos)
          </label>
          <input
            type="number"
            step="0.05"
            value={config.pierceDelay}
            onChange={e => handleChange('pierceDelay', Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 font-mono focus:bg-white focus:outline-none focus:ring-1 focus:ring-orange-500"
          />
        </div>

        <div>
          <label className="block text-stone-600 font-medium mb-1">
            Altura de Perforación (Z Pierce - {config.unit})
          </label>
          <input
            type="number"
            step="0.1"
            value={config.pierceHeightZ}
            onChange={e => handleChange('pierceHeightZ', parseFloat(e.target.value) || 3.5)}
            className="w-full px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 font-mono focus:bg-white focus:outline-none focus:ring-1 focus:ring-orange-500"
          />
        </div>

        <div>
          <label className="block text-stone-600 font-medium mb-1">
            Altura de Corte (Z Cut - {config.unit})
          </label>
          <input
            type="number"
            step="0.1"
            value={config.cutHeightZ}
            onChange={e => handleChange('cutHeightZ', parseFloat(e.target.value) || 1.5)}
            className="w-full px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 font-mono focus:bg-white focus:outline-none focus:ring-1 focus:ring-orange-500"
          />
        </div>

        <div>
          <label className="block text-stone-600 font-medium mb-1">
            Altura Segura de Traslado (Safe Z - {config.unit})
          </label>
          <input
            type="number"
            step="0.5"
            value={config.safeZ}
            onChange={e => handleChange('safeZ', parseFloat(e.target.value) || 20)}
            className="w-full px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 font-mono focus:bg-white focus:outline-none focus:ring-1 focus:ring-orange-500"
          />
        </div>

        <div>
          <label className="block text-stone-600 font-medium mb-1">
            Longitud de Entrada / Lead-in ({config.unit})
          </label>
          <input
            type="number"
            step="0.5"
            value={config.leadInLength}
            onChange={e => handleChange('leadInLength', Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 font-mono focus:bg-white focus:outline-none focus:ring-1 focus:ring-orange-500"
          />
        </div>
      </div>

      {/* LinuxCNC Torch Commands & Touch-Off Section */}
      <div className="pt-3 border-t border-stone-200 space-y-3 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-stone-600 font-medium mb-1">
              Comando Encendido Antorcha (Torch On)
            </label>
            <input
              type="text"
              value={config.torchOnCommand}
              onChange={e => handleChange('torchOnCommand', e.target.value)}
              className="w-full px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 font-mono focus:bg-white focus:outline-none focus:ring-1 focus:ring-orange-500"
              placeholder="M3 S1 o M3"
            />
          </div>

          <div>
            <label className="block text-stone-600 font-medium mb-1">
              Comando Apagado Antorcha (Torch Off)
            </label>
            <input
              type="text"
              value={config.torchOffCommand}
              onChange={e => handleChange('torchOffCommand', e.target.value)}
              className="w-full px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 font-mono focus:bg-white focus:outline-none focus:ring-1 focus:ring-orange-500"
              placeholder="M5"
            />
          </div>
        </div>

        {/* Floating Head / Touch Off Checkbox */}
        <div className="p-3 bg-stone-50 rounded-lg border border-stone-200 space-y-2">
          <label className="flex items-center gap-2 cursor-pointer font-medium text-stone-800">
            <input
              type="checkbox"
              checked={config.enableTouchOff}
              onChange={e => handleChange('enableTouchOff', e.target.checked)}
              className="rounded-sm border-stone-300 text-orange-600 focus:ring-orange-500"
            />
            <span>Habilitar Ciclo de Sondeo / Floating Head (G38.2 Touch-Off)</span>
          </label>
          <p className="text-stone-500 text-[11px] leading-relaxed">
            LinuxCNC ejecutará un ciclo de palpador antes de cada perforación para calibrar la chapa ante deformaciones térmicas.
          </p>
          {config.enableTouchOff && (
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-stone-600 text-[11px] mb-1">Velocidad Sondeo (mm/min)</label>
                <input
                  type="number"
                  value={config.probeFeedRate}
                  onChange={e => handleChange('probeFeedRate', parseFloat(e.target.value) || 300)}
                  className="w-full px-2.5 py-1 bg-white border border-stone-200 rounded-md text-stone-900 font-mono"
                />
              </div>
              <div>
                <label className="block text-stone-600 text-[11px] mb-1">Offset Interruptor (mm)</label>
                <input
                  type="number"
                  step="0.1"
                  value={config.switchOffset}
                  onChange={e => handleChange('switchOffset', parseFloat(e.target.value) || 1.2)}
                  className="w-full px-2.5 py-1 bg-white border border-stone-200 rounded-md text-stone-900 font-mono"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

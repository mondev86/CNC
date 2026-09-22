import React from 'react';
import { X, Compass, CheckCircle2, RotateCw, Sparkles, Terminal, HelpCircle } from 'lucide-react';

interface TableAlignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAngle: number;
  onSelectAngle: (angle: number) => void;
}

export const TableAlignmentModal: React.FC<TableAlignmentModalProps> = ({
  isOpen,
  onClose,
  currentAngle,
  onSelectAngle
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-stone-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 text-orange-700 rounded-xl">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900 text-base">
                ¿Cómo ubicarse en cualquier ángulo de la mesa CNC?
              </h3>
              <p className="text-xs text-stone-500">
                Guía práctica para LinuxCNC, Debian y QtPlasmaC
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto text-stone-700 text-sm">
          {/* Answer summary */}
          <div className="p-4 bg-orange-50/70 border border-orange-200 rounded-xl text-xs space-y-2">
            <div className="font-semibold text-orange-950 flex items-center gap-1.5 text-sm">
              <Sparkles className="w-4 h-4 text-orange-600 shrink-0" />
              <span>Respuesta rápida: ¡Puedes hacerlo de ambas formas!</span>
            </div>
            <p className="text-orange-900 leading-relaxed">
              <strong>1. En el mismo código (Desde esta App):</strong> Recomendado cuando quieres diseñar la pieza ya inclinada o aprovechar un retazo de chapa con un ángulo específico.
            </p>
            <p className="text-orange-900 leading-relaxed">
              <strong>2. En la pantalla de LinuxCNC (Sheet Alignment):</strong> Recomendado cuando colocas una chapa grande en la mesa y queda torcida unos grados; la máquina compensa la inclinación sin tocar el archivo.
            </p>
          </div>

          {/* Método 1 */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-stone-900 text-white flex items-center justify-center text-xs font-bold">1</span>
              <h4 className="font-bold text-stone-900 text-sm">
                Método 1: En el Código G-Code (Directo en esta App)
              </h4>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed pl-8">
              En la barra de <strong>"Pizarra y Orientación"</strong> de esta aplicación puedes girar el diseño a cualquier ángulo (ej. 45°, 90°, o un valor libre con el control deslizante).
            </p>
            <div className="pl-8 grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              {[0, 45, 90, -45].map(deg => (
                <button
                  key={deg}
                  type="button"
                  onClick={() => {
                    onSelectAngle(deg);
                    onClose();
                  }}
                  className={`px-3 py-2 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                    currentAngle === deg
                      ? 'border-orange-600 bg-orange-50 text-orange-900 font-bold'
                      : 'border-stone-200 hover:bg-stone-100 text-stone-700'
                  }`}
                >
                  <RotateCw className="w-3.5 h-3.5 text-orange-600" />
                  <span>{deg === 0 ? '0° Horizontal' : deg === 90 ? '90° Vertical' : `${deg}°`}</span>
                </button>
              ))}
            </div>
            <p className="text-[11px] text-stone-500 pl-8">
              • El G-Code exportado ya tendrá calculadas matemáticamente todas las coordenadas X e Y con trigonometría exacta, respetando los límites de tu chapa.
            </p>
          </div>

          {/* Método 2 */}
          <div className="space-y-2.5 pt-3 border-t border-stone-200">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-orange-600 text-white flex items-center justify-center text-xs font-bold">2</span>
              <h4 className="font-bold text-stone-900 text-sm">
                Método 2: En LinuxCNC con QtPlasmaC ("Alineación de 2 Puntos")
              </h4>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed pl-8">
              Si la plancha de metal quedó torcida sobre la mesa y no quieres re-exportar el archivo:
            </p>
            <ol className="list-decimal list-inside pl-8 space-y-1.5 text-xs text-stone-700">
              <li>Mueve la antorcha con el Jog a la <strong>esquina inferior izquierda</strong> de la chapa física. Haz Touch-Off en <code className="bg-stone-100 px-1.5 py-0.5 rounded text-stone-900 font-mono">X0 Y0</code>.</li>
              <li>Mueve la antorcha con el Jog hacia la derecha siguiendo el borde de la chapa (por ejemplo 500 mm en X).</li>
              <li>Presiona el botón <strong>Sheet Alignment</strong> en la pestaña de preparación de QtPlasmaC.</li>
              <li>QtPlasmaC medirá la desviación en Y, calculará el ángulo automáticamente y rotará todo el plano de coordenadas.</li>
            </ol>
          </div>

          {/* Método 3 */}
          <div className="space-y-2.5 pt-3 border-t border-stone-200">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-stone-600 text-white flex items-center justify-center text-xs font-bold">3</span>
              <h4 className="font-bold text-stone-900 text-sm">
                Método 3: Comando MDI de LinuxCNC (G10 L2 P1 R...)
              </h4>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed pl-8">
              LinuxCNC soporta nativamente girar el sistema de coordenadas de pieza G54 mediante comando de consola MDI:
            </p>
            <div className="pl-8 space-y-2 font-mono text-xs">
              <div className="p-2.5 bg-stone-900 text-emerald-400 rounded-lg">
                G10 L2 P1 R35.5 <span className="text-stone-400">// Rota el plano G54 a 35.5 grados</span>
              </div>
              <div className="p-2.5 bg-stone-900 text-amber-300 rounded-lg">
                G10 L2 P1 R0 <span className="text-stone-400">// Restablece la rotación a cero grados</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-stone-200 bg-stone-50 flex items-center justify-between">
          <span className="text-xs text-stone-500">
            Ángulo actual seleccionado: <strong className="font-mono text-stone-800">{currentAngle}°</strong>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-medium transition-colors"
          >
            Entendido, cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

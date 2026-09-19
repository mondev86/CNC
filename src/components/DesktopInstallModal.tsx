import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Monitor, Download, FolderDown, Terminal, CheckCircle2, HardDrive, X, Laptop, FileCode, Play } from 'lucide-react';

export const DesktopInstallModal: React.FC = () => {
  const { isInstallable, isStandalone, install } = usePWAInstall();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'folder' | 'pwa'>('folder');

  const handleInstallClick = () => {
    setIsOpen(true);
  };

  return (
    <>
      {/* Header action button */}
      <button
        id="desktop-app-install-btn"
        type="button"
        onClick={handleInstallClick}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-stone-200 hover:text-white bg-stone-800 hover:bg-stone-700 border border-stone-700 transition-colors shadow-xs"
        title="Tener la aplicación en tu PC: carpeta con ejecutables o app nativa"
      >
        <FolderDown className="w-3.5 h-3.5 text-orange-400" />
        <span className="hidden md:inline">Descargar Proyecto y Ejecutable</span>
        <span className="md:hidden">Descargar</span>
      </button>

      {/* Instructions Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-stone-200 max-w-2xl w-full p-6 shadow-2xl space-y-4 text-stone-900 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
                  <Laptop className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-900">
                    Tener PlasmaNGC Studio en tu PC
                  </h3>
                  <p className="text-xs text-stone-500">
                    Opciones para tener la carpeta completa con lanzadores ejecutables o instalar la app
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-stone-400 hover:text-stone-600 p-1 rounded-lg hover:bg-stone-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sub Tabs */}
            <div className="flex bg-stone-100 p-1 rounded-xl gap-1 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab('folder')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg transition-all ${
                  activeTab === 'folder'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <FolderDown className="w-4 h-4 text-orange-600" />
                <span>1. Carpeta con Ejecutables (.ZIP / .BAT / .SH)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('pwa')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg transition-all ${
                  activeTab === 'pwa'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Monitor className="w-4 h-4 text-orange-600" />
                <span>2. App de Escritorio 1-Clic (PWA)</span>
              </button>
            </div>

            {/* TAB 1: Carpeta del Proyecto con Ejecutables */}
            {activeTab === 'folder' && (
              <div className="space-y-4 text-xs">
                {/* How to download ZIP */}
                <div className="p-4 bg-orange-50/70 border border-orange-200 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 font-bold text-stone-900 text-xs">
                    <Download className="w-4 h-4 text-orange-600" />
                    <span>¿Cómo descargar la carpeta completa del proyecto (.ZIP)?</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1.5 text-stone-700 text-[11px] leading-relaxed">
                    <li>
                      En la esquina superior derecha de la interfaz de <strong>Google AI Studio</strong> (arriba de esta ventana), abre el menú de opciones <strong>⋮</strong> o icono de <strong>Settings / Compartir</strong>.
                    </li>
                    <li>
                      Selecciona la opción <strong>"Download ZIP"</strong> o <strong>"Export to GitHub/ZIP"</strong>.
                    </li>
                    <li>
                      Guarda el archivo comprimido en tu ordenador y descomprímelo en cualquier carpeta (ej. <code>C:\PlasmaNGC</code> o <code>~/PlasmaNGC</code>).
                    </li>
                  </ol>
                </div>

                {/* Executable scripts included */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-stone-800 text-xs">
                    Archivos ejecutables ya incluidos dentro de la carpeta:
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Windows BAT */}
                    <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl space-y-2">
                      <div className="flex items-center gap-2 font-semibold text-stone-900">
                        <Play className="w-4 h-4 text-emerald-600 fill-emerald-600" />
                        <span className="font-mono text-xs text-blue-700">EJECUTAR_WINDOWS.bat</span>
                      </div>
                      <p className="text-[11px] text-stone-600 leading-relaxed">
                        Solo haz <strong>doble clic</strong> sobre él en Windows. Instala automáticamente los componentes necesarios y abre la aplicación en tu pantalla sin que tengas que escribir ningún comando.
                      </p>
                      <div className="text-[10px] text-stone-500 bg-white p-2 rounded border border-stone-200 font-mono">
                        Requisito: Tener instalado Node.js (nodejs.org)
                      </div>
                    </div>

                    {/* Linux SH */}
                    <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl space-y-2">
                      <div className="flex items-center gap-2 font-semibold text-stone-900">
                        <Terminal className="w-4 h-4 text-amber-600" />
                        <span className="font-mono text-xs text-amber-800">ejecutar_linux.sh</span>
                      </div>
                      <p className="text-[11px] text-stone-600 leading-relaxed">
                        Lanzador para Linux (Debian, Ubuntu, LinuxCNC, Mint). Dale permisos y ejecútalo con:
                      </p>
                      <div className="text-[10px] text-stone-800 bg-stone-900 text-stone-100 p-2 rounded font-mono">
                        ./ejecutar_linux.sh
                      </div>
                    </div>
                  </div>
                </div>

                {/* Offline & security notes */}
                <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl flex items-start gap-2.5 text-[11px] text-stone-600">
                  <HardDrive className="w-4 h-4 text-stone-500 shrink-0 mt-0.5" />
                  <div>
                    <strong>Totalmente autónomo:</strong> La carpeta contiene todo el código fuente, generador de tipografía Stencil, procesador SVG y simulador de trayectorias para que funcione de por vida en tu máquina sin depender de internet.
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Instalación Directa PWA */}
            {activeTab === 'pwa' && (
              <div className="space-y-4 text-xs">
                {isInstallable && (
                  <div className="p-3.5 bg-orange-50 border border-orange-200 rounded-xl flex items-center justify-between">
                    <div className="text-xs text-orange-950">
                      <strong className="block font-semibold">Tu navegador soporta instalación directa con 1 clic:</strong>
                      <span>Añade el icono directamente al escritorio de Windows o Linux.</span>
                    </div>
                    <button
                      type="button"
                      onClick={async () => {
                        await install();
                        setIsOpen(false);
                      }}
                      className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      Instalar Ahora
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-stone-50 border border-stone-200 rounded-xl p-3.5 space-y-1.5">
                    <div className="font-semibold text-stone-900 flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-[10px] font-bold">W</span>
                      <span>En Windows (Edge / Chrome)</span>
                    </div>
                    <p className="text-stone-600 text-[11px] leading-relaxed">
                      En la barra de direcciones superior, haz clic en el icono de <strong>"Instalar aplicación"</strong> (pantalla con flecha). Se creará un acceso directo en tu Escritorio y menú Inicio con icono propio.
                    </p>
                  </div>

                  <div className="bg-stone-50 border border-stone-200 rounded-xl p-3.5 space-y-1.5">
                    <div className="font-semibold text-stone-900 flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center text-[10px] font-bold">L</span>
                      <span>En Linux (Chromium / Brave)</span>
                    </div>
                    <p className="text-stone-600 text-[11px] leading-relaxed">
                      Haz clic en el menú <code>⋮ &gt; Instalar aplicación</code>. Linux generará el archivo <code>.desktop</code> en tu menú de programas y se abrirá en una ventana independiente.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-stone-200">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-medium transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};


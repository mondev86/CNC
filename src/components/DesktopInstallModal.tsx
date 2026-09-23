import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Monitor, Download, FolderDown, Terminal, CheckCircle2, HardDrive, X, Laptop, FileCode, Play, ShieldAlert, Sparkles } from 'lucide-react';

export const DesktopInstallModal: React.FC = () => {
  const { isInstallable, isStandalone, install } = usePWAInstall();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'windows' | 'folder' | 'pwa'>('windows');

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
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-stone-200 hover:text-white bg-stone-800 hover:bg-stone-700 border border-stone-700 transition-colors shadow-xs cursor-pointer"
        title="Instalar en Windows 11 o descargar ejecutables"
      >
        <FolderDown className="w-3.5 h-3.5 text-orange-400" />
        <span className="hidden md:inline">Instalar en Windows 11 / Descargar</span>
        <span className="md:hidden">Instalar</span>
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
                    Instalador para Windows 11 y PC
                  </h3>
                  <p className="text-xs text-stone-500">
                    Solución de desbloqueo para Windows 11 SmartScreen y acceso directo en el Escritorio
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-stone-400 hover:text-stone-600 p-1 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sub Tabs */}
            <div className="flex bg-stone-100 p-1 rounded-xl gap-1 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab('windows')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'windows'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Play className="w-4 h-4 text-emerald-600" />
                <span>1. Windows 11 (Nuevo Instalador)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('pwa')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'pwa'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Monitor className="w-4 h-4 text-orange-600" />
                <span>2. App 1-Clic Sin Avisos (PWA)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('folder')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'folder'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Terminal className="w-4 h-4 text-stone-600" />
                <span>3. Linux / Scripts</span>
              </button>
            </div>

            {/* TAB 1: WINDOWS 11 SPECIAL TAB */}
            {activeTab === 'windows' && (
              <div className="space-y-4 text-xs">
                {/* Windows 11 Smartscreen solution */}
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2.5">
                  <div className="flex items-center gap-2 font-bold text-emerald-900 text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Nuevos archivos preparados para Windows 11:</span>
                  </div>
                  <p className="text-[11px] text-emerald-950 leading-relaxed">
                    Hemos creado un script que <strong>desbloquea automáticamente la carpeta descargada</strong> y crea un <strong>Acceso Directo con icono en tu Escritorio</strong> para que no tengas que pelear con SmartScreen ni pantallas azules de bloqueo.
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    <div className="p-3 bg-white border border-emerald-200 rounded-lg">
                      <div className="font-mono font-bold text-emerald-900 text-xs flex items-center gap-1.5">
                        <Play className="w-3.5 h-3.5 text-emerald-600" />
                        INSTALAR_WINDOWS_11.cmd
                      </div>
                      <p className="text-[10px] text-stone-600 mt-1">
                        Desbloquea los archivos, crea el acceso directo en el Escritorio e inicia la app.
                      </p>
                    </div>

                    <div className="p-3 bg-white border border-emerald-200 rounded-lg">
                      <div className="font-mono font-bold text-blue-900 text-xs flex items-center gap-1.5">
                        <Play className="w-3.5 h-3.5 text-blue-600" />
                        INICIAR_APP.cmd
                      </div>
                      <p className="text-[10px] text-stone-600 mt-1">
                        Lanzador directo diario para abrir PlasmaNGC Studio al instante.
                      </p>
                    </div>
                  </div>
                </div>

                {/* If Windows 11 SmartScreen still hides the button */}
                <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-xl space-y-2 text-[11px] text-amber-950">
                  <div className="flex items-center gap-2 font-bold text-amber-900 text-xs">
                    <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>¿Por qué Windows 11 no te daba la opción de «Continuar de todos modos»?</span>
                  </div>
                  <div className="space-y-1.5 text-stone-700 leading-relaxed">
                    <p>
                      Windows 11 viene configurado por defecto para <strong>ocultar</strong> el botón de continuar si el archivo ZIP descargado tiene la marca web de internet.
                    </p>
                    <div className="p-2.5 bg-white rounded border border-amber-200 space-y-1">
                      <strong className="text-stone-900 block font-semibold">2 Soluciones súper fáciles en 10 segundos:</strong>
                      <div>
                        <strong>Opción A (La más rápida):</strong> Haz clic derecho sobre el archivo <code>.zip</code> descargado ➔ Selecciona <strong>Propiedades</strong> ➔ Abajo del todo marca la casilla <strong>☑ Desbloquear</strong> (Unblock) ➔ Haz clic en <strong>Aceptar</strong> y luego descomprímelo. ¡Listo! Ya nunca volverá a bloquearse.
                      </div>
                      <div className="pt-1 border-t border-stone-100">
                        <strong>Opción B:</strong> Dentro de la carpeta descomprimida, haz clic derecho sobre <code>DESBLOQUEAR_WINDOWS11.ps1</code> y selecciona <strong>"Ejecutar con PowerShell"</strong>.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Node.js requirement */}
                <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl flex items-center justify-between text-[11px] text-stone-700">
                  <div>
                    <strong>Requisito en Windows:</strong> Tener instalado <strong>Node.js</strong> (gratuito y seguro).
                  </div>
                  <a
                    href="https://nodejs.org/en/download"
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 py-1 bg-stone-900 hover:bg-stone-800 text-white rounded text-[10px] font-semibold transition-colors"
                  >
                    Descargar Node.js LTS
                  </a>
                </div>
              </div>
            )}

            {/* TAB 2: INSTALACIÓN PWA 1-CLIC */}
            {activeTab === 'pwa' && (
              <div className="space-y-4 text-xs">
                <div className="p-4 bg-orange-50/80 border border-orange-200 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 font-bold text-orange-900 text-xs">
                    <Sparkles className="w-4 h-4 text-orange-600" />
                    <span>¿La mejor opción sin instalaciones complicadas? App Nativa PWA</span>
                  </div>
                  <p className="text-[11px] text-stone-700 leading-relaxed">
                    Si no quieres lidiar con archivos `.bat`, permisos de Windows ni instalar Node.js, puedes instalar la aplicación directamente desde tu navegador (Google Chrome o Microsoft Edge en Windows 11).
                  </p>
                </div>

                {isInstallable && (
                  <div className="p-3.5 bg-stone-900 text-white rounded-xl flex items-center justify-between">
                    <div>
                      <strong className="block text-xs font-bold text-orange-400">Instalación rápida lista</strong>
                      <span className="text-[11px] text-stone-300">Crea el icono directo en tu Escritorio de Windows 11</span>
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
                      Instalar en mi PC
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-stone-50 border border-stone-200 rounded-xl p-3.5 space-y-1.5">
                    <div className="font-semibold text-stone-900 flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-[10px] font-bold">W</span>
                      <span>En Windows 11 con Microsoft Edge / Chrome</span>
                    </div>
                    <p className="text-stone-600 text-[11px] leading-relaxed">
                      En la barra de direcciones superior del navegador, busca el icono de <strong>"Instalar aplicación"</strong> (una pantalla con flecha hacia abajo). Al pulsar, se instala en tu PC y funciona sin conexión a internet.
                    </p>
                  </div>

                  <div className="bg-stone-50 border border-stone-200 rounded-xl p-3.5 space-y-1.5">
                    <div className="font-semibold text-stone-900 flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-900 flex items-center justify-center text-[10px] font-bold">✓</span>
                      <span>Ventajas de la App PWA</span>
                    </div>
                    <p className="text-stone-600 text-[11px] leading-relaxed">
                      • Ventana limpia independiente (sin barra de navegador).<br />
                      • Windows 11 jamás la bloquea con SmartScreen.<br />
                      • Actualizaciones automáticas y funcionamiento 100% offline.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: CARPETA COMPLETA / LINUX */}
            {activeTab === 'folder' && (
              <div className="space-y-4 text-xs">
                <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 font-semibold text-stone-900">
                    <Terminal className="w-4 h-4 text-amber-600" />
                    <span className="font-mono text-xs text-amber-800">ejecutar_linux.sh</span>
                  </div>
                  <p className="text-[11px] text-stone-600 leading-relaxed">
                    Lanzador para Linux (Debian, Ubuntu, la PC conectada a tu LinuxCNC / QtPlasmaC). Abre una terminal en la carpeta y escribe:
                  </p>
                  <div className="text-[11px] text-stone-100 bg-stone-900 p-2.5 rounded font-mono space-y-1">
                    <div>chmod +x ejecutar_linux.sh</div>
                    <div>./ejecutar_linux.sh</div>
                  </div>
                </div>

                <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl flex items-start gap-2.5 text-[11px] text-stone-600">
                  <HardDrive className="w-4 h-4 text-stone-500 shrink-0 mt-0.5" />
                  <div>
                    <strong>Totalmente autónomo:</strong> La carpeta contiene todo el código fuente, generador de tipografía Stencil, procesador SVG y simulador de trayectorias para que funcione de por vida en tu máquina sin depender de internet.
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-stone-200">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-medium transition-colors cursor-pointer"
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

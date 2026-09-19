#!/bin/bash
# PlasmaNGC Studio - Lanzador para Linux (Ubuntu / Debian / LinuxCNC / Mint)

echo "==================================================="
echo "    PlasmaNGC Studio - Lanzador para Linux"
echo "==================================================="
echo ""

if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js no esta instalado en este sistema Linux."
    echo "Instalalo facilmente ejecutando en la terminal:"
    echo "  sudo apt update && sudo apt install -y nodejs npm"
    echo ""
    read -p "Presiona Enter para salir..."
    exit 1
fi

echo "[1/3] Verificando dependencias..."
if [ ! -d "node_modules" ]; then
    echo "Instalando paquetes por primera vez, por favor espera..."
    npm install
fi

echo ""
echo "[2/3] Iniciando PlasmaNGC Studio..."
echo "Abriendo navegador en http://localhost:3000 ..."
echo ""

(sleep 2 && (xdg-open "http://localhost:3000" 2>/dev/null || sensible-browser "http://localhost:3000" 2>/dev/null || firefox "http://localhost:3000" 2>/dev/null)) &

echo "[3/3] Servidor activo. Presiona Ctrl+C en esta terminal para detener."
npm run dev

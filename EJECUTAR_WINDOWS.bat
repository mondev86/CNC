@echo off
title PlasmaNGC Studio - LinuxCNC G-Code Generator
color 0A

echo ===================================================
echo     PlasmaNGC Studio - Lanzador para Windows
echo ===================================================
echo.

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] No se encontro Node.js en este equipo.
    echo Por favor descarga e instala Node.js (LTS recomendado) desde:
    echo https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo [1/3] Verificando dependencias...
if not exist "node_modules\" (
    echo Instalando paquetes por primera vez, espera unos segundos...
    call npm install
)

echo.
echo [2/3] Iniciando servidor local PlasmaNGC...
echo La aplicacion se abrira en tu navegador predeterminado.
echo.

start "" "http://localhost:3000"

echo [3/3] Servidor activo. Presiona Ctrl+C para detener.
echo.
call npm run dev
pause

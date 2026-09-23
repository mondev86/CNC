@echo off
setlocal enabledelayedexpansion
title PlasmaNGC Studio - Windows 11 Launcher
cd /d "%~dp0"
color 0A

:: Desbloquear automáticamente la carpeta para que Windows 11 no muestre bloqueos
powershell -NoProfile -ExecutionPolicy Bypass -Command "Get-ChildItem -Path '%~dp0' -Recurse -ErrorAction SilentlyContinue | Unblock-File" >nul 2>&1

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ====================================================================
    echo [ERROR] No se detecto Node.js en Windows 11.
    echo ====================================================================
    echo Para ejecutar la aplicacion se necesita Node.js (gratis y seguro).
    echo Se abrira la pagina de descarga oficial...
    start "" "https://nodejs.org/en/download"
    echo.
    echo Pasos rapidos:
    echo 1. Descarga el instalador 'Windows Installer (.msi) LTS' e instalalo.
    echo 2. Vuelve a hacer doble clic en este archivo.
    echo.
    pause
    exit /b 1
)

if not exist "node_modules\" (
    echo [1/2] Configurando dependencias por primera vez...
    call npm install --prefer-offline --no-audit
)

echo [2/2] Abriendo PlasmaNGC Studio en tu navegador...
start "" "http://localhost:3000"
call npm run dev

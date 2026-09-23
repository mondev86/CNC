@echo off
setlocal enabledelayedexpansion
title PlasmaNGC Studio - Instalador y Lanzador Windows 11
cd /d "%~dp0"
color 0B

echo =====================================================================
echo           PLASMANGIC STUDIO - INSTALADOR WINDOWS 11
echo =====================================================================
echo.

:: 1. Desbloquear archivos descargados (evita bloqueo de SmartScreen de Windows 11)
powershell -NoProfile -ExecutionPolicy Bypass -Command "Get-ChildItem -Path '%~dp0' -Recurse -ErrorAction SilentlyContinue | Unblock-File" >nul 2>&1

:: 2. Crear Acceso Directo (.lnk) en el Escritorio del Usuario
set "DESKTOP_DIR=%USERPROFILE%\Desktop"
set "SHORTCUT_PATH=%DESKTOP_DIR%\PlasmaNGC Studio.lnk"
set "TARGET_BAT=%~dp0INICIAR_APP.cmd"

echo Creando acceso directo en tu Escritorio...
powershell -NoProfile -ExecutionPolicy Bypass -Command "$ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut('%SHORTCUT_PATH%'); $s.TargetPath = '%TARGET_BAT%'; $s.WorkingDirectory = '%~dp0'; $s.Description = 'PlasmaNGC Studio - LinuxCNC G-Code Generator'; $s.Save()" >nul 2>&1

if exist "%SHORTCUT_PATH%" (
    echo [OK] Acceso directo 'PlasmaNGC Studio' creado en tu Escritorio exitosamente.
)

:: 3. Verificar Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo.
    echo =====================================================================
    echo [AVISO IMPORTANTE] Se requiere Node.js para ejecutar en Windows 11.
    echo =====================================================================
    echo No detectamos Node.js instalado en tu equipo.
    echo.
    echo Abriendo la pagina oficial para descargarlo (es gratis y seguro):
    echo https://nodejs.org/
    start "" "https://nodejs.org/en/download"
    echo.
    echo Pasos:
    echo 1. Descarga e instala Node.js (version LTS recomendada, dale a Siguiente-Siguiente).
    echo 2. Vuelve a hacer doble clic en este archivo o en 'INICIAR_APP.cmd'.
    echo.
    pause
    exit /b 1
)

:: 4. Instalar dependencias si no existen
if not exist "node_modules\" (
    echo.
    echo [1/2] Preparando paquetes por primera vez (tarda unos segundos)...
    call npm install --prefer-offline --no-audit
)

echo.
echo [2/2] Todo listo. Abriendo PlasmaNGC Studio...
echo.

:: 5. Iniciar la aplicación
start "" "http://localhost:3000"
call npm run dev

pause

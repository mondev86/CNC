@echo off
cd /d "%~dp0"
title PlasmaNGC Studio
color 0A

:: Desbloquear cualquier archivo bloqueado por descargas web
powershell -NoProfile -ExecutionPolicy Bypass -Command "Get-ChildItem -Path '%~dp0' -Recurse -ErrorAction SilentlyContinue | Unblock-File" >nul 2>&1

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] No se encontro Node.js en este equipo.
    echo Por favor ejecuta 'INSTALAR_WINDOWS_11.cmd' para configurarlo.
    echo O descarga Node.js desde https://nodejs.org/
    pause
    exit /b 1
)

if not exist "node_modules\" (
    echo Preparando dependencias locales...
    call npm install --prefer-offline --no-audit
)

start "" "http://localhost:3000"
call npm run dev

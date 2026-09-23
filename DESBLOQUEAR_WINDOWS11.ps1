# DESBLOQUEADOR AUTOMATICO PARA WINDOWS 11
# Este script quita la marca web (Zone.Identifier) que provoca que Windows 11 diga
# "Windows protegio su PC" y no deje continuar.

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  Desbloqueando archivos de PlasmaNGC Studio en Windows 11 " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$CurrentDir = Split-Path -Parent $MyInvocation.MyCommand.Path

try {
    Get-ChildItem -Path $CurrentDir -Recurse | Unblock-File
    Write-Host "[OK] Todos los archivos han sido desbloqueados exitosamente." -ForegroundColor Green
    Write-Host "Ya no aparecera la pantalla azul de SmartScreen." -ForegroundColor Green
    Write-Host ""
    Write-Host "Iniciando PlasmaNGC Studio..." -ForegroundColor Yellow
    Start-Process -FilePath "$CurrentDir\INICIAR_APP.cmd"
} catch {
    Write-Host "[AVISO] Si surge algun error, haz clic derecho en el archivo .zip antes de descomprimir y marca 'Desbloquear'." -ForegroundColor Yellow
}

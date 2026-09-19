# PlasmaNGC Studio - Generador LinuxCNC G-Code (.ngc)

Aplicación para generar trayectorias y código G estándar para máquinas de corte por plasma controladas con **LinuxCNC** a partir de texto stencil/plasma o vectores SVG.

---

## 🚀 Cómo ejecutar en tu PC (Windows o Linux)

### En Windows:
1. Haz doble clic en el archivo **`EJECUTAR_WINDOWS.bat`**.
2. La primera vez instalará automáticamente los paquetes necesarios y abrirá tu navegador en `http://localhost:3000`.
3. ¡Listo! Puedes desconectar internet y usar la aplicación en local.

*Nota: Solo necesitas tener instalado [Node.js](https://nodejs.org/) (versión 18 o superior).*

---

### En Linux (Debian / Ubuntu / LinuxCNC / Mint):
1. Abre una terminal en esta carpeta.
2. Asegúrate de tener permisos de ejecución:
   ```bash
   chmod +x ejecutar_linux.sh
   ```
3. Ejecuta:
   ```bash
   ./ejecutar_linux.sh
   ```
4. Se abrirá automáticamente la aplicación en tu navegador web local.

---

## 📦 Cómo empaquetar como ejecutable nativo (.exe o binario Linux)

Si deseas empaquetarla como una aplicación de escritorio nativa con su propia ventana (sin navegador):
1. Ejecuta `npm run build` para compilar los archivos.
2. Puedes usar herramientas estándar de Node como **Electron** o **Tauri**:
   - Con **Nativefier**:
     ```bash
     npm install -g nativefier
     nativefier "http://localhost:3000" --name "PlasmaNGC"
     ```
   - O instalarla mediante la función PWA de Google Chrome / Edge ("Instalar aplicación en Escritorio").

---

## ⚙️ Características principales
- Letras Stencil con puentes de soporte físico para corte de chapa.
- Conversor de vectores SVG con inversión automática de eje Y a coordenadas CNC.
- Ciclos G-Code específicos para plasma: M3/M5, Pierce Height, Cut Height, Lead-in/Lead-out y ciclo G38.2 de palpador flotante.

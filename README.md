# 💣 Defuse It! - Monorepo Nativo Asimétrico en Tiempo Real

> Juego cooperativo asimétrico en tiempo real basado en el manual en español de **Keep Talking and Nobody Explodes** (v1-es).
> Diseñado específicamente para ejecutarse con **Samsung Galaxy Watch 4 Classic (Wear OS)** y un **Smartphone con Expo Go**, sincronizados por un servidor autoritativo local de **Node.js + Socket.io**.

---

## 🏛 Arquitectura del Proyecto

```
/
├── server/        👉 Backend autoritativo Node.js + Socket.io (reloj, lógica y telemetría 30Hz)
├── phone-app/     👉 App React Native con Expo Go (Consola de Telemetría + Manual v1-es)
└── watch-app/     👉 App Nativa Wear OS para Galaxy Watch 4 Classic (Vite + React + Capacitor)
```

---

## 🚀 PASO 1: Iniciar el Servidor Autoritativo (`/server`)

El servidor gestiona las salas por PIN de 4 dígitos, el reloj global que se acelera con cada fallo (`1.0x`, `1.25x`, `1.5x`), la validación matemática de los 10 módulos y el puente de telemetría entre reloj y teléfono.

1. Abre una terminal y navega a `/server`:
   ```bash
   cd server
   npm install
   npm start
   ```
2. La terminal imprimirá un banner con todas las direcciones IP locales de tu red Wi-Fi:
   ```text
   ====================================================
      💣 DEFUSE IT! - AUTHORITATIVE SERVER READY 💣   
   ====================================================
    Puerto local: 3000
    Direcciones IP disponibles para conectar Watch y Phone:
     👉 http://192.168.1.50:3000
   ====================================================
   ```
3. Anota la IP (ej. `http://192.168.1.50:3000`) para ingresarla en las aplicaciones.

---

## 📱 PASO 2: Levantar la App del Smartphone (`/phone-app`) en Expo Go

1. Abre una segunda terminal y navega a `/phone-app`:
   ```bash
   cd phone-app
   npx expo start
   ```
2. **En tu teléfono Android / iPhone:**
   - Abre la aplicación **Expo Go**.
   - En Android, escanea el código QR que aparece en la terminal (o presiona `a` si tienes un dispositivo conectado). En iOS, escanea con la app de Cámara.
3. **En la pantalla de inicio de la app:**
   - Ingresa o confirma la URL del servidor (ej. `http://192.168.1.50:3000`).
   - Elige **"CREAR SALA"** (selecciona dificultad: Fácil 2 módulos, Normal 4 módulos, Experto 6 módulos) o ingresa un PIN existente.
   - Accederás a la **Consola de Telemetría en Vivo** (Osciloscopio, Matriz de LEDs de Perillas, Termómetro y Purga Remota) y al **Manual Interactivo v1-es**.

---

## ⌚ PASO 3: Compilar e Instalar en el Samsung Galaxy Watch 4 Classic (`/watch-app`)

La aplicación del reloj está construida con **Vite + React + Capacitor Android** optimizada para pantalla circular AMOLED (`#000000`), con soporte para el **bisel giratorio físico**, vibración háptica y bloqueo de apagado de pantalla (`FLAG_KEEP_SCREEN_ON`).

### 3.1. Compilación del `.apk` de Wear OS

Ejecuta estos 3 comandos en `/watch-app`:

```bash
cd watch-app
npm run build
npx cap sync android
cd android
./gradlew assembleDebug
```
*(En Windows PowerShell puedes usar `.\gradlew.bat assembleDebug`)*.

El archivo compilado se genera en:
`watch-app/android/app/build/outputs/apk/debug/app-debug.apk`

---

### 3.2. Instalación Inalámbrica (Wireless Debugging) en el Galaxy Watch 4

1. **Activar Depuración en el Reloj:**
   - En tu Galaxy Watch 4 Classic ve a **Ajustes** ➔ **Acerca del reloj** ➔ **Software** ➔ pulsa 7 veces seguidas en **Versión de software** hasta activar las *Opciones de desarrollador*.
   - Ve a **Ajustes** ➔ **Opciones de desarrollador**.
   - Activa **Depuración ADB** y **Depurar por Wi-Fi / Depuración inalámbrica**.
   - Asegúrate de que el reloj esté conectado a la **misma red Wi-Fi** que tu PC y anota su IP y puerto (ej. `192.168.1.85:5555`).

2. **Conectar e Instalar vía ADB desde tu PC:**
   ```bash
   adb connect 192.168.1.85:5555
   ```
   *(Acepta la confirmación de huella digital que aparecerá en la pantalla del reloj).*

3. **Instalar el APK directamente:**
   ```bash
   adb install app/build/outputs/apk/debug/app-debug.apk
   ```

4. ¡Listo! Abre **"Defuse It Watch"** en el cajón de aplicaciones del Galaxy Watch.

---

## 🎮 Controles e Interacción con el Bisel Giratorio Físico

En la parte superior de la pantalla del reloj tienes el botón conmutador:
- 🔄 **[BISEL: CARRUSEL]:** Al girar el bisel físico del Galaxy Watch cambias fluidamente entre los diferentes módulos de la bomba y la vista de **CARCASA (Edgework)** para leer el Número de Serie, Baterías, Indicadores y Puertos.
- ⚙ **[BISEL: ACCIÓN]:** Al girar el bisel físico interactúas directamente con el módulo actual:
  - **Cables:** Cambia el cable seleccionado antes de cortarlo con vibración en cada paso.
  - **Código Morse:** Sintoniza la frecuencia de radio de `3.500` a `3.600 MHz`, enviando la onda sonora en tiempo real al osciloscopio del teléfono.
  - **Contraseñas:** Rota las letras de la columna activa.
  - **Perillas:** Gira la orientación física de la perilla (`ARRIBA`, `DERECHA`, `ABAJO`, `IZQUIERDA`).
  - **Condensador:** Girar el bisel repetidamente disipa la carga del condensador y enfría el circuito.

---

## 🛠 Los 10 Módulos Implementados al 100% (Manual v1-es)

1. **Cables (`wires`):** Reglas completas para 3, 4, 5 y 6 cables según serial impar/par y conteo de colores.
2. **El Botón (`the_button`):** Reglas oficiales 1 a 7 con franjas luminosas (Azul -> dígito 4, Blanca -> 1, Amarilla -> 5, Roja -> 1).
3. **Teclados (`keypads`):** Las 6 columnas oficiales con 26 glifos Unicode.
4. **Simón Dice (`simon_says`):** Tablas de Vocal vs Sin Vocal cruzadas con 0, 1 o 2 fallos.
5. **Quién va Primero (`whos_on_first`):** 3 etapas con las 28 palabras del Paso 1 y las 28 listas oficiales de prioridad en español.
6. **Memoria (`memory`):** 5 etapas con tracking autoritativo de posición y etiqueta previa.
7. **Código Morse (`morse_code`):** 16 palabras en español y sintonización de 3.505 a 3.600 MHz sincronizada con osciloscopio.
8. **Contraseñas (`passwords`):** 5 columnas y las 35 palabras oficiales del manual en español.
9. **Exigente - Perillas (`needy_knob`):** Matriz de 12 LEDs transmitida en tiempo real a la telemetría del teléfono.
10. **Exigente - Gas y Condensador (`needy_vent_capacitor`):** Respuestas S/N a "¿VENTILAR GAS?" / "¿DETONAR?", descarga de carga y Purga Térmica Remota.

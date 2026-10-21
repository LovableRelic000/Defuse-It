# AGENTS.md - Defuse It! (Native Wear OS Watch App + Expo Go Smartphone App)

## 1. Visión General y Arquitectura de Apps Nativas
Juego cooperativo asimétrico en tiempo real basado en el manual en español de *Keep Talking and Nobody Explodes* (v1-es)[cite: 1].
El proyecto DEBE estructurarse como un **Monorepo de 3 partes** con aplicaciones reales e independientes (NO páginas web sueltas en navegador):

1. **`/server` (Backend Autoritativo Node.js + Socket.io):**
   - Genera bombas procedurales aleatorias, lleva el reloj global al milisegundo, valida cada módulo según el manual v1-es y retransmite la telemetría entre el reloj y el smartphone[cite: 1, 3].
2. **`/phone-app` (App Móvil en React Native + Expo Go):**
   - Aplicación completa creada con **Expo (React Native)** lista para ejecutarse inmediatamente en **Expo Go** en Android/iOS (y lista para compilar a APK si se requiere).
   - Utiliza `socket.io-client`, `expo-haptics` y componentes nativos (`View`, `Text`, `TouchableOpacity`, `ScrollView`, `Svg` / `Animated`) para mostrar la **Consola de Telemetría en Vivo** y el **Manual Interactivo v1-es**[cite: 1].
3. **`/watch-app` (App Nativa Compilable para Galaxy Watch 4 Classic - Wear OS):**
   - Aplicación diseñada específicamente para compilarse como un **`.apk` nativo de Wear OS** e instalarse en el **Samsung Galaxy Watch 4 Classic** vía `adb install` (Wireless Debugging).
   - Construida con **Vite + React/JS + Capacitor Android (configurado para Wear OS)**, incluyendo la carpeta `android/` preconfigurada con:
     - `AndroidManifest.xml` con `<uses-feature android:name="android.hardware.type.watch" />` y permiso `<uses-permission android:name="android.permission.VIBRATE" />`.
     - Código nativo en `MainActivity.java` / `MainActivity.kt` que:
       1. Activa `getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)` para que la pantalla del reloj nunca se apague en media partida.
       2. Desactiva el gesto de "swipe-to-dismiss" de Wear OS para no cerrar la app por accidente al jugar.
       3. Captura el **bisel giratorio físico del Galaxy Watch 4 Classic** mediante `onGenericMotionEvent` (`MotionEvent.ACTION_SCROLL` + `MotionEventCompat.AXIS_SCROLL`) y lo inyecta como evento directo `window.dispatchEvent(new CustomEvent('watch-rotary', { detail: { direction } }))` además del listener estándar `wheel`.

## 2. Configuración de Red Sin Fricción (Descubrimiento de IP en la App)
Como ambas son apps instaladas (APK en el reloj y Expo Go en el teléfono), NO deben depender de `localhost`:
- En la pantalla de inicio tanto de `/watch-app` como de `/phone-app`, debe existir un campo limpio y persistente (`AsyncStorage` / `localStorage`) para ingresar la **IP del Servidor** (ej. `http://192.168.1.50:3000`) o un botón rápido de conexión, además del teclado numérico para el **PIN de Sala de 4 dígitos**.

## 3. Simbiosis Obligatoria Reloj-Teléfono (Por qué se necesitan ambos)
- **Telemetría Cruzada en Tiempo Real:** El reloj envía a 30Hz el giro del bisel, la frecuencia sintonizada y el estado térmico. La app de Expo Go en el teléfono muestra un **Osciloscopio y Analizador de Espectro en Vivo**, la matriz de 12 LEDs de las perillas y un botón de **Purga Térmica Remota** para enfriar la bomba cuando el reloj se bloquea por sobrecalentamiento[cite: 12, 20].

## 4. Generación Procedural de la Bomba (100% Aleatoria en cada partida)
El servidor genera un objeto `BombState` completamente aleatorio por partida[cite: 3]:
- `serialNumber`: 6 caracteres alfanuméricos (ej. `X7A9B4`) con helpers `hasVowel()` e `isLastDigitOdd()` / `isLastDigitEven()`[cite: 3, 5, 8, 13].
- `batteries`: De `0` a `4` baterías repartidas entre tipo `AA` y `D` (Apéndice B)[cite: 22].
- `indicators`: De `0` a `3` indicadores de `['SND', 'CLR', 'CAR', 'IND', 'FRQ', 'SIG', 'NSA', 'MSA', 'TRN', 'BOB', 'FRK']` con estado `lit: true/false` (Apéndice A)[cite: 21].
- `ports`: De `0` a `3` puertos de `['DVI-D', 'Paralelo', 'PS/2', 'RJ-45', 'Serial', 'Estereo RCA']` (Apéndice C)[cite: 23].
- `strikes`: `0` a `3` fallos. Al 3er fallo la bomba detona. Cada fallo acelera el reloj (`1.0x`, `1.25x`, `1.5x`)[cite: 3].

## 5. Especificación Completa de los 10 Módulos (Manual v1-es)
Todos los módulos siguientes deben estar programados al 100% (prohibido dejar placeholders o `TODO`):

1. **Cables (`wires`):** 3 a 6 cables de colores (`rojo`, `blanco`, `azul`, `amarillo`, `negro`)[cite: 5]. El bisel del Galaxy Watch selecciona el cable (con clic háptico en cada paso) y un botón central lo corta[cite: 5]. Implementar todas las condiciones exactas del manual v1-es para 3, 4, 5 y 6 cables[cite: 5].
2. **El Botón (`the_button`):** Botón circular central con color (`azul`, `blanco`, `amarillo`, `rojo`) y etiqueta (`Abortar`, `Detonar`, `Mantener`, `Presionar`)[cite: 6]. Reglas 1 a 7 exactas[cite: 6]. Al mantener presionado (`onPressIn` / `pointerdown`), muestra una franja luminosa (`azul` -> soltar cuando el temporizador tenga un `4`; `blanco` -> `1`; `amarillo` -> `5`; otro color -> `1`)[cite: 6].
3. **Teclados (`keypads`):** Cuadrícula 2x2 con 4 símbolos extraídos de una de las 6 columnas oficiales del manual v1-es (`Ϙ`, `Ѧ`, `ƛ`, `Ϟ`, `Ѭ`, `ϗ`, `Ͽ`, `Ӭ`, `Ҩ`, `☆`, `★`, `¿`, `©`, `Ѽ`, `Җ`, `Ԇ`, `б`, `¶`, `Ѣ`, `Ψ`, `Ͼ`, `Ѯ`, `⊕`, `æ`, `Ԋ`, `Ω`)[cite: 7]. Se deben presionar en el orden vertical de esa columna[cite: 7].
4. **Simón Dice (`simon_says`):** Anillo circular de 4 colores (`Rojo`, `Azul`, `Verde`, `Amarillo`)[cite: 8]. Secuencia de 3 a 5 fases. Validación exacta con las dos tablas del manual (Serial con vocal vs Serial sin vocal, cruzado con 0, 1 o 2 fallos)[cite: 8].
5. **Quién va Primero (`whos_on_first`):** 3 etapas[cite: 9]. Pantalla superior muestra la palabra del monitor y 6 botones debajo[cite: 9]. El bisel permite recorrer los 6 botones cómodamente. Implementar las 28 palabras del Paso 1 (posición del botón a leer) y las 28 listas de prioridad en español del Paso 2[cite: 9, 10].
6. **Memoria (`memory`):** 5 etapas[cite: 11]. Pantalla grande muestra un número (`1-4`) y 4 botones inferiores con los números `1-4` en orden aleatorio[cite: 11]. El servidor guarda `{ position, label }` de cada etapa previa para evaluar las reglas exactas de las etapas 1 a 5. Un fallo reinicia a la etapa 1[cite: 11].
7. **Código Morse (`morse_code`):** Parpadeo visual y vibración háptica transmitiendo una de las 16 palabras en español (`freno`: 3.505, `hongos`: 3.515, `lentes`: 3.522, `biela`: 3.532, `resta`: 3.535, `trato`: 3.542, `volar`: 3.545, `vuelta`: 3.552, `llaves`: 3.555, `tabla`: 3.565, `tronco`: 3.572, `bomba`: 3.575, `santos`: 3.582, `senso`: 3.592, `ratas`: 3.595, `trenes`: 3.600)[cite: 12]. **El bisel del Galaxy Watch cambia la frecuencia de `3.500` a `3.600 MHz`** enviando la onda en tiempo real al osciloscopio de la app en Expo Go[cite: 12].
8. **Contraseñas (`passwords`):** 5 columnas de letras[cite: 16]. Tocar una columna la activa y **girar el bisel físico rota su abecedario** para formar la única palabra válida entre las 35 del manual (`abajo`, `altar`, `bajar`, `bomba`, `bueno`, `cable`, `cerca`, `corto`, `delta`, `donde`, `estar`, `falta`, `gomas`, `grasa`, `hogar`, `hueso`, `listo`, `lugar`, `magia`, `miedo`, `mundo`, `nunca`, `otros`, `pasar`, `pasos`, `perca`, `plata`, `punto`, `queso`, `ronda`, `salto`, `suena`, `tasar`, `traba`, `valor`)[cite: 16].
9. **Exigente 1 - Perillas (`needy_knob`):** Temporizador de 35s[cite: 17, 20]. El jugador gira el bisel para colocar la perilla en `ARRIBA`, `ABAJO`, `IZQUIERDA` o `DERECHA` según el patrón de 12 LEDs que el Experto lee en la telemetría de su teléfono[cite: 20].
10. **Exigente 2 - Ventilación de Gas y Condensador (`needy_vent_capacitor`):** Temporizador de emergencia donde se debe responder `S` / `N` a `¿VENTILAR GAS?` / `¿DETONAR?` o girar el bisel repetidamente para descargar el condensador sobrecargado[cite: 18, 19].

## 6. Reglas de Interfaz Circular en Wear OS (`/watch-app`)
- Todo el layout de `/watch-app` está diseñado para pantalla circular (`100vw` x `100vh`, fondo negro `#090A0F` para paneles Super AMOLED del Galaxy Watch 4 Classic).
- Ningún botón interactivo debe colocarse en las esquinas de un cuadrado; todo debe organizarse en **anillos concéntricos** y un área segura central del 80% del diámetro.
- Incluir un botón superior o anillo conmutador claro: **[Bisel: Cambiar Módulo]** vs **[Bisel: Controlar Módulo]**, permitiendo también ver la **Carcasa Lateral (Edgework)** donde se inspeccionan el Serial, las Baterías, Indicadores y Puertos de la bomba[cite: 3, 21, 22, 23].
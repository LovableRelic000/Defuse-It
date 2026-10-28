// index.js - Authoritative Node.js + Socket.io Server for Defuse It!
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const os = require('os');
const cors = require('cors');
const {
  generateBomb,
  getSimonSaysMapping,
  KNOB_PATTERNS
} = require('./bombGenerator');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3000;

// Rooms storage: roomCode -> RoomObject
const rooms = new Map();

// Helper to get local IP addresses
function getLocalIpAddresses() {
  const interfaces = os.networkInterfaces();
  const addresses = [];
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        addresses.push(iface.address);
      }
    }
  }
  return addresses;
}

// Generate unique 4-digit room PIN
function generateRoomCode() {
  let code;
  do {
    code = Math.floor(1000 + Math.random() * 9000).toString();
  } while (rooms.has(code));
  return code;
}

// REST endpoints for health check and room status
app.get('/api/discover', (req, res) => {
  res.json({
    app: 'defuse-it',
    version: '1.0.0',
    port: PORT,
    ips: getLocalIpAddresses()
  });
});

app.get('/', (req, res) => {
  res.json({
    status: 'online',
    game: 'Defuse It!',
    activeRooms: rooms.size,
    localIps: getLocalIpAddresses()
  });
});

app.get('/rooms/:code', (req, res) => {
  const room = rooms.get(req.params.code);
  if (!room) {
    return res.status(404).json({ error: 'Sala no encontrada' });
  }
  res.json({
    code: room.code,
    difficulty: room.bomb.difficulty,
    status: room.bomb.status,
    strikes: room.bomb.strikes
  });
});

// Game Loop Manager for a Room
function startGameLoop(roomCode) {
  const room = rooms.get(roomCode);
  if (!room || room.intervalId) return;

  let lastTick = Date.now();

  room.intervalId = setInterval(() => {
    const now = Date.now();
    const deltaMs = now - lastTick;
    lastTick = now;

    if (room.bomb.status !== 'active') {
      clearInterval(room.intervalId);
      room.intervalId = null;
      return;
    }

    // Strike speed multiplier
    let multiplier = 1.0;
    if (room.bomb.strikes === 1) multiplier = 1.25;
    else if (room.bomb.strikes >= 2) multiplier = 1.5;

    // Tick bomb timer
    room.bomb.timeRemainingMs -= deltaMs * multiplier;

    if (room.bomb.timeRemainingMs <= 0) {
      room.bomb.timeRemainingMs = 0;
      room.bomb.status = 'exploded';
      room.bomb.explosionReason = '¡El tiempo se ha agotado!';
      broadcastState(roomCode);
      clearInterval(room.intervalId);
      room.intervalId = null;
      return;
    }

    // Tick needy modules only if active and watch is connected (prevents instant strikes in solo/test mode)
    room.bomb.modules.forEach(mod => {
      if (mod.type === 'needy_knob' && mod.active && room.watchSocketId && !room.testMode) {
        mod.timerSeconds -= (deltaMs / 1000);
        if (mod.timerSeconds <= 0) {
          // Timer expired: if not turned to target, strike!
          if (mod.currentWatchDirection !== mod.targetDirection) {
            triggerStrike(roomCode, 'Fallo en la perilla exigente');
          }
          // Reset knob timer with new pattern
          const directions = ['ARRIBA', 'ABAJO', 'IZQUIERDA', 'DERECHA'];
          mod.targetDirection = directions[Math.floor(Math.random() * directions.length)];
          const patterns = KNOB_PATTERNS[mod.targetDirection];
          mod.leds = patterns[Math.floor(Math.random() * patterns.length)];
          mod.timerSeconds = 35;
          mod.currentWatchDirection = null;
        }
      }

      if (mod.type === 'needy_vent_capacitor' && mod.active && room.watchSocketId && !room.testMode) {
        mod.timerSeconds -= (deltaMs / 1000);
        // Capacitor charge increases slowly
        mod.capacitorCharge = Math.min(100, mod.capacitorCharge + (deltaMs / 1000) * 2.5);
        
        // Bomb thermal creep
        if (room.bomb.thermalLevel < 100 && !room.bomb.isLockedThermal) {
          room.bomb.thermalLevel = Math.min(100, room.bomb.thermalLevel + (deltaMs / 1000) * 0.5);
          if (room.bomb.thermalLevel >= 100) {
            room.bomb.isLockedThermal = true;
          }
        }

        if (mod.capacitorCharge >= 100) {
          triggerStrike(roomCode, '¡Condensador sobrecargado!');
          mod.capacitorCharge = 30; // reset after strike
        }

        if (mod.timerSeconds <= 0) {
          // Unanswered prompt strike
          triggerStrike(roomCode, 'Tiempo de ventilación expirado');
          mod.timerSeconds = 30;
          mod.isQuestion = Math.random() > 0.4;
          if (mod.isQuestion) {
            const isDet = Math.random() > 0.5;
            mod.question = isDet ? '¿DETONAR?' : '¿VENTILAR GAS?';
            mod.correctAnswer = isDet ? 'N' : 'S';
          }
        }
      }
    });

    // Broadcast time sync every 250ms
    io.to(roomCode).emit('sync:time', {
      timeRemainingMs: room.bomb.timeRemainingMs,
      multiplier,
      strikes: room.bomb.strikes,
      thermalLevel: room.bomb.thermalLevel,
      isLockedThermal: room.bomb.isLockedThermal
    });
  }, 200);
}

function triggerStrike(roomCode, reason = 'Fallo de procedimiento') {
  const room = rooms.get(roomCode);
  if (!room || room.bomb.status !== 'active') return;

  room.bomb.strikes += 1;
  io.to(roomCode).emit('strike', {
    strikes: room.bomb.strikes,
    reason
  });

  if (room.bomb.strikes >= room.bomb.maxStrikes) {
    room.bomb.status = 'exploded';
    room.bomb.explosionReason = '¡3 Fallos acumulados!';
  }

  broadcastState(roomCode);
}

function checkWinCondition(roomCode) {
  const room = rooms.get(roomCode);
  if (!room || room.bomb.status !== 'active') return;

  const defusableModules = room.bomb.modules.filter(m => !m.isNeedy);
  const allSolved = defusableModules.every(m => m.solved);

  if (allSolved) {
    room.bomb.status = 'defused';
    io.to(roomCode).emit('bomb:defused', {
      timeRemainingMs: room.bomb.timeRemainingMs,
      strikes: room.bomb.strikes
    });
    broadcastState(roomCode);
  }
}

function broadcastState(roomCode) {
  const room = rooms.get(roomCode);
  if (!room) return;

  io.to(roomCode).emit('room:state', {
    code: room.code,
    bomb: room.bomb,
    clients: {
      watch: !!room.watchSocketId,
      phone: !!room.phoneSocketId
    }
  });
}

// Socket.io Connection & Events
io.on('connection', (socket) => {
  console.log(`[Socket Connected] ID: ${socket.id}`);

  // Create Room (Starts in 'waiting' state, does NOT tick down until start-game)
  socket.on('create-room', (data = {}) => {
    const difficulty = data.difficulty || 'normal';
    const code = (data.code && data.code.length === 4) ? data.code : generateRoomCode();
    const bomb = generateBomb(difficulty);

    const room = {
      code,
      bomb,
      hostSocketId: socket.id,
      phoneSocketId: data.role === 'phone' ? socket.id : null,
      watchSocketId: data.role === 'watch' ? socket.id : null,
      intervalId: null,
      testMode: false
    };

    rooms.set(code, room);
    socket.join(code);
    socket.roomCode = code;
    socket.role = data.role || 'phone';

    console.log(`[Room Created] PIN: ${code} | Difficulty: ${difficulty} (Waiting for watch/start)`);

    socket.emit('room:created', {
      code,
      bomb,
      role: socket.role,
      clients: {
        watch: false,
        phone: true
      }
    });

    broadcastState(code);
  });

  // Explicit Start Game (Arm Bomb)
  socket.on('start-game', (data = {}) => {
    const code = socket.roomCode;
    const room = rooms.get(code);
    if (!room || room.bomb.status !== 'waiting') return;

    room.testMode = !!data.testMode;
    room.bomb.status = 'active';

    // 25-second grace period before activating needy modules
    setTimeout(() => {
      if (room.bomb.status === 'active') {
        room.bomb.modules.forEach(mod => {
          if (mod.isNeedy) mod.active = true;
        });
        broadcastState(code);
      }
    }, 25000);

    console.log(`[Game Started] PIN: ${code} | Mode: ${room.testMode ? 'Test (Solo)' : 'Co-op'}`);
    broadcastState(code);
    startGameLoop(code);
  });

  // Join Room
  socket.on('join-room', ({ code, role = 'watch' }) => {
    const room = rooms.get(code);
    if (!room) {
      return socket.emit('error:room', { message: 'El PIN de sala no existe.' });
    }

    socket.join(code);
    socket.roomCode = code;
    socket.role = role;

    if (role === 'watch') {
      room.watchSocketId = socket.id;
    } else if (role === 'phone') {
      room.phoneSocketId = socket.id;
    }

    console.log(`[Room Joined] PIN: ${code} as ${role} (${socket.id})`);

    socket.emit('room:joined', {
      code,
      bomb: room.bomb,
      role,
      clients: {
        watch: !!room.watchSocketId,
        phone: !!room.phoneSocketId
      }
    });

    broadcastState(code);
    if (!room.intervalId && room.bomb.status === 'active') {
      startGameLoop(code);
    }
  });

  // Restart / New Game in same room
  socket.on('restart-game', ({ difficulty = 'normal' }) => {
    const code = socket.roomCode;
    const room = rooms.get(code);
    if (!room) return;

    if (room.intervalId) {
      clearInterval(room.intervalId);
      room.intervalId = null;
    }

    room.bomb = generateBomb(difficulty);
    broadcastState(code);
    startGameLoop(code);
  });

  // Telemetry relay from Watch to Phone (30Hz or per rotary move)
  socket.on('watch:telemetry', (telemetry) => {
    const code = socket.roomCode;
    if (!code) return;
    // Broadcast telemetry immediately to the phone in this room
    socket.to(code).emit('phone:telemetry', {
      ...telemetry,
      timestamp: Date.now()
    });
  });

  // Remote Thermal Purge from Phone
  socket.on('phone:purge-thermal', () => {
    const code = socket.roomCode;
    const room = rooms.get(code);
    if (!room || room.bomb.status !== 'active') return;

    room.bomb.thermalLevel = 0;
    room.bomb.isLockedThermal = false;

    io.to(code).emit('thermal:purged', {
      thermalLevel: 0,
      isLockedThermal: false
    });
    broadcastState(code);
  });

  // MODULE ACTION: Wires
  socket.on('action:wires', ({ wireIndex }) => {
    const code = socket.roomCode;
    const room = rooms.get(code);
    if (!room || room.bomb.status !== 'active' || room.bomb.isLockedThermal) return;

    const mod = room.bomb.modules.find(m => m.id === 'wires');
    if (!mod || mod.solved) return;

    if (wireIndex === mod.correctIndex) {
      mod.solved = true;
      mod.cutWireIndex = wireIndex;
      io.to(code).emit('module:solved', { id: 'wires', title: mod.title });
      checkWinCondition(code);
    } else {
      triggerStrike(code, 'Cable incorrecto cortado');
    }
    broadcastState(code);
  });

  // MODULE ACTION: The Button
  socket.on('action:button', ({ actionType, releaseDigit }) => {
    const code = socket.roomCode;
    const room = rooms.get(code);
    if (!room || room.bomb.status !== 'active' || room.bomb.isLockedThermal) return;

    const mod = room.bomb.modules.find(m => m.id === 'the_button');
    if (!mod || mod.solved) return;

    if (mod.requiredAction === 'tap') {
      if (actionType === 'tap') {
        mod.solved = true;
        io.to(code).emit('module:solved', { id: 'the_button', title: mod.title });
        checkWinCondition(code);
      } else {
        triggerStrike(code, 'Se mantuvo presionado cuando debía soltarse de inmediato');
      }
    } else {
      // Required action is 'hold'
      if (actionType === 'tap') {
        triggerStrike(code, 'Se pulsó brevemente cuando debía mantenerse presionado');
      } else if (actionType === 'hold_release') {
        // Check if releaseDigit matches the current remaining time's digits
        const seconds = Math.floor(room.bomb.timeRemainingMs / 1000);
        const timeStr = seconds.toString();
        const targetDigitStr = mod.releaseDigit.toString();

        if (timeStr.includes(targetDigitStr)) {
          mod.solved = true;
          io.to(code).emit('module:solved', { id: 'the_button', title: mod.title });
          checkWinCondition(code);
        } else {
          triggerStrike(code, `Soltado en segundo incorrecto (esperaba dígito ${mod.releaseDigit})`);
        }
      }
    }
    broadcastState(code);
  });

  // MODULE ACTION: Keypads
  socket.on('action:keypad', ({ symbol }) => {
    const code = socket.roomCode;
    const room = rooms.get(code);
    if (!room || room.bomb.status !== 'active' || room.bomb.isLockedThermal) return;

    const mod = room.bomb.modules.find(m => m.id === 'keypads');
    if (!mod || mod.solved) return;

    const expectedSymbol = mod.correctSequence[mod.currentStep];
    if (symbol === expectedSymbol) {
      mod.currentStep++;
      if (mod.currentStep >= mod.correctSequence.length) {
        mod.solved = true;
        io.to(code).emit('module:solved', { id: 'keypads', title: mod.title });
        checkWinCondition(code);
      }
    } else {
      triggerStrike(code, 'Símbolo del teclado presionado en orden incorrecto');
    }
    broadcastState(code);
  });

  // MODULE ACTION: Simon Says
  socket.on('action:simon', ({ color }) => {
    const code = socket.roomCode;
    const room = rooms.get(code);
    if (!room || room.bomb.status !== 'active' || room.bomb.isLockedThermal) return;

    const mod = room.bomb.modules.find(m => m.id === 'simon_says');
    if (!mod || mod.solved) return;

    const flashedColor = mod.sequence[mod.playerStep];
    const expectedColor = getSimonSaysMapping(
      room.bomb.edgework.hasVowel,
      room.bomb.strikes,
      flashedColor
    );

    if (color === expectedColor) {
      mod.playerStep++;
      if (mod.playerStep >= mod.currentStage) {
        if (mod.currentStage >= mod.sequence.length) {
          mod.solved = true;
          io.to(code).emit('module:solved', { id: 'simon_says', title: mod.title });
          checkWinCondition(code);
        } else {
          mod.currentStage++;
          mod.playerStep = 0;
        }
      }
    } else {
      triggerStrike(code, 'Color de Simón Dice incorrecto');
      mod.playerStep = 0; // restart current stage inputs on strike
    }
    broadcastState(code);
  });

  // MODULE ACTION: Who's on First
  socket.on('action:whos_on_first', ({ buttonIndex }) => {
    const code = socket.roomCode;
    const room = rooms.get(code);
    if (!room || room.bomb.status !== 'active' || room.bomb.isLockedThermal) return;

    const mod = room.bomb.modules.find(m => m.id === 'whos_on_first');
    if (!mod || mod.solved) return;

    const stage = mod.stages[mod.currentStage];
    if (buttonIndex === stage.correctIndex) {
      mod.currentStage++;
      if (mod.currentStage >= mod.stages.length) {
        mod.solved = true;
        io.to(code).emit('module:solved', { id: 'whos_on_first', title: mod.title });
        checkWinCondition(code);
      }
    } else {
      triggerStrike(code, 'Botón incorrecto en ¿Quién va Primero?');
    }
    broadcastState(code);
  });

  // MODULE ACTION: Memory
  socket.on('action:memory', ({ buttonIndex, label }) => {
    const code = socket.roomCode;
    const room = rooms.get(code);
    if (!room || room.bomb.status !== 'active' || room.bomb.isLockedThermal) return;

    const mod = room.bomb.modules.find(m => m.id === 'memory');
    if (!mod || mod.solved) return;

    const stage = mod.stages[mod.currentStage];
    const isCorrect = (buttonIndex === stage.correctIndex) || (label === stage.correctLabel);

    if (isCorrect) {
      mod.history.push({ position: buttonIndex, label });
      mod.currentStage++;
      if (mod.currentStage >= mod.stages.length) {
        mod.solved = true;
        io.to(code).emit('module:solved', { id: 'memory', title: mod.title });
        checkWinCondition(code);
      }
    } else {
      triggerStrike(code, 'Etapa de Memoria fallida. Reiniciando a etapa 1');
      mod.currentStage = 0;
      mod.history = [];
    }
    broadcastState(code);
  });

  // MODULE ACTION: Morse Code
  socket.on('action:morse', ({ frequency }) => {
    const code = socket.roomCode;
    const room = rooms.get(code);
    if (!room || room.bomb.status !== 'active' || room.bomb.isLockedThermal) return;

    const mod = room.bomb.modules.find(m => m.id === 'morse_code');
    if (!mod || mod.solved) return;

    const freqNum = parseFloat(frequency);
    if (Math.abs(freqNum - mod.correctFrequency) < 0.001) {
      mod.solved = true;
      io.to(code).emit('module:solved', { id: 'morse_code', title: mod.title });
      checkWinCondition(code);
    } else {
      triggerStrike(code, `Frecuencia Morse incorrecta (${frequency} MHz)`);
    }
    broadcastState(code);
  });

  // MODULE ACTION: Passwords
  socket.on('action:passwords', ({ word }) => {
    const code = socket.roomCode;
    const room = rooms.get(code);
    if (!room || room.bomb.status !== 'active' || room.bomb.isLockedThermal) return;

    const mod = room.bomb.modules.find(m => m.id === 'passwords');
    if (!mod || mod.solved) return;

    if (word.toLowerCase() === mod.secretWord.toLowerCase()) {
      mod.solved = true;
      io.to(code).emit('module:solved', { id: 'passwords', title: mod.title });
      checkWinCondition(code);
    } else {
      triggerStrike(code, `Palabra clave incorrecta (${word.toUpperCase()})`);
    }
    broadcastState(code);
  });

  // MODULE ACTION: Needy Knob
  socket.on('action:knob', ({ direction }) => {
    const code = socket.roomCode;
    const room = rooms.get(code);
    if (!room || room.bomb.status !== 'active' || room.bomb.isLockedThermal) return;

    const mod = room.bomb.modules.find(m => m.id === 'needy_knob');
    if (!mod) return;

    mod.currentWatchDirection = direction;
    if (direction === mod.targetDirection) {
      // Correct alignment! Reset timer and generate new pattern
      mod.timerSeconds = 35;
      const directions = ['ARRIBA', 'ABAJO', 'IZQUIERDA', 'DERECHA'];
      mod.targetDirection = directions[Math.floor(Math.random() * directions.length)];
      const patterns = KNOB_PATTERNS[mod.targetDirection];
      mod.leds = patterns[Math.floor(Math.random() * patterns.length)];
      io.to(code).emit('needy:knob-ok', { message: 'Perilla colocada correctamente' });
    } else {
      triggerStrike(code, `Posición de perilla errónea (${direction})`);
    }
    broadcastState(code);
  });

  // MODULE ACTION: Needy Vent & Capacitor
  socket.on('action:vent_capacitor', ({ action, answer, dischargeAmount = 25 }) => {
    const code = socket.roomCode;
    const room = rooms.get(code);
    if (!room || room.bomb.status !== 'active' || room.bomb.isLockedThermal) return;

    const mod = room.bomb.modules.find(m => m.id === 'needy_vent_capacitor');
    if (!mod) return;

    if (action === 'answer_prompt') {
      if (answer === mod.correctAnswer) {
        mod.timerSeconds = 35;
        mod.isQuestion = false;
        io.to(code).emit('needy:vent-ok', { message: 'Respuesta aceptada' });
      } else {
        triggerStrike(code, 'Respuesta errónea a la ventilación');
      }
    } else if (action === 'discharge_capacitor') {
      mod.capacitorCharge = Math.max(0, mod.capacitorCharge - dischargeAmount);
      // Small cooling benefit on discharge
      room.bomb.thermalLevel = Math.max(0, room.bomb.thermalLevel - 2);
    }
    broadcastState(code);
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log(`[Socket Disconnected] ID: ${socket.id}`);
    const code = socket.roomCode;
    if (code && rooms.has(code)) {
      const room = rooms.get(code);
      if (room.watchSocketId === socket.id) room.watchSocketId = null;
      if (room.phoneSocketId === socket.id) room.phoneSocketId = null;
      broadcastState(code);
    }
  });
});

// Start listening
server.listen(PORT, '0.0.0.0', () => {
  const ips = getLocalIpAddresses();
  console.log('====================================================');
  console.log('   💣 DEFUSE IT! - AUTHORITATIVE SERVER READY 💣   ');
  console.log('====================================================');
  console.log(` Puerto local: ${PORT}`);
  console.log(' Direcciones IP disponibles para conectar Watch y Phone:');
  ips.forEach((ip) => {
    console.log(`  👉 http://${ip}:${PORT}`);
  });
  console.log(' (Introduce una de estas URLs o IP:PUERTO en tus apps)');
  console.log('====================================================\n');

  // UDP Broadcast Beacon on port 41234
  try {
    const dgram = require('dgram');
    const udpBeacon = dgram.createSocket({ type: 'udp4', reuseAddr: true });
    const BROADCAST_PORT = 41234;

    udpBeacon.bind(() => {
      try {
        udpBeacon.setBroadcast(true);
        console.log(`📡 Beacon UDP de auto-descubrimiento activo en puerto ${BROADCAST_PORT}`);
      } catch (e) {
        console.warn('No se pudo activar broadcast en el socket UDP:', e.message);
      }
    });

    setInterval(() => {
      const currentIps = getLocalIpAddresses();
      if (currentIps.length === 0) return;
      const payload = Buffer.from(JSON.stringify({
        app: 'defuse-it',
        port: PORT,
        ips: currentIps
      }));
      try {
        udpBeacon.send(payload, 0, payload.length, BROADCAST_PORT, '255.255.255.255');
      } catch (err) {
        // Ignorar fallos de red esporádicos
      }
    }, 1500);
  } catch (err) {
    console.warn('Error inicializando beacon UDP:', err.message);
  }
});

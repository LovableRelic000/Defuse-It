// bombGenerator.js - Procedural Bomb Generation and Full Validation for Defuse It! (Manual v1-es)

const INDICATOR_LIST = ['SND', 'CLR', 'CAR', 'IND', 'FRQ', 'SIG', 'NSA', 'MSA', 'TRN', 'BOB', 'FRK'];
const PORT_LIST = ['DVI-D', 'Paralelo', 'PS/2', 'RJ-45', 'Serial', 'Estereo RCA'];
const WIRE_COLORS = ['rojo', 'blanco', 'azul', 'amarillo', 'negro'];
const BUTTON_COLORS = ['azul', 'blanco', 'amarillo', 'rojo'];
const BUTTON_LABELS = ['Abortar', 'Detonar', 'Mantener', 'Presionar'];
const STRIP_COLORS = ['azul', 'blanco', 'amarillo', 'rojo'];

const MORSE_DICTIONARY = {
  'freno': 3.505,
  'hongos': 3.515,
  'lentes': 3.522,
  'biela': 3.532,
  'resta': 3.535,
  'trato': 3.542,
  'volar': 3.545,
  'vuelta': 3.552,
  'llaves': 3.555,
  'tabla': 3.565,
  'tronco': 3.572,
  'bomba': 3.575,
  'santos': 3.582,
  'senso': 3.592,
  'ratas': 3.595,
  'trenes': 3.600
};

const MORSE_ENCODING = {
  'a': '.-', 'b': '-...', 'c': '-.-.', 'd': '-..', 'e': '.',
  'f': '..-.', 'g': '--.', 'h': '....', 'i': '..', 'j': '.---',
  'k': '-.-', 'l': '.-..', 'm': '--', 'n': '-.', 'o': '---',
  'p': '.--.', 'q': '--.-', 'r': '.-.', 's': '...', 't': '-',
  'u': '..-', 'v': '...-', 'w': '.--', 'x': '-..-', 'y': '-.--',
  'z': '--..'
};

const PASSWORD_WORDS = [
  'abajo', 'altar', 'bajar', 'bomba', 'bueno', 'cable', 'cerca', 'corto', 'delta', 'donde',
  'estar', 'falta', 'gomas', 'grasa', 'hogar', 'hueso', 'listo', 'lugar', 'magia', 'miedo',
  'mundo', 'nunca', 'otros', 'pasar', 'pasos', 'perca', 'plata', 'punto', 'queso', 'ronda',
  'salto', 'suena', 'tasar', 'traba', 'valor'
];

const KEYPAD_COLUMNS = [
  ['Ϙ', 'Ѧ', 'ƛ', 'Ϟ', 'Ѭ', 'ϗ', 'Ͽ'],
  ['Ӭ', 'Ϙ', 'Ͽ', 'Ҩ', '☆', 'ϗ', '¿'],
  ['©', 'Ѽ', 'Ҩ', 'Җ', 'Ԇ', 'ƛ', '☆'],
  ['б', '¶', 'Ѣ', 'Ѭ', 'Җ', '¿', '☺'],
  ['Ψ', '☺', 'Ѣ', 'Ͼ', '¶', 'Ѯ', '★'],
  ['б', 'Ӭ', '⊕', 'æ', 'Ψ', 'Ԋ', 'Ω']
];

const WHOS_ON_FIRST_DISPLAYS = {
  'SÍ': 2, 'PRIMERO': 1, 'NO': 5, 'EN BLANCO': 3, 'NADA': 2, 'OK': 3,
  'QUÉ': 5, 'QUE': 5, 'ESPERA': 5, 'PÁRATE': 5, 'VALE': 5, 'MEDIO': 5,
  'ESPACIO': 4, 'NO SÉ': 4, 'LED': 2, 'LEED': 4, 'RED': 3, 'SOSTÉN': 5,
  'SONRÍE': 5, 'CÓMO': 4, 'COMO': 4, 'PALABRA': 5, 'SIN EMBARGO': 4,
  'UHH': 5, 'UH': 5, 'QUÉ?': 5, 'LISTO': 1, '': 2
};

const WHOS_ON_FIRST_PRIORITIES = {
  'LISTO': ['SÍ', 'OK', 'QUÉ', 'MEDIO', 'IZQUIERDA', 'PRESIONA', 'DERECHA', 'EN BLANCO', 'LISTO', 'NO', 'PRIMERO', 'UHH', 'NADA', 'ESPERA'],
  'PRIMERO': ['IZQUIERDA', 'OK', 'SÍ', 'MEDIO', 'NO', 'DERECHA', 'NADA', 'UHH', 'ESPERA', 'LISTO', 'EN BLANCO', 'QUÉ', 'PRESIONA', 'PRIMERO'],
  'NO': ['EN BLANCO', 'UHH', 'ESPERA', 'PRIMERO', 'QUÉ', 'LISTO', 'DERECHA', 'SÍ', 'NADA', 'IZQUIERDA', 'PRESIONA', 'OK', 'NO', 'MEDIO'],
  'EN BLANCO': ['ESPERA', 'DERECHA', 'OK', 'MEDIO', 'EN BLANCO', 'PRESIONA', 'LISTO', 'NADA', 'NO', 'QUÉ', 'IZQUIERDA', 'UHH', 'SÍ', 'PRIMERO'],
  'NADA': ['UHH', 'DERECHA', 'OK', 'MEDIO', 'SÍ', 'EN BLANCO', 'NO', 'PRESIONA', 'IZQUIERDA', 'QUÉ', 'ESPERA', 'PRIMERO', 'NADA', 'LISTO'],
  'SÍ': ['OK', 'DERECHA', 'UHH', 'MEDIO', 'PRIMERO', 'QUÉ', 'PRESIONA', 'LISTO', 'NADA', 'SÍ', 'IZQUIERDA', 'EN BLANCO', 'NO', 'ESPERA'],
  'QUÉ': ['UHH', 'QUÉ', 'PRIMERO', 'PRESIONA', 'LISTO', 'NADA', 'ESPERA', 'NO', 'MEDIO', 'IZQUIERDA', 'DERECHA', 'EN BLANCO', 'SÍ', 'OK'],
  'UHH': ['LISTO', 'NADA', 'IZQUIERDA', 'QUÉ', 'OK', 'SÍ', 'DERECHA', 'NO', 'PRESIONA', 'EN BLANCO', 'UHH', 'ESPERA', 'PRIMERO', 'MEDIO'],
  'IZQUIERDA': ['DERECHA', 'IZQUIERDA', 'PRIMERO', 'NO', 'MEDIO', 'SÍ', 'EN BLANCO', 'QUÉ', 'UHH', 'ESPERA', 'PRESIONA', 'LISTO', 'OK', 'NADA'],
  'DERECHA': ['SÍ', 'NADA', 'LISTO', 'PRESIONA', 'NO', 'ESPERA', 'QUÉ', 'DERECHA', 'UHH', 'IZQUIERDA', 'PRIMERO', 'MEDIO', 'EN BLANCO', 'OK'],
  'MEDIO': ['EN BLANCO', 'LISTO', 'OK', 'QUÉ', 'NADA', 'PRESIONA', 'NO', 'ESPERA', 'IZQUIERDA', 'MEDIO', 'DERECHA', 'PRIMERO', 'UHH', 'SÍ'],
  'OK': ['MEDIO', 'NO', 'PRIMERO', 'SÍ', 'UHH', 'NADA', 'ESPERA', 'OK', 'IZQUIERDA', 'LISTO', 'EN BLANCO', 'PRESIONA', 'QUÉ', 'DERECHA'],
  'ESPERA': ['UHH', 'NO', 'EN BLANCO', 'OK', 'SÍ', 'IZQUIERDA', 'PRIMERO', 'PRESIONA', 'QUÉ', 'ESPERA', 'NADA', 'LISTO', 'DERECHA', 'MEDIO'],
  'PRESIONA': ['DERECHA', 'MEDIO', 'SÍ', 'LISTO', 'PRESIONA', 'OK', 'NADA', 'UHH', 'EN BLANCO', 'IZQUIERDA', 'PRIMERO', 'ESPERA', 'NO', 'QUÉ'],
  'TÚ': ['SEGURO', 'TÚ ESTÁS', 'TU', 'ESTÁS', 'SIGUIENTE', 'UH HUH', 'TR', 'SOSTÉN', 'QUÉ?', 'T', 'COMO', 'HECHO', 'TÚ', 'UH UH'],
  'ESTÁS': ['TU', 'SIGUIENTE', 'COMO', 'SEGURO', 'TR', 'HECHO', 'UH HUH', 'SOSTÉN', 'T', 'ESTÁS', 'SEGURO', 'UH UH', 'QUÉ?', 'TÚ'],
  'TU': ['TR', 'UH UH', 'ESTÁS', 'T', 'TÚ', 'SEGURO', 'HECHO', 'SIGUIENTE', 'QUÉ?', 'SOSTÉN', 'TU', 'TÚ ESTÁS', 'COMO', 'UH HUH'],
  'TÚ ESTÁS': ['ESTÁS', 'SEGURO', 'SIGUIENTE', 'QUÉ?', 'SOSTÉN', 'TR', 'T', 'TÚ ESTÁS', 'UH UH', 'COMO', 'HECHO', 'UH HUH', 'TÚ', 'TU'],
  'TR': ['HECHO', 'T', 'COMO', 'TÚ', 'QUÉ?', 'SOSTÉN', 'ESTÁS', 'SEGURO', 'TU', 'SIGUIENTE', 'TR', 'TÚ ESTÁS', 'UH HUH', 'UH UH'],
  'T': ['UH HUH', 'SEGURO', 'SIGUIENTE', 'QUÉ?', 'ESTÁS', 'TR', 'UH UH', 'HECHO', 'T', 'SOSTÉN', 'COMO', 'TU', 'TÚ ESTÁS', 'TÚ'],
  'UH HUH': ['UH HUH', 'TU', 'ESTÁS', 'COMO', 'QUÉ?', 'SEGURO', 'TR', 'SIGUIENTE', 'T', 'SOSTÉN', 'HECHO', 'TÚ', 'TÚ ESTÁS', 'UH UH'],
  'UH UH': ['TR', 'COMO', 'T', 'ESTÁS', 'SOSTÉN', 'QUÉ?', 'SEGURO', 'TU', 'UH UH', 'HECHO', 'SIGUIENTE', 'UH HUH', 'TÚ ESTÁS', 'TÚ'],
  'QUÉ?': ['T', 'QUÉ?', 'TÚ', 'TU', 'SOSTÉN', 'ESTÁS', 'SEGURO', 'TR', 'COMO', 'HECHO', 'SIGUIENTE', 'UH HUH', 'TÚ ESTÁS', 'UH UH'],
  'HECHO': ['SEGURO', 'UH HUH', 'SIGUIENTE', 'QUÉ?', 'TU', 'TR', 'SOSTÉN', 'T', 'COMO', 'TÚ ESTÁS', 'UH UH', 'ESTÁS', 'HECHO', 'TÚ'],
  'SIGUIENTE': ['QUÉ?', 'UH HUH', 'TR', 'TU', 'SOSTÉN', 'SEGURO', 'COMO', 'SIGUIENTE', 'HECHO', 'ESTÁS', 'UH UH', 'T', 'TÚ', 'TÚ ESTÁS'],
  'SOSTÉN': ['SEGURO', 'TR', 'SIGUIENTE', 'T', 'ESTÁS', 'COMO', 'SOSTÉN', 'QUÉ?', 'UH HUH', 'TÚ', 'UH UH', 'HECHO', 'TU', 'TÚ ESTÁS'],
  'SEGURO': ['ESTÁS', 'HECHO', 'COMO', 'TR', 'SEGURO', 'SIGUIENTE', 'T', 'SOSTÉN', 'TU', 'TÚ ESTÁS', 'QUÉ?', 'UH HUH', 'TÚ', 'UH UH'],
  'COMO': ['TÚ ESTÁS', 'SIGUIENTE', 'T', 'TR', 'SOSTÉN', 'SEGURO', 'ESTÁS', 'UH UH', 'QUÉ?', 'TÚ', 'COMO', 'UH HUH', 'HECHO', 'TU']
};

const KNOB_PATTERNS = {
  'ARRIBA': [
    { top: [0,0,1,0,1,1], bottom: [1,1,1,1,0,1] },
    { top: [1,0,1,0,1,0], bottom: [0,1,1,0,1,1] }
  ],
  'ABAJO': [
    { top: [0,1,1,0,0,1], bottom: [1,1,1,1,0,1] },
    { top: [1,0,1,0,1,0], bottom: [0,1,0,0,0,1] }
  ],
  'IZQUIERDA': [
    { top: [0,0,0,0,1,0], bottom: [1,0,0,1,1,1] },
    { top: [0,0,0,0,1,0], bottom: [0,0,0,1,1,0] }
  ],
  'DERECHA': [
    { top: [1,0,1,1,1,1], bottom: [1,1,1,0,1,0] },
    { top: [1,0,1,1,0,0], bottom: [1,1,1,0,1,0] }
  ]
};

// Helper utilities
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateSerialNumber() {
  const chars = 'ABCDEFGHIJKLMNPQRSTUVWXYZ0123456789';
  const letters = 'ABCDEFGHIJKLMNPQRSTUVWXYZ';
  const digits = '0123456789';
  let res = '';
  // Ensure last character is a digit or letter with at least 1 digit in serial
  for (let i = 0; i < 5; i++) {
    res += randChoice(chars);
  }
  res += randChoice(digits); // Ensure last character is a digit for odd/even rules
  return res;
}

function createEdgework() {
  const serialNumber = generateSerialNumber();
  const batteryCount = randInt(0, 4);
  const aaBatteries = randInt(0, batteryCount);
  const dBatteries = batteryCount - aaBatteries;

  // Indicators (0 to 3)
  const numIndicators = randInt(0, 3);
  const shuffledLabels = shuffle(INDICATOR_LIST);
  const indicators = [];
  for (let i = 0; i < numIndicators; i++) {
    indicators.push({
      label: shuffledLabels[i],
      lit: Math.random() > 0.45
    });
  }

  // Ports (0 to 3)
  const numPorts = randInt(0, 3);
  const shuffledPorts = shuffle(PORT_LIST);
  const ports = shuffledPorts.slice(0, numPorts);

  const hasVowel = /[AEIOU]/.test(serialNumber);
  const lastChar = serialNumber[serialNumber.length - 1];
  const lastDigit = parseInt(lastChar, 10);
  const isOdd = isNaN(lastDigit) ? false : (lastDigit % 2 !== 0);

  return {
    serialNumber,
    hasVowel,
    isLastDigitOdd: isOdd,
    batteries: {
      total: batteryCount,
      aa: aaBatteries,
      d: dBatteries
    },
    indicators,
    ports
  };
}

// Module Generator 1: Wires
function generateWiresModule(edgework) {
  const count = randInt(3, 6);
  const wires = [];
  for (let i = 0; i < count; i++) {
    wires.push(randChoice(WIRE_COLORS));
  }

  // Calculate correct wire index (0-indexed)
  const redCount = wires.filter(w => w === 'rojo').length;
  const blueCount = wires.filter(w => w === 'azul').length;
  const yellowCount = wires.filter(w => w === 'amarillo').length;
  const whiteCount = wires.filter(w => w === 'blanco').length;
  const blackCount = wires.filter(w => w === 'negro').length;
  const lastWire = wires[wires.length - 1];
  const odd = edgework.isLastDigitOdd;

  let correctIndex = -1;

  if (count === 3) {
    if (redCount === 0) {
      correctIndex = 1; // 2nd wire
    } else if (lastWire === 'blanco') {
      correctIndex = 2; // last wire
    } else if (blueCount > 1) {
      correctIndex = wires.lastIndexOf('azul');
    } else {
      correctIndex = 2; // last wire
    }
  } else if (count === 4) {
    if (redCount > 1 && odd) {
      correctIndex = wires.lastIndexOf('rojo');
    } else if (lastWire === 'amarillo' && redCount === 0) {
      correctIndex = 0; // 1st wire
    } else if (blueCount === 1) {
      correctIndex = 0; // 1st wire
    } else if (yellowCount > 1) {
      correctIndex = 3; // last wire
    } else {
      correctIndex = 1; // 2nd wire
    }
  } else if (count === 5) {
    if (lastWire === 'negro' && odd) {
      correctIndex = 3; // 4th wire
    } else if (redCount === 1 && yellowCount > 1) {
      correctIndex = 0; // 1st wire
    } else if (blackCount === 0) {
      correctIndex = 1; // 2nd wire
    } else {
      correctIndex = 0; // 1st wire
    }
  } else if (count === 6) {
    if (yellowCount === 0 && odd) {
      correctIndex = 2; // 3rd wire
    } else if (yellowCount === 1 && whiteCount > 1) {
      correctIndex = 3; // 4th wire
    } else if (redCount === 0) {
      correctIndex = 5; // last wire
    } else {
      correctIndex = 3; // 4th wire
    }
  }

  return {
    id: 'wires',
    type: 'wires',
    title: 'Cables',
    wires,
    correctIndex,
    solved: false
  };
}

// Module Generator 2: The Button
function generateButtonModule(edgework) {
  const color = randChoice(BUTTON_COLORS);
  const label = randChoice(BUTTON_LABELS);
  const stripColor = randChoice(STRIP_COLORS);

  const hasLitCAR = edgework.indicators.some(ind => ind.label === 'CAR' && ind.lit);
  const hasLitFRK = edgework.indicators.some(ind => ind.label === 'FRK' && ind.lit);
  const totalBatteries = edgework.batteries.total;

  let action = 'hold'; // 'tap' or 'hold'

  // Manual rules in order:
  if (color === 'azul' && label === 'Abortar') {
    action = 'hold';
  } else if (totalBatteries > 1 && label === 'Detonar') {
    action = 'tap';
  } else if (color === 'blanco' && hasLitCAR) {
    action = 'hold';
  } else if (totalBatteries > 2 && hasLitFRK) {
    action = 'tap';
  } else if (color === 'amarillo') {
    action = 'hold';
  } else if (color === 'rojo' && label === 'Mantener') {
    action = 'tap';
  } else {
    action = 'hold';
  }

  // Strip rule:
  let releaseDigit = 1;
  if (stripColor === 'azul') releaseDigit = 4;
  else if (stripColor === 'blanco') releaseDigit = 1;
  else if (stripColor === 'amarillo') releaseDigit = 5;
  else releaseDigit = 1;

  return {
    id: 'the_button',
    type: 'the_button',
    title: 'El Botón',
    color,
    label,
    stripColor,
    requiredAction: action, // 'tap' or 'hold'
    releaseDigit,
    solved: false
  };
}

// Module Generator 3: Keypads
function generateKeypadsModule() {
  const colIndex = randInt(0, KEYPAD_COLUMNS.length - 1);
  const column = KEYPAD_COLUMNS[colIndex];
  
  // Choose 4 distinct symbols from this column
  const chosenIndices = [];
  while (chosenIndices.length < 4) {
    const idx = randInt(0, column.length - 1);
    if (!chosenIndices.includes(idx)) {
      chosenIndices.push(idx);
    }
  }

  // Sort ascending by column order to determine correct pressing sequence
  chosenIndices.sort((a, b) => a - b);
  const correctSequence = chosenIndices.map(idx => column[idx]);

  // Display symbols shuffled
  const displaySymbols = shuffle([...correctSequence]);

  return {
    id: 'keypads',
    type: 'keypads',
    title: 'Teclados',
    displaySymbols,
    correctSequence,
    currentStep: 0,
    solved: false
  };
}

// Module Generator 4: Simon Says
function generateSimonSaysModule(edgework) {
  const length = randInt(3, 4);
  const colors = ['rojo', 'azul', 'verde', 'amarillo'];
  const sequence = [];
  for (let i = 0; i < length; i++) {
    sequence.push(randChoice(colors));
  }

  return {
    id: 'simon_says',
    type: 'simon_says',
    title: 'Simón Dice',
    sequence,
    currentStage: 1, // goes up to sequence.length
    playerStep: 0,
    solved: false
  };
}

function getSimonSaysMapping(hasVowel, strikes, inputColor) {
  // Table 1: Vowel in serial
  if (hasVowel) {
    if (strikes === 0) {
      if (inputColor === 'rojo') return 'azul';
      if (inputColor === 'azul') return 'rojo';
      if (inputColor === 'verde') return 'amarillo';
      if (inputColor === 'amarillo') return 'verde';
    } else if (strikes === 1) {
      if (inputColor === 'rojo') return 'amarillo';
      if (inputColor === 'azul') return 'verde';
      if (inputColor === 'verde') return 'azul';
      if (inputColor === 'amarillo') return 'rojo';
    } else {
      // 2 strikes
      if (inputColor === 'rojo') return 'verde';
      if (inputColor === 'azul') return 'rojo';
      if (inputColor === 'verde') return 'amarillo';
      if (inputColor === 'amarillo') return 'azul';
    }
  } else {
    // Table 2: No Vowel
    if (strikes === 0) {
      if (inputColor === 'rojo') return 'azul';
      if (inputColor === 'azul') return 'amarillo';
      if (inputColor === 'verde') return 'verde';
      if (inputColor === 'amarillo') return 'rojo';
    } else if (strikes === 1) {
      if (inputColor === 'rojo') return 'rojo';
      if (inputColor === 'azul') return 'azul';
      if (inputColor === 'verde') return 'amarillo';
      if (inputColor === 'amarillo') return 'verde';
    } else {
      // 2 strikes
      if (inputColor === 'rojo') return 'amarillo';
      if (inputColor === 'azul') return 'verde';
      if (inputColor === 'verde') return 'azul';
      if (inputColor === 'amarillo') return 'rojo';
    }
  }
  return inputColor;
}

// Module Generator 5: Who's on First
function generateWhosOnFirstModule() {
  const displayWords = Object.keys(WHOS_ON_FIRST_DISPLAYS);
  const buttonWordList = Object.keys(WHOS_ON_FIRST_PRIORITIES);

  function createStage() {
    const display = randChoice(displayWords);
    const readPos = WHOS_ON_FIRST_DISPLAYS[display];

    // Pick 6 distinct words for buttons
    const buttons = [];
    const pool = shuffle([...buttonWordList]);
    for (let i = 0; i < 6; i++) {
      buttons.push(pool[i]);
    }

    const wordAtPos = buttons[readPos];
    const priorityList = WHOS_ON_FIRST_PRIORITIES[wordAtPos] || [];

    // Find first word in priorityList that is present in buttons
    let correctButton = null;
    let correctIndex = -1;
    for (const w of priorityList) {
      const idx = buttons.indexOf(w);
      if (idx !== -1) {
        correctButton = w;
        correctIndex = idx;
        break;
      }
    }

    return {
      display,
      buttons,
      correctIndex,
      correctWord: correctButton
    };
  }

  const stages = [createStage(), createStage(), createStage()];

  return {
    id: 'whos_on_first',
    type: 'whos_on_first',
    title: '¿Quién va Primero?',
    stages,
    currentStage: 0,
    solved: false
  };
}

// Module Generator 6: Memory
function generateMemoryModule() {
  function createStage(stageNumber, history) {
    const display = randInt(1, 4);
    const buttons = shuffle([1, 2, 3, 4]); // 4 distinct numbers 1..4

    let correctIndex = -1; // 0-indexed position
    let correctLabel = -1;

    if (stageNumber === 1) {
      // display 1 -> pos 2; display 2 -> pos 2; display 3 -> pos 3; display 4 -> pos 4
      if (display === 1 || display === 2) correctIndex = 1;
      else if (display === 3) correctIndex = 2;
      else correctIndex = 3;
      correctLabel = buttons[correctIndex];
    } else if (stageNumber === 2) {
      // display 1: label 4; display 2: pos stage 1; display 3: pos 1; display 4: pos stage 1
      if (display === 1) {
        correctLabel = 4;
        correctIndex = buttons.indexOf(4);
      } else if (display === 2 || display === 4) {
        correctIndex = history[0].position;
        correctLabel = buttons[correctIndex];
      } else if (display === 3) {
        correctIndex = 0;
        correctLabel = buttons[0];
      }
    } else if (stageNumber === 3) {
      // display 1: label stage 2; display 2: label stage 1; display 3: pos 3; display 4: label 4
      if (display === 1) {
        correctLabel = history[1].label;
        correctIndex = buttons.indexOf(correctLabel);
      } else if (display === 2) {
        correctLabel = history[0].label;
        correctIndex = buttons.indexOf(correctLabel);
      } else if (display === 3) {
        correctIndex = 2;
        correctLabel = buttons[2];
      } else if (display === 4) {
        correctLabel = 4;
        correctIndex = buttons.indexOf(4);
      }
    } else if (stageNumber === 4) {
      // display 1: pos stage 1; display 2: pos 1; display 3: pos stage 2; display 4: pos stage 2
      if (display === 1) {
        correctIndex = history[0].position;
        correctLabel = buttons[correctIndex];
      } else if (display === 2) {
        correctIndex = 0;
        correctLabel = buttons[0];
      } else if (display === 3 || display === 4) {
        correctIndex = history[1].position;
        correctLabel = buttons[correctIndex];
      }
    } else if (stageNumber === 5) {
      // display 1: label stage 1; display 2: label stage 2; display 3: label stage 4; display 4: label stage 3
      if (display === 1) {
        correctLabel = history[0].label;
        correctIndex = buttons.indexOf(correctLabel);
      } else if (display === 2) {
        correctLabel = history[1].label;
        correctIndex = buttons.indexOf(correctLabel);
      } else if (display === 3) {
        correctLabel = history[3].label;
        correctIndex = buttons.indexOf(correctLabel);
      } else if (display === 4) {
        correctLabel = history[2].label;
        correctIndex = buttons.indexOf(correctLabel);
      }
    }

    return {
      display,
      buttons,
      correctIndex,
      correctLabel
    };
  }

  // Pre-generate all 5 stages based on simulated correct answers
  const stages = [];
  const history = [];
  for (let s = 1; s <= 5; s++) {
    const stageData = createStage(s, history);
    stages.push(stageData);
    history.push({ position: stageData.correctIndex, label: stageData.correctLabel });
  }

  return {
    id: 'memory',
    type: 'memory',
    title: 'Memoria',
    stages,
    currentStage: 0,
    history: [],
    solved: false
  };
}

// Module Generator 7: Morse Code
function generateMorseCodeModule() {
  const words = Object.keys(MORSE_DICTIONARY);
  const chosenWord = randChoice(words);
  const correctFrequency = MORSE_DICTIONARY[chosenWord];

  // Convert word to morse string representation
  const morsePattern = chosenWord.split('').map(letter => MORSE_ENCODING[letter] || '').join(' / ');

  return {
    id: 'morse_code',
    type: 'morse_code',
    title: 'Código Morse',
    word: chosenWord,
    morsePattern,
    correctFrequency,
    solved: false
  };
}

// Module Generator 8: Passwords
function generatePasswordsModule() {
  const secretWord = randChoice(PASSWORD_WORDS);
  const alphabet = 'abcdefghijklmnopqrstuvwxyz';

  // 5 columns, 6 letters each
  // Ensure that out of PASSWORD_WORDS, only secretWord matches all 5 columns
  let columns = [];
  let attempts = 0;

  while (attempts < 100) {
    attempts++;
    columns = [];
    for (let i = 0; i < 5; i++) {
      const colLetters = new Set([secretWord[i]]);
      while (colLetters.size < 6) {
        colLetters.add(randChoice(alphabet));
      }
      columns.push(shuffle(Array.from(colLetters)));
    }

    // Verify how many words match
    const matches = PASSWORD_WORDS.filter(w => {
      for (let i = 0; i < 5; i++) {
        if (!columns[i].includes(w[i])) return false;
      }
      return true;
    });

    if (matches.length === 1 && matches[0] === secretWord) {
      break;
    }
  }

  return {
    id: 'passwords',
    type: 'passwords',
    title: 'Contraseñas',
    secretWord,
    columns,
    solved: false
  };
}

// Module Generator 9: Needy Knob
function generateNeedyKnobModule() {
  const directions = ['ARRIBA', 'ABAJO', 'IZQUIERDA', 'DERECHA'];
  const targetDirection = randChoice(directions);
  const patterns = KNOB_PATTERNS[targetDirection];
  const chosenPattern = randChoice(patterns);

  return {
    id: 'needy_knob',
    type: 'needy_knob',
    title: 'Exigente: Perillas',
    isNeedy: true,
    targetDirection,
    leds: chosenPattern, // { top: [6], bottom: [6] }
    timerSeconds: 35,
    active: false
  };
}

// Module Generator 10: Needy Vent & Capacitor
function generateNeedyVentCapacitorModule() {
  const isQuestion = Math.random() > 0.4;
  let question = '¿VENTILAR GAS?';
  let correctAnswer = 'S';

  if (isQuestion) {
    if (Math.random() > 0.5) {
      question = '¿DETONAR?';
      correctAnswer = 'N';
    } else {
      question = '¿VENTILAR GAS?';
      correctAnswer = 'S';
    }
  }

  return {
    id: 'needy_vent_capacitor',
    type: 'needy_vent_capacitor',
    title: 'Exigente: Gas / Condensador',
    isNeedy: true,
    isQuestion,
    question,
    correctAnswer,
    capacitorCharge: 0, // 0 to 100
    thermalLevel: 0, // 0 to 100
    timerSeconds: 40,
    active: false
  };
}

// Main Bomb Generator
function generateBomb(difficulty = 'normal') {
  const edgework = createEdgework();
  let moduleCount = 4;
  if (difficulty === 'facil' || difficulty === 'easy') moduleCount = 2;
  if (difficulty === 'experto' || difficulty === 'expert' || difficulty === 'dificil' || difficulty === 'hard') moduleCount = 6;

  // Pool of the 6 selected modules (wires, the_button, keypads, simon_says, memory, passwords)
  const regularGenerators = [
    () => generateWiresModule(edgework),
    () => generateButtonModule(edgework),
    () => generateKeypadsModule(),
    () => generateSimonSaysModule(edgework),
    () => generateMemoryModule(),
    () => generatePasswordsModule()
  ];

  const shuffledGenerators = shuffle(regularGenerators);
  const selectedModules = [];

  // Pick moduleCount defusable modules (no needy modules for clean gameplay)
  const countToPick = Math.min(moduleCount, shuffledGenerators.length);
  for (let i = 0; i < countToPick; i++) {
    selectedModules.push(shuffledGenerators[i]());
  }

  const baseTimeSeconds = difficulty === 'facil' ? 300 : (difficulty === 'experto' ? 420 : 360);

  return {
    edgework,
    modules: selectedModules,
    strikes: 0,
    maxStrikes: 3,
    timeRemainingMs: baseTimeSeconds * 1000,
    baseTimeSeconds,
    status: 'waiting', // 'waiting', 'active', 'defused', 'exploded'
    difficulty,
    thermalLevel: 0, // 0 - 100
    isLockedThermal: false
  };
}

module.exports = {
  generateBomb,
  createEdgework,
  getSimonSaysMapping,
  MORSE_DICTIONARY,
  PASSWORD_WORDS,
  KNOB_PATTERNS
};

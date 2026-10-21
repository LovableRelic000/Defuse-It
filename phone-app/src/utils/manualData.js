// src/utils/manualData.js - Complete Spanish Manual v1-es Reference Data

export const MORSE_TABLE = [
  { word: 'freno', freq: '3.505 MHz', morse: '..-. .-. . -. ---' },
  { word: 'hongos', freq: '3.515 MHz', morse: '.... --- -. --. --- ...' },
  { word: 'lentes', freq: '3.522 MHz', morse: '.-.. . -. - . ...' },
  { word: 'biela', freq: '3.532 MHz', morse: '-... .. . .-.. .-' },
  { word: 'resta', freq: '3.535 MHz', morse: '.-. . ... - .-' },
  { word: 'trato', freq: '3.542 MHz', morse: '- .-. .- - ---' },
  { word: 'volar', freq: '3.545 MHz', morse: '...- --- .-.. .- .-.' },
  { word: 'vuelta', freq: '3.552 MHz', morse: '...- ..- . .-.. - .-' },
  { word: 'llaves', freq: '3.555 MHz', morse: '.-.. .-.. .- ...- . ...' },
  { word: 'tabla', freq: '3.565 MHz', morse: '- .- -... .-.. .-' },
  { word: 'tronco', freq: '3.572 MHz', morse: '- .-. --- -. -.-. ---' },
  { word: 'bomba', freq: '3.575 MHz', morse: '-... --- -- -... .-' },
  { word: 'santos', freq: '3.582 MHz', morse: '... .- -. - --- ...' },
  { word: 'senso', freq: '3.592 MHz', morse: '... . -. ... ---' },
  { word: 'ratas', freq: '3.595 MHz', morse: '.-. .- - .- ...' },
  { word: 'trenes', freq: '3.600 MHz', morse: '- .-. . -. . ...' }
];

export const PASSWORD_WORDS = [
  'abajo', 'altar', 'bajar', 'bomba', 'bueno', 'cable', 'cerca', 'corto', 'delta', 'donde',
  'estar', 'falta', 'gomas', 'grasa', 'hogar', 'hueso', 'listo', 'lugar', 'magia', 'miedo',
  'mundo', 'nunca', 'otros', 'pasar', 'pasos', 'perca', 'plata', 'punto', 'queso', 'ronda',
  'salto', 'suena', 'tasar', 'traba', 'valor'
];

export const KEYPAD_COLUMNS = [
  ['Ϙ', 'Ѧ', 'ƛ', 'Ϟ', 'Ѭ', 'ϗ', 'Ͽ'],
  ['Ӭ', 'Ϙ', 'Ͽ', 'Ҩ', '☆', 'ϗ', '¿'],
  ['©', 'Ѽ', 'Ҩ', 'Җ', 'Ԇ', 'ƛ', '☆'],
  ['б', '¶', 'Ѣ', 'Ѭ', 'Җ', '¿', '☺'],
  ['Ψ', '☺', 'Ѣ', 'Ͼ', '¶', 'Ѯ', '★'],
  ['б', 'Ӭ', '⊕', 'æ', 'Ψ', 'Ԋ', 'Ω']
];

export const WHOS_ON_FIRST_POSITIONS = {
  'SÍ': 'Medio Izq', 'PRIMERO': 'Arriba Der', 'NO': 'Abajo Der', 'EN BLANCO': 'Medio Der',
  'NADA': 'Medio Izq', 'OK': 'Medio Der', 'QUÉ': 'Abajo Der', 'QUE': 'Abajo Der',
  'ESPERA': 'Abajo Der', 'PÁRATE': 'Abajo Der', 'VALE': 'Abajo Der', 'MEDIO': 'Abajo Der',
  'ESPACIO': 'Abajo Izq', 'NO SÉ': 'Abajo Izq', 'LED': 'Medio Izq', 'LEED': 'Abajo Izq',
  'RED': 'Medio Der', 'SOSTÉN': 'Abajo Der', 'SONRÍE': 'Abajo Der', 'CÓMO': 'Abajo Izq',
  'COMO': 'Abajo Izq', 'PALABRA': 'Abajo Der', 'SIN EMBARGO': 'Abajo Izq',
  'UHH': 'Abajo Der', 'UH': 'Abajo Der', 'QUÉ?': 'Abajo Der', 'LISTO': 'Arriba Der',
  '[VACÍO]': 'Medio Izq'
};

export const WHOS_ON_FIRST_LISTS = {
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

export const SIMON_TABLES = {
  vowel: {
    strikes0: { rojo: 'azul', azul: 'rojo', verde: 'amarillo', amarillo: 'verde' },
    strikes1: { rojo: 'amarillo', azul: 'verde', verde: 'azul', amarillo: 'rojo' },
    strikes2: { rojo: 'verde', azul: 'rojo', verde: 'amarillo', amarillo: 'azul' }
  },
  noVowel: {
    strikes0: { rojo: 'azul', azul: 'amarillo', verde: 'verde', amarillo: 'rojo' },
    strikes1: { rojo: 'rojo', azul: 'azul', verde: 'amarillo', amarillo: 'verde' },
    strikes2: { rojo: 'amarillo', azul: 'verde', verde: 'azul', amarillo: 'rojo' }
  }
};

export const KNOB_MANUAL_PATTERNS = [
  { dir: 'ARRIBA', top: '0 0 1 0 1 1', bot: '1 1 1 1 0 1' },
  { dir: 'ARRIBA', top: '1 0 1 0 1 0', bot: '0 1 1 0 1 1' },
  { dir: 'ABAJO', top: '0 1 1 0 0 1', bot: '1 1 1 1 0 1' },
  { dir: 'ABAJO', top: '1 0 1 0 1 0', bot: '0 1 0 0 0 1' },
  { dir: 'IZQUIERDA', top: '0 0 0 0 1 0', bot: '1 0 0 1 1 1' },
  { dir: 'IZQUIERDA', top: '0 0 0 0 1 0', bot: '0 0 0 1 1 0' },
  { dir: 'DERECHA', top: '1 0 1 1 1 1', bot: '1 1 1 0 1 0' },
  { dir: 'DERECHA', top: '1 0 1 1 0 0', bot: '1 1 1 0 1 0' }
];

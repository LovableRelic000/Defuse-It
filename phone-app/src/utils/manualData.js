// src/utils/manualData.js - Core Spanish Manual v1-es Reference Data (6 Modules)

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

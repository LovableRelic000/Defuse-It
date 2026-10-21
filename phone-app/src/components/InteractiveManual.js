// src/components/InteractiveManual.js - Complete Spanish Defusal Manual v1-es
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput
} from 'react-native';
import {
  MORSE_TABLE,
  PASSWORD_WORDS,
  KEYPAD_COLUMNS,
  WHOS_ON_FIRST_POSITIONS,
  WHOS_ON_FIRST_LISTS,
  SIMON_TABLES,
  KNOB_MANUAL_PATTERNS
} from '../utils/manualData';

const MODULE_TABS = [
  { key: 'wires', label: '1. Cables' },
  { key: 'the_button', label: '2. El Botón' },
  { key: 'keypads', label: '3. Teclados' },
  { key: 'simon_says', label: '4. Simón Dice' },
  { key: 'whos_on_first', label: '5. ¿Quién va 1º?' },
  { key: 'memory', label: '6. Memoria' },
  { key: 'morse_code', label: '7. Cód. Morse' },
  { key: 'passwords', label: '8. Contraseñas' },
  { key: 'needy_knob', label: '9. Perillas' },
  { key: 'needy_vent', label: '10. Gas/Cond.' },
  { key: 'appendices', label: 'Apéndices' }
];

export default function InteractiveManual() {
  const [activeTab, setActiveTab] = useState('wires');

  // Simon Says interactive state
  const [simonHasVowel, setSimonHasVowel] = useState(true);
  const [simonStrikes, setSimonStrikes] = useState(0);

  // Who's on first search
  const [wofDisplayQuery, setWofDisplayQuery] = useState('');
  const [wofButtonQuery, setWofButtonQuery] = useState('');

  // Morse search
  const [morseSearch, setMorseSearch] = useState('');

  // Password column filters
  const [passCol1, setPassCol1] = useState('');
  const [passCol2, setPassCol2] = useState('');
  const [passCol3, setPassCol3] = useState('');
  const [passCol4, setPassCol4] = useState('');
  const [passCol5, setPassCol5] = useState('');

  // Render Module Content
  const renderContent = () => {
    switch (activeTab) {
      case 'wires':
        return (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>MÓDULO 1: CABLES</Text>
            <Text style={styles.sectionSubtitle}>
              Corta únicamente el cable correcto según las reglas. El orden es de arriba a abajo.
            </Text>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>3 CABLES</Text>
              <Text style={styles.rule}>• Si no hay cables rojos, corta el segundo cable.</Text>
              <Text style={styles.rule}>• De lo contrario, si el último cable es blanco, corta el último cable.</Text>
              <Text style={styles.rule}>• De lo contrario, si hay más de un cable azul, corta el último cable azul.</Text>
              <Text style={styles.rule}>• De lo contrario, corta el último cable.</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>4 CABLES</Text>
              <Text style={styles.rule}>• Si hay más de un cable rojo y el último dígito del número de serie es impar, corta el último cable rojo.</Text>
              <Text style={styles.rule}>• De lo contrario, si el último cable es amarillo y no hay cables rojos, corta el primer cable.</Text>
              <Text style={styles.rule}>• De lo contrario, si hay exactamente un cable azul, corta el primer cable.</Text>
              <Text style={styles.rule}>• De lo contrario, si hay más de un cable amarillo, corta el último cable.</Text>
              <Text style={styles.rule}>• De lo contrario, corta el segundo cable.</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>5 CABLES</Text>
              <Text style={styles.rule}>• Si el último cable es negro y el último dígito del número de serie es impar, corta el cuarto cable.</Text>
              <Text style={styles.rule}>• De lo contrario, si hay exactamente un cable rojo y hay más de un cable amarillo, corta el primer cable.</Text>
              <Text style={styles.rule}>• De lo contrario, si no hay cables negros, corta el segundo cable.</Text>
              <Text style={styles.rule}>• De lo contrario, corta el primer cable.</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>6 CABLES</Text>
              <Text style={styles.rule}>• Si no hay cables amarillos y el último dígito del número de serie es impar, corta el tercer cable.</Text>
              <Text style={styles.rule}>• De lo contrario, si hay exactamente un cable amarillo y hay más de un cable blanco, corta el cuarto cable.</Text>
              <Text style={styles.rule}>• De lo contrario, si no hay cables rojos, corta el último cable.</Text>
              <Text style={styles.rule}>• De lo contrario, corta el cuarto cable.</Text>
            </View>
          </View>
        );

      case 'the_button':
        return (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>MÓDULO 2: EL BOTÓN</Text>
            <Text style={styles.sectionSubtitle}>
              Sigue la primera regla que coincida con las características del botón.
            </Text>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>REGLAS EN ORDEN</Text>
              <Text style={styles.rule}>1. Si el botón es <Text style={styles.hlBlue}>azul</Text> y dice "Abortar", <Text style={styles.hlBold}>mantén presionado</Text> y consulta "Soltar un Botón Presionado".</Text>
              <Text style={styles.rule}>2. Si hay más de 1 batería y el botón dice "Detonar", <Text style={styles.hlBold}>presiona y suelta inmediatamente</Text>.</Text>
              <Text style={styles.rule}>3. Si el botón es <Text style={styles.hlWhite}>blanco</Text> y hay un indicador encendido <Text style={styles.hlYellow}>CAR</Text>, <Text style={styles.hlBold}>mantén presionado</Text> y consulta "Soltar".</Text>
              <Text style={styles.rule}>4. Si hay más de 2 baterías y hay un indicador encendido <Text style={styles.hlYellow}>FRK</Text>, <Text style={styles.hlBold}>presiona y suelta inmediatamente</Text>.</Text>
              <Text style={styles.rule}>5. Si el botón es <Text style={styles.hlYellow}>amarillo</Text>, <Text style={styles.hlBold}>mantén presionado</Text> y consulta "Soltar".</Text>
              <Text style={styles.rule}>6. Si el botón es <Text style={styles.hlRed}>rojo</Text> y dice "Mantener", <Text style={styles.hlBold}>presiona y suelta inmediatamente</Text>.</Text>
              <Text style={styles.rule}>7. Si no se aplica ninguna anterior, <Text style={styles.hlBold}>mantén presionado</Text> y consulta "Soltar".</Text>
            </View>

            <View style={[styles.card, styles.cardAccent]}>
              <Text style={styles.cardTitle}>SOLTAR UN BOTÓN PRESIONADO (FRANJA LUMINOSA)</Text>
              <Text style={styles.rule}>Al mantener presionado se ilumina una franja lateral:</Text>
              <Text style={styles.stripRule}><Text style={styles.hlBlue}>• Franja Azul:</Text> Suelta cuando el temporizador tenga un <Text style={styles.hlNumber}>4</Text> en cualquier posición.</Text>
              <Text style={styles.stripRule}><Text style={styles.hlWhite}>• Franja Blanca:</Text> Suelta cuando el temporizador tenga un <Text style={styles.hlNumber}>1</Text> en cualquier posición.</Text>
              <Text style={styles.stripRule}><Text style={styles.hlYellow}>• Franja Amarilla:</Text> Suelta cuando el temporizador tenga un <Text style={styles.hlNumber}>5</Text> en cualquier posición.</Text>
              <Text style={styles.stripRule}><Text style={styles.hlRed}>• Cualquier otro color:</Text> Suelta cuando el temporizador tenga un <Text style={styles.hlNumber}>1</Text> en cualquier posición.</Text>
            </View>
          </View>
        );

      case 'keypads':
        return (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>MÓDULO 3: TECLADOS (SÍMBOLOS)</Text>
            <Text style={styles.sectionSubtitle}>
              Solo UNA columna contiene los 4 símbolos de la bomba. Presiónalos en el orden vertical (de arriba a abajo) de esa columna.
            </Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.keypadScroll}>
              {KEYPAD_COLUMNS.map((col, cIdx) => (
                <View key={cIdx} style={styles.keypadColumnCard}>
                  <Text style={styles.keypadColHeader}>COL {cIdx + 1}</Text>
                  {col.map((sym, sIdx) => (
                    <View key={sIdx} style={styles.symbolItem}>
                      <Text style={styles.symbolChar}>{sym}</Text>
                      <Text style={styles.symbolOrder}>{sIdx + 1}</Text>
                    </View>
                  ))}
                </View>
              ))}
            </ScrollView>
          </View>
        );

      case 'simon_says': {
        const mappingTable = simonHasVowel
          ? (simonStrikes === 0 ? SIMON_TABLES.vowel.strikes0 :
             simonStrikes === 1 ? SIMON_TABLES.vowel.strikes1 : SIMON_TABLES.vowel.strikes2)
          : (simonStrikes === 0 ? SIMON_TABLES.noVowel.strikes0 :
             simonStrikes === 1 ? SIMON_TABLES.noVowel.strikes1 : SIMON_TABLES.noVowel.strikes2);

        return (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>MÓDULO 4: SIMÓN DICE (CALCULADORA)</Text>
            <Text style={styles.sectionSubtitle}>
              Selecciona si el Serial tiene vocal y el número de fallos para ver la respuesta exacta.
            </Text>

            {/* Vocal Switch */}
            <View style={styles.calcControlRow}>
              <Text style={styles.calcLabel}>¿Vocal en el Serial?</Text>
              <View style={styles.toggleRow}>
                <TouchableOpacity
                  style={[styles.toggleBtn, simonHasVowel && styles.toggleBtnActive]}
                  onPress={() => setSimonHasVowel(true)}
                >
                  <Text style={[styles.toggleBtnText, simonHasVowel && styles.toggleBtnTextActive]}>SÍ (Vocal)</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.toggleBtn, !simonHasVowel && styles.toggleBtnActive]}
                  onPress={() => setSimonHasVowel(false)}
                >
                  <Text style={[styles.toggleBtnText, !simonHasVowel && styles.toggleBtnTextActive]}>NO (Sin Vocal)</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Strikes Switch */}
            <View style={styles.calcControlRow}>
              <Text style={styles.calcLabel}>Fallos en la Bomba:</Text>
              <View style={styles.toggleRow}>
                {[0, 1, 2].map(st => (
                  <TouchableOpacity
                    key={st}
                    style={[styles.toggleBtn, simonStrikes === st && styles.toggleBtnActive]}
                    onPress={() => setSimonStrikes(st)}
                  >
                    <Text style={[styles.toggleBtnText, simonStrikes === st && styles.toggleBtnTextActive]}>
                      {st} {st === 1 ? 'Fallo' : 'Fallos'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Visual Color Mapping Results */}
            <View style={styles.simonGrid}>
              {['rojo', 'azul', 'verde', 'amarillo'].map(c => {
                const mapped = mappingTable[c];
                return (
                  <View key={c} style={styles.simonPairCard}>
                    <Text style={styles.simonFlashes}>Luz {c.toUpperCase()}</Text>
                    <Text style={styles.simonArrow}>➔</Text>
                    <Text style={[styles.simonPress, { color: getTextColor(mapped) }]}>
                      PULSA {mapped.toUpperCase()}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        );
      }

      case 'whos_on_first': {
        const filteredPositions = Object.keys(WHOS_ON_FIRST_POSITIONS).filter(k =>
          k.toLowerCase().includes(wofDisplayQuery.toLowerCase())
        );
        const filteredButtons = Object.keys(WHOS_ON_FIRST_LISTS).filter(k =>
          k.toLowerCase().includes(wofButtonQuery.toLowerCase())
        );

        return (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>MÓDULO 5: ¿QUIÉN VA PRIMERO?</Text>
            
            {/* Step 1 Searcher */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>PASO 1: PALABRA EN LA PANTALLA</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar palabra mostrada en pantalla..."
                placeholderTextColor="#666"
                value={wofDisplayQuery}
                onChangeText={setWofDisplayQuery}
              />
              <View style={styles.tableList}>
                {filteredPositions.slice(0, 8).map((word, idx) => (
                  <View key={idx} style={styles.tableRow}>
                    <Text style={styles.tableCol1}>{word === '' ? '[EN BLANCO]' : word}</Text>
                    <Text style={styles.tableCol2}>Leer botón: <Text style={styles.hlPos}>{WHOS_ON_FIRST_POSITIONS[word]}</Text></Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Step 2 Searcher */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>PASO 2: LISTAS DE PRIORIDAD</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar etiqueta del botón leído..."
                placeholderTextColor="#666"
                value={wofButtonQuery}
                onChangeText={setWofButtonQuery}
              />
              {filteredButtons.slice(0, 3).map((btnWord, idx) => (
                <View key={idx} style={styles.priorityBox}>
                  <Text style={styles.priorityHeader}>Si el botón leído dice "{btnWord}":</Text>
                  <Text style={styles.priorityText}>
                    Presiona el primer botón que coincida en:{'\n'}
                    <Text style={styles.priorityItems}>{WHOS_ON_FIRST_LISTS[btnWord].join(', ')}</Text>
                  </Text>
                </View>
              ))}
            </View>
          </View>
        );
      }

      case 'memory':
        return (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>MÓDULO 6: MEMORIA</Text>
            <Text style={styles.sectionSubtitle}>
              Presiona el botón correcto para avanzar por las 5 etapas. Las posiciones son del 1 (izquierda) al 4 (derecha).
            </Text>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>ETAPA 1</Text>
              <Text style={styles.rule}>• Si pantalla es 1: presiona botón en la posición 2.</Text>
              <Text style={styles.rule}>• Si pantalla es 2: presiona botón en la posición 2.</Text>
              <Text style={styles.rule}>• Si pantalla es 3: presiona botón en la posición 3.</Text>
              <Text style={styles.rule}>• Si pantalla es 4: presiona botón en la posición 4.</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>ETAPA 2</Text>
              <Text style={styles.rule}>• Si pantalla es 1: presiona el botón con el número "4".</Text>
              <Text style={styles.rule}>• Si pantalla es 2: presiona en la misma posición que en Etapa 1.</Text>
              <Text style={styles.rule}>• Si pantalla es 3: presiona botón en la posición 1.</Text>
              <Text style={styles.rule}>• Si pantalla es 4: presiona en la misma posición que en Etapa 1.</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>ETAPA 3</Text>
              <Text style={styles.rule}>• Si pantalla es 1: presiona botón con el mismo número que en Etapa 2.</Text>
              <Text style={styles.rule}>• Si pantalla es 2: presiona botón con el mismo número que en Etapa 1.</Text>
              <Text style={styles.rule}>• Si pantalla es 3: presiona botón en la posición 3.</Text>
              <Text style={styles.rule}>• Si pantalla es 4: presiona el botón con el número "4".</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>ETAPA 4</Text>
              <Text style={styles.rule}>• Si pantalla es 1: presiona en la misma posición que en Etapa 1.</Text>
              <Text style={styles.rule}>• Si pantalla es 2: presiona botón en la posición 1.</Text>
              <Text style={styles.rule}>• Si pantalla es 3: presiona en la misma posición que en Etapa 2.</Text>
              <Text style={styles.rule}>• Si pantalla es 4: presiona en la misma posición que en Etapa 2.</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>ETAPA 5</Text>
              <Text style={styles.rule}>• Si pantalla es 1: presiona botón con el mismo número que en Etapa 1.</Text>
              <Text style={styles.rule}>• Si pantalla es 2: presiona botón con el mismo número que en Etapa 2.</Text>
              <Text style={styles.rule}>• Si pantalla es 3: presiona botón con el mismo número que en Etapa 4.</Text>
              <Text style={styles.rule}>• Si pantalla es 4: presiona botón con el mismo número que en Etapa 3.</Text>
            </View>
          </View>
        );

      case 'morse_code': {
        const filtered = MORSE_TABLE.filter(item =>
          item.word.includes(morseSearch.toLowerCase()) ||
          item.freq.includes(morseSearch)
        );

        return (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>MÓDULO 7: CÓDIGO MORSE</Text>
            <Text style={styles.sectionSubtitle}>
              Identifica la palabra transmitida y responde con la frecuencia en MHz exacta.
            </Text>

            <TextInput
              style={styles.searchInput}
              placeholder="Buscar por palabra o frecuencia (ej. 3.535)..."
              placeholderTextColor="#666"
              value={morseSearch}
              onChangeText={setMorseSearch}
            />

            <View style={styles.tableList}>
              {filtered.map((item, idx) => (
                <View key={idx} style={styles.morseRow}>
                  <View>
                    <Text style={styles.morseWord}>{item.word.toUpperCase()}</Text>
                    <Text style={styles.morsePattern}>{item.morse}</Text>
                  </View>
                  <Text style={styles.morseFreq}>{item.freq}</Text>
                </View>
              ))}
            </View>
          </View>
        );
      }

      case 'passwords': {
        const filteredWords = PASSWORD_WORDS.filter(w => {
          if (passCol1 && !passCol1.toLowerCase().includes(w[0])) return false;
          if (passCol2 && !passCol2.toLowerCase().includes(w[1])) return false;
          if (passCol3 && !passCol3.toLowerCase().includes(w[2])) return false;
          if (passCol4 && !passCol4.toLowerCase().includes(w[3])) return false;
          if (passCol5 && !passCol5.toLowerCase().includes(w[4])) return false;
          return true;
        });

        return (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>MÓDULO 8: CONTRASEÑAS (FILTRO EN VIVO)</Text>
            <Text style={styles.sectionSubtitle}>
              Escribe las letras disponibles en cada columna para filtrar las 35 palabras posibles.
            </Text>

            <View style={styles.passInputsRow}>
              {[
                { val: passCol1, set: setPassCol1, col: 1 },
                { val: passCol2, set: setPassCol2, col: 2 },
                { val: passCol3, set: setPassCol3, col: 3 },
                { val: passCol4, set: setPassCol4, col: 4 },
                { val: passCol5, set: setPassCol5, col: 5 }
              ].map(inp => (
                <View key={inp.col} style={styles.passColBox}>
                  <Text style={styles.passColLabel}>C{inp.col}</Text>
                  <TextInput
                    style={styles.passInput}
                    placeholder="letras"
                    placeholderTextColor="#555"
                    value={inp.val}
                    onChangeText={inp.set}
                    autoCapitalize="none"
                  />
                </View>
              ))}
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>
                PALABRAS COMPATIBLES ({filteredWords.length} de {PASSWORD_WORDS.length}):
              </Text>
              <View style={styles.passWordsGrid}>
                {filteredWords.map((w, idx) => (
                  <View key={idx} style={[styles.passBadge, filteredWords.length === 1 && styles.passBadgeSolo]}>
                    <Text style={[styles.passWordText, filteredWords.length === 1 && styles.passWordSoloText]}>
                      {w.toUpperCase()}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        );
      }

      case 'needy_knob':
        return (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>MÓDULO 9: PERILLAS (EXIGENTE)</Text>
            <Text style={styles.sectionSubtitle}>
              Compara el patrón de 12 LEDs que ves en la telemetría con estas 8 configuraciones para indicar la dirección.
            </Text>

            {KNOB_MANUAL_PATTERNS.map((p, idx) => (
              <View key={idx} style={styles.card}>
                <View style={styles.knobHeaderRow}>
                  <Text style={styles.knobDirText}>➔ POSICIÓN: {p.dir}</Text>
                </View>
                <Text style={styles.knobPatternRow}>Fila Superior: <Text style={styles.hlCode}>{p.top}</Text></Text>
                <Text style={styles.knobPatternRow}>Fila Inferior: <Text style={styles.hlCode}>{p.bot}</Text></Text>
              </View>
            ))}
          </View>
        );

      case 'needy_vent':
        return (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>MÓDULO 10: GAS Y CONDENSADOR</Text>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>VENTILACIÓN DE GAS</Text>
              <Text style={styles.rule}>• Si la pantalla del reloj pregunta "¿VENTILAR GAS?", responde <Text style={styles.hlGreen}>S (Sí)</Text>.</Text>
              <Text style={styles.rule}>• Si la pantalla del reloj pregunta "¿DETONAR?", responde <Text style={styles.hlRed}>N (No)</Text>.</Text>
              <Text style={styles.rule}>• Se debe responder antes de que se agote el temporizador de la pantalla.</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>DESCARGA DEL CONDENSADOR</Text>
              <Text style={styles.rule}>• El condensador acumula carga continuamente.</Text>
              <Text style={styles.rule}>• Si alcanza el 100%, causará un fallo automático.</Text>
              <Text style={styles.rule}>• El jugador del reloj debe girar el bisel físico o pulsar descargar para mantenerlo bajo.</Text>
            </View>
          </View>
        );

      case 'appendices':
        return (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>APÉNDICES DE LA BOMBA (EDGEWORK)</Text>
            
            <View style={styles.card}>
              <Text style={styles.cardTitle}>APÉNDICE A: INDICADORES OFICIALES</Text>
              <Text style={styles.rule}>Lista oficial de 11 indicadores posibles:</Text>
              <Text style={styles.hlCode}>SND, CLR, CAR, IND, FRQ, SIG, NSA, MSA, TRN, BOB, FRK</Text>
              <Text style={styles.rule}>Pueden estar encendidos (con luz) o apagados.</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>APÉNDICE B: BATERÍAS</Text>
              <Text style={styles.rule}>• Tipo AA: En paquetes de 2 baterías delgadas.</Text>
              <Text style={styles.rule}>• Tipo D: Baterías cilíndricas gruesas individuales.</Text>
              <Text style={styles.rule}>• El número total es la suma de todas las baterías.</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>APÉNDICE C: PUERTOS</Text>
              <Text style={styles.rule}>Puertos laterales en la carcasa:</Text>
              <Text style={styles.hlCode}>DVI-D, Paralelo, PS/2, RJ-45, Serial, Estéreo RCA</Text>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Horizontal Tabs Bar */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsNav}
        contentContainerStyle={styles.tabsNavContent}
      >
        {MODULE_TABS.map(tab => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tabButton, isActive && styles.tabButtonActive]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text style={[styles.tabButtonText, isActive && styles.tabButtonTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Main Tab View */}
      <ScrollView style={styles.bodyScroll} contentContainerStyle={styles.bodyContent}>
        {renderContent()}
      </ScrollView>
    </View>
  );
}

function getTextColor(colorName) {
  switch (colorName) {
    case 'rojo': return '#ff4d6d';
    case 'azul': return '#4cc9f0';
    case 'verde': return '#00ff88';
    case 'amarillo': return '#ffd166';
    default: return '#fff';
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0c12',
  },
  tabsNav: {
    backgroundColor: '#121622',
    borderBottomWidth: 1,
    borderBottomColor: '#1d2335',
    maxHeight: 50,
  },
  tabsNavContent: {
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  tabButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    marginRight: 6,
  },
  tabButtonActive: {
    backgroundColor: '#1f2940',
    borderBottomWidth: 2,
    borderBottomColor: '#00ffcc',
  },
  tabButtonText: {
    color: '#8391af',
    fontSize: 12,
    fontWeight: '600',
  },
  tabButtonTextActive: {
    color: '#00ffcc',
    fontWeight: 'bold',
  },
  bodyScroll: {
    flex: 1,
  },
  bodyContent: {
    padding: 16,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.8,
  },
  sectionSubtitle: {
    color: '#8b9bb4',
    fontSize: 12,
    marginTop: 4,
    marginBottom: 14,
  },
  card: {
    backgroundColor: '#121622',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1f263b',
    marginBottom: 12,
  },
  cardAccent: {
    borderColor: '#3a4b70',
    backgroundColor: '#161c2b',
  },
  cardTitle: {
    color: '#00ffcc',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  rule: {
    color: '#cbd5e1',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 6,
  },
  stripRule: {
    color: '#cbd5e1',
    fontSize: 12,
    lineHeight: 20,
    marginLeft: 6,
    marginBottom: 4,
  },
  hlBold: {
    fontWeight: 'bold',
    color: '#fff',
  },
  hlBlue: {
    color: '#4cc9f0',
    fontWeight: 'bold',
  },
  hlWhite: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  hlYellow: {
    color: '#ffd166',
    fontWeight: 'bold',
  },
  hlRed: {
    color: '#ff4d6d',
    fontWeight: 'bold',
  },
  hlGreen: {
    color: '#00ff88',
    fontWeight: 'bold',
  },
  hlNumber: {
    color: '#00ffcc',
    fontWeight: 'bold',
    fontSize: 14,
  },
  hlPos: {
    color: '#00ffcc',
    fontWeight: 'bold',
  },
  hlCode: {
    color: '#ffd166',
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  keypadScroll: {
    marginTop: 8,
  },
  keypadColumnCard: {
    backgroundColor: '#121622',
    borderRadius: 10,
    padding: 10,
    width: 65,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#232b40',
    alignItems: 'center',
  },
  keypadColHeader: {
    color: '#00ffcc',
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  symbolItem: {
    alignItems: 'center',
    marginVertical: 4,
  },
  symbolChar: {
    fontSize: 22,
    color: '#fff',
  },
  symbolOrder: {
    fontSize: 8,
    color: '#55657e',
  },
  calcControlRow: {
    marginBottom: 12,
  },
  calcLabel: {
    color: '#8b9bb4',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  toggleRow: {
    flexDirection: 'row',
  },
  toggleBtn: {
    backgroundColor: '#151b29',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#242f47',
  },
  toggleBtnActive: {
    backgroundColor: '#00ffcc',
    borderColor: '#00ffcc',
  },
  toggleBtnText: {
    color: '#8b9bb4',
    fontSize: 11,
    fontWeight: 'bold',
  },
  toggleBtnTextActive: {
    color: '#000',
  },
  simonGrid: {
    marginTop: 8,
  },
  simonPairCard: {
    backgroundColor: '#121622',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#242f47',
  },
  simonFlashes: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    width: 110,
  },
  simonArrow: {
    color: '#55657e',
    fontSize: 16,
  },
  simonPress: {
    fontSize: 13,
    fontWeight: 'bold',
    width: 140,
    textAlign: 'right',
  },
  searchInput: {
    backgroundColor: '#0a0d14',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#fff',
    fontSize: 12,
    borderWidth: 1,
    borderColor: '#242f47',
    marginBottom: 10,
  },
  tableList: {
    marginTop: 4,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#171d2c',
  },
  tableCol1: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  tableCol2: {
    color: '#8b9bb4',
    fontSize: 12,
  },
  priorityBox: {
    backgroundColor: '#0c0f17',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#192233',
  },
  priorityHeader: {
    color: '#00ffcc',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  priorityText: {
    color: '#8b9bb4',
    fontSize: 11,
    lineHeight: 16,
  },
  priorityItems: {
    color: '#fff',
    fontWeight: '600',
  },
  morseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#181e2b',
  },
  morseWord: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  morsePattern: {
    color: '#ffd166',
    fontFamily: 'monospace',
    fontSize: 11,
    marginTop: 2,
  },
  morseFreq: {
    color: '#00ff88',
    fontSize: 13,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  passInputsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  passColBox: {
    width: '18%',
  },
  passColLabel: {
    color: '#00ffcc',
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  passInput: {
    backgroundColor: '#121622',
    borderWidth: 1,
    borderColor: '#242f47',
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 6,
    color: '#fff',
    fontSize: 11,
    textAlign: 'center',
  },
  passWordsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  passBadge: {
    backgroundColor: '#1b2234',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 6,
    marginBottom: 6,
  },
  passBadgeSolo: {
    backgroundColor: '#00ff88',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  passWordText: {
    color: '#8b9bb4',
    fontSize: 11,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  passWordSoloText: {
    color: '#000',
    fontSize: 14,
    fontWeight: 'bold',
  },
  knobHeaderRow: {
    marginBottom: 4,
  },
  knobDirText: {
    color: '#ffb703',
    fontSize: 13,
    fontWeight: 'bold',
  },
  knobPatternRow: {
    color: '#8b9bb4',
    fontSize: 11,
    marginVertical: 2,
  }
});

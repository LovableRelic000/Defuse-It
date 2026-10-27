// src/components/InteractiveManual.js - Core Spanish Defusal Manual v1-es (6 Modules)
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
  PASSWORD_WORDS,
  KEYPAD_COLUMNS,
  SIMON_TABLES
} from '../utils/manualData';

const MODULE_TABS = [
  { key: 'wires', label: '1. Cables' },
  { key: 'the_button', label: '2. El Botón' },
  { key: 'keypads', label: '3. Teclados' },
  { key: 'simon_says', label: '4. Simón Dice' },
  { key: 'memory', label: '5. Memoria' },
  { key: 'passwords', label: '6. Contraseñas' },
  { key: 'appendices', label: 'Apéndices' }
];

export default function InteractiveManual() {
  const [activeTab, setActiveTab] = useState('wires');

  // Simon Says interactive state
  const [simonHasVowel, setSimonHasVowel] = useState(true);
  const [simonStrikes, setSimonStrikes] = useState(0);

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
        const tableGroup = simonHasVowel ? SIMON_TABLES.vowel : SIMON_TABLES.noVowel;
        const currentMapping = simonStrikes === 0 ? tableGroup.strikes0 :
                               simonStrikes === 1 ? tableGroup.strikes1 : tableGroup.strikes2;

        return (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>MÓDULO 4: SIMÓN DICE</Text>
            <Text style={styles.sectionSubtitle}>
              Consulta la tabla según si el número de serie tiene vocal y el número actual de fallos de la bomba.
            </Text>

            {/* Quick Filter Switchers */}
            <View style={styles.interactiveFilterRow}>
              <View style={styles.filterGroup}>
                <Text style={styles.filterLabel}>¿SERIAL CON VOCAL?</Text>
                <View style={styles.btnRow}>
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
                    <Text style={[styles.toggleBtnText, !simonHasVowel && styles.toggleBtnTextActive]}>NO</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.filterGroup}>
                <Text style={styles.filterLabel}>FALLOS ACTUALES</Text>
                <View style={styles.btnRow}>
                  {[0, 1, 2].map((s) => (
                    <TouchableOpacity
                      key={s}
                      style={[styles.strikeBtn, simonStrikes === s && styles.strikeBtnActive]}
                      onPress={() => setSimonStrikes(s)}
                    >
                      <Text style={[styles.strikeBtnText, simonStrikes === s && styles.strikeBtnTextActive]}>{s}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            {/* Live Interactive Translation Card */}
            <View style={[styles.card, styles.cardAccent]}>
              <Text style={styles.cardTitle}>
                TRADUCCIÓN EN TIEMPO REAL ({simonHasVowel ? 'CON VOCAL' : 'SIN VOCAL'}, {simonStrikes} FALLOS):
              </Text>
              <View style={styles.simonTranslateGrid}>
                {Object.entries(currentMapping).map(([flash, press]) => (
                  <View key={flash} style={styles.simonPair}>
                    <Text style={[styles.simonFlashText, getSimonColorStyle(flash)]}>
                      Luz {flash.toUpperCase()}
                    </Text>
                    <Text style={styles.simonArrow}>➔</Text>
                    <Text style={[styles.simonPressText, getSimonColorStyle(press)]}>
                      Pulsar {press.toUpperCase()}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        );
      }

      case 'memory':
        return (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>MÓDULO 5: MEMORIA</Text>
            <Text style={styles.sectionSubtitle}>
              Presiona el botón correcto para avanzar por las 5 etapas. Las posiciones van de 1 a 4 de izquierda a derecha.
            </Text>

            <View style={styles.card}>
              <Text style={styles.cardStage}>ETAPA 1</Text>
              <Text style={styles.rule}>• Pantalla 1: Presiona el botón en la posición 2.</Text>
              <Text style={styles.rule}>• Pantalla 2: Presiona el botón en la posición 2.</Text>
              <Text style={styles.rule}>• Pantalla 3: Presiona el botón en la posición 3.</Text>
              <Text style={styles.rule}>• Pantalla 4: Presiona el botón en la posición 4.</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardStage}>ETAPA 2</Text>
              <Text style={styles.rule}>• Pantalla 1: Presiona el botón con el número "4".</Text>
              <Text style={styles.rule}>• Pantalla 2: Presiona el botón en la misma posición que en la etapa 1.</Text>
              <Text style={styles.rule}>• Pantalla 3: Presiona el botón en la posición 1.</Text>
              <Text style={styles.rule}>• Pantalla 4: Presiona el botón en la misma posición que en la etapa 1.</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardStage}>ETAPA 3</Text>
              <Text style={styles.rule}>• Pantalla 1: Presiona el botón con el mismo número que en la etapa 2.</Text>
              <Text style={styles.rule}>• Pantalla 2: Presiona el botón con el mismo número que en la etapa 1.</Text>
              <Text style={styles.rule}>• Pantalla 3: Presiona el botón en la posición 3.</Text>
              <Text style={styles.rule}>• Pantalla 4: Presiona el botón con el número "4".</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardStage}>ETAPA 4</Text>
              <Text style={styles.rule}>• Pantalla 1: Presiona el botón en la misma posición que en la etapa 1.</Text>
              <Text style={styles.rule}>• Pantalla 2: Presiona el botón en la posición 1.</Text>
              <Text style={styles.rule}>• Pantalla 3: Presiona el botón en la misma posición que en la etapa 2.</Text>
              <Text style={styles.rule}>• Pantalla 4: Presiona el botón en la misma posición que en la etapa 2.</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardStage}>ETAPA 5</Text>
              <Text style={styles.rule}>• Pantalla 1: Presiona el botón con el mismo número que en la etapa 1.</Text>
              <Text style={styles.rule}>• Pantalla 2: Presiona el botón con el mismo número que en la etapa 2.</Text>
              <Text style={styles.rule}>• Pantalla 3: Presiona el botón con el mismo número que en la etapa 4.</Text>
              <Text style={styles.rule}>• Pantalla 4: Presiona el botón con el mismo número que en la etapa 3.</Text>
            </View>
          </View>
        );

      case 'passwords': {
        const filteredWords = PASSWORD_WORDS.filter((word) => {
          if (passCol1 && !passCol1.toLowerCase().includes(word[0])) return false;
          if (passCol2 && !passCol2.toLowerCase().includes(word[1])) return false;
          if (passCol3 && !passCol3.toLowerCase().includes(word[2])) return false;
          if (passCol4 && !passCol4.toLowerCase().includes(word[3])) return false;
          if (passCol5 && !passCol5.toLowerCase().includes(word[4])) return false;
          return true;
        });

        return (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>MÓDULO 6: CONTRASEÑAS</Text>
            <Text style={styles.sectionSubtitle}>
              Ingresa las letras disponibles en cada columna para filtrar en vivo la única palabra válida.
            </Text>

            {/* Interactive Column Input Solvers */}
            <View style={styles.passInputRow}>
              {[
                { val: passCol1, set: setPassCol1, col: 1 },
                { val: passCol2, set: setPassCol2, col: 2 },
                { val: passCol3, set: setPassCol3, col: 3 },
                { val: passCol4, set: setPassCol4, col: 4 },
                { val: passCol5, set: setPassCol5, col: 5 }
              ].map((c) => (
                <View key={c.col} style={styles.colInputBox}>
                  <Text style={styles.colInputLabel}>C{c.col}</Text>
                  <TextInput
                    style={styles.colInputText}
                    placeholder="abc..."
                    placeholderTextColor="#475569"
                    value={c.val}
                    onChangeText={c.set}
                    autoCapitalize="none"
                    maxLength={6}
                  />
                </View>
              ))}
            </View>

            {/* Live Filter Results */}
            <View style={[styles.card, styles.cardAccent]}>
              <View style={styles.passResultHeader}>
                <Text style={styles.cardTitle}>PALABRAS POSIBLES ({filteredWords.length}):</Text>
                {(passCol1 || passCol2 || passCol3 || passCol4 || passCol5) && (
                  <TouchableOpacity
                    onPress={() => {
                      setPassCol1(''); setPassCol2(''); setPassCol3(''); setPassCol4(''); setPassCol5('');
                    }}
                  >
                    <Text style={styles.clearFilterText}>LIMPIAR FILTROS</Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.passWordsGrid}>
                {filteredWords.map((w) => (
                  <View
                    key={w}
                    style={[
                      styles.passWordChip,
                      filteredWords.length === 1 && styles.passWordChipSolution
                    ]}
                  >
                    <Text
                      style={[
                        styles.passWordText,
                        filteredWords.length === 1 && styles.passWordTextSolution
                      ]}
                    >
                      {w.toUpperCase()}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        );
      }

      case 'appendices':
        return (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>APÉNDICES DE CARCASA (EDGEWORK)</Text>
            <Text style={styles.sectionSubtitle}>
              Referencias rápidas para identificar elementos laterales de la bomba.
            </Text>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>APÉNDICE A: INDICADORES</Text>
              <Text style={styles.rule}>• Indicadores encendidos tienen una luz roja activa (★ o ●).</Text>
              <Text style={styles.rule}>• Indicadores apagados carecen de luz activa (☆ o ○).</Text>
              <Text style={styles.rule}>• Etiquetas oficiales: SND, CLR, CAR, IND, FRQ, SIG, NSA, MSA, TRN, BOB, FRK.</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>APÉNDICE B: BATERÍAS</Text>
              <Text style={styles.rule}>• Baterías AA: Vienen en pares de 2 dentro de un soporte alargado.</Text>
              <Text style={styles.rule}>• Baterías D: Vienen solas en soportes cilíndricos anchos individuales.</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>APÉNDICE C: PUERTOS</Text>
              <Text style={styles.rule}>• DVI-D: Conector blanco alargado de vídeo digital.</Text>
              <Text style={styles.rule}>• Paralelo: Conector morado alargado de 25 pines.</Text>
              <Text style={styles.rule}>• PS/2: Conector circular verde/morado para teclado/ratón.</Text>
              <Text style={styles.rule}>• RJ-45: Conector modular cuadrado de red Ethernet.</Text>
              <Text style={styles.rule}>• Serial: Conector trapezoidal de 9 pines.</Text>
              <Text style={styles.rule}>• Estéreo RCA: Doble conector circular rojo y blanco de audio.</Text>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Module Horizontal Tab Bar */}
      <View style={styles.tabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
          {MODULE_TABS.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tabBtn, activeTab === tab.key && styles.tabBtnActive]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text style={[styles.tabBtnText, activeTab === tab.key && styles.tabBtnTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Main Manual Scrollable Section */}
      <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
        {renderContent()}
      </ScrollView>
    </View>
  );
}

function getSimonColorStyle(color) {
  switch (color?.toLowerCase()) {
    case 'rojo': return { color: '#EF4444' };
    case 'azul': return { color: '#3B82F6' };
    case 'verde': return { color: '#10B981' };
    case 'amarillo': return { color: '#FACC15' };
    default: return { color: '#F8FAFC' };
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090A0F'
  },
  tabsContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    backgroundColor: '#0F172A'
  },
  tabsScroll: {
    paddingHorizontal: 8,
    paddingVertical: 10,
    gap: 8
  },
  tabBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155'
  },
  tabBtnActive: {
    backgroundColor: '#00E5FF20',
    borderColor: '#00E5FF'
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8'
  },
  tabBtnTextActive: {
    color: '#00E5FF'
  },
  scrollArea: {
    flex: 1
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40
  },
  section: {
    gap: 14
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#00E5FF',
    letterSpacing: 0.5
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 18
  },
  card: {
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1F2937',
    gap: 8
  },
  cardAccent: {
    borderColor: '#00E5FF50',
    backgroundColor: '#0F172A'
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FBBF24',
    letterSpacing: 0.5,
    marginBottom: 4
  },
  cardStage: {
    fontSize: 13,
    fontWeight: '800',
    color: '#00E5FF',
    marginBottom: 4
  },
  rule: {
    fontSize: 12,
    color: '#E2E8F0',
    lineHeight: 19
  },
  stripRule: {
    fontSize: 12,
    color: '#E2E8F0',
    lineHeight: 18,
    paddingLeft: 6
  },
  hlBold: {
    fontWeight: '800',
    color: '#FFFFFF'
  },
  hlNumber: {
    fontWeight: '900',
    color: '#FBBF24',
    fontSize: 14
  },
  hlBlue: {
    color: '#60A5FA',
    fontWeight: '700'
  },
  hlWhite: {
    color: '#F8FAFC',
    fontWeight: '700'
  },
  hlYellow: {
    color: '#FACC15',
    fontWeight: '700'
  },
  hlRed: {
    color: '#F87171',
    fontWeight: '700'
  },
  keypadScroll: {
    paddingVertical: 6,
    gap: 10
  },
  keypadColumnCard: {
    backgroundColor: '#1E293B',
    borderRadius: 10,
    padding: 10,
    width: 90,
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
    gap: 6
  },
  keypadColHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: '#00E5FF',
    marginBottom: 4
  },
  symbolItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: 3,
    paddingHorizontal: 6,
    backgroundColor: '#0F172A',
    borderRadius: 6
  },
  symbolChar: {
    fontSize: 18,
    color: '#F8FAFC',
    fontWeight: '700'
  },
  symbolOrder: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '700'
  },
  interactiveFilterRow: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap'
  },
  filterGroup: {
    flex: 1,
    minWidth: 140,
    backgroundColor: '#1E293B',
    padding: 10,
    borderRadius: 10,
    gap: 6
  },
  filterLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8'
  },
  btnRow: {
    flexDirection: 'row',
    gap: 6
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155'
  },
  toggleBtnActive: {
    backgroundColor: '#00E5FF20',
    borderColor: '#00E5FF'
  },
  toggleBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B'
  },
  toggleBtnTextActive: {
    color: '#00E5FF'
  },
  strikeBtn: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155'
  },
  strikeBtnActive: {
    backgroundColor: '#EF444430',
    borderColor: '#EF4444'
  },
  strikeBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748B'
  },
  strikeBtnTextActive: {
    color: '#EF4444'
  },
  simonTranslateGrid: {
    gap: 8,
    marginTop: 6
  },
  simonPair: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8
  },
  simonFlashText: {
    fontSize: 13,
    fontWeight: '800'
  },
  simonArrow: {
    fontSize: 14,
    color: '#64748B'
  },
  simonPressText: {
    fontSize: 13,
    fontWeight: '800'
  },
  passInputRow: {
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'space-between'
  },
  colInputBox: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 8,
    padding: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155'
  },
  colInputLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#00E5FF',
    marginBottom: 4
  },
  colInputText: {
    fontSize: 12,
    color: '#F8FAFC',
    textAlign: 'center',
    padding: 0,
    width: '100%'
  },
  passResultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  clearFilterText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#EF4444'
  },
  passWordsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6
  },
  passWordChip: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#334155'
  },
  passWordChipSolution: {
    backgroundColor: '#10B98130',
    borderColor: '#10B981'
  },
  passWordText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#CBD5E1'
  },
  passWordTextSolution: {
    color: '#10B981',
    fontWeight: '900'
  }
});

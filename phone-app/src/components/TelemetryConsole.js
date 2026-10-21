// src/components/TelemetryConsole.js - Live Telemetry Console for Phone App
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert
} from 'react-native';
import * as Haptics from 'expo-haptics';
import Oscilloscope from './Oscilloscope';
import LedMatrix from './LedMatrix';

export default function TelemetryConsole({
  bomb,
  telemetry,
  onPurgeThermal,
  socketConnected
}) {
  const [isPurging, setIsPurging] = useState(false);

  const handlePurge = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setIsPurging(true);
    onPurgeThermal();
    setTimeout(() => {
      setIsPurging(false);
    }, 1500);
  };

  const timeRemainingMs = bomb?.timeRemainingMs || 0;
  const totalSeconds = Math.max(0, Math.floor(timeRemainingMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const tenths = Math.floor((timeRemainingMs % 1000) / 100);

  const strikes = bomb?.strikes || 0;
  const maxStrikes = bomb?.maxStrikes || 3;
  const thermalLevel = Math.round(bomb?.thermalLevel || telemetry?.thermal || 0);
  const isOverheating = thermalLevel >= 80;
  const isLocked = bomb?.isLockedThermal;

  const knobModule = bomb?.modules?.find(m => m.type === 'needy_knob');
  const morseFreq = telemetry?.morseFreq || 3.500;
  const rotaryAngle = telemetry?.rotaryAngle || 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Top Telemetry Header */}
      <View style={styles.clockStrikesCard}>
        <View style={styles.clockSection}>
          <Text style={styles.clockLabel}>TIEMPO RESTANTE</Text>
          <Text style={[styles.clockDigits, strikes > 0 && styles.clockDigitsPanic]}>
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}.{tenths}
          </Text>
          <Text style={styles.clockMultiplier}>
            VELOCIDAD: {strikes === 0 ? '1.0x' : strikes === 1 ? '1.25x' : '1.5x'}
          </Text>
        </View>

        <View style={styles.strikesSection}>
          <Text style={styles.strikesLabel}>FALLOS</Text>
          <View style={styles.strikesRow}>
            {[1, 2, 3].map((s) => (
              <View
                key={s}
                style={[
                  styles.strikeBox,
                  s <= strikes ? styles.strikeBoxActive : styles.strikeBoxInactive
                ]}
              >
                <Text
                  style={[
                    styles.strikeChar,
                    s <= strikes ? styles.strikeCharActive : styles.strikeCharInactive
                  ]}
                >
                  X
                </Text>
              </View>
            ))}
          </View>
          <Text style={styles.strikesCountText}>{strikes} / {maxStrikes}</Text>
        </View>
      </View>

      {/* Connection & Bomb Status Bar */}
      <View style={styles.statusRow}>
        <View style={styles.socketIndicator}>
          <View style={[styles.dot, socketConnected ? styles.dotGreen : styles.dotRed]} />
          <Text style={styles.statusText}>
            {socketConnected ? 'TELEMETRÍA EN VIVO' : 'RECONECTANDO SERVIDOR...'}
          </Text>
        </View>
        <View style={[
          styles.badgeBombStatus,
          bomb?.status === 'defused' ? styles.badgeDefused :
          bomb?.status === 'exploded' ? styles.badgeExploded : styles.badgeActive
        ]}>
          <Text style={styles.badgeBombText}>
            {bomb?.status === 'defused' ? 'DESACTIVADA' :
             bomb?.status === 'exploded' ? 'DETONADA' : 'BOMBA ACTIVA'}
          </Text>
        </View>
      </View>

      {/* Edgework Quick Card */}
      {bomb?.edgework && (
        <View style={styles.edgeworkCard}>
          <Text style={styles.edgeworkTitle}>CARCASA (EDGEWORK) CONFIRMADA</Text>
          <View style={styles.edgeworkGrid}>
            <View style={styles.edgeworkItem}>
              <Text style={styles.ewLabel}>SERIAL</Text>
              <Text style={styles.ewValue}>{bomb.edgework.serialNumber}</Text>
              <Text style={styles.ewSub}>
                {bomb.edgework.hasVowel ? 'Con Vocal' : 'Sin Vocal'} | {bomb.edgework.isLastDigitOdd ? 'Últ. Impar' : 'Últ. Par'}
              </Text>
            </View>
            <View style={styles.edgeworkItem}>
              <Text style={styles.ewLabel}>BATERÍAS</Text>
              <Text style={styles.ewValue}>{bomb.edgework.batteries.total}</Text>
              <Text style={styles.ewSub}>
                AA: {bomb.edgework.batteries.aa} | D: {bomb.edgework.batteries.d}
              </Text>
            </View>
            <View style={styles.edgeworkItem}>
              <Text style={styles.ewLabel}>INDICADORES</Text>
              <Text style={styles.ewValue}>
                {bomb.edgework.indicators.length === 0 ? 'Ninguno' :
                  bomb.edgework.indicators.map(i => `${i.label}${i.lit ? '●' : '○'}`).join(', ')}
              </Text>
              <Text style={styles.ewSub}>● Encendido | ○ Apagado</Text>
            </View>
            <View style={styles.edgeworkItem}>
              <Text style={styles.ewLabel}>PUERTOS</Text>
              <Text style={styles.ewValue}>
                {bomb.edgework.ports.length === 0 ? 'Ninguno' : bomb.edgework.ports.join(', ')}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Live Radio Wave Oscilloscope */}
      <Oscilloscope
        frequency={morseFreq}
        rotaryAngle={rotaryAngle}
        isPurging={isPurging}
      />

      {/* Needy Knob Matrix (if active) */}
      {knobModule && (
        <LedMatrix
          leds={knobModule.leds}
          timerSeconds={knobModule.timerSeconds}
          targetDirection={knobModule.targetDirection}
        />
      )}

      {/* Thermal & Remote Purge Controls */}
      <View style={[styles.thermalCard, isOverheating && styles.thermalCardAlert]}>
        <View style={styles.thermalHeader}>
          <View>
            <Text style={styles.thermalTitle}>ESTADO TÉRMICO DE LA BOMBA</Text>
            <Text style={styles.thermalDesc}>
              {isLocked
                ? '¡SISTEMA DEL RELOJ BLOQUEADO POR TEMPERATURA CRÍTICA!'
                : isOverheating
                ? 'ADVERTENCIA: Temperatura cercana al umbral de fallo'
                : 'Operación nominal de disipación de calor'}
            </Text>
          </View>
          <Text style={[styles.thermalPercent, isOverheating && styles.thermalPercentAlert]}>
            {thermalLevel}%
          </Text>
        </View>

        {/* Progress bar */}
        <View style={styles.thermalBarTrack}>
          <View
            style={[
              styles.thermalBarFill,
              { width: `${Math.min(100, Math.max(5, thermalLevel))}%` },
              isOverheating ? styles.thermalFillCrit : styles.thermalFillNorm
            ]}
          />
        </View>

        {/* Big Purge Button */}
        <TouchableOpacity
          style={[styles.purgeButton, isPurging && styles.purgeButtonActive]}
          onPress={handlePurge}
          activeOpacity={0.8}
        >
          <Text style={styles.purgeButtonText}>
            {isPurging ? 'PURGANDO CIRCUITO REFRIGERANTE...' : '❄ PURGA TÉRMICA REMOTA'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Module Scanner List */}
      <View style={styles.modulesCard}>
        <Text style={styles.modulesTitle}>ESCÁNER DE MÓDULOS ACTIVOS</Text>
        {bomb?.modules?.map((mod, index) => (
          <View key={mod.id || index} style={styles.moduleItem}>
            <View style={styles.moduleMeta}>
              <Text style={styles.moduleIndex}>#{index + 1}</Text>
              <Text style={styles.moduleName}>{mod.title}</Text>
              {mod.isNeedy && <Text style={styles.needyBadge}>EXIGENTE</Text>}
            </View>
            <View style={[
              styles.modStatusPill,
              mod.solved ? styles.modStatusSolved :
              mod.isNeedy ? styles.modStatusNeedy : styles.modStatusPending
            ]}>
              <Text style={styles.modStatusText}>
                {mod.solved ? 'DESACTIVADO ✓' : mod.isNeedy ? 'ACTIVO (VIGILAR)' : 'PENDIENTE'}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07080c',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  clockStrikesCard: {
    backgroundColor: '#0f111a',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#1f2438',
    marginBottom: 12,
  },
  clockSection: {
    flex: 1,
  },
  clockLabel: {
    color: '#8b9bb4',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  clockDigits: {
    color: '#00ffcc',
    fontSize: 32,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    marginTop: 2,
  },
  clockDigitsPanic: {
    color: '#ff4d6d',
  },
  clockMultiplier: {
    color: '#ffb703',
    fontSize: 10,
    fontFamily: 'monospace',
    marginTop: 2,
    fontWeight: 'bold',
  },
  strikesSection: {
    alignItems: 'flex-end',
  },
  strikesLabel: {
    color: '#8b9bb4',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 6,
  },
  strikesRow: {
    flexDirection: 'row',
  },
  strikeBox: {
    width: 28,
    height: 32,
    borderRadius: 6,
    marginLeft: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  strikeBoxActive: {
    backgroundColor: '#380a14',
    borderColor: '#ff0033',
  },
  strikeBoxInactive: {
    backgroundColor: '#131520',
    borderColor: '#22273a',
  },
  strikeChar: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  strikeCharActive: {
    color: '#ff0033',
  },
  strikeCharInactive: {
    color: '#32374d',
  },
  strikesCountText: {
    color: '#8b9bb4',
    fontSize: 10,
    marginTop: 4,
    fontFamily: 'monospace',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  socketIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  dotGreen: {
    backgroundColor: '#00ff88',
  },
  dotRed: {
    backgroundColor: '#ff3366',
  },
  statusText: {
    color: '#9ba1b0',
    fontSize: 11,
    fontWeight: '600',
  },
  badgeBombStatus: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeActive: {
    backgroundColor: 'rgba(0, 255, 204, 0.12)',
    borderColor: '#00ffcc',
    borderWidth: 1,
  },
  badgeDefused: {
    backgroundColor: 'rgba(0, 255, 136, 0.2)',
    borderColor: '#00ff88',
    borderWidth: 1,
  },
  badgeExploded: {
    backgroundColor: 'rgba(255, 0, 51, 0.2)',
    borderColor: '#ff0033',
    borderWidth: 1,
  },
  badgeBombText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#fff',
  },
  edgeworkCard: {
    backgroundColor: '#0c0f17',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#192233',
    marginBottom: 12,
  },
  edgeworkTitle: {
    color: '#4cc9f0',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  edgeworkGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  edgeworkItem: {
    width: '48%',
    backgroundColor: '#080a10',
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#131b2a',
  },
  ewLabel: {
    color: '#6c7a9c',
    fontSize: 9,
    fontWeight: 'bold',
  },
  ewValue: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    marginTop: 2,
  },
  ewSub: {
    color: '#8da2c0',
    fontSize: 9,
    marginTop: 2,
  },
  thermalCard: {
    backgroundColor: '#120f14',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#2d1b28',
    marginVertical: 8,
  },
  thermalCardAlert: {
    borderColor: '#ff3366',
    backgroundColor: '#200d17',
  },
  thermalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  thermalTitle: {
    color: '#ff70a6',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 0.8,
  },
  thermalDesc: {
    color: '#9c8293',
    fontSize: 10,
    marginTop: 2,
    maxWidth: 240,
  },
  thermalPercent: {
    color: '#ff70a6',
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  thermalPercentAlert: {
    color: '#ff0055',
  },
  thermalBarTrack: {
    height: 8,
    backgroundColor: '#2b1b24',
    borderRadius: 4,
    overflow: 'hidden',
    marginVertical: 10,
  },
  thermalBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  thermalFillNorm: {
    backgroundColor: '#ff70a6',
  },
  thermalFillCrit: {
    backgroundColor: '#ff0055',
  },
  purgeButton: {
    backgroundColor: '#0077b6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#00b4d8',
  },
  purgeButtonActive: {
    backgroundColor: '#00b4d8',
  },
  purgeButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  modulesCard: {
    backgroundColor: '#0c0f17',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#192233',
    marginTop: 8,
  },
  modulesTitle: {
    color: '#8b9bb4',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  moduleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#141a27',
  },
  moduleMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moduleIndex: {
    color: '#55657e',
    fontSize: 11,
    fontFamily: 'monospace',
    marginRight: 8,
  },
  moduleName: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  needyBadge: {
    backgroundColor: '#ffb703',
    color: '#000',
    fontSize: 8,
    fontWeight: 'bold',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
    marginLeft: 6,
  },
  modStatusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  modStatusSolved: {
    backgroundColor: 'rgba(0, 255, 136, 0.15)',
  },
  modStatusPending: {
    backgroundColor: 'rgba(255, 183, 3, 0.15)',
  },
  modStatusNeedy: {
    backgroundColor: 'rgba(255, 0, 85, 0.15)',
  },
  modStatusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  }
});

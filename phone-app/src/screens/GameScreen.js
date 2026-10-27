// src/screens/GameScreen.js - Main Game View for Phone App (Telemetry + Manual Tabs + Safe Area)
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  StatusBar
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import TelemetryConsole from '../components/TelemetryConsole';
import InteractiveManual from '../components/InteractiveManual';

export default function GameScreen({
  roomCode,
  bomb,
  clients = { watch: false, phone: false },
  telemetry,
  onStartGame,
  onPurgeThermal,
  onRestartGame,
  onLeaveRoom,
  socketConnected
}) {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState('telemetry'); // 'telemetry' or 'manual'

  const handleTabChange = (tab) => {
    Haptics.selectionAsync();
    setActiveTab(tab);
  };

  const isWaiting = bomb?.status === 'waiting';
  const watchConnected = clients?.watch;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Persistent Top Room Banner with Notch Safe-Area */}
      <View style={[styles.topBar, { paddingTop: Math.max(insets.top, 24) + 8 }]}>
        <View style={styles.roomPinBadge}>
          <Text style={styles.roomPinLabel}>SALA PIN</Text>
          <Text style={styles.roomPinValue}>{roomCode}</Text>
        </View>

        <View style={styles.centerRoleBadge}>
          <Text style={styles.roleText}>
            {isWaiting ? 'SALA DE ESPERA' : 'EXPERTO (MANUAL)'}
          </Text>
          <Text style={styles.diffText}>
            DIFICULTAD: {bomb?.difficulty?.toUpperCase() || 'NORMAL'}
          </Text>
        </View>

        <TouchableOpacity style={styles.exitBtn} onPress={onLeaveRoom}>
          <Text style={styles.exitBtnText}>SALIR</Text>
        </TouchableOpacity>
      </View>

      {/* Waiting Room & Pairing Lobby Screen (if bomb not armed yet) */}
      {isWaiting ? (
        <ScrollView style={styles.contentArea} contentContainerStyle={styles.waitingContent}>
          <View style={styles.waitingCard}>
            <Text style={styles.waitingTitle}>EMPAREJAMIENTO DE DISPOSITIVOS</Text>
            <Text style={styles.waitingDesc}>
              Introduce este código PIN en tu Samsung Galaxy Watch 4 para vincular la telemetría en tiempo real:
            </Text>

            {/* Giant PIN Banner */}
            <View style={styles.giantPinContainer}>
              <Text style={styles.giantPinText}>{roomCode}</Text>
              <Text style={styles.giantPinSub}>PIN DE 4 DÍGITOS</Text>
            </View>

            {/* Device Connection Status Indicators */}
            <View style={styles.devicesStatusBox}>
              <View style={styles.deviceRow}>
                <Text style={styles.deviceIcon}>📱</Text>
                <View style={styles.deviceMeta}>
                  <Text style={styles.deviceName}>Smartphone (Experto)</Text>
                  <Text style={styles.deviceRole}>Manual y Telemetría</Text>
                </View>
                <View style={styles.connectedBadge}>
                  <Text style={styles.connectedBadgeText}>CONECTADO ✓</Text>
                </View>
              </View>

              <View style={styles.deviceDivider} />

              <View style={styles.deviceRow}>
                <Text style={styles.deviceIcon}>⌚</Text>
                <View style={styles.deviceMeta}>
                  <Text style={styles.deviceName}>Galaxy Watch 4 (Desactivador)</Text>
                  <Text style={styles.deviceRole}>Bisel físico y cables</Text>
                </View>
                <View style={watchConnected ? styles.connectedBadge : styles.waitingBadge}>
                  <Text style={watchConnected ? styles.connectedBadgeText : styles.waitingBadgeText}>
                    {watchConnected ? 'CONECTADO ✓' : 'ESPERANDO RELOJ...'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Launch Action Buttons */}
            {watchConnected ? (
              <TouchableOpacity
                style={styles.startCoopBtn}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                  onStartGame({ testMode: false });
                }}
              >
                <Text style={styles.startCoopBtnText}>▶ ARMAR BOMBA E INICIAR MISIÓN</Text>
                <Text style={styles.startCoopBtnSub}>Ambos dispositivos listos para jugar</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.actionsContainer}>
                <View style={styles.instructionBox}>
                  <Text style={styles.instructionText}>
                    💡 Si tienes tu reloj: Abre la app en el reloj, pulsa en entrar e introduce el PIN arriba.
                  </Text>
                </View>

                {/* Solo / Test Mode Button */}
                <TouchableOpacity
                  style={styles.startSoloBtn}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    onStartGame({ testMode: true });
                  }}
                >
                  <Text style={styles.startSoloBtnText}>⚡ Iniciar en Modo Pruebas (Sin Reloj)</Text>
                  <Text style={styles.startSoloBtnSub}>
                    Explora el temporizador, el osciloscopio y el manual sin fallos de perillas
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      ) : (
        /* Active Game View */
        <View style={styles.contentArea}>
          {activeTab === 'telemetry' ? (
            <TelemetryConsole
              bomb={bomb}
              telemetry={telemetry}
              onPurgeThermal={onPurgeThermal}
              socketConnected={socketConnected}
            />
          ) : (
            <InteractiveManual />
          )}
        </View>
      )}

      {/* Bottom Main Tab Bar with Safe-Area */}
      <View style={[styles.bottomTabBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <TouchableOpacity
          style={[styles.mainTabBtn, activeTab === 'telemetry' && styles.mainTabBtnActive]}
          onPress={() => handleTabChange('telemetry')}
        >
          <Text style={styles.tabIcon}>📡</Text>
          <Text style={[styles.mainTabText, activeTab === 'telemetry' && styles.mainTabTextActive]}>
            TELEMETRÍA EN VIVO
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.mainTabBtn, activeTab === 'manual' && styles.mainTabBtnActive]}
          onPress={() => handleTabChange('manual')}
        >
          <Text style={styles.tabIcon}>📖</Text>
          <Text style={[styles.mainTabText, activeTab === 'manual' && styles.mainTabTextActive]}>
            MANUAL v1-es
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07080c',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: '#0d1017',
    borderBottomWidth: 1,
    borderBottomColor: '#1a202c',
  },
  roomPinBadge: {
    backgroundColor: '#161d2d',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#29354d',
  },
  roomPinLabel: {
    color: '#65789b',
    fontSize: 9,
    fontWeight: 'bold',
  },
  roomPinValue: {
    color: '#00ffcc',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    letterSpacing: 2,
  },
  centerRoleBadge: {
    alignItems: 'center',
  },
  roleText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 0.8,
  },
  diffText: {
    color: '#8b9bb4',
    fontSize: 9,
    fontFamily: 'monospace',
  },
  exitBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 6,
    backgroundColor: '#1b1216',
    borderWidth: 1,
    borderColor: '#381a24',
  },
  exitBtnText: {
    color: '#ff4d6d',
    fontSize: 10,
    fontWeight: 'bold',
  },
  contentArea: {
    flex: 1,
  },
  waitingContent: {
    padding: 20,
    paddingTop: 30,
    alignItems: 'center',
  },
  waitingCard: {
    backgroundColor: '#0f1420',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#222d42',
    width: '100%',
    alignItems: 'center',
  },
  waitingTitle: {
    color: '#00ffcc',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
    textAlign: 'center',
    marginBottom: 8,
  },
  waitingDesc: {
    color: '#8b9bb4',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  giantPinContainer: {
    backgroundColor: '#07090f',
    borderWidth: 2,
    borderColor: '#00ffcc',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 30,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#00ffcc',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  giantPinText: {
    color: '#00ffcc',
    fontSize: 38,
    fontFamily: 'monospace',
    fontWeight: '900',
    letterSpacing: 8,
  },
  giantPinSub: {
    color: '#718096',
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginTop: 2,
  },
  devicesStatusBox: {
    width: '100%',
    backgroundColor: '#080a10',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#182030',
    padding: 12,
    marginBottom: 20,
  },
  deviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  deviceIcon: {
    fontSize: 22,
    marginRight: 10,
  },
  deviceMeta: {
    flex: 1,
  },
  deviceName: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  deviceRole: {
    color: '#718096',
    fontSize: 10,
  },
  connectedBadge: {
    backgroundColor: 'rgba(0, 255, 136, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#00ff88',
  },
  connectedBadgeText: {
    color: '#00ff88',
    fontSize: 9,
    fontWeight: 'bold',
  },
  waitingBadge: {
    backgroundColor: 'rgba(255, 183, 3, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ffb703',
  },
  waitingBadgeText: {
    color: '#ffb703',
    fontSize: 9,
    fontWeight: 'bold',
  },
  deviceDivider: {
    height: 1,
    backgroundColor: '#151c2a',
    marginVertical: 10,
  },
  startCoopBtn: {
    backgroundColor: '#00ff88',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#00ff88',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 6,
  },
  startCoopBtnText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  startCoopBtnSub: {
    color: '#004724',
    fontSize: 10,
    marginTop: 2,
    fontWeight: '600',
  },
  actionsContainer: {
    width: '100%',
  },
  instructionBox: {
    backgroundColor: '#121824',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#1d273a',
    marginBottom: 12,
  },
  instructionText: {
    color: '#9ba1b0',
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
  },
  startSoloBtn: {
    backgroundColor: '#182236',
    borderWidth: 1,
    borderColor: '#3a5078',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  startSoloBtnText: {
    color: '#00ffcc',
    fontSize: 12,
    fontWeight: 'bold',
  },
  startSoloBtnSub: {
    color: '#718096',
    fontSize: 9,
    marginTop: 2,
    textAlign: 'center',
  },
  bottomTabBar: {
    flexDirection: 'row',
    backgroundColor: '#0c0f17',
    borderTopWidth: 1,
    borderTopColor: '#192233',
    paddingTop: 8,
    paddingHorizontal: 12,
  },
  mainTabBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  mainTabBtnActive: {
    backgroundColor: '#141c2c',
    borderWidth: 1,
    borderColor: '#00ffcc',
  },
  tabIcon: {
    fontSize: 18,
    marginBottom: 2,
  },
  mainTabText: {
    color: '#718096',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  mainTabTextActive: {
    color: '#00ffcc',
  }
});

// src/screens/GameScreen.js - Main Game View for Phone App (Telemetry + Manual Tabs)
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar
} from 'react-native';
import * as Haptics from 'expo-haptics';
import TelemetryConsole from '../components/TelemetryConsole';
import InteractiveManual from '../components/InteractiveManual';

export default function GameScreen({
  roomCode,
  bomb,
  telemetry,
  onPurgeThermal,
  onRestartGame,
  onLeaveRoom,
  socketConnected
}) {
  const [activeTab, setActiveTab] = useState('telemetry'); // 'telemetry' or 'manual'

  const handleTabChange = (tab) => {
    Haptics.selectionAsync();
    setActiveTab(tab);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#07080c" />

      {/* Persistent Top Room Banner */}
      <View style={styles.topBar}>
        <View style={styles.roomPinBadge}>
          <Text style={styles.roomPinLabel}>SALA PIN</Text>
          <Text style={styles.roomPinValue}>{roomCode}</Text>
        </View>

        <View style={styles.centerRoleBadge}>
          <Text style={styles.roleText}>EXPERTO (MANUAL)</Text>
          <Text style={styles.diffText}>DIFICULTAD: {bomb?.difficulty?.toUpperCase() || 'NORMAL'}</Text>
        </View>

        <TouchableOpacity style={styles.exitBtn} onPress={onLeaveRoom}>
          <Text style={styles.exitBtnText}>SALIR</Text>
        </TouchableOpacity>
      </View>

      {/* Body View based on tab */}
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

      {/* Bottom Main Tab Bar */}
      <View style={styles.bottomTabBar}>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#07080c',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#0d1017',
    borderBottomWidth: 1,
    borderBottomColor: '#1a202c',
  },
  roomPinBadge: {
    backgroundColor: '#161d2d',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#29354d',
  },
  roomPinLabel: {
    color: '#65789b',
    fontSize: 8,
    fontWeight: 'bold',
  },
  roomPinValue: {
    color: '#00ffcc',
    fontSize: 16,
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
    paddingHorizontal: 10,
    paddingVertical: 6,
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
  bottomTabBar: {
    flexDirection: 'row',
    backgroundColor: '#0c0f17',
    borderTopWidth: 1,
    borderTopColor: '#192233',
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  mainTabBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
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

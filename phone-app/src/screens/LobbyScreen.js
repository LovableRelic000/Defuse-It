// src/screens/LobbyScreen.js - Connection and Room Selection for Phone App
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';

export default function LobbyScreen({ onConnect, isConnecting }) {
  const [serverUrl, setServerUrl] = useState('http://192.168.1.50:3000');
  const [roomPin, setRoomPin] = useState('');
  const [difficulty, setDifficulty] = useState('normal'); // 'facil', 'normal', 'experto'

  useEffect(() => {
    // Load persisted server IP
    AsyncStorage.getItem('DEFUSE_IT_SERVER_URL').then((saved) => {
      if (saved) setServerUrl(saved);
    });
  }, []);

  const saveUrl = async (url) => {
    setServerUrl(url);
    await AsyncStorage.setItem('DEFUSE_IT_SERVER_URL', url);
  };

  const handleCreateRoom = () => {
    if (!serverUrl) {
      Alert.alert('Error', 'Por favor ingresa la dirección IP del servidor');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    saveUrl(serverUrl);
    onConnect({
      url: serverUrl.trim(),
      action: 'create',
      difficulty,
      role: 'phone'
    });
  };

  const handleJoinRoom = () => {
    if (!serverUrl) {
      Alert.alert('Error', 'Por favor ingresa la dirección IP del servidor');
      return;
    }
    if (roomPin.length !== 4) {
      Alert.alert('Error', 'El PIN de la sala debe tener 4 dígitos numéricos');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    saveUrl(serverUrl);
    onConnect({
      url: serverUrl.trim(),
      action: 'join',
      code: roomPin.trim(),
      role: 'phone'
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Brand Banner */}
        <View style={styles.header}>
          <Text style={styles.titleIcon}>💣</Text>
          <Text style={styles.title}>DEFUSE IT!</Text>
          <Text style={styles.tagline}>CONSOLA DEL EXPERTO (MANUAL & TELEMETRÍA)</Text>
        </View>

        {/* Server IP Card */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>DIRECCIÓN IP DEL SERVIDOR</Text>
          <Text style={styles.cardHelp}>
            Revisa la terminal donde corre `/server` para ver la IP local
          </Text>
          <TextInput
            style={styles.input}
            value={serverUrl}
            onChangeText={setServerUrl}
            placeholder="http://192.168.1.XX:3000"
            placeholderTextColor="#556"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {/* Create Room Card */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>OPCIÓN 1: CREAR NUEVA PARTIDA</Text>
          <Text style={styles.cardHelp}>Dificultad de la bomba procedural:</Text>

          <View style={styles.diffRow}>
            {[
              { id: 'facil', label: 'FÁCIL', sub: '3 Módulos' },
              { id: 'normal', label: 'NORMAL', sub: '5 Módulos' },
              { id: 'experto', label: 'EXPERTO', sub: '8 Módulos' }
            ].map(d => (
              <TouchableOpacity
                key={d.id}
                style={[styles.diffBtn, difficulty === d.id && styles.diffBtnActive]}
                onPress={() => setDifficulty(d.id)}
              >
                <Text style={[styles.diffBtnText, difficulty === d.id && styles.diffBtnTextActive]}>
                  {d.label}
                </Text>
                <Text style={[styles.diffBtnSub, difficulty === d.id && styles.diffBtnSubActive]}>
                  {d.sub}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={styles.createButton}
            onPress={handleCreateRoom}
            disabled={isConnecting}
          >
            {isConnecting ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.createButtonText}>CREAR SALA Y GENERAR PIN</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Join Room Card */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>OPCIÓN 2: UNIRSE A SALA EXISTENTE</Text>
          <Text style={styles.cardHelp}>Introduce el PIN de 4 dígitos creado en el reloj u otro dispositivo:</Text>

          <TextInput
            style={[styles.input, styles.pinInput]}
            value={roomPin}
            onChangeText={setRoomPin}
            placeholder="PIN (ej. 4821)"
            placeholderTextColor="#556"
            keyboardType="number-pad"
            maxLength={4}
          />

          <TouchableOpacity
            style={styles.joinButton}
            onPress={handleJoinRoom}
            disabled={isConnecting}
          >
            <Text style={styles.joinButtonText}>UNIRSE A SALA</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07080c',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 50,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  titleIcon: {
    fontSize: 48,
    marginBottom: 6,
  },
  title: {
    color: '#00ffcc',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 2,
  },
  tagline: {
    color: '#8b9bb4',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: 4,
  },
  card: {
    backgroundColor: '#10141f',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1d2538',
    marginBottom: 16,
  },
  cardLabel: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 0.8,
  },
  cardHelp: {
    color: '#718096',
    fontSize: 11,
    marginTop: 3,
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#07090f',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#242f47',
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#fff',
    fontSize: 14,
    fontFamily: 'monospace',
  },
  pinInput: {
    fontSize: 20,
    textAlign: 'center',
    letterSpacing: 6,
    fontWeight: 'bold',
  },
  diffRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  diffBtn: {
    flex: 1,
    backgroundColor: '#07090f',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginHorizontal: 3,
    borderWidth: 1,
    borderColor: '#1d2538',
  },
  diffBtnActive: {
    backgroundColor: 'rgba(0, 255, 204, 0.15)',
    borderColor: '#00ffcc',
  },
  diffBtnText: {
    color: '#8b9bb4',
    fontSize: 11,
    fontWeight: 'bold',
  },
  diffBtnTextActive: {
    color: '#00ffcc',
  },
  diffBtnSub: {
    color: '#55657e',
    fontSize: 9,
    marginTop: 2,
  },
  diffBtnSubActive: {
    color: '#88e9d9',
  },
  createButton: {
    backgroundColor: '#00ffcc',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#000',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  joinButton: {
    backgroundColor: '#1b263b',
    borderWidth: 1,
    borderColor: '#415a77',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  joinButtonText: {
    color: '#e0e1dd',
    fontSize: 13,
    fontWeight: 'bold',
    letterSpacing: 0.8,
  }
});

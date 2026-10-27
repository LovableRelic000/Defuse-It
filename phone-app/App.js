// App.js - Defuse It! Phone Application Entry Point
import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useKeepAwake } from 'expo-keep-awake';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import io from 'socket.io-client';
import LobbyScreen from './src/screens/LobbyScreen';
import GameScreen from './src/screens/GameScreen';

export default function App() {
  // Prevent phone screen from sleeping during gameplay
  useKeepAwake();

  const [gameState, setGameState] = useState('lobby'); // 'lobby' or 'playing'
  const [roomCode, setRoomPin] = useState('');
  const [bomb, setBomb] = useState(null);
  const [clients, setClients] = useState({ watch: false, phone: false });
  const [telemetry, setTelemetry] = useState({
    morseFreq: 3.500,
    rotaryAngle: 0,
    thermal: 0
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);

  const socketRef = useRef(null);

  const connectToServer = ({ url, action, code, difficulty, role }) => {
    setIsConnecting(true);

    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    try {
      const socket = io(url, {
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        timeout: 7000
      });

      socketRef.current = socket;

      socket.on('connect', () => {
        setSocketConnected(true);
        setIsConnecting(false);

        if (action === 'create') {
          socket.emit('create-room', { difficulty, role });
        } else if (action === 'join') {
          socket.emit('join-room', { code, role });
        }
      });

      socket.on('room:created', (data) => {
        setRoomPin(data.code);
        setBomb(data.bomb);
        if (data.clients) setClients(data.clients);
        setGameState('playing');
      });

      socket.on('room:joined', (data) => {
        setRoomPin(data.code);
        setBomb(data.bomb);
        if (data.clients) setClients(data.clients);
        setGameState('playing');
      });

      socket.on('room:state', (data) => {
        setBomb(data.bomb);
        if (data.clients) setClients(data.clients);
      });

      socket.on('sync:time', (data) => {
        setBomb((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            timeRemainingMs: data.timeRemainingMs,
            strikes: data.strikes,
            thermalLevel: data.thermalLevel,
            isLockedThermal: data.isLockedThermal
          };
        });
      });

      socket.on('phone:telemetry', (data) => {
        setTelemetry((prev) => ({
          ...prev,
          ...data
        }));
      });

      socket.on('error:room', (err) => {
        setIsConnecting(false);
        Alert.alert('Error', err.message || 'No se pudo conectar a la sala');
      });

      socket.on('disconnect', () => {
        setSocketConnected(false);
      });

      socket.on('connect_error', (error) => {
        setIsConnecting(false);
        Alert.alert(
          'Error de Conexión',
          `No se pudo contactar al servidor en ${url}. Asegúrate de que tu teléfono y PC están en la misma red Wi-Fi y que el puerto 3000 no esté bloqueado.`
        );
      });
    } catch (e) {
      setIsConnecting(false);
      Alert.alert('Error', e.message);
    }
  };

  const handleStartGame = (options = {}) => {
    if (socketRef.current) {
      socketRef.current.emit('start-game', options);
    }
  };

  const handlePurgeThermal = () => {
    if (socketRef.current) {
      socketRef.current.emit('phone:purge-thermal');
    }
  };

  const handleRestartGame = (difficulty) => {
    if (socketRef.current) {
      socketRef.current.emit('restart-game', { difficulty });
    }
  };

  const handleLeaveRoom = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
    setGameState('lobby');
    setBomb(null);
    setClients({ watch: false, phone: false });
  };

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <StatusBar style="light" translucent backgroundColor="transparent" />
        {gameState === 'lobby' ? (
          <LobbyScreen onConnect={connectToServer} isConnecting={isConnecting} />
        ) : (
          <GameScreen
            roomCode={roomCode}
            bomb={bomb}
            clients={clients}
            telemetry={telemetry}
            onStartGame={handleStartGame}
            onPurgeThermal={handlePurgeThermal}
            onRestartGame={handleRestartGame}
            onLeaveRoom={handleLeaveRoom}
            socketConnected={socketConnected}
          />
        )}
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07080c',
  },
});

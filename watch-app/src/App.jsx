// src/App.jsx - Main Application Component for Wear OS Galaxy Watch 4 Classic
import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import CircularKeypad from './components/CircularKeypad';
import WatchHeader from './components/WatchHeader';
import EdgeworkView from './components/EdgeworkView';

// Modules
import WiresModule from './components/WiresModule';
import ButtonModule from './components/ButtonModule';
import KeypadsModule from './components/KeypadsModule';
import SimonSaysModule from './components/SimonSaysModule';
import WhosOnFirstModule from './components/WhosOnFirstModule';
import MemoryModule from './components/MemoryModule';
import MorseCodeModule from './components/MorseCodeModule';
import PasswordsModule from './components/PasswordsModule';
import NeedyKnobModule from './components/NeedyKnobModule';
import NeedyVentCapacitorModule from './components/NeedyVentCapacitorModule';

import {
  playRotaryClick,
  playStrikeSound,
  playSolvedSound,
  triggerHaptic
} from './utils/audioSynth';

export default function App() {
  const [gameState, setGameState] = useState('setup'); // 'setup', 'game'
  const [roomCode, setRoomCode] = useState('');
  const [bomb, setBomb] = useState(null);
  const [activeModuleIndex, setActiveModuleIndex] = useState(0);
  const [bezelMode, setBezelMode] = useState('carousel'); // 'carousel' or 'interaction'
  const [isEdgeworkActive, setIsEdgeworkActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const socketRef = useRef(null);

  // Connect to server
  const handleConnect = ({ serverUrl, pin }) => {
    setIsConnecting(true);
    setErrorMessage('');

    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    try {
      const socket = io(serverUrl, {
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 4,
        timeout: 6000
      });

      socketRef.current = socket;

      socket.on('connect', () => {
        socket.emit('join-room', { code: pin, role: 'watch' });
      });

      socket.on('room:joined', (data) => {
        setIsConnecting(false);
        setRoomCode(data.code);
        setBomb(data.bomb);
        setGameState('game');
        triggerHaptic(40);
      });

      socket.on('room:state', (data) => {
        setBomb(data.bomb);
      });

      socket.on('sync:time', (data) => {
        setBomb(prev => {
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

      socket.on('strike', () => {
        playStrikeSound();
        triggerHaptic(80);
      });

      socket.on('module:solved', () => {
        playSolvedSound();
        triggerHaptic(50);
      });

      socket.on('bomb:defused', () => {
        playSolvedSound();
        triggerHaptic(100);
      });

      socket.on('error:room', (err) => {
        setIsConnecting(false);
        setErrorMessage(err.message || 'Error al conectar');
      });

      socket.on('connect_error', () => {
        setIsConnecting(false);
        setErrorMessage('Servidor no disponible en esa IP');
      });
    } catch (e) {
      setIsConnecting(false);
      setErrorMessage(e.message);
    }
  };

  // Carousel Bezel navigation
  useEffect(() => {
    const handleCarouselRotary = (e) => {
      if (gameState !== 'game' || bezelMode !== 'carousel' || isEdgeworkActive) return;
      const { direction } = e.detail || {};
      const modulesCount = bomb?.modules?.length || 1;

      playRotaryClick();
      triggerHaptic(14);

      setActiveModuleIndex(prev => {
        if (direction === 'clockwise') {
          return (prev + 1) % modulesCount;
        } else {
          return (prev - 1 + modulesCount) % modulesCount;
        }
      });
    };

    window.addEventListener('watch-rotary', handleCarouselRotary);
    return () => window.removeEventListener('watch-rotary', handleCarouselRotary);
  }, [gameState, bezelMode, isEdgeworkActive, bomb?.modules?.length]);

  // Telemetry relay helper
  const sendTelemetry = (data) => {
    if (socketRef.current) {
      socketRef.current.emit('watch:telemetry', data);
    }
  };

  // Action dispatchers
  const handleCutWire = (wireIndex) => {
    socketRef.current?.emit('action:wires', { wireIndex });
  };

  const handleButtonAction = ({ actionType }) => {
    socketRef.current?.emit('action:button', { actionType });
  };

  const handleKeypadPress = (symbol) => {
    socketRef.current?.emit('action:keypad', { symbol });
  };

  const handleSimonColor = (color) => {
    socketRef.current?.emit('action:simon', { color });
  };

  const handleWhosOnFirst = (buttonIndex) => {
    socketRef.current?.emit('action:whos_on_first', { buttonIndex });
  };

  const handleMemory = ({ buttonIndex, label }) => {
    socketRef.current?.emit('action:memory', { buttonIndex, label });
  };

  const handleMorseTransmit = (frequency) => {
    socketRef.current?.emit('action:morse', { frequency });
  };

  const handlePasswords = (word) => {
    socketRef.current?.emit('action:passwords', { word });
  };

  const handleKnob = (direction) => {
    socketRef.current?.emit('action:knob', { direction });
  };

  const handleVent = (payload) => {
    socketRef.current?.emit('action:vent_capacitor', payload);
  };

  const modules = bomb?.modules || [];
  const currentModule = modules[activeModuleIndex];

  // Render module based on type
  const renderCurrentModule = () => {
    if (isEdgeworkActive) {
      return <EdgeworkView edgework={bomb?.edgework} />;
    }

    if (!currentModule) {
      return <div style={{ color: '#888', fontSize: '10px' }}>Sin módulos</div>;
    }

    switch (currentModule.type) {
      case 'wires':
        return (
          <WiresModule
            moduleData={currentModule}
            onCutWire={handleCutWire}
            bezelMode={bezelMode}
          />
        );
      case 'the_button':
        return (
          <ButtonModule
            moduleData={currentModule}
            onButtonAction={handleButtonAction}
          />
        );
      case 'keypads':
        return (
          <KeypadsModule
            moduleData={currentModule}
            onKeypadPress={handleKeypadPress}
          />
        );
      case 'simon_says':
        return (
          <SimonSaysModule
            moduleData={currentModule}
            onColorPress={handleSimonColor}
          />
        );
      case 'whos_on_first':
        return (
          <WhosOnFirstModule
            moduleData={currentModule}
            onButtonPress={handleWhosOnFirst}
            bezelMode={bezelMode}
          />
        );
      case 'memory':
        return (
          <MemoryModule
            moduleData={currentModule}
            onButtonPress={handleMemory}
            bezelMode={bezelMode}
          />
        );
      case 'morse_code':
        return (
          <MorseCodeModule
            moduleData={currentModule}
            onTransmit={handleMorseTransmit}
            onTelemetry={sendTelemetry}
            bezelMode={bezelMode}
          />
        );
      case 'passwords':
        return (
          <PasswordsModule
            moduleData={currentModule}
            onVerifyWord={handlePasswords}
            bezelMode={bezelMode}
          />
        );
      case 'needy_knob':
        return (
          <NeedyKnobModule
            moduleData={currentModule}
            onSetKnob={handleKnob}
            bezelMode={bezelMode}
          />
        );
      case 'needy_vent_capacitor':
        return (
          <NeedyVentCapacitorModule
            moduleData={currentModule}
            onVentAction={handleVent}
            bezelMode={bezelMode}
          />
        );
      default:
        return <div style={{ color: '#fff', fontSize: '10px' }}>Módulo desconocido</div>;
    }
  };

  return (
    <div className="watch-viewport">
      {/* Outer Perimeter Rotary Ring */}
      <div
        className={`perimeter-ring ${
          bezelMode === 'interaction' ? 'mode-interaction' : ''
        } ${(bomb?.strikes || 0) > 0 ? 'panic' : ''}`}
      />

      {/* Setup View (PIN & IP Dial) */}
      {gameState === 'setup' ? (
        <div className="safe-circle">
          <CircularKeypad
            onConnect={handleConnect}
            isConnecting={isConnecting}
            errorMessage={errorMessage}
          />
        </div>
      ) : (
        /* Game View */
        <div className="safe-circle">
          {/* Top Bar (Clock, Strikes, Bezel Mode) */}
          <WatchHeader
            timeRemainingMs={bomb?.timeRemainingMs}
            strikes={bomb?.strikes}
            maxStrikes={bomb?.maxStrikes}
            bezelMode={bezelMode}
            onToggleBezelMode={() =>
              setBezelMode(prev => (prev === 'carousel' ? 'interaction' : 'carousel'))
            }
            isEdgeworkActive={isEdgeworkActive}
            onToggleEdgework={() => setIsEdgeworkActive(prev => !prev)}
          />

          {/* Module Stage */}
          <div className="module-stage">{renderCurrentModule()}</div>

          {/* Bottom Nav */}
          <div className="watch-bottom-nav">
            <button
              className="nav-arrow-btn"
              onClick={() => {
                playRotaryClick();
                setActiveModuleIndex(prev => (prev - 1 + modules.length) % modules.length);
              }}
            >
              ◀
            </button>

            <span className="module-title-badge">
              {isEdgeworkActive
                ? 'CARCASA'
                : `${activeModuleIndex + 1}/${modules.length} ${currentModule?.title || ''}`}
            </span>

            <button
              className="nav-arrow-btn"
              onClick={() => {
                playRotaryClick();
                setActiveModuleIndex(prev => (prev + 1) % modules.length);
              }}
            >
              ▶
            </button>
          </div>
        </div>
      )}

      {/* Overheat Thermal Lockout Modal */}
      {bomb?.isLockedThermal && (
        <div className="lockout-overlay">
          <div className="lockout-icon">🔥</div>
          <div className="lockout-title">BLOQUEO TÉRMICO</div>
          <div className="lockout-sub">
            Temperatura crítica alcanzada. El Experto debe ejecutar la
            <strong> PURGA REMOTA</strong> en el smartphone para desbloquear la bomba.
          </div>
        </div>
      )}

      {/* Exploded Modal */}
      {bomb?.status === 'exploded' && (
        <div className="lockout-overlay" style={{ background: 'rgba(80, 0, 0, 0.95)' }}>
          <div className="lockout-icon">💥</div>
          <div className="lockout-title" style={{ color: '#ff0033' }}>¡DETONACIÓN!</div>
          <div className="lockout-sub">{bomb.explosionReason || 'La bomba explotó.'}</div>
        </div>
      )}

      {/* Defused Modal */}
      {bomb?.status === 'defused' && (
        <div className="lockout-overlay" style={{ background: 'rgba(0, 50, 20, 0.95)' }}>
          <div className="lockout-icon">🎉</div>
          <div className="lockout-title" style={{ color: 'var(--color-neon-green)' }}>
            ¡DESACTIVADA!
          </div>
          <div className="lockout-sub">Misión completada con éxito por el equipo.</div>
        </div>
      )}
    </div>
  );
}

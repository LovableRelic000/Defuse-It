// src/components/CircularKeypad.jsx - Setup Dial for Server IP & PIN on Galaxy Watch
import React, { useState, useEffect } from 'react';
import { playRotaryClick, triggerHaptic } from '../utils/audioSynth';

export default function CircularKeypad({ onConnect, isConnecting, errorMessage }) {
  const [step, setStep] = useState('ip'); // 'ip' or 'pin'
  const [serverIp, setServerIp] = useState('http://192.168.1.50:3000');
  const [pin, setPin] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('DEFUSE_IT_WATCH_SERVER_IP');
    if (saved) setServerIp(saved);
  }, []);

  const handleDigit = (digit) => {
    playRotaryClick();
    triggerHaptic(15);
    if (pin.length < 4) {
      setPin(prev => prev + digit);
    }
  };

  const handleDelete = () => {
    playRotaryClick();
    triggerHaptic(15);
    setPin(prev => prev.slice(0, -1));
  };

  const handleIpNext = () => {
    playRotaryClick();
    triggerHaptic(20);
    localStorage.setItem('DEFUSE_IT_WATCH_SERVER_IP', serverIp);
    setStep('pin');
  };

  const handleConnect = () => {
    if (pin.length !== 4) return;
    playRotaryClick();
    triggerHaptic(30);
    localStorage.setItem('DEFUSE_IT_WATCH_SERVER_IP', serverIp);
    onConnect({ serverUrl: serverIp.trim(), pin: pin.trim() });
  };

  if (step === 'ip') {
    return (
      <div style={styles.container}>
        <div style={styles.headerTitle}>IP DEL SERVIDOR</div>
        <div style={styles.hintSub}>Consulta la terminal de /server</div>

        <input
          style={styles.ipInput}
          value={serverIp}
          onChange={(e) => setServerIp(e.target.value)}
          placeholder="http://192.168.1.XX:3000"
        />

        <button style={styles.nextBtn} onClick={handleIpNext}>
          SIGUIENTE (PIN) ➔
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.pinHeader}>
        <span style={styles.pinLabel}>PIN SALA: </span>
        <span style={styles.pinDigits}>{pin.padEnd(4, '•')}</span>
      </div>

      {errorMessage && <div style={styles.errorText}>{errorMessage}</div>}

      {/* Numeric Keypad Grid */}
      <div style={styles.digitsGrid}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
          <button
            key={n}
            style={styles.digitBtn}
            onClick={() => handleDigit(String(n))}
          >
            {n}
          </button>
        ))}
        <button style={styles.specialBtn} onClick={() => setStep('ip')}>
          IP
        </button>
        <button style={styles.digitBtn} onClick={() => handleDigit('0')}>
          0
        </button>
        <button style={styles.specialBtn} onClick={handleDelete}>
          ⌫
        </button>
      </div>

      <button
        style={{
          ...styles.connectBtn,
          opacity: pin.length === 4 ? 1 : 0.5
        }}
        onClick={handleConnect}
        disabled={pin.length !== 4 || isConnecting}
      >
        {isConnecting ? 'CONECTANDO...' : 'ENTRAR A PARTIDA'}
      </button>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    padding: '8px'
  },
  headerTitle: {
    fontSize: '11px',
    fontWeight: '900',
    color: 'var(--color-neon-blue)',
    letterSpacing: '1px'
  },
  hintSub: {
    fontSize: '8px',
    color: '#8da2c0',
    marginBottom: '8px'
  },
  ipInput: {
    backgroundColor: '#0a0d14',
    border: '1px solid #202b40',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '10px',
    fontFamily: 'var(--font-mono)',
    padding: '6px 8px',
    width: '150px',
    textAlign: 'center',
    marginBottom: '10px'
  },
  nextBtn: {
    backgroundColor: 'var(--color-neon-blue)',
    color: '#000',
    border: 'none',
    borderRadius: '12px',
    padding: '6px 14px',
    fontSize: '10px',
    fontWeight: '900',
    cursor: 'pointer'
  },
  pinHeader: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '4px'
  },
  pinLabel: {
    fontSize: '9px',
    color: '#8da2c0',
    fontWeight: 'bold'
  },
  pinDigits: {
    fontFamily: 'var(--font-mono)',
    fontSize: '18px',
    fontWeight: '900',
    color: 'var(--color-neon-blue)',
    letterSpacing: '4px',
    marginLeft: '6px'
  },
  errorText: {
    fontSize: '7px',
    color: '#ff0055',
    marginBottom: '4px'
  },
  digitsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '3px',
    width: '136px',
    marginBottom: '6px'
  },
  digitBtn: {
    backgroundColor: '#111622',
    border: '1px solid #1f2a3f',
    color: '#ffffff',
    borderRadius: '6px',
    height: '24px',
    fontSize: '12px',
    fontWeight: 'bold',
    fontFamily: 'var(--font-mono)',
    cursor: 'pointer'
  },
  specialBtn: {
    backgroundColor: '#181e2b',
    border: '1px solid #28354f',
    color: '#8da2c0',
    borderRadius: '6px',
    height: '24px',
    fontSize: '10px',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  connectBtn: {
    backgroundColor: 'var(--color-neon-green)',
    color: '#000',
    border: 'none',
    borderRadius: '12px',
    padding: '4px 14px',
    fontSize: '9px',
    fontWeight: '900',
    letterSpacing: '0.8px',
    cursor: 'pointer'
  }
};

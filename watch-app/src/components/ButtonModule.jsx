// src/components/ButtonModule.jsx - The Button Module for Galaxy Watch
import React, { useState, useRef } from 'react';
import { playRotaryClick, triggerHaptic } from '../utils/audioSynth';

export default function ButtonModule({ moduleData, onButtonAction }) {
  const [isHolding, setIsHolding] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const holdTimerRef = useRef(null);
  const startTimeRef = useRef(0);

  const { color, label, stripColor, solved } = moduleData || {};

  const getButtonBg = (c) => {
    switch (c) {
      case 'azul': return '#0077b6';
      case 'rojo': return '#d90429';
      case 'amarillo': return '#ffb703';
      case 'blanco': return '#f8f9fa';
      default: return '#333';
    }
  };

  const getButtonTextColor = (c) => {
    return c === 'blanco' || c === 'amarillo' ? '#000000' : '#ffffff';
  };

  const getStripColor = (c) => {
    switch (c) {
      case 'azul': return '#00b4d8';
      case 'amarillo': return '#ffd166';
      case 'blanco': return '#ffffff';
      case 'rojo': return '#ef233c';
      default: return '#00ffcc';
    }
  };

  const handlePointerDown = (e) => {
    if (solved) return;
    e.preventDefault();
    setIsPressed(true);
    startTimeRef.current = Date.now();
    playRotaryClick();
    triggerHaptic(20);

    holdTimerRef.current = setTimeout(() => {
      setIsHolding(true);
      triggerHaptic(50);
    }, 380);
  };

  const handlePointerUp = (e) => {
    if (solved) return;
    e.preventDefault();
    clearTimeout(holdTimerRef.current);
    const duration = Date.now() - startTimeRef.current;
    setIsPressed(false);

    if (isHolding || duration >= 380) {
      setIsHolding(false);
      onButtonAction({ actionType: 'hold_release' });
    } else {
      onButtonAction({ actionType: 'tap' });
    }
  };

  return (
    <div style={styles.container}>
      {/* Light Strip on Right Side */}
      <div
        style={{
          ...styles.stripIndicator,
          backgroundColor: isHolding ? getStripColor(stripColor) : '#151a26',
          boxShadow: isHolding ? `0 0 12px ${getStripColor(stripColor)}` : 'none'
        }}
      />

      {/* Big Circular Push Button */}
      <div
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        style={{
          ...styles.bigButton,
          backgroundColor: getButtonBg(color),
          color: getButtonTextColor(color),
          transform: isPressed ? 'scale(0.92)' : 'scale(1)',
          boxShadow: isPressed
            ? '0 0 4px rgba(0,0,0,0.8) inset'
            : `0 6px 14px rgba(0,0,0,0.6), 0 0 10px ${getButtonBg(color)}44`
        }}
      >
        <span style={styles.buttonLabel}>
          {solved ? 'DESACTIVADO ✓' : label?.toUpperCase()}
        </span>
      </div>

      <div style={styles.hintText}>
        {isHolding ? '¡MANTENIDO! Suelta en el seg. exacto' : solved ? 'MÓDULO SEGURO' : 'Toca o mantén presionado'}
      </div>
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
    position: 'relative'
  },
  stripIndicator: {
    position: 'absolute',
    right: '12px',
    top: '32px',
    bottom: '32px',
    width: '8px',
    borderRadius: '4px',
    border: '1px solid #232d42',
    transition: 'all 0.15s ease'
  },
  bigButton: {
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    border: '4px solid #000000',
    transition: 'transform 0.1s ease',
    touchAction: 'none'
  },
  buttonLabel: {
    fontSize: '13px',
    fontWeight: '900',
    letterSpacing: '0.8px',
    textAlign: 'center',
    padding: '0 6px'
  },
  hintText: {
    marginTop: '6px',
    fontSize: '8px',
    color: '#8b9bb4',
    fontFamily: 'var(--font-mono)'
  }
};

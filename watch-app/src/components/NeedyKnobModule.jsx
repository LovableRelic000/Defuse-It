// src/components/NeedyKnobModule.jsx - Needy Knob Module for Galaxy Watch
import React, { useState, useEffect } from 'react';
import { playRotaryClick, triggerHaptic } from '../utils/audioSynth';

const DIRECTIONS = ['ARRIBA', 'DERECHA', 'ABAJO', 'IZQUIERDA'];
const ANGLES = { 'ARRIBA': 0, 'DERECHA': 90, 'ABAJO': 180, 'IZQUIERDA': 270 };

export default function NeedyKnobModule({ moduleData, onSetKnob, bezelMode }) {
  const [currentDirIndex, setCurrentDirIndex] = useState(0); // 0: ARRIBA, 1: DERECHA, 2: ABAJO, 3: IZQUIERDA
  const timerSeconds = Math.max(0, Math.ceil(moduleData?.timerSeconds || 0));

  useEffect(() => {
    const handleRotary = (e) => {
      if (bezelMode !== 'interaction') return;
      const { direction } = e.detail || {};
      playRotaryClick();
      triggerHaptic(15);

      setCurrentDirIndex(prev => {
        if (direction === 'clockwise') {
          return (prev + 1) % 4;
        } else {
          return (prev - 1 + 4) % 4;
        }
      });
    };

    window.addEventListener('watch-rotary', handleRotary);
    return () => window.removeEventListener('watch-rotary', handleRotary);
  }, [bezelMode]);

  const currentDir = DIRECTIONS[currentDirIndex];
  const angle = ANGLES[currentDir];

  const handleConfirm = () => {
    playRotaryClick();
    triggerHaptic(30);
    onSetKnob(currentDir);
  };

  return (
    <div style={styles.container}>
      {/* 35s Timer Alert */}
      <div style={styles.timerRow}>
        <span style={styles.timerLabel}>EXIGENTE</span>
        <span style={styles.timerVal}>{timerSeconds}s</span>
      </div>

      {/* Rotary Knob Visual Representation */}
      <div style={styles.dialPlate}>
        <div style={{ ...styles.cardinalLabel, top: '4px', left: '40px' }}>ARR</div>
        <div style={{ ...styles.cardinalLabel, top: '40px', right: '4px' }}>DER</div>
        <div style={{ ...styles.cardinalLabel, bottom: '4px', left: '40px' }}>ABJ</div>
        <div style={{ ...styles.cardinalLabel, top: '40px', left: '4px' }}>IZQ</div>

        {/* Central Rotating Needle Knob */}
        <div
          style={{
            ...styles.needleHub,
            transform: `rotate(${angle}deg)`
          }}
        >
          <div style={styles.needlePointer} />
        </div>
      </div>

      <button
        style={styles.confirmBtn}
        onClick={handleConfirm}
      >
        FIJAR: {currentDir}
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
    height: '100%'
  },
  timerRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '4px'
  },
  timerLabel: {
    fontSize: '8px',
    fontWeight: 'bold',
    backgroundColor: '#ffb703',
    color: '#000',
    padding: '1px 4px',
    borderRadius: '3px'
  },
  timerVal: {
    fontFamily: 'var(--font-mono)',
    fontSize: '11px',
    fontWeight: 'bold',
    color: '#ffb703'
  },
  dialPlate: {
    position: 'relative',
    width: '95px',
    height: '95px',
    borderRadius: '50%',
    backgroundColor: '#0c0f17',
    border: '2px solid #222d42',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '6px'
  },
  cardinalLabel: {
    position: 'absolute',
    fontSize: '8px',
    fontWeight: 'bold',
    color: '#65789b'
  },
  needleHub: {
    position: 'relative',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#1b2333',
    border: '2px solid var(--color-orange)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'transform 0.15s cubic-bezier(0.4, 0, 0.2, 1)'
  },
  needlePointer: {
    position: 'absolute',
    top: '-14px',
    width: '4px',
    height: '16px',
    backgroundColor: 'var(--color-orange)',
    borderRadius: '2px',
    boxShadow: '0 0 6px var(--color-orange)'
  },
  confirmBtn: {
    backgroundColor: 'var(--color-orange)',
    color: '#000',
    border: 'none',
    borderRadius: '12px',
    padding: '4px 12px',
    fontSize: '10px',
    fontWeight: '900',
    letterSpacing: '0.8px',
    cursor: 'pointer'
  }
};

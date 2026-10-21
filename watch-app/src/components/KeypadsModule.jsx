// src/components/KeypadsModule.jsx - Keypads Module for Galaxy Watch
import React, { useState } from 'react';
import { playRotaryClick, triggerHaptic } from '../utils/audioSynth';

export default function KeypadsModule({ moduleData, onKeypadPress }) {
  const [pressedSymbols, setPressedSymbols] = useState([]);
  const symbols = moduleData?.displaySymbols || [];
  const isSolved = moduleData?.solved;

  const handlePress = (sym) => {
    if (isSolved || pressedSymbols.includes(sym)) return;
    playRotaryClick();
    triggerHaptic(20);
    setPressedSymbols(prev => [...prev, sym]);
    onKeypadPress(sym);
  };

  return (
    <div style={styles.container}>
      <div style={styles.grid}>
        {symbols.map((sym, idx) => {
          const isPressed = pressedSymbols.includes(sym) || isSolved;

          return (
            <button
              key={idx}
              onClick={() => handlePress(sym)}
              disabled={isPressed}
              style={{
                ...styles.keypadKey,
                backgroundColor: isPressed ? 'rgba(0, 255, 136, 0.2)' : '#111520',
                borderColor: isPressed ? 'var(--color-neon-green)' : '#222d42',
                color: isPressed ? 'var(--color-neon-green)' : '#ffffff'
              }}
            >
              <span style={styles.symbolChar}>{sym}</span>
              {isPressed && <span style={styles.checkBadge}>✓</span>}
            </button>
          );
        })}
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
    height: '100%'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '8px',
    width: '136px',
    height: '136px'
  },
  keypadKey: {
    border: '1px solid',
    borderRadius: '12px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    position: 'relative',
    touchAction: 'manipulation',
    boxShadow: '0 4px 8px rgba(0,0,0,0.4)'
  },
  symbolChar: {
    fontSize: '22px',
    fontWeight: 'normal'
  },
  checkBadge: {
    position: 'absolute',
    top: '3px',
    right: '5px',
    fontSize: '9px',
    fontWeight: 'bold',
    color: 'var(--color-neon-green)'
  }
};

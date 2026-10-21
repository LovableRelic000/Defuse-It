// src/components/WiresModule.jsx - Wires Module for Galaxy Watch
import React, { useState, useEffect } from 'react';
import { playRotaryClick, playWireSnip, triggerHaptic } from '../utils/audioSynth';

export default function WiresModule({ moduleData, onCutWire, bezelMode }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const wires = moduleData?.wires || [];
  const cutIndex = moduleData?.cutWireIndex;
  const isSolved = moduleData?.solved;

  useEffect(() => {
    const handleRotary = (e) => {
      if (bezelMode !== 'interaction' || isSolved) return;
      const { direction } = e.detail || {};
      playRotaryClick();
      triggerHaptic(12);

      setSelectedIndex((prev) => {
        if (direction === 'clockwise') {
          return (prev + 1) % wires.length;
        } else {
          return (prev - 1 + wires.length) % wires.length;
        }
      });
    };

    window.addEventListener('watch-rotary', handleRotary);
    return () => window.removeEventListener('watch-rotary', handleRotary);
  }, [bezelMode, isSolved, wires.length]);

  const handleCut = (index) => {
    if (isSolved) return;
    playWireSnip();
    triggerHaptic(30);
    onCutWire(index);
  };

  const getWireColor = (name) => {
    switch (name) {
      case 'rojo': return '#ff2a4b';
      case 'azul': return '#00b4d8';
      case 'amarillo': return '#ffd166';
      case 'blanco': return '#ffffff';
      case 'negro': return '#222226';
      default: return '#888';
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.wiresStack}>
        {wires.map((color, idx) => {
          const isSelected = selectedIndex === idx;
          const isCut = cutIndex === idx || isSolved;

          return (
            <div
              key={idx}
              onClick={() => setSelectedIndex(idx)}
              style={{
                ...styles.wireSlot,
                borderColor: isSelected ? 'var(--color-orange)' : 'transparent',
                backgroundColor: isSelected ? 'rgba(255, 158, 0, 0.15)' : 'transparent'
              }}
            >
              <div style={styles.wirePin} />
              <div
                style={{
                  ...styles.wireLine,
                  backgroundColor: getWireColor(color),
                  opacity: isCut ? 0.35 : 1,
                  boxShadow: isSelected ? `0 0 8px ${getWireColor(color)}` : 'none'
                }}
              >
                {isCut && <span style={styles.cutMark}>✂</span>}
              </div>
              <div style={styles.wirePin} />
            </div>
          );
        })}
      </div>

      <button
        style={{
          ...styles.cutButton,
          background: isSolved ? 'var(--color-neon-green)' : 'var(--color-orange)',
          color: '#000'
        }}
        onClick={() => handleCut(selectedIndex)}
        disabled={isSolved}
      >
        {isSolved ? 'DESACTIVADO ✓' : `CORTAR CABLE #${selectedIndex + 1}`}
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
    padding: '4px'
  },
  wiresStack: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
    width: '88%',
    marginBottom: '8px'
  },
  wireSlot: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '3px 6px',
    borderRadius: '10px',
    border: '1px solid transparent',
    cursor: 'pointer',
    transition: 'all 0.15s'
  },
  wirePin: {
    width: '8px',
    height: '8px',
    borderRadius: '4px',
    backgroundColor: '#3a4454',
    border: '1px solid #1a2230'
  },
  wireLine: {
    flex: 1,
    height: '8px',
    borderRadius: '4px',
    margin: '0 6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  cutMark: {
    fontSize: '9px',
    color: '#ff0055',
    fontWeight: 'bold'
  },
  cutButton: {
    border: 'none',
    borderRadius: '12px',
    padding: '6px 14px',
    fontSize: '10px',
    fontWeight: '900',
    letterSpacing: '0.5px',
    cursor: 'pointer'
  }
};

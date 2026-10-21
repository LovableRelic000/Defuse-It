// src/components/MemoryModule.jsx - Memory Module for Galaxy Watch
import React, { useState, useEffect } from 'react';
import { playRotaryClick, triggerHaptic } from '../utils/audioSynth';

export default function MemoryModule({ moduleData, onButtonPress, bezelMode }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const currentStage = moduleData?.currentStage || 0;
  const stages = moduleData?.stages || [];
  const isSolved = moduleData?.solved;

  const stage = stages[currentStage] || stages[0] || {};
  const display = stage.display || 1;
  const buttons = stage.buttons || [1, 2, 3, 4];

  useEffect(() => {
    const handleRotary = (e) => {
      if (bezelMode !== 'interaction' || isSolved) return;
      const { direction } = e.detail || {};
      playRotaryClick();
      triggerHaptic(12);

      setSelectedIndex(prev => {
        if (direction === 'clockwise') {
          return (prev + 1) % 4;
        } else {
          return (prev - 1 + 4) % 4;
        }
      });
    };

    window.addEventListener('watch-rotary', handleRotary);
    return () => window.removeEventListener('watch-rotary', handleRotary);
  }, [bezelMode, isSolved]);

  const handlePress = (idx, label) => {
    if (isSolved) return;
    playRotaryClick();
    triggerHaptic(20);
    onButtonPress({ buttonIndex: idx, label });
  };

  return (
    <div style={styles.container}>
      {/* 5 Stage LEDs */}
      <div style={styles.stageLedsRow}>
        {[0, 1, 2, 3, 4].map(s => (
          <div
            key={s}
            style={{
              ...styles.stageLed,
              backgroundColor: s < currentStage || isSolved ? 'var(--color-neon-green)' : '#1a2233'
            }}
          />
        ))}
      </div>

      {/* Main Display Number Screen */}
      <div style={styles.displayBoard}>
        <span style={styles.displayDigit}>{display}</span>
      </div>

      {/* 4 Bottom Action Buttons */}
      <div style={styles.buttonsRow}>
        {buttons.map((label, idx) => {
          const isSelected = selectedIndex === idx;

          return (
            <button
              key={idx}
              onClick={() => {
                setSelectedIndex(idx);
                handlePress(idx, label);
              }}
              disabled={isSolved}
              style={{
                ...styles.memBtn,
                borderColor: isSelected ? 'var(--color-orange)' : '#1e283d',
                backgroundColor: isSelected ? 'rgba(255, 158, 0, 0.2)' : '#111520'
              }}
            >
              <span style={styles.btnLabel}>{label}</span>
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
  stageLedsRow: {
    display: 'flex',
    gap: '6px',
    marginBottom: '8px'
  },
  stageLed: {
    width: '8px',
    height: '8px',
    borderRadius: '4px',
    border: '1px solid #232d42'
  },
  displayBoard: {
    backgroundColor: '#05070c',
    border: '1px solid #1c273c',
    borderRadius: '10px',
    width: '70px',
    height: '42px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '10px'
  },
  displayDigit: {
    fontFamily: 'var(--font-mono)',
    fontSize: '26px',
    fontWeight: '900',
    color: 'var(--color-neon-blue)'
  },
  buttonsRow: {
    display: 'flex',
    gap: '6px',
    width: '144px'
  },
  memBtn: {
    flex: 1,
    height: '32px',
    borderRadius: '8px',
    border: '1px solid',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer'
  },
  btnLabel: {
    fontFamily: 'var(--font-mono)',
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#fff'
  }
};

// src/components/WhosOnFirstModule.jsx - Who's on First Module for Galaxy Watch
import React, { useState, useEffect } from 'react';
import { playRotaryClick, triggerHaptic } from '../utils/audioSynth';

export default function WhosOnFirstModule({ moduleData, onButtonPress, bezelMode }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const currentStage = moduleData?.currentStage || 0;
  const stages = moduleData?.stages || [];
  const isSolved = moduleData?.solved;

  const stage = stages[currentStage] || stages[0] || {};
  const display = stage.display || '';
  const buttons = stage.buttons || [];

  useEffect(() => {
    const handleRotary = (e) => {
      if (bezelMode !== 'interaction' || isSolved) return;
      const { direction } = e.detail || {};
      playRotaryClick();
      triggerHaptic(12);

      setSelectedIndex(prev => {
        if (direction === 'clockwise') {
          return (prev + 1) % 6;
        } else {
          return (prev - 1 + 6) % 6;
        }
      });
    };

    window.addEventListener('watch-rotary', handleRotary);
    return () => window.removeEventListener('watch-rotary', handleRotary);
  }, [bezelMode, isSolved]);

  const handlePress = (index) => {
    if (isSolved) return;
    playRotaryClick();
    triggerHaptic(20);
    onButtonPress(index);
  };

  return (
    <div style={styles.container}>
      {/* Upper Word Display Screen */}
      <div style={styles.displayMonitor}>
        <span style={styles.monitorText}>
          {display === '' ? '[EN BLANCO]' : display}
        </span>
        <span style={styles.stageIndicator}>
          {isSolved ? '✓' : `E${currentStage + 1}/3`}
        </span>
      </div>

      {/* 6 Buttons in 3x2 Grid */}
      <div style={styles.buttonsGrid}>
        {buttons.map((label, idx) => {
          const isSelected = selectedIndex === idx;

          return (
            <button
              key={idx}
              onClick={() => {
                setSelectedIndex(idx);
                handlePress(idx);
              }}
              disabled={isSolved}
              style={{
                ...styles.gridBtn,
                borderColor: isSelected ? 'var(--color-orange)' : '#1e283d',
                backgroundColor: isSelected ? 'rgba(255, 158, 0, 0.2)' : '#111520'
              }}
            >
              <span style={styles.btnText}>{label}</span>
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
  displayMonitor: {
    backgroundColor: '#05070c',
    border: '1px solid #1c273c',
    borderRadius: '8px',
    width: '136px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: '6px'
  },
  monitorText: {
    color: 'var(--color-neon-blue)',
    fontSize: '11px',
    fontWeight: '900',
    letterSpacing: '0.5px'
  },
  stageIndicator: {
    position: 'absolute',
    right: '6px',
    fontSize: '8px',
    color: '#8da2c0',
    fontFamily: 'var(--font-mono)'
  },
  buttonsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '4px',
    width: '146px'
  },
  gridBtn: {
    border: '1px solid',
    borderRadius: '8px',
    padding: '4px 2px',
    height: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer'
  },
  btnText: {
    color: '#ffffff',
    fontSize: '9px',
    fontWeight: 'bold',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  }
};

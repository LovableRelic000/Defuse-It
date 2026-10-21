// src/components/SimonSaysModule.jsx - Simon Says Module for Galaxy Watch
import React, { useState, useEffect, useRef } from 'react';
import { playRotaryClick, triggerHaptic } from '../utils/audioSynth';

export default function SimonSaysModule({ moduleData, onColorPress }) {
  const [activeFlash, setActiveFlash] = useState(null);
  const sequence = moduleData?.sequence || [];
  const currentStage = moduleData?.currentStage || 1;
  const isSolved = moduleData?.solved;

  const sequenceIndexRef = useRef(0);

  // Playback sequence in loop
  useEffect(() => {
    if (isSolved || sequence.length === 0) return;

    const interval = setInterval(() => {
      const stageSequence = sequence.slice(0, currentStage);
      const color = stageSequence[sequenceIndexRef.current];

      setActiveFlash(color);
      setTimeout(() => {
        setActiveFlash(null);
      }, 350);

      sequenceIndexRef.current = (sequenceIndexRef.current + 1) % (stageSequence.length + 1); // +1 pause tick
    }, 800);

    return () => clearInterval(interval);
  }, [sequence, currentStage, isSolved]);

  const handlePress = (color) => {
    if (isSolved) return;
    playRotaryClick();
    triggerHaptic(20);
    onColorPress(color);
  };

  const colors = [
    { id: 'rojo', label: 'R', hex: '#ff2a4b', pos: 'top' },
    { id: 'azul', label: 'A', hex: '#00b4d8', pos: 'right' },
    { id: 'amarillo', label: 'AM', hex: '#ffd166', pos: 'bottom' },
    { id: 'verde', label: 'V', hex: '#00ff88', pos: 'left' }
  ];

  return (
    <div style={styles.container}>
      <div style={styles.simonRing}>
        {colors.map(c => {
          const isFlashing = activeFlash === c.id;

          return (
            <button
              key={c.id}
              onClick={() => handlePress(c.id)}
              disabled={isSolved}
              style={{
                ...styles.quadrant,
                ...styles[c.pos],
                backgroundColor: isFlashing ? c.hex : `${c.hex}33`,
                borderColor: c.hex,
                boxShadow: isFlashing ? `0 0 14px ${c.hex}` : 'none'
              }}
            >
              <span style={{ color: isFlashing ? '#000' : '#fff', fontWeight: 'bold', fontSize: '11px' }}>
                {c.id.substring(0, 3).toUpperCase()}
              </span>
            </button>
          );
        })}

        <div style={styles.centerHub}>
          <span style={styles.hubStage}>
            {isSolved ? '✓' : `E${currentStage}/${sequence.length}`}
          </span>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%'
  },
  simonRing: {
    position: 'relative',
    width: '136px',
    height: '136px',
    borderRadius: '50%'
  },
  quadrant: {
    position: 'absolute',
    border: '2px solid',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.1s ease'
  },
  top: {
    top: '0',
    left: '26px',
    right: '26px',
    height: '38px',
    borderRadius: '20px 20px 8px 8px'
  },
  right: {
    right: '0',
    top: '26px',
    bottom: '26px',
    width: '38px',
    borderRadius: '8px 20px 20px 8px'
  },
  bottom: {
    bottom: '0',
    left: '26px',
    right: '26px',
    height: '38px',
    borderRadius: '8px 8px 20px 20px'
  },
  left: {
    left: '0',
    top: '26px',
    bottom: '26px',
    width: '38px',
    borderRadius: '20px 8px 8px 20px'
  },
  centerHub: {
    position: 'absolute',
    top: '44px',
    left: '44px',
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    backgroundColor: '#07090f',
    border: '2px solid #1a2233',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  hubStage: {
    fontFamily: 'var(--font-mono)',
    fontSize: '11px',
    fontWeight: 'bold',
    color: 'var(--color-neon-blue)'
  }
};

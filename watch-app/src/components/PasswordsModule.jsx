// src/components/PasswordsModule.jsx - Passwords Module for Galaxy Watch
import React, { useState, useEffect } from 'react';
import { playRotaryClick, triggerHaptic } from '../utils/audioSynth';

export default function PasswordsModule({ moduleData, onVerifyWord, bezelMode }) {
  const [selectedCol, setSelectedCol] = useState(0); // 0 to 4
  const [letterIndices, setLetterIndices] = useState([0, 0, 0, 0, 0]);

  const columns = moduleData?.columns || [
    ['a', 'b', 'c', 'd', 'e', 'f'],
    ['a', 'b', 'c', 'd', 'e', 'f'],
    ['a', 'b', 'c', 'd', 'e', 'f'],
    ['a', 'b', 'c', 'd', 'e', 'f'],
    ['a', 'b', 'c', 'd', 'e', 'f']
  ];
  const isSolved = moduleData?.solved;

  useEffect(() => {
    const handleRotary = (e) => {
      if (bezelMode !== 'interaction' || isSolved) return;
      const { direction } = e.detail || {};
      playRotaryClick();
      triggerHaptic(12);

      setLetterIndices(prev => {
        const next = [...prev];
        const colLength = columns[selectedCol]?.length || 6;
        if (direction === 'clockwise') {
          next[selectedCol] = (next[selectedCol] + 1) % colLength;
        } else {
          next[selectedCol] = (next[selectedCol] - 1 + colLength) % colLength;
        }
        return next;
      });
    };

    window.addEventListener('watch-rotary', handleRotary);
    return () => window.removeEventListener('watch-rotary', handleRotary);
  }, [bezelMode, selectedCol, columns, isSolved]);

  const currentWord = columns.map((col, idx) => col[letterIndices[idx]] || 'a').join('');

  const handleConfirm = () => {
    if (isSolved) return;
    playRotaryClick();
    triggerHaptic(30);
    onVerifyWord(currentWord);
  };

  return (
    <div style={styles.container}>
      <div style={styles.hintTitle}>GIRA BISEL PARA ROTAR LETRA</div>

      {/* 5 Column Letter Slots */}
      <div style={styles.columnsRow}>
        {columns.map((col, cIdx) => {
          const isSelected = selectedCol === cIdx;
          const currentLetter = col[letterIndices[cIdx]] || 'A';

          return (
            <div
              key={cIdx}
              onClick={() => setSelectedCol(cIdx)}
              style={{
                ...styles.columnSlot,
                borderColor: isSelected ? 'var(--color-orange)' : '#1e283d',
                backgroundColor: isSelected ? 'rgba(255, 158, 0, 0.2)' : '#0d111a'
              }}
            >
              <span style={styles.colNumber}>C{cIdx + 1}</span>
              <span
                style={{
                  ...styles.letterChar,
                  color: isSelected ? 'var(--color-orange)' : '#ffffff'
                }}
              >
                {currentLetter.toUpperCase()}
              </span>
            </div>
          );
        })}
      </div>

      {/* Word Preview & Submit */}
      <div style={styles.submitSection}>
        <span style={styles.wordPreview}>{currentWord.toUpperCase()}</span>
        <button
          style={{
            ...styles.verifyBtn,
            backgroundColor: isSolved ? 'var(--color-neon-green)' : 'var(--color-neon-blue)',
            color: '#000'
          }}
          onClick={handleConfirm}
          disabled={isSolved}
        >
          {isSolved ? 'PALABRA CORRECTA ✓' : 'CONFIRMAR'}
        </button>
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
  hintTitle: {
    fontSize: '8px',
    color: '#8da2c0',
    fontFamily: 'var(--font-mono)',
    marginBottom: '6px'
  },
  columnsRow: {
    display: 'flex',
    gap: '4px',
    marginBottom: '8px'
  },
  columnSlot: {
    width: '26px',
    height: '46px',
    borderRadius: '8px',
    border: '1px solid',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer'
  },
  colNumber: {
    fontSize: '7px',
    color: '#55657e',
    fontFamily: 'var(--font-mono)'
  },
  letterChar: {
    fontSize: '18px',
    fontWeight: '900',
    fontFamily: 'var(--font-mono)'
  },
  submitSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  wordPreview: {
    fontSize: '11px',
    fontWeight: '900',
    fontFamily: 'var(--font-mono)',
    color: 'var(--color-neon-blue)',
    letterSpacing: '2px',
    marginBottom: '4px'
  },
  verifyBtn: {
    border: 'none',
    borderRadius: '12px',
    padding: '5px 14px',
    fontSize: '10px',
    fontWeight: '900',
    letterSpacing: '0.8px',
    cursor: 'pointer'
  }
};

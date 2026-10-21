// src/components/MorseCodeModule.jsx - Morse Code Module for Galaxy Watch
import React, { useState, useEffect, useRef } from 'react';
import { playRotaryClick, playMorseBeep, triggerHaptic } from '../utils/audioSynth';

export default function MorseCodeModule({ moduleData, onTransmit, onTelemetry, bezelMode }) {
  const [frequency, setFrequency] = useState(3.500);
  const [isBeaconOn, setIsBeaconOn] = useState(false);
  const isSolved = moduleData?.solved;
  const word = moduleData?.word || 'bomba';

  const morsePattern = moduleData?.morsePattern || '';

  // Morse blinker loop
  useEffect(() => {
    if (isSolved) return;

    let timeoutId = null;
    let cancelled = false;

    // Split pattern into tokens: '.', '-', '/'
    const tokens = [];
    for (let char of morsePattern) {
      if (char === '.' || char === '-' || char === '/') {
        tokens.push(char);
      }
    }
    // Add end of word pause
    tokens.push('pause');

    let tokenIdx = 0;

    const runMorseStep = () => {
      if (cancelled) return;
      const token = tokens[tokenIdx];
      tokenIdx = (tokenIdx + 1) % tokens.length;

      if (token === '.') {
        setIsBeaconOn(true);
        playMorseBeep(false);
        triggerHaptic(15);
        timeoutId = setTimeout(() => {
          setIsBeaconOn(false);
          timeoutId = setTimeout(runMorseStep, 150); // space between parts
        }, 120);
      } else if (token === '-') {
        setIsBeaconOn(true);
        playMorseBeep(true);
        triggerHaptic(35);
        timeoutId = setTimeout(() => {
          setIsBeaconOn(false);
          timeoutId = setTimeout(runMorseStep, 150); // space between parts
        }, 360);
      } else if (token === '/') {
        // Space between letters
        setIsBeaconOn(false);
        timeoutId = setTimeout(runMorseStep, 400);
      } else {
        // Space between words
        setIsBeaconOn(false);
        timeoutId = setTimeout(runMorseStep, 1200);
      }
    };

    runMorseStep();

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [morsePattern, isSolved]);

  // Rotary Bezel tunes frequency 3.500 - 3.600 MHz
  useEffect(() => {
    const handleRotary = (e) => {
      if (bezelMode !== 'interaction' || isSolved) return;
      const { direction } = e.detail || {};
      playRotaryClick();
      triggerHaptic(12);

      setFrequency(prev => {
        let step = 0.005;
        let next = direction === 'clockwise' ? prev + step : prev - step;
        if (next > 3.600) next = 3.600;
        if (next < 3.500) next = 3.500;
        const rounded = Math.round(next * 1000) / 1000;

        // Send telemetry immediately to phone app oscilloscope
        onTelemetry({
          morseFreq: rounded,
          rotaryAngle: Math.round((rounded - 3.500) * 3600)
        });

        return rounded;
      });
    };

    window.addEventListener('watch-rotary', handleRotary);
    return () => window.removeEventListener('watch-rotary', handleRotary);
  }, [bezelMode, isSolved, onTelemetry]);

  const handleTransmit = () => {
    if (isSolved) return;
    playRotaryClick();
    triggerHaptic(30);
    onTransmit(frequency);
  };

  return (
    <div style={styles.container}>
      {/* Flashing Morse Light Beacon */}
      <div style={styles.beaconArea}>
        <div
          style={{
            ...styles.beaconBulb,
            backgroundColor: isBeaconOn ? '#ffb703' : '#221900',
            borderColor: isBeaconOn ? '#ffe169' : '#473600',
            boxShadow: isBeaconOn ? '0 0 16px #ffb703, 0 0 30px #ffd166' : 'none'
          }}
        />
        <span style={styles.beaconLabel}>SEÑAL ÓPTICA MORSE</span>
      </div>

      {/* Frequency Readout */}
      <div style={styles.freqBox}>
        <span style={styles.freqDigits}>{frequency.toFixed(3)}</span>
        <span style={styles.freqUnit}>MHz</span>
      </div>

      {/* Transmit Button */}
      <button
        style={{
          ...styles.transmitBtn,
          backgroundColor: isSolved ? 'var(--color-neon-green)' : 'var(--color-orange)',
          color: '#000'
        }}
        onClick={handleTransmit}
        disabled={isSolved}
      >
        {isSolved ? 'SINTONIZADO ✓' : 'TRANSMITIR'}
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
  beaconArea: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '8px'
  },
  beaconBulb: {
    width: '26px',
    height: '26px',
    borderRadius: '50%',
    border: '2px solid',
    marginBottom: '2px',
    transition: 'all 0.05s ease'
  },
  beaconLabel: {
    fontSize: '8px',
    color: '#8da2c0',
    fontFamily: 'var(--font-mono)'
  },
  freqBox: {
    backgroundColor: '#05070c',
    border: '1px solid #1c273c',
    borderRadius: '10px',
    padding: '4px 12px',
    display: 'flex',
    alignItems: 'baseline',
    gap: '4px',
    marginBottom: '8px'
  },
  freqDigits: {
    fontFamily: 'var(--font-mono)',
    fontSize: '18px',
    fontWeight: '900',
    color: 'var(--color-neon-blue)'
  },
  freqUnit: {
    fontFamily: 'var(--font-mono)',
    fontSize: '9px',
    color: '#718096'
  },
  transmitBtn: {
    border: 'none',
    borderRadius: '12px',
    padding: '6px 16px',
    fontSize: '10px',
    fontWeight: '900',
    letterSpacing: '0.8px',
    cursor: 'pointer'
  }
};

// src/components/NeedyVentCapacitorModule.jsx - Gas Vent & Capacitor Module for Galaxy Watch
import React, { useEffect } from 'react';
import { playRotaryClick, triggerHaptic } from '../utils/audioSynth';

export default function NeedyVentCapacitorModule({ moduleData, onVentAction, bezelMode }) {
  const isQuestion = moduleData?.isQuestion;
  const question = moduleData?.question || '¿VENTILAR GAS?';
  const capacitorCharge = Math.round(moduleData?.capacitorCharge || 0);
  const timerSeconds = Math.max(0, Math.ceil(moduleData?.timerSeconds || 0));

  // Discharging capacitor via physical rotary bezel
  useEffect(() => {
    const handleRotary = () => {
      if (bezelMode !== 'interaction' || isQuestion) return;
      playRotaryClick();
      triggerHaptic(15);
      onVentAction({ action: 'discharge_capacitor', dischargeAmount: 18 });
    };

    window.addEventListener('watch-rotary', handleRotary);
    return () => window.removeEventListener('watch-rotary', handleRotary);
  }, [bezelMode, isQuestion, onVentAction]);

  const handleAnswer = (ans) => {
    playRotaryClick();
    triggerHaptic(25);
    onVentAction({ action: 'answer_prompt', answer: ans });
  };

  const handleDischargeBtn = () => {
    playRotaryClick();
    triggerHaptic(25);
    onVentAction({ action: 'discharge_capacitor', dischargeAmount: 25 });
  };

  return (
    <div style={styles.container}>
      {isQuestion ? (
        <div style={styles.questionMode}>
          <div style={styles.emergencyTimer}>{timerSeconds}s</div>
          <div style={styles.promptQuestion}>{question}</div>
          <div style={styles.buttonsRow}>
            <button
              style={{ ...styles.ansBtn, backgroundColor: 'var(--color-neon-green)', color: '#000' }}
              onClick={() => handleAnswer('S')}
            >
              S (SÍ)
            </button>
            <button
              style={{ ...styles.ansBtn, backgroundColor: 'var(--color-neon-pink)', color: '#fff' }}
              onClick={() => handleAnswer('N')}
            >
              N (NO)
            </button>
          </div>
        </div>
      ) : (
        <div style={styles.capacitorMode}>
          <div style={styles.capLabel}>CONDENSADOR</div>
          <div style={styles.capGaugeBox}>
            <div
              style={{
                ...styles.capBarFill,
                height: `${capacitorCharge}%`,
                backgroundColor: capacitorCharge > 75 ? 'var(--color-neon-pink)' : 'var(--color-neon-blue)'
              }}
            />
            <span style={styles.capText}>{capacitorCharge}%</span>
          </div>

          <button
            style={styles.dischargeBtn}
            onClick={handleDischargeBtn}
          >
            DESCARGAR (O GIRA BISEL)
          </button>
        </div>
      )}
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
  questionMode: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  emergencyTimer: {
    fontFamily: 'var(--font-mono)',
    fontSize: '12px',
    fontWeight: '900',
    color: '#ffb703',
    marginBottom: '4px'
  },
  promptQuestion: {
    fontSize: '11px',
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: '0.5px',
    textAlign: 'center',
    marginBottom: '10px'
  },
  buttonsRow: {
    display: 'flex',
    gap: '10px'
  },
  ansBtn: {
    width: '56px',
    height: '38px',
    borderRadius: '10px',
    border: 'none',
    fontSize: '11px',
    fontWeight: '900',
    cursor: 'pointer'
  },
  capacitorMode: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  capLabel: {
    fontSize: '9px',
    fontWeight: 'bold',
    color: '#8da2c0',
    marginBottom: '4px'
  },
  capGaugeBox: {
    width: '40px',
    height: '60px',
    borderRadius: '8px',
    backgroundColor: '#05070c',
    border: '1px solid #1c273c',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: '8px'
  },
  capBarFill: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    transition: 'height 0.2s ease'
  },
  capText: {
    position: 'relative',
    fontFamily: 'var(--font-mono)',
    fontSize: '10px',
    fontWeight: '900',
    color: '#fff',
    textShadow: '0 0 4px #000'
  },
  dischargeBtn: {
    backgroundColor: 'var(--color-orange)',
    color: '#000',
    border: 'none',
    borderRadius: '12px',
    padding: '4px 10px',
    fontSize: '8px',
    fontWeight: '900',
    cursor: 'pointer'
  }
};

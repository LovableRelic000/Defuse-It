// src/components/WatchHeader.jsx - Header Bar for Galaxy Watch
import React from 'react';
import { playRotaryClick, triggerHaptic } from '../utils/audioSynth';

export default function WatchHeader({
  timeRemainingMs = 0,
  strikes = 0,
  maxStrikes = 3,
  bezelMode = 'carousel', // 'carousel' or 'interaction'
  onToggleBezelMode,
  isEdgeworkActive,
  onToggleEdgework
}) {
  const totalSeconds = Math.max(0, Math.floor(timeRemainingMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const tenths = Math.floor((timeRemainingMs % 1000) / 100);

  const isPanic = strikes > 0 || totalSeconds < 60;

  const handleToggle = () => {
    playRotaryClick();
    triggerHaptic(20);
    onToggleBezelMode();
  };

  const handleEdgework = () => {
    playRotaryClick();
    triggerHaptic(20);
    onToggleEdgework();
  };

  return (
    <div className="watch-top-bar">
      <div className="time-strikes-row">
        {/* Authoritative Clock */}
        <div className={`watch-timer ${isPanic ? 'panic' : ''}`}>
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}.{tenths}
        </div>

        {/* Edgework Switch Button */}
        <button
          className="edgework-tab-btn"
          onClick={handleEdgework}
          style={{
            borderColor: isEdgeworkActive ? 'var(--color-neon-blue)' : '#334466',
            color: isEdgeworkActive ? 'var(--color-neon-blue)' : '#8da2c0'
          }}
        >
          {isEdgeworkActive ? 'MÓDULOS' : 'CARCASA'}
        </button>

        {/* Strikes */}
        <div className="watch-strikes">
          {[1, 2, 3].map(s => (
            <div
              key={s}
              className={`strike-dot ${s <= strikes ? 'active' : ''}`}
            >
              X
            </div>
          ))}
        </div>
      </div>

      {/* Bezel Mode Toggle Pill */}
      <div
        className={`bezel-mode-toggle ${bezelMode === 'interaction' ? 'active-interaction' : ''}`}
        onClick={handleToggle}
      >
        <span className="bezel-mode-icon">
          {bezelMode === 'interaction' ? '⚙' : '🔄'}
        </span>
        <span className="bezel-mode-text">
          {bezelMode === 'interaction' ? 'BISEL: ACCIÓN' : 'BISEL: CARRUSEL'}
        </span>
      </div>
    </div>
  );
}

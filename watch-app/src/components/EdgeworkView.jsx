// src/components/EdgeworkView.jsx - Edgework (Carcasa Lateral) View for Galaxy Watch
import React from 'react';

export default function EdgeworkView({ edgework }) {
  if (!edgework) {
    return <div style={{ color: '#888', fontSize: '10px' }}>Sin datos de carcasa</div>;
  }

  const { serialNumber, batteries, indicators, ports } = edgework;

  return (
    <div style={styles.container}>
      <div style={styles.title}>CARCASA (EDGEWORK)</div>

      <div style={styles.grid}>
        {/* Serial Number */}
        <div style={styles.card}>
          <span style={styles.label}>SERIAL</span>
          <span style={styles.value}>{serialNumber}</span>
        </div>

        {/* Batteries */}
        <div style={styles.card}>
          <span style={styles.label}>BATERÍAS ({batteries.total})</span>
          <span style={styles.subValue}>AA: {batteries.aa} | D: {batteries.d}</span>
        </div>

        {/* Indicators */}
        <div style={{ ...styles.card, gridColumn: 'span 2' }}>
          <span style={styles.label}>INDICADORES</span>
          <span style={styles.subValue}>
            {indicators.length === 0 ? 'Ninguno' :
              indicators.map(i => `${i.label}${i.lit ? '●' : '○'}`).join('  ')}
          </span>
        </div>

        {/* Ports */}
        <div style={{ ...styles.card, gridColumn: 'span 2' }}>
          <span style={styles.label}>PUERTOS</span>
          <span style={styles.subValue}>
            {ports.length === 0 ? 'Ninguno' : ports.join(', ')}
          </span>
        </div>
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
  title: {
    color: 'var(--color-neon-blue)',
    fontSize: '9px',
    fontWeight: '900',
    letterSpacing: '1px',
    marginBottom: '4px'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '4px',
    width: '148px'
  },
  card: {
    backgroundColor: '#0a0d14',
    border: '1px solid #1a2233',
    borderRadius: '6px',
    padding: '3px 4px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  label: {
    color: '#65789b',
    fontSize: '7px',
    fontWeight: 'bold'
  },
  value: {
    color: '#ffffff',
    fontSize: '12px',
    fontWeight: '900',
    fontFamily: 'var(--font-mono)'
  },
  subValue: {
    color: '#cbd5e1',
    fontSize: '8px',
    fontWeight: 'bold',
    fontFamily: 'var(--font-mono)',
    textAlign: 'center'
  }
};

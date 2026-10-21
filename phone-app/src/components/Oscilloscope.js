// src/components/Oscilloscope.js - Real-time Audio / Radio Wave Oscilloscope
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Line, Rect } from 'react-native-svg';

export default function Oscilloscope({ frequency = 3.500, rotaryAngle = 0, isPurging = false }) {
  const [phase, setPhase] = useState(0);
  const animRef = useRef(null);

  useEffect(() => {
    let currentPhase = 0;
    const interval = setInterval(() => {
      // Scale phase velocity with frequency
      const freqFactor = (frequency - 3.490) * 12;
      currentPhase = (currentPhase + 0.15 * Math.max(0.5, freqFactor)) % (Math.PI * 2);
      setPhase(currentPhase);
    }, 33); // ~30 fps

    return () => clearInterval(interval);
  }, [frequency]);

  const width = 320;
  const height = 90;
  const centerY = height / 2;

  // Generate SVG path for sine waveform
  const points = [];
  const cycles = 3 + (frequency - 3.500) * 40; // More cycles as frequency increases
  const amplitude = isPurging ? 38 : 26;

  for (let x = 0; x <= width; x += 4) {
    const angle = (x / width) * cycles * Math.PI * 2 + phase + (rotaryAngle * Math.PI / 180);
    // Add harmonic flutter
    const harmonic = Math.sin(angle * 2.5) * 4;
    const y = centerY + Math.sin(angle) * amplitude + harmonic;
    points.push(`${x},${y.toFixed(1)}`);
  }

  const pathData = `M ${points.join(' L ')}`;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.badgeRow}>
          <View style={[styles.ledDot, { backgroundColor: isPurging ? '#00f2fe' : '#00ff88' }]} />
          <Text style={styles.label}>OSCILOSCOPIO RF / BANDA MORSE</Text>
        </View>
        <Text style={styles.freqValue}>{frequency.toFixed(3)} MHz</Text>
      </View>

      <View style={styles.screenWrapper}>
        <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
          {/* Background CRT Grid */}
          <Rect x="0" y="0" width={width} height={height} fill="#05100a" />
          {[20, 45, 70].map(y => (
            <Line key={`h-${y}`} x1="0" y1={y} x2={width} y2={y} stroke="#0e2a1b" strokeWidth="1" strokeDasharray="3,3" />
          ))}
          {[40, 80, 120, 160, 200, 240, 280].map(x => (
            <Line key={`v-${x}`} x1={x} y1="0" x2={x} y2={height} stroke="#0e2a1b" strokeWidth="1" strokeDasharray="3,3" />
          ))}

          {/* Center Zero line */}
          <Line x1="0" y1={centerY} x2={width} y2={centerY} stroke="#1b4d32" strokeWidth="1" />

          {/* Glow Wave */}
          <Path
            d={pathData}
            fill="none"
            stroke={isPurging ? 'rgba(0, 242, 254, 0.4)' : 'rgba(0, 255, 136, 0.35)'}
            strokeWidth="5"
          />
          {/* Core Crisp Wave */}
          <Path
            d={pathData}
            fill="none"
            stroke={isPurging ? '#4facfe' : '#00ff88'}
            strokeWidth="2"
          />
        </Svg>
      </View>

      <View style={styles.subtextRow}>
        <Text style={styles.subtext}>Resonancia del Bisel: {rotaryAngle}°</Text>
        <Text style={styles.subtextStatus}>{isPurging ? 'PURGA EN CURSO' : 'SINCRONIZADO 30Hz'}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0c1511',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#173623',
    marginVertical: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ledDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  label: {
    color: '#7be495',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  freqValue: {
    color: '#00ff88',
    fontSize: 15,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  screenWrapper: {
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1f4e32',
  },
  subtextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  subtext: {
    color: '#4d7c60',
    fontSize: 10,
    fontFamily: 'monospace',
  },
  subtextStatus: {
    color: '#7be495',
    fontSize: 10,
    fontWeight: '600',
  }
});

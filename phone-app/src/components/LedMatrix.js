// src/components/LedMatrix.js - Live 12-LED Matrix for Needy Knob Module
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function LedMatrix({ leds, timerSeconds = 0, targetDirection = '' }) {
  const topRow = leds?.top || [0, 0, 0, 0, 0, 0];
  const bottomRow = leds?.bottom || [0, 0, 0, 0, 0, 0];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleGroup}>
          <Text style={styles.title}>TELEMETRÍA DE PERILLAS (12 LEDs)</Text>
          <Text style={styles.subtitle}>El reloj debe apuntar a la dirección correspondiente</Text>
        </View>
        <View style={styles.timerBox}>
          <Text style={styles.timerText}>{Math.ceil(timerSeconds)}s</Text>
        </View>
      </View>

      <View style={styles.matrixBoard}>
        {/* Top Row of 6 */}
        <View style={styles.row}>
          <Text style={styles.rowLabel}>SUP</Text>
          <View style={styles.ledsRow}>
            {topRow.map((val, idx) => (
              <View key={`top-${idx}`} style={styles.ledSlot}>
                <View style={[styles.led, val === 1 ? styles.ledOn : styles.ledOff]} />
                <Text style={styles.ledIndex}>{idx + 1}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Bottom Row of 6 */}
        <View style={styles.row}>
          <Text style={styles.rowLabel}>INF</Text>
          <View style={styles.ledsRow}>
            {bottomRow.map((val, idx) => (
              <View key={`bot-${idx}`} style={styles.ledSlot}>
                <View style={[styles.led, val === 1 ? styles.ledOn : styles.ledOff]} />
                <Text style={styles.ledIndex}>{idx + 1}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.instruction}>
          Patrón activo: <Text style={styles.codeText}>{topRow.join(' ')} / {bottomRow.join(' ')}</Text>
        </Text>
        {targetDirection ? (
          <View style={styles.badgeHint}>
            <Text style={styles.badgeHintText}>Orientación Requerida: {targetDirection}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#121217',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#262635',
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  titleGroup: {
    flex: 1,
  },
  title: {
    color: '#ffaa00',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 0.8,
  },
  subtitle: {
    color: '#888',
    fontSize: 10,
    marginTop: 1,
  },
  timerBox: {
    backgroundColor: '#2b1b00',
    borderColor: '#ffaa00',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  timerText: {
    color: '#ffaa00',
    fontSize: 12,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  matrixBoard: {
    backgroundColor: '#07070a',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#1e1e2d',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowLabel: {
    color: '#555',
    fontSize: 9,
    fontFamily: 'monospace',
    width: 28,
  },
  ledsRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  ledSlot: {
    alignItems: 'center',
  },
  led: {
    width: 18,
    height: 18,
    borderRadius: 9,
    marginVertical: 2,
  },
  ledOn: {
    backgroundColor: '#00ff66',
    shadowColor: '#00ff66',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#a3ffcc',
  },
  ledOff: {
    backgroundColor: '#192b20',
    borderWidth: 1,
    borderColor: '#284031',
  },
  ledIndex: {
    color: '#444',
    fontSize: 8,
    fontFamily: 'monospace',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#161622',
    marginVertical: 6,
  },
  footer: {
    marginTop: 8,
  },
  instruction: {
    color: '#aaa',
    fontSize: 10,
  },
  codeText: {
    color: '#fff',
    fontFamily: 'monospace',
  },
  badgeHint: {
    marginTop: 4,
    backgroundColor: 'rgba(255, 170, 0, 0.15)',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  badgeHintText: {
    color: '#ffc14d',
    fontSize: 10,
    fontWeight: '600',
  }
});

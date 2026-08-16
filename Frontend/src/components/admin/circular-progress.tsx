// ── Circular Percentage Progress Indicator ──────────────────────────────────
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

interface CircularProgressProps {
  size?: number;
  strokeWidth?: number;
  percent: number;
  currentPart?: number;
  totalParts?: number;
  isCompleted?: boolean;
}

export function CircularProgress({
  size = 130,
  strokeWidth = 10,
  percent = 0,
  currentPart = 0,
  totalParts = 0,
  isCompleted = false,
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const clampedPercent = Math.min(100, Math.max(0, percent));
  const strokeDashoffset = circumference - (circumference * clampedPercent) / 100;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#7C3AED" />
            <Stop offset="100%" stopColor="#06B6D4" />
          </LinearGradient>
          <LinearGradient id="successGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#10B981" />
            <Stop offset="100%" stopColor="#06B6D4" />
          </LinearGradient>
        </Defs>

        {/* Background Track */}
        <Circle
          stroke="#1E1E38"
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />

        {/* Animated Progress Arc */}
        <Circle
          stroke={isCompleted ? 'url(#successGradient)' : 'url(#progressGradient)'}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>

      {/* Center Percentage & Info */}
      <View style={styles.centerContent}>
        {isCompleted ? (
          <>
            <Text style={styles.checkIcon}>✓</Text>
            <Text style={styles.doneLabel}>100%</Text>
          </>
        ) : (
          <>
            <Text style={styles.percentText}>{clampedPercent}%</Text>
            {totalParts > 0 && (
              <Text style={styles.partText}>
                {currentPart}/{totalParts}
              </Text>
            )}
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', alignSelf: 'center' },
  centerContent: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  percentText: { fontSize: 24, fontWeight: '800', color: '#FFF' },
  partText: { fontSize: 11, color: '#38BDF8', fontWeight: '600', marginTop: 2 },
  checkIcon: { fontSize: 32, color: '#10B981', fontWeight: '800' },
  doneLabel: { fontSize: 11, color: '#10B981', fontWeight: '700', marginTop: -2 },
});

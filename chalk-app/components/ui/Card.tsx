import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius, shadows } from '@/constants/Colors';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: 'default' | 'glow' | 'glass';
}

export function Card({ children, style, variant = 'default' }: CardProps) {
  if (variant === 'glow') {
    return (
      <View style={[styles.glowContainer, style]}>
        <View style={styles.glowEffect} />
        <View style={styles.card}>{children}</View>
      </View>
    );
  }

  if (variant === 'glass') {
    return (
      <View style={[styles.glassCard, style]}>
        <LinearGradient
          colors={['rgba(255,255,255,0.03)', 'rgba(255,255,255,0.01)']}
          style={StyleSheet.absoluteFill}
        />
        {children}
      </View>
    );
  }

  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bg.secondary,
    borderRadius: radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  glassCard: {
    borderRadius: radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  glowContainer: {
    position: 'relative',
  },
  glowEffect: {
    position: 'absolute',
    top: 4,
    left: 4,
    right: 4,
    bottom: -4,
    backgroundColor: colors.accent.glow,
    borderRadius: radius.lg,
    opacity: 0.3,
    filter: 'blur(10px)', // Note: This might not work on all RN versions natively without reanimated
  },
});

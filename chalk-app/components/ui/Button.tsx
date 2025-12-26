import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, StyleProp } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius, typography, components } from '@/constants/Colors';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  style
}: ButtonProps) {

  const height = components.button[size];
  const fontSize = size === 'sm' ? 13 : size === 'md' ? 15 : 16;

  if (variant === 'primary') {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        disabled={disabled || loading}
        style={[styles.container, style]}
      >
        <LinearGradient
          colors={[colors.accent.gradientStart, colors.accent.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.gradient,
            { height, borderRadius: radius.md },
            disabled && styles.disabled,
          ]}
        >
          {loading ? (
            <ActivityIndicator color={colors.text.inverse} />
          ) : (
            <>
              {icon}
              <Text style={[
                styles.textPrimary,
                { fontSize },
                icon ? { marginLeft: 8 } : {}
              ]}>
                {title}
              </Text>
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  // Secondary / Outline / Ghost logic
  const bg = variant === 'secondary' ? colors.bg.tertiary : 'transparent';
  const border = variant === 'outline' ? 1 : 0;
  const borderColor = variant === 'outline' ? colors.border.default : 'transparent';
  const textColor = variant === 'ghost' ? colors.text.muted : colors.text.primary;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.base,
        { height, backgroundColor: bg, borderWidth: border, borderColor, borderRadius: radius.md },
        disabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <>
          {icon}
          <Text style={[styles.textSecondary, { color: textColor, fontSize }, icon ? { marginLeft: 8 } : {}]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    shadowColor: colors.accent.default,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  textPrimary: {
    ...typography.small,
    fontWeight: '700',
    color: colors.text.inverse,
  },
  textSecondary: {
    ...typography.small,
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.5,
  },
});

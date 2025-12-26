import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
} from 'react-native-reanimated';

import Colors, { spacing, typography, radius, shadows } from '@/constants/Colors';
import { useColorScheme } from '../useColorScheme';

type GlowColor = 'mint' | 'light' | 'dark';
type ButtonVariant = 'gradient' | 'outline' | 'secondary' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface NeonButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  glowColor?: GlowColor;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export function NeonButton({
  title,
  onPress,
  variant = 'gradient',
  size = 'md',
  glowColor = 'mint',
  loading = false,
  disabled = false,
  fullWidth = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
}: NeonButtonProps) {
  const colorScheme = useColorScheme() ?? 'dark';
  const colors = Colors[colorScheme];

  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const handlePressIn = () => {
    scale.value = withTiming(0.97, { duration: 100 });
    glowOpacity.value = withSequence(
      withTiming(1, { duration: 150 }),
      withTiming(0, { duration: 300 })
    );
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 100 });
  };

  // Glow colors - 민트 계열
  const getGlowColors = (): [string, string] => {
    return [colors.tint, colors.tint + '00'];
  };

  // Button heights
  const buttonHeight = {
    sm: 36,
    md: 44,
    lg: 52,
  }[size];

  const fontSize = {
    sm: 13,
    md: 15,
    lg: 16,
  }[size];

  const paddingHorizontal = {
    sm: 14,
    md: 18,
    lg: 24,
  }[size];

  // Gradient colors - 민트 계열
  const gradientColors: [string, string] = [colors.tintLight, colors.tint];

  // Text color
  const getTextColor = () => {
    if (disabled) return colors.textMuted;
    switch (variant) {
      case 'gradient':
        return '#FFFFFF';
      case 'outline':
        return colors.tint;
      case 'secondary':
        return colors.tint;
      case 'ghost':
        return colors.textSecondary;
      default:
        return colors.text;
    }
  };

  // Button styles
  const getButtonStyles = (): ViewStyle[] => {
    const base: ViewStyle = {
      height: buttonHeight,
      paddingHorizontal,
      borderRadius: radius.lg,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
    };

    if (fullWidth) {
      base.width = '100%';
    }

    switch (variant) {
      case 'outline':
        return [
          base,
          {
            backgroundColor: 'transparent',
            borderWidth: 1.5,
            borderColor: colors.tint,
          },
        ];
      case 'secondary':
        return [
          base,
          {
            backgroundColor: colors.brandMuted,
          },
        ];
      case 'ghost':
        return [base, { backgroundColor: 'transparent' }];
      default:
        return [base];
    }
  };

  const content = (
    <>
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <>
          {icon && iconPosition === 'left' && icon}
          <Text
            style={[
              styles.text,
              { fontSize, color: getTextColor() },
              textStyle,
            ]}
          >
            {title}
          </Text>
          {icon && iconPosition === 'right' && icon}
        </>
      )}
    </>
  );

  if (variant === 'gradient') {
    return (
      <View style={[fullWidth && styles.fullWidth, style]}>
        {/* Glow layer */}
        <Animated.View style={[styles.glowLayer, glowAnimatedStyle]}>
          <LinearGradient
            colors={getGlowColors()}
            style={styles.glowGradient}
          />
        </Animated.View>

        <AnimatedTouchable
          style={[animatedStyle, styles.gradientButtonContainer, fullWidth && styles.fullWidth]}
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.9}
          disabled={disabled || loading}
          accessibilityRole="button"
          accessibilityState={{ disabled }}
        >
          <LinearGradient
            colors={disabled ? [colors.textMuted, colors.textMuted] : gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.gradientButton,
              { height: buttonHeight, paddingHorizontal, borderRadius: radius.lg },
            ]}
          >
            {content}
          </LinearGradient>
        </AnimatedTouchable>
      </View>
    );
  }

  return (
    <View style={[fullWidth && styles.fullWidth, style]}>
      {/* Glow layer for outline buttons */}
      {variant === 'outline' && (
        <Animated.View style={[styles.glowLayer, glowAnimatedStyle]}>
          <LinearGradient
            colors={getGlowColors()}
            style={styles.glowGradient}
          />
        </Animated.View>
      )}

      <AnimatedTouchable
        style={[animatedStyle, ...getButtonStyles(), disabled && styles.disabled]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.7}
        disabled={disabled || loading}
        accessibilityRole="button"
        accessibilityState={{ disabled }}
      >
        {content}
      </AnimatedTouchable>
    </View>
  );
}

const styles = StyleSheet.create({
  fullWidth: {
    width: '100%',
  },
  gradientButtonContainer: {
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  text: {
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  disabled: {
    opacity: 0.5,
  },
  glowLayer: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    zIndex: -1,
  },
  glowGradient: {
    flex: 1,
    borderRadius: radius.xxl,
  },
});

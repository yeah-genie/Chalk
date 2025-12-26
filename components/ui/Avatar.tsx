import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import Colors, { radius, componentSizes } from '@/constants/Colors';
import { useColorScheme } from '../useColorScheme';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type AvatarVariant = 'gradient' | 'ring' | 'solid';
type AvatarColor = 'mint' | 'light' | 'dark';

interface AvatarProps {
  name: string;
  size?: AvatarSize;
  variant?: AvatarVariant;
  color?: AvatarColor;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Avatar({
  name,
  size = 'md',
  variant = 'gradient',
  color = 'mint',
  style,
  textStyle,
}: AvatarProps) {
  const colorScheme = useColorScheme() ?? 'dark';
  const colors = Colors[colorScheme];

  const initials = getInitials(name);
  const avatarSize = componentSizes.avatar[size];
  const fontSize = getFontSize(size);

  const getGradientColors = (): [string, string] => {
    switch (color) {
      case 'light':
        return [colors.tintLight, colors.tint];
      case 'dark':
        return [colors.tint, colors.tintDark];
      case 'mint':
      default:
        return [colors.tintLight, colors.tint];
    }
  };

  const containerStyle: ViewStyle[] = [
    styles.container,
    {
      width: avatarSize,
      height: avatarSize,
      borderRadius: avatarSize / 2,
    },
    style,
  ];

  const textStyles: TextStyle[] = [
    styles.text,
    { fontSize },
    textStyle,
  ];

  // Solid variant
  if (variant === 'solid') {
    return (
      <View style={[containerStyle, { backgroundColor: colors.brandMuted }]}>
        <Text style={[textStyles, { color: colors.tint }]}>{initials}</Text>
      </View>
    );
  }

  // Ring variant - gradient border with transparent inside
  if (variant === 'ring') {
    return (
      <LinearGradient
        colors={getGradientColors()}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={containerStyle}
      >
        <View
          style={[
            styles.ringInner,
            {
              width: avatarSize - 4,
              height: avatarSize - 4,
              borderRadius: (avatarSize - 4) / 2,
              backgroundColor: colors.background,
            },
          ]}
        >
          <Text style={[textStyles, { color: colors.text }]}>{initials}</Text>
        </View>
      </LinearGradient>
    );
  }

  // Gradient variant (default)
  return (
    <LinearGradient
      colors={getGradientColors()}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={containerStyle}
    >
      <Text style={[textStyles, { color: '#FFFFFF' }]}>{initials}</Text>
    </LinearGradient>
  );
}

function getInitials(name: string): string {
  const parts = name.trim().split(' ');
  if (parts.length === 1) {
    return parts[0].charAt(0);
  }
  return parts
    .slice(0, 2)
    .map(p => p.charAt(0))
    .join('')
    .toUpperCase();
}

function getFontSize(size: AvatarSize): number {
  switch (size) {
    case 'xs':
      return 10;
    case 'sm':
      return 12;
    case 'md':
      return 14;
    case 'lg':
      return 16;
    case 'xl':
      return 22;
    default:
      return 14;
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  text: {
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  ringInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

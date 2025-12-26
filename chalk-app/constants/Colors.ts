const tintColorLight = '#00D4AA'; // Mint/Teal accent
const tintColorDark = '#00D4AA';

// Enhanced Palette for "Cool/Modern" feel
export const colors = {
  bg: {
    base: '#0B0D10',      // Almost pure black
    secondary: '#15171C', // Card background
    tertiary: '#1F2229',  // Inputs/Hover
    elevated: '#2A2D36',  // Modals/Popovers
  },
  text: {
    primary: '#FFFFFF',
    secondary: '#9CA3AF', // Gray-400
    muted: '#6B7280',     // Gray-500
    inverse: '#000000',
  },
  accent: {
    default: '#00D4AA',   // Main Mint
    gradientStart: '#00D4AA',
    gradientEnd: '#00B8D4', // Cyan
    muted: 'rgba(0, 212, 170, 0.15)',
    subtle: 'rgba(0, 212, 170, 0.05)',
    glow: 'rgba(0, 212, 170, 0.4)',
  },
  status: {
    success: '#10B981', // Emerald
    warning: '#F59E0B', // Amber
    error: '#EF4444',   // Red
    info: '#3B82F6',    // Blue
  },
  border: {
    default: '#27272A', // Zinc-800
    light: '#3F3F46',   // Zinc-700
    focus: '#00D4AA',
  },
  level: {
    high: '#10B981',
    mid: '#F59E0B',
    low: '#EF4444',
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const typography = {
  h1: { fontSize: 28, fontWeight: '700' as '700', letterSpacing: -0.5 },
  h2: { fontSize: 22, fontWeight: '600' as '600', letterSpacing: -0.5 },
  h3: { fontSize: 18, fontWeight: '600' as '600' },
  body: { fontSize: 16, fontWeight: '400' as '400', lineHeight: 24 },
  small: { fontSize: 14, fontWeight: '500' as '500' },
  caption: { fontSize: 12, fontWeight: '500' as '500' },
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  glow: {
    shadowColor: colors.accent.default,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
};

export const components = {
  button: {
    sm: 36,
    md: 48,
    lg: 56,
  },
};

export default {
  light: {
    text: '#000',
    background: '#fff',
    tint: tintColorLight,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#fff',
    background: '#000',
    tint: tintColorDark,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorDark,
  },
};

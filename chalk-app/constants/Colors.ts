// Palette based on Tailwind CSS 'Slate' and 'Indigo' (2024 Trending Dark Mode)
// Reference: chalk-portfolio-extracted

const tintColorLight = '#6366F1'; // Indigo 500
const tintColorDark = '#6366F1';

export const colors = {
  bg: {
    base: '#0F172A',      // Slate 900 - Deep, rich blue-grey
    secondary: '#1E293B', // Slate 800 - Lighter for cards
    tertiary: '#334155',  // Slate 700 - Inputs/Hover
    elevated: '#1E293B',  // Slate 800 - Modals
  },
  text: {
    primary: '#F8FAFC',   // Slate 50 - High contrast white
    secondary: '#94A3B8', // Slate 400 - Muted text
    muted: '#64748B',     // Slate 500 - Deep muted
    inverse: '#FFFFFF',
  },
  accent: {
    default: '#6366F1',   // Indigo 500 - Primary Brand
    gradientStart: '#6366F1', // Indigo 500
    gradientEnd: '#818CF8',   // Indigo 400
    muted: 'rgba(99, 102, 241, 0.15)', // Low opacity indigo
    subtle: 'rgba(99, 102, 241, 0.05)',
    glow: 'rgba(99, 102, 241, 0.4)',
  },
  status: {
    success: '#10B981', // Emerald 500
    warning: '#F59E0B', // Amber 500
    error: '#EF4444',   // Red 500
    info: '#3B82F6',    // Blue 500
  },
  border: {
    default: '#1E293B', // Slate 800 (Card borders)
    light: '#334155',   // Slate 700 (Separators)
    focus: '#6366F1',   // Indigo 500
  },
  level: {
    high: '#10B981', // Emerald
    mid: '#F59E0B',  // Amber
    low: '#EF4444',  // Red
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
    text: '#0F172A',
    background: '#FFFFFF',
    tint: tintColorLight,
    tabIconDefault: '#94A3B8',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#F8FAFC',
    background: '#0F172A',
    tint: tintColorDark,
    tabIconDefault: '#475569',
    tabIconSelected: tintColorDark,
  },
};

/**
 * Chalk App - Mint Academy Design System
 * 민트 계열 단일 컬러로 통일된 클린한 테마
 */

// ===========================================
// BRAND COLORS - 민트 계열 통일
// ===========================================
const brand = {
  primary: '#00D4AA', // Main Mint
  primaryLight: '#00F5C4', // Light Mint (glow)
  primaryDark: '#00B894', // Dark Mint
  accent: '#00E5BF', // Accent Mint
  textLight: '#F0F5F3', // Mint-tinted white
};

// ===========================================
// SPACING
// ===========================================
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

// ===========================================
// TYPOGRAPHY
// ===========================================
export const typography = {
  h1: {
    fontSize: 28,
    fontWeight: '800' as const,
    letterSpacing: -0.5,
    lineHeight: 34,
  },
  h2: {
    fontSize: 22,
    fontWeight: '700' as const,
    letterSpacing: -0.3,
    lineHeight: 28,
  },
  h3: {
    fontSize: 18,
    fontWeight: '600' as const,
    letterSpacing: -0.2,
    lineHeight: 24,
  },
  body: {
    fontSize: 15,
    fontWeight: '400' as const,
    lineHeight: 22,
  },
  bodyMedium: {
    fontSize: 15,
    fontWeight: '500' as const,
    lineHeight: 22,
  },
  bodySmall: {
    fontSize: 13,
    fontWeight: '400' as const,
    lineHeight: 18,
  },
  caption: {
    fontSize: 12,
    fontWeight: '500' as const,
    lineHeight: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600' as const,
    lineHeight: 18,
  },
  number: {
    fontSize: 32,
    fontWeight: '800' as const,
    letterSpacing: -1,
  },
};

// ===========================================
// BORDER RADIUS
// ===========================================
export const radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
};

// ===========================================
// SHADOWS
// ===========================================
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  glow: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  }),
};

// ===========================================
// COMPONENT SIZES
// ===========================================
export const componentSizes = {
  buttonHeight: {
    sm: 36,
    md: 44,
    lg: 52,
  },
  inputHeight: {
    sm: 40,
    md: 48,
    lg: 56,
  },
  iconSize: {
    sm: 16,
    md: 20,
    lg: 24,
    xl: 32,
  },
  avatar: {
    xs: 24,
    sm: 32,
    md: 40,
    lg: 48,
    xl: 64,
  },
};

// ===========================================
// COLOR THEMES - 민트 통일
// ===========================================
const Colors = {
  light: {
    // Text hierarchy
    text: '#1A1A1A',
    textSecondary: '#52525B',
    textMuted: '#A1A1AA',

    // Background hierarchy
    background: '#FAFBFA',
    backgroundElevated: '#FFFFFF',
    backgroundSurface: '#F4F6F5',
    backgroundHover: '#E8EDEB',
    backgroundTertiary: 'rgba(0, 212, 170, 0.04)',

    // Brand - 민트 계열
    tint: brand.primary,
    tintLight: brand.primaryLight,
    tintDark: brand.primaryDark,
    tintSecondary: brand.primary, // 통일
    tintAccent: brand.accent,
    brandMuted: 'rgba(0, 212, 170, 0.1)',
    brandSecondaryMuted: 'rgba(0, 212, 170, 0.08)',
    brandAccentMuted: 'rgba(0, 229, 191, 0.1)',

    // Tabs
    tabIconDefault: '#A1A1AA',
    tabIconSelected: brand.primary,

    // Borders
    border: 'rgba(0, 0, 0, 0.08)',
    borderHover: 'rgba(0, 0, 0, 0.15)',
    borderFocus: brand.primary,

    // Status - 민트 베이스
    success: brand.primary,
    successMuted: 'rgba(0, 212, 170, 0.1)',
    warning: '#F59E0B',
    warningMuted: 'rgba(245, 158, 11, 0.1)',
    error: '#EF4444',
    errorMuted: 'rgba(239, 68, 68, 0.1)',
    info: brand.primaryLight,
    infoMuted: 'rgba(0, 245, 196, 0.1)',

    // Level indicators - 민트 톤
    levelHigh: brand.primary,
    levelMid: brand.primaryDark,
    levelLow: '#F59E0B',

    // Card
    cardBackground: 'rgba(255, 255, 255, 0.8)',
    cardBorder: 'rgba(0, 212, 170, 0.1)',

    // Gradient - 민트 계열
    gradientStart: brand.primaryLight,
    gradientEnd: brand.primary,

    // Glass effect
    glassBackground: 'rgba(255, 255, 255, 0.6)',
    glassBorder: 'rgba(0, 212, 170, 0.08)',
  },

  dark: {
    // Text hierarchy
    text: brand.textLight,
    textSecondary: '#A8B5B0',
    textMuted: '#6B7A74',

    // Background hierarchy
    background: '#0A1410',
    backgroundElevated: '#121E19',
    backgroundSurface: '#1A2923',
    backgroundHover: '#243530',
    backgroundTertiary: 'rgba(0, 212, 170, 0.06)',

    // Brand - 민트 계열
    tint: brand.primary,
    tintLight: brand.primaryLight,
    tintDark: brand.primaryDark,
    tintSecondary: brand.primary, // 통일
    tintAccent: brand.accent,
    brandMuted: 'rgba(0, 212, 170, 0.15)',
    brandSecondaryMuted: 'rgba(0, 212, 170, 0.12)',
    brandAccentMuted: 'rgba(0, 229, 191, 0.15)',

    // Tabs
    tabIconDefault: '#6B7A74',
    tabIconSelected: brand.primary,

    // Borders
    border: 'rgba(0, 212, 170, 0.1)',
    borderHover: 'rgba(0, 212, 170, 0.2)',
    borderFocus: brand.primary,

    // Status - 민트 베이스
    success: brand.primaryLight,
    successMuted: 'rgba(0, 245, 196, 0.15)',
    warning: '#FBBF24',
    warningMuted: 'rgba(251, 191, 36, 0.15)',
    error: '#F87171',
    errorMuted: 'rgba(248, 113, 113, 0.15)',
    info: brand.accent,
    infoMuted: 'rgba(0, 229, 191, 0.15)',

    // Level indicators - 민트 톤
    levelHigh: brand.primaryLight,
    levelMid: brand.primary,
    levelLow: '#FBBF24',

    // Card
    cardBackground: 'rgba(0, 212, 170, 0.04)',
    cardBorder: 'rgba(0, 212, 170, 0.12)',

    // Gradient - 민트 계열
    gradientStart: brand.primaryLight,
    gradientEnd: brand.primary,

    // Glass effect
    glassBackground: 'rgba(0, 212, 170, 0.06)',
    glassBorder: 'rgba(0, 212, 170, 0.12)',
  },
};

export default Colors;

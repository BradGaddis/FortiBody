// FortiBody Design Tokens
// Comprehensive design system for consistent styling

// Color tokens
export const colors = {
  // Primary brand colors
  primary: {
    50: '#E8F5E9',
    100: '#C8E6C9',
    200: '#A5D6A7',
    300: '#81C784',
    400: '#66BB6A',
    500: '#4CAF50', // Primary brand color
    600: '#43A047',
    700: '#388E3C',
    800: '#2E7D32',
    900: '#1B5E20',
  },

  // Secondary/accent colors
  secondary: {
    50: '#E3F2FD',
    100: '#BBDEFB',
    200: '#90CAF9',
    300: '#64B5F6',
    400: '#42A5F5',
    500: '#2196F3', // Secondary brand color
    600: '#1E88E5',
    700: '#1976D2',
    800: '#1565C0',
    900: '#0D47A1',
  },

  // Neutral colors (grays)
  neutral: {
    0: '#FFFFFF',
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },

  // Semantic colors
  success: {
    light: '#81C784',
    main: '#4CAF50',
    dark: '#388E3C',
  },

  warning: {
    light: '#FFB74D',
    main: '#FF9800',
    dark: '#F57C00',
  },

  error: {
    light: '#E57373',
    main: '#F44336',
    dark: '#D32F2F',
  },

  info: {
    light: '#64B5F6',
    main: '#2196F3',
    dark: '#1976D2',
  },

  // Background colors
  background: {
    light: {
      primary: '#FFFFFF',
      secondary: '#F5F5F5',
      tertiary: '#EEEEEE',
    },
    dark: {
      primary: '#121212',
      secondary: '#1E1E1E',
      tertiary: '#2D2D2D',
    },
  },

  // Text colors
  text: {
    light: {
      primary: '#212121',
      secondary: '#757575',
      tertiary: '#9E9E9E',
      disabled: '#BDBDBD',
      inverse: '#FFFFFF',
    },
    dark: {
      primary: '#FFFFFF',
      secondary: '#B0B0B0',
      tertiary: '#808080',
      disabled: '#4D4D4D',
      inverse: '#212121',
    },
  },

  // Fitness-specific colors
  fitness: {
    strength: '#FF5722',
    cardio: '#E91E63',
    flexibility: '#9C27B0',
    endurance: '#3F51B5',
    balance: '#00BCD4',
    power: '#FF9800',
    speed: '#F44336',
    hiit: '#673AB7',
  },
};

// Typography tokens
export const typography = {
  fontFamily: {
    primary: 'System', // Use system font (San Francisco on iOS, Roboto on Android)
    secondary: 'System',
    monospace: 'monospace',
  },

  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },

  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },

  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },

  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
  },

  // Named typography styles
  styles: {
    h1: {
      fontSize: 48,
      fontWeight: 'bold' as const,
      lineHeight: 56,
      letterSpacing: -1,
    },
    h2: {
      fontSize: 36,
      fontWeight: 'bold' as const,
      lineHeight: 44,
      letterSpacing: -0.5,
    },
    h3: {
      fontSize: 30,
      fontWeight: 'semibold' as const,
      lineHeight: 38,
      letterSpacing: 0,
    },
    h4: {
      fontSize: 24,
      fontWeight: 'semibold' as const,
      lineHeight: 32,
      letterSpacing: 0,
    },
    h5: {
      fontSize: 20,
      fontWeight: 'semibold' as const,
      lineHeight: 28,
      letterSpacing: 0,
    },
    h6: {
      fontSize: 18,
      fontWeight: 'semibold' as const,
      lineHeight: 26,
      letterSpacing: 0,
    },
    bodyLarge: {
      fontSize: 18,
      fontWeight: 'regular' as const,
      lineHeight: 28,
      letterSpacing: 0,
    },
    body: {
      fontSize: 16,
      fontWeight: 'regular' as const,
      lineHeight: 24,
      letterSpacing: 0,
    },
    bodySmall: {
      fontSize: 14,
      fontWeight: 'regular' as const,
      lineHeight: 20,
      letterSpacing: 0,
    },
    caption: {
      fontSize: 12,
      fontWeight: 'regular' as const,
      lineHeight: 16,
      letterSpacing: 0,
    },
    overline: {
      fontSize: 10,
      fontWeight: 'semibold' as const,
      lineHeight: 14,
      letterSpacing: 1,
    },
  },
};

// Spacing tokens (based on 4px grid)
export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
  24: 96,
};

// Border radius tokens
export const borderRadius = {
  none: 0,
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
};

// Shadow tokens
export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  xs: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};

// Z-index tokens
export const zIndex = {
  hide: -1,
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  modal: 2000,
  popover: 3000,
  tooltip: 4000,
  toast: 5000,
};

// Breakpoint tokens for responsive design
export const breakpoints = {
  xs: 0,
  sm: 480,
  md: 768,
  lg: 1024,
  xl: 1280,
};

// Animation tokens
export const animation = {
  duration: {
    immediate: 0,
    fast: 150,
    normal: 250,
    slow: 350,
    slower: 500,
  },

  easing: {
    linear: 'linear',
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',

    // Spring animations (approximations for React Native)
    springBounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    springGentle: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    springSnappy: 'cubic-bezier(0.68, -0.6, 0.32, 1.6)',
  },
};

// Opacity tokens
export const opacity = {
  0: 0,
  25: 0.25,
  50: 0.5,
  75: 0.75,
  100: 1,
};

// Default export with all tokens
const designTokens = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  zIndex,
  breakpoints,
  animation,
  opacity,
};

export default designTokens;

// Helper type exports
export type ColorTokens = typeof colors;
export type TypographyTokens = typeof typography;
export type SpacingTokens = typeof spacing;
export type BorderRadiusTokens = typeof borderRadius;
export type ShadowTokens = typeof shadows;
export type ZIndexTokens = typeof zIndex;
export type BreakpointTokens = typeof breakpoints;
export type AnimationTokens = typeof animation;
export type OpacityTokens = typeof opacity;

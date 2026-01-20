// FortiBody Theme System
// Export all theme-related modules

// Design tokens
export {
  default as designTokens,
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  zIndex,
  breakpoints,
  animation,
  opacity,
} from './tokens';
export type {
  ColorTokens,
  TypographyTokens,
  SpacingTokens,
  BorderRadiusTokens,
  ShadowTokens,
  ZIndexTokens,
  BreakpointTokens,
  AnimationTokens,
  OpacityTokens,
} from './tokens';

// Theme provider
export {
  ThemeProvider,
  useTheme,
  useFortiBodyTheme,
  useColorScheme,
  getThemedColor,
  createThemedStyle,
  type Theme,
  type ColorMode,
} from './ThemeProvider';

// Component library
export {
  Button,
  Card,
  ThemedText,
  Input,
  Container,
  Row,
  Column,
  Spacer,
  HSpacer,
  Divider,
} from './components';

// Utility hooks for responsive design
import { useWindowDimensions, Dimensions } from 'react-native';

// Breakpoint values
const BREAKPOINTS = {
  xs: 0,
  sm: 480,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const;

// Hook to get current breakpoint
export const useBreakpoint = (): keyof typeof BREAKPOINTS => {
  const { width } = useWindowDimensions();

  if (width >= BREAKPOINTS.xl) return 'xl';
  if (width >= BREAKPOINTS.lg) return 'lg';
  if (width >= BREAKPOINTS.md) return 'md';
  if (width >= BREAKPOINTS.sm) return 'sm';
  return 'xs';
};

// Hook to check if screen is mobile
export const useIsMobile = (): boolean => {
  const breakpoint = useBreakpoint();
  return breakpoint === 'xs' || breakpoint === 'sm';
};

// Hook to check if screen is tablet
export const useIsTablet = (): boolean => {
  const breakpoint = useBreakpoint();
  return breakpoint === 'md' || breakpoint === 'lg';
};

// Hook to check if screen is desktop
export const useIsDesktop = (): boolean => {
  const breakpoint = useBreakpoint();
  return breakpoint === 'xl';
};

// Helper function to get responsive value
export const getResponsiveValue = <T>(
  values: { xs?: T; sm?: T; md?: T; lg?: T; xl?: T },
  defaultValue: T
): T => {
  const breakpoint = useBreakpoint();

  // Try to get value for current breakpoint or larger
  if (values.xl && breakpoint === 'xl') return values.xl;
  if (values.lg && (breakpoint === 'xl' || breakpoint === 'lg'))
    return values.lg;
  if (
    values.md &&
    (breakpoint === 'xl' || breakpoint === 'lg' || breakpoint === 'md')
  )
    return values.md;
  if (
    values.sm &&
    (breakpoint === 'xl' ||
      breakpoint === 'lg' ||
      breakpoint === 'md' ||
      breakpoint === 'sm')
  )
    return values.sm;
  if (values.xs) return values.xs;

  return defaultValue;
};

// Export breakpoint constants
export { BREAKPOINTS as BREAKPOINT_VALUES };

// Responsive helper types
export type Breakpoint = keyof typeof BREAKPOINTS;
export type ResponsiveValue<T> = { [K in Breakpoint]?: T } | T;

// Default export
export default {
  ThemeProvider,
  useTheme,
  useFortiBodyTheme,
  useBreakpoint,
  useIsMobile,
  useIsTablet,
  useIsDesktop,
  getResponsiveValue,
  ...designTokens,
};

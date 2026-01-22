import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import {
  Appearance,
  ColorSchemeName,
  useColorScheme as useNativeColorScheme,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import designTokens, {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
} from './tokens';

// Theme types
export type ColorMode = 'light' | 'dark' | 'system';

export interface Theme {
  colors: typeof colors;
  typography: typeof typography;
  spacing: typeof spacing;
  borderRadius: typeof borderRadius;
  shadows: typeof shadows;
  isDark: boolean;
}

// Theme context type
interface ThemeContextType {
  theme: Theme;
  colorMode: ColorMode;
  setColorMode: (mode: ColorMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Theme provider props
interface ThemeProviderProps {
  children: ReactNode;
  initialColorMode?: ColorMode;
}

// Light theme
const lightTheme: Theme = {
  colors: colors,
  typography: typography,
  spacing: spacing,
  borderRadius: borderRadius,
  shadows: shadows,
  isDark: false,
};

// Dark theme
const darkTheme: Theme = {
  colors: colors,
  typography: typography,
  spacing: spacing,
  borderRadius: borderRadius,
  shadows: shadows,
  isDark: true,
};

// Theme provider component
export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  initialColorMode = 'system',
}) => {
  const [colorMode, setColorModeState] = useState<ColorMode>(initialColorMode);
  const [resolvedColorScheme, setResolvedColorScheme] =
    useState<ColorSchemeName>('light');
  const [isInitialized, setIsInitialized] = useState(false);

  // Load saved color mode on mount
  useEffect(() => {
    const loadColorMode = async () => {
      try {
        const savedMode = await AsyncStorage.getItem('@fortibody_color_mode');
        if (
          savedMode &&
          (savedMode === 'light' ||
            savedMode === 'dark' ||
            savedMode === 'system')
        ) {
          setColorModeState(savedMode);
        }
      } catch (error) {
        console.error('Failed to load color mode:', error);
      } finally {
        setIsInitialized(true);
      }
    };

    loadColorMode();
  }, []);

  // Listen for system color scheme changes
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setResolvedColorScheme(colorScheme);
    });

    return () => subscription.remove();
  }, []);

  // Determine effective color scheme
  useEffect(() => {
    if (colorMode === 'system') {
      setResolvedColorScheme(Appearance.getColorScheme() || 'light');
    } else {
      setResolvedColorScheme(colorMode);
    }
  }, [colorMode]);

  // Save color mode preference
  const setColorMode = async (mode: ColorMode) => {
    setColorModeState(mode);
    try {
      await AsyncStorage.setItem('@fortibody_color_mode', mode);
    } catch (error) {
      console.error('Failed to save color mode:', error);
    }
  };

  // Toggle between light and dark
  const toggleTheme = () => {
    const newMode = resolvedColorScheme === 'dark' ? 'light' : 'dark';
    setColorMode(newMode);
  };

  // Build effective theme with resolved text colors
  const effectiveColors = {
    ...colors,
    text: resolvedColorScheme === 'dark' ? colors.textDark : colors.text,
  };
  const theme: Theme = {
    colors: effectiveColors,
    typography: typography,
    spacing: spacing,
    borderRadius: borderRadius,
    shadows: shadows,
    isDark: resolvedColorScheme === 'dark',
  };

  // Don't render until initialized to avoid flash
  if (!isInitialized) {
    return null;
  }

  const contextValue: ThemeContextType = {
    theme,
    colorMode,
    setColorMode,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use theme
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Custom hook to get just the theme (for simpler usage)
export const useFortiBodyTheme = (): Theme => {
  const { theme } = useTheme();
  return theme;
};

// Custom hook for color scheme
export const useColorScheme = (): ColorSchemeName => {
  return useNativeColorScheme() || 'light';
};

// Helper function to get themed color
export const getThemedColor = (
  lightColor: string,
  darkColor: string,
  colorMode?: ColorMode
): string => {
  const effectiveMode = colorMode || useNativeColorScheme();
  return effectiveMode === 'dark' ? darkColor : lightColor;
};

// Helper function to create themed styles
export const createThemedStyle = <T extends Record<string, any>>(
  lightStyles: T,
  darkStyles: Partial<T>
): T => {
  const theme = useFortiBodyTheme();

  return {
    ...lightStyles,
    ...(theme.isDark ? darkStyles : {}),
  };
};

// Default export
export default ThemeProvider;

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TextInputStyle,
  DimensionValue,
} from 'react-native';
import { useFortiBodyTheme } from '../theme/ThemeProvider';

// Button variants
export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

// Button props interface
interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

// Button component
export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  textStyle,
}) => {
  const theme = useFortiBodyTheme();

  const buttonStyle = getButtonStyle(theme, variant, size, disabled, fullWidth);
  const buttonTextStyle = getButtonTextStyle(theme, variant, size, disabled);

  return (
    <TouchableOpacity
      style={[styles.button, buttonStyle, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      <Text style={[styles.buttonText, buttonTextStyle, textStyle]}>
        {loading ? 'Loading...' : title}
      </Text>
    </TouchableOpacity>
  );
};

// Helper functions for button styles
const getButtonStyle = (
  theme: ReturnType<typeof useFortiBodyTheme>,
  variant: ButtonVariant,
  size: ButtonSize,
  disabled: boolean,
  fullWidth: boolean
): ViewStyle => {
  const baseStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.md,
  };

  const sizeStyle = getButtonSizeStyle(size, theme);
  const variantStyle = getButtonVariantStyle(variant, theme);
  const disabledStyle = disabled ? { opacity: 0.5 } : {};
  const widthStyle = fullWidth ? { width: '100%' } : {};

  return {
    ...baseStyle,
    ...sizeStyle,
    ...variantStyle,
    ...disabledStyle,
    ...widthStyle,
  };
};

const getButtonSizeStyle = (
  size: ButtonSize,
  theme: ReturnType<typeof useFortiBodyTheme>
): ViewStyle => {
  const sizes: Record<ButtonSize, ViewStyle> = {
    sm: {
      paddingHorizontal: theme.spacing[3],
      paddingVertical: theme.spacing[2],
    },
    md: {
      paddingHorizontal: theme.spacing[4],
      paddingVertical: theme.spacing[3],
    },
    lg: {
      paddingHorizontal: theme.spacing[6],
      paddingVertical: theme.spacing[4],
    },
  };
  return sizes[size];
};

const getButtonVariantStyle = (
  variant: ButtonVariant,
  theme: ReturnType<typeof useFortiBodyTheme>
): ViewStyle => {
  const variants: Record<ButtonVariant, ViewStyle> = {
    primary: {
      backgroundColor: theme.colors.primary[500],
    },
    secondary: {
      backgroundColor: theme.colors.secondary[500],
    },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: theme.colors.primary[500],
    },
    ghost: {
      backgroundColor: 'transparent',
    },
    danger: {
      backgroundColor: theme.colors.error.main,
    },
  };
  return variants[variant];
};

const getButtonTextStyle = (
  theme: ReturnType<typeof useFortiBodyTheme>,
  variant: ButtonVariant,
  size: ButtonSize,
  disabled: boolean
): TextStyle => {
  const baseStyle: TextStyle = {
    fontWeight: theme.typography.fontWeight.semibold,
  };

  const sizeStyle = getButtonTextSizeStyle(size, theme);
  const variantStyle = getButtonTextVariantStyle(variant, theme);
  const disabledStyle = disabled ? { color: theme.colors.neutral[400] } : {};

  return {
    ...baseStyle,
    ...sizeStyle,
    ...variantStyle,
    ...disabledStyle,
  };
};

const getButtonTextSizeStyle = (
  size: ButtonSize,
  theme: ReturnType<typeof useFortiBodyTheme>
): TextStyle => {
  const sizes: Record<ButtonSize, TextStyle> = {
    sm: {
      fontSize: theme.typography.fontSize.sm,
    },
    md: {
      fontSize: theme.typography.fontSize.base,
    },
    lg: {
      fontSize: theme.typography.fontSize.lg,
    },
  };
  return sizes[size];
};

const getButtonTextVariantStyle = (
  variant: ButtonVariant,
  theme: ReturnType<typeof useFortiBodyTheme>
): TextStyle => {
  const variants: Record<ButtonVariant, TextStyle> = {
    primary: {
      color: theme.colors.neutral[0],
    },
    secondary: {
      color: theme.colors.neutral[0],
    },
    outline: {
      color: theme.colors.primary[500],
    },
    ghost: {
      color: theme.colors.primary[500],
    },
    danger: {
      color: theme.colors.neutral[0],
    },
  };
  return variants[variant];
};

// Card component
interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  elevated?: boolean;
  onPress?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  elevated = false,
  onPress,
}) => {
  const theme = useFortiBodyTheme();
  const Component = onPress ? TouchableOpacity : View;

  return (
    <Component
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.neutral[0],
          borderRadius: theme.borderRadius.lg,
          borderWidth: 1,
          borderColor: theme.colors.neutral[200],
        },
        elevated && theme.shadows.lg,
        style,
      ]}
      onPress={onPress}
    >
      {children}
    </Component>
  );
};

// Text component with variants
interface TextProps {
  children: React.ReactNode;
  variant?:
    | 'h1'
    | 'h2'
    | 'h3'
    | 'h4'
    | 'h5'
    | 'h6'
    | 'body'
    | 'bodySmall'
    | 'caption'
    | 'overline';
  style?: TextStyle;
  color?:
    | 'primary'
    | 'secondary'
    | 'tertiary'
    | 'inverse'
    | 'success'
    | 'warning'
    | 'error';
}

export const ThemedText: React.FC<TextProps> = ({
  children,
  variant = 'body',
  style,
  color = 'primary',
}) => {
  const theme = useFortiBodyTheme();

  const textStyle =
    theme.typography.styles[variant as keyof typeof theme.typography.styles];

  const colorStyle = getTextColorStyle(color, theme);

  return <Text style={[textStyle, colorStyle, style]}>{children}</Text>;
};

const getTextColorStyle = (
  color: TextProps['color'],
  theme: ReturnType<typeof useFortiBodyTheme>
): TextStyle => {
  const colors: Record<NonNullable<TextProps['color']>, TextStyle> = {
    primary: {
      color: theme.colors.text.primary,
    },
    secondary: {
      color: theme.colors.text.secondary,
    },
    tertiary: {
      color: theme.colors.text.tertiary,
    },
    inverse: {
      color: theme.colors.text.inverse,
    },
    success: {
      color: theme.colors.success.main,
    },
    warning: {
      color: theme.colors.warning.main,
    },
    error: {
      color: theme.colors.error.main,
    },
  };
  return colors[color];
};

// Input component
interface InputProps {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  label?: string;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  style?: ViewStyle;
}

export const Input: React.FC<InputProps> = ({
  placeholder,
  value,
  onChangeText,
  label,
  error,
  secureTextEntry = false,
  keyboardType = 'default',
  style,
}) => {
  const theme = useFortiBodyTheme();

  return (
    <View style={[styles.inputContainer, style]}>
      {label && (
        <ThemedText
          variant="bodySmall"
          color="secondary"
          style={styles.inputLabel}
        >
          {label}
        </ThemedText>
      )}
      <View
        style={[
          styles.input,
          {
            backgroundColor: theme.colors.neutral[0],
            borderColor: error
              ? theme.colors.error.main
              : theme.colors.neutral[300],
            borderRadius: theme.borderRadius.md,
            paddingHorizontal: theme.spacing[4],
            paddingVertical: theme.spacing[3],
          },
        ]}
      >
        <TextInput
          placeholder={placeholder}
          placeholderTextColor={theme.colors.neutral[400]}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          style={styles.textInput}
        />
      </View>
      {error && (
        <ThemedText variant="caption" color="error" style={styles.inputError}>
          {error}
        </ThemedText>
      )}
    </View>
  );
};

// Container/View utilities
interface ContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: keyof typeof spacing;
  background?: 'primary' | 'secondary' | 'tertiary';
}

export const Container: React.FC<ContainerProps> = ({
  children,
  style,
  padding = 'none',
  background = 'primary',
}) => {
  const theme = useFortiBodyTheme();

  const backgroundColor = theme.colors.background.light[background];
  const paddingValue = theme.spacing[padding];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor,
          padding: paddingValue,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

// Row and Column layouts
interface RowProps {
  children: React.ReactNode;
  style?: ViewStyle;
  justify?:
    | 'flex-start'
    | 'center'
    | 'flex-end'
    | 'space-between'
    | 'space-around'
    | 'space-evenly';
  align?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  gap?: keyof typeof spacing;
}

export const Row: React.FC<RowProps> = ({
  children,
  style,
  justify = 'flex-start',
  align = 'center',
  gap = 'none',
}) => {
  const theme = useFortiBodyTheme();

  return (
    <View
      style={[
        styles.row,
        {
          justifyContent: justify,
          alignItems: align,
          gap: theme.spacing[gap],
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

interface ColumnProps {
  children: React.ReactNode;
  style?: ViewStyle;
  justify?:
    | 'flex-start'
    | 'center'
    | 'flex-end'
    | 'space-between'
    | 'space-around'
    | 'space-evenly';
  align?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  gap?: keyof typeof spacing;
}

export const Column: React.FC<ColumnProps> = ({
  children,
  style,
  justify = 'flex-start',
  align = 'stretch',
  gap = 'none',
}) => {
  const theme = useFortiBodyTheme();

  return (
    <View
      style={[
        styles.column,
        {
          justifyContent: justify,
          alignItems: align,
          gap: theme.spacing[gap],
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

// Spacer component
interface SpacerProps {
  size?: keyof typeof spacing;
}

export const Spacer: React.FC<SpacerProps> = ({ size = 'md' }) => {
  const theme = useFortiBodyTheme();

  return <View style={{ height: theme.spacing[size] }} />;
};

// Horizontal Spacer
interface HSpacerProps {
  size?: keyof typeof spacing;
}

export const HSpacer: React.FC<HSpacerProps> = ({ size = 'md' }) => {
  const theme = useFortiBodyTheme();

  return <View style={{ width: theme.spacing[size] }} />;
};

// Divider component
interface DividerProps {
  style?: ViewStyle;
  orientation?: 'horizontal' | 'vertical';
}

export const Divider: React.FC<DividerProps> = ({
  style,
  orientation = 'horizontal',
}) => {
  const theme = useFortiBodyTheme();

  return (
    <View
      style={[
        styles.divider,
        orientation === 'horizontal'
          ? {
              width: '100%',
              height: 1,
              backgroundColor: theme.colors.neutral[200],
            }
          : {
              width: 1,
              height: '100%',
              backgroundColor: theme.colors.neutral[200],
            },
        style,
      ]}
    />
  );
};

// Styles object
const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  buttonText: {
    fontWeight: '600',
  },
  card: {
    padding: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#212121',
  },
  inputError: {
    marginTop: 4,
  },
  container: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  column: {
    flexDirection: 'column',
  },
  divider: {},
});

// Export all components
export default {
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
};

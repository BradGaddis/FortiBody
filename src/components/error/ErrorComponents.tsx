import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { useFortiBodyTheme } from '../../theme/ThemeProvider';

// Error state variants
export type ErrorVariant = 'simple' | 'full' | 'inline' | 'card';

// Error state props
interface ErrorStateProps {
  variant?: ErrorVariant;
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

// Simple error message
interface ErrorMessageProps {
  message: string;
  style?: ViewStyle;
  color?: 'error' | 'warning' | 'info';
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  style,
  color = 'error',
}) => {
  const theme = useFortiBodyTheme();

  const colorMap = {
    error: theme.colors.error.main,
    warning: theme.colors.warning.main,
    info: theme.colors.info.main,
  };

  return (
    <Text
      style={[
        styles.errorMessage,
        {
          color: colorMap[color],
        },
        style,
      ]}
    >
      {message}
    </Text>
  );
};

// Full error screen
export const ErrorScreen: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  onRetry,
  retryLabel = 'Try Again',
  style,
}) => {
  const theme = useFortiBodyTheme();

  return (
    <View style={[styles.errorScreen, style]}>
      <View style={styles.errorContent}>
        {/* Error Icon */}
        <View style={styles.errorIcon}>
          <Text style={styles.errorIconText}>⚠️</Text>
        </View>

        {/* Title */}
        <Text style={[styles.errorTitle, { color: theme.colors.text.primary }]}>
          {title}
        </Text>

        {/* Message */}
        <Text
          style={[styles.errorMessage, { color: theme.colors.text.secondary }]}
        >
          {message}
        </Text>

        {/* Retry Button */}
        {onRetry && (
          <TouchableOpacity
            style={[
              styles.retryButton,
              { backgroundColor: theme.colors.primary[500] },
            ]}
            onPress={onRetry}
            accessibilityLabel={retryLabel}
            accessibilityRole="button"
          >
            <Text style={styles.retryButtonText}>{retryLabel}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

// Error card
export const ErrorCard: React.FC<ErrorStateProps> = ({
  title = 'Error',
  message,
  onRetry,
  retryLabel = 'Retry',
  icon,
  style,
}) => {
  const theme = useFortiBodyTheme();

  return (
    <View
      style={[
        styles.errorCard,
        {
          backgroundColor: theme.colors.error.light + '20', // 20% opacity
          borderColor: theme.colors.error.light,
          borderWidth: 1,
          borderRadius: theme.borderRadius.lg,
        },
        style,
      ]}
    >
      <View style={styles.errorCardHeader}>
        {icon || (
          <View
            style={[
              styles.errorBadge,
              { backgroundColor: theme.colors.error.light },
            ]}
          >
            <Text style={styles.errorBadgeText}>!</Text>
          </View>
        )}
        <Text
          style={[styles.errorCardTitle, { color: theme.colors.error.dark }]}
        >
          {title}
        </Text>
      </View>

      {message && (
        <Text
          style={[
            styles.errorCardMessage,
            { color: theme.colors.text.secondary },
          ]}
        >
          {message}
        </Text>
      )}

      {onRetry && (
        <TouchableOpacity
          style={[
            styles.errorCardButton,
            { backgroundColor: theme.colors.error.light },
          ]}
          onPress={onRetry}
          accessibilityLabel={retryLabel}
        >
          <Text style={styles.errorCardButtonText}>{retryLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// Inline error alert
export const ErrorAlert: React.FC<ErrorStateProps> = ({
  message,
  onRetry,
  retryLabel = 'Dismiss',
  style,
}) => {
  const theme = useFortiBodyTheme();

  return (
    <View
      style={[
        styles.errorAlert,
        {
          backgroundColor: theme.colors.error.light + '15',
          borderLeftColor: theme.colors.error.main,
          borderLeftWidth: 4,
          borderRadius: theme.borderRadius.md,
          padding: theme.spacing[4],
        },
        style,
      ]}
    >
      <View style={styles.errorAlertContent}>
        <Text
          style={[styles.errorAlertTitle, { color: theme.colors.error.dark }]}
        >
          Error
        </Text>
        <Text
          style={[
            styles.errorAlertMessage,
            { color: theme.colors.text.secondary },
          ]}
        >
          {message}
        </Text>
      </View>

      {onRetry && (
        <TouchableOpacity
          style={styles.errorAlertButton}
          onPress={onRetry}
          accessibilityLabel={retryLabel}
        >
          <Text
            style={[
              styles.errorAlertButtonText,
              { color: theme.colors.error.main },
            ]}
          >
            {retryLabel}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// Empty state component
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  message?: string;
  action?: {
    label: string;
    onPress: () => void;
  };
  style?: ViewStyle;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  message,
  action,
  style,
}) => {
  const theme = useFortiBodyTheme();

  return (
    <View style={[styles.emptyState, style]}>
      {/* Icon */}
      {icon || (
        <View style={styles.emptyStateIcon}>
          <Text style={styles.emptyStateIconText}>📭</Text>
        </View>
      )}

      {/* Title */}
      <Text
        style={[styles.emptyStateTitle, { color: theme.colors.text.primary }]}
      >
        {title}
      </Text>

      {/* Message */}
      {message && (
        <Text
          style={[
            styles.emptyStateMessage,
            { color: theme.colors.text.secondary },
          ]}
        >
          {message}
        </Text>
      )}

      {/* Action */}
      {action && (
        <TouchableOpacity
          style={[
            styles.emptyStateButton,
            { backgroundColor: theme.colors.primary[500] },
          ]}
          onPress={action.onPress}
          accessibilityLabel={action.label}
        >
          <Text style={styles.emptyStateButtonText}>{action.label}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// Network error component
interface NetworkErrorProps {
  onRetry?: () => void;
  onOfflineMode?: () => void;
  style?: ViewStyle;
}

export const NetworkError: React.FC<NetworkErrorProps> = ({
  onRetry,
  onOfflineMode,
  style,
}) => {
  const theme = useFortiBodyTheme();

  return (
    <View style={[styles.networkError, style]}>
      <View style={styles.networkErrorIcon}>
        <Text style={styles.networkErrorIconText}>📡</Text>
      </View>

      <Text
        style={[styles.networkErrorTitle, { color: theme.colors.text.primary }]}
      >
        No Internet Connection
      </Text>

      <Text
        style={[
          styles.networkErrorMessage,
          { color: theme.colors.text.secondary },
        ]}
      >
        Please check your network settings and try again.
      </Text>

      <View style={styles.networkErrorActions}>
        {onRetry && (
          <TouchableOpacity
            style={[
              styles.networkErrorButton,
              { backgroundColor: theme.colors.primary[500] },
            ]}
            onPress={onRetry}
            accessibilityLabel="Retry Connection"
          >
            <Text style={styles.networkErrorButtonText}>Retry</Text>
          </TouchableOpacity>
        )}

        {onOfflineMode && (
          <TouchableOpacity
            style={[
              styles.networkErrorButton,
              { backgroundColor: theme.colors.secondary[500] },
            ]}
            onPress={onOfflineMode}
            accessibilityLabel="Continue Offline"
          >
            <Text style={styles.networkErrorButtonText}>Continue Offline</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

// Not found error component
interface NotFoundProps {
  title?: string;
  message?: string;
  onBack?: () => void;
  style?: ViewStyle;
}

export const NotFound: React.FC<NotFoundProps> = ({
  title = 'Page Not Found',
  message = 'The page you are looking for does not exist.',
  onBack,
  style,
}) => {
  const theme = useFortiBodyTheme();

  return (
    <View style={[styles.notFound, style]}>
      <View style={styles.notFoundIcon}>
        <Text style={styles.notFoundIconText}>🔍</Text>
      </View>

      <Text
        style={[styles.notFoundTitle, { color: theme.colors.text.primary }]}
      >
        {title}
      </Text>

      <Text
        style={[styles.notFoundMessage, { color: theme.colors.text.secondary }]}
      >
        {message}
      </Text>

      {onBack && (
        <TouchableOpacity
          style={[
            styles.notFoundButton,
            { backgroundColor: theme.colors.primary[500] },
          ]}
          onPress={onBack}
          accessibilityLabel="Go Back"
        >
          <Text style={styles.notFoundButtonText}>Go Back</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// Unauthorized error component
interface UnauthorizedProps {
  onLogin?: () => void;
  onContinue?: () => void;
  style?: ViewStyle;
}

export const Unauthorized: React.FC<UnauthorizedProps> = ({
  onLogin,
  onContinue,
  style,
}) => {
  const theme = useFortiBodyTheme();

  return (
    <View style={[styles.unauthorized, style]}>
      <View style={styles.unauthorizedIcon}>
        <Text style={styles.unauthorizedIconText}>🔒</Text>
      </View>

      <Text
        style={[styles.unauthorizedTitle, { color: theme.colors.text.primary }]}
      >
        Authentication Required
      </Text>

      <Text
        style={[
          styles.unauthorizedMessage,
          { color: theme.colors.text.secondary },
        ]}
      >
        Please sign in to access this feature.
      </Text>

      <View style={styles.unauthorizedActions}>
        {onLogin && (
          <TouchableOpacity
            style={[
              styles.unauthorizedButton,
              { backgroundColor: theme.colors.primary[500] },
            ]}
            onPress={onLogin}
            accessibilityLabel="Sign In"
          >
            <Text style={styles.unauthorizedButtonText}>Sign In</Text>
          </TouchableOpacity>
        )}

        {onContinue && (
          <TouchableOpacity
            style={[
              styles.unauthorizedButton,
              { backgroundColor: theme.colors.neutral[200] },
            ]}
            onPress={onContinue}
            accessibilityLabel="Continue"
          >
            <Text
              style={[
                styles.unauthorizedButtonText,
                { color: theme.colors.text.primary },
              ]}
            >
              Continue
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  // Error message
  errorMessage: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },

  // Error screen
  errorScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorContent: {
    alignItems: 'center',
    maxWidth: 300,
  },
  errorIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFEBEE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  errorIconText: {
    fontSize: 32,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 24,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },

  // Error card
  errorCard: {
    padding: 16,
    margin: 16,
  },
  errorCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  errorBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  errorBadgeText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  errorCardTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  errorCardMessage: {
    fontSize: 14,
    marginTop: 4,
  },
  errorCardButton: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  errorCardButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },

  // Error alert
  errorAlert: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorAlertContent: {
    flex: 1,
  },
  errorAlertTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  errorAlertMessage: {
    fontSize: 14,
  },
  errorAlertButton: {
    marginLeft: 16,
  },
  errorAlertButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyStateIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyStateIconText: {
    fontSize: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyStateMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyStateButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },

  // Network error
  networkError: {
    alignItems: 'center',
    padding: 32,
  },
  networkErrorIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF3E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  networkErrorIconText: {
    fontSize: 40,
  },
  networkErrorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  networkErrorMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  networkErrorActions: {
    flexDirection: 'row',
    gap: 12,
  },
  networkErrorButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  networkErrorButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },

  // Not found
  notFound: {
    alignItems: 'center',
    padding: 32,
  },
  notFoundIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  notFoundIconText: {
    fontSize: 40,
  },
  notFoundTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  notFoundMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  notFoundButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  notFoundButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },

  // Unauthorized
  unauthorized: {
    alignItems: 'center',
    padding: 32,
  },
  unauthorizedIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF3E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  unauthorizedIconText: {
    fontSize: 40,
  },
  unauthorizedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  unauthorizedMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  unauthorizedActions: {
    flexDirection: 'row',
    gap: 12,
  },
  unauthorizedButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  unauthorizedButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

// Export all error components
export default {
  ErrorMessage,
  ErrorScreen,
  ErrorCard,
  ErrorAlert,
  EmptyState,
  NetworkError,
  NotFound,
  Unauthorized,
};

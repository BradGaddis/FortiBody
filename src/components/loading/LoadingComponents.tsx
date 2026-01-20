import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useFortiBodyTheme } from '../theme/ThemeProvider';

// Skeleton loader animation constants
const ANIMATION_DURATION = 1500;

// Skeleton item props
interface SkeletonItemProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

// Individual skeleton item
export const SkeletonItem: React.FC<SkeletonItemProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style,
}) => {
  const theme = useFortiBodyTheme();

  return (
    <View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: theme.colors.neutral[200],
        },
        style,
      ]}
    />
  );
};

// Skeleton text line
interface SkeletonTextProps {
  lines?: number;
  lineHeight?: number;
  lastLineWidth?: number | string;
  style?: ViewStyle;
}

export const SkeletonText: React.FC<SkeletonTextProps> = ({
  lines = 3,
  lineHeight = 16,
  lastLineWidth = '60%',
  style,
}) => {
  const theme = useFortiBodyTheme();

  return (
    <View style={style}>
      {Array.from({ length: lines }).map((_, index) => (
        <SkeletonItem
          key={index}
          width={index === lines - 1 ? lastLineWidth : '100%'}
          height={lineHeight}
          borderRadius={4}
          style={{ marginBottom: index < lines - 1 ? 8 : 0 }}
        />
      ))}
    </View>
  );
};

// Skeleton avatar/circle
interface SkeletonAvatarProps {
  size?: number;
  style?: ViewStyle;
}

export const SkeletonAvatar: React.FC<SkeletonAvatarProps> = ({
  size = 40,
  style,
}) => {
  return (
    <SkeletonItem
      width={size}
      height={size}
      borderRadius={size / 2}
      style={style}
    />
  );
};

// Skeleton card (common pattern)
interface SkeletonCardProps {
  showAvatar?: boolean;
  showTitle?: boolean;
  showContent?: boolean;
  showFooter?: boolean;
  contentLines?: number;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  showAvatar = true,
  showTitle = true,
  showContent = true,
  showFooter = false,
  contentLines = 3,
}) => {
  const theme = useFortiBodyTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.neutral[0],
          borderRadius: theme.borderRadius.lg,
          borderWidth: 1,
          borderColor: theme.colors.neutral[200],
          padding: theme.spacing[4],
        },
      ]}
    >
      {/* Avatar row */}
      {showAvatar && (
        <View style={styles.cardHeader}>
          <SkeletonAvatar size={48} />
          <View style={{ flex: 1, marginLeft: theme.spacing[3] }}>
            <SkeletonItem width="40%" height={16} borderRadius={4} />
            <SkeletonItem
              width="25%"
              height={12}
              borderRadius={4}
              style={{ marginTop: 8 }}
            />
          </View>
        </View>
      )}

      {/* Title */}
      {showTitle && (
        <SkeletonItem
          width="70%"
          height={24}
          borderRadius={4}
          style={{ marginTop: showAvatar ? theme.spacing[4] : 0 }}
        />
      )}

      {/* Content lines */}
      {showContent && (
        <View style={{ marginTop: showTitle ? theme.spacing[4] : 0 }}>
          <SkeletonText lines={contentLines} lineHeight={14} />
        </View>
      )}

      {/* Footer */}
      {showFooter && (
        <View style={styles.cardFooter}>
          <SkeletonItem width={80} height={32} borderRadius={8} />
          <SkeletonItem width={60} height={32} borderRadius={8} />
        </View>
      )}
    </View>
  );
};

// Skeleton list (multiple cards)
interface SkeletonListProps {
  count?: number;
  itemProps?: Partial<SkeletonCardProps>;
  style?: ViewStyle;
}

export const SkeletonList: React.FC<SkeletonListProps> = ({
  count = 3,
  itemProps,
  style,
}) => {
  return (
    <View style={style}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={{ marginBottom: 16 }}>
          <SkeletonCard {...itemProps} />
        </View>
      ))}
    </View>
  );
};

// Inline skeleton loader
interface InlineSkeletonProps {
  width?: number | string;
  height?: number;
  style?: ViewStyle;
}

export const InlineSkeleton: React.FC<InlineSkeletonProps> = ({
  width = 100,
  height = 16,
  style,
}) => {
  return (
    <SkeletonItem
      width={width}
      height={height}
      borderRadius={4}
      style={style}
    />
  );
};

// Shimmer effect overlay (for advanced shimmer animations)
interface ShimmerProps {
  visible?: boolean;
  children: React.ReactNode;
}

export const Shimmer: React.FC<ShimmerProps> = ({
  visible = true,
  children,
}) => {
  const theme = useFortiBodyTheme();

  if (visible) {
    return (
      <View
        style={[
          styles.shimmer,
          {
            backgroundColor: theme.colors.neutral[100],
          },
        ]}
      />
    );
  }

  return <>{children}</>;
};

// Pulse loader (circular loading indicator)
interface PulseLoaderProps {
  size?: number;
  color?: string;
  style?: ViewStyle;
}

export const PulseLoader: React.FC<PulseLoaderProps> = ({
  size = 40,
  color,
  style,
}) => {
  const theme = useFortiBodyTheme();

  return (
    <View
      style={[
        styles.pulseLoader,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderColor: color || theme.colors.primary[500],
          borderWidth: 3,
        },
        style,
      ]}
    />
  );
};

// Dots loader (three bouncing dots)
interface DotsLoaderProps {
  size?: number;
  color?: string;
  style?: ViewStyle;
}

export const DotsLoader: React.FC<DotsLoaderProps> = ({
  size = 10,
  color,
  style,
}) => {
  const theme = useFortiBodyTheme();
  const dotColor = color || theme.colors.primary[500];

  return (
    <View style={[styles.dotsLoader, style]}>
      <View
        style={[
          styles.dot,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: dotColor,
          },
        ]}
      />
      <View
        style={[
          styles.dot,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: dotColor,
          },
        ]}
      />
      <View
        style={[
          styles.dot,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: dotColor,
          },
        ]}
      />
    </View>
  );
};

// Progress bar loader
interface ProgressBarProps {
  progress?: number; // 0 to 1
  height?: number;
  color?: string;
  backgroundColor?: string;
  style?: ViewStyle;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress = 0,
  height = 8,
  color,
  backgroundColor,
  style,
}) => {
  const theme = useFortiBodyTheme();

  const progressWidth = Math.min(100, Math.max(0, progress * 100));

  return (
    <View
      style={[
        styles.progressBar,
        {
          height,
          backgroundColor: backgroundColor || theme.colors.neutral[200],
          borderRadius: height / 2,
        },
        style,
      ]}
    >
      <View
        style={[
          styles.progressBarFill,
          {
            width: `${progressWidth}%`,
            backgroundColor: color || theme.colors.primary[500],
            borderRadius: height / 2,
          },
        ]}
      />
    </View>
  );
};

// Circular progress loader
interface CircularProgressProps {
  progress?: number; // 0 to 1
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  style?: ViewStyle;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  progress = 0,
  size = 100,
  strokeWidth = 8,
  color,
  backgroundColor,
  style,
}) => {
  const theme = useFortiBodyTheme();

  const progressWidth = Math.min(360, Math.max(0, progress * 360));

  return (
    <View
      style={[
        styles.circularProgress,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderColor: backgroundColor || theme.colors.neutral[200],
          borderWidth: strokeWidth,
        },
        style,
      ]}
    >
      <View
        style={[
          styles.circularProgressFill,
          {
            width: size,
            height: size / 2,
            backgroundColor: color || theme.colors.primary[500],
          },
        ]}
      />
    </View>
  );
};

// Loading overlay (full screen)
interface LoadingOverlayProps {
  visible?: boolean;
  message?: string;
  children?: React.ReactNode;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible = true,
  message,
  children,
}) => {
  const theme = useFortiBodyTheme();

  if (!visible && !children) return null;

  return (
    <View style={styles.loadingOverlay}>
      {children || (
        <View style={styles.loadingContent}>
          <PulseLoader size={48} color={theme.colors.primary[500]} />
          {message && (
            <View style={{ marginTop: 16 }}>
              <SkeletonItem
                width={message.length * 10}
                height={16}
                borderRadius={4}
              />
            </View>
          )}
        </View>
      )}
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  shimmer: {
    opacity: 0.5,
  },
  pulseLoader: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotsLoader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    marginHorizontal: 4,
  },
  progressBar: {
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
  },
  circularProgress: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  circularProgressFill: {
    borderTopLeftRadius: 100,
    borderTopRightRadius: 100,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  loadingContent: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
});

// Export all loading components
export default {
  SkeletonItem,
  SkeletonText,
  SkeletonAvatar,
  SkeletonCard,
  SkeletonList,
  InlineSkeleton,
  Shimmer,
  PulseLoader,
  DotsLoader,
  ProgressBar,
  CircularProgress,
  LoadingOverlay,
};

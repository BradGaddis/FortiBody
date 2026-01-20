import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Vibration,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFortiBodyTheme } from '../../theme/ThemeProvider';

interface RestTimerProps {
  duration: number;
  onComplete: () => void;
  onCancel: () => void;
  isPaused?: boolean;
  autoStart?: boolean;
}

export const RestTimer: React.FC<RestTimerProps> = ({
  duration,
  onComplete,
  onCancel,
  isPaused = false,
  autoStart = true,
}) => {
  const theme = useFortiBodyTheme();
  const [remainingTime, setRemainingTime] = useState(duration);
  const [isRunning, setIsRunning] = useState(autoStart && !isPaused);
  const [isCompleted, setIsCompleted] = useState(false);
  const progressAnim = useRef(new Animated.Value(1));
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    progressAnim.current = new Animated.Value(1);
  }, []);

  useEffect(() => {
    if (isRunning && !isPaused && remainingTime > 0) {
      intervalRef.current = setInterval(() => {
        setRemainingTime(prev => {
          if (prev <= 1) {
            handleComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isPaused, remainingTime]);

  useEffect(() => {
    if (isRunning && !isPaused) {
      Animated.timing(progressAnim.current, {
        toValue: 0,
        duration: remainingTime * 1000,
        useNativeDriver: false,
      }).start();
    }
  }, [isRunning, isPaused, remainingTime]);

  const handleComplete = useCallback(() => {
    setIsCompleted(true);
    setIsRunning(false);
    Vibration.vibrate([0, 500, 200, 500]);
    setTimeout(() => {
      onComplete();
    }, 1000);
  }, [onComplete]);

  const handleToggle = useCallback(() => {
    if (isCompleted) return;
    setIsRunning(!isRunning);
  }, [isRunning, isCompleted]);

  const handleReset = useCallback(() => {
    setRemainingTime(duration);
    setIsRunning(autoStart);
    setIsCompleted(false);
    progressAnim.current.setValue(1);
  }, [duration, autoStart]);

  const handleAddTime = useCallback((seconds: number) => {
    setRemainingTime(prev => prev + seconds);
  }, []);

  const progressWidth = progressAnim.current.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.neutral[0] }]}
    >
      <Animated.View
        style={[
          styles.progressBar,
          {
            width: progressWidth,
            backgroundColor: isCompleted
              ? theme.colors.success.main
              : theme.colors.primary[500],
          },
        ]}
      />

      <View style={styles.timerContent}>
        <View style={styles.timeContainer}>
          <Text
            style={[
              styles.timeText,
              {
                color: isCompleted
                  ? theme.colors.success.main
                  : theme.colors.text.primary,
              },
            ]}
          >
            {formatTime(remainingTime)}
          </Text>
          {isCompleted && (
            <Ionicons
              name="checkmark-circle"
              size={48}
              color={theme.colors.success.main}
              style={styles.completeIcon}
            />
          )}
        </View>

        <View style={styles.controls}>
          <TouchableOpacity
            style={[
              styles.controlButton,
              { backgroundColor: theme.colors.neutral[100] },
            ]}
            onPress={handleReset}
          >
            <Ionicons
              name="refresh"
              size={24}
              color={theme.colors.text.primary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.controlButton,
              {
                backgroundColor: isCompleted
                  ? theme.colors.success.main
                  : isRunning
                    ? theme.colors.warning.main
                    : theme.colors.primary[500],
              },
            ]}
            onPress={handleToggle}
            disabled={isCompleted}
          >
            <Ionicons
              name={isCompleted ? 'checkmark' : isRunning ? 'pause' : 'play'}
              size={32}
              color="#FFFFFF"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.controlButton,
              { backgroundColor: theme.colors.neutral[100] },
            ]}
            onPress={onCancel}
          >
            <Ionicons
              name="close"
              size={24}
              color={theme.colors.text.primary}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.quickAdd}>
          <Text
            style={[
              styles.quickAddLabel,
              { color: theme.colors.text.secondary },
            ]}
          >
            Quick Add:
          </Text>
          <View style={styles.quickAddButtons}>
            {[15, 30, 60].map(seconds => (
              <TouchableOpacity
                key={seconds}
                style={[
                  styles.quickAddButton,
                  { backgroundColor: theme.colors.primary[100] },
                ]}
                onPress={() => handleAddTime(seconds)}
              >
                <Text
                  style={[
                    styles.quickAddButtonText,
                    { color: theme.colors.primary[700] },
                  ]}
                >
                  +{seconds}s
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
};

interface SetTrackerProps {
  sets: number;
  completedSets: number;
  targetReps: number;
  currentWeight: number;
  onSetComplete: (reps: number, weight: number) => void;
  onSetEdit: (setIndex: number, reps: number, weight: number) => void;
  restDuration?: number;
}

export const SetTracker: React.FC<SetTrackerProps> = ({
  sets,
  completedSets,
  targetReps,
  currentWeight,
  onSetComplete,
  onSetEdit,
  restDuration = 60,
}) => {
  const theme = useFortiBodyTheme();
  const [activeSet, setActiveSet] = useState(completedSets);
  const [reps, setReps] = useState(targetReps);
  const [showRestTimer, setShowRestTimer] = useState(false);

  const handleComplete = useCallback(() => {
    onSetComplete(reps, currentWeight);
    if (activeSet < sets - 1) {
      setShowRestTimer(true);
      setActiveSet(prev => prev + 1);
      setReps(targetReps);
    }
  }, [activeSet, sets, reps, currentWeight, targetReps, onSetComplete]);

  const handleRestComplete = useCallback(() => {
    setShowRestTimer(false);
  }, []);

  return (
    <View style={styles.setTracker}>
      {showRestTimer ? (
        <RestTimer
          duration={restDuration}
          onComplete={handleRestComplete}
          onCancel={() => setShowRestTimer(false)}
        />
      ) : (
        <>
          <View style={styles.setHeader}>
            <Text
              style={[styles.setLabel, { color: theme.colors.text.primary }]}
            >
              Set {activeSet + 1} of {sets}
            </Text>
            <View style={styles.setProgress}>
              {Array.from({ length: sets }).map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.setDot,
                    {
                      backgroundColor:
                        index < completedSets
                          ? theme.colors.success.main
                          : index === activeSet
                            ? theme.colors.primary[500]
                            : theme.colors.neutral[300],
                    },
                  ]}
                />
              ))}
            </View>
          </View>

          <View style={styles.setInputs}>
            <View style={styles.inputGroup}>
              <Text
                style={[
                  styles.inputLabel,
                  { color: theme.colors.text.secondary },
                ]}
              >
                Reps
              </Text>
              <View style={styles.inputRow}>
                <TouchableOpacity
                  style={[
                    styles.inputButton,
                    { backgroundColor: theme.colors.neutral[100] },
                  ]}
                  onPress={() => setReps(prev => Math.max(1, prev - 1))}
                >
                  <Ionicons
                    name="remove"
                    size={24}
                    color={theme.colors.text.primary}
                  />
                </TouchableOpacity>
                <Text
                  style={[
                    styles.inputValue,
                    { color: theme.colors.text.primary },
                  ]}
                >
                  {reps}
                </Text>
                <TouchableOpacity
                  style={[
                    styles.inputButton,
                    { backgroundColor: theme.colors.neutral[100] },
                  ]}
                  onPress={() => setReps(prev => prev + 1)}
                >
                  <Ionicons
                    name="add"
                    size={24}
                    color={theme.colors.text.primary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text
                style={[
                  styles.inputLabel,
                  { color: theme.colors.text.secondary },
                ]}
              >
                Weight ({currentWeight} kg)
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.completeButton,
              { backgroundColor: theme.colors.primary[500] },
            ]}
            onPress={handleComplete}
          >
            <Text style={styles.completeButtonText}>
              {activeSet === sets - 1 ? 'Finish Set' : 'Complete Set'}
            </Text>
            <Ionicons name="checkmark" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
  },
  progressBar: {
    height: 4,
  },
  timerContent: {
    padding: 24,
    alignItems: 'center',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  timeText: {
    fontSize: 64,
    fontWeight: 'bold',
    fontVariant: ['tabular-nums'],
  },
  completeIcon: {
    marginLeft: 16,
  },
  controls: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 24,
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickAdd: {
    alignItems: 'center',
  },
  quickAddLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  quickAddButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  quickAddButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  quickAddButtonText: {
    fontWeight: '600',
  },
  setTracker: {
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  setHeader: {
    marginBottom: 16,
  },
  setLabel: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  setProgress: {
    flexDirection: 'row',
    gap: 8,
  },
  setDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    flex: 1,
  },
  setInputs: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 20,
  },
  inputGroup: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  inputButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputValue: {
    fontSize: 28,
    fontWeight: 'bold',
    width: 60,
    textAlign: 'center',
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default RestTimer;

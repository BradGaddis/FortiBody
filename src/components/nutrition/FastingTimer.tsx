import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fastingService, FastingStatus, FastingSplit } from '../../services/nutrition/FastingService';

interface FastingTimerProps {
  onStartFasting?: () => void;
  onPress?: () => void;
  onEndFasting?: () => void;
  compact?: boolean;
  split?: FastingSplit;
}

export const FastingTimer: React.FC<FastingTimerProps> = ({
  onStartFasting,
  onPress,
  onEndFasting,
  compact = false,
  split,
}) => {
  const [fastingStatus, setFastingStatus] = useState<FastingStatus | null>(null);
  const progressAnim = useRef(new Animated.Value(0));
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadFastingStatus = useCallback(async () => {
    const status = split
      ? await fastingService.getFastingStatus(split)
      : await fastingService.getFastingStatus();
    setFastingStatus(status);
  }, [split]);

  useEffect(() => {
    loadFastingStatus();
    
    intervalRef.current = setInterval(() => {
      loadFastingStatus();
    }, 1000);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [loadFastingStatus]);

  useEffect(() => {
    if (fastingStatus && !fastingStatus.isIndefinite) {
      Animated.timing(progressAnim.current, {
        toValue: fastingStatus.progress,
        duration: 500,
        useNativeDriver: false,
      }).start();
    }
  }, [fastingStatus]);

  const handleStartFasting = async () => {
    await fastingService.recordMeal();
    loadFastingStatus();
    onStartFasting?.();
  };

  if (!fastingStatus) {
    return null;
  }

  const progressWidth = progressAnim.current.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  if (!fastingStatus.isFasting) {
    if (compact) {
      return (
        <TouchableOpacity style={styles.compactCard} onPress={handleStartFasting}>
          <Ionicons name="restaurant-outline" size={20} color="#4CAF50" />
          <View style={styles.compactInfo}>
            <Text style={styles.compactTitle}>Start Fasting</Text>
            <Text style={styles.compactSubtitle}>Tap to begin your fast</Text>
          </View>
          <Ionicons name="play-circle" size={28} color="#4CAF50" />
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="restaurant-outline" size={32} color="#4CAF50" />
          </View>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Intermittent Fasting</Text>
            <Text style={styles.subtitle}>Not currently fasting</Text>
          </View>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.infoLabel}>Starting a meal begins your fast</Text>
          <TouchableOpacity style={styles.startButton} onPress={handleStartFasting}>
            <Ionicons name="play-circle" size={24} color="#FFF" />
            <Text style={styles.startButtonText}>Start Fasting</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  }

  const isIndefinite = fastingStatus.isIndefinite;
  const displaySubtitle = isIndefinite
    ? 'No time limit - fast as long as you want'
    : fastingStatus.isGoalReached
      ? `${fastingStatus.targetHours}:00 goal completed`
      : `${fastingStatus.targetHours}:00 fasting goal`;

  const displayTitle = isIndefinite
    ? '⏳ Fasting in Progress'
    : fastingStatus.isGoalReached
      ? '🎉 Fasting Goal Reached!'
      : '⏳ Fasting in Progress';

  const iconColor = isIndefinite ? '#4CAF50' : (fastingStatus.isGoalReached ? '#4CAF50' : '#FF9800');
  const iconBgColor = isIndefinite ? '#E8F5E9' : (fastingStatus.isGoalReached ? '#E8F5E9' : '#FFF3E0');
  const progressColor = isIndefinite ? '#4CAF50' : (fastingStatus.isGoalReached ? '#4CAF50' : '#FF9800');

  if (compact) {
    return (
      <TouchableOpacity style={styles.compactCard} onPress={onPress} activeOpacity={0.8}>
        <Ionicons 
          name={isIndefinite ? 'hourglass' : 'time-outline'} 
          size={20} 
          color={iconColor} 
        />
        <View style={styles.compactInfo}>
          <Text style={styles.compactTitle}>
            {isIndefinite ? 'Fasting' : (fastingStatus.isGoalReached ? 'Goal Reached!' : 'Fasting')}
          </Text>
          <Text style={styles.compactSubtitle}>{fastingStatus.elapsedTime}</Text>
        </View>
        {!isIndefinite && (
          <Text style={styles.compactProgress}>{fastingStatus.progress.toFixed(0)}%</Text>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: iconBgColor }]}>
          <Ionicons 
            name={isIndefinite ? 'hourglass' : (fastingStatus.isGoalReached ? 'checkmark-circle' : 'time-outline')} 
            size={32} 
            color={iconColor} 
          />
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{displayTitle}</Text>
          <Text style={styles.subtitle}>{displaySubtitle}</Text>
        </View>
      </View>

      <View style={styles.timerSection}>
        <Text style={styles.timerText}>{fastingStatus.elapsedTime}</Text>
        <Text style={styles.timerLabel}>Time since last meal</Text>
      </View>

      {!isIndefinite && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBarBackground}>
            <Animated.View 
              style={[
                styles.progressBarFill, 
                { 
                  width: progressWidth,
                  backgroundColor: progressColor
                }
              ]} 
            />
          </View>
          <View style={styles.progressLabels}>
            <Text style={styles.progressText}>
              {fastingStatus.progress.toFixed(0)}% complete
            </Text>
            <Text style={styles.targetText}>
              {fastingStatus.targetHours}:00 goal
            </Text>
          </View>
        </View>
      )}

      {isIndefinite && (
        <View style={styles.indefiniteNote}>
          <Ionicons name="information-circle-outline" size={16} color="#888" />
          <Text style={styles.indefiniteNoteText}>Fasting without a time goal</Text>
        </View>
      )}

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{fastingStatus.hoursFasted.toFixed(1)}h</Text>
          <Text style={styles.statLabel}>Elapsed</Text>
        </View>
        {!isIndefinite ? (
          <>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {fastingStatus.targetHours! - fastingStatus.hoursFasted < 0 ? '0' : (fastingStatus.targetHours! - fastingStatus.hoursFasted).toFixed(1)}h
              </Text>
              <Text style={styles.statLabel}>Remaining</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{fastingStatus.isGoalReached ? '✓' : '○'}</Text>
              <Text style={styles.statLabel}>Status</Text>
            </View>
          </>
        ) : (
          <>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>∞</Text>
              <Text style={styles.statLabel}>No Goal</Text>
            </View>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  compactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  compactInfo: {
    flex: 1,
    marginLeft: 12,
  },
  compactTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  compactSubtitle: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  compactProgress: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
  },
  infoContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  infoLabel: {
    fontSize: 14,
    color: '#888',
    marginBottom: 20,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    gap: 8,
  },
  startButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  timerSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  timerText: {
    fontSize: 48,
    fontWeight: '800',
    color: '#1A1A1A',
    fontVariant: ['tabular-nums'],
    letterSpacing: 2,
  },
  timerLabel: {
    fontSize: 14,
    color: '#888',
    marginTop: 8,
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressBarBackground: {
    height: 12,
    backgroundColor: '#E8E8E8',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 6,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  progressText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  targetText: {
    fontSize: 13,
    color: '#888',
  },
  indefiniteNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 24,
    paddingVertical: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  indefiniteNoteText: {
    fontSize: 14,
    color: '#888',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
});

export default FastingTimer;

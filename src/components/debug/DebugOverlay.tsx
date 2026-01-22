import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { logger, LogEntry } from '../../utils/logger';
import { resetOnboarding } from '../../utils/onboarding';
import streakService from '../../services/streak/StreakService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const DebugOverlay: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    debug: 0,
    info: 0,
    warn: 0,
    error: 0,
  });

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const offsetX = useSharedValue(SCREEN_WIDTH - 76);
  const offsetY = useSharedValue(SCREEN_HEIGHT - 180);
  const isDragging = useSharedValue(false);

  const updateLogs = useCallback((entry: LogEntry) => {
    setLogs(prevLogs => [entry, ...prevLogs].slice(0, 50));
    setStats(logger.getStats());
  }, []);

  useEffect(() => {
    const unsubscribe = logger.subscribe(updateLogs);
    return unsubscribe;
  }, [updateLogs]);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      isDragging.value = true;
      offsetX.value = translateX.value + offsetX.value;
      offsetY.value = translateY.value + offsetY.value;
      translateX.value = 0;
      translateY.value = 0;
    })
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
    })
    .onEnd(() => {
      isDragging.value = false;
      offsetX.value = translateX.value + offsetX.value;
      offsetY.value = translateY.value + offsetY.value;
      translateX.value = 0;
      translateY.value = 0;
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value + offsetX.value },
        { translateY: translateY.value + offsetY.value },
      ],
      opacity: isDragging.value ? 0.8 : 1,
    };
  });

  const getLevelColor = (level: string): string => {
    switch (level) {
      case 'debug': return '#9E9E9E';
      case 'info': return '#4CAF50';
      case 'warn': return '#FF9800';
      case 'error': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const formatTime = (date: Date): string => {
    const parts = date.toISOString().split('T');
    return parts[1]?.slice(0, -1) || '00:00:00';
  };

  const handleClear = (): void => {
    logger.clearLogs();
    setLogs([]);
  };

  const handleExport = (): void => {
    const exported = logger.exportLogs();
    console.log('=== DEBUG LOGS ===');
    console.log(exported);
    console.log('==================');
  };

  const handleResetOnboarding = async (): Promise<void> => {
    try {
      console.log('🔄 Starting onboarding reset...');
      
      const keysToRemove = [
        '@user_profile',
        '@exercise_history',
        '@workout_streak',
        '@total_workouts',
        '@fortibody_onboarding_complete',
        '@fortibody_onboarding_step',
        '@fortibody_onboarding_data',
        '@user_streak',
        '@streak_increased_today',
        '@exercise_unit_',
        '@nutrition_log',
        '@fasting_start_time',
      ];
      
      // Clear all keys
      for (const key of keysToRemove) {
        await AsyncStorage.removeItem(key);
        console.log(`✅ Cleared: ${key}`);
      }
      
      await streakService.resetStreak();
      
      console.log('✅ All data cleared successfully!');
      
      Alert.alert(
        'Reset Complete! 🎉',
        'All user data has been cleared.\n\nPlease force close and restart the app to see onboarding.\n\nDouble-tap back or swipe away to close.',
        [{ 
          text: 'Got it!',
          onPress: () => {
            console.log('📱 User confirmed reset - close and restart the app');
          }
        }]
      );
    } catch (error) {
      console.error('❌ Failed to reset data:', error);
      Alert.alert(
        'Reset Failed',
        'Failed to reset data. Check console for details.',
        [{ text: 'OK' }]
      );
    }
  };

  if (!__DEV__) {
    return null;
  }

  return (
    <>
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.toggleButton, animatedStyle]}>
          <TouchableOpacity 
            onPress={() => setVisible(true)}
            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
            style={styles.buttonInner}
          >
            <Ionicons name="bug-outline" size={24} color="#FFFFFF" />
            {stats.error > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{stats.error}</Text>
              </View>
            )}
          </TouchableOpacity>
        </Animated.View>
      </GestureDetector>

      <Modal visible={visible} animationType="slide">
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.statsRow}>
              <View style={[styles.statItem, { backgroundColor: '#4CAF50' }]}>
                <Text style={styles.statLabel}>DEBUG</Text>
                <Text style={styles.statValue}>{stats.debug}</Text>
              </View>
              <View style={[styles.statItem, { backgroundColor: '#2196F3' }]}>
                <Text style={styles.statLabel}>INFO</Text>
                <Text style={styles.statValue}>{stats.info}</Text>
              </View>
              <View style={[styles.statItem, { backgroundColor: '#FF9800' }]}>
                <Text style={styles.statLabel}>WARN</Text>
                <Text style={styles.statValue}>{stats.warn}</Text>
              </View>
              <View style={[styles.statItem, { backgroundColor: '#F44336' }]}>
                <Text style={styles.statLabel}>ERROR</Text>
                <Text style={styles.statValue}>{stats.error}</Text>
              </View>
            </View>

            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleClear}
              >
                <Ionicons name="trash-outline" size={20} color="#FFFFFF" />
                <Text style={styles.actionText}>Clear</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleExport}
              >
                <Ionicons name="download-outline" size={20} color="#FFFFFF" />
                <Text style={styles.actionText}>Export</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: '#FF9800' }]}
                onPress={handleResetOnboarding}
              >
                <Ionicons name="refresh-outline" size={20} color="#FFFFFF" />
                <Text style={styles.actionText}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: '#F44336' }]}
                onPress={() => setVisible(false)}
              >
                <Ionicons name="close-outline" size={20} color="#FFFFFF" />
                <Text style={styles.actionText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView style={styles.logContainer}>
            {logs.map((log, index) => (
              <View key={index} style={styles.logItem}>
                <Text
                  style={[styles.logTime, { color: getLevelColor(log.level) }]}
                >
                  {formatTime(log.timestamp)}
                </Text>
                <Text
                  style={[styles.logLevel, { color: getLevelColor(log.level) }]}
                >
                  {log.level.toUpperCase().padEnd(5)}
                </Text>
                <Text style={styles.logMessage} numberOfLines={2}>
                  {log.message}
                </Text>
              </View>
            ))}

            {logs.length === 0 && (
              <View style={styles.emptyState}>
                <Ionicons
                  name="information-circle-outline"
                  size={48}
                  color="#9E9E9E"
                />
                <Text style={styles.emptyText}>No logs yet</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  toggleButton: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    zIndex: 9999,
  },
  buttonInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#F44336',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E',
  },
  header: {
    padding: 16,
    paddingTop: 48,
    backgroundColor: '#2D2D2D',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statItem: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 60,
  },
  statLabel: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
    opacity: 0.8,
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  logContainer: {
    flex: 1,
    padding: 12,
  },
  logItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#3D3D3D',
  },
  logTime: {
    fontSize: 10,
    width: 80,
  },
  logLevel: {
    fontSize: 10,
    width: 50,
    fontWeight: 'bold',
  },
  logMessage: {
    flex: 1,
    fontSize: 12,
    color: '#E0E0E0',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    color: '#9E9E9E',
    fontSize: 16,
    marginTop: 12,
  },
});

export default DebugOverlay;

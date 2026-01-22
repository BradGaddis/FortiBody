import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { ExercisesStackParamList } from '@/navigation/routes';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { exercises, type Exercise } from '../../data/exercises';
import streakService from '../../services/streak/StreakService';

type FlexibilityScreenProps = {
  navigation: StackNavigationProp<ExercisesStackParamList, 'Flexibility'>;
};

const FLEXIBILITY_HISTORY_KEY = '@flexibility_history';

interface FlexibilitySession {
  id: string;
  exerciseName: string;
  date: Date;
  duration: number;
  notes?: string;
  timestamp?: number;
}

const FlexibilityScreen: React.FC<FlexibilityScreenProps> = ({
  navigation,
}) => {
  const [mode, setMode] = useState<'select' | 'guided' | 'manual'>('select');
  const [currentStretch, setCurrentStretch] = useState<Exercise | null>(null);
  const [stretchDuration, setStretchDuration] = useState(30);
  const [sessionStretches, setSessionStretches] = useState<{ exercise: Exercise; duration: number }[]>([]);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerLeft, setTimerLeft] = useState(30);
  const [history, setHistory] = useState<FlexibilitySession[]>([]);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    if (isTimerRunning && timerLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimerLeft(prev => {
          if (prev <= 1) {
            completeCurrentStretch();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerLeft === 0 && isTimerRunning) {
      setIsTimerRunning(false);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isTimerRunning, timerLeft]);

  const loadHistory = async () => {
    try {
      const stored = await AsyncStorage.getItem(FLEXIBILITY_HISTORY_KEY);
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (error) {
      console.log('Failed to load flexibility history:', error);
    }
  };

  const saveToHistory = async (session: FlexibilitySession) => {
    try {
      const newHistory = [session, ...history];
      setHistory(newHistory);
      await AsyncStorage.setItem(FLEXIBILITY_HISTORY_KEY, JSON.stringify(newHistory));
    } catch (error) {
      console.log('Failed to save flexibility history:', error);
    }
  };

  const startStretch = (exercise: Exercise) => {
    setCurrentStretch(exercise);
    setTimerLeft(stretchDuration);
    setIsTimerRunning(true);

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const completeCurrentStretch = () => {
    if (!currentStretch) return;

    setSessionStretches(prev => [
      ...prev,
      { exercise: currentStretch, duration: stretchDuration },
    ]);

    setIsTimerRunning(false);
    setCurrentStretch(null);
    setTimerLeft(stretchDuration);
    pulseAnim.setValue(1);
  };

  const skipStretch = () => {
    setIsTimerRunning(false);
    setTimerLeft(stretchDuration);
    pulseAnim.setValue(1);
  };

  const finishSession = () => {
    if (sessionStretches.length === 0) {
      Alert.alert('No Stretches', 'Complete at least one stretch before finishing.');
      return;
    }

    const totalDuration = sessionStretches.reduce((sum, s) => sum + s.duration, 0);

    Alert.alert(
      'Finish Session',
      `You completed ${sessionStretches.length} stretches.\nTotal time: ${formatDuration(totalDuration)}\n\nSave this session?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Save',
          style: 'default',
          onPress: () => {
            const session: FlexibilitySession = {
              id: Date.now().toString(),
              exerciseName: 'Flexibility Session',
              date: new Date(),
              duration: totalDuration,
              timestamp: Date.now(),
            };
            saveToHistory(session);
            streakService.recordActivity();
            setSessionStretches([]);
            setMode('select');
          },
        },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: () => {
            setSessionStretches([]);
            setMode('select');
          },
        },
      ]
    );
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const flexibilityExercises = exercises.filter(ex => ex.category === 'flexibility');
  const cardioExercises = exercises.filter(ex => ex.category === 'cardio');

  const renderModeSelect = () => (
    <View style={styles.selectContainer}>
      <View style={styles.selectHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Flexibility</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.selectContent}>
        <View style={styles.selectIcon}>
          <Ionicons name="body" size={64} color="#4CAF50" />
        </View>
        <Text style={styles.selectTitle}>Choose Your Session</Text>
        <Text style={styles.selectSubtitle}>
          Select how you'd like to work on your flexibility
        </Text>

        <TouchableOpacity
          style={styles.selectCard}
          onPress={() => setMode('guided')}
        >
          <View style={[styles.selectIconSmall, { backgroundColor: '#E3F2FD' }]}>
            <Ionicons name="camera" size={32} color="#2196F3" />
          </View>
          <View style={styles.selectInfo}>
            <Text style={styles.selectCardTitle}>AI-Guided Test</Text>
            <Text style={styles.selectCardDesc}>
              Pose detection to assess and improve your range of motion
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#CCC" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.selectCard}
          onPress={() => setMode('manual')}
        >
          <View style={[styles.selectIconSmall, { backgroundColor: '#E8F5E9' }]}>
            <Ionicons name="timer" size={32} color="#4CAF50" />
          </View>
          <View style={styles.selectInfo}>
            <Text style={styles.selectCardTitle}>Manual Session</Text>
            <Text style={styles.selectCardDesc}>
              Timer-based stretching with customizable durations
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#CCC" />
        </TouchableOpacity>

        {history.length > 0 && (
          <TouchableOpacity
            style={styles.historyBtn}
            onPress={() => Alert.alert('History', `${history.length} sessions recorded`)}
          >
            <Ionicons name="calendar-outline" size={20} color="#4CAF50" />
            <Text style={styles.historyBtnText}>
              {history.length} past sessions
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderManualMode = () => {
    if (currentStretch) {
      return (
        <View style={styles.trackingContainer}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => {
              setIsTimerRunning(false);
              setCurrentStretch(null);
              setTimerLeft(stretchDuration);
              pulseAnim.setValue(1);
            }} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Manual Session</Text>
            <View style={styles.placeholder} />
          </View>

          <View style={styles.activeStretchCard}>
            <Animated.View style={[styles.timerCircle, { transform: [{ scale: pulseAnim }] }]}>
              <Text style={styles.timerText}>{formatDuration(timerLeft)}</Text>
            </Animated.View>
            <Text style={styles.currentExerciseName}>{currentStretch.name}</Text>
            
            <View style={styles.durationSelector}>
              <Text style={styles.durationLabel}>Duration:</Text>
              {[15, 30, 45, 60, 90, 120].map(d => (
                <TouchableOpacity
                  key={d}
                  style={[
                    styles.durationBtn,
                    stretchDuration === d && styles.durationBtnActive,
                  ]}
                  onPress={() => {
                    setStretchDuration(d);
                    if (!isTimerRunning) setTimerLeft(d);
                  }}
                >
                  <Text style={[
                    styles.durationBtnText,
                    stretchDuration === d && styles.durationBtnTextActive,
                  ]}>{d}s</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.timerActions}>
              {!isTimerRunning ? (
                <TouchableOpacity
                  style={styles.startBtn}
                  onPress={() => startStretch(currentStretch)}
                >
                  <Ionicons name="play" size={24} color="#FFF" />
                  <Text style={styles.startBtnText}>Start</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.skipBtn} onPress={skipStretch}>
                  <Text style={styles.skipBtnText}>Skip</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {sessionStretches.length > 0 && (
            <View style={styles.sessionSummary}>
              <Text style={styles.sessionSummaryTitle}>Session Progress</Text>
              <View style={styles.sessionStats}>
                <View style={styles.sessionStat}>
                  <Text style={styles.sessionStatValue}>{sessionStretches.length}</Text>
                  <Text style={styles.sessionStatLabel}>Stretches</Text>
                </View>
                <View style={styles.sessionStat}>
                  <Text style={styles.sessionStatValue}>
                    {formatDuration(sessionStretches.reduce((sum, s) => sum + s.duration, 0))}
                  </Text>
                  <Text style={styles.sessionStatLabel}>Total Time</Text>
                </View>
              </View>

              <View style={styles.sessionStretchesList}>
                {sessionStretches.map((stretch, index) => (
                  <View key={index} style={styles.completedStretch}>
                    <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                    <Text style={styles.completedStretchName}>{stretch.exercise.name}</Text>
                    <Text style={styles.completedStretchDuration}>{formatDuration(stretch.duration)}</Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity style={styles.finishBtn} onPress={finishSession}>
                <Ionicons name="save" size={20} color="#FFF" />
                <Text style={styles.finishBtnText}>Finish Session</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      );
    }

    return (
      <View style={styles.manualContainer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setMode('select')} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Manual Session</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.exerciseList}>
          <Text style={styles.sectionTitle}>Flexibility</Text>
          {flexibilityExercises.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.exerciseCard}
              onPress={() => startStretch(item)}
            >
              <View style={styles.exerciseIcon}>
                <Ionicons name="fitness" size={24} color="#4CAF50" />
              </View>
              <View style={styles.exerciseInfo}>
                <Text style={styles.exerciseName}>{item.name}</Text>
              </View>
              <Ionicons name="play-circle" size={32} color="#4CAF50" />
            </TouchableOpacity>
          ))}

          <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Cardio / Warm-up</Text>
          {cardioExercises.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.exerciseCard}
              onPress={() => startStretch(item)}
            >
              <View style={[styles.exerciseIcon, { backgroundColor: '#FF572220' }]}>
                <Ionicons name="flame" size={24} color="#FF5722" />
              </View>
              <View style={styles.exerciseInfo}>
                <Text style={styles.exerciseName}>{item.name}</Text>
              </View>
              <Ionicons name="play-circle" size={32} color="#FF5722" />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderGuidedMode = () => (
    <View style={styles.guidedContainer}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setMode('select')} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI-Guided Test</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.guidedContent}>
        <View style={styles.cameraPlaceholder}>
          <Ionicons name="camera" size={80} color="#2196F3" />
          <Text style={styles.cameraText}>Camera View</Text>
          <Text style={styles.cameraSubtext}>Pose detection will assess your flexibility</Text>
        </View>

        <View style={styles.testInfo}>
          <View style={styles.testInfoItem}>
            <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
            <Text style={styles.testInfoText}>Real-time pose detection</Text>
          </View>
          <View style={styles.testInfoItem}>
            <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
            <Text style={styles.testInfoText}>Range of motion analysis</Text>
          </View>
          <View style={styles.testInfoItem}>
            <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
            <Text style={styles.testInfoText}>Personalized recommendations</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.startGuidedBtn}>
          <Ionicons name="camera" size={24} color="#FFF" />
          <Text style={styles.startGuidedBtnText}>Start Camera Test</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (mode === 'select') return renderModeSelect();
  if (mode === 'guided') return renderGuidedMode();
  return renderManualMode();
};

const styles = StyleSheet.create({
  selectContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  selectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
    marginHorizontal: 16,
  },
  placeholder: {
    width: 32,
  },
  selectContent: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
  },
  selectIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  selectTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  selectSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
  },
  selectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    width: '100%',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  selectIconSmall: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  selectInfo: {
    flex: 1,
  },
  selectCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  selectCardDesc: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  historyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  historyBtnText: {
    fontSize: 14,
    color: '#4CAF50',
    marginLeft: 8,
  },
  manualContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  guidedContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  guidedContent: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
  },
  cameraPlaceholder: {
    width: '100%',
    aspectRatio: 4 / 3,
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  cameraText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
    marginTop: 16,
  },
  cameraSubtext: {
    fontSize: 14,
    color: '#CCC',
    marginTop: 4,
  },
  testInfo: {
    width: '100%',
    marginBottom: 24,
  },
  testInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  testInfoText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  startGuidedBtn: {
    flexDirection: 'row',
    backgroundColor: '#2196F3',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  startGuidedBtnText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
  trackingContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  exerciseList: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  exerciseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  exerciseIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  activeStretchCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    margin: 16,
  },
  timerCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  timerText: {
    fontSize: 40,
    fontWeight: '700',
    color: '#4CAF50',
  },
  currentExerciseName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 20,
  },
  durationSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
  },
  durationLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
    alignSelf: 'center',
  },
  durationBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    marginHorizontal: 4,
    marginVertical: 4,
  },
  durationBtnActive: {
    backgroundColor: '#4CAF50',
  },
  durationBtnText: {
    fontSize: 14,
    color: '#666',
  },
  durationBtnTextActive: {
    color: '#FFF',
    fontWeight: '600',
  },
  timerActions: {
    flexDirection: 'row',
  },
  startBtn: {
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  startBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  skipBtn: {
    paddingHorizontal: 32,
    paddingVertical: 14,
  },
  skipBtnText: {
    color: '#FF9800',
    fontSize: 16,
    fontWeight: '600',
  },
  sessionSummary: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    margin: 16,
  },
  sessionSummaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  sessionStats: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  sessionStat: {
    flex: 1,
    alignItems: 'center',
  },
  sessionStatValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4CAF50',
  },
  sessionStatLabel: {
    fontSize: 12,
    color: '#888',
  },
  sessionStretchesList: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 12,
    marginBottom: 16,
  },
  completedStretch: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  completedStretchName: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
  completedStretchDuration: {
    fontSize: 14,
    color: '#888',
  },
  finishBtn: {
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  finishBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default FlexibilityScreen;

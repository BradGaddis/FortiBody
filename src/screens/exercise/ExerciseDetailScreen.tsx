import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  FlatList,
  TextInput,
  Keyboard,
  Modal,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { ExercisesStackParamList } from '@/navigation/routes';
import { RouteProp } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import UserProfileService from '@/services/user/UserProfileService';
import AICameraView from '@/components/camera/AICameraView';
import type { Pose, FormFeedback, RepState } from '@/types/pose';
import { createInitialRepState } from '@/services/ai/repCounter';
import streakService from '../../services/streak/StreakService';

type ExerciseDetailRouteProp = RouteProp<ExercisesStackParamList, 'Exercise'>;

interface ExerciseDetailScreenProps {
  route: ExerciseDetailRouteProp;
  navigation: StackNavigationProp<ExercisesStackParamList, 'Exercise'>;
}

const HISTORY_STORAGE_KEY = '@exercise_history';
const EXERCISE_UNIT_KEY = '@exercise_unit_';

const KG_TO_LBS = 2.20462;
const LBS_TO_KG = 0.453592;

interface SetData {
  reps: number;
  weight: number;
  completed: boolean;
}

interface SessionData {
  id: string;
  exerciseName: string;
  date: Date;
  sets: SetData[];
  notes: string;
  timestamp?: number; // Fallback timestamp for streak tracking
}

interface HistoryTabContentProps {
  history: SessionData[];
  formatHistoryWeight: (weight: number) => string;
  deleteFromHistory: (id: string) => void;
  getSessionOneRepMax: (sets: SetData[]) => number;
  isBodyweightExercise: boolean;
  onShow1RMInfo: () => void;
  onEditSession: (index: number, sets: SetData[]) => void;
}

const HistoryTabContent: React.FC<HistoryTabContentProps> = ({
  history,
  formatHistoryWeight,
  deleteFromHistory,
  getSessionOneRepMax,
  isBodyweightExercise,
  onShow1RMInfo,
  onEditSession,
}) => {
  if (history.length === 0) {
    return (
      <View style={styles.emptyHistory}>
        <Ionicons name="calendar-outline" size={64} color="#CCC" />
        <Text style={styles.emptyHistoryTitle}>No History Yet</Text>
        <Text style={styles.emptyHistoryText}>
          Complete your first session to see your progress here
        </Text>
      </View>
    );
  }

  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!isBodyweightExercise && history.length > 0) {
      const firstSession = history[0];
      if (!firstSession) return;
      const firstOneRepMax = getSessionOneRepMax(firstSession.sets);
      
      if (firstOneRepMax > 0) {
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.1,
              duration: 600,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 600,
              useNativeDriver: true,
            }),
          ]),
          { iterations: 3 }
        ).start();
      }
    }
  }, [history, isBodyweightExercise]);

  return (
    <FlatList
      data={history}
      keyExtractor={(item) => item.id}
      renderItem={({ item, index }) => {
        const totalVolume = item.sets.reduce((total, set) => total + set.reps * set.weight, 0);
        const maxWeight = Math.max(...item.sets.map(s => s.weight));
        const oneRepMax = getSessionOneRepMax(item.sets);
        const dateStr = item.date instanceof Date 
          ? item.date.toLocaleDateString() 
          : new Date(item.date).toLocaleDateString();
        const timeStr = item.timestamp 
          ? new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : null;
        
        const isFirstItem = index === 0 && !isBodyweightExercise && oneRepMax > 0;
        
        return (
          <View style={styles.historyCard}>
            <View style={styles.historyCardHeader}>
              <View>
                <Text style={styles.historyExerciseName}>{item.exerciseName}</Text>
                <Text style={styles.historyDate}>{dateStr}{timeStr ? ` • ${timeStr}` : ''}</Text>
                {item.timestamp && (
                  <Text style={styles.timestampDebug}>
                    {item.timestamp} ({new Date(item.timestamp).toISOString()})
                  </Text>
                )}
              </View>
              <View style={styles.historyCardActions}>
                <TouchableOpacity
                  style={styles.historyActionBtn}
                  onPress={() => {
                    onEditSession(index, item.sets);
                  }}
                >
                  <Ionicons name="create-outline" size={18} color="#4CAF50" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.historyActionBtn}
                  onPress={() => deleteFromHistory(item.id)}
                >
                  <Ionicons name="trash" size={18} color="#F44336" />
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.historyStatsRow}>
              <View style={styles.historyStat}>
                <Ionicons name="layers" size={16} color="#4CAF50" />
                <Text style={styles.historyStatText}>{item.sets.length} sets</Text>
              </View>
              <View style={styles.historyStat}>
                <Ionicons name="fitness" size={16} color="#FF5722" />
                <Text style={styles.historyStatText}>{formatHistoryWeight(totalVolume)} vol</Text>
              </View>
              <View style={styles.historyStat}>
                <Ionicons name="trending-up" size={16} color="#2196F3" />
                <Text style={styles.historyStatText}>{formatHistoryWeight(maxWeight)} max</Text>
              </View>
              {!isBodyweightExercise && oneRepMax > 0 && (
                <Animated.View style={isFirstItem ? { transform: [{ scale: pulseAnim }] } : {}}>
                  <TouchableOpacity 
                    style={styles.historyStat} 
                    onPress={onShow1RMInfo}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="trophy" size={16} color="#FFD700" />
                    <Text style={styles.historyStatText}>{formatHistoryWeight(oneRepMax)} 1RM*</Text>
                  </TouchableOpacity>
                </Animated.View>
              )}
            </View>
            
            <View style={styles.historySetsRow}>
              {item.sets.slice(0, 5).map((set, idx) => (
                <View key={idx} style={styles.historySetBadge}>
                  <Text style={styles.historySetText}>{formatHistoryWeight(set.weight)}</Text>
                  <Text style={styles.historySetReps}>{set.reps}</Text>
                </View>
              ))}
              {item.sets.length > 5 && (
                <View style={[styles.historySetBadge, styles.historySetMore]}>
                  <Text style={styles.historySetText}>+{item.sets.length - 5}</Text>
                </View>
              )}
            </View>
            
            {item.notes ? (
              <Text style={styles.historyNotes}>{item.notes}</Text>
            ) : null}
          </View>
        );
      }}
      contentContainerStyle={styles.historyList}
      showsVerticalScrollIndicator={false}
    />
  );
};

const ExerciseDetailScreen: React.FC<ExerciseDetailScreenProps> = ({
  route,
  navigation,
}) => {
  const { exercise } = route.params;

  const [activeTab, setActiveTab] = useState<'overview' | 'track' | 'history'>('overview');
  const [currentSet, setCurrentSet] = useState<SetData>({ reps: 0, weight: 0, completed: false });
  const [sessionSets, setSessionSets] = useState<SetData[]>([]);
  const [isResting, setIsResting] = useState(false);
  const [restTimeLeft, setRestTimeLeft] = useState(90);
  const [setWarning, setSetWarning] = useState<string | null>(null);
  const [sessionNotes, setSessionNotes] = useState('');
  const [isAIMode, setIsAIMode] = useState(false);
  const [history, setHistory] = useState<SessionData[]>([]);
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('kg');
  const [exerciseUnitOverride, setExerciseUnitOverride] = useState<'kg' | 'lbs' | null>(null);
  const [show1RMInfo, setShow1RMInfo] = useState(false);
  const [editingSetIndex, setEditingSetIndex] = useState<number | null>(null);
  const [editingWeight, setEditingWeight] = useState('');
  const [editingReps, setEditingReps] = useState('');
  const [editingSessionIndex, setEditingSessionIndex] = useState<number | null>(null);
  const [editingSessionSets, setEditingSessionSets] = useState<SetData[]>([]);

  useEffect(() => {
    loadHistory();
    loadExerciseUnit();
  }, []);

  const loadExerciseUnit = async () => {
    try {
      const profile = await UserProfileService.prototype.getActiveProfile();
      const storedOverride = await AsyncStorage.getItem(`${EXERCISE_UNIT_KEY}${exercise.name}`);
      
      if (storedOverride) {
        setExerciseUnitOverride(JSON.parse(storedOverride));
      } else if (profile) {
        setWeightUnit(profile.weightUnit || 'kg');
        setExerciseUnitOverride(null);
      }
    } catch (error) {
      console.log('Failed to load exercise unit:', error);
    }
  };

  const toggleUnit = async () => {
    const newUnit = weightUnit === 'kg' ? 'lbs' : 'kg';
    setWeightUnit(newUnit);
    setExerciseUnitOverride(newUnit);
    
    try {
      await AsyncStorage.setItem(`${EXERCISE_UNIT_KEY}${exercise.name}`, JSON.stringify(newUnit));
    } catch (error) {
      console.log('Failed to save exercise unit:', error);
    }
  };

  const getDisplayWeight = (kgWeight: number): number => {
    const unit = exerciseUnitOverride || weightUnit;
    if (unit === 'lbs') {
      const lbsValue = kgWeight * KG_TO_LBS;
      const remainder = lbsValue % 2.5;
      if (remainder < 0.25 || remainder > 2.25) {
        return Math.round(lbsValue);
      }
      return Math.round(lbsValue / 2.5) * 2.5;
    }
    return kgWeight;
  };

  const getRawDisplayWeight = (kgWeight: number): number => {
    const unit = exerciseUnitOverride || weightUnit;
    if (unit === 'lbs') {
      return kgWeight * KG_TO_LBS;
    }
    return kgWeight;
  };

  const isImperial = (): boolean => {
    return (exerciseUnitOverride || weightUnit) === 'lbs';
  };

  const getStorageWeight = (displayWeight: number): number => {
    const unit = exerciseUnitOverride || weightUnit;
    if (unit === 'lbs') {
      return displayWeight / KG_TO_LBS;
    }
    return displayWeight;
  };

  const formatWeight = (kgWeight: number): string => {
    const unit = exerciseUnitOverride || weightUnit;
    const display = getDisplayWeight(kgWeight);
    const displayStr = Number.isInteger(display) ? display.toString() : display.toFixed(1);
    return `${displayStr} ${unit}`;
  };

  const formatHistoryWeight = (kgWeight: number): string => {
    const unit = exerciseUnitOverride || weightUnit;
    const display = getDisplayWeight(kgWeight);
    const displayStr = Number.isInteger(display) ? display.toString() : display.toFixed(1);
    return `${displayStr} ${unit}`;
  };

  const loadHistory = async () => {
    try {
      const stored = await AsyncStorage.getItem(HISTORY_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setHistory(parsed);
      }
    } catch (error) {
      console.log('Failed to load history:', error);
    }
  };

  const saveToHistory = async (session: SessionData) => {
    try {
      const newHistory = [session, ...history];
      setHistory(newHistory);
      await AsyncStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(newHistory));
    } catch (error) {
      console.log('Failed to save history:', error);
    }
  };

  const deleteFromHistory = async (sessionId: string) => {
    Alert.alert(
      'Delete Session',
      'Are you sure you want to delete this session?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const newHistory = history.filter(s => s.id !== sessionId);
            setHistory(newHistory);
            await AsyncStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(newHistory));
          },
        },
      ]
    );
  };

  const handleAddSet = () => {
    setSetWarning(null);
    
    if (currentSet.reps <= 0) {
      setSetWarning('Please enter a valid number of reps');
      return;
    }
    
    if (currentSet.weight <= 0) {
      setSetWarning('Please enter a valid weight');
      return;
    }
    
    setSessionSets([...sessionSets, { ...currentSet, completed: false }]);
    setCurrentSet({ ...currentSet, reps: 8 });
  };

  const handleCompleteSet = (index: number) => {
    const set = sessionSets[index];
    if (!set) return;
    const updated = [...sessionSets];
    updated[index] = { ...set, completed: true };
    setSessionSets(updated);
    startRestTimer();
  };

  const startEditingSet = (index: number) => {
    const set = sessionSets[index];
    if (!set) return;
    setEditingSetIndex(index);
    setEditingWeight(getRawDisplayWeight(set.weight).toFixed(1));
    setEditingReps(set.reps.toString());
  };

  const saveEditedSet = () => {
    if (editingSetIndex === null) return;
    const weight = parseFloat(editingWeight);
    const reps = parseInt(editingReps);
    if (isNaN(weight) || isNaN(reps) || weight < 0 || reps < 1) {
      Alert.alert('Invalid Input', 'Please enter valid weight and reps.');
      return;
    }
    const updated = [...sessionSets];
    updated[editingSetIndex] = {
      ...updated[editingSetIndex],
      weight: getStorageWeight(weight),
      reps: reps,
      completed: false,
    };
    setSessionSets(updated);
    setEditingSetIndex(null);
  };

  const cancelEditingSet = () => {
    setEditingSetIndex(null);
    setEditingWeight('');
    setEditingReps('');
  };

  const cancelEditingSession = () => {
    setEditingSessionIndex(null);
    setEditingSessionSets([]);
  };

  const saveEditedSession = () => {
    if (editingSessionIndex === null) return;
    
    const updatedHistory = [...history];
    const existingSession = updatedHistory[editingSessionIndex];
    if (!existingSession) return;
    
    updatedHistory[editingSessionIndex] = {
      ...existingSession,
      id: existingSession.id || Date.now().toString(),
      exerciseName: existingSession.exerciseName || '',
      date: existingSession.date || new Date(),
      notes: existingSession.notes || '',
      timestamp: existingSession.timestamp,
      sets: editingSessionSets,
    };
    setHistory(updatedHistory);
    
    const updatedHistoryJSON = JSON.stringify(updatedHistory);
    AsyncStorage.setItem(HISTORY_STORAGE_KEY, updatedHistoryJSON);
    
    setEditingSessionIndex(null);
    setEditingSessionSets([]);
  };

  const deleteSet = (index: number) => {
    Alert.alert(
      'Delete Set',
      'Are you sure you want to remove this set?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updated = sessionSets.filter((_, i) => i !== index);
            setSessionSets(updated);
          },
        },
      ]
    );
  };

  const startRestTimer = () => {
    setIsResting(true);
    setRestTimeLeft(90);
    const timer = setInterval(() => {
      setRestTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsResting(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleFinishSession = () => {
    if (sessionSets.length === 0) {
      Alert.alert('No Sets', 'Complete at least one set before finishing.');
      return;
    }
    const totalVolume = sessionSets.reduce((total, set) => total + set.reps * set.weight, 0);
    const maxWeight = Math.max(...sessionSets.map(s => s.weight));
    
    Alert.alert(
      'Finish Session',
      `You completed ${sessionSets.length} sets.\nVolume: ${formatWeight(totalVolume)}\nMax: ${formatWeight(maxWeight)}\n\nSave this session?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Save',
          style: 'default',
          onPress: () => {
            const session: SessionData = {
              id: Date.now().toString(),
              exerciseName: exercise.name,
              date: new Date(),
              sets: [...sessionSets],
              notes: sessionNotes,
              timestamp: Date.now(),
            };
            saveToHistory(session);
            streakService.recordActivity();
            setSessionSets([]);
            setSessionNotes('');
            setActiveTab('history');
          },
        },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: () => setSessionSets([]),
        },
      ]
    );
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTotalVolume = () => {
    return sessionSets.reduce((total, set) => total + set.reps * set.weight, 0);
  };

  const getPersonalBest = () => {
    if (sessionSets.length === 0) return 0;
    return Math.max(...sessionSets.map(s => s.weight));
  };

  const calculateOneRepMax = (weight: number, reps: number): number => {
    if (reps === 1) return weight;
    if (reps >= 37) return weight;
    return weight * (36 / (37 - reps));
  };

  const getSessionOneRepMax = (sets: SetData[]): number => {
    if (sets.length === 0) return 0;
    let maxORM = 0;
    sets.forEach(set => {
      if (set.reps <= 12) {
        const orm = calculateOneRepMax(set.weight, set.reps);
        if (orm > maxORM) maxORM = orm;
      }
    });
    return maxORM;
  };

  const isBodyweightExercise = (): boolean => {
    return !exercise.equipment || exercise.equipment.length === 0 || 
           (exercise.equipment.length === 1 && exercise.equipment[0].toLowerCase() === 'bodyweight');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{exercise.name}</Text>
        <TouchableOpacity style={styles.favoriteBtn}>
          <Ionicons name="heart-outline" size={24} color="#1A1A1A" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabBar}>
        {['overview', 'track', 'history'].map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab as any)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === 'history' ? (
        <HistoryTabContent
          history={history}
          formatHistoryWeight={formatHistoryWeight}
          deleteFromHistory={deleteFromHistory}
          getSessionOneRepMax={getSessionOneRepMax}
          isBodyweightExercise={isBodyweightExercise()}
          onShow1RMInfo={() => setShow1RMInfo(true)}
          onEditSession={(index, sets) => {
            setEditingSessionIndex(index);
            setEditingSessionSets([...sets]);
          }}
        />
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {activeTab === 'overview' && (
            <View style={styles.overviewSection}>
              <View style={styles.imagePlaceholder}>
                <Ionicons name="fitness" size={60} color="#CCC" />
                <Text style={styles.imagePlaceholderText}>Exercise Demo</Text>
              </View>

              <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                  <View style={styles.infoItem}>
                    <Ionicons name="barbell" size={20} color="#4CAF50" />
                    <Text style={styles.infoLabel}>Equipment</Text>
                    <Text style={styles.infoValue}>{exercise.equipment && exercise.equipment.length > 0 ? exercise.equipment.join(', ') : 'None'}</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Ionicons name="body" size={20} color="#FF5722" />
                    <Text style={styles.infoLabel}>Type</Text>
                    <Text style={styles.infoValue}>{exercise.category}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Muscle Group</Text>
                <View style={styles.muscleTags}>
                  <TouchableOpacity style={styles.muscleTag}>
                    <Text style={styles.muscleTagText}>
                      {exercise.muscle.charAt(0).toUpperCase() + exercise.muscle.slice(1)}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Instructions</Text>
                <View style={styles.instructionsCard}>
                  <Text style={styles.instructionsText}>{exercise.instructions}</Text>
                </View>
              </View>

              {exercise.safetyInfo && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Safety Tips</Text>
                  <View style={styles.tipCard}>
                    <Ionicons name="shield-checkmark" size={20} color="#4CAF50" />
                    <Text style={styles.tipText}>{exercise.safetyInfo}</Text>
                  </View>
                </View>
              )}
            </View>
          )}

          {activeTab === 'track' && (
            <View style={styles.trackSection}>
              <View style={styles.quickStats}>
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>{sessionSets.length}</Text>
                  <Text style={styles.statLabel}>Sets</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>{formatWeight(getTotalVolume())}</Text>
                  <Text style={styles.statLabel}>Volume</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>{formatWeight(getPersonalBest())}</Text>
                  <Text style={styles.statLabel}>Max Weight</Text>
                </View>
                {!isBodyweightExercise() && getSessionOneRepMax(sessionSets) > 0 && (
                  <TouchableOpacity style={styles.statBox} onPress={() => setShow1RMInfo(true)}>
                    <Text style={styles.statValue}>{formatWeight(getSessionOneRepMax(sessionSets))}</Text>
                    <Text style={styles.statLabel}>Est. 1RM*</Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.currentSetCard}>
                <View style={styles.currentSetHeader}>
                  <Text style={styles.currentSetTitle}>Current Set</Text>
                  <TouchableOpacity style={styles.unitToggleBtn} onPress={toggleUnit}>
                    <Text style={styles.unitToggleText}>
                      {(exerciseUnitOverride || weightUnit).toUpperCase()}
                    </Text>
                    <Ionicons name="swap-vertical" size={14} color="#4CAF50" />
                  </TouchableOpacity>
                </View>
                <View style={styles.setInputsRow}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Weight ({(exerciseUnitOverride || weightUnit)})</Text>
                    <View style={styles.weightInputRow}>
                      <TouchableOpacity
                        style={styles.inputBtn}
                        onPress={() => {
                          const currentDisplay = getRawDisplayWeight(currentSet.weight);
                          const newDisplay = isImperial()
                            ? Math.max(0, currentDisplay - 2.5)
                            : Math.max(0, currentDisplay - 1);
                          setCurrentSet(prev => ({ ...prev, weight: getStorageWeight(newDisplay) }));
                        }}
                      >
                        <Ionicons name="remove" size={20} color="#FFF" />
                      </TouchableOpacity>
                      <TextInput
                        style={styles.weightTextInput}
                        value={getRawDisplayWeight(currentSet.weight).toFixed(1)}
                        onChangeText={(text) => {
                          const num = parseFloat(text);
                          if (!isNaN(num) && num >= 0) {
                            setCurrentSet(prev => ({ ...prev, weight: getStorageWeight(num) }));
                          }
                        }}
                        keyboardType="numeric"
                        returnKeyType="done"
                        onSubmitEditing={() => Keyboard.dismiss()}
                      />
                      <TouchableOpacity
                        style={styles.inputBtn}
                        onPress={() => {
                          const currentDisplay = getRawDisplayWeight(currentSet.weight);
                          const newDisplay = isImperial()
                            ? currentDisplay + 2.5
                            : currentDisplay + 1;
                          setCurrentSet(prev => ({ ...prev, weight: getStorageWeight(newDisplay) }));
                        }}
                      >
                        <Ionicons name="add" size={20} color="#FFF" />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Reps</Text>
                    <View style={styles.repsInputRow}>
                      <TouchableOpacity
                        style={styles.repsStepBtn}
                        onPress={() => {
                          if (currentSet.reps > 0) {
                            setCurrentSet(prev => ({ ...prev, reps: prev.reps - 1 }));
                          }
                        }}
                      >
                        <Ionicons name="remove" size={20} color="#FFF" />
                      </TouchableOpacity>
                      <TextInput
                        style={styles.repsTextInput}
                        value={currentSet.reps.toString()}
                        onChangeText={(text) => {
                          const num = parseInt(text, 10);
                          if (!isNaN(num) && num >= 0) {
                            setCurrentSet(prev => ({ ...prev, reps: num }));
                          }
                        }}
                        keyboardType="numeric"
                        returnKeyType="done"
                        onSubmitEditing={() => Keyboard.dismiss()}
                        placeholder="0"
                        placeholderTextColor="#999"
                      />
                      <TouchableOpacity
                        style={styles.repsStepBtn}
                        onPress={() => {
                          setCurrentSet(prev => ({ ...prev, reps: prev.reps + 1 }));
                        }}
                      >
                        <Ionicons name="add" size={20} color="#FFF" />
                      </TouchableOpacity>
                      <Text style={styles.repsLabel}>reps</Text>
                    </View>
                  </View>
                </View>
                {setWarning && (
                  <View style={styles.setWarningContainer}>
                    <Ionicons name="warning" size={16} color="#FF9800" />
                    <Text style={styles.setWarningText}>{setWarning}</Text>
                  </View>
                )}
                <TouchableOpacity style={styles.addSetBtn} onPress={handleAddSet}>
                  <Ionicons name="add" size={20} color="#FFF" />
                  <Text style={styles.addSetBtnText}>Add Set</Text>
                </TouchableOpacity>
              </View>

              {isResting && (
                <View style={styles.restTimer}>
                  <Text style={styles.restTitle}>Rest Timer</Text>
                  <Text style={styles.restTime}>{formatTime(restTimeLeft)}</Text>
                  <TouchableOpacity style={styles.skipRestBtn} onPress={() => setIsResting(false)}>
                    <Text style={styles.skipRestText}>Skip</Text>
                  </TouchableOpacity>
                </View>
              )}

              {sessionSets.length > 0 && (
                <View style={styles.setsList}>
                  <Text style={styles.setsListTitle}>Session Sets</Text>
                  {sessionSets.map((set, index) => (
                    <View key={index} style={[styles.setCard, set.completed && styles.setCardCompleted]}>
                      <View style={styles.setInfo}>
                        <Text style={styles.setNumber}>Set {index + 1}</Text>
                        <Text style={styles.setDetails}>{formatWeight(set.weight)} × {set.reps} reps</Text>
                      </View>
                      <View style={styles.setActions}>
                        <TouchableOpacity
                          style={styles.setActionBtn}
                          onPress={() => startEditingSet(index)}
                        >
                          <Ionicons name="create-outline" size={18} color="#666" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.setActionBtn}
                          onPress={() => deleteSet(index)}
                        >
                          <Ionicons name="trash-outline" size={18} color="#F44336" />
                        </TouchableOpacity>
                        {!set.completed && (
                          <TouchableOpacity
                            style={[styles.completeBtn, styles.completeBtnSmall]}
                            onPress={() => handleCompleteSet(index)}
                          >
                            <Ionicons name="checkmark" size={16} color="#FFF" />
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              )}

              <View style={styles.sessionActions}>
                <View style={styles.sessionSummary}>
                  <Text style={styles.sessionSummaryText}>
                    {sessionSets.length} sets • {formatWeight(getTotalVolume())} volume
                  </Text>
                </View>

                <TouchableOpacity
                  style={[styles.actionBtn, styles.saveBtn]}
                  onPress={handleFinishSession}
                >
                  <Ionicons name="save" size={20} color="#FFF" />
                  <Text style={styles.actionBtnText}>Save Session</Text>
                </TouchableOpacity>

                {sessionSets.length > 0 && (
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.discardBtn]}
                    onPress={() => {
                      Alert.alert(
                        'Discard Session',
                        'Are you sure you want to discard all sets?',
                        [
                          { text: 'Cancel', style: 'cancel' },
                          {
                            text: 'Discard',
                            style: 'destructive',
                            onPress: () => setSessionSets([]),
                          },
                        ]
                      );
                    }}
                  >
                    <Ionicons name="trash" size={20} color="#F44336" />
                    <Text style={[styles.actionBtnText, styles.discardBtnText]}>Discard</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[styles.actionBtn, styles.aiBtn, isAIMode && styles.aiModeActive]}
                  onPress={() => setIsAIMode(true)}
                >
                  <Ionicons name="analytics" size={20} color="#FFF" />
                  <Text style={styles.actionBtnText}>AI Tracking</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>
      )}

      <Modal visible={isAIMode} animationType="slide">
        <AICameraView
          isActive={isAIMode}
          pose={null}
          repState={createInitialRepState()}
          currentAngle={null}
          formFeedback={[]}
          exercise={exercise.name}
          onClose={() => {
            setIsAIMode(false);
          }}
          onRepAdjust={() => {}}
        />
      </Modal>

      <Modal visible={show1RMInfo} transparent animationType="fade">
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setShow1RMInfo(false)}
        >
          <View style={styles.infoModalContent} onStartShouldSetResponder={() => true}>
            <View style={styles.infoModalHeader}>
              <Text style={styles.infoModalTitle}>One-Rep Max Estimate</Text>
              <TouchableOpacity onPress={() => setShow1RMInfo(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <Text style={styles.infoModalText}>
              Your estimated one-rep max (1RM) is calculated using the Brzycki formula:
            </Text>
            <View style={styles.formulaBox}>
              <Text style={styles.formulaText}>Weight × (36 ÷ (37 - Reps))</Text>
            </View>
            <Text style={styles.infoModalText}>
              This formula estimates your maximum possible lift for one repetition based on your actual performance with fewer reps.
            </Text>
            <Text style={styles.infoModalNote}>
              *Note: This is an estimate. Actual 1RM may vary based on individual factors, training experience, and exercise type.
            </Text>
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal visible={editingSetIndex !== null} transparent animationType="fade">
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={cancelEditingSet}
        >
          <View style={styles.editModalContent} onStartShouldSetResponder={() => true}>
            <View style={styles.editModalHeader}>
              <Text style={styles.editModalTitle}>Edit Set</Text>
              <TouchableOpacity onPress={cancelEditingSet}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.editModalRow}>
              <View style={styles.editModalInputGroup}>
                <Text style={styles.editModalLabel}>Weight ({(exerciseUnitOverride || weightUnit)})</Text>
                <View style={styles.editModalInputRow}>
                  <TouchableOpacity
                    style={styles.editModalInputBtn}
                    onPress={() => {
                      const current = parseFloat(editingWeight) || 0;
                      const newVal = isImperial() 
                        ? Math.max(0, current - 2.5) 
                        : Math.max(0, current - 1);
                      setEditingWeight(newVal.toFixed(1));
                    }}
                  >
                    <Ionicons name="remove" size={18} color="#FFF" />
                  </TouchableOpacity>
                  <TextInput
                    style={styles.editModalTextInput}
                    value={editingWeight}
                    onChangeText={setEditingWeight}
                    keyboardType="numeric"
                    returnKeyType="done"
                  />
                  <TouchableOpacity
                    style={styles.editModalInputBtn}
                    onPress={() => {
                      const current = parseFloat(editingWeight) || 0;
                      const newVal = isImperial() 
                        ? current + 2.5 
                        : current + 1;
                      setEditingWeight(newVal.toFixed(1));
                    }}
                  >
                    <Ionicons name="add" size={18} color="#FFF" />
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.editModalInputGroup}>
                <Text style={styles.editModalLabel}>Reps</Text>
                <View style={styles.editModalInputRow}>
                  <TouchableOpacity
                    style={styles.editModalInputBtn}
                    onPress={() => {
                      const current = parseInt(editingReps) || 1;
                      setEditingReps(Math.max(1, current - 1).toString());
                    }}
                  >
                    <Ionicons name="remove" size={18} color="#FFF" />
                  </TouchableOpacity>
                  <TextInput
                    style={styles.editModalTextInput}
                    value={editingReps}
                    onChangeText={setEditingReps}
                    keyboardType="numeric"
                    returnKeyType="done"
                  />
                  <TouchableOpacity
                    style={styles.editModalInputBtn}
                    onPress={() => {
                      const current = parseInt(editingReps) || 1;
                      setEditingReps((current + 1).toString());
                    }}
                  >
                    <Ionicons name="add" size={18} color="#FFF" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={styles.editModalActions}>
              <TouchableOpacity
                style={[styles.editModalBtn, styles.editModalCancelBtn]}
                onPress={cancelEditingSet}
              >
                <Text style={styles.editModalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.editModalBtn, styles.editModalSaveBtn]}
                onPress={saveEditedSet}
              >
                <Text style={styles.editModalSaveBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal visible={editingSessionIndex !== null} transparent animationType="slide">
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={cancelEditingSession}
        >
          <View style={styles.sessionEditModalContent} onStartShouldSetResponder={() => true}>
            <View style={styles.editModalHeader}>
              <Text style={styles.editModalTitle}>Edit Session</Text>
              <TouchableOpacity onPress={cancelEditingSession}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.sessionEditSetsList}>
              {editingSessionSets.map((set, idx) => (
                <View key={idx} style={styles.sessionEditSetRow}>
                  <View style={styles.sessionEditHeaderRow}>
                    <Text style={styles.sessionEditSetNumber}>Set {idx + 1}</Text>
                    {editingSessionSets.length > 1 && (
                      <TouchableOpacity
                        style={styles.removeSetBtn}
                        onPress={() => {
                          const newSets = editingSessionSets.filter((_, i) => i !== idx);
                          setEditingSessionSets(newSets);
                        }}
                      >
                        <Ionicons name="close-circle" size={20} color="#F44336" />
                      </TouchableOpacity>
                    )}
                  </View>
                  <View style={styles.sessionEditSetInputs}>
                    <View style={styles.sessionEditInputGroup}>
                      <Text style={styles.editModalLabel}>Weight</Text>
                      <View style={styles.sessionEditInputRow}>
                        <TouchableOpacity
                          style={styles.editModalInputBtn}
                          onPress={() => {
                            const newSets = [...editingSessionSets];
                            const currentSet = newSets[idx];
                            if (currentSet) {
                              newSets[idx] = {
                                ...currentSet,
                                weight: Math.max(0, getStorageWeight(getRawDisplayWeight(currentSet.weight) - (isImperial() ? 2.5 : 1))),
                                reps: currentSet.reps ?? 0,
                                completed: currentSet.completed ?? false
                              };
                            }
                            setEditingSessionSets(newSets);
                          }}
                        >
                          <Ionicons name="remove" size={18} color="#FFF" />
                        </TouchableOpacity>
                        <TextInput
                          style={styles.editModalTextInput}
                          value={getRawDisplayWeight(set.weight).toFixed(1)}
                          onChangeText={(text) => {
                            const newSets = [...editingSessionSets];
                            const currentSet = newSets[idx];
                            if (currentSet) {
                              newSets[idx] = {
                                ...currentSet,
                                weight: getStorageWeight(parseFloat(text) || 0),
                                reps: currentSet.reps ?? 0,
                                completed: currentSet.completed ?? false
                              };
                            }
                            setEditingSessionSets(newSets);
                          }}
                          keyboardType="numeric"
                        />
                        <TouchableOpacity
                          style={styles.editModalInputBtn}
                          onPress={() => {
                            const newSets = [...editingSessionSets];
                            const currentSet = newSets[idx];
                            if (currentSet) {
                              newSets[idx] = {
                                ...currentSet,
                                weight: getStorageWeight(getRawDisplayWeight(currentSet.weight) + (isImperial() ? 2.5 : 1)),
                                reps: currentSet.reps ?? 0,
                                completed: currentSet.completed ?? false
                              };
                            }
                            setEditingSessionSets(newSets);
                          }}
                        >
                          <Ionicons name="add" size={18} color="#FFF" />
                        </TouchableOpacity>
                      </View>
                    </View>
                    <View style={styles.sessionEditInputGroup}>
                      <Text style={styles.editModalLabel}>Reps</Text>
                      <View style={styles.sessionEditInputRow}>
                        <TouchableOpacity
                          style={styles.editModalInputBtn}
                          onPress={() => {
                            const newSets = [...editingSessionSets];
                            const currentSet = newSets[idx];
                            if (currentSet) {
                              newSets[idx] = {
                                ...currentSet,
                                reps: Math.max(0, (currentSet.reps ?? 0) - 1),
                                weight: currentSet.weight ?? 0,
                                completed: currentSet.completed ?? false
                              };
                            }
                            setEditingSessionSets(newSets);
                          }}
                        >
                          <Ionicons name="remove" size={18} color="#FFF" />
                        </TouchableOpacity>
                        <TextInput
                          style={styles.editModalTextInput}
                          value={set.reps.toString()}
                          onChangeText={(text) => {
                            const newSets = [...editingSessionSets];
                            const currentSet = newSets[idx];
                            if (currentSet) {
                              newSets[idx] = {
                                ...currentSet,
                                reps: parseInt(text) || 0,
                                weight: currentSet.weight ?? 0,
                                completed: currentSet.completed ?? false
                              };
                            }
                            setEditingSessionSets(newSets);
                          }}
                          keyboardType="numeric"
                        />
                        <TouchableOpacity
                          style={styles.editModalInputBtn}
                          onPress={() => {
                            const newSets = [...editingSessionSets];
                            const currentSet = newSets[idx];
                            if (currentSet) {
                              newSets[idx] = {
                                ...currentSet,
                                reps: (currentSet.reps ?? 0) + 1,
                                weight: currentSet.weight ?? 0,
                                completed: currentSet.completed ?? false
                              };
                            }
                            setEditingSessionSets(newSets);
                          }}
                        >
                          <Ionicons name="add" size={18} color="#FFF" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={styles.addSetBtn}
              onPress={() => {
                setEditingSessionSets([...editingSessionSets, { reps: 8, weight: 0, completed: false }]);
              }}
            >
              <Ionicons name="add" size={20} color="#FFF" />
              <Text style={styles.addSetBtnText}>Add Set</Text>
            </TouchableOpacity>

            <View style={styles.editModalActions}>
              <TouchableOpacity
                style={[styles.editModalBtn, styles.editModalCancelBtn]}
                onPress={cancelEditingSession}
              >
                <Text style={styles.editModalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.editModalBtn, styles.editModalSaveBtn]}
                onPress={saveEditedSession}
              >
                <Text style={styles.editModalSaveBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
  favoriteBtn: {
    padding: 4,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#4CAF50',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888',
  },
  tabTextActive: {
    color: '#4CAF50',
  },
  content: {
    flex: 1,
  },
  overviewSection: {
    padding: 16,
  },
  imagePlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: '#FFF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  imagePlaceholderText: {
    marginTop: 8,
    fontSize: 14,
    color: '#888',
  },
  infoCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoItem: {
    alignItems: 'center',
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  muscleTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  muscleTag: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  muscleTagText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '500',
  },
  instructionsCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    padding: 12,
  },
  instructionsText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    marginLeft: 10,
    lineHeight: 20,
  },
  trackSection: {
    padding: 16,
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  statLabel: {
    fontSize: 11,
    color: '#888',
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  currentSetCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  currentSetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  currentSetTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  unitToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  unitToggleText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginRight: 4,
  },
  setInputsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  inputGroup: {
    flex: 1,
    marginHorizontal: 6,
  },
  inputLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '500',
  },
  weightInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 8,
  },
  weightTextInput: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    width: 80,
    textAlign: 'center',
    padding: 0,
    backgroundColor: 'transparent',
  },
  repsInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 8,
  },
  repsTextInput: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    width: 60,
    textAlign: 'center',
    padding: 0,
    backgroundColor: 'transparent',
  },
  repsStepBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 6,
  },
  repsLabel: {
    fontSize: 16,
    color: '#888',
    marginLeft: 4,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 6,
  },
  inputValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginHorizontal: 16,
    minWidth: 40,
    textAlign: 'center',
  },
  addSetBtn: {
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addSetBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  setWarningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  setWarningText: {
    color: '#E65100',
    fontSize: 13,
    marginLeft: 8,
    flex: 1,
  },
  restTimer: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  restTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF9800',
  },
  restTime: {
    fontSize: 36,
    fontWeight: '700',
    color: '#1A1A1A',
    marginVertical: 8,
  },
  skipRestBtn: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  skipRestText: {
    fontSize: 14,
    color: '#FF9800',
    fontWeight: '500',
  },
  setsList: {
    marginBottom: 16,
  },
  setsListTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  setCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  setCardCompleted: {
    backgroundColor: '#F8F8F8',
  },
  setInfo: {
    flex: 1,
  },
  setNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  setDetails: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  completeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  setActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  setActionBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  completeBtnSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginLeft: 4,
  },
  sessionActions: {
    marginTop: 8,
  },
  sessionSummary: {
    alignItems: 'center',
    marginBottom: 12,
  },
  sessionSummaryText: {
    fontSize: 14,
    color: '#888',
  },
  actionBtn: {
    flexDirection: 'row',
    borderRadius: 12,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  saveBtn: {
    backgroundColor: '#4CAF50',
  },
  discardBtn: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#F44336',
  },
  discardBtnText: {
    color: '#F44336',
    marginLeft: 8,
  },
  aiBtn: {
    backgroundColor: '#2196F3',
  },
  aiModeActive: {
    backgroundColor: '#1976D2',
  },
  actionBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  historySection: {
    padding: 16,
  },
  emptyHistory: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyHistoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginTop: 16,
  },
  emptyHistoryText: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
    textAlign: 'center',
  },
  historyList: {
    paddingBottom: 16,
  },
  historyCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  historyCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  historyExerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  historyDate: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  timestampDebug: {
    fontSize: 10,
    color: '#AAA',
    marginTop: 4,
    fontFamily: 'monospace',
  },
  deleteHistoryBtn: {
    padding: 4,
  },
  historyCardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  historyActionBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  historyStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  historyStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyStatText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 6,
  },
  historySetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  historySetBadge: {
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: 'center',
  },
  historySetText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  historySetReps: {
    fontSize: 10,
    color: '#888',
  },
  historySetMore: {
    backgroundColor: '#E0E0E0',
  },
  historyNotes: {
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  infoModalContent: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 340,
  },
  infoModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  infoModalText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 12,
  },
  formulaBox: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  formulaText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
  },
  infoModalNote: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
    marginTop: 8,
    lineHeight: 18,
  },
  editModalContent: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 340,
  },
  editModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  editModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  editModalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  editModalInputGroup: {
    flex: 1,
    marginHorizontal: 6,
  },
  editModalLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 8,
    textAlign: 'center',
  },
  editModalInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editModalInputBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editModalTextInput: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    width: 80,
    textAlign: 'center',
    padding: 0,
    backgroundColor: 'transparent',
  },
  editModalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  editModalBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 6,
  },
  editModalCancelBtn: {
    backgroundColor: '#F5F5F5',
  },
  editModalCancelBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  editModalSaveBtn: {
    backgroundColor: '#4CAF50',
  },
  editModalSaveBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  sessionEditModalContent: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  sessionEditSetsList: {
    maxHeight: 400,
    marginBottom: 16,
  },
  sessionEditSetRow: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  sessionEditSetNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  sessionEditSetInputs: {
    flexDirection: 'row',
    gap: 20,
  },
  sessionEditInputGroup: {
    flex: 1,
  },
  sessionEditInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  sessionEditHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  removeSetBtn: {
    padding: 4,
  },
});

export default ExerciseDetailScreen;

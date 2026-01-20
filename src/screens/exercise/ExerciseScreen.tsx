import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Image,
  Dimensions,
  Modal,
  FlatList,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@/types/navigation';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { total_exercises_dict } from '@/services/exercise/exercise_store';
import AICameraView from '@/components/camera/AICameraView';
import type { Pose, FormFeedback, RepState } from '@/types/pose';
import { createInitialRepState } from '@/services/ai/repCounter';

const HISTORY_STORAGE_KEY = '@exercise_history';

interface ExerciseScreenProps {
  name: string;
  navigation: StackNavigationProp<RootStackParamList>;
}

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
}

const { width } = Dimensions.get('window');

const ExerciseScreen: React.FC<ExerciseScreenProps> = ({
  name,
  navigation,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'track' | 'history'>('overview');
  const [currentSet, setCurrentSet] = useState<SetData>({ reps: 8, weight: 40, completed: false });
  const [sessionSets, setSessionSets] = useState<SetData[]>([]);
  const [isResting, setIsResting] = useState(false);
  const [restTimeLeft, setRestTimeLeft] = useState(90);
  const [showNotesInput, setShowNotesInput] = useState(false);
  const [sessionNotes, setSessionNotes] = useState('');
  const [isAIMode, setIsAIMode] = useState(false);
  const [aiPose, setAiPose] = useState<Pose | null>(null);
  const [aiRepState, setAiRepState] = useState<RepState>(createInitialRepState());
  const [aiCurrentAngle, setAiCurrentAngle] = useState<number | null>(null);
  const [aiFormFeedback, setAiFormFeedback] = useState<FormFeedback[]>([]);
  const [aiRepOverride, setAiRepOverride] = useState(0);
  const [history, setHistory] = useState<SessionData[]>([]);

  const exercise = total_exercises_dict.find(
    (ex: any) => ex.name.toLowerCase() === name.toLowerCase()
  );

  useEffect(() => {
    loadHistory();
  }, []);

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

  const handleAddSet = () => {
    if (currentSet.reps > 0 && currentSet.weight >= 0) {
      setSessionSets([...sessionSets, { ...currentSet, completed: false }]);
      setCurrentSet({ ...currentSet, reps: 8 });
    }
  };

  const handleCompleteSet = (index: number) => {
    const set = sessionSets[index];
    if (!set) return;
    const updated = [...sessionSets];
    updated[index] = { ...set, completed: true };
    setSessionSets(updated);
    startRestTimer();
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
      `You completed ${sessionSets.length} sets.\nVolume: ${totalVolume}kg\nMax: ${maxWeight}kg\n\nSave this session?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Save',
          style: 'default',
          onPress: () => {
            const session: SessionData = {
              id: Date.now().toString(),
              exerciseName: name,
              date: new Date(),
              sets: [...sessionSets],
              notes: sessionNotes,
            };
            saveToHistory(session);
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

  if (!exercise) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Exercise not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{name}</Text>
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
                  <Text style={styles.infoValue}>{exercise.equipment || 'None'}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Ionicons name="body" size={20} color="#FF5722" />
                  <Text style={styles.infoLabel}>Type</Text>
                  <Text style={styles.infoValue}>{exercise.category}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Ionicons name="flame" size={20} color="#F44336" />
                  <Text style={styles.infoLabel}>Difficulty</Text>
                  <Text style={styles.infoValue}>Medium</Text>
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Muscles Worked</Text>
              <View style={styles.muscleTags}>
                {exercise.muscleGroups?.map((muscle: string, idx: number) => (
                  <TouchableOpacity key={idx} style={styles.muscleTag}>
                    <Text style={styles.muscleTagText}>{muscle}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Instructions</Text>
              <View style={styles.instructionsCard}>
                <Text style={styles.instructionsText}>{exercise.instructions}</Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Pro Tips</Text>
              <View style={styles.tipCard}>
                <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                <Text style={styles.tipText}>Keep your core tight throughout the movement</Text>
              </View>
              <View style={styles.tipCard}>
                <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                <Text style={styles.tipText}>Control the negative phase of each rep</Text>
              </View>
              <View style={styles.tipCard}>
                <Ionicons name="warning" size={20} color="#FF9800" />
                <Text style={styles.tipText}>Avoid locking out your joints at the top</Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Common Mistakes</Text>
              <View style={styles.tipCard}>
                <Ionicons name="close-circle" size={20} color="#F44336" />
                <Text style={styles.tipText}>Arching your lower back excessively</Text>
              </View>
              <View style={styles.tipCard}>
                <Ionicons name="close-circle" size={20} color="#F44336" />
                <Text style={styles.tipText}>Bouncing the weight off your chest</Text>
              </View>
            </View>
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
                <Text style={styles.statValue}>{getTotalVolume()}</Text>
                <Text style={styles.statLabel}>Volume (kg)</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{getPersonalBest()}kg</Text>
                <Text style={styles.statLabel}>Max Weight</Text>
              </View>
            </View>

            <View style={styles.currentSetCard}>
              <Text style={styles.currentSetTitle}>Current Set</Text>
              <View style={styles.setInputsRow}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Weight (kg)</Text>
                  <View style={styles.inputRow}>
                    <TouchableOpacity
                      style={styles.inputBtn}
                      onPress={() => setCurrentSet(prev => ({ ...prev, weight: Math.max(0, prev.weight - 2.5) }))}
                    >
                      <Ionicons name="remove" size={20} color="#FFF" />
                    </TouchableOpacity>
                    <Text style={styles.inputValue}>{currentSet.weight}</Text>
                    <TouchableOpacity
                      style={styles.inputBtn}
                      onPress={() => setCurrentSet(prev => ({ ...prev, weight: prev.weight + 2.5 }))}
                    >
                      <Ionicons name="add" size={20} color="#FFF" />
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Reps</Text>
                  <View style={styles.inputRow}>
                    <TouchableOpacity
                      style={styles.inputBtn}
                      onPress={() => setCurrentSet(prev => ({ ...prev, reps: Math.max(1, prev.reps - 1) }))}
                    >
                      <Ionicons name="remove" size={20} color="#FFF" />
                    </TouchableOpacity>
                    <Text style={styles.inputValue}>{currentSet.reps}</Text>
                    <TouchableOpacity
                      style={styles.inputBtn}
                      onPress={() => setCurrentSet(prev => ({ ...prev, reps: prev.reps + 1 }))}
                    >
                      <Ionicons name="add" size={20} color="#FFF" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
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
                      <Text style={styles.setDetails}>{set.weight}kg × {set.reps} reps</Text>
                    </View>
                    {!set.completed ? (
                      <TouchableOpacity
                        style={styles.completeBtn}
                        onPress={() => handleCompleteSet(index)}
                      >
                        <Ionicons name="checkmark" size={20} color="#FFF" />
                      </TouchableOpacity>
                    ) : (
                      <View style={styles.completedBadge}>
                        <Ionicons name="checkmark-done" size={20} color="#4CAF50" />
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )}

            <TouchableOpacity style={styles.finishBtn} onPress={handleFinishSession}>
              <Text style={styles.finishBtnText}>Finish Session</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.finishBtn, isAIMode && styles.aiModeActive]}
              onPress={() => setIsAIMode(true)}
            >
              <Ionicons name="analytics" size={20} color="#FFF" />
              <Text style={styles.finishBtnText}>Start AI Tracking</Text>
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 'history' && (
          <View style={styles.historySection}>
            {history.length === 0 ? (
              <View style={styles.emptyHistory}>
                <Ionicons name="calendar-outline" size={64} color="#CCC" />
                <Text style={styles.emptyHistoryTitle}>No History Yet</Text>
                <Text style={styles.emptyHistoryText}>
                  Complete your first session to see your progress here
                </Text>
              </View>
            ) : (
              <FlatList
                data={history}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => {
                  const totalVolume = item.sets.reduce((total, set) => total + set.reps * set.weight, 0);
                  const maxWeight = Math.max(...item.sets.map(s => s.weight));
                  const dateStr = item.date instanceof Date 
                    ? item.date.toLocaleDateString() 
                    : new Date(item.date).toLocaleDateString();
                  
                  return (
                    <View style={styles.historyCard}>
                      <View style={styles.historyCardHeader}>
                        <Text style={styles.historyExerciseName}>{item.exerciseName}</Text>
                        <Text style={styles.historyDate}>{dateStr}</Text>
                      </View>
                      
                      <View style={styles.historyStatsRow}>
                        <View style={styles.historyStat}>
                          <Ionicons name="layers" size={16} color="#4CAF50" />
                          <Text style={styles.historyStatText}>{item.sets.length} sets</Text>
                        </View>
                        <View style={styles.historyStat}>
                          <Ionicons name="fitness" size={16} color="#FF5722" />
                          <Text style={styles.historyStatText}>{totalVolume}kg vol</Text>
                        </View>
                        <View style={styles.historyStat}>
                          <Ionicons name="trending-up" size={16} color="#2196F3" />
                          <Text style={styles.historyStatText}>{maxWeight}kg max</Text>
                        </View>
                      </View>
                      
                      <View style={styles.historySetsRow}>
                        {item.sets.slice(0, 5).map((set, idx) => (
                          <View key={idx} style={styles.historySetBadge}>
                            <Text style={styles.historySetText}>{set.weight}kg</Text>
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
              />
            )}
          </View>
        )}
      </ScrollView>

      <Modal visible={isAIMode} animationType="slide">
        <AICameraView
          isActive={isAIMode}
          pose={aiPose}
          repState={aiRepState}
          currentAngle={aiCurrentAngle}
          formFeedback={aiFormFeedback}
          exercise={name}
          onClose={() => {
            setIsAIMode(false);
            setAiRepOverride(0);
          }}
          onRepAdjust={(adjustment: number) => {
            setAiRepOverride(prev => prev + adjustment);
          }}
        />
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
    justifyContent: 'space-around',
  },
  infoItem: {
    alignItems: 'center',
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
    marginTop: 2,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  muscleTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  muscleTag: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  muscleTagText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '500',
  },
  instructionsCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
  },
  instructionsText: {
    fontSize: 14,
    color: '#444',
    lineHeight: 22,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  tipText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: '#444',
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
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4CAF50',
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  currentSetCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  currentSetTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  setInputsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  inputGroup: {
    flex: 1,
    marginHorizontal: 4,
  },
  inputLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputBtn: {
    backgroundColor: '#4CAF50',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
    width: 80,
    textAlign: 'center',
  },
  addSetBtn: {
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addSetBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  restTimer: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  restTitle: {
    fontSize: 14,
    color: '#888',
  },
  restTime: {
    fontSize: 48,
    fontWeight: '700',
    color: '#4CAF50',
    marginVertical: 8,
  },
  skipRestBtn: {
    marginTop: 8,
  },
  skipRestText: {
    color: '#888',
    fontSize: 14,
  },
  setsList: {
    marginBottom: 16,
  },
  setsListTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  setCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
  },
  setCardCompleted: {
    backgroundColor: '#E8F5E9',
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
    backgroundColor: '#4CAF50',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedBadge: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  finishBtn: {
    backgroundColor: '#1A1A1A',
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
  },
  finishBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  aiModeActive: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  historySection: {
    padding: 16,
  },
  emptyHistory: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
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
    paddingBottom: 20,
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
    alignItems: 'center',
    marginBottom: 12,
  },
  historyExerciseName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  historyDate: {
    fontSize: 13,
    color: '#888',
  },
  historyStatsRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  historyStat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  historyStatText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 6,
  },
  historySetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  historySetBadge: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  historySetText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  historySetReps: {
    fontSize: 10,
    color: '#888',
  },
  historySetMore: {
    backgroundColor: '#E8F5E9',
  },
  historyNotes: {
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
    textAlign: 'center',
    marginTop: 40,
  },
});

export { ExerciseScreen };
export default ExerciseScreen;

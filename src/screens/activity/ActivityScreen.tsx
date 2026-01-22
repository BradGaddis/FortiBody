import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { activityService, DailyActivity, ActivityGoal } from '../../services/activity/ActivityService';
import { hapticSelection, hapticSuccess } from '../../utils/haptics';

const ActivityScreen: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [todayActivity, setTodayActivity] = useState<DailyActivity | null>(null);
  const [weeklyStats, setWeeklyStats] = useState<any>(null);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [stepGoal, setStepGoal] = useState('10000');
  const [calorieGoal, setCalorieGoal] = useState('500');
  const [distanceGoal, setDistanceGoal] = useState('5');
  const [activeMinutesGoal, setActiveMinutesGoal] = useState('60');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [activity, weekly] = await Promise.all([
        activityService.getTodayActivity(),
        activityService.getWeeklyStats(),
      ]);

      setTodayActivity(activity);
      setWeeklyStats(weekly);
      
      const goal = await activityService.getActivityGoal();
      setStepGoal(goal.steps.toString());
      setCalorieGoal(goal.calories.toString());
      setDistanceGoal(goal.distance.toString());
      setActiveMinutesGoal(goal.activeMinutes.toString());
    } catch (error) {
      console.error('Failed to load activity data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleGoalSave = async () => {
    hapticSuccess();
    await activityService.setActivityGoal({
      steps: parseInt(stepGoal) || 10000,
      calories: parseInt(calorieGoal) || 500,
      distance: parseFloat(distanceGoal) || 5,
      activeMinutes: parseInt(activeMinutesGoal) || 60,
    });
    setShowGoalModal(false);
    loadData();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Activity</Text>
        <Text style={styles.subtitle}>Track your daily movement</Text>
      </View>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#E8F5E9' }]}>
                <Ionicons name="footsteps" size={24} color="#4CAF50" />
              </View>
              <Text style={styles.statValue}>
                {todayActivity?.steps.toLocaleString() || '0'}
              </Text>
              <Text style={styles.statLabel}>Steps</Text>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${todayActivity?.goalProgress.steps || 0}%`,
                      backgroundColor: '#4CAF50',
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {todayActivity?.goalProgress.steps || 0}% of goal
              </Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#FFF3E0' }]}>
                <Ionicons name="flame" size={24} color="#FF9800" />
              </View>
              <Text style={styles.statValue}>
                {todayActivity?.calories.toLocaleString() || '0'}
              </Text>
              <Text style={styles.statLabel}>Calories</Text>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${todayActivity?.goalProgress.calories || 0}%`,
                      backgroundColor: '#FF9800',
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {todayActivity?.goalProgress.calories || 0}% of goal
              </Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#E3F2FD' }]}>
                <Ionicons name="map" size={24} color="#2196F3" />
              </View>
              <Text style={styles.statValue}>
                {todayActivity ? activityService.formatDistance(todayActivity.distance) : '0 km'}
              </Text>
              <Text style={styles.statLabel}>Distance</Text>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${todayActivity?.goalProgress.distance || 0}%`,
                      backgroundColor: '#2196F3',
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {todayActivity?.goalProgress.distance || 0}% of goal
              </Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#F3E5F5' }]}>
                <Ionicons name="timer" size={24} color="#9C27B0" />
              </View>
              <Text style={styles.statValue}>
                {todayActivity ? activityService.formatDuration(todayActivity.activeMinutes) : '0m'}
              </Text>
              <Text style={styles.statLabel}>Active Time</Text>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${todayActivity?.goalProgress.activeMinutes || 0}%`,
                      backgroundColor: '#9C27B0',
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {todayActivity?.goalProgress.activeMinutes || 0}% of goal
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.goalButton}
            onPress={() => setShowGoalModal(true)}
          >
            <Ionicons name="settings-outline" size={20} color="#4CAF50" />
            <Text style={styles.goalButtonText}>Edit Goals</Text>
          </TouchableOpacity>

          {weeklyStats && (
            <View style={styles.weeklyCard}>
              <Text style={styles.weeklyTitle}>This Week</Text>
              <View style={styles.weeklyRow}>
                <View style={styles.weeklyItem}>
                  <Text style={styles.weeklyValue}>
                    {weeklyStats.totalSteps.toLocaleString()}
                  </Text>
                  <Text style={styles.weeklyLabel}>Total Steps</Text>
                </View>
                <View style={styles.weeklyItem}>
                  <Text style={styles.weeklyValue}>
                    {weeklyStats.totalCalories.toLocaleString()}
                  </Text>
                  <Text style={styles.weeklyLabel}>Total Calories</Text>
                </View>
              </View>
              <View style={styles.weeklyRow}>
                <View style={styles.weeklyItem}>
                  <Text style={styles.weeklyValue}>
                    {activityService.formatDistance(weeklyStats.totalDistance)}
                  </Text>
                  <Text style={styles.weeklyLabel}>Total Distance</Text>
                </View>
                <View style={styles.weeklyItem}>
                  <Text style={styles.weeklyValue}>
                    {weeklyStats.averageSteps.toLocaleString()}
                  </Text>
                  <Text style={styles.weeklyLabel}>Daily Avg Steps</Text>
                </View>
              </View>
            </View>
          )}

          <View style={styles.bottomPadding} />
        </View>
      </ScrollView>

      <Modal visible={showGoalModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Activity Goals</Text>

            <Text style={styles.inputLabel}>Daily Step Goal</Text>
            <TextInput
              style={styles.input}
              value={stepGoal}
              onChangeText={setStepGoal}
              keyboardType="number-pad"
            />

            <Text style={styles.inputLabel}>Calorie Burn Goal</Text>
            <TextInput
              style={styles.input}
              value={calorieGoal}
              onChangeText={setCalorieGoal}
              keyboardType="number-pad"
            />

            <Text style={styles.inputLabel}>Distance Goal (km)</Text>
            <TextInput
              style={styles.input}
              value={distanceGoal}
              onChangeText={setDistanceGoal}
              keyboardType="decimal-pad"
            />

            <Text style={styles.inputLabel}>Active Minutes Goal</Text>
            <TextInput
              style={styles.input}
              value={activeMinutesGoal}
              onChangeText={setActiveMinutesGoal}
              keyboardType="number-pad"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowGoalModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSaveBtn} onPress={handleGoalSave}>
                <Text style={styles.modalSaveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  scrollContent: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  statLabel: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E8E8E8',
    borderRadius: 3,
    marginTop: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#888',
    marginTop: 8,
    textAlign: 'center',
  },
  goalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
    marginBottom: 16,
  },
  goalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
  },
  weeklyCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
  },
  weeklyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  weeklyRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  weeklyItem: {
    flex: 1,
  },
  weeklyValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  weeklyLabel: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  bottomPadding: {
    height: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 24,
    width: '85%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
    marginTop: 4,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 14,
    fontSize: 18,
    color: '#1A1A1A',
    marginBottom: 12,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  modalSaveBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
  },
  modalSaveText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
});

export default ActivityScreen;

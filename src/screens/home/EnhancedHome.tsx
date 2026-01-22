import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BodyDiagram from '../../components/fitness/BodyDiagram';
import FastingStatusCard from '../../components/nutrition/FastingStatusCard';
import streakService from '../../services/streak/StreakService';
import { nutritionService } from '../../services/nutrition/NutritionService';
import { DEFAULT_NUTRITION_GOAL } from '../../services/nutrition/types';
import UserProfileService from '../../services/user/UserProfileService';
import { hapticSelection } from '../../utils/haptics';

const { width: screenWidth } = Dimensions.get('window');

const EnhancedHomeScreen = () => {
  const navigation = useNavigation();
  const [streak, setStreak] = useState<number>(0);
  const [userName, setUserName] = useState<string>('Athlete');
  const [caloriesConsumed, setCaloriesConsumed] = useState<number>(0);
  const [calorieGoal, setCalorieGoal] = useState<number>(2000);
  const [caloriesRemaining, setCaloriesRemaining] = useState<number>(2000);

  const loadDashboardData = useCallback(async () => {
    try {
      const streakData = await streakService.getCurrentStreak();
      setStreak(streakData);

      const profileService = new UserProfileService();
      const profile = await profileService.getActiveProfile();
      setUserName(profile?.name || 'Athlete');

      try {
        const todayNutrition = await nutritionService.getDailyNutrition(new Date());
        setCaloriesConsumed(todayNutrition.totalCalories);
      } catch {
        setCaloriesConsumed(0);
      }

      try {
        const goal = await nutritionService.getNutritionGoal();
        const goalCalories = goal?.dailyCalories || DEFAULT_NUTRITION_GOAL.dailyCalories;
        setCalorieGoal(goalCalories);
        setCaloriesRemaining(Math.max(0, goalCalories - caloriesConsumed));
      } catch {
        setCalorieGoal(DEFAULT_NUTRITION_GOAL.dailyCalories);
        setCaloriesRemaining(DEFAULT_NUTRITION_GOAL.dailyCalories - caloriesConsumed);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  useFocusEffect(
    useCallback(() => {
      loadDashboardData();
    }, [loadDashboardData])
  );

  const getStreakColor = () => {
    if (streak >= 30) return '#FF6B6B';
    if (streak >= 14) return '#C0C0C0';
    if (streak >= 7) return '#CD7F32';
    return '#666666';
  };

  const handleMuscleSelect = (muscleGroups: string[]) => {
    if (muscleGroups.length > 0) {
      (navigation as any).navigate('ExercisesStack', {
        screen: 'ExerciseLibrary',
        params: { muscleGroup: muscleGroups[0] },
      });
    }
  };

  const renderStreakCard = () => (
    <View style={[styles.card, { backgroundColor: getStreakColor() }]}>
      <Text style={styles.cardTitle}>🔥 Current Streak</Text>
      <Text style={styles.streakNumber}>{streak} days</Text>
      <Text style={styles.cardSubtitle}>Keep it up!</Text>
    </View>
  );

  const renderCaloriesRemaining = () => {
    const isUnderGoal = caloriesRemaining > 0;
    const remainingColor = isUnderGoal ? '#4CAF50' : '#FF6B6B';
    const remainingText = isUnderGoal ? 'remaining' : 'over goal';

    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🍎 Calories Today</Text>
        <View style={styles.caloriesContent}>
          <View style={styles.caloriesMain}>
            <Text style={[styles.caloriesNumber, { color: remainingColor }]}>
              {caloriesRemaining}
            </Text>
            <Text style={styles.caloriesLabel}>{remainingText}</Text>
          </View>
          <View style={styles.caloriesDetails}>
            <View style={styles.calorieRow}>
              <Text style={styles.calorieLabel}>Consumed</Text>
              <Text style={styles.calorieValue}>{caloriesConsumed}</Text>
            </View>
            <View style={styles.calorieRow}>
              <Text style={styles.calorieLabel}>Goal</Text>
              <Text style={styles.calorieValue}>{calorieGoal}</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity
          style={styles.addFoodButton}
          onPress={() => {
            hapticSelection();
            (navigation as any).navigate('NutritionStack', {
              screen: 'AddFood',
            });
          }}
        >
          <Text style={styles.addFoodText}>+ Add Food</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderQuickActions = () => (
    <View style={styles.quickActions}>
      <TouchableOpacity
        style={[styles.quickActionButton, { backgroundColor: '#007AFF' }]}
        onPress={() => {
          hapticSelection();
          (navigation as any).navigate('ExercisesStack', {
            screen: 'ExerciseLibrary',
          });
        }}
      >
        <Text style={styles.quickActionText}>🏋 Exercise Library</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.quickActionButton, { backgroundColor: '#28a745' }]}
        onPress={() => {
          hapticSelection();
          (navigation as any).navigate('ExercisesStack', {
            screen: 'Favorites',
          });
        }}
      >
        <Text style={styles.quickActionText}>⭐ Favorites</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.quickActionButton, { backgroundColor: '#CD7F32' }]}
        onPress={() => {
          hapticSelection();
          (navigation as any).navigate('ExercisesStack', {
            screen: 'CreateExercise',
          });
        }}
      >
        <Text style={styles.quickActionText}>➕ Create Exercise</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome back, {userName}!</Text>
        <Text style={styles.subtitle}>Ready to crush your goals today?</Text>
      </View>

      <ScrollView style={styles.content}>
        {renderStreakCard()}
        {renderCaloriesRemaining()}

        <FastingStatusCard onPress={() => {
          (navigation as any).navigate('NutritionStack', {
            screen: 'Fasting',
          });
        }} />

        <View style={styles.bodyDiagramCard}>
          <Text style={styles.cardTitle}>🎯 Quick Access</Text>
          <Text style={styles.cardSubtitle}>Tap a muscle group to find exercises</Text>
          <View style={styles.bodyDiagramContainer}>
            <BodyDiagram onMuscleSelect={handleMuscleSelect} />
          </View>
        </View>

        {renderQuickActions()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    paddingTop: 40,
    alignItems: 'center',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  streakNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  caloriesContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  caloriesMain: {
    alignItems: 'center',
  },
  caloriesNumber: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  caloriesLabel: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  caloriesDetails: {
    alignItems: 'flex-end',
  },
  calorieRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  calorieLabel: {
    fontSize: 14,
    color: '#666',
    width: 80,
    textAlign: 'right',
    marginRight: 10,
  },
  calorieValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  addFoodButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  addFoodText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingBottom: 30,
    paddingTop: 20,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  quickActionButton: {
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 20,
    minWidth: 100,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  quickActionText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  bodyDiagramCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    alignItems: 'center',
  },
  bodyDiagramContainer: {
    marginTop: 15,
  },
});

export default EnhancedHomeScreen;

import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
import UserProfileService from '../../services/user/UserProfileService';
import { hapticSelection, hapticMedium } from '../../utils/haptics';

const { width: screenWidth } = Dimensions.get('window');

const EnhancedHomeScreen = () => {
  const navigation = useNavigation();
  const [streak, setStreak] = useState<number>(0);
  const [totalWorkouts, setTotalWorkouts] = useState<number>(0);
  const [userName, setUserName] = useState<string>('Athlete');

  const loadDashboardData = useCallback(async () => {
    try {
      const [streakData, workoutsData] = await Promise.all([
        streakService.getCurrentStreak(),
        AsyncStorage.getItem('@total_workouts'),
      ]);

      setStreak(streakData);
      setTotalWorkouts(parseInt(workoutsData || '0'));

      const profileService = new UserProfileService();
      const profile = await profileService.getActiveProfile();
      setUserName(profile?.name || 'Athlete');
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
    if (streak >= 30) return '#FF6B6B'; // Gold
    if (streak >= 14) return '#C0C0C0'; // Silver
    if (streak >= 7) return '#CD7F32'; // Bronze
    return '#666666'; // Default
  };

  const getLevel = () => {
    if (totalWorkouts >= 100) return { rank: 'Elite', color: '#FF6B6B' };
    if (totalWorkouts >= 50) return { rank: 'Advanced', color: '#C0C0C0' };
    if (totalWorkouts >= 25) return { rank: 'Intermediate', color: '#CD7F32' };
    if (totalWorkouts >= 10) return { rank: 'Beginner', color: '#28a745' };
    return { rank: 'Novice', color: '#6c757d' };
  };

  const level = getLevel();

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

  const renderStatsCard = () => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>📊 Your Stats</Text>
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: level.color }]}>
            {totalWorkouts}
          </Text>
          <Text style={styles.statLabel}>Total Workouts</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: level.color }]}>
            {level.rank}
          </Text>
          <Text style={styles.statLabel}>Current Level</Text>
        </View>
      </View>
    </View>
  );

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
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome back, {userName}!</Text>
        <Text style={styles.subtitle}>Ready to crush your goals today?</Text>
      </View>

      <ScrollView style={styles.content}>
        {renderStreakCard()}
        {renderStatsCard()}
        
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
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

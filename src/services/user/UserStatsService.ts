import 'react-native-get-random-values';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';

export interface UserStats {
  totalWorkouts: number;
  currentStreak: number;
  longestStreak: number;
  totalExercises: number;
  activeGoals: number;
  totalCaloriesBurned: number;
  totalMinutesExercised: number;
  lastWorkoutDate: string | null;
  memberSince: string;
}

const STATS_KEY = '@fortibody_user_stats';

const defaultStats: UserStats = {
  totalWorkouts: 0,
  currentStreak: 0,
  longestStreak: 0,
  totalExercises: 0,
  activeGoals: 3,
  totalCaloriesBurned: 0,
  totalMinutesExercised: 0,
  lastWorkoutDate: null,
  memberSince: new Date().toISOString(),
};

class UserStatsService {
  private static instance: UserStatsService;

  private constructor() {}

  static getInstance(): UserStatsService {
    if (!UserStatsService.instance) {
      UserStatsService.instance = new UserStatsService();
    }
    return UserStatsService.instance;
  }

  async getStats(): Promise<UserStats> {
    try {
      const data = await AsyncStorage.getItem(STATS_KEY);
      if (data) {
        return JSON.parse(data);
      }
      await this.saveStats(defaultStats);
      return defaultStats;
    } catch (error) {
      console.error('Error getting user stats:', error);
      return defaultStats;
    }
  }

  async saveStats(stats: UserStats): Promise<void> {
    try {
      await AsyncStorage.setItem(STATS_KEY, JSON.stringify(stats));
    } catch (error) {
      console.error('Error saving user stats:', error);
    }
  }

  async incrementWorkout(
    duration: number,
    caloriesBurned: number
  ): Promise<void> {
    const stats = await this.getStats();
    const today = new Date().toISOString().split('T')[0];
    const lastWorkout = stats.lastWorkoutDate;

    let newStreak = stats.currentStreak;
    if (lastWorkout) {
      const lastDate = new Date(lastWorkout);
      const todayDate = new Date(today);
      const diffDays = Math.floor(
        (todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diffDays === 0) {
        // Same day, keep streak
      } else if (diffDays === 1) {
        // Consecutive day, increment streak
        newStreak += 1;
      } else {
        // Missed days, reset streak
        newStreak = 1;
      }
    } else {
      newStreak = 1;
    }

    const updatedStats: UserStats = {
      ...stats,
      totalWorkouts: stats.totalWorkouts + 1,
      currentStreak: newStreak,
      longestStreak: Math.max(stats.longestStreak, newStreak),
      totalMinutesExercised: stats.totalMinutesExercised + duration,
      totalCaloriesBurned: stats.totalCaloriesBurned + caloriesBurned,
      lastWorkoutDate: today,
    };

    await this.saveStats(updatedStats);
  }

  async incrementExerciseCount(): Promise<void> {
    const stats = await this.getStats();
    const updatedStats: UserStats = {
      ...stats,
      totalExercises: stats.totalExercises + 1,
    };
    await this.saveStats(updatedStats);
  }

  async updateActiveGoals(count: number): Promise<void> {
    const stats = await this.getStats();
    const updatedStats: UserStats = {
      ...stats,
      activeGoals: count,
    };
    await this.saveStats(updatedStats);
  }

  async resetStats(): Promise<void> {
    await this.saveStats(defaultStats);
  }
}

export const userStatsService = UserStatsService.getInstance();
export default userStatsService;

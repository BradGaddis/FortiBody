import AsyncStorage from '@react-native-async-storage/async-storage';
import { Pedometer } from 'expo-sensors';

export interface ActivityData {
  steps: number;
  calories: number;
  distance: number;
  activeMinutes: number;
  date: string;
}

export interface ActivityGoal {
  steps: number;
  calories: number;
  distance: number;
  activeMinutes: number;
}

export interface DailyActivity {
  date: string;
  steps: number;
  calories: number;
  distance: number;
  activeMinutes: number;
  goal: ActivityGoal;
  goalProgress: {
    steps: number;
    calories: number;
    distance: number;
    activeMinutes: number;
  };
}

const ACTIVITY_DATA_KEY = '@fortibody_activity_data';
const ACTIVITY_GOAL_KEY = '@fortibody_activity_goal';

const DEFAULT_GOAL: ActivityGoal = {
  steps: 10000,
  calories: 500,
  distance: 5,
  activeMinutes: 60,
};

const STEPS_PER_CALORIE = 0.04;
const STEPS_PER_KM = 1250;

class ActivityService {
  private static instance: ActivityService;
  private pedometerSubscription: any = null;

  private constructor() {}

  static getInstance(): ActivityService {
    if (!ActivityService.instance) {
      ActivityService.instance = new ActivityService();
    }
    return ActivityService.instance;
  }

  async getTodayActivity(): Promise<DailyActivity> {
    const today = new Date().toISOString().split('T')[0];
    const data = await this.getActivityByDate(today);
    const goal = await this.getActivityGoal();
    
    return {
      ...data,
      date: today,
      goal,
      goalProgress: this.calculateGoalProgress(data, goal),
    };
  }

  async getActivityByDate(date: string): Promise<ActivityData> {
    try {
      const data = await AsyncStorage.getItem(ACTIVITY_DATA_KEY);
      const parsed = data ? JSON.parse(data) : {};
      return parsed[date] || {
        steps: 0,
        calories: 0,
        distance: 0,
        activeMinutes: 0,
        date,
      };
    } catch {
      return {
        steps: 0,
        calories: 0,
        distance: 0,
        activeMinutes: 0,
        date,
      };
    }
  }

  async getActivityRange(startDate: string, endDate: string): Promise<DailyActivity[]> {
    const activities: DailyActivity[] = [];
    const goal = await this.getActivityGoal();
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const data = await this.getActivityByDate(dateStr);
      activities.push({
        ...data,
        date: dateStr,
        goal,
        goalProgress: this.calculateGoalProgress(data, goal),
      });
    }
    
    return activities;
  }

  async saveActivityData(data: ActivityData): Promise<void> {
    try {
      const allData = await AsyncStorage.getItem(ACTIVITY_DATA_KEY);
      const parsed = allData ? JSON.parse(allData) : {};
      parsed[data.date] = data;
      await AsyncStorage.setItem(ACTIVITY_DATA_KEY, JSON.stringify(parsed));
    } catch (error) {
      console.error('Failed to save activity data:', error);
    }
  }

  async updateSteps(date: string, steps: number): Promise<void> {
    const calories = Math.round(steps * STEPS_PER_CALORIE);
    const distance = Math.round((steps / STEPS_PER_KM) * 100) / 100;
    
    const existing = await this.getActivityByDate(date);
    await this.saveActivityData({
      ...existing,
      steps,
      calories,
      distance,
    });
  }

  async getActivityGoal(): Promise<ActivityGoal> {
    try {
      const data = await AsyncStorage.getItem(ACTIVITY_GOAL_KEY);
      return data ? JSON.parse(data) : DEFAULT_GOAL;
    } catch {
      return DEFAULT_GOAL;
    }
  }

  async setActivityGoal(goal: ActivityGoal): Promise<void> {
    try {
      await AsyncStorage.setItem(ACTIVITY_GOAL_KEY, JSON.stringify(goal));
    } catch (error) {
      console.error('Failed to save activity goal:', error);
    }
  }

  async isPedometerAvailable(): Promise<boolean> {
    return await Pedometer.isAvailableAsync();
  }

  async getStepCount(start: Date, end: Date): Promise<number> {
    try {
      const result = await Pedometer.getStepCountAsync(start, end);
      return result?.steps || 0;
    } catch {
      return 0;
    }
  }

  startPedometerSubscription(callback: (steps: number) => void): void {
    if (this.pedometerSubscription) {
      this.stopPedometerSubscription();
    }

    this.pedometerSubscription = Pedometer.watchStepCount((result) => {
      callback(result.steps);
    });
  }

  stopPedometerSubscription(): void {
    if (this.pedometerSubscription) {
      this.pedometerSubscription.remove();
      this.pedometerSubscription = null;
    }
  }

  calculateGoalProgress(data: ActivityData, goal: ActivityGoal): ActivityGoal {
    return {
      steps: goal.steps > 0 ? Math.min(Math.round((data.steps / goal.steps) * 100), 100) : 0,
      calories: goal.calories > 0 ? Math.min(Math.round((data.calories / goal.calories) * 100), 100) : 0,
      distance: goal.distance > 0 ? Math.min(Math.round((data.distance / goal.distance) * 100), 100) : 0,
      activeMinutes: goal.activeMinutes > 0 ? Math.min(Math.round((data.activeMinutes / goal.activeMinutes) * 100), 100) : 0,
    };
  }

  formatDuration(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h > 0) {
      return `${h}h ${m}m`;
    }
    return `${m}m`;
  }

  formatDistance(km: number): string {
    if (km >= 1) {
      return `${km.toFixed(2)} km`;
    }
    return `${Math.round(km * 1000)} m`;
  }

  async getWeeklyStats(): Promise<{
    totalSteps: number;
    totalCalories: number;
    totalDistance: number;
    averageSteps: number;
    averageCalories: number;
  }> {
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const activities = await this.getActivityRange(
      weekAgo.toISOString().split('T')[0],
      today.toISOString().split('T')[0]
    );

    const totals = activities.reduce(
      (acc, day) => ({
        totalSteps: acc.totalSteps + day.steps,
        totalCalories: acc.totalCalories + day.calories,
        totalDistance: acc.totalDistance + day.distance,
      }),
      { totalSteps: 0, totalCalories: 0, totalDistance: 0 }
    );

    const validDays = activities.filter(d => d.steps > 0).length || 1;

    return {
      ...totals,
      averageSteps: Math.round(totals.totalSteps / validDays),
      averageCalories: Math.round(totals.totalCalories / validDays),
    };
  }
}

export const activityService = ActivityService.getInstance();
export default activityService;

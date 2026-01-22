import AsyncStorage from '@react-native-async-storage/async-storage';

const LAST_MEAL_KEY = '@last_meal_time';
const FASTING_TARGET_HOURS = 16; // Default 16:8 fasting

export interface FastingStatus {
  isFasting: boolean;
  lastMealTime: Date | null;
  elapsedTime: string;
  progress: number; // 0-100 percentage of fasting goal
  hoursFasted: number;
  targetHours: number;
  isGoalReached: boolean;
}

class FastingService {
  async getLastMealTime(): Promise<Date | null> {
    try {
      const stored = await AsyncStorage.getItem(LAST_MEAL_KEY);
      if (stored) {
        return new Date(stored);
      }
    } catch (error) {
      console.error('Error getting last meal time:', error);
    }
    return null;
  }

  async setLastMealTime(date: Date = new Date()): Promise<void> {
    try {
      await AsyncStorage.setItem(LAST_MEAL_KEY, date.toISOString());
    } catch (error) {
      console.error('Error setting last meal time:', error);
    }
  }

  async clearLastMealTime(): Promise<void> {
    try {
      await AsyncStorage.removeItem(LAST_MEAL_KEY);
    } catch (error) {
      console.error('Error clearing last meal time:', error);
    }
  }

  async getFastingStatus(targetHours: number = FASTING_TARGET_HOURS): Promise<FastingStatus> {
    const lastMealTime = await this.getLastMealTime();
    
    if (!lastMealTime) {
      return {
        isFasting: false,
        lastMealTime: null,
        elapsedTime: '00:00:00',
        progress: 0,
        hoursFasted: 0,
        targetHours,
        isGoalReached: false,
      };
    }

    const now = new Date();
    const diff = now.getTime() - lastMealTime.getTime();
    const hoursFasted = diff / (1000 * 60 * 60);
    const minutesFasted = (hoursFasted % 1) * 60;
    const secondsFasted = ((minutesFasted % 1) * 60);
    
    const totalHours = Math.floor(hoursFasted);
    const totalMinutes = Math.floor(minutesFasted);
    const totalSeconds = Math.floor(secondsFasted);

    const elapsedTime = `${totalHours.toString().padStart(2, '0')}:${totalMinutes.toString().padStart(2, '0')}:${totalSeconds.toString().padStart(2, '0')}`;
    
    const progress = Math.min((hoursFasted / targetHours) * 100, 100);
    const isGoalReached = hoursFasted >= targetHours;

    return {
      isFasting: true,
      lastMealTime,
      elapsedTime,
      progress,
      hoursFasted,
      targetHours,
      isGoalReached,
    };
  }

  async recordMeal(): Promise<void> {
    await this.setLastMealTime(new Date());
  }

  async endFasting(): Promise<void> {
    await this.clearLastMealTime();
  }
}

export const fastingService = new FastingService();

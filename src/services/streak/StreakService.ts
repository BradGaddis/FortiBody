import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, AppStateStatus } from 'react-native';

const STREAK_STORAGE_KEY = '@user_streak';

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string;
  totalActivities: number;
}

interface StreakServiceState {
  streakData: StreakData;
  appStateSubscription: { remove: () => void } | null;
}

class StreakService {
  private state: StreakServiceState = {
    streakData: {
      currentStreak: 0,
      longestStreak: 0,
      lastActivityDate: '',
      totalActivities: 0,
    },
    appStateSubscription: null,
  };

  async initialize(): Promise<void> {
    try {
      const streakJson = await AsyncStorage.getItem(STREAK_STORAGE_KEY);
      if (streakJson) {
        this.state.streakData = JSON.parse(streakJson);
      } else {
        this.state.streakData = {
          currentStreak: 0,
          longestStreak: 0,
          lastActivityDate: '',
          totalActivities: 0,
        };
      }
      
      await this.checkAndResetStreak();
      this.startAppStateListener();
    } catch (error) {
      console.error('Failed to initialize streak service:', error);
    }
  }

  private getTodayDate(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private getYesterdayDate(): string {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const year = yesterday.getFullYear();
    const month = String(yesterday.getMonth() + 1).padStart(2, '0');
    const day = String(yesterday.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private async checkAndResetStreak(): Promise<void> {
    const today = this.getTodayDate();
    const lastActivityDate = this.state.streakData.lastActivityDate;
    
    if (!lastActivityDate) {
      return;
    }

    const yesterday = this.getYesterdayDate();

    if (lastActivityDate === today || lastActivityDate === yesterday) {
      return;
    }

    if (lastActivityDate < yesterday) {
      console.log(`🏃 Streak: No activity since ${lastActivityDate}, resetting to 0`);
      this.state.streakData.currentStreak = 0;
      await this.saveStreakData();
    }
  }

  private startAppStateListener(): void {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        this.checkAndResetStreak();
      }
    };
    
    this.state.appStateSubscription = AppState.addEventListener('change', handleAppStateChange);
  }

  private async saveStreakData(): Promise<void> {
    try {
      await AsyncStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(this.state.streakData));
    } catch (error) {
      console.error('Failed to save streak data:', error);
    }
  }

  async recordActivity(): Promise<boolean> {
    try {
      const today = this.getTodayDate();
      const lastActivityDate = this.state.streakData.lastActivityDate;

      const yesterday = this.getYesterdayDate();
      let newStreak = 1;

      if (lastActivityDate === yesterday) {
        newStreak = this.state.streakData.currentStreak + 1;
      } else if (lastActivityDate && lastActivityDate < yesterday) {
        newStreak = 1;
      }

      this.state.streakData.currentStreak = newStreak;
      this.state.streakData.longestStreak = Math.max(this.state.streakData.longestStreak, newStreak);
      this.state.streakData.lastActivityDate = today;
      this.state.streakData.totalActivities += 1;

      await this.saveStreakData();
      console.log(`🏃 Streak: ${newStreak} (last: ${lastActivityDate}, today: ${today})`);

      return true;
    } catch (error) {
      console.error('Failed to record activity:', error);
      return false;
    }
  }

  async getStreak(): Promise<StreakData> {
    await this.checkAndResetStreak();
    return this.state.streakData;
  }

  async getCurrentStreak(): Promise<number> {
    await this.checkAndResetStreak();
    return this.state.streakData.currentStreak;
  }

  async getLongestStreak(): Promise<number> {
    return this.state.streakData.longestStreak;
  }

  async resetStreak(): Promise<void> {
    this.state.streakData = {
      currentStreak: 0,
      longestStreak: 0,
      lastActivityDate: '',
      totalActivities: 0,
    };
    await this.saveStreakData();
  }

  cleanup(): void {
    if (this.state.appStateSubscription) {
      this.state.appStateSubscription.remove();
      this.state.appStateSubscription = null;
    }
  }
}

const streakService = new StreakService();
export default streakService;

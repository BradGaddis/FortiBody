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
      await this.loadStreakData();
      this.startAppStateListener();
    } catch (error) {
      console.error('Failed to initialize streak service:', error);
    }
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private getTodayDate(): string {
    return this.formatDate(new Date());
  }

  private getYesterdayDate(): string {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return this.formatDate(yesterday);
  }

  private async loadStreakData(): Promise<void> {
    try {
      const streakJson = await AsyncStorage.getItem(STREAK_STORAGE_KEY);
      if (streakJson) {
        this.state.streakData = JSON.parse(streakJson);
      }
    } catch (error) {
      console.error('Failed to load streak data:', error);
    }
  }

  private async saveStreakData(): Promise<void> {
    try {
      await AsyncStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(this.state.streakData));
    } catch (error) {
      console.error('Failed to save streak data:', error);
    }
  }

  async recordActivity(): Promise<void> {
    const today = this.getTodayDate();
    const yesterday = this.getYesterdayDate();
    const lastActivityDate = this.state.streakData.lastActivityDate;

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
  }

  async recordActivityWithDate(activityDate: Date): Promise<void> {
    const today = this.getTodayDate();
    const yesterday = this.getYesterdayDate();
    const dateStr = this.formatDate(activityDate);
    const lastActivityDate = this.state.streakData.lastActivityDate;

    if (dateStr !== today && dateStr !== yesterday) {
      return;
    }

    let newStreak = 1;

    if (lastActivityDate === yesterday && dateStr === today) {
      newStreak = this.state.streakData.currentStreak + 1;
    } else if (lastActivityDate === dateStr) {
      newStreak = this.state.streakData.currentStreak;
    } else if (lastActivityDate && lastActivityDate < yesterday) {
      newStreak = 1;
    }

    this.state.streakData.currentStreak = newStreak;
    this.state.streakData.longestStreak = Math.max(this.state.streakData.longestStreak, newStreak);
    this.state.streakData.lastActivityDate = dateStr;
    this.state.streakData.totalActivities += 1;

    await this.saveStreakData();
  }

  async updateActivityCount(count: number): Promise<void> {
    this.state.streakData.totalActivities = count;
    await this.saveStreakData();
  }

  async getStreak(): Promise<StreakData> {
    return this.state.streakData;
  }

  async getCurrentStreak(): Promise<number> {
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

  private startAppStateListener(): void {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        this.loadStreakData();
      }
    };
    
    this.state.appStateSubscription = AppState.addEventListener('change', handleAppStateChange);
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

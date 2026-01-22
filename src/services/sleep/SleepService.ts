import AsyncStorage from '@react-native-async-storage/async-storage';

const SLEEP_LOG_KEY = '@fortibody_sleep_log';
const SLEEP_GOAL_KEY = '@fortibody_sleep_goal';

export interface SleepEntry {
  id: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  quality: 'poor' | 'fair' | 'good' | 'excellent';
  notes?: string;
  createdAt: Date;
}

export interface SleepGoal {
  hours: number;
  bedtime: string;
  waketime: string;
}

export interface SleepSummary {
  averageDuration: number;
  averageQuality: number;
  totalEntries: number;
  streak: number;
  thisWeekAverage: number;
}

const DEFAULT_SLEEP_GOAL: SleepGoal = {
  hours: 8,
  bedtime: '22:00',
  waketime: '06:00',
};

class SleepService {
  private static instance: SleepService;

  private constructor() {}

  static getInstance(): SleepService {
    if (!SleepService.instance) {
      SleepService.instance = new SleepService();
    }
    return SleepService.instance;
  }

  async getSleepGoal(): Promise<SleepGoal> {
    try {
      const data = await AsyncStorage.getItem(SLEEP_GOAL_KEY);
      return data ? JSON.parse(data) : DEFAULT_SLEEP_GOAL;
    } catch {
      return DEFAULT_SLEEP_GOAL;
    }
  }

  async setSleepGoal(goal: SleepGoal): Promise<void> {
    try {
      await AsyncStorage.setItem(SLEEP_GOAL_KEY, JSON.stringify(goal));
    } catch (error) {
      console.error('Failed to set sleep goal:', error);
      throw error;
    }
  }

  async addSleepEntry(entry: Omit<SleepEntry, 'id' | 'createdAt'>): Promise<SleepEntry> {
    const newEntry: SleepEntry = {
      ...entry,
      id: Date.now().toString(),
      createdAt: new Date(),
    };

    try {
      const entries = await this.getAllEntries();
      entries.push(newEntry);
      await AsyncStorage.setItem(SLEEP_LOG_KEY, JSON.stringify(entries));
      return newEntry;
    } catch (error) {
      console.error('Failed to add sleep entry:', error);
      throw error;
    }
  }

  async getAllEntries(): Promise<SleepEntry[]> {
    try {
      const data = await AsyncStorage.getItem(SLEEP_LOG_KEY);
      if (!data) return [];

      return JSON.parse(data).map((entry: any) => ({
        ...entry,
        startTime: new Date(entry.startTime),
        endTime: new Date(entry.endTime),
        createdAt: new Date(entry.createdAt),
      })).sort((a: SleepEntry, b: SleepEntry) => 
        new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
      );
    } catch {
      return [];
    }
  }

  async getEntriesByDateRange(startDate: Date, endDate: Date): Promise<SleepEntry[]> {
    const entries = await this.getAllEntries();
    return entries.filter(entry => {
      const entryDate = new Date(entry.startTime);
      return entryDate >= startDate && entryDate <= endDate;
    });
  }

  async getLastNightSleep(): Promise<SleepEntry | null> {
    const entries = await this.getAllEntries();
    if (entries.length === 0) return null;

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    for (const entry of entries) {
      const entryStart = new Date(entry.startTime);
      if (entryStart >= startOfToday) {
        return entry;
      }
    }
    
    return entries[0];
  }

  async getSleepSummary(days: number = 7): Promise<SleepSummary> {
    const entries = await this.getAllEntries();
    
    if (entries.length === 0) {
      return {
        averageDuration: 0,
        averageQuality: 0,
        totalEntries: 0,
        streak: 0,
        thisWeekAverage: 0,
      };
    }

    const now = new Date();
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - days);
    
    const weekEntries = entries.filter(entry => {
      const entryDate = new Date(entry.startTime);
      return entryDate >= startOfWeek;
    });

    const qualityMap = { poor: 1, fair: 2, good: 3, excellent: 4 };
    const reverseQualityMap = { 1: 'poor', 2: 'fair', 3: 'good', 4: 'excellent' };

    const totalDuration = entries.reduce((sum, entry) => sum + entry.duration, 0);
    const totalQuality = entries.reduce((sum, entry) => sum + qualityMap[entry.quality], 0);
    
    const weekDuration = weekEntries.reduce((sum, entry) => sum + entry.duration, 0);
    const weekQuality = weekEntries.reduce((sum, entry) => sum + qualityMap[entry.quality], 0);

    const streak = this.calculateStreak(entries);

    return {
      averageDuration: entries.length > 0 ? totalDuration / entries.length : 0,
      averageQuality: entries.length > 0 ? totalQuality / entries.length : 0,
      totalEntries: entries.length,
      streak,
      thisWeekAverage: weekEntries.length > 0 ? weekDuration / weekEntries.length : 0,
    };
  }

  private calculateStreak(entries: SleepEntry[]): number {
    if (entries.length === 0) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let streak = 0;
    let checkDate = new Date(today);
    
    while (true) {
      const dayStart = new Date(checkDate);
      const dayEnd = new Date(checkDate);
      dayEnd.setHours(23, 59, 59, 999);

      const hasEntry = entries.some(entry => {
        const entryDate = new Date(entry.startTime);
        return entryDate >= dayStart && entryDate <= dayEnd;
      });

      if (hasEntry) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        if (streak === 0) {
          checkDate.setDate(checkDate.getDate() - 1);
          const yesterdayStart = new Date(checkDate);
          yesterdayStart.setHours(0, 0, 0, 0);
          const yesterdayEnd = new Date(checkDate);
          yesterdayEnd.setHours(23, 59, 59, 999);
          
          const hasYesterday = entries.some(entry => {
            const entryDate = new Date(entry.startTime);
            return entryDate >= yesterdayStart && entryDate <= yesterdayEnd;
          });
          
          if (hasYesterday) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
            continue;
          }
        }
        break;
      }
    }

    return streak;
  }

  async deleteEntry(id: string): Promise<void> {
    try {
      const entries = await this.getAllEntries();
      const filtered = entries.filter(entry => entry.id !== id);
      await AsyncStorage.setItem(SLEEP_LOG_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Failed to delete sleep entry:', error);
      throw error;
    }
  }

  async updateEntry(id: string, updates: Partial<SleepEntry>): Promise<SleepEntry | null> {
    try {
      const entries = await this.getAllEntries();
      const index = entries.findIndex(entry => entry.id === id);
      if (index === -1) return null;

      entries[index] = { ...entries[index], ...updates };
      await AsyncStorage.setItem(SLEEP_LOG_KEY, JSON.stringify(entries));
      return entries[index];
    } catch (error) {
      console.error('Failed to update sleep entry:', error);
      throw error;
    }
  }

  formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  }

  formatTime(date: Date): string {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  }
}

export const sleepService = SleepService.getInstance();
export default sleepService;

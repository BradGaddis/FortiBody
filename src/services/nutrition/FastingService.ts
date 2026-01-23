import AsyncStorage from '@react-native-async-storage/async-storage';

const LAST_MEAL_KEY = '@last_meal_time';
const FASTING_TARGET_HOURS = 16;
const FASTING_SPLIT_KEY = '@fasting_split';

export type FastingSplitId = '16:8' | '18:6' | '20:4' | '23:1' | 'custom' | 'indefinite';

export interface FastingSplit {
  id: FastingSplitId;
  label: string;
  description: string;
  eatingHours: number;
  fastingHours: number | null;
}

export const FASTING_SPLITS: FastingSplit[] = [
  {
    id: '16:8',
    label: '16:8',
    description: '16 hours fasting, 8 hours eating window',
    eatingHours: 8,
    fastingHours: 16,
  },
  {
    id: '18:6',
    label: '18:6',
    description: '18 hours fasting, 6 hours eating window',
    eatingHours: 6,
    fastingHours: 18,
  },
  {
    id: '20:4',
    label: '20:4',
    description: '20 hours fasting, 4 hours eating window (Warrior Diet)',
    eatingHours: 4,
    fastingHours: 20,
  },
  {
    id: '23:1',
    label: '23:1',
    description: '23 hours fasting, 1 hour eating window (OMAD)',
    eatingHours: 1,
    fastingHours: 23,
  },
  {
    id: 'indefinite',
    label: 'Indefinite',
    description: 'Fast until you decide to eat',
    eatingHours: 0,
    fastingHours: null,
  },
  {
    id: 'custom',
    label: 'Custom',
    description: 'Set your own fasting duration',
    eatingHours: 0,
    fastingHours: 16,
  },
];

export interface FastingStatus {
  isFasting: boolean;
  lastMealTime: Date | null;
  elapsedTime: string;
  progress: number;
  hoursFasted: number;
  targetHours: number | null;
  isGoalReached: boolean;
  currentSplit: FastingSplit;
  isIndefinite: boolean;
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

  async setLastMealTime(date: Date): Promise<void> {
    try {
      console.log('[FastingService] setLastMealTime:', date.toISOString());
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

  async getFastingSplit(): Promise<FastingSplit> {
    try {
      const stored = await AsyncStorage.getItem(FASTING_SPLIT_KEY);
      if (stored) {
        const splitData = JSON.parse(stored);
        if (splitData.id === 'custom') {
          return {
            ...splitData,
            fastingHours: splitData.customHours === null ? null : (splitData.customHours || 16),
          };
        }
        if (splitData.id === 'indefinite') {
          return FASTING_SPLITS.find(s => s.id === 'indefinite')!;
        }
        const preset = FASTING_SPLITS.find(s => s.id === splitData.id);
        if (preset) return preset;
      }
    } catch (error) {
      console.error('Error getting fasting split:', error);
    }
    return FASTING_SPLITS[0];
  }

  async setFastingSplit(split: FastingSplit): Promise<void> {
    try {
      await AsyncStorage.setItem(FASTING_SPLIT_KEY, JSON.stringify(split));
    } catch (error) {
      console.error('Error setting fasting split:', error);
    }
  }

  async getCustomHours(): Promise<number | null> {
    try {
      const stored = await AsyncStorage.getItem(FASTING_SPLIT_KEY);
      if (stored) {
        const splitData = JSON.parse(stored);
        if (splitData.id === 'custom') {
          return splitData.customHours === null ? null : (splitData.customHours || 16);
        }
      }
    } catch (error) {
      console.error('Error getting custom hours:', error);
    }
    return 16;
  }

  async setCustomHours(hours: number | null): Promise<void> {
    try {
      const split: FastingSplit = {
        id: 'custom',
        label: hours === null ? 'Indefinite' : 'Custom',
        description: hours === null ? 'Fast until you decide to eat' : `${hours} hours fasting`,
        eatingHours: 0,
        fastingHours: hours,
      };
      await AsyncStorage.setItem(FASTING_SPLIT_KEY, JSON.stringify(split));
    } catch (error) {
      console.error('Error setting custom hours:', error);
    }
  }

  async getFastingStatus(split?: FastingSplit): Promise<FastingStatus> {
    const currentSplit = split || await this.getFastingTime();
    const targetHours = currentSplit.fastingHours;
    const isIndefinite = targetHours === null;
    
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
        currentSplit,
        isIndefinite,
      };
    }

    const now = new Date();
    const diff = now.getTime() - lastMealTime.getTime();
    
    if (diff < 0) {
      console.warn('[FastingService] Last meal time is in the future:', lastMealTime.toISOString(), 'now:', now.toISOString());
    }
    
    const hoursFasted = Math.max(0, diff / (1000 * 60 * 60));
    const minutesFasted = (hoursFasted % 1) * 60;
    const secondsFasted = ((minutesFasted % 1) * 60);
    
    const totalHours = Math.floor(hoursFasted);
    const totalMinutes = Math.floor(minutesFasted);
    const totalSeconds = Math.floor(secondsFasted);

    const elapsedTime = `${totalHours.toString().padStart(2, '0')}:${totalMinutes.toString().padStart(2, '0')}:${totalSeconds.toString().padStart(2, '0')}`;
    
    let progress = 0;
    let isGoalReached = false;
    
    if (!isIndefinite && targetHours) {
      progress = Math.min((hoursFasted / targetHours) * 100, 100);
      isGoalReached = hoursFasted >= targetHours;
    }

    return {
      isFasting: true,
      lastMealTime,
      elapsedTime,
      progress,
      hoursFasted,
      targetHours,
      isGoalReached,
      currentSplit,
      isIndefinite,
    };
  }

  private async getFastingTime(): Promise<FastingSplit> {
    try {
      const stored = await AsyncStorage.getItem(FASTING_SPLIT_KEY);
      if (stored) {
        const splitData = JSON.parse(stored);
        if (splitData.id === 'custom') {
          return {
            ...splitData,
            fastingHours: splitData.customHours === null ? null : (splitData.customHours || 16),
          };
        }
        if (splitData.id === 'indefinite') {
          return FASTING_SPLITS.find(s => s.id === 'indefinite')!;
        }
        const preset = FASTING_SPLITS.find(s => s.id === splitData.id);
        if (preset) return preset;
      }
    } catch (error) {
      console.error('Error getting fasting split:', error);
    }
    return FASTING_SPLITS[0];
  }

  async recordMostRecentMeal(entries: { date: Date }[]): Promise<void> {
    if (entries.length === 0) return;
    
    const mostRecent = entries.reduce((max, entry) => 
      entry.date.getTime() > max.getTime() ? entry.date : max
    , entries[0].date);
    
    await this.setLastMealTime(mostRecent);
  }

  async recordMeal(date: Date = new Date()): Promise<void> {
    await this.setLastMealTime(date);
  }

  async endFasting(): Promise<void> {
    await this.clearLastMealTime();
  }
}

export const fastingService = new FastingService();

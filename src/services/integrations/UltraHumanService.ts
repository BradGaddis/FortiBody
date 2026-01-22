import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UltraHumanDailyMetrics {
  date: string;
  recoveryScore: number;
  sleepScore: number;
  hrv: number;
  restingHeartRate: number;
  stressLevel: string;
  metabolicScore: number;
  readiness: number;
}

export interface UltraHumanSleepData {
  date: string;
  totalDuration: number;
  deepSleep: number;
  lightSleep: number;
  remSleep: number;
  awakeTime: number;
  sleepEfficiency: number;
  sleepScore: number;
  hrv: number;
  restingHeartRate: number;
}

export interface UltraHumanCircaData {
  date: string;
  chronotype: string;
  lightExposure: number;
  socialJetlag: number;
  socialClockOffset: number;
  midpoint: string;
}

export interface UltraHumanConfig {
  apiKey?: string;
  baseUrl: string;
}

const STORAGE_KEY = '@fortibody_ultrahuman_tokens';
const METRICS_CACHE_KEY = '@fortibody_ultrahuman_metrics';
const SLEEP_CACHE_KEY = '@fortibody_ultrahuman_sleep';

class UltraHumanService {
  private static instance: UltraHumanService;
  private config: UltraHumanConfig = {
    baseUrl: 'https://partner.ultrahuman.com/api/v1/partner',
  };

  private constructor() {}

  static getInstance(): UltraHumanService {
    if (!UltraHumanService.instance) {
      UltraHumanService.instance = new UltraHumanService();
    }
    return UltraHumanService.instance;
  }

  configure(config: Partial<UltraHumanConfig>): void {
    this.config = { ...this.config, ...config };
  }

  isConfigured(): boolean {
    return !!this.config.apiKey;
  }

  async setApiKey(apiKey: string): Promise<void> {
    this.config.apiKey = apiKey;
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ apiKey }));
    } catch (error) {
      console.error('Failed to save UltraHuman API key:', error);
    }
  }

  async getApiKey(): Promise<string | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data).apiKey : null;
    } catch {
      return null;
    }
  }

  async fetchDailyMetrics(date: string): Promise<UltraHumanDailyMetrics | null> {
    if (!this.config.apiKey) {
      console.warn('UltraHuman API key not configured');
      return null;
    }

    try {
      const response = await fetch(
        `${this.config.baseUrl}/daily_metrics?date=${date}`,
        {
          headers: {
            'Authorization': this.config.apiKey,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        console.error('UltraHuman API error:', response.status);
        return null;
      }

      const data = await response.json();
      
      const metrics: UltraHumanDailyMetrics = {
        date: data.date || date,
        recoveryScore: data.recovery_score || data.recoveryScore || 0,
        sleepScore: data.sleep_score || data.sleepScore || 0,
        hrv: data.hrv || 0,
        restingHeartRate: data.resting_heart_rate || data.restingHeartRate || 0,
        stressLevel: data.stress_level || data.stressLevel || 'unknown',
        metabolicScore: data.metabolic_score || data.metabolicScore || 0,
        readiness: data.readiness || 0,
      };

      await this.cacheMetrics(date, metrics);
      return metrics;
    } catch (error) {
      console.error('Failed to fetch UltraHuman metrics:', error);
      return this.getCachedMetrics(date);
    }
  }

  async fetchSleepData(date: string): Promise<UltraHumanSleepData | null> {
    if (!this.config.apiKey) {
      return null;
    }

    try {
      const response = await fetch(
        `${this.config.baseUrl}/sleep?date=${date}`,
        {
          headers: {
            'Authorization': this.config.apiKey,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      
      const sleepData: UltraHumanSleepData = {
        date: data.date || date,
        totalDuration: data.total_duration || data.totalDuration || 0,
        deepSleep: data.deep_sleep || data.deepSleep || 0,
        lightSleep: data.light_sleep || data.lightSleep || 0,
        remSleep: data.rem_sleep || data.remSleep || 0,
        awakeTime: data.awake_time || data.awakeTime || 0,
        sleepEfficiency: data.sleep_efficiency || data.sleepEfficiency || 0,
        sleepScore: data.sleep_score || data.sleepScore || 0,
        hrv: data.hrv || 0,
        restingHeartRate: data.resting_heart_rate || data.restingHeartRate || 0,
      };

      await this.cacheSleep(date, sleepData);
      return sleepData;
    } catch (error) {
      console.error('Failed to fetch UltraHuman sleep:', error);
      return this.getCachedSleep(date);
    }
  }

  async getRecentMetrics(days: number = 7): Promise<UltraHumanDailyMetrics[]> {
    const metrics: UltraHumanDailyMetrics[] = [];
    const today = new Date();

    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const cached = await this.getCachedMetrics(dateStr);
      if (cached) {
        metrics.push(cached);
      } else {
        const fetched = await this.fetchDailyMetrics(dateStr);
        if (fetched) {
          metrics.push(fetched);
        }
      }
    }

    return metrics;
  }

  async getAverageRecovery(): Promise<number> {
    const metrics = await this.getRecentMetrics(7);
    if (metrics.length === 0) return 0;
    
    const total = metrics.reduce((sum, m) => sum + m.recoveryScore, 0);
    return Math.round(total / metrics.length);
  }

  async getAverageHRV(): Promise<number> {
    const metrics = await this.getRecentMetrics(7);
    const withHRV = metrics.filter(m => m.hrv > 0);
    if (withHRV.length === 0) return 0;
    
    const total = withHRV.reduce((sum, m) => sum + m.hrv, 0);
    return Math.round(total / withHRV.length);
  }

  getRecoveryLabel(score: number): string {
    if (score >= 90) return 'Excellent';
    if (score >= 75) return 'Good';
    if (score >= 60) return 'Fair';
    if (score >= 40) return 'Low';
    return 'Poor';
  }

  getStressLabel(hrv: number): string {
    if (hrv >= 60) return 'Low';
    if (hrv >= 40) return 'Moderate';
    if (hrv >= 25) return 'High';
    return 'Very High';
  }

  getRecoveryColor(score: number): string {
    if (score >= 75) return '#4CAF50';
    if (score >= 60) return '#8BC34A';
    if (score >= 40) return '#FF9800';
    if (score >= 25) return '#FF5722';
    return '#F44336';
  }

  private async cacheMetrics(date: string, metrics: UltraHumanDailyMetrics): Promise<void> {
    try {
      const all = await AsyncStorage.getItem(METRICS_CACHE_KEY);
      const parsed = all ? JSON.parse(all) : {};
      parsed[date] = metrics;
      await AsyncStorage.setItem(METRICS_CACHE_KEY, JSON.stringify(parsed));
    } catch {}
  }

  private async getCachedMetrics(date: string): Promise<UltraHumanDailyMetrics | null> {
    try {
      const all = await AsyncStorage.getItem(METRICS_CACHE_KEY);
      const parsed = all ? JSON.parse(all) : {};
      return parsed[date] || null;
    } catch {
      return null;
    }
  }

  private async cacheSleep(date: string, sleep: UltraHumanSleepData): Promise<void> {
    try {
      const all = await AsyncStorage.getItem(SLEEP_CACHE_KEY);
      const parsed = all ? JSON.parse(all) : {};
      parsed[date] = sleep;
      await AsyncStorage.setItem(SLEEP_CACHE_KEY, JSON.stringify(parsed));
    } catch {}
  }

  private async getCachedSleep(date: string): Promise<UltraHumanSleepData | null> {
    try {
      const all = await AsyncStorage.getItem(SLEEP_CACHE_KEY);
      const parsed = all ? JSON.parse(all) : {};
      return parsed[date] || null;
    } catch {
      return null;
    }
  }

  async clearCache(): Promise<void> {
    await AsyncStorage.removeItem(METRICS_CACHE_KEY);
    await AsyncStorage.removeItem(SLEEP_CACHE_KEY);
  }
}

export const ultraHumanService = UltraHumanService.getInstance();
export default ultraHumanService;

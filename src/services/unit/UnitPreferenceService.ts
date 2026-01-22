import AsyncStorage from '@react-native-async-storage/async-storage';

export type MeasurementSystem = 'metric' | 'imperial';

const UNIT_PREF_KEY = '@fortibody_unit_prefs';

export interface UnitPreferences {
  measurementSystem: MeasurementSystem;
  weightUnit: 'kg' | 'lbs';
  distanceUnit: 'km' | 'mi';
  heightUnit: 'cm' | 'in';
}

const DEFAULT_PREFERENCES: UnitPreferences = {
  measurementSystem: 'metric',
  weightUnit: 'kg',
  distanceUnit: 'km',
  heightUnit: 'cm',
};

class UnitPreferenceService {
  private static instance: UnitPreferenceService;
  private currentPrefs: UnitPreferences = DEFAULT_PREFERENCES;

  private constructor() {}

  static getInstance(): UnitPreferenceService {
    if (!UnitPreferenceService.instance) {
      UnitPreferenceService.instance = new UnitPreferenceService();
    }
    return UnitPreferenceService.instance;
  }

  async loadPreferences(): Promise<UnitPreferences> {
    try {
      const data = await AsyncStorage.getItem(UNIT_PREF_KEY);
      if (data) {
        const prefs = JSON.parse(data);
        this.currentPrefs = { ...DEFAULT_PREFERENCES, ...prefs };
      }
    } catch (error) {
      console.error('Failed to load unit preferences:', error);
      this.currentPrefs = DEFAULT_PREFERENCES;
    }
    return this.currentPrefs;
  }

  async setMeasurementSystem(system: MeasurementSystem): Promise<void> {
    const prefs: UnitPreferences = {
      ...this.currentPrefs,
      measurementSystem: system,
      weightUnit: system === 'metric' ? 'kg' : 'lbs',
      distanceUnit: system === 'metric' ? 'km' : 'mi',
      heightUnit: system === 'metric' ? 'cm' : 'in',
    };
    
    await this.savePreferences(prefs);
  }

  getMeasurementSystem(): MeasurementSystem {
    return this.currentPrefs.measurementSystem;
  }

  getWeightUnit(): 'kg' | 'lbs' {
    return this.currentPrefs.weightUnit;
  }

  getDistanceUnit(): 'km' | 'mi' {
    return this.currentPrefs.distanceUnit;
  }

  getHeightUnit(): 'cm' | 'in' {
    return this.currentPrefs.heightUnit;
  }

  isMetric(): boolean {
    return this.currentPrefs.measurementSystem === 'metric';
  }

  isImperial(): boolean {
    return this.currentPrefs.measurementSystem === 'imperial';
  }

  convertWeight(value: number, fromUnit: 'kg' | 'lbs', toUnit: 'kg' | 'lbs'): number {
    if (fromUnit === toUnit) return value;
    
    if (fromUnit === 'kg' && toUnit === 'lbs') {
      return Math.round(value * 2.20462 * 10) / 10;
    }
    
    if (fromUnit === 'lbs' && toUnit === 'kg') {
      return Math.round(value / 2.20462 * 10) / 10;
    }
    
    return value;
  }

  convertDistance(value: number, fromUnit: 'km' | 'mi', toUnit: 'km' | 'mi'): number {
    if (fromUnit === toUnit) return value;
    
    if (fromUnit === 'km' && toUnit === 'mi') {
      return Math.round(value * 0.621371 * 10) / 10;
    }
    
    if (fromUnit === 'mi' && toUnit === 'km') {
      return Math.round(value / 0.621371 * 10) / 10;
    }
    
    return value;
  }

  convertHeight(value: number, fromUnit: 'cm' | 'in', toUnit: 'cm' | 'in'): number {
    if (fromUnit === toUnit) return value;
    
    if (fromUnit === 'cm' && toUnit === 'in') {
      return Math.round(value / 2.54 * 10) / 10;
    }
    
    if (fromUnit === 'in' && toUnit === 'cm') {
      return Math.round(value * 2.54 * 10) / 10;
    }
    
    return value;
  }

  formatWeight(value: number, system?: MeasurementSystem): string {
    const prefs = this.currentPrefs;
    const unit = system === 'imperial' ? 'lbs' : 'kg';
    return `${value} ${unit}`;
  }

  formatDistance(value: number, system?: MeasurementSystem): string {
    const prefs = this.currentPrefs;
    const unit = system === 'imperial' ? 'mi' : 'km';
    return `${value} ${unit}`;
  }

  formatHeight(value: number, system?: MeasurementSystem): string {
    const prefs = this.currentPrefs;
    const unit = system === 'imperial' ? 'in' : 'cm';
    return `${value} ${unit}`;
  }

  private async savePreferences(prefs: UnitPreferences): Promise<void> {
    try {
      this.currentPrefs = prefs;
      await AsyncStorage.setItem(UNIT_PREF_KEY, JSON.stringify(prefs));
    } catch (error) {
      console.error('Failed to save unit preferences:', error);
    }
  }
}

export const unitPreferenceService = UnitPreferenceService.getInstance();
export default unitPreferenceService;

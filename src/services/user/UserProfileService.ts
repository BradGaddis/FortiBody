import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserProfile {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  height: number;
  weight: number;
  weightUnit: 'kg' | 'lbs';
  measurementSystem: 'metric' | 'imperial';
  activityLevel: 1 | 2 | 3 | 4 | 5;
  goals: FitnessGoal[];
  targetWeight?: number;
  medicalConditions: string[];
  limitations: string[];
  profilePicture?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FitnessGoal {
  id: string;
  title: string;
  description: string;
  targetDate?: Date;
  targetValue?: number;
  currentProgress?: number; // 0-1
  unit:
    | 'weight'
    | 'workouts_per_week'
    | 'calories'
    | 'steps'
    | 'body_fat_percentage';
  isActive: boolean;
  createdAt: Date;
  achievedAt?: Date;
}

export interface UserMetrics {
  weight: {
    current: number; // kg
    startWeight?: number;
    target?: number;
    changeRate: number; // kg per week
    trend: 'losing' | 'gaining' | 'maintaining';
  };
  bodyMeasurements: {
    measurements: BodyMeasurement[];
    lastUpdated: Date;
  };
}

export interface BodyMeasurement {
  type:
    | 'chest'
    | 'waist'
    | 'arms'
    | 'thighs'
    | 'hips'
    | 'shoulders'
    | 'neck'
    | 'body_fat_percentage';
  value: number;
  unit: string; // cm or inches
  date: Date;
}

const USER_PROFILE_KEY = '@user_profile';
const USER_GOALS_KEY = '@user_goals';
const USER_METRICS_KEY = '@user_metrics';
const BODY_MEASUREMENTS_KEY = '@body_measurements';

class UserProfileService {
  async saveProfile(profile: Omit<UserProfile, 'id'> & { id?: string }): Promise<void> {
    try {
      console.log('💾 saveProfile - Saving profile:', profile.name, profile.age);
      const profiles = await this.getProfiles();
      const profileId = profile.id || 'active';
      console.log('💾 saveProfile - Filtering out existing profile with id:', profileId);
      const updatedProfiles = profiles.filter(p => p.id !== profileId);
      updatedProfiles.push({ ...profile, id: profileId } as UserProfile);
      console.log('💾 saveProfile - Final profiles:', JSON.stringify(updatedProfiles));

      await AsyncStorage.setItem(
        USER_PROFILE_KEY,
        JSON.stringify(updatedProfiles)
      );
      console.log('💾 saveProfile - Saved successfully');
    } catch (error) {
      console.error('Error saving user profile:', error);
    }
  }

  async getProfiles(): Promise<UserProfile[]> {
    try {
      const profilesData = await AsyncStorage.getItem(USER_PROFILE_KEY);
      return profilesData ? JSON.parse(profilesData) : [];
    } catch (error) {
      console.error('Error loading user profiles:', error);
      return [];
    }
  }

  async getActiveProfile(): Promise<UserProfile | null> {
    try {
      const profiles = await this.getProfiles();
      console.log('💾 getActiveProfile - all profiles:', JSON.stringify(profiles));
      const active = profiles.find(p => p.id === 'active');
      if (active) {
        console.log('💾 getActiveProfile - found active profile:', active.name);
        return active;
      }
      console.log('💾 No active profile found, returning first profile or null');
      return profiles[0] || null;
    } catch (error) {
      console.error('Error getting active profile:', error);
      return null;
    }
  }

  async setActiveProfile(profileId: string): Promise<void> {
    try {
      const profiles = await this.getProfiles();
      const updatedProfiles = profiles.map(p => ({
        ...p,
        isActive: p.id === profileId,
      }));

      await AsyncStorage.setItem(
        USER_PROFILE_KEY,
        JSON.stringify(updatedProfiles)
      );
    } catch (error) {
      console.error('Error setting active profile:', error);
    }
  }

  async updateProfile(
    profileId: string,
    updates: Partial<UserProfile>
  ): Promise<void> {
    try {
      const profiles = await this.getProfiles();
      const updatedProfiles = profiles.map(p =>
        p.id === profileId ? { ...p, ...updates, updatedAt: new Date() } : p
      );

      await AsyncStorage.setItem(
        USER_PROFILE_KEY,
        JSON.stringify(updatedProfiles)
      );
    } catch (error) {
      console.error('Error updating user profile:', error);
    }
  }

  async deleteProfile(profileId: string): Promise<void> {
    try {
      const profiles = await this.getProfiles();
      const filteredProfiles = profiles.filter(p => p.id !== profileId);

      await AsyncStorage.setItem(
        USER_PROFILE_KEY,
        JSON.stringify(filteredProfiles)
      );

      if (filteredProfiles.length === 0) {
        // Default profile if no active profile exists
        const defaultProfile: UserProfile = {
          id: 'default',
          name: 'Guest User',
          age: 30,
          gender: 'other',
          height: 170,
          weight: 70,
          weightUnit: 'kg',
          measurementSystem: 'metric',
          activityLevel: 2,
          goals: [],
          medicalConditions: [],
          limitations: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        await AsyncStorage.setItem(
          USER_PROFILE_KEY,
          JSON.stringify([defaultProfile])
        );
      }
    } catch (error) {
      console.error('Error deleting user profile:', error);
    }
  }

  async saveUserGoals(goals: FitnessGoal[]): Promise<void> {
    try {
      await AsyncStorage.setItem(USER_GOALS_KEY, JSON.stringify(goals));
    } catch (error) {
      console.error('Error saving user goals:', error);
    }
  }

  async getUserGoals(): Promise<FitnessGoal[]> {
    try {
      const goalsData = await AsyncStorage.getItem(USER_GOALS_KEY);
      return goalsData ? JSON.parse(goalsData) : [];
    } catch (error) {
      console.error('Error loading user goals:', error);
      return [];
    }
  }

  async updateUserMetrics(metrics: UserMetrics): Promise<void> {
    try {
      const existingMetrics = await this.getUserMetrics();
      const updatedMetrics = {
        ...existingMetrics,
        ...metrics,
        lastUpdated: new Date(),
      };

      await AsyncStorage.setItem(
        USER_METRICS_KEY,
        JSON.stringify(updatedMetrics)
      );
    } catch (error) {
      console.error('Error updating user metrics:', error);
    }
  }

  async getUserMetrics(): Promise<UserMetrics> {
    try {
      const metricsData = await AsyncStorage.getItem(USER_METRICS_KEY);
      return metricsData
        ? JSON.parse(metricsData)
        : {
            weight: { current: 0 },
            bodyMeasurements: { measurements: [], lastUpdated: new Date() },
          };
    } catch (error) {
      console.error('Error loading user metrics:', error);
      return {
        weight: { current: 0, startWeight: undefined, target: undefined, changeRate: 0, trend: 'maintaining' as const },
        bodyMeasurements: { measurements: [], lastUpdated: new Date() },
      };
    }
  }

  async saveBodyMeasurement(
    measurement: Omit<BodyMeasurement, 'id'>
  ): Promise<void> {
    try {
      const existingMetrics = await this.getUserMetrics();
      const measurements = existingMetrics.bodyMeasurements.measurements;
      const updatedMeasurements = [...measurements, measurement];

      await this.updateUserMetrics({
        ...existingMetrics,
        bodyMeasurements: { measurements, lastUpdated: new Date() },
      });
    } catch (error) {
      console.error('Error saving body measurement:', error);
    }
  }
}

export default UserProfileService;

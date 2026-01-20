export interface UserProfile {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  height: number; // cm
  weight: number; // kg
  activityLevel: 1 | 2 | 3 | 4 | 5; // 1=sedentary, 5=very active
  goals: FitnessGoal[];
  targetWeight?: number | undefined; // target in kg
  medicalConditions: string[];
  limitations: string[];
  profilePicture?: string;
  createdAt: Date;
  updatedAt: Date;
  isActive?: boolean;
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

export type FitnessGoalType =
  | 'weight_loss'
  | 'muscle_gain'
  | 'maintenance'
  | 'performance';

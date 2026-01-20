// Exercise Type Definitions
export interface Exercise {
  id: string;
  name: string;
  category: 'strength' | 'cardio' | 'flexibility' | 'bodyweight';
  muscleGroups: string[];
  equipment: string[];
  instructions: string;
  image?: string;
  video?: string;
  personalRecords?: PersonalRecord[];
  favorite?: boolean;
  frequency?: number;
}

export interface PersonalRecord {
  id: string;
  exerciseId: string;
  type: 'weight' | 'reps' | 'duration' | 'volume';
  value: number;
  unit: string;
  date: Date;
  notes?: string;
}

export interface ExerciseSession {
  id: string;
  exerciseId: string;
  date: Date;
  duration: number; // minutes
  sets: ExerciseSet[];
  perceivedExertion: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  notes?: string;
}

export interface ExerciseSet {
  id: string;
  sessionId?: string;
  reps: number;
  weight: number;
  restTime?: number; // seconds
  completed: boolean;
  timestamp?: Date;
}

export interface ExercisePerformance {
  exerciseId: string;
  date: Date;
  sets: ExerciseSet[];
  totalVolume: number; // weight × reps × sets
  totalDuration: number;
  averageWeight: number;
  maxWeight: number;
  totalReps: number;
}

// Workout Type Definitions
export interface Workout {
  id: string;
  name: string;
  description?: string;
  exercises: WorkoutExercise[];
  estimatedDuration: number; // minutes
  tags: string[];
  createdAt: Date;
  lastCompleted?: Date;
  completionCount: number;
}

export interface WorkoutExercise {
  exerciseId: string;
  sets: number;
  reps?: number;
  weight?: number;
  restTime?: number;
  notes?: string;
}

// User Preferences
export interface ExercisePreferences {
  defaultRestTime: number; // seconds
  defaultSets: number;
  defaultReps: number;
  weightUnit: 'kg' | 'lbs';
  autoIncrement: boolean;
  incrementAmount: number;
}

// Navigation Types
export type ExerciseTab = 'library' | 'favorites' | 'custom' | 'history';
export type ExerciseFilter = {
  category?: string;
  muscleGroup?: string;
  equipment?: string;
  search?: string;
};

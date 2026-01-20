export interface ExerciseSet {
  id: string;
  reps: number;
  weight: number;
  rpe?: number;
  isCompleted: boolean;
  restTime?: number;
  timestamp?: Date;
  notes?: string;
}

export interface ExerciseSession {
  id: string;
  exerciseId: string;
  exerciseName: string;
  date: Date;
  sets: ExerciseSet[];
  duration: number;
  notes?: string;
  perceivedExertion?: number;
  volume: number;
  maxWeight: number;
  totalReps: number;
}

export interface PersonalRecord {
  id: string;
  exerciseId: string;
  exerciseName: string;
  type: PRType;
  value: number;
  unit: string;
  date: Date;
  previousRecord?: number;
  improvement?: number;
}

export type PRType =
  | 'max_weight'
  | 'max_reps'
  | 'max_volume'
  | 'one_rm'
  | 'max_duration';

export interface WorkoutTemplate {
  id: string;
  name: string;
  description?: string;
  exercises: TemplateExercise[];
  estimatedDuration: number;
  tags: string[];
  isFavorite: boolean;
  createdAt: Date;
  lastUsed?: Date;
  usageCount: number;
}

export interface TemplateExercise {
  exerciseId: string;
  exerciseName: string;
  sets: number;
  reps?: string;
  weight?: number;
  restTime: number;
  notes?: string;
  order: number;
}

export interface WorkoutHistory {
  id: string;
  templateId?: string;
  templateName?: string;
  date: Date;
  duration: number;
  totalVolume: number;
  exercises: ExerciseSession[];
  caloriesBurned?: number;
  notes?: string;
}

export interface ExerciseStats {
  totalSets: number;
  totalVolume: number;
  maxWeight: number;
  averageWeight: number;
  totalReps: number;
  mostCommonRepRange: string;
  streak: number;
  prCount: number;
}

export const PR_TYPE_CONFIG: Record<
  PRType,
  { label: string; icon: string; unit: string }
> = {
  max_weight: { label: 'Max Weight', icon: 'barbell', unit: 'kg/lbs' },
  max_reps: { label: 'Max Reps', icon: 'repeat', unit: 'reps' },
  max_volume: { label: 'Max Volume', icon: 'analytics', unit: 'kg/lbs' },
  one_rm: { label: 'One Rep Max', icon: 'trophy', unit: 'kg/lbs' },
  max_duration: { label: 'Max Duration', icon: 'time', unit: 'min' },
};

export const REST_TIMER_PRESETS = [
  { label: 'Quick', seconds: 30 },
  { label: 'Standard', seconds: 60 },
  { label: 'Long', seconds: 90 },
  { label: 'Extended', seconds: 120 },
  { label: 'Custom', seconds: 0 },
];

export const RPE_SCALE = [
  { value: 10, label: 'Max Effort', description: 'Could not do more' },
  { value: 9, label: 'Very Hard', description: 'Could do 1 more rep' },
  { value: 8, label: 'Hard', description: 'Could do 2 more reps' },
  { value: 7, label: 'Somewhat Hard', description: 'Could do 3-4 more reps' },
  { value: 6, label: 'Moderate', description: 'Could do many more reps' },
  { value: 5, label: 'Light', description: 'Warm-up effort' },
];

export const calculateOneRepMax = (weight: number, reps: number): number => {
  if (reps === 1) return weight;
  if (reps >= 10) return weight;

  const epleyFormula = weight * (1 + reps / 30);
  return Math.round(epleyFormula);
};

export const calculateVolume = (sets: ExerciseSet[]): number => {
  return sets.reduce((total, set) => {
    if (set.isCompleted) {
      return total + set.weight * set.reps;
    }
    return total;
  }, 0);
};

export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
};

export const formatWeight = (weight: number, unit: string = 'kg'): string => {
  return `${Math.round(weight * 10) / 10} ${unit}`;
};

export const calculateProgress = (
  current: number,
  previous: number
): number => {
  if (previous === 0) return 0;
  return Math.round(((current - previous) / previous) * 100 * 10) / 10;
};

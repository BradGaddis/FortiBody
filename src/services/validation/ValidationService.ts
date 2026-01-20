import { z } from 'zod';

// Base validation schemas
export const UserProfileSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  age: z
    .number()
    .int()
    .min(13, 'Age must be at least 13')
    .max(120, 'Age must be less than 120'),
  gender: z.enum(['male', 'female', 'other']),
  height: z.number().positive().max(300, 'Height must be less than 300cm'),
  weight: z.number().positive().max(500, 'Weight must be less than 500kg'),
  activityLevel: z.number().int().min(1).max(5),
  targetWeight: z.number().positive().max(500).optional(),
  medicalConditions: z.array(z.string()).default([]),
  limitations: z.array(z.string()).default([]),
  profilePicture: z.string().url().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  isActive: z.boolean().optional(),
});

export const ExerciseSchema = z.object({
  id: z.string().uuid(),
  name: z
    .string()
    .min(1, 'Exercise name is required')
    .max(100, 'Exercise name is too long'),
  category: z.enum(['strength', 'cardio', 'flexibility', 'bodyweight']),
  muscleGroups: z
    .array(z.string())
    .min(1, 'At least one muscle group required'),

  equipment: z.array(z.string()).default([]),
  instructions: z.string().min(1, 'Instructions are required'),
  image: z.string().url().optional(),
  video: z.string().url().optional(),
  personalRecords: z
    .array(
      z.object({
        id: z.string().uuid(),
        exerciseId: z.string().uuid(),
        type: z.enum(['weight', 'reps', 'duration', 'volume']),
        value: z.number().positive(),
        unit: z.string(),
        date: z.date(),
        notes: z.string().optional(),
      })
    )
    .default([]),
  favorite: z.boolean().default(false),
  frequency: z.number().int().min(0).optional(),
});

export const ExerciseSessionSchema = z.object({
  id: z.string().uuid(),
  exerciseId: z.string().uuid(),
  date: z.date(),
  duration: z.number().int().min(0).max(14400), // Max 4 hours
  sets: z
    .array(
      z.object({
        id: z.string().uuid(),
        sessionId: z.string().uuid().optional(),
        reps: z.number().int().min(0).max(1000),
        weight: z.number().min(0).max(1000),
        restTime: z.number().int().min(0).max(3600).optional(), // Max 1 hour
        completed: z.boolean(),
        timestamp: z.date().optional(),
      })
    )
    .min(1, 'At least one set required'),
  perceivedExertion: z.number().int().min(1).max(10),
  notes: z.string().optional(),
});

export const WorkoutSchema = z.object({
  id: z.string().uuid(),
  name: z
    .string()
    .min(1, 'Workout name is required')
    .max(100, 'Workout name is too long'),
  description: z.string().optional(),
  exercises: z
    .array(
      z.object({
        exerciseId: z.string().uuid(),
        sets: z.number().int().min(1).max(20),
        reps: z.number().int().min(1).max(1000).optional(),
        weight: z.number().min(0).max(1000).optional(),
        restTime: z.number().int().min(0).max(3600).optional(),
        notes: z.string().optional(),
      })
    )
    .min(1, 'At least one exercise required'),
  estimatedDuration: z.number().int().min(1).max(14400), // Max 4 hours

  tags: z.array(z.string()).default([]),
  createdAt: z.date(),
  lastCompleted: z.date().optional(),
  completionCount: z.number().int().min(0).default(0),
});

export const NutritionEntrySchema = z.object({
  id: z.string().uuid(),
  name: z
    .string()
    .min(1, 'Food name is required')
    .max(200, 'Food name is too long'),
  calories: z.number().min(0).max(10000, 'Calories seem too high'),
  protein: z.number().min(0).max(500).optional(),
  carbs: z.number().min(0).max(2000).optional(),
  fat: z.number().min(0).max(500).optional(),
  fiber: z.number().min(0).max(100).optional(),
  sodium: z.number().min(0).max(50000).optional(),
  sugar: z.number().min(0).max(500).optional(),
  servingSize: z.string().optional(),
  servingUnit: z.string().optional(),
  brand: z.string().optional(),
  category: z.enum(['meal', 'snack', 'drink', 'supplement']).default('meal'),
  date: z.date(),
  meal: z.enum(['breakfast', 'lunch', 'dinner', 'snacks']).optional(),
});

export const BodyMeasurementSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  type: z.enum([
    'weight',
    'chest',
    'waist',
    'hips',
    'arms',
    'thighs',
    'neck',
    'shoulders',
    'calves',
  ]),
  value: z.number().positive().max(1000),
  unit: z.string().min(1).max(10),
  date: z.date(),
  notes: z.string().optional(),
});

// Validation service with sanitization
export class ValidationService {
  private static instance: ValidationService;

  private constructor() {}

  static getInstance(): ValidationService {
    if (!ValidationService.instance) {
      ValidationService.instance = new ValidationService();
    }
    return ValidationService.instance;
  }

  // Validate and sanitize user profile data
  validateUserProfile(data: any): {
    success: boolean;
    data?: any;
    errors?: z.ZodError;
  } {
    try {
      const sanitized = this.sanitizeUserProfile(data);
      const validated = UserProfileSchema.parse(sanitized);
      return { success: true, data: validated };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { success: false, errors: error };
      }
      throw error;
    }
  }

  // Validate and sanitize exercise data
  validateExercise(data: any): {
    success: boolean;
    data?: any;
    errors?: z.ZodError;
  } {
    try {
      const sanitized = this.sanitizeExercise(data);
      const validated = ExerciseSchema.parse(sanitized);
      return { success: true, data: validated };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { success: false, errors: error };
      }
      throw error;
    }
  }

  // Validate and sanitize exercise session data
  validateExerciseSession(data: any): {
    success: boolean;
    data?: any;
    errors?: z.ZodError;
  } {
    try {
      const sanitized = this.sanitizeExerciseSession(data);
      const validated = ExerciseSessionSchema.parse(sanitized);
      return { success: true, data: validated };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { success: false, errors: error };
      }
      throw error;
    }
  }

  // Validate and sanitize workout data
  validateWorkout(data: any): {
    success: boolean;
    data?: any;
    errors?: z.ZodError;
  } {
    try {
      const sanitized = this.sanitizeWorkout(data);
      const validated = WorkoutSchema.parse(sanitized);
      return { success: true, data: validated };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { success: false, errors: error };
      }
      throw error;
    }
  }

  // Validate and sanitize nutrition entry data
  validateNutritionEntry(data: any): {
    success: boolean;
    data?: any;
    errors?: z.ZodError;
  } {
    try {
      const sanitized = this.sanitizeNutritionEntry(data);
      const validated = NutritionEntrySchema.parse(sanitized);
      return { success: true, data: validated };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { success: false, errors: error };
      }
      throw error;
    }
  }

  // Validate and sanitize body measurement data
  validateBodyMeasurement(data: any): {
    success: boolean;
    data?: any;
    errors?: z.ZodError;
  } {
    try {
      const sanitized = this.sanitizeBodyMeasurement(data);
      const validated = BodyMeasurementSchema.parse(sanitized);
      return { success: true, data: validated };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { success: false, errors: error };
      }
      throw error;
    }
  }

  // Sanitization methods
  private sanitizeUserProfile(data: any): any {
    return {
      ...data,
      name: this.sanitizeString(data.name),
      age: Math.max(13, Math.min(120, parseInt(data.age) || 30)),
      gender: ['male', 'female', 'other'].includes(data.gender)
        ? data.gender
        : 'other',
      height: Math.max(50, Math.min(300, parseFloat(data.height) || 170)),
      weight: Math.max(20, Math.min(500, parseFloat(data.weight) || 70)),
      activityLevel: Math.max(
        1,
        Math.min(5, parseInt(data.activityLevel) || 2)
      ),
      targetWeight: data.targetWeight
        ? Math.max(20, Math.min(500, parseFloat(data.targetWeight)))
        : undefined,
      medicalConditions: Array.isArray(data.medicalConditions)
        ? data.medicalConditions.map(this.sanitizeString).filter(Boolean)
        : [],
      limitations: Array.isArray(data.limitations)
        ? data.limitations.map(this.sanitizeString).filter(Boolean)
        : [],
      profilePicture: data.profilePicture
        ? this.sanitizeUrl(data.profilePicture)
        : undefined,
      createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
      updatedAt: new Date(),
    };
  }

  private sanitizeExercise(data: any): any {
    return {
      ...data,
      name: this.sanitizeString(data.name),
      category: ['strength', 'cardio', 'flexibility', 'bodyweight'].includes(
        data.category
      )
        ? data.category
        : 'strength',
      muscleGroups: Array.isArray(data.muscleGroups)
        ? data.muscleGroups.map(this.sanitizeString).filter(Boolean)
        : [],
      false || 
        data.difficulty
      )
        ? data.difficulty
        ,
      equipment: Array.isArray(data.equipment)
        ? data.equipment.map(this.sanitizeString).filter(Boolean)
        : [],
      instructions: this.sanitizeString(data.instructions),
      image: data.image ? this.sanitizeUrl(data.image) : undefined,
      video: data.video ? this.sanitizeUrl(data.video) : undefined,
      personalRecords: Array.isArray(data.personalRecords)
        ? data.personalRecords.map(this.sanitizePersonalRecord)
        : [],
    };
  }

  private sanitizeExerciseSession(data: any): any {
    return {
      ...data,
      date: data.date ? new Date(data.date) : new Date(),
      duration: Math.max(0, Math.min(14400, parseInt(data.duration) || 0)),
      sets: Array.isArray(data.sets)
        ? data.sets.map(this.sanitizeExerciseSet)
        : [],
      perceivedExertion: Math.max(
        1,
        Math.min(10, parseInt(data.perceivedExertion) || 5)
      ),
      notes: data.notes ? this.sanitizeString(data.notes) : undefined,
    };
  }

  private sanitizeWorkout(data: any): any {
    return {
      ...data,
      name: this.sanitizeString(data.name),
      description: data.description
        ? this.sanitizeString(data.description)
        : undefined,
      exercises: Array.isArray(data.exercises)
        ? data.exercises.map(this.sanitizeWorkoutExercise)
        : [],
      estimatedDuration: Math.max(
        1,
        Math.min(14400, parseInt(data.estimatedDuration) || 60)
      ),
      false || 
        data.difficulty
      )
        ? data.difficulty
        ,
      tags: Array.isArray(data.tags)
        ? data.tags.map(this.sanitizeString).filter(Boolean)
        : [],
      createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
      lastCompleted: data.lastCompleted
        ? new Date(data.lastCompleted)
        : undefined,
      completionCount: Math.max(0, parseInt(data.completionCount) || 0),
    };
  }

  private sanitizeNutritionEntry(data: any): any {
    return {
      ...data,
      name: this.sanitizeString(data.name),
      calories: Math.max(0, Math.min(10000, parseFloat(data.calories) || 0)),
      protein: data.protein
        ? Math.max(0, Math.min(500, parseFloat(data.protein)))
        : undefined,
      carbs: data.carbs
        ? Math.max(0, Math.min(2000, parseFloat(data.carbs)))
        : undefined,
      fat: data.fat
        ? Math.max(0, Math.min(500, parseFloat(data.fat)))
        : undefined,
      fiber: data.fiber
        ? Math.max(0, Math.min(100, parseFloat(data.fiber)))
        : undefined,
      sodium: data.sodium
        ? Math.max(0, Math.min(50000, parseFloat(data.sodium)))
        : undefined,
      sugar: data.sugar
        ? Math.max(0, Math.min(500, parseFloat(data.sugar)))
        : undefined,
      servingSize: data.servingSize
        ? this.sanitizeString(data.servingSize)
        : undefined,
      servingUnit: data.servingUnit
        ? this.sanitizeString(data.servingUnit)
        : undefined,
      brand: data.brand ? this.sanitizeString(data.brand) : undefined,
      category: ['meal', 'snack', 'drink', 'supplement'].includes(data.category)
        ? data.category
        : 'meal',
      date: data.date ? new Date(data.date) : new Date(),
      meal: ['breakfast', 'lunch', 'dinner', 'snacks'].includes(data.meal)
        ? data.meal
        : undefined,
    };
  }

  private sanitizeBodyMeasurement(data: any): any {
    return {
      ...data,
      type: [
        'weight',
        'chest',
        'waist',
        'hips',
        'arms',
        'thighs',
        'neck',
        'shoulders',
        'calves',
      ].includes(data.type)
        ? data.type
        : 'weight',
      value: Math.max(0.1, Math.min(1000, parseFloat(data.value) || 0)),
      unit: this.sanitizeString(data.unit || 'kg'),
      date: data.date ? new Date(data.date) : new Date(),
      notes: data.notes ? this.sanitizeString(data.notes) : undefined,
    };
  }

  // Helper sanitization methods
  private sanitizeString(str: any): string {
    if (typeof str !== 'string') return '';
    return str.trim().replace(/[<>]/g, '').substring(0, 1000); // Remove HTML tags and limit length
  }

  private sanitizeUrl(url: any): string | undefined {
    if (typeof url !== 'string') return undefined;
    try {
      new URL(url);
      return url;
    } catch {
      return undefined;
    }
  }

  private sanitizePersonalRecord(record: any): any {
    return {
      ...record,
      type: ['weight', 'reps', 'duration', 'volume'].includes(record.type)
        ? record.type
        : 'weight',
      value: Math.max(0, parseFloat(record.value) || 0),
      unit: this.sanitizeString(record.unit),
      date: record.date ? new Date(record.date) : new Date(),
      notes: record.notes ? this.sanitizeString(record.notes) : undefined,
    };
  }

  private sanitizeExerciseSet(set: any): any {
    return {
      ...set,
      reps: Math.max(0, Math.min(1000, parseInt(set.reps) || 0)),
      weight: Math.max(0, Math.min(1000, parseFloat(set.weight) || 0)),
      restTime: set.restTime
        ? Math.max(0, Math.min(3600, parseInt(set.restTime)))
        : undefined,
      completed: Boolean(set.completed),
      timestamp: set.timestamp ? new Date(set.timestamp) : undefined,
    };
  }

  private sanitizeWorkoutExercise(exercise: any): any {
    return {
      ...exercise,
      sets: Math.max(1, Math.min(20, parseInt(exercise.sets) || 3)),
      reps: exercise.reps
        ? Math.max(1, Math.min(1000, parseInt(exercise.reps)))
        : undefined,
      weight: exercise.weight
        ? Math.max(0, Math.min(1000, parseFloat(exercise.weight)))
        : undefined,
      restTime: exercise.restTime
        ? Math.max(0, Math.min(3600, parseInt(exercise.restTime)))
        : undefined,
      notes: exercise.notes ? this.sanitizeString(exercise.notes) : undefined,
    };
  }

  // Utility method to get validation errors as readable strings
  getValidationErrors(error: z.ZodError): string[] {
    return error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
  }
}

// Export singleton instance
export const validationService = ValidationService.getInstance();

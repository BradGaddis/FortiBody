import { z } from 'zod';

export const LoginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password is too long'),
});

export const RegisterSchema = z
  .object({
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Please enter a valid email address'),
    password: z
      .string()
      .min(1, 'Password is required')
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain uppercase, lowercase, and number'
      )
      .max(100, 'Password is too long'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    name: z
      .string()
      .min(1, 'Name is required')
      .max(100, 'Name is too long')
      .trim(),
    acceptTerms: z.boolean().refine(val => val === true, {
      message: 'You must accept the terms and conditions',
    }),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const ForgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
});

export const ResetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(1, 'Password is required')
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain uppercase, lowercase, and number'
      )
      .max(100, 'Password is too long'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const ProfileEditSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name is too long')
    .trim(),
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
  goals: z.array(z.string()).default([]),
});

export const ExerciseCreateSchema = z.object({
  name: z
    .string()
    .min(1, 'Exercise name is required')
    .max(100, 'Exercise name is too long')
    .trim(),
  category: z.enum(['strength', 'cardio', 'flexibility', 'bodyweight']),
  muscleGroups: z
    .array(z.string())
    .min(1, 'At least one muscle group required'),
  equipment: z.array(z.string()).default([]),
  instructions: z
    .string()
    .min(10, 'Instructions must be at least 10 characters'),
  notes: z.string().max(500).optional(),
});

export const WorkoutCreateSchema = z.object({
  name: z
    .string()
    .min(1, 'Workout name is required')
    .max(100, 'Workout name is too long')
    .trim(),
  description: z.string().max(500).optional(),
  exercises: z
    .array(
      z.object({
        exerciseId: z.string(),
        sets: z.number().int().min(1).max(20),
        reps: z.number().int().min(1).max(100).optional(),
        weight: z.number().min(0).max(1000).optional(),
        restTime: z.number().int().min(0).max(3600).optional(),
      })
    )
    .min(1, 'At least one exercise required'),
  estimatedDuration: z.number().int().min(1).max(14400),

  tags: z.array(z.string()).default([]),
});

export const NutritionLogSchema = z.object({
  name: z
    .string()
    .min(1, 'Food name is required')
    .max(200, 'Food name is too long')
    .trim(),
  calories: z.number().min(0).max(10000),
  protein: z.number().min(0).max(500).optional(),
  carbs: z.number().min(0).max(2000).optional(),
  fat: z.number().min(0).max(500).optional(),
  servingSize: z.string().optional(),
  servingUnit: z.string().optional(),
  category: z.enum(['meal', 'snack', 'drink', 'supplement']).default('meal'),
  date: z.date(),
  meal: z.enum(['breakfast', 'lunch', 'dinner', 'snacks']).optional(),
  notes: z.string().max(200).optional(),
});

export const GoalSettingSchema = z.object({
  title: z
    .string()
    .min(1, 'Goal title is required')
    .max(100, 'Title is too long')
    .trim(),
  description: z.string().max(500).optional(),
  targetValue: z.number(),
  currentValue: z.number(),
  unit: z.string().min(1).max(20),
  deadline: z.date().optional(),
  category: z.enum(['weight', 'exercise', 'nutrition', 'streak', 'other']),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
});

export const BodyMeasurementSchema = z.object({
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
  notes: z.string().max(200).optional(),
});

export const FastLogSchema = z
  .object({
    startTime: z.date(),
    endTime: z.date().nullable().optional(),
    targetDuration: z.number().int().min(1).max(72),
    notes: z.string().max(200).optional(),
  })
  .refine(
    data => {
      if (data.endTime) {
        return data.endTime > data.startTime;
      }
      return true;
    },
    {
      message: 'End time must be after start time',
      path: ['endTime'],
    }
  );

export type LoginInput = z.infer<typeof LoginSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;
export type ProfileEditInput = z.infer<typeof ProfileEditSchema>;
export type ExerciseCreateInput = z.infer<typeof ExerciseCreateSchema>;
export type WorkoutCreateInput = z.infer<typeof WorkoutCreateSchema>;
export type NutritionLogInput = z.infer<typeof NutritionLogSchema>;
export type GoalSettingInput = z.infer<typeof GoalSettingSchema>;
export type BodyMeasurementInput = z.infer<typeof BodyMeasurementSchema>;
export type FastLogInput = z.infer<typeof FastLogSchema>;

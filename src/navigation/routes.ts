import { NavigatorScreenParams } from '@react-navigation/native';
import { MealType } from '../services/nutrition/types';

export type RootStackParamList = {
  Test: undefined;
  Loading: undefined;
  Onboarding: undefined;
  Main: NavigatorScreenParams<MainTabParamList>;
  Profile: undefined;
  Exercise: { name: string; listedKey: string; groupedKey: string };
  ExerciseLibrary: undefined;
  Favorites: undefined;
  GeneralExercises: undefined;
  PowerLiftingExercises: undefined;
  CreateExercise: undefined;
  ExerciseSettings: { name: string; listedKey: string; groupedKey: string };
  WorkoutSession: undefined;
  Fasting: undefined;
  ProfileEdit: { profile?: any };
  ProfileSetup: undefined;
  ProfileDashboard: { profileId: string };
  ProfileGoals: { profileId: string };
  ProfileMeasurements: { profileId: string };
  Integrations: undefined;
  NotFound: undefined;
};

export type MainTabParamList = {
  HomeStack: NavigatorScreenParams<HomeStackParamList>;
  ExercisesStack: NavigatorScreenParams<ExercisesStackParamList>;
  NutritionStack: NavigatorScreenParams<NutritionStackParamList>;
  ActivityStack: NavigatorScreenParams<ActivityStackParamList>;
  SleepStack: NavigatorScreenParams<SleepStackParamList>;
  ProfileStack: NavigatorScreenParams<ProfileStackParamList>;
};

export type HomeStackParamList = {
  Home: undefined;
  EnhancedHome: undefined;
};

export type SleepStackParamList = {
  Sleep: undefined;
};

export type ActivityStackParamList = {
  Activity: undefined;
  Integrations: undefined;
};

export type ExercisesStackParamList = {
  ExerciseList: undefined;
  ExerciseLibrary: undefined;
  Favorites: undefined;
  CreateExercise: undefined;
  Exercise: { exercise: any };
  ExerciseSettings: { name: string; listedKey: string; groupedKey: string };
  WorkoutSession: undefined;
  Flexibility: undefined;
  [key: string]: any;
};

export type NutritionStackParamList = {
  Nutrition: undefined;
  FoodDiary: undefined;
  Fasting: undefined;
  Diet: undefined;
  AddFood: { meal?: MealType };
  CreateFood: undefined;
  BarcodeScanner: undefined;
  EditFoodEntry: { entryId: string };
  EditFood: { foodId: string };
};

export type ProfileStackParamList = {
  Profile: undefined;
  ProfileDashboard: { profileId: string };
  ProfileEdit: { profile?: any };
  ProfileSetup: undefined;
  ProfileGoals: { profileId: string };
  ProfileMeasurements: { profileId: string };
  Integrations: undefined;
};

export type RouteName = keyof RootStackParamList;

export const ROUTES = {
  Main: {
    HomeStack: 'HomeStack' as const,
    ExercisesStack: 'ExercisesStack' as const,
    NutritionStack: 'NutritionStack' as const,
    ActivityStack: 'ActivityStack' as const,
    SleepStack: 'SleepStack' as const,
    ProfileStack: 'ProfileStack' as const,
  },
  Home: {
    Home: 'Home' as const,
    EnhancedHome: 'Enhanced Home' as const,
  },
  Activity: {
    Activity: 'Activity' as const,
    Integrations: 'Integrations' as const,
  },
  Sleep: {
    Sleep: 'Sleep' as const,
  },
  Exercises: {
    ExerciseList: 'Exercise List' as const,
    ExerciseLibrary: 'Exercise Library' as const,
    Favorites: 'Favorites' as const,
    GeneralExercises: 'General Exercises' as const,
    PowerLiftingExercises: 'Powerlifting Exercises' as const,
    CreateExercise: 'CreateExercise' as const,
    Exercise: 'Exercise' as const,
    ExerciseSettings: 'ExerciseSettings' as const,
    WorkoutSession: 'WorkoutSession' as const,
  },
  Nutrition: {
    Nutrition: 'Nutrition' as const,
    FoodDiary: 'Food Diary' as const,
    Fasting: 'Fasting' as const,
    Diet: 'Diet' as const,
    AddFood: 'Add Food' as const,
    CreateFood: 'Create Food' as const,
    BarcodeScanner: 'Barcode Scanner' as const,
    EditFoodEntry: 'Edit Food Entry' as const,
    EditFood: 'Edit Food' as const,
  },
  Profile: {
    Profile: 'Profile' as const,
    ProfileDashboard: 'ProfileDashboard' as const,
    ProfileEdit: 'ProfileEdit' as const,
    ProfileGoals: 'ProfileGoals' as const,
    ProfileMeasurements: 'ProfileMeasurements' as const,
    Integrations: 'Integrations' as const,
  },
  NotFound: {
    NotFound: 'NotFound' as const,
  },
} as const;

export const NAVIGATION_LINKS = {
  deepLinkPrefix: 'fortibody://',
  webLinkPrefix: 'https://fortibody.app',
  supportedLinks: [
    'exercise',
    'workout',
    'fasting',
    'profile',
    'settings',
  ] as const,
};

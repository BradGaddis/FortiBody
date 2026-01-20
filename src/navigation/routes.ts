import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  Main: NavigatorScreenParams<MainTabParamList>;
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
  ProfileDashboard: { profileId: string };
  ProfileGoals: { profileId: string };
  ProfileMeasurements: { profileId: string };
  NotFound: undefined;
};

export type MainTabParamList = {
  HomeStack: NavigatorScreenParams<HomeStackParamList>;
  ExercisesStack: NavigatorScreenParams<ExercisesStackParamList>;
  NutritionStack: NavigatorScreenParams<NutritionStackParamList>;
  ProfileStack: NavigatorScreenParams<ProfileStackParamList>;
};

export type HomeStackParamList = {
  Home: undefined;
  EnhancedHome: undefined;
};

export type ExercisesStackParamList = {
  ExerciseList: undefined;
  ExerciseLibrary: undefined;
  Favorites: undefined;
  GeneralExercises: undefined;
  PowerLiftingExercises: undefined;
  CreateExercise: undefined;
  Exercise: { name: string; listedKey: string; groupedKey: string };
  ExerciseSettings: { name: string; listedKey: string; groupedKey: string };
  WorkoutSession: undefined;
  [key: string]: any;
};

export type NutritionStackParamList = {
  Nutrition: undefined;
  Fasting: undefined;
  Diet: undefined;
  AddFood: undefined;
  BarcodeScanner: undefined;
};

export type ProfileStackParamList = {
  Profile: undefined;
  ProfileDashboard: { profileId: string };
  ProfileEdit: { profile?: any };
  ProfileGoals: { profileId: string };
  ProfileMeasurements: { profileId: string };
};

export type RouteName = keyof RootStackParamList;

export const ROUTES = {
  Main: {
    HomeStack: 'HomeStack' as const,
    ExercisesStack: 'ExercisesStack' as const,
    NutritionStack: 'NutritionStack' as const,
    ProfileStack: 'ProfileStack' as const,
  },
  Home: {
    Home: 'Home' as const,
    EnhancedHome: 'Enhanced Home' as const,
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
    Fasting: 'Fasting' as const,
    Diet: 'Diet' as const,
    AddFood: 'Add Food' as const,
    BarcodeScanner: 'Barcode Scanner' as const,
  },
  Profile: {
    Profile: 'Profile' as const,
    ProfileDashboard: 'ProfileDashboard' as const,
    ProfileEdit: 'ProfileEdit' as const,
    ProfileGoals: 'ProfileGoals' as const,
    ProfileMeasurements: 'ProfileMeasurements' as const,
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

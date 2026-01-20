// Navigation Type Definitions
export type RootStackParamList = {
  'Enhanced Home': undefined;
  'Exercise': { name: string; listedKey: string; groupedKey: string };
  'ExerciseLibrary': undefined;
  'Favorites': undefined;
  'GeneralExercises': undefined;
  'PowerLiftingExercises': undefined;
  'CreateExercise': undefined;
  'ExerciseSettings': { name: string; listedKey: string; groupedKey: string };
  'WorkoutSession': undefined;
  'Fasting': undefined;
  'ProfileEdit': { profile?: any };
  'ProfileDashboard': { profileId: string };
  'ProfileGoals': { profileId: string };
  'ProfileMeasurements': { profileId: string };
};

export type AppTabParamList = {
  Home: undefined;
  Exercises: undefined;
  Nutrition: undefined;
  Profile: undefined;
};

export type NavigationPropType<T extends keyof RootStackParamList> = {
  navigate: (screen: T, params?: RootStackParamList[T]) => void;
  goBack: () => void;
  reset: (state: Partial<RootStackParamList>) => void;
  dispatch: (action: any) => void;
  setOptions: (options: any) => void;
  isFocused: () => boolean;
  addListener: (type: string, listener: (event: any) => void) => void;
  removeListener: (type: string, listener: (event: any) => void);
};
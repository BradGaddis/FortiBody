import { LinkingOptions } from '@react-navigation/native';
import { RootStackParamList } from './routes';

export const deepLinkingConfig: LinkingOptions<RootStackParamList> = {
  prefixes: ['fortibody://', 'https://fortibody.app'],
  config: {
    screens: {
      Main: {
        screens: {
          HomeStack: {
            screens: {
              Home: '',
              EnhancedHome: 'home',
            },
          },
          ExercisesStack: {
            screens: {
              ExerciseList: 'exercises',
              ExerciseLibrary: 'exercises/library',
              Favorites: 'exercises/favorites',
              GeneralExercises: 'exercises/general',
              PowerLiftingExercises: 'exercises/powerlifting',
              CreateExercise: 'exercises/create',
              Exercise: 'exercise/:name/:listedKey/:groupedKey',
              ExerciseSettings: 'exercise/:name/settings',
              WorkoutSession: 'workout/session',
            },
          },
          NutritionStack: {
            screens: {
              Nutrition: 'nutrition',
              Fasting: 'fasting',
              Diet: 'nutrition/diet',
            },
          },
          ProfileStack: {
            screens: {
              Profile: 'profile',
              ProfileDashboard: 'profile/:profileId',
              ProfileEdit: 'profile/edit',
              ProfileGoals: 'profile/:profileId/goals',
              ProfileMeasurements: 'profile/:profileId/measurements',
            },
          },
        },
      },
      NotFound: '*',
    },
  },
};

export const navigationAnimationConfig = {
  gestureEnabled: true,
  gestureDirection: 'horizontal' as const,
  headerMode: 'float' as const,
  cardStyleInterpolator: ({
    current,
    layouts,
  }: {
    current: any;
    layouts: any;
  }) => {
    return {
      cardStyle: {
        transform: [
          {
            translateX: current.progress.interpolate({
              inputRange: [0, 1],
              outputRange: [layouts.screen.width, 0],
            }),
          },
        ],
      },
    };
  },
  transitionSpec: {
    open: {
      animation: 'timing',
      config: { duration: 300 },
    },
    close: {
      animation: 'timing',
      config: { duration: 300 },
    },
  },
};

export const screenOptions = {
  headerShown: false,
  gestureEnabled: true,
  gestureDirection: 'horizontal' as const,
  cardStyle: {
    backgroundColor: 'transparent',
  },
};

export const defaultScreenOptions = {
  ...screenOptions,
  headerStyle: {
    backgroundColor: '#4CAF50',
  },
  headerTintColor: '#FFFFFF',
  headerTitleStyle: {
    fontWeight: '600' as const,
  },
  headerBackTitleVisible: false,
};

import { useNavigation, useRoute } from '@react-navigation/native';
import { RootStackParamList, ROUTES } from './routes';
import { CommonActions } from '@react-navigation/native';

export const useAppNavigation = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();

  const navigateTo = (screen: keyof RootStackParamList, params?: any) => {
    navigation.navigate(screen, params);
  };

  const navigateToHome = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      })
    );
  };

  const navigateToAuth = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Auth' }],
      })
    );
  };

  const goBack = () => {
    navigation.goBack();
  };

  const canGoBack = () => {
    return navigation.canGoBack();
  };

  const resetNavigation = (screen: keyof RootStackParamList) => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: screen }],
      })
    );
  };

  const navigateToExercise = (
    name: string,
    listedKey: string,
    groupedKey: string
  ) => {
    navigation.navigate('Exercise', { name, listedKey, groupedKey });
  };

  const navigateToProfile = (profileId: string) => {
    navigation.navigate('ProfileDashboard', { profileId });
  };

  const navigateToFasting = () => {
    navigation.navigate('Main', {
      screen: 'NutritionStack',
      params: { screen: 'Fasting' },
    });
  };

  const navigateToExerciseLibrary = () => {
    navigation.navigate('Main', {
      screen: 'ExercisesStack',
      params: { screen: 'ExerciseLibrary' },
    });
  };

  const navigateToWorkoutSession = () => {
    navigation.navigate('Main', {
      screen: 'ExercisesStack',
      params: { screen: 'WorkoutSession' },
    });
  };

  return {
    navigation,
    route,
    navigateTo,
    navigateToHome,
    navigateToAuth,
    goBack,
    canGoBack,
    resetNavigation,
    navigateToExercise,
    navigateToProfile,
    navigateToFasting,
    navigateToExerciseLibrary,
    navigateToWorkoutSession,
    ROUTES,
  };
};

export default useAppNavigation;

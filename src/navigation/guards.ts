import { useEffect } from 'react';
import { CommonActions, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from './routes';

export const useOnboardingGuard = (
  onCompleteRoute: keyof RootStackParamList = 'Main'
): void => {
  const navigation = useNavigation<any>();

  useEffect(() => {
    const checkOnboarding = async () => {
      const completed = await AsyncStorage.getItem('@onboarding_completed');
      if (completed === 'true') {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: onCompleteRoute }],
          })
        );
      }
    };

    checkOnboarding();
  }, [navigation, onCompleteRoute]);
};

export const completeOnboarding = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem('@onboarding_completed', 'true');
  } catch (error) {
    console.error('Error completing onboarding:', error);
  }
};

export const resetOnboarding = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem('@onboarding_completed');
  } catch (error) {
    console.error('Error resetting onboarding:', error);
  }
};

export const markFirstLaunchComplete = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem('@fortibody_first_launch', 'false');
  } catch (error) {
    console.error('Error marking first launch:', error);
  }
};

export const isFirstLaunch = async (): Promise<boolean> => {
  try {
    const firstLaunch = await AsyncStorage.getItem('@fortibody_first_launch');
    return firstLaunch !== 'false';
  } catch {
    return true;
  }
};

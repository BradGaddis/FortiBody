import AsyncStorage from '@react-native-async-storage/async-storage';
import UserProfileService from '../services/user/UserProfileService';

const ONBOARDING_COMPLETE_KEY = '@fortibody_onboarding_complete';
const ONBOARDING_STEP_KEY = '@fortibody_onboarding_step';
const ONBOARDING_DATA_KEY = '@fortibody_onboarding_data';

export type OnboardingStep =
  | 'welcome'
  | 'goals'
  | 'profile'
  | 'notifications'
  | 'privacy'
  | 'complete';

export interface OnboardingData {
  goals: string[];
  fitnessLevel: 'beginner' | 'intermediate';
  primaryGoal: string;
  name: string;
  age: number;
  notificationsEnabled: boolean;
}

const defaultOnboardingData: OnboardingData = {
  goals: [],
  fitnessLevel: 'beginner',
  primaryGoal: '',
  name: '',
  age: 25,
  notificationsEnabled: true,
};

export const OnboardingSteps: OnboardingStep[] = [
  'welcome',
  'goals',
  'profile',
  'notifications',
  'privacy',
  'complete',
];

export const isOnboardingComplete = async (): Promise<boolean> => {
  try {
    const complete = await AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY);
    console.log('🔍 isOnboardingComplete read:', complete, 'type:', typeof complete);
    return complete === 'true';
  } catch {
    console.log('🔍 isOnboardingComplete catch error, returning false');
    return false;
  }
};

export const setOnboardingComplete = async (): Promise<void> => {
  try {
    console.log('💾 Saving onboarding complete status...');
    
    let onboardingData: OnboardingData | null = null;
    try {
      onboardingData = await getOnboardingData();
      console.log('💾 Onboarding data found:', JSON.stringify(onboardingData));
    } catch (e) {
      console.log('💾 No existing onboarding data found');
    }
    
    const profileService = new UserProfileService();
    const existingProfile = await profileService.getActiveProfile();
    console.log('💾 Existing profile before migration:', JSON.stringify(existingProfile));
    
    const hasUserData = onboardingData && (onboardingData.name || onboardingData.age);
    console.log('💾 hasUserData:', hasUserData, 'name:', onboardingData?.name, 'age:', onboardingData?.age);
    const isDefaultProfile = existingProfile?.name === 'Guest User';
    
    if (!existingProfile || isDefaultProfile) {
      if (hasUserData && onboardingData?.name) {
        await profileService.saveProfile({
          id: 'active',
          name: onboardingData.name,
          age: onboardingData.age,
          gender: 'other',
          height: 170,
          weight: 70,
          weightUnit: 'kg',
          activityLevel: 2,
          goals: [],
          medicalConditions: [],
          limitations: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        console.log('✅ Onboarding data migrated to UserProfileService with name:', onboardingData.name);
      } else {
        console.log('⚠️ No onboarding data to migrate. hasUserData:', hasUserData, 'onboardingData:', onboardingData);
      }
    } else {
      console.log('✅ Profile already exists, no migration needed');
    }
    
    await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
    await AsyncStorage.removeItem(ONBOARDING_STEP_KEY);
    await AsyncStorage.removeItem(ONBOARDING_DATA_KEY);
    console.log('✅ Onboarding complete status saved!');
    
    // Verify profile was saved
    const savedProfile = await profileService.getActiveProfile();
    console.log('💾 Profile after save:', JSON.stringify(savedProfile));
  } catch (error) {
    console.error('Failed to set onboarding complete:', error);
  }
};

export const getOnboardingStep = async (): Promise<OnboardingStep> => {
  try {
    const step = await AsyncStorage.getItem(ONBOARDING_STEP_KEY);
    if (step && OnboardingSteps.includes(step as OnboardingStep)) {
      return step as OnboardingStep;
    }
    return 'welcome';
  } catch {
    return 'welcome';
  }
};

export const setOnboardingStep = async (
  step: OnboardingStep
): Promise<void> => {
  try {
    await AsyncStorage.setItem(ONBOARDING_STEP_KEY, step);
  } catch (error) {
    console.error('Failed to set onboarding step:', error);
  }
};

export const getOnboardingData = async (): Promise<OnboardingData> => {
  try {
    const data = await AsyncStorage.getItem(ONBOARDING_DATA_KEY);
    return data ? JSON.parse(data) : { ...defaultOnboardingData };
  } catch {
    return { ...defaultOnboardingData };
  }
};

export const updateOnboardingData = async (
  updates: Partial<OnboardingData>
): Promise<void> => {
  try {
    const current = await getOnboardingData();
    const updated = { ...current, ...updates };
    await AsyncStorage.setItem(ONBOARDING_DATA_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to update onboarding data:', error);
  }
};

export const resetOnboarding = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(ONBOARDING_COMPLETE_KEY);
    await AsyncStorage.removeItem(ONBOARDING_STEP_KEY);
    await AsyncStorage.removeItem(ONBOARDING_DATA_KEY);
  } catch (error) {
    console.error('Failed to reset onboarding:', error);
  }
};

export const skipOnboarding = async (): Promise<void> => {
  try {
    await setOnboardingComplete();
  } catch (error) {
    console.error('Failed to skip onboarding:', error);
  }
};

export const completeOnboardingStep = async (
  currentStep: OnboardingStep
): Promise<OnboardingStep> => {
  const currentIndex = OnboardingSteps.indexOf(currentStep);
  if (currentIndex < OnboardingSteps.length - 1) {
    const nextStep = OnboardingSteps[currentIndex + 1];
    if (nextStep) {
      await setOnboardingStep(nextStep);
      return nextStep;
    }
  }
  await setOnboardingComplete();
  return 'complete';
};

export const onboardingStepTitles: Record<OnboardingStep, string> = {
  welcome: 'Welcome',
  goals: 'Your Goals',
  profile: 'About You',
  notifications: 'Notifications',
  privacy: 'Privacy',
  complete: 'Complete',
};

export const onboardingStepDescriptions: Record<OnboardingStep, string> = {
  welcome: 'Welcome to FortiBody',
  goals: 'What do you want to achieve?',
  profile: 'Tell us a bit about yourself',
  notifications: 'Stay on track with reminders',
  privacy: 'Your data, your control',
  complete: "You're all set!",
};

export const GOAL_OPTIONS = [
  { id: 'weight_loss', title: 'Weight Loss', icon: 'body' },
  { id: 'muscle_gain', title: 'Build Muscle', icon: 'body' },
  { id: 'endurance', title: 'Improve Endurance', icon: 'walk' },
  { id: 'flexibility', title: 'Increase Flexibility', icon: 'water' },
  { id: 'strength', title: 'Get Stronger', icon: 'barbell' },
  { id: 'general_fitness', title: 'General Fitness', icon: 'fitness' },
];

export const FITNESS_LEVELS = [
  { id: 'beginner', title: 'Beginner', description: 'Just starting out' },
  { id: 'intermediate', title: 'Intermediate', description: 'Some experience' },
];

export const NOTIFICATION_PREFERENCES = [
  {
    id: 'workout_reminder',
    title: 'Workout Reminders',
    description: 'Daily exercise prompts',
  },
  {
    id: 'progress',
    title: 'Progress Updates',
    description: 'Weekly achievements',
  },
  {
    id: 'nutrition',
    title: 'Nutrition Tips',
    description: 'Healthy eating advice',
  },
  {
    id: 'social',
    title: 'Community Updates',
    description: 'Tips and motivation',
  },
];

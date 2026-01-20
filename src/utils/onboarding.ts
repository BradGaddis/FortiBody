import AsyncStorage from '@react-native-async-storage/async-storage';

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
  analyticsEnabled: boolean;
}

const defaultOnboardingData: OnboardingData = {
  goals: [],
  fitnessLevel: 'beginner',
  primaryGoal: '',
  name: '',
  age: 25,
  notificationsEnabled: true,
  analyticsEnabled: true,
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
    return complete === 'true';
  } catch {
    return false;
  }
};

export const setOnboardingComplete = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
    await AsyncStorage.removeItem(ONBOARDING_STEP_KEY);
    await AsyncStorage.removeItem(ONBOARDING_DATA_KEY);
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
  { id: 'weight_loss', title: 'Weight Loss', icon: 'scale-bathroom' },
  { id: 'muscle_gain', title: 'Build Muscle', icon: 'dumbbell' },
  { id: 'endurance', title: 'Improve Endurance', icon: 'run' },
  { id: 'flexibility', title: 'Increase Flexibility', icon: 'yoga' },
  { id: 'strength', title: 'Get Stronger', icon: 'arm-flex' },
  { id: 'general_fitness', title: 'General Fitness', icon: 'heart-pulse' },
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

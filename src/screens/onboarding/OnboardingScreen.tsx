import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/routes';
import { Ionicons } from '@expo/vector-icons';
import {
  OnboardingStep,
  OnboardingData,
  getOnboardingStep,
  setOnboardingStep,
  completeOnboardingStep,
  getOnboardingData,
  updateOnboardingData,
  OnboardingSteps,
  GOAL_OPTIONS,
  FITNESS_LEVELS,
} from '../../utils/onboarding';
import { isOnboardingComplete, setOnboardingComplete } from '../../utils/onboarding';
import { ProfileForm } from '../../components/profile/ProfileForm';

const { width: screenWidth } = Dimensions.get('window');

interface OnboardingScreenProps {
  onComplete?: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  onComplete,
}) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null);
  const [loading, setLoading] = useState(true);

  console.log('🧪 OnboardingScreen rendering, step:', currentStep);

  useEffect(() => {
    console.log('🧪 OnboardingScreen useEffect running');
    loadOnboardingState();
  }, []);

  const loadOnboardingState = async () => {
    try {
      console.log('🧪 Loading onboarding state...');
      const step = await getOnboardingStep();
      const data = await getOnboardingData();
      console.log('🧪 Loaded step:', step, 'data:', data);
      setCurrentStep(step);
      setOnboardingData(data);
    } catch (error) {
      console.error('🧪 Failed to load onboarding state:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    console.log('🧪 handleNext called, current step:', currentStep);
    try {
      if (currentStep === 'welcome') {
        await setOnboardingStep('goals');
        setCurrentStep('goals');
        return;
      }
      
      if (currentStep === 'goals') {
        if (!onboardingData?.goals.length) {
          alert('Please select at least one goal');
          return;
        }
        await updateOnboardingData(onboardingData!);
        await setOnboardingStep('profile');
        setCurrentStep('profile');
        return;
      }
      
      if (currentStep === 'profile') {
        return;
      }
      
      if (currentStep === 'notifications') {
        await updateOnboardingData(onboardingData!);
        await setOnboardingStep('privacy');
        setCurrentStep('privacy');
        return;
      }
      
      if (currentStep === 'privacy') {
        console.log('🧪 Completing onboarding...');
        await updateOnboardingData(onboardingData!);
        await setOnboardingComplete();
        console.log('🧪 Onboarding saved to AsyncStorage');
        await onComplete?.();
        console.log('🧪 onComplete callback done');
        navigation.reset({
          index: 0,
          routes: [{ name: 'Main' }],
        });
        return;
      }
    } catch (error) {
      console.error('🧪 Failed to advance onboarding:', error);
    }
  };

  const handleBack = async () => {
    try {
      const currentIndex = OnboardingSteps.indexOf(currentStep);
      if (currentIndex > 0) {
        const prevStep = OnboardingSteps[currentIndex - 1];
        await setOnboardingStep(prevStep);
        setCurrentStep(prevStep);
      } else {
        navigation.goBack();
      }
    } catch (error) {
      console.error('Failed to go back:', error);
    }
  };

  const handleProfileComplete = async (name: string, age: number, goals: string[]) => {
    console.log('🧪 handleProfileComplete called, name:', name, 'age:', age, 'goals:', goals);
    
    if (!name.trim()) {
      alert('Please enter your name');
      return;
    }
    
    const skippedOnboarding = goals.length === 0;
    
    if (skippedOnboarding) {
      console.log('🧪 Completing onboarding from skipped flow...');
      await updateOnboardingData({ name: name.trim(), age });
      await setOnboardingComplete();
      await onComplete?.();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
      return;
    }
    
    await updateOnboardingData({ name: name.trim(), age });
    await setOnboardingStep('notifications');
    setCurrentStep('notifications');
  };

  const toggleGoal = (goalId: string) => {
    const currentGoals = onboardingData?.goals || [];
    const newGoals = currentGoals.includes(goalId)
      ? currentGoals.filter(g => g !== goalId)
      : [...currentGoals, goalId];
    setOnboardingData(prev => prev ? { ...prev, goals: newGoals } : null);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {currentStep !== 'welcome' && (
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
      )}

      <ScrollView style={styles.scrollContainer}>
      {currentStep === 'welcome' && (
        <View style={styles.stepContainer}>
          <Text style={styles.title}>Welcome to FortiBody</Text>
          <Text style={styles.subtitle}>Your personal fitness companion</Text>
          <TouchableOpacity style={styles.button} onPress={handleNext}>
            <Text style={styles.buttonText}>Get Started</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.skipButton} 
            onPress={async () => {
              // Skip to profile setup
              await setOnboardingStep('profile');
              setCurrentStep('profile');
            }}
          >
            <Text style={styles.skipButtonText}>Skip for now (go to profile)</Text>
          </TouchableOpacity>
        </View>
      )}

        {currentStep === 'goals' && (
          <View style={styles.stepContainer}>
            <Text style={styles.title}>What are your goals?</Text>
            <Text style={styles.subtitle}>Select all that apply</Text>
            <View style={styles.goalsGrid}>
              {GOAL_OPTIONS.map(goal => (
                <TouchableOpacity
                  key={goal.id}
                  style={[
                    styles.goalCard,
                    {
                      backgroundColor: onboardingData?.goals.includes(goal.id)
                        ? '#4CAF50'
                        : '#f5f5f5',
                    },
                  ]}
                  onPress={() => toggleGoal(goal.id)}
                >
                  <Ionicons
                    name={goal.icon as any}
                    size={28}
                    color={onboardingData?.goals.includes(goal.id) ? '#fff' : '#666'}
                  />
                  <Text
                    style={[
                      styles.goalText,
                      { color: onboardingData?.goals.includes(goal.id) ? '#fff' : '#333' },
                    ]}
                  >
                    {goal.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              style={[styles.button, !onboardingData?.goals.length && styles.disabledButton]}
              onPress={handleNext}
              disabled={!onboardingData?.goals.length}
            >
              <Text style={styles.buttonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        )}

        {currentStep === 'profile' && (
          <ProfileForm
            isOnboarding={true}
            initialName={onboardingData?.name || ''}
            initialAge={onboardingData?.age ? String(onboardingData.age) : ''}
            onSave={(name, age) => {
              setOnboardingData(prev => prev ? { ...prev, name, age } : { goals: [], fitnessLevel: 'beginner', primaryGoal: '', name, age, notificationsEnabled: true });
            }}
            onComplete={(name, age) => {
              handleProfileComplete(name, parseInt(age) || 0, onboardingData?.goals || []);
            }}
          />
        )}

        {currentStep === 'notifications' && (
          <View style={styles.stepContainer}>
            <Text style={styles.title}>Notifications</Text>
            <Text style={styles.subtitle}>Stay on track with reminders</Text>
            
            <TouchableOpacity
              style={styles.toggleRow}
              onPress={() => setOnboardingData(prev => prev ? { ...prev, notificationsEnabled: !prev.notificationsEnabled } : null)}
            >
              <Text style={styles.toggleText}>Enable notifications</Text>
              <View style={[
                styles.toggle,
                { backgroundColor: onboardingData?.notificationsEnabled ? '#4CAF50' : '#ccc' }
              ]}>
                <View style={[
                  styles.toggleKnob,
                  { transform: [{ translateX: onboardingData?.notificationsEnabled ? 20 : 0 }] }
                ]} />
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.button} onPress={handleNext}>
              <Text style={styles.buttonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        )}

        {currentStep === 'privacy' && (
          <View style={styles.stepContainer}>
            <Text style={styles.title}>Privacy</Text>
            <Text style={styles.subtitle}>Your data is safe with us</Text>
            
            <View style={styles.privacyInfo}>
              <Ionicons name="shield-checkmark" size={48} color="#4CAF50" />
              <Text style={styles.privacyText}>
                We never share your personal data with third parties.
                All your fitness data stays on your device.
              </Text>
            </View>
            
            <TouchableOpacity style={styles.button} onPress={handleNext}>
              <Text style={styles.buttonText}>Complete Setup</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    flex: 1,
  },
  stepContainer: {
    flex: 1,
    padding: 20,
    paddingTop: 40,
  },
  backButton: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  skipButton: {
    marginTop: 15,
    padding: 15,
  },
  skipButtonText: {
    color: '#999',
    fontSize: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  goalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 15,
  },
  goalCard: {
    width: (screenWidth - 70) / 2,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    gap: 10,
  },
  goalText: {
    fontSize: 14,
    fontWeight: '500',
  },
  fitnessLevels: {
    gap: 10,
    marginTop: 10,
  },
  fitnessCard: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  fitnessText: {
    fontSize: 16,
    fontWeight: '500',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  toggleText: {
    fontSize: 18,
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    padding: 2,
  },
  toggleKnob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  privacyInfo: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    marginVertical: 20,
  },
  privacyText: {
    marginTop: 15,
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
  },
});

export default OnboardingScreen;

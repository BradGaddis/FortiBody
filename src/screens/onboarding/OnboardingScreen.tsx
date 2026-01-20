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
import { Ionicons } from '@expo/vector-icons';
import {
  OnboardingStep,
  OnboardingData,
  getOnboardingStep,
  setOnboardingStep,
  completeOnboardingStep,
  getOnboardingData,
  updateOnboardingData,
  skipOnboarding,
  OnboardingSteps,
  onboardingStepTitles,
  onboardingStepDescriptions,
  GOAL_OPTIONS,
  FITNESS_LEVELS,
} from '../../utils/onboarding';
import { useFortiBodyTheme } from '../../theme/ThemeProvider';
import { Button, Card, ThemedText } from '../../theme/components';

const { width: screenWidth } = Dimensions.get('window');

interface OnboardingScreenProps {
  onComplete?: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  onComplete,
}) => {
  const navigation = useNavigation();
  const theme = useFortiBodyTheme();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOnboardingState();
  }, []);

  const loadOnboardingState = async () => {
    try {
      const step = await getOnboardingStep();
      const data = await getOnboardingData();
      setCurrentStep(step);
      setOnboardingData(data);
    } catch (error) {
      console.error('Failed to load onboarding state:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    try {
      const nextStep = await completeOnboardingStep(currentStep);
      setCurrentStep(nextStep);

      if (nextStep === 'complete') {
        onComplete?.();
        if (navigation.canGoBack()) {
          navigation.goBack();
        }
      }
    } catch (error) {
      console.error('Failed to advance onboarding:', error);
    }
  };

  const handleSkip = async () => {
    try {
      await skipOnboarding();
      onComplete?.();
      if (navigation.canGoBack()) {
        navigation.goBack();
      }
    } catch (error) {
      console.error('Failed to skip onboarding:', error);
    }
  };

  const updateData = async (updates: Partial<OnboardingData>) => {
    try {
      const newData = { ...onboardingData, ...updates } as OnboardingData;
      setOnboardingData(newData);
      await updateOnboardingData(updates);
    } catch (error) {
      console.error('Failed to update onboarding data:', error);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'welcome':
        return <WelcomeStep onNext={handleNext} onSkip={handleSkip} />;
      case 'goals':
        return (
          <GoalsStep
            data={onboardingData}
            onUpdate={updateData}
            onNext={handleNext}
          />
        );
      case 'profile':
        return (
          <ProfileStep
            data={onboardingData}
            onUpdate={updateData}
            onNext={handleNext}
          />
        );
      case 'notifications':
        return (
          <NotificationsStep
            data={onboardingData}
            onUpdate={updateData}
            onNext={handleNext}
          />
        );
      case 'privacy':
        return (
          <PrivacyStep
            data={onboardingData}
            onUpdate={updateData}
            onNext={handleNext}
          />
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          { backgroundColor: theme.colors.background.light.primary },
        ]}
      >
        <View style={styles.loadingContainer}>
          <ThemedText variant="h4">Loading...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  const currentIndex = OnboardingSteps.indexOf(currentStep);
  const progress = currentIndex / (OnboardingSteps.length - 1);

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: theme.colors.background.light.primary },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
        </View>
        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
          <ThemedText variant="caption" color="secondary">
            Skip
          </ThemedText>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.stepContainer}>{renderStep()}</View>
      </ScrollView>

      {currentStep !== 'welcome' && currentStep !== 'complete' && (
        <View style={styles.footer}>
          <View style={styles.stepIndicator}>
            {OnboardingSteps.slice(0, -1).map((step, index) => (
              <View
                key={step}
                style={[
                  styles.stepDot,
                  {
                    backgroundColor:
                      index === currentIndex
                        ? theme.colors.primary[500]
                        : index < currentIndex
                          ? theme.colors.primary[300]
                          : theme.colors.neutral[300],
                  },
                ]}
              />
            ))}
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

interface StepProps {
  onNext: () => void;
  onSkip?: () => void;
}

const WelcomeStep: React.FC<StepProps> = ({ onNext, onSkip }) => {
  const theme = useFortiBodyTheme();

  return (
    <View style={styles.welcomeStep}>
      <View style={styles.logoContainer}>
        <View
          style={[styles.logo, { backgroundColor: theme.colors.primary[500] }]}
        >
          <Ionicons name="fitness" size={48} color="#FFFFFF" />
        </View>
      </View>

      <ThemedText variant="h2" style={styles.welcomeTitle}>
        Welcome to FortiBody
      </ThemedText>

      <ThemedText
        variant="body"
        color="secondary"
        style={styles.welcomeSubtitle}
      >
        Your personal fitness journey starts here. Let's set up your profile to
        get the most out of the app.
      </ThemedText>

      <View style={styles.welcomeFeatures}>
        <FeatureItem icon="barbell" text="Track your workouts" />
        <FeatureItem icon="restaurant" text="Monitor nutrition" />
        <FeatureItem icon="trophy" text="Achieve your goals" />
      </View>

      <View style={styles.welcomeActions}>
        <Button title="Get Started" onPress={onNext} size="lg" fullWidth />
        {onSkip && (
          <TouchableOpacity onPress={onSkip} style={styles.skipLink}>
            <ThemedText variant="body" color="secondary">
              Skip for now
            </ThemedText>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const FeatureItem: React.FC<{ icon: string; text: string }> = ({
  icon,
  text,
}) => {
  const theme = useFortiBodyTheme();

  return (
    <View style={styles.featureItem}>
      <View
        style={[
          styles.featureIcon,
          { backgroundColor: theme.colors.primary[100] },
        ]}
      >
        <Ionicons
          name={icon as any}
          size={20}
          color={theme.colors.primary[500]}
        />
      </View>
      <ThemedText variant="body">{text}</ThemedText>
    </View>
  );
};

interface GoalsStepProps extends StepProps {
  data: OnboardingData | null;
  onUpdate: (updates: Partial<OnboardingData>) => void;
}

const GoalsStep: React.FC<GoalsStepProps> = ({ data, onUpdate, onNext }) => {
  const theme = useFortiBodyTheme();
  const selectedGoals = data?.goals || [];

  const toggleGoal = (goalId: string) => {
    const newGoals = selectedGoals.includes(goalId)
      ? selectedGoals.filter(id => id !== goalId)
      : [...selectedGoals, goalId];
    onUpdate({ goals: newGoals });
  };

  const handleNext = () => {
    if (selectedGoals.length > 0) {
      onNext();
    }
  };

  return (
    <View style={styles.stepContent}>
      <ThemedText variant="h4" style={styles.stepTitle}>
        What are your goals?
      </ThemedText>
      <ThemedText variant="body" color="secondary" style={styles.stepSubtitle}>
        Select all that apply
      </ThemedText>

      <View style={styles.goalsGrid}>
        {GOAL_OPTIONS.map(goal => (
          <TouchableOpacity
            key={goal.id}
            style={[
              styles.goalCard,
              {
                backgroundColor: selectedGoals.includes(goal.id)
                  ? theme.colors.primary[500]
                  : theme.colors.neutral[0],
                borderColor: selectedGoals.includes(goal.id)
                  ? theme.colors.primary[500]
                  : theme.colors.neutral[300],
              },
            ]}
            onPress={() => toggleGoal(goal.id)}
          >
            <Ionicons
              name={goal.icon as any}
              size={28}
              color={
                selectedGoals.includes(goal.id)
                  ? '#FFFFFF'
                  : theme.colors.neutral[600]
              }
            />
            <ThemedText
              variant="bodySmall"
              style={[
                styles.goalText,
                {
                  color: selectedGoals.includes(goal.id)
                    ? '#FFFFFF'
                    : theme.colors.text.primary,
                },
              ]}
            >
              {goal.title}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>

      <Button
        title="Continue"
        onPress={handleNext}
        disabled={selectedGoals.length === 0}
        fullWidth
      />
    </View>
  );
};

interface ProfileStepProps extends StepProps {
  data: OnboardingData | null;
  onUpdate: (updates: Partial<OnboardingData>) => void;
}

const ProfileStep: React.FC<ProfileStepProps> = ({
  data,
  onUpdate,
  onNext,
}) => {
  const theme = useFortiBodyTheme();

  return (
    <View style={styles.stepContent}>
      <ThemedText variant="h4" style={styles.stepTitle}>
        About You
      </ThemedText>
      <ThemedText variant="body" color="secondary" style={styles.stepSubtitle}>
        Help us personalize your experience
      </ThemedText>

      <ThemedText
        variant="bodySmall"
        color="secondary"
        style={styles.sectionLabel}
      >
        Your Name
      </ThemedText>
      <View
        style={[
          styles.inputContainer,
          { borderColor: theme.colors.neutral[300] },
        ]}
      >
        <TextInput
          style={styles.textInput}
          value={data?.name || ''}
          onChangeText={name => onUpdate({ name })}
          placeholder="Enter your name"
        />
      </View>

      <ThemedText
        variant="bodySmall"
        color="secondary"
        style={styles.sectionLabel}
      >
        Fitness Level
      </ThemedText>
      <View style={styles.levelButtons}>
        {FITNESS_LEVELS.map(level => (
          <TouchableOpacity
            key={level.id}
            style={[
              styles.levelButton,
              {
                backgroundColor:
                  data?.fitnessLevel === level.id
                    ? theme.colors.primary[500]
                    : theme.colors.neutral[0],
                borderColor:
                  data?.fitnessLevel === level.id
                    ? theme.colors.primary[500]
                    : theme.colors.neutral[300],
              },
            ]}
            onPress={() => onUpdate({ fitnessLevel: level.id as any })}
          >
            <ThemedText
              variant="bodySmall"
              style={{
                color:
                  data?.fitnessLevel === level.id
                    ? '#FFFFFF'
                    : theme.colors.text.primary,
                fontWeight: '600',
              }}
            >
              {level.title}
            </ThemedText>
            <ThemedText
              variant="caption"
              style={{
                color:
                  data?.fitnessLevel === level.id
                    ? 'rgba(255,255,255,0.8)'
                    : theme.colors.text.secondary,
              }}
            >
              {level.description}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>

      <Button
        title="Continue"
        onPress={onNext}
        disabled={!data?.name}
        fullWidth
      />
    </View>
  );
};

interface NotificationsStepProps extends StepProps {
  data: OnboardingData | null;
  onUpdate: (updates: Partial<OnboardingData>) => void;
}

const NotificationsStep: React.FC<NotificationsStepProps> = ({
  data,
  onUpdate,
  onNext,
}) => {
  const theme = useFortiBodyTheme();

  return (
    <View style={styles.stepContent}>
      <ThemedText variant="h4" style={styles.stepTitle}>
        Stay Connected
      </ThemedText>
      <ThemedText variant="body" color="secondary" style={styles.stepSubtitle}>
        Enable notifications to stay on track
      </ThemedText>

      <Card style={styles.notificationCard}>
        <View style={styles.notificationRow}>
          <View style={styles.notificationInfo}>
            <ThemedText variant="body">Push Notifications</ThemedText>
            <ThemedText variant="caption" color="secondary">
              Receive updates and reminders
            </ThemedText>
          </View>
          <TouchableOpacity
            style={[
              styles.toggle,
              {
                backgroundColor: data?.notificationsEnabled
                  ? theme.colors.primary[500]
                  : theme.colors.neutral[300],
              },
            ]}
            onPress={() =>
              onUpdate({ notificationsEnabled: !data?.notificationsEnabled })
            }
          >
            <View
              style={[
                styles.toggleKnob,
                {
                  transform: [
                    { translateX: data?.notificationsEnabled ? 20 : 0 },
                  ],
                },
              ]}
            />
          </TouchableOpacity>
        </View>
      </Card>

      <Button title="Continue" onPress={onNext} fullWidth />
    </View>
  );
};

interface PrivacyStepProps extends StepProps {
  data: OnboardingData | null;
  onUpdate: (updates: Partial<OnboardingData>) => void;
}

const PrivacyStep: React.FC<PrivacyStepProps> = ({
  data,
  onUpdate,
  onNext,
}) => {
  const theme = useFortiBodyTheme();

  return (
    <View style={styles.stepContent}>
      <ThemedText variant="h4" style={styles.stepTitle}>
        Your Privacy
      </ThemedText>
      <ThemedText variant="body" color="secondary" style={styles.stepSubtitle}>
        Control your data
      </ThemedText>

      <Card style={styles.privacyCard}>
        <View style={styles.privacyRow}>
          <View style={styles.privacyInfo}>
            <Ionicons
              name="analytics-outline"
              size={24}
              color={theme.colors.primary[500]}
            />
            <View style={styles.privacyText}>
              <ThemedText variant="body">Help Improve FortiBody</ThemedText>
              <ThemedText variant="caption" color="secondary">
                Anonymous usage data
              </ThemedText>
            </View>
          </View>
          <TouchableOpacity
            style={[
              styles.toggle,
              {
                backgroundColor: data?.analyticsEnabled
                  ? theme.colors.primary[500]
                  : theme.colors.neutral[300],
              },
            ]}
            onPress={() =>
              onUpdate({ analyticsEnabled: !data?.analyticsEnabled })
            }
          >
            <View
              style={[
                styles.toggleKnob,
                {
                  transform: [{ translateX: data?.analyticsEnabled ? 20 : 0 }],
                },
              ]}
            />
          </TouchableOpacity>
        </View>
      </Card>

      <ThemedText variant="caption" color="tertiary" style={styles.privacyNote}>
        Your data is stored locally on your device. We never share your personal
        information with third parties.
      </ThemedText>

      <Button title="Get Started" onPress={onNext} fullWidth />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  progressContainer: {
    flex: 1,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    marginRight: 16,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 2,
  },
  skipButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  stepContainer: {
    flex: 1,
  },
  footer: {
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  welcomeStep: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 24,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeTitle: {
    textAlign: 'center',
    marginBottom: 12,
  },
  welcomeSubtitle: {
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  welcomeFeatures: {
    width: '100%',
    marginBottom: 40,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  welcomeActions: {
    width: '100%',
    gap: 16,
  },
  skipLink: {
    padding: 12,
    alignItems: 'center',
  },
  stepContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  stepTitle: {
    marginBottom: 8,
  },
  stepSubtitle: {
    marginBottom: 24,
  },
  sectionLabel: {
    marginBottom: 8,
    marginTop: 16,
  },
  inputContainer: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  textInput: {
    fontSize: 16,
    color: '#212121',
  },
  goalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  goalCard: {
    width: (screenWidth - 72) / 2,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    gap: 8,
  },
  goalText: {
    textAlign: 'center',
  },
  levelButtons: {
    gap: 12,
    marginBottom: 24,
  },
  levelButton: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    gap: 4,
  },
  notificationCard: {
    marginBottom: 24,
    padding: 16,
  },
  notificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  notificationInfo: {
    flex: 1,
    marginRight: 16,
  },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    padding: 2,
  },
  toggleKnob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },
  privacyCard: {
    marginBottom: 16,
    padding: 16,
  },
  privacyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  privacyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 16,
  },
  privacyText: {
    marginLeft: 12,
    flex: 1,
  },
  privacyNote: {
    marginBottom: 24,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
});

import { TextInput } from 'react-native';

export default OnboardingScreen;

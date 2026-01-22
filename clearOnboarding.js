const AsyncStorage = require('@react-native-async-storage/async-storage').default;

// Keys to clear for onboarding reset
const keysToClear = [
  '@fortibody_onboarding_complete',
  '@fortibody_onboarding_step', 
  '@fortibody_onboarding_data',
  '@user_profile',
  '@user_streak',
  '@streak_increased_today',
  '@exercise_history',
  '@workout_streak',
  '@total_workouts',
  '@exercise_unit_',
  '@nutrition_log',
  '@fasting_start_time'
];

async function clearOnboardingData() {
  console.log('Clearing onboarding data...');
  
  try {
    for (const key of keysToClear) {
      await AsyncStorage.removeItem(key);
      console.log(`Cleared: ${key}`);
    }
    console.log('✅ All onboarding data cleared successfully!');
    console.log('Restart the app to see the onboarding flow again.');
  } catch (error) {
    console.error('❌ Failed to clear data:', error);
  }
}

// If running in Expo environment
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { clearOnboardingData, keysToClear };
} else {
  clearOnboardingData();
}
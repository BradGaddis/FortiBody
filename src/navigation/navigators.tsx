import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList, MainTabParamList, HomeStackParamList, ExercisesStackParamList, NutritionStackParamList, SleepStackParamList, ActivityStackParamList } from './routes';
import { screenOptions } from './config';
import OnboardingScreen from '../screens/onboarding/OnboardingScreen';
import EnhancedHomeScreen from '../screens/home/EnhancedHome';
import ExerciseLibraryScreen from '../screens/exercise/ExerciseLibrary';
import ExerciseDetailScreen from '../screens/exercise/ExerciseDetailScreen';
import FlexibilityScreen from '../screens/exercise/FlexibilityScreen';
import FavoritesScreen from '../screens/exercise/Favorites';
import FastingScreen from '../screens/nutrition/FastingScreen';
import { NutritionDashboardScreen } from '../screens/nutrition/NutritionDashboardScreen';
import { FoodDiaryScreen } from '../screens/nutrition/FoodDiaryScreen';
import { AddFoodScreen } from '../screens/nutrition/AddFoodScreen';
import { BarcodeScannerScreen } from '../screens/nutrition/BarcodeScannerScreen';
import { CreateFoodScreen } from '../screens/nutrition/CreateFoodScreen';
import { EditFoodScreen } from '../screens/nutrition/EditFoodScreen';
import { EditFoodEntryScreen } from '../screens/nutrition/EditFoodEntryScreen';
import SleepScreen from '../screens/sleep/SleepScreen';
import ActivityScreen from '../screens/activity/ActivityScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import ProfileSetupScreen from '../screens/profile/ProfileSetupScreen';
import { isOnboardingComplete, getOnboardingData } from '../utils/onboarding';
import UserProfileService from '../services/user/UserProfileService';
import streakService from '../services/streak/StreakService';

const Stack = createStackNavigator<RootStackParamList>();
const MainTab = createBottomTabNavigator<MainTabParamList>();
const HomeStack = createStackNavigator<HomeStackParamList>();
const ExercisesStack = createStackNavigator<ExercisesStackParamList>();
const NutritionStack = createStackNavigator<NutritionStackParamList>();
const SleepStack = createStackNavigator<SleepStackParamList>();
const ActivityStack = createStackNavigator<ActivityStackParamList>();

const HomeStackNavigator: React.FC = () => (
  <HomeStack.Navigator screenOptions={screenOptions} initialRouteName="EnhancedHome">
    <HomeStack.Screen name="Home" component={EnhancedHomeScreen} options={{ headerShown: false }} />
    <HomeStack.Screen name="EnhancedHome" component={EnhancedHomeScreen} options={{ headerShown: false }} />
  </HomeStack.Navigator>
);

const ExercisesStackNavigator: React.FC = () => (
  <ExercisesStack.Navigator screenOptions={screenOptions} initialRouteName="ExerciseLibrary">
    <ExercisesStack.Screen name="ExerciseList" component={EnhancedHomeScreen} options={{ headerShown: false }} />
    <ExercisesStack.Screen name="ExerciseLibrary" component={ExerciseLibraryScreen} options={{ headerShown: false }} />
    <ExercisesStack.Screen name="Exercise" component={ExerciseDetailScreen} options={{ headerShown: false }} />
    <ExercisesStack.Screen name="Favorites" component={FavoritesScreen} options={{ headerShown: false }} />
    <ExercisesStack.Screen name="CreateExercise" component={EnhancedHomeScreen} options={{ headerShown: false }} />
    <ExercisesStack.Screen name="WorkoutSession" component={EnhancedHomeScreen} options={{ headerShown: false }} />
    <ExercisesStack.Screen name="Flexibility" component={FlexibilityScreen} options={{ headerShown: false }} />
  </ExercisesStack.Navigator>
);

const NutritionStackNavigator: React.FC = () => (
  <NutritionStack.Navigator screenOptions={screenOptions} initialRouteName="Nutrition">
    <NutritionStack.Screen name="Nutrition" component={NutritionDashboardScreen} options={{ headerShown: false }} />
    <NutritionStack.Screen name="FoodDiary" component={FoodDiaryScreen} options={{ headerShown: false }} />
    <NutritionStack.Screen name="Fasting" component={FastingScreen} options={{ headerShown: false }} />
    <NutritionStack.Screen name="Diet" component={EnhancedHomeScreen} options={{ headerShown: false }} />
    <NutritionStack.Screen name="AddFood" component={AddFoodScreen} options={{ headerShown: false }} />
    <NutritionStack.Screen name="CreateFood" component={CreateFoodScreen} options={{ headerShown: false }} />
    <NutritionStack.Screen name="BarcodeScanner" component={BarcodeScannerScreen} options={{ headerShown: false }} />
    <NutritionStack.Screen name="EditFoodEntry" component={EditFoodEntryScreen} options={{ headerShown: false }} />
    <NutritionStack.Screen name="EditFood" component={EditFoodScreen} options={{ headerShown: false }} />
  </NutritionStack.Navigator>
);

const SleepStackNavigator: React.FC = () => (
  <SleepStack.Navigator screenOptions={screenOptions} initialRouteName="Sleep">
    <SleepStack.Screen name="Sleep" component={SleepScreen} options={{ headerShown: false }} />
  </SleepStack.Navigator>
);

const ActivityStackNavigator: React.FC = () => (
  <ActivityStack.Navigator screenOptions={screenOptions} initialRouteName="Activity">
    <ActivityStack.Screen name="Activity" component={ActivityScreen} options={{ headerShown: false }} />
  </ActivityStack.Navigator>
);

const ProfileStackNavigator: React.FC = () => (
  <Stack.Navigator screenOptions={screenOptions} initialRouteName="Profile">
    <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
    <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} options={{ headerShown: false }} />
  </Stack.Navigator>
);

type TabRouteName = 'HomeStack' | 'ExercisesStack' | 'NutritionStack' | 'ActivityStack' | 'SleepStack' | 'ProfileStack';

const TabBarIcon: React.FC<{
  routeName: TabRouteName;
  focused: boolean;
  color: string;
  size: number;
}> = ({ routeName, focused, color, size }) => {
  const navigation = useNavigation<any>();
  
  const getIconName = () => {
    switch (routeName) {
      case 'HomeStack': return focused ? 'home' : 'home-outline';
      case 'ExercisesStack': return focused ? 'barbell' : 'barbell-outline';
      case 'NutritionStack': return focused ? 'restaurant' : 'restaurant-outline';
      case 'ActivityStack': return focused ? 'body' : 'body-outline';
      case 'SleepStack': return focused ? 'moon' : 'moon-outline';
      case 'ProfileStack': return focused ? 'person' : 'person-outline';
      default: return 'home';
    }
  };

  return (
    <TouchableOpacity
      onPress={() => {
        navigation.navigate(routeName);
      }}
    >
      <Ionicons name={getIconName() as any} size={size} color={color} />
    </TouchableOpacity>
  );
};

const MainTabNavigator: React.FC = () => {
  const insets = useSafeAreaInsets();

  return (
    <MainTab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          return <TabBarIcon routeName={route.name as TabRouteName} focused={focused} color={color} size={size} />;
        },
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: '#9E9E9E',
        tabBarStyle: { 
          backgroundColor: '#FFFFFF', 
          borderTopWidth: 1, 
          borderTopColor: '#EEEEEE', 
          paddingTop: 8, 
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom + 5,
        },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '500' },
        headerShown: false,
      })}
      >
      <MainTab.Screen 
        name="HomeStack" 
        component={HomeStackNavigator} 
        options={{ 
          title: 'Home', 
          headerShown: false,
          unmountOnBlur: true,
        }} 
      />
      <MainTab.Screen 
        name="ExercisesStack" 
        component={ExercisesStackNavigator} 
        options={{ 
          title: 'Exercises', 
          headerShown: false,
          unmountOnBlur: true,
        }} 
      />
      <MainTab.Screen 
        name="NutritionStack" 
        component={NutritionStackNavigator} 
        options={{ 
          title: 'Nutrition', 
          headerShown: false,
          unmountOnBlur: true,
        }} 
      />
      <MainTab.Screen 
        name="ActivityStack" 
        component={ActivityStackNavigator} 
        options={{ 
          title: 'Activity', 
          headerShown: false,
          unmountOnBlur: true,
        }} 
      />
      <MainTab.Screen 
        name="SleepStack" 
        component={SleepStackNavigator} 
        options={{ 
          title: 'Sleep', 
          headerShown: false,
          unmountOnBlur: true,
        }} 
      />
      <MainTab.Screen 
        name="ProfileStack" 
        component={ProfileStackNavigator} 
        options={{ 
          title: 'Profile', 
          headerShown: false,
          unmountOnBlur: true,
        }} 
      />
    </MainTab.Navigator>
  );
};

const LoadingScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff' }}>
    <Text>Loading...</Text>
  </View>
);

const migrateOnboardingData = async (): Promise<void> => {
  try {
    const profileService = new UserProfileService();
    const existingProfile = await profileService.getActiveProfile();
    
    if (existingProfile && existingProfile.name !== 'Guest User') {
      console.log('✅ Profile already exists:', existingProfile.name);
      return;
    }
    
    const onboardingData = await getOnboardingData();
    console.log('💾 Found onboarding data:', onboardingData);
    
    const hasUserData = onboardingData && (onboardingData.name || onboardingData.age);
    const isDefaultProfile = existingProfile?.name === 'Guest User';
    
    if ((!existingProfile || isDefaultProfile) && hasUserData) {
      await profileService.saveProfile({
        id: 'active',
        name: onboardingData.name,
        age: onboardingData.age,
        gender: 'other',
        height: 170,
        weight: 70,
        weightUnit: 'kg',
        measurementSystem: 'metric',
        activityLevel: 2,
        goals: [],
        medicalConditions: [],
        limitations: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log('✅ Migrated onboarding data to UserProfileService');
    } else if (existingProfile && existingProfile.name !== 'Guest User') {
      console.log('✅ Profile already exists, no migration needed');
    } else {
      console.log('⚠️ No onboarding data to migrate');
    }
  } catch (error) {
    console.error('Failed to migrate onboarding data:', error);
  }
};

export const AppNavigator: React.FC = () => {
  const [onboardingComplete, setOnboardingComplete] = React.useState<boolean | null>(null);
  const [key, setKey] = React.useState(0);

  React.useEffect(() => {
    const checkStatus = async () => {
      try {
        await streakService.initialize();
        await migrateOnboardingData();
        const status = await isOnboardingComplete();
        console.log('Onboarding status:', status);
        setOnboardingComplete(status);
      } catch (error) {
        console.error('Error:', error);
        setOnboardingComplete(false);
      }
    };
    checkStatus();
  }, []);

  // Force refresh check after 2 seconds to catch any late AsyncStorage updates
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onboardingComplete === false) {
        console.log('🔄 Double-checking onboarding status...');
        isOnboardingComplete().then(status => {
          if (status !== onboardingComplete) {
            console.log('🔄 Status changed to:', status);
            setOnboardingComplete(status);
            setKey(prev => prev + 1);
          }
        });
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [onboardingComplete]);

  // Show loading while checking
  if (onboardingComplete === null) {
    return (
      <Stack.Navigator screenOptions={screenOptions}>
        <Stack.Screen name="Loading" component={LoadingScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    );
  }

  // Show main app if onboarding is complete
  if (onboardingComplete === true) {
    console.log('🚀 Showing main app (onboarding complete)');
    return (
      <Stack.Navigator key={key} screenOptions={screenOptions} initialRouteName="Main">
        <Stack.Screen name="Main" component={MainTabNavigator} options={{ headerShown: false }} />
      </Stack.Navigator>
    );
  }

  // Show onboarding if not complete
  console.log('📱 Showing onboarding (not complete)');
  return (
    <Stack.Navigator key={key} screenOptions={screenOptions} initialRouteName="Onboarding">
      <Stack.Screen name="Onboarding" options={{ headerShown: false }}>
        {(props) => <OnboardingScreen {...props} onComplete={() => {
          console.log('✅ Onboarding completed, updating state...');
          setOnboardingComplete(true);
          setKey(prev => prev + 1); // Force re-render to show Main
        }} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
};

export { MainTabNavigator, HomeStackNavigator, ExercisesStackNavigator, NutritionStackNavigator, SleepStackNavigator, ActivityStackNavigator };

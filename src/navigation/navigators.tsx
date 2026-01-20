import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import {
  RootStackParamList,
  MainTabParamList,
  HomeStackParamList,
  ExercisesStackParamList,
  NutritionStackParamList,
  ProfileStackParamList,
} from './routes';
import { screenOptions } from './config';

const Stack = createStackNavigator<RootStackParamList>();
const MainTab = createBottomTabNavigator<MainTabParamList>();
const HomeStack = createStackNavigator<HomeStackParamList>();
const ExercisesStack = createStackNavigator<ExercisesStackParamList>();
const NutritionStack = createStackNavigator<NutritionStackParamList>();
const ProfileStack = createStackNavigator<ProfileStackParamList>();

import HomeScreen from '../screens/home/Home';
import EnhancedHomeScreen from '../screens/home/EnhancedHome';
import ExerciseLibraryScreen from '../screens/exercise/ExerciseLibrary';
import FavoritesScreen from '../screens/exercise/Favorites';
import { GeneralExercises } from '../screens/exercise/GeneralExercises';
import { PowerLiftingExercises } from '../screens/exercise/PowerLifter';
import FastingScreen from '../screens/nutrition/FastingScreen';
import { total_exercises_dict } from '../services/exercise/exercise_store';
import { ExerciseScreen } from '../screens/exercise/ExerciseScreen';
import { NutritionDashboardScreen } from '../screens/nutrition/NutritionDashboardScreen';
import { AddFoodScreen } from '../screens/nutrition/AddFoodScreen';
import { BarcodeScannerScreen } from '../screens/nutrition/BarcodeScannerScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

const HomeStackNavigator: React.FC = () => {
  return (
    <HomeStack.Navigator
      screenOptions={screenOptions}
      initialRouteName="EnhancedHome"
    >
      <HomeStack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <HomeStack.Screen
        name="EnhancedHome"
        component={EnhancedHomeScreen}
        options={{ headerShown: false }}
      />
    </HomeStack.Navigator>
  );
};

const ExercisesStackNavigator: React.FC = () => {
  return (
    <ExercisesStack.Navigator
      screenOptions={screenOptions}
      initialRouteName="ExerciseLibrary"
    >
      <ExercisesStack.Screen
        name="ExerciseList"
        component={EnhancedHomeScreen}
        options={{ headerShown: false }}
      />
      <ExercisesStack.Screen
        name="ExerciseLibrary"
        component={ExerciseLibraryScreen}
        options={{ title: 'Exercise Library', headerShown: true }}
      />
      <ExercisesStack.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{ title: 'Favorites', headerShown: true }}
      />
      <ExercisesStack.Screen
        name="GeneralExercises"
        component={GeneralExercises}
        options={{ title: 'General Exercises', headerShown: true }}
      />
      <ExercisesStack.Screen
        name="PowerLiftingExercises"
        component={PowerLiftingExercises}
        options={{ title: 'Powerlifting', headerShown: true }}
      />
      <ExercisesStack.Screen
        name="CreateExercise"
        component={EnhancedHomeScreen}
        options={{ title: 'Create Exercise', headerShown: true }}
      />
      {generateExerciseScreens()}
      <ExercisesStack.Screen
        name="WorkoutSession"
        component={EnhancedHomeScreen}
        options={{ title: 'Workout Session', headerShown: true }}
      />
    </ExercisesStack.Navigator>
  );
};

const generateExerciseScreens = () => {
  return total_exercises_dict.map((exercise: any) => (
    <ExercisesStack.Screen
      key={exercise.id}
      name={`Exercise_${exercise.id}`}
      options={{ title: exercise.name, headerShown: true }}
    >
      {(props: any) => (
        <ExerciseScreen name={exercise.name} navigation={props.navigation} />
      )}
    </ExercisesStack.Screen>
  ));
};

const NutritionStackNavigator: React.FC = () => {
  return (
    <NutritionStack.Navigator
      screenOptions={screenOptions}
      initialRouteName="Nutrition"
    >
      <NutritionStack.Screen
        name="Nutrition"
        component={NutritionDashboardScreen}
        options={{ title: 'Nutrition', headerShown: true }}
      />
      <NutritionStack.Screen
        name="Fasting"
        component={FastingScreen}
        options={{ title: 'Fasting Timer', headerShown: true }}
      />
      <NutritionStack.Screen
        name="Diet"
        component={EnhancedHomeScreen}
        options={{ title: 'Diet Plan', headerShown: true }}
      />
      <NutritionStack.Screen
        name="AddFood"
        component={AddFoodScreen}
        options={{ title: 'Add Food', headerShown: true }}
      />
      <NutritionStack.Screen
        name="BarcodeScanner"
        component={BarcodeScannerScreen}
        options={{ title: 'Scan Barcode', headerShown: true }}
      />
    </NutritionStack.Navigator>
  );
};

const ProfileStackNavigator: React.FC = () => {
  return (
    <ProfileStack.Navigator
      screenOptions={screenOptions}
      initialRouteName="Profile"
    >
      <ProfileStack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
      <ProfileStack.Screen
        name="ProfileDashboard"
        component={ProfileScreen}
        options={{ title: 'Profile', headerShown: true }}
      />
      <ProfileStack.Screen
        name="ProfileEdit"
        component={EnhancedHomeScreen}
        options={{ title: 'Edit Profile', headerShown: true }}
      />
      <ProfileStack.Screen
        name="ProfileGoals"
        component={EnhancedHomeScreen}
        options={{ title: 'Goals', headerShown: true }}
      />
      <ProfileStack.Screen
        name="ProfileMeasurements"
        component={EnhancedHomeScreen}
        options={{ title: 'Measurements', headerShown: true }}
      />
    </ProfileStack.Navigator>
  );
};

const MainTabNavigator: React.FC = () => {
  return (
    <MainTab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any = 'home';
          switch (route.name) {
            case 'HomeStack':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'ExercisesStack':
              iconName = focused ? 'fitness' : 'fitness-outline';
              break;
            case 'NutritionStack':
              iconName = focused ? 'restaurant' : 'restaurant-outline';
              break;
            case 'ProfileStack':
              iconName = focused ? 'person' : 'person-outline';
              break;
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: '#9E9E9E',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#EEEEEE',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerShown: false,
      })}
    >
      <MainTab.Screen
        name="HomeStack"
        component={HomeStackNavigator}
        options={{ title: 'Home', headerShown: false }}
      />
      <MainTab.Screen
        name="ExercisesStack"
        component={ExercisesStackNavigator}
        options={{ title: 'Exercises', headerShown: false }}
      />
      <MainTab.Screen
        name="NutritionStack"
        component={NutritionStackNavigator}
        options={{ title: 'Nutrition', headerShown: false }}
      />
      <MainTab.Screen
        name="ProfileStack"
        component={ProfileStackNavigator}
        options={{ title: 'Profile', headerShown: false }}
      />
    </MainTab.Navigator>
  );
};

export const AppNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Main"
        component={MainTabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="NotFound"
        component={EnhancedHomeScreen}
        options={{ title: 'Not Found' }}
      />
    </Stack.Navigator>
  );
};

export {
  MainTabNavigator,
  HomeStackNavigator,
  ExercisesStackNavigator,
  NutritionStackNavigator,
  ProfileStackNavigator,
};

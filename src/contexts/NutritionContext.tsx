import React, { createContext, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppContext, appActions } from './AppContext';

// Nutrition context type definitions
export type NutritionAction =
  | { type: 'SET_BMR'; payload: number }
  | { type: 'SET_CALORIES_GOAL'; payload: number }
  | { type: 'SET_DAILY_CALORIES'; payload: number }
  | { type: 'SET_MEALS'; payload: any[] }
  | { type: 'ADD_MEAL'; payload: any }
  | { type: 'UPDATE_MEAL'; payload: { id: string; updates: Partial<any> } }
  | { type: 'DELETE_MEAL'; payload: string }
  | { type: 'SET_FASTING_STATE'; payload: any }
  | { type: 'LOG_WATER'; payload: number };

export interface NutritionState {
  bmr: number;
  caloriesGoal: number;
  dailyCalories: number;
  meals: any[];
  fastingState: any;
  waterIntake: number;
}

// Nutrition context reducer
const nutritionReducer = (
  state: NutritionState,
  action: NutritionAction
): NutritionState => {
  switch (action.type) {
    case 'SET_BMR':
      return { ...state, bmr: action.payload };

    case 'SET_CALORIES_GOAL':
      return { ...state, caloriesGoal: action.payload };

    case 'SET_DAILY_CALORIES':
      return { ...state, dailyCalories: action.payload };

    case 'SET_MEALS':
      return { ...state, meals: action.payload };

    case 'ADD_MEAL':
      return { ...state, meals: [...state.meals, action.payload] };

    case 'UPDATE_MEAL':
      return {
        ...state,
        meals: state.meals.map(meal =>
          meal.id === action.payload.id ? action.payload.updates : meal
        ),
      };

    case 'DELETE_MEAL':
      return {
        ...state,
        meals: state.meals.filter(meal => meal.id !== action.payload),
      };

    case 'SET_FASTING_STATE':
      return { ...state, fastingState: action.payload };

    case 'LOG_WATER':
      return { ...state, waterIntake: state.waterIntake + action.payload };

    default:
      return state;
  }
};

// Initial nutrition state
const initialNutritionState: NutritionState = {
  bmr: 0,
  caloriesGoal: 2000,
  dailyCalories: 0,
  meals: [],
  fastingState: null,
  waterIntake: 0,
};

// Create nutrition context
export const NutritionContext = createContext<{
  state: NutritionState;
  dispatch: React.Dispatch<NutritionAction>;
}>({
  state: initialNutritionState,
  dispatch: () => {
    console.warn('NutritionContext used without provider');
  },
});

// Nutrition context provider
export const NutritionProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const appContext = useAppContext();
  const [state, dispatch] = React.useReducer(
    nutritionReducer,
    initialNutritionState
  );

  // Persist nutrition data
  React.useEffect(() => {
    const persistNutritionData = async () => {
      try {
        await AsyncStorage.setItem('nutritionState', JSON.stringify(state));
      } catch (error) {
        console.error('Failed to persist nutrition data:', error);
      }
    };

    const debouncedPersist = setTimeout(persistNutritionData, 1000);

    return () => {
      clearTimeout(debouncedPersist);
      persistNutritionData();
    };
  }, [state]);

  // Update global app context with nutrition data
  React.useEffect(() => {
    appContext.dispatch({
      type: 'SET_NUTRITION_DATA',
      payload: state,
    });
  }, [state, dispatch]);

  const contextValue = {
    state,
    dispatch,
  };

  return (
    <NutritionContext.Provider value={contextValue}>
      {children}
    </NutritionContext.Provider>
  );
};

// Custom hooks for nutrition context
export const useNutritionContext = () => {
  const context = useContext(NutritionContext);
  if (!context) {
    throw new Error(
      'useNutritionContext must be used within a NutritionProvider'
    );
  }
  return context;
};

export const nutritionActions = {
  setBMR: (bmr: number) => ({ type: 'SET_BMR', payload: bmr }),
  setCaloriesGoal: (goal: number) => ({
    type: 'SET_CALORIES_GOAL',
    payload: goal,
  }),
  setDailyCalories: (calories: number) => ({
    type: 'SET_DAILY_CALORIES',
    payload: calories,
  }),
  setMeals: (meals: any[]) => ({ type: 'SET_MEALS', payload: meals }),
  addMeal: (meal: any) => ({ type: 'ADD_MEAL', payload: meal }),
  updateMeal: (id: string, updates: Partial<any>) => ({
    type: 'UPDATE_MEAL',
    payload: { id, updates },
  }),
  deleteMeal: (id: string) => ({ type: 'DELETE_MEAL', payload: id }),
  setFastingState: (fastingState: any) => ({
    type: 'SET_FASTING_STATE',
    payload: fastingState,
  }),
  logWater: (intake: number) => ({ type: 'LOG_WATER', payload: intake }),
};

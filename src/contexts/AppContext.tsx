import React, {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  useEffect,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define action types for different domains
export type AppAction =
  | { type: 'SET_USER'; payload: any }
  | { type: 'SET_EXERCISES'; payload: any[] }
  | { type: 'SET_NUTRITION_DATA'; payload: any }
  | { type: 'SET_FASTING_DATA'; payload: any }
  | { type: 'ADD_EXERCISE'; payload: any }
  | { type: 'UPDATE_EXERCISE'; payload: { id: string; updates: Partial<any> } }
  | { type: 'DELETE_EXERCISE'; payload: string }
  | { type: 'SET_PROFILE'; payload: any }
  | { type: 'UPDATE_PROFILE'; payload: any }
  | { type: 'LOGOUT_USER' };

// Define state types
export interface AppState {
  user: any | null;
  exercises: any[];
  nutritionData: any;
  fastingData: any;
  profile: any | null;
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: AppState = {
  user: null,
  exercises: [],
  nutritionData: {},
  fastingData: {},
  profile: null,
  loading: false,
  error: null,
};

// Reducer for app-wide state management
const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload, loading: false, error: null };

    case 'SET_EXERCISES':
      return { ...state, exercises: action.payload, loading: false };

    case 'SET_NUTRITION_DATA':
      return { ...state, nutritionData: action.payload, loading: false };

    case 'SET_FASTING_DATA':
      return { ...state, fastingData: action.payload, loading: false };

    case 'SET_PROFILE':
      return { ...state, profile: action.payload, loading: false };

    case 'ADD_EXERCISE':
      return { ...state, exercises: [...state.exercises, action.payload] };

    case 'UPDATE_EXERCISE':
      return {
        ...state,
        exercises: state.exercises.map(exercise =>
          exercise.id === action.payload.id ? action.payload.updates : exercise
        ),
      };

    case 'DELETE_EXERCISE':
      return {
        ...state,
        exercises: state.exercises.filter(
          exercise => exercise.id !== action.payload
        ),
      };

    case 'UPDATE_PROFILE':
      return { ...state, profile: { ...state.profile, ...action.payload } };

    case 'LOGOUT_USER':
      return {
        ...initialState,
        user: null,
        profile: null,
      };

    case 'SET_LOADING':
      return { ...state, loading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };

    default:
      return state;
  }
};

// Create the context
export const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}>({
  state: initialState,
  dispatch: () => {
    console.warn('AppContext used without provider');
  },
});

// Provider component for app context
export const AppProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Persist state to AsyncStorage on changes
  useEffect(() => {
    const persistState = async () => {
      try {
        await AsyncStorage.setItem('appState', JSON.stringify(state));
      } catch (error) {
        console.error('Failed to persist state:', error);
      }
    };

    const persistStateDebounced = setTimeout(persistState, 1000);

    return () => {
      clearTimeout(persistStateDebounced);
      persistState();
    };
  }, [state]);

  // Load persisted state on mount
  useEffect(() => {
    const loadPersistedState = async () => {
      try {
        const persistedState = await AsyncStorage.getItem('appState');
        if (persistedState) {
          const parsedState = JSON.parse(persistedState);
          dispatch({ type: 'SET_USER', payload: parsedState.user });
          dispatch({
            type: 'SET_EXERCISES',
            payload: parsedState.exercises || [],
          });
          dispatch({
            type: 'SET_NUTRITION_DATA',
            payload: parsedState.nutritionData || {},
          });
          dispatch({
            type: 'SET_FASTING_DATA',
            payload: parsedState.fastingData || {},
          });
          dispatch({ type: 'SET_PROFILE', payload: parsedState.profile });
        }
      } catch (error) {
        console.error('Failed to load persisted state:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to load saved data' });
      }
    };

    loadPersistedState();
  }, []);

  const contextValue = {
    state,
    dispatch,
  };

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
};

// Custom hook for using the app context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

// Action creators for easier usage
export const appActions = {
  setUser: (user: any) => ({ type: 'SET_USER', payload: user }),
  setExercises: (exercises: any[]) => ({
    type: 'SET_EXERCISES',
    payload: exercises,
  }),
  setNutritionData: (data: any) => ({
    type: 'SET_NUTRITION_DATA',
    payload: data,
  }),
  setFastingData: (data: any) => ({ type: 'SET_FASTING_DATA', payload: data }),
  setProfile: (profile: any) => ({ type: 'SET_PROFILE', payload: profile }),
  addExercise: (exercise: any) => ({ type: 'ADD_EXERCISE', payload: exercise }),
  updateExercise: (id: string, updates: Partial<any>) => ({
    type: 'UPDATE_EXERCISE',
    payload: { id, updates },
  }),
  deleteExercise: (id: string) => ({ type: 'DELETE_EXERCISE', payload: id }),
  logoutUser: () => ({ type: 'LOGOUT_USER' }),
  setLoading: (loading: boolean) => ({ type: 'SET_LOADING', payload: loading }),
  setError: (error: string) => ({ type: 'SET_ERROR', payload: error }),
};

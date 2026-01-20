import React, { createContext, useContext } from 'react';
import { useAppContext } from './AppContext';

// Exercise context type definitions
export type ExerciseAction =
  | { type: 'ADD_EXERCISE'; payload: any }
  | { type: 'UPDATE_EXERCISE'; payload: { id: string; updates: Partial<any> } }
  | { type: 'DELETE_EXERCISE'; payload: string }
  | { type: 'SET_EXERCISE_FILTER'; payload: string }
  | { type: 'ADD_FAVORITE'; payload: string }
  | { type: 'REMOVE_FAVORITE'; payload: string }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | {
      type: 'SET_PERSONAL_RECORD';
      payload: { exerciseId: string; record: any };
    };

export interface ExerciseState {
  exercises: any[];
  favorites: string[];
  personalRecords: Record<string, any>;
  filter: string;
  searchQuery: string;
}

// Exercise context reducer
const exerciseReducer = (
  state: ExerciseState,
  action: ExerciseAction
): ExerciseState => {
  switch (action.type) {
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

    case 'ADD_FAVORITE':
      return { ...state, favorites: [...state.favorites, action.payload] };

    case 'REMOVE_FAVORITE':
      return {
        ...state,
        favorites: state.favorites.filter(id => id !== action.payload),
      };

    case 'SET_EXERCISE_FILTER':
      return { ...state, filter: action.payload };

    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };

    case 'SET_PERSONAL_RECORD':
      return {
        ...state,
        personalRecords: {
          ...state.personalRecords,
          [action.payload.exerciseId]: action.payload.record,
        },
      };

    default:
      return state;
  }
};

// Initial exercise state
const initialExerciseState: ExerciseState = {
  exercises: [],
  favorites: [],
  personalRecords: {},
  filter: '',
  searchQuery: '',
};

// Create exercise context
export const ExerciseContext = createContext<{
  state: ExerciseState;
  dispatch: React.Dispatch<ExerciseAction>;
}>({
  state: initialExerciseState,
  dispatch: () => {
    console.warn('ExerciseContext used without provider');
  },
});

// Exercise context provider
export const ExerciseProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  // Get global app context to extract exercise-related state
  const appContext = useAppContext();

  // Local exercise state management
  const [state, dispatch] = React.useReducer(
    exerciseReducer,
    initialExerciseState
  );

  // Sync exercise state with global app context
  React.useEffect(() => {
    // Update global exercises when local exercise state changes
    appContext.dispatch({
      type: 'SET_EXERCISES',
      payload: state.exercises,
    });
  }, [state.exercises, dispatch]);

  const contextValue = {
    state,
    dispatch,
  };

  return (
    <ExerciseContext.Provider value={contextValue}>
      {children}
    </ExerciseContext.Provider>
  );
};

// Custom hook for using exercise context
export const useExerciseContext = () => {
  const context = useContext(ExerciseContext);
  if (!context) {
    throw new Error(
      'useExerciseContext must be used within an ExerciseProvider'
    );
  }
  return context;
};

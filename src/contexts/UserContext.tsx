import React, { createContext, useContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppContext, appActions } from './AppContext';

// User context type definitions
export type UserAction =
  | { type: 'LOGIN_SUCCESS'; payload: any }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'SET_LOADING'; payload: boolean };

export interface UserState {
  currentUser: any | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// User context reducer
const userReducer = (state: UserState, action: UserAction): UserState => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        currentUser: action.payload,
        isAuthenticated: true,
        loading: false,
        error: null,
      };

    case 'LOGIN_FAILURE':
      return { ...state, error: action.payload, loading: false };

    case 'LOGOUT':
      return {
        currentUser: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      };

    default:
      return state;
  }
};

// Initial user state
const initialUserState: UserState = {
  currentUser: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

// Create user context
export const UserContext = createContext<{
  state: UserState;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}>({
  state: initialUserState,
  login: async () => {
    console.warn('UserContext used without provider');
    return false;
  },
  logout: () => {
    console.warn('UserContext used without provider');
  },
});

// User context provider with authentication logic
export const UserProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const appContext = useAppContext();
  const [state, dispatch] = React.useReducer(userReducer, initialUserState);

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      // Simulate authentication (replace with real auth later)
      await new Promise(resolve => setTimeout(resolve, 1000));

      const userData = { id: Date.now().toString(), email, name: 'User' };

      // Save user data
      await AsyncStorage.setItem('currentUser', JSON.stringify(userData));

      dispatch({ type: 'LOGIN_SUCCESS', payload: userData });
      return true;
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE', payload: (error as Error).message });
      return false;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Logout function
  const logout = () => {
    dispatch({ type: 'LOGOUT' });
    AsyncStorage.removeItem('currentUser');
  };

  // Load persisted user data on mount
  React.useEffect(() => {
    const loadPersistedUser = async () => {
      try {
        const userData = await AsyncStorage.getItem('currentUser');
        if (userData) {
          const parsedUser = JSON.parse(userData);
          dispatch({ type: 'LOGIN_SUCCESS', payload: parsedUser });
        }
      } catch (error) {
        console.error('Failed to load persisted user:', error);
      }
    };

    loadPersistedUser();
  }, []);

  // Check authentication state
  const isAuthenticated = !!state.currentUser;

  // Update global app context with user auth state
  React.useEffect(() => {
    appContext.dispatch({
      type: 'SET_USER',
      payload: state.currentUser,
    });
  }, [state.currentUser, dispatch]);

  const contextValue = {
    state,
    dispatch,
    login,
    logout,
    isAuthenticated,
  };

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
};

// Custom hook for using user context
export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
};

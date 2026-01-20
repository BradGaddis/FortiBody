import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Test state management
export const useStateWithPersistence = <T>(key: string, initialValue: T) => {
  const [state, setState] = useState<T>(initialValue);

  // Load persisted state on mount
  useEffect(() => {
    const loadPersistedState = async () => {
      try {
        const persistedValue = await AsyncStorage.getItem(key);
        if (persistedValue !== null) {
          setState(JSON.parse(persistedValue));
        }
      } catch (error) {
        console.error(`Failed to load ${key}:`, error);
      }
    };

    loadPersistedState();
  }, [key]);

  // Save state to persistence
  const saveToPersistence = async (newValue: T) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(newValue));
      setState(newValue);
    } catch (error) {
      console.error(`Failed to save ${key}:`, error);
    }
  };

  // Clear persistence
  const clearPersistence = async () => {
    try {
      await AsyncStorage.removeItem(key);
      setState(initialValue);
    } catch (error) {
      console.error(`Failed to clear ${key}:`, error);
    }
  };

  return { state, setState, saveToPersistence, clearPersistence };
};

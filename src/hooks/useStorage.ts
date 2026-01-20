import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Hook for AsyncStorage operations with error handling
export const useAsyncStorage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getItem = useCallback(async (key: string): Promise<string | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await AsyncStorage.getItem(key);
      setIsLoading(false);
      return result;
    } catch (err) {
      setIsLoading(false);
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    }
  }, []);

  const setItem = useCallback(
    async (key: string, value: string): Promise<boolean> => {
      try {
        setIsLoading(true);
        setError(null);
        await AsyncStorage.setItem(key, value);
        setIsLoading(false);
        return true;
      } catch (err) {
        setIsLoading(false);
        setError(err instanceof Error ? err.message : 'Unknown error');
        return false;
      }
    },
    []
  );

  const removeItem = useCallback(async (key: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      await AsyncStorage.removeItem(key);
      setIsLoading(false);
      return true;
    } catch (err) {
      setIsLoading(false);
      setError(err instanceof Error ? err.message : 'Unknown error');
      return false;
    }
  }, []);

  return { getItem, setItem, removeItem, isLoading, error };
};

// Hook for exercise session tracking
export const useExerciseSession = (exerciseName: string) => {
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionStart, setSessionStart] = useState<Date | null>(null);
  const [sessionSets, setSessionSets] = useState<any[]>([]);

  const startSession = useCallback(() => {
    const now = new Date();
    setSessionActive(true);
    setSessionStart(now);
    setSessionSets([]);
  }, []);

  const endSession = useCallback(() => {
    setSessionActive(false);
    const sessionData = {
      id: now.getTime().toString(),
      exerciseName,
      startTime: sessionStart,
      endTime: new Date(),
      sets: sessionSets,
    };

    // Save session to storage
    const storageKey = `${exerciseName}-sessions`;
    AsyncStorage.setItem(storageKey, JSON.stringify(sessionData));

    setSessionStart(null);
    setSessionSets([]);
  }, [exerciseName, sessionStart, sessionSets]);

  const addSet = useCallback((set: any) => {
    setSessionSets(prev => [...prev, set]);
  }, []);

  return {
    sessionActive,
    sessionStart,
    sessionSets,
    startSession,
    endSession,
    addSet,
  };
};

// Hook for BMR calculations
export const useBMR = (userMetrics: {
  weight: number;
  height: number;
  age: number;
  gender: 'male' | 'female' | 'other';
  activityLevel: number;
}) => {
  const calculateBMR = useCallback(() => {
    const { weight, height, age, gender, activityLevel } = userMetrics;

    // Mifflin-St Jeor Equation
    let bmr: number;
    if (gender === 'male') {
      bmr = 88.362 + 13.397 * weight + 4.799 * height - 5.677 * age;
    } else {
      bmr = 447.593 + 9.247 * weight + 3.098 * height - 4.33 * age;
    }

    // Apply activity level multiplier
    const activityMultipliers = [1.2, 1.375, 1.55, 1.725, 1.9];
    const multiplier =
      activityMultipliers[Math.min(activityLevel - 1, 4)] || 1.2;

    return Math.round(bmr * multiplier);
  }, [userMetrics]);

  return { calculateBMR };
};

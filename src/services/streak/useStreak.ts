import { useEffect, useState, useCallback } from 'react';
import streakService, { StreakData } from './StreakService';

export function useStreak() {
  const [streak, setStreak] = useState<StreakData>({
    currentStreak: 0,
    longestStreak: 0,
    lastActivityDate: '',
    totalActivities: 0,
  });
  const [loading, setLoading] = useState(true);

  const loadStreak = useCallback(async () => {
    try {
      const data = await streakService.getStreak();
      setStreak(data);
    } catch (error) {
      console.error('Failed to load streak:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStreak();

    const checkMidnight = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      const timeUntilMidnight = tomorrow.getTime() - now.getTime();
      
      const timer = setTimeout(async () => {
        await streakService.initialize();
        await loadStreak();
        checkMidnight();
      }, timeUntilMidnight);

      return () => clearTimeout(timer);
    };

    const cleanup = checkMidnight();

    return () => {
      cleanup;
    };
  }, [loadStreak]);

  const recordActivity = useCallback(async () => {
    const increased = await streakService.recordActivity();
    if (increased) {
      await loadStreak();
    }
    return increased;
  }, [loadStreak]);

  return {
    streak,
    loading,
    recordActivity,
    refreshStreak: loadStreak,
  };
}

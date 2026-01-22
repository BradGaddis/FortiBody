import { activityService, ActivityGoal, ActivityData } from '../../src/services/activity/ActivityService';

describe('ActivityService', () => {
  const mockGoal: ActivityGoal = {
    steps: 10000,
    calories: 500,
    distance: 5,
    activeMinutes: 60,
  };

  describe('calculateGoalProgress', () => {
    it('should calculate step progress correctly', () => {
      const data: ActivityData = {
        steps: 5000,
        calories: 250,
        distance: 2.5,
        activeMinutes: 30,
        date: '2024-01-01',
      };
      
      const progress = activityService.calculateGoalProgress(data, mockGoal);
      expect(progress.steps).toBe(50);
      expect(progress.calories).toBe(50);
      expect(progress.distance).toBe(50);
      expect(progress.activeMinutes).toBe(50);
    });

    it('should cap progress at 100%', () => {
      const data: ActivityData = {
        steps: 15000,
        calories: 750,
        distance: 10,
        activeMinutes: 120,
        date: '2024-01-01',
      };
      
      const progress = activityService.calculateGoalProgress(data, mockGoal);
      expect(progress.steps).toBe(100);
      expect(progress.calories).toBe(100);
    });

    it('should handle zero goal gracefully', () => {
      const zeroGoal: ActivityGoal = {
        steps: 0,
        calories: 0,
        distance: 0,
        activeMinutes: 0,
      };
      
      const data: ActivityData = {
        steps: 5000,
        calories: 250,
        distance: 2.5,
        activeMinutes: 30,
        date: '2024-01-01',
      };
      
      const progress = activityService.calculateGoalProgress(data, zeroGoal);
      expect(progress.steps).toBe(0);
      expect(progress.calories).toBe(0);
    });

    it('should handle zero data gracefully', () => {
      const data: ActivityData = {
        steps: 0,
        calories: 0,
        distance: 0,
        activeMinutes: 0,
        date: '2024-01-01',
      };
      
      const progress = activityService.calculateGoalProgress(data, mockGoal);
      expect(progress.steps).toBe(0);
      expect(progress.calories).toBe(0);
    });
  });

  describe('formatDuration', () => {
    it('should format hours and minutes correctly', () => {
      expect(activityService.formatDuration(90)).toBe('1h 30m');
      expect(activityService.formatDuration(60)).toBe('1h 0m');
      expect(activityService.formatDuration(45)).toBe('45m');
      expect(activityService.formatDuration(0)).toBe('0m');
    });
  });

  describe('formatDistance', () => {
    it('should format kilometers correctly', () => {
      expect(activityService.formatDistance(5.5)).toBe('5.50 km');
      expect(activityService.formatDistance(1)).toBe('1.00 km');
      expect(activityService.formatDistance(0.5)).toBe('500 m');
      expect(activityService.formatDistance(0.001)).toBe('1 m');
    });
  });
});

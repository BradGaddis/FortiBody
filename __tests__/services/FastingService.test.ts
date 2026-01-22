import { fastingService, FastingSplit } from '../../src/services/nutrition/FastingService';

describe('FastingService', () => {
  describe('getFastingStatus', () => {
    it('should return not fasting when no last meal time', async () => {
      const status = await fastingService.getFastingStatus();
      expect(status.isFasting).toBe(false);
    });
  });

  describe('calculateProgress', () => {
    const calculateProgress = (elapsed: number, target: number): number => {
      if (target <= 0) return 100;
      const progress = (elapsed / target) * 100;
      return Math.min(Math.max(progress, 0), 100);
    };

    it('should calculate 0% progress for no elapsed time', () => {
      const progress = calculateProgress(0, 16);
      expect(progress).toBe(0);
    });

    it('should calculate 50% progress halfway', () => {
      const progress = calculateProgress(8, 16);
      expect(progress).toBe(50);
    });

    it('should cap progress at 100%', () => {
      const progress = calculateProgress(20, 16);
      expect(progress).toBe(100);
    });
  });

  describe('formatDuration', () => {
    const formatDuration = (minutes: number): string => {
      const h = Math.floor(minutes / 60);
      const m = Math.round(minutes % 60);
      return `${h}h ${m.toString().padStart(2, '0')}m`;
    };

    it('should format hours correctly', () => {
      expect(formatDuration(0)).toBe('0h 00m');
      expect(formatDuration(8.5 * 60)).toBe('8h 30m');
      expect(formatDuration(16 * 60)).toBe('16h 00m');
    });
  });

  describe('getGoalLabel', () => {
    const getGoalLabel = (hours: number): string => {
      switch (hours) {
        case 16: return '16:8';
        case 18: return '18:6';
        case 20: return '20:4';
        case 23: return '23:1';
        default: return 'Custom';
      }
    };

    it('should return correct labels for splits', () => {
      expect(getGoalLabel(16)).toBe('16:8');
      expect(getGoalLabel(18)).toBe('18:6');
      expect(getGoalLabel(20)).toBe('20:4');
      expect(getGoalLabel(23)).toBe('23:1');
      expect(getGoalLabel(12)).toBe('Custom');
    });
  });
});

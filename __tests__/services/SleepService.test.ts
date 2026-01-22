import { sleepService } from '../../src/services/sleep/SleepService';
import { SleepEntry, SleepQuality } from '../services/sleep/SleepService';

describe('SleepService', () => {
  describe('formatDuration', () => {
    it('should format hours correctly', () => {
      expect(sleepService.formatDuration(480)).toBe('8h');
      expect(sleepService.formatDuration(510)).toBe('8h 30m');
      expect(sleepService.formatDuration(450)).toBe('7h 30m');
    });
  });

  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2024-01-15T00:00:00');
      const formatted = sleepService.formatDate(date);
      expect(formatted).toContain('Jan');
      expect(formatted).toContain('15');
    });
  });

  describe('formatTime', () => {
    it('should format time correctly', () => {
      const date1 = new Date('2024-01-15T22:30:00');
      const date2 = new Date('2024-01-15T06:45:00');
      
      expect(sleepService.formatTime(date1)).toBeDefined();
      expect(sleepService.formatTime(date2)).toBeDefined();
    });
  });
});

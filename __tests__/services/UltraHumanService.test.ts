import { ultraHumanService } from '../../src/services/integrations/UltraHumanService';

describe('UltraHumanService', () => {
  describe('getRecoveryLabel', () => {
    it('should return correct labels for different scores', () => {
      expect(ultraHumanService.getRecoveryLabel(95)).toBe('Excellent');
      expect(ultraHumanService.getRecoveryLabel(85)).toBe('Good');
      expect(ultraHumanService.getRecoveryLabel(70)).toBe('Fair');
      expect(ultraHumanService.getRecoveryLabel(50)).toBe('Low');
      expect(ultraHumanService.getRecoveryLabel(30)).toBe('Poor');
    });

    it('should handle boundary values', () => {
      expect(ultraHumanService.getRecoveryLabel(90)).toBe('Excellent');
      expect(ultraHumanService.getRecoveryLabel(89)).toBe('Good');
      expect(ultraHumanService.getRecoveryLabel(75)).toBe('Good');
      expect(ultraHumanService.getRecoveryLabel(74)).toBe('Fair');
      expect(ultraHumanService.getRecoveryLabel(60)).toBe('Fair');
      expect(ultraHumanService.getRecoveryLabel(59)).toBe('Low');
      expect(ultraHumanService.getRecoveryLabel(40)).toBe('Low');
      expect(ultraHumanService.getRecoveryLabel(39)).toBe('Poor');
    });
  });

  describe('getStressLabel', () => {
    it('should return correct stress levels based on HRV', () => {
      expect(ultraHumanService.getStressLabel(70)).toBe('Low');
      expect(ultraHumanService.getStressLabel(50)).toBe('Moderate');
      expect(ultraHumanService.getStressLabel(30)).toBe('High');
      expect(ultraHumanService.getStressLabel(20)).toBe('Very High');
    });

    it('should handle boundary values', () => {
      expect(ultraHumanService.getStressLabel(61)).toBe('Low');
      expect(ultraHumanService.getStressLabel(60)).toBe('Low');
      expect(ultraHumanService.getStressLabel(59)).toBe('Moderate');
      expect(ultraHumanService.getStressLabel(41)).toBe('Moderate');
      expect(ultraHumanService.getStressLabel(40)).toBe('Moderate');
      expect(ultraHumanService.getStressLabel(39)).toBe('High');
      expect(ultraHumanService.getStressLabel(26)).toBe('High');
      expect(ultraHumanService.getStressLabel(25)).toBe('High');
    });
  });

  describe('getRecoveryColor', () => {
    it('should return correct colors for different scores', () => {
      expect(ultraHumanService.getRecoveryColor(80)).toBe('#4CAF50');
      expect(ultraHumanService.getRecoveryColor(65)).toBe('#8BC34A');
      expect(ultraHumanService.getRecoveryColor(50)).toBe('#FF9800');
      expect(ultraHumanService.getRecoveryColor(30)).toBe('#FF5722');
      expect(ultraHumanService.getRecoveryColor(20)).toBe('#F44336');
    });
  });

  describe('isConfigured', () => {
    it('should return false when API key is not set', () => {
      expect(ultraHumanService.isConfigured()).toBe(false);
    });
  });
});

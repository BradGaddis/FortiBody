describe('StreakService Logic', () => {
  const calculateStreak = (activities: { date: Date; type: string }[]): number => {
    if (activities.length === 0) return 0;
    
    const sorted = [...activities].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    let streak = 1;
    for (let i = 1; i < sorted.length; i++) {
      const current = new Date(sorted[i].date).setHours(0, 0, 0, 0);
      const prev = new Date(sorted[i-1].date).setHours(0, 0, 0, 0);
      const diffDays = Math.abs((current - prev) / (1000 * 60 * 60 * 24));
      
      if (diffDays < 1) continue;
      if (diffDays >= 1.5) break;
      streak++;
    }
    
    return streak;
  };

  const formatStreak = (days: number): string => {
    return days === 1 ? '1 day' : `${days} days`;
  };

  describe('calculateStreak', () => {
    it('should return 0 for empty activity list', () => {
      const streak = calculateStreak([]);
      expect(streak).toBe(0);
    });

    it('should return 1 for single activity', () => {
      const today = new Date();
      const activities = [
        { date: today, type: 'food' },
      ];
      const streak = calculateStreak(activities);
      expect(streak).toBe(1);
    });

    it('should calculate consecutive days correctly', () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const twoDaysAgo = new Date(today);
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

      const activities = [
        { date: twoDaysAgo, type: 'food' },
        { date: yesterday, type: 'exercise' },
        { date: today, type: 'food' },
      ];
      
      const streak = calculateStreak(activities);
      expect(streak).toBe(3);
    });

    it('should break streak on gaps', () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const twoDaysAgo = new Date(today);
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      const threeDaysAgo = new Date(today);
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      const activities = [
        { date: threeDaysAgo, type: 'food' },
        { date: twoDaysAgo, type: 'exercise' },
        { date: yesterday, type: 'food' },
      ];
      
      const streak = calculateStreak(activities);
      expect(streak).toBe(3);
    });
  });

  describe('formatStreak', () => {
    it('should format single day', () => {
      expect(formatStreak(1)).toBe('1 day');
    });

    it('should format multiple days', () => {
      expect(formatStreak(5)).toBe('5 days');
      expect(formatStreak(10)).toBe('10 days');
      expect(formatStreak(100)).toBe('100 days');
    });
  });
});

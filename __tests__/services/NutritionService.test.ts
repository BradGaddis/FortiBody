import { nutritionService } from '../../src/services/nutrition/NutritionService';
import { MealType } from '../services/nutrition/types';

describe('NutritionService', () => {
  describe('calculateTotals', () => {
    it('should return zeros for empty entries', () => {
      const totals = nutritionService as any;
      const result = totals.calculateTotals([]);
      expect(result.totalCalories).toBe(0);
      expect(result.totalProtein).toBe(0);
      expect(result.totalCarbs).toBe(0);
      expect(result.totalFat).toBe(0);
    });

    it('should calculate totals with single entry', () => {
      const totals = nutritionService as any;
      const entries = [
        {
          food: {
            calories: 200,
            protein: 20,
            carbs: 25,
            fat: 5,
          },
          servings: 1,
        },
      ];
      
      const result = totals.calculateTotals(entries);
      expect(result.totalCalories).toBe(200);
      expect(result.totalProtein).toBe(20);
      expect(result.totalCarbs).toBe(25);
      expect(result.totalFat).toBe(5);
    });

    it('should multiply by servings', () => {
      const totals = nutritionService as any;
      const entries = [
        {
          food: {
            calories: 100,
            protein: 10,
            carbs: 10,
            fat: 5,
          },
          servings: 2.5,
        },
      ];
      
      const result = totals.calculateTotals(entries);
      expect(result.totalCalories).toBe(250);
      expect(result.totalProtein).toBe(25);
      expect(result.totalCarbs).toBe(25);
      expect(result.totalFat).toBe(12.5);
    });
  });

  describe('calculateMealBreakdown', () => {
    it('should return zeros for empty entries', () => {
      const calculateMealBreakdown = (nutritionService as any).calculateMealBreakdown;
      const result = calculateMealBreakdown([]);
      expect(result.breakfast.calories).toBe(0);
      expect(result.lunch.calories).toBe(0);
      expect(result.dinner.calories).toBe(0);
      expect(result.snacks.calories).toBe(0);
    });

    it('should organize by meal type', () => {
      const calculateMealBreakdown = (nutritionService as any).calculateMealBreakdown;
      const entries = [
        {
          meal: 'breakfast' as MealType,
          food: { calories: 300, protein: 20, carbs: 30, fat: 10 },
          servings: 1,
        },
        {
          meal: 'lunch' as MealType,
          food: { calories: 500, protein: 30, carbs: 50, fat: 15 },
          servings: 1,
        },
        {
          meal: 'snacks' as MealType,
          food: { calories: 150, protein: 5, carbs: 20, fat: 5 },
          servings: 1,
        },
      ];
      
      const result = calculateMealBreakdown(entries);
      expect(result.breakfast.calories).toBe(300);
      expect(result.lunch.calories).toBe(500);
      expect(result.snacks.calories).toBe(150);
      expect(result.dinner.calories).toBe(0);
    });
  });
});

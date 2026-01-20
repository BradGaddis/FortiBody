import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';
import {
  FoodItem,
  FoodEntry,
  DailyNutrition,
  NutritionGoal,
  MealType,
  DEFAULT_NUTRITION_GOAL,
} from './types';

const FOOD_DATABASE_KEY = '@fortibody_food_database';
const FOOD_ENTRIES_KEY = '@fortibody_food_entries';
const NUTRITION_GOAL_KEY = '@fortibody_nutrition_goal';

class NutritionService {
  private static instance: NutritionService;

  private constructor() {}

  static getInstance(): NutritionService {
    if (!NutritionService.instance) {
      NutritionService.instance = new NutritionService();
    }
    return NutritionService.instance;
  }

  async addFood(
    food: Omit<FoodItem, 'id' | 'createdAt' | 'isCustom'>
  ): Promise<FoodItem> {
    const newFood: FoodItem = {
      ...food,
      id: uuidv4(),
      isCustom: true,
      createdAt: new Date(),
    };

    try {
      const database = await this.getFoodDatabase();
      database.push(newFood);
      await AsyncStorage.setItem(FOOD_DATABASE_KEY, JSON.stringify(database));
      return newFood;
    } catch (error) {
      console.error('Failed to add food:', error);
      throw error;
    }
  }

  async getFoodDatabase(): Promise<FoodItem[]> {
    try {
      const data = await AsyncStorage.getItem(FOOD_DATABASE_KEY);
      return data ? JSON.parse(data) : this.getDefaultFoodDatabase();
    } catch {
      return this.getDefaultFoodDatabase();
    }
  }

  async searchFoods(query: string): Promise<FoodItem[]> {
    const database = await this.getFoodDatabase();
    const lowerQuery = query.toLowerCase();
    return database.filter(
      food =>
        food.name.toLowerCase().includes(lowerQuery) ||
        food.brand?.toLowerCase().includes(lowerQuery)
    );
  }

  async getFoodById(id: string): Promise<FoodItem | null> {
    const database = await this.getFoodDatabase();
    return database.find(food => food.id === id) || null;
  }

  async deleteFood(id: string): Promise<void> {
    try {
      const database = await this.getFoodDatabase();
      const filtered = database.filter(food => food.id !== id);
      await AsyncStorage.setItem(FOOD_DATABASE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Failed to delete food:', error);
      throw error;
    }
  }

  async addFoodEntry(entry: Omit<FoodEntry, 'id'>): Promise<FoodEntry> {
    const newEntry: FoodEntry = {
      ...entry,
      id: uuidv4(),
    };

    try {
      const entries = await this.getAllEntries();
      entries.push(newEntry);
      await AsyncStorage.setItem(FOOD_ENTRIES_KEY, JSON.stringify(entries));
      
      // Also save the food to the database for future use
      const database = await this.getFoodDatabase();
      const existingFood = database.find(f => f.id === entry.foodId);
      if (!existingFood) {
        database.push(entry.food);
        await AsyncStorage.setItem(FOOD_DATABASE_KEY, JSON.stringify(database));
      }
      
      return newEntry;
    } catch (error) {
      console.error('Failed to add food entry:', error);
      throw error;
    }
  }

  async getFoodByBarcode(barcode: string): Promise<FoodItem | null> {
    try {
      const database = await this.getFoodDatabase();
      const existingFood = database.find(food => food.barcode === barcode);
      if (existingFood) return existingFood;

      const response = await fetch(
        `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`
      );
      const data = await response.json();

      if (data.status === 1 && data.product) {
        const product = data.product;
        const servingSize = product.serving_size
          ? parseFloat(product.serving_size)
          : 100;
        const servingUnit = product.serving_size
          ? product.serving_size.replace(/[\d.]/g, '').trim() || 'g'
          : 'g';

        return {
          id: uuidv4(),
          name: product.product_name || 'Unknown Product',
          brand: product.brands || product.brands_tags?.[0] || undefined,
          barcode: barcode,
          servingSize: servingSize,
          servingUnit: servingUnit,
          calories: Math.round(
            product.nutriments['energy-kcal_100g'] ||
              (product.nutriments['energy-kcal'] || 0) / (servingSize / 100)
          ),
          protein:
            product.nutriments.protein_100g || product.nutriments.protein || 0,
          carbs:
            product.nutriments.carbohydrates_100g ||
            product.nutriments.carbohydrates ||
            0,
          fat: product.nutriments.fat_100g || product.nutriments.fat || 0,
          fiber:
            product.nutriments.fiber_100g ||
            product.nutriments.fiber ||
            undefined,
          sugar:
            product.nutriments.sugars_100g ||
            product.nutriments.sugars ||
            undefined,
          sodium:
            product.nutriments.sodium_100g ||
            product.nutriments.sodium ||
            undefined,
          isCustom: true,
          createdAt: new Date(),
        };
      }

      return null;
    } catch (error) {
      console.error('Failed to fetch food by barcode:', error);
      return null;
    }
  }

  async getAllEntries(): Promise<FoodEntry[]> {
    try {
      const data = await AsyncStorage.getItem(FOOD_ENTRIES_KEY);
      const parsed = data ? JSON.parse(data) : [];
      return parsed.map((entry: any) => ({
        ...entry,
        date: new Date(entry.date),
        food: {
          ...entry.food,
          createdAt: new Date(entry.food.createdAt),
        },
      }));
    } catch {
      return [];
    }
  }

  async getDailyNutrition(date: Date): Promise<DailyNutrition> {
    const entries = await this.getAllEntries();
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const dayEntries = entries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= dayStart && entryDate <= dayEnd;
    });

    const totals = this.calculateTotals(dayEntries);
    const mealBreakdown = this.calculateMealBreakdown(dayEntries);

    return {
      date,
      entries: dayEntries,
      ...totals,
      mealBreakdown,
    };
  }

  async getDateRangeNutrition(
    startDate: Date,
    endDate: Date
  ): Promise<DailyNutrition[]> {
    const nutritionData: DailyNutrition[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const daily = await this.getDailyNutrition(currentDate);
      nutritionData.push(daily);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return nutritionData;
  }

  async deleteEntry(id: string): Promise<void> {
    try {
      const entries = await this.getAllEntries();
      const filtered = entries.filter(entry => entry.id !== id);
      await AsyncStorage.setItem(FOOD_ENTRIES_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Failed to delete entry:', error);
      throw error;
    }
  }

  async updateEntry(
    id: string,
    updates: Partial<FoodEntry>
  ): Promise<FoodEntry | null> {
    try {
      const entries = await this.getAllEntries();
      const index = entries.findIndex(entry => entry.id === id);
      if (index === -1) return null;

      entries[index] = { ...entries[index], ...updates };
      await AsyncStorage.setItem(FOOD_ENTRIES_KEY, JSON.stringify(entries));
      return entries[index];
    } catch (error) {
      console.error('Failed to update entry:', error);
      throw error;
    }
  }

  async getNutritionGoal(): Promise<NutritionGoal> {
    try {
      const data = await AsyncStorage.getItem(NUTRITION_GOAL_KEY);
      return data ? JSON.parse(data) : DEFAULT_NUTRITION_GOAL;
    } catch {
      return DEFAULT_NUTRITION_GOAL;
    }
  }

  async setNutritionGoal(goal: NutritionGoal): Promise<void> {
    try {
      await AsyncStorage.setItem(NUTRITION_GOAL_KEY, JSON.stringify(goal));
    } catch (error) {
      console.error('Failed to set nutrition goal:', error);
      throw error;
    }
  }

  private calculateTotals(entries: FoodEntry[]): {
    totalCalories: number;
    totalProtein: number;
    totalCarbs: number;
    totalFat: number;
    totalFiber: number;
    totalSugar: number;
    totalSodium: number;
  } {
    return entries.reduce(
      (acc, entry) => {
        const multiplier = entry.servings;
        return {
          totalCalories: acc.totalCalories + entry.food.calories * multiplier,
          totalProtein: acc.totalProtein + entry.food.protein * multiplier,
          totalCarbs: acc.totalCarbs + entry.food.carbs * multiplier,
          totalFat: acc.totalFat + entry.food.fat * multiplier,
          totalFiber: acc.totalFiber + (entry.food.fiber || 0) * multiplier,
          totalSugar: acc.totalSugar + (entry.food.sugar || 0) * multiplier,
          totalSodium: acc.totalSodium + (entry.food.sodium || 0) * multiplier,
        };
      },
      {
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0,
        totalFiber: 0,
        totalSugar: 0,
        totalSodium: 0,
      }
    );
  }

  private calculateMealBreakdown(
    entries: FoodEntry[]
  ): Record<
    MealType,
    { calories: number; protein: number; carbs: number; fat: number }
  > {
    const breakdown: Record<
      MealType,
      { calories: number; protein: number; carbs: number; fat: number }
    > = {
      breakfast: { calories: 0, protein: 0, carbs: 0, fat: 0 },
      lunch: { calories: 0, protein: 0, carbs: 0, fat: 0 },
      dinner: { calories: 0, protein: 0, carbs: 0, fat: 0 },
      snacks: { calories: 0, protein: 0, carbs: 0, fat: 0 },
    };

    entries.forEach(entry => {
      const multiplier = entry.servings;
      const meal = entry.meal;
      breakdown[meal] = {
        calories: breakdown[meal].calories + entry.food.calories * multiplier,
        protein: breakdown[meal].protein + entry.food.protein * multiplier,
        carbs: breakdown[meal].carbs + entry.food.carbs * multiplier,
        fat: breakdown[meal].fat + entry.food.fat * multiplier,
      };
    });

    return breakdown;
  }

  private getDefaultFoodDatabase(): FoodItem[] {
    return [
      {
        id: 'food-1',
        name: 'Chicken Breast',
        servingSize: 100,
        servingUnit: 'g',
        calories: 165,
        protein: 31,
        carbs: 0,
        fat: 3.6,
        isCustom: false,
        createdAt: new Date(),
      },
      {
        id: 'food-2',
        name: 'Brown Rice',
        servingSize: 150,
        servingUnit: 'g',
        calories: 165,
        protein: 3.8,
        carbs: 34,
        fat: 1.4,
        fiber: 1.8,
        isCustom: false,
        createdAt: new Date(),
      },
      {
        id: 'food-3',
        name: 'Broccoli',
        servingSize: 100,
        servingUnit: 'g',
        calories: 34,
        protein: 2.8,
        carbs: 7,
        fat: 0.4,
        fiber: 2.6,
        isCustom: false,
        createdAt: new Date(),
      },
      {
        id: 'food-4',
        name: 'Eggs',
        servingSize: 1,
        servingUnit: 'large',
        calories: 78,
        protein: 6,
        carbs: 0.6,
        fat: 5,
        isCustom: false,
        createdAt: new Date(),
      },
      {
        id: 'food-5',
        name: 'Oatmeal',
        servingSize: 40,
        servingUnit: 'g',
        calories: 150,
        protein: 5,
        carbs: 27,
        fat: 3,
        fiber: 4,
        isCustom: false,
        createdAt: new Date(),
      },
      {
        id: 'food-6',
        name: 'Greek Yogurt',
        servingSize: 170,
        servingUnit: 'g',
        calories: 100,
        protein: 17,
        carbs: 6,
        fat: 0.7,
        isCustom: false,
        createdAt: new Date(),
      },
      {
        id: 'food-7',
        name: 'Salmon',
        servingSize: 100,
        servingUnit: 'g',
        calories: 208,
        protein: 20,
        carbs: 0,
        fat: 13,
        isCustom: false,
        createdAt: new Date(),
      },
      {
        id: 'food-8',
        name: 'Sweet Potato',
        servingSize: 150,
        servingUnit: 'g',
        calories: 130,
        protein: 2,
        carbs: 30,
        fat: 0.1,
        fiber: 4,
        isCustom: false,
        createdAt: new Date(),
      },
      {
        id: 'food-9',
        name: 'Banana',
        servingSize: 1,
        servingUnit: 'medium',
        calories: 105,
        protein: 1.3,
        carbs: 27,
        fat: 0.4,
        fiber: 3.1,
        isCustom: false,
        createdAt: new Date(),
      },
      {
        id: 'food-10',
        name: 'Almonds',
        servingSize: 28,
        servingUnit: 'g',
        calories: 164,
        protein: 6,
        carbs: 6,
        fat: 14,
        fiber: 3.5,
        isCustom: false,
        createdAt: new Date(),
      },
    ];
  }
}

export const nutritionService = NutritionService.getInstance();
export default nutritionService;

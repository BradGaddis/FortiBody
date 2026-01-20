export interface FoodItem {
  id: string;
  name: string;
  brand?: string;
  barcode?: string;
  servingSize: number;
  servingUnit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  cholesterol?: number;
  saturatedFat?: number;
  unsaturatedFat?: number;
  vitaminA?: number;
  vitaminC?: number;
  vitaminD?: number;
  calcium?: number;
  iron?: number;
  potassium?: number;
  isCustom: boolean;
  createdAt: Date;
}

export interface FoodEntry {
  id: string;
  foodId: string;
  food: FoodItem;
  servings: number;
  meal: MealType;
  date: Date;
  notes?: string;
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snacks';

export interface DailyNutrition {
  date: Date;
  entries: FoodEntry[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalFiber: number;
  totalSugar: number;
  totalSodium: number;
  mealBreakdown: Record<
    MealType,
    { calories: number; protein: number; carbs: number; fat: number }
  >;
}

export interface NutritionGoal {
  id: string;
  name: string;
  dailyCalories: number;
  dailyProtein: number;
  dailyCarbs: number;
  dailyFat: number;
  dailyFiber: number;
  dailySugar: number;
  dailySodium: number;
  isActive: boolean;
  startDate: Date;
  endDate?: Date;
}

export interface NutritionStats {
  averageCalories: number;
  averageProtein: number;
  averageCarbs: number;
  averageFat: number;
  streakDays: number;
  totalDaysLogged: number;
  goalAchievementRate: number;
}

export const DEFAULT_NUTRITION_GOAL: NutritionGoal = {
  id: 'default',
  name: 'Default Goal',
  dailyCalories: 2000,
  dailyProtein: 150,
  dailyCarbs: 250,
  dailyFat: 65,
  dailyFiber: 25,
  dailySugar: 50,
  dailySodium: 2300,
  isActive: true,
  startDate: new Date(),
};

export const MEAL_TYPES: { id: MealType; label: string; icon: string }[] = [
  { id: 'breakfast', label: 'Breakfast', icon: 'sunrise' },
  { id: 'lunch', label: 'Lunch', icon: 'sunny' },
  { id: 'dinner', label: 'Dinner', icon: 'moon' },
  { id: 'snacks', label: 'Snacks', icon: 'fast-food' },
];

export const NUTRIENT_LABELS: Record<
  keyof Omit<
    FoodItem,
    'id' | 'name' | 'brand' | 'barcode' | 'isCustom' | 'createdAt'
  >,
  string
> = {
  servingSize: 'Serving Size',
  servingUnit: 'Serving Unit',
  calories: 'Calories',
  protein: 'Protein',
  carbs: 'Carbohydrates',
  fat: 'Fat',
  fiber: 'Fiber',
  sugar: 'Sugar',
  sodium: 'Sodium',
  cholesterol: 'Cholesterol',
  saturatedFat: 'Saturated Fat',
  unsaturatedFat: 'Unsaturated Fat',
  vitaminA: 'Vitamin A',
  vitaminC: 'Vitamin C',
  vitaminD: 'Vitamin D',
  calcium: 'Calcium',
  iron: 'Iron',
  potassium: 'Potassium',
};

export const CALORIE_PER_GRAM = {
  protein: 4,
  carbs: 4,
  fat: 9,
  alcohol: 7,
};

export const MACRO_RATIOS = {
  balanced: { protein: 0.3, carbs: 0.4, fat: 0.3 },
  lowCarb: { protein: 0.4, carbs: 0.2, fat: 0.4 },
  highCarb: { protein: 0.2, carbs: 0.6, fat: 0.2 },
  highProtein: { protein: 0.5, carbs: 0.3, fat: 0.2 },
  keto: { protein: 0.25, carbs: 0.05, fat: 0.7 },
};

export type MacroRatioType = keyof typeof MACRO_RATIOS;

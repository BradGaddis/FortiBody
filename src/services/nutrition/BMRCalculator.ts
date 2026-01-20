export type Gender = 'male' | 'female';
export type ActivityLevel =
  | 'sedentary'
  | 'lightly_active'
  | 'moderately_active'
  | 'active'
  | 'very_active';
export type GoalType =
  | 'lose_weight'
  | 'maintain'
  | 'gain_weight'
  | 'aggressive_cut'
  | 'lean_bulk';

export interface BMRInput {
  weight: number;
  height: number;
  age: number;
  gender: Gender;
}

export interface BMRResult {
  bmr: number;
  tdee: number;
  dailyCalories: number;
  goalCalories: number;
  protein: number;
  carbs: number;
  fat: number;
  formula: BMRFormula;
}

export type BMRFormula =
  | 'mifflin_st_jeor'
  | 'harris_benedict'
  | 'katch_mcardle';

export interface ActivityMultiplier {
  sedentary: 1.2;
  lightly_active: 1.375;
  moderately_active: 1.55;
  active: 1.725;
  very_active: 1.9;
}

export const ACTIVITY_LEVELS: {
  id: ActivityLevel;
  label: string;
  description: string;
  multiplier: number;
}[] = [
  {
    id: 'sedentary',
    label: 'Sedentary',
    description: 'Little to no exercise, desk job',
    multiplier: 1.2,
  },
  {
    id: 'lightly_active',
    label: 'Lightly Active',
    description: 'Light exercise 1-3 days/week',
    multiplier: 1.375,
  },
  {
    id: 'moderately_active',
    label: 'Moderately Active',
    description: 'Moderate exercise 3-5 days/week',
    multiplier: 1.55,
  },
  {
    id: 'active',
    label: 'Active',
    description: 'Hard exercise 6-7 days/week',
    multiplier: 1.725,
  },
  {
    id: 'very_active',
    label: 'Very Active',
    description: 'Very hard exercise, physical job',
    multiplier: 1.9,
  },
];

export const GOAL_SETTINGS: {
  id: GoalType;
  label: string;
  description: string;
  calorieAdjustment: number;
  proteinMultiplier: number;
}[] = [
  {
    id: 'aggressive_cut',
    label: 'Aggressive Cut',
    description: 'Lose 1-1.5% body weight per week',
    calorieAdjustment: -750,
    proteinMultiplier: 1.2,
  },
  {
    id: 'lose_weight',
    label: 'Lose Weight',
    description: 'Lose 0.5-1% body weight per week',
    calorieAdjustment: -500,
    proteinMultiplier: 1.0,
  },
  {
    id: 'maintain',
    label: 'Maintain',
    description: 'Stay at current weight',
    calorieAdjustment: 0,
    proteinMultiplier: 0.8,
  },
  {
    id: 'lean_bulk',
    label: 'Lean Bulk',
    description: 'Gain 0.25-0.5% body weight per week',
    calorieAdjustment: 250,
    proteinMultiplier: 0.9,
  },
  {
    id: 'gain_weight',
    label: 'Gain Weight',
    description: 'Gain 0.5-1% body weight per week',
    calorieAdjustment: 500,
    proteinMultiplier: 0.8,
  },
];

export class BMRCalculator {
  static calculateBMR(
    input: BMRInput,
    formula: BMRFormula = 'mifflin_st_jeor'
  ): number {
    switch (formula) {
      case 'mifflin_st_jeor':
        return this.mifflinStJeor(input);
      case 'harris_benedict':
        return this.harrisBenedict(input);
      case 'katch_mcardle':
        return this.katchMcArdle(input);
      default:
        return this.mifflinStJeor(input);
    }
  }

  static mifflinStJeor(input: BMRInput): number {
    const { weight, height, age, gender } = input;
    if (gender === 'male') {
      return 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      return 10 * weight + 6.25 * height - 5 * age - 161;
    }
  }

  static harrisBenedict(input: BMRInput): number {
    const { weight, height, age, gender } = input;
    if (gender === 'male') {
      return 66.47 + 13.75 * weight + 5.003 * height - 6.755 * age;
    } else {
      return 655.1 + 9.563 * weight + 1.85 * height - 4.676 * age;
    }
  }

  static katchMcArdle(input: BMRInput, bodyFat?: number): number {
    const { weight, gender } = input;
    if (bodyFat !== undefined) {
      const leanMass = weight * (1 - bodyFat / 100);
      return 370 + 21.6 * leanMass;
    }
    return this.mifflinStJeor(input);
  }

  static calculateTDEE(
    input: BMRInput,
    activityLevel: ActivityLevel,
    formula: BMRFormula = 'mifflin_st_jeor'
  ): number {
    const bmr = this.calculateBMR(input, formula);
    const multipliers: ActivityMultiplier = {
      sedentary: 1.2,
      lightly_active: 1.375,
      moderately_active: 1.55,
      active: 1.725,
      very_active: 1.9,
    };
    return Math.round(bmr * multipliers[activityLevel]);
  }

  static calculateGoalCalories(
    tdee: number,
    goal: GoalType
  ): { calories: number; adjustment: number } {
    const goalSetting = GOAL_SETTINGS.find(g => g.id === goal);
    const adjustment = goalSetting?.calorieAdjustment || 0;
    return {
      calories: Math.round(tdee + adjustment),
      adjustment,
    };
  }

  static calculateMacros(
    calories: number,
    goal: GoalType,
    weight: number
  ): { protein: number; carbs: number; fat: number } {
    const goalSetting = GOAL_SETTINGS.find(g => g.id === goal);
    const proteinMultiplier = goalSetting?.proteinMultiplier || 0.8;

    const protein = Math.round(weight * proteinMultiplier * 4);
    const proteinCalories = protein * 4;
    const fat = Math.round((calories * 0.25) / 9);
    const remainingCalories = calories - proteinCalories - fat * 9;
    const carbs = Math.round(remainingCalories / 4);

    return {
      protein: Math.max(protein, 50),
      carbs: Math.max(carbs, 20),
      fat: Math.max(fat, 20),
    };
  }

  static calculateAll(
    input: BMRInput,
    activityLevel: ActivityLevel,
    goal: GoalType,
    formula: BMRFormula = 'mifflin_st_jeor',
    bodyFat?: number
  ): BMRResult {
    const bmr = this.calculateBMR(input, formula);
    const tdee = this.calculateTDEE(input, activityLevel, formula);
    const { calories: dailyCalories, adjustment } = this.calculateGoalCalories(
      tdee,
      goal
    );
    const { protein, carbs, fat } = this.calculateMacros(
      dailyCalories,
      goal,
      input.weight
    );

    return {
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      dailyCalories,
      goalCalories: dailyCalories,
      protein,
      carbs,
      fat,
      formula,
    };
  }

  static getWeightChangeEstimate(
    tdee: number,
    goalCalories: number,
    timeframe: 'week' | 'month' = 'week'
  ): { weightChange: number; days: number } {
    const dailyCalorieDiff = tdee - goalCalories;
    const caloriesPerKg = 7700;
    const days = timeframe === 'week' ? 7 : 30;
    const weeklyCalorieDiff = dailyCalorieDiff * days;
    const weightChange = weeklyCalorieDiff / caloriesPerKg;

    return {
      weightChange: Math.round(weightChange * 10) / 10,
      days,
    };
  }

  static compareFormulas(input: BMRInput): Record<BMRFormula, number> {
    return {
      mifflin_st_jeor: this.calculateBMR(input, 'mifflin_st_jeor'),
      harris_benedict: this.calculateBMR(input, 'harris_benedict'),
      katch_mcardle: this.calculateBMR(input, 'katch_mcardle'),
    };
  }
}

export const calculateBMR = BMRCalculator.calculateBMR;
export const calculateTDEE = BMRCalculator.calculateTDEE;
export const calculateGoalCalories = BMRCalculator.calculateGoalCalories;
export const calculateMacros = BMRCalculator.calculateMacros;
export const calculateAll = BMRCalculator.calculateAll;
export default BMRCalculator;

export interface FoodEntry {
  id: string;
  name: string;
  calories: number;
  protein: number;
  date: string; // "2026-01-15"
  createdAt: number; // Unix timestamp ms
}

export interface UserSettings {
  dailyCalorieTarget: number;
  dailyProteinTarget: number;
}

export interface AppState {
  foods: FoodEntry[];
  settings: UserSettings;
  version: number;
}

export interface DaySummary {
  date: string;
  totalCalories: number;
  totalProtein: number;
  entries: FoodEntry[];
  calorieProgress: number; // 0-1
  proteinProgress: number; // 0-1
}

export type FoodTag = "breakfast" | "lunch" | "dinner" | "snack" | "junk";

export interface FoodEntry {
  id: string;
  name: string;
  calories: number;
  protein: number;
  date: string; // "YYYY-MM-DD"
  createdAt: number; // Unix timestamp ms
  tag: FoodTag;
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
  calorieProgress: number; // 0 to 1+
  proteinProgress: number; // 0 to 1+
}

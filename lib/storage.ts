import type { FoodEntry, UserSettings, AppState } from "./types";

const FOODS_KEY = "calpro:foods";
const SETTINGS_KEY = "calpro:settings";

export const DEFAULT_SETTINGS: UserSettings = {
  dailyCalorieTarget: 2000,
  dailyProteinTarget: 120,
};

function generateId(): string {
  return crypto.randomUUID();
}

export function loadFoods(): FoodEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(FOODS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveFoods(foods: FoodEntry[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(FOODS_KEY, JSON.stringify(foods));
}

export function addFood(
  name: string,
  calories: number,
  protein: number,
  date: string,
): FoodEntry {
  const entry: FoodEntry = {
    id: generateId(),
    name: name.trim(),
    calories,
    protein,
    date,
    createdAt: Date.now(),
  };
  const foods = loadFoods();
  foods.push(entry);
  saveFoods(foods);
  return entry;
}

export function deleteFood(id: string): void {
  const foods = loadFoods();
  saveFoods(foods.filter((f) => f.id !== id));
}

export function getFoodsByDate(date: string): FoodEntry[] {
  return loadFoods().filter((f) => f.date === date);
}

export function getAllFoods(): FoodEntry[] {
  return loadFoods();
}

export function getDistinctFoods(limit = 50): { name: string; calories: number; protein: number }[] {
  const foods = loadFoods();
  const seen = new Map<string, { calories: number; protein: number; count: number }>();

  for (let i = foods.length - 1; i >= 0; i--) {
    const f = foods[i];
    const existing = seen.get(f.name);
    if (existing) {
      existing.count++;
      existing.calories = f.calories;
      existing.protein = f.protein;
    } else {
      seen.set(f.name, { calories: f.calories, protein: f.protein, count: 1 });
    }
  }

  return Array.from(seen.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, limit)
    .map(([name, data]) => ({
      name,
      calories: data.calories,
      protein: data.protein,
    }));
}

export function loadSettings(): UserSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: UserSettings): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function clearAllData(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(FOODS_KEY);
  localStorage.removeItem(SETTINGS_KEY);
}

export function exportData(): void {
  const data: AppState = {
    foods: loadFoods(),
    settings: loadSettings(),
    version: 1,
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `calpro-export-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

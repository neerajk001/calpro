import type { FoodEntry, UserSettings, AppState, FoodTag } from "./types";

const FOODS_KEY = "calpro:foods";
const SETTINGS_KEY = "calpro:settings";

export const DEFAULT_SETTINGS: UserSettings = {
  dailyCalorieTarget: 2000,
  dailyProteinTarget: 120,
  trackCarbsFat: false,
};

function generateId(): string {
  if (typeof window !== "undefined" && window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch (error) {
    console.error("CalPro Storage Parse Error. Resetting corrupted node.", error);
    return fallback;
  }
}

export function loadFoods(): FoodEntry[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(FOODS_KEY);
  const foods = safeParse<any[]>(raw, []);
  
  return foods.filter((f): f is any => {
    return (
      f &&
      typeof f.id === "string" &&
      typeof f.name === "string" &&
      typeof f.calories === "number" &&
      typeof f.protein === "number" &&
      typeof f.date === "string"
    );
  }).map(f => {
    // Schema migration mapping: allocate tags if missing based on logs creation hour
    let tag = f.tag;
    if (!tag) {
      const hour = new Date(f.createdAt || Date.now()).getHours();
      if (hour >= 5 && hour < 11) tag = "breakfast";
      else if (hour >= 11 && hour < 16) tag = "lunch";
      else if (hour >= 16 && hour < 21) tag = "dinner";
      else tag = "snack";
    }

    return {
      id: f.id,
      name: f.name,
      calories: Math.max(0, Math.round(f.calories)),
      protein: Math.max(0, Math.round(f.protein * 10) / 10),
      carbs: typeof f.carbs === "number" ? Math.max(0, Math.round(f.carbs * 10) / 10) : undefined,
      fat: typeof f.fat === "number" ? Math.max(0, Math.round(f.fat * 10) / 10) : undefined,
      date: f.date,
      createdAt: f.createdAt ?? Date.now(),
      tag: tag as FoodTag,
    };
  });
}

export function saveFoods(foods: FoodEntry[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(FOODS_KEY, JSON.stringify(foods));
  } catch (err) {
    console.error("LocalStorage write limit exceeded", err);
  }
}

export function addFood(
  name: string,
  calories: number,
  protein: number,
  date: string,
  tag: FoodTag,
  carbs?: number,
  fat?: number,
): FoodEntry {
  const sanitizedName = name.trim() || "Logged Item";
  const sanitizedCalories = Math.max(0, Math.round(calories));
  const sanitizedProtein = Math.max(0, Math.round(protein * 10) / 10);
  
  const entry: FoodEntry = {
    id: generateId(),
    name: sanitizedName,
    calories: sanitizedCalories,
    protein: sanitizedProtein,
    carbs: carbs !== undefined ? Math.max(0, Math.round(carbs * 10) / 10) : undefined,
    fat: fat !== undefined ? Math.max(0, Math.round(fat * 10) / 10) : undefined,
    date: date,
    createdAt: Date.now(),
    tag: tag,
  };

  const foods = loadFoods();
  foods.push(entry);
  saveFoods(foods);
  return entry;
}

export function deleteFood(id: string): void {
  const foods = loadFoods();
  const nextFoods = foods.filter((f) => f.id !== id);
  saveFoods(nextFoods);
}

export function updateFood(
  id: string,
  name: string,
  calories: number,
  protein: number,
  date: string,
  tag: FoodTag,
  carbs?: number,
  fat?: number,
): FoodEntry | null {
  const foods = loadFoods();
  const index = foods.findIndex((f) => f.id === id);
  if (index === -1) return null;

  const sanitizedName = name.trim() || "Logged Item";
  const sanitizedCalories = Math.max(0, Math.round(calories));
  const sanitizedProtein = Math.max(0, Math.round(protein * 10) / 10);

  const updatedEntry: FoodEntry = {
    ...foods[index],
    name: sanitizedName,
    calories: sanitizedCalories,
    protein: sanitizedProtein,
    carbs: carbs !== undefined ? Math.max(0, Math.round(carbs * 10) / 10) : foods[index].carbs,
    fat: fat !== undefined ? Math.max(0, Math.round(fat * 10) / 10) : foods[index].fat,
    date: date,
    tag: tag,
  };

  foods[index] = updatedEntry;
  saveFoods(foods);
  return updatedEntry;
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
    const key = f.name.trim().toLowerCase();
    const existing = seen.get(key);
    if (existing) {
      existing.count++;
      existing.calories = f.calories;
      existing.protein = f.protein;
    } else {
      seen.set(key, { calories: f.calories, protein: f.protein, count: 1 });
    }
  }

  return Array.from(seen.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, limit)
    .map(([name, data]) => ({
      name: name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      calories: data.calories,
      protein: data.protein,
    }));
}

export function loadSettings(): UserSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  const raw = localStorage.getItem(SETTINGS_KEY);
  const parsed = safeParse<Partial<UserSettings> | null>(raw, null);
  
  return {
    dailyCalorieTarget: Math.max(100, Math.round(parsed?.dailyCalorieTarget ?? DEFAULT_SETTINGS.dailyCalorieTarget)),
    dailyProteinTarget: Math.max(10, Math.round(parsed?.dailyProteinTarget ?? DEFAULT_SETTINGS.dailyProteinTarget)),
    trackCarbsFat: parsed?.trackCarbsFat ?? false,
  };
}

export function saveSettings(settings: UserSettings): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error("LocalStorage write target error", err);
  }
}

export function clearAllData(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(FOODS_KEY);
  localStorage.removeItem(SETTINGS_KEY);
  localStorage.removeItem("calpro:deviceId");
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith("calpro:claimed:")) {
      keysToRemove.push(key);
    }
  }
  for (const key of keysToRemove) {
    localStorage.removeItem(key);
  }
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

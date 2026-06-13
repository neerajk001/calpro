"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { FoodEntry, UserSettings, DaySummary } from "./types";
import {
  loadFoods,
  addFood as storageAddFood,
  deleteFood as storageDeleteFood,
  loadSettings,
  saveSettings,
} from "./storage";

interface AppContextValue {
  foods: FoodEntry[];
  settings: UserSettings;
  hydrated: boolean;
  addFood: (name: string, calories: number, protein: number, date: string) => void;
  deleteFood: (id: string) => void;
  updateSettings: (partial: Partial<UserSettings>) => void;
  getDayFoods: (date: string) => FoodEntry[];
  getDaySummary: (date: string) => DaySummary;
  getDistinctFoods: (limit?: number) => { name: string; calories: number; protein: number }[];
  getStreak: () => number;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [foods, setFoods] = useState<FoodEntry[]>([]);
  const [settings, setSettings] = useState<UserSettings>(() => loadSettings());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setFoods(loadFoods());
    setSettings(loadSettings());
    setHydrated(true);
  }, []);

  const addFood = useCallback(
    (name: string, calories: number, protein: number, date: string) => {
      const entry = storageAddFood(name, calories, protein, date);
      setFoods((prev) => [...prev, entry]);
    },
    [],
  );

  const deleteFood = useCallback((id: string) => {
    storageDeleteFood(id);
    setFoods((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const updateSettings = useCallback((partial: Partial<UserSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...partial };
      saveSettings(next);
      return next;
    });
  }, []);

  const getDayFoods = useCallback(
    (date: string) => foods.filter((f) => f.date === date),
    [foods],
  );

  const getDaySummary = useCallback(
    (date: string): DaySummary => {
      const entries = foods.filter((f) => f.date === date);
      const totalCalories = entries.reduce((sum, e) => sum + e.calories, 0);
      const totalProtein = entries.reduce((sum, e) => sum + e.protein, 0);
      return {
        date,
        entries,
        totalCalories,
        totalProtein,
        calorieProgress: settings.dailyCalorieTarget > 0
          ? Math.min(totalCalories / settings.dailyCalorieTarget, 1)
          : 0,
        proteinProgress: settings.dailyProteinTarget > 0
          ? Math.min(totalProtein / settings.dailyProteinTarget, 1)
          : 0,
      };
    },
    [foods, settings],
  );

  const getDistinctFoods = useCallback(
    (limit = 50) => {
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
    },
    [foods],
  );

  const getStreak = useCallback(() => {
    if (foods.length === 0) return 0;
    const datesWithFood = new Set(foods.map((f) => f.date));
    const today = new Date();
    let streak = 0;
    const current = new Date(today);
    while (datesWithFood.has(current.toISOString().slice(0, 10))) {
      streak++;
      current.setDate(current.getDate() - 1);
    }
    return streak;
  }, [foods]);

  return (
    <AppContext.Provider
      value={{
        foods,
        settings,
        hydrated,
        addFood,
        deleteFood,
        updateSettings,
        getDayFoods,
        getDaySummary,
        getDistinctFoods,
        getStreak,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { FoodEntry, UserSettings, DaySummary, FoodTag } from "./types";
import {
  loadFoods,
  saveFoods,
  addFood as storageAddFood,
  deleteFood as storageDeleteFood,
  updateFood as storageUpdateFood,
  loadSettings,
  saveSettings,
} from "./storage";

interface AppContextValue {
  foods: FoodEntry[];
  settings: UserSettings;
  hydrated: boolean;
  addFood: (name: string, calories: number, protein: number, date: string, tag: FoodTag) => void;
  deleteFood: (id: string) => void;
  updateFood: (id: string, name: string, calories: number, protein: number, date: string, tag: FoodTag) => void;
  undoDeleteFood: () => void;
  hasLastDeleted: boolean;
  updateSettings: (partial: Partial<UserSettings>) => void;
  getDayFoods: (date: string) => FoodEntry[];
  getDaySummary: (date: string) => DaySummary;
  getDistinctFoods: (limit?: number) => { name: string; calories: number; protein: number }[];
  getStreak: () => number;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [foods, setFoods] = useState<FoodEntry[]>([]);
  const [settings, setSettings] = useState<UserSettings>({
    dailyCalorieTarget: 2000,
    dailyProteinTarget: 120,
  });
  const [hydrated, setHydrated] = useState(false);
  const [lastDeleted, setLastDeleted] = useState<FoodEntry | null>(null);

  // Sync state on mount and subscribe to localStorage events
  useEffect(() => {
    const syncState = () => {
      setFoods(loadFoods());
      setSettings(loadSettings());
    };
    
    syncState();
    setHydrated(true);

    window.addEventListener("storage", syncState);
    return () => window.removeEventListener("storage", syncState);
  }, []);

  const addFood = useCallback(
    (name: string, calories: number, protein: number, date: string, tag: FoodTag) => {
      const entry = storageAddFood(name, calories, protein, date, tag);
      setFoods((prev) => [...prev, entry]);
    },
    [],
  );

  const deleteFood = useCallback((id: string) => {
    const target = loadFoods().find((f) => f.id === id);
    if (target) {
      setLastDeleted(target);
    }
    
    storageDeleteFood(id);
    setFoods((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const updateFood = useCallback(
    (id: string, name: string, calories: number, protein: number, date: string, tag: FoodTag) => {
      const updated = storageUpdateFood(id, name, calories, protein, date, tag);
      if (updated) {
        setFoods((prev) => prev.map((f) => (f.id === id ? updated : f)));
      }
    },
    [],
  );

  const undoDeleteFood = useCallback(() => {
    if (!lastDeleted) return;
    
    const dbFoods = loadFoods();
    dbFoods.push(lastDeleted);
    saveFoods(dbFoods);
    
    setFoods((prev) => [...prev, lastDeleted]);
    setLastDeleted(null);
  }, [lastDeleted]);

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
      
      const rawProtein = entries.reduce((sum, e) => sum + e.protein, 0);
      const totalProtein = Math.round(rawProtein * 10) / 10;

      return {
        date,
        entries,
        totalCalories,
        totalProtein,
        calorieProgress: settings.dailyCalorieTarget > 0
          ? totalCalories / settings.dailyCalorieTarget
          : 0,
        proteinProgress: settings.dailyProteinTarget > 0
          ? totalProtein / settings.dailyProteinTarget
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
    },
    [foods],
  );

  const getStreak = useCallback(() => {
    if (foods.length === 0) return 0;
    const datesWithFood = new Set(foods.map((f) => f.date));
    
    const getLocalDateString = (d: Date) => {
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    };

    const today = new Date();
    const todayStr = getLocalDateString(today);
    
    const yesterday = new Date(Date.now() - 86400000);
    const yesterdayStr = getLocalDateString(yesterday);

    if (!datesWithFood.has(todayStr) && !datesWithFood.has(yesterdayStr)) {
      return 0;
    }

    let streak = 0;
    const current = new Date();
    if (!datesWithFood.has(todayStr) && datesWithFood.has(yesterdayStr)) {
      current.setDate(current.getDate() - 1);
    }

    while (datesWithFood.has(getLocalDateString(current))) {
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
        updateFood,
        undoDeleteFood,
        hasLastDeleted: lastDeleted !== null,
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

"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { FoodEntry, UserSettings, DaySummary, FoodTag, FoodDbItem, FoodDbCategory, QuantityMode, MealTemplate, MealTemplateItem, MealBuilderItem, WaterLog } from "./types";
import { apiClient } from "./apiClient";
import { createClient } from "./supabase/client";
import { setAuthToken, clearAuthToken } from "./authStore";
import { getOrCreateDeviceId } from "./deviceId";

interface AppContextValue {
  foods: FoodEntry[];
  settings: UserSettings;
  customFoods: FoodDbItem[];
  hydrated: boolean;
  addFood: (name: string, calories: number, protein: number, date: string, tag: FoodTag, carbs?: number, fat?: number) => void;
  deleteFood: (id: string) => void;
  updateFood: (id: string, name: string, calories: number, protein: number, date: string, tag: FoodTag, carbs?: number, fat?: number) => void;
  undoDeleteFood: () => void;
  hasLastDeleted: boolean;
  updateSettings: (partial: Partial<UserSettings>) => void;
  addCustomFood: (food: Omit<FoodDbItem, "id" | "isCustom">) => void;
  deleteCustomFood: (id: string) => void;
  mealTemplates: MealTemplate[];
  addMealTemplate: (name: string, tag: FoodTag, items: MealBuilderItem[]) => void;
  deleteMealTemplate: (id: string) => void;
  waterLogs: WaterLog[];
  saveWaterLog: (date: string, amount: number) => void;
  getDayFoods: (date: string) => FoodEntry[];
  getDaySummary: (date: string) => DaySummary;
  getDistinctFoods: (limit?: number) => { name: string; calories: number; protein: number }[];
  getStreak: () => number;
  userName: string | null;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [foods, setFoods] = useState<FoodEntry[]>([]);
  const [customFoods, setCustomFoods] = useState<FoodDbItem[]>([]);
  const [mealTemplates, setMealTemplates] = useState<MealTemplate[]>([]);
  const [waterLogs, setWaterLogs] = useState<WaterLog[]>([]);
  const [settings, setSettings] = useState<UserSettings>({
    dailyCalorieTarget: 2000,
    dailyProteinTarget: 120,
    trackCarbsFat: false,
    dailyWaterTarget: 2500,
  });
  const [hydrated, setHydrated] = useState(false);
  const [lastDeleted, setLastDeleted] = useState<FoodEntry | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [authResolved, setAuthResolved] = useState(false);

  const rehydrate = useCallback(async (triggerClaim = false) => {
    try {
      const deviceId = getOrCreateDeviceId();

      if (triggerClaim && deviceId) {
        try {
          await apiClient.claimAnonymousData(deviceId);
          localStorage.setItem(`calpro:claimed:${deviceId}`, "true");
        } catch (err) {
          console.error("Claim failed:", err);
        }
      }

      const state = await apiClient.fetchState();
      setFoods(state.foods);
      setSettings(state.settings);
      setCustomFoods(state.customFoods);
      setMealTemplates(state.mealTemplates || []);
      setWaterLogs(state.waterLogs || []);
      setHydrated(true);
    } catch (err) {
      console.error("Failed to hydrate state:", err);
      setHydrated(true);
    }
  }, []);

  // Resolve auth session FIRST, then rehydrate — prevents race condition
  // where rehydrate() fires before authToken is set, fetching anonymous data
  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setAuthToken(
          data.session.access_token,
          data.session.user.email,
          data.session.user.user_metadata?.full_name,
          data.session.user.user_metadata?.avatar_url
        );
        setUserName(data.session.user.user_metadata?.full_name || data.session.user.email || null);
      }
      setAuthResolved(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.access_token) {
        setAuthToken(
          session.access_token,
          session.user.email,
          session.user.user_metadata?.full_name,
          session.user.user_metadata?.avatar_url
        );
        setUserName(session.user.user_metadata?.full_name || session.user.email || null);
        await rehydrate(true);
      } else if (event === "SIGNED_OUT") {
        clearAuthToken();
        setUserName(null);
        // Reset all state to empty on sign out
        setFoods([]);
        setCustomFoods([]);
        setMealTemplates([]);
        setWaterLogs([]);
        setSettings({
          dailyCalorieTarget: 2000,
          dailyProteinTarget: 120,
          trackCarbsFat: false,
          dailyWaterTarget: 2500,
        });
        await rehydrate(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [rehydrate]);

  // Only rehydrate AFTER auth session is resolved — never before
  useEffect(() => {
    if (authResolved) {
      rehydrate();
    }
  }, [authResolved, rehydrate]);

  const addFood = useCallback(
    (name: string, calories: number, protein: number, date: string, tag: FoodTag, carbs?: number, fat?: number) => {
      const tempId = "temp-" + Math.random().toString(36).substring(2) + Date.now().toString(36);
      const entry: FoodEntry = {
        id: tempId,
        name: name.trim() || "Logged Item",
        calories: Math.max(0, Math.round(calories)),
        protein: Math.max(0, Math.round(protein * 10) / 10),
        carbs: carbs !== undefined ? Math.max(0, Math.round(carbs * 10) / 10) : undefined,
        fat: fat !== undefined ? Math.max(0, Math.round(fat * 10) / 10) : undefined,
        date,
        createdAt: Date.now(),
        tag,
      };

      setFoods((prev) => [...prev, entry]);

      apiClient.addFoodLog(entry)
        .then((realEntry) => {
          setFoods((prev) => prev.map((f) => (f.id === tempId ? realEntry : f)));
        })
        .catch((err) => {
          console.error("Failed to sync added food:", err);
          setFoods((prev) => prev.filter((f) => f.id !== tempId));
          alert("Failed to log food on the server. Please check your connection.");
        });
    },
    [],
  );

  const deleteFood = useCallback((id: string) => {
    const target = foods.find((f) => f.id === id);
    if (!target) return;

    setLastDeleted(target);
    setFoods((prev) => prev.filter((f) => f.id !== id));

    apiClient.deleteFoodLog(id)
      .catch((err) => {
        console.error("Failed to sync deleted food:", err);
        setFoods((prev) => [...prev, target]);
        setLastDeleted(null);
        alert("Failed to delete food on the server. Please check your connection.");
      });
  }, [foods]);

  const updateFood = useCallback(
    (id: string, name: string, calories: number, protein: number, date: string, tag: FoodTag, carbs?: number, fat?: number) => {
      const original = foods.find((f) => f.id === id);
      if (!original) return;

      const updatedEntry: FoodEntry = {
        ...original,
        name: name.trim() || "Logged Item",
        calories: Math.max(0, Math.round(calories)),
        protein: Math.max(0, Math.round(protein * 10) / 10),
        carbs: carbs !== undefined ? Math.max(0, Math.round(carbs * 10) / 10) : original.carbs,
        fat: fat !== undefined ? Math.max(0, Math.round(fat * 10) / 10) : original.fat,
        date,
        tag,
      };

      setFoods((prev) => prev.map((f) => (f.id === id ? updatedEntry : f)));

      apiClient.updateFoodLog(id, updatedEntry)
        .then((realEntry) => {
          setFoods((prev) => prev.map((f) => (f.id === id ? realEntry : f)));
        })
        .catch((err) => {
          console.error("Failed to sync updated food:", err);
          setFoods((prev) => prev.map((f) => (f.id === id ? original : f)));
          alert("Failed to update food on the server. Please check your connection.");
        });
    },
    [foods],
  );

  const undoDeleteFood = useCallback(() => {
    if (!lastDeleted) return;

    const entryToRestore = { ...lastDeleted };
    setFoods((prev) => [...prev, entryToRestore]);
    setLastDeleted(null);

    apiClient.addFoodLog(entryToRestore)
      .then((realEntry) => {
        setFoods((prev) => prev.map((f) => (f.id === entryToRestore.id ? realEntry : f)));
      })
      .catch((err) => {
        console.error("Failed to sync restored food:", err);
        setFoods((prev) => prev.filter((f) => f.id !== entryToRestore.id));
        setLastDeleted(entryToRestore);
        alert("Failed to restore food on the server. Please check your connection.");
      });
  }, [lastDeleted]);

  const updateSettings = useCallback((partial: Partial<UserSettings>) => {
    setSettings((prev) => {
      const backup = { ...prev };
      const next = { ...prev, ...partial };

      apiClient.updateSettings(partial)
        .catch((err) => {
          console.error("Failed to sync settings:", err);
          setSettings(backup);
          alert("Failed to save settings on the server. Please check your connection.");
        });

      return next;
    });
  }, []);

  const addCustomFood = useCallback((food: Omit<FoodDbItem, "id" | "isCustom">) => {
    const tempId = "temp-custom-" + Math.random().toString(36).substring(2);
    const optimisticItem: FoodDbItem = {
      ...food,
      id: tempId,
      isCustom: true,
    };

    setCustomFoods((prev) => [...prev, optimisticItem]);

    apiClient.addCustomFood(food)
      .then((realItem) => {
        setCustomFoods((prev) => prev.map((item) => (item.id === tempId ? realItem : item)));
      })
      .catch((err) => {
        console.error("Failed to sync custom food:", err);
        setCustomFoods((prev) => prev.filter((item) => item.id !== tempId));
        alert("Failed to save custom food on the server. Please check your connection.");
      });
  }, []);

  const deleteCustomFood = useCallback((id: string) => {
    const backup = customFoods.find((item) => item.id === id);
    if (!backup) return;

    setCustomFoods((prev) => prev.filter((item) => item.id !== id));

    apiClient.deleteCustomFood(id)
      .catch((err) => {
        console.error("Failed to delete custom food:", err);
        setCustomFoods((prev) => [...prev, backup]);
        alert("Failed to delete custom food on the server. Please check your connection.");
      });
  }, [customFoods]);

  const addMealTemplate = useCallback((name: string, tag: FoodTag, items: MealBuilderItem[]) => {
    const tempId = "temp-template-" + Math.random().toString(36).substring(2);
    
    const templateItemsPayload = items.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      quantityMode: item.quantityMode,
      displayQty: item.displayQty,
      calories: item.calories,
      protein: item.protein,
      carbs: item.carbs,
      fat: item.fat,
      emoji: item.emoji,
    }));

    const optimisticTemplate: MealTemplate = {
      id: tempId,
      userId: "default-user",
      name: name.trim() || "Saved Meal",
      tag,
      createdAt: Date.now(),
      items: items.map((item, idx) => ({
        id: `temp-item-${idx}-${tempId}`,
        templateId: tempId,
        name: item.name,
        quantity: item.quantity,
        quantityMode: item.quantityMode,
        displayQty: item.displayQty,
        calories: item.calories,
        protein: item.protein,
        carbs: item.carbs,
        fat: item.fat,
        emoji: item.emoji,
      })),
    };

    setMealTemplates((prev) => [optimisticTemplate, ...prev]);

    apiClient.addMealTemplate({
      name: name.trim() || "Saved Meal",
      tag,
      items: templateItemsPayload,
    })
      .then((realTemplate) => {
        setMealTemplates((prev) => prev.map((t) => (t.id === tempId ? realTemplate : t)));
      })
      .catch((err) => {
        console.error("Failed to save meal template:", err);
        setMealTemplates((prev) => prev.filter((t) => t.id !== tempId));
        alert("Failed to save meal template on the server. Please check your connection.");
      });
  }, []);

  const deleteMealTemplate = useCallback((id: string) => {
    const backup = mealTemplates.find((t) => t.id === id);
    if (!backup) return;

    setMealTemplates((prev) => prev.filter((t) => t.id !== id));

    apiClient.deleteMealTemplate(id)
      .catch((err) => {
        console.error("Failed to delete meal template:", err);
        setMealTemplates((prev) => [backup, ...prev]);
        alert("Failed to delete meal template on the server. Please check your connection.");
      });
  }, [mealTemplates]);

  const saveWaterLog = useCallback((date: string, amount: number) => {
    const existing = waterLogs.find((w) => w.date === date);
    const tempId = existing ? existing.id : "temp-water-" + Math.random().toString(36).substring(2);
    const updatedLog: WaterLog = {
      id: tempId,
      date,
      amount: Math.max(0, amount),
    };
    setWaterLogs((prev) => {
      const filtered = prev.filter((w) => w.date !== date);
      return [...filtered, updatedLog];
    });
    apiClient.saveWaterLog(date, amount)
      .then((realLog) => {
        setWaterLogs((prev) => prev.map((w) => (w.id === tempId ? realLog : w)));
      })
      .catch((err) => {
        console.error("Failed to sync water log:", err);
        setWaterLogs((prev) => {
          const filtered = prev.filter((w) => w.id !== tempId);
          if (existing) {
            return [...filtered, existing];
          }
          return filtered;
        });
        alert("Failed to save water log on the server. Please check your connection.");
      });
  }, [waterLogs]);

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
      const totalCarbs = Math.round(entries.reduce((sum, e) => sum + (e.carbs ?? 0), 0) * 10) / 10;
      const totalFat = Math.round(entries.reduce((sum, e) => sum + (e.fat ?? 0), 0) * 10) / 10;

      return {
        date,
        entries,
        totalCalories,
        totalProtein,
        totalCarbs,
        totalFat,
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
        customFoods,
        hydrated,
        addFood,
        deleteFood,
        updateFood,
        undoDeleteFood,
        hasLastDeleted: lastDeleted !== null,
        updateSettings,
        addCustomFood,
        deleteCustomFood,
        mealTemplates,
        addMealTemplate,
        deleteMealTemplate,
        waterLogs,
        saveWaterLog,
        getDayFoods,
        getDaySummary,
        getDistinctFoods,
        getStreak,
        userName,
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

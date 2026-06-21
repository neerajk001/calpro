import type { FoodEntry, UserSettings, FoodDbItem, MealTemplate, MealTemplateItem, WaterLog, ScanResultItem } from "./types";
import { getAuthHeaders, clearAuthToken } from "./authStore";

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || "http://localhost:5000";

const inFlight = new Map<string, Promise<unknown>>();

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const key = `${options?.method || "GET"}:${path}`;
  const existing = inFlight.get(key);
  if (existing) return existing as Promise<T>;

  const authHeaders = await getAuthHeaders();
  const url = `${BACKEND_URL}${path}`;
  // Verbose logging removed for production

  const promise = fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders,
      ...(options?.headers || {}),
    },
  }).then(async (response) => {
    if (response.status === 401) {
      clearAuthToken();
    }
    if (!response.ok) {
      let errorMsg = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        if (errorData?.error) errorMsg = errorData.error;
      } catch {}
      throw new Error(errorMsg);
    }
    return response.json();
  }).finally(() => {
    inFlight.delete(key);
  });

  inFlight.set(key, promise);
  return promise as Promise<T>;
}

export interface HydratedState {
  foods: FoodEntry[];
  settings: UserSettings;
  customFoods: FoodDbItem[];
  mealTemplates: MealTemplate[];
  waterLogs: WaterLog[];
}

export const apiClient = {
  fetchState: (): Promise<HydratedState> => request<HydratedState>("/api/state"),

  fetchFoodLogs: (): Promise<FoodEntry[]> => request<FoodEntry[]>("/api/foods"),

  addFoodLog: (entry: {
    name: string; calories: number; protein: number; date: string; tag: string;
    carbs?: number; fat?: number; createdAt?: number; consumedWeightG?: number;
  }): Promise<FoodEntry> =>
    request<FoodEntry>("/api/foods", { method: "POST", body: JSON.stringify(entry) }),

  updateFoodLog: (id: string, entry: {
    name?: string; calories?: number; protein?: number; date?: string;
    tag?: string; carbs?: number; fat?: number;
  }): Promise<FoodEntry> =>
    request<FoodEntry>(`/api/foods/${id}`, { method: "PATCH", body: JSON.stringify(entry) }),

  deleteFoodLog: (id: string): Promise<{ success: boolean }> =>
    request<{ success: boolean }>(`/api/foods/${id}`, { method: "DELETE" }),

  fetchSettings: (): Promise<UserSettings> => request<UserSettings>("/api/settings"),

  updateSettings: (settings: Partial<UserSettings>): Promise<UserSettings> =>
    request<UserSettings>("/api/settings", { method: "PATCH", body: JSON.stringify(settings) }),

  fetchCustomFoods: (): Promise<FoodDbItem[]> => request<FoodDbItem[]>("/api/custom-foods"),

  addCustomFood: (food: Omit<FoodDbItem, "id" | "isCustom">): Promise<FoodDbItem> =>
    request<FoodDbItem>("/api/custom-foods", { method: "POST", body: JSON.stringify(food) }),

  deleteCustomFood: (id: string): Promise<{ success: boolean }> =>
    request<{ success: boolean }>(`/api/custom-foods/${id}`, { method: "DELETE" }),

  searchFoods: (query: string): Promise<FoodDbItem[]> =>
    request<FoodDbItem[]>(`/api/foods/search?q=${encodeURIComponent(query)}`),

  fetchMealTemplates: (): Promise<MealTemplate[]> => request<MealTemplate[]>("/api/meal-templates"),

  addMealTemplate: (template: { name: string; tag: string; items: Omit<MealTemplateItem, "id" | "templateId">[] }): Promise<MealTemplate> =>
    request<MealTemplate>("/api/meal-templates", { method: "POST", body: JSON.stringify(template) }),

  deleteMealTemplate: (id: string): Promise<{ success: boolean }> =>
    request<{ success: boolean }>(`/api/meal-templates/${id}`, { method: "DELETE" }),

  saveWaterLog: (date: string, amount: number): Promise<WaterLog> =>
    request<WaterLog>("/api/water-logs", { method: "POST", body: JSON.stringify({ date, amount }) }),

  claimAnonymousData: (deviceId: string): Promise<{ merged: boolean }> =>
    request<{ merged: boolean }>("/api/auth/claim", { method: "POST", body: JSON.stringify({ deviceId }) }),

  scanFood: (image: string, prompt?: string): Promise<{ items: ScanResultItem[] }> =>
    request<{ items: ScanResultItem[] }>("/api/scan", { method: "POST", body: JSON.stringify({ image, prompt }) }),

  sendScanFeedback: (originalName: string, correctedName: string, originalPortionG: number, correctedPortionG: number): Promise<{ success: boolean }> =>
    request<{ success: boolean }>("/api/scan/correct", {
      method: "POST",
      body: JSON.stringify({ originalName, correctedName, originalPortionG, correctedPortionG }),
    }),

  searchPublicFoods: (query?: string): Promise<FoodDbItem[]> => {
    const q = query ? `?q=${encodeURIComponent(query)}` : "";
    return request<FoodDbItem[]>(`/api/public-foods/search${q}`);
  },

  addPublicFood: (food: {
    name: string;
    category: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    servingSize: number;
    servingUnit: string;
    emoji?: string;
  }): Promise<FoodDbItem> => {
    return request<FoodDbItem>("/api/public-foods", {
      method: "POST",
      body: JSON.stringify(food),
    });
  },

  deletePublicFood: (id: string): Promise<{ success: boolean }> => {
    return request<{ success: boolean }>(`/api/public-foods/${id}`, {
      method: "DELETE",
    });
  },
};

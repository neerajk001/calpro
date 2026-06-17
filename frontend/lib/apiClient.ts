import type { FoodEntry, UserSettings, FoodDbItem, MealTemplate, MealTemplateItem, WaterLog, ScanResponse } from "./types";
import { getAuthHeaders, clearAuthToken } from "./authStore";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const authHeaders = getAuthHeaders();
  const url = `${BACKEND_URL}${path}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders,
      ...(options?.headers || {}),
    },
  });

  if (response.status === 401) {
    clearAuthToken();
  }

  if (!response.ok) {
    let errorMsg = `HTTP error! status: ${response.status}`;
    try {
      const errorData = await response.json();
      if (errorData && errorData.error) {
        errorMsg = errorData.error;
      }
    } catch {
      // ignore JSON parse failure on error response
    }
    throw new Error(errorMsg);
  }

  return response.json() as Promise<T>;
}

export interface HydratedState {
  foods: FoodEntry[];
  settings: UserSettings;
  customFoods: FoodDbItem[];
  mealTemplates: MealTemplate[];
  waterLogs: WaterLog[];
}

export const apiClient = {
  // Hydrate state
  fetchState: (): Promise<HydratedState> => {
    return request<HydratedState>("/api/state");
  },

  // Food Log CRUD
  fetchFoodLogs: (): Promise<FoodEntry[]> => {
    return request<FoodEntry[]>("/api/foods");
  },

  addFoodLog: (entry: {
    name: string;
    calories: number;
    protein: number;
    date: string;
    tag: string;
    carbs?: number;
    fat?: number;
    createdAt?: number; // optional, for optimistic recovery
  }): Promise<FoodEntry> => {
    return request<FoodEntry>("/api/foods", {
      method: "POST",
      body: JSON.stringify(entry),
    });
  },

  updateFoodLog: (
    id: string,
    entry: {
      name?: string;
      calories?: number;
      protein?: number;
      date?: string;
      tag?: string;
      carbs?: number;
      fat?: number;
    }
  ): Promise<FoodEntry> => {
    return request<FoodEntry>(`/api/foods/${id}`, {
      method: "PATCH",
      body: JSON.stringify(entry),
    });
  },

  deleteFoodLog: (id: string): Promise<{ success: boolean }> => {
    return request<{ success: boolean }>(`/api/foods/${id}`, {
      method: "DELETE",
    });
  },

  // Settings CRUD
  fetchSettings: (): Promise<UserSettings> => {
    return request<UserSettings>("/api/settings");
  },

  updateSettings: (settings: Partial<UserSettings>): Promise<UserSettings> => {
    return request<UserSettings>("/api/settings", {
      method: "PATCH",
      body: JSON.stringify(settings),
    });
  },

  // Custom Foods CRUD
  fetchCustomFoods: (): Promise<FoodDbItem[]> => {
    return request<FoodDbItem[]>("/api/custom-foods");
  },

  addCustomFood: (food: Omit<FoodDbItem, "id" | "isCustom">): Promise<FoodDbItem> => {
    return request<FoodDbItem>("/api/custom-foods", {
      method: "POST",
      body: JSON.stringify(food),
    });
  },

  deleteCustomFood: (id: string): Promise<{ success: boolean }> => {
    return request<{ success: boolean }>(`/api/custom-foods/${id}`, {
      method: "DELETE",
    });
  },

  // One-time localStorage migration
  migrateLegacyData: (data: {
    foods: FoodEntry[];
    settings: UserSettings;
    customFoods: FoodDbItem[];
  }): Promise<{ success: boolean; migratedLogsCount: number; migratedCustomFoodsCount: number }> => {
    return request<{ success: boolean; migratedLogsCount: number; migratedCustomFoodsCount: number }>("/api/migrate", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Food Search & Barcode Lookup
  searchFoods: (query: string): Promise<FoodDbItem[]> => {
    return request<FoodDbItem[]>(`/api/foods/search?q=${encodeURIComponent(query)}`);
  },

  lookupBarcode: (code: string): Promise<FoodDbItem> => {
    return request<FoodDbItem>(`/api/foods/barcode/${encodeURIComponent(code)}`);
  },

  // Meal Templates CRUD
  fetchMealTemplates: (): Promise<MealTemplate[]> => {
    return request<MealTemplate[]>("/api/meal-templates");
  },

  addMealTemplate: (template: {
    name: string;
    tag: string;
    items: Omit<MealTemplateItem, "id" | "templateId">[];
  }): Promise<MealTemplate> => {
    return request<MealTemplate>("/api/meal-templates", {
      method: "POST",
      body: JSON.stringify(template),
    });
  },

  deleteMealTemplate: (id: string): Promise<{ success: boolean }> => {
    return request<{ success: boolean }>(`/api/meal-templates/${id}`, {
      method: "DELETE",
    });
  },

  saveWaterLog: (date: string, amount: number): Promise<WaterLog> => {
    return request<WaterLog>("/api/water-logs", {
      method: "POST",
      body: JSON.stringify({ date, amount }),
    });
  },

  claimAnonymousData: (deviceId: string): Promise<{ merged: boolean; reason?: string }> => {
    return request<{ merged: boolean; reason?: string }>("/api/auth/claim", {
      method: "POST",
      body: JSON.stringify({ deviceId }),
    });
  },

  // AI Food Scanning
  scanFoodImage: (base64Image: string): Promise<ScanResponse> => {
    return request<ScanResponse>("/api/scan", {
      method: "POST",
      body: JSON.stringify({ image: base64Image }),
    });
  },
};

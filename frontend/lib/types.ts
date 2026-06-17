export type FoodTag = "breakfast" | "lunch" | "dinner" | "snack" | "junk";

export interface FoodEntry {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs?: number;
  fat?: number;
  date: string; // "YYYY-MM-DD"
  createdAt: number; // Unix timestamp ms
  tag: FoodTag;
}

export interface UserSettings {
  dailyCalorieTarget: number;
  dailyProteinTarget: number;
  trackCarbsFat: boolean; // toggle carbs & fat tracking
  dailyWaterTarget?: number;
}

export interface WaterLog {
  id: string;
  date: string; // "YYYY-MM-DD"
  amount: number; // ml
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
  totalCarbs: number;
  totalFat: number;
  entries: FoodEntry[];
  calorieProgress: number; // 0 to 1+
  proteinProgress: number; // 0 to 1+
}

// ─── Food Database Types ───────────────────────────────────────────────────────

export type FoodDbCategory =
  | "Dal & Legumes"
  | "Rice & Grains"
  | "Bread & Roti"
  | "Eggs & Dairy"
  | "Chicken & Meat"
  | "Fish & Seafood"
  | "Vegetables"
  | "Fruits"
  | "Indian Dishes"
  | "Snacks & Street Food"
  | "Chinese"
  | "Sandwiches"
  | "Junk Food"
  | "Healthy & Fitness"
  | "Beverages"
  | "Sweets & Desserts"
  | "Custom";

export type QuantityMode = "grams" | "piece" | "ml" | "serving";

export interface FoodDbItem {
  id: string;
  name: string;
  category: FoodDbCategory;
  caloriesPer100g: number; // kcal per 100g (or 100ml for liquids)
  proteinPer100g: number;  // grams
  carbsPer100g: number;    // grams
  fatPer100g: number;      // grams
  defaultQty: number;      // default quantity shown in picker
  quantityMode: QuantityMode; // primary input mode
  gramsPerPiece?: number;  // if mode=piece: how many grams is 1 piece
  mlPerServing?: number;   // if mode=ml/serving
  isCustom?: boolean;      // user-added
  emoji?: string;          // optional emoji for display
}

export interface MealBuilderItem {
  dbItemId: string;
  name: string;
  quantity: number;        // in grams (normalized)
  quantityMode: QuantityMode;
  displayQty: number;      // shown to user (pieces or grams)
  calories: number;        // calculated
  protein: number;         // calculated
  carbs: number;           // calculated
  fat: number;             // calculated
  emoji?: string;
}

export interface MealTemplateItem {
  id: string;
  templateId: string;
  name: string;
  quantity: number;
  quantityMode: QuantityMode;
  displayQty: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  emoji?: string;
}

export interface MealTemplate {
  id: string;
  userId: string;
  name: string;
  tag: FoodTag;
  items: MealTemplateItem[];
  createdAt: number; // Unix timestamp ms
}

// ─── AI Food Scanning Types ────────────────────────────────────────────────────

export interface PortionPreset {
  label: string;
  grams: number;
}

export interface ScanResultItem {
  id: string;
  name: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  portionType: string;
  portionPresets: PortionPreset[];
  defaultGrams: number;
  cookingMethod: string;
  servingCount: number;
  estimatedCalories: number;
  estimatedProtein: number;
  estimatedCarbs: number;
  estimatedFat: number;
  confidence: number;
  source: "database" | "ai_estimated";
  emoji?: string;
  alternatives: string[];
}

export interface ScanResponse {
  items: ScanResultItem[];
}

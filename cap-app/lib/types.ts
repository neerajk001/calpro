export type FoodTag = "breakfast" | "lunch" | "dinner" | "snack" | "junk";

export interface FoodEntry {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs?: number;
  fat?: number;
  date: string;
  createdAt: number;
  tag: FoodTag;
  consumedWeightG?: number;
}

export interface UserSettings {
  dailyCalorieTarget: number;
  dailyProteinTarget: number;
  trackCarbsFat: boolean;
  dailyWaterTarget?: number;
}

export interface WaterLog {
  id: string;
  date: string;
  amount: number;
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
  calorieProgress: number;
  proteinProgress: number;
}

export type FoodDbCategory =
  | "Dal & Legumes" | "Rice & Grains" | "Bread & Roti"
  | "Eggs & Dairy" | "Chicken & Meat" | "Fish & Seafood"
  | "Vegetables" | "Fruits" | "Indian Dishes"
  | "Snacks & Street Food" | "Chinese" | "Sandwiches"
  | "Junk Food" | "Healthy & Fitness" | "Beverages"
  | "Sweets & Desserts" | "Custom";

export type QuantityMode = "grams" | "piece" | "ml" | "serving";

export interface FoodDbItem {
  id: string;
  name: string;
  category: FoodDbCategory;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  defaultQty: number;
  quantityMode: QuantityMode;
  gramsPerPiece?: number;
  mlPerServing?: number;
  isCustom?: boolean;
  emoji?: string;
  isOwner?: boolean;
  isPublic?: boolean;
  servingSize?: number;
  servingUnit?: string;
}

export interface MealBuilderItem {
  dbItemId: string;
  name: string;
  quantity: number;
  quantityMode: QuantityMode;
  displayQty: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  emoji?: string;
  cookingMethod?: "normal" | "boiled" | "fried" | "ghee";
  caloriesPer100g?: number;
  proteinPer100g?: number;
  carbsPer100g?: number;
  fatPer100g?: number;
  gramsPerPiece?: number;
  mlPerServing?: number;
  consumedWeightG?: number;
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
  createdAt: number;
}

export interface ScanResultItem {
  id: string;
  name: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  portionType: string;
  portionPresets: { label: string; grams: number }[];
  defaultGrams: number;
  cookingMethod: string;
  servingCount: number;
  estimatedCalories: number;
  estimatedProtein: number;
  estimatedCarbs: number;
  estimatedFat: number;
  confidence: number;
  source: "database" | "ai_estimated";
  sourceRef: string | null;
  emoji?: string;
  alternatives: string[];
}

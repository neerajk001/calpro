import type { FoodDbItem, FoodDbCategory, QuantityMode } from "./types";

const CUSTOM_FOODS_KEY = "calpro:customFoods";

function generateId(): string {
  if (typeof window !== "undefined" && window.crypto?.randomUUID) {
    return "custom-" + window.crypto.randomUUID();
  }
  return "custom-" + Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function loadCustomFoods(): FoodDbItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CUSTOM_FOODS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (f): f is FoodDbItem =>
        f &&
        typeof f.id === "string" &&
        typeof f.name === "string" &&
        typeof f.caloriesPer100g === "number" &&
        typeof f.proteinPer100g === "number"
    );
  } catch {
    return [];
  }
}

export function saveCustomFoods(foods: FoodDbItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CUSTOM_FOODS_KEY, JSON.stringify(foods));
  } catch (err) {
    console.error("Failed to save custom foods", err);
  }
}

export interface CustomFoodInput {
  name: string;
  category: FoodDbCategory;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  quantityMode: QuantityMode;
  defaultQty: number;
  gramsPerPiece?: number;
  emoji?: string;
}

export function addCustomFood(input: CustomFoodInput): FoodDbItem {
  const foods = loadCustomFoods();
  const newFood: FoodDbItem = {
    id: generateId(),
    name: input.name.trim(),
    category: input.category,
    caloriesPer100g: Math.max(0, input.caloriesPer100g),
    proteinPer100g: Math.max(0, input.proteinPer100g),
    carbsPer100g: Math.max(0, input.carbsPer100g),
    fatPer100g: Math.max(0, input.fatPer100g),
    quantityMode: input.quantityMode,
    defaultQty: Math.max(1, input.defaultQty),
    gramsPerPiece: input.gramsPerPiece,
    emoji: input.emoji || "🍽️",
    isCustom: true,
  };
  foods.push(newFood);
  saveCustomFoods(foods);
  return newFood;
}

export function updateCustomFood(id: string, input: Partial<CustomFoodInput>): FoodDbItem | null {
  const foods = loadCustomFoods();
  const idx = foods.findIndex((f) => f.id === id);
  if (idx === -1) return null;
  const updated: FoodDbItem = { ...foods[idx], ...input };
  foods[idx] = updated;
  saveCustomFoods(foods);
  return updated;
}

export function deleteCustomFood(id: string): void {
  const foods = loadCustomFoods();
  saveCustomFoods(foods.filter((f) => f.id !== id));
}

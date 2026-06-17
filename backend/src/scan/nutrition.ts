import { prisma } from "../prisma.js";
import { getFallbackMacros } from "./calculator.js";

export interface NutritionResult {
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  source: "database" | "ai_estimated";
  sourceRef: string | null;
}

export async function lookupNutrition(
  foodId: string | null,
  portionType: string,
): Promise<NutritionResult> {
  if (foodId) {
    const food = await prisma.food.findUnique({
      where: { id: foodId },
      select: {
        caloriesPer100g: true,
        proteinPer100g: true,
        carbsPer100g: true,
        fatPer100g: true,
        source: true,
        sourceRef: true,
      },
    });

    if (food) {
      return {
        caloriesPer100g: Number(food.caloriesPer100g),
        proteinPer100g: Number(food.proteinPer100g),
        carbsPer100g: Number(food.carbsPer100g),
        fatPer100g: Number(food.fatPer100g),
        source: "database",
        sourceRef: food.sourceRef || null,
      };
    }
  }

  // Fallback: category averages from IFCT-backed data
  const fallback = getFallbackMacros(portionType);
  return {
    ...fallback,
    source: "ai_estimated",
    sourceRef: `fallback:${portionType}`,
  };
}

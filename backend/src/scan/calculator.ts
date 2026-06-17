export function applyCookingModifiers(
  macros: { caloriesPer100g: number; proteinPer100g: number; carbsPer100g: number; fatPer100g: number },
  method: string,
) {
  if (method === "fried") {
    return {
      caloriesPer100g: Math.round(macros.caloriesPer100g * 1.25),
      proteinPer100g: macros.proteinPer100g,
      carbsPer100g: Math.round(macros.carbsPer100g * 1.1),
      fatPer100g: Math.round(macros.fatPer100g * 1.8 * 10) / 10,
    };
  }
  if (method === "ghee") {
    return {
      caloriesPer100g: Math.round(macros.caloriesPer100g * 1.15),
      proteinPer100g: macros.proteinPer100g,
      carbsPer100g: macros.carbsPer100g,
      fatPer100g: Math.round((macros.fatPer100g + 5) * 10) / 10,
    };
  }
  if (method === "boiled") {
    return {
      caloriesPer100g: Math.round(macros.caloriesPer100g * 0.9),
      proteinPer100g: macros.proteinPer100g,
      carbsPer100g: Math.round(macros.carbsPer100g * 0.95),
      fatPer100g: Math.round(macros.fatPer100g * 0.7 * 10) / 10,
    };
  }
  return { ...macros };
}

const FALLBACK_MACROS: Record<string, { caloriesPer100g: number; proteinPer100g: number; carbsPer100g: number; fatPer100g: number }> = {
  piece: { caloriesPer100g: 250, proteinPer100g: 8, carbsPer100g: 40, fatPer100g: 8 },
  bowl: { caloriesPer100g: 120, proteinPer100g: 6, carbsPer100g: 15, fatPer100g: 5 },
  plate: { caloriesPer100g: 160, proteinPer100g: 5, carbsPer100g: 30, fatPer100g: 3 },
  glass: { caloriesPer100g: 60, proteinPer100g: 2, carbsPer100g: 10, fatPer100g: 1 },
  grams: { caloriesPer100g: 150, proteinPer100g: 5, carbsPer100g: 20, fatPer100g: 5 },
};

export function getFallbackMacros(portionType: string) {
  return FALLBACK_MACROS[portionType] || FALLBACK_MACROS.grams;
}

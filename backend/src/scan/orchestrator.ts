import { createHash } from "crypto";
import { prisma } from "../prisma.js";
import { classifyFoods } from "./gemini-classifier.js";
import { mapFood, getAlternatives } from "./mapper.js";
import { lookupNutrition } from "./nutrition.js";
import { getPortionPresets } from "./portion.js";
import { applyCookingModifiers } from "./calculator.js";
import { calculateConfidence } from "./confidence.js";

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

const CONFIDENCE_THRESHOLD = 0.7;

function hashImage(base64: string): string {
  return createHash("sha256").update(base64).digest("hex");
}

export class UserFacingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UserFacingError";
  }
}

export async function scanFoodImage(base64Image: string, userPrompt?: string): Promise<ScanResultItem[]> {
  if (!base64Image) throw new UserFacingError("No image data provided");

  // Cache check: same image hash → return cached
  const imgHash = hashImage(base64Image);
  const cached = await prisma.scanCache.findUnique({ where: { imageHash: imgHash } });
  if (cached) {
    await prisma.scanCache.update({
      where: { imageHash: imgHash },
      data: { hitCount: { increment: 1 } },
    });
    return (cached.result as any).items as ScanResultItem[];
  }

  // Step 1: Gemini classification (food names + portion type + cooking method ONLY)
  const classified = await classifyFoods(base64Image, userPrompt);
  if (!Array.isArray(classified) || classified.length === 0) return [];

  const results: ScanResultItem[] = [];

  for (const item of classified) {
    // Step 2: Map AI name → database food
    const mapped = await mapFood(item.name);
    const mappingConfidence = mapped?.confidence ?? 0;
    const foodId = mapped?.id ?? null;

    // Step 3: Look up nutrition (from DB or category fallback)
    const nutrition = await lookupNutrition(foodId, item.portionType);
    const baseMacros = {
      caloriesPer100g: nutrition.caloriesPer100g,
      proteinPer100g: nutrition.proteinPer100g,
      carbsPer100g: nutrition.carbsPer100g,
      fatPer100g: nutrition.fatPer100g,
    };

    // Apply cooking modifiers
    const macros = applyCookingModifiers(baseMacros, item.cookingMethod || "normal");

    // Step 4: Resolve portion presets + effective grams
    const { presets, defaultGrams } = await getPortionPresets(foodId, item.portionType, item.servingCount ?? 1);
    const factor = defaultGrams / 100;

    // Step 5: Multi-factor confidence
    const confidence = calculateConfidence({
      geminiConfidence: item.confidence ?? 0.5,
      mappingConfidence,
      nutritionIsVerified: nutrition.source === "database",
      sourceRef: nutrition.sourceRef,
    });

    // Alternatives
    let alternatives = item.alternatives ?? [];
    if (confidence < CONFIDENCE_THRESHOLD && alternatives.length === 0) {
      try { alternatives = await getAlternatives(item.name); } catch {}
    }

    results.push({
      id: `scan-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      name: mapped?.name ?? item.name,
      caloriesPer100g: macros.caloriesPer100g,
      proteinPer100g: macros.proteinPer100g,
      carbsPer100g: macros.carbsPer100g,
      fatPer100g: macros.fatPer100g,
      portionType: item.portionType || "grams",
      portionPresets: presets,
      defaultGrams,
      cookingMethod: item.cookingMethod || "normal",
      servingCount: item.servingCount ?? 1,
      estimatedCalories: Math.round(macros.caloriesPer100g * factor),
      estimatedProtein: Math.round(macros.proteinPer100g * factor * 10) / 10,
      estimatedCarbs: Math.round(macros.carbsPer100g * factor * 10) / 10,
      estimatedFat: Math.round(macros.fatPer100g * factor * 10) / 10,
      confidence,
      source: nutrition.source,
      sourceRef: nutrition.sourceRef,
      emoji: mapped?.emoji ?? undefined,
      alternatives,
    });
  }

  // Cache the result
  await prisma.scanCache.create({
    data: {
      imageHash: imgHash,
      result: { items: results } as any,
    },
  }).catch(() => {});

  return results;
}

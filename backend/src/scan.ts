import { prisma } from "./prisma.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

interface VisionFoodItem {
  name: string;
  estimatedPortionG: number;
}

interface MacroEstimate {
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
}

interface ScanResultItem {
  name: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  estimatedPortionG: number;
  estimatedCalories: number;
  estimatedProtein: number;
  estimatedCarbs: number;
  estimatedFat: number;
  source: "database" | "ai_estimated";
  emoji?: string;
}

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not configured");
  return new GoogleGenerativeAI(apiKey);
}

async function identifyFoodsFromImage(base64Image: string): Promise<VisionFoodItem[]> {
  const genAI = getGeminiClient();
  const modelName = process.env.GEMINI_MODEL || "gemini-2.0-flash";
  const model = genAI.getGenerativeModel({
    model: modelName,
    generationConfig: { responseMimeType: "application/json" },
  });

  const prompt = `Analyze this food photo and identify all visible food items. For each item, estimate the portion size in grams.
Return ONLY a JSON array of objects with "name" (string) and "estimatedPortionG" (number).
If you cannot identify any food items, return an empty array [].
Be specific with food names (e.g., "Chicken Biryani" not just "rice").`;

  const result = await model.generateContent([
    prompt,
    { inlineData: { mimeType: "image/jpeg", data: base64Image } },
  ]);

  const text = result.response.text();
  const cleaned = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
  return JSON.parse(cleaned) as VisionFoodItem[];
}

async function fuzzySearchFood(name: string): Promise<{
  id: string;
  name: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  emoji: string | null;
} | null> {
  const rows = await prisma.$queryRawUnsafe<
    Array<{
      id: string;
      name: string;
      caloriesPer100g: number;
      proteinPer100g: number;
      carbsPer100g: number;
      fatPer100g: number;
      emoji: string | null;
    }>
  >(
    `SELECT id, name, "caloriesPer100g", "proteinPer100g", "carbsPer100g", "fatPer100g", emoji
     FROM "Food"
     WHERE similarity(name, $1) > 0.4
     ORDER BY similarity(name, $1) DESC
     LIMIT 1`,
    name,
  );

  if (rows.length === 0) return null;
  return {
    id: rows[0].id,
    name: rows[0].name,
    caloriesPer100g: Number(rows[0].caloriesPer100g),
    proteinPer100g: Number(rows[0].proteinPer100g),
    carbsPer100g: Number(rows[0].carbsPer100g),
    fatPer100g: Number(rows[0].fatPer100g),
    emoji: rows[0].emoji,
  };
}

async function estimateMacrosFromGemini(foodName: string): Promise<MacroEstimate> {
  const genAI = getGeminiClient();
  const modelName = process.env.GEMINI_MODEL || "gemini-2.0-flash";
  const model = genAI.getGenerativeModel({
    model: modelName,
    generationConfig: { responseMimeType: "application/json" },
  });

  const prompt = `Estimate the nutritional content per 100g for "${foodName}".
Return ONLY a JSON object with these keys (all numbers):
- caloriesPer100g (kcal)
- proteinPer100g (grams)
- carbsPer100g (grams)
- fatPer100g (grams)
Be realistic and conservative in your estimates.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const cleaned = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
  return JSON.parse(cleaned) as MacroEstimate;
}

async function cacheAiFood(
  name: string,
  macros: MacroEstimate,
): Promise<{ id: string; emoji: string | null }> {
  const existing = await prisma.food.findFirst({
    where: { name: { equals: name, mode: "insensitive" } },
    select: { id: true, emoji: true },
  });

  if (existing) return existing;

  const created = await prisma.food.create({
    data: {
      name,
      category: "AI Generated",
      caloriesPer100g: macros.caloriesPer100g,
      proteinPer100g: macros.proteinPer100g,
      carbsPer100g: macros.carbsPer100g,
      fatPer100g: macros.fatPer100g,
      defaultQty: 100,
      quantityMode: "grams",
      emoji: "🤖",
    },
    select: { id: true, emoji: true },
  });

  return created;
}

export async function scanFoodImage(base64Image: string): Promise<ScanResultItem[]> {
  if (!base64Image) throw new Error("No image data provided");

  const foods = await identifyFoodsFromImage(base64Image);
  if (!Array.isArray(foods) || foods.length === 0) return [];

  const results: ScanResultItem[] = [];

  for (const item of foods) {
    const dbMatch = await fuzzySearchFood(item.name);

    let macros: MacroEstimate;
    let source: "database" | "ai_estimated";
    let emoji: string | undefined;

    if (dbMatch) {
      macros = {
        caloriesPer100g: dbMatch.caloriesPer100g,
        proteinPer100g: dbMatch.proteinPer100g,
        carbsPer100g: dbMatch.carbsPer100g,
        fatPer100g: dbMatch.fatPer100g,
      };
      source = "database";
      emoji = dbMatch.emoji ?? undefined;
    } else {
      macros = await estimateMacrosFromGemini(item.name);
      const cached = await cacheAiFood(item.name, macros);
      source = "ai_estimated";
      emoji = cached.emoji ?? undefined;
    }

    const portion = item.estimatedPortionG || 100;
    const factor = portion / 100;

    results.push({
      name: item.name,
      caloriesPer100g: macros.caloriesPer100g,
      proteinPer100g: macros.proteinPer100g,
      carbsPer100g: macros.carbsPer100g,
      fatPer100g: macros.fatPer100g,
      estimatedPortionG: portion,
      estimatedCalories: Math.round(macros.caloriesPer100g * factor),
      estimatedProtein: Math.round(macros.proteinPer100g * factor * 10) / 10,
      estimatedCarbs: Math.round(macros.carbsPer100g * factor * 10) / 10,
      estimatedFat: Math.round(macros.fatPer100g * factor * 10) / 10,
      source,
      emoji,
    });
  }

  return results;
}

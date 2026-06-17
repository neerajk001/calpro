import { prisma } from "./prisma.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

interface VisionFoodItem {
  name: string;
  estimatedPortionG: number;
  confidence: number;
  alternatives: string[];
}

interface MacroEstimate {
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
}

interface PortionLabel {
  unit: string;
  value: number;
  label: string;
}

export interface ScanResultItem {
  id: string;
  name: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  estimatedPortionG: number;
  portionLabel: string;
  portionUnit: string;
  portionValue: number;
  estimatedCalories: number;
  estimatedProtein: number;
  estimatedCarbs: number;
  estimatedFat: number;
  confidence: number;
  source: "database" | "ai_estimated";
  emoji?: string;
  alternatives: string[];
}

const CONFIDENCE_THRESHOLD = 0.7;

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not configured");
  return new GoogleGenerativeAI(apiKey);
}

function mapGramsToIndianUnit(grams: number): PortionLabel {
  if (grams <= 0) return { unit: "grams", value: grams, label: `${grams}g` };
  if (grams < 60) return { unit: "small bowl", value: 1, label: `1 small bowl (${grams}g)` };
  if (grams <= 200) return { unit: "katori", value: 1, label: `1 katori (${grams}g)` };
  if (grams <= 350) return { unit: "plate", value: 1, label: `1 plate (${grams}g)` };
  if (grams <= 600) return { unit: "full plate", value: 1, label: `1 full plate (${grams}g)` };
  const plates = Math.round(grams / 300);
  return { unit: "plates", value: plates, label: `${plates} plates (${grams}g)` };
}

async function identifyFoodsFromImage(base64Image: string): Promise<VisionFoodItem[]> {
  const genAI = getGeminiClient();
  const modelName = process.env.GEMINI_MODEL || "gemini-2.0-flash";
  const model = genAI.getGenerativeModel({
    model: modelName,
    generationConfig: { responseMimeType: "application/json" },
  });

  const prompt = `Analyze this food photo and identify all visible food items with Indian cuisine knowledge where applicable.

For each item, return this exact JSON shape:
{
  "name": "string (specific name, e.g. 'Dal Tadka' not just 'dal')",
  "estimatedPortionG": number (grams),
  "confidence": number (0.0 to 1.0, how sure you are about this identification),
  "alternatives": string[] (2-3 alternative food names if confidence < 0.8, otherwise empty array)
}

Return ONLY a JSON array of these objects. If you cannot identify any food items, return [].
Do not wrap the JSON in markdown code fences.`;

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
  similarity: number;
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
      sim: number;
    }>
  >(
    `SELECT id, name, "caloriesPer100g", "proteinPer100g", "carbsPer100g", "fatPer100g", emoji,
            similarity(name, $1) AS sim
     FROM "Food"
     WHERE similarity(name, $1) > 0.4
     ORDER BY sim DESC
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
    similarity: Number(rows[0].sim),
  };
}

async function getFuzzyAlternatives(name: string): Promise<string[]> {
  const rows = await prisma.$queryRawUnsafe<
    Array<{ name: string }>
  >(
    `SELECT name FROM "Food"
     WHERE similarity(name, $1) > 0.25
     ORDER BY similarity(name, $1) DESC
     LIMIT 3`,
    name,
  );
  return rows.map((r) => r.name);
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
Be realistic and conservative in your estimates. Do not wrap in markdown.`;

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
    let confidence = item.confidence ?? 0.5;
    let alternatives = item.alternatives ?? [];

    if (dbMatch) {
      macros = {
        caloriesPer100g: dbMatch.caloriesPer100g,
        proteinPer100g: dbMatch.proteinPer100g,
        carbsPer100g: dbMatch.carbsPer100g,
        fatPer100g: dbMatch.fatPer100g,
      };
      source = "database";
      emoji = dbMatch.emoji ?? undefined;
      confidence = Math.max(confidence, dbMatch.similarity);
    } else {
      macros = await estimateMacrosFromGemini(item.name);
      const cached = await cacheAiFood(item.name, macros);
      source = "ai_estimated";
      emoji = cached.emoji ?? undefined;
    }

    if (confidence < CONFIDENCE_THRESHOLD && alternatives.length === 0) {
      try {
        const fuzzyAlts = await getFuzzyAlternatives(item.name);
        if (fuzzyAlts.length > 0) alternatives = fuzzyAlts;
      } catch {}
    }

    const portion = item.estimatedPortionG || 100;
    const factor = portion / 100;
    const portionLabel = mapGramsToIndianUnit(portion);

    results.push({
      id: `scan-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      name: item.name,
      caloriesPer100g: macros.caloriesPer100g,
      proteinPer100g: macros.proteinPer100g,
      carbsPer100g: macros.carbsPer100g,
      fatPer100g: macros.fatPer100g,
      estimatedPortionG: portion,
      portionLabel: portionLabel.label,
      portionUnit: portionLabel.unit,
      portionValue: portionLabel.value,
      estimatedCalories: Math.round(macros.caloriesPer100g * factor),
      estimatedProtein: Math.round(macros.proteinPer100g * factor * 10) / 10,
      estimatedCarbs: Math.round(macros.carbsPer100g * factor * 10) / 10,
      estimatedFat: Math.round(macros.fatPer100g * factor * 10) / 10,
      confidence,
      source,
      emoji,
      alternatives,
    });
  }

  return results;
}

export async function recordCorrection(
  originalName: string,
  correctedName: string,
  originalPortionG: number,
  correctedPortionG: number,
) {
  if (correctedName !== originalName) {
    await prisma.food.updateMany({
      where: { name: { equals: originalName, mode: "insensitive" }, category: "AI Generated" },
      data: { name: correctedName },
    });
  }

  console.log(`[scan] Correction recorded: "${originalName}" → "${correctedName}", portion ${originalPortionG}g → ${correctedPortionG}g`);
}

import { prisma } from "./prisma.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

interface VisionFoodItem {
  name: string;
  portionType: string;
  cookingMethod: string;
  servingCount: number;
  confidence: number;
  alternatives: string[];
}

interface MacroEstimate {
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
}

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

function applyCookingModifiers(macros: MacroEstimate, method: string): MacroEstimate {
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
  return macros;
}

const CONFIDENCE_THRESHOLD = 0.7;

function buildPortionPresets(foodName: string, portionType: string): { presets: PortionPreset[]; defaultGrams: number } {
  const lower = foodName.toLowerCase();
  const t = portionType || "";

  if (t === "piece" || lower.includes("roti") || lower.includes("chapati") || lower.includes("naan") ||
      lower.includes("paratha") || lower.includes("bread") || lower.includes("egg") ||
      lower.includes("idli") || lower.includes("dosa") || lower.includes("samosa") ||
      lower.includes("pakora") || lower.includes("vada") || lower.includes("paneer") && lower.includes("tikka")) {
    return {
      presets: [
        { label: "1 piece (60g)", grams: 60 },
        { label: "2 pieces (120g)", grams: 120 },
        { label: "3 pieces (180g)", grams: 180 },
        { label: "4 pieces (240g)", grams: 240 },
      ],
      defaultGrams: 60,
    };
  }

  if (t === "bowl" || lower.includes("dal") || lower.includes("curry") || lower.includes("sabzi") ||
      lower.includes("paneer") || lower.includes("chicken") && lower.includes("curry") ||
      lower.includes("raita") || lower.includes("chutney") || lower.includes("soup") ||
      lower.includes("sambhar") || lower.includes("rasam")) {
    return {
      presets: [
        { label: "½ katori (75g)", grams: 75 },
        { label: "1 katori (150g)", grams: 150 },
        { label: "1.5 katori (225g)", grams: 225 },
        { label: "2 katori (300g)", grams: 300 },
      ],
      defaultGrams: 150,
    };
  }

  if (t === "glass" || lower.includes("lassi") || lower.includes("milk") || lower.includes("juice") ||
      lower.includes("shake") || lower.includes("drink") || lower.includes("tea") ||
      lower.includes("coffee") || lower.includes("buttermilk") || lower.includes("chaas")) {
    return {
      presets: [
        { label: "½ glass (125ml)", grams: 125 },
        { label: "1 glass (250ml)", grams: 250 },
        { label: "2 glasses (500ml)", grams: 500 },
      ],
      defaultGrams: 250,
    };
  }

  if (t === "plate" || lower.includes("rice") || lower.includes("biryani") || lower.includes("pulao") ||
      lower.includes("khichdi") || lower.includes("pasta") || lower.includes("noodles") ||
      lower.includes("fried rice")) {
    return {
      presets: [
        { label: "½ plate (150g)", grams: 150 },
        { label: "1 plate (300g)", grams: 300 },
        { label: "1.5 plate (450g)", grams: 450 },
        { label: "2 plates (600g)", grams: 600 },
      ],
      defaultGrams: 300,
    };
  }

  return {
    presets: [
      { label: "Small (100g)", grams: 100 },
      { label: "Medium (200g)", grams: 200 },
      { label: "Large (350g)", grams: 350 },
    ],
    defaultGrams: 200,
  };
}

class UserFacingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UserFacingError";
  }
}

function shouldRetry(error: unknown): boolean {
  const message = String(error);
  return message.includes("503") || message.includes("Service Unavailable") ||
         message.includes("429") || message.includes("Too Many Requests") ||
         message.includes("overloaded") || message.includes("unavailable");
}

async function withRetry<T>(fn: () => Promise<T>, label: string): Promise<T> {
  const delays = [500, 1500, 3000];
  let lastError: unknown;

  for (let attempt = 0; attempt <= delays.length; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt < delays.length && shouldRetry(error)) {
        console.warn(`[scan] ${label} attempt ${attempt + 1} failed (${String(error).slice(0, 120)}), retrying in ${delays[attempt]}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delays[attempt]));
        continue;
      }
      break;
    }
  }

  console.error(`[scan] ${label} failed after all retries:`, lastError);
  throw new UserFacingError("The AI service is temporarily unavailable. Please try again in a moment.");
}

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not configured");
  return new GoogleGenerativeAI(apiKey);
}

async function identifyFoodsFromImage(base64Image: string, userPrompt?: string): Promise<VisionFoodItem[]> {
  const genAI = getGeminiClient();
  const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const model = genAI.getGenerativeModel({
    model: modelName,
    generationConfig: { responseMimeType: "application/json" },
  });

  const extraContext = userPrompt?.trim()
    ? `\n\nCRITICAL USER INPUT (trust this over visual guesses for serving count, cooking method, and identification): "${userPrompt.trim()}"`
    : "";

  const prompt = `Analyze this food photo and identify all visible food items with Indian cuisine knowledge.${extraContext}

IMPORTANT: If the user specified a quantity or serving count in their input above, use THAT exact number as servingCount — do not override it with what you visually see. For example, if the user says "1.5 eggs" but you see 3 objects, use 1.5.

For each item, return this exact JSON shape:
{
  "name": "string (specific, e.g. 'Tandoori Roti' not just 'roti', 'Dal Tadka' not just 'dal')",
  "portionType": "piece" | "bowl" | "plate" | "glass" | "grams",
  "cookingMethod": "normal" | "fried" | "ghee" | "boiled",
  "servingCount": number (how many servings: 1, 1.5, 2, 3 etc — CAN BE FRACTIONAL if user specified half servings),
  "confidence": number (0.0 to 1.0),
  "alternatives": string[] (2-3 alternatives if unsure, otherwise [])
}

portionType rules:
- "piece" for roti, naan, paratha, eggs, idli, dosa, samosa, pakora, kebabs, tikka
- "bowl" for dals, curries, sabzis, raita, soups, sambhar, chutneys
- "plate" for rice, biryani, pulao, khichdi, pasta, noodles
- "glass" for drinks, lassi, milk, shakes, juice, tea, coffee
- "grams" for anything else

cookingMethod rules:
- "fried" if food looks deep/shallow fried (samosa, pakora, puri, fried rice)
- "ghee" if visible ghee/butter topping (roti with ghee shine, dal tadka with tadka)
- "boiled" if steamed/boiled (idli, boiled eggs, steamed rice)
- "normal" otherwise

servingCount: count how many distinct pieces/servings you see. For bowls/plates, 1 unless multiple bowls are visible.

Return ONLY a JSON array. If no food detected, return []. No markdown wrapping.`;

  const result = await withRetry(
    () =>
      model.generateContent([
        prompt,
        { inlineData: { mimeType: "image/jpeg", data: base64Image } },
      ]),
    "identifyFoodsFromImage",
  );

  const text = result.response.text();
  const cleaned = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
  const parsed = JSON.parse(cleaned);
  if (!Array.isArray(parsed)) {
    console.error("[scan] identifyFoodsFromImage returned non-array:", cleaned);
    throw new UserFacingError("The AI service returned an unexpected response. Please try again.");
  }
  return parsed as VisionFoodItem[];
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
  const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const model = genAI.getGenerativeModel({
    model: modelName,
    generationConfig: { responseMimeType: "application/json" },
  });

  const prompt = `Estimate nutritional content per 100g for "${foodName}".
Return ONLY JSON: { "caloriesPer100g": number, "proteinPer100g": number, "carbsPer100g": number, "fatPer100g": number }
Be conservative and realistic. No markdown wrapping.`;

  const result = await withRetry(
    () => model.generateContent(prompt),
    "estimateMacrosFromGemini",
  );

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

export async function scanFoodImage(base64Image: string, userPrompt?: string): Promise<ScanResultItem[]> {
  if (!base64Image) throw new UserFacingError("No image data provided");

  const foods = await identifyFoodsFromImage(base64Image, userPrompt);
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
      try {
        macros = await estimateMacrosFromGemini(item.name);
        const cached = await cacheAiFood(item.name, macros);
        source = "ai_estimated";
        emoji = cached.emoji ?? undefined;
      } catch (err) {
        console.error(`[scan] Macro estimation failed for "${item.name}":`, err);
        macros = { caloriesPer100g: 150, proteinPer100g: 5, carbsPer100g: 20, fatPer100g: 5 };
        source = "ai_estimated";
        emoji = "🤖";
        confidence = 0.3;
      }
      macros = applyCookingModifiers(macros, item.cookingMethod || "normal");
    }

    if (confidence < CONFIDENCE_THRESHOLD && alternatives.length === 0) {
      try {
        const fuzzyAlts = await getFuzzyAlternatives(item.name);
        if (fuzzyAlts.length > 0) alternatives = fuzzyAlts;
      } catch {}
    }

    const { presets, defaultGrams } = buildPortionPresets(item.name, item.portionType);
    const sc = item.servingCount ?? 1;
    const perUnitGrams = presets[0]?.grams ?? defaultGrams;
    const effectiveGrams = Math.round(Math.max(0.5, sc) * perUnitGrams);
    const factor = effectiveGrams / 100;

    results.push({
      id: `scan-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      name: item.name,
      caloriesPer100g: macros.caloriesPer100g,
      proteinPer100g: macros.proteinPer100g,
      carbsPer100g: macros.carbsPer100g,
      fatPer100g: macros.fatPer100g,
      portionType: item.portionType || "grams",
      portionPresets: presets,
      defaultGrams: effectiveGrams,
      cookingMethod: item.cookingMethod || "normal",
      servingCount: sc,
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

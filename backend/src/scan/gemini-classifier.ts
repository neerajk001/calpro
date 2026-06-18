import { GoogleGenerativeAI } from "@google/generative-ai";
import { logger } from "../logger.js";

export interface ClassifiedFood {
  name: string;
  portionType: string;
  cookingMethod: string;
  servingCount: number;
  confidence: number;
  alternatives: string[];
}

function normalizeClassification(items: ClassifiedFood[]): ClassifiedFood[] {
  return items.map((item) => {
    const name = item.name.toLowerCase();

    // portionType post-processing
    let portionType = item.portionType || "grams";
    if (
      /roti|chapati|naan|paratha|egg|idli|dosa|samosa|pakora|vada|tikka|bread|kebab/.test(name)
    ) portionType = "piece";
    else if (/dal|curry|sabzi|paneer|raita|chutney|soup|sambhar|rasam|gravy/.test(name))
      portionType = "bowl";
    else if (/rice|biryani|pulao|khichdi|pasta|noodle/.test(name)) portionType = "plate";
    else if (/lassi|milk|juice|shake|tea|coffee|drink|buttermilk|chaas/.test(name))
      portionType = "glass";

    // cookingMethod post-processing
    let cookingMethod = item.cookingMethod || "normal";
    if (/samosa|pakora|puri|fried rice|fry|kachori|jalebi/.test(name))
      cookingMethod = "fried";
    else if (/idli|steamed?|boiled|momos/.test(name)) cookingMethod = "boiled";
    else if (/makhani|tadka|ghee|butter/.test(name)) cookingMethod = "ghee";

    return {
      ...item,
      name: item.name,
      portionType,
      cookingMethod,
      servingCount: item.servingCount ?? 1,
      confidence: item.confidence ?? 0.5,
      alternatives: Array.isArray(item.alternatives) ? item.alternatives : [],
    } as ClassifiedFood;
  });
}

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not configured");
  return new GoogleGenerativeAI(apiKey);
}

export async function classifyFoods(
  base64Image: string,
  userPrompt?: string,
): Promise<ClassifiedFood[]> {
  const genAI = getGeminiClient();
  const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const model = genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      responseMimeType: "application/json",
      maxOutputTokens: 512,
    },
  });

  const extraContext = userPrompt?.trim()
    ? `\n\nUSER INPUT (override visual guess for serving count / identity): "${userPrompt.trim()}"`
    : "";

  const prompt = `Analyze this food photo. Identify all visible items with Indian cuisine awareness.${extraContext}

Return ONLY a JSON array of objects with these keys:
{
  "name": "specific name, e.g. 'Tandoori Roti' or 'Dal Tadka'",
  "portionType": "piece" | "bowl" | "plate" | "glass" | "grams",
  "cookingMethod": "normal" | "fried" | "ghee" | "boiled",
  "servingCount": number (can be fractional, default 1),
  "confidence": number (0.0 to 1.0),
  "alternatives": string[] (2-3 if unsure, else [])
}
User-specified servingCount takes priority over visual count.

Return ONLY the JSON array. No markdown. No extra text.`;

  const result = await model.generateContent([
    prompt,
    { inlineData: { mimeType: "image/jpeg", data: base64Image } },
  ]);

  const text = result.response.text();
  const cleaned = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
  const parsed = JSON.parse(cleaned);
  if (!Array.isArray(parsed)) {
    logger.error("Non-array classifier response", { response: cleaned.substring(0, 200) });
    throw new Error("The AI service returned an unexpected response. Please try again.");
  }
  return normalizeClassification(parsed as ClassifiedFood[]);
}

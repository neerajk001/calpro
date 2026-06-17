import { GoogleGenerativeAI } from "@google/generative-ai";

export interface ClassifiedFood {
  name: string;
  portionType: string;
  cookingMethod: string;
  servingCount: number;
  confidence: number;
  alternatives: string[];
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
    generationConfig: { responseMimeType: "application/json" },
  });

  const extraContext = userPrompt?.trim()
    ? `\n\nCRITICAL USER INPUT (trust this over visual guesses for serving count, cooking method, and identification): "${userPrompt.trim()}"`
    : "";

  const prompt = `Analyze this food photo and identify all visible food items with Indian cuisine knowledge.${extraContext}

IMPORTANT: If the user specified a quantity or serving count in their input above, use THAT exact number as servingCount — do not override it with what you visually see. For example, if the user says "1.5 eggs" but you see 3 objects, use 1.5.

Return ONLY a JSON array of objects. Each object must have exactly these keys — nothing else:
{
  "name": "string (specific name, e.g. 'Tandoori Roti' not just 'roti', 'Dal Tadka' not just 'dal')",
  "portionType": "piece" | "bowl" | "plate" | "glass" | "grams",
  "cookingMethod": "normal" | "fried" | "ghee" | "boiled",
  "servingCount": number (how many servings: 1, 1.5, 2, 3 etc — CAN BE FRACTIONAL),
  "confidence": number (0.0 to 1.0),
  "alternatives": string[] (2-3 alternatives if unsure, otherwise [])
}

portionType rules:
- "piece" for roti, naan, paratha, eggs, idli, dosa, samosa, pakora, kebabs, tikka, breads
- "bowl" for dals, curries, sabzis, raita, soups, sambhar, chutneys, gravy dishes
- "plate" for rice, biryani, pulao, khichdi, pasta, noodles
- "glass" for drinks, lassi, milk, shakes, juice, tea, coffee
- "grams" for anything else

cookingMethod rules:
- "fried" if food looks deep/shallow fried (samosa, pakora, puri, fried rice)
- "ghee" if visible ghee/butter topping (roti with ghee shine, dal tadka with tadka)
- "boiled" if steamed/boiled (idli, boiled eggs, steamed rice)
- "normal" otherwise

Return ONLY the JSON array. If no food detected, return []. No markdown wrapping. No extra text.`;

  const result = await model.generateContent([
    prompt,
    { inlineData: { mimeType: "image/jpeg", data: base64Image } },
  ]);

  const text = result.response.text();
  const cleaned = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
  const parsed = JSON.parse(cleaned);
  if (!Array.isArray(parsed)) {
    console.error("[classifier] Non-array response:", cleaned);
    throw new Error("The AI service returned an unexpected response. Please try again.");
  }
  return parsed as ClassifiedFood[];
}

import { prisma } from "../prisma.js";

export interface MappedFood {
  id: string;
  name: string;
  category: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  source: string;
  sourceRef: string | null;
  emoji: string | null;
  confidence: number;       // mapping confidence
  matchLayer: string;       // exact | alias | fuzzy | embedding | fallback
}

export async function mapFood(aiName: string): Promise<MappedFood | null> {
  // Layer 1: Exact match
  const exactMatch = await prisma.food.findFirst({
    where: { name: { equals: aiName, mode: "insensitive" } },
  });
  if (exactMatch) return { ...toMapped(exactMatch), confidence: 1.0, matchLayer: "exact" };

  // Layer 2: Alias match
  const aliasMatch = await prisma.foodAlias.findFirst({
    where: { alias: { equals: aiName, mode: "insensitive" } },
    include: { food: true },
  });
  if (aliasMatch?.food) return { ...toMapped(aliasMatch.food), confidence: 0.9, matchLayer: "alias" };

  // Layer 3: Fuzzy match via pg_trgm
  const fuzzyRows = await prisma.$queryRawUnsafe<
    Array<{
      id: string; name: string; category: string;
      caloriesPer100g: number; proteinPer100g: number; carbsPer100g: number; fatPer100g: number;
      source: string; sourceRef: string | null; emoji: string | null; sim: number;
    }>
  >(
    `SELECT id, name, category,
            "caloriesPer100g", "proteinPer100g", "carbsPer100g", "fatPer100g",
            "source"::text, "sourceRef", emoji,
            similarity(name, $1) AS sim
     FROM "Food"
     WHERE similarity(name, $1) > 0.45
     ORDER BY sim DESC
     LIMIT 1`,
    aiName,
  );
  if (fuzzyRows.length > 0) {
    const r = fuzzyRows[0];
    return {
      id: r.id,
      name: r.name,
      category: r.category,
      caloriesPer100g: Number(r.caloriesPer100g),
      proteinPer100g: Number(r.proteinPer100g),
      carbsPer100g: Number(r.carbsPer100g),
      fatPer100g: Number(r.fatPer100g),
      source: r.source,
      sourceRef: r.sourceRef,
      emoji: r.emoji,
      confidence: Number(r.sim),
      matchLayer: "fuzzy",
    };
  }

  return null; // No match — will use category fallback
}

function toMapped(f: any): Omit<MappedFood, "confidence" | "matchLayer"> {
  return {
    id: f.id,
    name: f.name,
    category: f.category,
    caloriesPer100g: Number(f.caloriesPer100g),
    proteinPer100g: Number(f.proteinPer100g),
    carbsPer100g: Number(f.carbsPer100g),
    fatPer100g: Number(f.fatPer100g),
    source: f.source,
    sourceRef: f.sourceRef,
    emoji: f.emoji ?? null,
  };
}

export async function getAlternatives(name: string): Promise<string[]> {
  const rows: any[] = await prisma.$queryRawUnsafe(
    `SELECT name FROM "Food"
     WHERE similarity(name, $1) > 0.3
     ORDER BY similarity(name, $1) DESC
     LIMIT 3`,
    name,
  );
  return rows.map((r: any) => r.name);
}

export async function getFoodById(id: string) {
  return prisma.food.findUnique({ where: { id } });
}

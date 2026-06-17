import { prisma } from "../prisma.js";

export interface PortionPreset {
  label: string;
  grams: number;
}

export async function getPortionPresets(foodId: string | null, portionType: string, count: number): Promise<{ presets: PortionPreset[]; defaultGrams: number }> {
  if (foodId) {
    const rows = await prisma.foodPortion.findMany({
      where: { foodId },
      orderBy: { sortOrder: "asc" },
    });

    if (rows.length > 0) {
      const perUnit = rows[0].grams;
      const defaultGrams = rows.find((r) => r.isDefault)?.grams ?? perUnit;
      return {
        presets: rows.map((r) => ({ label: r.label, grams: r.grams })),
        defaultGrams: Math.round(Math.max(0.5, count) * perUnit),
      };
    }
  }

  // Hardcoded fallback if no portion entries exist yet
  return getBuiltInPresets(portionType, count);
}

function getBuiltInPresets(portionType: string, count: number): { presets: PortionPreset[]; defaultGrams: number } {
  const t = portionType || "grams";

  if (t === "piece") {
    return {
      presets: [
        { label: "1 piece (60g)", grams: 60 },
        { label: "2 pieces (120g)", grams: 120 },
        { label: "3 pieces (180g)", grams: 180 },
        { label: "4 pieces (240g)", grams: 240 },
      ],
      defaultGrams: Math.round(Math.max(0.5, count) * 60),
    };
  }

  if (t === "bowl") {
    return {
      presets: [
        { label: "½ katori (75g)", grams: 75 },
        { label: "1 katori (150g)", grams: 150 },
        { label: "1.5 katori (225g)", grams: 225 },
        { label: "2 katori (300g)", grams: 300 },
      ],
      defaultGrams: Math.round(Math.max(0.5, count) * 150),
    };
  }

  if (t === "plate") {
    return {
      presets: [
        { label: "½ plate (150g)", grams: 150 },
        { label: "1 plate (300g)", grams: 300 },
        { label: "1.5 plate (450g)", grams: 450 },
        { label: "2 plates (600g)", grams: 600 },
      ],
      defaultGrams: Math.round(Math.max(0.5, count) * 300),
    };
  }

  if (t === "glass") {
    return {
      presets: [
        { label: "½ glass (125ml)", grams: 125 },
        { label: "1 glass (250ml)", grams: 250 },
        { label: "2 glasses (500ml)", grams: 500 },
      ],
      defaultGrams: Math.round(Math.max(0.5, count) * 250),
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

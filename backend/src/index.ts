import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { prisma } from "./prisma.js";
import { resolveUserId } from "./auth.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({ exposedHeaders: ["Authorization", "X-Device-Id"], allowedHeaders: ["Content-Type", "Authorization", "X-Device-Id", "X-User-Name", "X-User-Image"] }));
app.use(express.json());

// Routes

// 1. GET /api/state - Hydrate state
app.get("/api/state", async (req, res) => {
  try {
    const userId = await resolveUserId(req);

    const [settings, foodLogs, customFoods, mealTemplates, waterLogs] = await Promise.all([
      prisma.settings.findUnique({
        where: { userId },
      }),
      prisma.foodLog.findMany({
        where: { userId },
        orderBy: { createdAt: "asc" },
      }),
      prisma.customFood.findMany({
        where: { userId },
      }),
      prisma.mealTemplate.findMany({
        where: { userId },
        include: { items: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.waterLog.findMany({
        where: { userId },
      }),
    ]);

    const foodsMapped = foodLogs.map((log) => ({
      id: log.id,
      name: log.name,
      calories: log.calories,
      protein: log.protein,
      carbs: log.carbs ?? undefined,
      fat: log.fat ?? undefined,
      date: log.date,
      createdAt: log.createdAt.getTime(),
      tag: log.tag,
    }));

    const customFoodsMapped = customFoods.map((food) => ({
      id: food.id,
      name: food.name,
      category: food.category,
      caloriesPer100g: food.caloriesPer100g,
      proteinPer100g: food.proteinPer100g,
      carbsPer100g: food.carbsPer100g,
      fatPer100g: food.fatPer100g,
      defaultQty: food.defaultQty,
      quantityMode: food.quantityMode,
      gramsPerPiece: food.gramsPerPiece ?? undefined,
      mlPerServing: food.mlPerServing ?? undefined,
      isCustom: true,
      emoji: food.emoji ?? undefined,
      barcode: food.barcode ?? undefined,
    }));

    const mealTemplatesMapped = mealTemplates.map((template) => ({
      id: template.id,
      userId: template.userId,
      name: template.name,
      tag: template.tag,
      createdAt: template.createdAt.getTime(),
      items: template.items.map((item) => ({
        id: item.id,
        templateId: item.templateId,
        name: item.name,
        quantity: item.quantity,
        quantityMode: item.quantityMode,
        displayQty: item.displayQty,
        calories: item.calories,
        protein: item.protein,
        carbs: item.carbs,
        fat: item.fat,
        emoji: item.emoji ?? undefined,
      })),
    }));

    const settingsMapped = {
      dailyCalorieTarget: settings?.dailyCalorieTarget ?? 2000,
      dailyProteinTarget: settings?.dailyProteinTarget ?? 120,
      trackCarbsFat: settings?.trackCarbsFat ?? false,
      twitterHandle: settings?.twitterHandle ?? "",
      dailyWaterTarget: settings?.dailyWaterTarget ?? 2500,
    };

    const waterLogsMapped = waterLogs.map((log) => ({
      id: log.id,
      date: log.date,
      amount: log.amount,
    }));

    res.json({
      foods: foodsMapped,
      settings: settingsMapped,
      customFoods: customFoodsMapped,
      mealTemplates: mealTemplatesMapped,
      waterLogs: waterLogsMapped,
    });
  } catch (error) {
    console.error("Error fetching state:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 2. GET /api/foods - Fetch food logs
app.get("/api/foods", async (req, res) => {
  try {
    const userId = await resolveUserId(req);
    const foodLogs = await prisma.foodLog.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
    });

    const foodsMapped = foodLogs.map((log) => ({
      id: log.id,
      name: log.name,
      calories: log.calories,
      protein: log.protein,
      carbs: log.carbs ?? undefined,
      fat: log.fat ?? undefined,
      date: log.date,
      createdAt: log.createdAt.getTime(),
      tag: log.tag,
    }));

    res.json(foodsMapped);
  } catch (error) {
    console.error("Error fetching food logs:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 3. POST /api/foods - Log a food entry
app.post("/api/foods", async (req, res) => {
  try {
    const userId = await resolveUserId(req);
    const { name, calories, protein, date, tag, carbs, fat, createdAt } = req.body;

    if (!name || calories === undefined || protein === undefined || !date || !tag) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newLog = await prisma.foodLog.create({
      data: {
        userId,
        name: name.trim(),
        calories: Math.max(0, Math.round(calories)),
        protein: Math.max(0, Number(protein)),
        carbs: carbs !== undefined ? Math.max(0, Number(carbs)) : null,
        fat: fat !== undefined ? Math.max(0, Number(fat)) : null,
        date,
        tag,
        createdAt: createdAt ? new Date(createdAt) : undefined,
      },
    });

    res.status(201).json({
      id: newLog.id,
      name: newLog.name,
      calories: newLog.calories,
      protein: newLog.protein,
      carbs: newLog.carbs ?? undefined,
      fat: newLog.fat ?? undefined,
      date: newLog.date,
      createdAt: newLog.createdAt.getTime(),
      tag: newLog.tag,
    });
  } catch (error) {
    console.error("Error logging food:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 4. PATCH /api/foods/:id - Update food log
app.patch("/api/foods/:id", async (req, res) => {
  try {
    const userId = await resolveUserId(req);
    const { id } = req.params;
    const { name, calories, protein, date, tag, carbs, fat } = req.body;

    const updated = await prisma.foodLog.update({
      where: { id, userId },
      data: {
        name: name !== undefined ? name.trim() : undefined,
        calories: calories !== undefined ? Math.max(0, Math.round(calories)) : undefined,
        protein: protein !== undefined ? Math.max(0, Number(protein)) : undefined,
        date: date !== undefined ? date : undefined,
        tag: tag !== undefined ? tag : undefined,
        carbs: carbs !== undefined ? (carbs !== null ? Math.max(0, Number(carbs)) : null) : undefined,
        fat: fat !== undefined ? (fat !== null ? Math.max(0, Number(fat)) : null) : undefined,
      },
    });

    res.json({
      id: updated.id,
      name: updated.name,
      calories: updated.calories,
      protein: updated.protein,
      carbs: updated.carbs ?? undefined,
      fat: updated.fat ?? undefined,
      date: updated.date,
      createdAt: updated.createdAt.getTime(),
      tag: updated.tag,
    });
  } catch (error) {
    console.error("Error updating food log:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 5. DELETE /api/foods/:id - Delete food log
app.delete("/api/foods/:id", async (req, res) => {
  try {
    const userId = await resolveUserId(req);
    const { id } = req.params;

    await prisma.foodLog.delete({
      where: { id, userId },
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting food log:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 6. GET /api/settings - Fetch user settings
app.get("/api/settings", async (req, res) => {
  try {
    const userId = await resolveUserId(req);
    const settings = await prisma.settings.findUnique({
      where: { userId },
    });

    res.json({
      dailyCalorieTarget: settings?.dailyCalorieTarget ?? 2000,
      dailyProteinTarget: settings?.dailyProteinTarget ?? 120,
      trackCarbsFat: settings?.trackCarbsFat ?? false,
      twitterHandle: settings?.twitterHandle ?? "",
    });
  } catch (error) {
    console.error("Error fetching settings:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 7. PATCH /api/settings - Update settings
app.patch("/api/settings", async (req, res) => {
  try {
    const userId = await resolveUserId(req);
    const { dailyCalorieTarget, dailyProteinTarget, trackCarbsFat, twitterHandle, dailyWaterTarget } = req.body;

    const updated = await prisma.settings.update({
      where: { userId },
      data: {
        dailyCalorieTarget: dailyCalorieTarget !== undefined ? Math.max(100, Math.round(dailyCalorieTarget)) : undefined,
        dailyProteinTarget: dailyProteinTarget !== undefined ? Math.max(10, Math.round(dailyProteinTarget)) : undefined,
        trackCarbsFat: trackCarbsFat !== undefined ? trackCarbsFat : undefined,
        twitterHandle: twitterHandle !== undefined ? twitterHandle : undefined,
        dailyWaterTarget: dailyWaterTarget !== undefined ? Math.max(100, Math.round(dailyWaterTarget)) : undefined,
      },
    });

    res.json({
      dailyCalorieTarget: updated.dailyCalorieTarget,
      dailyProteinTarget: updated.dailyProteinTarget,
      trackCarbsFat: updated.trackCarbsFat,
      twitterHandle: updated.twitterHandle ?? "",
      dailyWaterTarget: updated.dailyWaterTarget,
    });
  } catch (error) {
    console.error("Error updating settings:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 8. GET /api/custom-foods - Fetch custom foods
app.get("/api/custom-foods", async (req, res) => {
  try {
    const userId = await resolveUserId(req);
    const customFoods = await prisma.customFood.findMany({
      where: { userId },
    });

    const mapped = customFoods.map((food) => ({
      id: food.id,
      name: food.name,
      category: food.category,
      caloriesPer100g: food.caloriesPer100g,
      proteinPer100g: food.proteinPer100g,
      carbsPer100g: food.carbsPer100g,
      fatPer100g: food.fatPer100g,
      defaultQty: food.defaultQty,
      quantityMode: food.quantityMode,
      gramsPerPiece: food.gramsPerPiece ?? undefined,
      mlPerServing: food.mlPerServing ?? undefined,
      isCustom: true,
      emoji: food.emoji ?? undefined,
      barcode: food.barcode ?? undefined,
    }));

    res.json(mapped);
  } catch (error) {
    console.error("Error fetching custom foods:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 9. POST /api/custom-foods - Add a custom food
app.post("/api/custom-foods", async (req, res) => {
  try {
    const userId = await resolveUserId(req);
    const {
      name,
      category,
      caloriesPer100g,
      proteinPer100g,
      carbsPer100g,
      fatPer100g,
      quantityMode,
      defaultQty,
      gramsPerPiece,
      mlPerServing,
      emoji,
      barcode,
    } = req.body;

    if (!name || caloriesPer100g === undefined || proteinPer100g === undefined || !category || !quantityMode) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newCustom = await prisma.customFood.create({
      data: {
        userId,
        name: name.trim(),
        category,
        caloriesPer100g: Math.max(0, Number(caloriesPer100g)),
        proteinPer100g: Math.max(0, Number(proteinPer100g)),
        carbsPer100g: carbsPer100g !== undefined ? Math.max(0, Number(carbsPer100g)) : 0,
        fatPer100g: fatPer100g !== undefined ? Math.max(0, Number(fatPer100g)) : 0,
        quantityMode,
        defaultQty: defaultQty !== undefined ? Math.max(1, Number(defaultQty)) : 100,
        gramsPerPiece: gramsPerPiece !== undefined ? Math.max(0, Number(gramsPerPiece)) : null,
        mlPerServing: mlPerServing !== undefined ? Math.max(0, Number(mlPerServing)) : null,
        emoji: emoji || "🍽️",
        barcode: barcode || null,
      },
    });

    res.status(201).json({
      id: newCustom.id,
      name: newCustom.name,
      category: newCustom.category,
      caloriesPer100g: newCustom.caloriesPer100g,
      proteinPer100g: newCustom.proteinPer100g,
      carbsPer100g: newCustom.carbsPer100g,
      fatPer100g: newCustom.fatPer100g,
      defaultQty: newCustom.defaultQty,
      quantityMode: newCustom.quantityMode,
      gramsPerPiece: newCustom.gramsPerPiece ?? undefined,
      mlPerServing: newCustom.mlPerServing ?? undefined,
      isCustom: true,
      emoji: newCustom.emoji ?? undefined,
      barcode: newCustom.barcode ?? undefined,
    });
  } catch (error) {
    console.error("Error creating custom food:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 10. DELETE /api/custom-foods/:id - Delete custom food
app.delete("/api/custom-foods/:id", async (req, res) => {
  try {
    const userId = await resolveUserId(req);
    const { id } = req.params;

    await prisma.customFood.delete({
      where: { id, userId },
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting custom food:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 11. POST /api/migrate - Migrate legacy localStorage data to DB (idempotent)
app.post("/api/migrate", async (req, res) => {
  try {
    const userId = await resolveUserId(req);
    const { foods = [], settings, customFoods = [] } = req.body;

    // 1. Migrate Settings (if provided)
    let migratedSettings = null;
    if (settings) {
      migratedSettings = await prisma.settings.update({
        where: { userId },
        data: {
          dailyCalorieTarget: settings.dailyCalorieTarget !== undefined ? Math.max(100, Math.round(settings.dailyCalorieTarget)) : undefined,
          dailyProteinTarget: settings.dailyProteinTarget !== undefined ? Math.max(10, Math.round(settings.dailyProteinTarget)) : undefined,
          trackCarbsFat: settings.trackCarbsFat !== undefined ? settings.trackCarbsFat : undefined,
          twitterHandle: settings.twitterHandle !== undefined ? settings.twitterHandle : undefined,
        },
      });
    }

    // 2. Migrate Food Logs (Idempotently)
    let migratedLogsCount = 0;
    if (foods.length > 0) {
      const existingLogs = await prisma.foodLog.findMany({
        where: { userId },
        select: { id: true },
      });
      const existingLogIds = new Set(existingLogs.map((log) => log.id));

      const logsToCreate = foods
        .filter((log: any) => log && log.id && !existingLogIds.has(log.id))
        .map((log: any) => ({
          id: log.id,
          userId,
          name: (log.name || "Logged Item").trim(),
          calories: Math.max(0, Math.round(log.calories ?? 0)),
          protein: Math.max(0, Number(log.protein ?? 0)),
          carbs: log.carbs !== undefined ? Math.max(0, Number(log.carbs)) : null,
          fat: log.fat !== undefined ? Math.max(0, Number(log.fat)) : null,
          date: log.date || new Date().toISOString().split("T")[0],
          tag: log.tag || "snack",
          createdAt: log.createdAt ? new Date(log.createdAt) : new Date(),
        }));

      if (logsToCreate.length > 0) {
        const createResult = await prisma.foodLog.createMany({
          data: logsToCreate,
        });
        migratedLogsCount = createResult.count;
      }
    }

    // 3. Migrate Custom Foods (Idempotently)
    let migratedCustomFoodsCount = 0;
    if (customFoods.length > 0) {
      const existingCustom = await prisma.customFood.findMany({
        where: { userId },
        select: { id: true },
      });
      const existingCustomIds = new Set(existingCustom.map((food) => food.id));

      const customToCreate = customFoods
        .filter((food: any) => food && food.id && !existingCustomIds.has(food.id))
        .map((food: any) => ({
          id: food.id,
          userId,
          name: (food.name || "Custom Food").trim(),
          category: food.category || "Custom",
          caloriesPer100g: Math.max(0, Number(food.caloriesPer100g ?? 0)),
          proteinPer100g: Math.max(0, Number(food.proteinPer100g ?? 0)),
          carbsPer100g: food.carbsPer100g !== undefined ? Math.max(0, Number(food.carbsPer100g)) : 0,
          fatPer100g: food.fatPer100g !== undefined ? Math.max(0, Number(food.fatPer100g)) : 0,
          quantityMode: food.quantityMode || "grams",
          defaultQty: food.defaultQty !== undefined ? Math.max(1, Number(food.defaultQty)) : 100,
          gramsPerPiece: food.gramsPerPiece !== undefined ? Math.max(0, Number(food.gramsPerPiece)) : null,
          mlPerServing: food.mlPerServing !== undefined ? Math.max(0, Number(food.mlPerServing)) : null,
          emoji: food.emoji || "🍽️",
          barcode: food.barcode || null,
        }));

      if (customToCreate.length > 0) {
        const createResult = await prisma.customFood.createMany({
          data: customToCreate,
        });
        migratedCustomFoodsCount = createResult.count;
      }
    }

    res.json({
      success: true,
      migratedLogsCount,
      migratedCustomFoodsCount,
      settings: migratedSettings,
    });
  } catch (error) {
    console.error("Error migrating data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Helper for external food searches (fallback if local DB results are sparse)
async function queryExternalSearch(q: string): Promise<any[]> {
  const edamamId = process.env.EDAMAM_APP_ID;
  const edamamKey = process.env.EDAMAM_APP_KEY;
  const nutritionixId = process.env.NUTRITIONIX_APP_ID;
  const nutritionixKey = process.env.NUTRITIONIX_API_KEY;

  const tasks: Promise<any[]>[] = [];

  // Edamam Search
  if (edamamId && edamamKey) {
    tasks.push((async () => {
      try {
        console.log(`🔍 Querying Edamam Food DB API for "${q}"...`);
        const url = `https://api.edamam.com/api/food-database/v2/parser?app_id=${edamamId}&app_key=${edamamKey}&ingr=${encodeURIComponent(q)}`;
        const response = await fetch(url);
        if (response.ok) {
          const data: any = await response.json();
          const hints = data.hints || [];
          return hints.slice(0, 10).map((hint: any) => {
            const food = hint.food;
            const nutrients = food.nutrients || {};
            return {
              name: food.label,
              category: "Custom",
              caloriesPer100g: Math.round(nutrients.ENERC_KCAL || 0),
              proteinPer100g: Math.round((nutrients.PROCNT || 0) * 10) / 10,
              carbsPer100g: Math.round((nutrients.CHOCDF || 0) * 10) / 10,
              fatPer100g: Math.round((nutrients.FAT || 0) * 10) / 10,
              defaultQty: 100,
              quantityMode: "grams",
              emoji: "🍽️",
              barcode: null,
            };
          });
        }
      } catch (err) {
        console.error("Edamam search failed:", err);
      }
      return [];
    })());
  }

  // Nutritionix Search
  if (nutritionixId && nutritionixKey) {
    tasks.push((async () => {
      try {
        console.log(`🔍 Querying Nutritionix API for "${q}"...`);
        const url = `https://trackapi.nutritionix.com/v2/search/instant?query=${encodeURIComponent(q)}`;
        const response = await fetch(url, {
          headers: {
            "x-app-id": nutritionixId,
            "x-app-key": nutritionixKey,
          }
        });
        if (response.ok) {
          const data: any = await response.json();
          const branded = data.branded || [];
          return branded.slice(0, 10).map((item: any) => {
            return {
              name: item.food_name,
              category: "Custom",
              caloriesPer100g: Math.round((item.nf_calories || 0) / ((item.serving_qty * item.serving_weight_grams) / 100 || 1)),
              proteinPer100g: Math.round(((item.nf_protein || 0) / ((item.serving_qty * item.serving_weight_grams) / 100 || 1)) * 10) / 10,
              carbsPer100g: Math.round(((item.nf_total_carbohydrate || 0) / ((item.serving_qty * item.serving_weight_grams) / 100 || 1)) * 10) / 10,
              fatPer100g: Math.round(((item.nf_total_fat || 0) / ((item.serving_qty * item.serving_weight_grams) / 100 || 1)) * 10) / 10,
              defaultQty: 100,
              quantityMode: "grams",
              emoji: "🍽️",
              barcode: null,
            };
          });
        }
      } catch (err) {
        console.error("Nutritionix search failed:", err);
      }
      return [];
    })());
  }

  // Open Food Facts Search (always active as it requires no keys)
  tasks.push((async () => {
    try {
      console.log(`🌐 Querying Open Food Facts Text Search for "${q}"...`);
      const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(q)}&search_simple=1&action=process&json=1&page_size=15`;
      const response = await fetch(url, {
        headers: {
          "User-Agent": "CalPro-Nutrition-App - NodeJs - Version 1.0.0",
        },
      });
      if (response.ok) {
        const data: any = await response.json();
        const products = data.products || [];
        const results = [];
        for (const product of products) {
          const name = product.product_name || product.product_name_en;
          if (!name) continue;
          const nutriments = product.nutriments || {};
          const calories = Math.round(
            nutriments["energy-kcal_100g"] ||
              (nutriments["energy_100g"] ? nutriments["energy_100g"] / 4.184 : 0)
          );
          const protein = Math.round((nutriments["proteins_100g"] || 0) * 10) / 10;
          const carbs = Math.round((nutriments["carbohydrates_100g"] || 0) * 10) / 10;
          const fat = Math.round((nutriments["fat_100g"] || 0) * 10) / 10;

          results.push({
            name: name.substring(0, 100),
            category: "Custom",
            caloriesPer100g: calories,
            proteinPer100g: protein,
            carbsPer100g: carbs,
            fatPer100g: fat,
            defaultQty: 100,
            quantityMode: "grams",
            emoji: "📦",
            barcode: product.code || null,
          });
        }
        return results;
      }
    } catch (err) {
      console.error("Open Food Facts text search failed:", err);
    }
    return [];
  })());

  const taskResults = await Promise.allSettled(tasks);
  const combined: any[] = [];
  const seen = new Set<string>();

  for (const r of taskResults) {
    if (r.status === "fulfilled" && Array.isArray(r.value)) {
      for (const item of r.value) {
        const key = item.name.toLowerCase().trim();
        if (!seen.has(key)) {
          seen.add(key);
          combined.push(item);
        }
      }
    }
  }

  return combined;
}

// 12. GET /api/foods/search - Search local DB + external APIs (with caching)
app.get("/api/foods/search", async (req, res) => {
  try {
    const userId = await resolveUserId(req);
    const q = (req.query.q as string || "").trim().toLowerCase();
    if (!q) {
      return res.json([]);
    }

    // A. Query CustomFood
    const customMatches = await prisma.customFood.findMany({
      where: {
        userId,
        name: { contains: q, mode: "insensitive" },
      },
    });

    // B. Query global Food table
    const globalMatches = await prisma.food.findMany({
      where: {
        name: { contains: q, mode: "insensitive" },
      },
      take: 50,
    });

    // C. Map results
    const customMapped = customMatches.map((food) => ({
      id: food.id,
      name: food.name,
      category: food.category,
      caloriesPer100g: food.caloriesPer100g,
      proteinPer100g: food.proteinPer100g,
      carbsPer100g: food.carbsPer100g,
      fatPer100g: food.fatPer100g,
      defaultQty: food.defaultQty,
      quantityMode: food.quantityMode,
      gramsPerPiece: food.gramsPerPiece ?? undefined,
      mlPerServing: food.mlPerServing ?? undefined,
      isCustom: true,
      emoji: food.emoji ?? undefined,
      barcode: food.barcode ?? undefined,
    }));

    const globalMapped = globalMatches.map((food) => ({
      id: food.id,
      name: food.name,
      category: food.category,
      caloriesPer100g: food.caloriesPer100g,
      proteinPer100g: food.proteinPer100g,
      carbsPer100g: food.carbsPer100g,
      fatPer100g: food.fatPer100g,
      defaultQty: food.defaultQty,
      quantityMode: food.quantityMode,
      gramsPerPiece: food.gramsPerPiece ?? undefined,
      mlPerServing: food.mlPerServing ?? undefined,
      isCustom: false,
      emoji: food.emoji ?? undefined,
      barcode: food.barcode ?? undefined,
    }));

    // Deduplicate
    const merged: any[] = [...customMapped];
    const seenNames = new Set(customMapped.map((item) => item.name.toLowerCase()));

    for (const item of globalMapped) {
      if (!seenNames.has(item.name.toLowerCase())) {
        merged.push(item);
        seenNames.add(item.name.toLowerCase());
      }
    }

    // D. Fallback to external APIs if local matches are sparse (< 5 results)
    if (merged.length < 5) {
      try {
        const externalMatches = await queryExternalSearch(q);
        for (const item of externalMatches) {
          if (!seenNames.has(item.name.toLowerCase())) {
            // Find or cache in global Food DB so it has a valid ID
            let dbFood = await prisma.food.findFirst({
              where: {
                OR: [
                  item.barcode ? { barcode: item.barcode } : undefined,
                  { name: { equals: item.name, mode: "insensitive" } },
                ].filter(Boolean) as any,
              },
            });

            if (!dbFood) {
              dbFood = await prisma.food.create({
                data: {
                  name: item.name,
                  category: item.category,
                  caloriesPer100g: item.caloriesPer100g,
                  proteinPer100g: item.proteinPer100g,
                  carbsPer100g: item.carbsPer100g,
                  fatPer100g: item.fatPer100g,
                  defaultQty: item.defaultQty,
                  quantityMode: item.quantityMode,
                  emoji: item.emoji,
                  barcode: item.barcode || null,
                },
              });
            }

            merged.push({
              id: dbFood.id,
              name: dbFood.name,
              category: dbFood.category,
              caloriesPer100g: dbFood.caloriesPer100g,
              proteinPer100g: dbFood.proteinPer100g,
              carbsPer100g: dbFood.carbsPer100g,
              fatPer100g: dbFood.fatPer100g,
              defaultQty: dbFood.defaultQty,
              quantityMode: dbFood.quantityMode,
              isCustom: false,
              emoji: dbFood.emoji ?? undefined,
              barcode: dbFood.barcode ?? undefined,
            });
            seenNames.add(dbFood.name.toLowerCase());
          }
        }
      } catch (err) {
        console.error("External search lookup or cache failed:", err);
      }
    }

    // Sort: startsWith matches first, then contains matches
    merged.sort((a, b) => {
      const aStarts = a.name.toLowerCase().startsWith(q);
      const bStarts = b.name.toLowerCase().startsWith(q);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      return 0;
    });

    res.json(merged);
  } catch (error) {
    console.error("Search query failed:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 13. GET /api/foods/barcode/:code - Retrieve details by barcode (with Open Food Facts lookup & cache)
app.get("/api/foods/barcode/:code", async (req, res) => {
  try {
    const userId = await resolveUserId(req);
    const { code } = req.params;

    if (!code) {
      return res.status(400).json({ error: "Missing barcode" });
    }

    // A. Check CustomFood
    const customMatch = await prisma.customFood.findFirst({
      where: { userId, barcode: code },
    });

    if (customMatch) {
      return res.json({
        id: customMatch.id,
        name: customMatch.name,
        category: customMatch.category,
        caloriesPer100g: customMatch.caloriesPer100g,
        proteinPer100g: customMatch.proteinPer100g,
        carbsPer100g: customMatch.carbsPer100g,
        fatPer100g: customMatch.fatPer100g,
        defaultQty: customMatch.defaultQty,
        quantityMode: customMatch.quantityMode,
        gramsPerPiece: customMatch.gramsPerPiece ?? undefined,
        mlPerServing: customMatch.mlPerServing ?? undefined,
        isCustom: true,
        emoji: customMatch.emoji ?? undefined,
        barcode: customMatch.barcode ?? undefined,
      });
    }

    // B. Check global Food
    const globalMatch = await prisma.food.findFirst({
      where: { barcode: code },
    });

    if (globalMatch) {
      return res.json({
        id: globalMatch.id,
        name: globalMatch.name,
        category: globalMatch.category,
        caloriesPer100g: globalMatch.caloriesPer100g,
        proteinPer100g: globalMatch.proteinPer100g,
        carbsPer100g: globalMatch.carbsPer100g,
        fatPer100g: globalMatch.fatPer100g,
        defaultQty: globalMatch.defaultQty,
        quantityMode: globalMatch.quantityMode,
        gramsPerPiece: globalMatch.gramsPerPiece ?? undefined,
        mlPerServing: globalMatch.mlPerServing ?? undefined,
        isCustom: false,
        emoji: globalMatch.emoji ?? undefined,
        barcode: globalMatch.barcode ?? undefined,
      });
    }

    // C. Proxy Open Food Facts
    console.log(`🌐 Querying Open Food Facts for barcode "${code}"...`);
    const url = `https://world.openfoodfacts.org/api/v0/product/${code}.json`;
    const response = await fetch(url, {
      headers: {
        "User-Agent": "CalPro-Nutrition-App - NodeJs - Version 1.0.0",
      },
    });

    if (!response.ok) {
      return res.status(404).json({ error: "Product not found on Open Food Facts" });
    }

    const data: any = await response.json();
    if (data.status !== 1 || !data.product) {
      return res.status(404).json({ error: "Product not found on Open Food Facts" });
    }

    const product = data.product;
    const name = product.product_name || `Packaged Food (${code})`;
    const nutriments = product.nutriments || {};

    const calories = Math.round(
      nutriments["energy-kcal_100g"] ||
        (nutriments["energy_100g"] ? nutriments["energy_100g"] / 4.184 : 0)
    );
    const protein = Math.round((nutriments["proteins_100g"] || 0) * 10) / 10;
    const carbs = Math.round((nutriments["carbohydrates_100g"] || 0) * 10) / 10;
    const fat = Math.round((nutriments["fat_100g"] || 0) * 10) / 10;

    // Cache in global Food database
    const cachedFood = await prisma.food.create({
      data: {
        name,
        category: "Custom",
        caloriesPer100g: calories,
        proteinPer100g: protein,
        carbsPer100g: carbs,
        fatPer100g: fat,
        defaultQty: 100,
        quantityMode: "grams",
        emoji: "📦",
        barcode: code,
      },
    });

    return res.status(201).json({
      id: cachedFood.id,
      name: cachedFood.name,
      category: cachedFood.category,
      caloriesPer100g: cachedFood.caloriesPer100g,
      proteinPer100g: cachedFood.proteinPer100g,
      carbsPer100g: cachedFood.carbsPer100g,
      fatPer100g: cachedFood.fatPer100g,
      defaultQty: cachedFood.defaultQty,
      quantityMode: cachedFood.quantityMode,
      isCustom: false,
      emoji: cachedFood.emoji ?? undefined,
      barcode: cachedFood.barcode ?? undefined,
    });
  } catch (error) {
    console.error("Barcode lookup failed:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 14. GET /api/meal-templates - Fetch saved templates
app.get("/api/meal-templates", async (req, res) => {
  try {
    const userId = await resolveUserId(req);
    const templates = await prisma.mealTemplate.findMany({
      where: { userId },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });

    const mapped = templates.map((template) => ({
      id: template.id,
      userId: template.userId,
      name: template.name,
      tag: template.tag,
      createdAt: template.createdAt.getTime(),
      items: template.items.map((item) => ({
        id: item.id,
        templateId: item.templateId,
        name: item.name,
        quantity: item.quantity,
        quantityMode: item.quantityMode,
        displayQty: item.displayQty,
        calories: item.calories,
        protein: item.protein,
        carbs: item.carbs,
        fat: item.fat,
        emoji: item.emoji ?? undefined,
      })),
    }));

    res.json(mapped);
  } catch (error) {
    console.error("Error fetching meal templates:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 15. POST /api/meal-templates - Save a new meal template
app.post("/api/meal-templates", async (req, res) => {
  try {
    const userId = await resolveUserId(req);
    const { name, tag, items } = req.body;

    if (!name || !tag || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Missing required fields or items empty" });
    }

    const template = await prisma.mealTemplate.create({
      data: {
        userId,
        name: name.trim(),
        tag,
        items: {
          create: items.map((item: any) => ({
            name: item.name,
            quantity: Number(item.quantity),
            quantityMode: item.quantityMode,
            displayQty: Number(item.displayQty),
            calories: Math.round(item.calories),
            protein: Number(item.protein),
            carbs: Number(item.carbs),
            fat: Number(item.fat),
            emoji: item.emoji || null,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    res.status(201).json({
      id: template.id,
      userId: template.userId,
      name: template.name,
      tag: template.tag,
      createdAt: template.createdAt.getTime(),
      items: template.items.map((item) => ({
        id: item.id,
        templateId: item.templateId,
        name: item.name,
        quantity: item.quantity,
        quantityMode: item.quantityMode,
        displayQty: item.displayQty,
        calories: item.calories,
        protein: item.protein,
        carbs: item.carbs,
        fat: item.fat,
        emoji: item.emoji ?? undefined,
      })),
    });
  } catch (error) {
    console.error("Error creating meal template:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 16. DELETE /api/meal-templates/:id - Delete a saved template
app.delete("/api/meal-templates/:id", async (req, res) => {
  try {
    const userId = await resolveUserId(req);
    const { id } = req.params;

    await prisma.mealTemplate.delete({
      where: { id, userId },
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting meal template:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 17. POST /api/water-logs - Upsert daily water logs
app.post("/api/water-logs", async (req, res) => {
  try {
    const userId = await resolveUserId(req);
    const { date, amount } = req.body;

    if (!date || amount === undefined) {
      return res.status(400).json({ error: "Missing date or amount" });
    }

    const parsedAmount = Math.max(0, Math.round(amount));

    const existing = await prisma.waterLog.findFirst({
      where: { userId, date },
    });

    let log;
    if (existing) {
      log = await prisma.waterLog.update({
        where: { id: existing.id },
        data: { amount: parsedAmount },
      });
    } else {
      log = await prisma.waterLog.create({
        data: { userId, date, amount: parsedAmount },
      });
    }

    res.json({
      id: log.id,
      date: log.date,
      amount: log.amount,
    });
  } catch (error) {
    console.error("Failed to save water log:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 18. POST /api/auth/claim - Claim anonymous data on first sign-in
app.post("/api/auth/claim", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const userId = await resolveUserId(req);
    const { deviceId } = req.body;

    if (!deviceId || typeof deviceId !== "string") {
      return res.status(400).json({ error: "deviceId is required" });
    }

    const anonymousUser = await prisma.user.findUnique({ where: { anonymousId: deviceId } });
    if (!anonymousUser) {
      return res.json({ merged: false, reason: "no_anonymous_data" });
    }

    if (anonymousUser.id === userId) {
      return res.json({ merged: false, reason: "already_claimed" });
    }

    await prisma.$transaction([
      prisma.foodLog.updateMany({
        where: { userId: anonymousUser.id },
        data: { userId },
      }),
      prisma.customFood.updateMany({
        where: { userId: anonymousUser.id },
        data: { userId },
      }),
      prisma.mealTemplate.updateMany({
        where: { userId: anonymousUser.id },
        data: { userId },
      }),
      prisma.waterLog.updateMany({
        where: { userId: anonymousUser.id },
        data: { userId },
      }),
    ]);

    const anonSettings = await prisma.settings.findUnique({ where: { userId: anonymousUser.id } });
    const userSettings = await prisma.settings.findUnique({ where: { userId } });

    if (anonSettings) {
      const isUserSettingsDefault = !userSettings
        || (userSettings.dailyCalorieTarget === 2000
          && userSettings.dailyProteinTarget === 120
          && userSettings.trackCarbsFat === false
          && userSettings.dailyWaterTarget === 2500
          && !userSettings.twitterHandle);

      if (isUserSettingsDefault) {
        await prisma.settings.update({
          where: { userId },
          data: {
            dailyCalorieTarget: anonSettings.dailyCalorieTarget,
            dailyProteinTarget: anonSettings.dailyProteinTarget,
            trackCarbsFat: anonSettings.trackCarbsFat,
            twitterHandle: anonSettings.twitterHandle,
            dailyWaterTarget: anonSettings.dailyWaterTarget,
          },
        });
      }
    }

    await prisma.user.delete({ where: { id: anonymousUser.id } });

    res.json({ merged: true });
  } catch (error) {
    console.error("Error claiming anonymous data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});

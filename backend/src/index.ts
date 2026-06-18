import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import compression from "compression";
import rateLimit from "express-rate-limit";
import { prisma } from "./prisma.js";
import { resolveUserId } from "./auth.js";
import { scanFoodImage, UserFacingError } from "./scan/orchestrator.js";
import { recordCorrection } from "./scan/feedback.js";
import { logger } from "./logger.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(compression());
app.use(cors({ exposedHeaders: ["Authorization", "X-Device-Id"], allowedHeaders: ["Content-Type", "Authorization", "X-Device-Id", "X-User-Name", "X-User-Image"] }));
app.use(express.json({ limit: "5mb" }));
app.use((_req, res, next) => {
  res.setTimeout(30000, () => {
    if (!res.headersSent) res.status(504).json({ error: "Request timeout" });
  });
  next();
});

// Rate limiters
const searchLimiter = rateLimit({
  windowMs: 60_000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many search requests, please slow down" },
});

const scanLimiter = rateLimit({
  windowMs: 60_000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many scan requests, please slow down" },
});

const globalLimiter = rateLimit({
  windowMs: 60_000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

// Health & metrics endpoint
app.get("/api/health", async (_req, res) => {
  try {
    await prisma.$queryRawUnsafe("SELECT 1");
    const mem = process.memoryUsage();
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: Math.round(process.uptime()),
      memory: {
        heapUsedMB: Math.round(mem.heapUsed / 1024 / 1024),
        heapTotalMB: Math.round(mem.heapTotal / 1024 / 1024),
        rssMB: Math.round(mem.rss / 1024 / 1024),
      },
    });
  } catch {
    res.status(503).json({ status: "error" });
  }
});

// Event loop lag monitor
let lastLoopCheck = Date.now();
setInterval(() => {
  const now = Date.now();
  const lag = now - lastLoopCheck - 1000;
  if (lag > 100) {
    const mem = process.memoryUsage();
    logger.warn("Event loop lag detected", { lag_ms: lag, heap_used_mb: Math.round(mem.heapUsed / 1024 / 1024), rss_mb: Math.round(mem.rss / 1024 / 1024) });
  }
  lastLoopCheck = now;
}, 1000);

// Error handler for auth failures (401 from resolveUserId)
app.use((err: any, _req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err && err.statusCode === 401) {
    return res.status(401).json({ error: err.message || "Authentication required" });
  }
  next(err);
});

// Routes

// 1. GET /api/state - Hydrate state
app.get("/api/state", async (req, res) => {
  try {
    const userId = await resolveUserId(req);
    const limit = Math.min(Math.max(Number(req.query.limit) || 200, 1), 500);
    const after = (req.query.after as string) || undefined;

    const foodLogWhere: any = { userId };
    if (after) foodLogWhere.date = { gte: after };

    const [settings, foodLogs, customFoods, mealTemplates, waterLogs] = await Promise.all([
      prisma.settings.findUnique({
        where: { userId },
      }),
      prisma.foodLog.findMany({
        where: foodLogWhere,
        orderBy: { createdAt: "desc" },
        take: limit,
      }),
      prisma.customFood.findMany({
        where: { userId },
      }),
      prisma.mealTemplate.findMany({
        where: { userId },
        include: { items: true },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      prisma.waterLog.findMany({
        where: { userId },
        orderBy: { date: "desc" },
        take: 90,
      }),
    ]);

    const foodLogsSorted = [...foodLogs].reverse();
    const foodsMapped = foodLogsSorted.map((log) => ({
      id: log.id,
      name: log.name,
      calories: log.calories,
      protein: log.protein,
      carbs: log.carbs ?? undefined,
      fat: log.fat ?? undefined,
      date: log.date,
      createdAt: log.createdAt.getTime(),
      tag: log.tag,
      consumedWeightG: log.consumedWeightG ?? undefined,
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

    res.set("Cache-Control", "private, max-age=30");
    res.json({
      foods: foodsMapped,
      settings: settingsMapped,
      customFoods: customFoodsMapped,
      mealTemplates: mealTemplatesMapped,
      waterLogs: waterLogsMapped,
    });
  } catch (error: any) {
    logger.error("Error fetching state", { err: String(error) });
    res.status(error?.statusCode || 500).json({ error: error?.message || "Internal server error" });
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
      consumedWeightG: log.consumedWeightG ?? undefined,
    }));

    res.json(foodsMapped);
  } catch (error: any) {
    logger.error("Error fetching food logs", { err: String(error) });
    res.status(error?.statusCode || 500).json({ error: error?.message || "Internal server error" });
  }
});

// 3. POST /api/foods - Log a food entry
app.post("/api/foods", async (req, res) => {
  try {
    const userId = await resolveUserId(req);
    const { name, calories, protein, date, tag, carbs, fat, createdAt, consumedWeightG } = req.body;

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
        consumedWeightG: consumedWeightG !== undefined ? Math.max(1, Math.min(5000, Number(consumedWeightG))) : null,
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
      consumedWeightG: newLog.consumedWeightG ?? undefined,
    });
  } catch (error: any) {
    logger.error("Error logging food", { err: String(error) });
    res.status(error?.statusCode || 500).json({ error: error?.message || "Internal server error" });
  }
});

// 4. PATCH /api/foods/:id - Update food log
app.patch("/api/foods/:id", async (req, res) => {
  try {
    const userId = await resolveUserId(req);
    const { id } = req.params;
    const { name, calories, protein, date, tag, carbs, fat, consumedWeightG } = req.body;

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
        consumedWeightG: consumedWeightG !== undefined ? (consumedWeightG !== null ? Math.max(1, Math.min(5000, Number(consumedWeightG))) : null) : undefined,
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
      consumedWeightG: updated.consumedWeightG ?? undefined,
    });
  } catch (error: any) {
    logger.error("Error updating food log:", { err: String(error) });
    res.status(error?.statusCode || 500).json({ error: error?.message || "Internal server error" });
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
  } catch (error: any) {
    logger.error("Error deleting food log:", { err: String(error) });
    res.status(error?.statusCode || 500).json({ error: error?.message || "Internal server error" });
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
  } catch (error: any) {
    logger.error("Error fetching settings:", { err: String(error) });
    res.status(error?.statusCode || 500).json({ error: error?.message || "Internal server error" });
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
  } catch (error: any) {
    logger.error("Error updating settings:", { err: String(error) });
    res.status(error?.statusCode || 500).json({ error: error?.message || "Internal server error" });
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
  } catch (error: any) {
    logger.error("Error fetching custom foods:", { err: String(error) });
    res.status(error?.statusCode || 500).json({ error: error?.message || "Internal server error" });
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
  } catch (error: any) {
    logger.error("Error creating custom food:", { err: String(error) });
    res.status(error?.statusCode || 500).json({ error: error?.message || "Internal server error" });
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
  } catch (error: any) {
    logger.error("Error deleting custom food:", { err: String(error) });
    res.status(error?.statusCode || 500).json({ error: error?.message || "Internal server error" });
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
  } catch (error: any) {
    logger.error("Error migrating data:", { err: String(error) });
    res.status(error?.statusCode || 500).json({ error: error?.message || "Internal server error" });
  }
});

// ─── In-memory Food table cache (avoids DB for every search) ─────────────────
let foodCache: Array<{
  id: string; name: string; category: string;
  caloriesPer100g: number; proteinPer100g: number;
  carbsPer100g: number; fatPer100g: number;
  defaultQty: number; quantityMode: string;
  gramsPerPiece: number | null; mlPerServing: number | null;
  emoji: string | null; barcode: string | null; isIndian: boolean;
}> = [];

async function refreshFoodCache() {
  try {
    const rows = await prisma.$queryRawUnsafe<typeof foodCache>(
      `SELECT id, name, category,
              "caloriesPer100g", "proteinPer100g", "carbsPer100g", "fatPer100g",
              "defaultQty", "quantityMode",
              "gramsPerPiece", "mlPerServing", emoji, barcode, "isIndian"
       FROM "Food"`
    );
    foodCache = rows;
  } catch {}
}

function searchFoodCache(q: string): typeof foodCache {
  const lower = q.toLowerCase();
  return foodCache
    .filter((f) => f.name.toLowerCase().includes(lower))
    .sort((a, b) => {
      const aLower = a.name.toLowerCase();
      const bLower = b.name.toLowerCase();
      const aExact = aLower === lower ? 3 : aLower.startsWith(lower) ? 2 : 1;
      const bExact = bLower === lower ? 3 : bLower.startsWith(lower) ? 2 : 1;
      if (aExact !== bExact) return bExact - aExact;
      // Indian foods first, then by barcode priority
      const aRank = (a.isIndian ? 2 : 0) + (a.barcode?.startsWith("890") ? 1 : 0);
      const bRank = (b.isIndian ? 2 : 0) + (b.barcode?.startsWith("890") ? 1 : 0);
      if (aRank !== bRank) return bRank - aRank;
      return 0;
    })
    .slice(0, 50);
}

// ─── External API response cache ──────────────────────────────────────────────
const externalCache = new Map<string, { data: any; timestamp: number }>();
const EXTERNAL_CACHE_MAX = 200;
const EXTERNAL_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const EXTERNAL_FETCH_TIMEOUT = 5000; // 5 seconds

function getExternalCached(key: string): any | null {
  const entry = externalCache.get(key);
  if (entry && Date.now() - entry.timestamp < EXTERNAL_CACHE_TTL) {
    return entry.data;
  }
  externalCache.delete(key);
  return null;
}

function setExternalCache(key: string, data: any): void {
  externalCache.set(key, { data, timestamp: Date.now() });
  if (externalCache.size > EXTERNAL_CACHE_MAX) {
    const firstKey = externalCache.keys().next().value;
    if (firstKey) externalCache.delete(firstKey);
  }
}

// Helper for external food searches (fallback if local DB results are sparse)
async function queryExternalSearch(q: string): Promise<any[]> {
  const cacheKey = `search:${q}`;
  const cached = getExternalCached(cacheKey);
  if (cached) return cached;

  const edamamId = process.env.EDAMAM_APP_ID;
  const edamamKey = process.env.EDAMAM_APP_KEY;
  const nutritionixId = process.env.NUTRITIONIX_APP_ID;
  const nutritionixKey = process.env.NUTRITIONIX_API_KEY;

  // ── Run Edamam + Nutritionix in parallel ──
  const fastTasks: Promise<any[]>[] = [];
  if (edamamId && edamamKey) {
    fastTasks.push((async () => {
      try {
        const url = `https://api.edamam.com/api/food-database/v2/parser?app_id=${edamamId}&app_key=${edamamKey}&ingr=${encodeURIComponent(q)}`;
        const response = await fetch(url, { signal: AbortSignal.timeout(EXTERNAL_FETCH_TIMEOUT) });
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
      } catch (err: any) {
        if (err?.name !== "AbortError" && err?.name !== "TimeoutError") {
          logger.error("Edamam search failed:", { err: String(err) });
        }
      }
      return [];
    })());
  }
  if (nutritionixId && nutritionixKey) {
    fastTasks.push((async () => {
      try {
        const url = `https://trackapi.nutritionix.com/v2/search/instant?query=${encodeURIComponent(q)}`;
        const response = await fetch(url, {
          headers: { "x-app-id": nutritionixId, "x-app-key": nutritionixKey },
          signal: AbortSignal.timeout(EXTERNAL_FETCH_TIMEOUT),
        });
        if (response.ok) {
          const data: any = await response.json();
          const branded = data.branded || [];
          return branded.slice(0, 10).map((item: any) => ({
            name: item.food_name,
            category: "Custom",
            caloriesPer100g: Math.round((item.nf_calories || 0) / ((item.serving_qty * item.serving_weight_grams) / 100 || 1)),
            proteinPer100g: Math.round(((item.nf_protein || 0) / ((item.serving_qty * item.serving_weight_grams) / 100 || 1)) * 10) / 10,
            carbsPer100g: Math.round(((item.nf_total_carbohydrate || 0) / ((item.serving_qty * item.serving_weight_grams) / 100 || 1)) * 10) / 10,
            fatPer100g: Math.round(((item.nf_total_fat || 0) / ((item.serving_qty * item.serving_weight_grams) / 100 || 1)) * 10) / 10,
            defaultQty: 100, quantityMode: "grams", emoji: "🍽️", barcode: null,
          }));
        }
      } catch (err: any) {
        if (err?.name !== "AbortError" && err?.name !== "TimeoutError") {
          logger.error("Nutritionix search failed:", { err: String(err) });
        }
      }
      return [];
    })());
  }

  const fastResults = await Promise.allSettled(fastTasks);
  const combined: any[] = [];
  const seen = new Set<string>();

  for (const r of fastResults) {
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

  // ── Only hit Open Food Facts if fast APIs returned < 5 results ──
  if (combined.length < 5) {
    try {
      const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(q)}&search_simple=1&action=process&json=1&page_size=15`;
      const response = await fetch(url, {
        headers: { "User-Agent": "CalPro-Nutrition-App - NodeJs - Version 1.0.0" },
        signal: AbortSignal.timeout(EXTERNAL_FETCH_TIMEOUT),
      });
      if (response.ok) {
        const data: any = await response.json();
        const products = data.products || [];
        const offResults = [];
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

          const countries = product.countries_tags || [];
          const isIndian =
            product.code?.startsWith("890") ||
            countries.some((c: string) => c === "en:india" || c === "en:in") ||
            product.countries?.toLowerCase().includes("india");

          offResults.push({
            name: name.substring(0, 100),
            category: "Custom",
            caloriesPer100g: calories, proteinPer100g: protein,
            carbsPer100g: carbs, fatPer100g: fat,
            defaultQty: 100, quantityMode: "grams", emoji: "📦",
            barcode: product.code || null, isIndian: !!isIndian,
          });
        }
        offResults.sort((a, b) => {
          if (a.isIndian && !b.isIndian) return -1;
          if (!a.isIndian && b.isIndian) return 1;
          return 0;
        });

        for (const item of offResults) {
          const key = item.name.toLowerCase().trim();
          if (!seen.has(key)) {
            seen.add(key);
            combined.push(item);
          }
        }
      }
    } catch (err: any) {
      if (err?.name !== "AbortError" && err?.name !== "TimeoutError") {
        logger.error("Open Food Facts text search failed:", { err: String(err) });
      }
    }
  }

  setExternalCache(cacheKey, combined);
  return combined;
}

// 12. GET /api/foods/search - Search local DB + external APIs (with caching)
app.get("/api/foods/search", searchLimiter, async (req, res) => {
  try {
    const userId = await resolveUserId(req);
    const q = (req.query.q as string || "").trim().toLowerCase();
    if (!q) {
      return res.json([]);
    }

    // Server-side cache for local DB search results
    const localCacheKey = `local:${userId}:${q}`;
    const cachedLocal = getExternalCached(localCacheKey);
    if (cachedLocal) {
      res.set("Cache-Control", "private, max-age=300");
      return res.json(cachedLocal);
    }

    // A. Query CustomFood
    const customMatches = await prisma.customFood.findMany({
      where: {
        userId,
        name: { contains: q, mode: "insensitive" },
      },
    });

    // B. Query global Food table from in-memory cache (zero DB connections)
    const globalMatches = searchFoodCache(q);

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
        const newItems = externalMatches.filter(
          (item) => !seenNames.has(item.name.toLowerCase())
        );
        if (newItems.length === 0) {
          setExternalCache(localCacheKey, merged);
          res.set("Cache-Control", "private, max-age=300");
          res.json(merged);
          return;
        }

        const names = newItems.map((i) => i.name);
        const barcodes = newItems.map((i) => i.barcode).filter(Boolean) as string[];

        const existingFoods = await prisma.food.findMany({
          where: {
            OR: [
              { name: { in: names, mode: "insensitive" } },
              ...(barcodes.length > 0 ? [{ barcode: { in: barcodes } }] : []),
            ],
          },
        });

        const existingByName = new Map<string, typeof existingFoods[0]>();
        const existingByBarcode = new Map<string, typeof existingFoods[0]>();
        for (const f of existingFoods) {
          existingByName.set(f.name.toLowerCase(), f);
          if (f.barcode) existingByBarcode.set(f.barcode, f);
        }

        for (const item of newItems) {
          let dbFood = existingByName.get(item.name.toLowerCase());
          if (!dbFood && item.barcode) {
            dbFood = existingByBarcode.get(item.barcode);
          }

          if (dbFood) {
            merged.push({
              id: dbFood.id, name: dbFood.name, category: dbFood.category,
              caloriesPer100g: dbFood.caloriesPer100g, proteinPer100g: dbFood.proteinPer100g,
              carbsPer100g: dbFood.carbsPer100g, fatPer100g: dbFood.fatPer100g,
              defaultQty: dbFood.defaultQty, quantityMode: dbFood.quantityMode,
              isCustom: false, emoji: dbFood.emoji ?? undefined, barcode: dbFood.barcode ?? undefined,
            });
            seenNames.add(item.name.toLowerCase());
          }
        }

        const toCreate = newItems.filter((item) => {
          const key = item.name.toLowerCase();
          return !seenNames.has(key) && !existingByName.has(key) && (!item.barcode || !existingByBarcode.has(item.barcode));
        });
        const upsertOps = toCreate.filter((i) => i.barcode).map((item) =>
          prisma.food.upsert({
            where: { barcode: item.barcode! },
            update: { name: item.name },
            create: {
              name: item.name, category: item.category,
              caloriesPer100g: item.caloriesPer100g, proteinPer100g: item.proteinPer100g,
              carbsPer100g: item.carbsPer100g, fatPer100g: item.fatPer100g,
              defaultQty: item.defaultQty, quantityMode: item.quantityMode,
              emoji: item.emoji, barcode: item.barcode,
            },
          })
        );
        const createData = toCreate.filter((i) => !i.barcode).map((item) => ({
          name: item.name, category: item.category,
          caloriesPer100g: item.caloriesPer100g, proteinPer100g: item.proteinPer100g,
          carbsPer100g: item.carbsPer100g, fatPer100g: item.fatPer100g,
          defaultQty: item.defaultQty, quantityMode: item.quantityMode,
          emoji: item.emoji,
        }));

        let batchedResults: Array<{ id: string; name: string; category: string; caloriesPer100g: number; proteinPer100g: number; carbsPer100g: number; fatPer100g: number; defaultQty: number; quantityMode: string; emoji: string | null; barcode: string | null }> = [];

        if (upsertOps.length > 0) {
          batchedResults = await prisma.$transaction(upsertOps);
        }
        if (createData.length > 0) {
          await prisma.food.createMany({ data: createData, skipDuplicates: true });
          const createdNames = createData.map((d) => d.name);
          const fetched = await prisma.food.findMany({ where: { name: { in: createdNames, mode: "insensitive" } } });
          batchedResults = batchedResults.concat(fetched);
        }

        for (const r of batchedResults) {
          merged.push({
            id: r.id, name: r.name, category: r.category,
            caloriesPer100g: r.caloriesPer100g, proteinPer100g: r.proteinPer100g,
            carbsPer100g: r.carbsPer100g, fatPer100g: r.fatPer100g,
            defaultQty: r.defaultQty, quantityMode: r.quantityMode,
            isCustom: false, emoji: r.emoji ?? undefined, barcode: r.barcode ?? undefined,
          });
          seenNames.add(r.name.toLowerCase());
        }
      } catch (err) {
        logger.error("External search lookup or cache failed:", { err: String(err) });
      }
    }

    // Sort:
    // 1. startsWith matches first
    // 2. Prioritize Indian products (barcodes starting with "890")
    merged.sort((a, b) => {
      const aStarts = a.name.toLowerCase().startsWith(q);
      const bStarts = b.name.toLowerCase().startsWith(q);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;

      const aIsIndian = a.barcode?.startsWith("890");
      const bIsIndian = b.barcode?.startsWith("890");
      if (aIsIndian && !bIsIndian) return -1;
      if (!aIsIndian && bIsIndian) return 1;

      return 0;
    });

    setExternalCache(localCacheKey, merged);
    res.set("Cache-Control", "private, max-age=300");
    res.json(merged);
  } catch (error: any) {
    logger.error("Search query failed:", { err: String(error) });
    res.status(error?.statusCode || 500).json({ error: error?.message || "Internal server error" });
  }
});

// 13. GET /api/meal-templates - Fetch saved templates
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
  } catch (error: any) {
    logger.error("Error fetching meal templates:", { err: String(error) });
    res.status(error?.statusCode || 500).json({ error: error?.message || "Internal server error" });
  }
});

// 14. POST /api/meal-templates - Save a new meal template
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
            userId,
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
  } catch (error: any) {
    logger.error("Error creating meal template:", { err: String(error) });
    res.status(error?.statusCode || 500).json({ error: error?.message || "Internal server error" });
  }
});

// 15. DELETE /api/meal-templates/:id - Delete a saved template
app.delete("/api/meal-templates/:id", async (req, res) => {
  try {
    const userId = await resolveUserId(req);
    const { id } = req.params;

    await prisma.mealTemplate.delete({
      where: { id, userId },
    });

    res.json({ success: true });
  } catch (error: any) {
    logger.error("Error deleting meal template:", { err: String(error) });
    res.status(error?.statusCode || 500).json({ error: error?.message || "Internal server error" });
  }
});

// 16. POST /api/water-logs - Upsert daily water logs
app.post("/api/water-logs", async (req, res) => {
  try {
    const userId = await resolveUserId(req);
    const { date, amount } = req.body;

    if (!date || amount === undefined) {
      return res.status(400).json({ error: "Missing date or amount" });
    }

    const parsedAmount = Math.max(0, Math.round(amount));

    const log = await prisma.waterLog.upsert({
      where: { userId_date: { userId, date } },
      update: { amount: parsedAmount },
      create: { userId, date, amount: parsedAmount },
    });

    res.json({
      id: log.id,
      date: log.date,
      amount: log.amount,
    });
  } catch (error: any) {
    logger.error("Failed to save water log:", { err: String(error) });
    res.status(error?.statusCode || 500).json({ error: error?.message || "Internal server error" });
  }
});

// 17. POST /api/auth/claim - Claim anonymous + legacy data on first sign-in
app.post("/api/auth/claim", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const userId = await resolveUserId(req);
    let mergedAnonymous = false;
    let mergedLegacy = false;

    // 1. ALWAYS migrate legacy "calpro-default-user" data on authenticated request
    const legacyId = "calpro-default-user";
    const legacyUser = await prisma.user.findUnique({ where: { id: legacyId } });
    if (legacyUser && legacyUser.id !== userId) {
      await prisma.$transaction([
        prisma.foodLog.updateMany({ where: { userId: legacyId }, data: { userId } }),
        prisma.customFood.updateMany({ where: { userId: legacyId }, data: { userId } }),
        prisma.mealTemplate.updateMany({ where: { userId: legacyId }, data: { userId } }),
        prisma.waterLog.updateMany({ where: { userId: legacyId }, data: { userId } }),
      ]);
      const legacySettings = await prisma.settings.findUnique({ where: { userId: legacyId } });
      if (legacySettings) {
        const userSettings = await prisma.settings.findUnique({ where: { userId } });
        const isDefault = !userSettings
          || (userSettings.dailyCalorieTarget === 2000
            && userSettings.dailyProteinTarget === 120
            && userSettings.trackCarbsFat === false
            && userSettings.dailyWaterTarget === 2500
            && !userSettings.twitterHandle);
        if (isDefault) {
          await prisma.settings.update({
            where: { userId },
            data: {
              dailyCalorieTarget: legacySettings.dailyCalorieTarget,
              dailyProteinTarget: legacySettings.dailyProteinTarget,
              trackCarbsFat: legacySettings.trackCarbsFat,
              twitterHandle: legacySettings.twitterHandle,
              dailyWaterTarget: legacySettings.dailyWaterTarget,
            },
          });
        }
      }
      await prisma.user.delete({ where: { id: legacyId } });
      mergedLegacy = true;
    }

    // 2. Claim anonymous data by deviceId (if provided)
    const { deviceId } = req.body;
    if (deviceId && typeof deviceId === "string") {
      const anonymousUser = await prisma.user.findUnique({ where: { anonymousId: deviceId } });
      if (anonymousUser && anonymousUser.id !== userId) {
        await prisma.$transaction([
          prisma.foodLog.updateMany({ where: { userId: anonymousUser.id }, data: { userId } }),
          prisma.customFood.updateMany({ where: { userId: anonymousUser.id }, data: { userId } }),
          prisma.mealTemplate.updateMany({ where: { userId: anonymousUser.id }, data: { userId } }),
          prisma.waterLog.updateMany({ where: { userId: anonymousUser.id }, data: { userId } }),
        ]);
        const anonSettings = await prisma.settings.findUnique({ where: { userId: anonymousUser.id } });
        const userSettings = await prisma.settings.findUnique({ where: { userId } });
        if (anonSettings) {
          const isDefault = !userSettings
            || (userSettings.dailyCalorieTarget === 2000
              && userSettings.dailyProteinTarget === 120
              && userSettings.trackCarbsFat === false
              && userSettings.dailyWaterTarget === 2500
              && !userSettings.twitterHandle);
          if (isDefault) {
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
        mergedAnonymous = true;
      }
    }

    res.json({ merged: mergedAnonymous || mergedLegacy, mergedAnonymous, mergedLegacy });
  } catch (error: any) {
    logger.error("Error claiming anonymous data:", { err: String(error) });
    res.status(error?.statusCode || 500).json({ error: error?.message || "Internal server error" });
  }
});

// 18. POST /api/scan - AI food photo scanning
app.post("/api/scan", scanLimiter, async (req, res) => {
  try {
    const userId = await resolveUserId(req);

    const { image, prompt } = req.body;
    if (!image || typeof image !== "string") {
      return res.status(400).json({ error: "Missing or invalid 'image' field. Provide a base64-encoded JPEG string." });
    }

    // Reject oversized images (> 200KB decoded) to prevent Gemini cost abuse
    const decodedSize = Math.ceil(image.length * 0.75);
    if (decodedSize > 200_000) {
      return res.status(413).json({ error: "Image too large. Please use a smaller photo (max ~200KB)." });
    }

    // Scans take longer (Gemini + DB), allow up to 60 seconds
    req.setTimeout(60_000);

    const results = await scanFoodImage(image, userId, prompt);
    res.json({ items: results });
  } catch (error: any) {
    logger.error("Scan failed:", { err: String(error) });
    const message =
      error instanceof UserFacingError
        ? error.message
        : "We couldn't analyze your photo. Make sure the food is clearly visible and try again.";
    res.status(500).json({ error: message });
  }
});

// 19. POST /api/scan/correct - Record food identification correction
app.post("/api/scan/correct", async (req, res) => {
  try {
    const userId = await resolveUserId(req);

    const { originalName, correctedName, originalPortionG, correctedPortionG } = req.body;
    if (!originalName || !correctedName) {
      return res.status(400).json({ error: "Missing originalName or correctedName" });
    }

    await recordCorrection(
      userId,
      originalName,
      correctedName,
      originalPortionG ?? 100,
      correctedPortionG ?? 100,
    );

    res.json({ success: true });
  } catch (error: any) {
    logger.error("Correction recording failed:", { err: String(error) });
    res.status(error?.statusCode || 500).json({ error: error?.message || "Internal server error" });
  }
});

// Start server
app.listen(port, () => {
  logger.info(`Server running on http://localhost:${port}`);

  // Load Food table into memory on startup
  refreshFoodCache();

  // Refresh in-memory Food cache every 5 minutes
  setInterval(refreshFoodCache, 5 * 60 * 1000);

  // Periodic ScanCache cleanup — remove entries older than 30 days
  setInterval(async () => {
    try {
      const result = await prisma.scanCache.deleteMany({
        where: { updatedAt: { lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
      });
      if (result.count > 0) {
        logger.info("Stale scan cache cleaned", { removed: result.count });
      }
    } catch {}
  }, 24 * 60 * 60 * 1000); // daily
});

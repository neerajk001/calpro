import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "../prisma.js";
import dotenv from "dotenv";

dotenv.config();

interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  tag: string;
}

interface CustomFoodItem {
  id: string;
  name: string;
  caloriesPer100g: number;
  proteinPer100g: number;
}

interface WaterLogItem {
  id: string;
  amount: number;
  date: string;
}

interface StateResponse {
  foods: FoodItem[];
  settings: { dailyCalorieTarget: number };
  customFoods: CustomFoodItem[];
  waterLogs: WaterLogItem[];
}

const BASE_URL = `http://localhost:${process.env.PORT || 5000}`;

async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  return fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
}

async function createFood(deviceId: string, food: { name: string; calories: number; protein: number; tag: string }) {
  const date = new Date().toISOString().split("T")[0];
  return apiFetch("/api/foods", {
    method: "POST",
    body: JSON.stringify({ ...food, date }),
    headers: { "X-Device-Id": deviceId },
  });
}

async function createCustomFood(deviceId: string, food: { name: string; caloriesPer100g: number; proteinPer100g: number; category: string; quantityMode: string }) {
  return apiFetch("/api/custom-foods", {
    method: "POST",
    body: JSON.stringify(food),
    headers: { "X-Device-Id": deviceId },
  });
}

async function getState(deviceId: string): Promise<StateResponse> {
  const res = await apiFetch("/api/state", {
    headers: { "X-Device-Id": deviceId },
  });
  return res.json() as Promise<StateResponse>;
}

async function getStateAuth(token: string): Promise<Response> {
  return apiFetch("/api/state", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

describe("Data Isolation", () => {
  let deviceA: string;
  let deviceB: string;

  beforeAll(() => {
    deviceA = "test-device-aaa-" + Math.random().toString(36).substring(2, 8);
    deviceB = "test-device-bbb-" + Math.random().toString(36).substring(2, 8);
  });

  afterAll(async () => {
    await prisma.foodLog.deleteMany({ where: { userId: { startsWith: "test-" } } });
    await prisma.customFood.deleteMany({ where: { userId: { startsWith: "test-" } } });
    await prisma.user.deleteMany({ where: { anonymousId: { in: [deviceA, deviceB] } } });
    await prisma.$disconnect();
  });

  describe("Anonymous A → Anonymous B", () => {
    it("User A's food logs should NOT be visible to User B", async () => {
      // User A logs food
      const resA = await createFood(deviceA, { name: "Test Dal A", calories: 200, protein: 10, tag: "lunch" });
      expect(resA.status).toBe(201);

      // User B fetches state
      const stateB = await getState(deviceB);
      const hasAFood = stateB.foods.some((f) => f.name === "Test Dal A");
      expect(hasAFood).toBe(false);
    });

    it("User A's custom foods should NOT be visible to User B", async () => {
      await createCustomFood(deviceA, { name: "Custom Paneer A", caloriesPer100g: 265, proteinPer100g: 18, category: "Eggs & Dairy", quantityMode: "grams" });

      const stateB = await getState(deviceB);
      const hasACustom = stateB.customFoods.some((f) => f.name === "Custom Paneer A");
      expect(hasACustom).toBe(false);
    });

    it("Each anonymous user sees only their own data", async () => {
      await createFood(deviceA, { name: "Unique Food A", calories: 300, protein: 15, tag: "dinner" });
      await createFood(deviceB, { name: "Unique Food B", calories: 400, protein: 20, tag: "dinner" });

      const stateA = await getState(deviceA);
      const stateB = await getState(deviceB);

      expect(stateA.foods.some((f) => f.name === "Unique Food A")).toBe(true);
      expect(stateA.foods.some((f) => f.name === "Unique Food B")).toBe(false);
      expect(stateB.foods.some((f) => f.name === "Unique Food B")).toBe(true);
      expect(stateB.foods.some((f) => f.name === "Unique Food A")).toBe(false);
    });
  });

  describe("No auth header → 401", () => {
    it("Requests without auth or deviceId should return 401", async () => {
      const res = await apiFetch("/api/state");
      expect(res.status).toBe(401);
    });
  });

  describe("Invalid JWT → 401", () => {
    it("Requests with invalid JWT should return 401", async () => {
      const res = await getStateAuth("invalid-jwt-token");
      expect(res.status).toBe(401);
    });
  });

  describe("Settings Isolation", () => {
    it("Anonymous users have independent settings", async () => {
      // Update settings for device A
      await apiFetch("/api/settings", {
        method: "PATCH",
        body: JSON.stringify({ dailyCalorieTarget: 2500 }),
        headers: { "X-Device-Id": deviceA },
      });

      // Device B should still have default settings
      const stateB = await getState(deviceB);
      expect(stateB.settings.dailyCalorieTarget).toBe(2000);

      const stateA = await getState(deviceA);
      expect(stateA.settings.dailyCalorieTarget).toBe(2500);
    });
  });

  describe("Water Logs Isolation", () => {
    it("Anonymous users have independent water logs", async () => {
      const date = new Date().toISOString().split("T")[0];

      await apiFetch("/api/water-logs", {
        method: "POST",
        body: JSON.stringify({ date, amount: 2000 }),
        headers: { "X-Device-Id": deviceA },
      });

      const stateB = await getState(deviceB);
      expect(stateB.waterLogs.some((w) => w.amount === 2000)).toBe(false);

      const stateA = await getState(deviceA);
      expect(stateA.waterLogs.some((w) => w.amount === 2000)).toBe(true);
    });
  });
});

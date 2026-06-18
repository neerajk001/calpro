import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import dotenv from "dotenv";
import { BUILT_IN_FOODS } from "./foodDatabase.js";

dotenv.config();

if (process.env.DATABASE_URL) {
  process.env.DATABASE_URL = process.env.DATABASE_URL.replace(/^["']|["']$/g, "");
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not set.");

const ssl = connectionString.includes("supabase.co") || connectionString.includes("pooler.supabase.com")
  ? { rejectUnauthorized: false }
  : undefined;

const pool = new pg.Pool({ connectionString, ssl, max: 2 });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const total = BUILT_IN_FOODS.length;
  console.log(`Seeding ${total} foods (IFCT 2017 / USDA sources)...`);

  const BATCH = 5;
  let done = 0;

  for (let i = 0; i < BUILT_IN_FOODS.length; i += BATCH) {
    const batch = BUILT_IN_FOODS.slice(i, i + BATCH);
    await prisma.$transaction(
      batch.map((food) => {
        const isIndian = food.category !== "Junk Food";
        return prisma.food.upsert({
          where: { id: food.id },
          update: {
            name: food.name, category: food.category,
            caloriesPer100g: food.caloriesPer100g, proteinPer100g: food.proteinPer100g,
            carbsPer100g: food.carbsPer100g, fatPer100g: food.fatPer100g,
            defaultQty: food.defaultQty, quantityMode: food.quantityMode as any,
            gramsPerPiece: food.gramsPerPiece ?? null, mlPerServing: food.mlPerServing ?? null,
            emoji: food.emoji ?? null, isIndian,
          },
          create: {
            id: food.id, name: food.name, category: food.category,
            caloriesPer100g: food.caloriesPer100g, proteinPer100g: food.proteinPer100g,
            carbsPer100g: food.carbsPer100g, fatPer100g: food.fatPer100g,
            defaultQty: food.defaultQty, quantityMode: food.quantityMode as any,
            gramsPerPiece: food.gramsPerPiece ?? null, mlPerServing: food.mlPerServing ?? null,
            emoji: food.emoji ?? null, isIndian,
          },
        });
      })
    );
    done += batch.length;
    process.stdout.write(`\r  ${done}/${total} (${Math.round((done / total) * 100)}%)`);
    await new Promise(r => setTimeout(r, 100));
  }

  console.log(`\n✅ Seed complete: ${total} foods in database`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => { console.error("❌", e); prisma.$disconnect(); process.exit(1); });

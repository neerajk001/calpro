import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import dotenv from "dotenv";
import { BUILT_IN_FOODS } from "../../lib/foodDatabase.js";

dotenv.config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set.");
}
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });
const DEFAULT_USER_ID = "calpro-default-user";

async function main() {
  // Idempotent: create the single implicit user + default settings if missing.
  const user = await prisma.user.upsert({
    where: { id: DEFAULT_USER_ID },
    update: {},
    create: {
      id: DEFAULT_USER_ID,
      settings: {
        create: {}, // all Settings fields use schema defaults
      },
    },
    include: { settings: true },
  });

  console.log(`✅ Seeded default user: ${user.id}`);
  console.log(`   Settings id: ${user.settings?.id ?? "(none)"}`);

  // Seed global foods from BUILT_IN_FOODS
  console.log("Seeding global foods database...");
  let seededFoodsCount = 0;
  for (const food of BUILT_IN_FOODS) {
    await prisma.food.upsert({
      where: { id: food.id },
      update: {
        name: food.name,
        category: food.category,
        caloriesPer100g: food.caloriesPer100g,
        proteinPer100g: food.proteinPer100g,
        carbsPer100g: food.carbsPer100g,
        fatPer100g: food.fatPer100g,
        defaultQty: food.defaultQty,
        quantityMode: food.quantityMode as any,
        gramsPerPiece: food.gramsPerPiece ?? null,
        mlPerServing: food.mlPerServing ?? null,
        emoji: food.emoji ?? null,
      },
      create: {
        id: food.id,
        name: food.name,
        category: food.category,
        caloriesPer100g: food.caloriesPer100g,
        proteinPer100g: food.proteinPer100g,
        carbsPer100g: food.carbsPer100g,
        fatPer100g: food.fatPer100g,
        defaultQty: food.defaultQty,
        quantityMode: food.quantityMode as any,
        gramsPerPiece: food.gramsPerPiece ?? null,
        mlPerServing: food.mlPerServing ?? null,
        emoji: food.emoji ?? null,
      },
    });
    seededFoodsCount++;
  }
  console.log(`✅ Seeded ${seededFoodsCount} global foods.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seed failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });

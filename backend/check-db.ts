import { prisma } from "./src/prisma.js";

async function main() {
  await prisma.$connect();

  const [food, customFood, foodLog, mealTemplate, waterLog, user, settings, scanCache] =
    await Promise.all([
      prisma.food.count(),
      prisma.customFood.count(),
      prisma.foodLog.count(),
      prisma.mealTemplate.count(),
      prisma.waterLog.count(),
      prisma.user.count(),
      prisma.settings.count(),
      prisma.scanCache.count(),
    ]);

  console.log("Food (global):     ", food);
  console.log("CustomFood:         ", customFood);
  console.log("FoodLog:            ", foodLog);
  console.log("MealTemplate:       ", mealTemplate);
  console.log("WaterLog:           ", waterLog);
  console.log("User:               ", user);
  console.log("Settings:           ", settings);
  console.log("ScanCache:          ", scanCache);

  console.log("\n--- All Users ---");
  const users = await prisma.user.findMany({ select: { id: true, email: true, supabaseId: true, anonymousId: true } });
  for (const u of users) {
    console.log(`  ID: ${u.id} | email: ${u.email || 'none'} | supabaseId: ${u.supabaseId?.substring(0,12) || 'none'}... | anonId: ${u.anonymousId?.substring(0,12) || 'none'}...`);
  }

  const legacy = await prisma.user.findUnique({ where: { id: "calpro-default-user" } });
  console.log(legacy ? "\nLegacy user EXISTS" : "\nLegacy user NOT FOUND");

  await prisma.$disconnect();
}

main();

import { prisma } from "../prisma.js";
import { logger } from "../logger.js";

export async function recordCorrection(
  userId: string,
  originalName: string,
  correctedName: string,
  originalGrams: number,
  correctedGrams: number,
) {
  // Find the corrected food's ID for linking
  const food = await prisma.food.findFirst({
    where: { name: { equals: correctedName, mode: "insensitive" } },
    select: { id: true },
  });

  await prisma.scanFeedback.create({
    data: {
      userId,
      foodId: food?.id ?? null,
      originalName,
      correctedName,
      originalGrams,
      correctedGrams,
    },
  });

  // Auto-promote: if same correction has been made 3+ times by different users,
  // create a FoodAlias so future scans use the corrected name automatically.
  const count = await prisma.scanFeedback.count({
    where: { originalName, correctedName },
  });

  if (count >= 3 && food) {
    const existing = await prisma.foodAlias.findUnique({
      where: { foodId_alias: { foodId: food.id, alias: originalName } },
    });
    if (!existing) {
      await prisma.foodAlias.create({
        data: { foodId: food.id, alias: originalName },
      });
    }
    // Mark all as applied
    await prisma.scanFeedback.updateMany({
      where: { originalName, correctedName, applied: false },
      data: { applied: true },
    });
  }

  logger.info("Correction recorded", { originalName, correctedName, count });
}

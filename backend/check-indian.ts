import { prisma } from "./src/prisma.js";

async function main() {
  await prisma.$connect();
  const [indian, intl] = await Promise.all([
    prisma.food.count({ where: { isIndian: true } }),
    prisma.food.count({ where: { isIndian: false } }),
  ]);
  console.log("Indian foods:       ", indian);
  console.log("International foods:", intl);
  console.log("Total:              ", indian + intl);
  await prisma.$disconnect();
}
main();

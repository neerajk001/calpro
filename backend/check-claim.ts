import { prisma } from "./src/prisma.js";

async function main() {
  await prisma.$connect();

  const users = await prisma.user.findMany({
    select: { id: true, email: true, supabaseId: true, anonymousId: true, _count: { select: { foodLogs: true, customFoods: true, waterLogs: true } } }
  });

  console.log("--- Users ---");
  for (const u of users) {
    const type = u.supabaseId ? "AUTH" : u.anonymousId ? "ANON" : "OTHER";
    console.log(`[${type}] id=${u.id.substring(0,12)} email=${u.email || '-'} foods=${u._count.foodLogs} custom=${u._count.customFoods} water=${u._count.waterLogs}`);
  }

  console.log("\n--- Recent Food Logs ---");
  const logs = await prisma.foodLog.findMany({ take: 10, orderBy: { createdAt: "desc" } });
  for (const l of logs) {
    console.log(`  userId=${l.userId.substring(0,12)} name="${l.name}" cal=${l.calories} date=${l.date}`);
  }

  await prisma.$disconnect();
}
main();

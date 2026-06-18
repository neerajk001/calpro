import { prisma } from "./src/prisma.js";
import { writeFileSync } from "fs";

async function main() {
  await prisma.$connect();

  const rows = await prisma.$queryRawUnsafe<Array<Record<string, unknown>>>(
    `SELECT id, name, category, "caloriesPer100g", "proteinPer100g", "carbsPer100g", "fatPer100g", "defaultQty", "quantityMode", "gramsPerPiece", "isIndian", emoji FROM "Food" ORDER BY category, name`
  );

  const lines: string[] = [
    '-- CalPro Complete Food Seed (IFCT 2017 / USDA)',
    `-- Generated: ${new Date().toISOString()}`,
    `-- Total foods: ${rows.length}`,
    '',
    'INSERT INTO "Food" (id, name, category, "caloriesPer100g", "proteinPer100g", "carbsPer100g", "fatPer100g", "defaultQty", "quantityMode", "gramsPerPiece", "isIndian", emoji)',
    'VALUES',
  ];

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const vals = [
      `'${String(r.id).replace(/'/g, "''")}'`,
      `'${String(r.name).replace(/'/g, "''")}'`,
      `'${r.category}'`,
      r.caloriesPer100g,
      r.proteinPer100g,
      r.carbsPer100g,
      r.fatPer100g,
      r.defaultQty,
      `'${r.quantityMode}'`,
      r.gramsPerPiece === null ? 'NULL' : r.gramsPerPiece,
      r.isIndian === true ? 'true' : 'false',
      r.emoji ? `'${r.emoji}'` : 'NULL',
    ];
    const comma = i < rows.length - 1 ? ',' : ';';
    lines.push(`  (${vals.join(', ')})${comma}`);
  }

  lines.push('');
  lines.push('-- Safe to run multiple times — skips existing IDs');
  lines.push('ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, category=EXCLUDED.category, "caloriesPer100g"=EXCLUDED."caloriesPer100g", "proteinPer100g"=EXCLUDED."proteinPer100g", "carbsPer100g"=EXCLUDED."carbsPer100g", "fatPer100g"=EXCLUDED."fatPer100g", "defaultQty"=EXCLUDED."defaultQty", "quantityMode"=EXCLUDED."quantityMode", "gramsPerPiece"=EXCLUDED."gramsPerPiece", "isIndian"=EXCLUDED."isIndian", emoji=EXCLUDED.emoji;');

  writeFileSync("prisma/seed-complete.sql", lines.join("\n"));
  console.log(`✅ Written prisma/seed-complete.sql with ${rows.length} foods`);

  await prisma.$disconnect();
}

main();

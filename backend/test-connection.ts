import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

async function run() {
  const connectionString = process.env.DATABASE_URL;
  console.log("DATABASE_URL:", connectionString);
  if (!connectionString) {
    throw new Error("DATABASE_URL is missing");
  }

  const ssl = connectionString.includes("supabase.co") || connectionString.includes("pooler.supabase.com")
    ? { rejectUnauthorized: false }
    : undefined;

  const pool = new pg.Pool({
    connectionString,
    ssl,
  });

  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    console.log("Connecting to database...");
    const count = await prisma.food.count();
    console.log("Success! Food count:", count);
    const users = await prisma.user.findMany({ take: 5 });
    console.log("Users:", users);
  } catch (err) {
    console.error("Database connection failed:", err);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

run();

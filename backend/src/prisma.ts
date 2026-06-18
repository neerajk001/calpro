import { PrismaClient, Prisma } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { logger } from "./logger.js";
import dotenv from "dotenv";

dotenv.config();

if (process.env.DATABASE_URL) {
  process.env.DATABASE_URL = process.env.DATABASE_URL.replace(/^["']|["']$/g, "");
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const RETRY_CODES = new Set(["P1001", "P1002", "P1017", "08006", "57P01", "57P02", "57P03"]);
const RETRY_MAX = 3;
const RETRY_BASE_DELAY = 200;

function shouldRetry(error: unknown): boolean {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return RETRY_CODES.has(error.code);
  }
  if (error instanceof Prisma.PrismaClientUnknownRequestError) {
    return true;
  }
  if (error instanceof Prisma.PrismaClientInitializationError) {
    return true;
  }
  if (error instanceof Error && ("code" in error)) {
    return RETRY_CODES.has((error as any).code as string);
  }
  return false;
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Add it to your .env file.",
    );
  }

  let connStr = connectionString;
  if (!connStr.includes("statement_timeout=")) {
    const sep = connStr.includes("?") ? "&" : "?";
    connStr = `${connStr}${sep}statement_timeout=10000`;
  }
  if (!connStr.includes("pgbouncer=true")) {
    const sep = connStr.includes("?") ? "&" : "?";
    connStr = `${connStr}${sep}pgbouncer=true`;
  }

  const ssl = connStr.includes("supabase.co") || connStr.includes("pooler.supabase.com")
    ? { rejectUnauthorized: false }
    : undefined;

  const pool = new pg.Pool({
    connectionString: connStr,
    ssl,
    max: 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
    allowExitOnIdle: true,
  });

  // Reset RLS session variable on each new connection (defense-in-depth)
  pool.on("connect", async (client) => {
    await client.query("SET app.current_user_id = ''");
  });

  const adapter = new PrismaPg(pool);

  const client = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

  return client.$extends({
    query: {
      $allModels: {
        $allOperations: async ({ model, operation, args, query }) => {
          for (let attempt = 1; attempt <= RETRY_MAX; attempt++) {
            try {
              return await query(args);
            } catch (error) {
              if (attempt < RETRY_MAX && shouldRetry(error)) {
                const delay = RETRY_BASE_DELAY * Math.pow(2, attempt - 1);
                logger.warn(
                  `[retry] ${model}.${operation} attempt ${attempt}/${RETRY_MAX} failed, retrying in ${delay}ms`
                );
                await sleep(delay);
              } else {
                throw error;
              }
            }
          }
        },
      },
    },
  }) as unknown as PrismaClient;
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

prisma.$executeRawUnsafe(`CREATE EXTENSION IF NOT EXISTS "pg_trgm";`).catch(() => {});
prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Food_name_trgm_idx" ON "Food" USING gin (name gin_trgm_ops);`).catch(() => {});


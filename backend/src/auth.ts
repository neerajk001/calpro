import type { Request } from "express";
import * as jose from "jose";
import { prisma } from "./prisma.js";
import { logger } from "./logger.js";

function getJwtSecret(): Uint8Array {
  const secret = process.env.SUPABASE_JWT_SECRET;
  if (!secret) {
    throw new Error("SUPABASE_JWT_SECRET environment variable is not set");
  }
  return new TextEncoder().encode(secret);
}

async function verifySupabaseToken(token: string): Promise<{ sub: string; email?: string } | null> {
  try {
    const secret = getJwtSecret();
    const { payload } = await jose.jwtVerify(token, secret, {
      algorithms: ["HS256"],
    });
    if (!payload.sub) return null;
    return { sub: payload.sub, email: payload.email as string | undefined };
  } catch (err) {
    logger.warn("JWT verification failed", { err: (err as Error).message });
    return null;
  }
}

async function findOrCreateBySupabaseId(supabaseId: string, email?: string, name?: string, image?: string): Promise<string> {
  let user = await prisma.user.findUnique({ where: { supabaseId } });
  if (user) {
    if (email || name || image) {
      user = await prisma.user.update({
        where: { supabaseId },
        data: {
          email: email ?? undefined,
          name: name ?? undefined,
          image: image ?? undefined,
        },
      });
    }
    return user.id;
  }

  user = await prisma.user.create({
    data: {
      supabaseId,
      email,
      name,
      image,
      settings: { create: {} },
    },
  });
  return user.id;
}

async function findOrCreateByAnonymousId(anonymousId: string): Promise<string> {
  let user = await prisma.user.findUnique({ where: { anonymousId } });
  if (user) return user.id;

  user = await prisma.user.create({
    data: {
      anonymousId,
      settings: { create: {} },
    },
  });
  return user.id;
}

/**
 * Resolves the effective userId from the incoming request.
 *
 * Priority:
 * 1. Valid Authorization: Bearer <supabase-jwt> → extract sub, find-or-create User by supabaseId
 * 2. X-Device-Id header → find-or-create anonymous User by anonymousId
 * 3. Neither → throws 401 error (no shared default user)
 */
export { findOrCreateBySupabaseId, findOrCreateByAnonymousId };

export function authenticateRequest(req: Request): { userId: string } | null {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    // Don't resolve here — let the async path handle it
    return { userId: "__authenticated__" };
  }
  return null;
}

export async function resolveUserId(req: Request): Promise<string> {
  const authHeader = req.headers.authorization;
  let userId: string | null = null;
  let triedAuth = false;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    triedAuth = true;
    const token = authHeader.slice(7);
    const verified = await verifySupabaseToken(token);
    if (verified) {
      const name = req.headers["x-user-name"] as string | undefined;
      const image = req.headers["x-user-image"] as string | undefined;
      userId = await findOrCreateBySupabaseId(verified.sub, verified.email, name, image);
    }
  }

  // Only fall back to deviceId if NO Bearer header was sent
  if (!userId && !triedAuth) {
    const deviceId = req.headers["x-device-id"] as string | undefined;
    if (deviceId && typeof deviceId === "string" && deviceId.length > 0) {
      userId = await findOrCreateByAnonymousId(deviceId);
    }
  }

  if (!userId) {
    if (triedAuth) {
      throw Object.assign(new Error("Invalid or expired authentication token"), { statusCode: 401 });
    }
    throw Object.assign(new Error("Authentication or device ID required"), { statusCode: 401 });
  }

  // Set RLS session variable for defense-in-depth
  await prisma.$executeRawUnsafe(`SET LOCAL app.current_user_id = '${userId}'`);

  return userId;
}

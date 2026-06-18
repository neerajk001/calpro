import type { Request } from "express";
import * as jose from "jose";
import { prisma } from "./prisma.js";
import { logger } from "./logger.js";

// ─── JWKS-based verification (ES256 / ECC P-256) ─────────────────────────────
// Supabase migrated from HS256 shared secret → ES256 signing keys.
// We use createRemoteJWKSet so the public key is fetched once and cached,
// and key rotations are handled automatically.
const SUPABASE_JWKS_URL = `${process.env.NEXT_PUBLIC_SUPABASE_URL || `https://${process.env.DATABASE_URL?.match(/postgres\.([\w]+)\./)?.[1]}.supabase.co`}/auth/v1/.well-known/jwks.json`;

// Hardcode the project ref since we know it
const SUPABASE_PROJECT_REF = "haggcvevjjyhoytydyvs";
const JWKS = jose.createRemoteJWKSet(
  new URL(`https://${SUPABASE_PROJECT_REF}.supabase.co/auth/v1/.well-known/jwks.json`)
);

// ─── Legacy HS256 secret (fallback for tokens issued before key rotation) ─────
function getLegacySecret(): Uint8Array | null {
  const secret = process.env.SUPABASE_JWT_SECRET;
  if (!secret) return null;
  return new TextEncoder().encode(secret);
}

async function verifySupabaseToken(token: string): Promise<{ sub: string; email?: string } | null> {
  // 1. Try ES256 via JWKS (current signing method)
  try {
    const { payload } = await jose.jwtVerify(token, JWKS, {
      algorithms: ["ES256"],
    });
    if (!payload.sub) return null;
    return { sub: payload.sub, email: payload.email as string | undefined };
  } catch (eccErr) {
    // Not an ES256 token — try legacy HS256
  }

  // 2. Fallback: try legacy HS256 shared secret (tokens issued before key rotation)
  const legacySecret = getLegacySecret();
  if (legacySecret) {
    try {
      const { payload } = await jose.jwtVerify(token, legacySecret, {
        algorithms: ["HS256"],
      });
      if (!payload.sub) return null;
      return { sub: payload.sub, email: payload.email as string | undefined };
    } catch (hsErr) {
      logger.warn("JWT verification failed (both ES256 and HS256)", {
        err: (hsErr as Error).message,
      });
    }
  } else {
    logger.warn("JWT ES256 verification failed and no SUPABASE_JWT_SECRET set for HS256 fallback");
  }

  return null;
}

async function findOrCreateBySupabaseId(supabaseId: string, email?: string, name?: string, image?: string): Promise<string> {
  // Use upsert to avoid race condition: getSession() + onAuthStateChange() fire
  // simultaneously on login — both see no user, both try create → unique constraint crash.
  // upsert is atomic: create if not exists, update if exists.
  const user = await prisma.user.upsert({
    where: { supabaseId },
    update: {
      email: email ?? undefined,
      name: name ?? undefined,
      image: image ?? undefined,
    },
    create: {
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

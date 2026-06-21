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

// ─── Clerk JWKS (mobile app auth via @clerk/clerk-expo) ─────────────────────
const CLERK_JWKS = jose.createRemoteJWKSet(
  new URL("https://api.clerk.com/v1/jwks")
);

async function verifyClerkToken(token: string): Promise<{ sub: string; email?: string } | null> {
  try {
    const decoded = jose.decodeJwt(token);
    const iss = decoded.iss as string | undefined;
    
    if (!iss) {
      logger.warn("Clerk token has no issuer claim");
      return null;
    }

    if (!iss.startsWith("https://clerk.") && !iss.includes(".clerk.accounts.dev")) {
      logger.warn(`Clerk token issuer '${iss}' is not a recognized Clerk domain`);
      return null;
    }

    // Dynamically fetch keys from the specific Clerk instance
    const jwksUrl = `${iss}/.well-known/jwks.json`;
    
    const dynamicJwks = jose.createRemoteJWKSet(new URL(jwksUrl));
    const { payload } = await jose.jwtVerify(token, dynamicJwks, {
      algorithms: ["RS256"],
    });

    if (!payload.sub) {
      logger.warn("Clerk token payload has no sub claim");
      return null;
    }

    const email = payload.email as string | undefined
      || (payload as any).user_email as string | undefined;
    
    return { sub: payload.sub, email };
  } catch (err: any) {
    logger.error("Clerk token verification failed:", { 
      message: err.message,
    });
    return null;
  }
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
  // 1. Try finding by supabaseId first
  let user = await prisma.user.findUnique({ where: { supabaseId } });

  if (user) {
    // Update profile if they logged in
    user = await prisma.user.update({
      where: { supabaseId },
      data: {
        email: email ?? undefined,
        name: name ?? undefined,
        image: image ?? undefined,
      },
    });
    return user.id;
  }

  // 2. Link using email address if they logged in under Clerk first
  if (email) {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      user = await prisma.user.update({
        where: { email },
        data: {
          supabaseId,
          name: name ?? undefined,
          image: image ?? undefined,
        },
      });
      return user.id;
    }
  }

  // 3. Create a brand new user
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

async function findOrCreateByClerkId(clerkId: string, email?: string, name?: string): Promise<string> {
  // 1. Try finding by clerkId first
  let user = await prisma.user.findUnique({ where: { clerkId } });

  if (user) {
    user = await prisma.user.update({
      where: { clerkId },
      data: {
        email: email ?? undefined,
        name: name ?? undefined,
      },
    });
    return user.id;
  }

  // 2. Link using email address if they logged in under Supabase first
  if (email) {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      user = await prisma.user.update({
        where: { email },
        data: {
          clerkId,
          name: name ?? undefined,
        },
      });
      return user.id;
    }
  }

  // 3. Create a brand new user
  user = await prisma.user.create({
    data: {
      clerkId,
      email,
      name,
      settings: { create: {} },
    },
  });
  return user.id;
}

async function findOrCreateByAnonymousId(anonymousId: string): Promise<string> {
  try {
    let user = await prisma.user.findUnique({ where: { anonymousId } });
    if (user) return user.id;

    user = await prisma.user.create({
      data: {
        anonymousId,
        settings: { create: {} },
      },
    });
    return user.id;
  } catch (err: any) {
    if (err.code === "P2002") {
      const user = await prisma.user.findUnique({ where: { anonymousId } });
      if (user) return user.id;
    }
    throw err;
  }
}

/**
 * Resolves the effective userId from the incoming request.
 *
 * Priority:
 * 1. Valid Authorization: Bearer <supabase-jwt> → extract sub, find-or-create User by supabaseId
 * 2. X-Device-Id header → find-or-create anonymous User by anonymousId
 * 3. Neither → throws 401 error (no shared default user)
 */
export { findOrCreateBySupabaseId, findOrCreateByClerkId, findOrCreateByAnonymousId };

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

    // Try Supabase token first
    const supraVerified = await verifySupabaseToken(token);
    if (supraVerified) {
      const name = req.headers["x-user-name"] as string | undefined;
      const image = req.headers["x-user-image"] as string | undefined;
      userId = await findOrCreateBySupabaseId(supraVerified.sub, supraVerified.email, name, image);
    }

    // Try Clerk token if Supabase failed
    if (!userId) {
      const clerkVerified = await verifyClerkToken(token);
      if (clerkVerified) {
        const name = req.headers["x-user-name"] as string | undefined;
        const email = clerkVerified.email || (req.headers["x-user-email"] as string | undefined);
        userId = await findOrCreateByClerkId(clerkVerified.sub, email, name);
      }
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

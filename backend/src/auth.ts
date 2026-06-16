import type { Request } from "express";
import * as jose from "jose";
import { prisma } from "./prisma.js";

const DEFAULT_USER_ID = "calpro-default-user";

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
  } catch {
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

async function getLegacyUserId(): Promise<string> {
  const user = await prisma.user.upsert({
    where: { id: DEFAULT_USER_ID },
    update: {},
    create: {
      id: DEFAULT_USER_ID,
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
 * 3. Neither → legacy "calpro-default-user" fallback
 */
export async function resolveUserId(req: Request): Promise<string> {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    const verified = await verifySupabaseToken(token);
    if (verified) {
      const name = req.headers["x-user-name"] as string | undefined;
      const image = req.headers["x-user-image"] as string | undefined;
      return findOrCreateBySupabaseId(verified.sub, verified.email, name, image);
    }
  }

  const deviceId = req.headers["x-device-id"] as string | undefined;
  if (deviceId && typeof deviceId === "string" && deviceId.length > 0) {
    return findOrCreateByAnonymousId(deviceId);
  }

  return getLegacyUserId();
}

export { verifySupabaseToken, findOrCreateBySupabaseId, findOrCreateByAnonymousId };

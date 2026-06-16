# CalPro — Authentication Plan (NextAuth / Auth.js v5 + "Sync Across Devices")

> Scope: Add **optional, skippable** authentication so a user can sign in to **sync their data across devices**, while the app keeps working **fully anonymously** for anyone who skips it. Built on **Auth.js v5 (`next-auth@beta`)** in the Next.js frontend, bridged to the **existing separate Express + Prisma backend**.

---

## The one non-negotiable rule

**Auth is always optional.** No route, no screen, and no feature ever *requires* signing in. The app must remain usable end-to-end with zero account, exactly as today. Sign-in is offered only as a dismissible "Sync across devices" prompt and an item in Settings.

If any phase breaks anonymous usage, it's wrong.

---

## Current architecture (as built)

```
Next.js frontend (AppContext = in-memory source of truth)
   │  fetch()  via lib/apiClient.ts  →  NEXT_PUBLIC_BACKEND_URL (http://localhost:5000)
   ▼
Express backend (backend/src/index.ts)
   │  every route calls getDefaultUserId() → ALWAYS "calpro-default-user"
   │  Prisma 7 + @prisma/adapter-pg
   ▼
PostgreSQL
```

- **No identity today.** `backend/src/auth.ts` `getDefaultUserId()` upserts and returns one hardcoded user (`"calpro-default-user"`). Every user of the deployment shares that one row.
- All client calls go straight from the browser to Express. No tokens, no headers beyond `Content-Type`.

### The core challenge

NextAuth lives in the **Next.js app**, but the data lives behind a **separate Express server** that has no concept of "who is calling." So auth has two jobs:

1. **Identity** — let NextAuth establish *who* the user is (Google / email).
2. **Bridge** — carry that identity to Express on every request, and make Express resolve the right user (real account *or* anonymous device) instead of the single hardcoded one.

---

## Chosen design

### Identity: JWT session strategy, no Prisma adapter in Next.js
Because users live in Express (not the Next.js app's DB), we use Auth.js's **JWT session strategy** and **do not** install the Prisma adapter in the frontend. The Next.js app holds session state in an encrypted cookie; Express remains the user store.

### Bridge: a second, backend-verifiable JWT (shared secret)
The Auth.js session cookie is encrypted (JWE) and **cannot be verified by Express directly**. So, inside the Auth.js `jwt` callback we **mint a separate HS256 token** (via `jose`) with payload `{ sub: userId, email }`, signed with a shared `BACKEND_JWT_SECRET`. We expose it to the client through the `session` callback as `session.backendToken` (+ `session.userId`).

- Client sends it as `Authorization: Bearer <backendToken>`.
- Express verifies it with the **same** `BACKEND_JWT_SECRET` (`jose.jwtVerify`).

> **Where does `userId` come from?** Express stays the source of truth for users. On sign-in, the `jwt` callback calls Express `POST /api/auth/upsert-user` (guarded by a service secret) with `{ email, name, image, provider }`; Express upserts a `User` keyed by **email** and returns its id, which is baked into the minted token.

> **Security note / alternative (Pattern B):** A more secure variant routes all data calls through a Next.js BFF proxy that reads `auth()` server-side, so the backend token never reaches the browser. It's more work and changes the data path. We choose **Pattern A** (browser → Express with Bearer) because the app already calls Express directly from the browser; Pattern B is documented as a future hardening option.

### Anonymous vs real users in the backend
Replace `getDefaultUserId()` with `resolveUserId(req)`:

| Request has… | Resolves to |
|---|---|
| Valid `Authorization: Bearer` token | that token's real `userId` |
| No token, but `X-Device-Id` header | per-device anonymous `User` (find-or-create by `anonymousId = deviceId`) |
| Neither | legacy fallback `"calpro-default-user"` |

This keeps anonymous usage fully working **and** makes the later data-merge possible (we can identify *which* anonymous bucket to claim).

### Claim / merge on first sign-in
When a previously-anonymous user signs in, their device data is **claimed** into the real account so nothing is lost — that's the whole point of "sync."

`POST /api/auth/claim { deviceId }` (Bearer of the real user), in a **transaction**:
- `updateMany` reassign `FoodLog`, `CustomFood`, `MealTemplate`, `WaterLog` from the anonymous user → authed user.
- Settings: keep the authed user's if non-default, else adopt the anonymous one.
- `WaterLog` same-date collisions → keep the larger amount.
- Idempotent (no-op if anonymous user has no rows). Guarded client-side by a `calpro:claimed:<deviceId>` flag.

---

## Schema changes (`backend/prisma/schema.prisma`)

```prisma
model User {
  id            String         @id @default(cuid())
  createdAt     DateTime       @default(now())
  email         String?        @unique   // set for authed users
  name          String?
  image         String?
  anonymousId   String?        @unique   // set for per-device anonymous users
  settings      Settings?
  foodLogs      FoodLog[]
  customFoods   CustomFood[]
  mealTemplates MealTemplate[]
  waterLogs     WaterLog[]
}
```
- Authed user → `email` set, `anonymousId` null.
- Anonymous user → `anonymousId` set, `email` null.
- Existing `"calpro-default-user"` stays as legacy fallback. No destructive migration; `email`/`name`/`image`/`anonymousId` are all nullable, so the migration is additive and safe.

---

## New / changed files

### Next.js frontend
| File | Purpose |
|---|---|
| `auth.ts` (root) | `NextAuth({...})` → exports `{ handlers, auth, signIn, signOut }`; Google provider; `jwt`/`session` callbacks that call `upsert-user` and mint the backend JWT. |
| `app/api/auth/[...nextauth]/route.ts` | Re-export `{ GET, POST } = handlers`. |
| `types/next-auth.d.ts` | Module augmentation: `session.backendToken`, `session.userId`. |
| `components/SessionProviderWrapper.tsx` | Client wrapper around Auth.js `SessionProvider`. |
| `components/SyncPrompt.tsx` | Dismissible "Sync across devices" banner/modal (flag `calpro:syncPromptDismissed`). |
| `components/AuthBridge.tsx` | Client component under `SessionProvider` that pushes `session.backendToken` + deviceId into the apiClient auth store and triggers re-hydrate + claim on login. |
| `lib/authStore.ts` | Module-level `setAuthToken` / `setDeviceId` / getters. |
| `lib/deviceId.ts` | Get-or-create a persisted `crypto.randomUUID()` in localStorage. |
| `lib/apiClient.ts` | Attach `Authorization` + `X-Device-Id` headers; add `claimAnonymousData(deviceId)`; handle `401` → clear token. |
| `lib/AppContext.tsx` | Re-hydrate state when the session changes (login/logout). |
| `app/layout.tsx` | Wrap in `SessionProviderWrapper`; mount `AuthBridge` + `SyncPrompt`. |
| `app/settings/page.tsx` | Account section: signed-out → "Sync across devices" button; signed-in → email/avatar + "Sign out". |

### Express backend
| File | Purpose |
|---|---|
| `backend/src/auth.ts` | Replace `getDefaultUserId()` with `resolveUserId(req)` (Bearer verify via `jose` + `X-Device-Id` anonymous fallback + legacy fallback). |
| `backend/src/authRoutes.ts` (or in `index.ts`) | `POST /api/auth/upsert-user` (service-secret guarded), `POST /api/auth/claim` (Bearer guarded, transactional merge). |
| `backend/src/index.ts` | Swap every `getDefaultUserId()` → `resolveUserId(req)`; CORS must allow `Authorization` + `X-Device-Id` headers. |
| `backend/prisma/schema.prisma` | `User` gains `email?`, `name?`, `image?`, `anonymousId?` (see above) + migration. |

---

## Environment variables

| Var | Where | Notes |
|---|---|---|
| `AUTH_SECRET` | Next.js | `npx auth secret` to generate. Encrypts the session cookie. |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | Next.js | Google OAuth credentials (Google Cloud Console → OAuth client). |
| `AUTH_URL` | Next.js | Prod base URL (optional in dev; required behind a proxy/deploy). |
| `NEXT_PUBLIC_BACKEND_URL` | Next.js | Already exists; unchanged. |
| `BACKEND_JWT_SECRET` | **Shared** (Next.js + Express) | HS256 secret used to **mint** (frontend) and **verify** (backend) the bridge token. Must match exactly. |
| `AUTH_SERVICE_SECRET` | **Shared** (Next.js + Express) | Guards `POST /api/auth/upsert-user` so only the Next.js server can create/lookup users. |

> **Google OAuth redirect URI** to register: `http://localhost:3000/api/auth/callback/google` (dev) and the prod equivalent.

---

## Phased implementation

### Phase A0 — NextAuth scaffold (frontend only, no data impact) ✅ clean checkpoint
- `npm install next-auth@beta jose`.
- `auth.ts`, `app/api/auth/[...nextauth]/route.ts`, `types/next-auth.d.ts`.
- Google provider + `AUTH_SECRET`, `AUTH_GOOGLE_ID/SECRET`.
- `SessionProviderWrapper` in `layout.tsx`.
- Dismissible **"Sync across devices"** banner (`SyncPrompt`) + Settings "Sync" / "Sign out" UI.
- **Outcome:** sign-in works (you can log in with Google and see your email), but it does **not** touch data yet. Anonymous app is 100% unaffected.

### Phase A1 — Backend identity
- Extend `User` schema (`email`, `name`, `image`, `anonymousId`) + `prisma migrate dev`.
- `POST /api/auth/upsert-user` (service-secret guarded) — upsert by email, return id.
- `resolveUserId(req)` — Bearer verify (`jose`) + `X-Device-Id` fallback + legacy fallback; replace **every** `getDefaultUserId()` call.
- Auth.js `jwt` callback calls `upsert-user`, then mints the backend JWT; `session` callback exposes `session.backendToken` + `session.userId`.
- CORS: allow `Authorization` + `X-Device-Id`.

### Phase A2 — Token forwarding
- `lib/deviceId.ts`, `lib/authStore.ts`.
- `apiClient` attaches `Authorization` + `X-Device-Id`; `401` → clear token + fall back to anonymous.
- `AuthBridge` pushes `session.backendToken` into the store on session change and re-hydrates `AppContext` on login/logout.

### Phase A3 — Claim / merge anonymous data
- `POST /api/auth/claim` — transactional reassignment of all rows from anonymous → authed user; settings + water-log collision rules; idempotent.
- Client triggers claim once post-login (`calpro:claimed:<deviceId>` flag), then re-fetches `/api/state`.

### Phase A4 — UX polish
- Settings account card (avatar, email, sign-out).
- Logout reverts cleanly to device/anonymous data.
- "Synced ✓" affordance after a successful claim; error/offline handling for `401`.

### Phase A5 — Optional / later
- Email magic-link provider (`Nodemailer`) — needs SMTP env.
- Switch to DB session strategy + account linking (requires an adapter against Express, or a small auth DB).
- **Pattern B** BFF proxy hardening (token never reaches the browser).
- Multi-device conflict resolution beyond last-write-wins.

---

## Key risks & mitigations

1. **Breaking anonymous usage** → `resolveUserId` *always* has a fallback; no route requires auth; sync prompt is purely dismissible. (The top priority.)
2. **Encrypted Auth.js cookie can't be read by Express** → mint a separate HS256 bridge token with a shared secret; verify with `jose` on Express.
3. **Secret mismatch** between mint/verify → single shared `BACKEND_JWT_SECRET`; document that they must be identical; fail loudly on verify error.
4. **Bearer token exposed to browser** → acceptable for Pattern A (short-lived token, scoped to user id); Pattern B documented for future hardening.
5. **Data loss on first login** → transactional, idempotent **claim** merge before showing synced state; never delete the anonymous source until reassigned.
6. **Duplicate users** → `User.email` is `@unique`; `upsert` by email; anonymous keyed by `@unique anonymousId`.
7. **CORS** → explicitly allow `Authorization` + `X-Device-Id` headers on the Express `cors()` config.
8. **Re-hydration churn** → re-fetch `/api/state` only on actual session *transitions* (login/logout), not on every render.

---

## Validation checklist (per phase)
- [ ] Frontend + backend typecheck pass.
- [ ] **Anonymous flow** still works with no account (log food, refresh, see it persist via device id).
- [ ] Google sign-in returns an email; `session.backendToken` present.
- [ ] Authenticated requests resolve to the real user; anonymous to the device user.
- [ ] First login **claims** prior anonymous data; running claim twice is a no-op.
- [ ] Sign-out reverts to device data without errors.

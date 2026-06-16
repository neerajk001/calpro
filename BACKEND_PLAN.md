# CalPro — Backend Migration & Feature Plan (Node.js + Prisma + Postgres)

> Scope: Move CalPro from a localStorage-only Next.js app to a **Node.js + Prisma + PostgreSQL** backend, and implement **everything in `ROADMAP.md` except the AI features** (3.4 Voice Logging and 3.5 Photo Logging are explicitly excluded).

## Decisions (confirmed)

| Decision | Choice |
|---|---|
| Backend stack | Next.js **Route Handlers** (Node.js runtime) + **Prisma ORM** |
| Database | **PostgreSQL** (local via Docker, or hosted Neon/Supabase Postgres) |
| Auth | **None yet** — single implicit default user (swappable later) |
| Data migration | **One-time** migration of existing localStorage → DB on first load |

## Guiding principle

**Swap the persistence layer, keep everything else.** `AppContext` remains the in-memory source of truth. All derived logic (`getDaySummary`, `getDistinctFoods`, `getStreak`) stays as pure client computation over the `foods` array. We only replace *where data is loaded from and saved to*.

---

## Architecture

```
Browser (React / AppContext)
   │  fetch()  (optimistic updates)
   ▼
Next.js Route Handlers  app/api/**/route.ts   (runtime = "nodejs")
   │  Prisma Client (singleton)
   ▼
PostgreSQL
```

- **Why Route Handlers, not Server Actions:** `AppContext` is a client context doing optimistic updates; clean REST-ish GET/POST/PATCH/DELETE map 1:1 onto the existing `storage.ts` CRUD functions.
- **Prisma cannot run on the edge** → every Prisma route exports `export const runtime = "nodejs"`.
- **Prisma singleton** (global-cache pattern) to avoid exhausting DB connections during dev hot-reload.

### New / changed files

| File | Purpose |
|---|---|
| `prisma/schema.prisma` | Schema + datasource |
| `prisma/seed.ts` | Seed the single default user + settings |
| `lib/prisma.ts` | Prisma client singleton |
| `lib/apiClient.ts` | Async functions mirroring `storage.ts` signatures (fetch-based) |
| `lib/auth.ts` | `getDefaultUserId()` — single swap-point for future real auth |
| `app/api/state/route.ts` | GET bundled `{ foods, settings, customFoods }` for hydration |
| `app/api/foods/route.ts` | GET list / POST create food log |
| `app/api/foods/[id]/route.ts` | PATCH update / DELETE food log |
| `app/api/settings/route.ts` | GET / PATCH settings |
| `app/api/custom-foods/route.ts` + `[id]` | Custom food CRUD |
| `app/api/migrate/route.ts` | One-time bulk import endpoint (idempotent) |
| `lib/AppContext.tsx` | Rewired to async load + optimistic mutations |
| `lib/storage.ts` | Kept for migration source + JSON export; no longer the live store |

---

## Prisma schema (derived from `lib/types.ts`)

```prisma
generator client { provider = "prisma-client-js" }
datasource db { provider = "postgresql"; url = env("DATABASE_URL") }

enum FoodTag { breakfast lunch dinner snack junk }
enum QuantityMode { grams piece ml serving }

model User {
  id          String       @id @default(cuid())
  createdAt   DateTime     @default(now())
  settings    Settings?
  foodLogs    FoodLog[]
  customFoods CustomFood[]
  waterLogs   WaterLog[]
  mealTemplates MealTemplate[]
}

model Settings {
  id                 String  @id @default(cuid())
  userId             String  @unique
  user               User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  dailyCalorieTarget Int     @default(2000)
  dailyProteinTarget Int     @default(120)
  trackCarbsFat      Boolean @default(false)
  twitterHandle      String?
  dailyWaterTarget   Int     @default(2500) // ml — for water tracking
}

model FoodLog {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  name      String
  calories  Int
  protein   Float
  carbs     Float?
  fat       Float?
  date      String   // "YYYY-MM-DD" — KEEP AS STRING (streak/summary rely on local-date equality)
  createdAt DateTime @default(now())
  tag       FoodTag
  @@index([userId, date])
}

model CustomFood {
  id              String       @id @default(cuid())
  userId          String
  user            User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  name            String
  category        String
  caloriesPer100g Float
  proteinPer100g  Float
  carbsPer100g    Float
  fatPer100g      Float
  defaultQty      Float
  quantityMode    QuantityMode
  gramsPerPiece   Float?
  mlPerServing    Float?
  emoji           String?
  barcode         String?      // for barcode-cached items
  @@index([userId])
}

model MealTemplate {                  // Roadmap 3.3 "My Meals"
  id        String             @id @default(cuid())
  userId    String
  user      User               @relation(fields: [userId], references: [id], onDelete: Cascade)
  name      String
  tag       FoodTag
  items     MealTemplateItem[]
  createdAt DateTime           @default(now())
}

model MealTemplateItem {
  id           String       @id @default(cuid())
  templateId   String
  template     MealTemplate @relation(fields: [templateId], references: [id], onDelete: Cascade)
  name         String
  quantity     Float
  quantityMode QuantityMode
  displayQty   Float
  calories     Int
  protein      Float
  carbs        Float
  fat          Float
  emoji        String?
}

model WaterLog {                       // Roadmap 3.8
  id     String @id @default(cuid())
  userId String
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  date   String // "YYYY-MM-DD"
  amount Int    // ml
  @@index([userId, date])
}
```

### Type-stability rules (do NOT break these)
1. **`FoodLog.date` stays a `String`** ("YYYY-MM-DD"). Streaks and day-summaries use string equality on local dates; switching to `DateTime` would silently break them.
2. **Serialize `createdAt` to epoch-ms** in API responses so the client `FoodEntry.createdAt: number` type is unchanged.
3. **IDs:** server-generated `cuid()` returned by the API. Optionally use optimistic temp-id → swap on response for snappy UX.

---

## Roadmap feature → work mapping (AI excluded)

| Roadmap | Feature | Work type | Notes |
|---|---|---|---|
| 1 / 2 | Backend + Prisma | Backend | Phases 0–1 below |
| 1 | Food data sources | Backend | **Keep `BUILT_IN_FOODS` in code** for instant offline search; DB `CustomFood` for custom + barcode-cached. Search merges both. |
| 3.1 | **Barcode scanner** | FE + BE | `BarcodeDetector` / `@zxing/browser` + `/api/foods/barcode/[code]` proxy to **Open Food Facts** (free, no key) → cache to DB. **Not AI — in scope.** |
| 3.2 | Portion presets | Frontend | Small/medium/full bowl presets at the quantity step |
| 3.3 | **Meal templates ("My Meals")** | FE + BE | `MealTemplate` tables; "Save as My Meal" in MealBuilder; one-tap log |
| 3.6 | Macro trend charts | Frontend | Compute from in-memory foods; weekly/monthly graphs in History |
| 3.7 | Smart reminders / push | Optional/Defer | Web Push (VAPID + subscription table + cron); flaky on iOS |
| 3.8 | **Water tracking** | FE + BE | `WaterLog` + `dailyWaterTarget` setting + widget |
| 4.1 | Feedback loop | Optional/Defer | Needs per-user macro-override table |
| 4.2 | Cooking-method multipliers | Frontend | Multiply macros (boiled/fried/with ghee) at quantity step |
| 4.3 | Brand-specific data | Backend | Solved by barcode + Open Food Facts cache |
| 5 | CSV export | Frontend | Extend existing JSON export in Settings |
| **3.4** | Voice logging | **EXCLUDED** | AI |
| **3.5** | Photo logging | **EXCLUDED** | AI |

---

## Phased implementation

### Phase 0 — Foundation
- Add deps: `prisma`, `@prisma/client` (+ `tsx` for seed).
- `.env` → `DATABASE_URL`. Provide a `docker-compose.yml` for local Postgres (and note hosted alternative).
- Write `prisma/schema.prisma` (User / Settings / FoodLog / CustomFood to start).
- `lib/prisma.ts` singleton. `lib/auth.ts` `getDefaultUserId()` (find-or-create default user).
- `npx prisma migrate dev`, `npx prisma db seed`.

### Phase 1 — CRUD + AppContext swap
- Route handlers: `/api/state`, `/api/foods`, `/api/foods/[id]`, `/api/settings`, `/api/custom-foods` (+ `[id]`). All `runtime = "nodejs"`.
- `lib/apiClient.ts` mirrors `storage.ts` signatures but `fetch`-based.
- Rewire `AppContext`: hydrate from `/api/state`; mutations do optimistic local update → async call → rollback on error (extends existing `lastDeleted`/undo pattern). Keep `hydrated` gate.
- `app/food-db/page.tsx` custom-food calls → async API.

### Phase 2 — One-time migration
- `/api/migrate` bulk import (idempotent).
- Client `migrateLocalToServer()` guarded by `calpro:migrated:v1` flag; **don't set flag on failure**; keep localStorage as backup.

### Phase 3 — Food DB backend + barcode
- Merged search (built-ins + DB custom). `/api/foods/barcode/[code]` → Open Food Facts → cache. Scanner UI in Add page.

### Phase 4 — Meal templates
- `MealTemplate` CRUD; "Save as My Meal" in MealBuilder; "My Meals" quick-log section.

### Phase 5 — Water + cooking multipliers + macro charts + CSV
- Water widget + `WaterLog` API; cooking multipliers (FE); trend charts in History (FE); CSV export (FE).

### Phase 6 — Optional
- Feedback loop (4.1), reminders/push (3.7), real auth.

---

## Key risks & mitigations
1. **Sync → async** behavioral change → optimistic updates + `hydrated` gate.
2. **Don't refactor `date` to DateTime** → keep string.
3. **Serialize `createdAt` to ms** → stable client types.
4. **Prisma singleton** → avoid dev connection exhaustion.
5. **`runtime = "nodejs"`** on all Prisma routes.
6. **Cross-tab `storage` event sync** stops working over network → drop/replace with revalidation (minor for single user).
7. **Offline-first regression** → the app's "completely offline, data stays on device" selling point weakens; optionally keep localStorage as a write-through cache.
8. **Migration idempotency** → client flag + safe-to-rerun endpoint.

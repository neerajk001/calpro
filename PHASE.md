# CalPro — Phased Backend Build Tracker

> Migrating CalPro from a localStorage-only Next.js app to a **Node.js (Next.js Route Handlers) + Prisma 7 + PostgreSQL** backend, implementing **all of `ROADMAP.md` except the AI features** (3.4 Voice Logging and 3.5 Photo Logging are excluded).
>
> Guiding principle: **swap the persistence layer, keep everything else.** `AppContext` stays the in-memory source of truth; all derived logic (`getDaySummary`, `getDistinctFoods`, `getStreak`) remains pure client computation.

## Legend
- ✅ Done
- 🔜 Next
- ⬜ Planned
- 🟡 Optional / deferred

---

## Environment variables (provide as phases require)

| Var | Needed by | Notes |
|---|---|---|
| `DATABASE_URL` | **Phase 0** | Hosted Postgres (Neon/Supabase). e.g. `postgresql://USER:PASS@HOST:5432/DB?sslmode=require` |
| `NUTRITIONIX_APP_ID` / `NUTRITIONIX_API_KEY` | Phase 3 | Live food search fallback (free tier ~500 calls/day) |
| `EDAMAM_APP_ID` / `EDAMAM_APP_KEY` | Phase 3 | Alternative live food search (free tier) |
| _(Open Food Facts needs no key)_ | Phase 3 | Barcode + Indian subset, free forever |
| `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` | Phase 6 (optional) | Web Push reminders |

---

## ✅ Phase 0 — Foundation (DONE)

Set up Prisma + Postgres scaffolding. Adapted to **Prisma 7.8**, which moved the
connection URL out of `schema.prisma` and requires a **driver adapter** at runtime.

**Delivered:**
- `prisma/schema.prisma` — `User`, `Settings`, `FoodLog`, `CustomFood` + `FoodTag` / `QuantityMode` enums. `FoodLog.date` is a **String** (`"YYYY-MM-DD"`) — must stay a string (streak/summary use local-date equality).
- `prisma.config.ts` — Prisma 7 config (`defineConfig` + `env` from `prisma/config`); supplies `DATABASE_URL` to CLI/migrate/seed.
- `lib/prisma.ts` — singleton `PrismaClient` using the `@prisma/adapter-pg` driver adapter.
- `lib/auth.ts` — `getDefaultUserId()` find-or-create (single swap-point for future real auth).
- `prisma/seed.ts` — idempotently seeds the implicit default user + settings.
- `.env.example`, `.gitignore` (ignores `.env`), `package.json` scripts: `db:generate`, `db:migrate`, `db:seed`, `db:studio`.
- Deps: `prisma`, `@prisma/client`, `@prisma/adapter-pg`, `pg`, `tsx`, `@types/pg`.

**Verified:** `prisma validate` ✅ and `prisma generate` ✅.

**Remaining manual step (needs your `DATABASE_URL`):**
```bash
npm run db:migrate   # create tables
npm run db:seed      # create default user
```

---

## ✅ Phase 1 — CRUD API + AppContext swap (DONE)

Wire the app to a separate Express backend server while keeping client behavior identical.

**Delivered:**
- Express backend endpoints running on port `5000`:
  - `GET /api/state` — Hydrates client with settings, food entries, and custom foods from Supabase.
  - `GET/POST /api/foods` and `PATCH/DELETE /api/foods/:id` — Food log entry CRUD.
  - `GET/PATCH /api/settings` — Settings fetch and update.
  - `GET/POST /api/custom-foods` and `DELETE /api/custom-foods/:id` — Custom foods CRUD.
- Frontend `lib/apiClient.ts` communicating with `NEXT_PUBLIC_BACKEND_URL` (defaulting to `http://localhost:5000`).
- Frontend `lib/AppContext.tsx` rewired for state hydration on mount and optimistic updates for all mutations (with server rollbacks and alerts).
- Frontend `app/food-db/page.tsx` and `app/add/page.tsx` updated to use global `AppContext` custom foods instead of direct localStorage lookups.

**Verified:** Frontend and backend typescript compiler checks pass with `0` errors.

---

## ✅ Phase 2 — One-time localStorage → DB migration (DONE)

Migrate the user's legacy localStorage data to the Supabase database.

**Tasks:**
- **Express Backend**:
  - `POST /api/migrate` — Idempotent bulk import endpoint. It receives `{ foods: FoodEntry[], settings: UserSettings, customFoods: FoodDbItem[] }`, matches against the default user, and:
    - Upserts `Settings` (daily targets, trackCarbsFat, etc.).
    - Idempotently creates `FoodLog` entries (skip if a log with the same name, date, tag, and calories already exists).
    - Idempotently creates `CustomFood` entries (skip if name matches an existing custom food).
- **Next.js Frontend**:
  - Implement check in `lib/AppContext.tsx` during initial hydration:
    - If `localStorage` contains legacy data (e.g. `calpro:foods` or `calpro:settings`) and a client-side migration flag `calpro:migrated:v1` is not set:
      - Send legacy data payload to `/api/migrate`.
      - On successful migration response: set `calpro:migrated:v1 = "true"`.
      - Keep localStorage data intact as backup (do not delete).
      - If local data is empty, set `calpro:migrated:v1 = "true"` immediately to bypass future runs.

---

## ✅ Phase 3 — Food DB backend + barcode + multi-source data (DONE)

This is where the food-data sources plan lands.

| Source | Role | Key? |
|---|---|---|
| In-code `BUILT_IN_FOODS` | Instant offline search (merged/deduped) | — |
| **ICMR-NIN** (Indian) | One-time **seed** of accurate Indian dishes into a `Food` table | — |
| **Open Food Facts** | Live **barcode** lookups + optional India subset seed → cached to DB | No key |
| **Nutritionix / Edamam** | **Live search fallback** for misses → auto-cache to DB | Yes (free tier) |
| USDA FoodData Central | Optional (US-focused) | No key |

**Tasks:**
- New `Food` table (custom + externally-cached + seeded built-ins as needed).
- Merged search endpoint (built-ins + DB).
- `app/api/foods/barcode/[code]/route.ts` — proxy Open Food Facts → cache.
- `app/api/foods/search/route.ts` — local-first, live-fallback (Nutritionix/Edamam), cache results.
- Seed script for ICMR-NIN + OFF India subset.
- Barcode scanner UI (`BarcodeDetector` / `@zxing/browser`) in the Add page.

---

## ✅ Phase 4 — Meal templates ("My Meals", Roadmap 3.3) (DONE)

- `MealTemplate` + `MealTemplateItem` tables.
- CRUD API.
- "Save as My Meal" in `MealBuilder`; one-tap "My Meals" quick-log section.

---

## ✅ Phase 5 — Water + cooking multipliers + macro charts + CSV (DONE)

- **Water tracking (3.8):** `WaterLog` table + `dailyWaterTarget` setting (already reserved in schema) + widget.
- **Cooking-method multipliers (4.2):** frontend — multiply macros (boiled/fried/with ghee) at the quantity step.
- **Macro trend charts (3.6):** frontend — weekly/monthly graphs in History from in-memory foods.
- **CSV export (5):** frontend — extend the existing JSON export in Settings.
- **Portion presets (3.2):** frontend — small/medium/full bowl presets.

---

## 🟡 Phase 6 — Optional / deferred

- Feedback loop (4.1) — per-user macro-override table.
- Smart reminders / Web Push (3.7) — VAPID + subscription table + cron (flaky on iOS).
- Real authentication — replace `getDefaultUserId()`.

---

## Key risks & mitigations
1. **Sync → async** behavioral change → optimistic updates + `hydrated` gate.
2. **Don't refactor `date` to DateTime** → keep string.
3. **Serialize `createdAt` to ms** → stable client types.
4. **Prisma singleton + driver adapter** (Prisma 7) → avoid dev connection exhaustion.
5. **Cross-tab `storage` sync** stops over network → replace with revalidation (minor for single user).
6. **Offline-first regression** → optionally keep localStorage as a write-through cache.
7. **Migration idempotency** → client flag + safe-to-rerun endpoint.

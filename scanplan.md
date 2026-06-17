Implementation Plan - AI Food Photo Scanning
Implement a food photo scanning feature (POST /api/scan) that accepts a base64-encoded image of food, identifies the items present using Gemini Vision, matches them against the local database using fuzzy search (pg_trgm), and queries Gemini for nutritional macro estimates on cache misses.

User Review Required
IMPORTANT

Express Integration over Separate Fastify Server: We strongly recommend integrating the /api/scan route directly into your existing Express + Prisma backend instead of creating a separate Fastify architecture.

Why?

Shared Database Pool: Next.js frontend calls the existing Express server (http://localhost:5000) which already has connection pooling set up via Prisma adapter and PostgreSQL. Adding Fastify would require running a separate database connection pool and managing connection limits.
Authentication Middleware: Reuses the existing resolveUserId authentication setup on the Express server.
Proxy & Port Simplification: Avoids needing to spin up a third dev server/port (like 5001) and configuring separate reverse proxies on production (logmymeal.xyz).
No Code Duplication: Reuses database models and helper methods.
WARNING

Gemini Model Version: The code draft mentions "gemini-3-flash". As of now, the correct model identifier for Gemini's fast multimodal model is gemini-1.5-flash (or gemini-2.0-flash). We will default to gemini-1.5-flash but make it configurable via environment variables.

Proposed Changes
Database Setup
We need to enable the pg_trgm extension in PostgreSQL to perform fuzzy string matching via similarity(name, $1).

[MODIFY] 
prisma.ts
At server startup, we will run a one-time script execution to ensure the extension is enabled:

typescript

await prisma.$executeRawUnsafe(`CREATE EXTENSION IF NOT EXISTS pg_trgm;`);
Backend Components
[MODIFY] 
.env
Add environment variables for Gemini:

env

GEMINI_API_KEY="your-api-key-here"
GEMINI_MODEL="gemini-1.5-flash"
[NEW] 
scan.ts
Create a new file containing the logic for Calling Gemini Vision, matching local DB records via fuzzy query, estimating macros for cache misses, and saving new entries.

Uses prisma.$queryRawUnsafe to execute the similarity search:
sql

SELECT id, name, "caloriesPer100g", "proteinPer100g", "carbsPer100g", "fatPer100g"
FROM "Food"
WHERE similarity(name, $1) > 0.4
ORDER BY similarity(name, $1) DESC
LIMIT 1
Maps raw query results back to the frontend's expected properties:
calories_per_100g -> caloriesPer100g
protein_g -> proteinPer100g
carbs_g -> carbsPer100g
fat_g -> fatPer100g
Caches AI-generated macro estimates in the "Food" table (mapping category to cuisine_tag || "AI Generated").
[MODIFY] 
index.ts
Register the POST /api/scan endpoint.
Execute CREATE EXTENSION IF NOT EXISTS pg_trgm; on database initialization.
Verification Plan
Automated Verification
Check compilation of both frontend and backend (npm run build).
Manual Verification
Create a mock test route or test script that sends a base64 food image to /api/scan and verify:
The vision model returns identified foods and estimated portions.
Fuzzy search matches existing database items (e.g., if "Chicken Biryani" exists in the DB, it uses DB macros).
A DB miss calls Gemini macro estimation, inserts the new food into "Food" table, and returns the result marked as ai_estimated.
Subsequent scans of that same food return the cached entry marked as database (free).
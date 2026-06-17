# Taste (Continuously Learned by [CommandCode][cmd])

[cmd]: https://commandcode.ai/

# tech-stack
- Use Next.js 15 with TypeScript, Tailwind CSS, localStorage, and PWA. Confidence: 0.50

# project-structure
- Put frontend code in a `frontend/` folder. Confidence: 0.65

# design
- Use teal and green color scheme for UI accents (buttons, toggles); the green should be a vibrant Spotify-style green (e.g., #1DB954), not muted sage. Avoid orange. Confidence: 0.75

# fonts
- Use heavier font weights and ensure sufficient contrast on light backgrounds. Inter at 400–500 weight appears too thin/faded on white; prefer 600+ for body text and ensure secondary text (#666666 or darker) has enough contrast. Confidence: 0.70

# data-integrity
- Use IFCT (Indian Food Composition Tables) or USDA FoodData Central as authoritative sources for nutritional data; avoid estimates or secondary aggregators. Confidence: 0.75

# error-handling
- Never expose raw API error text to users — catch server-side, log full error, and always show only a friendly fallback message regardless of underlying error. Confidence: 0.80
- Add retry logic with exponential backoff (3 retries, ~500ms/1.5s/3s) for transient 503/429 errors from external APIs; do not retry on invalid-request errors. Confidence: 0.75

# architecture
- Gemini (or any LLM) must only classify/detect foods and estimate portions from images — never calculate calories, macros, or nutrition values. All nutrition data must come from a verified database (IFCT/USDA). Confidence: 0.85

# api
- Verify external API model names against latest provider docs before use — avoid hardcoding potentially deprecated model versions. Confidence: 0.70

# workflow
- When modifying the food database, always sync both backend/prisma/foodDatabase.ts and frontend/lib/foodDatabase.ts, then verify with npx tsc --noEmit and duplicate ID detection before seeding. Confidence: 0.75

# manual-logging
- Manual logging entries use serving mode (whole-item totals), not per-100g grams mode. Calories and protein entered are the absolute values for the entire meal, not per-100g. Confidence: 0.70


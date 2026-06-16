# Taste (Continuously Learned by [CommandCode][cmd])

[cmd]: https://commandcode.ai/

# tech-stack
- Use Next.js 15 with TypeScript, Tailwind CSS, localStorage, and PWA. Confidence: 0.50

# project-structure
- Put frontend code in a `frontend/` folder. Confidence: 0.65

# design
- Use teal and green color scheme for UI accents (buttons, toggles); the green should be a vibrant Spotify-style green (e.g., #1DB954), not muted sage. Avoid orange. Confidence: 0.75

# data-integrity
- Use IFCT (Indian Food Composition Tables) or USDA FoodData Central as authoritative sources for nutritional data; avoid estimates or secondary aggregators. Confidence: 0.75

# workflow
- When modifying the food database, always sync both backend/prisma/foodDatabase.ts and frontend/lib/foodDatabase.ts, then verify with npx tsc --noEmit and duplicate ID detection before seeding. Confidence: 0.75


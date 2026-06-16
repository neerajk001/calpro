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

# workflow
- When modifying the food database, always sync both backend/prisma/foodDatabase.ts and frontend/lib/foodDatabase.ts, then verify with npx tsc --noEmit and duplicate ID detection before seeding. Confidence: 0.75


# CalPro — Improvement Roadmap

## 1. 🗄️ Food Data — External Sources

The current static TypeScript array has ~200 foods. Real nutrition databases have **500,000+** foods.

### Best Free APIs / Databases

| Source | Size | Indian Food? | Notes |
|---|---|---|---|
| **Open Food Facts** | 3M+ products | ✅ Yes | Open source, free forever, has barcode data |
| **USDA FoodData Central** | 600K+ foods | ⚠️ Limited | US-focused, very accurate, free API |
| **Nutritionix API** | 800K+ foods | ⚠️ Limited | Free tier (500 calls/day), restaurant foods too |
| **Edamam Food DB** | 900K+ foods | ⚠️ Limited | Free tier exists, good API |
| **Indian Food Composition Tables (ICMR-NIN)** | ~1,000 Indian dishes | ✅ Best | Government source, most accurate for Indian food |

### Plan
- **Seed phase**: Download ICMR-NIN data + Open Food Facts India subset → import into Supabase as a one-time operation → gives ~10,000 accurate Indian foods
- **Live search phase**: When user searches something not in local DB → hit Nutritionix/Edamam API in real-time → show results → user selects → auto-cached in DB

---

## 2. 🏗️ Backend Stack Plan

### Option A — Supabase (Recommended)
```
Supabase (Postgres) + Supabase Auth (optional)
├── foods table          → 10K+ seeded food items
├── food_logs table      → user's daily entries (currently in localStorage)
├── custom_foods table   → user's custom foods
└── user_settings table  → goals, preferences
```
- **Why**: Free tier is generous, has a great dashboard to manually manage food data, row-level security, real-time subscriptions
- **Migration**: Export existing localStorage data → import to Supabase on first login

### Option B — Prisma + SQLite (Local, No Server)
- SQLite file lives on your machine
- Prisma ORM for type-safe queries
- No cloud, no cost, no internet needed
- Data survives browser cache clears
- Can't sync across devices

### Option C — Hybrid (Best of Both)
- SQLite locally (Prisma) for offline/fast access
- Sync to Supabase periodically for backup + multi-device

---

## 3. ✨ UX Improvements to Plan

### 3.1 Barcode Scanner
- Use phone camera to scan packaged food barcode
- Look up in Open Food Facts → auto-fill all macros
- Works for Maggi, protein powders, packaged snacks, any Indian branded food

### 3.2 Portion Size Intelligence
- "How many rotis did you eat?" → already supports pieces
- **Serving size presets**: small bowl / medium bowl / full plate
- **Visual size guide**: image reference for "100g of rice" — very hard to estimate otherwise

### 3.3 Recent Meal Templates ("My Meals")
- Save a combination as a named meal: e.g. "My Usual Lunch = Dal 200g + Rice 150g + Curd 100g"
- One-tap to log the entire saved meal
- Completely removes the repetitive searching every day

### 3.4 Voice Logging
- Speak: *"I had 2 eggs and a bowl of oats"*
- Parsed via OpenAI Whisper or Web Speech API
- Auto-fills the meal builder

### 3.5 Photo Logging (AI)
- Take a photo of your plate
- AI (OpenAI Vision / Gemini Vision) estimates food items + approximate portions
- Returns a pre-filled meal builder for you to confirm/adjust

### 3.6 Better Dashboard
- Weekly/monthly calorie trend graph
- Protein consistency streak
- Macro breakdown pie chart (needs carbs/fat data — already planned)
- "Best day this week" highlight

### 3.7 Smart Reminders / Notifications
- Nudge if no logging by 2pm
- End-of-day summary: "You're 400 kcal under today"
- PWA push notifications (works without an app)

### 3.8 Water Tracking
- Simple water intake log alongside food
- Daily water goal with progress

---

## 4. 🎯 Accuracy Improvements

### 4.1 User Feedback Loop
- After logging, show "Was this accurate?"
- If user edits macros → learn that "my dal is 150 kcal not 116" → save as personal preference
- Over time, the DB adapts to the user's cooking style

### 4.2 Cooking Method Multipliers
- "Fried" adds ~20-30% calories vs "boiled"
- "With ghee" adds X calories per spoon
- Quick toggle: Boiled / Steamed / Fried / With oil

### 4.3 Brand-Specific Data
- MTR Dal Makhani (packaged) ≠ homemade Dal Makhani
- Open Food Facts has Indian packaged product data
- Barcode scanner solves this completely

### 4.4 Restaurant Mode
- "I ordered from Swiggy/Zomato"
- Some restaurants publish nutrition data — could be imported
- Or AI estimation from menu item name

---

## 5. 🔐 Auth & Multi-Device (If Supabase)

- Simple email OTP login (no password)
- All data synced across phone + laptop
- Share daily summary with a coach/friend via link
- Data export: CSV for spreadsheet nerds

---

## Priority Order (Recommendation)

| Priority | Feature | Impact | Effort |
|---|---|---|---|
| 🔴 **1** | Supabase backend + seed 10K Indian foods | Very High | Medium |
| 🔴 **2** | Saved Meal Templates | Very High | Low |
| 🟡 **3** | Barcode Scanner | High | Medium |
| 🟡 **4** | Macro trend charts in History | High | Medium |
| 🟡 **5** | Cooking method multipliers | High | Low |
| 🟢 **6** | Photo logging (AI) | Very High | High |
| 🟢 **7** | Voice logging | Medium | Medium |
| 🟢 **8** | Water tracking | Low | Low |

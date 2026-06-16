# Proposal: Regional Cuisine Seeding & Personalization

This document outlines the proposal and implementation plan for adding regional cuisine preferences (e.g., Maharashtrian, South Indian, North Indian, Gujarati, Bengali) to LogMyMeal.

---

## 💡 Overview

In India, food choices vary drastically state-by-state. Having a "Cuisine / Regional Preference" profile option would make the app feel customized to what the user actually eats daily, showing tailored starter food recommendations and prioritizing search results.

---

## 🛠️ Proposed Implementation

### 1. Database Schema Updates (`schema.prisma`)
- Add `cuisinePreference String @default("General")` to the `Settings` model.
- Add `cuisine String?` to the `Food` and `CustomFood` models.

```prisma
model Settings {
  id                 String  @id @default(cuid())
  userId             String  @unique
  user               User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  dailyCalorieTarget Int     @default(2000)
  dailyProteinTarget Int     @default(120)
  trackCarbsFat      Boolean @default(false)
  twitterHandle      String?
  dailyWaterTarget   Int     @default(2500)
  cuisinePreference  String  @default("General") // <-- Added
}

model Food {
  id              String       @id @default(cuid())
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
  barcode         String?      @unique
  createdAt       DateTime     @default(now())
  cuisine         String?      // <-- Added

  @@index([name])
}
```

### 2. Expanded Database Seeding (`foodDatabase.ts` & `seed.ts`)
Add a `cuisine` property to the foods in `foodDatabase.ts` and add regional staples:
* **Maharashtrian cuisine**: Pohe, Sabudana Khichdi, Misal Pav, Vada Pav, Puran Poli, Kothimbir Vadi, Pitla Bhakri.
* **South Indian cuisine**: Rava Dosa, Pongal, Medu Vada, Lemon Rice, Coconut Chutney, Tomato Rice, Curd Rice.
* **North Indian cuisine**: Sarson ka Saag, Makki di Roti, Chole Bhature, Paneer Butter Masala, Butter Naan, Kadhi Pakora.
* **Gujarati cuisine**: Dhokla, Handvo, Thepla, Khandvi, Khichdi Gujarati, Fafda Jalebi.
* **Bengali cuisine**: Luchi, Alur Dom, Macher Jhol, Mishti Doi, Rasgulla.

Update `seed.ts` to copy this value over during migrations.

### 3. Backend Routing & Logic (`index.ts`)
- Update `/api/state` and `/api/settings` endpoints to return `cuisinePreference`.
- Update the Settings PATCH handler to update `cuisinePreference`.
- Optimize `/api/foods/search` to prioritize foods matching the user's `cuisinePreference`.

### 4. Frontend Seeding (`types.ts` & `storage.ts`)
- Include `cuisinePreference` in the frontend `UserSettings` TypeScript definition.
- Add `cuisine` to the `FoodDbItem` TypeScript definition.

### 5. Frontend UI Configuration
- **Settings Screen (`frontend/app/settings/page.tsx`)**: Add a dropdown choice selector for "Regional Cuisine Preference":
  - `General / Western`
  - `North Indian`
  - `South Indian`
  - `Maharashtrian`
  - `Gujarati`
  - `Bengali`
- **Dashboard Screen (`frontend/app/page.tsx`)**: Dynamically swap starter food logging recommendations on empty days based on user's preference:
  - **Maharashtrian**: Pohe, Sabudana Khichdi, Misal Pav.
  - **South Indian**: Dosa + Sambar, Idli + Sambar, Upma.
  - **North Indian**: Paneer Butter Masala, Chole Bhature, Aloo Paratha.
  - **General**: Scrambled Eggs, Whey Shake, Greek Yogurt.

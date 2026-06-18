import type { FoodDbItem } from "./types";

// ─── Built-in Food Database ───────────────────────────────────────────────────
// All macros are per 100g (or 100ml for liquids), cooked unless specified.
// gramsPerPiece is used when quantityMode = "piece"

export const BUILT_IN_FOODS: FoodDbItem[] = [

  // ═══════════════════════════════════════════════════════════
  // DAL & LEGUMES
  // ═══════════════════════════════════════════════════════════
  {
    id: "dal-masoor-cooked",
    name: "Dal Masoor (Red Lentil)",
    category: "Dal & Legumes",
    caloriesPer100g: 116, proteinPer100g: 9, carbsPer100g: 20, fatPer100g: 0.4,
    defaultQty: 200, quantityMode: "grams", emoji: "🫘",
  },
  {
    id: "dal-chana-cooked",
    name: "Dal Chana (Chickpea)",
    category: "Dal & Legumes",
    caloriesPer100g: 164, proteinPer100g: 9, carbsPer100g: 27, fatPer100g: 2.6,
    defaultQty: 200, quantityMode: "grams", emoji: "🫘",
  },
  {
    id: "dal-moong-cooked",
    name: "Dal Moong (Green Lentil)",
    category: "Dal & Legumes",
    caloriesPer100g: 105, proteinPer100g: 7.6, carbsPer100g: 19, fatPer100g: 0.4,
    defaultQty: 200, quantityMode: "grams", emoji: "🫘",
  },
  {
    id: "dal-toor-cooked",
    name: "Dal Toor (Arhar Dal)",
    category: "Dal & Legumes",
    caloriesPer100g: 118, proteinPer100g: 7, carbsPer100g: 21, fatPer100g: 0.4,
    defaultQty: 200, quantityMode: "grams", emoji: "🫘",
  },
  {
    id: "dal-urad-cooked",
    name: "Dal Urad (Black Lentil)",
    category: "Dal & Legumes",
    caloriesPer100g: 131, proteinPer100g: 9, carbsPer100g: 23, fatPer100g: 0.5,
    defaultQty: 200, quantityMode: "grams", emoji: "🫘",
  },
  {
    id: "rajma-cooked",
    name: "Rajma (Kidney Beans)",
    category: "Dal & Legumes",
    caloriesPer100g: 127, proteinPer100g: 8.7, carbsPer100g: 22.8, fatPer100g: 0.5,
    defaultQty: 200, quantityMode: "grams", emoji: "🫘",
  },
  {
    id: "chole-cooked",
    name: "Chole (Chickpeas, cooked)",
    category: "Dal & Legumes",
    caloriesPer100g: 164, proteinPer100g: 8.9, carbsPer100g: 27, fatPer100g: 2.6,
    defaultQty: 200, quantityMode: "grams", emoji: "🫘",
  },
  {
    id: "black-beans",
    name: "Black Beans (cooked)",
    category: "Dal & Legumes",
    caloriesPer100g: 132, proteinPer100g: 8.9, carbsPer100g: 24, fatPer100g: 0.5,
    defaultQty: 150, quantityMode: "grams", emoji: "🫘",
  },
  {
    id: "soya-chunks-dry",
    name: "Soya Chunks (dry)",
    category: "Dal & Legumes",
    caloriesPer100g: 345, proteinPer100g: 52, carbsPer100g: 33, fatPer100g: 0.5,
    defaultQty: 30, quantityMode: "grams", emoji: "🫘",
  },

  // ═══════════════════════════════════════════════════════════
  // RICE & GRAINS
  // ═══════════════════════════════════════════════════════════
  {
    id: "basmati-rice-cooked",
    name: "Basmati Rice (cooked)",
    category: "Rice & Grains",
    caloriesPer100g: 130, proteinPer100g: 2.7, carbsPer100g: 28, fatPer100g: 0.3,
    defaultQty: 150, quantityMode: "grams", emoji: "🍚",
  },
  {
    id: "white-rice-cooked",
    name: "White Rice (cooked)",
    category: "Rice & Grains",
    caloriesPer100g: 130, proteinPer100g: 2.4, carbsPer100g: 28, fatPer100g: 0.2,
    defaultQty: 150, quantityMode: "grams", emoji: "🍚",
  },
  {
    id: "brown-rice-cooked",
    name: "Brown Rice (cooked)",
    category: "Rice & Grains",
    caloriesPer100g: 123, proteinPer100g: 2.7, carbsPer100g: 26, fatPer100g: 1,
    defaultQty: 150, quantityMode: "grams", emoji: "🍚",
  },
  {
    id: "oats-dry",
    name: "Oats / Rolled Oats (dry)",
    category: "Rice & Grains",
    caloriesPer100g: 389, proteinPer100g: 17, carbsPer100g: 66, fatPer100g: 7,
    defaultQty: 50, quantityMode: "grams", emoji: "🥣",
  },
  {
    id: "oats-cooked",
    name: "Oats / Porridge (cooked)",
    category: "Rice & Grains",
    caloriesPer100g: 71, proteinPer100g: 2.5, carbsPer100g: 12, fatPer100g: 1.5,
    defaultQty: 200, quantityMode: "grams", emoji: "🥣",
  },
  {
    id: "poha",
    name: "Poha (flattened rice, cooked)",
    category: "Rice & Grains",
    caloriesPer100g: 130, proteinPer100g: 2.1, carbsPer100g: 28, fatPer100g: 0.6,
    defaultQty: 150, quantityMode: "grams", emoji: "🍽️",
  },
  {
    id: "upma",
    name: "Upma (semolina, cooked)",
    category: "Rice & Grains",
    caloriesPer100g: 135, proteinPer100g: 4, carbsPer100g: 23, fatPer100g: 3,
    defaultQty: 200, quantityMode: "grams", emoji: "🍽️",
  },
  {
    id: "quinoa-cooked",
    name: "Quinoa (cooked)",
    category: "Rice & Grains",
    caloriesPer100g: 120, proteinPer100g: 4.4, carbsPer100g: 21.3, fatPer100g: 1.9,
    defaultQty: 150, quantityMode: "grams", emoji: "🌾",
  },
  {
    id: "daliya",
    name: "Daliya (broken wheat, cooked)",
    category: "Rice & Grains",
    caloriesPer100g: 83, proteinPer100g: 3, carbsPer100g: 17, fatPer100g: 0.5,
    defaultQty: 200, quantityMode: "grams", emoji: "🍽️",
  },
  {
    id: "semolina-suji",
    name: "Semolina / Suji (dry)",
    category: "Rice & Grains",
    caloriesPer100g: 360, proteinPer100g: 13, carbsPer100g: 73, fatPer100g: 1,
    defaultQty: 50, quantityMode: "grams", emoji: "🌾",
  },

  // ═══════════════════════════════════════════════════════════
  // BREAD & ROTI
  // ═══════════════════════════════════════════════════════════
  {
    id: "whole-wheat-roti",
    name: "Whole Wheat Roti",
    category: "Bread & Roti",
    caloriesPer100g: 297, proteinPer100g: 10, carbsPer100g: 56, fatPer100g: 4,
    defaultQty: 1, quantityMode: "piece", gramsPerPiece: 35, emoji: "🫓",
  },
  {
    id: "maida-roti",
    name: "Maida Roti / Phulka",
    category: "Bread & Roti",
    caloriesPer100g: 300, proteinPer100g: 9, carbsPer100g: 60, fatPer100g: 3,
    defaultQty: 2, quantityMode: "piece", gramsPerPiece: 35, emoji: "🫓",
  },
  {
    id: "paratha-plain",
    name: "Plain Paratha",
    category: "Bread & Roti",
    caloriesPer100g: 290, proteinPer100g: 7, carbsPer100g: 48, fatPer100g: 9,
    defaultQty: 1, quantityMode: "piece", gramsPerPiece: 80, emoji: "🫓",
  },
  {
    id: "paratha-aloo",
    name: "Aloo Paratha",
    category: "Bread & Roti",
    caloriesPer100g: 246, proteinPer100g: 6, carbsPer100g: 40, fatPer100g: 7,
    defaultQty: 1, quantityMode: "piece", gramsPerPiece: 100, emoji: "🫓",
  },
  {
    id: "naan",
    name: "Naan (butter)",
    category: "Bread & Roti",
    caloriesPer100g: 317, proteinPer100g: 9, carbsPer100g: 54, fatPer100g: 8,
    defaultQty: 1, quantityMode: "piece", gramsPerPiece: 90, emoji: "🫓",
  },
  {
    id: "puri",
    name: "Puri (deep fried)",
    category: "Bread & Roti",
    caloriesPer100g: 355, proteinPer100g: 7, carbsPer100g: 49, fatPer100g: 15,
    defaultQty: 2, quantityMode: "piece", gramsPerPiece: 30, emoji: "🫓",
  },
  {
    id: "bread-white",
    name: "White Bread (slice)",
    category: "Bread & Roti",
    caloriesPer100g: 265, proteinPer100g: 9, carbsPer100g: 49, fatPer100g: 3.2,
    defaultQty: 2, quantityMode: "piece", gramsPerPiece: 25, emoji: "🍞",
  },
  {
    id: "bread-brown",
    name: "Brown/Multigrain Bread (slice)",
    category: "Bread & Roti",
    caloriesPer100g: 243, proteinPer100g: 10, carbsPer100g: 44, fatPer100g: 3.5,
    defaultQty: 2, quantityMode: "piece", gramsPerPiece: 25, emoji: "🍞",
  },

  // ═══════════════════════════════════════════════════════════
  // EGGS & DAIRY
  // ═══════════════════════════════════════════════════════════
  {
    id: "whole-egg",
    name: "Whole Egg (boiled/poached)",
    category: "Eggs & Dairy",
    caloriesPer100g: 155, proteinPer100g: 13, carbsPer100g: 1.1, fatPer100g: 11,
    defaultQty: 2, quantityMode: "piece", gramsPerPiece: 55, emoji: "🥚",
  },
  {
    id: "egg-white",
    name: "Egg White (raw/cooked)",
    category: "Eggs & Dairy",
    caloriesPer100g: 52, proteinPer100g: 11, carbsPer100g: 0.7, fatPer100g: 0.2,
    defaultQty: 3, quantityMode: "piece", gramsPerPiece: 30, emoji: "🥚",
  },
  {
    id: "omelette",
    name: "Omelette (1 egg + oil)",
    category: "Eggs & Dairy",
    caloriesPer100g: 175, proteinPer100g: 12, carbsPer100g: 1, fatPer100g: 13,
    defaultQty: 2, quantityMode: "piece", gramsPerPiece: 60, emoji: "🍳",
  },
  {
    id: "paneer",
    name: "Paneer (raw)",
    category: "Eggs & Dairy",
    caloriesPer100g: 265, proteinPer100g: 18, carbsPer100g: 1.2, fatPer100g: 20,
    defaultQty: 100, quantityMode: "grams", emoji: "🧀",
  },
  {
    id: "milk-whole",
    name: "Whole Milk",
    category: "Eggs & Dairy",
    caloriesPer100g: 61, proteinPer100g: 3.2, carbsPer100g: 4.8, fatPer100g: 3.3,
    defaultQty: 250, quantityMode: "ml", emoji: "🥛",
  },
  {
    id: "milk-toned",
    name: "Toned Milk (1.5% fat)",
    category: "Eggs & Dairy",
    caloriesPer100g: 44, proteinPer100g: 3.4, carbsPer100g: 5, fatPer100g: 1.5,
    defaultQty: 250, quantityMode: "ml", emoji: "🥛",
  },
  {
    id: "curd-dahi",
    name: "Curd / Dahi (full fat)",
    category: "Eggs & Dairy",
    caloriesPer100g: 98, proteinPer100g: 3.5, carbsPer100g: 3.4, fatPer100g: 4,
    defaultQty: 150, quantityMode: "grams", emoji: "🥣",
  },
  {
    id: "greek-yogurt",
    name: "Greek Yogurt",
    category: "Eggs & Dairy",
    caloriesPer100g: 97, proteinPer100g: 9, carbsPer100g: 4, fatPer100g: 5,
    defaultQty: 150, quantityMode: "grams", emoji: "🥣",
  },
  {
    id: "cottage-cheese-low-fat",
    name: "Low-fat Cottage Cheese",
    category: "Eggs & Dairy",
    caloriesPer100g: 72, proteinPer100g: 12.5, carbsPer100g: 2.7, fatPer100g: 1,
    defaultQty: 100, quantityMode: "grams", emoji: "🧀",
  },
  {
    id: "whey-protein",
    name: "Whey Protein (1 scoop ~30g)",
    category: "Eggs & Dairy",
    caloriesPer100g: 380, proteinPer100g: 80, carbsPer100g: 8, fatPer100g: 3,
    defaultQty: 30, quantityMode: "grams", emoji: "💪",
  },
  {
    id: "ghee",
    name: "Ghee / Clarified Butter",
    category: "Eggs & Dairy",
    caloriesPer100g: 900, proteinPer100g: 0, carbsPer100g: 0, fatPer100g: 100,
    defaultQty: 10, quantityMode: "grams", emoji: "🧈",
  },
  {
    id: "butter",
    name: "Butter",
    category: "Eggs & Dairy",
    caloriesPer100g: 717, proteinPer100g: 0.9, carbsPer100g: 0.1, fatPer100g: 81,
    defaultQty: 10, quantityMode: "grams", emoji: "🧈",
  },

  // ═══════════════════════════════════════════════════════════
  // CHICKEN & MEAT
  // ═══════════════════════════════════════════════════════════
  {
    id: "chicken-breast-cooked",
    name: "Chicken Breast (cooked)",
    category: "Chicken & Meat",
    caloriesPer100g: 165, proteinPer100g: 31, carbsPer100g: 0, fatPer100g: 3.6,
    defaultQty: 150, quantityMode: "grams", emoji: "🍗",
  },
  {
    id: "chicken-leg-cooked",
    name: "Chicken Leg (cooked)",
    category: "Chicken & Meat",
    caloriesPer100g: 215, proteinPer100g: 23, carbsPer100g: 0, fatPer100g: 13,
    defaultQty: 1, quantityMode: "piece", gramsPerPiece: 100, emoji: "🍗",
  },
  {
    id: "chicken-thigh-cooked",
    name: "Chicken Thigh (cooked)",
    category: "Chicken & Meat",
    caloriesPer100g: 209, proteinPer100g: 26, carbsPer100g: 0, fatPer100g: 11,
    defaultQty: 100, quantityMode: "grams", emoji: "🍗",
  },
  {
    id: "mutton-cooked",
    name: "Mutton / Lamb (cooked)",
    category: "Chicken & Meat",
    caloriesPer100g: 258, proteinPer100g: 25, carbsPer100g: 0, fatPer100g: 17,
    defaultQty: 150, quantityMode: "grams", emoji: "🥩",
  },
  {
    id: "beef-lean",
    name: "Lean Beef (cooked)",
    category: "Chicken & Meat",
    caloriesPer100g: 250, proteinPer100g: 26, carbsPer100g: 0, fatPer100g: 15,
    defaultQty: 150, quantityMode: "grams", emoji: "🥩",
  },
  {
    id: "egg-bhurji",
    name: "Egg Bhurji (2 eggs + oil)",
    category: "Chicken & Meat",
    caloriesPer100g: 185, proteinPer100g: 11, carbsPer100g: 2, fatPer100g: 14,
    defaultQty: 150, quantityMode: "grams", emoji: "🍳",
  },

  // ═══════════════════════════════════════════════════════════
  // FISH & SEAFOOD
  // ═══════════════════════════════════════════════════════════
  {
    id: "salmon-cooked",
    name: "Salmon (cooked)",
    category: "Fish & Seafood",
    caloriesPer100g: 208, proteinPer100g: 20, carbsPer100g: 0, fatPer100g: 13,
    defaultQty: 150, quantityMode: "grams", emoji: "🐟",
  },
  {
    id: "tuna-canned",
    name: "Tuna (canned in water)",
    category: "Fish & Seafood",
    caloriesPer100g: 116, proteinPer100g: 26, carbsPer100g: 0, fatPer100g: 1,
    defaultQty: 100, quantityMode: "grams", emoji: "🐟",
  },
  {
    id: "rohu-fish",
    name: "Rohu Fish (cooked)",
    category: "Fish & Seafood",
    caloriesPer100g: 147, proteinPer100g: 20, carbsPer100g: 0, fatPer100g: 7,
    defaultQty: 150, quantityMode: "grams", emoji: "🐟",
  },
  {
    id: "pomfret",
    name: "Pomfret (cooked)",
    category: "Fish & Seafood",
    caloriesPer100g: 130, proteinPer100g: 21, carbsPer100g: 0, fatPer100g: 5,
    defaultQty: 150, quantityMode: "grams", emoji: "🐟",
  },
  {
    id: "prawns-cooked",
    name: "Prawns / Shrimp (cooked)",
    category: "Fish & Seafood",
    caloriesPer100g: 99, proteinPer100g: 24, carbsPer100g: 0.2, fatPer100g: 0.3,
    defaultQty: 100, quantityMode: "grams", emoji: "🦐",
  },

  // ═══════════════════════════════════════════════════════════
  // VEGETABLES
  // ═══════════════════════════════════════════════════════════
  {
    id: "potato-boiled",
    name: "Potato (boiled)",
    category: "Vegetables",
    caloriesPer100g: 87, proteinPer100g: 1.9, carbsPer100g: 20, fatPer100g: 0.1,
    defaultQty: 150, quantityMode: "grams", emoji: "🥔",
  },
  {
    id: "sweet-potato",
    name: "Sweet Potato (boiled)",
    category: "Vegetables",
    caloriesPer100g: 86, proteinPer100g: 1.6, carbsPer100g: 20, fatPer100g: 0.1,
    defaultQty: 150, quantityMode: "grams", emoji: "🍠",
  },
  {
    id: "spinach",
    name: "Spinach / Palak (cooked)",
    category: "Vegetables",
    caloriesPer100g: 23, proteinPer100g: 2.9, carbsPer100g: 3.6, fatPer100g: 0.4,
    defaultQty: 100, quantityMode: "grams", emoji: "🥬",
  },
  {
    id: "broccoli",
    name: "Broccoli (cooked)",
    category: "Vegetables",
    caloriesPer100g: 35, proteinPer100g: 2.4, carbsPer100g: 7, fatPer100g: 0.4,
    defaultQty: 150, quantityMode: "grams", emoji: "🥦",
  },
  {
    id: "onion",
    name: "Onion (raw)",
    category: "Vegetables",
    caloriesPer100g: 40, proteinPer100g: 1.1, carbsPer100g: 9.3, fatPer100g: 0.1,
    defaultQty: 50, quantityMode: "grams", emoji: "🧅",
  },
  {
    id: "tomato",
    name: "Tomato (raw)",
    category: "Vegetables",
    caloriesPer100g: 18, proteinPer100g: 0.9, carbsPer100g: 3.9, fatPer100g: 0.2,
    defaultQty: 100, quantityMode: "grams", emoji: "🍅",
  },
  {
    id: "cucumber",
    name: "Cucumber (raw)",
    category: "Vegetables",
    caloriesPer100g: 16, proteinPer100g: 0.7, carbsPer100g: 3.6, fatPer100g: 0.1,
    defaultQty: 100, quantityMode: "grams", emoji: "🥒",
  },
  {
    id: "carrot",
    name: "Carrot (raw)",
    category: "Vegetables",
    caloriesPer100g: 41, proteinPer100g: 0.9, carbsPer100g: 10, fatPer100g: 0.2,
    defaultQty: 100, quantityMode: "grams", emoji: "🥕",
  },
  {
    id: "capsicum",
    name: "Capsicum / Bell Pepper",
    category: "Vegetables",
    caloriesPer100g: 31, proteinPer100g: 1, carbsPer100g: 6, fatPer100g: 0.3,
    defaultQty: 100, quantityMode: "grams", emoji: "🫑",
  },
  {
    id: "cauliflower",
    name: "Cauliflower (cooked)",
    category: "Vegetables",
    caloriesPer100g: 25, proteinPer100g: 1.9, carbsPer100g: 5, fatPer100g: 0.3,
    defaultQty: 150, quantityMode: "grams", emoji: "🥦",
  },
  {
    id: "peas",
    name: "Green Peas (cooked)",
    category: "Vegetables",
    caloriesPer100g: 84, proteinPer100g: 5.4, carbsPer100g: 15.6, fatPer100g: 0.4,
    defaultQty: 100, quantityMode: "grams", emoji: "🫛",
  },
  {
    id: "corn",
    name: "Sweet Corn (boiled)",
    category: "Vegetables",
    caloriesPer100g: 96, proteinPer100g: 3.4, carbsPer100g: 21, fatPer100g: 1.5,
    defaultQty: 100, quantityMode: "grams", emoji: "🌽",
  },

  // ─── More Vegetables (IFCT 2017, raw per 100g) ──────────────────────────
  { id: "potato-raw", name: "Potato (Raw)", category: "Vegetables", caloriesPer100g: 74, proteinPer100g: 1.9, carbsPer100g: 17.5, fatPer100g: 0.1, defaultQty: 150, quantityMode: "grams", emoji: "🥔" },
  { id: "sweet-potato-raw", name: "Sweet Potato (Raw)", category: "Vegetables", caloriesPer100g: 120, proteinPer100g: 1.6, carbsPer100g: 28, fatPer100g: 0.1, defaultQty: 150, quantityMode: "grams", emoji: "🍠" },
  { id: "yam", name: "Yam / Jimikand (Raw)", category: "Vegetables", caloriesPer100g: 118, proteinPer100g: 1.5, carbsPer100g: 28, fatPer100g: 0.2, defaultQty: 150, quantityMode: "grams", emoji: "🥔" },
  { id: "taro-root", name: "Taro Root / Arbi (Raw)", category: "Vegetables", caloriesPer100g: 112, proteinPer100g: 1.5, carbsPer100g: 26, fatPer100g: 0.2, defaultQty: 150, quantityMode: "grams", emoji: "🥔" },
  { id: "beetroot-raw", name: "Beetroot (Raw)", category: "Vegetables", caloriesPer100g: 43, proteinPer100g: 1.6, carbsPer100g: 10, fatPer100g: 0.2, defaultQty: 100, quantityMode: "grams", emoji: "🫒" },
  { id: "carrot-raw", name: "Carrot / Desi Gajar (Raw)", category: "Vegetables", caloriesPer100g: 41, proteinPer100g: 0.9, carbsPer100g: 10, fatPer100g: 0.2, defaultQty: 100, quantityMode: "grams", emoji: "🥕" },
  { id: "radish-raw", name: "Radish / Mooli (Raw)", category: "Vegetables", caloriesPer100g: 16, proteinPer100g: 0.7, carbsPer100g: 3.4, fatPer100g: 0.1, defaultQty: 100, quantityMode: "grams", emoji: "🥬" },
  { id: "turnip", name: "Turnip / Shalgam (Raw)", category: "Vegetables", caloriesPer100g: 28, proteinPer100g: 0.9, carbsPer100g: 6.4, fatPer100g: 0.1, defaultQty: 100, quantityMode: "grams", emoji: "🍠" },
  { id: "drumstick", name: "Drumstick / Sahjan", category: "Vegetables", caloriesPer100g: 37, proteinPer100g: 2.1, carbsPer100g: 8.5, fatPer100g: 0.2, defaultQty: 100, quantityMode: "grams", emoji: "🌿" },
  { id: "jackfruit-raw", name: "Raw Jackfruit / Kathal", category: "Vegetables", caloriesPer100g: 95, proteinPer100g: 2.5, carbsPer100g: 23, fatPer100g: 0.3, defaultQty: 150, quantityMode: "grams", emoji: "🍈" },
  { id: "bottle-gourd", name: "Bottle Gourd / Lauki", category: "Vegetables", caloriesPer100g: 14, proteinPer100g: 0.6, carbsPer100g: 3.4, fatPer100g: 0.1, defaultQty: 150, quantityMode: "grams", emoji: "🥒" },
  { id: "bitter-gourd", name: "Bitter Gourd / Karela", category: "Vegetables", caloriesPer100g: 17, proteinPer100g: 1, carbsPer100g: 3.7, fatPer100g: 0.2, defaultQty: 100, quantityMode: "grams", emoji: "🥒" },
  { id: "ridge-gourd", name: "Ridge Gourd / Tori", category: "Vegetables", caloriesPer100g: 18, proteinPer100g: 0.5, carbsPer100g: 4, fatPer100g: 0.1, defaultQty: 150, quantityMode: "grams", emoji: "🥒" },
  { id: "ash-gourd", name: "Ash Gourd / Petha", category: "Vegetables", caloriesPer100g: 13, proteinPer100g: 0.4, carbsPer100g: 3, fatPer100g: 0.1, defaultQty: 150, quantityMode: "grams", emoji: "🍈" },
  { id: "ivy-gourd", name: "Ivy Gourd / Tindora", category: "Vegetables", caloriesPer100g: 24, proteinPer100g: 1.2, carbsPer100g: 4.5, fatPer100g: 0.2, defaultQty: 100, quantityMode: "grams", emoji: "🥒" },
  { id: "snake-gourd", name: "Snake Gourd / Chichinda", category: "Vegetables", caloriesPer100g: 18, proteinPer100g: 0.6, carbsPer100g: 3.8, fatPer100g: 0.1, defaultQty: 150, quantityMode: "grams", emoji: "🥒" },
  { id: "pointed-gourd", name: "Pointed Gourd / Parwal", category: "Vegetables", caloriesPer100g: 20, proteinPer100g: 2, carbsPer100g: 3.1, fatPer100g: 0.3, defaultQty: 100, quantityMode: "grams", emoji: "🥒" },
  { id: "pumpkin", name: "Pumpkin / Kaddu", category: "Vegetables", caloriesPer100g: 26, proteinPer100g: 1, carbsPer100g: 6.5, fatPer100g: 0.1, defaultQty: 150, quantityMode: "grams", emoji: "🎃" },
  { id: "brinjal", name: "Brinjal / Baingan (Raw)", category: "Vegetables", caloriesPer100g: 25, proteinPer100g: 1, carbsPer100g: 5.9, fatPer100g: 0.2, defaultQty: 150, quantityMode: "grams", emoji: "🍆" },
  { id: "okra-raw", name: "Okra / Bhindi (Raw)", category: "Vegetables", caloriesPer100g: 33, proteinPer100g: 1.9, carbsPer100g: 7.5, fatPer100g: 0.2, defaultQty: 100, quantityMode: "grams", emoji: "🌿" },
  { id: "french-beans", name: "French Beans (Raw)", category: "Vegetables", caloriesPer100g: 31, proteinPer100g: 1.8, carbsPer100g: 7.1, fatPer100g: 0.2, defaultQty: 100, quantityMode: "grams", emoji: "🌱" },
  { id: "cluster-beans", name: "Cluster Beans / Gavar", category: "Vegetables", caloriesPer100g: 28, proteinPer100g: 2.5, carbsPer100g: 5, fatPer100g: 0.3, defaultQty: 100, quantityMode: "grams", emoji: "🌿" },
  { id: "broad-beans", name: "Broad Beans / Sem", category: "Vegetables", caloriesPer100g: 48, proteinPer100g: 5, carbsPer100g: 8, fatPer100g: 0.5, defaultQty: 100, quantityMode: "grams", emoji: "🫛" },
  { id: "peas-raw", name: "Green Peas / Matar (Raw)", category: "Vegetables", caloriesPer100g: 81, proteinPer100g: 5.4, carbsPer100g: 14.5, fatPer100g: 0.4, defaultQty: 100, quantityMode: "grams", emoji: "🫛" },
  { id: "corn-raw", name: "Sweet Corn (Raw)", category: "Vegetables", caloriesPer100g: 86, proteinPer100g: 3.3, carbsPer100g: 19, fatPer100g: 1.2, defaultQty: 100, quantityMode: "grams", emoji: "🌽" },
  { id: "cauliflower-raw", name: "Cauliflower / Phool Gobi (Raw)", category: "Vegetables", caloriesPer100g: 25, proteinPer100g: 1.9, carbsPer100g: 5, fatPer100g: 0.3, defaultQty: 150, quantityMode: "grams", emoji: "🥦" },
  { id: "cabbage-raw", name: "Cabbage / Patta Gobi (Raw)", category: "Vegetables", caloriesPer100g: 25, proteinPer100g: 1.3, carbsPer100g: 5.8, fatPer100g: 0.1, defaultQty: 150, quantityMode: "grams", emoji: "🥬" },
  { id: "broccoli-raw", name: "Broccoli (Raw)", category: "Vegetables", caloriesPer100g: 34, proteinPer100g: 2.8, carbsPer100g: 6.6, fatPer100g: 0.4, defaultQty: 150, quantityMode: "grams", emoji: "🥦" },
  { id: "fenugreek-leaves", name: "Fenugreek Leaves / Methi", category: "Vegetables", caloriesPer100g: 23, proteinPer100g: 2.3, carbsPer100g: 4.4, fatPer100g: 0.3, defaultQty: 100, quantityMode: "grams", emoji: "🌿" },
  { id: "amaranth-leaves", name: "Amaranth Leaves / Chaulai", category: "Vegetables", caloriesPer100g: 23, proteinPer100g: 2.5, carbsPer100g: 4, fatPer100g: 0.3, defaultQty: 100, quantityMode: "grams", emoji: "🌿" },
  { id: "mustard-leaves", name: "Mustard Leaves / Sarson", category: "Vegetables", caloriesPer100g: 27, proteinPer100g: 2.7, carbsPer100g: 4.9, fatPer100g: 0.4, defaultQty: 100, quantityMode: "grams", emoji: "🌿" },
  { id: "bathua", name: "Bathua (Pigweed Leaves)", category: "Vegetables", caloriesPer100g: 30, proteinPer100g: 3.2, carbsPer100g: 5.4, fatPer100g: 0.4, defaultQty: 100, quantityMode: "grams", emoji: "🌿" },
  { id: "coriander-leaves", name: "Coriander Leaves / Dhania", category: "Vegetables", caloriesPer100g: 23, proteinPer100g: 2.1, carbsPer100g: 3.7, fatPer100g: 0.5, defaultQty: 30, quantityMode: "grams", emoji: "🌿" },
  { id: "curry-leaves", name: "Curry Leaves / Kadi Patta", category: "Vegetables", caloriesPer100g: 108, proteinPer100g: 6.1, carbsPer100g: 18.7, fatPer100g: 1.8, defaultQty: 10, quantityMode: "grams", emoji: "🌿" },
  { id: "green-chili", name: "Green Chili (Raw)", category: "Vegetables", caloriesPer100g: 40, proteinPer100g: 2, carbsPer100g: 9.5, fatPer100g: 0.2, defaultQty: 10, quantityMode: "grams", emoji: "🌶️" },
  { id: "bell-pepper-red", name: "Red Bell Pepper", category: "Vegetables", caloriesPer100g: 31, proteinPer100g: 1, carbsPer100g: 6, fatPer100g: 0.3, defaultQty: 100, quantityMode: "grams", emoji: "🫑" },
  { id: "bell-pepper-yellow", name: "Yellow Bell Pepper", category: "Vegetables", caloriesPer100g: 27, proteinPer100g: 1, carbsPer100g: 5.2, fatPer100g: 0.3, defaultQty: 100, quantityMode: "grams", emoji: "🫑" },
  { id: "spring-onion", name: "Spring Onion / Hara Pyaz", category: "Vegetables", caloriesPer100g: 32, proteinPer100g: 1.8, carbsPer100g: 7.3, fatPer100g: 0.2, defaultQty: 50, quantityMode: "grams", emoji: "🧅" },
  { id: "garlic-raw", name: "Garlic / Lehsun (Raw)", category: "Vegetables", caloriesPer100g: 149, proteinPer100g: 6.4, carbsPer100g: 33, fatPer100g: 0.5, defaultQty: 10, quantityMode: "grams", emoji: "🧄" },
  { id: "ginger-raw", name: "Ginger / Adrak (Raw)", category: "Vegetables", caloriesPer100g: 80, proteinPer100g: 1.8, carbsPer100g: 17.8, fatPer100g: 0.8, defaultQty: 10, quantityMode: "grams", emoji: "🫚" },
  { id: "mushroom-white", name: "White Button Mushroom", category: "Vegetables", caloriesPer100g: 22, proteinPer100g: 3.1, carbsPer100g: 3.3, fatPer100g: 0.3, defaultQty: 100, quantityMode: "grams", emoji: "🍄" },
  { id: "zucchini", name: "Zucchini (Raw)", category: "Vegetables", caloriesPer100g: 17, proteinPer100g: 1.2, carbsPer100g: 3.1, fatPer100g: 0.3, defaultQty: 150, quantityMode: "grams", emoji: "🥒" },
  { id: "raw-banana", name: "Raw Banana / Kacha Kela", category: "Vegetables", caloriesPer100g: 89, proteinPer100g: 1.1, carbsPer100g: 23, fatPer100g: 0.3, defaultQty: 100, quantityMode: "grams", emoji: "🍌" },
  { id: "raw-papaya", name: "Raw Papaya", category: "Vegetables", caloriesPer100g: 43, proteinPer100g: 0.5, carbsPer100g: 11, fatPer100g: 0.3, defaultQty: 100, quantityMode: "grams", emoji: "🍈" },
  { id: "elephant-foot-yam", name: "Elephant Foot Yam / Jimikand", category: "Vegetables", caloriesPer100g: 120, proteinPer100g: 2, carbsPer100g: 27, fatPer100g: 0.5, defaultQty: 150, quantityMode: "grams", emoji: "🥔" },

  // ═══════════════════════════════════════════════════════════
  // FRUITS (additional, IFCT 2017)
  // ═══════════════════════════════════════════════════════════
  {
    id: "banana",
    name: "Banana",
    category: "Fruits",
    caloriesPer100g: 89, proteinPer100g: 1.1, carbsPer100g: 23, fatPer100g: 0.3,
    defaultQty: 1, quantityMode: "piece", gramsPerPiece: 120, emoji: "🍌",
  },
  {
    id: "apple",
    name: "Apple",
    category: "Fruits",
    caloriesPer100g: 52, proteinPer100g: 0.3, carbsPer100g: 14, fatPer100g: 0.2,
    defaultQty: 1, quantityMode: "piece", gramsPerPiece: 180, emoji: "🍎",
  },
  {
    id: "mango",
    name: "Mango (Alphonso / Kesar)",
    category: "Fruits",
    caloriesPer100g: 60, proteinPer100g: 0.8, carbsPer100g: 15, fatPer100g: 0.4,
    defaultQty: 150, quantityMode: "grams", emoji: "🥭",
  },
  {
    id: "orange",
    name: "Orange",
    category: "Fruits",
    caloriesPer100g: 47, proteinPer100g: 0.9, carbsPer100g: 12, fatPer100g: 0.1,
    defaultQty: 1, quantityMode: "piece", gramsPerPiece: 150, emoji: "🍊",
  },
  {
    id: "grapes",
    name: "Grapes",
    category: "Fruits",
    caloriesPer100g: 67, proteinPer100g: 0.6, carbsPer100g: 17, fatPer100g: 0.4,
    defaultQty: 100, quantityMode: "grams", emoji: "🍇",
  },
  {
    id: "watermelon",
    name: "Watermelon",
    category: "Fruits",
    caloriesPer100g: 30, proteinPer100g: 0.6, carbsPer100g: 7.6, fatPer100g: 0.2,
    defaultQty: 200, quantityMode: "grams", emoji: "🍉",
  },
  {
    id: "papaya",
    name: "Papaya",
    category: "Fruits",
    caloriesPer100g: 43, proteinPer100g: 0.5, carbsPer100g: 11, fatPer100g: 0.3,
    defaultQty: 200, quantityMode: "grams", emoji: "🍈",
  },
  {
    id: "pomegranate",
    name: "Pomegranate (seeds)",
    category: "Fruits",
    caloriesPer100g: 83, proteinPer100g: 1.7, carbsPer100g: 19, fatPer100g: 1.2,
    defaultQty: 100, quantityMode: "grams", emoji: "🍎",
  },
  {
    id: "guava",
    name: "Guava",
    category: "Fruits",
    caloriesPer100g: 68, proteinPer100g: 2.6, carbsPer100g: 14, fatPer100g: 1,
    defaultQty: 1, quantityMode: "piece", gramsPerPiece: 120, emoji: "🍈",
  },
  {
    id: "pear",
    name: "Pear",
    category: "Fruits",
    caloriesPer100g: 57, proteinPer100g: 0.4, carbsPer100g: 15, fatPer100g: 0.1,
    defaultQty: 1, quantityMode: "piece", gramsPerPiece: 180, emoji: "🍐",
  },
  {
    id: "strawberry",
    name: "Strawberries",
    category: "Fruits",
    caloriesPer100g: 32, proteinPer100g: 0.7, carbsPer100g: 7.7, fatPer100g: 0.3,
    defaultQty: 100, quantityMode: "grams", emoji: "🍓",
  },

  // ─── More Fruits (IFCT 2017) ────────────────────────────────────────────
  { id: "mango-alphonso", name: "Mango (Alphonso)", category: "Fruits", caloriesPer100g: 60, proteinPer100g: 0.8, carbsPer100g: 15, fatPer100g: 0.4, defaultQty: 150, quantityMode: "grams", emoji: "🥭" },
  { id: "mango-langda", name: "Mango (Langda)", category: "Fruits", caloriesPer100g: 62, proteinPer100g: 0.9, carbsPer100g: 15.5, fatPer100g: 0.4, defaultQty: 150, quantityMode: "grams", emoji: "🥭" },
  { id: "mango-dussehri", name: "Mango (Dussehri)", category: "Fruits", caloriesPer100g: 58, proteinPer100g: 0.8, carbsPer100g: 14.5, fatPer100g: 0.3, defaultQty: 150, quantityMode: "grams", emoji: "🥭" },
  { id: "chikoo", name: "Chikoo / Sapota", category: "Fruits", caloriesPer100g: 83, proteinPer100g: 0.4, carbsPer100g: 20, fatPer100g: 1.1, defaultQty: 100, quantityMode: "grams", emoji: "🟤" },
  { id: "custard-apple", name: "Custard Apple / Sitaphal", category: "Fruits", caloriesPer100g: 94, proteinPer100g: 2.1, carbsPer100g: 23, fatPer100g: 0.3, defaultQty: 150, quantityMode: "grams", emoji: "🍏" },
  { id: "pineapple", name: "Pineapple", category: "Fruits", caloriesPer100g: 50, proteinPer100g: 0.5, carbsPer100g: 13, fatPer100g: 0.1, defaultQty: 150, quantityMode: "grams", emoji: "🍍" },
  { id: "litchi", name: "Litchi", category: "Fruits", caloriesPer100g: 66, proteinPer100g: 0.8, carbsPer100g: 16.5, fatPer100g: 0.4, defaultQty: 100, quantityMode: "grams", emoji: "🟤" },
  { id: "jamun", name: "Jamun / Java Plum", category: "Fruits", caloriesPer100g: 62, proteinPer100g: 0.7, carbsPer100g: 14, fatPer100g: 0.3, defaultQty: 100, quantityMode: "grams", emoji: "🫐" },
  { id: "ber", name: "Ber / Indian Jujube", category: "Fruits", caloriesPer100g: 79, proteinPer100g: 1.2, carbsPer100g: 18.5, fatPer100g: 0.5, defaultQty: 100, quantityMode: "grams", emoji: "🍏" },
  { id: "muskmelon", name: "Muskmelon / Kharbooja", category: "Fruits", caloriesPer100g: 34, proteinPer100g: 0.8, carbsPer100g: 8.2, fatPer100g: 0.2, defaultQty: 200, quantityMode: "grams", emoji: "🍈" },
  { id: "kiwi", name: "Kiwi", category: "Fruits", caloriesPer100g: 61, proteinPer100g: 1.1, carbsPer100g: 14.7, fatPer100g: 0.5, defaultQty: 1, quantityMode: "piece", gramsPerPiece: 75, emoji: "🥝" },
  { id: "dragon-fruit", name: "Dragon Fruit", category: "Fruits", caloriesPer100g: 60, proteinPer100g: 1.2, carbsPer100g: 13, fatPer100g: 0.4, defaultQty: 150, quantityMode: "grams", emoji: "🐉" },
  { id: "peach", name: "Peach / Aadu", category: "Fruits", caloriesPer100g: 39, proteinPer100g: 0.9, carbsPer100g: 9.5, fatPer100g: 0.3, defaultQty: 1, quantityMode: "piece", gramsPerPiece: 150, emoji: "🍑" },
  { id: "plum", name: "Plum / Aloo Bukhara", category: "Fruits", caloriesPer100g: 46, proteinPer100g: 0.7, carbsPer100g: 11.4, fatPer100g: 0.3, defaultQty: 1, quantityMode: "piece", gramsPerPiece: 65, emoji: "🟣" },
  { id: "apricot", name: "Apricot / Khubani", category: "Fruits", caloriesPer100g: 48, proteinPer100g: 1.4, carbsPer100g: 11.1, fatPer100g: 0.4, defaultQty: 1, quantityMode: "piece", gramsPerPiece: 35, emoji: "🟠" },
  { id: "cherry", name: "Cherry", category: "Fruits", caloriesPer100g: 63, proteinPer100g: 1.1, carbsPer100g: 16, fatPer100g: 0.2, defaultQty: 100, quantityMode: "grams", emoji: "🍒" },
  { id: "blueberry", name: "Blueberry", category: "Fruits", caloriesPer100g: 57, proteinPer100g: 0.7, carbsPer100g: 14.5, fatPer100g: 0.3, defaultQty: 100, quantityMode: "grams", emoji: "🫐" },
  { id: "raspberry", name: "Raspberry", category: "Fruits", caloriesPer100g: 52, proteinPer100g: 1.2, carbsPer100g: 12, fatPer100g: 0.7, defaultQty: 100, quantityMode: "grams", emoji: "🫐" },
  { id: "blackberry", name: "Blackberry", category: "Fruits", caloriesPer100g: 43, proteinPer100g: 1.4, carbsPer100g: 9.6, fatPer100g: 0.5, defaultQty: 100, quantityMode: "grams", emoji: "🫐" },
  { id: "amla", name: "Amla / Indian Gooseberry", category: "Fruits", caloriesPer100g: 44, proteinPer100g: 0.5, carbsPer100g: 10, fatPer100g: 0.2, defaultQty: 2, quantityMode: "piece", gramsPerPiece: 30, emoji: "🟢" },
  { id: "star-fruit", name: "Star Fruit / Kamrakh", category: "Fruits", caloriesPer100g: 31, proteinPer100g: 1, carbsPer100g: 6.7, fatPer100g: 0.3, defaultQty: 1, quantityMode: "piece", gramsPerPiece: 100, emoji: "⭐" },
  { id: "passion-fruit", name: "Passion Fruit", category: "Fruits", caloriesPer100g: 97, proteinPer100g: 2.2, carbsPer100g: 23, fatPer100g: 0.7, defaultQty: 2, quantityMode: "piece", gramsPerPiece: 50, emoji: "🟣" },
  { id: "fig-fresh", name: "Fig / Anjeer (Fresh)", category: "Fruits", caloriesPer100g: 74, proteinPer100g: 0.8, carbsPer100g: 19, fatPer100g: 0.3, defaultQty: 2, quantityMode: "piece", gramsPerPiece: 50, emoji: "🟤" },
  { id: "tender-coconut", name: "Tender Coconut Malai", category: "Fruits", caloriesPer100g: 150, proteinPer100g: 2, carbsPer100g: 8, fatPer100g: 13, defaultQty: 50, quantityMode: "grams", emoji: "🥥" },
  { id: "sugarcane-juice", name: "Sugarcane Juice", category: "Beverages", caloriesPer100g: 73, proteinPer100g: 0.2, carbsPer100g: 18, fatPer100g: 0.1, defaultQty: 300, quantityMode: "ml", emoji: "🎋" },
  { id: "sweet-lime", name: "Sweet Lime / Mosambi", category: "Fruits", caloriesPer100g: 43, proteinPer100g: 0.7, carbsPer100g: 9.3, fatPer100g: 0.2, defaultQty: 1, quantityMode: "piece", gramsPerPiece: 150, emoji: "🍊" },

  // ─── Dry Fruits & Nuts (IFCT 2017) ──────────────────────────────────────
  { id: "dates-dried", name: "Dates / Khajoor (Dried)", category: "Healthy & Fitness", caloriesPer100g: 282, proteinPer100g: 2.5, carbsPer100g: 75, fatPer100g: 0.4, defaultQty: 30, quantityMode: "grams", emoji: "🟤" },
  { id: "dried-fig", name: "Dried Fig / Anjeer", category: "Healthy & Fitness", caloriesPer100g: 249, proteinPer100g: 3.3, carbsPer100g: 64, fatPer100g: 0.9, defaultQty: 30, quantityMode: "grams", emoji: "🟤" },
  { id: "raisins", name: "Raisins / Kishmish", category: "Healthy & Fitness", caloriesPer100g: 299, proteinPer100g: 3, carbsPer100g: 79, fatPer100g: 0.5, defaultQty: 30, quantityMode: "grams", emoji: "🍇" },
  { id: "dried-apricot", name: "Dried Apricot", category: "Healthy & Fitness", caloriesPer100g: 241, proteinPer100g: 3.4, carbsPer100g: 62, fatPer100g: 0.5, defaultQty: 30, quantityMode: "grams", emoji: "🟠" },
  { id: "prunes", name: "Prunes", category: "Healthy & Fitness", caloriesPer100g: 240, proteinPer100g: 2.2, carbsPer100g: 63, fatPer100g: 0.4, defaultQty: 30, quantityMode: "grams", emoji: "🟤" },
  { id: "pistachio", name: "Pistachio / Pista", category: "Healthy & Fitness", caloriesPer100g: 560, proteinPer100g: 20, carbsPer100g: 28, fatPer100g: 45, defaultQty: 28, quantityMode: "grams", emoji: "💚" },
  { id: "pine-nuts", name: "Pine Nuts / Chilgoza", category: "Healthy & Fitness", caloriesPer100g: 673, proteinPer100g: 13.7, carbsPer100g: 13, fatPer100g: 68, defaultQty: 15, quantityMode: "grams", emoji: "🌰" },
  { id: "macadamia", name: "Macadamia Nuts", category: "Healthy & Fitness", caloriesPer100g: 718, proteinPer100g: 8, carbsPer100g: 14, fatPer100g: 76, defaultQty: 28, quantityMode: "grams", emoji: "🌰" },
  { id: "hazelnuts", name: "Hazelnuts", category: "Healthy & Fitness", caloriesPer100g: 628, proteinPer100g: 15, carbsPer100g: 17, fatPer100g: 61, defaultQty: 28, quantityMode: "grams", emoji: "🌰" },
  { id: "chestnuts", name: "Chestnuts (Roasted)", category: "Healthy & Fitness", caloriesPer100g: 245, proteinPer100g: 3.2, carbsPer100g: 53, fatPer100g: 2.2, defaultQty: 50, quantityMode: "grams", emoji: "🌰" },
  { id: "pecan", name: "Pecan Nuts", category: "Healthy & Fitness", caloriesPer100g: 691, proteinPer100g: 9, carbsPer100g: 14, fatPer100g: 72, defaultQty: 28, quantityMode: "grams", emoji: "🌰" },
  { id: "fox-nuts", name: "Fox Nuts / Makhana", category: "Healthy & Fitness", caloriesPer100g: 347, proteinPer100g: 9.7, carbsPer100g: 77, fatPer100g: 0.1, defaultQty: 30, quantityMode: "grams", emoji: "🪷" },
  { id: "coconut-dry", name: "Dry Coconut / Khopra", category: "Healthy & Fitness", caloriesPer100g: 650, proteinPer100g: 7, carbsPer100g: 21, fatPer100g: 62, defaultQty: 25, quantityMode: "grams", emoji: "🥥" },
  { id: "coconut-fresh", name: "Fresh Coconut (Grated)", category: "Healthy & Fitness", caloriesPer100g: 250, proteinPer100g: 2.8, carbsPer100g: 6, fatPer100g: 24, defaultQty: 50, quantityMode: "grams", emoji: "🥥" },

  // ─── Seeds (IFCT 2017) ──────────────────────────────────────────────────
  { id: "pumpkin-seeds", name: "Pumpkin Seeds", category: "Healthy & Fitness", caloriesPer100g: 559, proteinPer100g: 30, carbsPer100g: 10.7, fatPer100g: 49, defaultQty: 15, quantityMode: "grams", emoji: "🎃" },
  { id: "sunflower-seeds", name: "Sunflower Seeds", category: "Healthy & Fitness", caloriesPer100g: 584, proteinPer100g: 21, carbsPer100g: 20, fatPer100g: 51, defaultQty: 15, quantityMode: "grams", emoji: "🌻" },
  { id: "sesame-white", name: "Sesame Seeds / Til (White)", category: "Healthy & Fitness", caloriesPer100g: 573, proteinPer100g: 17.7, carbsPer100g: 23, fatPer100g: 50, defaultQty: 15, quantityMode: "grams", emoji: "🤍" },
  { id: "sesame-black", name: "Black Sesame Seeds", category: "Healthy & Fitness", caloriesPer100g: 573, proteinPer100g: 18, carbsPer100g: 23, fatPer100g: 50, defaultQty: 15, quantityMode: "grams", emoji: "🖤" },
  { id: "watermelon-seeds", name: "Watermelon Seeds / Magaz", category: "Healthy & Fitness", caloriesPer100g: 557, proteinPer100g: 28, carbsPer100g: 15, fatPer100g: 47, defaultQty: 15, quantityMode: "grams", emoji: "🍉" },
  { id: "poppy-seeds", name: "Poppy Seeds / Khas Khas", category: "Healthy & Fitness", caloriesPer100g: 525, proteinPer100g: 18, carbsPer100g: 28, fatPer100g: 41, defaultQty: 10, quantityMode: "grams", emoji: "⚪" },
  { id: "mustard-seeds", name: "Mustard Seeds / Rai", category: "Vegetables", caloriesPer100g: 508, proteinPer100g: 26, carbsPer100g: 28, fatPer100g: 36, defaultQty: 5, quantityMode: "grams", emoji: "🟡" },
  { id: "cumin-seeds", name: "Cumin Seeds / Jeera", category: "Vegetables", caloriesPer100g: 375, proteinPer100g: 18, carbsPer100g: 44, fatPer100g: 22, defaultQty: 5, quantityMode: "grams", emoji: "🟤" },
  { id: "coriander-seeds", name: "Coriander Seeds / Dhania", category: "Vegetables", caloriesPer100g: 298, proteinPer100g: 12.4, carbsPer100g: 55, fatPer100g: 17.8, defaultQty: 5, quantityMode: "grams", emoji: "🟤" },
  { id: "fennel-seeds", name: "Fennel Seeds / Saunf", category: "Vegetables", caloriesPer100g: 345, proteinPer100g: 15.8, carbsPer100g: 52, fatPer100g: 14.9, defaultQty: 10, quantityMode: "grams", emoji: "🟢" },
  { id: "fenugreek-seeds", name: "Fenugreek Seeds / Methi Dana", category: "Vegetables", caloriesPer100g: 323, proteinPer100g: 23, carbsPer100g: 58, fatPer100g: 6.4, defaultQty: 5, quantityMode: "grams", emoji: "🟡" },
  { id: "basil-seeds", name: "Basil Seeds / Sabja", category: "Healthy & Fitness", caloriesPer100g: 320, proteinPer100g: 15, carbsPer100g: 45, fatPer100g: 12, defaultQty: 10, quantityMode: "grams", emoji: "🟢" },
  { id: "carom-seeds", name: "Carom Seeds / Ajwain", category: "Vegetables", caloriesPer100g: 305, proteinPer100g: 17, carbsPer100g: 48, fatPer100g: 9, defaultQty: 5, quantityMode: "grams", emoji: "🟤" },
  { id: "niger-seeds", name: "Niger Seeds / Ramtil", category: "Healthy & Fitness", caloriesPer100g: 545, proteinPer100g: 18, carbsPer100g: 18, fatPer100g: 46, defaultQty: 15, quantityMode: "grams", emoji: "⚫" },

  // ═══════════════════════════════════════════════════════════
  // INDIAN DISHES
  // ═══════════════════════════════════════════════════════════
  {
    id: "idli",
    name: "Idli",
    category: "Indian Dishes",
    caloriesPer100g: 200, proteinPer100g: 7.7, carbsPer100g: 40.0, fatPer100g: 0.7,
    defaultQty: 3, quantityMode: "piece", gramsPerPiece: 30, emoji: "🍽️",
  },

  // ─── South Indian Breakfast (IFCT 2017) ──────────────────────────────────
  {
    id: "medu-vada",
    name: "Medu Vada",
    category: "Indian Dishes",
    caloriesPer100g: 198, proteinPer100g: 8.5, carbsPer100g: 26.0, fatPer100g: 7.5,
    defaultQty: 2, quantityMode: "piece", gramsPerPiece: 50, emoji: "🍩",
  },
  {
    id: "pesarattu",
    name: "Pesarattu (Green Gram Dosa)",
    category: "Indian Dishes",
    caloriesPer100g: 145, proteinPer100g: 7.0, carbsPer100g: 24.0, fatPer100g: 3.0,
    defaultQty: 1, quantityMode: "piece", gramsPerPiece: 80, emoji: "🫓",
  },
  {
    id: "appam",
    name: "Appam (Fermented Rice Pancake)",
    category: "Indian Dishes",
    caloriesPer100g: 135, proteinPer100g: 2.5, carbsPer100g: 28.0, fatPer100g: 2.0,
    defaultQty: 2, quantityMode: "piece", gramsPerPiece: 60, emoji: "🥞",
  },
  {
    id: "ven-pongal",
    name: "Ven Pongal (Rice & Lentil)",
    category: "Indian Dishes",
    caloriesPer100g: 120, proteinPer100g: 4.0, carbsPer100g: 20.0, fatPer100g: 3.0,
    defaultQty: 250, quantityMode: "grams", emoji: "🍛",
  },
  {
    id: "lemon-rice",
    name: "Lemon Rice / Chitranna",
    category: "Indian Dishes",
    caloriesPer100g: 145, proteinPer100g: 3.0, carbsPer100g: 26.0, fatPer100g: 3.5,
    defaultQty: 200, quantityMode: "grams", emoji: "🍚",
  },
  {
    id: "curd-rice",
    name: "Curd Rice / Thayir Sadam",
    category: "Indian Dishes",
    caloriesPer100g: 95, proteinPer100g: 3.0, carbsPer100g: 16.0, fatPer100g: 2.0,
    defaultQty: 200, quantityMode: "grams", emoji: "🍚",
  },
  {
    id: "set-dosa",
    name: "Set Dosa (Thick & Soft)",
    category: "Indian Dishes",
    caloriesPer100g: 165, proteinPer100g: 4.0, carbsPer100g: 32.0, fatPer100g: 2.5,
    defaultQty: 2, quantityMode: "piece", gramsPerPiece: 60, emoji: "🫓",
  },
  {
    id: "rava-dosa",
    name: "Rava Dosa (Semolina Crispy)",
    category: "Indian Dishes",
    caloriesPer100g: 175, proteinPer100g: 4.5, carbsPer100g: 28.0, fatPer100g: 5.0,
    defaultQty: 1, quantityMode: "piece", gramsPerPiece: 80, emoji: "🫓",
  },

  {
    id: "dosa-plain",
    name: "Plain Dosa",
    category: "Indian Dishes",
    caloriesPer100g: 200, proteinPer100g: 7.0, carbsPer100g: 35.0, fatPer100g: 5.0,
    defaultQty: 1, quantityMode: "piece", gramsPerPiece: 80, emoji: "🫓",
  },
  {
    id: "masala-dosa",
    name: "Masala Dosa",
    category: "Indian Dishes",
    caloriesPer100g: 210, proteinPer100g: 5.0, carbsPer100g: 35.0, fatPer100g: 6.0,
    defaultQty: 1, quantityMode: "piece", gramsPerPiece: 150, emoji: "🫓",
  },
  {
    id: "sambar",
    name: "Sambar",
    category: "Indian Dishes",
    caloriesPer100g: 50, proteinPer100g: 3, carbsPer100g: 8, fatPer100g: 1,
    defaultQty: 200, quantityMode: "ml", emoji: "🍲",
  },

  // ─── North Indian Curries (IFCT 2017) ───────────────────────────────────
  { id: "aloo-gobi", name: "Aloo Gobi (Potato & Cauliflower)", category: "Indian Dishes", caloriesPer100g: 85, proteinPer100g: 2.5, carbsPer100g: 14.0, fatPer100g: 2.5, defaultQty: 200, quantityMode: "grams", emoji: "🥔" },
  { id: "baingan-bharta", name: "Baingan Bharta (Roasted Eggplant)", category: "Indian Dishes", caloriesPer100g: 65, proteinPer100g: 2.0, carbsPer100g: 8.0, fatPer100g: 3.0, defaultQty: 200, quantityMode: "grams", emoji: "🍆" },
  { id: "bhindi-masala", name: "Bhindi Masala (Okra Stir-fry)", category: "Indian Dishes", caloriesPer100g: 80, proteinPer100g: 2.5, carbsPer100g: 8.0, fatPer100g: 4.5, defaultQty: 150, quantityMode: "grams", emoji: "🌿" },
  { id: "dum-aloo", name: "Dum Aloo (Baby Potatoes in Gravy)", category: "Indian Dishes", caloriesPer100g: 105, proteinPer100g: 3.0, carbsPer100g: 16.0, fatPer100g: 3.5, defaultQty: 200, quantityMode: "grams", emoji: "🥔" },
  { id: "malai-kofta", name: "Malai Kofta (Creamy Veg Balls)", category: "Indian Dishes", caloriesPer100g: 185, proteinPer100g: 7.0, carbsPer100g: 14.0, fatPer100g: 12.0, defaultQty: 200, quantityMode: "grams", emoji: "🧆" },
  { id: "methi-malai-matar", name: "Methi Malai Matar (Fenugreek Peas)", category: "Indian Dishes", caloriesPer100g: 110, proteinPer100g: 5.0, carbsPer100g: 10.0, fatPer100g: 6.0, defaultQty: 200, quantityMode: "grams", emoji: "🌿" },

  {
    id: "chicken-curry",
    name: "Chicken Curry (home style)",
    category: "Indian Dishes",
    caloriesPer100g: 125, proteinPer100g: 12.0, carbsPer100g: 6.0, fatPer100g: 6.0,
    defaultQty: 250, quantityMode: "grams", emoji: "🍛",
  },
  {
    id: "butter-chicken",
    name: "Butter Chicken (Murgh Makhani)",
    category: "Indian Dishes",
    caloriesPer100g: 185, proteinPer100g: 15, carbsPer100g: 7, fatPer100g: 12,
    defaultQty: 250, quantityMode: "grams", emoji: "🍛",
  },
  {
    id: "dal-makhani",
    name: "Dal Makhani",
    category: "Indian Dishes",
    caloriesPer100g: 135, proteinPer100g: 6.0, carbsPer100g: 14.0, fatPer100g: 5.5,
    defaultQty: 250, quantityMode: "grams", emoji: "🍲",
  },
  {
    id: "palak-paneer",
    name: "Palak Paneer",
    category: "Indian Dishes",
    caloriesPer100g: 150, proteinPer100g: 7.5, carbsPer100g: 7.0, fatPer100g: 10.0,
    defaultQty: 200, quantityMode: "grams", emoji: "🍛",
  },
  {
    id: "shahi-paneer",
    name: "Shahi Paneer",
    category: "Indian Dishes",
    caloriesPer100g: 175, proteinPer100g: 7.0, carbsPer100g: 8.0, fatPer100g: 13.0,
    defaultQty: 200, quantityMode: "grams", emoji: "🍛",
  },
  {
    id: "rajma-chawal",
    name: "Rajma Chawal (bowl)",
    category: "Indian Dishes",
    caloriesPer100g: 130, proteinPer100g: 6.5, carbsPer100g: 24, fatPer100g: 2,
    defaultQty: 300, quantityMode: "grams", emoji: "🍚",
  },
  {
    id: "chole-bhature",
    name: "Chole Bhature (1 plate)",
    category: "Indian Dishes",
    caloriesPer100g: 270, proteinPer100g: 8, carbsPer100g: 38, fatPer100g: 10,
    defaultQty: 1, quantityMode: "serving", mlPerServing: 350, emoji: "🍽️",
  },
  {
    id: "biryani-chicken",
    name: "Chicken Biryani",
    category: "Indian Dishes",
    caloriesPer100g: 174, proteinPer100g: 11, carbsPer100g: 22, fatPer100g: 5,
    defaultQty: 300, quantityMode: "grams", emoji: "🍛",
  },
  {
    id: "biryani-veg",
    name: "Vegetable Biryani",
    category: "Indian Dishes",
    caloriesPer100g: 140, proteinPer100g: 4, carbsPer100g: 25, fatPer100g: 3.5,
    defaultQty: 300, quantityMode: "grams", emoji: "🍛",
  },
  {
    id: "aloo-sabzi",
    name: "Aloo Sabzi (dry, no gravy)",
    category: "Indian Dishes",
    caloriesPer100g: 120, proteinPer100g: 2.5, carbsPer100g: 20, fatPer100g: 4,
    defaultQty: 150, quantityMode: "grams", emoji: "🥔",
  },
  {
    id: "saag",
    name: "Saag (Sarson da Saag)",
    category: "Indian Dishes",
    caloriesPer100g: 65, proteinPer100g: 3, carbsPer100g: 9, fatPer100g: 2.5,
    defaultQty: 200, quantityMode: "grams", emoji: "🥬",
  },
  {
    id: "khichdi",
    name: "Khichdi (dal rice)",
    category: "Indian Dishes",
    caloriesPer100g: 100, proteinPer100g: 4.5, carbsPer100g: 19, fatPer100g: 1.5,
    defaultQty: 300, quantityMode: "grams", emoji: "🍲",
  },
  {
    id: "pav-bhaji",
    name: "Pav Bhaji (1 pav + bhaji)",
    category: "Indian Dishes",
    caloriesPer100g: 185, proteinPer100g: 5, carbsPer100g: 28, fatPer100g: 7,
    defaultQty: 250, quantityMode: "grams", emoji: "🍔",
  },
  {
    id: "vada-pav",
    name: "Vada Pav",
    category: "Indian Dishes",
    caloriesPer100g: 250, proteinPer100g: 6, carbsPer100g: 38, fatPer100g: 9,
    defaultQty: 1, quantityMode: "piece", gramsPerPiece: 150, emoji: "🍔",
  },
  {
    id: "misal-pav",
    name: "Misal Pav",
    category: "Indian Dishes",
    caloriesPer100g: 160, proteinPer100g: 7, carbsPer100g: 25, fatPer100g: 5,
    defaultQty: 1, quantityMode: "serving", mlPerServing: 300, emoji: "🍲",
  },
  {
    id: "pulao",
    name: "Vegetable Pulao",
    category: "Indian Dishes",
    caloriesPer100g: 148, proteinPer100g: 3.5, carbsPer100g: 27, fatPer100g: 3,
    defaultQty: 250, quantityMode: "grams", emoji: "🍚",
  },
  {
    id: "kadai-chicken",
    name: "Kadai Chicken",
    category: "Indian Dishes",
    caloriesPer100g: 175, proteinPer100g: 18, carbsPer100g: 6, fatPer100g: 9,
    defaultQty: 250, quantityMode: "grams", emoji: "🍛",
  },
  {
    id: "fish-curry",
    name: "Fish Curry (Indian style)",
    category: "Indian Dishes",
    caloriesPer100g: 130, proteinPer100g: 15, carbsPer100g: 5, fatPer100g: 6,
    defaultQty: 200, quantityMode: "grams", emoji: "🍛",
  },
  {
    id: "rasam",
    name: "Rasam",
    category: "Indian Dishes",
    caloriesPer100g: 30, proteinPer100g: 1.5, carbsPer100g: 5, fatPer100g: 0.5,
    defaultQty: 200, quantityMode: "ml", emoji: "🍵",
  },
  {
    id: "dhokla",
    name: "Dhokla (plain, steamed)",
    category: "Indian Dishes",
    caloriesPer100g: 160, proteinPer100g: 7, carbsPer100g: 28, fatPer100g: 3,
    defaultQty: 3, quantityMode: "piece", gramsPerPiece: 40, emoji: "🍽️",
  },
  {
    id: "uttapam",
    name: "Uttapam",
    category: "Indian Dishes",
    caloriesPer100g: 146, proteinPer100g: 4.5, carbsPer100g: 27, fatPer100g: 3,
    defaultQty: 1, quantityMode: "piece", gramsPerPiece: 100, emoji: "🫓",
  },
  {
    id: "halwa-sooji",
    name: "Sooji Halwa (Sheera)",
    category: "Indian Dishes",
    caloriesPer100g: 290, proteinPer100g: 5, carbsPer100g: 45, fatPer100g: 11,
    defaultQty: 100, quantityMode: "grams", emoji: "🍮",
  },
  {
    id: "lassi-sweet",
    name: "Sweet Lassi",
    category: "Indian Dishes",
    caloriesPer100g: 80, proteinPer100g: 3.5, carbsPer100g: 13, fatPer100g: 2,
    defaultQty: 300, quantityMode: "ml", emoji: "🥛",
  },
  {
    id: "chaas-buttermilk",
    name: "Chaas / Buttermilk",
    category: "Indian Dishes",
    caloriesPer100g: 40, proteinPer100g: 3.3, carbsPer100g: 5, fatPer100g: 1,
    defaultQty: 300, quantityMode: "ml", emoji: "🥛",
  },

  // ─── Paneer Dishes (IFCT 2017) ──────────────────────────────────────────
  { id: "paneer-butter-masala", name: "Paneer Butter Masala", category: "Indian Dishes", caloriesPer100g: 195, proteinPer100g: 8, carbsPer100g: 10, fatPer100g: 14, defaultQty: 200, quantityMode: "grams", emoji: "🧀" },
  { id: "kadai-paneer", name: "Kadai Paneer", category: "Indian Dishes", caloriesPer100g: 180, proteinPer100g: 9, carbsPer100g: 8, fatPer100g: 13, defaultQty: 200, quantityMode: "grams", emoji: "🧀" },
  { id: "paneer-tikka-dish", name: "Paneer Tikka", category: "Indian Dishes", caloriesPer100g: 220, proteinPer100g: 16, carbsPer100g: 5, fatPer100g: 15, defaultQty: 150, quantityMode: "grams", emoji: "🧀" },
  { id: "paneer-bhurji-dish", name: "Paneer Bhurji", category: "Indian Dishes", caloriesPer100g: 175, proteinPer100g: 11, carbsPer100g: 5, fatPer100g: 12, defaultQty: 150, quantityMode: "grams", emoji: "🍳" },

  // ─── Tandoori Items (IFCT 2017) ─────────────────────────────────────────
  { id: "tandoori-chicken", name: "Tandoori Chicken", category: "Indian Dishes", caloriesPer100g: 165, proteinPer100g: 25, carbsPer100g: 2, fatPer100g: 6, defaultQty: 200, quantityMode: "grams", emoji: "🍗" },
  { id: "chicken-tikka-dish", name: "Chicken Tikka", category: "Indian Dishes", caloriesPer100g: 155, proteinPer100g: 24, carbsPer100g: 3, fatPer100g: 5, defaultQty: 150, quantityMode: "grams", emoji: "🍗" },
  { id: "seekh-kebab", name: "Seekh Kebab", category: "Indian Dishes", caloriesPer100g: 200, proteinPer100g: 18, carbsPer100g: 6, fatPer100g: 12, defaultQty: 2, quantityMode: "piece", gramsPerPiece: 60, emoji: "🍢" },
  { id: "tandoori-paneer-tikka", name: "Tandoori Paneer Tikka", category: "Indian Dishes", caloriesPer100g: 230, proteinPer100g: 17, carbsPer100g: 5, fatPer100g: 16, defaultQty: 150, quantityMode: "grams", emoji: "🧀" },

  // ─── Street Food (IFCT 2017) ────────────────────────────────────────────
  { id: "dabeli", name: "Dabeli", category: "Snacks & Street Food", caloriesPer100g: 190, proteinPer100g: 5, carbsPer100g: 30, fatPer100g: 6, defaultQty: 1, quantityMode: "piece", gramsPerPiece: 100, emoji: "🍔" },
  { id: "sev-puri", name: "Sev Puri", category: "Snacks & Street Food", caloriesPer100g: 180, proteinPer100g: 4, carbsPer100g: 28, fatPer100g: 6, defaultQty: 4, quantityMode: "piece", gramsPerPiece: 25, emoji: "🍽️" },
  { id: "ragda-pattice", name: "Ragda Pattice", category: "Snacks & Street Food", caloriesPer100g: 160, proteinPer100g: 5, carbsPer100g: 22, fatPer100g: 6, defaultQty: 2, quantityMode: "piece", gramsPerPiece: 80, emoji: "🥔" },
  { id: "kanda-bhaji", name: "Kanda Bhaji (Onion Fritters)", category: "Snacks & Street Food", caloriesPer100g: 250, proteinPer100g: 4, carbsPer100g: 28, fatPer100g: 13, defaultQty: 100, quantityMode: "grams", emoji: "🧅" },
  { id: "dahi-puri", name: "Dahi Puri", category: "Snacks & Street Food", caloriesPer100g: 140, proteinPer100g: 4, carbsPer100g: 22, fatPer100g: 4, defaultQty: 6, quantityMode: "piece", gramsPerPiece: 20, emoji: "🍽️" },

  // ─── Raita & Chutney (IFCT 2017) ────────────────────────────────────────
  { id: "boondi-raita", name: "Boondi Raita", category: "Indian Dishes", caloriesPer100g: 85, proteinPer100g: 3.5, carbsPer100g: 8, fatPer100g: 4.5, defaultQty: 100, quantityMode: "grams", emoji: "🥣" },
  { id: "cucumber-raita", name: "Cucumber Raita", category: "Indian Dishes", caloriesPer100g: 45, proteinPer100g: 2.5, carbsPer100g: 5, fatPer100g: 2, defaultQty: 100, quantityMode: "grams", emoji: "🥒" },
  { id: "mint-chutney", name: "Mint Chutney", category: "Indian Dishes", caloriesPer100g: 60, proteinPer100g: 2, carbsPer100g: 10, fatPer100g: 1, defaultQty: 30, quantityMode: "grams", emoji: "🌿" },
  { id: "coconut-chutney", name: "Coconut Chutney", category: "Indian Dishes", caloriesPer100g: 130, proteinPer100g: 2, carbsPer100g: 8, fatPer100g: 10, defaultQty: 50, quantityMode: "grams", emoji: "🥥" },
  { id: "tamarind-chutney", name: "Tamarind Chutney (Imli)", category: "Indian Dishes", caloriesPer100g: 140, proteinPer100g: 1, carbsPer100g: 34, fatPer100g: 0.5, defaultQty: 30, quantityMode: "grams", emoji: "🍯" },

  // ─── Rice Varieties (IFCT 2017) ─────────────────────────────────────────
  { id: "jeera-rice", name: "Jeera Rice", category: "Rice & Grains", caloriesPer100g: 150, proteinPer100g: 3, carbsPer100g: 26, fatPer100g: 4, defaultQty: 200, quantityMode: "grams", emoji: "🍚" },
  { id: "tamarind-rice", name: "Tamarind Rice / Puliyogare", category: "Rice & Grains", caloriesPer100g: 155, proteinPer100g: 3, carbsPer100g: 28, fatPer100g: 4, defaultQty: 200, quantityMode: "grams", emoji: "🍚" },
  { id: "ghee-rice", name: "Ghee Rice", category: "Rice & Grains", caloriesPer100g: 170, proteinPer100g: 3, carbsPer100g: 26, fatPer100g: 6, defaultQty: 200, quantityMode: "grams", emoji: "🍚" },

  // ─── Breads (IFCT 2017) ─────────────────────────────────────────────────
  { id: "missi-roti", name: "Missi Roti (Gram Flour)", category: "Bread & Roti", caloriesPer100g: 310, proteinPer100g: 12, carbsPer100g: 50, fatPer100g: 7, defaultQty: 1, quantityMode: "piece", gramsPerPiece: 40, emoji: "🫓" },
  { id: "makki-roti", name: "Makki di Roti (Corn Flour)", category: "Bread & Roti", caloriesPer100g: 270, proteinPer100g: 8, carbsPer100g: 48, fatPer100g: 6, defaultQty: 1, quantityMode: "piece", gramsPerPiece: 50, emoji: "🫓" },
  { id: "kulcha", name: "Kulcha (Leavened Flatbread)", category: "Bread & Roti", caloriesPer100g: 290, proteinPer100g: 8, carbsPer100g: 52, fatPer100g: 6, defaultQty: 1, quantityMode: "piece", gramsPerPiece: 80, emoji: "🫓" },
  { id: "thepla", name: "Thepla (Fenugreek Flatbread)", category: "Bread & Roti", caloriesPer100g: 320, proteinPer100g: 10, carbsPer100g: 50, fatPer100g: 9, defaultQty: 2, quantityMode: "piece", gramsPerPiece: 35, emoji: "🫓" },
  { id: "puran-poli", name: "Puran Poli (Sweet Lentil Bread)", category: "Bread & Roti", caloriesPer100g: 300, proteinPer100g: 8, carbsPer100g: 55, fatPer100g: 6, defaultQty: 1, quantityMode: "piece", gramsPerPiece: 80, emoji: "🫓" },

  // ─── Desserts (IFCT 2017) ───────────────────────────────────────────────
  { id: "kaju-katli", name: "Kaju Katli (Cashew Fudge)", category: "Sweets & Desserts", caloriesPer100g: 510, proteinPer100g: 9, carbsPer100g: 48, fatPer100g: 32, defaultQty: 2, quantityMode: "piece", gramsPerPiece: 20, emoji: "🍬" },
  { id: "soan-papdi", name: "Soan Papdi", category: "Sweets & Desserts", caloriesPer100g: 490, proteinPer100g: 6, carbsPer100g: 58, fatPer100g: 26, defaultQty: 50, quantityMode: "grams", emoji: "🍬" },
  { id: "malpua", name: "Malpua (Sweet Pancake)", category: "Sweets & Desserts", caloriesPer100g: 330, proteinPer100g: 5, carbsPer100g: 42, fatPer100g: 16, defaultQty: 1, quantityMode: "piece", gramsPerPiece: 60, emoji: "🥞" },
  { id: "phirni", name: "Phirni (Rice Pudding)", category: "Sweets & Desserts", caloriesPer100g: 145, proteinPer100g: 4, carbsPer100g: 22, fatPer100g: 5, defaultQty: 150, quantityMode: "grams", emoji: "🍮" },
  { id: "sandesh", name: "Sandesh (Bengali Sweet)", category: "Sweets & Desserts", caloriesPer100g: 320, proteinPer100g: 12, carbsPer100g: 38, fatPer100g: 14, defaultQty: 2, quantityMode: "piece", gramsPerPiece: 40, emoji: "🍬" },
  { id: "mysore-pak", name: "Mysore Pak", category: "Sweets & Desserts", caloriesPer100g: 500, proteinPer100g: 6, carbsPer100g: 42, fatPer100g: 35, defaultQty: 1, quantityMode: "piece", gramsPerPiece: 30, emoji: "🟨" },
  { id: "peda", name: "Peda (Milk Fudge)", category: "Sweets & Desserts", caloriesPer100g: 415, proteinPer100g: 8, carbsPer100g: 48, fatPer100g: 21, defaultQty: 1, quantityMode: "piece", gramsPerPiece: 30, emoji: "🍬" },

  // ─── Regional Dishes (IFCT 2017) ────────────────────────────────────────
  { id: "litti-chokha", name: "Litti Chokha (Bihari)", category: "Indian Dishes", caloriesPer100g: 180, proteinPer100g: 7, carbsPer100g: 28, fatPer100g: 5, defaultQty: 3, quantityMode: "piece", gramsPerPiece: 70, emoji: "🍛" },
  { id: "undhiyu", name: "Undhiyu (Gujarati Mixed Veg)", category: "Indian Dishes", caloriesPer100g: 95, proteinPer100g: 4, carbsPer100g: 14, fatPer100g: 3, defaultQty: 200, quantityMode: "grams", emoji: "🥬" },
  { id: "puttu-kadala", name: "Puttu & Kadala (Kerala)", category: "Indian Dishes", caloriesPer100g: 160, proteinPer100g: 6, carbsPer100g: 26, fatPer100g: 3.5, defaultQty: 250, quantityMode: "grams", emoji: "🍛" },

  // ─── Paratha Varieties (IFCT 2017) ──────────────────────────────────────
  { id: "gobi-paratha", name: "Gobi Paratha", category: "Bread & Roti", caloriesPer100g: 240, proteinPer100g: 7, carbsPer100g: 38, fatPer100g: 7, defaultQty: 1, quantityMode: "piece", gramsPerPiece: 100, emoji: "🫓" },
  { id: "mooli-paratha", name: "Mooli Paratha (Radish)", category: "Bread & Roti", caloriesPer100g: 230, proteinPer100g: 7, carbsPer100g: 38, fatPer100g: 6.5, defaultQty: 1, quantityMode: "piece", gramsPerPiece: 100, emoji: "🫓" },
  { id: "paneer-paratha", name: "Paneer Paratha", category: "Bread & Roti", caloriesPer100g: 270, proteinPer100g: 10, carbsPer100g: 36, fatPer100g: 10, defaultQty: 1, quantityMode: "piece", gramsPerPiece: 120, emoji: "🫓" },
  { id: "methi-paratha", name: "Methi Paratha", category: "Bread & Roti", caloriesPer100g: 250, proteinPer100g: 8, carbsPer100g: 40, fatPer100g: 7, defaultQty: 1, quantityMode: "piece", gramsPerPiece: 80, emoji: "🫓" },
  { id: "onion-paratha", name: "Onion Paratha", category: "Bread & Roti", caloriesPer100g: 245, proteinPer100g: 7, carbsPer100g: 39, fatPer100g: 7.5, defaultQty: 1, quantityMode: "piece", gramsPerPiece: 100, emoji: "🫓" },

  // ─── Tea & Coffee (IFCT 2017) ───────────────────────────────────────────
  { id: "masala-chai", name: "Masala Chai (with Milk & Sugar)", category: "Beverages", caloriesPer100g: 45, proteinPer100g: 1.5, carbsPer100g: 7.5, fatPer100g: 1.2, defaultQty: 200, quantityMode: "ml", emoji: "☕" },
  { id: "ginger-tea", name: "Ginger Tea (Adrak Chai)", category: "Beverages", caloriesPer100g: 40, proteinPer100g: 1, carbsPer100g: 7, fatPer100g: 1, defaultQty: 200, quantityMode: "ml", emoji: "☕" },
  { id: "filter-coffee", name: "Filter Coffee", category: "Beverages", caloriesPer100g: 35, proteinPer100g: 1.5, carbsPer100g: 5, fatPer100g: 1, defaultQty: 150, quantityMode: "ml", emoji: "☕" },

  // ─── Non-Veg More (IFCT 2017) ───────────────────────────────────────────
  { id: "mutton-curry", name: "Mutton Curry", category: "Chicken & Meat", caloriesPer100g: 175, proteinPer100g: 16, carbsPer100g: 5, fatPer100g: 10, defaultQty: 200, quantityMode: "grams", emoji: "🥩" },
  { id: "keema-matar", name: "Keema Matar (Minced Meat & Peas)", category: "Chicken & Meat", caloriesPer100g: 190, proteinPer100g: 15, carbsPer100g: 8, fatPer100g: 11, defaultQty: 200, quantityMode: "grams", emoji: "🥩" },
  { id: "chicken-65", name: "Chicken 65 (Spicy Fried)", category: "Chicken & Meat", caloriesPer100g: 220, proteinPer100g: 18, carbsPer100g: 10, fatPer100g: 12, defaultQty: 150, quantityMode: "grams", emoji: "🍗" },
  { id: "fish-fry", name: "Fish Fry (Indian Style)", category: "Fish & Seafood", caloriesPer100g: 200, proteinPer100g: 18, carbsPer100g: 10, fatPer100g: 10, defaultQty: 150, quantityMode: "grams", emoji: "🐟" },
  { id: "egg-curry", name: "Egg Curry", category: "Eggs & Dairy", caloriesPer100g: 130, proteinPer100g: 8, carbsPer100g: 5, fatPer100g: 9, defaultQty: 200, quantityMode: "grams", emoji: "🍛" },

  // ─── Pickles & Condiments (IFCT 2017) ───────────────────────────────────
  { id: "mango-pickle", name: "Mango Pickle (Aam ka Achar)", category: "Indian Dishes", caloriesPer100g: 50, proteinPer100g: 1, carbsPer100g: 8, fatPer100g: 2, defaultQty: 15, quantityMode: "grams", emoji: "🥭" },
  { id: "papad-roasted", name: "Papad (Roasted)", category: "Snacks & Street Food", caloriesPer100g: 290, proteinPer100g: 12, carbsPer100g: 45, fatPer100g: 7, defaultQty: 1, quantityMode: "piece", gramsPerPiece: 10, emoji: "🍘" },
  { id: "papad-fried", name: "Papad (Fried)", category: "Snacks & Street Food", caloriesPer100g: 340, proteinPer100g: 10, carbsPer100g: 42, fatPer100g: 15, defaultQty: 1, quantityMode: "piece", gramsPerPiece: 12, emoji: "🍘" },

  // ═══════════════════════════════════════════════════════════
  // SNACKS & STREET FOOD
  // ═══════════════════════════════════════════════════════════
  {
    id: "samosa",
    name: "Samosa (veg, fried)",
    category: "Snacks & Street Food",
    caloriesPer100g: 308, proteinPer100g: 6, carbsPer100g: 40, fatPer100g: 14,
    defaultQty: 2, quantityMode: "piece", gramsPerPiece: 60, emoji: "🔺",
  },
  {
    id: "kachori",
    name: "Kachori (fried)",
    category: "Snacks & Street Food",
    caloriesPer100g: 385, proteinPer100g: 7, carbsPer100g: 45, fatPer100g: 20,
    defaultQty: 1, quantityMode: "piece", gramsPerPiece: 70, emoji: "🫓",
  },
  {
    id: "pakoda-onion",
    name: "Onion Pakoda / Bhajiya",
    category: "Snacks & Street Food",
    caloriesPer100g: 280, proteinPer100g: 5.5, carbsPer100g: 33, fatPer100g: 14,
    defaultQty: 100, quantityMode: "grams", emoji: "🍟",
  },
  {
    id: "bhelpuri",
    name: "Bhel Puri",
    category: "Snacks & Street Food",
    caloriesPer100g: 170, proteinPer100g: 4, carbsPer100g: 30, fatPer100g: 5,
    defaultQty: 200, quantityMode: "grams", emoji: "🥣",
  },
  {
    id: "pani-puri",
    name: "Pani Puri / Golgappa (6 pcs)",
    category: "Snacks & Street Food",
    caloriesPer100g: 125, proteinPer100g: 3, carbsPer100g: 20, fatPer100g: 4,
    defaultQty: 6, quantityMode: "piece", gramsPerPiece: 18, emoji: "🫙",
  },
  {
    id: "aloo-tikki",
    name: "Aloo Tikki",
    category: "Snacks & Street Food",
    caloriesPer100g: 200, proteinPer100g: 4, carbsPer100g: 30, fatPer100g: 7,
    defaultQty: 2, quantityMode: "piece", gramsPerPiece: 70, emoji: "🥔",
  },
  {
    id: "chaat-papdi",
    name: "Papdi Chaat",
    category: "Snacks & Street Food",
    caloriesPer100g: 220, proteinPer100g: 6, carbsPer100g: 32, fatPer100g: 8,
    defaultQty: 150, quantityMode: "grams", emoji: "🍽️",
  },
  {
    id: "momos-veg",
    name: "Veg Momos (steamed, 6 pcs)",
    category: "Snacks & Street Food",
    caloriesPer100g: 160, proteinPer100g: 6, carbsPer100g: 28, fatPer100g: 3,
    defaultQty: 6, quantityMode: "piece", gramsPerPiece: 25, emoji: "🥟",
  },
  {
    id: "momos-chicken",
    name: "Chicken Momos (steamed, 6 pcs)",
    category: "Snacks & Street Food",
    caloriesPer100g: 180, proteinPer100g: 12, carbsPer100g: 22, fatPer100g: 5,
    defaultQty: 6, quantityMode: "piece", gramsPerPiece: 25, emoji: "🥟",
  },
  {
    id: "popcorn-plain",
    name: "Popcorn (plain)",
    category: "Snacks & Street Food",
    caloriesPer100g: 387, proteinPer100g: 13, carbsPer100g: 78, fatPer100g: 5,
    defaultQty: 30, quantityMode: "grams", emoji: "🍿",
  },
  {
    id: "namkeen-mixture",
    name: "Namkeen Mixture",
    category: "Snacks & Street Food",
    caloriesPer100g: 480, proteinPer100g: 10, carbsPer100g: 55, fatPer100g: 26,
    defaultQty: 30, quantityMode: "grams", emoji: "🥣",
  },
  {
    id: "mathri",
    name: "Mathri / Salted Crackers",
    category: "Snacks & Street Food",
    caloriesPer100g: 450, proteinPer100g: 9, carbsPer100g: 58, fatPer100g: 21,
    defaultQty: 30, quantityMode: "grams", emoji: "🍘",
  },

  // ═══════════════════════════════════════════════════════════
  // JUNK FOOD
  // ═══════════════════════════════════════════════════════════
  {
    id: "pizza-slice",
    name: "Pizza Slice (cheese, regular)",
    category: "Junk Food",
    caloriesPer100g: 266, proteinPer100g: 11, carbsPer100g: 33, fatPer100g: 10,
    defaultQty: 2, quantityMode: "piece", gramsPerPiece: 100, emoji: "🍕",
  },
  {
    id: "burger-veg",
    name: "Veg Burger",
    category: "Junk Food",
    caloriesPer100g: 240, proteinPer100g: 6, carbsPer100g: 35, fatPer100g: 9,
    defaultQty: 1, quantityMode: "piece", gramsPerPiece: 180, emoji: "🍔",
  },
  {
    id: "burger-chicken",
    name: "Chicken Burger",
    category: "Junk Food",
    caloriesPer100g: 265, proteinPer100g: 13, carbsPer100g: 30, fatPer100g: 11,
    defaultQty: 1, quantityMode: "piece", gramsPerPiece: 200, emoji: "🍔",
  },
  {
    id: "french-fries",
    name: "French Fries (medium)",
    category: "Junk Food",
    caloriesPer100g: 312, proteinPer100g: 3.4, carbsPer100g: 41, fatPer100g: 15,
    defaultQty: 100, quantityMode: "grams", emoji: "🍟",
  },
  {
    id: "hot-dog",
    name: "Hot Dog (bun + sausage)",
    category: "Junk Food",
    caloriesPer100g: 290, proteinPer100g: 10, carbsPer100g: 24, fatPer100g: 17,
    defaultQty: 1, quantityMode: "piece", gramsPerPiece: 150, emoji: "🌭",
  },
  {
    id: "chips-lays",
    name: "Potato Chips / Lays",
    category: "Junk Food",
    caloriesPer100g: 536, proteinPer100g: 7, carbsPer100g: 53, fatPer100g: 34,
    defaultQty: 30, quantityMode: "grams", emoji: "🥔",
  },
  {
    id: "maggi-noodles",
    name: "Maggi Noodles (1 pack cooked)",
    category: "Junk Food",
    caloriesPer100g: 368, proteinPer100g: 9, carbsPer100g: 56, fatPer100g: 13,
    defaultQty: 1, quantityMode: "piece", gramsPerPiece: 70, emoji: "🍜",
  },
  {
    id: "instant-noodles",
    name: "Instant Noodles (cooked)",
    category: "Junk Food",
    caloriesPer100g: 138, proteinPer100g: 3.5, carbsPer100g: 20, fatPer100g: 5,
    defaultQty: 200, quantityMode: "grams", emoji: "🍜",
  },
  {
    id: "donut",
    name: "Glazed Donut",
    category: "Junk Food",
    caloriesPer100g: 452, proteinPer100g: 5, carbsPer100g: 51, fatPer100g: 25,
    defaultQty: 1, quantityMode: "piece", gramsPerPiece: 60, emoji: "🍩",
  },
  {
    id: "cookie-choco-chip",
    name: "Chocolate Chip Cookie",
    category: "Junk Food",
    caloriesPer100g: 488, proteinPer100g: 5.4, carbsPer100g: 65, fatPer100g: 23,
    defaultQty: 2, quantityMode: "piece", gramsPerPiece: 25, emoji: "🍪",
  },
  {
    id: "chocolate-milk",
    name: "Milk Chocolate Bar",
    category: "Junk Food",
    caloriesPer100g: 535, proteinPer100g: 7.7, carbsPer100g: 60, fatPer100g: 30,
    defaultQty: 1, quantityMode: "piece", gramsPerPiece: 40, emoji: "🍫",
  },
  {
    id: "ice-cream-vanilla",
    name: "Ice Cream (vanilla scoop)",
    category: "Junk Food",
    caloriesPer100g: 207, proteinPer100g: 3.5, carbsPer100g: 24, fatPer100g: 11,
    defaultQty: 100, quantityMode: "grams", emoji: "🍦",
  },
  {
    id: "cold-drink-cola",
    name: "Cola / Cold Drink (can)",
    category: "Junk Food",
    caloriesPer100g: 42, proteinPer100g: 0, carbsPer100g: 11, fatPer100g: 0,
    defaultQty: 330, quantityMode: "ml", emoji: "🥤",
  },
  {
    id: "fried-chicken",
    name: "Fried Chicken (KFC style, 1 pc)",
    category: "Junk Food",
    caloriesPer100g: 290, proteinPer100g: 20, carbsPer100g: 12, fatPer100g: 18,
    defaultQty: 1, quantityMode: "piece", gramsPerPiece: 120, emoji: "🍗",
  },
  {
    id: "cheesecake",
    name: "Cheesecake (slice)",
    category: "Junk Food",
    caloriesPer100g: 321, proteinPer100g: 5.5, carbsPer100g: 25, fatPer100g: 23,
    defaultQty: 1, quantityMode: "piece", gramsPerPiece: 100, emoji: "🍰",
  },

  // ═══════════════════════════════════════════════════════════
  // HEALTHY & FITNESS
  // ═══════════════════════════════════════════════════════════
  {
    id: "almonds",
    name: "Almonds",
    category: "Healthy & Fitness",
    caloriesPer100g: 579, proteinPer100g: 21, carbsPer100g: 22, fatPer100g: 50,
    defaultQty: 28, quantityMode: "grams", emoji: "🌰",
  },
  {
    id: "walnuts",
    name: "Walnuts",
    category: "Healthy & Fitness",
    caloriesPer100g: 654, proteinPer100g: 15, carbsPer100g: 14, fatPer100g: 65,
    defaultQty: 28, quantityMode: "grams", emoji: "🌰",
  },
  {
    id: "peanuts-roasted",
    name: "Peanuts / Groundnuts (roasted)",
    category: "Healthy & Fitness",
    caloriesPer100g: 567, proteinPer100g: 26, carbsPer100g: 16, fatPer100g: 49,
    defaultQty: 30, quantityMode: "grams", emoji: "🥜",
  },
  {
    id: "peanut-butter",
    name: "Peanut Butter",
    category: "Healthy & Fitness",
    caloriesPer100g: 588, proteinPer100g: 25, carbsPer100g: 20, fatPer100g: 50,
    defaultQty: 32, quantityMode: "grams", emoji: "🥜",
  },
  {
    id: "cashews",
    name: "Cashews",
    category: "Healthy & Fitness",
    caloriesPer100g: 553, proteinPer100g: 18, carbsPer100g: 30, fatPer100g: 44,
    defaultQty: 28, quantityMode: "grams", emoji: "🌰",
  },
  {
    id: "chia-seeds",
    name: "Chia Seeds",
    category: "Healthy & Fitness",
    caloriesPer100g: 486, proteinPer100g: 17, carbsPer100g: 42, fatPer100g: 31,
    defaultQty: 15, quantityMode: "grams", emoji: "🌱",
  },
  {
    id: "flaxseeds",
    name: "Flaxseeds / Alsi",
    category: "Healthy & Fitness",
    caloriesPer100g: 534, proteinPer100g: 18, carbsPer100g: 29, fatPer100g: 42,
    defaultQty: 15, quantityMode: "grams", emoji: "🌱",
  },
  {
    id: "protein-bar",
    name: "Protein Bar (generic)",
    category: "Healthy & Fitness",
    caloriesPer100g: 380, proteinPer100g: 25, carbsPer100g: 40, fatPer100g: 11,
    defaultQty: 1, quantityMode: "piece", gramsPerPiece: 60, emoji: "💪",
  },
  {
    id: "granola",
    name: "Granola / Muesli",
    category: "Healthy & Fitness",
    caloriesPer100g: 471, proteinPer100g: 10, carbsPer100g: 64, fatPer100g: 20,
    defaultQty: 50, quantityMode: "grams", emoji: "🥣",
  },
  {
    id: "avocado",
    name: "Avocado",
    category: "Healthy & Fitness",
    caloriesPer100g: 160, proteinPer100g: 2, carbsPer100g: 9, fatPer100g: 15,
    defaultQty: 100, quantityMode: "grams", emoji: "🥑",
  },
  {
    id: "edamame",
    name: "Edamame (cooked)",
    category: "Healthy & Fitness",
    caloriesPer100g: 121, proteinPer100g: 11, carbsPer100g: 10, fatPer100g: 5,
    defaultQty: 100, quantityMode: "grams", emoji: "🫛",
  },
  {
    id: "tofu-firm",
    name: "Tofu (firm)",
    category: "Healthy & Fitness",
    caloriesPer100g: 76, proteinPer100g: 8, carbsPer100g: 2, fatPer100g: 4.2,
    defaultQty: 150, quantityMode: "grams", emoji: "🍱",
  },
  {
    id: "hummus",
    name: "Hummus",
    category: "Healthy & Fitness",
    caloriesPer100g: 177, proteinPer100g: 8, carbsPer100g: 20, fatPer100g: 8.6,
    defaultQty: 50, quantityMode: "grams", emoji: "🥣",
  },
  {
    id: "dark-chocolate",
    name: "Dark Chocolate (70%+)",
    category: "Healthy & Fitness",
    caloriesPer100g: 598, proteinPer100g: 7.8, carbsPer100g: 45, fatPer100g: 43,
    defaultQty: 30, quantityMode: "grams", emoji: "🍫",
  },
  {
    id: "olive-oil",
    name: "Olive Oil",
    category: "Healthy & Fitness",
    caloriesPer100g: 884, proteinPer100g: 0, carbsPer100g: 0, fatPer100g: 100,
    defaultQty: 15, quantityMode: "ml", emoji: "🫒",
  },
  {
    id: "coconut-oil",
    name: "Coconut Oil",
    category: "Healthy & Fitness",
    caloriesPer100g: 862, proteinPer100g: 0, carbsPer100g: 0, fatPer100g: 100,
    defaultQty: 15, quantityMode: "ml", emoji: "🥥",
  },

  // ═══════════════════════════════════════════════════════════
  // BEVERAGES
  // ═══════════════════════════════════════════════════════════
  {
    id: "chai-tea",
    name: "Chai (tea with milk & sugar)",
    category: "Beverages",
    caloriesPer100g: 45, proteinPer100g: 1.5, carbsPer100g: 7.5, fatPer100g: 1.2,
    defaultQty: 200, quantityMode: "ml", emoji: "☕",
  },
  {
    id: "black-coffee",
    name: "Black Coffee (no sugar)",
    category: "Beverages",
    caloriesPer100g: 2, proteinPer100g: 0.3, carbsPer100g: 0.3, fatPer100g: 0.1,
    defaultQty: 200, quantityMode: "ml", emoji: "☕",
  },
  {
    id: "coffee-with-milk",
    name: "Coffee with Milk (latte)",
    category: "Beverages",
    caloriesPer100g: 40, proteinPer100g: 2, carbsPer100g: 5.5, fatPer100g: 1.5,
    defaultQty: 300, quantityMode: "ml", emoji: "☕",
  },
  {
    id: "orange-juice",
    name: "Orange Juice (fresh)",
    category: "Beverages",
    caloriesPer100g: 45, proteinPer100g: 0.7, carbsPer100g: 10, fatPer100g: 0.2,
    defaultQty: 250, quantityMode: "ml", emoji: "🍊",
  },
  {
    id: "coconut-water",
    name: "Coconut Water",
    category: "Beverages",
    caloriesPer100g: 19, proteinPer100g: 0.7, carbsPer100g: 3.7, fatPer100g: 0.2,
    defaultQty: 300, quantityMode: "ml", emoji: "🥥",
  },
  {
    id: "protein-shake-milk",
    name: "Protein Shake (whey + milk)",
    category: "Beverages",
    caloriesPer100g: 75, proteinPer100g: 8.5, carbsPer100g: 7, fatPer100g: 1.5,
    defaultQty: 300, quantityMode: "ml", emoji: "🥛",
  },
  {
    id: "nimbu-pani",
    name: "Nimbu Pani / Lemonade",
    category: "Beverages",
    caloriesPer100g: 25, proteinPer100g: 0.2, carbsPer100g: 6.5, fatPer100g: 0.1,
    defaultQty: 250, quantityMode: "ml", emoji: "🍋",
  },
  {
    id: "mango-lassi",
    name: "Mango Lassi",
    category: "Beverages",
    caloriesPer100g: 95, proteinPer100g: 3, carbsPer100g: 16, fatPer100g: 2.5,
    defaultQty: 300, quantityMode: "ml", emoji: "🥭",
  },
  {
    id: "energy-drink",
    name: "Energy Drink (Red Bull/Monster)",
    category: "Beverages",
    caloriesPer100g: 45, proteinPer100g: 0, carbsPer100g: 11, fatPer100g: 0,
    defaultQty: 250, quantityMode: "ml", emoji: "⚡",
  },

  // ═══════════════════════════════════════════════════════════
  // SWEETS & DESSERTS
  // ═══════════════════════════════════════════════════════════
  {
    id: "gulab-jamun",
    name: "Gulab Jamun (1 pc)",
    category: "Sweets & Desserts",
    caloriesPer100g: 387, proteinPer100g: 6, carbsPer100g: 57, fatPer100g: 16,
    defaultQty: 2, quantityMode: "piece", gramsPerPiece: 45, emoji: "🍮",
  },
  {
    id: "rasgulla",
    name: "Rasgulla (1 pc)",
    category: "Sweets & Desserts",
    caloriesPer100g: 186, proteinPer100g: 5, carbsPer100g: 40, fatPer100g: 0.5,
    defaultQty: 2, quantityMode: "piece", gramsPerPiece: 60, emoji: "🍮",
  },
  {
    id: "jalebi",
    name: "Jalebi",
    category: "Sweets & Desserts",
    caloriesPer100g: 400, proteinPer100g: 2.5, carbsPer100g: 68, fatPer100g: 14,
    defaultQty: 2, quantityMode: "piece", gramsPerPiece: 30, emoji: "🍩",
  },
  {
    id: "barfi",
    name: "Barfi / Mithai (1 pc)",
    category: "Sweets & Desserts",
    caloriesPer100g: 416, proteinPer100g: 7, carbsPer100g: 55, fatPer100g: 19,
    defaultQty: 1, quantityMode: "piece", gramsPerPiece: 40, emoji: "🍬",
  },
  {
    id: "kheer",
    name: "Kheer (rice pudding)",
    category: "Sweets & Desserts",
    caloriesPer100g: 141, proteinPer100g: 3.5, carbsPer100g: 24, fatPer100g: 4,
    defaultQty: 150, quantityMode: "grams", emoji: "🍮",
  },
  {
    id: "ladoo",
    name: "Besan Ladoo",
    category: "Sweets & Desserts",
    caloriesPer100g: 450, proteinPer100g: 9, carbsPer100g: 57, fatPer100g: 21,
    defaultQty: 1, quantityMode: "piece", gramsPerPiece: 40, emoji: "🟡",
  },
  {
    id: "cake-slice",
    name: "Chocolate Cake (slice)",
    category: "Sweets & Desserts",
    caloriesPer100g: 371, proteinPer100g: 5, carbsPer100g: 52, fatPer100g: 17,
    defaultQty: 1, quantityMode: "piece", gramsPerPiece: 100, emoji: "🎂",
  },

  // ═══════════════════════════════════════════════════════════
  // CHINESE CUISINE
  // ═══════════════════════════════════════════════════════════
  {
    id: "veg-hakka-noodles",
    name: "Veg Hakka Noodles",
    category: "Chinese",
    caloriesPer100g: 140, proteinPer100g: 2.5, carbsPer100g: 28, fatPer100g: 2.0,
    defaultQty: 200, quantityMode: "grams", emoji: "🥢",
  },
  {
    id: "chicken-hakka-noodles",
    name: "Chicken Hakka Noodles",
    category: "Chinese",
    caloriesPer100g: 165, proteinPer100g: 8.0, carbsPer100g: 26, fatPer100g: 3.5,
    defaultQty: 200, quantityMode: "grams", emoji: "🥢",
  },
  {
    id: "veg-fried-rice",
    name: "Veg Fried Rice",
    category: "Chinese",
    caloriesPer100g: 160, proteinPer100g: 3.0, carbsPer100g: 32, fatPer100g: 2.5,
    defaultQty: 200, quantityMode: "grams", emoji: "🍚",
  },
  {
    id: "chicken-fried-rice",
    name: "Chicken Fried Rice",
    category: "Chinese",
    caloriesPer100g: 180, proteinPer100g: 9.0, carbsPer100g: 30, fatPer100g: 4.0,
    defaultQty: 200, quantityMode: "grams", emoji: "🍚",
  },
  {
    id: "veg-manchurian-gravy",
    name: "Veg Manchurian (with gravy)",
    category: "Chinese",
    caloriesPer100g: 110, proteinPer100g: 2.0, carbsPer100g: 15, fatPer100g: 5.0,
    defaultQty: 200, quantityMode: "grams", emoji: "🧆",
  },
  {
    id: "chicken-manchurian-gravy",
    name: "Chicken Manchurian (with gravy)",
    category: "Chinese",
    caloriesPer100g: 140, proteinPer100g: 8.0, carbsPer100g: 14, fatPer100g: 6.0,
    defaultQty: 200, quantityMode: "grams", emoji: "🍗",
  },
  {
    id: "chilli-paneer-gravy",
    name: "Chilli Paneer (gravy/dry)",
    category: "Chinese",
    caloriesPer100g: 190, proteinPer100g: 9.0, carbsPer100g: 10, fatPer100g: 13.0,
    defaultQty: 150, quantityMode: "grams", emoji: "🧀",
  },
  {
    id: "chilli-chicken-gravy",
    name: "Chilli Chicken (gravy/dry)",
    category: "Chinese",
    caloriesPer100g: 170, proteinPer100g: 15.0, carbsPer100g: 8, fatPer100g: 9.0,
    defaultQty: 150, quantityMode: "grams", emoji: "🍗",
  },
  {
    id: "veg-momos-steamed",
    name: "Veg Momos (steamed)",
    category: "Chinese",
    caloriesPer100g: 140, proteinPer100g: 4.0, carbsPer100g: 28, fatPer100g: 0.8,
    defaultQty: 6, quantityMode: "piece", gramsPerPiece: 25, emoji: "🥟",
  },
  {
    id: "chicken-momos-steamed",
    name: "Chicken Momos (steamed)",
    category: "Chinese",
    caloriesPer100g: 180, proteinPer100g: 12.0, carbsPer100g: 24, fatPer100g: 4.0,
    defaultQty: 6, quantityMode: "piece", gramsPerPiece: 25, emoji: "🥟",
  },
  {
    id: "spring-roll-veg",
    name: "Spring Roll (veg, fried)",
    category: "Chinese",
    caloriesPer100g: 250, proteinPer100g: 5.0, carbsPer100g: 31, fatPer100g: 11.0,
    defaultQty: 2, quantityMode: "piece", gramsPerPiece: 60, emoji: "🌯",
  },
  {
    id: "manchow-soup-veg",
    name: "Veg Manchow Soup",
    category: "Chinese",
    caloriesPer100g: 45, proteinPer100g: 1.5, carbsPer100g: 7, fatPer100g: 1.2,
    defaultQty: 250, quantityMode: "ml", emoji: "🥣",
  },
  {
    id: "hot-sour-soup-veg",
    name: "Veg Hot & Sour Soup",
    category: "Chinese",
    caloriesPer100g: 40, proteinPer100g: 1.0, carbsPer100g: 6, fatPer100g: 1.0,
    defaultQty: 250, quantityMode: "ml", emoji: "🥣",
  },
  {
    id: "schezwan-sauce",
    name: "Schezwan Sauce",
    category: "Chinese",
    caloriesPer100g: 120, proteinPer100g: 1.5, carbsPer100g: 14, fatPer100g: 7.0,
    defaultQty: 20, quantityMode: "grams", emoji: "🌶️",
  },

  // ═══════════════════════════════════════════════════════════
  // SANDWICHES
  // ═══════════════════════════════════════════════════════════
  {
    id: "veg-grilled-sandwich-cheese",
    name: "Veg Grilled Cheese Sandwich",
    category: "Sandwiches",
    caloriesPer100g: 186, proteinPer100g: 6.0, carbsPer100g: 21.3, fatPer100g: 8.0,
    defaultQty: 1, quantityMode: "piece", gramsPerPiece: 150, emoji: "🥪",
  },
  {
    id: "bombay-masala-toast",
    name: "Bombay Masala Toast Sandwich",
    category: "Sandwiches",
    caloriesPer100g: 156, proteinPer100g: 3.8, carbsPer100g: 26.2, fatPer100g: 3.8,
    defaultQty: 1, quantityMode: "piece", gramsPerPiece: 160, emoji: "🥪",
  },
  {
    id: "paneer-tikka-sandwich",
    name: "Paneer Tikka Sandwich",
    category: "Sandwiches",
    caloriesPer100g: 178, proteinPer100g: 7.8, carbsPer100g: 20.0, fatPer100g: 7.2,
    defaultQty: 1, quantityMode: "piece", gramsPerPiece: 180, emoji: "🥪",
  },
  {
    id: "chicken-mayo-sandwich",
    name: "Chicken Mayo Sandwich",
    category: "Sandwiches",
    caloriesPer100g: 200, proteinPer100g: 10.6, carbsPer100g: 16.5, fatPer100g: 9.4,
    defaultQty: 1, quantityMode: "piece", gramsPerPiece: 170, emoji: "🥪",
  },
  {
    id: "egg-club-sandwich",
    name: "Egg Club Sandwich",
    category: "Sandwiches",
    caloriesPer100g: 190, proteinPer100g: 8.0, carbsPer100g: 15.0, fatPer100g: 10.0,
    defaultQty: 1, quantityMode: "piece", gramsPerPiece: 200, emoji: "🥪",
  },
  {
    id: "aloo-masala-sandwich",
    name: "Aloo Masala Sandwich",
    category: "Sandwiches",
    caloriesPer100g: 157, proteinPer100g: 3.6, carbsPer100g: 27.1, fatPer100g: 3.6,
    defaultQty: 1, quantityMode: "piece", gramsPerPiece: 140, emoji: "🥪",
  },
  {
    id: "cheese-corn-sandwich",
    name: "Cheese Corn Sandwich",
    category: "Sandwiches",
    caloriesPer100g: 207, proteinPer100g: 6.7, carbsPer100g: 22.7, fatPer100g: 10.0,
    defaultQty: 1, quantityMode: "piece", gramsPerPiece: 150, emoji: "🥪",
  },
  {
    id: "spinach-corn-sandwich",
    name: "Spinach & Corn Sandwich",
    category: "Sandwiches",
    caloriesPer100g: 160, proteinPer100g: 5.3, carbsPer100g: 20.0, fatPer100g: 6.0,
    defaultQty: 1, quantityMode: "piece", gramsPerPiece: 150, emoji: "🥪",
  },
  {
    id: "tuna-salad-sandwich",
    name: "Tuna Salad Sandwich",
    category: "Sandwiches",
    caloriesPer100g: 170, proteinPer100g: 12.9, carbsPer100g: 15.3, fatPer100g: 5.9,
    defaultQty: 1, quantityMode: "piece", gramsPerPiece: 170, emoji: "🥪",
  },
  {
    id: "ham-cheese-sandwich",
    name: "Ham & Cheese Sandwich",
    category: "Sandwiches",
    caloriesPer100g: 233, proteinPer100g: 13.3, carbsPer100g: 18.7, fatPer100g: 11.3,
    defaultQty: 1, quantityMode: "piece", gramsPerPiece: 150, emoji: "🥪",
  },
  {
    id: "veg-club-sandwich-triple",
    name: "Veg Club Sandwich (Triple Layer)",
    category: "Sandwiches",
    caloriesPer100g: 156, proteinPer100g: 4.8, carbsPer100g: 20.8, fatPer100g: 6.0,
    defaultQty: 1, quantityMode: "piece", gramsPerPiece: 250, emoji: "🥪",
  },
  {
    id: "paneer-bhurji-sandwich",
    name: "Paneer Bhurji Sandwich",
    category: "Sandwiches",
    caloriesPer100g: 194, proteinPer100g: 8.1, carbsPer100g: 20.0, fatPer100g: 8.8,
    defaultQty: 1, quantityMode: "piece", gramsPerPiece: 160, emoji: "🥪",
  },
  {
    id: "chicken-tikka-sandwich",
    name: "Chicken Tikka Sandwich",
    category: "Sandwiches",
    caloriesPer100g: 183, proteinPer100g: 12.2, carbsPer100g: 17.8, fatPer100g: 6.1,
    defaultQty: 1, quantityMode: "piece", gramsPerPiece: 180, emoji: "🥪",
  },

  // ═══════════════════════════════════════════════════════════
  // SWEETS & DESSERTS (REMAINING)
  // ═══════════════════════════════════════════════════════════
  {
    id: "rasmalai",
    name: "Rasmalai",
    category: "Sweets & Desserts",
    caloriesPer100g: 250, proteinPer100g: 6.0, carbsPer100g: 28.0, fatPer100g: 12.0,
    defaultQty: 1, quantityMode: "piece", gramsPerPiece: 75, emoji: "🍮",
  },
  {
    id: "kaju-katli",
    name: "Kaju Katli",
    category: "Sweets & Desserts",
    caloriesPer100g: 480, proteinPer100g: 10.0, carbsPer100g: 55.0, fatPer100g: 25.0,
    defaultQty: 2, quantityMode: "piece", gramsPerPiece: 15, emoji: "🍬",
  },
  {
    id: "gajar-halwa",
    name: "Gajar Ka Halwa",
    category: "Sweets & Desserts",
    caloriesPer100g: 280, proteinPer100g: 4.0, carbsPer100g: 36.0, fatPer100g: 14.0,
    defaultQty: 100, quantityMode: "grams", emoji: "🥕",
  },
  {
    id: "shrikhand",
    name: "Shrikhand",
    category: "Sweets & Desserts",
    caloriesPer100g: 260, proteinPer100g: 6.0, carbsPer100g: 38.0, fatPer100g: 9.0,
    defaultQty: 100, quantityMode: "grams", emoji: "🥣",
  },
  {
    id: "mysore-pak",
    name: "Mysore Pak",
    category: "Sweets & Desserts",
    caloriesPer100g: 540, proteinPer100g: 4.0, carbsPer100g: 52.0, fatPer100g: 35.0,
    defaultQty: 1, quantityMode: "piece", gramsPerPiece: 35, emoji: "🧈",
  },
  {
    id: "modak",
    name: "Modak (steamed)",
    category: "Sweets & Desserts",
    caloriesPer100g: 275, proteinPer100g: 3.5, carbsPer100g: 55.0, fatPer100g: 5.0,
    defaultQty: 1, quantityMode: "piece", gramsPerPiece: 40, emoji: "🥟",
  },
  {
    id: "kulfi",
    name: "Kulfi (Malai/Pista)",
    category: "Sweets & Desserts",
    caloriesPer100g: 220, proteinPer100g: 5.5, carbsPer100g: 24.0, fatPer100g: 11.0,
    defaultQty: 1, quantityMode: "piece", gramsPerPiece: 80, emoji: "🍦",
  },
  {
    id: "mishti-doi",
    name: "Mishti Doi",
    category: "Sweets & Desserts",
    caloriesPer100g: 160, proteinPer100g: 4.0, carbsPer100g: 22.0, fatPer100g: 5.0,
    defaultQty: 100, quantityMode: "grams", emoji: "🍶",
  },
  {
    id: "brownie",
    name: "Chocolate Brownie",
    category: "Sweets & Desserts",
    caloriesPer100g: 400, proteinPer100g: 5.0, carbsPer100g: 53.0, fatPer100g: 18.0,
    defaultQty: 1, quantityMode: "piece", gramsPerPiece: 60, emoji: "🥮",
  },
  {
    id: "waffle-plain",
    name: "Belgian Waffle (plain)",
    category: "Sweets & Desserts",
    caloriesPer100g: 290, proteinPer100g: 6.7, carbsPer100g: 40.0, fatPer100g: 12.0,
    defaultQty: 1, quantityMode: "piece", gramsPerPiece: 75, emoji: "🧇",
  },
  {
    id: "pancakes-syrup",
    name: "Pancakes (with syrup)",
    category: "Sweets & Desserts",
    caloriesPer100g: 292, proteinPer100g: 5.0, carbsPer100g: 53.3, fatPer100g: 6.7,
    defaultQty: 2, quantityMode: "piece", gramsPerPiece: 60, emoji: "🥞",
  },
  {
    id: "tiramisu",
    name: "Tiramisu",
    category: "Sweets & Desserts",
    caloriesPer100g: 280, proteinPer100g: 4.5, carbsPer100g: 32.0, fatPer100g: 14.5,
    defaultQty: 100, quantityMode: "grams", emoji: "🍰",
  },

  // ═══════════════════════════════════════════════════════════
  // BEVERAGES (REMAINING)
  // ═══════════════════════════════════════════════════════════
  {
    id: "green-tea",
    name: "Green Tea / Black Tea (unsweetened)",
    category: "Beverages",
    caloriesPer100g: 1, proteinPer100g: 0.1, carbsPer100g: 0.1, fatPer100g: 0.0,
    defaultQty: 200, quantityMode: "ml", emoji: "🍵",
  },
  {
    id: "filter-coffee",
    name: "South Indian Filter Coffee",
    category: "Beverages",
    caloriesPer100g: 53, proteinPer100g: 1.5, carbsPer100g: 7.3, fatPer100g: 2.1,
    defaultQty: 150, quantityMode: "ml", emoji: "☕",
  },
  {
    id: "cappuccino",
    name: "Cappuccino (unsweetened)",
    category: "Beverages",
    caloriesPer100g: 55, proteinPer100g: 3.0, carbsPer100g: 4.5, fatPer100g: 3.0,
    defaultQty: 200, quantityMode: "ml", emoji: "☕",
  },
  {
    id: "sugarcane-juice",
    name: "Sugarcane Juice (fresh)",
    category: "Beverages",
    caloriesPer100g: 72, proteinPer100g: 0.0, carbsPer100g: 18.0, fatPer100g: 0.0,
    defaultQty: 250, quantityMode: "ml", emoji: "🥤",
  },
  {
    id: "diet-coke",
    name: "Diet Soda (Coke Zero/Pepsi Black)",
    category: "Beverages",
    caloriesPer100g: 0, proteinPer100g: 0.0, carbsPer100g: 0.0, fatPer100g: 0.0,
    defaultQty: 330, quantityMode: "ml", emoji: "🥤",
  },
  {
    id: "beer",
    name: "Beer",
    category: "Beverages",
    caloriesPer100g: 43, proteinPer100g: 0.3, carbsPer100g: 3.6, fatPer100g: 0.0,
    defaultQty: 330, quantityMode: "ml", emoji: "🍺",
  },
  {
    id: "wine",
    name: "Wine (Red/White)",
    category: "Beverages",
    caloriesPer100g: 83, proteinPer100g: 0.1, carbsPer100g: 2.7, fatPer100g: 0.0,
    defaultQty: 150, quantityMode: "ml", emoji: "🍷",
  },
  {
    id: "spirits",
    name: "Distilled Spirits (Whiskey/Vodka/Rum)",
    category: "Beverages",
    caloriesPer100g: 222, proteinPer100g: 0.0, carbsPer100g: 0.1, fatPer100g: 0.0,
    defaultQty: 45, quantityMode: "ml", emoji: "🥃",
  },

  // ═══════════════════════════════════════════════════════════
  // ITALIAN & FAST FOOD
  // ═══════════════════════════════════════════════════════════
  {
    id: "pizza-margherita-slice",
    name: "Pizza Margherita (slice)",
    category: "Junk Food",
    caloriesPer100g: 220, proteinPer100g: 8.0, carbsPer100g: 26.0, fatPer100g: 9.0,
    defaultQty: 1, quantityMode: "piece", gramsPerPiece: 100, emoji: "🍕",
  },
  {
    id: "pizza-chicken-tikka-slice",
    name: "Chicken Tikka Pizza (slice)",
    category: "Junk Food",
    caloriesPer100g: 230, proteinPer100g: 11.0, carbsPer100g: 23.0, fatPer100g: 10.0,
    defaultQty: 1, quantityMode: "piece", gramsPerPiece: 110, emoji: "🍕",
  },
  {
    id: "pasta-arrabbiata",
    name: "Veg Penne Arrabbiata",
    category: "Junk Food",
    caloriesPer100g: 120, proteinPer100g: 3.3, carbsPer100g: 20.7, fatPer100g: 2.7,
    defaultQty: 300, quantityMode: "grams", emoji: "🍝",
  },
  {
    id: "pasta-alfredo-chicken",
    name: "Chicken Alfredo Pasta",
    category: "Junk Food",
    caloriesPer100g: 154, proteinPer100g: 8.0, carbsPer100g: 16.6, fatPer100g: 6.3,
    defaultQty: 350, quantityMode: "grams", emoji: "🍝",
  },
  {
    id: "garlic-bread",
    name: "Garlic Bread Slice",
    category: "Junk Food",
    caloriesPer100g: 333, proteinPer100g: 8.3, carbsPer100g: 43.3, fatPer100g: 15.0,
    defaultQty: 2, quantityMode: "piece", gramsPerPiece: 30, emoji: "🍞",
  },
  {
    id: "burger-aloo-tikki",
    name: "Veg Aloo Tikki Burger",
    category: "Junk Food",
    caloriesPer100g: 213, proteinPer100g: 5.3, carbsPer100g: 32.0, fatPer100g: 7.3,
    defaultQty: 1, quantityMode: "piece", gramsPerPiece: 150, emoji: "🍔",
  },
  {
    id: "burger-mcchicken",
    name: "Chicken Classic Burger",
    category: "Junk Food",
    caloriesPer100g: 237, proteinPer100g: 8.7, carbsPer100g: 25.0, fatPer100g: 11.2,
    defaultQty: 1, quantityMode: "piece", gramsPerPiece: 160, emoji: "🍔",
  },
  {
    id: "chicken-nuggets",
    name: "Chicken Nuggets",
    category: "Junk Food",
    caloriesPer100g: 280, proteinPer100g: 15.0, carbsPer100g: 16.0, fatPer100g: 17.0,
    defaultQty: 6, quantityMode: "piece", gramsPerPiece: 16, emoji: "🍗",
  },

  // ═══════════════════════════════════════════════════════════
  // SPICY & INTERNATIONAL
  // ═══════════════════════════════════════════════════════════
  {
    id: "chilli-garlic-noodles",
    name: "Chilli Garlic Noodles",
    category: "Chinese",
    caloriesPer100g: 155, proteinPer100g: 3.0, carbsPer100g: 28.0, fatPer100g: 3.5,
    defaultQty: 200, quantityMode: "grams", emoji: "🥢",
  },
  {
    id: "schezwan-fried-rice",
    name: "Schezwan Fried Rice",
    category: "Chinese",
    caloriesPer100g: 170, proteinPer100g: 3.2, carbsPer100g: 31.0, fatPer100g: 3.8,
    defaultQty: 200, quantityMode: "grams", emoji: "🍚",
  },
  {
    id: "gobi-manchurian-dry",
    name: "Gobi Manchurian (dry)",
    category: "Chinese",
    caloriesPer100g: 140, proteinPer100g: 2.5, carbsPer100g: 18.0, fatPer100g: 6.5,
    defaultQty: 150, quantityMode: "grams", emoji: "🥦",
  },
  {
    id: "thai-green-curry",
    name: "Thai Green Curry",
    category: "Healthy & Fitness",
    caloriesPer100g: 110, proteinPer100g: 3.0, carbsPer100g: 6.0, fatPer100g: 8.5,
    defaultQty: 250, quantityMode: "grams", emoji: "🍲",
  },
  {
    id: "thai-red-curry",
    name: "Thai Red Curry",
    category: "Healthy & Fitness",
    caloriesPer100g: 115, proteinPer100g: 3.0, carbsPer100g: 6.5, fatPer100g: 9.0,
    defaultQty: 250, quantityMode: "grams", emoji: "🍲",
  },
  {
    id: "pad-thai",
    name: "Pad Thai Noodles",
    category: "Healthy & Fitness",
    caloriesPer100g: 150, proteinPer100g: 4.5, carbsPer100g: 26.0, fatPer100g: 3.5,
    defaultQty: 250, quantityMode: "grams", emoji: "🥢",
  },
  {
    id: "tom-yum-soup",
    name: "Tom Yum Soup",
    category: "Healthy & Fitness",
    caloriesPer100g: 30, proteinPer100g: 2.5, carbsPer100g: 3.0, fatPer100g: 1.0,
    defaultQty: 250, quantityMode: "ml", emoji: "🥣",
  },
  {
    id: "taco-veg",
    name: "Veg Taco",
    category: "Junk Food",
    caloriesPer100g: 188, proteinPer100g: 5.0, carbsPer100g: 22.5, fatPer100g: 8.7,
    defaultQty: 1, quantityMode: "piece", gramsPerPiece: 80, emoji: "🌮",
  },
  {
    id: "burrito-chicken",
    name: "Chicken Burrito",
    category: "Junk Food",
    caloriesPer100g: 193, proteinPer100g: 10.7, carbsPer100g: 22.7, fatPer100g: 6.7,
    defaultQty: 1, quantityMode: "piece", gramsPerPiece: 300, emoji: "🌯",
  },
  {
    id: "quesadilla-veg",
    name: "Quesadilla (Cheese & Veg)",
    category: "Junk Food",
    caloriesPer100g: 213, proteinPer100g: 8.0, carbsPer100g: 20.0, fatPer100g: 10.7,
    defaultQty: 1, quantityMode: "piece", gramsPerPiece: 150, emoji: "🌮",
  },
  {
    id: "nachos-salsa",
    name: "Nachos (with Cheese & Salsa)",
    category: "Junk Food",
    caloriesPer100g: 300, proteinPer100g: 6.0, carbsPer100g: 34.7, fatPer100g: 14.7,
    defaultQty: 150, quantityMode: "grams", emoji: "🌮",
  },
  {
    id: "falafel-wrap",
    name: "Falafel Wrap",
    category: "Healthy & Fitness",
    caloriesPer100g: 186, proteinPer100g: 5.0, carbsPer100g: 24.5, fatPer100g: 7.3,
    defaultQty: 1, quantityMode: "piece", gramsPerPiece: 220, emoji: "🌯",
  },
  {
    id: "chicken-shawarma",
    name: "Chicken Shawarma Wrap",
    category: "Junk Food",
    caloriesPer100g: 225, proteinPer100g: 13.0, carbsPer100g: 18.0, fatPer100g: 11.0,
    defaultQty: 1, quantityMode: "piece", gramsPerPiece: 200, emoji: "🌯",
  },

  // ═══════════════════════════════════════════════════════════
  // HEALTHY & FITNESS (REMAINING)
  // ═══════════════════════════════════════════════════════════
  {
    id: "garden-salad",
    name: "Garden Veg Salad (no dressing)",
    category: "Healthy & Fitness",
    caloriesPer100g: 20, proteinPer100g: 1.0, carbsPer100g: 4.0, fatPer100g: 0.1,
    defaultQty: 150, quantityMode: "grams", emoji: "🥗",
  },
  {
    id: "caesar-salad-chicken",
    name: "Chicken Caesar Salad (with dressing)",
    category: "Healthy & Fitness",
    caloriesPer100g: 140, proteinPer100g: 8.8, carbsPer100g: 4.0, fatPer100g: 10.0,
    defaultQty: 250, quantityMode: "grams", emoji: "🥗",
  },
  {
    id: "greek-salad",
    name: "Greek Salad (with feta & olive oil)",
    category: "Healthy & Fitness",
    caloriesPer100g: 75, proteinPer100g: 2.0, carbsPer100g: 4.0, fatPer100g: 6.0,
    defaultQty: 200, quantityMode: "grams", emoji: "🥗",
  },
  {
    id: "sprouted-moong-salad",
    name: "Sprouted Moong Salad",
    category: "Healthy & Fitness",
    caloriesPer100g: 75, proteinPer100g: 5.5, carbsPer100g: 12.0, fatPer100g: 0.5,
    defaultQty: 150, quantityMode: "grams", emoji: "🥗",
  },
  {
    id: "mixed-nuts",
    name: "Mixed Nuts (handful)",
    category: "Healthy & Fitness",
    caloriesPer100g: 600, proteinPer100g: 20.0, carbsPer100g: 20.0, fatPer100g: 53.3,
    defaultQty: 30, quantityMode: "grams", emoji: "🌰",
  },

  // ═══════════════════════════════════════════════════════════
  // INDIAN REGIONAL — MAHARASHTRIAN
  // ═══════════════════════════════════════════════════════════
  {
    id: "sabudana-khichdi",
    name: "Sabudana Khichdi",
    category: "Indian Dishes",
    caloriesPer100g: 160, proteinPer100g: 1.5, carbsPer100g: 31.0, fatPer100g: 3.5,
    defaultQty: 200, quantityMode: "grams", emoji: "🍲",
  },
  {
    id: "thalipeeth",
    name: "Thalipeeth",
    category: "Indian Dishes",
    caloriesPer100g: 225, proteinPer100g: 6.2, carbsPer100g: 35.0, fatPer100g: 7.5,
    defaultQty: 1, quantityMode: "piece", gramsPerPiece: 80, emoji: "🫓",
  },
  {
    id: "puran-poli",
    name: "Puran Poli",
    category: "Indian Dishes",
    caloriesPer100g: 300, proteinPer100g: 5.6, carbsPer100g: 55.0, fatPer100g: 6.2,
    defaultQty: 1, quantityMode: "piece", gramsPerPiece: 80, emoji: "🫓",
  },
  {
    id: "kothimbir-vadi",
    name: "Kothimbir Vadi",
    category: "Indian Dishes",
    caloriesPer100g: 250, proteinPer100g: 6.7, carbsPer100g: 30.0, fatPer100g: 11.7,
    defaultQty: 3, quantityMode: "piece", gramsPerPiece: 20, emoji: "🧆",
  },
  {
    id: "pithla",
    name: "Pithla (gram flour curry)",
    category: "Indian Dishes",
    caloriesPer100g: 115, proteinPer100g: 4.5, carbsPer100g: 11.5, fatPer100g: 5.5,
    defaultQty: 150, quantityMode: "grams", emoji: "🍲",
  },
  {
    id: "solkadhi",
    name: "Solkadhi",
    category: "Indian Dishes",
    caloriesPer100g: 73, proteinPer100g: 0.7, carbsPer100g: 2.3, fatPer100g: 6.7,
    defaultQty: 150, quantityMode: "ml", emoji: "🥤",
  },

  // ═══════════════════════════════════════════════════════════
  // INDIAN REGIONAL — SOUTH INDIAN
  // ═══════════════════════════════════════════════════════════
  {
    id: "medu-vada",
    name: "Medu Vada",
    category: "Indian Dishes",
    caloriesPer100g: 280, proteinPer100g: 7.0, carbsPer100g: 28.0, fatPer100g: 16.0,
    defaultQty: 2, quantityMode: "piece", gramsPerPiece: 50, emoji: "🍩",
  },
  {
    id: "ven-pongal",
    name: "Ven Pongal",
    category: "Indian Dishes",
    caloriesPer100g: 140, proteinPer100g: 3.0, carbsPer100g: 21.0, fatPer100g: 5.0,
    defaultQty: 200, quantityMode: "grams", emoji: "🍲",
  },
  {
    id: "coconut-chutney",
    name: "Coconut Chutney",
    category: "Indian Dishes",
    caloriesPer100g: 200, proteinPer100g: 2.7, carbsPer100g: 8.3, fatPer100g: 18.3,
    defaultQty: 30, quantityMode: "grams", emoji: "🥣",
  },
  {
    id: "rava-dosa",
    name: "Rava Dosa",
    category: "Indian Dishes",
    caloriesPer100g: 205, proteinPer100g: 4.5, carbsPer100g: 35.5, fatPer100g: 5.0,
    defaultQty: 1, quantityMode: "piece", gramsPerPiece: 90, emoji: "🫓",
  },
  {
    id: "lemon-rice",
    name: "Lemon Rice",
    category: "Indian Dishes",
    caloriesPer100g: 145, proteinPer100g: 2.6, carbsPer100g: 27.0, fatPer100g: 2.9,
    defaultQty: 200, quantityMode: "grams", emoji: "🍚",
  },

  // ═══════════════════════════════════════════════════════════
  // INDIAN REGIONAL — GUJARATI
  // ═══════════════════════════════════════════════════════════
  {
    id: "thepla",
    name: "Methi Thepla",
    category: "Indian Dishes",
    caloriesPer100g: 275, proteinPer100g: 7.0, carbsPer100g: 42.5, fatPer100g: 8.7,
    defaultQty: 2, quantityMode: "piece", gramsPerPiece: 40, emoji: "🫓",
  },
  {
    id: "khandvi",
    name: "Khandvi",
    category: "Indian Dishes",
    caloriesPer100g: 150, proteinPer100g: 4.4, carbsPer100g: 18.8, fatPer100g: 6.2,
    defaultQty: 80, quantityMode: "grams", emoji: "🟡",
  },
  {
    id: "khakhra-plain",
    name: "Khakhra (plain)",
    category: "Indian Dishes",
    caloriesPer100g: 400, proteinPer100g: 10.0, carbsPer100g: 66.7, fatPer100g: 12.0,
    defaultQty: 2, quantityMode: "piece", gramsPerPiece: 15, emoji: "🍘",
  },
  {
    id: "handvo",
    name: "Handvo (baked)",
    category: "Indian Dishes",
    caloriesPer100g: 180, proteinPer100g: 6.0, carbsPer100g: 25.0, fatPer100g: 6.0,
    defaultQty: 1, quantityMode: "piece", gramsPerPiece: 100, emoji: "🥮",
  },
  {
    id: "fafda",
    name: "Fafda",
    category: "Indian Dishes",
    caloriesPer100g: 488, proteinPer100g: 10.0, carbsPer100g: 53.3, fatPer100g: 25.5,
    defaultQty: 3, quantityMode: "piece", gramsPerPiece: 15, emoji: "🥢",
  },

  // ═══════════════════════════════════════════════════════════
  // INDIAN REGIONAL — BENGALI
  // ═══════════════════════════════════════════════════════════
  {
    id: "luchi",
    name: "Luchi (refined flour)",
    category: "Indian Dishes",
    caloriesPer100g: 360, proteinPer100g: 4.8, carbsPer100g: 44.0, fatPer100g: 18.0,
    defaultQty: 2, quantityMode: "piece", gramsPerPiece: 25, emoji: "🫓",
  },
  {
    id: "alur-dom",
    name: "Alur Dom",
    category: "Indian Dishes",
    caloriesPer100g: 107, proteinPer100g: 2.0, carbsPer100g: 16.0, fatPer100g: 4.0,
    defaultQty: 150, quantityMode: "grams", emoji: "🥔",
  },
  {
    id: "macher-jhol",
    name: "Macher Jhol (fish curry)",
    category: "Indian Dishes",
    caloriesPer100g: 90, proteinPer100g: 10.0, carbsPer100g: 3.0, fatPer100g: 4.5,
    defaultQty: 200, quantityMode: "grams", emoji: "🐟",
  },
  {
    id: "cholar-dal",
    name: "Cholar Dal",
    category: "Indian Dishes",
    caloriesPer100g: 130, proteinPer100g: 6.0, carbsPer100g: 18.7, fatPer100g: 3.3,
    defaultQty: 150, quantityMode: "grams", emoji: "🥣",
  },

  // ═══════════════════════════════════════════════════════════
  // INDIAN REGIONAL — RAJASTHANI & KASHMIRI
  // ═══════════════════════════════════════════════════════════
  {
    id: "dal-baati-churma",
    name: "Dal Baati Churma",
    category: "Indian Dishes",
    caloriesPer100g: 386, proteinPer100g: 8.0, carbsPer100g: 52.0, fatPer100g: 16.0,
    defaultQty: 150, quantityMode: "grams", emoji: "🍽️",
  },
  {
    id: "gatte-ki-sabji",
    name: "Gatte ki Sabji",
    category: "Indian Dishes",
    caloriesPer100g: 113, proteinPer100g: 4.0, carbsPer100g: 9.3, fatPer100g: 6.7,
    defaultQty: 150, quantityMode: "grams", emoji: "🍛",
  },
  {
    id: "rogan-josh",
    name: "Kashmiri Rogan Josh",
    category: "Indian Dishes",
    caloriesPer100g: 155, proteinPer100g: 12.0, carbsPer100g: 2.0, fatPer100g: 11.0,
    defaultQty: 200, quantityMode: "grams", emoji: "🍛",
  },
  {
    id: "dum-aloo-kashmiri",
    name: "Kashmiri Dum Aloo",
    category: "Indian Dishes",
    caloriesPer100g: 126, proteinPer100g: 2.3, carbsPer100g: 16.0, fatPer100g: 6.0,
    defaultQty: 150, quantityMode: "grams", emoji: "🥔",
  },

  // ═══════════════════════════════════════════════════════════
  // CHUTNEYS & PICKLES
  // ═══════════════════════════════════════════════════════════
  {
    id: "mint-chutney",
    name: "Mint Chutney",
    category: "Indian Dishes",
    caloriesPer100g: 50, proteinPer100g: 2.0, carbsPer100g: 8.0, fatPer100g: 1.0,
    defaultQty: 20, quantityMode: "grams", emoji: "🌿",
  },
  {
    id: "tamarind-chutney",
    name: "Tamarind Chutney",
    category: "Indian Dishes",
    caloriesPer100g: 200, proteinPer100g: 0.5, carbsPer100g: 50.0, fatPer100g: 0.0,
    defaultQty: 20, quantityMode: "grams", emoji: "🍯",
  },
  {
    id: "mango-pickle",
    name: "Mango Pickle (Aam ka Achar)",
    category: "Indian Dishes",
    caloriesPer100g: 120, proteinPer100g: 1.0, carbsPer100g: 5.0, fatPer100g: 10.0,
    defaultQty: 15, quantityMode: "grams", emoji: "🥭",
  },
  {
    id: "lime-pickle",
    name: "Lime Pickle",
    category: "Indian Dishes",
    caloriesPer100g: 115, proteinPer100g: 1.0, carbsPer100g: 6.0, fatPer100g: 9.0,
    defaultQty: 15, quantityMode: "grams", emoji: "🍋",
  },
  {
    id: "garlic-chutney-dry",
    name: "Garlic Chutney (dry)",
    category: "Indian Dishes",
    caloriesPer100g: 300, proteinPer100g: 8.0, carbsPer100g: 30.0, fatPer100g: 18.0,
    defaultQty: 15, quantityMode: "grams", emoji: "🧄",
  },

  // ═══════════════════════════════════════════════════════════
  // EGG DISHES (REMAINING)
  // ═══════════════════════════════════════════════════════════
  {
    id: "egg-curry",
    name: "Egg Curry",
    category: "Indian Dishes",
    caloriesPer100g: 140, proteinPer100g: 10.0, carbsPer100g: 6.0, fatPer100g: 8.0,
    defaultQty: 200, quantityMode: "grams", emoji: "🍛",
  },
  {
    id: "egg-fried-rice",
    name: "Egg Fried Rice",
    category: "Chinese",
    caloriesPer100g: 175, proteinPer100g: 7.0, carbsPer100g: 26.0, fatPer100g: 5.0,
    defaultQty: 200, quantityMode: "grams", emoji: "🍚",
  },
  {
    id: "egg-paratha",
    name: "Egg Paratha",
    category: "Bread & Roti",
    caloriesPer100g: 240, proteinPer100g: 8.0, carbsPer100g: 38.0, fatPer100g: 7.0,
    defaultQty: 1, quantityMode: "piece", gramsPerPiece: 100, emoji: "🫓",
  },

  // ═══════════════════════════════════════════════════════════
  // INDIAN REGIONAL — SOUTH INDIAN (REMAINING)
  // ═══════════════════════════════════════════════════════════
  {
    id: "appam",
    name: "Appam",
    category: "Indian Dishes",
    caloriesPer100g: 130, proteinPer100g: 2.5, carbsPer100g: 25.0, fatPer100g: 2.0,
    defaultQty: 2, quantityMode: "piece", gramsPerPiece: 75, emoji: "🫓",
  },
  {
    id: "neer-dosa",
    name: "Neer Dosa",
    category: "Indian Dishes",
    caloriesPer100g: 135, proteinPer100g: 2.0, carbsPer100g: 28.0, fatPer100g: 1.5,
    defaultQty: 2, quantityMode: "piece", gramsPerPiece: 60, emoji: "🫓",
  },
  {
    id: "pesarattu",
    name: "Pesarattu (Moong Dal Dosa)",
    category: "Indian Dishes",
    caloriesPer100g: 140, proteinPer100g: 5.0, carbsPer100g: 22.0, fatPer100g: 3.0,
    defaultQty: 1, quantityMode: "piece", gramsPerPiece: 100, emoji: "🫓",
  },
  {
    id: "set-dosa",
    name: "Set Dosa (soft, thick)",
    category: "Indian Dishes",
    caloriesPer100g: 145, proteinPer100g: 3.5, carbsPer100g: 28.0, fatPer100g: 2.0,
    defaultQty: 2, quantityMode: "piece", gramsPerPiece: 70, emoji: "🫓",
  },

  // ═══════════════════════════════════════════════════════════
  // BEVERAGES — SEASONAL INDIAN
  // ═══════════════════════════════════════════════════════════
  {
    id: "aam-panna",
    name: "Aam Panna",
    category: "Beverages",
    caloriesPer100g: 45, proteinPer100g: 0.3, carbsPer100g: 11.0, fatPer100g: 0.0,
    defaultQty: 250, quantityMode: "ml", emoji: "🥤",
  },
  {
    id: "jaljeera",
    name: "Jaljeera",
    category: "Beverages",
    caloriesPer100g: 15, proteinPer100g: 0.5, carbsPer100g: 3.0, fatPer100g: 0.0,
    defaultQty: 250, quantityMode: "ml", emoji: "🥤",
  },
  {
    id: "thandai",
    name: "Thandai",
    category: "Beverages",
    caloriesPer100g: 110, proteinPer100g: 4.0, carbsPer100g: 16.0, fatPer100g: 4.0,
    defaultQty: 250, quantityMode: "ml", emoji: "🥛",
  },
  {
    id: "masala-chaas",
    name: "Masala Chaas (spiced buttermilk)",
    category: "Beverages",
    caloriesPer100g: 35, proteinPer100g: 2.0, carbsPer100g: 4.0, fatPer100g: 1.0,
    defaultQty: 300, quantityMode: "ml", emoji: "🥛",
  },

  // ═══════════════════════════════════════════════════════════
  // SOUPS
  // ═══════════════════════════════════════════════════════════
  {
    id: "tomato-soup",
    name: "Cream of Tomato Soup",
    category: "Healthy & Fitness",
    caloriesPer100g: 45, proteinPer100g: 1.0, carbsPer100g: 7.0, fatPer100g: 1.5,
    defaultQty: 250, quantityMode: "ml", emoji: "🍅",
  },
  {
    id: "sweet-corn-soup-veg",
    name: "Sweet Corn Soup (Veg)",
    category: "Healthy & Fitness",
    caloriesPer100g: 60, proteinPer100g: 2.0, carbsPer100g: 12.0, fatPer100g: 1.0,
    defaultQty: 250, quantityMode: "ml", emoji: "🌽",
  },
  {
    id: "sweet-corn-soup-chicken",
    name: "Sweet Corn Soup (Chicken)",
    category: "Healthy & Fitness",
    caloriesPer100g: 70, proteinPer100g: 4.0, carbsPer100g: 10.0, fatPer100g: 1.5,
    defaultQty: 250, quantityMode: "ml", emoji: "🌽",
  },
  {
    id: "dal-shorba",
    name: "Dal Shorba",
    category: "Healthy & Fitness",
    caloriesPer100g: 50, proteinPer100g: 3.0, carbsPer100g: 8.0, fatPer100g: 1.0,
    defaultQty: 250, quantityMode: "ml", emoji: "🥣",
  },
  {
    id: "hot-sour-soup-chicken",
    name: "Hot & Sour Chicken Soup",
    category: "Chinese",
    caloriesPer100g: 55, proteinPer100g: 4.0, carbsPer100g: 5.0, fatPer100g: 2.0,
    defaultQty: 250, quantityMode: "ml", emoji: "🥣",
  },

  // ═══════════════════════════════════════════════════════════
  // BREADS — REGIONAL INDIAN
  // ═══════════════════════════════════════════════════════════
  {
    id: "makki-di-roti",
    name: "Makki Di Roti",
    category: "Bread & Roti",
    caloriesPer100g: 250, proteinPer100g: 6.0, carbsPer100g: 45.0, fatPer100g: 6.0,
    defaultQty: 1, quantityMode: "piece", gramsPerPiece: 80, emoji: "🫓",
  },
  {
    id: "missi-roti",
    name: "Missi Roti",
    category: "Bread & Roti",
    caloriesPer100g: 280, proteinPer100g: 9.0, carbsPer100g: 48.0, fatPer100g: 7.0,
    defaultQty: 1, quantityMode: "piece", gramsPerPiece: 50, emoji: "🫓",
  },
  {
    id: "roomali-roti",
    name: "Roomali Roti",
    category: "Bread & Roti",
    caloriesPer100g: 275, proteinPer100g: 8.0, carbsPer100g: 52.0, fatPer100g: 5.0,
    defaultQty: 2, quantityMode: "piece", gramsPerPiece: 50, emoji: "🫓",
  },
  {
    id: "baati",
    name: "Baati (baked wheat dumpling)",
    category: "Bread & Roti",
    caloriesPer100g: 350, proteinPer100g: 9.0, carbsPer100g: 55.0, fatPer100g: 12.0,
    defaultQty: 2, quantityMode: "piece", gramsPerPiece: 75, emoji: "🫓",
  },
  {
    id: "kulcha",
    name: "Kulcha (leavened flatbread)",
    category: "Bread & Roti",
    caloriesPer100g: 290, proteinPer100g: 8.0, carbsPer100g: 50.0, fatPer100g: 7.0,
    defaultQty: 1, quantityMode: "piece", gramsPerPiece: 80, emoji: "🫓",
  },

  // ═══════════════════════════════════════════════════════════
  // COMBO MEALS — THALI
  // ═══════════════════════════════════════════════════════════
  {
    id: "veg-thali",
    name: "Veg Thali (full meal)",
    category: "Indian Dishes",
    caloriesPer100g: 140, proteinPer100g: 4.0, carbsPer100g: 22.0, fatPer100g: 4.0,
    defaultQty: 1, quantityMode: "serving", mlPerServing: 500, emoji: "🍽️",
  },
  {
    id: "non-veg-thali",
    name: "Non-Veg Thali (full meal)",
    category: "Indian Dishes",
    caloriesPer100g: 170, proteinPer100g: 10.0, carbsPer100g: 20.0, fatPer100g: 6.0,
    defaultQty: 1, quantityMode: "serving", mlPerServing: 550, emoji: "🍽️",
  },
  {
    id: "south-indian-thali",
    name: "South Indian Thali",
    category: "Indian Dishes",
    caloriesPer100g: 130, proteinPer100g: 4.0, carbsPer100g: 24.0, fatPer100g: 3.0,
    defaultQty: 1, quantityMode: "serving", mlPerServing: 500, emoji: "🍽️",
  },
  {
    id: "north-indian-thali",
    name: "North Indian Thali",
    category: "Indian Dishes",
    caloriesPer100g: 155, proteinPer100g: 6.0, carbsPer100g: 22.0, fatPer100g: 5.0,
    defaultQty: 1, quantityMode: "serving", mlPerServing: 550, emoji: "🍽️",
  },

  // ═══════════════════════════════════════════════════════════
  // PIZZAS (REMAINING)
  // ═══════════════════════════════════════════════════════════
  {
    id: "pizza-paneer-tikka-slice",
    name: "Paneer Tikka Pizza (slice)",
    category: "Junk Food",
    caloriesPer100g: 240, proteinPer100g: 9.0, carbsPer100g: 24.0, fatPer100g: 11.0,
    defaultQty: 1, quantityMode: "piece", gramsPerPiece: 110, emoji: "🍕",
  },
  {
    id: "pizza-farm-fresh-slice",
    name: "Farm Fresh Pizza (slice)",
    category: "Junk Food",
    caloriesPer100g: 210, proteinPer100g: 7.0, carbsPer100g: 25.0, fatPer100g: 9.0,
    defaultQty: 1, quantityMode: "piece", gramsPerPiece: 100, emoji: "🍕",
  },

  // ═══════════════════════════════════════════════════════════
  // PROTEIN DRINKS & SHAKES
  // ═══════════════════════════════════════════════════════════
  {
    id: "sattu-drink",
    name: "Sattu Drink",
    category: "Beverages",
    caloriesPer100g: 80, proteinPer100g: 5.0, carbsPer100g: 14.0, fatPer100g: 1.5,
    defaultQty: 250, quantityMode: "ml", emoji: "💪",
  },
  {
    id: "ragi-malt",
    name: "Ragi Malt (finger millet)",
    category: "Beverages",
    caloriesPer100g: 65, proteinPer100g: 3.0, carbsPer100g: 12.0, fatPer100g: 1.0,
    defaultQty: 250, quantityMode: "ml", emoji: "🥛",
  },
  {
    id: "badam-milk",
    name: "Badam Milk",
    category: "Beverages",
    caloriesPer100g: 100, proteinPer100g: 4.0, carbsPer100g: 14.0, fatPer100g: 3.5,
    defaultQty: 250, quantityMode: "ml", emoji: "🥛",
  },
  {
    id: "banana-shake",
    name: "Banana Shake (with milk)",
    category: "Beverages",
    caloriesPer100g: 90, proteinPer100g: 3.0, carbsPer100g: 16.0, fatPer100g: 2.0,
    defaultQty: 300, quantityMode: "ml", emoji: "🍌",
  },

  // ═══════════════════════════════════════════════════════════
  // SWEETS & DESSERTS (REMAINING REGIONAL)
  // ═══════════════════════════════════════════════════════════
  {
    id: "phirni",
    name: "Phirni (ground rice pudding)",
    category: "Sweets & Desserts",
    caloriesPer100g: 130, proteinPer100g: 4.0, carbsPer100g: 20.0, fatPer100g: 4.0,
    defaultQty: 150, quantityMode: "grams", emoji: "🍮",
  },
  {
    id: "malpua",
    name: "Malpua (fried sweet pancake)",
    category: "Sweets & Desserts",
    caloriesPer100g: 350, proteinPer100g: 5.0, carbsPer100g: 48.0, fatPer100g: 15.0,
    defaultQty: 1, quantityMode: "piece", gramsPerPiece: 70, emoji: "🥞",
  },
  {
    id: "gujiya",
    name: "Gujiya (Holi sweet)",
    category: "Sweets & Desserts",
    caloriesPer100g: 400, proteinPer100g: 6.0, carbsPer100g: 52.0, fatPer100g: 18.0,
    defaultQty: 2, quantityMode: "piece", gramsPerPiece: 45, emoji: "🥟",
  },
  {
    id: "rabdi",
    name: "Rabdi (thickened sweet milk)",
    category: "Sweets & Desserts",
    caloriesPer100g: 250, proteinPer100g: 6.0, carbsPer100g: 28.0, fatPer100g: 13.0,
    defaultQty: 100, quantityMode: "grams", emoji: "🥣",
  },
  {
    id: "moong-dal-halwa",
    name: "Moong Dal Halwa",
    category: "Sweets & Desserts",
    caloriesPer100g: 450, proteinPer100g: 8.0, carbsPer100g: 50.0, fatPer100g: 24.0,
    defaultQty: 100, quantityMode: "grams", emoji: "🍮",
  },
  {
    id: "peda",
    name: "Peda (milk fudge)",
    category: "Sweets & Desserts",
    caloriesPer100g: 420, proteinPer100g: 8.0, carbsPer100g: 50.0, fatPer100g: 20.0,
    defaultQty: 2, quantityMode: "piece", gramsPerPiece: 25, emoji: "🍬",
  },

  // ═══════════════════════════════════════════════════════════
  // SOURCES: NutriScan, SnapCalorie, Clearcals, Tarladalal,
  // Nutritionix, EatThisMuch — cross-referenced
  // ═══════════════════════════════════════════════════════════

  // ─── STREET FOOD (REMAINING) ─────────────────────────────
  {
    id: "dabeli",
    name: "Dabeli",
    category: "Snacks & Street Food",
    caloriesPer100g: 167, proteinPer100g: 4.0, carbsPer100g: 26.7, fatPer100g: 5.3,
    defaultQty: 1, quantityMode: "piece", gramsPerPiece: 150, emoji: "🍔",
  },
  {
    id: "sev-puri",
    name: "Sev Puri (6 pcs)",
    category: "Snacks & Street Food",
    caloriesPer100g: 200, proteinPer100g: 3.5, carbsPer100g: 28.0, fatPer100g: 8.5,
    defaultQty: 6, quantityMode: "piece", gramsPerPiece: 20, emoji: "🍽️",
  },
  {
    id: "dahi-puri",
    name: "Dahi Puri (6 pcs)",
    category: "Snacks & Street Food",
    caloriesPer100g: 160, proteinPer100g: 4.0, carbsPer100g: 24.0, fatPer100g: 5.5,
    defaultQty: 6, quantityMode: "piece", gramsPerPiece: 22, emoji: "🍽️",
  },
  {
    id: "ragda-pattice",
    name: "Ragda Pattice",
    category: "Snacks & Street Food",
    caloriesPer100g: 140, proteinPer100g: 4.0, carbsPer100g: 20.0, fatPer100g: 4.8,
    defaultQty: 1, quantityMode: "serving", mlPerServing: 250, emoji: "🍲",
  },

  // ─── TANDOORI & TIKKA (DRY) ──────────────────────────────
  {
    id: "tandoori-chicken",
    name: "Tandoori Chicken (dry)",
    category: "Chicken & Meat",
    caloriesPer100g: 165, proteinPer100g: 29.5, carbsPer100g: 1.0, fatPer100g: 6.0,
    defaultQty: 200, quantityMode: "grams", emoji: "🍗",
  },
  {
    id: "chicken-tikka-dry",
    name: "Chicken Tikka (dry)",
    category: "Chicken & Meat",
    caloriesPer100g: 150, proteinPer100g: 22.0, carbsPer100g: 3.0, fatPer100g: 6.0,
    defaultQty: 150, quantityMode: "grams", emoji: "🍗",
  },

  // ─── STUFFED PARATHAS ────────────────────────────────────
  {
    id: "paneer-paratha",
    name: "Paneer Paratha",
    category: "Bread & Roti",
    caloriesPer100g: 276, proteinPer100g: 10.3, carbsPer100g: 30.0, fatPer100g: 14.4,
    defaultQty: 1, quantityMode: "piece", gramsPerPiece: 100, emoji: "🫓",
  },
  {
    id: "gobi-paratha",
    name: "Gobi Paratha",
    category: "Bread & Roti",
    caloriesPer100g: 230, proteinPer100g: 6.0, carbsPer100g: 34.0, fatPer100g: 8.0,
    defaultQty: 1, quantityMode: "piece", gramsPerPiece: 100, emoji: "🫓",
  },
  {
    id: "mooli-paratha",
    name: "Mooli Paratha",
    category: "Bread & Roti",
    caloriesPer100g: 245, proteinPer100g: 6.0, carbsPer100g: 35.0, fatPer100g: 9.0,
    defaultQty: 1, quantityMode: "piece", gramsPerPiece: 100, emoji: "🫓",
  },

  // ─── RICE DISHES ─────────────────────────────────────────
  {
    id: "jeera-rice",
    name: "Jeera Rice",
    category: "Rice & Grains",
    caloriesPer100g: 160, proteinPer100g: 3.4, carbsPer100g: 30.0, fatPer100g: 3.2,
    defaultQty: 150, quantityMode: "grams", emoji: "🍚",
  },
  {
    id: "curd-rice",
    name: "Curd Rice / Thayir Sadam",
    category: "Rice & Grains",
    caloriesPer100g: 156, proteinPer100g: 3.5, carbsPer100g: 22.0, fatPer100g: 5.0,
    defaultQty: 200, quantityMode: "grams", emoji: "🍚",
  },
  {
    id: "bisibelebath",
    name: "Bisibelebath",
    category: "Indian Dishes",
    caloriesPer100g: 140, proteinPer100g: 3.2, carbsPer100g: 24.0, fatPer100g: 4.0,
    defaultQty: 250, quantityMode: "grams", emoji: "🍲",
  },

  // ─── SOUTH INDIAN (FITNESS) ──────────────────────────────
  {
    id: "ragi-dosa",
    name: "Ragi Dosa",
    category: "Indian Dishes",
    caloriesPer100g: 200, proteinPer100g: 3.5, carbsPer100g: 32.0, fatPer100g: 5.0,
    defaultQty: 1, quantityMode: "piece", gramsPerPiece: 80, emoji: "🫓",
  },
  {
    id: "ragi-roti",
    name: "Ragi Roti",
    category: "Bread & Roti",
    caloriesPer100g: 230, proteinPer100g: 5.0, carbsPer100g: 42.0, fatPer100g: 4.0,
    defaultQty: 1, quantityMode: "piece", gramsPerPiece: 70, emoji: "🫓",
  },
  {
    id: "paniyaram",
    name: "Kuzhi Paniyaram",
    category: "Indian Dishes",
    caloriesPer100g: 200, proteinPer100g: 4.0, carbsPer100g: 30.0, fatPer100g: 6.0,
    defaultQty: 4, quantityMode: "piece", gramsPerPiece: 30, emoji: "🧆",
  },

  // ─── FISH & KEBABS ───────────────────────────────────────
  {
    id: "fish-fry-indian",
    name: "Indian Style Fish Fry",
    category: "Fish & Seafood",
    caloriesPer100g: 224, proteinPer100g: 14.0, carbsPer100g: 2.0, fatPer100g: 18.0,
    defaultQty: 150, quantityMode: "grams", emoji: "🐟",
  },
  {
    id: "seekh-kebab-chicken",
    name: "Chicken Seekh Kebab",
    category: "Chicken & Meat",
    caloriesPer100g: 160, proteinPer100g: 18.0, carbsPer100g: 2.0, fatPer100g: 9.0,
    defaultQty: 2, quantityMode: "piece", gramsPerPiece: 50, emoji: "🍢",
  },
  {
    id: "seekh-kebab-mutton",
    name: "Mutton Seekh Kebab",
    category: "Chicken & Meat",
    caloriesPer100g: 243, proteinPer100g: 15.0, carbsPer100g: 3.0, fatPer100g: 19.0,
    defaultQty: 2, quantityMode: "piece", gramsPerPiece: 50, emoji: "🍢",
  },
  {
    id: "shami-kebab",
    name: "Shami Kebab",
    category: "Chicken & Meat",
    caloriesPer100g: 200, proteinPer100g: 14.0, carbsPer100g: 10.0, fatPer100g: 12.0,
    defaultQty: 2, quantityMode: "piece", gramsPerPiece: 45, emoji: "🍢",
  },
];

// Note: BUILT_IN_FOODS is used by seed.ts for DB population.
// Search/calculator utilities live in the frontend's lib/foodDatabase.ts.

export const ALL_CATEGORIES = [
  "Indian Dishes", "Dal & Legumes", "Rice & Grains", "Bread & Roti",
  "Eggs & Dairy", "Chicken & Meat", "Fish & Seafood", "Vegetables",
  "Fruits", "Snacks & Street Food", "Chinese", "Sandwiches",
  "Junk Food", "Healthy & Fitness", "Beverages", "Sweets & Desserts",
  "Custom",
] as const;

export function calculateMacros(item: { caloriesPer100g: number; proteinPer100g: number; carbsPer100g: number; fatPer100g: number }, quantityGrams: number) {
  const ratio = quantityGrams / 100;
  return {
    calories: Math.round(item.caloriesPer100g * ratio),
    protein: Math.round(item.proteinPer100g * ratio * 10) / 10,
    carbs: Math.round(item.carbsPer100g * ratio * 10) / 10,
    fat: Math.round(item.fatPer100g * ratio * 10) / 10,
  };
}

export function displayQtyToGrams(item: { quantityMode: string; gramsPerPiece?: number; mlPerServing?: number }, displayQty: number): number {
  if (item.quantityMode === "piece" && item.gramsPerPiece) return displayQty * item.gramsPerPiece;
  if (item.quantityMode === "serving" && item.mlPerServing) return displayQty * item.mlPerServing;
  return displayQty;
}

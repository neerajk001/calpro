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

  // ═══════════════════════════════════════════════════════════
  // FRUITS
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

  // ═══════════════════════════════════════════════════════════
  // INDIAN DISHES
  // ═══════════════════════════════════════════════════════════
  {
    id: "idli",
    name: "Idli",
    category: "Indian Dishes",
    caloriesPer100g: 58, proteinPer100g: 2, carbsPer100g: 12, fatPer100g: 0.4,
    defaultQty: 3, quantityMode: "piece", gramsPerPiece: 50, emoji: "🍽️",
  },
  {
    id: "dosa-plain",
    name: "Plain Dosa",
    category: "Indian Dishes",
    caloriesPer100g: 168, proteinPer100g: 3.9, carbsPer100g: 31, fatPer100g: 3.7,
    defaultQty: 1, quantityMode: "piece", gramsPerPiece: 90, emoji: "🫓",
  },
  {
    id: "masala-dosa",
    name: "Masala Dosa",
    category: "Indian Dishes",
    caloriesPer100g: 195, proteinPer100g: 4.5, carbsPer100g: 34, fatPer100g: 5.5,
    defaultQty: 1, quantityMode: "piece", gramsPerPiece: 150, emoji: "🫓",
  },
  {
    id: "sambar",
    name: "Sambar",
    category: "Indian Dishes",
    caloriesPer100g: 50, proteinPer100g: 3, carbsPer100g: 8, fatPer100g: 1,
    defaultQty: 200, quantityMode: "ml", emoji: "🍲",
  },
  {
    id: "chicken-curry",
    name: "Chicken Curry (home style)",
    category: "Indian Dishes",
    caloriesPer100g: 160, proteinPer100g: 14, carbsPer100g: 6, fatPer100g: 9,
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
    caloriesPer100g: 149, proteinPer100g: 7.5, carbsPer100g: 18, fatPer100g: 5,
    defaultQty: 250, quantityMode: "grams", emoji: "🍲",
  },
  {
    id: "palak-paneer",
    name: "Palak Paneer",
    category: "Indian Dishes",
    caloriesPer100g: 170, proteinPer100g: 9, carbsPer100g: 8, fatPer100g: 11,
    defaultQty: 200, quantityMode: "grams", emoji: "🍛",
  },
  {
    id: "shahi-paneer",
    name: "Shahi Paneer",
    category: "Indian Dishes",
    caloriesPer100g: 220, proteinPer100g: 10, carbsPer100g: 9, fatPer100g: 17,
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
];

// ─── Search Helper ─────────────────────────────────────────────────────────────

export function searchFoodDb(query: string, customFoods: FoodDbItem[] = []): FoodDbItem[] {
  const allFoods = [...BUILT_IN_FOODS, ...customFoods];
  if (!query.trim()) return allFoods;
  const q = query.toLowerCase().trim();
  return allFoods.filter(
    (f) =>
      f.name.toLowerCase().includes(q) ||
      f.category.toLowerCase().includes(q) ||
      (f.emoji && f.emoji.includes(q))
  );
}

export function getFoodById(id: string, customFoods: FoodDbItem[] = []): FoodDbItem | undefined {
  return [...BUILT_IN_FOODS, ...customFoods].find((f) => f.id === id);
}

export function getFoodsByCategory(category: string, customFoods: FoodDbItem[] = []): FoodDbItem[] {
  return [...BUILT_IN_FOODS, ...customFoods].filter((f) => f.category === category);
}

export const ALL_CATEGORIES = [
  "Indian Dishes",
  "Dal & Legumes",
  "Rice & Grains",
  "Bread & Roti",
  "Eggs & Dairy",
  "Chicken & Meat",
  "Fish & Seafood",
  "Vegetables",
  "Fruits",
  "Snacks & Street Food",
  "Chinese",
  "Sandwiches",
  "Junk Food",
  "Healthy & Fitness",
  "Beverages",
  "Sweets & Desserts",
  "Custom",
] as const;

// ─── Macro Calculator ─────────────────────────────────────────────────────────

export function calculateMacros(item: FoodDbItem, quantityGrams: number) {
  const ratio = quantityGrams / 100;
  return {
    calories: Math.round(item.caloriesPer100g * ratio),
    protein: Math.round(item.proteinPer100g * ratio * 10) / 10,
    carbs: Math.round(item.carbsPer100g * ratio * 10) / 10,
    fat: Math.round(item.fatPer100g * ratio * 10) / 10,
  };
}

export function displayQtyToGrams(item: FoodDbItem, displayQty: number): number {
  if (item.quantityMode === "piece" && item.gramsPerPiece) {
    return displayQty * item.gramsPerPiece;
  }
  if (item.quantityMode === "serving" && item.mlPerServing) {
    return displayQty * item.mlPerServing;
  }
  return displayQty; // grams or ml — treat as 1:1
}

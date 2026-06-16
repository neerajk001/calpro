"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import type { FoodDbItem, MealBuilderItem, QuantityMode } from "@/lib/types";
import { BUILT_IN_FOODS, ALL_CATEGORIES, calculateMacros, displayQtyToGrams } from "@/lib/foodDatabase";
import { apiClient } from "@/lib/apiClient";

interface FoodDBSearchProps {
  customFoods: FoodDbItem[];
  onAddToMeal: (item: MealBuilderItem) => void;
  trackCarbsFat: boolean;
  initialFoodId?: string;
  scannedFood?: FoodDbItem;
  onScanClick?: () => void;
}

export function FoodDBSearch({ customFoods, onAddToMeal, trackCarbsFat, initialFoodId, scannedFood, onScanClick }: FoodDBSearchProps) {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedFood, setSelectedFood] = useState<FoodDbItem | null>(null);
  const [displayQty, setDisplayQty] = useState(100);
  const [quantityMode, setQuantityMode] = useState<QuantityMode>("grams");
  const [results, setResults] = useState<FoodDbItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [cookingMethod, setCookingMethod] = useState<"normal" | "boiled" | "fried" | "ghee">("normal");

  const selectFood = useCallback((food: FoodDbItem) => {
    setSelectedFood(food);
    setQuantityMode(food.quantityMode);
    setDisplayQty(food.defaultQty);
    setCookingMethod("normal");
  }, []);

  function highlightMatch(text: string, q: string) {
    if (!q) return text;
    const idx = text.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <span className="text-[#1DB954]">{text.slice(idx, idx + q.length)}</span>
        {text.slice(idx + q.length)}
      </>
    );
  }

  // Sync / search logic
  useEffect(() => {
    if (!query.trim()) {
      // Show default list (built-in + custom foods)
      let foods = [...BUILT_IN_FOODS, ...customFoods];
      if (selectedCategory !== "All") {
        foods = foods.filter((f) => f.category === selectedCategory);
      }
      setResults(foods.slice(0, 40));
      setLoading(false);
      return;
    }

    setLoading(true);
    const handler = setTimeout(() => {
      apiClient.searchFoods(query)
        .then((apiResults) => {
          let filtered = apiResults;
          if (selectedCategory !== "All") {
            filtered = apiResults.filter((f) => f.category === selectedCategory);
          }
          setResults(filtered);
        })
        .catch((err) => {
          console.error("Search query failed:", err);
          setResults([]);
        })
        .finally(() => {
          setLoading(false);
        });
    }, 150);

    return () => clearTimeout(handler);
  }, [query, selectedCategory, customFoods]);

  // Auto-select food when arriving via foodId URL param
  useEffect(() => {
    if (!initialFoodId) return;
    
    const allLocal = [...BUILT_IN_FOODS, ...customFoods];
    const localMatch = allLocal.find((f) => f.id === initialFoodId);
    if (localMatch) {
      selectFood(localMatch);
    } else {
      // Query the server if it's not a local built-in/custom food
      apiClient.searchFoods(initialFoodId)
        .then((foods) => {
          const match = foods.find((f) => f.id === initialFoodId);
          if (match) selectFood(match);
        })
        .catch((err) => console.error("Failed to fetch initial food parameters:", err));
    }
  }, [initialFoodId, customFoods, selectFood]);

  // Auto-select scanned food when it changes
  useEffect(() => {
    if (scannedFood) {
      selectFood(scannedFood);
    }
  }, [scannedFood, selectFood]);

  const quantityGrams = selectedFood ? displayQtyToGrams(selectedFood, displayQty) : 0;
  const rawMacros = selectedFood ? calculateMacros(selectedFood, quantityGrams) : null;

  const macros = useMemo(() => {
    if (!rawMacros) return null;
    let calories = rawMacros.calories;
    let protein = rawMacros.protein;
    let carbs = rawMacros.carbs;
    let fat = rawMacros.fat;

    if (cookingMethod === "boiled") {
      calories = Math.round(calories * 0.9);
      fat = Math.round(fat * 0.8 * 10) / 10;
    } else if (cookingMethod === "fried") {
      calories = Math.round(calories * 1.25);
      fat = Math.round(fat * 1.8 * 10) / 10;
    } else if (cookingMethod === "ghee") {
      calories = calories + 100;
      fat = Math.round((fat + 11) * 10) / 10;
    }

    return { calories, protein, carbs, fat };
  }, [rawMacros, cookingMethod]);

  const getPresets = (food: FoodDbItem) => {
    if (food.quantityMode === "grams") {
      return [
        { label: "🥣 Bowl (100g)", qty: 100 },
        { label: "🍽️ Med Serv (200g)", qty: 200 },
        { label: "🍛 Full Plate (300g)", qty: 300 },
      ];
    }
    if (food.quantityMode === "ml") {
      return [
        { label: "🍵 Cup (150ml)", qty: 150 },
        { label: "🥛 Glass (250ml)", qty: 250 },
        { label: "🍼 Bottle (500ml)", qty: 500 },
      ];
    }
    if (food.quantityMode === "piece") {
      return [
        { label: "1 Pc", qty: 1 },
        { label: "2 Pcs", qty: 2 },
        { label: "3 Pcs", qty: 3 },
        { label: "4 Pcs", qty: 4 },
      ];
    }
    return [
      { label: "0.5 Serv", qty: 0.5 },
      { label: "1 Serving", qty: 1 },
      { label: "1.5 Serv", qty: 1.5 },
      { label: "2 Servings", qty: 2 },
    ];
  };

  const unitLabel = (mode: QuantityMode, food: FoodDbItem) => {
    if (mode === "piece") return displayQty === 1 ? "piece" : "pieces";
    if (mode === "ml") return "ml";
    if (mode === "serving") return displayQty === 1 ? "serving" : "servings";
    return "g";
  };

  const maxQty = selectedFood
    ? selectedFood.quantityMode === "piece" ? 20
    : selectedFood.quantityMode === "ml" ? 1000
    : selectedFood.quantityMode === "serving" ? 5
    : 800
    : 500;

  const stepQty = selectedFood
    ? selectedFood.quantityMode === "piece" ? 1
    : selectedFood.quantityMode === "ml" ? 25
    : selectedFood.quantityMode === "serving" ? 1
    : 5
    : 5;

  function handleAddToMeal() {
    if (!selectedFood || !macros) return;
    const suffix = cookingMethod === "fried" ? " (Fried)" : cookingMethod === "boiled" ? " (Boiled/Steamed)" : cookingMethod === "ghee" ? " (with Ghee)" : "";
    const finalName = selectedFood.name + suffix;
    const item: MealBuilderItem = {
      dbItemId: selectedFood.id,
      name: finalName,
      quantity: quantityGrams,
      quantityMode: selectedFood.quantityMode,
      displayQty,
      calories: macros.calories,
      protein: macros.protein,
      carbs: macros.carbs,
      fat: macros.fat,
      emoji: selectedFood.emoji,
    };
    onAddToMeal(item);
    setSelectedFood(null);
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Search Input */}
      <div className="relative">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16" height="16"
          viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round"
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-550"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setSelectedFood(null); }}
          placeholder="Search dal, rice, chicken, pizza..."
          className="w-full border border-white/[0.04] bg-[#282421] pl-10 pr-10 py-3.5 text-xs text-[#f5f2eb] placeholder-zinc-500 outline-none transition focus:border-[#1DB954]/40 font-sans rounded-lg"
        />
        {query ? (
          <button
            onClick={() => { setQuery(""); setSelectedFood(null); }}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
            </svg>
          </button>
        ) : (
          onScanClick && (
            <button
              onClick={onScanClick}
              type="button"
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-[#1DB954] transition cursor-pointer"
              title="Scan Barcode"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 7V5a2 2 0 0 1 2-2h2" />
                <path d="M17 3h2a2 2 0 0 1 2 2v2" />
                <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
                <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
                <line x1="9" y1="8" x2="9" y2="16" />
                <line x1="12" y1="8" x2="12" y2="16" />
                <line x1="15" y1="8" x2="15" y2="16" />
              </svg>
            </button>
          )
        )}
      </div>

      {/* Category Chips */}
      <div className="hide-scrollbar flex gap-2 overflow-x-auto pb-1">
        {["All", ...ALL_CATEGORIES.filter(c => c !== "Custom")].map((cat) => (
          <button
            key={cat}
            onClick={() => { setSelectedCategory(cat); setSelectedFood(null); }}
            className={`shrink-0 border px-3 py-1.5 text-xs font-semibold transition active:scale-95 rounded-full cursor-pointer ${
              selectedCategory === cat
                ? "bg-[#1DB954] border-[#1DB954] text-[#161413]"
                : "bg-[#282421] border-white/[0.04] text-[#a19890] hover:text-[#f5f2eb]"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Selected Food — Quantity Picker */}
      {selectedFood && macros && (
        <div className="border border-[#1DB954]/20 bg-[#1DB954]/5 p-4 rounded-xl space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">{selectedFood.emoji || "🍽️"}</span>
              <div>
                <p className="text-sm font-semibold text-white leading-tight">{selectedFood.name}</p>
                <p className="text-xs text-zinc-500 font-medium">{selectedFood.category}</p>
              </div>
            </div>
            <button
              onClick={() => setSelectedFood(null)}
              className="text-zinc-500 hover:text-white transition text-xs px-2 py-1 rounded-md hover:bg-white/5 cursor-pointer"
            >
              ✕ Clear
            </button>
          </div>

          {/* Quantity Slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Quantity</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDisplayQty(q => Math.max(stepQty, q - stepQty))}
                  className="w-7 h-7 flex items-center justify-center bg-[#282421] border border-white/[0.04] rounded-full text-white text-xs hover:bg-[#38322e] transition cursor-pointer font-semibold"
                >−</button>
                <span className="text-sm font-semibold text-[#1DB954] tabular-nums min-w-[70px] text-center">
                  {displayQty} {unitLabel(quantityMode, selectedFood)}
                </span>
                <button
                  onClick={() => setDisplayQty(q => Math.min(maxQty, q + stepQty))}
                  className="w-7 h-7 flex items-center justify-center bg-[#282421] border border-white/[0.04] rounded-full text-white text-xs hover:bg-[#38322e] transition cursor-pointer font-semibold"
                >+</button>
              </div>
            </div>
            <input
              type="range"
              min={stepQty}
              max={maxQty}
              step={stepQty}
              value={displayQty}
              onChange={(e) => setDisplayQty(Number(e.target.value))}
              className="w-full accent-[#1DB954] cursor-pointer"
            />
            {selectedFood.quantityMode === "piece" && selectedFood.gramsPerPiece && (
              <p className="text-xs text-zinc-500 mt-1 font-medium">
                ≈ {quantityGrams}g total ({selectedFood.gramsPerPiece}g per piece)
              </p>
            )}

            {/* Portion Size Presets */}
            <div className="flex gap-1.5 mt-2 flex-wrap">
              {getPresets(selectedFood).map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setDisplayQty(preset.qty)}
                  className={`px-2.5 py-1 text-[10px] font-semibold rounded-full border transition active:scale-95 cursor-pointer ${
                    displayQty === preset.qty
                      ? "bg-[#1DB954] border-[#1DB954] text-[#161413] shadow-sm"
                      : "bg-[#282421]/50 border-white/[0.04] text-[#a19890] hover:text-[#f5f2eb] hover:bg-[#282421]"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cooking Method Multipliers */}
          <div className="border-t border-white/[0.04] pt-3">
            <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block mb-2 font-sans">Preparation Modifier</span>
            <div className="flex gap-1.5 flex-wrap">
              {[
                { method: "normal", label: "🍳 Raw/Normal" },
                { method: "boiled", label: "💧 Boiled/Steamed" },
                { method: "fried", label: "🔥 Fried" },
                { method: "ghee", label: "🧈 with Ghee/Butter" },
              ].map((item) => (
                <button
                  key={item.method}
                  type="button"
                  onClick={() => setCookingMethod(item.method as any)}
                  className={`px-3 py-1.5 text-[10px] font-semibold rounded-full border transition active:scale-95 cursor-pointer font-sans ${
                    cookingMethod === item.method
                      ? "bg-[#1DB954] border-[#1DB954] text-[#161413] shadow-sm"
                      : "bg-[#282421]/50 border-white/[0.04] text-[#a19890] hover:text-[#f5f2eb] hover:bg-[#282421]"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Live Macro Preview */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-[#282421] rounded-lg p-3 border border-white/[0.04]">
              <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider mb-0.5">Calories</p>
              <p className="text-xl font-bold text-[#1DB954]">{macros.calories}</p>
              <p className="text-[10px] text-zinc-600">kcal</p>
            </div>
            <div className="bg-[#282421] rounded-lg p-3 border border-white/[0.04]">
              <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider mb-0.5">Protein</p>
              <p className="text-xl font-bold text-[#81b29a]">{macros.protein}g</p>
              <p className="text-[10px] text-zinc-600">grams</p>
            </div>
            {trackCarbsFat && (
              <>
                <div className="bg-[#282421] rounded-lg p-3 border border-white/[0.04]">
                  <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider mb-0.5">Carbs</p>
                  <p className="text-xl font-bold text-[#5f85a6]">{macros.carbs}g</p>
                  <p className="text-[10px] text-zinc-600">grams</p>
                </div>
                <div className="bg-[#282421] rounded-lg p-3 border border-white/[0.04]">
                  <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider mb-0.5">Fat</p>
                  <p className="text-xl font-bold text-[#e9c46a]">{macros.fat}g</p>
                  <p className="text-[10px] text-zinc-600">grams</p>
                </div>
              </>
            )}
          </div>

          {/* Per 100g reference */}
          <p className="text-[10px] text-zinc-600 font-medium text-center">
            Per 100g: {selectedFood.caloriesPer100g} kcal · {selectedFood.proteinPer100g}g protein
            {trackCarbsFat && ` · ${selectedFood.carbsPer100g}g carbs · ${selectedFood.fatPer100g}g fat`}
          </p>

          {/* Add to Meal */}
          <button
            onClick={handleAddToMeal}
            className="w-full py-3.5 bg-[#1DB954] text-[#161413] text-xs font-semibold rounded-full active:scale-95 transition hover:bg-[#1ed760] cursor-pointer shadow-md"
          >
            + Add to Meal Builder
          </button>
        </div>
      )}

      {/* Results List */}
      {!selectedFood && (
        <div className="flex flex-col gap-1 max-h-[380px] overflow-y-auto pr-1 hide-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-3">
              <div className="w-6 h-6 border-2 border-[#1DB954] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs text-zinc-500 font-medium">Searching database...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-8 text-zinc-500 font-medium text-sm">
              <p className="text-2xl mb-2">🔍</p>
              <p>No foods found for "{query}"</p>
              <p className="text-xs mt-1 text-zinc-600">Try searching by category or add a custom food</p>
            </div> 
          ) : (
            results.map((food) => (
              <button
                key={food.id}
                onClick={() => selectFood(food)}
                className="flex items-center justify-between px-3 py-3 text-left transition hover:bg-[#282421] active:scale-[0.99] rounded-lg border border-transparent hover:border-white/[0.04] group cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-lg shrink-0">{food.emoji || "🍽️"}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{highlightMatch(food.name, query)}</p>
                    <p className="text-xs text-zinc-550 font-medium">{food.category}</p>
                  </div>
                </div>
                <div className="shrink-0 text-right ml-2">
                  <p className="text-xs font-semibold text-zinc-400">
                    <span className="text-[#1DB954]">{food.caloriesPer100g}</span> kcal
                  </p>
                  <p className="text-[10px] text-zinc-650">per 100g</p>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

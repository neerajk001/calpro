"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import type { FoodDbItem, MealBuilderItem, QuantityMode } from "@/lib/types";
import { searchFoodDb, calculateMacros, displayQtyToGrams, ALL_CATEGORIES } from "@/lib/foodDatabase";

interface FoodDBSearchProps {
  customFoods: FoodDbItem[];
  onAddToMeal: (item: MealBuilderItem) => void;
  trackCarbsFat: boolean;
  initialFoodId?: string;
}

export function FoodDBSearch({ customFoods, onAddToMeal, trackCarbsFat, initialFoodId }: FoodDBSearchProps) {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedFood, setSelectedFood] = useState<FoodDbItem | null>(null);
  const [displayQty, setDisplayQty] = useState(100);
  const [quantityMode, setQuantityMode] = useState<QuantityMode>("grams");

  const results = useMemo(() => {
    let foods = searchFoodDb(query, customFoods);
    if (selectedCategory !== "All") {
      foods = foods.filter((f) => f.category === selectedCategory);
    }
    return foods.slice(0, 40);
  }, [query, selectedCategory, customFoods]);

  // Auto-select food when arriving via foodId URL param
  useEffect(() => {
    if (!initialFoodId) return;
    const allFoods = searchFoodDb("", customFoods);
    const food = allFoods.find((f) => f.id === initialFoodId);
    if (food) selectFood(food);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialFoodId]);

  const selectFood = useCallback((food: FoodDbItem) => {
    setSelectedFood(food);
    setQuantityMode(food.quantityMode);
    setDisplayQty(food.defaultQty);
  }, []);

  const quantityGrams = useMemo(() => {
    if (!selectedFood) return 0;
    return displayQtyToGrams(selectedFood, displayQty);
  }, [selectedFood, displayQty]);

  const macros = useMemo(() => {
    if (!selectedFood) return null;
    return calculateMacros(selectedFood, quantityGrams);
  }, [selectedFood, quantityGrams]);

  const unitLabel = (mode: QuantityMode, food: FoodDbItem) => {
    if (mode === "piece") return displayQty === 1 ? "piece" : "pieces";
    if (mode === "ml") return "ml";
    if (mode === "serving") return displayQty === 1 ? "serving" : "servings";
    return "g";
  };

  const maxQty = useMemo(() => {
    if (!selectedFood) return 500;
    if (selectedFood.quantityMode === "piece") return 20;
    if (selectedFood.quantityMode === "ml") return 1000;
    if (selectedFood.quantityMode === "serving") return 5;
    return 800;
  }, [selectedFood]);

  const stepQty = useMemo(() => {
    if (!selectedFood) return 5;
    if (selectedFood.quantityMode === "piece") return 1;
    if (selectedFood.quantityMode === "ml") return 25;
    if (selectedFood.quantityMode === "serving") return 1;
    return 5;
  }, [selectedFood]);

  function handleAddToMeal() {
    if (!selectedFood || !macros) return;
    const item: MealBuilderItem = {
      dbItemId: selectedFood.id,
      name: selectedFood.name,
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
    setQuery("");
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Search Input */}
      <div className="relative">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16" height="16"
          viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round"
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setSelectedFood(null); }}
          placeholder="Search dal, rice, chicken, pizza..."
          className="w-full border border-white/10 bg-[#282828] pl-10 pr-4 py-3.5 text-sm text-white placeholder-zinc-500 outline-none transition focus:border-[#1DB954]/50 font-sans rounded-lg"
        />
        {query && (
          <button
            onClick={() => { setQuery(""); setSelectedFood(null); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
            </svg>
          </button>
        )}
      </div>

      {/* Category Chips */}
      <div className="hide-scrollbar flex gap-2 overflow-x-auto pb-1">
        {["All", ...ALL_CATEGORIES.filter(c => c !== "Custom")].map((cat) => (
          <button
            key={cat}
            onClick={() => { setSelectedCategory(cat); setSelectedFood(null); }}
            className={`shrink-0 border px-3 py-1.5 text-xs font-bold transition active:scale-95 rounded-full cursor-pointer ${
              selectedCategory === cat
                ? "bg-[#1DB954] border-[#1DB954] text-black"
                : "bg-[#282828] border-white/5 text-zinc-400 hover:text-white"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Selected Food — Quantity Picker */}
      {selectedFood && macros && (
        <div className="border border-[#1DB954]/30 bg-[#1DB954]/5 p-4 rounded-xl space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">{selectedFood.emoji || "🍽️"}</span>
              <div>
                <p className="text-sm font-bold text-white leading-tight">{selectedFood.name}</p>
                <p className="text-xs text-zinc-500 font-semibold">{selectedFood.category}</p>
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
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Quantity</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDisplayQty(q => Math.max(stepQty, q - stepQty))}
                  className="w-7 h-7 flex items-center justify-center bg-[#282828] border border-white/10 rounded-full text-white text-sm hover:bg-[#323232] transition cursor-pointer font-bold"
                >−</button>
                <span className="text-sm font-extrabold text-[#1DB954] tabular-nums min-w-[70px] text-center">
                  {displayQty} {unitLabel(quantityMode, selectedFood)}
                </span>
                <button
                  onClick={() => setDisplayQty(q => Math.min(maxQty, q + stepQty))}
                  className="w-7 h-7 flex items-center justify-center bg-[#282828] border border-white/10 rounded-full text-white text-sm hover:bg-[#323232] transition cursor-pointer font-bold"
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
              <p className="text-xs text-zinc-500 mt-1 font-semibold">
                ≈ {quantityGrams}g total ({selectedFood.gramsPerPiece}g per piece)
              </p>
            )}
          </div>

          {/* Live Macro Preview */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-[#282828] rounded-lg p-3 border border-white/5">
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-0.5">Calories</p>
              <p className="text-xl font-extrabold text-[#F97316]">{macros.calories}</p>
              <p className="text-[10px] text-zinc-600">kcal</p>
            </div>
            <div className="bg-[#282828] rounded-lg p-3 border border-white/5">
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-0.5">Protein</p>
              <p className="text-xl font-extrabold text-[#1DB954]">{macros.protein}g</p>
              <p className="text-[10px] text-zinc-600">grams</p>
            </div>
            {trackCarbsFat && (
              <>
                <div className="bg-[#282828] rounded-lg p-3 border border-white/5">
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-0.5">Carbs</p>
                  <p className="text-xl font-extrabold text-blue-400">{macros.carbs}g</p>
                  <p className="text-[10px] text-zinc-600">grams</p>
                </div>
                <div className="bg-[#282828] rounded-lg p-3 border border-white/5">
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-0.5">Fat</p>
                  <p className="text-xl font-extrabold text-yellow-400">{macros.fat}g</p>
                  <p className="text-[10px] text-zinc-600">grams</p>
                </div>
              </>
            )}
          </div>

          {/* Per 100g reference */}
          <p className="text-[10px] text-zinc-600 font-semibold text-center">
            Per 100g: {selectedFood.caloriesPer100g} kcal · {selectedFood.proteinPer100g}g protein
            {trackCarbsFat && ` · ${selectedFood.carbsPer100g}g carbs · ${selectedFood.fatPer100g}g fat`}
          </p>

          {/* Add to Meal */}
          <button
            onClick={handleAddToMeal}
            className="w-full py-3.5 bg-[#1DB954] text-black text-sm font-extrabold rounded-full active:scale-95 transition hover:bg-[#1ed760] cursor-pointer shadow-md"
          >
            + Add to Meal Builder
          </button>
        </div>
      )}

      {/* Results List */}
      {!selectedFood && (
        <div className="flex flex-col gap-1 max-h-[380px] overflow-y-auto pr-1">
          {results.length === 0 ? (
            <div className="text-center py-8 text-zinc-500 font-semibold text-sm">
              <p className="text-2xl mb-2">🔍</p>
              <p>No foods found for "{query}"</p>
              <p className="text-xs mt-1 text-zinc-600">Try searching by category or add a custom food</p>
            </div>
          ) : (
            results.map((food) => (
              <button
                key={food.id}
                onClick={() => selectFood(food)}
                className="flex items-center justify-between px-3 py-3 text-left transition hover:bg-[#282828] active:scale-[0.99] rounded-lg border border-transparent hover:border-white/5 group cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-lg shrink-0">{food.emoji || "🍽️"}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white truncate">{food.name}</p>
                    <p className="text-xs text-zinc-500 font-semibold">{food.category}</p>
                  </div>
                </div>
                <div className="shrink-0 text-right ml-2">
                  <p className="text-xs font-bold text-zinc-400">
                    <span className="text-[#F97316]">{food.caloriesPer100g}</span> kcal
                  </p>
                  <p className="text-[10px] text-zinc-600">per 100g</p>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

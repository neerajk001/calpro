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
        <span className="text-[#96CE4B] font-semibold">{text.slice(idx, idx + q.length)}</span>
        {text.slice(idx + q.length)}
      </>
    );
  }

  useEffect(() => {
    if (!query.trim()) {
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

  useEffect(() => {
    if (!initialFoodId) return;
    const allLocal = [...BUILT_IN_FOODS, ...customFoods];
    const localMatch = allLocal.find((f) => f.id === initialFoodId);
    if (localMatch) {
      selectFood(localMatch);
    } else {
      apiClient.searchFoods(initialFoodId)
        .then((foods) => {
          const match = foods.find((f) => f.id === initialFoodId);
          if (match) selectFood(match);
        })
        .catch((err) => console.error("Failed to fetch initial food parameters:", err));
    }
  }, [initialFoodId, customFoods, selectFood]);

  useEffect(() => {
    if (scannedFood) selectFood(scannedFood);
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
    : 800 : 500;

  const stepQty = selectedFood
    ? selectedFood.quantityMode === "piece" ? 1
    : selectedFood.quantityMode === "ml" ? 25
    : selectedFood.quantityMode === "serving" ? 1
    : 5 : 5;

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
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9A9A9A]">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setSelectedFood(null); }}
          placeholder="Search foods..."
          className="input-field pl-12 pr-12 text-[15px]"
        />
        {query ? (
          <button
            onClick={() => { setQuery(""); setSelectedFood(null); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9A9A9A] hover:text-[#666666] transition cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
            </svg>
          </button>
        ) : (
          onScanClick && (
            <button onClick={onScanClick} type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9A9A9A] hover:text-[#96CE4B] transition cursor-pointer" title="Scan Barcode">
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
            className={`shrink-0 px-4 py-2 text-xs font-semibold transition active:scale-95 rounded-full cursor-pointer ${
              selectedCategory === cat
                ? "chip-active"
                : "chip"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Selected Food — Quantity Picker */}
      {selectedFood && macros && (
        <div className="card p-5 space-y-3 animate-fade-in border-2 border-[#EAF5D6]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">{selectedFood.emoji || "🍽️"}</span>
              <div>
                <p className="text-sm font-semibold text-[#1F1F1F] leading-tight">{selectedFood.name}</p>
                <p className="text-xs text-[#9A9A9A] font-medium">{selectedFood.category}</p>
              </div>
            </div>
            <button onClick={() => setSelectedFood(null)} className="text-[#9A9A9A] hover:text-[#666666] transition text-xs px-2 py-1 rounded-lg hover:bg-[#F4F7EF] cursor-pointer">✕ Clear</button>
          </div>

          {/* Quantity Slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-semibold text-[#9A9A9A] uppercase tracking-wider">Quantity</span>
              <div className="flex items-center gap-2">
                <button onClick={() => setDisplayQty(q => Math.max(stepQty, q - stepQty))} className="w-7 h-7 flex items-center justify-center bg-[#F4F7EF] rounded-full text-[#1F1F1F] text-xs hover:bg-[#EAF5D6] transition cursor-pointer font-semibold">−</button>
                <span className="text-sm font-semibold text-[#96CE4B] tabular-nums min-w-[70px] text-center">{displayQty} {unitLabel(quantityMode, selectedFood)}</span>
                <button onClick={() => setDisplayQty(q => Math.min(maxQty, q + stepQty))} className="w-7 h-7 flex items-center justify-center bg-[#F4F7EF] rounded-full text-[#1F1F1F] text-xs hover:bg-[#EAF5D6] transition cursor-pointer font-semibold">+</button>
              </div>
            </div>
            <input type="range" min={stepQty} max={maxQty} step={stepQty} value={displayQty} onChange={(e) => setDisplayQty(Number(e.target.value))} className="w-full accent-[#96CE4B] cursor-pointer" />
            {selectedFood.quantityMode === "piece" && selectedFood.gramsPerPiece && (
              <p className="text-xs text-[#9A9A9A] mt-1 font-medium">≈ {quantityGrams}g total ({selectedFood.gramsPerPiece}g per piece)</p>
            )}

            <div className="flex gap-1.5 mt-2 flex-wrap">
              {getPresets(selectedFood).map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setDisplayQty(preset.qty)}
                  className={`px-2.5 py-1 text-[10px] font-semibold rounded-full border transition active:scale-95 cursor-pointer ${
                    displayQty === preset.qty
                      ? "bg-[#96CE4B] border-[#96CE4B] text-white"
                      : "bg-[#F4F7EF] border-transparent text-[#666666] hover:text-[#1F1F1F] hover:bg-[#EAF5D6]"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cooking Method */}
          <div className="border-t border-[#F4F7EF] pt-3">
            <span className="text-[10px] font-semibold text-[#9A9A9A] uppercase tracking-wider block mb-2">Preparation Modifier</span>
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
                  className={`px-3 py-1.5 text-[10px] font-semibold rounded-full border transition active:scale-95 cursor-pointer ${
                    cookingMethod === item.method
                      ? "bg-[#96CE4B] border-[#96CE4B] text-white"
                      : "bg-[#F4F7EF] border-transparent text-[#666666] hover:text-[#1F1F1F] hover:bg-[#EAF5D6]"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Live Macro Preview */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-[#F4F7EF] rounded-xl p-3">
              <p className="text-[10px] text-[#9A9A9A] font-semibold uppercase tracking-wider mb-0.5">Calories</p>
              <p className="text-xl font-bold text-[#96CE4B]">{macros.calories}</p>
              <p className="text-[10px] text-[#9A9A9A]">kcal</p>
            </div>
            <div className="bg-[#F4F7EF] rounded-xl p-3">
              <p className="text-[10px] text-[#9A9A9A] font-semibold uppercase tracking-wider mb-0.5">Protein</p>
              <p className="text-xl font-bold text-[#8BC6A2]">{macros.protein}g</p>
              <p className="text-[10px] text-[#9A9A9A]">grams</p>
            </div>
            {trackCarbsFat && (
              <>
                <div className="bg-[#F4F7EF] rounded-xl p-3">
                  <p className="text-[10px] text-[#9A9A9A] font-semibold uppercase tracking-wider mb-0.5">Carbs</p>
                  <p className="text-xl font-bold text-[#F3C96A]">{macros.carbs}g</p>
                  <p className="text-[10px] text-[#9A9A9A]">grams</p>
                </div>
                <div className="bg-[#F4F7EF] rounded-xl p-3">
                  <p className="text-[10px] text-[#9A9A9A] font-semibold uppercase tracking-wider mb-0.5">Fat</p>
                  <p className="text-xl font-bold text-[#F1A09C]">{macros.fat}g</p>
                  <p className="text-[10px] text-[#9A9A9A]">grams</p>
                </div>
              </>
            )}
          </div>

          <p className="text-[10px] text-[#9A9A9A] font-medium text-center">
            Per 100g: {selectedFood.caloriesPer100g} kcal · {selectedFood.proteinPer100g}g protein
            {trackCarbsFat && ` · ${selectedFood.carbsPer100g}g carbs · ${selectedFood.fatPer100g}g fat`}
          </p>

          <button onClick={handleAddToMeal} className="btn-primary w-full text-sm cursor-pointer">
            + Add to Meal Builder
          </button>
        </div>
      )}

      {/* Results List */}
      {!selectedFood && (
        <div className="flex flex-col gap-1 max-h-[400px] overflow-y-auto pr-1 hide-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-3">
              <div className="w-6 h-6 border-2 border-[#96CE4B] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs text-[#9A9A9A] font-medium">Searching database...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-8 text-[#9A9A9A] font-medium text-sm">
              <p className="text-2xl mb-2">🔍</p>
              <p>No foods found for &quot;{query}&quot;</p>
              <p className="text-xs mt-1 text-[#9A9A9A]">Try searching by category or add a custom food</p>
            </div>
          ) : (
            results.map((food) => (
              <button
                key={food.id}
                onClick={() => selectFood(food)}
                className="flex items-center justify-between px-4 py-3 text-left transition hover:bg-[#F4F7EF] active:scale-[0.99] rounded-xl group cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-lg shrink-0">{food.emoji || "🍽️"}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#1F1F1F] truncate">{highlightMatch(food.name, query)}</p>
                    <p className="text-xs text-[#9A9A9A] font-medium">{food.category}</p>
                  </div>
                </div>
                <div className="shrink-0 text-right ml-2">
                  <p className="text-xs font-semibold text-[#1F1F1F]">
                    <span className="text-[#96CE4B]">{food.caloriesPer100g}</span> kcal
                  </p>
                  <p className="text-[10px] text-[#9A9A9A]">per 100g</p>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

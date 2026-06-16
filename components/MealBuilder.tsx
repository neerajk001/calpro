"use client";

import { useState } from "react";
import type { MealBuilderItem, FoodTag } from "@/lib/types";

interface MealBuilderProps {
  items: MealBuilderItem[];
  onRemoveItem: (index: number) => void;
  onClearAll: () => void;
  onLogMeal: (mode: "combined" | "individual", tag: FoodTag) => void;
  trackCarbsFat: boolean;
}

const tagsList: { value: FoodTag; label: string; emoji: string }[] = [
  { value: "breakfast", label: "Breakfast", emoji: "🍳" },
  { value: "lunch", label: "Lunch", emoji: "🥗" },
  { value: "dinner", label: "Dinner", emoji: "🍽️" },
  { value: "snack", label: "Snack", emoji: "🍏" },
  { value: "junk", label: "Junk", emoji: "🍕" },
];

function getDefaultTag(): FoodTag {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 11) return "breakfast";
  if (hour >= 11 && hour < 16) return "lunch";
  if (hour >= 16 && hour < 21) return "dinner";
  return "snack";
}

export function MealBuilder({ items, onRemoveItem, onClearAll, onLogMeal, trackCarbsFat }: MealBuilderProps) {
  const [tag, setTag] = useState<FoodTag>(getDefaultTag);
  const [logMode, setLogMode] = useState<"combined" | "individual">("individual");
  const [showLogOptions, setShowLogOptions] = useState(false);

  const totals = items.reduce(
    (acc, item) => ({
      calories: acc.calories + item.calories,
      protein: +(acc.protein + item.protein).toFixed(1),
      carbs: +(acc.carbs + item.carbs).toFixed(1),
      fat: +(acc.fat + item.fat).toFixed(1),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  if (items.length === 0) {
    return (
      <div className="border border-white/5 bg-[#181818]/60 rounded-xl p-6 text-center">
        <div className="text-3xl mb-2">🍽️</div>
        <p className="text-sm font-bold text-zinc-400">Meal Builder is empty</p>
        <p className="text-xs text-zinc-600 mt-1">Search foods above and tap "Add to Meal Builder"</p>
      </div>
    );
  }

  return (
    <div className="border border-white/10 bg-[#181818]/80 backdrop-blur-md rounded-xl overflow-hidden shadow-lg">
      {/* Header with totals */}
      <div className="bg-gradient-to-r from-[#1DB954]/10 to-[#F97316]/10 border-b border-white/5 p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-extrabold text-white">Meal Builder</h3>
            <p className="text-xs text-zinc-500 font-semibold">{items.length} item{items.length > 1 ? "s" : ""} added</p>
          </div>
          <button
            onClick={onClearAll}
            className="text-xs font-bold text-red-400 hover:text-red-300 transition cursor-pointer px-2 py-1 rounded-md hover:bg-red-500/10"
          >
            Clear All
          </button>
        </div>

        {/* Running Totals */}
        <div className={`grid gap-2 ${trackCarbsFat ? "grid-cols-4" : "grid-cols-2"}`}>
          <div className="bg-black/30 rounded-lg p-2 text-center">
            <p className="text-[10px] text-zinc-500 font-bold uppercase">Calories</p>
            <p className="text-lg font-extrabold text-[#F97316] tabular-nums">{totals.calories}</p>
            <p className="text-[9px] text-zinc-600">kcal</p>
          </div>
          <div className="bg-black/30 rounded-lg p-2 text-center">
            <p className="text-[10px] text-zinc-500 font-bold uppercase">Protein</p>
            <p className="text-lg font-extrabold text-[#1DB954] tabular-nums">{totals.protein}g</p>
            <p className="text-[9px] text-zinc-600">grams</p>
          </div>
          {trackCarbsFat && (
            <>
              <div className="bg-black/30 rounded-lg p-2 text-center">
                <p className="text-[10px] text-zinc-500 font-bold uppercase">Carbs</p>
                <p className="text-lg font-extrabold text-blue-400 tabular-nums">{totals.carbs}g</p>
                <p className="text-[9px] text-zinc-600">grams</p>
              </div>
              <div className="bg-black/30 rounded-lg p-2 text-center">
                <p className="text-[10px] text-zinc-500 font-bold uppercase">Fat</p>
                <p className="text-lg font-extrabold text-yellow-400 tabular-nums">{totals.fat}g</p>
                <p className="text-[9px] text-zinc-600">grams</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Items List */}
      <div className="max-h-56 overflow-y-auto">
        {items.map((item, idx) => (
          <div
            key={`${item.dbItemId}-${idx}`}
            className="flex items-center justify-between px-4 py-3 border-b border-white/5 last:border-0 hover:bg-white/3 transition"
          >
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <span className="text-base shrink-0">{item.emoji || "🍽️"}</span>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">{item.name}</p>
                <p className="text-[10px] text-zinc-500 font-semibold">
                  {item.displayQty} {item.quantityMode === "piece" ? (item.displayQty === 1 ? "piece" : "pieces") : item.quantityMode === "ml" ? "ml" : item.quantityMode === "serving" ? "serving" : "g"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right">
                <p className="text-xs font-bold text-[#F97316] tabular-nums">{item.calories} kcal</p>
                <p className="text-[10px] text-[#1DB954] font-semibold">{item.protein}g P</p>
              </div>
              <button
                onClick={() => onRemoveItem(idx)}
                className="w-6 h-6 flex items-center justify-center rounded-full bg-zinc-800 text-zinc-400 hover:bg-red-500/20 hover:text-red-400 transition cursor-pointer text-xs font-bold"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Log Options */}
      <div className="p-4 space-y-3 border-t border-white/5">
        {/* Tag Selector */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">Meal Tag</p>
          <div className="hide-scrollbar flex gap-2 overflow-x-auto pb-1">
            {tagsList.map((t) => (
              <button
                key={t.value}
                onClick={() => setTag(t.value)}
                className={`shrink-0 border px-3 py-1.5 text-xs font-bold transition active:scale-95 rounded-full cursor-pointer ${
                  tag === t.value
                    ? "bg-[#1DB954] border-[#1DB954] text-black"
                    : "bg-[#282828] border-white/5 text-zinc-400 hover:text-white"
                }`}
              >
                {t.emoji} {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Log Mode Toggle */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">How to log?</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setLogMode("individual")}
              className={`border px-3 py-2.5 text-xs font-bold transition rounded-lg cursor-pointer text-left ${
                logMode === "individual"
                  ? "bg-[#282828] border-[#1DB954]/50 text-white"
                  : "bg-[#1a1a1a] border-white/5 text-zinc-400 hover:text-white"
              }`}
            >
              <p className="font-extrabold text-sm mb-0.5">📋 Separate</p>
              <p className="text-zinc-500 text-[10px] leading-tight">Each food logged as its own entry</p>
            </button>
            <button
              onClick={() => setLogMode("combined")}
              className={`border px-3 py-2.5 text-xs font-bold transition rounded-lg cursor-pointer text-left ${
                logMode === "combined"
                  ? "bg-[#282828] border-[#1DB954]/50 text-white"
                  : "bg-[#1a1a1a] border-white/5 text-zinc-400 hover:text-white"
              }`}
            >
              <p className="font-extrabold text-sm mb-0.5">🍱 Combined</p>
              <p className="text-zinc-500 text-[10px] leading-tight">One entry with total macros</p>
            </button>
          </div>
        </div>

        {/* Log Button */}
        <button
          onClick={() => onLogMeal(logMode, tag)}
          className="w-full py-4 bg-[#1DB954] text-black text-sm font-extrabold rounded-full active:scale-95 transition hover:bg-[#1ed760] cursor-pointer shadow-md"
        >
          ✓ Log {logMode === "combined" ? "as 1 Meal" : `${items.length} Items`} to {tagsList.find(t => t.value === tag)?.label}
        </button>
      </div>
    </div>
  );
}

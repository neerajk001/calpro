"use client";

import { useState } from "react";
import type { MealBuilderItem, FoodTag } from "@/lib/types";
import { useApp } from "@/lib/AppContext";

interface MealBuilderProps {
  items: MealBuilderItem[];
  onRemoveItem: (index: number) => void;
  onUpdateItem: (index: number, item: MealBuilderItem) => void;
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

function recalculateMacros(item: MealBuilderItem, newDisplayQty: number): MealBuilderItem {
  let quantityGrams = newDisplayQty;
  if (item.quantityMode === "piece" && item.gramsPerPiece) {
    quantityGrams = newDisplayQty * item.gramsPerPiece;
  } else if (item.quantityMode === "serving" && item.mlPerServing) {
    quantityGrams = newDisplayQty * item.mlPerServing;
  }

  const hasPer100g = item.caloriesPer100g != null && item.caloriesPer100g > 0;
  if (!hasPer100g) {
    const scale = newDisplayQty / Math.max(item.displayQty, 1);
    return {
      ...item,
      displayQty: newDisplayQty,
      quantity: quantityGrams,
      calories: Math.round(item.calories * scale),
      protein: Math.round(item.protein * scale * 10) / 10,
      carbs: Math.round((item.carbs ?? 0) * scale * 10) / 10,
      fat: Math.round((item.fat ?? 0) * scale * 10) / 10,
    };
  }

  const per100 = {
    calories: item.caloriesPer100g ?? 0,
    protein: item.proteinPer100g ?? 0,
    carbs: item.carbsPer100g ?? 0,
    fat: item.fatPer100g ?? 0,
  };
  const ratio = quantityGrams / 100;
  let calories = Math.round(per100.calories * ratio);
  let protein = Math.round(per100.protein * ratio * 10) / 10;
  let carbs = Math.round(per100.carbs * ratio * 10) / 10;
  let fat = Math.round(per100.fat * ratio * 10) / 10;

  if (item.cookingMethod === "boiled") {
    calories = Math.round(calories * 0.9);
    fat = Math.round(fat * 0.8 * 10) / 10;
  } else if (item.cookingMethod === "fried") {
    calories = Math.round(calories * 1.25);
    fat = Math.round(fat * 1.8 * 10) / 10;
  } else if (item.cookingMethod === "ghee") {
    const gheeGrams = Math.round(quantityGrams * 0.12);
    calories = calories + Math.round(gheeGrams * 9);
    fat = Math.round((fat + gheeGrams * 0.99) * 10) / 10;
  }

  return { ...item, displayQty: newDisplayQty, quantity: quantityGrams, calories, protein, carbs, fat };
}

function getStep(item: MealBuilderItem): number {
  if (item.quantityMode === "piece") return 1;
  if (item.quantityMode === "ml") return 25;
  if (item.quantityMode === "serving") return 1;
  return 5;
}

function getMaxQty(item: MealBuilderItem): number {
  if (item.quantityMode === "piece") return 20;
  if (item.quantityMode === "ml") return 1000;
  if (item.quantityMode === "serving") return 5;
  return 800;
}

function unitLabel(item: MealBuilderItem): string {
  if (item.quantityMode === "piece") return item.displayQty === 1 ? "pc" : "pcs";
  if (item.quantityMode === "ml") return "ml";
  if (item.quantityMode === "serving") return item.displayQty === 1 ? "serv" : "servs";
  return "g";
}

export function MealBuilder({ items, onRemoveItem, onUpdateItem, onClearAll, onLogMeal, trackCarbsFat }: MealBuilderProps) {
  const { addMealTemplate } = useApp();
  const [tag, setTag] = useState<FoodTag>(getDefaultTag);
  const [logMode, setLogMode] = useState<"combined" | "individual">("individual");
  const [isSaving, setIsSaving] = useState(false);
  const [templateName, setTemplateName] = useState("");

  const totals = items.reduce(
    (acc, item) => ({
      calories: acc.calories + item.calories,
      protein: +(acc.protein + item.protein).toFixed(1),
      carbs: +(acc.carbs + item.carbs).toFixed(1),
      fat: +(acc.fat + item.fat).toFixed(1),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const handleSaveTemplate = () => {
    if (!templateName.trim()) return;
    addMealTemplate(templateName.trim(), tag, items);
    setIsSaving(false);
    setTemplateName("");
  };

  if (items.length === 0) {
    return (
      <div className="card p-4 md:p-6 text-center">
        <div className="text-3xl mb-2">🍽️</div>
        <p className="text-sm font-semibold text-[#6B6B6B]">Meal Builder is empty</p>
        <p className="text-xs text-[#6B6B6B] mt-1">Search foods above and tap &quot;Add to Meal Builder&quot;</p>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      {/* Header with totals */}
      <div className="bg-[#F3F4F6] p-3 md:p-4 border-b border-black/5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-extrabold text-[#111827]">Meal Builder</h3>
            <p className="text-xs text-[#6B7280] font-semibold">{items.length} item{items.length > 1 ? "s" : ""} added</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setIsSaving(true)}
              className="text-xs font-bold text-[#2563EB] hover:text-[#1D4ED8] transition cursor-pointer px-2.5 py-1.5 rounded-lg hover:bg-[#EFF6FF] flex items-center gap-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
              </svg>
              Save Template
            </button>
            <button onClick={onClearAll} className="text-xs font-bold text-[#EF4444] hover:text-red-600 transition cursor-pointer px-2.5 py-1.5 rounded-lg hover:bg-red-50">Clear All</button>
          </div>
        </div>

        <div className={`grid gap-2 ${trackCarbsFat ? "grid-cols-4" : "grid-cols-2"}`}>
          <div className="bg-[#FFFFFF] rounded-xl p-2 text-center border border-black/5">
            <p className="text-[10px] text-[#6B7280] font-bold uppercase">Calories</p>
            <p className="text-lg font-black text-[#2563EB] tabular-nums">{totals.calories}</p>
            <p className="text-[10px] text-[#6B7280] font-semibold">kcal</p>
          </div>
          <div className="bg-[#FFFFFF] rounded-xl p-2 text-center border border-black/5">
            <p className="text-[10px] text-[#6B7280] font-bold uppercase">Protein</p>
            <p className="text-lg font-black text-[#10B981] tabular-nums">{totals.protein}g</p>
            <p className="text-[10px] text-[#6B7280] font-semibold">grams</p>
          </div>
          {trackCarbsFat && (
            <>
              <div className="bg-[#FFFFFF] rounded-xl p-2 text-center border border-black/5">
                <p className="text-[10px] text-[#6B7280] font-bold uppercase">Carbs</p>
                <p className="text-lg font-black text-[#F59E0B] tabular-nums">{totals.carbs}g</p>
                <p className="text-[10px] text-[#6B7280] font-semibold">grams</p>
              </div>
              <div className="bg-[#FFFFFF] rounded-xl p-2 text-center border border-black/5">
                <p className="text-[10px] text-[#6B7280] font-bold uppercase">Fat</p>
                <p className="text-lg font-black text-[#EF4444] tabular-nums">{totals.fat}g</p>
                <p className="text-[10px] text-[#6B7280] font-semibold">grams</p>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="max-h-56 overflow-y-auto hide-scrollbar">
        {items.map((item, idx) => (
          <div key={`${item.dbItemId}-${idx}`} className="flex items-center justify-between px-3 py-2.5 md:px-4 md:py-3 border-b border-black/5 last:border-0 hover:bg-[#EFF6FF]/40 transition">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <span className="text-base shrink-0">{item.emoji || "🍽️"}</span>
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#111827] truncate">{item.name}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <button
                    onClick={() => { const step = getStep(item); const n = Math.max(step, item.displayQty - step); onUpdateItem(idx, recalculateMacros(item, n)); }}
                    className="w-4 h-4 flex items-center justify-center rounded-full bg-[#E5E7EB] hover:bg-[#2563EB] hover:text-white text-[#4B5563] text-[10px] leading-none transition cursor-pointer"
                  >−</button>
                  <span className="text-[10px] text-[#6B7280] font-bold tabular-nums min-w-[35px] text-center">
                    {item.displayQty}{unitLabel(item)}
                  </span>
                  <button
                    onClick={() => { const step = getStep(item); const n = Math.min(getMaxQty(item), item.displayQty + step); onUpdateItem(idx, recalculateMacros(item, n)); }}
                    className="w-4 h-4 flex items-center justify-center rounded-full bg-[#E5E7EB] hover:bg-[#2563EB] hover:text-white text-[#4B5563] text-[10px] leading-none transition cursor-pointer"
                  >+</button>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right">
                <p className="text-xs font-bold text-[#2563EB] tabular-nums">{item.calories} kcal</p>
                <p className="text-[10px] text-[#10B981] font-bold">{item.protein}g P</p>
              </div>
              <button onClick={() => onRemoveItem(idx)} className="w-6 h-6 flex items-center justify-center rounded-full bg-[#E5E7EB] text-[#6B7280] hover:bg-red-50 hover:text-[#EF4444] transition cursor-pointer text-xs font-bold">✕</button>
            </div>
          </div>
        ))}
      </div>

      {/* Save Template Dialog */}
      {isSaving && (
        <div className="p-3 md:p-4 bg-[#F3F4F6] border-t border-black/5 space-y-3 animate-fade-in">
          <p className="text-xs font-bold uppercase tracking-wider text-[#2563EB] flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
            </svg>
            Save Meal Template
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="e.g. My Usual Lunch"
              className="flex-1 bg-[#FFFFFF] border border-black/5 px-3.5 py-2.5 text-xs text-[#111827] placeholder-[#6B7280] outline-none focus:border-[#2563EB]/40 rounded-xl"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter" && templateName.trim()) handleSaveTemplate();
                else if (e.key === "Escape") { setIsSaving(false); setTemplateName(""); }
              }}
            />
            <button onClick={handleSaveTemplate} disabled={!templateName.trim()} className="btn-primary h-auto px-4 py-2.5 text-xs font-bold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">Save</button>
            <button onClick={() => { setIsSaving(false); setTemplateName(""); }} className="px-3 py-2.5 bg-[#E5E7EB] hover:bg-[#D1D5DB] text-[#4B5563] text-xs font-semibold rounded-xl transition cursor-pointer">Cancel</button>
          </div>
        </div>
      )}

      {/* Log Options */}
      <div className="p-3.5 md:p-4 space-y-3 border-t border-black/5">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280] mb-2">Meal Tag</p>
          <div className="hide-scrollbar flex gap-2 overflow-x-auto pb-1">
            {tagsList.map((t) => (
              <button
                key={t.value}
                onClick={() => setTag(t.value)}
                className={`shrink-0 px-3.5 py-1.5 text-xs font-semibold transition active:scale-95 rounded-full cursor-pointer ${
                  tag === t.value
                    ? "bg-[#2563EB] text-white"
                    : "chip"
                }`}
              >
                {t.emoji} {t.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280] mb-2">How to log?</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setLogMode("individual")}
              className={`border px-3 py-2.5 text-xs transition rounded-xl cursor-pointer text-left ${
                logMode === "individual"
                  ? "bg-[#EFF6FF] border-[#2563EB]/40 text-[#111827] font-semibold"
                  : "bg-[#E5E7EB] border-transparent text-[#4B5563] hover:text-[#111827]"
              }`}
            >
              <p className="font-extrabold text-sm mb-0.5">📋 Separate</p>
              <p className="text-[#6B7280] text-xs leading-tight">Each food logged as own entry</p>
            </button>
            <button
              onClick={() => setLogMode("combined")}
              className={`border px-3 py-2.5 text-xs transition rounded-xl cursor-pointer text-left ${
                logMode === "combined"
                  ? "bg-[#EFF6FF] border-[#2563EB]/40 text-[#111827] font-semibold"
                  : "bg-[#E5E7EB] border-transparent text-[#4B5563] hover:text-[#111827]"
              }`}
            >
              <p className="font-extrabold text-sm mb-0.5">🍱 Combined</p>
              <p className="text-[#6B7280] text-xs leading-tight">One entry with total macros</p>
            </button>
          </div>
        </div>

        <button onClick={() => onLogMeal(logMode, tag)} className="btn-primary w-full text-sm cursor-pointer mt-1">
          ✓ Log {logMode === "combined" ? "as 1 Meal" : `${items.length} Items`} to {tagsList.find(t => t.value === tag)?.label}
        </button>
      </div>
    </div>
  );
}

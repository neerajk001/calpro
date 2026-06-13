"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/AppContext";
import type { FoodTag } from "@/lib/types";

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getDefaultTag(): FoodTag {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 11) return "breakfast";
  if (hour >= 11 && hour < 16) return "lunch";
  if (hour >= 16 && hour < 21) return "dinner";
  return "snack";
}

function parseNaturalLanguage(text: string): { name: string; calories: number; protein: number; tag?: FoodTag } | null {
  const t = text.trim();
  if (!t) return null;

  const calRegex = /(\d+)\s*(?:kcal|calories?|cal\b)/i;
  const protRegex = /(\d+(?:\.\d+)?)\s*(?:g|grams?|protein|prot\b)/i;

  const calMatch = t.match(calRegex);
  const protMatch = t.match(protRegex);

  let calories = calMatch ? Math.round(parseFloat(calMatch[1])) : null;
  let protein = protMatch ? Math.round(parseFloat(protMatch[1]) * 10) / 10 : null;

  let name = t
    .replace(calRegex, "")
    .replace(protRegex, "")
    .replace(/\band\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  name = name.replace(/^[,.\s]+|[,.\s]+$/g, "");

  if (!name) name = "Logged Item";

  const formattedName = name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  let tag: FoodTag | undefined;
  const lower = name.toLowerCase();

  // Smart Keyword Mapping
  if (calories === null && protein === null) {
    if (lower.includes("egg") || lower.includes("oatmeal") || lower.includes("pancake") || lower.includes("toast")) {
      calories = 70;
      protein = 6;
      tag = "breakfast";
      if (lower.includes("oatmeal")) { calories = 150; protein = 5; }
      if (lower.includes("toast")) { calories = 120; protein = 4; }
    } else if (lower.includes("whey") || lower.includes("protein shake") || lower.includes("shake")) {
      calories = 130;
      protein = 25;
      tag = "snack";
    } else if (lower.includes("banana") || lower.includes("apple") || lower.includes("pear")) {
      calories = 105;
      protein = 1.3;
      tag = "snack";
      if (lower.includes("apple")) { calories = 80; protein = 0.5; }
    } else if (lower.includes("milk")) {
      calories = 120;
      protein = 8;
      tag = "snack";
    } else if (lower.includes("chicken") || lower.includes("breast") || lower.includes("salmon") || lower.includes("steak")) {
      calories = 165;
      protein = 31;
      tag = "lunch";
    } else if (lower.includes("greek yogurt") || lower.includes("yogurt")) {
      calories = 120;
      protein = 15;
      tag = "snack";
    } else if (lower.includes("pizza") || lower.includes("burger") || lower.includes("fries") || lower.includes("donut") || lower.includes("cookie")) {
      calories = 350;
      protein = 12;
      tag = "junk";
      if (lower.includes("pizza")) { calories = 280; protein = 11; }
      if (lower.includes("donut")) { calories = 250; protein = 3; }
      if (lower.includes("fries")) { calories = 320; protein = 4; }
    }
  }

  return {
    name: formattedName,
    calories: calories ?? 0,
    protein: protein ?? 0,
    tag: tag,
  };
}

export default function AddFoodPage() {
  const router = useRouter();
  const { addFood, getDistinctFoods, getDaySummary } = useApp();
  const today = todayStr();

  // Inputs
  const [naturalText, setNaturalText] = useState("");
  const [name, setName] = useState("");
  const [calories, setCalories] = useState(0);
  const [protein, setProtein] = useState(0);
  const [activeTag, setActiveTag] = useState<FoodTag>(() => getDefaultTag());

  const [isEditingCal, setIsEditingCal] = useState(false);
  const [isEditingProt, setIsEditingProt] = useState(false);

  const distinct = useMemo(() => getDistinctFoods(10), [getDistinctFoods]);
  const todayExists = getDaySummary(today).entries;

  const tagsList: { value: FoodTag; label: string }[] = [
    { value: "breakfast", label: "🍳 Breakfast" },
    { value: "lunch", label: "🥗 Lunch" },
    { value: "dinner", label: "🍽️ Dinner" },
    { value: "snack", label: "🍏 Snack" },
    { value: "junk", label: "🍕 Junk" },
  ];

  // Sync natural language parsing output
  useEffect(() => {
    const parsed = parseNaturalLanguage(naturalText);
    if (parsed) {
      setName(parsed.name);
      if (parsed.calories > 0) setCalories(parsed.calories);
      if (parsed.protein > 0) setProtein(parsed.protein);
      if (parsed.tag) setActiveTag(parsed.tag);
    } else {
      setName(naturalText);
    }
  }, [naturalText]);

  const suggestions = useMemo(() => {
    const q = name.trim().toLowerCase();
    if (!q) return distinct.slice(0, 5);
    return distinct
      .filter((f) => f.name.toLowerCase().includes(q))
      .slice(0, 5);
  }, [name, distinct]);

  const recentlyLogged = useMemo(() => {
    return todayExists.slice(-4).reverse();
  }, [todayExists]);

  function handleSubmit() {
    const finalName = name.trim() || "Logged Item";
    addFood(finalName, calories, protein, today, activeTag);
    router.push("/");
  }

  // sugerence click
  function handleSuggestionTap(food: { name: string; calories: number; protein: number }) {
    setNaturalText("");
    setName(food.name);
    setCalories(food.calories);
    setProtein(food.protein);
  }

  function handleReLog(food: { name: string; calories: number; protein: number; tag: FoodTag }) {
    addFood(food.name, food.calories, food.protein, today, food.tag || activeTag);
    router.push("/");
  }

  const canSubmit = name.trim().length > 0;

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 pt-6 select-none pb-12 font-sans text-stone-900">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-serif font-bold tracking-tight text-stone-950">
          Log Nutrition
        </h1>
        <button
          onClick={() => router.push("/")}
          className="rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-stone-500 hover:bg-stone-50 hover:text-stone-900 transition active:scale-95 shadow-xs"
        >
          Cancel
        </button>
      </div>

      {/* Recents shortcuts */}
      {recentlyLogged.length > 0 && (
        <div className="mb-5">
          <h2 className="mb-2 text-[10px] font-bold uppercase tracking-widest text-[#78716C] font-sans">
            Logged Today
          </h2>
          <div className="hide-scrollbar flex gap-2 overflow-x-auto pb-1">
            {recentlyLogged.map((food) => (
              <button
                key={food.id}
                onClick={() => handleReLog(food as any)}
                className="shrink-0 rounded-full border border-stone-200 bg-white px-3.5 py-2 text-xs font-semibold text-[#D97706] transition active:scale-90 hover:bg-stone-50 shadow-xs"
              >
                + {food.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Suggestions List */}
      {suggestions.length > 0 && (
        <div className="mb-5 rounded-2xl border border-stone-200 bg-white p-3.5 shadow-xs">
          <h2 className="mb-2.5 text-[10px] font-bold uppercase tracking-widest text-[#78716C] font-sans">
            Suggestions
          </h2>
          <div className="flex flex-col gap-1">
            {suggestions.map((food) => (
              <button
                key={food.name}
                onClick={() => handleSuggestionTap(food)}
                className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition hover:bg-stone-50 active:scale-[0.99]"
              >
                <span className="text-xs font-bold text-stone-850 font-sans">
                  {food.name}
                </span>
                <span className="text-[10px] text-stone-500 font-sans">
                  {food.calories} kcal · {food.protein}g P
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Primary Log Form */}
      <div className="flex flex-col gap-4 rounded-2xl border border-stone-200 bg-white p-4 shadow-xs">
        
        {/* Sliders selectors */}
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center text-xs font-bold font-sans text-stone-700 mb-1">
              <span>Calories</span>
              {isEditingCal ? (
                <input
                  type="number"
                  value={calories}
                  onChange={(e) => setCalories(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  onBlur={() => setIsEditingCal(false)}
                  onKeyDown={(e) => e.key === "Enter" && setIsEditingCal(false)}
                  autoFocus
                  className="w-20 rounded border border-stone-300 bg-stone-50 px-2 py-0.5 text-right text-xs font-bold text-[#D97706] outline-none"
                />
              ) : (
                <span
                  onClick={() => setIsEditingCal(true)}
                  className="text-[#D97706] cursor-pointer hover:underline bg-stone-50 px-2 py-0.5 rounded border border-stone-200"
                  title="Tap to type exact value"
                >
                  {calories} kcal ✎
                </span>
              )}
            </div>
            <input
              type="range"
              min="0"
              max="1200"
              step="5"
              value={calories > 1200 ? 1200 : calories}
              onChange={(e) => setCalories(parseInt(e.target.value, 10))}
              className="w-full accent-[#D97706] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-stone-400 font-sans font-semibold mt-0.5">
              <span>0 kcal</span>
              <span>600 kcal</span>
              <span>1200 kcal</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center text-xs font-bold font-sans text-stone-700 mb-1">
              <span>Protein</span>
              {isEditingProt ? (
                <input
                  type="number"
                  value={protein}
                  onChange={(e) => setProtein(Math.max(0, parseFloat(e.target.value) || 0))}
                  onBlur={() => setIsEditingProt(false)}
                  onKeyDown={(e) => e.key === "Enter" && setIsEditingProt(false)}
                  autoFocus
                  step="0.1"
                  className="w-20 rounded border border-stone-300 bg-stone-50 px-2 py-0.5 text-right text-xs font-bold text-[#16A34A] outline-none"
                />
              ) : (
                <span
                  onClick={() => setIsEditingProt(true)}
                  className="text-[#16A34A] cursor-pointer hover:underline bg-stone-50 px-2 py-0.5 rounded border border-stone-200"
                  title="Tap to type exact value"
                >
                  {protein}g ✎
                </span>
              )}
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={protein > 100 ? 100 : protein}
              onChange={(e) => setProtein(parseInt(e.target.value, 10))}
              className="w-full accent-[#16A34A] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-stone-400 font-sans font-semibold mt-0.5">
              <span>0g</span>
              <span>50g</span>
              <span>100g</span>
            </div>
          </div>
        </div>

        <div className="h-px bg-stone-100 my-1" />

        {/* Meal Tag Selector */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-[#78716C] font-sans mb-2">
            Select Category Tag
          </label>
          <div className="hide-scrollbar flex gap-2 overflow-x-auto pb-1">
            {tagsList.map((item) => {
              const active = activeTag === item.value;
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setActiveTag(item.value)}
                  className={`shrink-0 rounded-xl px-3 py-2 text-xs font-bold transition duration-150 active:scale-95 border ${
                    active
                      ? "bg-[#292524] border-[#292524] text-white"
                      : "bg-stone-50 border-stone-200 text-stone-500 hover:text-stone-700"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="h-px bg-stone-100 my-1" />

        {/* Input box */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-[#78716C] font-sans mb-1.5">
            Describe meal or override name
          </label>
          <input
            type="text"
            value={naturalText}
            onChange={(e) => setNaturalText(e.target.value)}
            placeholder="e.g. egg (auto-fills breakfast) or pizza 280 kcal"
            className="w-full rounded-xl border border-stone-200 bg-[#FAF8F5] px-4 py-3.5 text-xs text-stone-900 placeholder-stone-450 outline-none transition focus:border-stone-400 font-sans"
          />
        </div>

        {/* Confirm tracking CTA */}
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={`w-full rounded-xl py-4 text-xs font-bold transition duration-200 active:scale-95 ${
            canSubmit
              ? "bg-[#292524] text-white shadow-xs hover:bg-[#1C1917]"
              : "bg-stone-100 text-stone-300 cursor-not-allowed"
          }`}
        >
          Confirm Log Entry
        </button>
      </div>
    </div>
  );
}

"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/AppContext";

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/**
 * Natural language helper parses numeric patterns for calories and protein.
 * Example: "Large banana 100 kcal 2g protein" => name: "Large banana", calories: 100, protein: 2
 */
function parseNaturalLanguage(text: string): { name: string; calories: number; protein: number } | null {
  const t = text.trim();
  if (!t) return null;

  const calRegex = /(\d+)\s*(?:kcal|calories?|cal\b)/i;
  const protRegex = /(\d+(?:\.\d+)?)\s*(?:g|grams?|protein|prot\b)/i;

  const calMatch = t.match(calRegex);
  const protMatch = t.match(protRegex);

  const calories = calMatch ? Math.round(parseFloat(calMatch[1])) : null;
  const protein = protMatch ? Math.round(parseFloat(protMatch[1]) * 10) / 10 : null;

  let name = t
    .replace(calRegex, "")
    .replace(protRegex, "")
    .replace(/\band\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  // Strip trailing punctuation
  name = name.replace(/^[,.\s]+|[,.\s]+$/g, "");

  if (!name) name = "Logged Item";

  return {
    name: name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    calories: calories ?? 0,
    protein: protein ?? 0,
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

  const distinct = useMemo(() => getDistinctFoods(10), [getDistinctFoods]);
  const todayExists = getDaySummary(today).entries;

  // Sync natural language parsing output with sliders/inputs
  useEffect(() => {
    const parsed = parseNaturalLanguage(naturalText);
    if (parsed) {
      setName(parsed.name);
      // Only override sliders if parser extracts values > 0
      if (parsed.calories > 0) setCalories(parsed.calories);
      if (parsed.protein > 0) setProtein(parsed.protein);
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
    addFood(finalName, calories, protein, today);
    router.push("/");
  }

  function handleSuggestionTap(food: { name: string; calories: number; protein: number }) {
    setNaturalText("");
    setName(food.name);
    setCalories(food.calories);
    setProtein(food.protein);
  }

  function handleReLog(food: { name: string; calories: number; protein: number }) {
    addFood(food.name, food.calories, food.protein, today);
    router.push("/");
  }

  const canSubmit = name.trim().length > 0;

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 pt-6 select-none pb-12">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-extrabold tracking-tight text-white font-sans">
          Log Nutrition
        </h1>
        <button
          onClick={() => router.push("/")}
          className="rounded-xl border border-white/5 bg-slate-900/30 px-3 py-1.5 text-xs font-semibold text-slate-400 hover:bg-slate-900/60 hover:text-white transition active:scale-95"
        >
          Cancel
        </button>
      </div>

      {/* Recents shortcuts */}
      {recentlyLogged.length > 0 && (
        <div className="mb-5">
          <h2 className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 font-sans">
            Logged Today
          </h2>
          <div className="hide-scrollbar flex gap-2 overflow-x-auto pb-1">
            {recentlyLogged.map((food) => (
              <button
                key={food.id}
                onClick={() => handleReLog(food)}
                className="shrink-0 rounded-full border border-white/5 bg-slate-900/40 px-3.5 py-2 text-xs font-semibold text-[#10B981] transition active:scale-90 hover:bg-[#10B981]/15"
              >
                + {food.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Suggestions List */}
      {suggestions.length > 0 && (
        <div className="mb-5 rounded-2xl border border-white/5 bg-slate-900/30 p-3.5 backdrop-blur-md">
          <h2 className="mb-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-500 font-sans">
            Suggestions
          </h2>
          <div className="flex flex-col gap-1">
            {suggestions.map((food) => (
              <button
                key={food.name}
                onClick={() => handleSuggestionTap(food)}
                className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition hover:bg-white/5 active:scale-[0.99]"
              >
                <span className="text-xs font-bold text-slate-300 font-sans">
                  {food.name}
                </span>
                <span className="text-[10px] text-slate-500 font-sans">
                  {food.calories} kcal · {food.protein}g P
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Primary Log Form: Handled inside bottom thumb boundaries */}
      <div className="flex flex-col gap-4 rounded-2xl border border-white/5 bg-slate-900/40 p-4 shadow-xl backdrop-blur-md">
        
        {/* Sliders selectors */}
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs font-bold font-sans text-slate-300 mb-1">
              <span>Calories</span>
              <span className="text-[#10B981]">{calories} kcal</span>
            </div>
            <input
              type="range"
              min="0"
              max="1200"
              step="5"
              value={calories}
              onChange={(e) => setCalories(parseInt(e.target.value, 10))}
              className="w-full accent-[#10B981] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-600 font-sans font-semibold mt-0.5">
              <span>0 kcal</span>
              <span>600 kcal</span>
              <span>1200 kcal</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold font-sans text-slate-300 mb-1">
              <span>Protein</span>
              <span className="text-[#06B6D4]">{protein}g</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={protein}
              onChange={(e) => setProtein(parseInt(e.target.value, 10))}
              className="w-full accent-[#06B6D4] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-600 font-sans font-semibold mt-0.5">
              <span>0g</span>
              <span>50g</span>
              <span>100g</span>
            </div>
          </div>
        </div>

        <div className="h-px bg-white/5 my-1" />

        {/* Input box */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 font-sans mb-1.5">
            Describe meal or override name
          </label>
          <input
            type="text"
            value={naturalText}
            onChange={(e) => setNaturalText(e.target.value)}
            placeholder="e.g. 2 eggs and toast 350 kcal 18g protein"
            className="w-full rounded-xl border border-white/5 bg-slate-950/60 px-4 py-3.5 text-xs text-white placeholder-slate-500 outline-none transition focus:border-[#10B981]/40 focus:ring-2 focus:ring-[#10B981]/10 font-sans"
          />
        </div>

        {/* Confirm tracking CTA */}
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={`w-full rounded-xl py-4 text-xs font-bold transition duration-200 active:scale-95 ${
            canSubmit
              ? "bg-gradient-to-r from-[#10B981] to-[#06B6D4] text-white shadow-lg shadow-[#10B981]/25 hover:brightness-110"
              : "bg-slate-800 text-slate-500 cursor-not-allowed"
          }`}
        >
          Confirm Log Entry
        </button>
      </div>
    </div>
  );
}

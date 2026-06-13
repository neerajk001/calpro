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
  const { addFood, updateFood, foods, hydrated, getDistinctFoods, getDaySummary } = useApp();
  const today = todayStr();

  // Inputs
  const [naturalText, setNaturalText] = useState("");
  const [name, setName] = useState("");
  const [calories, setCalories] = useState(0);
  const [protein, setProtein] = useState(0);
  const [activeTag, setActiveTag] = useState<FoodTag>(() => getDefaultTag());

  const [isEditingCal, setIsEditingCal] = useState(false);
  const [isEditingProt, setIsEditingProt] = useState(false);

  const [editId, setEditId] = useState<string | null>(null);
  const [editDate, setEditDate] = useState<string>("");
  const [hasPrefilled, setHasPrefilled] = useState(false);

  const distinct = useMemo(() => getDistinctFoods(10), [getDistinctFoods]);
  const todayExists = getDaySummary(today).entries;

  const tagsList: { value: FoodTag; label: string }[] = [
    { value: "breakfast", label: "🍳 Breakfast" },
    { value: "lunch", label: "🥗 Lunch" },
    { value: "dinner", label: "🍽️ Dinner" },
    { value: "snack", label: "🍏 Snack" },
    { value: "junk", label: "🍕 Junk" },
  ];

  // Pre-populate if in edit mode
  useEffect(() => {
    if (typeof window !== "undefined" && hydrated && !hasPrefilled) {
      const params = new URLSearchParams(window.location.search);
      const edit = params.get("edit");
      if (edit) {
        const entry = foods.find((f) => f.id === edit);
        if (entry) {
          setEditId(edit);
          setName(entry.name);
          setCalories(entry.calories);
          setProtein(entry.protein);
          setActiveTag(entry.tag);
          setEditDate(entry.date);
        }
      }
      setHasPrefilled(true);
    }
  }, [hydrated, foods, hasPrefilled]);

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
    if (editId) {
      updateFood(editId, finalName, calories, protein, editDate, activeTag);
      router.push(editDate ? `/?date=${editDate}` : "/");
    } else {
      addFood(finalName, calories, protein, today, activeTag);
      router.push("/");
    }
  }

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
    <div className="mx-auto flex max-w-md flex-col px-4 pt-6 select-none pb-12 font-sans text-white">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold tracking-tight text-white font-sans">
          {editId ? "Edit Food Entry" : "Log Nutrition"}
        </h1>
        <button
          onClick={() => router.push(editDate ? `/?date=${editDate}` : "/")}
          className="border border-white/10 bg-[#181818] px-4 py-2 text-xs font-bold text-zinc-300 hover:bg-[#282828] hover:text-white transition active:scale-95 shadow-sm rounded-full cursor-pointer"
        >
          Cancel
        </button>
      </div>

      {/* Recents shortcuts */}
      {recentlyLogged.length > 0 && (
        <div className="mb-5">
          <h2 className="mb-2 text-xs font-bold uppercase tracking-widest text-zinc-400 font-sans">
            Logged Today
          </h2>
          <div className="hide-scrollbar flex gap-2 overflow-x-auto pb-1">
            {recentlyLogged.map((food) => (
              <button
                key={food.id}
                onClick={() => handleReLog(food as any)}
                className="shrink-0 border border-white/5 bg-[#181818] px-4 py-2 text-xs font-extrabold text-[#F97316] transition active:scale-95 hover:bg-[#282828] shadow-sm rounded-full cursor-pointer"
              >
                + {food.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Suggestions List */}
      {suggestions.length > 0 && (
        <div className="mb-5 border border-white/5 bg-[#181818] p-4 shadow-md rounded-lg">
          <h2 className="mb-2.5 text-xs font-bold uppercase tracking-widest text-zinc-400 font-sans">
            Suggestions
          </h2>
          <div className="flex flex-col gap-1.5">
            {suggestions.map((food) => (
              <button
                key={food.name}
                onClick={() => handleSuggestionTap(food)}
                className="flex w-full items-center justify-between px-3 py-2.5 text-left transition hover:bg-[#282828] active:scale-[0.99] rounded-md cursor-pointer"
              >
                <span className="text-sm font-bold text-white font-sans">
                  {food.name}
                </span>
                <span className="text-xs font-semibold text-zinc-400 font-sans">
                  {food.calories} kcal · {food.protein}g P
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Primary Log Form */}
      <div className="flex flex-col gap-4 border border-white/5 bg-[#181818]/80 backdrop-blur-md p-5 shadow-lg rounded-xl">
        
        {/* Sliders selectors */}
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center text-sm font-extrabold font-sans text-zinc-350 mb-1">
              <span>Calories</span>
              {isEditingCal ? (
                <input
                  type="number"
                  value={calories}
                  onChange={(e) => setCalories(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  onBlur={() => setIsEditingCal(false)}
                  onKeyDown={(e) => e.key === "Enter" && setIsEditingCal(false)}
                  autoFocus
                  className="w-20 border border-white/10 bg-[#282828] px-2 py-0.5 text-right text-xs font-extrabold text-[#F97316] outline-none rounded-md"
                />
              ) : (
                <span
                  onClick={() => setIsEditingCal(true)}
                  className="text-[#F97316] cursor-pointer hover:bg-[#282828]/50 bg-[#282828] px-2.5 py-1 rounded-md border border-white/5"
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
              className="w-full accent-[#F97316] cursor-pointer"
            />
            <div className="flex justify-between text-xs text-zinc-500 font-sans font-bold mt-0.5">
              <span>0 kcal</span>
              <span>600 kcal</span>
              <span>1200 kcal</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center text-sm font-extrabold font-sans text-zinc-350 mb-1">
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
                  className="w-20 border border-white/10 bg-[#282828] px-2 py-0.5 text-right text-xs font-extrabold text-[#1DB954] outline-none rounded-md"
                />
              ) : (
                <span
                  onClick={() => setIsEditingProt(true)}
                  className="text-[#1DB954] cursor-pointer hover:bg-[#282828]/50 bg-[#282828] px-2.5 py-1 rounded-md border border-white/5"
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
              className="w-full accent-[#1DB954] cursor-pointer"
            />
            <div className="flex justify-between text-xs text-zinc-500 font-sans font-bold mt-0.5">
              <span>0g</span>
              <span>50g</span>
              <span>100g</span>
            </div>
          </div>
        </div>

        <div className="h-px bg-zinc-800 my-1" />

        {/* Meal Tag Selector */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 font-sans mb-2">
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
                  className={`shrink-0 border px-4 py-2 text-xs font-extrabold transition duration-150 active:scale-95 rounded-full cursor-pointer ${
                    active
                      ? "bg-[#1DB954] border-[#1DB954] text-black font-extrabold"
                      : "bg-[#282828] border-white/5 text-zinc-300 hover:text-white"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="h-px bg-zinc-800 my-1" />

        {/* Input box */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 font-sans mb-1.5">
            Describe meal or override name
          </label>
          <input
            type="text"
            value={naturalText}
            onChange={(e) => {
              const text = e.target.value;
              setNaturalText(text);
              const parsed = parseNaturalLanguage(text);
              if (parsed) {
                setName(parsed.name);
                if (parsed.calories > 0) setCalories(parsed.calories);
                if (parsed.protein > 0) setProtein(parsed.protein);
                if (parsed.tag) setActiveTag(parsed.tag);
              } else {
                setName(text);
              }
            }}
            placeholder="e.g. egg (auto-fills breakfast) or pizza 280 kcal"
            className="w-full border border-white/10 bg-[#282828] px-4 py-3.5 text-xs text-white placeholder-zinc-550 outline-none transition focus:border-[#1DB954]/50 font-sans rounded-lg"
          />
        </div>

        {/* Confirm tracking CTA */}
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={`w-full py-4 text-sm font-extrabold transition duration-200 active:scale-95 rounded-full cursor-pointer ${
            canSubmit
              ? "bg-[#1DB954] text-black shadow-md hover:bg-[#1ed760]"
              : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
          }`}
        >
          {editId ? "Save Changes" : "Confirm Log Entry"}
        </button>
      </div>
    </div>
  );
}

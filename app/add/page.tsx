"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/AppContext";
import type { FoodTag, MealBuilderItem, FoodDbItem } from "@/lib/types";
import { FoodDBSearch } from "@/components/FoodDBSearch";
import { MealBuilder } from "@/components/MealBuilder";
import { loadCustomFoods } from "@/lib/customFoodDb";

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
    .replace(calRegex, "").replace(protRegex, "").replace(/\band\b/gi, "")
    .replace(/\s+/g, " ").trim().replace(/^[,.\s]+|[,.\s]+$/g, "");
  if (!name) name = "Logged Item";
  const formattedName = name.split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  let tag: FoodTag | undefined;
  const lower = name.toLowerCase();
  if (calories === null && protein === null) {
    if (lower.includes("egg") || lower.includes("oatmeal") || lower.includes("toast")) { calories = 70; protein = 6; tag = "breakfast"; }
    else if (lower.includes("whey") || lower.includes("shake")) { calories = 130; protein = 25; tag = "snack"; }
    else if (lower.includes("chicken") || lower.includes("salmon")) { calories = 165; protein = 31; tag = "lunch"; }
    else if (lower.includes("pizza") || lower.includes("burger") || lower.includes("fries")) { calories = 350; protein = 12; tag = "junk"; }
  }
  return { name: formattedName, calories: calories ?? 0, protein: protein ?? 0, tag };
}

type Tab = "db" | "manual";

export default function AddFoodPage() {
  const router = useRouter();
  const { addFood, updateFood, foods, hydrated, getDistinctFoods, getDaySummary, settings } = useApp();
  const today = todayStr();
  const [activeTab, setActiveTab] = useState<Tab>("db");

  // Manual form state
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

  // Meal builder state
  const [mealItems, setMealItems] = useState<MealBuilderItem[]>([]);
  const [customFoods, setCustomFoods] = useState<FoodDbItem[]>([]);
  const [initialFoodId, setInitialFoodId] = useState<string | undefined>(undefined);

  useEffect(() => {
    setCustomFoods(loadCustomFoods());
  }, []);

  const distinct = useMemo(() => getDistinctFoods(10), [getDistinctFoods]);
  const todayEntries = getDaySummary(today).entries;

  const tagsList: { value: FoodTag; label: string }[] = [
    { value: "breakfast", label: "🍳 Breakfast" },
    { value: "lunch", label: "🥗 Lunch" },
    { value: "dinner", label: "🍽️ Dinner" },
    { value: "snack", label: "🍏 Snack" },
    { value: "junk", label: "🍕 Junk" },
  ];

  // Edit mode prefill + foodId pre-selection
  useEffect(() => {
    if (typeof window !== "undefined" && hydrated && !hasPrefilled) {
      const params = new URLSearchParams(window.location.search);
      const edit = params.get("edit");
      const foodId = params.get("foodId");
      if (edit) {
        const entry = foods.find((f) => f.id === edit);
        if (entry) {
          setEditId(edit);
          setName(entry.name);
          setCalories(entry.calories);
          setProtein(entry.protein);
          setActiveTag(entry.tag);
          setEditDate(entry.date);
          setActiveTab("manual");
        }
      }
      if (foodId) {
        setInitialFoodId(foodId);
        setActiveTab("db");
      }
      setHasPrefilled(true);
    }
  }, [hydrated, foods, hasPrefilled]);

  const suggestions = useMemo(() => {
    const q = name.trim().toLowerCase();
    if (!q) return distinct.slice(0, 5);
    return distinct.filter((f) => f.name.toLowerCase().includes(q)).slice(0, 5);
  }, [name, distinct]);

  const recentlyLogged = useMemo(() => todayEntries.slice(-4).reverse(), [todayEntries]);
  const canSubmit = name.trim().length > 0;

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

  // Meal builder handlers
  const handleAddToMeal = useCallback((item: MealBuilderItem) => {
    setMealItems((prev) => [...prev, item]);
  }, []);

  const handleRemoveItem = useCallback((index: number) => {
    setMealItems((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleClearAll = useCallback(() => {
    setMealItems([]);
  }, []);

  const handleLogMeal = useCallback((mode: "combined" | "individual", tag: FoodTag) => {
    if (mealItems.length === 0) return;

    if (mode === "individual") {
      mealItems.forEach((item) => {
        addFood(
          item.name,
          item.calories,
          item.protein,
          today,
          tag,
          settings.trackCarbsFat ? item.carbs : undefined,
          settings.trackCarbsFat ? item.fat : undefined,
        );
      });
    } else {
      const totalCal = mealItems.reduce((s, i) => s + i.calories, 0);
      const totalProt = Math.round(mealItems.reduce((s, i) => s + i.protein, 0) * 10) / 10;
      const totalCarbs = Math.round(mealItems.reduce((s, i) => s + i.carbs, 0) * 10) / 10;
      const totalFat = Math.round(mealItems.reduce((s, i) => s + i.fat, 0) * 10) / 10;
      const mealName = mealItems.length === 1
        ? mealItems[0].name
        : mealItems.slice(0, 3).map(i => i.name.split(" ")[0]).join(" + ");
      addFood(
        mealName,
        totalCal,
        totalProt,
        today,
        tag,
        settings.trackCarbsFat ? totalCarbs : undefined,
        settings.trackCarbsFat ? totalFat : undefined,
      );
    }
    setMealItems([]);
    router.push("/");
  }, [mealItems, today, addFood, router, settings.trackCarbsFat]);

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 pt-6 select-none pb-12 font-sans text-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold tracking-tight text-white font-sans">
          {editId ? "Edit Entry" : "Log Nutrition"}
        </h1>
        <button
          onClick={() => router.push(editDate ? `/?date=${editDate}` : "/")}
          className="border border-white/10 bg-[#181818] px-4 py-2 text-xs font-bold text-zinc-300 hover:bg-[#282828] hover:text-white transition active:scale-95 shadow-sm rounded-full cursor-pointer"
        >
          Cancel
        </button>
      </div>

      {/* Tab Switcher (hidden in edit mode) */}
      {!editId && (
        <div className="mb-5 flex gap-1 bg-[#181818] border border-white/5 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("db")}
            className={`flex-1 py-2.5 text-xs font-extrabold transition rounded-lg cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === "db"
                ? "bg-[#1DB954] text-black shadow-sm"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/>
            </svg>
            Food DB
            {mealItems.length > 0 && (
              <span className="ml-1 bg-black/30 text-[#1DB954] px-1.5 py-0.5 rounded-full text-[10px] font-extrabold">
                {mealItems.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("manual")}
            className={`flex-1 py-2.5 text-xs font-extrabold transition rounded-lg cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === "manual"
                ? "bg-[#282828] text-white shadow-sm"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            Manual
          </button>
        </div>
      )}

      {/* ─── DB TAB ─── */}
      {activeTab === "db" && !editId && (
        <div className="space-y-4">
          <div className="border border-white/5 bg-[#181818]/80 backdrop-blur-md p-4 rounded-xl shadow-lg">
            <FoodDBSearch
              customFoods={customFoods}
              onAddToMeal={handleAddToMeal}
              trackCarbsFat={settings.trackCarbsFat}
              initialFoodId={initialFoodId}
            />
          </div>

          {/* Meal Builder */}
          {mealItems.length > 0 && (
            <MealBuilder
              items={mealItems}
              onRemoveItem={handleRemoveItem}
              onClearAll={handleClearAll}
              onLogMeal={handleLogMeal}
              trackCarbsFat={settings.trackCarbsFat}
            />
          )}
        </div>
      )}

      {/* ─── MANUAL TAB ─── */}
      {(activeTab === "manual" || editId) && (
        <div className="space-y-4">
          {/* Recents shortcuts */}
          {recentlyLogged.length > 0 && !editId && (
            <div>
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
          {suggestions.length > 0 && !editId && (
            <div className="border border-white/5 bg-[#181818] p-4 shadow-md rounded-lg">
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
                    <span className="text-sm font-bold text-white font-sans">{food.name}</span>
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
            <div className="space-y-4">
              {/* Calories */}
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
                    >
                      {calories} kcal ✎
                    </span>
                  )}
                </div>
                <input
                  type="range" min="0" max="1200" step="5"
                  value={calories > 1200 ? 1200 : calories}
                  onChange={(e) => setCalories(parseInt(e.target.value, 10))}
                  className="w-full accent-[#F97316] cursor-pointer"
                />
                <div className="flex justify-between text-xs text-zinc-500 font-sans font-bold mt-0.5">
                  <span>0 kcal</span><span>600 kcal</span><span>1200 kcal</span>
                </div>
              </div>

              {/* Protein */}
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
                      autoFocus step="0.1"
                      className="w-20 border border-white/10 bg-[#282828] px-2 py-0.5 text-right text-xs font-extrabold text-[#1DB954] outline-none rounded-md"
                    />
                  ) : (
                    <span
                      onClick={() => setIsEditingProt(true)}
                      className="text-[#1DB954] cursor-pointer hover:bg-[#282828]/50 bg-[#282828] px-2.5 py-1 rounded-md border border-white/5"
                    >
                      {protein}g ✎
                    </span>
                  )}
                </div>
                <input
                  type="range" min="0" max="100" step="1"
                  value={protein > 100 ? 100 : protein}
                  onChange={(e) => setProtein(parseInt(e.target.value, 10))}
                  className="w-full accent-[#1DB954] cursor-pointer"
                />
                <div className="flex justify-between text-xs text-zinc-500 font-sans font-bold mt-0.5">
                  <span>0g</span><span>50g</span><span>100g</span>
                </div>
              </div>
            </div>

            <div className="h-px bg-zinc-800 my-1" />

            {/* Meal Tag Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 font-sans mb-2">
                Category Tag
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

            {/* Submit */}
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
      )}
    </div>
  );
}

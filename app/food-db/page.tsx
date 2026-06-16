"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BUILT_IN_FOODS, ALL_CATEGORIES } from "@/lib/foodDatabase";
import { loadCustomFoods, addCustomFood, deleteCustomFood } from "@/lib/customFoodDb";
import type { FoodDbItem, FoodDbCategory, QuantityMode } from "@/lib/types";

const EMOJI_SUGGESTIONS: Record<FoodDbCategory, string> = {
  "Dal & Legumes": "🫘",
  "Rice & Grains": "🍚",
  "Bread & Roti": "🫓",
  "Eggs & Dairy": "🥚",
  "Chicken & Meat": "🍗",
  "Fish & Seafood": "🐟",
  "Vegetables": "🥦",
  "Fruits": "🍎",
  "Indian Dishes": "🍛",
  "Snacks & Street Food": "🍟",
  "Junk Food": "🍕",
  "Healthy & Fitness": "💪",
  "Beverages": "☕",
  "Sweets & Desserts": "🍮",
  "Custom": "🍽️",
};

export default function FoodDBPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [customFoods, setCustomFoods] = useState<FoodDbItem[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeView, setActiveView] = useState<"browse" | "custom">("browse");

  // Add custom food form state
  const [form, setForm] = useState({
    name: "",
    category: "Custom" as FoodDbCategory,
    caloriesPer100g: "" as string | number,
    proteinPer100g: "" as string | number,
    carbsPer100g: "" as string | number,
    fatPer100g: "" as string | number,
    quantityMode: "grams" as QuantityMode,
    defaultQty: 100 as number,
    gramsPerPiece: "" as string | number,
    emoji: "🍽️",
  });

  useEffect(() => {
    setCustomFoods(loadCustomFoods());
  }, []);

  const allFoods = useMemo(() => [...BUILT_IN_FOODS, ...customFoods], [customFoods]);

  const filteredFoods = useMemo(() => {
    let foods = activeView === "custom" ? customFoods : allFoods;
    if (selectedCategory !== "All") {
      foods = foods.filter((f) => f.category === selectedCategory);
    }
    if (query.trim()) {
      const q = query.toLowerCase().trim();
      foods = foods.filter((f) =>
        f.name.toLowerCase().includes(q) || f.category.toLowerCase().includes(q)
      );
    }
    return foods;
  }, [allFoods, customFoods, selectedCategory, query, activeView]);

  function handleAddFood() {
    if (!form.name.trim() || !form.caloriesPer100g || !form.proteinPer100g) return;
    const newFood = addCustomFood({
      name: form.name.trim(),
      category: form.category,
      caloriesPer100g: Number(form.caloriesPer100g),
      proteinPer100g: Number(form.proteinPer100g),
      carbsPer100g: Number(form.carbsPer100g) || 0,
      fatPer100g: Number(form.fatPer100g) || 0,
      quantityMode: form.quantityMode,
      defaultQty: form.defaultQty,
      gramsPerPiece: form.quantityMode === "piece" ? Number(form.gramsPerPiece) || 50 : undefined,
      emoji: form.emoji,
    });
    setCustomFoods((prev) => [...prev, newFood]);
    setShowAddForm(false);
    setForm({
      name: "", category: "Custom", caloriesPer100g: "", proteinPer100g: "",
      carbsPer100g: "", fatPer100g: "", quantityMode: "grams", defaultQty: 100,
      gramsPerPiece: "", emoji: "🍽️",
    });
    setActiveView("custom");
  }

  function handleDelete(id: string) {
    deleteCustomFood(id);
    setCustomFoods((prev) => prev.filter((f) => f.id !== id));
  }

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 pt-6 select-none pb-12 font-sans text-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-sans">Food Database</h1>
          <p className="text-xs text-zinc-500 mt-0.5">{BUILT_IN_FOODS.length + customFoods.length} foods total · {customFoods.length} custom</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1.5 bg-[#1DB954] text-black text-xs font-extrabold px-4 py-2 rounded-full transition active:scale-95 hover:bg-[#1ed760] cursor-pointer shadow-md"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14"/><path d="M12 5v14"/>
          </svg>
          Add Custom
        </button>
      </div>

      {/* Add Custom Food Form */}
      {showAddForm && (
        <div className="mb-5 border border-[#1DB954]/20 bg-[#181818]/90 p-5 rounded-xl shadow-xl space-y-4 animate-fade-in">
          <h2 className="text-sm font-extrabold text-white">Add Custom Food</h2>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">Food Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Homemade Paneer Tikka"
              className="w-full border border-white/10 bg-[#282828] px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none focus:border-[#1DB954]/50 rounded-lg font-sans"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">Category</label>
              <select
                value={form.category}
                onChange={(e) => {
                  const cat = e.target.value as FoodDbCategory;
                  setForm({ ...form, category: cat, emoji: EMOJI_SUGGESTIONS[cat] || "🍽️" });
                }}
                className="w-full border border-white/10 bg-[#282828] px-3 py-3 text-xs text-white outline-none focus:border-[#1DB954]/50 rounded-lg font-sans cursor-pointer"
              >
                {ALL_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">Emoji</label>
              <input
                type="text"
                value={form.emoji}
                onChange={(e) => setForm({ ...form, emoji: e.target.value })}
                className="w-full border border-white/10 bg-[#282828] px-3 py-3 text-xl text-center outline-none focus:border-[#1DB954]/50 rounded-lg"
              />
            </div>
          </div>

          {/* Macros per 100g */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">Macros per 100g *</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Calories (kcal)", key: "caloriesPer100g", color: "text-[#F97316]", required: true },
                { label: "Protein (g)", key: "proteinPer100g", color: "text-[#1DB954]", required: true },
                { label: "Carbs (g)", key: "carbsPer100g", color: "text-blue-400", required: false },
                { label: "Fat (g)", key: "fatPer100g", color: "text-yellow-400", required: false },
              ].map(({ label, key, color, required }) => (
                <div key={key}>
                  <label className={`text-[10px] font-bold ${color} mb-1 block`}>{label}{required ? " *" : ""}</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={(form as any)[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    placeholder="0"
                    className="w-full border border-white/10 bg-[#282828] px-3 py-2.5 text-sm text-white outline-none focus:border-[#1DB954]/50 rounded-lg font-sans tabular-nums"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Quantity Mode */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">Quantity Type</p>
            <div className="grid grid-cols-3 gap-2">
              {(["grams", "piece", "ml"] as QuantityMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setForm({ ...form, quantityMode: mode })}
                  className={`border py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
                    form.quantityMode === mode
                      ? "bg-[#1DB954] border-[#1DB954] text-black"
                      : "bg-[#282828] border-white/5 text-zinc-400"
                  }`}
                >
                  {mode === "grams" ? "Grams (g)" : mode === "piece" ? "Per Piece" : "mL"}
                </button>
              ))}
            </div>
            {form.quantityMode === "piece" && (
              <div className="mt-2">
                <label className="block text-[10px] font-bold text-zinc-500 mb-1.5">Grams per piece</label>
                <input
                  type="number"
                  min="1"
                  value={form.gramsPerPiece}
                  onChange={(e) => setForm({ ...form, gramsPerPiece: e.target.value })}
                  placeholder="e.g. 55 for 1 egg"
                  className="w-full border border-white/10 bg-[#282828] px-3 py-2.5 text-sm text-white outline-none focus:border-[#1DB954]/50 rounded-lg font-sans"
                />
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-1">
            <button
              onClick={handleAddFood}
              disabled={!form.name.trim() || !form.caloriesPer100g || !form.proteinPer100g}
              className="flex-1 py-3.5 bg-[#1DB954] text-black text-sm font-extrabold rounded-full transition active:scale-95 hover:bg-[#1ed760] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save Food
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="px-5 border border-white/10 bg-[#282828] text-zinc-300 text-sm font-bold rounded-full transition hover:text-white cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* View Toggle */}
      <div className="mb-4 flex gap-1 bg-[#181818] border border-white/5 p-1 rounded-xl">
        <button
          onClick={() => setActiveView("browse")}
          className={`flex-1 py-2 text-xs font-extrabold rounded-lg transition cursor-pointer ${
            activeView === "browse" ? "bg-[#282828] text-white" : "text-zinc-500 hover:text-white"
          }`}
        >
          All Foods ({allFoods.length})
        </button>
        <button
          onClick={() => setActiveView("custom")}
          className={`flex-1 py-2 text-xs font-extrabold rounded-lg transition cursor-pointer ${
            activeView === "custom" ? "bg-[#282828] text-white" : "text-zinc-500 hover:text-white"
          }`}
        >
          My Custom ({customFoods.length})
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search foods..."
          className="w-full border border-white/10 bg-[#181818] pl-10 pr-4 py-3 text-sm text-white placeholder-zinc-500 outline-none focus:border-[#1DB954]/50 rounded-lg font-sans"
        />
      </div>

      {/* Category Filter */}
      <div className="hide-scrollbar flex gap-2 overflow-x-auto pb-2 mb-3">
        {["All", ...ALL_CATEGORIES.filter((c) => c !== "Custom")].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`shrink-0 border px-3 py-1.5 text-xs font-bold rounded-full transition cursor-pointer ${
              selectedCategory === cat
                ? "bg-[#1DB954] border-[#1DB954] text-black"
                : "bg-[#181818] border-white/5 text-zinc-400 hover:text-white"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Food List */}
      {activeView === "custom" && customFoods.length === 0 ? (
        <div className="text-center py-12 text-zinc-500">
          <p className="text-3xl mb-3">📭</p>
          <p className="font-bold text-sm">No custom foods yet</p>
          <p className="text-xs mt-1">Tap "Add Custom" to create your first food</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredFoods.map((food) => (
            <div key={food.id} className="relative">  
              <button
                onClick={() => router.push(`/add?foodId=${food.id}`)}
                className="w-full flex items-center gap-3 border border-white/5 bg-[#181818] px-4 py-3 rounded-lg hover:bg-[#242424] hover:border-[#1DB954]/20 active:scale-[0.99] transition cursor-pointer text-left group"
              >
                <span className="text-xl shrink-0">{food.emoji || "🍽️"}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{food.name}</p>
                  <p className="text-[10px] text-zinc-500 font-semibold">
                    {food.category}
                    {food.isCustom && (
                      <span className="ml-2 bg-[#1DB954]/10 text-[#1DB954] px-1.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider border border-[#1DB954]/20">
                        Custom
                      </span>
                    )}
                  </p>
                </div>
                <div className="shrink-0 text-right mr-1">
                  <p className="text-xs font-bold text-[#F97316] tabular-nums">{food.caloriesPer100g} kcal</p>
                  <p className="text-[10px] text-[#1DB954]">{food.proteinPer100g}g P · per 100g</p>
                </div>
                {/* Tap hint */}
                <svg
                  xmlns="http://www.w3.org/2000/svg" width="14" height="14"
                  viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                  className="shrink-0 text-zinc-700 group-hover:text-[#1DB954] transition"
                >
                  <path d="m9 18 6-6-6-6"/>
                </svg>
              </button>

              {/* Delete button for custom foods — separate from the tap area */}
              {food.isCustom && (
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(food.id); }}
                  className="absolute right-10 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-full bg-zinc-800 text-zinc-500 hover:bg-red-500/20 hover:text-red-400 transition cursor-pointer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                  </svg>
                </button>
              )}
            </div>
          ))}

          {filteredFoods.length === 0 && query && (
            <div className="text-center py-8 text-zinc-500">
              <p className="text-2xl mb-2">🔍</p>
              <p className="font-bold text-sm">No results for "{query}"</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

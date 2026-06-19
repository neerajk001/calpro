"use client";

import { useState, useCallback, useEffect } from "react";
import type { FoodDbItem, MealBuilderItem, QuantityMode } from "@/lib/types";
import { apiClient } from "@/lib/apiClient";

interface PublicFoodProps {
  onAddToMeal: (item: MealBuilderItem) => void;
}

const UNITS: { value: string; label: string }[] = [
  { value: "g", label: "g (grams)" },
  { value: "ml", label: "ml (millilitres)" },
  { value: "piece", label: "pc (pieces)" },
];

function FoodRow({ food, onAdd, onDelete }: { food: FoodDbItem; onAdd: (f: FoodDbItem) => void; onDelete: (f: FoodDbItem) => void }) {
  return (
    <div className="flex items-center justify-between w-full px-4 py-3 hover:bg-[#EFF6FF] rounded-xl transition group">
      <button
        onClick={() => onAdd(food)}
        className="flex items-center gap-3 min-w-0 flex-1 text-left cursor-pointer active:scale-[0.99]"
      >
        <span className="text-lg shrink-0">{food.emoji || "🍽️"}</span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#111827] truncate">{food.name}</p>
          <p className="text-[10px] text-[#6B7280] font-medium">
            {food.caloriesPer100g} kcal · {food.proteinPer100g}g P / 100g
            {food.isPublic && food.servingSize && (
              <span className="ml-2 text-[10px] font-semibold text-[#2563EB] bg-[#EFF6FF] px-1.5 py-0.5 rounded-full">
                {food.quantityMode === "piece" ? `${food.gramsPerPiece}g/pc` : `${food.servingSize}${food.servingUnit}`}
              </span>
            )}
          </p>
        </div>
      </button>
      <div className="flex items-center gap-1.5 shrink-0 ml-2">
        {food.isOwner && (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(food); }}
            title="Delete your food"
            className="w-7 h-7 flex items-center justify-center rounded-full text-[#6B7280] hover:bg-red-50 hover:text-[#EF4444] opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
            </svg>
          </button>
        )}
        <button
          onClick={() => onAdd(food)}
          className="shrink-0 text-xs font-semibold text-[#3B82F6] bg-[#EFF6FF] px-2 py-1 rounded-full hover:bg-[#2563EB] hover:text-white transition cursor-pointer"
        >
          + Add
        </button>
      </div>
    </div>
  );
}

export function PublicFoodDB({ onAddToMeal }: PublicFoodProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<FoodDbItem[]>([]);
  const [recentFoods, setRecentFoods] = useState<FoodDbItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingRecent, setLoadingRecent] = useState(false);

  // Submit form state
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "", category: "Custom", calories: "", protein: "",
    carbs: "0", fat: "0", servingSize: "100", servingUnit: "g",
    gramsPerPiece: "60", emoji: "🍽️",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Load recent public foods on mount
  const loadRecent = useCallback(async () => {
    setLoadingRecent(true);
    try {
      const data = await apiClient.searchPublicFoods("");
      setRecentFoods(data);
    } catch {
      setRecentFoods([]);
    }
    setLoadingRecent(false);
  }, []);

  useEffect(() => {
    loadRecent();
  }, [loadRecent]);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const data = await apiClient.searchPublicFoods(q);
      setResults(data);
    } catch {
      setResults([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => search(searchQuery), 400);
    return () => clearTimeout(timer);
  }, [searchQuery, search]);

  const handleAddToMeal = (food: FoodDbItem) => {
    const qty = food.defaultQty || 100;
    const item: MealBuilderItem = {
      dbItemId: food.id,
      name: food.name,
      quantity: qty,
      quantityMode: food.quantityMode,
      displayQty: qty,
      calories: Math.round(food.caloriesPer100g * qty / 100),
      protein: Math.round(food.proteinPer100g * qty / 100 * 10) / 10,
      carbs: Math.round(food.carbsPer100g * qty / 100 * 10) / 10,
      fat: Math.round(food.fatPer100g * qty / 100 * 10) / 10,
      emoji: food.emoji,
      caloriesPer100g: food.caloriesPer100g,
      proteinPer100g: food.proteinPer100g,
      carbsPer100g: food.carbsPer100g,
      fatPer100g: food.fatPer100g,
      gramsPerPiece: food.gramsPerPiece,
      mlPerServing: food.mlPerServing,
    };
    onAddToMeal(item);
  };

  const handleDeletePublicFood = useCallback(async (food: FoodDbItem) => {
    if (!window.confirm(`Delete "${food.name}" from the public database?\nThis cannot be undone.`)) return;
    // Optimistically remove from both lists
    setRecentFoods((prev) => prev.filter((f) => f.id !== food.id));
    setResults((prev) => prev.filter((f) => f.id !== food.id));
    try {
      await apiClient.deletePublicFood(food.id);
    } catch (err) {
      console.error("Failed to delete public food:", err);
      // Restore if failed
      loadRecent();
    }
  }, [loadRecent]);

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.calories || !form.protein) return;
    const isPiece = form.servingUnit === "piece";
    // For piece mode: servingSize = gramsPerPiece (grams per 1 piece)
    // Nutrition entered = per 1 piece
    const effectiveServingSize = isPiece
      ? Math.max(1, Number(form.gramsPerPiece) || 60)
      : Math.max(1, Number(form.servingSize) || 100);
    if (!effectiveServingSize) return;
    setSubmitting(true);
    try {
      await apiClient.addPublicFood({
        name: form.name.trim(),
        category: form.category,
        calories: Number(form.calories),
        protein: Number(form.protein),
        carbs: Number(form.carbs) || 0,
        fat: Number(form.fat) || 0,
        servingSize: effectiveServingSize,
        servingUnit: form.servingUnit,
        emoji: form.emoji,
      });
      setSubmitted(true);
      setForm({ name: "", category: "Custom", calories: "", protein: "", carbs: "0", fat: "0", servingSize: "100", servingUnit: "g", gramsPerPiece: "60", emoji: "🍽️" });
      // Refresh recent foods so the new entry is immediately visible
      loadRecent();
      setTimeout(() => { setSubmitted(false); setShowForm(false); }, 2000);
    } catch (err) {
      console.error("Failed to submit public food:", err);
    }
    setSubmitting(false);
  };

  return (
    <div className="space-y-5">
      {/* Search */}
      <div className="relative">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B6B6B]">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search public foods contributed by users..."
          className="input-field !pl-12 !pr-12 text-[15px]"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#111827] cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
            </svg>
          </button>
        )}
      </div>

      {/* New Food Toggle */}
      <button
        onClick={() => { setShowForm(!showForm); setSubmitted(false); }}
        className="flex items-center gap-1.5 text-xs font-bold text-[#2563EB] hover:text-[#1D4ED8] cursor-pointer transition"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14"/><path d="M12 5v14"/>
        </svg>
        {showForm ? "Cancel" : "Contribute a New Food"}
      </button>

      {/* Submit Form */}
      {showForm && (
        <div className="card p-4 space-y-3 bg-[#F8FAFC] border border-[#EFF6FF] animate-fade-in">
          {submitted ? (
            <div className="text-center py-4">
              <span className="text-2xl">✅</span>
              <p className="text-sm font-bold text-[#10B981] mt-2">Food submitted to the public database!</p>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#6B7280] mb-1">Food Name</label>
                <input
                  type="text" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Poha, Chicken Curry, Brown Rice..."
                  className="w-full bg-white border border-black/5 px-3 py-2.5 text-sm text-[#111827] outline-none rounded-lg placeholder:text-[#9CA3AF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#6B7280] mb-1">Calories</label>
                  <input
                    type="number" min="0" value={form.calories}
                    onChange={(e) => setForm({ ...form, calories: e.target.value })}
                    placeholder="kcal"
                    className="w-full bg-white border border-black/5 px-3 py-2.5 text-sm text-[#2563EB] font-semibold outline-none rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#6B7280] mb-1">Protein (g)</label>
                  <input
                    type="number" min="0" step="0.1" value={form.protein}
                    onChange={(e) => setForm({ ...form, protein: e.target.value })}
                    placeholder="grams"
                    className="w-full bg-white border border-black/5 px-3 py-2.5 text-sm text-[#10B981] font-semibold outline-none rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#6B7280] mb-1">Carbs (g)</label>
                  <input
                    type="number" min="0" step="0.1" value={form.carbs}
                    onChange={(e) => setForm({ ...form, carbs: e.target.value })}
                    className="w-full bg-white border border-black/5 px-3 py-2.5 text-sm text-[#F59E0B] font-semibold outline-none rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#6B7280] mb-1">Fat (g)</label>
                  <input
                    type="number" min="0" step="0.1" value={form.fat}
                    onChange={(e) => setForm({ ...form, fat: e.target.value })}
                    className="w-full bg-white border border-black/5 px-3 py-2.5 text-sm text-[#EF4444] font-semibold outline-none rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#6B7280] mb-1">
                  Serving Size & Unit
                </label>
                {form.servingUnit === "piece" ? (
                  <div className="space-y-2">
                    <div className="bg-[#FFF7ED] border border-orange-100 rounded-lg p-2 text-[10px] text-[#92400E]">
                      <p className="font-bold mb-0.5">🥚 Piece Mode</p>
                      <p>Enter nutrition for <strong>1 piece</strong>. Specify how many grams 1 piece weighs — this lets everyone&apos;s calorie count scale correctly when they log 2+ pieces.</p>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-[#6B7280] mb-1">Grams per 1 piece</label>
                      <input
                        type="number" min="1" value={form.gramsPerPiece}
                        onChange={(e) => setForm({ ...form, gramsPerPiece: e.target.value })}
                        placeholder="e.g. 60"
                        className="w-full bg-white border border-black/5 px-3 py-2.5 text-sm text-[#111827] font-semibold outline-none rounded-lg"
                      />
                      <p className="text-[10px] text-[#2563EB] font-semibold mt-1">
                        Nutrition above = per 1 piece ({form.gramsPerPiece || "?"}g)
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-[10px] text-[#6B7280] mb-2">Enter nutrition values per this serving size. When others log with a different amount, values scale proportionally.</p>
                    <div className="flex gap-2">
                      <input
                        type="number" min="1" value={form.servingSize}
                        onChange={(e) => setForm({ ...form, servingSize: e.target.value })}
                        className="flex-1 bg-white border border-black/5 px-3 py-2.5 text-sm text-[#111827] font-semibold outline-none rounded-lg"
                      />
                    </div>
                    <p className="text-[10px] text-[#2563EB] font-semibold">
                      Values entered above = nutrition per {form.servingSize}{form.servingUnit}
                    </p>
                  </div>
                )}
              </div>

              {/* Unit selector always visible */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#6B7280] mb-1">Unit</label>
                <div className="flex bg-[#E5E7EB] rounded-lg p-0.5 gap-0.5">
                  {UNITS.map((u) => (
                    <button
                      key={u.value}
                      type="button"
                      onClick={() => setForm({ ...form, servingUnit: u.value })}
                      className={`flex-1 px-3 py-2.5 text-xs font-semibold rounded-md transition cursor-pointer whitespace-nowrap ${
                        form.servingUnit === u.value
                          ? "bg-[#2563EB] text-white"
                          : "text-[#6B7280] hover:text-[#111827]"
                      }`}
                    >
                      {u.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={!form.name.trim() || !form.calories || !form.protein || (form.servingUnit !== "piece" && !form.servingSize) || (form.servingUnit === "piece" && !form.gramsPerPiece) || submitting}
                className="w-full btn-primary text-sm font-semibold py-3 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Submitting..." : "Submit to Public Database"}
              </button>
            </>
          )}
        </div>
      )}

      {/* Results */}
      {!searchQuery.trim() && !showForm && (
        <div className="space-y-3">
          {loadingRecent && (
            <div className="flex items-center justify-center py-8">
              <div className="w-5 h-5 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          {!loadingRecent && recentFoods.length === 0 && (
            <div className="text-center py-8 text-[#6B7280] text-sm">
              <p className="text-3xl mb-2">🌍</p>
              <p className="font-semibold text-[#111827]">Public Food Database</p>
              <p className="text-xs mt-1">Be the first to contribute a food to the community!</p>
            </div>
          )}
          {!loadingRecent && recentFoods.length > 0 && (
            <>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">Recently Added by Community</p>
              <div className="space-y-1 max-h-[350px] overflow-y-auto pr-1 hide-scrollbar">
                {recentFoods.map((food) => (
                  <FoodRow key={food.id} food={food} onAdd={handleAddToMeal} onDelete={handleDeletePublicFood} />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {searchQuery.trim() && loading && (
        <div className="flex items-center justify-center py-8">
          <div className="w-5 h-5 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {searchQuery.trim() && !loading && results.length > 0 && (
        <div className="space-y-1 max-h-[350px] overflow-y-auto pr-1 hide-scrollbar">
          {results.map((food) => (
            <FoodRow key={food.id} food={food} onAdd={handleAddToMeal} onDelete={handleDeletePublicFood} />
          ))}
        </div>
      )}

      {searchQuery.trim() && !loading && searchQuery && results.length === 0 && (
        <div className="text-center py-8 text-[#6B7280] text-sm">
          <p className="text-2xl mb-2">🔍</p>
          <p>No public foods found for "{searchQuery}"</p>
          <p className="text-xs mt-1">Be the first to contribute this food!</p>
        </div>
      )}
    </div>
  );
}

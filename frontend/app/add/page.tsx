"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/AppContext";
import type { FoodTag, MealBuilderItem, FoodDbItem, MealTemplate, FoodDbCategory, QuantityMode } from "@/lib/types";
import { FoodDBSearch } from "@/components/FoodDBSearch";
import { MealBuilder } from "@/components/MealBuilder";
import { BarcodeScanner } from "@/components/BarcodeScanner";
import { apiClient } from "@/lib/apiClient";
import { ALL_CATEGORIES } from "@/lib/foodDatabase";

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
  const { addFood, updateFood, foods, hydrated, getDistinctFoods, getDaySummary, settings, customFoods, mealTemplates, deleteMealTemplate, addCustomFood, deleteCustomFood } = useApp();
  const today = todayStr();
  const [activeTab, setActiveTab] = useState<Tab>("db");

  // Custom food management
  const [showCustomFoods, setShowCustomFoods] = useState(false);
  const [showAddCustomForm, setShowAddCustomForm] = useState(false);
  const [customForm, setCustomForm] = useState({
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

  function handleAddCustomFood() {
    if (!customForm.name.trim() || !customForm.caloriesPer100g || !customForm.proteinPer100g) return;
    addCustomFood({
      name: customForm.name.trim(),
      category: customForm.category,
      caloriesPer100g: Number(customForm.caloriesPer100g),
      proteinPer100g: Number(customForm.proteinPer100g),
      carbsPer100g: Number(customForm.carbsPer100g) || 0,
      fatPer100g: Number(customForm.fatPer100g) || 0,
      quantityMode: customForm.quantityMode,
      defaultQty: customForm.defaultQty,
      gramsPerPiece: customForm.quantityMode === "piece" ? Number(customForm.gramsPerPiece) || 50 : undefined,
      emoji: customForm.emoji,
    });
    setShowAddCustomForm(false);
    setCustomForm({
      name: "", category: "Custom", caloriesPer100g: "", proteinPer100g: "",
      carbsPer100g: "", fatPer100g: "", quantityMode: "grams", defaultQty: 100,
      gramsPerPiece: "", emoji: "🍽️",
    });
  }

  // Barcode scanner state
  const [showScanner, setShowScanner] = useState(false);
  const [scannedFood, setScannedFood] = useState<FoodDbItem | undefined>(undefined);

  // Meal template actions state
  const [selectedTemplate, setSelectedTemplate] = useState<MealTemplate | null>(null);

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
  const [initialFoodId, setInitialFoodId] = useState<string | undefined>(undefined);

  const handleBarcodeScan = useCallback(async (code: string) => {
    setShowScanner(false);
    try {
      const food = await apiClient.lookupBarcode(code);
      setScannedFood(food);
    } catch (err: any) {
      console.error("Barcode lookup failed:", err);
      alert(err.message || "Failed to find barcode. Please add manually.");
    }
  }, []);

  const handleLogTemplate = useCallback((template: MealTemplate, mode: "combined" | "individual") => {
    setSelectedTemplate(null);
    template.items.forEach((item) => {
      addFood(
        item.name,
        item.calories,
        item.protein,
        today,
        template.tag,
        settings.trackCarbsFat ? item.carbs : undefined,
        settings.trackCarbsFat ? item.fat : undefined
      );
    });
    router.push("/");
  }, [addFood, today, settings.trackCarbsFat, router]);

  const handleLoadTemplateToBuilder = useCallback((template: MealTemplate) => {
    setSelectedTemplate(null);
    const convertedItems: MealBuilderItem[] = template.items.map((item) => ({
      dbItemId: item.id,
      name: item.name,
      quantity: item.quantity,
      quantityMode: item.quantityMode,
      displayQty: item.displayQty,
      calories: item.calories,
      protein: item.protein,
      carbs: item.carbs,
      fat: item.fat,
      emoji: item.emoji || undefined,
    }));
    setMealItems((prev) => [...prev, ...convertedItems]);
  }, []);

  const handleDeleteTemplate = useCallback((id: string) => {
    if (confirm("Are you sure you want to delete this meal template?")) {
      deleteMealTemplate(id);
      setSelectedTemplate(null);
    }
  }, [deleteMealTemplate]);

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
    <div className="relative min-h-full select-none font-sans text-[#f5f2eb]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white font-sans">
          {editId ? "Edit Entry" : "Log Nutrition"}
        </h1>
        <button
          onClick={() => router.push(editDate ? `/?date=${editDate}` : "/")}
          className="glass-button px-4 py-2.5 text-xs font-semibold text-zinc-300 hover:text-white transition active:scale-95 rounded-xl cursor-pointer"
        >
          Cancel
        </button>
      </div>

      {/* Tab Switcher (hidden in edit mode) */}
      {!editId && (
        <div className="mb-6 flex gap-1 glass-panel p-1 rounded-xl max-w-sm">
          <button
            onClick={() => setActiveTab("db")}
            className={`flex-1 py-2.5 text-xs font-semibold transition rounded-lg cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === "db"
                ? "bg-[#1DB954] text-[#161413] shadow-sm"
                : "text-[#a19890] hover:text-white"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/>
            </svg>
            Food DB
            {mealItems.length > 0 && (
              <span className="ml-1 bg-black/20 text-[#1DB954] px-1.5 py-0.5 rounded-full text-[10px] font-bold">
                {mealItems.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("manual")}
            className={`flex-1 py-2.5 text-xs font-semibold transition rounded-lg cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === "manual"
                ? "bg-[#282421] text-white shadow-sm"
                : "text-[#a19890] hover:text-white"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            Manual
          </button>
        </div>
      )}

      {/* ─── DB TAB ─── */}
      {activeTab === "db" && !editId && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Left Column: My Saved Meals Carousel & FoodDBSearch picker */}
          <div className="lg:col-span-7 space-y-6">
            {mealTemplates && mealTemplates.length > 0 && (
              <div className="space-y-2">
                <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-500 font-sans">
                  My Saved Meals
                </h2>
                <div className="hide-scrollbar flex gap-3 overflow-x-auto pb-1.5">
                  {mealTemplates.map((template) => {
                    const totalCals = template.items.reduce((sum, item) => sum + item.calories, 0);
                    const totalProt = template.items.reduce((sum, item) => sum + item.protein, 0);
                    const emoji = template.items[0]?.emoji || "🍱";
                    const tagEmoji = template.tag === "breakfast" ? "🍳" : template.tag === "lunch" ? "🥗" : template.tag === "dinner" ? "🍽️" : template.tag === "snack" ? "🍏" : "🍕";

                    return (
                      <button
                        key={template.id}
                        onClick={() => setSelectedTemplate(template)}
                        className="shrink-0 flex flex-col justify-between items-start text-left glass-panel p-3.5 w-[160px] h-[105px] transition hover:bg-white/[0.02] active:scale-95 rounded-xl cursor-pointer"
                      >
                        <div className="w-full">
                          <div className="flex items-center justify-between gap-1 w-full mb-1">
                            <span className="text-xs truncate font-semibold text-white font-sans">{template.name}</span>
                            <span className="text-sm shrink-0">{emoji}</span>
                            {/* Custom Foods */}
            <div className="glass-panel p-4 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => { setShowCustomFoods(!showCustomFoods); setShowAddCustomForm(false); }}
                  className="flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white transition cursor-pointer"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    className={`transition-transform ${showCustomFoods ? "rotate-90" : ""}`}
                  >
                    <path d="m9 18 6-6-6-6"/>
                  </svg>
                  My Custom Foods ({customFoods.length})
                </button>
                <button
                  onClick={() => { setShowAddCustomForm(!showAddCustomForm); setShowCustomFoods(true); }}
                  className="flex items-center gap-1 bg-[#1DB954] text-[#161413] text-[10px] font-semibold px-3 py-1.5 rounded-full transition active:scale-95 hover:bg-[#1ed760] cursor-pointer"
                >
                  + Add
                </button>
              </div>

              {showAddCustomForm && (
                <div className="border border-[#1DB954]/20 bg-[#1DB954]/5 p-4 rounded-xl space-y-3 animate-fade-in">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="col-span-2">
                      <input
                        type="text"
                        value={customForm.name}
                        onChange={(e) => setCustomForm({ ...customForm, name: e.target.value })}
                        placeholder="Food name"
                        className="w-full border border-white/[0.04] bg-[#282421] px-3 py-2 text-xs text-white placeholder-zinc-500 outline-none rounded-lg"
                      />
                    </div>
                    <div>
                      <input
                        type="number" min="0" step="0.1" placeholder="Kcal/100g"
                        value={customForm.caloriesPer100g}
                        onChange={(e) => setCustomForm({ ...customForm, caloriesPer100g: e.target.value })}
                        className="w-full border border-white/[0.04] bg-[#282421] px-3 py-2 text-xs text-[#1DB954] placeholder-zinc-500 outline-none rounded-lg"
                      />
                    </div>
                    <div>
                      <input
                        type="number" min="0" step="0.1" placeholder="Protein/100g"
                        value={customForm.proteinPer100g}
                        onChange={(e) => setCustomForm({ ...customForm, proteinPer100g: e.target.value })}
                        className="w-full border border-white/[0.04] bg-[#282421] px-3 py-2 text-xs text-[#81b29a] placeholder-zinc-500 outline-none rounded-lg"
                      />
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    {(["grams", "piece", "ml"] as QuantityMode[]).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setCustomForm({ ...customForm, quantityMode: mode })}
                        className={`px-2.5 py-1 text-[10px] font-semibold rounded-full border transition cursor-pointer ${
                          customForm.quantityMode === mode
                            ? "bg-[#1DB954] border-[#1DB954] text-[#161413]"
                            : "bg-[#282421]/50 border-white/[0.04] text-[#a19890] hover:text-white"
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddCustomFood}
                      disabled={!customForm.name.trim() || !customForm.caloriesPer100g || !customForm.proteinPer100g}
                      className="flex-1 py-2 bg-[#1DB954] text-[#161413] text-xs font-semibold rounded-full disabled:opacity-50 transition active:scale-95 cursor-pointer"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setShowAddCustomForm(false)}
                      className="px-4 py-2 border border-white/[0.04] bg-[#282421] text-zinc-400 text-xs rounded-full cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {showCustomFoods && (
                <div className="space-y-1 max-h-[200px] overflow-y-auto hide-scrollbar">
                  {customFoods.length === 0 ? (
                    <p className="text-xs text-zinc-500 text-center py-2">No custom foods yet</p>
                  ) : (
                    customFoods.map((food) => (
                      <div key={food.id} className="flex items-center justify-between px-2 py-1.5 hover:bg-white/[0.02] rounded-lg group">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-sm shrink-0">{food.emoji || "🍽️"}</span>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-white truncate">{food.name}</p>
                            <p className="text-[10px] text-zinc-500">{food.caloriesPer100g} kcal · {food.proteinPer100g}g P / 100g</p>
                          </div>
                        </div>
                        <button
                          onClick={() => deleteCustomFood(food.id)}
                          className="shrink-0 text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition p-1 cursor-pointer"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                          </svg>
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
                          <span className="text-[9px] font-semibold text-zinc-500 uppercase tracking-wide">
                            {tagEmoji} {template.tag}
                          </span>
                        </div>
                        <div className="text-xs font-semibold text-zinc-400 font-sans">
                          <p className="text-[#1DB954] leading-tight text-[11px]">{totalCals} kcal</p>
                          <p className="text-[#81b29a] text-[9px] leading-tight mt-0.5">{totalProt.toFixed(1)}g Protein</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="glass-panel p-5 rounded-2xl">
              <FoodDBSearch
                customFoods={customFoods}
                onAddToMeal={handleAddToMeal}
                trackCarbsFat={settings.trackCarbsFat}
                initialFoodId={initialFoodId}
                scannedFood={scannedFood}
                onScanClick={() => setShowScanner(true)}
              />
            </div>
          </div>

          {/* Right Column: Meal Builder active selection */}
          <div className="lg:col-span-5 lg:sticky lg:top-24">
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-widest text-zinc-500 font-sans lg:block hidden">
              Meal Composition
            </h2>
            <MealBuilder
              items={mealItems}
              onRemoveItem={handleRemoveItem}
              onClearAll={handleClearAll}
              onLogMeal={handleLogMeal}
              trackCarbsFat={settings.trackCarbsFat}
            />
          </div>
        </div>
      )}

      {/* ─── MANUAL TAB ─── */}
      {(activeTab === "manual" || editId) && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Left Column: Recents & suggestions */}
          <div className="lg:col-span-5 space-y-6">
            {recentlyLogged.length > 0 && !editId && (
              <div>
                <h2 className="mb-2 text-xs font-semibold uppercase tracking-widest text-zinc-500 font-sans">
                  Logged Today
                </h2>
                <div className="hide-scrollbar flex gap-2 overflow-x-auto pb-1">
                  {recentlyLogged.map((food) => (
                    <button
                      key={food.id}
                      onClick={() => handleReLog(food as any)}
                      className="shrink-0 border border-white/[0.04] bg-[#201c1a]/80 px-4 py-2.5 text-xs font-semibold text-[#1DB954] transition active:scale-95 hover:bg-[#282421] shadow-sm rounded-full cursor-pointer"
                    >
                      + {food.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {suggestions.length > 0 && !editId && (
              <div className="glass-panel p-4 rounded-2xl">
                <h2 className="mb-2.5 text-xs font-semibold uppercase tracking-widest text-zinc-500 font-sans">
                  Suggestions
                </h2>
                <div className="flex flex-col gap-1">
                  {suggestions.map((food) => (
                    <button
                      key={food.name}
                      onClick={() => handleSuggestionTap(food)}
                      className="flex w-full items-center justify-between px-3 py-2.5 text-left transition hover:bg-white/[0.015] active:scale-[0.99] rounded-xl cursor-pointer"
                    >
                      <span className="text-xs font-semibold text-white font-sans">{food.name}</span>
                      <span className="text-[10px] font-semibold text-zinc-400 font-sans">
                        {food.calories} kcal · {food.protein}g P
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Manual log entry form */}
          <div className="lg:col-span-7">
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-widest text-zinc-500 font-sans lg:block hidden">
              Nutrition Value Inputs
            </h2>
            <div className="flex flex-col gap-4 glass-panel p-5 rounded-2xl">
              <div className="space-y-4">
                {/* Calories */}
                <div>
                  <div className="flex justify-between items-center text-xs font-semibold font-sans text-zinc-400 uppercase tracking-wide mb-1">
                    <span>Calories</span>
                    {isEditingCal ? (
                      <input
                        type="number"
                        value={calories}
                        onChange={(e) => setCalories(Math.max(0, parseInt(e.target.value, 10) || 0))}
                        onBlur={() => setIsEditingCal(false)}
                        onKeyDown={(e) => e.key === "Enter" && setIsEditingCal(false)}
                        autoFocus
                        className="w-20 border border-white/[0.04] bg-[#282421] px-2 py-0.5 text-right text-xs font-semibold text-[#1DB954] outline-none rounded-md"
                      />
                    ) : (
                      <span
                        onClick={() => setIsEditingCal(true)}
                        className="text-[#1DB954] cursor-pointer hover:bg-white/[0.015] bg-[#282421] px-2.5 py-1 rounded-md border border-white/[0.04] font-semibold"
                      >
                        {calories} kcal ✎
                      </span>
                    )}
                  </div>
                  <input
                    type="range" min="0" max="1200" step="5"
                    value={calories > 1200 ? 1200 : calories}
                    onChange={(e) => setCalories(parseInt(e.target.value, 10))}
                    className="w-full accent-[#1DB954] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-zinc-500 font-sans font-semibold mt-0.5">
                    <span>0 kcal</span><span>600 kcal</span><span>1200 kcal</span>
                  </div>
                </div>

                {/* Protein */}
                <div>
                  <div className="flex justify-between items-center text-xs font-semibold font-sans text-zinc-400 uppercase tracking-wide mb-1">
                    <span>Protein</span>
                    {isEditingProt ? (
                      <input
                        type="number"
                        value={protein}
                        onChange={(e) => setProtein(Math.max(0, parseFloat(e.target.value) || 0))}
                        onBlur={() => setIsEditingProt(false)}
                        onKeyDown={(e) => e.key === "Enter" && setIsEditingProt(false)}
                        autoFocus step="0.1"
                        className="w-20 border border-white/[0.04] bg-[#282421] px-2 py-0.5 text-right text-xs font-semibold text-[#81b29a] outline-none rounded-md"
                      />
                    ) : (
                      <span
                        onClick={() => setIsEditingProt(true)}
                        className="text-[#81b29a] cursor-pointer hover:bg-white/[0.015] bg-[#282421] px-2.5 py-1 rounded-md border border-white/[0.04] font-semibold"
                      >
                        {protein}g ✎
                      </span>
                    )}
                  </div>
                  <input
                    type="range" min="0" max="100" step="1"
                    value={protein > 100 ? 100 : protein}
                    onChange={(e) => setProtein(parseInt(e.target.value, 10))}
                    className="w-full accent-[#81b29a] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-zinc-500 font-sans font-semibold mt-0.5">
                    <span>0g</span><span>50g</span><span>100g</span>
                  </div>
                </div>
              </div>

              <div className="h-px bg-zinc-800 my-1" />

              {/* Meal Tag Selector */}
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-400 font-sans mb-2">
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
                        className={`shrink-0 border px-4 py-2 text-xs font-semibold transition duration-150 active:scale-95 rounded-full cursor-pointer ${
                          active
                            ? "bg-[#1DB954] border-[#1DB954] text-[#161413] font-semibold"
                            : "bg-[#282421] border-white/[0.04] text-[#a19890] hover:text-white"
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
                <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-400 font-sans mb-1.5">
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
                  className="w-full border border-white/[0.04] bg-[#282421] px-4 py-3.5 text-xs text-white placeholder-zinc-550 outline-none transition focus:border-[#1DB954]/40 font-sans rounded-lg"
                />
              </div>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className={`w-full py-4 text-sm font-semibold transition duration-200 active:scale-95 rounded-full cursor-pointer ${
                  canSubmit
                    ? "bg-[#1DB954] text-[#161413] shadow-md hover:bg-[#1ed760]"
                    : "bg-[#282421] text-zinc-600 cursor-not-allowed"
                }`}
              >
                {editId ? "Save Changes" : "Confirm Log Entry"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showScanner && (
        <BarcodeScanner
          onScan={handleBarcodeScan}
          onClose={() => setShowScanner(false)}
        />
      )}

      {/* Template Actions Modal */}
      {selectedTemplate && (
        <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in font-sans">
          <div className="w-full max-w-sm glass-panel p-6 rounded-3xl relative animate-slide-up text-white">
            {/* Close button */}
            <button
              onClick={() => setSelectedTemplate(null)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 hover:bg-[#282421] transition rounded-full cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>

            {/* Title */}
            <div className="mb-4">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-[#1DB954] bg-[#1DB954]/10 border border-[#1DB954]/20 px-2.5 py-1 rounded-full">
                Saved Meal Template
              </span>
              <h3 className="text-lg font-bold text-white mt-3 truncate">{selectedTemplate.name}</h3>
              <p className="text-xs text-zinc-500 font-medium uppercase mt-0.5">
                Category: {selectedTemplate.tag}
              </p>
            </div>

            {/* Ingredients List */}
            <div className="bg-[#161413] rounded-xl border border-white/[0.04] p-3.5 mb-5 space-y-2.5 max-h-40 overflow-y-auto hide-scrollbar">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 border-b border-white/[0.04] pb-1.5">
                Ingredients ({selectedTemplate.items.length})
              </p>
              {selectedTemplate.items.map((item, idx) => (
                <div key={item.id || idx} className="flex justify-between items-center text-xs">
                  <span className="text-zinc-300 truncate pr-2 font-semibold">{item.emoji || "🍽️"} {item.name}</span>
                  <span className="text-zinc-500 font-medium shrink-0">
                    {item.displayQty} {item.quantityMode === "piece" ? (item.displayQty === 1 ? "piece" : "pieces") : item.quantityMode === "ml" ? "ml" : item.quantityMode === "serving" ? "serving" : "g"}
                  </span>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5">
              <button
                onClick={() => handleLogTemplate(selectedTemplate, "individual")}
                className="w-full py-3.5 bg-[#1DB954] hover:bg-[#1ed760] text-[#161413] text-xs font-semibold transition active:scale-95 rounded-full shadow-md cursor-pointer flex items-center justify-center gap-1.5"
              >
                🚀 Log Instantly
              </button>
              
              <button
                onClick={() => handleLoadTemplateToBuilder(selectedTemplate)}
                className="w-full py-3.5 border border-white/[0.04] hover:bg-[#282421] text-[#f5f2eb] text-xs font-semibold transition active:scale-95 rounded-full cursor-pointer flex items-center justify-center gap-1.5"
              >
                📥 Load to Meal Builder
              </button>

              <div className="flex gap-2.5 pt-1">
                <button
                  onClick={() => handleDeleteTemplate(selectedTemplate.id)}
                  className="flex-1 py-2.5 bg-red-500/5 border border-red-500/15 hover:bg-red-500/10 text-red-400 text-[10px] font-semibold transition active:scale-95 rounded-full cursor-pointer"
                >
                  🗑️ Delete Template
                </button>
                <button
                  onClick={() => setSelectedTemplate(null)}
                  className="flex-1 py-2.5 bg-[#282421] hover:bg-[#322d29] text-zinc-400 text-[10px] font-semibold transition active:scale-95 rounded-full cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

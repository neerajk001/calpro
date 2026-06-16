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
  let name = t.replace(calRegex, "").replace(protRegex, "").replace(/\band\b/gi, "").replace(/\s+/g, " ").trim().replace(/^[,.\s]+|[,.\s]+$/g, "");
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

  const [showCustomFoods, setShowCustomFoods] = useState(false);
  const [showAddCustomForm, setShowAddCustomForm] = useState(false);
  const [customForm, setCustomForm] = useState({
    name: "", category: "Custom" as FoodDbCategory, caloriesPer100g: "" as string | number,
    proteinPer100g: "" as string | number, carbsPer100g: "" as string | number,
    fatPer100g: "" as string | number, quantityMode: "grams" as QuantityMode,
    defaultQty: 100 as number, gramsPerPiece: "" as string | number, emoji: "🍽️",
  });

  function handleAddCustomFood() {
    if (!customForm.name.trim() || !customForm.caloriesPer100g || !customForm.proteinPer100g) return;
    addCustomFood({
      name: customForm.name.trim(), category: customForm.category,
      caloriesPer100g: Number(customForm.caloriesPer100g), proteinPer100g: Number(customForm.proteinPer100g),
      carbsPer100g: Number(customForm.carbsPer100g) || 0, fatPer100g: Number(customForm.fatPer100g) || 0,
      quantityMode: customForm.quantityMode, defaultQty: customForm.defaultQty,
      gramsPerPiece: customForm.quantityMode === "piece" ? Number(customForm.gramsPerPiece) || 50 : undefined,
      emoji: customForm.emoji,
    });
    setShowAddCustomForm(false);
    setCustomForm({ name: "", category: "Custom", caloriesPer100g: "", proteinPer100g: "", carbsPer100g: "", fatPer100g: "", quantityMode: "grams", defaultQty: 100, gramsPerPiece: "", emoji: "🍽️" });
  }

  const [showScanner, setShowScanner] = useState(false);
  const [scannedFood, setScannedFood] = useState<FoodDbItem | undefined>(undefined);
  const [selectedTemplate, setSelectedTemplate] = useState<MealTemplate | null>(null);
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
  const [mealItems, setMealItems] = useState<MealBuilderItem[]>([]);
  const [initialFoodId, setInitialFoodId] = useState<string | undefined>(undefined);

  const handleBarcodeScan = useCallback(async (code: string) => {
    setShowScanner(false);
    try { const food = await apiClient.lookupBarcode(code); setScannedFood(food); }
    catch (err: any) { console.error("Barcode lookup failed:", err); alert(err.message || "Failed to find barcode."); }
  }, []);

  const handleLogTemplate = useCallback((template: MealTemplate) => {
    setSelectedTemplate(null);
    template.items.forEach((item) => addFood(item.name, item.calories, item.protein, today, template.tag, settings.trackCarbsFat ? item.carbs : undefined, settings.trackCarbsFat ? item.fat : undefined));
    router.push("/");
  }, [addFood, today, settings.trackCarbsFat, router]);

  const handleLoadTemplateToBuilder = useCallback((template: MealTemplate) => {
    setSelectedTemplate(null);
    const convertedItems: MealBuilderItem[] = template.items.map((item) => ({ dbItemId: item.id, name: item.name, quantity: item.quantity, quantityMode: item.quantityMode, displayQty: item.displayQty, calories: item.calories, protein: item.protein, carbs: item.carbs, fat: item.fat, emoji: item.emoji || undefined }));
    setMealItems((prev) => [...prev, ...convertedItems]);
  }, []);

  const handleDeleteTemplate = useCallback((id: string) => {
    if (confirm("Are you sure you want to delete this meal template?")) { deleteMealTemplate(id); setSelectedTemplate(null); }
  }, [deleteMealTemplate]);

  const distinct = useMemo(() => getDistinctFoods(10), [getDistinctFoods]);
  const todayEntries = getDaySummary(today).entries;

  const tagsList: { value: FoodTag; label: string }[] = [
    { value: "breakfast", label: "🍳 Breakfast" }, { value: "lunch", label: "🥗 Lunch" },
    { value: "dinner", label: "🍽️ Dinner" }, { value: "snack", label: "🍏 Snack" }, { value: "junk", label: "🍕 Junk" },
  ];

  useEffect(() => {
    if (typeof window !== "undefined" && hydrated && !hasPrefilled) {
      const params = new URLSearchParams(window.location.search);
      const edit = params.get("edit"); const foodId = params.get("foodId");
      if (edit) {
        const entry = foods.find((f) => f.id === edit);
        if (entry) { setEditId(edit); setName(entry.name); setCalories(entry.calories); setProtein(entry.protein); setActiveTag(entry.tag); setEditDate(entry.date); setActiveTab("manual"); }
      }
      if (foodId) { setInitialFoodId(foodId); setActiveTab("db"); }
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
    if (editId) { updateFood(editId, finalName, calories, protein, editDate, activeTag); router.push(editDate ? `/?date=${editDate}` : "/"); }
    else { addFood(finalName, calories, protein, today, activeTag); router.push("/"); }
  }

  function handleSuggestionTap(food: { name: string; calories: number; protein: number }) { setNaturalText(""); setName(food.name); setCalories(food.calories); setProtein(food.protein); }
  function handleReLog(food: { name: string; calories: number; protein: number; tag: FoodTag }) { addFood(food.name, food.calories, food.protein, today, food.tag || activeTag); router.push("/"); }

  const handleAddToMeal = useCallback((item: MealBuilderItem) => { setMealItems((prev) => [...prev, item]); }, []);
  const handleRemoveItem = useCallback((index: number) => { setMealItems((prev) => prev.filter((_, i) => i !== index)); }, []);
  const handleClearAll = useCallback(() => { setMealItems([]); }, []);

  const handleLogMeal = useCallback((mode: "combined" | "individual", tag: FoodTag) => {
    if (mealItems.length === 0) return;
    if (mode === "individual") {
      mealItems.forEach((item) => addFood(item.name, item.calories, item.protein, today, tag, settings.trackCarbsFat ? item.carbs : undefined, settings.trackCarbsFat ? item.fat : undefined));
    } else {
      const totalCal = mealItems.reduce((s, i) => s + i.calories, 0);
      const totalProt = Math.round(mealItems.reduce((s, i) => s + i.protein, 0) * 10) / 10;
      const totalCarbs = Math.round(mealItems.reduce((s, i) => s + i.carbs, 0) * 10) / 10;
      const totalFat = Math.round(mealItems.reduce((s, i) => s + i.fat, 0) * 10) / 10;
      const mealName = mealItems.length === 1 ? mealItems[0].name : mealItems.slice(0, 3).map(i => i.name.split(" ")[0]).join(" + ");
      addFood(mealName, totalCal, totalProt, today, tag, settings.trackCarbsFat ? totalCarbs : undefined, settings.trackCarbsFat ? totalFat : undefined);
    }
    setMealItems([]);
    router.push("/");
  }, [mealItems, today, addFood, router, settings.trackCarbsFat]);

  return (
    <div className="relative min-h-full select-none text-[#1F1F1F]">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight">{editId ? "Edit Entry" : "Log Nutrition"}</h1>
        <button onClick={() => router.push(editDate ? `/?date=${editDate}` : "/")} className="btn-secondary px-4 py-2.5 text-xs font-semibold rounded-xl cursor-pointer">Cancel</button>
      </div>

      {!editId && (
        <div className="mb-6 flex gap-1 card p-1 rounded-2xl max-w-sm">
          <button onClick={() => setActiveTab("db")} className={`flex-1 py-2.5 text-xs font-semibold transition rounded-xl cursor-pointer flex items-center justify-center gap-1.5 ${activeTab === "db" ? "bg-[#96CE4B] text-white" : "text-[#9A9A9A] hover:text-[#1F1F1F]"}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/></svg>
            Food DB
            {mealItems.length > 0 && <span className="ml-1 bg-[#EAF5D6] text-[#96CE4B] px-1.5 py-0.5 rounded-full text-[10px] font-bold">{mealItems.length}</span>}
          </button>
          <button onClick={() => setActiveTab("manual")} className={`flex-1 py-2.5 text-xs font-semibold transition rounded-xl cursor-pointer flex items-center justify-center gap-1.5 ${activeTab === "manual" ? "bg-[#F4F7EF] text-[#1F1F1F]" : "text-[#9A9A9A] hover:text-[#1F1F1F]"}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            Manual
          </button>
        </div>
      )}

      {activeTab === "db" && !editId && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 space-y-6">
            {mealTemplates && mealTemplates.length > 0 && (
              <div className="space-y-2">
                <h2 className="text-xs font-semibold uppercase tracking-widest text-[#9A9A9A]">My Saved Meals</h2>
                <div className="hide-scrollbar flex gap-3 overflow-x-auto pb-1.5">
                  {mealTemplates.map((template) => {
                    const totalCals = template.items.reduce((sum, item) => sum + item.calories, 0);
                    const totalProt = template.items.reduce((sum, item) => sum + item.protein, 0);
                    const emoji = template.items[0]?.emoji || "🍱";
                    const tagEmoji = template.tag === "breakfast" ? "🍳" : template.tag === "lunch" ? "🥗" : template.tag === "dinner" ? "🍽️" : template.tag === "snack" ? "🍏" : "🍕";
                    return (
                      <button key={template.id} onClick={() => setSelectedTemplate(template)} className="shrink-0 flex flex-col justify-between items-start text-left card p-3.5 w-[160px] h-[105px] transition hover:bg-[#F8FBF4] active:scale-95 rounded-xl cursor-pointer">
                        <div className="w-full">
                          <div className="flex items-center justify-between gap-1 w-full mb-1">
                            <span className="text-xs truncate font-semibold text-[#1F1F1F]">{template.name}</span>
                            <span className="text-sm shrink-0">{emoji}</span>
                          </div>
                          <span className="text-[9px] font-semibold text-[#9A9A9A] uppercase tracking-wide">{tagEmoji} {template.tag}</span>
                        </div>
                        <div className="text-xs font-semibold text-[#666666]">
                          <p className="text-[#96CE4B] leading-tight text-[11px]">{totalCals} kcal</p>
                          <p className="text-[#8BC6A2] text-[9px] leading-tight mt-0.5">{totalProt.toFixed(1)}g Protein</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="card p-5">
              <FoodDBSearch customFoods={customFoods} onAddToMeal={handleAddToMeal} trackCarbsFat={settings.trackCarbsFat} initialFoodId={initialFoodId} scannedFood={scannedFood} onScanClick={() => setShowScanner(true)} />
            </div>

            <div className="card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <button onClick={() => { setShowCustomFoods(!showCustomFoods); setShowAddCustomForm(false); }} className="flex items-center gap-2 text-xs font-semibold text-[#666666] hover:text-[#1F1F1F] transition cursor-pointer">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform ${showCustomFoods ? "rotate-90" : ""}`}><path d="m9 18 6-6-6-6"/></svg>
                  My Custom Foods ({customFoods.length})
                </button>
                <button onClick={() => { setShowAddCustomForm(!showAddCustomForm); setShowCustomFoods(true); }} className="flex items-center gap-1 btn-primary h-auto py-1.5 px-3 text-[10px] font-semibold cursor-pointer">+ Add</button>
              </div>

              {showAddCustomForm && (
                <div className="bg-[#F8FBF4] p-4 rounded-xl space-y-3 border border-[#EAF5D6] animate-fade-in">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="col-span-2">
                      <input type="text" value={customForm.name} onChange={(e) => setCustomForm({ ...customForm, name: e.target.value })} placeholder="Food name" className="w-full bg-[#FFFFFF] border border-[#F4F7EF] px-3 py-2 text-xs text-[#1F1F1F] placeholder-[#9A9A9A] outline-none rounded-lg" />
                    </div>
                    <div><input type="number" min="0" step="0.1" placeholder="Kcal/100g" value={customForm.caloriesPer100g} onChange={(e) => setCustomForm({ ...customForm, caloriesPer100g: e.target.value })} className="w-full bg-[#FFFFFF] border border-[#F4F7EF] px-3 py-2 text-xs text-[#96CE4B] placeholder-[#9A9A9A] outline-none rounded-lg" /></div>
                    <div><input type="number" min="0" step="0.1" placeholder="Protein/100g" value={customForm.proteinPer100g} onChange={(e) => setCustomForm({ ...customForm, proteinPer100g: e.target.value })} className="w-full bg-[#FFFFFF] border border-[#F4F7EF] px-3 py-2 text-xs text-[#8BC6A2] placeholder-[#9A9A9A] outline-none rounded-lg" /></div>
                  </div>
                  <div className="flex gap-1.5">
                    {(["grams", "piece", "ml"] as QuantityMode[]).map((mode) => (
                      <button key={mode} type="button" onClick={() => setCustomForm({ ...customForm, quantityMode: mode })} className={`px-2.5 py-1 text-[10px] font-semibold rounded-full border transition cursor-pointer ${customForm.quantityMode === mode ? "bg-[#96CE4B] border-[#96CE4B] text-white" : "bg-[#F4F7EF] border-transparent text-[#666666] hover:text-[#1F1F1F]"}`}>{mode}</button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleAddCustomFood} disabled={!customForm.name.trim() || !customForm.caloriesPer100g || !customForm.proteinPer100g} className="flex-1 btn-primary h-auto py-2 text-xs font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">Save</button>
                    <button onClick={() => setShowAddCustomForm(false)} className="px-4 py-2 bg-[#F4F7EF] text-[#666666] text-xs rounded-xl cursor-pointer">Cancel</button>
                  </div>
                </div>
              )}

              {showCustomFoods && (
                <div className="space-y-1 max-h-[200px] overflow-y-auto hide-scrollbar">
                  {customFoods.length === 0 ? <p className="text-xs text-[#9A9A9A] text-center py-2">No custom foods yet</p> : customFoods.map((food) => (
                    <div key={food.id} className="flex items-center justify-between px-2 py-1.5 hover:bg-[#F4F7EF] rounded-lg group">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm shrink-0">{food.emoji || "🍽️"}</span>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-[#1F1F1F] truncate">{food.name}</p>
                          <p className="text-[10px] text-[#9A9A9A]">{food.caloriesPer100g} kcal · {food.proteinPer100g}g P / 100g</p>
                        </div>
                      </div>
                      <button onClick={() => deleteCustomFood(food.id)} className="shrink-0 text-[#9A9A9A] hover:text-[#F1A09C] opacity-0 group-hover:opacity-100 transition p-1 cursor-pointer">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-5 lg:sticky lg:top-24">
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#9A9A9A] lg:block hidden">Meal Composition</h2>
            <MealBuilder items={mealItems} onRemoveItem={handleRemoveItem} onClearAll={handleClearAll} onLogMeal={handleLogMeal} trackCarbsFat={settings.trackCarbsFat} />
          </div>
        </div>
      )}

      {(activeTab === "manual" || editId) && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 space-y-6">
            {recentlyLogged.length > 0 && !editId && (
              <div>
                <h2 className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#9A9A9A]">Logged Today</h2>
                <div className="hide-scrollbar flex gap-2 overflow-x-auto pb-1">
                  {recentlyLogged.map((food) => (
                    <button key={food.id} onClick={() => handleReLog(food as any)} className="shrink-0 chip text-[#96CE4B] cursor-pointer">+ {food.name}</button>
                  ))}
                </div>
              </div>
            )}
            {suggestions.length > 0 && !editId && (
              <div className="card p-4">
                <h2 className="mb-2.5 text-xs font-semibold uppercase tracking-widest text-[#9A9A9A]">Suggestions</h2>
                <div className="flex flex-col gap-1">
                  {suggestions.map((food) => (
                    <button key={food.name} onClick={() => handleSuggestionTap(food)} className="flex w-full items-center justify-between px-3 py-2.5 text-left transition hover:bg-[#F4F7EF] active:scale-[0.99] rounded-xl cursor-pointer">
                      <span className="text-xs font-semibold text-[#1F1F1F]">{food.name}</span>
                      <span className="text-[10px] font-semibold text-[#666666]">{food.calories} kcal · {food.protein}g P</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-7">
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#9A9A9A] lg:block hidden">Nutrition Value Inputs</h2>
            <div className="flex flex-col gap-4 card p-5">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center text-xs font-semibold text-[#9A9A9A] uppercase tracking-wide mb-1">
                    <span>Calories</span>
                    {isEditingCal ? (
                      <input type="number" value={calories} onChange={(e) => setCalories(Math.max(0, parseInt(e.target.value, 10) || 0))} onBlur={() => setIsEditingCal(false)} onKeyDown={(e) => e.key === "Enter" && setIsEditingCal(false)} autoFocus className="w-20 bg-[#F4F7EF] px-2 py-0.5 text-right text-xs font-semibold text-[#96CE4B] outline-none rounded-md" />
                    ) : (
                      <span onClick={() => setIsEditingCal(true)} className="text-[#96CE4B] cursor-pointer bg-[#F4F7EF] px-2.5 py-1 rounded-md font-semibold">{calories} kcal ✎</span>
                    )}
                  </div>
                  <input type="range" min="0" max="1200" step="5" value={calories > 1200 ? 1200 : calories} onChange={(e) => setCalories(parseInt(e.target.value, 10))} className="w-full accent-[#96CE4B] cursor-pointer" />
                  <div className="flex justify-between text-[10px] text-[#9A9A9A] font-semibold mt-0.5"><span>0 kcal</span><span>600 kcal</span><span>1200 kcal</span></div>
                </div>
                <div>
                  <div className="flex justify-between items-center text-xs font-semibold text-[#9A9A9A] uppercase tracking-wide mb-1">
                    <span>Protein</span>
                    {isEditingProt ? (
                      <input type="number" value={protein} onChange={(e) => setProtein(Math.max(0, parseFloat(e.target.value) || 0))} onBlur={() => setIsEditingProt(false)} onKeyDown={(e) => e.key === "Enter" && setIsEditingProt(false)} autoFocus step="0.1" className="w-20 bg-[#F4F7EF] px-2 py-0.5 text-right text-xs font-semibold text-[#8BC6A2] outline-none rounded-md" />
                    ) : (
                      <span onClick={() => setIsEditingProt(true)} className="text-[#8BC6A2] cursor-pointer bg-[#F4F7EF] px-2.5 py-1 rounded-md font-semibold">{protein}g ✎</span>
                    )}
                  </div>
                  <input type="range" min="0" max="100" step="1" value={protein > 100 ? 100 : protein} onChange={(e) => setProtein(parseInt(e.target.value, 10))} className="w-full accent-[#8BC6A2] cursor-pointer" />
                  <div className="flex justify-between text-[10px] text-[#9A9A9A] font-semibold mt-0.5"><span>0g</span><span>50g</span><span>100g</span></div>
                </div>
              </div>

              <div className="h-px bg-[#F4F7EF]" />
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-widest text-[#9A9A9A] mb-2">Category Tag</label>
                <div className="hide-scrollbar flex gap-2 overflow-x-auto pb-1">
                  {tagsList.map((item) => {
                    const active = activeTag === item.value;
                    return (
                      <button key={item.value} type="button" onClick={() => setActiveTag(item.value)}
                        className={`shrink-0 px-4 py-2 text-xs font-semibold transition active:scale-95 rounded-full cursor-pointer ${active ? "bg-[#96CE4B] text-white" : "chip"}`}>
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="h-px bg-[#F4F7EF]" />
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-widest text-[#9A9A9A] mb-1.5">Describe meal or override name</label>
                <input type="text" value={naturalText} onChange={(e) => {
                  const text = e.target.value; setNaturalText(text);
                  const parsed = parseNaturalLanguage(text);
                  if (parsed) { setName(parsed.name); if (parsed.calories > 0) setCalories(parsed.calories); if (parsed.protein > 0) setProtein(parsed.protein); if (parsed.tag) setActiveTag(parsed.tag); }
                  else { setName(text); }
                }} placeholder="e.g. egg (auto-fills breakfast) or pizza 280 kcal" className="w-full bg-[#F4F7EF] border border-[#EAF5D6] px-4 py-3.5 text-xs text-[#1F1F1F] placeholder-[#9A9A9A] outline-none focus:border-[#96CE4B]/40 rounded-xl" />
              </div>

              <button onClick={handleSubmit} disabled={!canSubmit} className={`w-full py-4 text-sm font-semibold transition active:scale-95 rounded-2xl cursor-pointer ${canSubmit ? "btn-primary" : "bg-[#F4F7EF] text-[#9A9A9A] cursor-not-allowed h-[52px] flex items-center justify-center"}`}>
                {editId ? "Save Changes" : "Confirm Log Entry"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showScanner && <BarcodeScanner onScan={handleBarcodeScan} onClose={() => setShowScanner(false)} />}

      {selectedTemplate && (
        <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm card p-6 relative animate-slide-up">
            <button onClick={() => setSelectedTemplate(null)} className="absolute top-4 right-4 text-[#9A9A9A] hover:text-[#1F1F1F] p-1 hover:bg-[#F4F7EF] transition rounded-full cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
            <div className="mb-4">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-[#96CE4B] bg-[#EAF5D6] px-2.5 py-1 rounded-full">Saved Meal Template</span>
              <h3 className="text-lg font-bold text-[#1F1F1F] mt-3 truncate">{selectedTemplate.name}</h3>
              <p className="text-xs text-[#9A9A9A] font-medium uppercase mt-0.5">Category: {selectedTemplate.tag}</p>
            </div>
            <div className="bg-[#F4F7EF] rounded-xl p-3.5 mb-5 space-y-2.5 max-h-40 overflow-y-auto hide-scrollbar">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#9A9A9A] border-b border-[#EAF5D6] pb-1.5">Ingredients ({selectedTemplate.items.length})</p>
              {selectedTemplate.items.map((item, idx) => (
                <div key={item.id || idx} className="flex justify-between items-center text-xs">
                  <span className="text-[#1F1F1F] truncate pr-2 font-semibold">{item.emoji || "🍽️"} {item.name}</span>
                  <span className="text-[#9A9A9A] font-medium shrink-0">{item.displayQty} {item.quantityMode === "piece" ? (item.displayQty === 1 ? "piece" : "pieces") : item.quantityMode === "ml" ? "ml" : item.quantityMode === "serving" ? "serving" : "g"}</span>
                </div>
              ))}
            </div>
            <div className="space-y-2.5">
              <button onClick={() => handleLogTemplate(selectedTemplate)} className="btn-primary w-full cursor-pointer">🚀 Log Instantly</button>
              <button onClick={() => handleLoadTemplateToBuilder(selectedTemplate)} className="btn-secondary w-full cursor-pointer">📥 Load to Meal Builder</button>
              <div className="flex gap-2.5 pt-1">
                <button onClick={() => handleDeleteTemplate(selectedTemplate.id)} className="flex-1 py-2.5 bg-[#F1A09C]/10 hover:bg-[#F1A09C]/20 text-[#F1A09C] text-[10px] font-semibold transition active:scale-95 rounded-full cursor-pointer">🗑️ Delete Template</button>
                <button onClick={() => setSelectedTemplate(null)} className="flex-1 py-2.5 bg-[#F4F7EF] hover:bg-[#EAF5D6] text-[#666666] text-[10px] font-semibold transition active:scale-95 rounded-full cursor-pointer">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

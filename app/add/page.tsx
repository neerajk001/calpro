"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/AppContext";

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function AddFoodPage() {
  const router = useRouter();
  const { addFood, getDistinctFoods, getDaySummary } = useApp();
  const today = todayStr();

  const [name, setName] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");

  const distinct = useMemo(() => getDistinctFoods(8), [getDistinctFoods]);
  const todayExists = getDaySummary(today).entries;

  const suggestions = useMemo(() => {
    if (!name.trim()) return distinct.slice(0, 8);
    const q = name.toLowerCase();
    return distinct.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        String(f.calories).includes(q) ||
        String(f.protein).includes(q),
    );
  }, [name, distinct]);

  const recentlyLogged = useMemo(
    () => todayExists.slice(-3).reverse(),
    [todayExists],
  );

  function handleSubmit() {
    const cal = parseInt(calories, 10);
    const prot = parseInt(protein, 10);
    if (!name.trim() || isNaN(cal) || cal <= 0 || isNaN(prot) || prot < 0)
      return;
    addFood(name.trim(), cal, prot, today);
    router.push("/");
  }

  function handleSuggestionTap(food: {
    name: string;
    calories: number;
    protein: number;
  }) {
    setName(food.name);
    setCalories(String(food.calories));
    setProtein(String(food.protein));
  }

  function handleReLog(food: {
    name: string;
    calories: number;
    protein: number;
  }) {
    addFood(food.name, food.calories, food.protein, today);
    router.push("/");
  }

  const canSubmit =
    name.trim() &&
    calories &&
    parseInt(calories, 10) > 0 &&
    protein &&
    parseInt(protein, 10) >= 0;

  return (
    <div className="mx-auto max-w-lg px-4 pb-24 pt-6">
      <h1 className="mb-6 text-lg font-semibold text-slate-900 dark:text-slate-100">
        Add Food
      </h1>

      {/* Re-log from today */}
      {recentlyLogged.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
            Re-log from today
          </h2>
          <div className="hide-scrollbar flex gap-2 overflow-x-auto">
            {recentlyLogged.map((food) => (
              <button
                key={food.id}
                onClick={() => handleReLog(food)}
                className="shrink-0 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition active:scale-95 hover:border-accent hover:text-accent dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              >
                + {food.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
            {name.trim() ? "Matching" : "Recent"}
          </h2>
          <div className="space-y-1">
            {suggestions.map((food) => (
              <button
                key={food.name}
                onClick={() => handleSuggestionTap(food)}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {food.name}
                </span>
                <span className="text-xs text-slate-400">
                  {food.calories} kcal · {food.protein}g P
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Manual form */}
      <div className="space-y-4">
        <div>
          <label
            htmlFor="food-name"
            className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400"
          >
            Food name
          </label>
          <input
            id="food-name"
            type="text"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Chicken Breast"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 transition focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="food-calories"
              className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400"
            >
              Calories (kcal)
            </label>
            <input
              id="food-calories"
              type="number"
              inputMode="numeric"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              placeholder="310"
              min="1"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 transition focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500"
            />
          </div>
          <div>
            <label
              htmlFor="food-protein"
              className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400"
            >
              Protein (g)
            </label>
            <input
              id="food-protein"
              type="number"
              inputMode="numeric"
              value={protein}
              onChange={(e) => setProtein(e.target.value)}
              placeholder="58"
              min="0"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 transition focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500"
            />
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={`w-full rounded-xl py-3.5 text-sm font-semibold transition ${
            canSubmit
              ? "bg-accent text-white shadow-lg shadow-accent/30 hover:bg-accent-dark active:scale-[0.98]"
              : "cursor-not-allowed bg-slate-200 text-slate-400 dark:bg-slate-700 dark:text-slate-500"
          }`}
        >
          Add to Today
        </button>
      </div>
    </div>
  );
}

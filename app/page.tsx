"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useApp } from "@/lib/AppContext";
import { DualProgressRing, ProgressSkeleton } from "@/components/ProgressRing";
import { FoodEntryItem } from "@/components/FoodEntry";

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function fmtDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function offsetDate(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function isToday(dateStr: string): boolean {
  return dateStr === todayStr();
}

export default function DashboardPage() {
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const {
    hydrated,
    settings,
    getDaySummary,
    deleteFood,
    getDistinctFoods,
    addFood,
  } = useApp();

  const summary = getDaySummary(selectedDate);
  const distinct = getDistinctFoods(4);
  const today = todayStr();
  const canGoForward = selectedDate < today;

  const handleQuickAdd = useCallback(
    (name: string, calories: number, protein: number) => {
      addFood(name, calories, protein, selectedDate);
    },
    [addFood, selectedDate],
  );

  return (
    <div className="mx-auto max-w-lg px-4 pb-24 pt-6">
      {/* Date selector */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => setSelectedDate((d) => offsetDate(d, -1))}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
          aria-label="Previous day"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>

        <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          {isToday(selectedDate) ? "Today" : fmtDate(selectedDate)}
          {isToday(selectedDate) && (
            <span className="ml-1.5 text-xs font-normal text-slate-400">
              {fmtDate(selectedDate)}
            </span>
          )}
        </h1>

        <button
          onClick={() =>
            canGoForward && setSelectedDate((d) => offsetDate(d, 1))
          }
          disabled={!canGoForward}
          className={`rounded-lg p-2 transition ${
            canGoForward
              ? "text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
              : "text-slate-200 dark:text-slate-700"
          }`}
          aria-label="Next day"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
      </div>

      {/* Progress */}
      <div className="mb-8">
        {hydrated ? (
          <DualProgressRing
            calorieProgress={summary.calorieProgress}
            proteinProgress={summary.proteinProgress}
            calorieTotal={summary.totalCalories}
            calorieTarget={settings.dailyCalorieTarget}
            proteinTotal={summary.totalProtein}
            proteinTarget={settings.dailyProteinTarget}
          />
        ) : (
          <ProgressSkeleton />
        )}
      </div>

      {/* Food log */}
      <div className="mb-6">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {isToday(selectedDate) ? "Today's" : ""} Log
        </h2>

        {summary.entries.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-slate-200 px-6 py-12 text-center dark:border-slate-700">
            <p className="text-sm text-slate-400 dark:text-slate-500">
              No food logged yet.
            </p>
            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
              Tap + Add to get started!
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {summary.entries.map((entry) => (
              <FoodEntryItem
                key={entry.id}
                entry={entry}
                onDelete={() => deleteFood(entry.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Quick add */}
      {distinct.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Quick Add
          </h2>
          <div className="hide-scrollbar flex gap-2 overflow-x-auto">
            {distinct.map((food) => (
              <button
                key={food.name}
                onClick={() =>
                  handleQuickAdd(food.name, food.calories, food.protein)
                }
                className="shrink-0 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition active:scale-95 hover:border-accent hover:text-accent dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-accent dark:hover:text-accent"
              >
                {food.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* FAB — only on today */}
      {isToday(selectedDate) && (
        <div className="fixed bottom-20 right-4 z-40 md:right-[calc(50%-144px)]">
          <Link
            href="/add"
            className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-white shadow-lg shadow-accent/30 transition hover:bg-accent-dark active:scale-95"
            aria-label="Add food"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 5v14" />
              <path d="M5 12h14" />
            </svg>
          </Link>
        </div>
      )}
    </div>
  );
}

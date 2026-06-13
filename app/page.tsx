"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useApp } from "@/lib/AppContext";
import { DualProgressRing, ProgressSkeleton } from "@/components/ProgressRing";
import { FoodEntryItem } from "@/components/FoodEntry";
import type { FoodTag, FoodEntry } from "@/lib/types";

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
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
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function isToday(dateStr: string): boolean {
  return dateStr === todayStr();
}

export default function DashboardPage() {
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showUndo, setShowUndo] = useState(false);

  const {
    hydrated,
    settings,
    getDaySummary,
    deleteFood,
    undoDeleteFood,
    hasLastDeleted,
    getDistinctFoods,
    addFood,
  } = useApp();

  const summary = getDaySummary(selectedDate);
  const distinct = getDistinctFoods(4);
  const today = todayStr();
  const canGoForward = selectedDate < today;

  // Sync date selection from query parameters (retrospective view navigation)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const date = params.get("date");
      if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
        setSelectedDate(date);
      }
    }
  }, []);

  // Hydrate onboarding overlay state
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isDismissed = localStorage.getItem("calpro_onboarded_v1");
      if (!isDismissed) {
        setShowOnboarding(true);
      }
    }
  }, []);

  // Show undo toast when a log is deleted
  useEffect(() => {
    if (hasLastDeleted) {
      setShowUndo(true);
      const timer = setTimeout(() => {
        setShowUndo(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [hasLastDeleted]);

  const handleStartTracking = () => {
    localStorage.setItem("calpro_onboarded_v1", "true");
    setShowOnboarding(false);
  };

  const handleQuickAdd = useCallback(
    (name: string, calories: number, protein: number, tag: FoodTag = "snack") => {
      addFood(name, calories, protein, selectedDate, tag);
    },
    [addFood, selectedDate],
  );

  const getTwitterShareUrl = () => {
    const text = `Hit my nutritional targets early today with Calpro! ⚡\n\n🔥 Calories: ${summary.totalCalories} / ${settings.dailyCalorieTarget} kcal\n💪 Protein: ${summary.totalProtein} / ${settings.dailyProteinTarget}g\n\nTrack your nutrition in 3 seconds. Zero sign-up. 👇\nhttps://calpro.app`;
    return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
  };

  const starterFoods = [
    { name: "2 Scrambled Eggs", calories: 140, protein: 12, tag: "breakfast" as FoodTag },
    { name: "Whey Protein Shake", calories: 130, protein: 25, tag: "snack" as FoodTag },
    { name: "Greek Yogurt Cup", calories: 120, protein: 15, tag: "snack" as FoodTag },
  ];

  // Group logged items by categories
  const tagsOrder: FoodTag[] = ["breakfast", "lunch", "dinner", "snack", "junk"];
  const groupedEntries = summary.entries.reduce((acc, entry) => {
    const t = entry.tag || "snack";
    if (!acc[t]) acc[t] = [];
    acc[t].push(entry);
    return acc;
  }, {} as Record<FoodTag, FoodEntry[]>);

  const tagLabelMapping = {
    breakfast: "🍳 Breakfast",
    lunch: "🥗 Lunch",
    dinner: "🍽️ Dinner",
    snack: "🍏 Snack",
    junk: "🍕 Junk Food",
  };

  return (
    <div className="relative min-h-full px-4 pb-28 pt-6 select-none font-sans">
      {/* Onboarding Dialog Overlay */}
      {showOnboarding && (
        <div className="fixed inset-0 z-55 flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-2xl backdrop-blur-xl text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#10B981]/15 text-[#10B981] mb-4">
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
                <path d="M12 2v20" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-extrabold tracking-tight text-white font-sans">
              CalPro
            </h2>
            <p className="mt-1 text-sm font-semibold tracking-wider text-[#10B981] uppercase font-sans">
              Track in 3 Seconds
            </p>
            
            <p className="mt-4 text-sm leading-relaxed text-slate-300 font-sans">
              No registration fields. No tracking advertisements. Your nutritional data resides strictly on your local browser device memory.
            </p>

            <div className="mt-6 flex items-center justify-center gap-2">
              <div className="h-2 w-2 rounded-full bg-[#10B981] animate-ping" />
              <span className="text-xs font-semibold text-[#10B981] tracking-wide font-sans">
                Discoverable from Twitter/X
              </span>
            </div>

            <button
              onClick={handleStartTracking}
              className="mt-6 w-full rounded-2xl bg-gradient-to-r from-[#10B981] to-[#06B6D4] py-3.5 text-sm font-bold text-white shadow-xl shadow-[#10B981]/25 transition active:scale-95 hover:brightness-110 font-sans"
            >
              Start Tracking Now
            </button>
          </div>
        </div>
      )}

      {/* Date selector navigation */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => setSelectedDate((d) => offsetDate(d, -1))}
          className="rounded-xl border border-white/5 bg-slate-900/30 p-2.5 text-slate-400 hover:bg-slate-900/60 hover:text-white transition active:scale-90"
          aria-label="Previous day"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>

        <div className="text-center">
          <h1 className="text-base font-extrabold tracking-tight text-white font-sans">
            {isToday(selectedDate) ? "Today" : fmtDate(selectedDate)}
          </h1>
          {isToday(selectedDate) && (
            <p className="text-[10px] text-slate-500 font-sans font-medium">
              {fmtDate(selectedDate)}
            </p>
          )}
        </div>

        <button
          onClick={() =>
            canGoForward && setSelectedDate((d) => offsetDate(d, 1))
          }
          disabled={!canGoForward}
          className={`rounded-xl border border-white/5 p-2.5 transition active:scale-90 ${
            canGoForward
              ? "bg-slate-900/30 text-slate-400 hover:bg-slate-900/60 hover:text-white"
              : "bg-slate-900/10 text-slate-700 cursor-not-allowed"
          }`}
          aria-label="Next day"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
      </div>

      {/* Radial Progress Display */}
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

      {/* Custom Empty states and Suggestion logger */}
      <div className="mb-6">
        <h2 className="mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 font-sans">
          Logged Items
        </h2>

        {summary.entries.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-white/5 bg-slate-900/10 px-6 py-8 text-center backdrop-blur-xs">
            <p className="text-sm font-medium text-slate-400 font-sans">
              No entries logged for this date.
            </p>
            <p className="mt-1 text-xs text-slate-500 font-sans">
              Quick log breakfast recommendations:
            </p>
            
            <div className="mt-4 flex flex-col gap-2">
              {starterFoods.map((food) => (
                <button
                  key={food.name}
                  onClick={() => handleQuickAdd(food.name, food.calories, food.protein, food.tag)}
                  className="flex items-center justify-between rounded-xl border border-white/5 bg-slate-900/40 px-4 py-2.5 text-left transition hover:bg-[#10B981]/10 hover:border-[#10B981]/20 group active:scale-95"
                >
                  <span className="text-xs font-semibold text-slate-300 group-hover:text-white transition font-sans">
                    + {food.name}
                  </span>
                  <span className="text-[10px] text-slate-500 group-hover:text-slate-300 transition font-sans">
                    {food.calories} kcal · {food.protein}g P
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Iterative grouping rendering */}
            {tagsOrder.map((tag) => {
              const entries = groupedEntries[tag];
              if (!entries || entries.length === 0) return null;
              return (
                <div key={tag} className="flex flex-col gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      {tagLabelMapping[tag]}
                    </span>
                    <div className="h-px flex-1 bg-white/5" />
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    {entries.map((entry) => (
                      <FoodEntryItem
                        key={entry.id}
                        entry={entry}
                        onDelete={() => deleteFood(entry.id)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Social Share Trigger */}
            <div className="mt-6">
              <a
                href={getTwitterShareUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl border border-sky-500/20 bg-sky-950/20 py-3 text-xs font-bold text-sky-400 transition hover:bg-sky-500/10 hover:text-sky-300 active:scale-95 font-sans"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                  <polyline points="16 6 12 2 8 6" />
                  <line x1="12" x2="12" y1="2" y2="15" />
                </svg>
                Share Daily Progress on X
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Recurrent items fast loader */}
      {distinct.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 font-sans">
            Quick Log Frequent
          </h2>
          <div className="hide-scrollbar flex gap-2 overflow-x-auto pb-1">
            {distinct.map((food) => (
              <button
                key={food.name}
                onClick={() => handleQuickAdd(food.name, food.calories, food.protein, "snack")}
                className="shrink-0 rounded-full border border-white/5 bg-slate-900/40 px-4 py-2 text-xs font-semibold text-slate-300 transition active:scale-90 hover:bg-[#10B981]/10 hover:border-[#10B981]/20 hover:text-white font-sans"
              >
                + {food.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Undo Toast notification popup */}
      {showUndo && (
        <div className="fixed bottom-24 left-1/2 z-50 w-full max-w-xs -translate-x-1/2 px-4 transition-all duration-300 ease-out">
          <div className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-950/95 p-3.5 shadow-2xl backdrop-blur-xl">
            <span className="text-xs text-slate-300 font-medium font-sans">Item deleted.</span>
            <button
              onClick={() => {
                undoDeleteFood();
                setShowUndo(false);
              }}
              className="text-xs font-bold text-[#10B981] hover:underline px-2 py-0.5 active:scale-95 transition font-sans"
            >
              Undo
            </button>
          </div>
        </div>
      )}

      {/* Floating Action Button — Link to Add page */}
      {isToday(selectedDate) && (
        <div className="fixed bottom-24 right-4 z-40">
          <Link
            href="/add"
            className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-[#10B981] to-[#06B6D4] text-white shadow-xl shadow-[#10B981]/30 transition hover:brightness-110 active:scale-90"
            aria-label="Add food log item"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14" />
              <path d="M12 5v14" />
            </svg>
          </Link>
        </div>
      )}
    </div>
  );
}

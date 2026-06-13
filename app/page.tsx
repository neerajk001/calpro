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

  // Sync date selection from query parameters
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
    let text = "🎵 Calpro Wrapped: Today's Playlist 🎧\n";
    text += "─────────────────────\n";
    text += `🔥 Calories: ${summary.totalCalories} / ${settings.dailyCalorieTarget} kcal\n`;
    text += `💪 Protein: ${summary.totalProtein} / ${settings.dailyProteinTarget}g\n`;
    if (summary.entries.length > 0) {
      text += "─────────────────────\n";
      summary.entries.forEach((e, idx) => {
        text += `${String(idx + 1).padStart(2, "0")}. ${e.name} (${e.calories} kcal)\n`;
      });
    }
    text += "─────────────────────\n";
    if (settings.twitterHandle) {
      text += `Logged by @${settings.twitterHandle} via Calpro\n`;
    } else {
      text += `Logged via Calpro\n`;
    }
    text += `https://calpro.app`;
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
        <div className="fixed inset-0 z-55 flex items-center justify-center bg-stone-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm border border-stone-900/15 bg-white/90 backdrop-blur-md p-6 shadow-xl text-center rounded-none">
            <div className="mx-auto flex h-14 w-14 items-center justify-center bg-stone-100 text-stone-850 mb-4 border border-stone-900/15 rounded-none">
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
            
            <h2 className="text-3xl font-serif font-extrabold tracking-tight text-stone-950">
              CalPro
            </h2>
            <p className="mt-1 text-sm font-bold tracking-widest text-[#78716C] uppercase font-sans">
              Track in 3 Seconds
            </p>
            
            <p className="mt-4 text-sm leading-relaxed text-stone-700 font-sans font-medium">
              No registration fields. No tracking advertisements. Your nutritional data resides strictly on your local browser device memory.
            </p>

            <div className="mt-6 flex items-center justify-center gap-2">
              <div className="h-1.5 w-1.5 bg-stone-800 animate-ping rounded-none" />
              <span className="text-xs font-bold text-[#78716C] tracking-wide font-sans">
                Discoverable from Twitter/X
              </span>
            </div>

            <button
              onClick={handleStartTracking}
              className="mt-6 w-full bg-[#292524] py-3.5 text-sm font-bold text-white shadow-md hover:bg-[#1C1917] transition active:scale-95 font-sans rounded-none"
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
          className="border border-stone-900/15 bg-white/80 backdrop-blur-md p-2.5 text-stone-700 hover:bg-stone-50 hover:text-stone-900 transition active:scale-90 shadow-xs rounded-none"
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
          <h1 className="text-xl font-serif font-bold tracking-tight text-stone-950">
            {isToday(selectedDate) ? "Today" : fmtDate(selectedDate)}
          </h1>
          {isToday(selectedDate) && (
            <p className="text-xs text-[#78716C] font-sans font-semibold">
              {fmtDate(selectedDate)}
            </p>
          )}
        </div>

        <button
          onClick={() =>
            canGoForward && setSelectedDate((d) => offsetDate(d, 1))
          }
          disabled={!canGoForward}
          className={`border transition active:scale-90 shadow-xs rounded-none p-2.5 ${
            canGoForward
              ? "bg-white/80 backdrop-blur-md border-stone-900/15 text-stone-700 hover:bg-stone-50 hover:text-stone-950"
              : "bg-stone-200/50 border-stone-200/50 text-stone-400 cursor-not-allowed"
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
        <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-[#78716C] font-sans">
          Logged Items
        </h2>

        {summary.entries.length === 0 ? (
          <div className="border border-stone-900/15 bg-white/80 backdrop-blur-md px-6 py-8 text-center shadow-xs rounded-none">
            <p className="text-base font-extrabold text-stone-800 font-sans">
              No entries logged for this date.
            </p>
            <p className="mt-1 text-sm font-semibold text-stone-500 font-sans">
              Quick log breakfast recommendations:
            </p>
            
            <div className="mt-4 flex flex-col gap-2">
              {starterFoods.map((food) => (
                <button
                  key={food.name}
                  onClick={() => handleQuickAdd(food.name, food.calories, food.protein, food.tag)}
                  className="flex items-center justify-between border border-stone-900/15 bg-white/80 backdrop-blur-md px-4 py-3 text-left transition hover:bg-stone-50 group active:scale-95 shadow-xs rounded-none"
                >
                  <span className="text-sm font-bold text-stone-850 group-hover:text-stone-950 transition font-sans">
                    + {food.name}
                  </span>
                  <span className="text-xs font-bold text-stone-500 group-hover:text-stone-700 transition font-sans">
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
                    <span className="text-xs font-bold text-[#78716C] uppercase tracking-widest">
                      {tagLabelMapping[tag]}
                    </span>
                    <div className="h-px flex-1 bg-stone-200" />
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
            {summary.entries.length > 0 && (
              <div className="mt-6">
                <a
                  href={getTwitterShareUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 border border-stone-900/15 bg-white/80 backdrop-blur-md py-3 text-xs font-bold text-stone-700 transition hover:bg-stone-50 hover:text-stone-900 active:scale-95 font-sans rounded-none"
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
            )}
          </div>
        )}
      </div>

      {/* Recurrent items fast loader */}
      {distinct.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-[#78716C] font-sans">
            Quick Log Frequent
          </h2>
          <div className="hide-scrollbar flex gap-2 overflow-x-auto pb-1">
            {distinct.map((food) => (
              <button
                key={food.name}
                onClick={() => handleQuickAdd(food.name, food.calories, food.protein, "snack")}
                className="shrink-0 border border-stone-900/15 bg-white/80 backdrop-blur-md px-4 py-2.5 text-sm font-bold text-stone-700 transition active:scale-90 hover:bg-stone-50 hover:text-stone-950 font-sans shadow-xs rounded-none"
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
          <div className="flex items-center justify-between border border-stone-900/15 bg-white/90 backdrop-blur-md p-3.5 shadow-lg shadow-stone-850/5 rounded-none">
            <span className="text-xs text-stone-600 font-medium font-sans">Item deleted.</span>
            <button
              onClick={() => {
                undoDeleteFood();
                setShowUndo(false);
              }}
              className="text-xs font-bold text-stone-850 hover:underline px-2 py-0.5 active:scale-95 transition font-sans"
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
            className="flex h-14 w-14 items-center justify-center bg-[#292524] text-white shadow-lg shadow-stone-800/10 hover:bg-[#1C1917] transition active:scale-90 rounded-none"
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

"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useApp } from "@/lib/AppContext";
import { DualProgressRing, ProgressSkeleton } from "@/components/ProgressRing";
import { FoodEntryItem } from "@/components/FoodEntry";
import { DoneSummaryModal } from "@/components/DoneSummaryModal";
import type { FoodTag, FoodEntry } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";

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
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [showUndo, setShowUndo] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);

  const {
    hydrated,
    settings,
    getDaySummary,
    deleteFood,
    undoDeleteFood,
    hasLastDeleted,
    getDistinctFoods,
    addFood,
    waterLogs,
    saveWaterLog,
  } = useApp();

  const summary = getDaySummary(selectedDate);
  const distinct = getDistinctFoods(4);
  const today = todayStr();
  const canGoForward = selectedDate < today;
  const calorieExceeded = summary.totalCalories > settings.dailyCalorieTarget;
  const calorieDiff = summary.totalCalories - settings.dailyCalorieTarget;

  const currentWater = waterLogs.find((w) => w.date === selectedDate)?.amount ?? 0;
  const waterTarget = settings.dailyWaterTarget ?? 2500;
  const waterProgress = waterTarget > 0 ? Math.min(currentWater / waterTarget, 1) : 0;

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

  const handleGoogleSignIn = async () => {
    const supabase = createClient();
    localStorage.setItem("calpro_onboarded_v1", "true");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      console.error("Sign-in error during onboarding:", error);
    }
  };

  const handleQuickAdd = useCallback(
    (name: string, calories: number, protein: number, tag: FoodTag = "snack") => {
      addFood(name, calories, protein, selectedDate, tag);
    },
    [addFood, selectedDate],
  );


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
    <div className="relative min-h-full select-none font-sans text-[#f5f2eb]">
      {/* Onboarding Dialog Overlay */}
      {showOnboarding && (
        <div className="fixed inset-0 z-55 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm border border-white/10 bg-[#201c1a]/95 backdrop-blur-md p-6 shadow-2xl text-center rounded-2xl animate-fade-in flex flex-col items-center">
            
            {/* Step 1: What we do */}
            {onboardingStep === 1 && (
              <div className="w-full animate-fade-in flex flex-col items-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center bg-[#282421] text-[#1DB954] mb-4 border border-white/5 rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 2v20" />
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                </div>
                
                <h2 className="text-3xl font-bold tracking-tight text-white font-sans">
                  LogMyMeal
                </h2>
                <p className="mt-1 text-xs font-semibold tracking-widest text-[#1DB954] uppercase font-sans">
                  Fast Calorie & Protein Tracker
                </p>
                
                <p className="mt-4 text-sm leading-relaxed text-zinc-300 font-sans font-normal min-h-[100px]">
                  Welcome to LogMyMeal! We built this app to be clean, fast, and privacy-first. There are no tracking scripts, no ads, and no annoying email sign-up walls to get started.
                </p>

                <button
                  onClick={() => setOnboardingStep(2)}
                  className="mt-6 w-full bg-[#1DB954] py-3.5 text-sm font-semibold text-[#161413] shadow-md hover:bg-[#1ed760] transition active:scale-95 font-sans rounded-full cursor-pointer flex items-center justify-center gap-1"
                >
                  Continue
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </button>
              </div>
            )}

            {/* Step 2: What to expect */}
            {onboardingStep === 2 && (
              <div className="w-full animate-fade-in flex flex-col items-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center bg-[#282421] text-[#81b29a] mb-4 border border-white/5 rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
                  </svg>
                </div>
                
                <h2 className="text-2xl font-bold tracking-tight text-white font-sans">
                  Powerful Features
                </h2>
                <p className="mt-1 text-xs font-semibold tracking-widest text-[#81b29a] uppercase font-sans">
                  What you can expect
                </p>
                
                <div className="mt-4 text-left space-y-2.5 w-full text-zinc-300 font-sans text-sm min-h-[100px]">
                  <div className="flex items-start gap-2">
                    <span className="text-base shrink-0">🍕</span>
                    <span><strong>Portion Presets:</strong> Quick portion presets (small, medium, full plate) for fast entries.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-base shrink-0">🍳</span>
                    <span><strong>Cooking Multipliers:</strong> Estimate macros based on boiling, frying, or adding ghee/oil.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-base shrink-0">💧</span>
                    <span><strong>Water Tracking:</strong> Track hydration levels dynamically alongside daily food targets.</span>
                  </div>
                </div>

                <button
                  onClick={() => setOnboardingStep(3)}
                  className="mt-6 w-full bg-[#1DB954] py-3.5 text-sm font-semibold text-[#161413] shadow-md hover:bg-[#1ed760] transition active:scale-95 font-sans rounded-full cursor-pointer flex items-center justify-center gap-1"
                >
                  Almost there
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </button>
              </div>
            )}

            {/* Step 3: Google Sign-in or Skip */}
            {onboardingStep === 3 && (
              <div className="w-full animate-fade-in flex flex-col items-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center bg-[#282421] text-[#3b82f6] mb-4 border border-white/5 rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </div>
                
                <h2 className="text-2xl font-bold tracking-tight text-white font-sans">
                  Secure Your Data
                </h2>
                <p className="mt-1 text-xs font-semibold tracking-widest text-[#3b82f6] uppercase font-sans">
                  Keep your logs in sync
                </p>
                
                <p className="mt-4 text-sm leading-relaxed text-zinc-300 font-sans font-normal min-h-[100px]">
                  Sign in with Google to securely back up and sync your calorie settings, history, and custom foods across all devices, or continue locally anonymous.
                </p>

                <div className="w-full mt-6 space-y-3">
                  <button
                    onClick={handleGoogleSignIn}
                    className="w-full flex items-center justify-center gap-2.5 bg-white hover:bg-[#f0f0f0] text-[#161413] py-3.5 text-sm font-semibold transition active:scale-95 rounded-full cursor-pointer shadow-md"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Sign In with Google
                  </button>

                  <button
                    onClick={handleStartTracking}
                    className="w-full bg-[#282421] hover:bg-[#322d29] border border-white/5 text-zinc-400 hover:text-white py-3 text-xs font-semibold rounded-full active:scale-95 transition cursor-pointer"
                  >
                    Skip & Continue Locally
                  </button>
                </div>
              </div>
            )}

            {/* Stepper indicators */}
            <div className="mt-6 flex items-center justify-center gap-1.5">
              <div className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${onboardingStep === 1 ? "w-3 bg-[#1DB954]" : "bg-zinc-650"}`} />
              <div className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${onboardingStep === 2 ? "w-3 bg-[#1DB954]" : "bg-zinc-650"}`} />
              <div className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${onboardingStep === 3 ? "w-3 bg-[#1DB954]" : "bg-zinc-650"}`} />
            </div>

          </div>
        </div>
      )}

      {/* Dynamic Grid Layout for Desktop & Mobile Compatibility */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        
        {/* Left Stats Column */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
          {/* Date selector navigation */}
          <div className="flex items-center justify-between glass-panel p-3 rounded-2xl">
            <button
              onClick={() => setSelectedDate((d) => offsetDate(d, -1))}
              className="border border-white/[0.04] bg-[#201c1a] p-2.5 text-zinc-300 hover:bg-[#282421] hover:text-white transition active:scale-90 shadow-sm rounded-full cursor-pointer"
              aria-label="Previous day"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
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

            <div className="text-center">
              <h1 className="text-sm font-bold tracking-tight text-white font-sans">
                {isToday(selectedDate) ? "Today" : fmtDate(selectedDate)}
              </h1>
              {isToday(selectedDate) && (
                <p className="text-[9px] text-zinc-400 font-semibold uppercase tracking-wider mt-0.5">
                  {fmtDate(selectedDate)}
                </p>
              )}
            </div>

            <button
              onClick={() =>
                canGoForward && setSelectedDate((d) => offsetDate(d, 1))
              }
              disabled={!canGoForward}
              className={`border transition active:scale-90 shadow-sm rounded-full p-2.5 cursor-pointer ${
                canGoForward
                  ? "bg-[#201c1a] border-white/[0.04] text-zinc-300 hover:bg-[#282421] hover:text-white"
                  : "bg-[#201c1a]/30 border-transparent text-zinc-650 cursor-not-allowed"
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
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </div>

          {/* Radial Progress Display */}
          <div className="glass-panel p-6 rounded-2xl">
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

          {/* Prominent Calorie Surplus Alert */}
          {hydrated && calorieExceeded && (
            <div className="mx-auto w-full border border-[#ef4444]/15 bg-[#ef4444]/5 p-4 rounded-2xl flex items-start gap-3 shadow-lg animate-fade-in">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/20">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-sm font-semibold text-[#ef4444] uppercase tracking-wider font-sans">
                  Surplus Detected
                </h3>
                <p className="mt-0.5 text-xs text-[#a19890] font-medium leading-relaxed font-sans">
                  You have surpassed your daily calorie budget by{" "}
                  <span className="font-bold text-white text-sm">
                    {calorieDiff.toLocaleString()} kcal
                  </span>
                  . Keep an eye on your activity levels.
                </p>
              </div>
            </div>
          )}

          {/* Water Intake Widget */}
          {hydrated && (
            <div className="mx-auto w-full glass-panel p-4 rounded-2xl animate-fade-in text-[#f5f2eb]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">💧</span>
                  <div className="text-left">
                    <h3 className="text-sm font-semibold text-white font-sans">Water Intake</h3>
                    <p className="text-[10px] text-zinc-400 font-semibold font-sans">Goal: {waterTarget} ml</p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-[#5f85a6] tabular-nums font-sans">
                  {currentWater} / {waterTarget} ml
                </span>
              </div>
              {/* Progress Bar */}
              <div className="h-2.5 w-full bg-zinc-850 rounded-full overflow-hidden mb-4">
                <div
                  className="h-full bg-[#5f85a6] shadow-[0_0_10px_rgba(95,133,166,0.3)] rounded-full transition-all duration-300"
                  style={{ width: `${waterProgress * 100}%` }}
                />
              </div>
              {/* Control Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => saveWaterLog(selectedDate, currentWater + 250)}
                  className="flex-1 py-2 bg-[#5f85a6]/10 border border-[#5f85a6]/20 hover:bg-[#5f85a6]/20 text-[#5f85a6] text-xs font-semibold rounded-xl active:scale-95 transition cursor-pointer flex items-center justify-center gap-1 font-sans"
                >
                  +250ml 🥛
                </button>
                <button
                  onClick={() => saveWaterLog(selectedDate, currentWater + 500)}
                  className="flex-1 py-2 bg-[#5f85a6]/10 border border-[#5f85a6]/20 hover:bg-[#5f85a6]/20 text-[#5f85a6] text-xs font-semibold rounded-xl active:scale-95 transition cursor-pointer flex items-center justify-center gap-1 font-sans"
                >
                  +500ml 🍼
                </button>
                {currentWater > 0 && (
                  <button
                    onClick={() => saveWaterLog(selectedDate, Math.max(0, currentWater - 250))}
                    className="px-3 py-2 bg-[#282421] border border-white/[0.04] hover:bg-[#322d29] text-zinc-400 hover:text-white text-xs font-semibold rounded-xl active:scale-95 transition cursor-pointer font-sans"
                    title="Subtract 250ml"
                  >
                    −250
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Done for the Day Button */}
          {hydrated && (
            <div className="flex justify-center">
              <button
                onClick={() => setShowSummaryModal(true)}
                className="glass-button w-full py-3.5 text-xs font-semibold text-zinc-300 hover:text-white rounded-xl flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer shadow-md"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
                Done for the Day
              </button>
            </div>
          )}
        </div>

        {/* Right Logged items column */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-500 font-sans">
              Logged Items
            </h2>

            {summary.entries.length === 0 ? (
              <div className="glass-panel p-6 text-center rounded-2xl">
                <p className="text-base font-semibold text-white font-sans">
                  No entries logged for this date.
                </p>
                <p className="mt-2 text-xs font-medium text-zinc-400 uppercase tracking-widest font-sans">
                  Quick log recommendations:
                </p>
                
                <div className="mt-4 flex flex-col gap-2">
                  {starterFoods.map((food) => (
                    <button
                      key={food.name}
                      onClick={() => handleQuickAdd(food.name, food.calories, food.protein, food.tag)}
                      className="flex items-center justify-between border border-white/[0.04] bg-[#282421]/50 hover:bg-[#322d29]/85 px-4 py-3.5 text-left transition group active:scale-95 shadow-sm rounded-xl cursor-pointer"
                    >
                      <span className="text-xs font-semibold text-white transition font-sans">
                        + {food.name}
                      </span>
                      <span className="text-xs font-medium text-[#a19890] transition font-sans">
                        {food.calories} kcal · {food.protein}g P
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4 glass-panel p-5 rounded-2xl">
                {/* Iterative grouping rendering */}
                {tagsOrder.map((tag) => {
                  const entries = groupedEntries[tag];
                  if (!entries || entries.length === 0) return null;
                  return (
                    <div key={tag} className="flex flex-col gap-2.5">
                      <div className="flex items-center gap-2.5">
                        <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">
                          {tagLabelMapping[tag]}
                        </span>
                        <div className="h-px flex-1 bg-white/[0.04]" />
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


              </div>
            )}
          </div>

          {/* Recurrent items fast loader */}
          {distinct.length > 0 && (
            <div>
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-500 font-sans">
                Quick Log Frequent
              </h2>
              <div className="hide-scrollbar flex gap-2 overflow-x-auto pb-1">
                {distinct.map((food) => (
                  <button
                    key={food.name}
                    onClick={() => handleQuickAdd(food.name, food.calories, food.protein, "snack")}
                    className="shrink-0 border border-white/[0.04] bg-[#201c1a]/60 hover:bg-[#282421]/80 px-4 py-2.5 text-xs font-semibold text-[#f5f2eb] transition active:scale-95 font-sans rounded-full shadow-sm cursor-pointer"
                  >
                    + {food.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Undo Toast notification popup */}
      {showUndo && (
        <div className="fixed bottom-24 left-1/2 z-50 w-full max-w-xs -translate-x-1/2 px-4 transition-all duration-300 ease-out">
          <div className="flex items-center justify-between border border-white/[0.04] bg-[#201c1a]/95 backdrop-blur-md p-3.5 shadow-2xl rounded-full px-5 py-2.5">
            <span className="text-xs text-zinc-300 font-medium font-sans">Item deleted.</span>
            <button
              onClick={() => {
                undoDeleteFood();
                setShowUndo(false);
              }}
              className="text-xs font-semibold text-[#1DB954] hover:text-[#1ed760] px-2 py-0.5 active:scale-95 transition font-sans cursor-pointer"
            >
              Undo
            </button>
          </div>
        </div>
      )}

      {/* Floating Action Button (FAB) - Mobile only (desktop uses sidebar nav) */}
      {isToday(selectedDate) && (
        <div className="fixed bottom-24 right-4 z-40 md:hidden">
          <Link
            href="/add"
            className="flex h-14 w-14 items-center justify-center bg-[#1DB954] text-[#161413] shadow-xl shadow-black/45 hover:bg-[#1ed760] transition active:scale-95 rounded-full"
            aria-label="Add food log item"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14" />
              <path d="M12 5v14" />
            </svg>
          </Link>
        </div>
      )}

      {/* Daily Recap Modal */}
      {hydrated && (
        <DoneSummaryModal
          isOpen={showSummaryModal}
          onClose={() => setShowSummaryModal(false)}
          summary={summary}
          settings={settings}
        />
      )}
    </div>
  );
}

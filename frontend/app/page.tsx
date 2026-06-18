"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useApp } from "@/lib/AppContext";
import { DualProgressRing, ProgressSkeleton } from "@/components/ProgressRing";
import { FoodEntryItem } from "@/components/FoodEntry";
import { DoneSummaryModal } from "@/components/DoneSummaryModal";
import { FoodCamera } from "@/components/FoodCamera";
import type { FoodTag, FoodEntry, ScanResultItem } from "@/lib/types";
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

const STARTER_FOODS = [
  { name: "2 Scrambled Eggs", calories: 140, protein: 12, tag: "breakfast" as FoodTag },
  { name: "Whey Protein Shake", calories: 130, protein: 25, tag: "snack" as FoodTag },
  { name: "Greek Yogurt Cup", calories: 120, protein: 15, tag: "snack" as FoodTag },
];

function isToday(dateStr: string): boolean {
  return dateStr === todayStr();
}

export default function DashboardPage() {
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [showUndo, setShowUndo] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [showCamera, setShowCamera] = useState(false);

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
    userName,
  } = useApp();

  const summary = useMemo(() => getDaySummary(selectedDate), [getDaySummary, selectedDate]);
  const distinct = useMemo(() => getDistinctFoods(4), [getDistinctFoods]);
  const today = todayStr();
  const canGoForward = selectedDate < today;
  const calorieExceeded = summary.totalCalories > settings.dailyCalorieTarget;
  const calorieDiff = summary.totalCalories - settings.dailyCalorieTarget;
  const caloriesRemaining = settings.dailyCalorieTarget - summary.totalCalories;

  const currentWater = waterLogs.find((w) => w.date === selectedDate)?.amount ?? 0;
  const waterTarget = settings.dailyWaterTarget ?? 2500;
  const waterProgress = waterTarget > 0 ? Math.min(currentWater / waterTarget, 1) : 0;

  // Time-aware greeting
  const getGreetingTime = () => {
    const hrs = new Date().getHours();
    if (hrs >= 5 && hrs < 12) return "Good Morning 👋";
    if (hrs >= 12 && hrs < 17) return "Good Afternoon 👋";
    return "Good Evening 👋";
  };
  const greetingTime = getGreetingTime();

  // Extract capitalized first name
  const firstName = userName ? userName.split(" ")[0].trim() : "";
  const displayName = firstName ? firstName.charAt(0).toUpperCase() + firstName.slice(1) : "";

  // Day of the week greetings (0 is Sunday, 6 is Saturday)
  const dayOfWeek = new Date().getDay();
  const currentGreeting = useMemo(() => {
    const greetings = [
      displayName ? `Recharge and refuel today, ${displayName}.` : "Recharge and refuel today.",
      displayName ? `Set the tone for the week, ${displayName}.` : "Set the tone for the week.",
      displayName ? `Stay consistent today, ${displayName}.` : "Stay consistent today.",
      displayName ? `Halfway through, keep it up ${displayName}!` : "Halfway through, keep it up!",
      displayName ? `Stay disciplined today, ${displayName}.` : "Stay disciplined today.",
      displayName ? `Finish the week strong, ${displayName}!` : "Finish the week strong!",
      displayName ? `Balance is key today, ${displayName}.` : "Balance is key today.",
    ];
    return greetings[dayOfWeek];
  }, [displayName, dayOfWeek]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const date = params.get("date");
      if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
        setSelectedDate(date);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isDismissed = localStorage.getItem("calpro_onboarded_v1");
      if (!isDismissed) {
        setShowOnboarding(true);
      }
    }
  }, []);

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

  const handleLogScannedItem = useCallback(
    (item: ScanResultItem) => {
      addFood(
        item.name,
        item.estimatedCalories,
        item.estimatedProtein,
        selectedDate,
        "snack",
        item.estimatedCarbs,
        item.estimatedFat,
      );
    },
    [addFood, selectedDate],
  );

  const tagsOrder: FoodTag[] = ["breakfast", "lunch", "dinner", "snack", "junk"];
  const groupedEntries = summary.entries.reduce((acc, entry) => {
    const t = entry.tag || "snack";
    if (!acc[t]) acc[t] = [];
    acc[t].push(entry);
    return acc;
  }, {} as Record<FoodTag, FoodEntry[]>);
  const tagLabelMapping = {
    breakfast: "Breakfast",
    lunch: "Lunch",
    dinner: "Dinner",
    snack: "Snack",
    junk: "Junk Food",
  };

  return (
    <div className="relative min-h-full select-none">
      {/* Onboarding */}
      {showOnboarding && (
        <div className="fixed inset-0 z-55 flex flex-col items-center justify-center bg-[#F3F4F6] p-6 md:p-12 overflow-y-auto">
          <div className="w-full max-w-2xl text-center flex flex-col items-center justify-between min-h-[520px] py-8 px-4">
            {onboardingStep === 1 && (
              <div className="w-full flex flex-col items-center flex-1 justify-center my-auto">
                <img src="/logo.svg" alt="LogMyMeal Logo" className="h-20 md:h-24 w-auto mb-8 mx-auto" />
                <p className="mt-2 text-xs font-bold tracking-widest text-[#2563EB] uppercase">Fast Calorie & Protein Tracker</p>
                <p className="mt-6 text-base md:text-lg leading-relaxed text-[#4B5563] max-w-md">
                  Welcome! We built this app to be clean, fast, and privacy-first. No tracking scripts, no ads, no sign-up walls.
                </p>
                <button
                  onClick={() => setOnboardingStep(2)}
                  className="mt-10 w-full max-w-sm btn-primary cursor-pointer text-base"
                >
                  Continue
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </button>
              </div>
            )}
            {onboardingStep === 2 && (
              <div className="w-full flex flex-col items-center flex-1 justify-center my-auto">
                <div className="mx-auto flex h-20 w-20 items-center justify-center bg-[#EFF6FF] text-[#2563EB] mb-8 rounded-2xl shadow-sm border border-blue-100">
                  <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
                  </svg>
                </div>
                <h2 className="text-4xl font-extrabold tracking-tight text-[#111827]">Powerful Features</h2>
                <p className="mt-2 text-xs font-bold tracking-widest text-[#2563EB] uppercase">What you can expect</p>
                <div className="mt-8 text-left space-y-4 w-full max-w-md text-[#4B5563] text-base">
                  <div className="flex items-start gap-4">
                    <span className="text-2xl shrink-0">🍕</span>
                    <span><strong className="text-[#111827] block text-sm font-semibold mb-0.5">Portion Presets</strong> Quick presets (small, medium, full plate) for lightning-fast entries.</span>
                  </div>
                  <div className="flex items-start gap-4">
                    <span className="text-2xl shrink-0">🍳</span>
                    <span><strong className="text-[#111827] block text-sm font-semibold mb-0.5">Cooking Multipliers</strong> Adjust nutrition metrics based on boiling, frying, or adding ghee.</span>
                  </div>
                  <div className="flex items-start gap-4">
                    <span className="text-2xl shrink-0">💧</span>
                    <span><strong className="text-[#111827] block text-sm font-semibold mb-0.5">Water Tracking</strong> Monitor your daily hydration target alongside macros.</span>
                  </div>
                </div>
                <button
                  onClick={() => setOnboardingStep(3)}
                  className="mt-10 w-full max-w-sm btn-primary cursor-pointer text-base"
                >
                  Almost there
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </button>
              </div>
            )}
            {onboardingStep === 3 && (
              <div className="w-full flex flex-col items-center flex-1 justify-center my-auto">
                <div className="mx-auto flex h-20 w-20 items-center justify-center bg-[#EFF6FF] text-[#2563EB] mb-8 rounded-2xl shadow-sm border border-blue-100">
                  <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </div>
                <h2 className="text-4xl font-extrabold tracking-tight text-[#111827]">Secure Your Data</h2>
                <p className="mt-2 text-xs font-bold tracking-widest text-[#2563EB] uppercase">Keep your logs in sync</p>
                <p className="mt-6 text-sm md:text-base leading-relaxed text-[#4B5563] max-w-md">
                  Sign in with Google to securely back up and sync your calorie settings, history, and custom foods across all devices.
                </p>
                <div className="w-full max-w-sm mt-10 space-y-4">
                  <button
                    onClick={handleGoogleSignIn}
                    className="w-full flex items-center justify-center gap-2.5 bg-white hover:bg-gray-50 text-[#111827] py-4 text-sm font-semibold transition active:scale-95 rounded-2xl cursor-pointer shadow-sm border border-black/5"
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
                    className="w-full bg-[#E5E7EB] hover:bg-gray-300 text-[#4B5563] hover:text-[#111827] py-3.5 text-xs font-semibold rounded-2xl active:scale-95 transition cursor-pointer"
                  >
                    Skip & Continue Locally
                  </button>
                </div>
              </div>
            )}
            <div className="mt-10 flex items-center justify-center gap-2">
              <div className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${onboardingStep === 1 ? "w-5 bg-[#2563EB]" : "bg-blue-100"}`} />
              <div className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${onboardingStep === 2 ? "w-5 bg-[#2563EB]" : "bg-blue-100"}`} />
              <div className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${onboardingStep === 3 ? "w-5 bg-[#2563EB]" : "bg-blue-100"}`} />
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-[#6B7280] font-semibold tracking-wide uppercase">{greetingTime}</p>
            <h1 className="text-[32px] font-black tracking-tight text-[#111827] mt-1">{currentGreeting}</h1>
          </div>
          {isToday(selectedDate) && (
            <button
              onClick={() => setShowCamera(true)}
              className="hidden md:flex items-center gap-1.5 bg-[#1DB954] text-white px-3 py-2 text-xs font-bold rounded-xl hover:bg-[#17a94a] transition active:scale-95 shadow-sm cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>
              </svg>
              Scan Meal
            </button>
          )}
        </div>
      </div>

      {/* Date selector */}
      <div className="flex items-center justify-between card p-3 md:p-4 mb-4 md:mb-6">
        <button
          onClick={() => setSelectedDate((d) => offsetDate(d, -1))}
          className="bg-[#E5E7EB] p-2.5 text-[#4B5563] hover:bg-[#EFF6FF] hover:text-[#2563EB] transition active:scale-90 rounded-full cursor-pointer"
          aria-label="Previous day"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
        <div className="text-center">
          <h1 className="text-sm font-extrabold tracking-tight text-[#111827]">
            {isToday(selectedDate) ? "Today" : fmtDate(selectedDate)}
          </h1>
          {isToday(selectedDate) && (
            <p className="text-[10px] text-[#6B7280] font-bold uppercase tracking-wider mt-0.5">
              {fmtDate(selectedDate)}
            </p>
          )}
        </div>
        <button
          onClick={() => canGoForward && setSelectedDate((d) => offsetDate(d, 1))}
          disabled={!canGoForward}
          className={`p-2.5 transition active:scale-90 rounded-full cursor-pointer ${
            canGoForward
              ? "bg-[#E5E7EB] text-[#4B5563] hover:bg-[#EFF6FF] hover:text-[#2563EB]"
              : "bg-[#E5E7EB]/40 text-[#9CA3AF] cursor-not-allowed"
          }`}
          aria-label="Next day"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 items-start">
        {/* Left Column */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">

          {/* Calorie Hero Card */}
          <div className="card p-4 md:p-6">
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
            {hydrated && (
              <p className="mt-4 text-center text-sm text-[#4B5563] font-medium">
                {calorieExceeded
                  ? `${calorieDiff.toLocaleString()} kcal over target`
                  : `${caloriesRemaining.toLocaleString()} kcal remaining`}
              </p>
            )}
          </div>

          {/* Macro Cards */}
          <div className="grid grid-cols-3 gap-2 md:gap-3">
            <div className="card p-2.5 md:p-4 text-center">
              <p className="text-[10px] md:text-[11px] text-[#6B7280] font-bold uppercase tracking-wider mb-1">Protein</p>
              <p className="text-base md:text-xl font-bold text-[#111827] tabular-nums">{summary.totalProtein}g</p>
              <p className="text-[10px] md:text-[11px] text-[#6B7280] mt-0.5">/ {settings.dailyProteinTarget}g</p>
            </div>
            <div className="card p-2.5 md:p-4 text-center">
              <p className="text-[10px] md:text-[11px] text-[#6B7280] font-bold uppercase tracking-wider mb-1">Carbs</p>
              <p className="text-base md:text-xl font-bold text-[#111827] tabular-nums">{summary.totalCarbs}g</p>
              <p className="text-[10px] md:text-[11px] text-[#6B7280] mt-0.5">&nbsp;</p>
            </div>
            <div className="card p-2.5 md:p-4 text-center">
              <p className="text-[10px] md:text-[11px] text-[#6B7280] font-bold uppercase tracking-wider mb-1">Fat</p>
              <p className="text-base md:text-xl font-bold text-[#111827] tabular-nums">{summary.totalFat}g</p>
              <p className="text-[10px] md:text-[11px] text-[#6B7280] mt-0.5">&nbsp;</p>
            </div>
          </div>

          {/* Water Tracker */}
          <div className="card p-4 md:p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">💧</span>
                <div>
                  <h3 className="text-sm font-bold text-[#111827]">Water Intake</h3>
                  <p className="text-xs text-[#6B7280] font-medium">Goal: {waterTarget} ml</p>
                </div>
              </div>
              <span className="text-sm font-extrabold text-[#3B82F6] tabular-nums">
                {currentWater} / {waterTarget} ml
              </span>
            </div>
            <div className="h-2.5 w-full bg-[#E5E7EB] rounded-full overflow-hidden mb-4">
              <div
                className="h-full bg-[#3B82F6] rounded-full transition-all duration-300"
                style={{ width: `${waterProgress * 100}%` }}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => saveWaterLog(selectedDate, currentWater + 250)}
                className="flex-1 py-2.5 bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#2563EB] text-xs font-semibold rounded-xl active:scale-95 transition cursor-pointer"
              >
                +250ml
              </button>
              <button
                onClick={() => saveWaterLog(selectedDate, currentWater + 500)}
                className="flex-1 py-2.5 bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#2563EB] text-xs font-semibold rounded-xl active:scale-95 transition cursor-pointer"
              >
                +500ml
              </button>
              {currentWater > 0 && (
                <button
                  onClick={() => saveWaterLog(selectedDate, Math.max(0, currentWater - 250))}
                  className="px-3 py-2.5 bg-[#E5E7EB] hover:bg-[#D1D5DB] text-[#111827] text-xs font-semibold rounded-xl active:scale-95 transition cursor-pointer"
                >
                  −250
                </button>
              )}
            </div>
          </div>

          {/* Done for the Day */}
          {hydrated && (
            <button
              onClick={() => setShowSummaryModal(true)}
              className="btn-secondary w-full cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="m9 12 2 2 4-4" />
              </svg>
              Done for the Day
            </button>
          )}
        </div>

        {/* Right Column — Today's Meals */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-[#6B7280]">Today&apos;s Meals</h2>

            {summary.entries.length === 0 ? (
              <div className="card p-4 md:p-6 text-center">
                <p className="text-base font-semibold text-[#111827]">No entries logged for this date.</p>
                <p className="mt-2 text-xs font-bold text-[#6B7280] uppercase tracking-wider">Quick log recommendations:</p>
                <div className="mt-4 flex flex-col gap-2">
                  {STARTER_FOODS.map((food) => (
                    <button
                      key={food.name}
                      onClick={() => handleQuickAdd(food.name, food.calories, food.protein, food.tag)}
                      className="flex items-center justify-between bg-white hover:bg-[#EFF6FF] border border-black/5 hover:border-blue-600/10 px-4 py-3.5 text-left transition active:scale-[0.99] rounded-xl cursor-pointer"
                    >
                      <span className="text-sm font-semibold text-[#111827]">+ {food.name}</span>
                      <span className="text-xs font-semibold text-[#4B5563]">{food.calories} kcal · {food.protein}g P</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {tagsOrder.map((tag) => {
                  const entries = groupedEntries[tag];
                  if (!entries || entries.length === 0) return null;
                  return (
                    <div key={tag} className="flex flex-col gap-2.5">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xs font-bold text-[#111827] uppercase tracking-wider">{tagLabelMapping[tag]}</span>
                        <div className="h-px flex-1 bg-black/5" />
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

          {/* Quick Log Frequent */}
          {distinct.length > 0 && (
            <div>
              <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-[#6B7280]">Quick Log Frequent</h2>
              <div className="hide-scrollbar flex gap-2 overflow-x-auto pb-1">
                {distinct.map((food) => (
                  <button
                    key={food.name}
                    onClick={() => handleQuickAdd(food.name, food.calories, food.protein, "snack")}
                    className="shrink-0 chip whitespace-nowrap cursor-pointer"
                  >
                    + {food.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Undo Toast */}
      {showUndo && (
        <div className="fixed bottom-24 left-1/2 z-50 w-full max-w-xs -translate-x-1/2 px-4">
          <div className="flex items-center justify-between bg-[#FFFFFF] p-3.5 shadow-lg rounded-xl border border-black/5">
            <span className="text-xs text-[#4B5563] font-medium">Item deleted.</span>
            <button
              onClick={() => { undoDeleteFood(); setShowUndo(false); }}
              className="text-xs font-semibold text-[#2563EB] hover:text-[#1D4ED8] px-2 py-0.5 active:scale-95 transition cursor-pointer"
            >
              Undo
            </button>
          </div>
        </div>
      )}

      {/* Scan FAB - Mobile */}
      {isToday(selectedDate) && (
        <div className="fixed bottom-28 right-4 z-40 md:hidden">
          <button
            onClick={() => setShowCamera(true)}
            className="flex items-center gap-1.5 h-10 px-3.5 bg-[#1DB954] text-white shadow-lg shadow-[#1DB954]/25 hover:bg-[#17a94a] transition active:scale-95 rounded-full cursor-pointer"
            aria-label="Scan food with camera"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>
            </svg>
            <span className="text-xs font-bold">Scan</span>
          </button>
        </div>
      )}

      {/* Done Summary Modal */}
      {hydrated && (
        <DoneSummaryModal
          isOpen={showSummaryModal}
          onClose={() => setShowSummaryModal(false)}
          summary={summary}
          settings={settings}
        />
      )}

      {/* Food Camera */}
      {showCamera && (
        <FoodCamera
          onLogItem={handleLogScannedItem}
          onClose={() => setShowCamera(false)}
        />
      )}
    </div>
  );
}

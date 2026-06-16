"use client";

import { useState } from "react";
import { useApp } from "@/lib/AppContext";
import { clearAllData } from "@/lib/storage";
import { AuthUI } from "@/components/AuthUI";

export default function SettingsPage() {
  const { foods, settings, updateSettings, getStreak } = useApp();
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const streak = getStreak();

  const exportJSON = () => {
    const data = {
      foods,
      settings,
      version: 1,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `calpro-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportCSV = () => {
    const headers = ["Date", "Time", "Tag", "Name", "Calories", "Protein", "Carbs", "Fat"];
    const rows = foods.map((entry) => {
      const date = entry.date;
      const time = new Date(entry.createdAt).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
      const tag = entry.tag;
      const escapedName = `"${entry.name.replace(/"/g, '""')}"`;
      const calories = entry.calories;
      const protein = entry.protein;
      const carbs = entry.carbs !== undefined ? entry.carbs : "";
      const fat = entry.fat !== undefined ? entry.fat : "";

      return [date, time, tag, escapedName, calories, protein, carbs, fat].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `calpro-export-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };



  return (
    <div className="relative min-h-full select-none font-sans text-[#f5f2eb]">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-[#f5f2eb] font-sans">
          Settings
        </h1>
      </div>

      {/* Active Streak Flag */}
      {streak > 0 && (
        <div className="mb-6 glass-panel p-4 flex items-center justify-between rounded-2xl">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔥</span>
            <div>
              <p className="text-sm font-semibold text-[#f5f2eb] font-sans">
                {streak} Day Streak!
              </p>
              <p className="text-xs text-[#a19890] font-sans">
                Keep logging daily to lock your momentum.
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold text-[#81b29a] bg-[#81b29a]/10 border border-[#81b29a]/20 px-2.5 py-0.5 rounded-full font-sans">ACTIVE</span>
        </div>
      )}

      {/* Responsive Grid Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        
        {/* Left Goals / Preferences Column */}
        <div className="lg:col-span-6 space-y-6">
          {/* Goal bounds overrides */}
          <section>
            <h2 className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-[#a19890] font-sans">
              Nutrition & Health Goals
            </h2>
            <div className="space-y-5 glass-panel p-5 rounded-2xl">
              
              {/* Calories goal */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="calorie-target-range"
                    className="text-sm font-medium text-[#f5f2eb] font-sans"
                  >
                    Daily Calories
                  </label>
                  <span className="text-sm font-semibold text-[#1DB954] font-sans tabular-nums">
                    {settings.dailyCalorieTarget} kcal
                  </span>
                </div>
                <input
                  id="calorie-target-range"
                  type="range"
                  min="1000"
                  max="4500"
                  step="50"
                  value={settings.dailyCalorieTarget}
                  onChange={(e) => updateSettings({ dailyCalorieTarget: parseInt(e.target.value, 10) })}
                  className="w-full accent-[#1DB954] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#a19890] font-sans font-medium mt-0.5">
                  <span>1000 kcal</span>
                  <span>2750 kcal</span>
                  <span>4500 kcal</span>
                </div>
              </div>

              <div className="h-px bg-white/[0.04] my-1" />

              {/* Protein goal */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="protein-target-range"
                    className="text-sm font-medium text-[#f5f2eb] font-sans"
                  >
                    Daily Protein
                  </label>
                  <span className="text-sm font-semibold text-[#81b29a] font-sans tabular-nums">
                    {settings.dailyProteinTarget}g
                  </span>
                </div>
                <input
                  id="protein-target-range"
                  type="range"
                  min="40"
                  max="250"
                  step="5"
                  value={settings.dailyProteinTarget}
                  onChange={(e) => updateSettings({ dailyProteinTarget: parseInt(e.target.value, 10) })}
                  className="w-full accent-[#81b29a] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#a19890] font-sans font-medium mt-0.5">
                  <span>40g</span>
                  <span>145g</span>
                  <span>250g</span>
                </div>
              </div>

              <div className="h-px bg-white/[0.04] my-1" />

              {/* Water goal */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="water-target-range"
                    className="text-sm font-medium text-[#f5f2eb] font-sans"
                  >
                    Daily Water Target
                  </label>
                  <span className="text-sm font-semibold text-[#5f85a6] font-sans tabular-nums">
                    {settings.dailyWaterTarget || 2500} ml
                  </span>
                </div>
                <input
                  id="water-target-range"
                  type="range"
                  min="1000"
                  max="5000"
                  step="250"
                  value={settings.dailyWaterTarget || 2500}
                  onChange={(e) => updateSettings({ dailyWaterTarget: parseInt(e.target.value, 10) })}
                  className="w-full accent-[#5f85a6] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#a19890] font-sans font-medium mt-0.5">
                  <span>1000 ml</span>
                  <span>3000 ml</span>
                  <span>5000 ml</span>
                </div>
              </div>

            </div>
          </section>

          {/* Tracking Preferences */}
          <section>
            <h2 className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-[#a19890] font-sans">
              Tracking Preferences
            </h2>
            <div className="border border-white/[0.04] glass-panel p-5 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 pr-4">
                  <p className="text-sm font-medium text-[#f5f2eb] font-sans">Track Carbs &amp; Fat</p>
                  <p className="text-xs text-[#a19890] mt-1 font-sans leading-relaxed">
                    Show carbs and fat when logging from the Food DB. Stored alongside calories and protein.
                  </p>
                </div>
                <button
                  onClick={() => updateSettings({ trackCarbsFat: !settings.trackCarbsFat })}
                  className={`relative shrink-0 w-12 h-6 rounded-full transition-colors duration-200 cursor-pointer border ${
                    settings.trackCarbsFat
                      ? "bg-[#81b29a] border-[#81b29a]"
                      : "bg-[#282421] border-white/[0.08]"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                      settings.trackCarbsFat ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
              {settings.trackCarbsFat && (
                <div className="bg-[#81b29a]/5 border border-[#81b29a]/20 rounded-xl p-3.5 text-xs text-[#a19890] font-sans font-medium">
                  ✓ Carbs and fat metrics will be highlighted inside Food DB and Meal Builders.
                </div>
              )}
            </div>
          </section>

        </div>

        {/* Right Shares & Exports Column */}
        <div className="lg:col-span-6 space-y-6">
          {/* Auth / Sync */}
          <section>
            <h2 className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-[#a19890] font-sans">
              Account & Sync
            </h2>
            <AuthUI />
          </section>

          {/* Data export controls */}
          <section>
            <h2 className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-[#a19890] font-sans">
              Storage & Management
            </h2>
            <div className="overflow-hidden glass-panel rounded-2xl">
              <button
                onClick={exportJSON}
                className="flex w-full items-center justify-between px-5 py-4 text-sm font-semibold text-[#f5f2eb] transition hover:bg-white/[0.02] rounded-none cursor-pointer"
              >
                Export Backup
                <span className="border border-white/[0.06] bg-[#282421] px-2 py-0.5 text-xs text-[#a19890] font-mono rounded-md">.json</span>
              </button>
              
              <div className="h-px bg-white/[0.04]" />

              <button
                onClick={exportCSV}
                className="flex w-full items-center justify-between px-5 py-4 text-sm font-semibold text-[#f5f2eb] transition hover:bg-white/[0.02] rounded-none cursor-pointer"
              >
                Export Spreadsheet
                <span className="border border-white/[0.06] bg-[#282421] px-2 py-0.5 text-xs text-[#a19890] font-mono rounded-md">.csv</span>
              </button>
              
              <div className="h-px bg-white/[0.04]" />

              {showClearConfirm ? (
                <div className="p-4 bg-[#ef4444]/5 border-t border-white/[0.04]">
                  <p className="mb-3 text-xs leading-relaxed text-[#ef4444] font-sans">
                    Warning: Clears all historical entries and settings from this browser. This cannot be undone.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        clearAllData();
                        window.location.reload();
                      }}
                      className="bg-[#ef4444] hover:bg-[#eb836a] px-4 py-2.5 text-xs font-semibold text-[#161413] transition active:scale-95 rounded-full cursor-pointer"
                    >
                      Clear Everything
                    </button>
                    <button
                      onClick={() => setShowClearConfirm(false)}
                      className="border border-white/[0.08] bg-[#282421] px-4 py-2.5 text-xs font-semibold text-zinc-300 transition hover:text-[#f5f2eb] active:scale-95 rounded-full cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="flex w-full items-center justify-between px-5 py-4 text-sm font-semibold text-[#ef4444] transition hover:bg-[#ef4444]/5 active:text-[#ef4444] rounded-none cursor-pointer"
                >
                  Reset All Data
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
                    <path d="M3 6h18" />
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                  </svg>
                </button>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

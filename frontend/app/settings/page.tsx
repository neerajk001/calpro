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
    const data = { foods, settings, version: 1 };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `calpro-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click(); URL.revokeObjectURL(url);
  };

  const exportCSV = () => {
    const headers = ["Date", "Time", "Tag", "Name", "Calories", "Protein", "Carbs", "Fat"];
    const rows = foods.map((entry) => {
      const date = entry.date;
      const time = new Date(entry.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
      const tag = entry.tag;
      const escapedName = `"${entry.name.replace(/"/g, '""')}"`;
      return [date, time, tag, escapedName, entry.calories, entry.protein, entry.carbs !== undefined ? entry.carbs : "", entry.fat !== undefined ? entry.fat : ""].join(",");
    });
    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `calpro-export-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="relative min-h-full select-none text-[#111827]">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight">Settings</h1>
      </div>

      {streak > 0 && (
        <div className="mb-4 md:mb-6 card p-3.5 md:p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔥</span>
            <div>
              <p className="text-sm font-bold text-[#111827]">{streak} Day Streak!</p>
              <p className="text-xs text-[#4B5563]">Keep logging daily to lock your momentum.</p>
            </div>
          </div>
          <span className="text-xs font-bold text-[#10B981] bg-[#10B981]/10 px-2.5 py-0.5 rounded-full">ACTIVE</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-6 space-y-6">
          <section>
            <h2 className="mb-2.5 text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">Nutrition & Health Goals</h2>
            <div className="space-y-5 card p-4 md:p-5">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="calorie-target-range" className="text-sm font-semibold text-[#111827]">Daily Calories</label>
                  <span className="text-sm font-extrabold text-[#2563EB] tabular-nums">{settings.dailyCalorieTarget} kcal</span>
                </div>
                <input id="calorie-target-range" type="range" min="1000" max="4500" step="50" value={settings.dailyCalorieTarget} onChange={(e) => updateSettings({ dailyCalorieTarget: parseInt(e.target.value, 10) })} className="w-full accent-[#2563EB] cursor-pointer" />
                <div className="flex justify-between text-[10px] text-[#6B7280] font-bold mt-0.5"><span>1000 kcal</span><span>2750 kcal</span><span>4500 kcal</span></div>
              </div>
              <div className="h-px bg-black/5" />
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="protein-target-range" className="text-sm font-semibold text-[#111827]">Daily Protein</label>
                  <span className="text-sm font-extrabold text-[#10B981] tabular-nums">{settings.dailyProteinTarget}g</span>
                </div>
                <input id="protein-target-range" type="range" min="40" max="250" step="5" value={settings.dailyProteinTarget} onChange={(e) => updateSettings({ dailyProteinTarget: parseInt(e.target.value, 10) })} className="w-full accent-[#10B981] cursor-pointer" />
                <div className="flex justify-between text-[10px] text-[#6B7280] font-bold mt-0.5"><span>40g</span><span>145g</span><span>250g</span></div>
              </div>
              <div className="h-px bg-black/5" />
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="water-target-range" className="text-sm font-semibold text-[#111827]">Daily Water Target</label>
                  <span className="text-sm font-extrabold text-[#3B82F6] tabular-nums">{settings.dailyWaterTarget || 2500} ml</span>
                </div>
                <input id="water-target-range" type="range" min="1000" max="5000" step="250" value={settings.dailyWaterTarget || 2500} onChange={(e) => updateSettings({ dailyWaterTarget: parseInt(e.target.value, 10) })} className="w-full accent-[#3B82F6] cursor-pointer" />
                <div className="flex justify-between text-[10px] text-[#6B7280] font-bold mt-0.5"><span>1000 ml</span><span>3000 ml</span><span>5000 ml</span></div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="mb-2.5 text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">Tracking Preferences</h2>
            <div className="card p-4 md:p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 pr-4">
                  <p className="text-sm font-semibold text-[#111827]">Track Carbs &amp; Fat</p>
                  <p className="text-xs text-[#4B5563] mt-1 leading-relaxed">Show carbs and fat when logging from the Food DB.</p>
                </div>
                <button onClick={() => updateSettings({ trackCarbsFat: !settings.trackCarbsFat })} className={`relative shrink-0 w-12 h-6 rounded-full transition-colors duration-200 cursor-pointer border ${settings.trackCarbsFat ? "bg-[#2563EB] border-[#2563EB]" : "bg-[#E5E7EB] border-black/5"}`}>
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${settings.trackCarbsFat ? "translate-x-6" : "translate-x-0"}`} />
                </button>
              </div>
              {settings.trackCarbsFat && (
                <div className="bg-[#EFF6FF] border border-blue-100 text-[#111827] rounded-xl p-3.5 text-xs font-semibold">✓ Carbs and fat metrics will be highlighted inside Food DB and Meal Builders.</div>
              )}
            </div>
          </section>
        </div>

        <div className="lg:col-span-6 space-y-6">
          <section>
            <h2 className="mb-2.5 text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">Account & Sync</h2>
            <AuthUI />
          </section>

          <section>
            <h2 className="mb-2.5 text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">Storage & Management</h2>
            <div className="overflow-hidden card">
              <button onClick={exportJSON} className="flex w-full items-center justify-between px-4 py-3.5 md:px-5 md:py-4 text-sm font-semibold text-[#111827] transition hover:bg-[#EFF6FF] hover:text-[#2563EB] rounded-none cursor-pointer">
                Export Backup
                <span className="bg-[#E5E7EB] px-2 py-0.5 text-xs text-[#4B5563] font-mono rounded-md">.json</span>
              </button>
              <div className="h-px bg-black/5" />
              <button onClick={exportCSV} className="flex w-full items-center justify-between px-4 py-3.5 md:px-5 md:py-4 text-sm font-semibold text-[#111827] transition hover:bg-[#EFF6FF] hover:text-[#2563EB] rounded-none cursor-pointer">
                Export Spreadsheet
                <span className="bg-[#E5E7EB] px-2 py-0.5 text-xs text-[#4B5563] font-mono rounded-md">.csv</span>
              </button>
              <div className="h-px bg-black/5" />
              {showClearConfirm ? (
                <div className="p-4 bg-red-50 border-t border-red-100">
                  <p className="mb-3 text-xs leading-relaxed text-[#EF4444] font-semibold">Warning: Clears all historical entries and settings. This cannot be undone.</p>
                  <div className="flex gap-2">
                    <button onClick={() => { clearAllData(); window.location.reload(); }} className="bg-[#EF4444] hover:bg-red-700 px-4 py-2.5 text-xs font-semibold text-white transition active:scale-95 rounded-2xl cursor-pointer">Clear Everything</button>
                    <button onClick={() => setShowClearConfirm(false)} className="bg-[#E5E7EB] hover:bg-[#D1D5DB] px-4 py-2.5 text-xs font-semibold text-[#111827] transition active:scale-95 rounded-2xl cursor-pointer">Cancel</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setShowClearConfirm(true)} className="flex w-full items-center justify-between px-4 py-3.5 md:px-5 md:py-4 text-sm font-semibold text-[#EF4444] transition hover:bg-red-50 rounded-none cursor-pointer">
                  Reset All Data
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                </button>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

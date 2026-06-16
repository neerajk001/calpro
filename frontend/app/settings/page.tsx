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
    <div className="relative min-h-full select-none text-[#1F1F1F]">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl md:text-2xl font-semibold tracking-tight">Settings</h1>
      </div>

      {streak > 0 && (
        <div className="mb-6 card p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔥</span>
            <div>
              <p className="text-sm font-semibold text-[#1F1F1F]">{streak} Day Streak!</p>
              <p className="text-xs text-[#666666]">Keep logging daily to lock your momentum.</p>
            </div>
          </div>
          <span className="text-xs font-semibold text-[#8BC6A2] bg-[#8BC6A2]/10 px-2.5 py-0.5 rounded-full">ACTIVE</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-6 space-y-6">
          <section>
            <h2 className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-[#9A9A9A]">Nutrition & Health Goals</h2>
            <div className="space-y-5 card p-5">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="calorie-target-range" className="text-sm font-medium text-[#1F1F1F]">Daily Calories</label>
                  <span className="text-sm font-semibold text-[#96CE4B] tabular-nums">{settings.dailyCalorieTarget} kcal</span>
                </div>
                <input id="calorie-target-range" type="range" min="1000" max="4500" step="50" value={settings.dailyCalorieTarget} onChange={(e) => updateSettings({ dailyCalorieTarget: parseInt(e.target.value, 10) })} className="w-full accent-[#96CE4B] cursor-pointer" />
                <div className="flex justify-between text-[10px] text-[#9A9A9A] font-medium mt-0.5"><span>1000 kcal</span><span>2750 kcal</span><span>4500 kcal</span></div>
              </div>
              <div className="h-px bg-[#F4F7EF]" />
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="protein-target-range" className="text-sm font-medium text-[#1F1F1F]">Daily Protein</label>
                  <span className="text-sm font-semibold text-[#8BC6A2] tabular-nums">{settings.dailyProteinTarget}g</span>
                </div>
                <input id="protein-target-range" type="range" min="40" max="250" step="5" value={settings.dailyProteinTarget} onChange={(e) => updateSettings({ dailyProteinTarget: parseInt(e.target.value, 10) })} className="w-full accent-[#8BC6A2] cursor-pointer" />
                <div className="flex justify-between text-[10px] text-[#9A9A9A] font-medium mt-0.5"><span>40g</span><span>145g</span><span>250g</span></div>
              </div>
              <div className="h-px bg-[#F4F7EF]" />
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="water-target-range" className="text-sm font-medium text-[#1F1F1F]">Daily Water Target</label>
                  <span className="text-sm font-semibold text-[#7CC7E8] tabular-nums">{settings.dailyWaterTarget || 2500} ml</span>
                </div>
                <input id="water-target-range" type="range" min="1000" max="5000" step="250" value={settings.dailyWaterTarget || 2500} onChange={(e) => updateSettings({ dailyWaterTarget: parseInt(e.target.value, 10) })} className="w-full accent-[#7CC7E8] cursor-pointer" />
                <div className="flex justify-between text-[10px] text-[#9A9A9A] font-medium mt-0.5"><span>1000 ml</span><span>3000 ml</span><span>5000 ml</span></div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-[#9A9A9A]">Tracking Preferences</h2>
            <div className="card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 pr-4">
                  <p className="text-sm font-medium text-[#1F1F1F]">Track Carbs &amp; Fat</p>
                  <p className="text-xs text-[#666666] mt-1 leading-relaxed">Show carbs and fat when logging from the Food DB.</p>
                </div>
                <button onClick={() => updateSettings({ trackCarbsFat: !settings.trackCarbsFat })} className={`relative shrink-0 w-12 h-6 rounded-full transition-colors duration-200 cursor-pointer border ${settings.trackCarbsFat ? "bg-[#8BC6A2] border-[#8BC6A2]" : "bg-[#F4F7EF] border-[#EAF5D6]"}`}>
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${settings.trackCarbsFat ? "translate-x-6" : "translate-x-0"}`} />
                </button>
              </div>
              {settings.trackCarbsFat && (
                <div className="bg-[#EAF5D6]/50 border border-[#EAF5D6] rounded-xl p-3.5 text-xs text-[#666666] font-medium">✓ Carbs and fat metrics will be highlighted inside Food DB and Meal Builders.</div>
              )}
            </div>
          </section>
        </div>

        <div className="lg:col-span-6 space-y-6">
          <section>
            <h2 className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-[#9A9A9A]">Account & Sync</h2>
            <AuthUI />
          </section>

          <section>
            <h2 className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-[#9A9A9A]">Storage & Management</h2>
            <div className="overflow-hidden card">
              <button onClick={exportJSON} className="flex w-full items-center justify-between px-5 py-4 text-sm font-semibold text-[#1F1F1F] transition hover:bg-[#F4F7EF] rounded-none cursor-pointer">
                Export Backup
                <span className="bg-[#F4F7EF] px-2 py-0.5 text-xs text-[#9A9A9A] font-mono rounded-md">.json</span>
              </button>
              <div className="h-px bg-[#F4F7EF]" />
              <button onClick={exportCSV} className="flex w-full items-center justify-between px-5 py-4 text-sm font-semibold text-[#1F1F1F] transition hover:bg-[#F4F7EF] rounded-none cursor-pointer">
                Export Spreadsheet
                <span className="bg-[#F4F7EF] px-2 py-0.5 text-xs text-[#9A9A9A] font-mono rounded-md">.csv</span>
              </button>
              <div className="h-px bg-[#F4F7EF]" />
              {showClearConfirm ? (
                <div className="p-4 bg-[#F1A09C]/5 border-t border-[#F4F7EF]">
                  <p className="mb-3 text-xs leading-relaxed text-[#F1A09C]">Warning: Clears all historical entries and settings. This cannot be undone.</p>
                  <div className="flex gap-2">
                    <button onClick={() => { clearAllData(); window.location.reload(); }} className="bg-[#F1A09C] hover:bg-[#e89088] px-4 py-2.5 text-xs font-semibold text-white transition active:scale-95 rounded-2xl cursor-pointer">Clear Everything</button>
                    <button onClick={() => setShowClearConfirm(false)} className="bg-[#F4F7EF] hover:bg-[#EAF5D6] px-4 py-2.5 text-xs font-semibold text-[#666666] transition active:scale-95 rounded-2xl cursor-pointer">Cancel</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setShowClearConfirm(true)} className="flex w-full items-center justify-between px-5 py-4 text-sm font-semibold text-[#F1A09C] transition hover:bg-[#F1A09C]/5 rounded-none cursor-pointer">
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

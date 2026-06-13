"use client";

import { useState } from "react";
import { useApp } from "@/lib/AppContext";
import { exportData, clearAllData } from "@/lib/storage";

export default function SettingsPage() {
  const { settings, updateSettings, getStreak } = useApp();
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const streak = getStreak();

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 pt-6 select-none pb-12">
      <h1 className="text-xl font-extrabold tracking-tight text-white font-sans mb-5">
        Settings
      </h1>

      {/* Active Streak Flag */}
      {streak > 0 && (
        <div className="mb-5 rounded-2xl bg-gradient-to-r from-[#10B981]/15 to-[#06B6D4]/15 border border-[#10B981]/25 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔥</span>
            <div>
              <p className="text-sm font-extrabold text-white font-sans">
                {streak} Day Streak!
              </p>
              <p className="text-[10px] text-slate-400 font-sans">
                Keep logging daily to lock your momentum.
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-[#10B981] font-sans">ACTIVE</span>
        </div>
      )}

      {/* Goal bounds overrides */}
      <section className="mb-6">
        <h2 className="mb-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-500 font-sans">
          Nutrition Goals
        </h2>
        <div className="space-y-4 rounded-2xl border border-white/5 bg-slate-900/40 p-4 backdrop-blur-md">
          
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="calorie-target"
                className="text-xs font-bold text-slate-300 font-sans"
              >
                Daily Calories
              </label>
              <span className="text-xs font-bold text-[#10B981] font-sans tabular-nums">
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
              className="w-full accent-[#10B981] cursor-pointer"
            />
            <div className="flex justify-between text-[8px] text-slate-600 font-sans font-semibold mt-0.5">
              <span>1000 kcal</span>
              <span>2750 kcal</span>
              <span>4500 kcal</span>
            </div>
          </div>

          <div className="h-px bg-white/5 my-1" />

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="protein-target"
                className="text-xs font-bold text-slate-300 font-sans"
              >
                Daily Protein
              </label>
              <span className="text-xs font-bold text-[#06B6D4] font-sans tabular-nums">
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
              className="w-full accent-[#06B6D4] cursor-pointer"
            />
            <div className="flex justify-between text-[8px] text-slate-600 font-sans font-semibold mt-0.5">
              <span>40g</span>
              <span>145g</span>
              <span>250g</span>
            </div>
          </div>

        </div>
      </section>

      {/* Data export controls */}
      <section className="mb-6">
        <h2 className="mb-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-500 font-sans">
          Storage & Management
        </h2>
        <div className="overflow-hidden rounded-2xl border border-white/5 bg-slate-900/40 backdrop-blur-md">
          <button
            onClick={exportData}
            className="flex w-full items-center justify-between px-4 py-3.5 text-xs font-bold text-slate-300 transition hover:bg-white/5"
          >
            Export Backup
            <span className="rounded bg-white/5 px-2 py-0.5 text-[9px] text-slate-400 font-mono">.json</span>
          </button>
          
          <div className="h-px bg-white/5" />

          {showClearConfirm ? (
            <div className="p-4 bg-red-950/10">
              <p className="mb-3 text-xs leading-relaxed text-red-400 font-sans">
                Warning: Clears all historical entries and settings from this browser. This cannot be undone.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    clearAllData();
                    window.location.reload();
                  }}
                  className="rounded-xl bg-red-500 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-red-600 active:scale-95"
                >
                  Clear Everything
                </button>
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="rounded-xl border border-white/5 bg-white/5 px-4 py-2.5 text-xs font-bold text-slate-400 transition hover:text-white active:scale-95"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="flex w-full items-center justify-between px-4 py-3.5 text-xs font-bold text-red-400 transition hover:bg-red-500/5 active:text-red-300"
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

      {/* About context */}
      <section className="mt-4 text-center">
        <p className="text-[10px] text-slate-500 font-semibold font-sans uppercase tracking-wider">
          Calpro v1.2 · Local Storage Engine
        </p>
      </section>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useApp } from "@/lib/AppContext";
import { exportData, clearAllData } from "@/lib/storage";

export default function SettingsPage() {
  const { settings, updateSettings, getStreak } = useApp();
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const streak = getStreak();

  return (
    <div className="mx-auto max-w-lg px-4 pb-24 pt-6">
      <h1 className="mb-6 text-lg font-semibold text-slate-900 dark:text-slate-100">
        Settings
      </h1>

      {/* Streak */}
      {streak > 1 && (
        <div className="mb-6 rounded-xl bg-accent/10 px-4 py-3 dark:bg-accent/20">
          <p className="text-sm font-medium text-accent">
            🔥 {streak} day streak!
          </p>
        </div>
      )}

      {/* Daily Targets */}
      <section className="mb-8">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
          Daily Targets
        </h2>
        <div className="space-y-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700">
          <div className="flex items-center justify-between">
            <label
              htmlFor="calorie-target"
              className="text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Calories per day
            </label>
            <div className="flex items-center gap-2">
              <input
                id="calorie-target"
                type="number"
                inputMode="numeric"
                value={settings.dailyCalorieTarget}
                onChange={(e) =>
                  updateSettings({
                    dailyCalorieTarget: Math.max(
                      100,
                      parseInt(e.target.value, 10) || 2000,
                    ),
                  })
                }
                min="100"
                step="50"
                className="w-28 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-right text-sm tabular-nums focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
              />
              <span className="text-xs text-slate-400">kcal</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <label
              htmlFor="protein-target"
              className="text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Protein per day
            </label>
            <div className="flex items-center gap-2">
              <input
                id="protein-target"
                type="number"
                inputMode="numeric"
                value={settings.dailyProteinTarget}
                onChange={(e) =>
                  updateSettings({
                    dailyProteinTarget: Math.max(
                      10,
                      parseInt(e.target.value, 10) || 120,
                    ),
                  })
                }
                min="10"
                step="5"
                className="w-28 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-right text-sm tabular-nums focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
              />
              <span className="text-xs text-slate-400">g</span>
            </div>
          </div>
        </div>
      </section>

      {/* Data */}
      <section className="mb-8">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
          Data
        </h2>
        <div className="rounded-xl bg-white shadow-sm ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700">
          <button
            onClick={exportData}
            className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            Export Data
            <span className="text-xs text-slate-400">.json</span>
          </button>
          <div className="mx-4 h-px bg-slate-100 dark:bg-slate-700" />
          {showClearConfirm ? (
            <div className="px-4 py-3">
              <p className="mb-2 text-sm text-red-600 dark:text-red-400">
                This will delete all your data. This cannot be undone.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    clearAllData();
                    window.location.reload();
                  }}
                  className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-600"
                >
                  Yes, clear everything
                </button>
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-red-500 transition hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              Clear All Data
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
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

      {/* About */}
      <section>
        <p className="text-center text-xs text-slate-400 dark:text-slate-500">
          CalPro v1.0 · No tracking · No ads
        </p>
      </section>
    </div>
  );
}

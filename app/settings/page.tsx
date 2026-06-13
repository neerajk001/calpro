"use client";

import { useState } from "react";
import { useApp } from "@/lib/AppContext";
import { exportData, clearAllData } from "@/lib/storage";

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

export default function SettingsPage() {
  const { settings, updateSettings, getStreak, getDaySummary } = useApp();
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const streak = getStreak();

  // Vintage share card customizer states
  const [showCalInShare, setShowCalInShare] = useState(true);
  const [showProtInShare, setShowProtInShare] = useState(true);
  const [showFoodsInShare, setShowFoodsInShare] = useState(true);
  const [showHandleInShare, setShowHandleInShare] = useState(true);

  const today = todayStr();
  const summary = getDaySummary(today);

  const getDynamicTwitterShareUrl = () => {
    let text = "🎵 Calpro Wrapped: Today's Playlist 🎧\n";
    text += "─────────────────────\n";
    if (showCalInShare) {
      text += `🔥 Calories: ${summary.totalCalories} / ${settings.dailyCalorieTarget} kcal (${Math.round(summary.calorieProgress * 100)}%)\n`;
    }
    if (showProtInShare) {
      text += `💪 Protein: ${summary.totalProtein} / ${settings.dailyProteinTarget}g (${Math.round(summary.proteinProgress * 100)}%)\n`;
    }
    if (showFoodsInShare && summary.entries.length > 0) {
      text += "─────────────────────\n";
      summary.entries.forEach((e, idx) => {
        text += `${String(idx + 1).padStart(2, "0")}. ${e.name} (${e.calories} kcal)\n`;
      });
    }
    text += "─────────────────────\n";
    if (showHandleInShare && settings.twitterHandle) {
      text += `Logged by @${settings.twitterHandle} via Calpro\n`;
    } else {
      text += `Logged via Calpro\n`;
    }
    text += `https://calpro.app`;
    return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 pt-6 select-none pb-12 font-sans text-stone-900">
      <h1 className="text-2xl font-serif font-bold tracking-tight text-stone-950 mb-5">
        Settings
      </h1>

      {/* Active Streak Flag */}
      {streak > 0 && (
        <div className="mb-5 border border-stone-200 bg-white p-4 flex items-center justify-between shadow-xs rounded-none">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔥</span>
            <div>
              <p className="text-base font-extrabold text-stone-900 font-sans">
                {streak} Day Streak!
              </p>
              <p className="text-xs text-[#78716C] font-sans">
                Keep logging daily to lock your momentum.
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-stone-850 font-sans">ACTIVE</span>
        </div>
      )}

      {/* Goal bounds overrides */}
      <section className="mb-6">
        <h2 className="mb-2.5 text-xs font-bold uppercase tracking-widest text-[#78716C] font-sans">
          Nutrition Goals
        </h2>
        <div className="space-y-4 border border-stone-200 bg-white p-4 shadow-xs rounded-none">
          
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="calorie-target"
                className="text-sm font-bold text-stone-750 font-sans"
              >
                Daily Calories
              </label>
              <span className="text-sm font-extrabold text-[#D97706] font-sans tabular-nums">
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
              className="w-full accent-[#D97706] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-stone-400 font-sans font-bold mt-0.5">
              <span>1000 kcal</span>
              <span>2750 kcal</span>
              <span>4500 kcal</span>
            </div>
          </div>

          <div className="h-px bg-stone-150 my-1" />

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="protein-target"
                className="text-sm font-bold text-stone-750 font-sans"
              >
                Daily Protein
              </label>
              <span className="text-sm font-extrabold text-[#16A34A] font-sans tabular-nums">
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
              className="w-full accent-[#16A34A] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-stone-400 font-sans font-bold mt-0.5">
              <span>40g</span>
              <span>145g</span>
              <span>250g</span>
            </div>
          </div>

        </div>
      </section>

      {/* X / Twitter Profile Settings */}
      <section className="mb-6">
        <h2 className="mb-2.5 text-xs font-bold uppercase tracking-widest text-[#78716C] font-sans">
          Social Profile
        </h2>
        <div className="border border-stone-200 bg-white p-4 shadow-xs rounded-none">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="twitter-handle"
              className="text-sm font-bold text-stone-750 font-sans"
            >
              X (Twitter) Handle
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-sm font-extrabold text-stone-400 font-sans">
                @
              </span>
              <input
                id="twitter-handle"
                type="text"
                value={settings.twitterHandle || ""}
                onChange={(e) => {
                  const val = e.target.value.replace(/[@\s]/g, "");
                  updateSettings({ twitterHandle: val });
                }}
                placeholder="username"
                className="w-full border-[1.5px] border-stone-200 bg-[#FAF8F5] pl-8 pr-4 py-3 text-xs text-stone-900 placeholder-stone-400 outline-none transition focus:border-stone-400 font-sans rounded-none font-bold"
              />
            </div>
            <p className="text-[11px] text-[#78716C] font-sans">
              Used when generating your daily vintage share card.
            </p>
          </div>
        </div>
      </section>

      {/* Vintage Share Card Preview Box */}
      <section className="mb-6">
        <h2 className="mb-2.5 text-xs font-bold uppercase tracking-widest text-[#78716C] font-sans">
          Spotify Share Card
        </h2>
        <div className="border border-stone-200 bg-white p-4 shadow-xs rounded-none">
          
          {/* The Spotify Card */}
          <div className="bg-[#121212] border border-stone-850 p-5 shadow-xs relative rounded-none select-none overflow-hidden mb-5 text-white">
            {/* Cover art grid highlight background element */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#1DB954]/5 blur-2xl pointer-events-none" />
            
            {/* Card Title Header */}
            <div className="flex justify-between items-baseline mb-4">
              <span className="text-[9px] font-bold tracking-widest text-[#1DB954] uppercase font-mono">
                🎵 Calpro Wrapped
              </span>
              <span className="text-[9px] font-mono font-bold text-stone-400 uppercase tracking-widest">
                TODAY'S PLAYLIST
              </span>
            </div>

            <h2 className="text-xl font-sans font-extrabold tracking-tight text-white border-b border-stone-800 pb-2 mb-4">
              {fmtDate(today)}
            </h2>

            {/* Calories Spotify Seeker */}
            {showCalInShare && (
              <div className="mb-4">
                <div className="flex justify-between items-center text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">
                  <span>Track 01: Calories</span>
                  <span className="text-white tabular-nums">{summary.totalCalories} / {settings.dailyCalorieTarget} kcal</span>
                </div>
                <div className="w-full bg-stone-800 h-1 relative my-2">
                  <div
                    className="bg-[#F97316] h-full"
                    style={{ width: `${Math.min(100, summary.calorieProgress * 100)}%` }}
                  />
                  <div
                    className="absolute top-1/2 w-2.5 h-2.5 bg-white -translate-y-1/2 border border-stone-900"
                    style={{ left: `calc(${Math.min(100, summary.calorieProgress * 100)}% - 5px)` }}
                  />
                </div>
                <div className="flex justify-between text-[9px] font-mono text-stone-550 font-bold">
                  <span>0:00</span>
                  <span>{Math.round(summary.calorieProgress * 100)}% TARGET</span>
                </div>
              </div>
            )}

            {/* Protein Spotify Seeker */}
            {showProtInShare && (
              <div className="mb-4">
                <div className="flex justify-between items-center text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">
                  <span>Track 02: Protein</span>
                  <span className="text-white tabular-nums">{summary.totalProtein} / {settings.dailyProteinTarget}g</span>
                </div>
                <div className="w-full bg-stone-800 h-1 relative my-2">
                  <div
                    className="bg-[#1DB954] h-full"
                    style={{ width: `${Math.min(100, summary.proteinProgress * 100)}%` }}
                  />
                  <div
                    className="absolute top-1/2 w-2.5 h-2.5 bg-white -translate-y-1/2 border border-stone-900"
                    style={{ left: `calc(${Math.min(100, summary.proteinProgress * 100)}% - 5px)` }}
                  />
                </div>
                <div className="flex justify-between text-[9px] font-mono text-stone-550 font-bold">
                  <span>0:00</span>
                  <span>{Math.round(summary.proteinProgress * 100)}% TARGET</span>
                </div>
              </div>
            )}

            {/* Logged food entries list as Spotify Tracklist */}
            {showFoodsInShare && (
              <div className="mb-5">
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-2.5 border-b border-stone-800 pb-1">
                  Playlist Manifest
                </p>
                {summary.entries.length > 0 ? (
                  <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                    {summary.entries.map((entry, idx) => (
                      <div key={entry.id} className="flex items-center text-xs font-sans text-stone-300">
                        <span className="w-5 shrink-0 font-mono text-[10px] text-stone-500">
                          {String(idx + 1).padStart(2, "0")}
                        </span>
                        <div className="flex-1 min-w-0 pr-2">
                          <p className="truncate font-bold text-white text-xs">{entry.name}</p>
                          <p className="text-[8px] font-bold text-[#1DB954] uppercase tracking-wide">
                            {entry.tag || "snack"}
                          </p>
                        </div>
                        <span className="shrink-0 font-mono text-stone-400 text-[10px] tabular-nums">
                          {entry.calories} kcal · {entry.protein}g
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs font-sans text-stone-500 italic">
                    No tracks loaded today.
                  </p>
                )}
              </div>
            )}

            {/* Spotify Player Control Footer */}
            <div className="mt-4 pt-3 border-t border-stone-800 flex justify-between items-center">
              <div className="flex items-center gap-2">
                {/* Visual Play Icon */}
                <div className="h-5 w-5 bg-[#1DB954] flex items-center justify-center text-[#121212] text-[8px] font-extrabold font-mono">
                  ▶
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-white truncate max-w-[120px] leading-tight">
                    {settings.twitterHandle ? `@${settings.twitterHandle}` : "Calpro Wrapped"}
                  </p>
                  <p className="text-[8px] text-stone-550 uppercase tracking-widest font-mono">
                    NOW LOGGING
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-stone-500 select-none">
                {/* Shuffle / Prev / Next Icons */}
                <span className="text-[10px] cursor-pointer hover:text-white transition">🔀</span>
                <span className="text-[10px] cursor-pointer hover:text-white transition">⏮</span>
                <span className="text-[12px] text-white cursor-pointer hover:scale-105 transition">⏸</span>
                <span className="text-[10px] cursor-pointer hover:text-white transition">⏭</span>
                <span className="text-[10px] cursor-pointer hover:text-white transition">🔁</span>
              </div>
            </div>
          </div>

          {/* Toggles */}
          <div className="mb-5 grid grid-cols-2 gap-3.5 bg-[#FAF8F5] p-3.5 border border-stone-200 shadow-2xs">
            <label className="flex items-center gap-2.5 text-xs font-bold text-stone-750 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showCalInShare}
                onChange={(e) => setShowCalInShare(e.target.checked)}
                className="h-4 w-4 accent-[#292524] cursor-pointer"
              />
              Show Calories
            </label>
            <label className="flex items-center gap-2.5 text-xs font-bold text-stone-750 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showProtInShare}
                onChange={(e) => setShowProtInShare(e.target.checked)}
                className="h-4 w-4 accent-[#292524] cursor-pointer"
              />
              Show Protein
            </label>
            <label className="flex items-center gap-2.5 text-xs font-bold text-stone-750 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showFoodsInShare}
                onChange={(e) => setShowFoodsInShare(e.target.checked)}
                className="h-4 w-4 accent-[#292524] cursor-pointer"
              />
              Show Meal List
            </label>
            <label className="flex items-center gap-2.5 text-xs font-bold text-stone-750 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showHandleInShare}
                onChange={(e) => setShowHandleInShare(e.target.checked)}
                className="h-4 w-4 accent-[#292524] cursor-pointer"
              />
              Show Handle
            </label>
          </div>

          {/* CTA Button */}
          <a
            href={getDynamicTwitterShareUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2.5 border border-transparent bg-[#292524] text-white py-3.5 text-sm font-extrabold transition hover:bg-[#1C1917] active:scale-95 shadow-xs rounded-none w-full"
          >
            <svg
              className="h-4.5 w-4.5 fill-current"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            Post to X
          </a>
        </div>
      </section>

      {/* Data export controls */}
      <section className="mb-6">
        <h2 className="mb-2.5 text-xs font-bold uppercase tracking-widest text-[#78716C] font-sans">
          Storage & Management
        </h2>
        <div className="overflow-hidden border border-stone-200 bg-white shadow-xs rounded-none">
          <button
            onClick={exportData}
            className="flex w-full items-center justify-between px-4 py-4 text-sm font-bold text-stone-750 transition hover:bg-stone-50 rounded-none"
          >
            Export Backup
            <span className="border border-stone-200 bg-stone-50 px-2 py-0.5 text-xs text-[#78716C] font-mono rounded-none">.json</span>
          </button>
          
          <div className="h-px bg-stone-100" />

          {showClearConfirm ? (
            <div className="p-4 bg-red-500/5">
              <p className="mb-3 text-xs leading-relaxed text-red-650 font-sans">
                Warning: Clears all historical entries and settings from this browser. This cannot be undone.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    clearAllData();
                    window.location.reload();
                  }}
                  className="bg-red-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-red-700 active:scale-95 rounded-none"
                >
                  Clear Everything
                </button>
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="border border-stone-200 bg-white px-4 py-2.5 text-xs font-bold text-stone-550 transition hover:text-stone-700 active:scale-95 rounded-none"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="flex w-full items-center justify-between px-4 py-4 text-sm font-bold text-red-600 transition hover:bg-red-50 active:text-red-750 rounded-none"
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
        <p className="text-[10px] text-stone-400 font-semibold font-sans uppercase tracking-wider">
          Calpro v1.2 · Local Storage Engine
        </p>
      </section>
    </div>
  );
}

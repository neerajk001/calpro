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
    let text = "📊 Calpro Today's Nutrition Summary ⚡\n";
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

  const downloadCardImage = () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 600;
    canvas.height = 600;

    // Background
    ctx.fillStyle = "#121212";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Border
    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.lineWidth = 2;
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

    // Header
    ctx.fillStyle = "#1DB954";
    ctx.font = "bold 11px monospace";
    ctx.fillText("CALPRO SYSTEM", 45, 60);

    ctx.fillStyle = "#888888";
    ctx.font = "bold 11px monospace";
    ctx.textAlign = "right";
    ctx.fillText("DAILY METRICS", canvas.width - 45, 60);

    // Header line
    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(45, 75);
    ctx.lineTo(canvas.width - 45, 75);
    ctx.stroke();

    // Date
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 24px system-ui, -apple-system, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(fmtDate(today), 45, 120);

    let currentY = 165;

    // Calories Goal Progress
    if (showCalInShare) {
      ctx.fillStyle = "#888888";
      ctx.font = "bold 11px system-ui, -apple-system, sans-serif";
      ctx.fillText("01 // CALORIES GOAL", 45, currentY);

      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "right";
      ctx.fillText(`${summary.totalCalories} / ${settings.dailyCalorieTarget} kcal`, canvas.width - 45, currentY);

      // Seek slider background
      ctx.fillStyle = "#222222";
      ctx.fillRect(45, currentY + 12, canvas.width - 90, 8);

      // Filled portion
      const calWidth = (canvas.width - 90) * Math.min(1, summary.calorieProgress);
      ctx.fillStyle = "#F97316";
      ctx.fillRect(45, currentY + 12, calWidth, 8);

      // Under slider metrics
      ctx.fillStyle = "#555555";
      ctx.font = "bold 10px monospace";
      ctx.textAlign = "left";
      ctx.fillText("METRIC TARGET", 45, currentY + 36);
      ctx.textAlign = "right";
      ctx.fillText(`${Math.round(summary.calorieProgress * 100)}% ACHIEVED`, canvas.width - 45, currentY + 36);

      currentY += 75;
    }

    // Protein Goal Progress
    if (showProtInShare) {
      ctx.fillStyle = "#888888";
      ctx.font = "bold 11px system-ui, -apple-system, sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("02 // PROTEIN GOAL", 45, currentY);

      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "right";
      ctx.fillText(`${summary.totalProtein} / ${settings.dailyProteinTarget}g`, canvas.width - 45, currentY);

      // Seek slider background
      ctx.fillStyle = "#222222";
      ctx.fillRect(45, currentY + 12, canvas.width - 90, 8);

      // Filled portion
      const protWidth = (canvas.width - 90) * Math.min(1, summary.proteinProgress);
      ctx.fillStyle = "#1DB954";
      ctx.fillRect(45, currentY + 12, protWidth, 8);

      // Under slider metrics
      ctx.fillStyle = "#555555";
      ctx.font = "bold 10px monospace";
      ctx.textAlign = "left";
      ctx.fillText("METRIC TARGET", 45, currentY + 36);
      ctx.textAlign = "right";
      ctx.fillText(`${Math.round(summary.proteinProgress * 100)}% ACHIEVED`, canvas.width - 45, currentY + 36);

      currentY += 75;
    }

    // Meal List Manifest
    if (showFoodsInShare) {
      ctx.fillStyle = "#888888";
      ctx.font = "bold 11px system-ui, -apple-system, sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("03 // LOG MANIFEST", 45, currentY);

      ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
      ctx.beginPath();
      ctx.moveTo(45, currentY + 10);
      ctx.lineTo(canvas.width - 45, currentY + 10);
      ctx.stroke();

      currentY += 30;

      if (summary.entries.length > 0) {
        summary.entries.slice(0, 4).forEach((entry, idx) => {
          ctx.fillStyle = "#555555";
          ctx.font = "11px monospace";
          ctx.textAlign = "left";
          ctx.fillText(String(idx + 1).padStart(2, "0"), 45, currentY);

          ctx.fillStyle = "#ffffff";
          ctx.font = "bold 12px system-ui, -apple-system, sans-serif";
          ctx.fillText(entry.name, 68, currentY);

          ctx.fillStyle = "#888888";
          ctx.font = "11px monospace";
          ctx.textAlign = "right";
          ctx.fillText(`${entry.calories} kcal · ${entry.protein}g`, canvas.width - 45, currentY);

          currentY += 24;
        });
      } else {
        ctx.fillStyle = "#555555";
        ctx.font = "italic 11px system-ui, -apple-system, sans-serif";
        ctx.fillText("No items logged today.", 45, currentY);
        currentY += 24;
      }
    }

    // Signature Footer
    if (showHandleInShare) {
      ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
      ctx.beginPath();
      ctx.moveTo(45, 520);
      ctx.lineTo(canvas.width - 45, 520);
      ctx.stroke();

      ctx.fillStyle = "#555555";
      ctx.font = "bold 10px monospace";
      ctx.textAlign = "left";
      ctx.fillText("CALPRO NUTRITION LOG", 45, 550);

      ctx.fillStyle = "#1DB954";
      ctx.font = "bold 12px monospace";
      ctx.textAlign = "right";
      ctx.fillText(`USER // @${settings.twitterHandle || "username"}`, canvas.width - 45, 550);
    }

    try {
      const dataUrl = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `calpro-daily-progress-${today}.png`;
      a.click();
    } catch (err) {
      console.error("Failed to generate and download card", err);
    }
  };

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 pt-6 select-none pb-12 font-sans text-white">
      <h1 className="text-2xl font-bold tracking-tight text-white mb-5 font-sans">
        Settings
      </h1>

      {/* Active Streak Flag */}
      {streak > 0 && (
        <div className="mb-5 border border-white/5 bg-[#181818] p-4 flex items-center justify-between shadow-md rounded-lg">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔥</span>
            <div>
              <p className="text-base font-extrabold text-white font-sans">
                {streak} Day Streak!
              </p>
              <p className="text-xs text-zinc-400 font-sans">
                Keep logging daily to lock your momentum.
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-zinc-350 bg-zinc-800 px-2.5 py-0.5 rounded-full font-sans">ACTIVE</span>
        </div>
      )}

      {/* Goal bounds overrides */}
      <section className="mb-6">
        <h2 className="mb-2.5 text-xs font-bold uppercase tracking-widest text-zinc-400 font-sans">
          Nutrition Goals
        </h2>
        <div className="space-y-4 border border-white/5 bg-[#181818] p-4 shadow-md rounded-lg">
          
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="calorie-target"
                className="text-sm font-bold text-zinc-300 font-sans"
              >
                Daily Calories
              </label>
              <span className="text-sm font-extrabold text-[#F97316] font-sans tabular-nums">
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
              className="w-full accent-[#F97316] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-zinc-500 font-sans font-bold mt-0.5">
              <span>1000 kcal</span>
              <span>2750 kcal</span>
              <span>4500 kcal</span>
            </div>
          </div>

          <div className="h-px bg-zinc-800 my-1" />

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="protein-target"
                className="text-sm font-bold text-zinc-300 font-sans"
              >
                Daily Protein
              </label>
              <span className="text-sm font-extrabold text-[#1DB954] font-sans tabular-nums">
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
              className="w-full accent-[#1DB954] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-zinc-500 font-sans font-bold mt-0.5">
              <span>40g</span>
              <span>145g</span>
              <span>250g</span>
            </div>
          </div>

        </div>
      </section>

      {/* X / Twitter Profile Settings */}
      <section className="mb-6">
        <h2 className="mb-2.5 text-xs font-bold uppercase tracking-widest text-zinc-400 font-sans">
          Social Profile
        </h2>
        <div className="border border-white/5 bg-[#181818] p-4 shadow-md rounded-lg">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="twitter-handle"
              className="text-sm font-bold text-zinc-300 font-sans"
            >
              X (Twitter) Handle
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-sm font-extrabold text-zinc-500 font-sans">
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
                className="w-full border border-white/10 bg-[#282828] pl-8 pr-4 py-3 text-xs text-white placeholder-zinc-550 outline-none transition focus:border-[#1DB954]/50 font-sans rounded-lg font-bold"
              />
            </div>
            <p className="text-[11px] text-zinc-400 font-sans">
              Used when generating your daily vintage share card.
            </p>
          </div>
        </div>
      </section>

      {/* Vintage Share Card Preview Box */}
      <section className="mb-6">
        <h2 className="mb-2.5 text-xs font-bold uppercase tracking-widest text-zinc-400 font-sans">
          Share Card Preview
        </h2>
        <div className="border border-white/5 bg-[#181818] p-4 shadow-md rounded-lg">
          
          {/* The Share Card */}
          <div className="bg-[#121212] border border-white/10 p-5 shadow-sm relative rounded-lg select-none overflow-hidden mb-5 text-white">
            
            {/* Card Title Header */}
            <div className="flex justify-between items-baseline mb-4">
              <span className="text-[9px] font-bold tracking-widest text-[#1DB954] uppercase font-mono">
                ⚡ Calpro System
              </span>
              <span className="text-[9px] font-mono font-bold text-stone-400 uppercase tracking-widest">
                DAILY METRICS
              </span>
            </div>

            <h2 className="text-xl font-sans font-extrabold tracking-tight text-white border-b border-stone-800 pb-2 mb-4">
              {fmtDate(today)}
            </h2>

            {/* Calories Progress */}
            {showCalInShare && (
              <div className="mb-4">
                <div className="flex justify-between items-center text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">
                  <span>01 // Calories Goal</span>
                  <span className="text-white tabular-nums">{summary.totalCalories} / {settings.dailyCalorieTarget} kcal</span>
                </div>
                <div className="w-full bg-stone-800 h-2 relative my-2">
                  <div
                    className="bg-[#F97316] h-full"
                    style={{ width: `${Math.min(100, summary.calorieProgress * 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[9px] font-mono text-stone-550 font-bold">
                  <span>METRIC TARGET</span>
                  <span>{Math.round(summary.calorieProgress * 100)}% ACHIEVED</span>
                </div>
              </div>
            )}

            {/* Protein Progress */}
            {showProtInShare && (
              <div className="mb-4">
                <div className="flex justify-between items-center text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">
                  <span>02 // Protein Goal</span>
                  <span className="text-white tabular-nums">{summary.totalProtein} / {settings.dailyProteinTarget}g</span>
                </div>
                <div className="w-full bg-stone-800 h-2 relative my-2">
                  <div
                    className="bg-[#1DB954] h-full"
                    style={{ width: `${Math.min(100, summary.proteinProgress * 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[9px] font-mono text-stone-550 font-bold">
                  <span>METRIC TARGET</span>
                  <span>{Math.round(summary.proteinProgress * 100)}% ACHIEVED</span>
                </div>
              </div>
            )}

            {/* Logged food entries list */}
            {showFoodsInShare && (
              <div className="mb-5">
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-2.5 border-b border-stone-800 pb-1">
                  03 // Log Manifest
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
                    No items logged today.
                  </p>
                )}
              </div>
            )}

            {/* Footer Signature line */}
            {showHandleInShare && (
              <div className="mt-4 pt-3 border-t border-stone-800 flex justify-between items-center">
                <span className="text-[10px] font-mono text-stone-550 tracking-wider">
                  CALPRO NUTRITION LOG
                </span>
                <span className="text-xs font-mono font-bold text-[#1DB954] bg-[#1DB954]/5 px-2.5 py-1 border border-[#1DB954]/20">
                  @{settings.twitterHandle || "username"}
                </span>
              </div>
            )}
          </div>

          {/* Toggles */}
          <div className="mb-5 grid grid-cols-2 gap-3.5 bg-[#282828] p-4 border border-white/5 shadow-md rounded-lg">
            <label className="flex items-center gap-2.5 text-xs font-bold text-zinc-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showCalInShare}
                onChange={(e) => setShowCalInShare(e.target.checked)}
                className="h-4 w-4 accent-[#1DB954] cursor-pointer"
              />
              Show Calories
            </label>
            <label className="flex items-center gap-2.5 text-xs font-bold text-zinc-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showProtInShare}
                onChange={(e) => setShowProtInShare(e.target.checked)}
                className="h-4 w-4 accent-[#1DB954] cursor-pointer"
              />
              Show Protein
            </label>
            <label className="flex items-center gap-2.5 text-xs font-bold text-zinc-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showFoodsInShare}
                onChange={(e) => setShowFoodsInShare(e.target.checked)}
                className="h-4 w-4 accent-[#1DB954] cursor-pointer"
              />
              Show Meal List
            </label>
            <label className="flex items-center gap-2.5 text-xs font-bold text-zinc-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showHandleInShare}
                onChange={(e) => setShowHandleInShare(e.target.checked)}
                className="h-4 w-4 accent-[#1DB954] cursor-pointer"
              />
              Show Handle
            </label>
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href={getDynamicTwitterShareUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-1 items-center justify-center gap-2.5 bg-[#1DB954] text-black py-3.5 text-sm font-extrabold transition hover:bg-[#1ed760] active:scale-95 shadow-md rounded-full cursor-pointer"
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
            
            <button
              onClick={downloadCardImage}
              className="flex flex-1 items-center justify-center gap-2.5 border border-white/10 bg-[#282828] text-white py-3.5 text-sm font-extrabold transition hover:bg-[#323232] active:scale-95 shadow-sm rounded-full cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" x2="12" y1="15" y2="3" />
              </svg>
              Download Card
            </button>
          </div>
        </div>
      </section>

      {/* Data export controls */}
      <section className="mb-6">
        <h2 className="mb-2.5 text-xs font-bold uppercase tracking-widest text-zinc-400 font-sans">
          Storage & Management
        </h2>
        <div className="overflow-hidden border border-white/5 bg-[#181818] shadow-md rounded-lg">
          <button
            onClick={exportData}
            className="flex w-full items-center justify-between px-4 py-4 text-sm font-bold text-white transition hover:bg-[#282828] rounded-none cursor-pointer"
          >
            Export Backup
            <span className="border border-white/5 bg-[#282828] px-2 py-0.5 text-xs text-zinc-400 font-mono rounded-md">.json</span>
          </button>
          
          <div className="h-px bg-zinc-800" />

          {showClearConfirm ? (
            <div className="p-4 bg-red-500/5 border-t border-zinc-800">
              <p className="mb-3 text-xs leading-relaxed text-red-400 font-sans">
                Warning: Clears all historical entries and settings from this browser. This cannot be undone.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    clearAllData();
                    window.location.reload();
                  }}
                  className="bg-red-500 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-red-650 active:scale-95 rounded-full cursor-pointer"
                >
                  Clear Everything
                </button>
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="border border-white/10 bg-[#282828] px-4 py-2.5 text-xs font-bold text-zinc-300 transition hover:text-white active:scale-95 rounded-full cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="flex w-full items-center justify-between px-4 py-4 text-sm font-bold text-red-400 transition hover:bg-red-500/5 active:text-red-500 rounded-none cursor-pointer"
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
        <p className="text-[10px] text-zinc-550 font-semibold font-sans uppercase tracking-wider">
          Calpro v1.2 · Local Storage Engine
        </p>
      </section>
    </div>
  );
}

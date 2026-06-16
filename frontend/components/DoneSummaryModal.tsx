"use client";

import type { DaySummary, UserSettings } from "@/lib/types";

interface DoneSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: DaySummary;
  settings: UserSettings;
}

export function DoneSummaryModal({
  isOpen,
  onClose,
  summary,
  settings,
}: DoneSummaryModalProps) {
  if (!isOpen) return null;

  const calorieTotal = summary.totalCalories;
  const calorieTarget = settings.dailyCalorieTarget;
  const proteinTotal = summary.totalProtein;
  const proteinTarget = settings.dailyProteinTarget;

  const calorieExceeded = calorieTotal > calorieTarget;
  const calorieDiff = Math.abs(calorieTotal - calorieTarget);
  const proteinTargetMet = proteinTotal >= proteinTarget;
  const proteinDiff = Math.abs(proteinTotal - proteinTarget);

  // Calorie progress percentage
  const caloriePct = calorieTarget > 0 ? Math.min((calorieTotal / calorieTarget) * 100, 100) : 0;
  // Protein progress percentage
  const proteinPct = proteinTarget > 0 ? Math.min((proteinTotal / proteinTarget) * 100, 100) : 0;

  // Decide motivational feedback message based on performance
  let feedbackTitle = "Keep Up the Work! ⚡";
  let feedbackMessage = "Not every day is perfect, but logging it is a massive win for consistency. Keep going!";
  let feedbackEmoji = "📊";
  let feedbackBadgeColor = "bg-zinc-800/60 border-zinc-700 text-zinc-300";

  if (!calorieExceeded && proteinTargetMet) {
    feedbackTitle = "Perfect Balance! 🏆";
    feedbackMessage = "Amazing job today! You smashed your protein target while staying perfectly within your calorie limit. Absolute legendary discipline!";
    feedbackEmoji = "🌟";
    feedbackBadgeColor = "bg-[#81b29a]/10 border-[#81b29a]/30 text-[#81b29a] shadow-[0_0_12px_rgba(129,178,154,0.15)]";
  } else if (calorieExceeded && proteinTargetMet) {
    feedbackTitle = "Muscle Builder Day 💪";
    feedbackMessage = "You hit your protein target! While you ended up in a calorie surplus today, those nutrients are fueling your muscle recovery. Rest up!";
    feedbackEmoji = "🍗";
    feedbackBadgeColor = "bg-[#1ed760]/10 border-[#1ed760]/30 text-[#1ed760]";
  } else if (!calorieExceeded && !proteinTargetMet) {
    feedbackTitle = "Clean & Under Budget 🥗";
    feedbackMessage = "You stayed nicely under your daily calorie target today. Next time, try to add a high-protein snack to reach your muscle fuel goals!";
    feedbackEmoji = "☘️";
    feedbackBadgeColor = "bg-blue-500/10 border-blue-500/30 text-blue-400";
  }

  return (
    <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-sm glass-panel p-6 rounded-3xl relative animate-slide-up">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 hover:bg-[#282421]/80 transition rounded-full cursor-pointer"
          aria-label="Close modal"
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
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="mx-auto flex h-12 w-12 items-center justify-center bg-[#282421] text-2xl mb-3 border border-white/5 rounded-full">
            {feedbackEmoji}
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white font-sans">
            Daily Report
          </h2>
          <p className="text-xs text-zinc-400 font-sans font-semibold mt-1">
            Recap for {new Date(summary.date + "T00:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric" })}
          </p>
        </div>

        {/* Side-by-side detailed cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {/* Calorie Stats Card */}
          <div className="glass-panel-accent p-4 rounded-2xl flex flex-col justify-between border border-white/5 bg-[#282421]/20">
            <div>
              <span className="text-[10px] font-semibold tracking-widest text-zinc-400 uppercase font-sans">
                Calories Eaten
              </span>
              <p className="text-xl font-bold tracking-tight text-white font-sans mt-1">
                {calorieTotal.toLocaleString()}
              </p>
              <p className="text-[10px] text-zinc-400 font-sans mt-0.5">
                Goal: {calorieTarget.toLocaleString()}
              </p>
            </div>
            
            <div className="mt-4">
              {/* Progress bar container */}
              <div className="h-2 w-full bg-zinc-850 rounded-full overflow-hidden mb-2">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    calorieExceeded
                      ? "bg-[#ef4444] shadow-[0_0_8px_rgba(231,111,81,0.4)]"
                      : "bg-[#1DB954]"
                  }`}
                  style={{ width: `${caloriePct}%` }}
                />
              </div>
              
              {calorieExceeded ? (
                <span className="text-[10px] font-semibold text-[#ef4444] font-sans flex items-center gap-0.5">
                  ⚠️ {calorieDiff.toLocaleString()} over
                </span>
              ) : (
                <span className="text-[10px] font-semibold text-[#81b29a] font-sans flex items-center gap-0.5">
                  ✓ {calorieDiff.toLocaleString()} left
                </span>
              )}
            </div>
          </div>

          {/* Protein Stats Card */}
          <div className="glass-panel-accent p-4 rounded-2xl flex flex-col justify-between border border-white/5 bg-[#282421]/20">
            <div>
              <span className="text-[10px] font-semibold tracking-widest text-zinc-400 uppercase font-sans">
                Protein Logged
              </span>
              <p className="text-xl font-bold tracking-tight text-white font-sans mt-1">
                {proteinTotal}g
              </p>
              <p className="text-[10px] text-zinc-400 font-sans mt-0.5">
                Goal: {proteinTarget}g
              </p>
            </div>

            <div className="mt-4">
              {/* Progress bar container */}
              <div className="h-2 w-full bg-zinc-855 rounded-full overflow-hidden mb-2">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    proteinTargetMet
                      ? "bg-[#81b29a] shadow-[0_0_8px_rgba(129,178,154,0.4)]"
                      : "bg-[#81b29a]/60"
                  }`}
                  style={{ width: `${proteinPct}%` }}
                />
              </div>

              {proteinTargetMet ? (
                <span className="text-[10px] font-semibold text-[#81b29a] font-sans flex items-center gap-0.5">
                  ✓ Goal hit!
                </span>
              ) : (
                <span className="text-[10px] font-semibold text-zinc-400 font-sans flex items-center gap-0.5">
                  ⚠️ {proteinDiff.toFixed(1)}g left
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Dynamic motivational feedback box */}
        <div className={`p-4 rounded-2xl border ${feedbackBadgeColor} mb-6 transition-all duration-300`}>
          <h3 className="text-xs font-semibold uppercase tracking-wider font-sans mb-1 flex items-center gap-1.5">
            {feedbackTitle}
          </h3>
          <p className="text-xs font-medium leading-relaxed text-zinc-200 font-sans">
            {feedbackMessage}
          </p>
        </div>

        {/* Goal completion checklist */}
        <div className="space-y-2 mb-6 border-t border-white/5 pt-4">
          <div className="flex items-center justify-between text-xs font-semibold font-sans">
            <span className="text-zinc-400">Calorie Target Status</span>
            {calorieExceeded ? (
              <span className="text-[#ef4444] bg-[#ef4444]/10 border border-[#ef4444]/20 px-2.5 py-0.5 rounded-full">
                Surplus Exceeded
              </span>
            ) : (
              <span className="text-[#81b29a] bg-[#81b29a]/10 border border-[#81b29a]/20 px-2.5 py-0.5 rounded-full">
                Under Budget ✓
              </span>
            )}
          </div>

          <div className="flex items-center justify-between text-xs font-semibold font-sans">
            <span className="text-zinc-400">Protein Target Status</span>
            {proteinTargetMet ? (
              <span className="text-[#81b29a] bg-[#81b29a]/10 border border-[#81b29a]/20 px-2.5 py-0.5 rounded-full">
                Goal Reached ✓
              </span>
            ) : (
              <span className="text-[#1ed760] bg-[#1ed760]/10 border border-[#1ed760]/20 px-2.5 py-0.5 rounded-full">
                Remaining Target
              </span>
            )}
          </div>
        </div>

        {/* Primary action close button */}
        <button
          onClick={onClose}
          className="w-full bg-[#1DB954] hover:bg-[#1ed760] py-3 text-sm font-semibold text-black transition active:scale-95 rounded-full shadow-md cursor-pointer text-center"
        >
          Got it, back to logs
        </button>
      </div>
    </div>
  );
}

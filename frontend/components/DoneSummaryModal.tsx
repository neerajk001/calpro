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

  const caloriePct = calorieTarget > 0 ? Math.min((calorieTotal / calorieTarget) * 100, 100) : 0;
  const proteinPct = proteinTarget > 0 ? Math.min((proteinTotal / proteinTarget) * 100, 100) : 0;

  let feedbackTitle = "Keep Up the Work! ⚡";
  let feedbackMessage = "Not every day is perfect, but logging it is a massive win for consistency.";
  let feedbackEmoji = "📊";
  let feedbackBg = "bg-[#F4F7EF] text-[#666666]";

  if (!calorieExceeded && proteinTargetMet) {
    feedbackTitle = "Perfect Balance! 🏆";
    feedbackMessage = "You smashed your protein target while staying within your calorie limit. Legendary discipline!";
    feedbackEmoji = "🌟";
    feedbackBg = "bg-[#EAF5D6] text-[#96CE4B]";
  } else if (calorieExceeded && proteinTargetMet) {
    feedbackTitle = "Muscle Builder Day 💪";
    feedbackMessage = "You hit your protein target! Those nutrients are fueling your muscle recovery. Rest up!";
    feedbackEmoji = "🍗";
    feedbackBg = "bg-[#EAF5D6] text-[#666666]";
  } else if (!calorieExceeded && !proteinTargetMet) {
    feedbackTitle = "Clean & Under Budget 🥗";
    feedbackMessage = "You stayed under your calorie target today. Add a high-protein snack to reach your muscle fuel goals!";
    feedbackEmoji = "☘️";
    feedbackBg = "bg-[#F4F7EF] text-[#666666]";
  }

  return (
    <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm card p-6 animate-slide-up relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#9A9A9A] hover:text-[#1F1F1F] p-1 hover:bg-[#F4F7EF] transition rounded-full cursor-pointer"
          aria-label="Close modal"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="text-center mb-6">
          <div className="mx-auto flex h-12 w-12 items-center justify-center bg-[#F4F7EF] text-2xl mb-3 rounded-full">{feedbackEmoji}</div>
          <h2 className="text-2xl font-bold tracking-tight text-[#1F1F1F]">Daily Report</h2>
          <p className="text-xs text-[#9A9A9A] font-semibold mt-1">
            {new Date(summary.date + "T00:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric" })}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-[#F4F7EF] p-4 rounded-2xl flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-semibold tracking-widest text-[#9A9A9A] uppercase">Calories Eaten</span>
              <p className="text-xl font-bold tracking-tight text-[#1F1F1F] mt-1">{calorieTotal.toLocaleString()}</p>
              <p className="text-[10px] text-[#9A9A9A] mt-0.5">Goal: {calorieTarget.toLocaleString()}</p>
            </div>
            <div className="mt-4">
              <div className="h-2 w-full bg-[#EAF5D6] rounded-full overflow-hidden mb-2">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${calorieExceeded ? "bg-[#F1A09C]" : "bg-[#96CE4B]"}`}
                  style={{ width: `${caloriePct}%` }}
                />
              </div>
              {calorieExceeded ? (
                <span className="text-[10px] font-semibold text-[#F1A09C]">+{calorieDiff.toLocaleString()} over</span>
              ) : (
                <span className="text-[10px] font-semibold text-[#8BC6A2]">{calorieDiff.toLocaleString()} left</span>
              )}
            </div>
          </div>

          <div className="bg-[#F4F7EF] p-4 rounded-2xl flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-semibold tracking-widest text-[#9A9A9A] uppercase">Protein Logged</span>
              <p className="text-xl font-bold tracking-tight text-[#1F1F1F] mt-1">{proteinTotal}g</p>
              <p className="text-[10px] text-[#9A9A9A] mt-0.5">Goal: {proteinTarget}g</p>
            </div>
            <div className="mt-4">
              <div className="h-2 w-full bg-[#EAF5D6] rounded-full overflow-hidden mb-2">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${proteinTargetMet ? "bg-[#8BC6A2]" : "bg-[#8BC6A2]/60"}`}
                  style={{ width: `${proteinPct}%` }}
                />
              </div>
              {proteinTargetMet ? (
                <span className="text-[10px] font-semibold text-[#8BC6A2]">✓ Goal hit!</span>
              ) : (
                <span className="text-[10px] font-semibold text-[#666666]">{proteinDiff.toFixed(1)}g left</span>
              )}
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-2xl ${feedbackBg} mb-6`}>
          <h3 className="text-xs font-semibold uppercase tracking-wider mb-1">{feedbackTitle}</h3>
          <p className="text-xs font-medium leading-relaxed">{feedbackMessage}</p>
        </div>

        <div className="space-y-2 mb-6 border-t border-[#F4F7EF] pt-4">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-[#9A9A9A]">Calorie Target</span>
            {calorieExceeded ? (
              <span className="text-[#F1A09C] bg-[#F1A09C]/10 px-2.5 py-0.5 rounded-full">Surplus Exceeded</span>
            ) : (
              <span className="text-[#8BC6A2] bg-[#8BC6A2]/10 px-2.5 py-0.5 rounded-full">Under Budget ✓</span>
            )}
          </div>
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-[#9A9A9A]">Protein Target</span>
            {proteinTargetMet ? (
              <span className="text-[#8BC6A2] bg-[#8BC6A2]/10 px-2.5 py-0.5 rounded-full">Goal Reached ✓</span>
            ) : (
              <span className="text-[#666666] bg-[#F4F7EF] px-2.5 py-0.5 rounded-full">Remaining Target</span>
            )}
          </div>
        </div>

        <button
          onClick={onClose}
          className="btn-primary w-full cursor-pointer"
        >
          Got it, back to logs
        </button>
      </div>
    </div>
  );
}

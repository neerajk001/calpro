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
  let feedbackBg = "bg-[#F4F7EF] text-[#4D4D4D]";

  if (!calorieExceeded && proteinTargetMet) {
    feedbackTitle = "Perfect Balance! 🏆";
    feedbackMessage = "You smashed your protein target while staying within your calorie limit. Legendary discipline!";
    feedbackEmoji = "🌟";
    feedbackBg = "bg-[#EFF6FF] border border-blue-100 text-[#2563EB]";
  } else if (calorieExceeded && proteinTargetMet) {
    feedbackTitle = "Muscle Builder Day 💪";
    feedbackMessage = "You hit your protein target! Those nutrients are fueling your muscle recovery. Rest up!";
    feedbackEmoji = "🍗";
    feedbackBg = "bg-[#EFF6FF] border border-blue-100 text-[#4B5563]";
  } else if (!calorieExceeded && !proteinTargetMet) {
    feedbackTitle = "Clean & Under Budget 🥗";
    feedbackMessage = "You stayed under your calorie target today. Add a high-protein snack to reach your muscle fuel goals!";
    feedbackEmoji = "☘️";
    feedbackBg = "bg-[#E5E7EB] border border-black/5 text-[#4B5563]";
  }

  return (
    <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm card p-6 animate-slide-up relative bg-white">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#6B7280] hover:text-[#111827] p-1.5 hover:bg-[#E5E7EB] transition rounded-full cursor-pointer"
          aria-label="Close modal"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="text-center mb-6">
          <div className="mx-auto flex h-12 w-12 items-center justify-center bg-[#E5E7EB] text-2xl mb-3 rounded-full">{feedbackEmoji}</div>
          <h2 className="text-2xl font-bold tracking-tight text-[#111827]">Daily Report</h2>
          <p className="text-xs text-[#6B7280] font-semibold mt-1">
            {new Date(summary.date + "T00:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric" })}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-[#F3F4F6] border border-black/5 p-4 rounded-2xl flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold tracking-wider text-[#6B7280] uppercase">Calories Eaten</span>
              <p className="text-xl font-black tracking-tight text-[#111827] mt-1">{calorieTotal.toLocaleString()}</p>
              <p className="text-[10px] text-[#6B7280] font-bold mt-0.5">Goal: {calorieTarget.toLocaleString()}</p>
            </div>
            <div className="mt-4">
              <div className="h-2 w-full bg-[#E5E7EB] rounded-full overflow-hidden mb-2">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${calorieExceeded ? "bg-[#EF4444]" : "bg-[#2563EB]"}`}
                  style={{ width: `${caloriePct}%` }}
                />
              </div>
              {calorieExceeded ? (
                <span className="text-xs font-bold text-[#EF4444]">+{calorieDiff.toLocaleString()} over</span>
              ) : (
                <span className="text-xs font-bold text-[#10B981]">{calorieDiff.toLocaleString()} left</span>
              )}
            </div>
          </div>

          <div className="bg-[#F3F4F6] border border-black/5 p-4 rounded-2xl flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold tracking-wider text-[#6B7280] uppercase">Protein Logged</span>
              <p className="text-xl font-black tracking-tight text-[#111827] mt-1">{proteinTotal}g</p>
              <p className="text-[10px] text-[#6B7280] font-bold mt-0.5">Goal: {proteinTarget}g</p>
            </div>
            <div className="mt-4">
              <div className="h-2 w-full bg-[#E5E7EB] rounded-full overflow-hidden mb-2">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${proteinTargetMet ? "bg-[#10B981]" : "bg-[#10B981]/50"}`}
                  style={{ width: `${proteinPct}%` }}
                />
              </div>
              {proteinTargetMet ? (
                <span className="text-xs font-bold text-[#10B981]">✓ Goal hit!</span>
              ) : (
                <span className="text-xs font-bold text-[#4B5563]">{proteinDiff.toFixed(1)}g left</span>
              )}
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-2xl ${feedbackBg} mb-6`}>
          <h3 className="text-xs font-bold uppercase tracking-wider mb-1">{feedbackTitle}</h3>
          <p className="text-xs font-medium leading-relaxed">{feedbackMessage}</p>
        </div>

        <div className="space-y-2 mb-6 border-t border-black/5 pt-4">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-[#6B7280]">Calorie Target</span>
            {calorieExceeded ? (
              <span className="text-[#EF4444] bg-[#EF4444]/10 px-2.5 py-0.5 rounded-full">Surplus Exceeded</span>
            ) : (
              <span className="text-[#10B981] bg-[#10B981]/10 px-2.5 py-0.5 rounded-full">Under Budget ✓</span>
            )}
          </div>
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-[#6B7280]">Protein Target</span>
            {proteinTargetMet ? (
              <span className="text-[#10B981] bg-[#10B981]/10 px-2.5 py-0.5 rounded-full">Goal Reached ✓</span>
            ) : (
              <span className="text-[#4B5563] bg-[#E5E7EB] px-2.5 py-0.5 rounded-full">Remaining Target</span>
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

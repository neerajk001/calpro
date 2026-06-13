"use client";

import { useApp } from "@/lib/AppContext";
import { useRouter } from "next/navigation";

function getLocalDateString(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function HistoryPage() {
  const router = useRouter();
  const { foods, settings, hydrated, getDaySummary } = useApp();

  // Generate the last 14 calendar days
  const historyDays = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return getLocalDateString(d);
  });

  const handleDayTap = (dateStr: string) => {
    router.push(`/?date=${dateStr}`);
  };

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 pt-6 select-none pb-24 font-sans">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-extrabold tracking-tight text-white font-sans">
          History Timeline
        </h1>
        <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">
          Last 14 Days
        </span>
      </div>

      {!hydrated ? (
        <div className="space-y-4 animate-pulse">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="h-28 rounded-2xl bg-slate-900/40 border border-white/5" />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-3.5">
          {historyDays.map((dateStr) => {
            const summary = getDaySummary(dateStr);
            const calorieExceeded = summary.totalCalories > settings.dailyCalorieTarget;
            
            const calPct = Math.min(100, (summary.totalCalories / settings.dailyCalorieTarget) * 100);
            const protPct = Math.min(100, (summary.totalProtein / settings.dailyProteinTarget) * 100);

            const dObj = new Date(dateStr + "T00:00:00");
            const formattedDayName = dObj.toLocaleDateString("en-US", { weekday: "short" });
            const formattedDateText = dObj.toLocaleDateString("en-US", { month: "short", day: "numeric" });

            // Unique tags list to display categories logged on this day
            const dayTags = Array.from(new Set(summary.entries.map((e) => e.tag)));

            return (
              <div
                key={dateStr}
                onClick={() => handleDayTap(dateStr)}
                className="group cursor-pointer rounded-2xl border border-white/5 bg-slate-900/40 p-4 transition duration-200 hover:bg-slate-900/60 hover:border-white/10 hover:shadow-lg active:scale-[0.99]"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-tight group-hover:text-[#F97316] transition">
                      {formattedDayName}, {formattedDateText}
                    </h3>
                    {dayTags.length > 0 ? (
                      <div className="flex gap-1.5 mt-1">
                        {dayTags.map((tag) => (
                          <span
                            key={tag}
                            className={`rounded px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider ${
                              tag === "junk"
                                ? "bg-red-500/10 text-red-400 border border-red-500/20"
                                : "bg-white/5 text-[#94A3B8]"
                            }`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-600 font-semibold tracking-wide">No items logged</span>
                    )}
                  </div>
                  
                  <div className="text-right">
                    <p className={`text-sm font-extrabold ${calorieExceeded ? "text-red-400" : "text-white"}`}>
                      {summary.totalCalories.toLocaleString()} <span className="text-xs text-[#94A3B8] font-normal">/ {settings.dailyCalorieTarget.toLocaleString()} kcal</span>
                    </p>
                    <p className="text-xs font-bold text-[#22C55E] mt-0.5">
                      {summary.totalProtein}g <span className="text-[10px] text-[#94A3B8] font-normal">/ {settings.dailyProteinTarget}g protein</span>
                    </p>
                  </div>
                </div>

                {/* Double Progress bars */}
                {summary.entries.length > 0 && (
                  <div className="space-y-2 pt-1">
                    {/* Calorie Bar */}
                    <div>
                      <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                        <div
                          style={{ width: `${calPct}%` }}
                          className={`h-full rounded-full transition-all duration-500 ${
                            calorieExceeded ? "bg-red-500" : "bg-[#F97316]"
                          }`}
                        />
                      </div>
                    </div>

                    {/* Protein Bar */}
                    <div>
                      <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
                        <div
                          style={{ width: `${protPct}%` }}
                          className="h-full rounded-full bg-[#22C55E] transition-all duration-500"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

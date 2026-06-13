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
    <div className="mx-auto flex max-w-md flex-col px-4 pt-6 select-none pb-24 font-sans text-white">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold tracking-tight text-white font-sans">
          History Timeline
        </h1>
        <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
          Last 14 Days
        </span>
      </div>

      {!hydrated ? (
        <div className="space-y-4 animate-pulse">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="h-28 bg-[#181818] border border-white/5 rounded-lg" />
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

            const dayTags = Array.from(new Set(summary.entries.map((e) => e.tag)));

            return (
              <div
                key={dateStr}
                onClick={() => handleDayTap(dateStr)}
                className="group cursor-pointer border border-white/5 bg-[#181818] p-4 transition duration-205 hover:bg-[#282828] hover:border-white/10 hover:shadow-md active:scale-[0.99] rounded-lg"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-base font-bold text-white tracking-tight group-hover:text-[#1DB954] transition font-sans">
                      {formattedDayName}, {formattedDateText}
                    </h3>
                    {dayTags.length > 0 ? (
                      <div className="flex gap-1.5 mt-1.5 flex-wrap">
                        {dayTags.map((tag) => (
                          <span
                            key={tag}
                            className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-full ${
                              tag === "junk"
                                ? "bg-red-500/10 text-red-400 border border-red-500/20"
                                : "bg-zinc-800 text-zinc-400 border border-white/5"
                            }`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-zinc-550 font-semibold tracking-wide">No items logged</span>
                    )}
                  </div>
                  
                  <div className="text-right">
                    <p className={`text-base font-extrabold ${calorieExceeded ? "text-red-400" : "text-white"}`}>
                      {summary.totalCalories.toLocaleString()} <span className="text-xs text-zinc-400 font-normal">/ {settings.dailyCalorieTarget.toLocaleString()} kcal</span>
                    </p>
                    <p className="text-sm font-bold text-[#1DB954] mt-0.5">
                      {summary.totalProtein}g <span className="text-[10px] text-zinc-400 font-normal">/ {settings.dailyProteinTarget}g protein</span>
                    </p>
                  </div>
                </div>

                {/* Double Progress bars */}
                {summary.entries.length > 0 && (
                  <div className="space-y-2 pt-1">
                    {/* Calorie Bar */}
                    <div>
                      <div className="h-2 w-full bg-[#282828] overflow-hidden rounded-full border border-white/5">
                        <div
                          style={{ width: `${calPct}%` }}
                          className={`h-full transition-all duration-500 rounded-full ${
                            calorieExceeded ? "bg-red-500" : "bg-[#F97316]"
                          }`}
                        />
                      </div>
                    </div>

                    {/* Protein Bar */}
                    <div>
                      <div className="h-1.5 w-full bg-[#282828] overflow-hidden rounded-full border border-white/5">
                        <div
                          style={{ width: `${protPct}%` }}
                          className="h-full bg-[#1DB954] transition-all duration-500 rounded-full"
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

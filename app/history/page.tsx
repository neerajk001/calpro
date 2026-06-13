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
    <div className="mx-auto flex max-w-md flex-col px-4 pt-6 select-none pb-24 font-sans text-stone-900">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-serif font-bold tracking-tight text-stone-950">
          History Timeline
        </h1>
        <span className="text-xs font-bold text-[#78716C] uppercase tracking-widest">
          Last 14 Days
        </span>
      </div>

      {!hydrated ? (
        <div className="space-y-4 animate-pulse">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="h-28 bg-white border border-stone-200 rounded-none" />
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
                className="group cursor-pointer border-[1.5px] border-stone-200 bg-white p-4 transition duration-205 hover:bg-stone-50/50 hover:border-stone-400 hover:shadow-xs active:scale-[0.99] rounded-none"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-base font-serif font-bold text-stone-900 tracking-tight group-hover:text-[#D97706] transition">
                      {formattedDayName}, {formattedDateText}
                    </h3>
                    {dayTags.length > 0 ? (
                      <div className="flex gap-1.5 mt-1.5">
                        {dayTags.map((tag) => (
                          <span
                            key={tag}
                            className={`px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-none ${
                              tag === "junk"
                                ? "bg-red-500/10 text-red-750 border border-red-500/20"
                                : "bg-stone-100 text-[#78716C] border border-stone-200"
                            }`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-stone-400 font-semibold tracking-wide">No items logged</span>
                    )}
                  </div>
                  
                  <div className="text-right">
                    <p className={`text-base font-extrabold ${calorieExceeded ? "text-red-650" : "text-stone-900"}`}>
                      {summary.totalCalories.toLocaleString()} <span className="text-xs text-[#78716C] font-normal">/ {settings.dailyCalorieTarget.toLocaleString()} kcal</span>
                    </p>
                    <p className="text-sm font-bold text-[#16A34A] mt-0.5">
                      {summary.totalProtein}g <span className="text-[10px] text-[#78716C] font-normal">/ {settings.dailyProteinTarget}g protein</span>
                    </p>
                  </div>
                </div>

                {/* Double Progress bars */}
                {summary.entries.length > 0 && (
                  <div className="space-y-2 pt-1">
                    {/* Calorie Bar */}
                    <div>
                      <div className="h-2 w-full bg-stone-100 overflow-hidden rounded-none border border-stone-200/40">
                        <div
                          style={{ width: `${calPct}%` }}
                          className={`h-full transition-all duration-500 rounded-none ${
                            calorieExceeded ? "bg-red-600" : "bg-[#D97706]"
                          }`}
                        />
                      </div>
                    </div>

                    {/* Protein Bar */}
                    <div>
                      <div className="h-1.5 w-full bg-stone-100 overflow-hidden rounded-none border border-stone-200/40">
                        <div
                          style={{ width: `${protPct}%` }}
                          className="h-full bg-[#16A34A] transition-all duration-500 rounded-none"
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

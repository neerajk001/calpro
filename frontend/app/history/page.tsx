"use client";

import { useState, useMemo } from "react";
import { useApp } from "@/lib/AppContext";
import { useRouter } from "next/navigation";

function getLocalDateString(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function HistoryPage() {
  const router = useRouter();
  const { foods, settings, hydrated, getDaySummary } = useApp();
  const [chartDaysRange, setChartDaysRange] = useState<7 | 14>(7);

  const chartDays = useMemo(() => {
    return Array.from({ length: chartDaysRange }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return getLocalDateString(d);
    }).reverse();
  }, [chartDaysRange]);

  const chartData = useMemo(() => {
    return chartDays.map((dateStr) => {
      const sum = getDaySummary(dateStr);
      const dObj = new Date(dateStr + "T00:00:00");
      return { dateStr, dayLabel: dObj.toLocaleDateString("en-US", { weekday: "narrow" }), calories: sum.totalCalories, protein: sum.totalProtein };
    });
  }, [chartDays, getDaySummary]);

  const maxCalVal = useMemo(() => {
    const maxVal = Math.max(...chartData.map((d) => d.calories), settings.dailyCalorieTarget || 2000);
    return maxVal * 1.15;
  }, [chartData, settings.dailyCalorieTarget]);

  const historyDays = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return getLocalDateString(d);
  });

  const handleDayTap = (dateStr: string) => { router.push(`/?date=${dateStr}`); };

  return (
    <div className="relative min-h-full select-none text-[#1F1F1F]">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight">History Timeline</h1>
        <span className="text-xs font-semibold text-[#9A9A9A] uppercase tracking-widest">Last 14 Days</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-4">
          {hydrated && (
            <div className="card p-5">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-[#9A9A9A]">Calorie Trends</h3>
                <div className="flex bg-[#F4F7EF] p-0.5 rounded-full">
                  <button onClick={() => setChartDaysRange(7)} className={`px-3 py-1 text-[9px] font-semibold rounded-full transition cursor-pointer ${chartDaysRange === 7 ? "bg-[#96CE4B] text-white" : "text-[#9A9A9A] hover:text-[#1F1F1F]"}`}>7 Days</button>
                  <button onClick={() => setChartDaysRange(14)} className={`px-3 py-1 text-[9px] font-semibold rounded-full transition cursor-pointer ${chartDaysRange === 14 ? "bg-[#96CE4B] text-white" : "text-[#9A9A9A] hover:text-[#1F1F1F]"}`}>14 Days</button>
                </div>
              </div>

              <div className="h-36 flex items-end justify-between gap-1.5 pt-6 px-1 relative">
                <div className="absolute left-0 right-0 border-t border-dashed border-[#96CE4B]/30 flex items-center pointer-events-none" style={{ bottom: `${(settings.dailyCalorieTarget / maxCalVal) * 100}%` }}>
                  <span className="bg-[#F8FBF4] px-1 text-[8px] font-semibold text-[#96CE4B] -mt-2.5">Goal: {settings.dailyCalorieTarget}</span>
                </div>

                {chartData.map((d) => {
                  const heightPct = (d.calories / maxCalVal) * 100;
                  const isTargetExceeded = d.calories > settings.dailyCalorieTarget;
                  return (
                    <div key={d.dateStr} onClick={() => handleDayTap(d.dateStr)} className="flex-1 flex flex-col items-center gap-2 cursor-pointer group">
                      <div className="absolute top-1 bg-[#FFFFFF] card px-1.5 py-0.5 rounded text-[8px] font-semibold text-[#1F1F1F] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none tabular-nums shadow-md z-10">{d.calories} kcal</div>
                      <div className="w-full relative bg-[#F4F7EF] rounded-t-sm overflow-hidden min-h-[4px]" style={{ height: `${Math.max(4, heightPct)}%` }}>
                        <div className={`absolute inset-0 transition-colors ${isTargetExceeded ? "bg-[#F1A09C]" : d.calories > 0 ? "bg-[#96CE4B]" : "bg-[#F4F7EF]"}`} />
                      </div>
                      <span className="text-[9px] font-semibold text-[#9A9A9A] uppercase group-hover:text-[#1F1F1F] transition">{d.dayLabel}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-7">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#9A9A9A] lg:block hidden">Daily Summaries</h2>

          {!hydrated ? (
            <div className="space-y-4 animate-pulse">
              {Array.from({ length: 3 }).map((_, idx) => <div key={idx} className="h-28 bg-[#F4F7EF] rounded-2xl" />)}
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
                  <div key={dateStr} onClick={() => handleDayTap(dateStr)} className="group cursor-pointer card p-4.5 transition hover:bg-[#F8FBF4] active:scale-[0.995] rounded-2xl">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-sm md:text-base font-semibold text-[#1F1F1F] tracking-tight group-hover:text-[#96CE4B] transition">{formattedDayName}, {formattedDateText}</h3>
                        {dayTags.length > 0 ? (
                          <div className="flex gap-1.5 mt-2 flex-wrap">
                            {dayTags.map((tag) => (
                              <span key={tag} className={`px-2 py-0.5 text-[8px] font-semibold uppercase tracking-wider rounded-full ${tag === "junk" ? "bg-[#F1A09C]/10 text-[#F1A09C]" : "bg-[#F4F7EF] text-[#666666]"}`}>{tag}</span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[10px] text-[#9A9A9A] font-semibold uppercase tracking-wider mt-1.5 block">No items logged</span>
                        )}
                      </div>
                      <div className="text-right">
                        <p className={`text-sm md:text-base font-bold ${calorieExceeded ? "text-[#F1A09C]" : "text-[#1F1F1F]"}`}>{summary.totalCalories.toLocaleString()} <span className="text-[10px] text-[#9A9A9A] font-normal">/ {settings.dailyCalorieTarget.toLocaleString()} kcal</span></p>
                        <p className="text-xs font-semibold text-[#8BC6A2] mt-0.5">{summary.totalProtein}g <span className="text-[9px] text-[#9A9A9A] font-normal">/ {settings.dailyProteinTarget}g protein</span></p>
                      </div>
                    </div>

                    {summary.entries.length > 0 && (
                      <div className="space-y-2 pt-1">
                        <div className="h-2 w-full bg-[#F4F7EF] overflow-hidden rounded-full">
                          <div style={{ width: `${calPct}%` }} className={`h-full transition-all duration-500 rounded-full ${calorieExceeded ? "bg-[#F1A09C]" : "bg-[#96CE4B]"}`} />
                        </div>
                        <div className="h-1.5 w-full bg-[#F4F7EF] overflow-hidden rounded-full">
                          <div style={{ width: `${protPct}%` }} className="h-full bg-[#8BC6A2] transition-all duration-500 rounded-full" />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

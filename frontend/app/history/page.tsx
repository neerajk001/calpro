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
    <div className="relative min-h-full select-none text-[#111827]">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight">History Timeline</h1>
        <span className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">Last 14 Days</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-4">
          {hydrated && (
            <div className="card p-4 md:p-5">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#6B7280]">Calorie Trends</h3>
                <div className="flex bg-[#E5E7EB] p-0.5 rounded-full border border-black/5">
                  <button onClick={() => setChartDaysRange(7)} className={`px-3 py-1.5 text-[11px] font-bold rounded-full transition cursor-pointer ${chartDaysRange === 7 ? "bg-[#2563EB] text-white" : "text-[#6B7280] hover:text-[#111827]"}`}>7 Days</button>
                  <button onClick={() => setChartDaysRange(14)} className={`px-3 py-1.5 text-[11px] font-bold rounded-full transition cursor-pointer ${chartDaysRange === 14 ? "bg-[#2563EB] text-white" : "text-[#6B7280] hover:text-[#111827]"}`}>14 Days</button>
                </div>
              </div>

              <div className="h-36 flex items-end justify-between gap-1.5 pt-6 px-1 relative">
                <div className="absolute left-0 right-0 border-t border-dashed border-[#2563EB]/20 flex items-center pointer-events-none" style={{ bottom: `${(settings.dailyCalorieTarget / maxCalVal) * 100}%` }}>
                  <span className="bg-[#F3F4F6] px-1 text-[10px] font-bold text-[#2563EB] -mt-2.5">Goal: {settings.dailyCalorieTarget}</span>
                </div>

                {chartData.map((d) => {
                  const heightPct = (d.calories / maxCalVal) * 100;
                  const isTargetExceeded = d.calories > settings.dailyCalorieTarget;
                  return (
                    <div key={d.dateStr} onClick={() => handleDayTap(d.dateStr)} className="flex-1 flex flex-col items-center gap-2 cursor-pointer group">
                      <div className="absolute top-1 bg-[#FFFFFF] card px-1.5 py-0.5 rounded text-[10px] font-bold text-[#111827] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none tabular-nums shadow-md z-10">{d.calories} kcal</div>
                      <div className="w-full relative bg-[#E5E7EB] rounded-t-sm overflow-hidden min-h-[4px]" style={{ height: `${Math.max(4, heightPct)}%` }}>
                        <div className={`absolute inset-0 transition-colors ${isTargetExceeded ? "bg-[#EF4444]" : d.calories > 0 ? "bg-[#2563EB]" : "bg-[#E5E7EB]"}`} />
                      </div>
                      <span className="text-[10px] font-bold text-[#6B7280] uppercase group-hover:text-[#111827] transition">{d.dayLabel}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-7">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-[#6B7280] lg:block hidden">Daily Summaries</h2>

          {!hydrated ? (
            <div className="space-y-4 animate-pulse">
              {Array.from({ length: 3 }).map((_, idx) => <div key={idx} className="h-28 bg-[#E5E7EB] rounded-2xl" />)}
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
                  <div key={dateStr} onClick={() => handleDayTap(dateStr)} className="group cursor-pointer card p-3.5 md:p-4.5 transition hover:bg-white hover:border-blue-600/10 hover:shadow-md active:scale-[0.995] rounded-2xl bg-white">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-sm md:text-base font-bold text-[#111827] tracking-tight group-hover:text-[#2563EB] transition">{formattedDayName}, {formattedDateText}</h3>
                        {dayTags.length > 0 ? (
                          <div className="flex gap-1.5 mt-2 flex-wrap">
                            {dayTags.map((tag) => (
                              <span key={tag} className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-full border ${tag === "junk" ? "bg-red-50 text-[#EF4444] border-red-100" : "bg-[#E5E7EB] text-[#4B5563] border-black/5"}`}>{tag}</span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[10px] text-[#6B7280] font-bold uppercase tracking-wider mt-1.5 block">No items logged</span>
                        )}
                      </div>
                      <div className="text-right">
                        <p className={`text-sm md:text-base font-extrabold ${calorieExceeded ? "text-[#EF4444]" : "text-[#111827]"}`}>{summary.totalCalories.toLocaleString()} <span className="text-xs text-[#6B7280] font-normal">/ {settings.dailyCalorieTarget.toLocaleString()} kcal</span></p>
                        <p className="text-xs font-bold text-[#10B981] mt-0.5">{summary.totalProtein}g <span className="text-[10px] text-[#6B7280] font-normal">/ {settings.dailyProteinTarget}g protein</span></p>
                      </div>
                    </div>

                    {summary.entries.length > 0 && (
                      <div className="space-y-2 pt-1">
                        <div className="h-2 w-full bg-[#E5E7EB] overflow-hidden rounded-full">
                          <div style={{ width: `${calPct}%` }} className={`h-full transition-all duration-500 rounded-full ${calorieExceeded ? "bg-[#EF4444]" : "bg-[#2563EB]"}`} />
                        </div>
                        <div className="h-1.5 w-full bg-[#E5E7EB] overflow-hidden rounded-full">
                          <div style={{ width: `${protPct}%` }} className="h-full bg-[#10B981] transition-all duration-500 rounded-full" />
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

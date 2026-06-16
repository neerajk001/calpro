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

  // Generate date strings for chart (in chronological order)
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
      return {
        dateStr,
        dayLabel: dObj.toLocaleDateString("en-US", { weekday: "narrow" }),
        calories: sum.totalCalories,
        protein: sum.totalProtein,
      };
    });
  }, [chartDays, getDaySummary]);

  // Find max calorie to scale bar heights
  const maxCalVal = useMemo(() => {
    const maxVal = Math.max(...chartData.map((d) => d.calories), settings.dailyCalorieTarget || 2000);
    return maxVal * 1.15; // add 15% headroom
  }, [chartData, settings.dailyCalorieTarget]);

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
    <div className="relative min-h-full select-none font-sans text-[#f5f2eb]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white font-sans">
          History Timeline
        </h1>
        <span className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">
          Last 14 Days
        </span>
      </div>

      {/* Responsive Grid System */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        
        {/* Left Column: Calorie Trends Chart (Sticky on desktop) */}
        <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-4">
          {hydrated && (
            <div className="glass-panel p-5 rounded-2xl">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-500 font-sans">Calorie Trends</h3>
                <div className="flex glass-panel-accent p-0.5 rounded-full shadow-inner">
                  <button
                    onClick={() => setChartDaysRange(7)}
                    className={`px-3 py-1 text-[9px] font-semibold rounded-full transition cursor-pointer ${
                      chartDaysRange === 7 ? "bg-[#1DB954] text-[#161413]" : "text-zinc-500 hover:text-white"
                    }`}
                  >
                    7 Days
                  </button>
                  <button
                    onClick={() => setChartDaysRange(14)}
                    className={`px-3 py-1 text-[9px] font-semibold rounded-full transition cursor-pointer ${
                      chartDaysRange === 14 ? "bg-[#1DB954] text-[#161413]" : "text-zinc-500 hover:text-white"
                    }`}
                  >
                    14 Days
                  </button>
                </div>
              </div>

              {/* Bars Container */}
              <div className="h-36 flex items-end justify-between gap-1.5 pt-6 px-1 relative">
                {/* Target Calorie Line */}
                <div
                  className="absolute left-0 right-0 border-t border-dashed border-[#1DB954]/30 flex items-center pointer-events-none"
                  style={{
                    bottom: `${(settings.dailyCalorieTarget / maxCalVal) * 100}%`,
                  }}
                >
                  <span className="bg-[#161413] px-1 text-[8px] font-semibold text-[#1DB954]/80 -mt-2.5 font-mono">
                    Goal: {settings.dailyCalorieTarget}
                  </span>
                </div>

                {chartData.map((d) => {
                  const heightPct = (d.calories / maxCalVal) * 100;
                  const isTargetExceeded = d.calories > settings.dailyCalorieTarget;
                  
                  return (
                    <div
                      key={d.dateStr}
                      onClick={() => handleDayTap(d.dateStr)}
                      className="flex-1 flex flex-col items-center gap-2 cursor-pointer group"
                    >
                      {/* Tooltip on hover */}
                      <div className="absolute top-1 bg-[#282421] border border-white/[0.04] px-1.5 py-0.5 rounded text-[8px] font-semibold text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none tabular-nums font-sans shadow-md z-10">
                        {d.calories} kcal
                      </div>
                      {/* Bar */}
                      <div className="w-full relative bg-[#282421] rounded-t-sm overflow-hidden min-h-[4px]" style={{ height: `${Math.max(4, heightPct)}%` }}>
                        <div className={`absolute inset-0 transition-colors ${
                          isTargetExceeded 
                            ? "bg-[#ef4444] shadow-[0_0_8px_rgba(231,111,81,0.3)]" 
                            : d.calories > 0 
                              ? "bg-[#1DB954] shadow-[0_0_8px_rgba(224,122,95,0.3)]"
                              : "bg-[#282421]"
                        }`} />
                      </div>
                      {/* Label */}
                      <span className="text-[9px] font-semibold text-zinc-500 uppercase font-sans group-hover:text-white transition">
                        {d.dayLabel}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Historical logs timeline */}
        <div className="lg:col-span-7">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-500 font-sans lg:block hidden">
            Daily Summaries
          </h2>

          {!hydrated ? (
            <div className="space-y-4 animate-pulse">
              {Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx} className="h-28 bg-[#201c1a] border border-white/[0.04] rounded-2xl" />
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
                    className="group cursor-pointer glass-panel p-4.5 transition duration-150 hover:bg-white/[0.015] hover:border-white/[0.08] hover:shadow-md active:scale-[0.995] rounded-2xl"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-sm md:text-base font-semibold text-white tracking-tight group-hover:text-[#1DB954] transition font-sans">
                          {formattedDayName}, {formattedDateText}
                        </h3>
                        {dayTags.length > 0 ? (
                          <div className="flex gap-1.5 mt-2 flex-wrap">
                            {dayTags.map((tag) => (
                              <span
                                key={tag}
                                className={`px-2 py-0.5 text-[8px] font-semibold uppercase tracking-wider rounded-full ${
                                  tag === "junk"
                                    ? "bg-red-500/10 text-red-405 border border-red-500/20"
                                    : "bg-[#282421] text-zinc-400 border border-white/[0.04]"
                                }`}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[10px] text-zinc-550 font-semibold uppercase tracking-wider mt-1.5 block">No items logged</span>
                        )}
                      </div>
                      
                      <div className="text-right">
                        <p className={`text-sm md:text-base font-bold ${calorieExceeded ? "text-[#ef4444]" : "text-white"}`}>
                          {summary.totalCalories.toLocaleString()} <span className="text-[10px] text-zinc-400 font-normal">/ {settings.dailyCalorieTarget.toLocaleString()} kcal</span>
                        </p>
                        <p className="text-xs font-semibold text-[#81b29a] mt-0.5">
                          {summary.totalProtein}g <span className="text-[9px] text-zinc-400 font-normal">/ {settings.dailyProteinTarget}g protein</span>
                        </p>
                      </div>
                    </div>

                    {/* Double Progress bars */}
                    {summary.entries.length > 0 && (
                      <div className="space-y-2 pt-1">
                        {/* Calorie Bar */}
                        <div>
                          <div className="h-2 w-full bg-[#282421]/50 overflow-hidden rounded-full border border-white/[0.04]">
                            <div
                              style={{ width: `${calPct}%` }}
                              className={`h-full transition-all duration-500 rounded-full ${
                                calorieExceeded ? "bg-[#ef4444]" : "bg-[#1DB954]"
                              }`}
                            />
                          </div>
                        </div>

                        {/* Protein Bar */}
                        <div>
                          <div className="h-1.5 w-full bg-[#282421]/50 overflow-hidden rounded-full border border-white/[0.04]">
                            <div
                              style={{ width: `${protPct}%` }}
                              className="h-full bg-[#81b29a] transition-all duration-500 rounded-full"
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
      </div>
    </div>
  );
}

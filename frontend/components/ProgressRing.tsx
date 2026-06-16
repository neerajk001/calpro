"use client";

import { useEffect, useState } from "react";

interface ProgressRingProps {
  size: number;
  strokeWidth: number;
  progress: number;
  color: string;
  bgColor: string;
  glowColor?: string;
}

function ProgressRing({
  size,
  strokeWidth,
  progress,
  color,
  bgColor,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const [offset, setOffset] = useState(circumference);

  useEffect(() => {
    const clampedProgress = Math.max(0, Math.min(progress, 1));
    setOffset(circumference - clampedProgress * circumference);
  }, [progress, circumference]);

  return (
    <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={bgColor}
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-[stroke-dashoffset] duration-700 ease-out"
      />
    </svg>
  );
}

export function DualProgressRing({
  calorieProgress,
  proteinProgress,
  calorieTotal,
  calorieTarget,
  proteinTotal,
  proteinTarget,
}: {
  calorieProgress: number;
  proteinProgress: number;
  calorieTotal: number;
  calorieTarget: number;
  proteinTotal: number;
  proteinTarget: number;
}) {
  const calorieExceeded = calorieTotal > calorieTarget;
  const calorieTargetMet = calorieTotal >= calorieTarget;
  const proteinTargetMet = proteinTotal >= proteinTarget;

  const calorieRingColor = calorieExceeded ? "#EF4444" : "#2563EB";
  const calorieDiff = calorieTotal - calorieTarget;
  const proteinDiff = proteinTotal - proteinTarget;
  const caloriesRemaining = calorieTarget - calorieTotal;

  return (
    <div className="relative mx-auto w-fit select-none">
      {/* Calorie ring (outer) */}
      <ProgressRing
        size={210}
        strokeWidth={12}
        progress={calorieProgress}
        color={calorieRingColor}
        bgColor="#E5E7EB"
      />
      {/* Protein ring (inner) */}
      <div className="absolute inset-0 flex items-center justify-center">
        <ProgressRing
          size={168}
          strokeWidth={10}
          progress={proteinProgress}
          color="#10B981"
          bgColor="#E5E7EB"
        />
      </div>
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-[10px] font-bold tracking-widest text-[#6B7280] uppercase">Calories</span>
        <span className={`text-[32px] font-black tracking-tight tabular-nums mt-0.5 leading-none ${calorieExceeded ? "text-[#EF4444]" : "text-[#111827]"}`}>
          {calorieTotal.toLocaleString()}
        </span>
        {calorieExceeded ? (
          <span className="text-[11px] font-semibold text-[#EF4444] mt-0.5">
            +{calorieDiff.toLocaleString()} kcal over
          </span>
        ) : (
          <span className="text-xs text-[#6B7280] font-semibold mt-0.5">
            {calorieTargetMet ? "Goal met! 🎉" : `${caloriesRemaining.toLocaleString()} left`}
          </span>
        )}

        <div className="mt-2.5 w-12 h-px bg-[#E5E7EB]" />

        <span className={`mt-2 text-lg font-bold tracking-tight tabular-nums ${proteinTargetMet ? "text-[#10B981]" : "text-[#111827]"}`}>
          {proteinTotal}g
        </span>
        {proteinTargetMet ? (
          <span className="text-[10px] font-bold text-[#10B981] uppercase tracking-wider">
            +{proteinDiff.toFixed(1)}g over
          </span>
        ) : (
          <span className="text-[10px] text-[#6B7280] uppercase tracking-wider font-bold">
            {(proteinTarget - proteinTotal).toFixed(1)}g left
          </span>
        )}
      </div>
    </div>
  );
}

export function ProgressSkeleton() {
  return (
    <div className="relative mx-auto w-fit animate-pulse-slow">
      <div className="h-[210px] w-[210px] rounded-full border-[12px] border-[#E5E7EB] bg-[#F3F4F6] flex items-center justify-center">
        <div className="h-[168px] w-[168px] rounded-full border-[10px] border-[#E5E7EB] bg-[#F3F4F6]" />
      </div>
    </div>
  );
}

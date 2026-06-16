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

  const calorieRingColor = calorieExceeded ? "#F1A09C" : "#96CE4B";
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
        bgColor="#F4F7EF"
      />
      {/* Protein ring (inner) */}
      <div className="absolute inset-0 flex items-center justify-center">
        <ProgressRing
          size={168}
          strokeWidth={10}
          progress={proteinProgress}
          color="#8BC6A2"
          bgColor="#F4F7EF"
        />
      </div>
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-[10px] font-semibold tracking-widest text-[#9A9A9A] uppercase">Calories</span>
        <span className={`text-[32px] font-extrabold tracking-tight tabular-nums mt-0.5 leading-none ${calorieExceeded ? "text-[#F1A09C]" : "text-[#1F1F1F]"}`}>
          {calorieTotal.toLocaleString()}
        </span>
        {calorieExceeded ? (
          <span className="text-[11px] font-semibold text-[#F1A09C] mt-0.5">
            +{calorieDiff.toLocaleString()} kcal over
          </span>
        ) : (
          <span className="text-[10px] text-[#9A9A9A] font-medium mt-0.5">
            {calorieTargetMet ? "Goal met! 🎉" : `${caloriesRemaining.toLocaleString()} left`}
          </span>
        )}

        <div className="mt-2.5 w-12 h-px bg-[#F4F7EF]" />

        <span className={`mt-2 text-lg font-semibold tracking-tight tabular-nums ${proteinTargetMet ? "text-[#8BC6A2]" : "text-[#1F1F1F]"}`}>
          {proteinTotal}g
        </span>
        {proteinTargetMet ? (
          <span className="text-[9px] font-semibold text-[#8BC6A2] uppercase tracking-wider">
            +{proteinDiff.toFixed(1)}g over
          </span>
        ) : (
          <span className="text-[9px] text-[#9A9A9A] uppercase tracking-wider font-medium">
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
      <div className="h-[210px] w-[210px] rounded-full border-[12px] border-[#F4F7EF] bg-[#F8FBF4] flex items-center justify-center">
        <div className="h-[168px] w-[168px] rounded-full border-[10px] border-[#F4F7EF] bg-[#F8FBF4]" />
      </div>
    </div>
  );
}

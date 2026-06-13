"use client";

import { useEffect, useState } from "react";

interface ProgressRingProps {
  size: number;
  strokeWidth: number;
  progress: number; // 0-1
  color: string;
  bgColor: string;
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
    setOffset(circumference - progress * circumference);
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
  const calorieDone = calorieProgress >= 1;

  return (
    <div className="relative mx-auto w-fit">
      {/* Calorie ring (outer) */}
      <ProgressRing
        size={200}
        strokeWidth={10}
        progress={calorieProgress}
        color={calorieDone ? "#22c55e" : "var(--color-accent)"}
        bgColor="#e2e8f0"
      />
      {/* Protein ring (inner) */}
      <div className="absolute inset-0 flex items-center justify-center">
        <ProgressRing
          size={160}
          strokeWidth={8}
          progress={proteinProgress}
          color="var(--color-protein)"
          bgColor="#e2e8f0"
        />
      </div>
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold tabular-nums text-slate-900 dark:text-slate-100">
          {calorieTotal.toLocaleString()}
        </span>
        <span className="text-sm text-slate-500 dark:text-slate-400">
          / {calorieTarget.toLocaleString()} kcal
        </span>
        <span className="mt-1 text-lg font-semibold tabular-nums text-purple-500 dark:text-purple-400">
          {proteinTotal}g
        </span>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          / {proteinTarget}g protein
        </span>
      </div>
    </div>
  );
}

export function ProgressSkeleton() {
  return (
    <div className="relative mx-auto w-fit animate-pulse">
      <div className="h-[200px] w-[200px] rounded-full bg-slate-200 dark:bg-slate-700" />
    </div>
  );
}

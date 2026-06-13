"use client";

import { useEffect, useState } from "react";

interface ProgressRingProps {
  size: number;
  strokeWidth: number;
  progress: number; // 0-1
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
  glowColor,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const [offset, setOffset] = useState(circumference);

  useEffect(() => {
    // Clamp progress between 0 and 1 for calculations to prevent negative stroke-dashoffset
    const clampedProgress = Math.max(0, Math.min(progress, 1));
    setOffset(circumference - clampedProgress * circumference);
  }, [progress, circumference]);

  const uniqueId = `glow-${size}-${color.replace(/[^a-zA-Z0-9]/g, "")}`;

  return (
    <svg width={size} height={size} className="-rotate-90 filter drop-shadow-[0_0_8px_rgba(0,0,0,0.5)]" aria-hidden="true">
      <defs>
        {glowColor && (
          <filter id={uniqueId} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        )}
      </defs>
      {/* Background Track ring */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={bgColor}
        strokeWidth={strokeWidth}
      />
      {/* Glow path */}
      {glowColor && progress > 0 && (
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={glowColor}
          strokeWidth={strokeWidth + 2}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          filter={`url(#${uniqueId})`}
          className="opacity-40 transition-[stroke-dashoffset] duration-700 ease-out"
        />
      )}
      {/* Main active foreground ring */}
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
  const proteinDone = proteinProgress >= 1;

  return (
    <div className="relative mx-auto w-fit select-none">
      {/* Calorie ring (outer) */}
      <ProgressRing
        size={210}
        strokeWidth={12}
        progress={calorieProgress}
        color={calorieDone ? "#10B981" : "#10B981"}
        glowColor="#10B981"
        bgColor="rgba(255, 255, 255, 0.05)"
      />
      {/* Protein ring (inner) */}
      <div className="absolute inset-0 flex items-center justify-center">
        <ProgressRing
          size={168}
          strokeWidth={10}
          progress={proteinProgress}
          color={proteinDone ? "#06B6D4" : "#06B6D4"}
          glowColor="#06B6D4"
          bgColor="rgba(255, 255, 255, 0.05)"
        />
      </div>
      {/* Center text data panel */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-sm font-medium tracking-widest text-slate-400 uppercase font-sans">
          Calories
        </span>
        <span className="text-3xl font-extrabold tracking-tight tabular-nums text-white font-sans mt-0.5">
          {calorieTotal.toLocaleString()}
        </span>
        <span className="text-xs text-slate-500 font-sans mt-0.5">
          target: {calorieTarget.toLocaleString()} kcal
        </span>

        <div className="mt-3 w-12 h-px bg-white/10" />

        <span className="mt-2.5 text-lg font-bold tracking-tight tabular-nums text-[#06B6D4] font-sans">
          {proteinTotal}g
        </span>
        <span className="text-[10px] text-slate-500 font-sans uppercase tracking-wider">
          protein / {proteinTarget}g
        </span>
      </div>
    </div>
  );
}

export function ProgressSkeleton() {
  return (
    <div className="relative mx-auto w-fit animate-pulse-slow">
      <div className="h-[210px] w-[210px] rounded-full border-12 border-slate-800/40 bg-slate-900/40 flex items-center justify-center">
        <div className="h-[168px] w-[168px] rounded-full border-10 border-slate-800/60 bg-slate-900/60" />
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";

interface ProgressRingProps {
  size: number;
  strokeWidth: number;
  progress: number; // 0-1+
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
    const clampedProgress = Math.max(0, Math.min(progress, 1));
    setOffset(circumference - clampedProgress * circumference);
  }, [progress, circumference]);

  const uniqueId = `glow-${size}-${color.replace(/[^a-zA-Z0-9]/g, "")}`;

  return (
    <svg width={size} height={size} className="-rotate-90 filter drop-shadow-[0_2px_4px_rgba(28,25,23,0.05)]" aria-hidden="true">
      <defs>
        {glowColor && (
          <filter id={uniqueId} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
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
      {/* Subtle Glow path (vintage style uses low blur glow to keep it flat & paper-like) */}
      {glowColor && progress > 0 && (
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={glowColor}
          strokeWidth={strokeWidth + 1}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          filter={`url(#${uniqueId})`}
          className="opacity-15 transition-[stroke-dashoffset] duration-700 ease-out"
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
  const calorieExceeded = calorieTotal > calorieTarget;
  const calorieTargetMet = calorieTotal >= calorieTarget;
  const proteinTargetMet = proteinTotal >= proteinTarget;

  // Warm Dusk Colors: Calorie = Sunset Terracotta (#1DB954), Protein = Sage Green (#81b29a)
  const calorieRingColor = calorieExceeded ? "#ef4444" : "#1DB954";
  const calorieRingGlow = calorieExceeded ? "#ef4444" : "#1DB954";

  const calorieDiff = calorieTotal - calorieTarget;
  const proteinDiff = proteinTotal - proteinTarget;

  return (
    <div className="relative mx-auto w-fit select-none">
      {/* Calorie ring (outer) */}
      <ProgressRing
        size={210}
        strokeWidth={12}
        progress={calorieProgress}
        color={calorieRingColor}
        glowColor={calorieRingGlow}
        bgColor="rgba(255, 255, 255, 0.04)"
      />
      {/* Protein ring (inner) */}
      <div className="absolute inset-0 flex items-center justify-center">
        <ProgressRing
          size={168}
          strokeWidth={10}
          progress={proteinProgress}
          color="#81b29a"
          glowColor="#81b29a"
          bgColor="rgba(255, 255, 255, 0.04)"
        />
      </div>
      {/* Center text data panel */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-[10px] font-semibold tracking-widest text-zinc-400 uppercase font-sans">
          Calories
        </span>
        <span className={`text-3xl font-bold tracking-tight tabular-nums font-sans mt-0.5 ${calorieExceeded ? "text-[#ef4444] drop-shadow-[0_0_8px_rgba(231,111,81,0.25)]" : "text-[#f5f2eb]"}`}>
          {calorieTotal.toLocaleString()}
        </span>
        
        {calorieExceeded ? (
          <span className="text-[11px] font-semibold text-[#ef4444] font-sans mt-0.5 drop-shadow-[0_0_6px_rgba(231,111,81,0.2)] animate-pulse">
            +{calorieDiff.toLocaleString()} kcal over
          </span>
        ) : (
          <span className="text-[10px] text-zinc-400 font-sans mt-0.5 font-medium">
            {calorieTargetMet ? "Goal met! 🎉" : `${(calorieTarget - calorieTotal).toLocaleString()} left`}
          </span>
        )}

        <div className="mt-2.5 w-12 h-px bg-zinc-850" />

        <span className={`mt-2 text-lg font-semibold tracking-tight tabular-nums font-sans ${proteinTargetMet ? "text-[#81b29a]" : "text-[#f5f2eb]"}`}>
          {proteinTotal}g
        </span>
        
        {proteinTargetMet ? (
          <span className="text-[9px] font-semibold text-[#81b29a] font-sans uppercase tracking-wider">
            +{proteinDiff.toFixed(1)}g protein over
          </span>
        ) : (
          <span className="text-[9px] text-zinc-400 font-sans uppercase tracking-wider font-medium">
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
      <div className="h-[210px] w-[210px] rounded-full border-12 border-zinc-800/40 bg-zinc-900/10 flex items-center justify-center">
        <div className="h-[168px] w-[168px] rounded-full border-10 border-zinc-800/60 bg-zinc-900/20" />
      </div>
    </div>
  );
}

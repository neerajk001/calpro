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

  // Vintage Apple colors: Calorie = Amber/Terracotta (#D97706), Protein = Olive/Forest (#16A34A)
  const calorieRingColor = calorieExceeded ? "#DC2626" : "#D97706";
  const calorieRingGlow = calorieExceeded ? "#DC2626" : "#D97706";

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
        bgColor="rgba(28, 25, 23, 0.05)"
      />
      {/* Protein ring (inner) */}
      <div className="absolute inset-0 flex items-center justify-center">
        <ProgressRing
          size={168}
          strokeWidth={10}
          progress={proteinProgress}
          color="#16A34A"
          glowColor="#16A34A"
          bgColor="rgba(28, 25, 23, 0.05)"
        />
      </div>
      {/* Center text data panel */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-[10px] font-bold tracking-widest text-[#78716C] uppercase font-sans">
          Calories
        </span>
        <span className={`text-3xl font-extrabold tracking-tight tabular-nums font-sans mt-0.5 ${calorieExceeded ? "text-red-600" : "text-[#1C1917]"}`}>
          {calorieTotal.toLocaleString()}
        </span>
        
        {calorieExceeded ? (
          <span className="text-[10px] font-bold text-red-600 font-sans mt-0.5 animate-pulse-slow">
            +{calorieDiff.toLocaleString()} kcal over
          </span>
        ) : (
          <span className="text-[10px] text-[#78716C] font-sans mt-0.5 font-medium">
            {calorieTargetMet ? "Goal met! 🎉" : `${(calorieTarget - calorieTotal).toLocaleString()} kcal left`}
          </span>
        )}

        <div className="mt-2.5 w-12 h-px bg-stone-200" />

        <span className={`mt-2 text-lg font-bold tracking-tight tabular-nums font-sans ${proteinTargetMet ? "text-emerald-700" : "text-[#16A34A]"}`}>
          {proteinTotal}g
        </span>
        
        {proteinTargetMet ? (
          <span className="text-[9px] font-bold text-emerald-700 font-sans uppercase tracking-wider">
            +{proteinDiff.toFixed(1)}g protein over
          </span>
        ) : (
          <span className="text-[9px] text-[#78716C] font-sans uppercase tracking-wider font-medium">
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
      <div className="h-[210px] w-[210px] rounded-full border-12 border-stone-200/40 bg-stone-300/10 flex items-center justify-center">
        <div className="h-[168px] w-[168px] rounded-full border-10 border-stone-200/60 bg-stone-300/20" />
      </div>
    </div>
  );
}

"use client";

import type { FoodEntry } from "@/lib/types";

interface FoodEntryItemProps {
  entry: FoodEntry;
  onDelete: () => void;
}

export function FoodEntryItem({ entry, onDelete }: FoodEntryItemProps) {
  // Vintage Apple color highlights
  const borderColors = {
    breakfast: "border-l-[3.5px] border-l-[#D97706]",
    lunch: "border-l-[3.5px] border-l-[#16A34A]",
    dinner: "border-l-[3.5px] border-l-[#292524]",
    snack: "border-l-[3.5px] border-l-[#7C3AED]",
    junk: "border-l-[3.5px] border-l-[#DC2626]",
  };

  const tag = entry.tag || "snack";

  return (
    <div className={`group flex items-center justify-between rounded-xl border border-stone-200/60 bg-white pl-3.5 pr-4 py-3 shadow-xs transition hover:bg-stone-50/50 active:scale-[0.99] ${borderColors[tag]}`}>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold tracking-tight text-stone-900 font-sans">
          {entry.name}
        </p>
        <p className="mt-0.5 text-xs text-stone-500 font-sans">
          {entry.calories} kcal <span className="mx-1.5 text-stone-300">·</span> {entry.protein}g protein
        </p>
      </div>
      <button
        onClick={onDelete}
        className="ml-3 shrink-0 rounded-lg p-2 text-stone-400 transition hover:bg-red-500/10 hover:text-red-600 active:scale-90"
        aria-label={`Delete ${entry.name}`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 6h18" />
          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
        </svg>
      </button>
    </div>
  );
}

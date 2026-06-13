"use client";

import type { FoodEntry } from "@/lib/types";

interface FoodEntryItemProps {
  entry: FoodEntry;
  onDelete: () => void;
}

export function FoodEntryItem({ entry, onDelete }: FoodEntryItemProps) {
  return (
    <div className="group flex items-center justify-between rounded-xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-200 transition dark:bg-slate-800 dark:ring-slate-700">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
          {entry.name}
        </p>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          {entry.calories} kcal · {entry.protein}g protein
        </p>
      </div>
      <button
        onClick={onDelete}
        className="ml-3 shrink-0 rounded-lg p-2 text-slate-400 opacity-0 transition hover:bg-red-50 hover:text-red-500 group-hover:opacity-100 dark:hover:bg-red-900/30 dark:hover:text-red-400"
        aria-label={`Delete ${entry.name}`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 6h18" />
          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
          <line x1="10" y1="11" x2="10" y2="17" />
          <line x1="14" y1="11" x2="14" y2="17" />
        </svg>
      </button>
    </div>
  );
}

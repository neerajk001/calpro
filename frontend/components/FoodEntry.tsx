"use client";

import Link from "next/link";
import type { FoodEntry } from "@/lib/types";

interface FoodEntryItemProps {
  entry: FoodEntry;
  onDelete: () => void;
}

export function FoodEntryItem({ entry, onDelete }: FoodEntryItemProps) {
  return (
    <div className="group relative flex items-center justify-between border border-white/[0.04] bg-[#201c1a] px-4 py-3.5 shadow-sm rounded-lg transition hover:bg-[#282421] active:scale-[0.99]">
      <Link href={`/add?edit=${entry.id}`} className="min-w-0 flex-1 hover:opacity-90 transition cursor-pointer select-none">
        <p className="truncate text-base font-semibold tracking-tight text-[#f5f2eb] font-sans">
          {entry.name} <span className="text-zinc-550 text-xs font-normal font-sans ml-1 select-none group-hover:text-zinc-400">✎</span>
        </p>
        <p className="mt-0.5 text-sm font-medium text-[#a19890] font-sans">
          {entry.calories} kcal <span className="mx-1.5 text-zinc-700">·</span> {entry.protein}g protein
        </p>
      </Link>
      <button
        onClick={onDelete}
        className="ml-3 shrink-0 rounded-full p-2 text-zinc-500 transition hover:bg-red-500/10 hover:text-red-400 active:scale-90"
        aria-label={`Delete ${entry.name}`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
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
        </svg>
      </button>
    </div>
  );
}

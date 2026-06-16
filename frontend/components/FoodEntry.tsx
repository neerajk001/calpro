"use client";

import Link from "next/link";
import type { FoodEntry } from "@/lib/types";

interface FoodEntryItemProps {
  entry: FoodEntry;
  onDelete: () => void;
}

export function FoodEntryItem({ entry, onDelete }: FoodEntryItemProps) {
  return (
    <div className="group relative flex items-center justify-between bg-[#F4F7EF] px-4 py-3.5 rounded-xl transition hover:bg-[#EAF5D6] active:scale-[0.99]">
      <Link href={`/add?edit=${entry.id}`} className="min-w-0 flex-1 hover:opacity-80 transition cursor-pointer select-none">
        <p className="truncate text-[15px] font-semibold tracking-tight text-[#1F1F1F]">
          {entry.name}
        </p>
        <p className="mt-0.5 text-sm font-medium text-[#9A9A9A]">
          {entry.calories} kcal <span className="mx-1.5 text-[#D4D4D4]">·</span> {entry.protein}g protein
        </p>
      </Link>
      <button
        onClick={onDelete}
        className="ml-3 shrink-0 rounded-full p-2 text-[#9A9A9A] transition hover:bg-[#F1A09C]/10 hover:text-[#F1A09C] active:scale-90"
        aria-label={`Delete ${entry.name}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 6h18" />
          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
        </svg>
      </button>
    </div>
  );
}

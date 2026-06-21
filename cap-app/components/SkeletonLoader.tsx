import React from "react";
import { TodaySkeleton } from "./skeletons/TodaySkeleton";
import { HistorySkeleton } from "./skeletons/HistorySkeleton";
import { SettingsSkeleton } from "./skeletons/SettingsSkeleton";
import { ListSkeleton } from "./skeletons/ListSkeleton";

interface SkeletonLoaderProps {
  variant?: "list" | "dashboard" | "chart" | "profile";
}

export function SkeletonLoader({ variant = "list" }: SkeletonLoaderProps) {
  switch (variant) {
    case "dashboard":
      return <TodaySkeleton />;
    case "chart":
      return <HistorySkeleton />;
    case "profile":
      return <SettingsSkeleton />;
    case "list":
    default:
      return <ListSkeleton />;
  }
}
export { TodaySkeleton, HistorySkeleton, SettingsSkeleton, ListSkeleton };

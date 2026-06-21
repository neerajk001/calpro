import React from "react";
import { View, StyleSheet } from "react-native";
import { ShimmerBlock } from "./ShimmerBlock";

export function TodaySkeleton() {
  return (
    <View style={styles.container}>
      {/* Top Hero Card Skele */}
      <ShimmerBlock style={styles.heroCard} />
      
      {/* Date Selector Skele */}
      <ShimmerBlock style={styles.dateSelector} />
      
      {/* Rings Skele */}
      <View style={styles.ringsRow}>
        {[1, 2, 3].map((i) => (
          <ShimmerBlock key={i} style={styles.ring} />
        ))}
      </View>
      
      {/* Water tracker card skele */}
      <ShimmerBlock style={styles.waterCard} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  heroCard: {
    height: 190,
    borderRadius: 24,
    backgroundColor: "rgba(34, 197, 94, 0.15)", // green tint skele
  },
  dateSelector: {
    height: 52,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.4)",
  },
  ringsRow: {
    flexDirection: "row",
    gap: 8,
  },
  ring: {
    flex: 1,
    height: 140,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.4)",
  },
  waterCard: {
    height: 110,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.4)",
  },
});

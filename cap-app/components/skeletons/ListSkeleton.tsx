import React from "react";
import { View, StyleSheet } from "react-native";
import { ShimmerBlock } from "./ShimmerBlock";

export function ListSkeleton() {
  return (
    <View style={styles.container}>
      {[1, 2, 3].map((i) => (
        <View key={i} style={styles.skeletonCard}>
          <ShimmerBlock style={styles.skeletonCircle} />
          <View style={styles.textCol}>
            <ShimmerBlock style={styles.skeletonLineLong} />
            <ShimmerBlock style={styles.skeletonLineShort} />
          </View>
          <ShimmerBlock style={styles.skeletonCircle} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
    paddingVertical: 8,
  },
  skeletonCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderRadius: 18,
    padding: 12,
    gap: 12,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.4)",
  },
  skeletonCircle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  textCol: {
    flex: 1,
    gap: 6,
  },
  skeletonLineLong: {
    height: 12,
    backgroundColor: "rgba(0,0,0,0.05)",
    borderRadius: 6,
    width: "70%",
  },
  skeletonLineShort: {
    height: 8,
    backgroundColor: "rgba(0,0,0,0.04)",
    borderRadius: 4,
    width: "45%",
  },
});

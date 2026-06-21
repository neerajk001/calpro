import React from "react";
import { View, StyleSheet } from "react-native";
import { ShimmerBlock } from "./ShimmerBlock";

export function HistorySkeleton() {
  return (
    <View style={styles.container}>
      {/* Chart block */}
      <View style={styles.chartGlass}>
        <View style={styles.chartHeader}>
          <ShimmerBlock style={styles.circleSmall} />
          <View style={styles.headerTextCol}>
            <ShimmerBlock style={[styles.line, { width: 100, height: 14 }]} />
            <ShimmerBlock style={[styles.line, { width: 160, height: 10 }]} />
          </View>
        </View>
        <View style={styles.chartBars}>
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <View key={i} style={styles.barColumn}>
              <ShimmerBlock style={styles.barTrack} />
              <ShimmerBlock style={styles.barLabel} />
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  chartGlass: {
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderRadius: 24,
    padding: 16,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.4)",
    height: 190,
    gap: 16,
  },
  chartHeader: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  circleSmall: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  headerTextCol: {
    gap: 4,
    flex: 1,
  },
  line: {
    borderRadius: 6,
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  chartBars: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    flex: 1,
    paddingTop: 8,
  },
  barColumn: {
    alignItems: "center",
    flex: 1,
    gap: 6,
  },
  barTrack: {
    width: 12,
    height: 70,
    backgroundColor: "rgba(0,0,0,0.04)",
    borderRadius: 6,
  },
  barLabel: {
    width: 12,
    height: 8,
    backgroundColor: "rgba(0,0,0,0.04)",
    borderRadius: 2,
  },
});

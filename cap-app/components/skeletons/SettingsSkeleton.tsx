import React from "react";
import { View, StyleSheet } from "react-native";
import { ShimmerBlock } from "./ShimmerBlock";

export function SettingsSkeleton() {
  return (
    <View style={styles.profileCard}>
      <ShimmerBlock style={styles.avatarCircle} />
      <View style={styles.textCol}>
        <ShimmerBlock style={styles.lineLong} />
        <ShimmerBlock style={styles.lineShort} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderRadius: 24,
    padding: 16,
    gap: 12,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.4)",
  },
  avatarCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  textCol: {
    flex: 1,
    gap: 6,
  },
  lineLong: {
    height: 14,
    backgroundColor: "rgba(0,0,0,0.05)",
    borderRadius: 7,
    width: "50%",
  },
  lineShort: {
    height: 10,
    backgroundColor: "rgba(0,0,0,0.04)",
    borderRadius: 5,
    width: "80%",
  },
});

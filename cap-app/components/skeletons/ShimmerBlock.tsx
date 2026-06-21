import React from "react";
import Animated from "react-native-reanimated";
import { StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { useSkeletonAnimation } from "./useSkeletonAnimation";

interface ShimmerBlockProps {
  style?: StyleProp<ViewStyle>;
}

export function ShimmerBlock({ style }: ShimmerBlockProps) {
  const pulseStyle = useSkeletonAnimation();
  return <Animated.View style={[styles.block, style, pulseStyle]} />;
}

const styles = StyleSheet.create({
  block: {
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
});

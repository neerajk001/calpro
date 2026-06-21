import React, { useEffect, useRef } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

interface AnimMacroTextProps {
  value: string | number;
  style?: any;
}

export function AnimMacroText({ value, style }: AnimMacroTextProps) {
  const scale = useSharedValue(1);
  const prevValue = useRef(value);

  useEffect(() => {
    if (value !== prevValue.current) {
      prevValue.current = value;
      scale.value = 1.15;
      scale.value = withSpring(1, { damping: 8, stiffness: 180 });
    }
  }, [value]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.Text style={[style, animatedStyle]}>
      {value}
    </Animated.Text>
  );
}

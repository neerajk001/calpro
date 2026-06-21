import React from "react";
import { Pressable, type ViewStyle, type StyleProp } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

interface ScalePressableProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle> | any;
  disabled?: boolean;
  activeScale?: number;
  hapticType?: "light" | "medium" | "heavy" | "selection" | "success" | "warning" | "error" | "none";
  hitSlop?: number | object | any;
}

export function ScalePressable({
  children,
  onPress,
  style,
  disabled,
  activeScale = 0.96,
  hapticType,
  hitSlop,
}: ScalePressableProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    if (onPress) {
      if (hapticType && hapticType !== "none") {
        try {
          switch (hapticType) {
            case "light":
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              break;
            case "medium":
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              break;
            case "heavy":
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
              break;
            case "selection":
              Haptics.selectionAsync();
              break;
            case "success":
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              break;
            case "warning":
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
              break;
            case "error":
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              break;
          }
        } catch (e) {
          // Fallback if Haptics fails on simulator or unsupported platform
        }
      }
      onPress();
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={() => {
        if (!disabled) {
          scale.value = withTiming(activeScale, { duration: 60 });
        }
      }}
      onPressOut={() => {
        if (!disabled) {
          scale.value = withSpring(1, { damping: 10, stiffness: 220 });
        }
      }}
      disabled={disabled}
      style={style}
      hitSlop={hitSlop}
    >
      <Animated.View style={animatedStyle}>
        {children}
      </Animated.View>
    </Pressable>
  );
}

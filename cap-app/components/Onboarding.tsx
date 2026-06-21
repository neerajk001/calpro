import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  Pressable,
  SafeAreaView,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  interpolateColor,
  withRepeat,
  withTiming,
  withDelay,
} from "react-native-reanimated";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface OnboardingProps {
  onComplete: () => void;
  onSignIn?: () => void;
}

export function Onboarding({ onComplete, onSignIn }: OnboardingProps) {
  const scrollViewRef = useRef<Animated.ScrollView>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const scrollX = useSharedValue(0);

  // Logo background animations
  const glow1 = useSharedValue(1);
  const glow2 = useSharedValue(1);
  const float1 = useSharedValue(0);
  const float2 = useSharedValue(0);

  useEffect(() => {
    glow1.value = withRepeat(
      withTiming(1.25, { duration: 3000 }),
      -1,
      true
    );
    glow2.value = withRepeat(
      withDelay(1500, withTiming(1.4, { duration: 3000 })),
      -1,
      true
    );
    float1.value = withRepeat(
      withTiming(-12, { duration: 3200 }),
      -1,
      true
    );
    float2.value = withRepeat(
      withDelay(1200, withTiming(10, { duration: 3800 })),
      -1,
      true
    );
  }, []);

  const glowStyle1 = useAnimatedStyle(() => {
    return {
      transform: [{ scale: glow1.value }],
      opacity: interpolate(glow1.value, [1, 1.25], [0.55, 0.15]),
    };
  });

  const glowStyle2 = useAnimatedStyle(() => {
    return {
      transform: [{ scale: glow2.value }],
      opacity: interpolate(glow2.value, [1, 1.4], [0.35, 0.05]),
    };
  });

  const floatStyle1 = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: float1.value }],
    };
  });

  const floatStyle2 = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: float2.value }],
    };
  });

  // Sync scroll position with reanimated shared value
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  const handleMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const page = Math.round(contentOffset / SCREEN_WIDTH);
    if (page !== currentPage && page >= 0 && page < 5) {
      setCurrentPage(page);
      Haptics.selectionAsync();
    }
  };

  const goToNextPage = () => {
    if (currentPage < 4) {
      scrollViewRef.current?.scrollTo({
        x: (currentPage + 1) * SCREEN_WIDTH,
        animated: true,
      });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleSkip = () => {
    scrollViewRef.current?.scrollTo({
      x: 4 * SCREEN_WIDTH,
      animated: true,
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleComplete = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onComplete();
  };

  // Scroll-linked animation for slide images (scales & fades)
  const getImageStyle = (index: number) => {
    return useAnimatedStyle(() => {
      const inputRange = [
        (index - 1) * SCREEN_WIDTH,
        index * SCREEN_WIDTH,
        (index + 1) * SCREEN_WIDTH,
      ];

      const scale = interpolate(
        scrollX.value,
        inputRange,
        [0.75, 1, 0.75],
        "clamp"
      );

      const opacity = interpolate(
        scrollX.value,
        inputRange,
        [0.3, 1, 0.3],
        "clamp"
      );

      const translateY = interpolate(
        scrollX.value,
        inputRange,
        [40, 0, 40],
        "clamp"
      );

      return {
        transform: [{ scale }, { translateY }],
        opacity,
      };
    });
  };

  // Scroll-linked animation for slide text cards (fades & slides up)
  const getCardStyle = (index: number) => {
    return useAnimatedStyle(() => {
      const inputRange = [
        (index - 1) * SCREEN_WIDTH,
        index * SCREEN_WIDTH,
        (index + 1) * SCREEN_WIDTH,
      ];

      const opacity = interpolate(
        scrollX.value,
        inputRange,
        [0, 1, 0],
        "clamp"
      );

      const translateY = interpolate(
        scrollX.value,
        inputRange,
        [30, 0, 30],
        "clamp"
      );

      return {
        opacity,
        transform: [{ translateY }],
      };
    });
  };

  // Scroll-linked animation for dot widths and colors
  const getDotStyle = (index: number) => {
    return useAnimatedStyle(() => {
      const inputRange = [
        (index - 1) * SCREEN_WIDTH,
        index * SCREEN_WIDTH,
        (index + 1) * SCREEN_WIDTH,
      ];

      const width = interpolate(
        scrollX.value,
        inputRange,
        [8, 24, 8],
        "clamp"
      );

      const backgroundColor = interpolateColor(
        scrollX.value,
        inputRange,
        ["#CBD5E1", "#22C55E", "#CBD5E1"]
      );

      return {
        width,
        backgroundColor,
      };
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header Controls */}
      <View style={styles.header}>
        {currentPage < 4 ? (
          <Pressable onPress={handleSkip} style={styles.skipButton}>
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
        ) : (
          <View style={styles.skipPlaceholder} />
        )}
      </View>

      {/* Pages Carousel */}
      <Animated.ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={scrollHandler}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        scrollEventThrottle={16}
        style={styles.scrollView}
      >
        {/* Slide 1: Welcome */}
        <View style={styles.slide}>
          <Animated.View style={[styles.imageContainer, getImageStyle(0)]}>
            {/* Pulsing glow circles & floating dots behind the logo */}
            <View style={styles.logoBgWrapper}>
              <Animated.View style={[styles.glowCircle, styles.glowCircleOuter, glowStyle2]} />
              <Animated.View style={[styles.glowCircle, styles.glowCircleInner, glowStyle1]} />
              <Animated.View style={[styles.decorDot, styles.decorDotGreen1, floatStyle1]} />
              <Animated.View style={[styles.decorDot, styles.decorDotGreen2, floatStyle2]} />
            </View>
            
            <Image
              source={require("../assets/images/icon.png")}
              style={styles.logoIconImage}
              resizeMode="contain"
            />
          </Animated.View>
          <Animated.View style={[styles.card, getCardStyle(0)]}>
            <Image
              source={require("../assets/images/logo_text.png")}
              style={styles.logoTextImage}
              resizeMode="contain"
            />
            <Text style={styles.title}>Track. Log. Achieve.</Text>
            <Text style={styles.description}>
              Your ultimate personal nutrition assistant. Set daily targets, log meals easily, and build lasting healthy habits.
            </Text>
          </Animated.View>
        </View>

        {/* Slide 2: AI Scanning */}
        <View style={styles.slide}>
          <Animated.View style={[styles.imageContainer, getImageStyle(1)]}>
            <Image
              source={require("../assets/images/onboarding_scan.png")}
              style={styles.illustrationImage}
              resizeMode="contain"
            />
          </Animated.View>
          <Animated.View style={[styles.card, getCardStyle(1)]}>
            <Text style={styles.title}>AI Food Scanning</Text>
            <Text style={styles.description}>
              No more manual searching. Simply snap a photo of your plate, and our AI will estimate the portion sizes, calories, and macros in seconds.
            </Text>
          </Animated.View>
        </View>

        {/* Slide 3: Indian Culinary Database */}
        <View style={styles.slide}>
          <Animated.View style={[styles.imageContainer, getImageStyle(2)]}>
            <Image
              source={require("../assets/images/onboarding_indian_food.png")}
              style={styles.illustrationImage}
              resizeMode="contain"
            />
          </Animated.View>
          <Animated.View style={[styles.card, getCardStyle(2)]}>
            <Text style={styles.title}>Indian Food Database</Text>
            <Text style={styles.description}>
              Access a comprehensive ICMR-NIN database specifically seeded with Indian dishes, snacks, curries, and street foods.
            </Text>
          </Animated.View>
        </View>

        {/* Slide 4: Streaks & Goals */}
        <View style={styles.slide}>
          <Animated.View style={[styles.imageContainer, getImageStyle(3)]}>
            <Image
              source={require("../assets/images/onboarding_goals.png")}
              style={styles.illustrationImage}
              resizeMode="contain"
            />
          </Animated.View>
          <Animated.View style={[styles.card, getCardStyle(3)]}>
            <Text style={styles.title}>Build Your Streak</Text>
            <Text style={styles.description}>
              Stay consistent to keep your logging streak alive. Track calorie budgets, protein counts, and your daily water intake.
            </Text>
          </Animated.View>
        </View>

        {/* Slide 5: Secure & Sync */}
        <View style={styles.slide}>
          <Animated.View style={[styles.imageContainer, getImageStyle(4)]}>
            <Image
              source={require("../assets/images/onboarding_sync.png")}
              style={styles.illustrationImage}
              resizeMode="contain"
            />
          </Animated.View>
          <Animated.View style={[styles.card, getCardStyle(4)]}>
            <Text style={styles.title}>Sync Your Progress</Text>
            <Text style={styles.description}>
              Create a free secure account to sync your logs and custom database automatically with the web app, or continue offline.
            </Text>
          </Animated.View>
        </View>
      </Animated.ScrollView>

      {/* Footer Controls */}
      <View style={styles.footer}>
        {/* Page Dots Indicator */}
        <View style={styles.dotsContainer}>
          {[0, 1, 2, 3, 4].map((index) => (
            <Animated.View
              key={index}
              style={[styles.dot, getDotStyle(index)]}
            />
          ))}
        </View>

        {/* Navigation Action Buttons */}
        <View style={styles.buttonWrapper}>
          {currentPage < 4 ? (
            <Pressable onPress={goToNextPage} style={styles.nextButton}>
              <Text style={styles.nextButtonText}>Next</Text>
              <Ionicons name="arrow-forward" size={16} color="#FFF" />
            </Pressable>
          ) : (
            <View style={styles.lastPageButtonsColumn}>
              <Pressable
                onPress={() => {
                  if (onSignIn) {
                    onSignIn();
                  } else {
                    handleComplete();
                  }
                }}
                style={styles.signInGoogleButton}
              >
                <Image
                  source={require("../assets/images/google_logo.png")}
                  style={styles.googleIconImage}
                  resizeMode="contain"
                />
                <Text style={styles.signInGoogleText}>Sign in with Google</Text>
              </Pressable>
              
              <Pressable onPress={handleComplete} style={styles.skipGuestButton}>
                <Text style={styles.skipGuestText}>Skip & Use as Guest</Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    height: 48,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  skipButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
  },
  skipText: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "700",
  },
  skipPlaceholder: {
    width: 60,
    height: 30,
  },
  scrollView: {
    flex: 1,
  },
  slide: {
    width: SCREEN_WIDTH,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  imageContainer: {
    height: SCREEN_HEIGHT * 0.35,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    position: "relative",
  },
  logoIconImage: {
    width: 140,
    height: 140,
    borderRadius: 28,
    zIndex: 2,
  },
  logoTextImage: {
    width: 260,
    height: 90,
    marginBottom: 16,
  },
  logoBgWrapper: {
    position: "absolute",
    width: SCREEN_WIDTH * 0.9,
    height: SCREEN_HEIGHT * 0.35,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  glowCircle: {
    position: "absolute",
    width: SCREEN_WIDTH * 0.55,
    height: SCREEN_WIDTH * 0.55,
    borderRadius: (SCREEN_WIDTH * 0.55) / 2,
  },
  glowCircleInner: {
    backgroundColor: "rgba(34, 197, 94, 0.08)", // Theme green glow
  },
  glowCircleOuter: {
    backgroundColor: "rgba(34, 197, 94, 0.04)",
  },
  decorDot: {
    position: "absolute",
    borderRadius: 12,
  },
  decorDotGreen1: {
    width: 14,
    height: 14,
    backgroundColor: "rgba(34, 197, 94, 0.25)",
    top: "15%",
    left: "15%",
  },
  decorDotGreen2: {
    width: 9,
    height: 9,
    backgroundColor: "rgba(34, 197, 94, 0.4)",
    bottom: "20%",
    right: "12%",
  },
  illustrationImage: {
    width: SCREEN_WIDTH * 0.65,
    height: SCREEN_HEIGHT * 0.3,
  },
  card: {
    width: "100%",
    paddingVertical: 24,
    alignItems: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "900",
    color: "#1E293B",
    textAlign: "center",
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 15,
    color: "#475569",
    textAlign: "center",
    lineHeight: 24,
    fontWeight: "500",
  },
  footer: {
    paddingHorizontal: 32,
    paddingBottom: 48,
    alignItems: "center",
    gap: 20,
  },
  dotsContainer: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    height: 16,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  buttonWrapper: {
    width: "100%",
  },
  nextButton: {
    width: "100%",
    height: 54,
    backgroundColor: "#22C55E",
    borderRadius: 27,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    shadowColor: "#15803D",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  nextButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "800",
  },
  getStartedButton: {
    width: "100%",
    height: 54,
    backgroundColor: "#16A34A",
    borderRadius: 27,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#166534",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  getStartedText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "800",
  },
  lastPageButtonsColumn: {
    width: "100%",
    alignItems: "center",
    gap: 12,
  },
  signInGoogleButton: {
    width: "100%",
    height: 54,
    backgroundColor: "#FFFFFF",
    borderRadius: 27,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#DADCE0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  signInGoogleText: {
    color: "#3C4043",
    fontSize: 15,
    fontWeight: "500",
    letterSpacing: 0.25,
  },
  googleIconImage: {
    width: 20,
    height: 20,
    marginRight: 12,
  },
  skipGuestButton: {
    width: "100%",
    height: 38,
    justifyContent: "center",
    alignItems: "center",
  },
  skipGuestText: {
    color: "#64748B",
    fontSize: 14,
    fontWeight: "700",
    textDecorationLine: "underline",
  },
});

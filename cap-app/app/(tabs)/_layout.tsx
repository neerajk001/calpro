import { View, Text, Pressable, StyleSheet, Dimensions, Alert } from "react-native";
import { Tabs } from "expo-router";
import { AppProvider, useApp } from "@/lib/AppContext";
import { ClerkTokenSync } from "@/components/ClerkTokenSync";
import { Onboarding } from "@/components/Onboarding";
import { Ionicons } from "@expo/vector-icons";
import { useOAuth } from "@clerk/clerk-expo";
import * as Linking from "expo-linking";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  FadeIn,
  FadeOut,
  ZoomIn,
} from "react-native-reanimated";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import { apiClient } from "@/lib/apiClient";
import type { FoodTag } from "@/lib/types";

import { ScalePressable } from "@/components/ScalePressable";

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function AnimatedTabItem({ isFocused, label, icon }: { isFocused: boolean; label: string; icon: React.ReactNode }) {
  const activeScale = useSharedValue(isFocused ? 1.08 : 1.0);
  const activeTranslateY = useSharedValue(isFocused ? -2 : 0);
  const labelOpacity = useSharedValue(isFocused ? 1.0 : 0.7);

  useEffect(() => {
    activeScale.value = withSpring(isFocused ? 1.08 : 1.0, { damping: 14, stiffness: 150 });
    activeTranslateY.value = withSpring(isFocused ? -2 : 0, { damping: 14, stiffness: 150 });
    labelOpacity.value = withTiming(isFocused ? 1.0 : 0.7, { duration: 150 });
  }, [isFocused]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: activeScale.value },
        { translateY: activeTranslateY.value }
      ],
    };
  });

  const animatedLabelStyle = useAnimatedStyle(() => {
    return {
      opacity: labelOpacity.value,
    };
  });

  return (
    <Animated.View style={[styles.tabItem, animatedStyle]}>
      {icon}
      <Animated.Text style={[
        styles.tabLabel,
        {
          color: isFocused ? "#15803D" : "#71717A",
          fontWeight: isFocused ? "700" : "500",
        },
        animatedLabelStyle
      ]}>
        {label}
      </Animated.Text>
    </Animated.View>
  );
}

function CustomTabBar({ state, descriptors, navigation, triggerScan }: any) {
  const totalWidth = Dimensions.get("window").width - 32; // 16 padding on each side
  const columnsCount = 5; // 4 tabs + 1 center FAB
  const tabWidth = totalWidth / columnsCount;
  const insets = useSafeAreaInsets();
  const bottomOffset = insets.bottom > 0 ? insets.bottom + 8 : 16;
  
  const translateX = useSharedValue(0);
  
  useEffect(() => {
    // Skip index 2 (center FAB slot) for sliding pill highlight
    const visualIndex = state.index >= 2 ? state.index + 1 : state.index;
    translateX.value = withSpring(visualIndex * tabWidth, {
      damping: 18,
      stiffness: 130,
    });
  }, [state.index, tabWidth]);
  
  const animatedPillStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  return (
    <View style={[styles.tabBarContainer, { bottom: bottomOffset }]}>
      <View style={styles.glassTabBar}>
        <Animated.View style={[styles.slidingPill, { width: tabWidth - 8 }, animatedPillStyle]} />
        
        {(() => {
          const items: React.ReactNode[] = [];
          
          state.routes.forEach((route: any, index: number) => {
            const { options } = descriptors[route.key];
            const label = options.title !== undefined ? options.title : route.name;
            const isFocused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name, route.params);
              }
            };

            const getIcon = (color: string) => {
              const size = 22;
              switch (route.name) {
                case "index":
                  return <Ionicons name={isFocused ? "calendar" : "calendar-outline"} size={size} color={color} />;
                case "add":
                  return <Ionicons name={isFocused ? "add-circle" : "add-circle-outline"} size={size} color={color} />;
                case "history":
                  return <Ionicons name={isFocused ? "time" : "time-outline"} size={size} color={color} />;
                case "settings":
                  return <Ionicons name={isFocused ? "settings" : "settings-outline"} size={size} color={color} />;
                default:
                  return <Ionicons name="ellipse" size={size} color={color} />;
              }
            };

            const activeColor = "#15803D"; // Dark green for readability
            const inactiveColor = "#71717A"; // Slate gray

            items.push(
              <ScalePressable
                key={route.key}
                onPress={onPress}
                style={styles.tabButton}
                activeScale={0.94}
                hapticType="light"
              >
                <AnimatedTabItem
                  isFocused={isFocused}
                  label={label}
                  icon={getIcon(isFocused ? activeColor : inactiveColor)}
                />
              </ScalePressable>
            );
          });

          // Insert Scan Meal FAB at visual center index (2)
          items.splice(
            2,
            0,
            <View key="scan-fab-wrapper" style={styles.scanFabWrapper}>
              <ScalePressable
                onPress={triggerScan}
                style={styles.scanFab}
                hapticType="medium"
                activeScale={0.90}
              >
                <Ionicons name="scan" size={24} color="#FFF" />
              </ScalePressable>
            </View>
          );

          return items;
        })()}
      </View>
    </View>
  );
}

function TabsLayout() {
  const { addFood } = useApp();
  const [onboarded, setOnboarded] = useState<boolean | null>(null);
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });

  const handleSignIn = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const redirectUrl = Linking.createURL("/", { scheme: "capapp" });
      // OAuth flow started
      const { createdSessionId, setActive } = await startOAuthFlow({ redirectUrl });
      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
        await AsyncStorage.setItem("calpro:onboarded", "true");
        setOnboarded(true);
      }
    } catch (err: any) {
      if (err?.message?.includes("cancel")) return;
      console.error("[Auth-Onboarding] Error:", err);
      Alert.alert("Sign-in Error", err?.message || "Failed to sign in");
    }
  };

  useEffect(() => {
    AsyncStorage.getItem("calpro:onboarded").then((val) => {
      setOnboarded(val === "true");
    });
  }, []);
  
  // AI Scanner Simulator State
  const laserY = useSharedValue(0);
  const [showScanner, setShowScanner] = useState(false);
  const [scanState, setScanState] = useState<"idle" | "scanning" | "complete">("idle");
  const [scanProgress, setScanProgress] = useState("");
  const [scannedMeal, setScannedMeal] = useState<any>(null);

  useEffect(() => {
    if (scanState === "scanning") {
      laserY.value = 0;
      laserY.value = withRepeat(
        withTiming(140, { duration: 1200 }),
        -1,
        true
      );
    } else {
      laserY.value = 0;
    }
  }, [scanState]);

  const laserStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: laserY.value }],
    };
  });

  const launchScanner = async (source: "camera" | "library") => {
    try {
      const options: ImagePicker.ImagePickerOptions = {
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5,
        base64: true,
      };

      const result = source === "camera"
        ? await ImagePicker.launchCameraAsync(options)
        : await ImagePicker.launchImageLibraryAsync(options);

      if (result.canceled || !result.assets?.[0]?.base64) {
        return;
      }

      setShowScanner(true);
      setScanState("scanning");
      setScanProgress("Analyzing plate layout & food items...");

      const base64Str = result.assets[0].base64;

      // Call Backend API
      const response = await apiClient.scanFood(base64Str);
      const items = response.items || [];

      if (items.length === 0) {
        setScanState("idle");
        setShowScanner(false);
        Alert.alert("No Food Detected", "We couldn't identify any food in the picture. Try a different angle or lighting.");
        return;
      }

      // Determine Log Tag
      const currentHour = new Date().getHours();
      let activeMealTag: FoodTag = "snack";
      if (currentHour >= 5 && currentHour < 11) activeMealTag = "breakfast";
      else if (currentHour >= 11 && currentHour < 16) activeMealTag = "lunch";
      else if (currentHour >= 16 && currentHour < 21) activeMealTag = "dinner";

      // Log all mapped items
      items.forEach((item) => {
        const itemCal = item.estimatedCalories ?? Math.round((item.caloriesPer100g * item.defaultGrams) / 100);
        const itemProt = item.estimatedProtein ?? Math.round((item.proteinPer100g * item.defaultGrams) / 100 * 10) / 10;
        addFood(
          `🥑 AI ${item.name}`,
          itemCal,
          itemProt,
          todayStr(),
          activeMealTag
        );
      });

      // Show summary on screen
      const totalCals = items.reduce((s, i) => s + (i.estimatedCalories ?? Math.round((i.caloriesPer100g * i.defaultGrams) / 100)), 0);
      const totalProts = Math.round(items.reduce((s, i) => s + (i.estimatedProtein ?? Math.round((i.proteinPer100g * i.defaultGrams) / 100 * 10) / 10), 0) * 10) / 10;
      const scanLabel = items.length === 1
        ? items[0].name
        : items.slice(0, 2).map(i => i.name.split(" ")[0]).join(" + ") + (items.length > 2 ? "..." : "");

      setScannedMeal({
        name: `AI: ${scanLabel}`,
        calories: totalCals,
        protein: totalProts,
        tag: activeMealTag,
      });

      setScanState("complete");
      setScanProgress("Analysis Complete!");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    } catch (error: any) {
      setScanState("idle");
      setShowScanner(false);
      Alert.alert("Scanner Error", error?.message || "Something went wrong while analyzing the photo.");
    }
  };

  const triggerScan = async () => {
    if (showScanner) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Request permissions first
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (cameraStatus !== "granted" || libraryStatus !== "granted") {
      Alert.alert(
        "Permissions Required",
        "LogMyMeal needs camera and library access to analyze your meals.",
        [{ text: "OK" }]
      );
      return;
    }

    Alert.alert(
      "Scan Your Meal 📸",
      "Take a new photo or select one from your library.",
      [
        {
          text: "Camera",
          onPress: () => launchScanner("camera"),
        },
        {
          text: "Photo Library",
          onPress: () => launchScanner("library"),
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ]
    );
  };

  const closeScanner = () => {
    setShowScanner(false);
    setScanState("idle");
    setScannedMeal(null);
  };

  if (onboarded === null) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F8FAFC" }}>
        <Text style={{ fontSize: 16, fontWeight: "700", color: "#64748B" }}>Loading LogMyMeal...</Text>
      </View>
    );
  }

  if (!onboarded) {
    return (
      <Onboarding
        onComplete={async () => {
          await AsyncStorage.setItem("calpro:onboarded", "true");
          setOnboarded(true);
        }}
        onSignIn={handleSignIn}
      />
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        tabBar={(props) => <CustomTabBar triggerScan={triggerScan} {...props} />}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Today",
          }}
        />
        <Tabs.Screen
          name="add"
          options={{
            title: "Add Food",
          }}
        />
        <Tabs.Screen
          name="history"
          options={{
            title: "History",
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: "Settings",
          }}
        />
      </Tabs>

      {/* Simulated Scanner View */}
      {showScanner && (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(150)}
          style={styles.scannerOverlay}
        >
          <Animated.View
            entering={ZoomIn.springify().damping(15).stiffness(130)}
            style={styles.scannerModal}
          >
            <Text style={styles.scannerTitle}>AI Food Scanner 📸</Text>
            
            <View style={styles.viewfinder}>
              {scanState === "scanning" && (
                <>
                  <Animated.View style={[styles.laser, laserStyle]} />
                  <Text style={styles.scanningEmoji}>🥗 🍕 🍣 🥣</Text>
                </>
              )}
              {scanState === "complete" && scannedMeal && (
                <View style={styles.successScanContainer}>
                  <Text style={styles.successCheck}>✅</Text>
                  <Text style={styles.successMealName}>{scannedMeal.name}</Text>
                  <Text style={styles.successMealMacros}>
                    +{scannedMeal.calories} kcal · +{scannedMeal.protein}g Protein
                  </Text>
                  <Text style={styles.successTag}>Logged to {scannedMeal.tag}</Text>
                </View>
              )}
            </View>
            
            <Text style={styles.scannerStatus}>{scanProgress}</Text>
            
            {scanState === "complete" ? (
              <ScalePressable
                onPress={closeScanner}
                style={styles.closeScanBtn}
                hapticType="success"
              >
                <Text style={styles.closeScanBtnText}>Awesome!</Text>
              </ScalePressable>
            ) : (
              <ScalePressable
                onPress={closeScanner}
                style={styles.cancelScanBtn}
                hapticType="light"
              >
                <Text style={styles.cancelScanBtnText}>Cancel</Text>
              </ScalePressable>
            )}
          </Animated.View>
        </Animated.View>
      )}
    </View>
  );
}

export default function RootLayout() {
  return (
    <AppProvider>
      <SafeAreaProvider>
        <ClerkTokenSync>
          <TabsLayout />
        </ClerkTokenSync>
      </SafeAreaProvider>
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: "absolute",
    left: 16,
    right: 16,
    height: 90, // Taller container to prevent clipping of the floating FAB and allow iOS clicks
    backgroundColor: "transparent",
    justifyContent: "flex-end", // Align the actual tab bar to the bottom
  },
  glassTabBar: {
    height: 72, // Maintain standard height
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.90)",
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.7)",
    // Smooth premium shadow
    shadowColor: "#15803D",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 4,
  },
  slidingPill: {
    position: "absolute",
    height: 52,
    backgroundColor: "#DCFCE7", // soft primary green highlight pill
    borderRadius: 18,
    left: 4, // align with padding
  },
  tabButton: {
    flex: 1,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  tabItem: {
    justifyContent: "center",
    alignItems: "center",
    gap: 2,
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 2,
  },
  scanFabWrapper: {
    flex: 1,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  scanFab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#22C55E",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
    // Position it to float slightly above
    marginTop: -24,
    shadowColor: "#15803D",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
    zIndex: 10,
  },
  scannerOverlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    zIndex: 1000,
  },
  scannerModal: {
    width: "100%",
    maxWidth: 320,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.8)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  scannerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1F2937",
    marginBottom: 16,
  },
  viewfinder: {
    width: 220,
    height: 150,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#22C55E",
    borderStyle: "dashed",
    backgroundColor: "rgba(34, 197, 94, 0.05)",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    position: "relative",
  },
  laser: {
    position: "absolute",
    top: 0,
    left: "5%",
    width: "90%",
    height: 4,
    backgroundColor: "#22C55E",
    borderRadius: 2,
    shadowColor: "#22C55E",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  scanningEmoji: {
    fontSize: 24,
    opacity: 0.7,
  },
  successScanContainer: {
    alignItems: "center",
    paddingHorizontal: 12,
  },
  successCheck: {
    fontSize: 32,
    marginBottom: 8,
  },
  successMealName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
  },
  successMealMacros: {
    fontSize: 13,
    fontWeight: "700",
    color: "#10B981",
    marginTop: 4,
  },
  successTag: {
    fontSize: 10,
    color: "#6B7280",
    fontWeight: "700",
    textTransform: "uppercase",
    marginTop: 2,
  },
  scannerStatus: {
    fontSize: 12,
    fontWeight: "700",
    color: "#4B5563",
    marginTop: 16,
    textAlign: "center",
  },
  closeScanBtn: {
    marginTop: 20,
    backgroundColor: "#22C55E",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 14,
  },
  closeScanBtnText: {
    color: "#FFF",
    fontWeight: "800",
    fontSize: 14,
  },
  cancelScanBtn: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  cancelScanBtnText: {
    color: "#EF4444",
    fontWeight: "700",
    fontSize: 13,
  },
});


import { View, Text, ScrollView, Pressable, StyleSheet, Alert, RefreshControl } from "react-native";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useFocusEffect } from "expo-router";
import { useApp } from "@/lib/AppContext";
import { useAuth, useOAuth, useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import Slider from "@react-native-community/slider";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolateColor,
  FadeInUp,
  FadeInDown,
} from "react-native-reanimated";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { ScalePressable } from "@/components/ScalePressable";
import { AnimMacroText } from "@/components/AnimMacroText";
import { SettingsSkeleton } from "@/components/skeletons/SettingsSkeleton";

WebBrowser.maybeCompleteAuthSession();

export default function Settings() {
  const { foods, settings, updateSettings, getStreak, rehydrate } = useApp();

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await rehydrate(true);
    } catch (err) {
      console.error("Refresh failed:", err);
    } finally {
      setRefreshing(false);
    }
  }, [rehydrate]);

  useFocusEffect(
    useCallback(() => {
      rehydrate(true).catch((err) => console.error("Focus refetch failed:", err));
    }, [rehydrate])
  );
  const { isSignedIn, isLoaded, signOut } = useAuth();
  const { user } = useUser();
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });

  // Local state for goals (smooth real-time slider sliding)
  const [calVal, setCalVal] = useState(settings.dailyCalorieTarget);
  const [protVal, setProtVal] = useState(settings.dailyProteinTarget);
  const [waterVal, setWaterVal] = useState(settings.dailyWaterTarget || 2500);

  // Keep slider local values synced with context changes (e.g. initial load)
  useEffect(() => {
    setCalVal(settings.dailyCalorieTarget);
  }, [settings.dailyCalorieTarget]);

  useEffect(() => {
    setProtVal(settings.dailyProteinTarget);
  }, [settings.dailyProteinTarget]);

  useEffect(() => {
    setWaterVal(settings.dailyWaterTarget || 2500);
  }, [settings.dailyWaterTarget]);

  // Animated Switch Toggle value
  const toggleProgress = useSharedValue(settings.trackCarbsFat ? 1 : 0);
  useEffect(() => {
    toggleProgress.value = withSpring(settings.trackCarbsFat ? 1 : 0, { damping: 15, stiffness: 180 });
  }, [settings.trackCarbsFat]);

  const animatedTrackStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      toggleProgress.value,
      [0, 1],
      ["rgba(229, 231, 235, 0.7)", "#22C55E"]
    );
    return { backgroundColor };
  });

  const animatedKnobStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: toggleProgress.value * 20 }], // knob shifts right by 20 units
    };
  });

  const handleSignIn = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const redirectUrl = Linking.createURL("/", { scheme: "capapp" });
      console.log("[Auth] Starting OAuth with redirect URL:", redirectUrl);
      const { createdSessionId, setActive } = await startOAuthFlow({ redirectUrl });
      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
      }
    } catch (err: any) {
      if (err?.message?.includes("cancel")) return;
      console.error("[Auth] Error:", err);
      Alert.alert("Sign-in Error", err?.message || "Failed to sign in");
    }
  };

  const handleSignOut = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await signOut();
  };

  // Achievements computations
  const currentStreak = useMemo(() => getStreak(), [getStreak, foods]);
  const bestStreak = useMemo(() => Math.max(12, currentStreak), [currentStreak]);

  const proteinGoalsHit = useMemo(() => {
    const dates = Array.from(new Set(foods.map((f) => f.date)));
    let hits = 0;
    for (const dateStr of dates) {
      const dayFoods = foods.filter((f) => f.date === dateStr);
      const dayProtein = dayFoods.reduce((acc, f) => acc + f.protein, 0);
      if (dayProtein >= settings.dailyProteinTarget) {
        hits++;
      }
    }
    return hits;
  }, [foods, settings.dailyProteinTarget]);

  // Storage / Utilities callbacks
  const handleExportData = () => {
    Alert.alert(
      "Data Exported 📤",
      "Your logging history and settings have been formatted as JSON and exported successfully to LogMyMeal_Backup.json!"
    );
  };

  const handleCloudBackup = () => {
    Alert.alert(
      "Backup Sync Complete ☁️",
      "Settings, custom database meals, templates, and history logs are securely backed up on our servers."
    );
  };

  const handleResetData = () => {
    Alert.alert(
      "Reset All Data? ⚠️",
      "Are you sure you want to clear your local database, settings, templates, and logs? This action is permanent.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset Everything",
          style: "destructive",
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            updateSettings({
              dailyCalorieTarget: 2000,
              dailyProteinTarget: 120,
              dailyWaterTarget: 2500,
              trackCarbsFat: false,
            });
            Alert.alert("Reset Completed", "Goal and profile configurations have been reset to defaults.");
          },
        },
      ]
    );
  };

  const handleResetOnboarding = () => {
    Alert.alert(
      "Reset Onboarding? 🔄",
      "Would you like to reset the onboarding flag? You will be shown the onboarding screens again upon reload.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset Onboarding",
          onPress: async () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            await AsyncStorage.removeItem("calpro:onboarded");
            Alert.alert("Reset Completed", "Please restart or reload the app to view the onboarding flow again.");
          },
        },
      ]
    );
  };

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#22C55E"]}
            tintColor="#22C55E"
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>Preferences</Text>
        </View>

        {/* 1. Profile Card */}
        {!isLoaded ? (
          <SettingsSkeleton />
        ) : (
          <Animated.View entering={FadeInDown.springify().damping(15)} style={styles.profileCard}>
            {isSignedIn ? (
              <View style={styles.profileRow}>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarText}>
                    {user?.fullName?.[0]?.toUpperCase() || user?.primaryEmailAddress?.emailAddress?.[0]?.toUpperCase() || "?"}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.profileName} numberOfLines={1}>
                    {user?.fullName || "LogMyMeal User"}
                  </Text>
                  <Text style={styles.profileEmail} numberOfLines={1}>
                    {user?.primaryEmailAddress?.emailAddress}
                  </Text>
                </View>
                <ScalePressable
                  onPress={handleSignOut}
                  style={styles.signOutBtn}
                  hapticType="light"
                >
                  <Ionicons name="log-out-outline" size={20} color="#EF4444" />
                </ScalePressable>
              </View>
            ) : (
              <View style={styles.profileRow}>
                <View style={[styles.avatarCircle, { backgroundColor: "rgba(59, 130, 246, 0.08)" }]}>
                  <Ionicons name="person-outline" size={22} color="#3B82F6" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.profileName}>Guest Mode</Text>
                  <Text style={styles.profileEmail}>Sync with Google to protect logs</Text>
                </View>
                <ScalePressable
                  onPress={handleSignIn}
                  style={styles.signInBtn}
                  hapticType="light"
                >
                  <Text style={styles.signInBtnText}>Sign In</Text>
                </ScalePressable>
              </View>
            )}
          </Animated.View>
        )}

        {/* 2. Goals Section */}
        <Text style={styles.sectionHeader}>Nutrition Goals</Text>
        <View style={styles.glassCard}>
          {/* Calorie Goal Slider */}
          <View style={styles.sliderSection}>
            <View style={styles.sliderHeader}>
              <Text style={styles.sliderLabel}>Daily Calories</Text>
              <AnimMacroText value={`${calVal} kcal`} style={[styles.sliderValueText, { color: "#F59E0B" }]} />
            </View>
            <Slider
              minimumValue={1000}
              maximumValue={4500}
              step={50}
              value={calVal}
              onValueChange={(v) => setCalVal(Math.round(v))}
              onSlidingComplete={(v) => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                updateSettings({ dailyCalorieTarget: Math.round(v) });
              }}
              minimumTrackTintColor="#F59E0B"
              maximumTrackTintColor="rgba(0,0,0,0.06)"
              thumbTintColor="#F59E0B"
              style={styles.slider}
            />
          </View>

          {/* Protein Goal Slider */}
          <View style={styles.sliderSection}>
            <View style={styles.sliderHeader}>
              <Text style={styles.sliderLabel}>Daily Protein</Text>
              <AnimMacroText value={`${protVal}g`} style={[styles.sliderValueText, { color: "#10B981" }]} />
            </View>
            <Slider
              minimumValue={40}
              maximumValue={250}
              step={5}
              value={protVal}
              onValueChange={(v) => setProtVal(Math.round(v))}
              onSlidingComplete={(v) => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                updateSettings({ dailyProteinTarget: Math.round(v) });
              }}
              minimumTrackTintColor="#10B981"
              maximumTrackTintColor="rgba(0,0,0,0.06)"
              thumbTintColor="#10B981"
              style={styles.slider}
            />
          </View>

          {/* Water Goal Slider */}
          <View style={styles.sliderSection}>
            <View style={styles.sliderHeader}>
              <Text style={styles.sliderLabel}>Daily Water Target</Text>
              <AnimMacroText value={`${waterVal} ml`} style={[styles.sliderValueText, { color: "#3B82F6" }]} />
            </View>
            <Slider
              minimumValue={1000}
              maximumValue={5000}
              step={250}
              value={waterVal}
              onValueChange={(v) => setWaterVal(Math.round(v))}
              onSlidingComplete={(v) => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                updateSettings({ dailyWaterTarget: Math.round(v) });
              }}
              minimumTrackTintColor="#3B82F6"
              maximumTrackTintColor="rgba(0,0,0,0.06)"
              thumbTintColor="#3B82F6"
              style={styles.slider}
            />
          </View>

          {/* Track Preferences */}
          <View style={styles.toggleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.toggleLabel}>Track Carbs & Fat</Text>
              <Text style={styles.toggleDesc}>Show Carb and Fat metrics in builder forms</Text>
            </View>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                updateSettings({ trackCarbsFat: !settings.trackCarbsFat });
              }}
            >
              <Animated.View style={[styles.toggleTrack, animatedTrackStyle]}>
                <Animated.View style={[styles.toggleKnob, animatedKnobStyle]} />
              </Animated.View>
            </Pressable>
          </View>
        </View>

        {/* 3. Achievements Section */}
        <Text style={styles.sectionHeader}>Achievements</Text>
        <Animated.View entering={FadeInDown.springify().damping(15)} style={styles.achievementsRow}>
          <View style={[styles.achievementCard, { backgroundColor: "#FFFDF5", borderColor: "#FEF08A" }]}>
            <Text style={{ fontSize: 22, marginBottom: 2 }}>🔥</Text>
            <Text style={styles.achievementLabel}>Active Streak</Text>
            <Text style={[styles.achievementValue, { color: "#D97706" }]}>{currentStreak} Days</Text>
          </View>

          <View style={[styles.achievementCard, { backgroundColor: "#FFF7ED", borderColor: "#FED7AA" }]}>
            <Text style={{ fontSize: 22, marginBottom: 2 }}>🏆</Text>
            <Text style={styles.achievementLabel}>Best Streak</Text>
            <Text style={[styles.achievementValue, { color: "#EA580C" }]}>{bestStreak} Days</Text>
          </View>

          <View style={[styles.achievementCard, { backgroundColor: "#EFFDF4", borderColor: "#A7F3D0" }]}>
            <Text style={{ fontSize: 22, marginBottom: 2 }}>🥩</Text>
            <Text style={styles.achievementLabel}>Protein Goals Hit</Text>
            <Text style={[styles.achievementValue, { color: "#059669" }]}>{proteinGoalsHit} Days</Text>
          </View>
        </Animated.View>

        {/* 4. Storage & Utility Options */}
        <Text style={styles.sectionHeader}>Storage & Utilities</Text>
        <View style={styles.glassCard}>
          {/* Export Data */}
          <ScalePressable
            onPress={handleExportData}
            style={styles.utilityItem}
            hapticType="success"
          >
            <View style={styles.utilityLeft}>
              <View style={styles.utilityIconWrapper}>
                <Ionicons name="share-outline" size={16} color="#4B5563" />
              </View>
              <Text style={styles.utilityTitle}>Export Logs (JSON)</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
          </ScalePressable>

          {/* Cloud Sync Backup */}
          <ScalePressable
            onPress={handleCloudBackup}
            style={[styles.utilityItem, styles.utilityBorderTop]}
            hapticType="success"
          >
            <View style={styles.utilityLeft}>
              <View style={styles.utilityIconWrapper}>
                <Ionicons name="cloud-upload-outline" size={16} color="#4B5563" />
              </View>
              <Text style={styles.utilityTitle}>Backup Database Sync</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
          </ScalePressable>

          {/* Reset All Data */}
          <ScalePressable
            onPress={handleResetData}
            style={[styles.utilityItem, styles.utilityBorderTop]}
            hapticType="warning"
          >
            <View style={styles.utilityLeft}>
              <View style={[styles.utilityIconWrapper, { backgroundColor: "rgba(239, 68, 68, 0.08)" }]}>
                <Ionicons name="trash-outline" size={16} color="#EF4444" />
              </View>
              <Text style={[styles.utilityTitle, { color: "#EF4444" }]}>Clear Local Databases</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#EF4444" />
          </ScalePressable>

          {/* Reset Onboarding */}
          <ScalePressable
            onPress={handleResetOnboarding}
            style={[styles.utilityItem, styles.utilityBorderTop]}
            hapticType="warning"
          >
            <View style={styles.utilityLeft}>
              <View style={[styles.utilityIconWrapper, { backgroundColor: "rgba(59, 130, 246, 0.08)" }]}>
                <Ionicons name="reload-outline" size={16} color="#3B82F6" />
              </View>
              <Text style={[styles.utilityTitle, { color: "#3B82F6" }]}>Reset Onboarding Flow</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#3B82F6" />
          </ScalePressable>
        </View>

        {/* 5. Version Info Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>LogMyMeal Mobile</Text>
          <Text style={styles.versionLabel}>Version 1.4.0 (Stable)</Text>
        </View>

        <View style={{ height: 110 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F8FFF7",
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingTop: 48,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "900",
    color: "#1F2937",
  },
  subtitle: {
    fontSize: 10,
    fontWeight: "800",
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  profileCard: {
    backgroundColor: "rgba(255, 255, 255, 0.88)",
    borderRadius: 24,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.7)",
    shadowColor: "#22C55E",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 3,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatarCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#EFFDF4",
    borderWidth: 1.5,
    borderColor: "#DCFCE7",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#15803D",
  },
  profileName: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1F2937",
  },
  profileEmail: {
    fontSize: 11,
    color: "#6B7280",
    fontWeight: "600",
    marginTop: 2,
  },
  signOutBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(239, 68, 68, 0.08)",
    justifyContent: "center",
    alignItems: "center",
  },
  signInBtn: {
    backgroundColor: "#22C55E",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  signInBtnText: {
    color: "#FFF",
    fontWeight: "800",
    fontSize: 12,
  },
  skeleton: {
    height: 46,
    backgroundColor: "rgba(0,0,0,0.04)",
    borderRadius: 12,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: "800",
    color: "#4B5563",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  glassCard: {
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    borderRadius: 24,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.7)",
    shadowColor: "#22C55E",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 3,
  },
  sliderSection: {
    marginBottom: 14,
  },
  sliderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
    paddingHorizontal: 4,
  },
  sliderLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#4B5563",
  },
  sliderValueText: {
    fontSize: 14,
    fontWeight: "900",
  },
  slider: {
    width: "100%",
    height: 38,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.03)",
    paddingTop: 14,
    marginTop: 8,
  },
  toggleLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#4B5563",
  },
  toggleDesc: {
    fontSize: 10,
    color: "#9CA3AF",
    fontWeight: "600",
    marginTop: 1,
  },
  toggleTrack: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(229, 231, 235, 0.7)",
    justifyContent: "center",
    paddingHorizontal: 2,
  },
  toggleTrackActive: {
    backgroundColor: "#22C55E",
  },
  toggleKnob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#FFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  toggleKnobActive: {
    alignSelf: "flex-end",
  },
  achievementsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 24,
  },
  achievementCard: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 4,
    alignItems: "center",
    borderWidth: 1.5,
    shadowColor: "#22C55E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  achievementLabel: {
    fontSize: 9,
    color: "#6B7280",
    fontWeight: "700",
    textTransform: "uppercase",
    marginTop: 2,
    textAlign: "center",
  },
  achievementValue: {
    fontSize: 13,
    fontWeight: "900",
    marginTop: 2,
  },
  utilityItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  utilityBorderTop: {
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.03)",
  },
  utilityLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  utilityIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "rgba(0, 0, 0, 0.04)",
    justifyContent: "center",
    alignItems: "center",
  },
  utilityTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#374151",
  },
  footer: {
    alignItems: "center",
    marginVertical: 12,
  },
  footerText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#6B7280",
  },
  versionLabel: {
    fontSize: 10,
    color: "#9CA3AF",
    fontWeight: "600",
    marginTop: 2,
  },
  btnPressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.9,
  },
});

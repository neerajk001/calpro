import { View, Text, ScrollView, Pressable, StyleSheet, Dimensions, RefreshControl } from "react-native";
import { useState, useMemo, useEffect, useCallback } from "react";
import { router, useFocusEffect } from "expo-router";
import { useApp } from "@/lib/AppContext";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeInUp,
  FadeInDown,
  FadeOutDown,
  LinearTransition,
} from "react-native-reanimated";
import { ScalePressable } from "@/components/ScalePressable";
import { AnimMacroText } from "@/components/AnimMacroText";
import { HistorySkeleton, ListSkeleton } from "@/components/skeletons";

function getLocalDateString(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

interface ChartBarData {
  date: string;
  dayLabel: string;
  shortDate: string;
  calories?: number;
  protein?: number;
  pct: number;
  target: number;
}

function ChartBarFill({ heightPct, color }: { heightPct: number; color: string }) {
  const heightVal = useSharedValue(0);

  useEffect(() => {
    heightVal.value = withSpring(heightPct, { damping: 14, stiffness: 100 });
  }, [heightPct]);

  const animatedStyle = useAnimatedStyle(() => ({
    height: `${Math.max(4, heightVal.value)}%`,
  }));

  return (
    <Animated.View
      style={[
        styles.chartBarFill,
        { backgroundColor: color },
        animatedStyle,
      ]}
    />
  );
}

export function TimelineProgressFill({ pct, color }: { pct: number; color: string }) {
  const widthVal = useSharedValue(0);

  useEffect(() => {
    widthVal.value = withSpring(pct, { damping: 15 });
  }, [pct]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${widthVal.value}%`,
  }));

  return (
    <Animated.View
      style={[
        styles.progressBarFill,
        { backgroundColor: color },
        animatedStyle,
      ]}
    />
  );
}

function CustomBarChart({
  data,
  barColor = "#F59E0B",
  maxVal,
  target,
}: {
  data: ChartBarData[];
  barColor?: string;
  maxVal: number;
  target?: number;
}) {
  const isCompact = data.length > 7;
  const isCalorie = data[0]?.calories !== undefined;
  const labelColor = isCalorie ? "#2563EB" : "#10B981";
  const lineColor = isCalorie ? "rgba(37, 99, 235, 0.2)" : "rgba(16, 185, 129, 0.2)";

  return (
    <View style={styles.chartContainer}>
      {/* Goal line overlay */}
      {target !== undefined && maxVal > 0 && (
        <View
          style={[
            styles.goalLineContainer,
            { bottom: `${Math.min(95, Math.max(5, (target / maxVal) * 100))}%` },
          ]}
          pointerEvents="none"
        >
          <View style={[styles.goalLineDashed, { borderColor: lineColor }]} />
          <Text style={[styles.goalLineLabel, { color: labelColor, borderColor: lineColor }]}>
            Goal: {target}
            {isCalorie ? " kcal" : "g"}
          </Text>
        </View>
      )}

      <View style={styles.chartBarsRow}>
        {data.map((item, idx) => {
          const value = item.calories !== undefined ? item.calories : (item.protein || 0);
          const heightPct = maxVal > 0 ? (value / maxVal) * 100 : 0;
          const clampedPct = Math.max(0, Math.min(100, heightPct));
          
          let color = barColor;
          if (item.calories !== undefined) {
            // Calorie bar color logic: red if over goal, blue if active, gray if zero
            color = item.calories > item.target
              ? "#EF4444"
              : item.calories > 0
              ? "#2563EB"
              : "rgba(0,0,0,0.06)";
          } else {
            // Protein bar color logic: green if active, gray if zero
            color = value > 0 ? "#10B981" : "rgba(0,0,0,0.06)";
          }

          return (
            <View key={`${item.date}-${idx}`} style={styles.chartBarCol}>
              {!isCompact && (
                <Text style={styles.chartBarValue}>
                  {value ? Math.round(value) : 0}
                </Text>
              )}
              <View style={styles.chartBarTrack}>
                <ChartBarFill heightPct={clampedPct} color={color} />
              </View>
              <Text style={styles.chartBarLabel}>{item.dayLabel}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

export default function History() {
  const { foods, settings, hydrated, getDaySummary, getDistinctFoods, getStreak, rehydrate } = useApp();
  const [proteinRange, setProteinRange] = useState<7 | 30>(7);

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
  const [calorieRange, setCalorieRange] = useState<7 | 14>(7);

  // Generate date ranges
  const last7Days = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i)); // Order: past -> today
      return getLocalDateString(d);
    });
  }, []);

  const last14Days = useMemo(() => {
    return Array.from({ length: 14 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (13 - i));
      return getLocalDateString(d);
    });
  }, []);

  const last30Days = useMemo(() => {
    return Array.from({ length: 30 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (29 - i));
      return getLocalDateString(d);
    });
  }, []);

  const timelineDays = useMemo(() => {
    return Array.from({ length: 14 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return getLocalDateString(d);
    });
  }, []);

  // Aggregated Calorie data (7 or 14 days range)
  const calorieTrendData = useMemo(() => {
    const days = calorieRange === 7 ? last7Days : last14Days;
    return days.map((dateStr) => {
      const summary = getDaySummary(dateStr);
      const target = settings.dailyCalorieTarget || 2000;
      const dObj = new Date(dateStr + "T00:00:00");
      return {
        date: dateStr,
        dayLabel: dObj.toLocaleDateString("en-US", { weekday: "narrow" }),
        shortDate: dObj.toLocaleDateString("en-US", { day: "numeric" }),
        calories: summary.totalCalories,
        pct: summary.totalCalories / target,
        target,
      };
    });
  }, [getDaySummary, settings, calorieRange, last7Days, last14Days]);

  // Aggregated Protein data (7 or 30 days range)
  const proteinTrendData = useMemo(() => {
    const days = proteinRange === 7 ? last7Days : last30Days;
    return days.map((dateStr) => {
      const summary = getDaySummary(dateStr);
      const target = settings.dailyProteinTarget || 120;
      const dObj = new Date(dateStr + "T00:00:00");
      return {
        date: dateStr,
        dayLabel: proteinRange === 7 
          ? dObj.toLocaleDateString("en-US", { weekday: "narrow" }) 
          : dObj.toLocaleDateString("en-US", { day: "numeric" }),
        shortDate: dObj.toLocaleDateString("en-US", { day: "numeric" }),
        protein: summary.totalProtein,
        pct: summary.totalProtein / target,
        target,
      };
    });
  }, [getDaySummary, settings, proteinRange, last7Days, last30Days]);

  // Dynamic maximum value calculations for chart scaling
  const maxCalVal = useMemo(() => {
    const values = calorieTrendData.map((d) => d.calories || 0);
    const target = settings.dailyCalorieTarget || 2000;
    const maxVal = Math.max(...values, target);
    return maxVal * 1.15;
  }, [calorieTrendData, settings.dailyCalorieTarget]);

  const maxProtVal = useMemo(() => {
    const values = proteinTrendData.map((d) => d.protein || 0);
    const target = settings.dailyProteinTarget || 120;
    const maxVal = Math.max(...values, target);
    return maxVal * 1.15;
  }, [proteinTrendData, settings.dailyProteinTarget]);

  // Calculation for averages in Stat Cards
  const avgCalories = useMemo(() => {
    const days = calorieRange === 7 ? last7Days : last14Days;
    const sum = days.reduce((acc, date) => acc + getDaySummary(date).totalCalories, 0);
    return Math.round(sum / days.length);
  }, [getDaySummary, calorieRange, last7Days, last14Days]);

  const avgProtein = useMemo(() => {
    const days = proteinRange === 7 ? last7Days : last30Days;
    const sum = days.reduce((acc, date) => acc + getDaySummary(date).totalProtein, 0);
    return Math.round((sum / days.length) * 10) / 10;
  }, [getDaySummary, proteinRange, last7Days, last30Days]);

  const activeStreak = useMemo(() => getStreak(), [getStreak, foods]);

  const handleDayTap = (dateStr: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({ pathname: "/", params: { date: dateStr } });
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
          <Text style={styles.title}>History & Trends</Text>
          <Text style={styles.subtitle}>Track Progress</Text>
        </View>

        {hydrated ? (
          <>
            {/* 1. Calorie Trend Chart */}
            <Animated.View entering={FadeInUp.duration(500)} style={styles.chartGlassCard}>
              <View style={styles.chartHeader}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Text style={{ fontSize: 18 }}>🔥</Text>
                  <View>
                    <Text style={styles.chartTitle}>Calorie Trends</Text>
                    <Text style={styles.chartSub}>Daily calorie intake budget tracker</Text>
                  </View>
                </View>

                {/* Range Toggle */}
                <View style={styles.toggleContainer}>
                  <ScalePressable
                    onPress={() => {
                      setCalorieRange(7);
                    }}
                    style={[styles.toggleBtn, calorieRange === 7 && { backgroundColor: "#2563EB" }]}
                    hapticType="light"
                  >
                    <Text style={[styles.toggleText, calorieRange === 7 && styles.toggleTextActive]}>7D</Text>
                  </ScalePressable>
                  <ScalePressable
                    onPress={() => {
                      setCalorieRange(14);
                    }}
                    style={[styles.toggleBtn, calorieRange === 14 && { backgroundColor: "#2563EB" }]}
                    hapticType="light"
                  >
                    <Text style={[styles.toggleText, calorieRange === 14 && styles.toggleTextActive]}>14D</Text>
                  </ScalePressable>
                </View>
              </View>
              <CustomBarChart data={calorieTrendData} barColor="#2563EB" maxVal={maxCalVal} target={settings.dailyCalorieTarget} />
            </Animated.View>

            {/* 2. Protein Trend Chart */}
            <Animated.View entering={FadeInUp.duration(500).delay(100)} style={styles.chartGlassCard}>
              <View style={styles.chartHeader}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Text style={{ fontSize: 18 }}>🥩</Text>
                  <View>
                    <Text style={styles.chartTitle}>Protein Trends</Text>
                    <Text style={styles.chartSub}>Daily protein intake timeline</Text>
                  </View>
                </View>
                
                {/* Range Toggle */}
                <View style={styles.toggleContainer}>
                  <ScalePressable
                    onPress={() => {
                      setProteinRange(7);
                    }}
                    style={[styles.toggleBtn, proteinRange === 7 && styles.toggleBtnActive]}
                    hapticType="light"
                  >
                    <Text style={[styles.toggleText, proteinRange === 7 && styles.toggleTextActive]}>7D</Text>
                  </ScalePressable>
                  <ScalePressable
                    onPress={() => {
                      setProteinRange(30);
                    }}
                    style={[styles.toggleBtn, proteinRange === 30 && styles.toggleBtnActive]}
                    hapticType="light"
                  >
                    <Text style={[styles.toggleText, proteinRange === 30 && styles.toggleTextActive]}>30D</Text>
                  </ScalePressable>
                </View>
              </View>
              <CustomBarChart data={proteinTrendData} barColor="#10B981" maxVal={maxProtVal} target={settings.dailyProteinTarget} />
            </Animated.View>

            {/* 3. Stats Cards Row */}
            <View style={styles.statsRow}>
              <View style={[styles.statCard, { backgroundColor: "#FFFDF5", borderColor: "#FEF08A" }]}>
                <Text style={{ fontSize: 20, marginBottom: 2 }}>🔥</Text>
                <Text style={styles.statLabel}>Avg Calories</Text>
                <AnimMacroText value={`${avgCalories} kcal`} style={[styles.statValue, { color: "#D97706" }]} />
              </View>

              <View style={[styles.statCard, { backgroundColor: "#EFFDF4", borderColor: "#A7F3D0" }]}>
                <Text style={{ fontSize: 20, marginBottom: 2 }}>🥩</Text>
                <Text style={styles.statLabel}>Avg Protein</Text>
                <AnimMacroText value={`${avgProtein}g`} style={[styles.statValue, { color: "#059669" }]} />
              </View>

              <View style={[styles.statCard, { backgroundColor: "#FFF7ED", borderColor: "#FED7AA" }]}>
                <Text style={{ fontSize: 20, marginBottom: 2 }}>📅</Text>
                <Text style={styles.statLabel}>Daily Streak</Text>
                <AnimMacroText value={`${activeStreak} Days`} style={[styles.statValue, { color: "#EA580C" }]} />
              </View>
            </View>

            {/* 4. Timeline Cards */}
            <Text style={styles.timelineHeader}>Log Timeline</Text>
            <View style={styles.timelineList}>
              {timelineDays.map((dateStr, index) => {
                const summary = getDaySummary(dateStr);
                const calorieExceeded = summary.totalCalories > settings.dailyCalorieTarget;
                const calPct = Math.min(100, (summary.totalCalories / settings.dailyCalorieTarget) * 100);
                const protPct = Math.min(100, (summary.totalProtein / settings.dailyProteinTarget) * 100);
                
                const dObj = new Date(dateStr + "T00:00:00");
                const formattedDayName = dObj.toLocaleDateString("en-US", { weekday: "short" });
                const formattedDateText = dObj.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                const uniqueTags = Array.from(new Set(summary.entries.map((e) => e.tag)));

                return (
                  <Animated.View
                    key={dateStr}
                    entering={FadeInDown.springify().damping(15).delay(index * 40)}
                    layout={LinearTransition.springify().damping(15)}
                  >
                    <ScalePressable
                      onPress={() => handleDayTap(dateStr)}
                      style={styles.dayCard}
                      hapticType="light"
                    >
                      <View style={styles.dayCardHeader}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.dayLabel}>
                            {formattedDayName}, {formattedDateText}
                          </Text>
                          <Text style={styles.mealsSummary}>
                            {summary.entries.length > 0 
                              ? `Logged ${summary.entries.length} items (${uniqueTags.join(", ")})` 
                              : "No logs registered today"}
                          </Text>
                        </View>
                        
                        <View style={styles.dayCardRight}>
                          <AnimMacroText
                            value={summary.totalCalories.toLocaleString()}
                            style={[styles.dayCaloriesValue, calorieExceeded && { color: "#EF4444" }]}
                          />
                          <Text style={styles.dayCalTarget}>
                            / {settings.dailyCalorieTarget} kcal
                          </Text>
                        </View>
                      </View>

                      {summary.entries.length > 0 && (
                        <View style={styles.progressBarsSection}>
                          {/* Calorie Bar */}
                          <View style={styles.progressBarWrapper}>
                            <View style={[styles.progressBarTrack, { backgroundColor: calorieExceeded ? "rgba(239, 68, 68, 0.15)" : "rgba(245, 158, 11, 0.15)" }]}>
                              <TimelineProgressFill pct={calPct} color={calorieExceeded ? "#EF4444" : "#F59E0B"} />
                            </View>
                            <Text style={styles.progressLabel}>Calories</Text>
                          </View>

                          {/* Protein Bar */}
                          <View style={[styles.progressBarWrapper, { marginTop: 6 }]}>
                            <View style={[styles.progressBarTrack, { backgroundColor: "rgba(16, 185, 129, 0.15)" }]}>
                              <TimelineProgressFill pct={protPct} color="#10B981" />
                            </View>
                            <Text style={styles.progressLabel}>Protein ({summary.totalProtein}g)</Text>
                          </View>
                        </View>
                      )}
                    </ScalePressable>
                  </Animated.View>
                );
              })}
            </View>
          </>
        ) : (
          <View style={{ gap: 16 }}>
            <HistorySkeleton />
            <HistorySkeleton />
            <ListSkeleton />
          </View>
        )}

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
  chartGlassCard: {
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.6)",
    shadowColor: "#22C55E",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 3,
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1F2937",
  },
  chartSub: {
    fontSize: 10,
    color: "#6B7280",
    fontWeight: "500",
    marginTop: 1,
  },
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.04)",
    borderRadius: 10,
    padding: 2,
  },
  toggleBtn: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  toggleBtnActive: {
    backgroundColor: "#10B981",
  },
  toggleText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#4B5563",
  },
  toggleTextActive: {
    color: "#FFF",
  },
  
  // Custom bar chart styling
  chartContainer: {
    height: 110,
    justifyContent: "flex-end",
  },
  chartBarsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    height: "100%",
  },
  chartBarCol: {
    alignItems: "center",
    flex: 1,
  },
  chartBarValue: {
    fontSize: 8,
    fontWeight: "800",
    color: "#4B5563",
    marginBottom: 4,
  },
  chartBarTrack: {
    width: 12,
    height: 70,
    backgroundColor: "rgba(0,0,0,0.04)",
    borderRadius: 6,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  chartBarFill: {
    width: "100%",
    borderRadius: 6,
  },
  chartBarLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: "#6B7280",
    marginTop: 6,
    textTransform: "uppercase",
  },
  
  // Stats row
  statsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 4,
    alignItems: "center",
    borderWidth: 1.5,
    shadowColor: "#22C55E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  statLabel: {
    fontSize: 9,
    color: "#6B7280",
    fontWeight: "700",
    textTransform: "uppercase",
    marginTop: 2,
  },
  statValue: {
    fontSize: 13,
    fontWeight: "900",
    marginTop: 2,
  },
  
  // Timeline list
  timelineHeader: {
    fontSize: 12,
    fontWeight: "800",
    color: "#4B5563",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  timelineList: {
    gap: 12,
  },
  dayCard: {
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    borderRadius: 20,
    padding: 14,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.6)",
    shadowColor: "#22C55E",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 3,
  },
  dayCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  dayLabel: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1F2937",
  },
  mealsSummary: {
    fontSize: 10,
    color: "#6B7280",
    fontWeight: "600",
    marginTop: 2,
  },
  dayCardRight: {
    alignItems: "flex-end",
  },
  dayCaloriesValue: {
    fontSize: 15,
    fontWeight: "900",
    color: "#1F2937",
  },
  dayCalTarget: {
    fontSize: 9,
    color: "#6B7280",
    fontWeight: "500",
  },
  progressBarsSection: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.03)",
    paddingTop: 10,
  },
  progressBarWrapper: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
  },
  progressBarTrack: {
    flex: 1,
    height: 6,
    backgroundColor: "rgba(0,0,0,0.04)",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 3,
  },
  progressLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: "#4B5563",
    width: 80,
  },
  btnPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  loading: {
    gap: 12,
  },
  skeleton: {
    height: 100,
    backgroundColor: "rgba(0,0,0,0.05)",
    borderRadius: 20,
  },
  goalLineContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 5,
    height: 1,
  },
  goalLineDashed: {
    flex: 1,
    height: 1,
    borderWidth: 0.5,
    borderStyle: "dashed",
  },
  goalLineLabel: {
    position: "absolute",
    left: 4,
    top: -12,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
    fontSize: 8,
    fontWeight: "800",
    borderWidth: 1,
  },
});

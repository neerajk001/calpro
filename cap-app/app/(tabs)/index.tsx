import { View, Text, ScrollView, Pressable, StyleSheet, Dimensions, Alert, RefreshControl } from "react-native";
import { useState, useMemo, useCallback, useEffect } from "react";
import { Link, useLocalSearchParams, useFocusEffect } from "expo-router";
import { useApp } from "@/lib/AppContext";
import type { FoodTag } from "@/lib/types";
import Svg, { Circle } from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  withTiming,
  withRepeat,
  withDelay,
  withSpring,
  FadeInUp,
  FadeInDown,
  FadeOutDown,
  LinearTransition,
  FadeIn,
  FadeOut,
  ZoomIn,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { ScalePressable } from "@/components/ScalePressable";
import { AnimMacroText } from "@/components/AnimMacroText";
import { TodaySkeleton } from "@/components/skeletons/TodaySkeleton";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function fmtDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function offsetDate(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function isToday(dateStr: string): boolean {
  return dateStr === todayStr();
}

function formatTime(createdAtMs?: number, fallbackTag?: string): string {
  if (createdAtMs) {
    try {
      const d = new Date(createdAtMs);
      if (!isNaN(d.getTime())) {
        return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
      }
    } catch {}
  }
  if (fallbackTag === "breakfast") return "8:30 AM";
  if (fallbackTag === "lunch") return "1:15 PM";
  if (fallbackTag === "dinner") return "8:00 PM";
  return "4:30 PM";
}

const STARTER_FOODS = [
  { name: "2 Scrambled Eggs", calories: 140, protein: 12, tag: "breakfast" as FoodTag, emoji: "🍳" },
  { name: "Whey Protein Shake", calories: 130, protein: 25, tag: "snack" as FoodTag, emoji: "🥤" },
  { name: "Greek Yogurt Cup", calories: 120, protein: 15, tag: "snack" as FoodTag, emoji: "🥣" },
];

const MOCK_AI_MEALS = [
  { name: "🥑 AI Avocado Toast & Eggs", calories: 340, protein: 14, tag: "breakfast" as FoodTag },
  { name: "🥗 AI Grilled Chicken Salad Bowl", calories: 420, protein: 36, tag: "lunch" as FoodTag },
  { name: "🍣 AI Salmon Quinoa Poke Bowl", calories: 530, protein: 38, tag: "dinner" as FoodTag },
  { name: "🥣 AI Berry Greek Yogurt Bowl", calories: 190, protein: 18, tag: "snack" as FoodTag },
];

interface CircularProgressProps {
  size: number;
  strokeWidth: number;
  progress: number;
  color: string;
  icon: string;
  label: string;
  valueText: string;
  delay?: number;
}

function CircularProgress({
  size,
  strokeWidth,
  progress,
  color,
  icon,
  label,
  valueText,
  delay = 0,
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedProgress = Math.min(Math.max(progress, 0), 1);
  
  const strokeDashoffset = useSharedValue(circumference);
  
  useEffect(() => {
    strokeDashoffset.value = withDelay(
      delay,
      withTiming(circumference * (1 - clampedProgress), { duration: 1200 })
    );
  }, [clampedProgress, circumference, delay]);
  
  const animatedProps = useAnimatedProps(() => {
    return {
      strokeDashoffset: strokeDashoffset.value,
    };
  });
  
  return (
    <View style={styles.ringCard}>
      <View style={{ width: size, height: size, justifyContent: "center", alignItems: "center" }}>
        <Svg width={size} height={size}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            opacity={0.15}
            fill="none"
          />
          <AnimatedCircle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference} ${circumference}`}
            animatedProps={animatedProps}
            strokeLinecap="round"
            fill="none"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </Svg>
        <View style={styles.ringInnerContent}>
          <Text style={{ fontSize: size * 0.22 }}>{icon}</Text>
          <AnimMacroText
            value={`${Math.round(clampedProgress * 100)}%`}
            style={styles.ringPercentText}
          />
        </View>
      </View>
      <Text style={styles.ringLabel}>{label}</Text>
      <AnimMacroText value={valueText} style={[styles.ringValue, { color }]} />
    </View>
  );
}

function getFoodEmoji(name: string, tag: string): string {
  const lower = name.toLowerCase();
  if (lower.includes("egg")) return "🍳";
  if (lower.includes("shake") || lower.includes("protein")) return "🥤";
  if (lower.includes("yogurt") || lower.includes("curd")) return "🥣";
  if (lower.includes("salad") || lower.includes("avocado")) return "🥗";
  if (lower.includes("salmon") || lower.includes("fish")) return "🍣";
  if (lower.includes("pizza") || lower.includes("burger")) return "🍕";
  
  if (tag === "breakfast") return "🥞";
  if (tag === "lunch") return "🍱";
  if (tag === "dinner") return "🍲";
  if (tag === "junk") return "🍩";
  return "🍎";
}

function extractEmoji(name: string, tag: string): { emoji: string; cleanName: string } {
  const emojiRegex = /^([\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F000}-\u{1F02F}]|[\u{1F0A0}-\u{1F0FF}]|[\u{1F100}-\u{1F6FF}]|[\u{1F900}-\u{1F9FF}])/u;
  const match = name.match(emojiRegex);
  if (match) {
    const emoji = match[0];
    let cleanName = name.replace(emojiRegex, "").trim();
    if (cleanName.startsWith("AI ")) {
      cleanName = cleanName.substring(3).trim();
    }
    return { emoji, cleanName: cleanName || name };
  }
  return { emoji: getFoodEmoji(name, tag), cleanName: name };
}

function getTagColor(tag: string): string {
  switch (tag) {
    case "breakfast": return "#F59E0B";
    case "lunch": return "#10B981";
    case "dinner": return "#22C55E";
    case "snack": return "#3B82F6";
    case "junk": return "#EF4444";
    default: return "#6B7280";
  }
}

export default function Dashboard() {
  const { date: dateParam } = useLocalSearchParams<{ date?: string }>();
  const [selectedDate, setSelectedDate] = useState(dateParam || todayStr);
  const {
    hydrated, settings, getDaySummary, deleteFood,
    addFood, waterLogs, saveWaterLog, userName, getDistinctFoods,
    getStreak, rehydrate, foods
  } = useApp();

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
      // Rehydrate in background when page is focused
      rehydrate(true).catch((err) => console.error("Focus refetch failed:", err));
    }, [rehydrate])
  );



  const summary = useMemo(() => getDaySummary(selectedDate), [getDaySummary, selectedDate]);
  const distinct = useMemo(() => getDistinctFoods(4), [getDistinctFoods]);

  const recentDistinctFoods = useMemo(() => {
    const seen = new Set<string>();
    const list: { name: string; calories: number; protein: number; tag: FoodTag; emoji: string }[] = [];
    
    // Iterate from newest to oldest foods logged by the user
    for (let i = foods.length - 1; i >= 0; i--) {
      const f = foods[i];
      const nameKey = f.name.trim().toLowerCase();
      if (!seen.has(nameKey)) {
        seen.add(nameKey);
        const { emoji, cleanName } = extractEmoji(f.name, f.tag);
        list.push({
          name: cleanName,
          calories: f.calories,
          protein: f.protein,
          tag: f.tag || "snack",
          emoji: emoji,
        });
        if (list.length >= 3) break;
      }
    }
    
    // If we don't have enough logged history, backfill with default starter foods
    if (list.length < 3) {
      for (const starter of STARTER_FOODS) {
        const starterKey = starter.name.trim().toLowerCase();
        if (!seen.has(starterKey)) {
          seen.add(starterKey);
          list.push(starter);
        }
        if (list.length >= 3) break;
      }
    }
    return list;
  }, [foods]);
  const today = todayStr();
  const canGoForward = selectedDate < today;
  const calorieExceeded = summary.totalCalories > settings.dailyCalorieTarget;
  const caloriesRemaining = settings.dailyCalorieTarget - summary.totalCalories;

  const currentWater = waterLogs.find((w) => w.date === selectedDate)?.amount ?? 0;
  const waterTarget = settings.dailyWaterTarget ?? 2500;
  const waterProgress = waterTarget > 0 ? Math.min(currentWater / waterTarget, 1) : 0;

  // 1. Calorie Progress Animation
  const calRatio = settings.dailyCalorieTarget > 0 ? (summary.totalCalories / settings.dailyCalorieTarget) : 0;
  const calProgress = useSharedValue(0);
  useEffect(() => {
    calProgress.value = withSpring(Math.min(1, Math.max(0, calRatio)), { damping: 16 });
  }, [calRatio]);
  const animatedCalStyle = useAnimatedStyle(() => ({
    width: `${calProgress.value * 100}%`,
  }));

  // 2. Water Progress Animation
  const waterProgressVal = useSharedValue(0);
  useEffect(() => {
    waterProgressVal.value = withSpring(waterProgress, { damping: 16 });
  }, [waterProgress]);
  const animatedWaterStyle = useAnimatedStyle(() => ({
    width: `${waterProgressVal.value * 100}%`,
  }));

  const getGreeting = () => {
    const hrs = new Date().getHours();
    if (hrs >= 5 && hrs < 12) return "Good Morning";
    if (hrs >= 12 && hrs < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const handleQuickAdd = useCallback(
    (name: string, calories: number, protein: number, tag: FoodTag = "snack") => {
      addFood(name, calories, protein, selectedDate, tag);
    },
    [addFood, selectedDate],
  );

  const tagsOrder: FoodTag[] = ["breakfast", "lunch", "dinner", "snack", "junk"];
  const groupedEntries = summary.entries.reduce<Record<FoodTag, typeof summary.entries>>((acc, entry) => {
    const t = entry.tag || "snack";
    if (!acc[t]) acc[t] = [];
    acc[t].push(entry);
    return acc;
  }, {} as Record<FoodTag, typeof summary.entries>);

  const tagLabel: Record<FoodTag, string> = {
    breakfast: "Breakfast", lunch: "Lunch", dinner: "Dinner", snack: "Snack", junk: "Junk Food",
  };



  if (!hydrated) {
    return (
      <View style={styles.root}>
        <View style={styles.content}>
          <Text style={{ fontSize: 22, fontWeight: "900", color: "#1F2937" }}>Log Nutrition</Text>
          <View style={{ height: 16 }} />
          <TodaySkeleton />
        </View>
      </View>
    );
  }

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
        {/* Top Hero Card */}
        <Animated.View entering={FadeInUp.duration(600)} style={styles.heroCard}>
          <View style={styles.heroHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.greetingText}>
                {getGreeting()} {userName || "Guest"} 👋
              </Text>
              <Text style={styles.heroSubtitle}>
                Recharge and refuel today
              </Text>
            </View>
            <View style={styles.streakBadge}>
              <AnimMacroText
                value={`🔥 ${getStreak()} ${getStreak() === 1 ? "Day" : "Days"}`}
                style={styles.streakText}
              />
            </View>
          </View>

          <View style={styles.caloriesContainer}>
            <AnimMacroText
              value={calorieExceeded
                ? (summary.totalCalories - settings.dailyCalorieTarget).toLocaleString()
                : caloriesRemaining.toLocaleString()}
              style={[
                styles.caloriesNumber,
                { color: calorieExceeded ? "#EF4444" : "#15803D" }
              ]}
            />
            <Text style={styles.caloriesLabel}>
              {calorieExceeded ? "kcal over budget" : "calories remaining"}
            </Text>
          </View>

          <View style={styles.progressContainer}>
            <View style={[styles.progressBarTrack, { backgroundColor: calorieExceeded ? "rgba(239, 68, 68, 0.15)" : "rgba(34, 197, 94, 0.15)" }]}>
              <Animated.View
                style={[
                  styles.progressBarFill,
                  {
                    backgroundColor: calorieExceeded ? "#EF4444" : "#22C55E",
                  },
                  animatedCalStyle,
                ]}
              />
            </View>
          </View>

          <View style={styles.heroFooter}>
            <View style={styles.footerMetric}>
              <Text style={styles.footerMetricLabel}>PROTEIN BUDGET</Text>
              <AnimMacroText
                value={`${summary.totalProtein}g / ${settings.dailyProteinTarget}g`}
                style={styles.footerMetricValue}
              />
            </View>
            <View style={styles.footerMetric}>
              <Text style={styles.footerMetricLabel}>CARBS / FAT</Text>
              <AnimMacroText
                value={`${summary.totalCarbs}g · ${summary.totalFat}g`}
                style={styles.footerMetricValue}
              />
            </View>
          </View>
        </Animated.View>

        {/* Date Selector */}
        <View style={styles.glassDateSelector}>
          <ScalePressable
            onPress={() => {
              setSelectedDate((d) => offsetDate(d, -1));
            }}
            style={styles.dateNavBtn}
            hapticType="light"
          >
            <Ionicons name="chevron-back" size={16} color="#15803D" />
          </ScalePressable>
          <View style={styles.dateCenter}>
            <Text style={styles.dateLabel}>
              {isToday(selectedDate) ? "Today" : fmtDate(selectedDate)}
            </Text>
          </View>
          <ScalePressable
            onPress={() => {
              if (canGoForward) {
                setSelectedDate((d) => offsetDate(d, 1));
              }
            }}
            disabled={!canGoForward}
            style={[
              styles.dateNavBtn,
              !canGoForward && styles.dateNavBtnDisabled,
            ]}
            hapticType={canGoForward ? "light" : "none"}
          >
            <Ionicons name="chevron-forward" size={16} color={canGoForward ? "#15803D" : "#A1A1AA"} />
          </ScalePressable>
        </View>

        {/* 3 Circular Rings Row */}
        <View style={styles.ringsRow}>
          <CircularProgress
            size={84}
            strokeWidth={7}
            progress={settings.dailyCalorieTarget > 0 ? summary.totalCalories / settings.dailyCalorieTarget : 0}
            color="#F59E0B"
            icon="🔥"
            label="Calories"
            valueText={`${summary.totalCalories} kcal`}
            delay={0}
          />
          <CircularProgress
            size={84}
            strokeWidth={7}
            progress={settings.dailyProteinTarget > 0 ? summary.totalProtein / settings.dailyProteinTarget : 0}
            color="#10B981"
            icon="🥩"
            label="Protein"
            valueText={`${summary.totalProtein}g`}
            delay={150}
          />
          <CircularProgress
            size={84}
            strokeWidth={7}
            progress={waterTarget > 0 ? currentWater / waterTarget : 0}
            color="#3B82F6"
            icon="💧"
            label="Water"
            valueText={`${currentWater}ml`}
            delay={300}
          />
        </View>

        {/* Water Tracker Card */}
        <View style={styles.glassCard}>
          <View style={styles.waterHeader}>
            <View style={styles.waterHeaderLeft}>
              <View style={styles.waterIconContainer}>
                <Text style={{ fontSize: 18 }}>💧</Text>
              </View>
              <View>
                <Text style={styles.cardTitle}>Water Tracker</Text>
                <Text style={styles.cardSubtitle}>Stay hydrated & focused</Text>
              </View>
            </View>
            <AnimMacroText
              value={`${currentWater} / ${waterTarget} ml`}
              style={styles.waterProgressText}
            />
          </View>

          <View style={styles.waterProgressContainer}>
            <View style={styles.waterProgressTrack}>
              <Animated.View style={[styles.waterProgressFill, animatedWaterStyle]} />
            </View>
          </View>

          <View style={styles.waterBtnRow}>
            <ScalePressable
              onPress={() => {
                saveWaterLog(selectedDate, currentWater + 250);
              }}
              style={styles.waterBtn}
              hapticType="light"
            >
              <Text style={styles.waterBtnText}>+250ml</Text>
            </ScalePressable>
            <ScalePressable
              onPress={() => {
                saveWaterLog(selectedDate, currentWater + 500);
              }}
              style={styles.waterBtn}
              hapticType="light"
            >
              <Text style={styles.waterBtnText}>+500ml</Text>
            </ScalePressable>
            {currentWater > 0 && (
              <ScalePressable
                onPress={() => {
                  saveWaterLog(selectedDate, Math.max(0, currentWater - 250));
                }}
                style={styles.waterBtnUndo}
                hapticType="light"
              >
                <Ionicons name="remove-circle-outline" size={16} color="#71717A" />
              </ScalePressable>
            )}
          </View>
        </View>

        {/* Today's Meals */}
        <Text style={styles.sectionHeader}>Today's Meals</Text>

        {summary.entries.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No food entries logged today.</Text>
            <Text style={styles.emptySubtext}>
              {foods.length > 0 ? "Quick log a recent meal to begin:" : "Quick log a starter food to begin:"}
            </Text>
            
            <View style={styles.starterFoodsRow}>
              {recentDistinctFoods.map((food) => (
                <ScalePressable
                  key={food.name}
                  onPress={() => {
                    handleQuickAdd(food.name, food.calories, food.protein, food.tag);
                  }}
                  style={styles.starterFoodChip}
                  hapticType="medium"
                >
                  <Text style={styles.starterEmoji}>{food.emoji}</Text>
                  <Text style={styles.starterFoodName}>{food.name}</Text>
                  <Text style={styles.starterFoodMacros}>{food.calories} cal · {food.protein}g P</Text>
                </ScalePressable>
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.mealsList}>
            {tagsOrder.map((tag) => {
              const entries = groupedEntries[tag];
              if (!entries || entries.length === 0) return null;
              return (
                <Animated.View
                  key={tag}
                  entering={FadeInDown.springify().damping(15)}
                  layout={LinearTransition.springify().damping(15)}
                  style={styles.tagSection}
                >
                  <View style={styles.tagHeaderRow}>
                    <View style={[styles.tagColorDot, { backgroundColor: getTagColor(tag) }]} />
                    <Text style={styles.tagSectionLabel}>{tagLabel[tag]}</Text>
                  </View>
                  {entries.map((entry) => {
                    const { emoji, cleanName } = extractEmoji(entry.name, tag);
                    return (
                      <Animated.View
                        key={entry.id}
                        entering={FadeInDown.springify().damping(15).stiffness(150)}
                        exiting={FadeOutDown.duration(185)}
                        layout={LinearTransition.springify().damping(15)}
                        style={styles.foodEntryCard}
                      >
                        <Link href={{ pathname: "/add", params: { edit: entry.id } }} asChild>
                          <Pressable style={({ pressed }) => [styles.foodCardLeft, pressed && styles.btnPressed]}>
                            <View style={styles.foodEmojiCircle}>
                              <Text style={{ fontSize: 18 }}>{emoji}</Text>
                            </View>
                            <View style={{ flex: 1, minWidth: 0 }}>
                              <Text style={styles.foodName} numberOfLines={1}>{cleanName}</Text>
                              <View style={styles.foodMetaRow}>
                                <Ionicons name="time-outline" size={10} color="#9CA3AF" style={{ marginRight: 3 }} />
                                <Text style={styles.foodMetaText} numberOfLines={1}>
                                  {formatTime(entry.createdAt, tag)} · {entry.calories} kcal · {entry.protein}g protein
                                  {entry.consumedWeightG ? ` · ${entry.consumedWeightG}g` : ""}
                                </Text>
                              </View>
                            </View>
                          </Pressable>
                        </Link>
                        
                        <ScalePressable
                          onPress={() => {
                            deleteFood(entry.id);
                          }}
                          style={styles.deleteIconButton}
                          hitSlop={12}
                          hapticType="medium"
                        >
                          <Ionicons name="trash-outline" size={16} color="#EF4444" />
                        </ScalePressable>
                      </Animated.View>
                    );
                  })}
                </Animated.View>
              );
            })}
          </View>
        )}

        {/* Frequent Foods */}
        {distinct.length > 0 && (
          <View style={{ marginBottom: 20 }}>
            <Text style={styles.sectionHeader}>Quick Log Frequent</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickLogScroll}>
              {distinct.map((food) => (
                <ScalePressable
                  key={food.name}
                  onPress={() => {
                    handleQuickAdd(food.name, food.calories, food.protein, "snack");
                  }}
                  style={styles.chip}
                  hapticType="light"
                >
                  <Text style={styles.chipText}>+ {food.name}</Text>
                </ScalePressable>
              ))}
            </ScrollView>
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
  heroCard: {
    backgroundColor: "#E8F8EE",
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: "#C2F0D0",
    shadowColor: "#15803D",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 3,
  },
  heroHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  greetingText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#064E3B",
  },
  heroSubtitle: {
    fontSize: 11,
    color: "#166534",
    fontWeight: "600",
    marginTop: 2,
  },
  streakBadge: {
    backgroundColor: "rgba(234, 88, 12, 0.08)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: "rgba(234, 88, 12, 0.15)",
  },
  streakText: {
    color: "#C2410C",
    fontSize: 11,
    fontWeight: "700",
  },
  caloriesContainer: {
    alignItems: "center",
    marginVertical: 4,
  },
  caloriesNumber: {
    fontSize: 42,
    fontWeight: "900",
    letterSpacing: -1,
  },
  caloriesLabel: {
    fontSize: 11,
    color: "#166534",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 2,
  },
  progressContainer: {
    marginVertical: 14,
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: "rgba(21, 128, 61, 0.12)",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 3,
  },
  heroFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#C2F0D0",
    paddingTop: 12,
  },
  footerMetric: {
    flex: 1,
  },
  footerMetricLabel: {
    fontSize: 8,
    fontWeight: "800",
    color: "#166534",
    letterSpacing: 0.5,
  },
  footerMetricValue: {
    fontSize: 12,
    fontWeight: "700",
    color: "#064E3B",
    marginTop: 2,
  },
  glassDateSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    borderRadius: 20,
    padding: 10,
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.6)",
    shadowColor: "#22C55E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  dateNavBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#EFFDF4",
    justifyContent: "center",
    alignItems: "center",
  },
  dateNavBtnDisabled: {
    backgroundColor: "#F4F4F5",
    opacity: 0.6,
  },
  dateCenter: {
    alignItems: "center",
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: "800",
    color: "#15803D",
  },
  ringsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
  },
  ringCard: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 4,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.6)",
    shadowColor: "#22C55E",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 3,
  },
  ringInnerContent: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  ringPercentText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#374151",
    marginTop: 1,
  },
  ringLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#6B7280",
    marginTop: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  ringValue: {
    fontSize: 12,
    fontWeight: "800",
    marginTop: 2,
  },
  glassCard: {
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    borderRadius: 24,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.7)",
    shadowColor: "#22C55E",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 3,
  },
  waterHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  waterHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  waterIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1F2937",
  },
  cardSubtitle: {
    fontSize: 10,
    color: "#6B7280",
    fontWeight: "500",
  },
  waterProgressText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#3B82F6",
  },
  waterProgressContainer: {
    marginVertical: 12,
  },
  waterProgressTrack: {
    height: 8,
    backgroundColor: "rgba(59, 130, 246, 0.18)",
    borderRadius: 4,
    overflow: "hidden",
  },
  waterProgressFill: {
    height: "100%",
    backgroundColor: "#3B82F6",
    borderRadius: 4,
  },
  waterBtnRow: {
    flexDirection: "row",
    gap: 8,
  },
  waterBtn: {
    flex: 1,
    backgroundColor: "rgba(59, 130, 246, 0.08)",
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 14,
  },
  waterBtnUndo: {
    width: 44,
    backgroundColor: "rgba(229, 231, 235, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 14,
  },
  waterBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#3B82F6",
  },
  btnPressed: {
    transform: [{ scale: 0.96 }],
    opacity: 0.85,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: "800",
    color: "#4B5563",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 10,
    marginTop: 6,
  },
  emptyCard: {
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    borderRadius: 24,
    padding: 20,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.6)",
    shadowColor: "#22C55E",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 14,
  },
  starterFoodsRow: {
    width: "100%",
  },
  starterFoodChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFFDF4",
    borderWidth: 1,
    borderColor: "#DCFCE7",
    borderRadius: 16,
    padding: 12,
    marginBottom: 8,
  },
  starterEmoji: {
    fontSize: 18,
    marginRight: 8,
  },
  starterFoodName: {
    flex: 1,
    fontSize: 13,
    fontWeight: "700",
    color: "#1F2937",
  },
  starterFoodMacros: {
    fontSize: 12,
    fontWeight: "800",
    color: "#15803D",
  },
  mealsList: {
    marginBottom: 12,
  },
  tagSection: {
    marginBottom: 16,
  },
  tagHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
    marginTop: 4,
  },
  tagColorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  tagSectionLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#4B5563",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  foodEntryCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    borderRadius: 18,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.6)",
    shadowColor: "#22C55E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  foodCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  foodEmojiCircle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#EFFDF4",
    justifyContent: "center",
    alignItems: "center",
  },
  foodName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1F2937",
  },
  foodMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 3,
  },
  foodMetaText: {
    fontSize: 10,
    color: "#6B7280",
    fontWeight: "600",
  },
  deleteIconButton: {
    padding: 8,
  },
  quickLogScroll: {
    marginTop: 4,
  },
  chip: {
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1.5,
    borderColor: "#DCFCE7",
  },
  chipText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#15803D",
  },

});

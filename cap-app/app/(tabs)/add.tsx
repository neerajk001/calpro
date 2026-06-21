import { View, Text, ScrollView, Pressable, TextInput, StyleSheet, useWindowDimensions, Modal, Alert, RefreshControl } from "react-native";
import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { router, useLocalSearchParams, useFocusEffect } from "expo-router";
import { useApp } from "@/lib/AppContext";
import type { FoodTag, MealBuilderItem, FoodDbItem, FoodDbCategory, QuantityMode } from "@/lib/types";
import { apiClient } from "@/lib/apiClient";
import { calculateMacros, displayQtyToGrams } from "@/lib/foodDatabase";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withRepeat,
  FadeIn,
  FadeOut,
  FadeInDown,
  FadeOutDown,
  LinearTransition
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Slider from "@react-native-community/slider";
import { ScalePressable } from "@/components/ScalePressable";
import { ListSkeleton } from "@/components/skeletons/ListSkeleton";
import { AnimMacroText } from "@/components/AnimMacroText";

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getDefaultTag(): FoodTag {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 11) return "breakfast";
  if (hour >= 11 && hour < 16) return "lunch";
  if (hour >= 16 && hour < 21) return "dinner";
  return "snack";
}

type Tab = "db" | "public" | "manual";

const CATEGORIES = [
  { label: "Indian", emoji: "🍛" },
  { label: "Protein", emoji: "🥚" },
  { label: "Chicken", emoji: "🍗" },
  { label: "Breakfast", emoji: "🥣" },
  { label: "Rice", emoji: "🍚" },
  { label: "Dairy", emoji: "🥛" },
];

function getPrepCalories(basePer100g: number, method: string): number {
  if (method === "fried") return basePer100g + 80;
  if (method === "ghee") return basePer100g + 100;
  if (method === "boiled") return Math.max(0, basePer100g - 10);
  return basePer100g;
}

function parseNaturalLanguage(text: string): { name: string; calories: number; protein: number; tag?: FoodTag } | null {
  const t = text.trim();
  if (!t) return null;
  const calRegex = /(\d+)\s*(?:kcal|calories?|cal\b)/i;
  const protRegex = /(\d+(?:\.\d+)?)\s*(?:g|grams?|protein|prot\b)/i;
  const calMatch = t.match(calRegex);
  const protMatch = t.match(protRegex);
  let calories = calMatch ? Math.round(parseFloat(calMatch[1])) : null;
  let protein = protMatch ? Math.round(parseFloat(protMatch[1]) * 10) / 10 : null;
  let name = t.replace(calRegex, "").replace(protRegex, "").replace(/\band\b/gi, "").replace(/\s+/g, " ").trim().replace(/^[,.\s]+|[,.\s]+$/g, "");
  if (!name) name = "Logged Item";
  const formattedName = name.split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  let tag: FoodTag | undefined;
  const lower = name.toLowerCase();
  if (calories === null && protein === null) {
    if (lower.includes("egg") || lower.includes("oatmeal") || lower.includes("toast")) { calories = 70; protein = 6; tag = "breakfast"; }
    else if (lower.includes("whey") || lower.includes("shake")) { calories = 130; protein = 25; tag = "snack"; }
    else if (lower.includes("chicken") || lower.includes("salmon")) { calories = 165; protein = 31; tag = "lunch"; }
    else if (lower.includes("pizza") || lower.includes("burger") || lower.includes("fries")) { calories = 350; protein = 12; tag = "junk"; }
  }
  return { name: formattedName, calories: calories ?? 0, protein: protein ?? 0, tag };
}



function recalculateMacros(item: MealBuilderItem, newDisplayQty: number): MealBuilderItem {
  let quantityGrams = newDisplayQty;
  if (item.quantityMode === "piece" && item.gramsPerPiece) {
    quantityGrams = newDisplayQty * item.gramsPerPiece;
  } else if (item.quantityMode === "serving" && item.mlPerServing) {
    quantityGrams = newDisplayQty * item.mlPerServing;
  }

  const hasPer100g = item.caloriesPer100g != null && item.caloriesPer100g > 0;
  if (!hasPer100g) {
    const scale = newDisplayQty / Math.max(item.displayQty, 1);
    return {
      ...item,
      displayQty: newDisplayQty,
      quantity: quantityGrams,
      calories: Math.round(item.calories * scale),
      protein: Math.round(item.protein * scale * 10) / 10,
      carbs: Math.round((item.carbs ?? 0) * scale * 10) / 10,
      fat: Math.round((item.fat ?? 0) * scale * 10) / 10,
    };
  }

  const per100 = {
    calories: item.caloriesPer100g ?? 0,
    protein: item.proteinPer100g ?? 0,
    carbs: item.carbsPer100g ?? 0,
    fat: item.fatPer100g ?? 0,
  };
  const ratio = quantityGrams / 100;
  let calories = Math.round(per100.calories * ratio);
  let protein = Math.round(per100.protein * ratio * 10) / 10;
  let carbs = Math.round(per100.carbs * ratio * 10) / 10;
  let fat = Math.round(per100.fat * ratio * 10) / 10;

  if (item.cookingMethod === "boiled") {
    calories = Math.round(calories * 0.9);
    fat = Math.round(fat * 0.8 * 10) / 10;
  } else if (item.cookingMethod === "fried") {
    calories = Math.round(calories * 1.25);
    fat = Math.round(fat * 1.8 * 10) / 10;
  } else if (item.cookingMethod === "ghee") {
    const gheeGrams = Math.round(quantityGrams * 0.12);
    calories = calories + Math.round(gheeGrams * 9);
    fat = Math.round((fat + gheeGrams * 0.99) * 10) / 10;
  }

  return { ...item, displayQty: newDisplayQty, quantity: quantityGrams, calories, protein, carbs, fat };
}

function getStep(item: MealBuilderItem): number {
  if (item.quantityMode === "piece") return 1;
  if (item.quantityMode === "ml") return 25;
  if (item.quantityMode === "serving") return 1;
  return 5;
}

function getMaxQty(item: MealBuilderItem): number {
  if (item.quantityMode === "piece") return 20;
  if (item.quantityMode === "ml") return 1000;
  if (item.quantityMode === "serving") return 5;
  return 800;
}

function getUnitLabel(item: MealBuilderItem): string {
  if (item.quantityMode === "piece") return item.displayQty === 1 ? "pc" : "pcs";
  if (item.quantityMode === "ml") return "ml";
  if (item.quantityMode === "serving") return item.displayQty === 1 ? "serv" : "servs";
  return "g";
}

export default function AddFood() {
  const { height: windowHeight } = useWindowDimensions();
  const { edit } = useLocalSearchParams<{ edit?: string }>();
  const {
    addFood, updateFood, foods, hydrated, settings,
    addMealTemplate, customFoods = [], addCustomFood, deleteCustomFood,
    mealTemplates = [], deleteMealTemplate, getDistinctFoods, getDaySummary,
    rehydrate
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
      rehydrate(true).catch((err) => console.error("Focus refetch failed:", err));
    }, [rehydrate])
  );
  const today = todayStr();
  const [activeTab, setActiveTab] = useState<Tab>("db");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<FoodDbItem[]>([]);
  const [searching, setSearching] = useState(false);

  // My Custom Foods states
  const [showCustomFoods, setShowCustomFoods] = useState(false);
  const [showAddCustomForm, setShowAddCustomForm] = useState(false);
  const [customForm, setCustomForm] = useState({
    name: "", category: "Custom" as FoodDbCategory,
    caloriesInput: "", proteinInput: "", carbsInput: "0", fatInput: "0",
    quantityMode: "grams" as QuantityMode,
    customWeightG: "", gramsPerPiece: "", pieceQty: 1, emoji: "🍽️",
  });

  // Saved templates state
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

  // Public DB states
  const [publicQuery, setPublicQuery] = useState("");
  const [publicResults, setPublicResults] = useState<FoodDbItem[]>([]);
  const [recentPublic, setRecentPublic] = useState<FoodDbItem[]>([]);
  const [searchingPublic, setSearchingPublic] = useState(false);
  const [loadingRecentPublic, setLoadingRecentPublic] = useState(false);

  // Public contribution form state
  const [showPublicForm, setShowPublicForm] = useState(false);
  const [publicFormSubmitted, setPublicFormSubmitted] = useState(false);
  const [publicSubmitting, setPublicSubmitting] = useState(false);
  const [publicForm, setPublicForm] = useState({
    name: "",
    category: "Custom",
    calories: "",
    protein: "",
    carbs: "0",
    fat: "0",
    servingSize: "100",
    servingUnit: "g",
    gramsPerPiece: "60",
    emoji: "🍽️",
  });

  const [naturalText, setNaturalText] = useState("");
  const [name, setName] = useState("");
  const [calories, setCalories] = useState(0);
  const [protein, setProtein] = useState(0);
  const [activeTag, setActiveTag] = useState<FoodTag>(getDefaultTag);
  const [editId, setEditId] = useState<string | null>(edit || null);
  const [editDate, setEditDate] = useState("");
  const [hasPrefilled, setHasPrefilled] = useState(false);
  const [mealItems, setMealItems] = useState<MealBuilderItem[]>([]);

  // Food Detail states
  const [selectedDbItem, setSelectedDbItem] = useState<FoodDbItem | null>(null);
  const [detailQty, setDetailQty] = useState(100);
  const [detailPrep, setDetailPrep] = useState<"normal" | "boiled" | "fried" | "ghee">("normal");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customWeightG, setCustomWeightG] = useState<number | null>(null);
  const [editingWeight, setEditingWeight] = useState(false);

  // Meal Builder template states
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);
  const [templateName, setTemplateName] = useState("");

  // Log Mode state
  const [logMode, setLogMode] = useState<"combined" | "individual">("individual");

  const distinct = useMemo(() => getDistinctFoods(10), [getDistinctFoods]);
  const todayEntries = useMemo(() => getDaySummary(today).entries, [getDaySummary, today]);

  const suggestions = useMemo(() => {
    const q = name.trim().toLowerCase();
    if (!q) return distinct.slice(0, 5);
    return distinct.filter((f) => f.name.toLowerCase().includes(q)).slice(0, 5);
  }, [name, distinct]);

  const recentlyLogged = useMemo(() => todayEntries.slice(-4).reverse(), [todayEntries]);

  const handleSuggestionTap = (food: { name: string; calories: number; protein: number }) => {
    setNaturalText("");
    setName(food.name);
    setCalories(food.calories);
    setProtein(food.protein);
  };

  const handleReLog = (food: { name: string; calories: number; protein: number; tag: FoodTag }) => {
    addFood(food.name, food.calories, food.protein, today, food.tag || activeTag);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  };

  const handleAddManualToQueue = useCallback(() => {
    const finalName = name.trim() || "Manual Entry";
    const item: MealBuilderItem = {
      dbItemId: `manual-${Date.now()}`,
      name: finalName,
      quantity: 1,
      quantityMode: "serving",
      displayQty: 1,
      calories,
      protein,
      carbs: 0,
      fat: 0,
      emoji: activeTag === "breakfast" ? "🍳" : activeTag === "lunch" ? "🥗" : activeTag === "dinner" ? "🍽️" : activeTag === "snack" ? "🍏" : "🍕",
    };
    setMealItems((prev) => [...prev, item]);
    setName("");
    setCalories(0);
    setProtein(0);
    setNaturalText("");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, [name, calories, protein, activeTag]);

  const tagsList: { value: FoodTag; label: string }[] = [
    { value: "breakfast", label: "Breakfast" },
    { value: "lunch", label: "Lunch" },
    { value: "dinner", label: "Dinner" },
    { value: "snack", label: "Snack" },
    { value: "junk", label: "Junk" },
  ];

  const tagLabel: Record<FoodTag, string> = {
    breakfast: "Breakfast",
    lunch: "Lunch",
    dinner: "Dinner",
    snack: "Snack",
    junk: "Junk Food",
  };

  const handleAddCustomFood = () => {
    if (!customForm.name.trim() || !customForm.caloriesInput || !customForm.proteinInput) return;

    const isPiece = customForm.quantityMode === "piece";
    const isMl = customForm.quantityMode === "ml";

    let caloriesPer100g: number;
    let proteinPer100g: number;
    let carbsPer100g: number;
    let fatPer100g: number;
    let defaultQty: number;
    let gramsPerPiece: number | undefined;
    let publicServingSize: number;
    let publicServingUnit: string;
    let publicCalories: number;
    let publicProtein: number;
    let publicCarbs: number;
    let publicFat: number;

    if (isPiece) {
      const gpp = Math.max(1, Number(customForm.gramsPerPiece) || 60);
      const calPerPiece = Number(customForm.caloriesInput);
      const protPerPiece = Number(customForm.proteinInput);
      const carbsPerPiece = Number(customForm.carbsInput) || 0;
      const fatPerPiece = Number(customForm.fatInput) || 0;
      const scale = 100 / gpp;
      caloriesPer100g = Math.round(calPerPiece * scale);
      proteinPer100g = Math.round(protPerPiece * scale * 10) / 10;
      carbsPer100g = Math.round(carbsPerPiece * scale * 10) / 10;
      fatPer100g = Math.round(fatPerPiece * scale * 10) / 10;
      defaultQty = customForm.pieceQty || 1;
      gramsPerPiece = gpp;
      publicServingSize = gpp;
      publicServingUnit = "piece";
      publicCalories = calPerPiece;
      publicProtein = protPerPiece;
      publicCarbs = carbsPerPiece;
      publicFat = fatPerPiece;
    } else {
      const weight = Number(customForm.customWeightG) || 100;
      const scale = weight > 0 ? 100 / weight : 1;
      caloriesPer100g = Math.round(Number(customForm.caloriesInput) * scale);
      proteinPer100g = Math.round(Number(customForm.proteinInput) * scale * 10) / 10;
      carbsPer100g = Math.round((Number(customForm.carbsInput) || 0) * scale * 10) / 10;
      fatPer100g = Math.round((Number(customForm.fatInput) || 0) * scale * 10) / 10;
      defaultQty = weight;
      gramsPerPiece = undefined;
      publicServingSize = weight;
      publicServingUnit = isMl ? "ml" : "g";
      publicCalories = Number(customForm.caloriesInput);
      publicProtein = Number(customForm.proteinInput);
      publicCarbs = Number(customForm.carbsInput) || 0;
      publicFat = Number(customForm.fatInput) || 0;
    }

    addCustomFood({
      name: customForm.name.trim(),
      category: customForm.category,
      caloriesPer100g,
      proteinPer100g,
      carbsPer100g,
      fatPer100g,
      quantityMode: customForm.quantityMode,
      defaultQty,
      gramsPerPiece,
      emoji: customForm.emoji,
    });

    apiClient.addPublicFood({
      name: customForm.name.trim(),
      category: customForm.category,
      calories: publicCalories,
      protein: publicProtein,
      carbs: publicCarbs,
      fat: publicFat,
      servingSize: publicServingSize,
      servingUnit: publicServingUnit,
      emoji: customForm.emoji,
    }).catch((err) => { console.error("Failed to seed public food:", err); });

    setShowAddCustomForm(false);
    setCustomForm({ name: "", category: "Custom", caloriesInput: "", proteinInput: "", carbsInput: "0", fatInput: "0", quantityMode: "grams", customWeightG: "", gramsPerPiece: "", pieceQty: 1, emoji: "🍽️" });
  };

  const handleLogTemplate = useCallback((template: any) => {
    setSelectedTemplate(null);
    template.items.forEach((item: any) => addFood(item.name, item.calories, item.protein, today, template.tag, settings.trackCarbsFat ? item.carbs : undefined, settings.trackCarbsFat ? item.fat : undefined));
    router.back();
  }, [addFood, today, settings.trackCarbsFat]);

  const handleLoadTemplateToBuilder = useCallback((template: any) => {
    setSelectedTemplate(null);
    const convertedItems: MealBuilderItem[] = template.items.map((item: any) => ({ dbItemId: item.id, name: item.name, quantity: item.quantity, quantityMode: item.quantityMode, displayQty: item.displayQty, calories: item.calories, protein: item.protein, carbs: item.carbs, fat: item.fat, emoji: item.emoji || undefined }));
    setMealItems((prev) => [...prev, ...convertedItems]);
  }, []);

  const handleDeleteTemplate = useCallback((id: string) => {
    Alert.alert("Delete Template", "Are you sure you want to delete this meal template?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => { deleteMealTemplate(id); setSelectedTemplate(null); } }
    ]);
  }, [deleteMealTemplate]);

  useEffect(() => {
    if (hydrated && !hasPrefilled && edit) {
      const entry = foods.find((f) => f.id === edit);
      if (entry) {
        setEditId(edit);
        setName(entry.name);
        setCalories(entry.calories);
        setProtein(entry.protein);
        setActiveTag(entry.tag);
        setEditDate(entry.date);
        setActiveTab("manual");
      }
      setHasPrefilled(true);
    }
    if (hydrated && !hasPrefilled) setHasPrefilled(true);
  }, [hydrated, foods, hasPrefilled, edit]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    const timer = setTimeout(async () => {
      try {
        const results = await apiClient.searchFoods(searchQuery);
        setSearchResults(results.slice(0, 10));
      } catch { }
      setSearching(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Public DB loading and search effects
  const loadRecentPublic = useCallback(async () => {
    setLoadingRecentPublic(true);
    try {
      const data = await apiClient.searchPublicFoods("");
      setRecentPublic(data.slice(0, 10));
    } catch {
      setRecentPublic([]);
    } finally {
      setLoadingRecentPublic(false);
    }
  }, []);

  useEffect(() => {
    loadRecentPublic();
  }, [loadRecentPublic]);

  useEffect(() => {
    if (!publicQuery.trim()) {
      setPublicResults([]);
      return;
    }
    setSearchingPublic(true);
    const timer = setTimeout(async () => {
      try {
        const results = await apiClient.searchPublicFoods(publicQuery);
        setPublicResults(results.slice(0, 10));
      } catch {
        setPublicResults([]);
      }
      setSearchingPublic(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [publicQuery]);

  const handleDeletePublicFood = useCallback((food: FoodDbItem) => {
    Alert.alert(
      "Delete Food",
      `Delete "${food.name}" from the public database?\nThis cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setRecentPublic((prev) => prev.filter((f) => f.id !== food.id));
            setPublicResults((prev) => prev.filter((f) => f.id !== food.id));
            try {
              await apiClient.deletePublicFood(food.id);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (err) {
              console.error("Failed to delete public food:", err);
              loadRecentPublic();
            }
          },
        },
      ]
    );
  }, [loadRecentPublic]);

  const handlePublicSubmit = async () => {
    if (!publicForm.name.trim() || !publicForm.calories || !publicForm.protein) return;
    const isPiece = publicForm.servingUnit === "piece";
    const effectiveServingSize = isPiece
      ? Math.max(1, Number(publicForm.gramsPerPiece) || 60)
      : Math.max(1, Number(publicForm.servingSize) || 100);

    setPublicSubmitting(true);
    try {
      await apiClient.addPublicFood({
        name: publicForm.name.trim(),
        category: publicForm.category,
        calories: Number(publicForm.calories),
        protein: Number(publicForm.protein),
        carbs: Number(publicForm.carbs) || 0,
        fat: Number(publicForm.fat) || 0,
        servingSize: effectiveServingSize,
        servingUnit: publicForm.servingUnit,
        emoji: publicForm.emoji,
      });
      setPublicFormSubmitted(true);
      setPublicForm({
        name: "",
        category: "Custom",
        calories: "",
        protein: "",
        carbs: "0",
        fat: "0",
        servingSize: "100",
        servingUnit: "g",
        gramsPerPiece: "60",
        emoji: "🍽️",
      });
      loadRecentPublic();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTimeout(() => {
        setPublicFormSubmitted(false);
        setShowPublicForm(false);
      }, 2000);
    } catch (err) {
      console.error("Failed to submit public food:", err);
      Alert.alert("Error", "Failed to contribute food to public database. Please try again.");
    } finally {
      setPublicSubmitting(false);
    }
  };

  const handleSearchSelect = (item: FoodDbItem) => {
    // Quick add default
    const qty = item.defaultQty || (item.quantityMode === "piece" ? 1 : 100);
    const itemCalories = item.caloriesPer100g > 0 ? Math.round(item.caloriesPer100g * qty / 100) : 0;
    const itemProtein = item.proteinPer100g > 0 ? Math.round(item.proteinPer100g * qty / 100 * 10) / 10 : 0;
    const itemCarbs = item.carbsPer100g > 0 ? Math.round(item.carbsPer100g * qty / 100 * 10) / 10 : 0;
    const itemFat = item.fatPer100g > 0 ? Math.round(item.fatPer100g * qty / 100 * 10) / 10 : 0;
    const builderItem: MealBuilderItem = {
      dbItemId: item.id,
      name: item.name,
      quantity: qty,
      quantityMode: item.quantityMode,
      displayQty: qty,
      calories: itemCalories,
      protein: itemProtein,
      carbs: itemCarbs,
      fat: itemFat,
      emoji: item.emoji,
      caloriesPer100g: item.caloriesPer100g,
      proteinPer100g: item.proteinPer100g,
      carbsPer100g: item.carbsPer100g,
      fatPer100g: item.fatPer100g,
      gramsPerPiece: item.gramsPerPiece,
      mlPerServing: item.mlPerServing,
    };
    setMealItems((prev) => [...prev, builderItem]);
  };

  const handleOpenDetail = (item: FoodDbItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedDbItem(item);
    setDetailQty(item.defaultQty || (item.quantityMode === "piece" ? 1 : 100));
    setDetailPrep("normal");
    setCustomWeightG(null);
    setEditingWeight(false);
    setShowCustomInput(false);
  };

  const handleClearDetail = () => {
    setSelectedDbItem(null);
    setCustomWeightG(null);
    setEditingWeight(false);
  };

  const handleAddFromDetail = () => {
    if (!selectedDbItem) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const quantityGrams = customWeightG ?? displayQtyToGrams(selectedDbItem, detailQty);
    const isCustomWeight = customWeightG !== null && customWeightG !== displayQtyToGrams(selectedDbItem, detailQty);
    const rawMacros = calculateMacros(selectedDbItem, quantityGrams);

    let calories = rawMacros.calories;
    let protein = rawMacros.protein;
    let carbs = rawMacros.carbs;
    let fat = rawMacros.fat;

    if (detailPrep === "boiled") {
      calories = Math.round(calories * 0.9);
      fat = Math.round(fat * 0.8 * 10) / 10;
    } else if (detailPrep === "fried") {
      calories = Math.round(calories * 1.25);
      fat = Math.round(fat * 1.8 * 10) / 10;
    } else if (detailPrep === "ghee") {
      const gheeGrams = Math.round(quantityGrams * 0.12);
      calories = calories + Math.round(gheeGrams * 9);
      fat = Math.round((fat + gheeGrams * 0.99) * 10) / 10;
    }

    const suffix = detailPrep === "fried" ? " (Fried)" : detailPrep === "boiled" ? " (Boiled/Steamed)" : detailPrep === "ghee" ? " (with Ghee)" : "";
    const finalName = selectedDbItem.name + suffix;

    const builderItem: MealBuilderItem = {
      dbItemId: selectedDbItem.id,
      name: finalName,
      quantity: quantityGrams,
      quantityMode: selectedDbItem.quantityMode,
      displayQty: detailQty,
      calories,
      protein,
      carbs,
      fat,
      emoji: selectedDbItem.emoji,
      cookingMethod: detailPrep,
      caloriesPer100g: selectedDbItem.caloriesPer100g,
      proteinPer100g: selectedDbItem.proteinPer100g,
      carbsPer100g: selectedDbItem.carbsPer100g,
      fatPer100g: selectedDbItem.fatPer100g,
      gramsPerPiece: selectedDbItem.gramsPerPiece,
      mlPerServing: selectedDbItem.mlPerServing,
      consumedWeightG: isCustomWeight ? quantityGrams : undefined,
    };
    setMealItems((prev) => [...prev, builderItem]);
    handleClearDetail();
  };

  const handleAdjustQty = (idx: number, delta: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setMealItems((prev) => {
      return prev.map((item, i) => {
        if (i !== idx) return item;
        const step = getStep(item);
        const max = getMaxQty(item);
        const newDisplayQty = Math.max(step, Math.min(max, item.displayQty + (delta * step)));
        return recalculateMacros(item, newDisplayQty);
      });
    });
  };

  const handleLogMeal = (mode: "combined" | "individual", tag: FoodTag) => {
    if (mealItems.length === 0) return;
    if (mode === "individual") {
      mealItems.forEach((item) =>
        addFood(
          item.name,
          item.calories,
          item.protein,
          today,
          tag,
          settings.trackCarbsFat ? item.carbs : undefined,
          settings.trackCarbsFat ? item.fat : undefined
        )
      );
    } else {
      const totalCal = mealItems.reduce((s, i) => s + i.calories, 0);
      const totalProt = Math.round(mealItems.reduce((s, i) => s + i.protein, 0) * 10) / 10;
      const totalCarbs = Math.round(mealItems.reduce((s, i) => s + i.carbs, 0) * 10) / 10;
      const totalFat = Math.round(mealItems.reduce((s, i) => s + i.fat, 0) * 10) / 10;
      const mealName =
        mealItems.length === 1
          ? mealItems[0].name
          : mealItems
            .slice(0, 3)
            .map((i) => i.name.split(" ")[0])
            .join(" + ");
      addFood(
        mealName,
        totalCal,
        totalProt,
        today,
        tag,
        settings.trackCarbsFat ? totalCarbs : undefined,
        settings.trackCarbsFat ? totalFat : undefined
      );
    }
    setMealItems([]);
    router.back();
  };

  const handleSaveTemplate = () => {
    if (!templateName.trim() || mealItems.length === 0) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addMealTemplate(templateName.trim(), activeTag, mealItems);
    setTemplateName("");
    setShowSaveTemplateModal(false);
  };

  const handleSubmit = () => {
    const finalName = name.trim() || "Logged Item";
    if (editId) {
      updateFood(editId, finalName, calories, protein, editDate, activeTag);
    } else {
      addFood(finalName, calories, protein, today, activeTag);
    }
    router.back();
  };

  const canSubmit = name.trim().length > 0;

  // Meal Builder Totals
  const builderTotals = useMemo(() => {
    return mealItems.reduce(
      (acc, item) => ({
        calories: acc.calories + item.calories,
        protein: +(acc.protein + item.protein).toFixed(1),
        carbs: +(acc.carbs + item.carbs).toFixed(1),
        fat: +(acc.fat + item.fat).toFixed(1),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  }, [mealItems]);

  const renderInlineDetailCard = () => {
    if (!selectedDbItem) return null;

    const quantityGrams = customWeightG ?? displayQtyToGrams(selectedDbItem, detailQty);
    const isCustomWeight = customWeightG !== null && customWeightG !== displayQtyToGrams(selectedDbItem, detailQty);
    const rawMacros = calculateMacros(selectedDbItem, quantityGrams);

    let calories = rawMacros.calories;
    let protein = rawMacros.protein;
    let carbs = rawMacros.carbs;
    let fat = rawMacros.fat;

    if (detailPrep === "boiled") {
      calories = Math.round(calories * 0.9);
      fat = Math.round(fat * 0.8 * 10) / 10;
    } else if (detailPrep === "fried") {
      calories = Math.round(calories * 1.25);
      fat = Math.round(fat * 1.8 * 10) / 10;
    } else if (detailPrep === "ghee") {
      const gheeGrams = Math.round(quantityGrams * 0.12);
      calories = calories + Math.round(gheeGrams * 9);
      fat = Math.round((fat + gheeGrams * 0.99) * 10) / 10;
    }

    const stepQty = selectedDbItem.quantityMode === "piece" ? 1
      : selectedDbItem.quantityMode === "ml" ? 25
        : selectedDbItem.quantityMode === "serving" ? 1
          : 5;

    const maxQty = selectedDbItem.quantityMode === "piece" ? 20
      : selectedDbItem.quantityMode === "ml" ? 1000
        : selectedDbItem.quantityMode === "serving" ? 5
          : 800;

    const getPresets = (food: FoodDbItem) => {
      if (food.quantityMode === "grams") {
        return [
          { label: "Bowl (100g)", qty: 100 },
          { label: "Med Serv (200g)", qty: 200 },
          { label: "Full Plate (300g)", qty: 300 },
        ];
      }
      if (food.quantityMode === "ml") {
        return [
          { label: "Cup (150ml)", qty: 150 },
          { label: "Glass (250ml)", qty: 250 },
          { label: "Bottle (500ml)", qty: 500 },
        ];
      }
      if (food.quantityMode === "piece") {
        return [
          { label: "1 Pc", qty: 1 },
          { label: "2 Pcs", qty: 2 },
          { label: "3 Pcs", qty: 3 },
          { label: "4 Pcs", qty: 4 },
        ];
      }
      return [
        { label: "0.5 Serv", qty: 0.5 },
        { label: "1 Serving", qty: 1 },
        { label: "1.5 Serv", qty: 1.5 },
        { label: "2 Servings", qty: 2 },
      ];
    };

    const getUnitLabel = (mode: QuantityMode, qty: number) => {
      if (mode === "piece") return qty === 1 ? "piece" : "pieces";
      if (mode === "ml") return "ml";
      if (mode === "serving") return qty === 1 ? "serving" : "servings";
      return "g";
    };

    return (
      <Animated.View
        entering={FadeInDown.springify().damping(15).stiffness(160)}
        exiting={FadeOut.duration(200)}
        layout={LinearTransition.springify().damping(15)}
        style={styles.inlineDetailCard}
      >
        {/* Header */}
        <View style={styles.inlineDetailHeader}>
          <View style={styles.foodEmojiCircle}>
            <Text style={{ fontSize: 20 }}>{selectedDbItem.emoji || "🍽️"}</Text>
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.inlineDetailName}>{selectedDbItem.name}</Text>
            <Text style={styles.inlineDetailCategory}>{selectedDbItem.category}</Text>
          </View>
          <ScalePressable
            onPress={handleClearDetail}
            style={styles.inlineDetailClearBtn}
          >
            <Text style={styles.inlineDetailClearText}>✕ Clear</Text>
          </ScalePressable>
        </View>

        {/* Quantity section */}
        <View style={styles.inlineDetailSection}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <Text style={styles.fieldLabel}>Quantity</Text>
            <View style={styles.inlineCounterRow}>
              <ScalePressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setDetailQty((q) => Math.max(stepQty, q - stepQty));
                  setCustomWeightG(null);
                  setEditingWeight(false);
                }}
                style={styles.inlineCounterBtn}
              >
                <Ionicons name="remove" size={16} color="#4B5563" />
              </ScalePressable>
              <AnimMacroText
                value={`${detailQty} ${getUnitLabel(selectedDbItem.quantityMode, detailQty)}`}
                style={styles.inlineCounterValue}
              />
              <ScalePressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setDetailQty((q) => Math.min(maxQty, q + stepQty));
                  setCustomWeightG(null);
                  setEditingWeight(false);
                }}
                style={styles.inlineCounterBtn}
              >
                <Ionicons name="add" size={16} color="#4B5563" />
              </ScalePressable>
            </View>
          </View>

          <Slider
            style={styles.slider}
            minimumValue={stepQty}
            maximumValue={maxQty}
            step={stepQty}
            value={detailQty}
            onValueChange={(val) => {
              setDetailQty(val);
              setCustomWeightG(null);
              setEditingWeight(false);
            }}
            minimumTrackTintColor="#22C55E"
            maximumTrackTintColor="#D1D5DB"
            thumbTintColor="#22C55E"
          />

          <View style={styles.presetsRow}>
            {getPresets(selectedDbItem).map((preset) => {
              const isSelected = detailQty === preset.qty;
              return (
                <ScalePressable
                  key={preset.label}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setDetailQty(preset.qty);
                    setCustomWeightG(null);
                    setEditingWeight(false);
                  }}
                  style={[
                    styles.presetBtnInline,
                    isSelected && styles.presetBtnActiveInline,
                  ]}
                >
                  <Text
                    style={[
                      styles.presetBtnTextInline,
                      isSelected && styles.presetBtnTextActiveInline,
                    ]}
                  >
                    {preset.label}
                  </Text>
                </ScalePressable>
              );
            })}
          </View>
        </View>

        {/* Approx Weight Section */}
        <View style={styles.inlineDetailSection}>
          <Text style={styles.fieldLabel}>Approx Weight</Text>
          {editingWeight ? (
            <View style={styles.inlineWeightInputContainer}>
              <TextInput
                keyboardType="numeric"
                style={styles.detailCustomInput}
                value={customWeightG !== null ? customWeightG.toString() : quantityGrams.toString()}
                onChangeText={(t) => {
                  const v = Math.max(1, Math.min(5000, Math.round(Number(t) || 0)));
                  setCustomWeightG(v);
                }}
                onBlur={() => {
                  if (customWeightG === displayQtyToGrams(selectedDbItem, detailQty)) {
                    setCustomWeightG(null);
                  }
                  setEditingWeight(false);
                }}
                onSubmitEditing={() => setEditingWeight(false)}
                placeholder="Weight in grams"
                placeholderTextColor="#9CA3AF"
                autoFocus
              />
              <Text style={styles.inlineWeightUnitText}>g</Text>
              <ScalePressable
                onPress={() => {
                  setCustomWeightG(null);
                  setEditingWeight(false);
                }}
                style={styles.inlineWeightResetBtn}
              >
                <Text style={styles.inlineWeightResetText}>Reset</Text>
              </ScalePressable>
            </View>
          ) : (
            <View style={styles.inlineWeightDisplayContainer}>
              <Text style={styles.inlineWeightText}>
                {isCustomWeight ? customWeightG : quantityGrams}g
              </Text>
              {isCustomWeight && (
                <View style={styles.customWeightBadge}>
                  <Text style={styles.customWeightBadgeText}>Custom weight</Text>
                </View>
              )}
              <ScalePressable
                onPress={() => {
                  setCustomWeightG(customWeightG ?? quantityGrams);
                  setEditingWeight(true);
                }}
                style={styles.inlineWeightEditBtn}
              >
                <Ionicons name="pencil-sharp" size={14} color="#6B7280" />
              </ScalePressable>
            </View>
          )}
          {selectedDbItem.quantityMode === "piece" && selectedDbItem.gramsPerPiece && (
            <Text style={styles.approxWeightSubtextInline}>
              Default: {selectedDbItem.gramsPerPiece}g per piece
            </Text>
          )}
        </View>

        {/* Preparation Modifiers */}
        <View style={styles.inlineDetailSection}>
          <Text style={styles.fieldLabel}>Preparation</Text>
          <View style={styles.prepRowInline}>
            {([
              { value: "normal", label: "As-is" },
              { value: "boiled", label: "Boiled" },
              { value: "fried", label: "Fried" },
              { value: "ghee", label: "+Ghee" },
            ] as const).map((method) => {
              const isSelected = detailPrep === method.value;
              return (
                <ScalePressable
                  key={method.value}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setDetailPrep(method.value);
                  }}
                  style={[
                    styles.prepBtnInline,
                    isSelected && styles.prepBtnActiveInline,
                  ]}
                >
                  <Text
                    style={[
                      styles.prepBtnTextInline,
                      isSelected && styles.prepBtnTextActiveInline,
                    ]}
                  >
                    {method.label}
                  </Text>
                </ScalePressable>
              );
            })}
          </View>
        </View>

        {/* Live Macros Grid */}
        <View style={styles.inlineDetailMacrosGrid}>
          <View style={[styles.inlineDetailMacroCard, { backgroundColor: "#EFF6FF", borderColor: "#EFF6FF" }]}>
            <Text style={styles.inlineDetailMacroLabel}>Calories</Text>
            <AnimMacroText value={`${calories} kcal`} style={[styles.inlineDetailMacroValue, { color: "#2563EB" }]} />
          </View>
          <View style={[styles.inlineDetailMacroCard, { backgroundColor: "#EFFDF4", borderColor: "#EFFDF4" }]}>
            <Text style={styles.inlineDetailMacroLabel}>Protein</Text>
            <AnimMacroText value={`${protein}g`} style={[styles.inlineDetailMacroValue, { color: "#10B981" }]} />
          </View>
          {settings.trackCarbsFat && (
            <>
              <View style={[styles.inlineDetailMacroCard, { backgroundColor: "#FFF5F5", borderColor: "#FFF5F5" }]}>
                <Text style={styles.inlineDetailMacroLabel}>Carbs</Text>
                <AnimMacroText value={`${carbs}g`} style={[styles.inlineDetailMacroValue, { color: "#EF4444" }]} />
              </View>
              <View style={[styles.inlineDetailMacroCard, { backgroundColor: "#FFFBEB", borderColor: "#FFFBEB" }]}>
                <Text style={styles.inlineDetailMacroLabel}>Fat</Text>
                <AnimMacroText value={`${fat}g`} style={[styles.inlineDetailMacroValue, { color: "#F59E0B" }]} />
              </View>
            </>
          )}
        </View>

        {/* Action Button */}
        <ScalePressable
          onPress={handleAddFromDetail}
          style={styles.inlineDetailAddBtn}
        >
          <Text style={styles.inlineDetailAddBtnText}>+ Add to Meal Builder</Text>
        </ScalePressable>
      </Animated.View>
    );
  };

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
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
        <Text style={styles.title}>{editId ? "Edit Entry" : "Log Nutrition"}</Text>

        {!editId && mealTemplates && mealTemplates.length > 0 && (activeTab !== "db" || searchQuery.trim() !== "") && (
          <View style={styles.templatesContainer}>
            <Text style={styles.templatesTitle}>My Saved Meals</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.templatesScroll}
              contentContainerStyle={styles.templatesContent}
            >
              {mealTemplates.map((template, idx) => {
                const totalCals = template.items.reduce((sum, item) => sum + item.calories, 0);
                const totalProt = template.items.reduce((sum, item) => sum + item.protein, 0);
                const emoji = template.items[0]?.emoji || "🍱";
                const tagEmoji = template.tag === "breakfast" ? "🍳" : template.tag === "lunch" ? "🥗" : template.tag === "dinner" ? "🍽️" : template.tag === "snack" ? "🍏" : "🍕";
                return (
                  <Animated.View
                    key={template.id}
                    entering={FadeInDown.springify().damping(15).delay(idx * 50)}
                  >
                    <ScalePressable
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setSelectedTemplate(template);
                      }}
                      style={styles.templateCard}
                    >
                      <View style={styles.templateHeader}>
                        <Text style={styles.templateName} numberOfLines={1}>
                          {template.name}
                        </Text>
                        <Text style={styles.templateEmoji}>{emoji}</Text>
                      </View>
                      <Text style={styles.templateTag}>
                        {tagEmoji} {template.tag}
                      </Text>
                      <View style={styles.templateMacrosRow}>
                        <Text style={styles.templateCals}>{totalCals} kcal</Text>
                        <Text style={styles.templateProt}>{totalProt.toFixed(1)}g P</Text>
                      </View>
                    </ScalePressable>
                  </Animated.View>
                );
              })}
            </ScrollView>
          </View>
        )}

        {!editId && (
          <View style={styles.glassTabBar}>
            {activeTab === "db" && (
              <Animated.View
                layout={LinearTransition.springify().damping(16).stiffness(160)}
                style={[StyleSheet.absoluteFillObject, styles.tabIndicatorBg, { width: "33.3%", left: 0 }]}
              />
            )}
            {activeTab === "public" && (
              <Animated.View
                layout={LinearTransition.springify().damping(16).stiffness(160)}
                style={[StyleSheet.absoluteFillObject, styles.tabIndicatorBg, { width: "33.3%", left: "33.3%" }]}
              />
            )}
            {activeTab === "manual" && (
              <Animated.View
                layout={LinearTransition.springify().damping(16).stiffness(160)}
                style={[StyleSheet.absoluteFillObject, styles.tabIndicatorBg, { width: "33.3%", left: "66.6%" }]}
              />
            )}
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setActiveTab("db");
              }}
              style={styles.tab}
            >
              <Text style={[styles.tabText, activeTab === "db" && styles.tabTextActive]}>Food DB</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setActiveTab("public");
              }}
              style={styles.tab}
            >
              <Text style={[styles.tabText, activeTab === "public" && styles.tabTextActive]}>Public DB</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setActiveTab("manual");
              }}
              style={styles.tab}
            >
              <Text style={[styles.tabText, activeTab === "manual" && styles.tabTextActive]}>Manual Log</Text>
            </Pressable>
          </View>
        )}

        {activeTab === "db" && !editId && (
          selectedDbItem ? (
            renderInlineDetailCard()
          ) : (
            <>
              {/* Search Input Container */}
              <View style={styles.searchBarContainer}>
                <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
                <TextInput
                  placeholder="Search foods, meals, brands..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  style={styles.searchInput}
                  placeholderTextColor="#9CA3AF"
                  clearButtonMode="while-editing"
                />
                {searchQuery.length > 0 && (
                  <Pressable
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setSearchQuery("");
                    }}
                    style={styles.clearSearchBtn}
                  >
                    <Ionicons name="close-circle" size={18} color="#9CA3AF" />
                  </Pressable>
                )}
              </View>

              {/* Category Chips Scroll */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categoryScroll}
                contentContainerStyle={styles.categoryContent}
              >
                {CATEGORIES.map((cat) => {
                  const isSelected = searchQuery.toLowerCase() === cat.label.toLowerCase();
                  return (
                    <ScalePressable
                      key={cat.label}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setSearchQuery(cat.label);
                      }}
                      style={[
                        styles.categoryChip,
                        isSelected && styles.categoryChipSelected,
                      ]}
                    >
                      <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                      <Text style={[styles.categoryLabel, isSelected && styles.categoryLabelSelected]}>
                        {cat.label}
                      </Text>
                    </ScalePressable>
                  );
                })}
              </ScrollView>

              {/* Redesigned Food Result Cards */}
              {searching ? (
                <ListSkeleton />
              ) : searchResults.length > 0 ? (
                <ScrollView
                  style={{ maxHeight: 380 }}
                  nestedScrollEnabled={true}
                  showsVerticalScrollIndicator={true}
                  contentContainerStyle={{ paddingBottom: 8 }}
                >
                  <Animated.View layout={LinearTransition.springify().damping(15)} style={styles.foodCardsList}>
                    {searchResults.map((item, idx) => {
                      const cardCal = item.caloriesPer100g > 0 ? Math.round((item.caloriesPer100g * item.defaultQty) / 100) : 0;
                      const cardProt = item.proteinPer100g > 0 ? Math.round((item.proteinPer100g * item.defaultQty) / 100 * 10) / 10 : 0;
                      return (
                        <Animated.View
                          key={item.id}
                          entering={FadeInDown.springify().damping(15).delay(idx * 30)}
                          layout={LinearTransition.springify().damping(15)}
                        >
                          <Pressable
                            onPress={() => handleOpenDetail(item)}
                            style={({ pressed }) => [styles.foodCard, pressed && styles.btnPressed]}
                          >
                            <View style={styles.foodCardLeft}>
                              <View style={styles.foodEmojiCircle}>
                                <Text style={{ fontSize: 20 }}>{item.emoji || "🍽️"}</Text>
                              </View>
                              <View style={{ flex: 1 }}>
                                <Text style={styles.foodName} numberOfLines={1}>
                                  {item.name}
                                </Text>
                                <Text style={styles.foodMacros}>
                                  {cardCal} kcal · {cardProt}g protein
                                </Text>
                                <Text style={styles.foodServingSize}>
                                  Serving: {item.defaultQty}
                                  {item.quantityMode === "grams"
                                    ? "g"
                                    : item.quantityMode === "piece"
                                      ? " piece"
                                      : " ml"}
                                </Text>
                              </View>
                            </View>
                            <ScalePressable
                              onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                handleSearchSelect(item);
                              }}
                              style={styles.addButton}
                            >
                              <Ionicons name="add" size={20} color="#FFF" />
                            </ScalePressable>
                          </Pressable>
                        </Animated.View>
                      );
                    })}
                  </Animated.View>
                </ScrollView>
              ) : null}

              {searchQuery && !searching && searchResults.length === 0 && (
                <Text style={styles.noResults}>No foods found. Try a different search term.</Text>
              )}

              {/* Custom Foods Section */}
              <View style={styles.customSectionContainer}>
                <View style={styles.customSectionHeader}>
                  <Pressable
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setShowCustomFoods(!showCustomFoods);
                      setShowAddCustomForm(false);
                    }}
                    style={styles.customHeaderToggle}
                  >
                    <Ionicons
                      name={showCustomFoods ? "chevron-down" : "chevron-forward"}
                      size={16}
                      color="#4B5563"
                      style={{ marginRight: 6 }}
                    />
                    <Text style={styles.customSectionTitle}>
                      My Custom Foods ({customFoods.length})
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setShowAddCustomForm(!showAddCustomForm);
                      setShowCustomFoods(true);
                    }}
                    style={styles.customAddButton}
                  >
                    <Ionicons name="add" size={14} color="#FFF" style={{ marginRight: 2 }} />
                    <Text style={styles.customAddButtonText}>Add</Text>
                  </Pressable>
                </View>

                {showCustomFoods && showAddCustomForm && (() => {
                  const isPiece = customForm.quantityMode === "piece";
                  const isMl = customForm.quantityMode === "ml";
                  const weight = Number(customForm.customWeightG) || 100;
                  const hasWeight = !isPiece && Number(customForm.customWeightG) > 0;
                  const scale = hasWeight ? 100 / weight : 1;
                  const gpp = Number(customForm.gramsPerPiece) || 0;

                  // Live preview calculations
                  const pieceCalPreview = isPiece && customForm.caloriesInput ? Number(customForm.caloriesInput) : null;
                  const pieceProtPreview = isPiece && customForm.proteinInput ? Number(customForm.proteinInput) : null;
                  const pieceWeightLabel = gpp > 0 ? `${gpp}g per piece` : "? g per piece";

                  const gramsCalPreview = !isPiece && customForm.caloriesInput && hasWeight ? Math.round(Number(customForm.caloriesInput) * scale) : null;
                  const gramsProtPreview = !isPiece && customForm.proteinInput && hasWeight ? Math.round(Number(customForm.proteinInput) * scale * 10) / 10 : null;

                  const canSave = customForm.name.trim() && customForm.caloriesInput && customForm.proteinInput && (!isPiece || gpp > 0);

                  return (
                    <View style={styles.customFormCard}>
                      {/* Food Name */}
                      <Text style={styles.fieldLabel}>Custom Food Name</Text>
                      <TextInput
                        placeholder="e.g. Poached Egg, Protein Shake..."
                        value={customForm.name}
                        onChangeText={(t) => setCustomForm({ ...customForm, name: t })}
                        style={styles.textInput}
                        placeholderTextColor="#9CA3AF"
                      />

                      {/* Mode Selector */}
                      <Text style={styles.fieldLabel}>Quantity Mode</Text>
                      <View style={styles.unitSelector}>
                        {([
                          { value: "grams", label: "⚖️ Grams" },
                          { value: "piece", label: "🥚 Pieces" },
                          { value: "ml", label: "💧 ml" }
                        ] as const).map((mode) => {
                          const isSelected = customForm.quantityMode === mode.value;
                          return (
                            <Pressable
                              key={mode.value}
                              onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                setCustomForm({ ...customForm, quantityMode: mode.value });
                              }}
                              style={[styles.unitTab, isSelected && { backgroundColor: "#22C55E" }]}
                            >
                              <Text style={[styles.unitTabText, isSelected && styles.unitTabTextActive]}>
                                {mode.label}
                              </Text>
                            </Pressable>
                          );
                        })}
                      </View>

                      {/* Piece Mode Info and Fields */}
                      {isPiece && (
                        <View style={{ gap: 12 }}>
                          <View style={styles.pieceModeInfoCard}>
                            <Text style={styles.pieceModeInfoTitle}>🥚 Piece Mode</Text>
                            <Text style={styles.pieceModeInfoText}>
                              Enter the nutrition for 1 piece and the weight in grams. Logging 2 pieces will double everything automatically.
                            </Text>
                          </View>
                          <View style={styles.numericRow}>
                            <View style={styles.numericField}>
                              <Text style={styles.fieldLabel}>Grams per 1 Piece</Text>
                              <TextInput
                                placeholder="e.g. 60"
                                keyboardType="numeric"
                                value={customForm.gramsPerPiece.toString()}
                                onChangeText={(t) => setCustomForm({ ...customForm, gramsPerPiece: t })}
                                style={styles.numericInput}
                                placeholderTextColor="#9CA3AF"
                              />
                            </View>
                            <View style={styles.numericField}>
                              <Text style={styles.fieldLabel}>Default Pieces</Text>
                              <TextInput
                                placeholder="1"
                                keyboardType="numeric"
                                value={customForm.pieceQty.toString()}
                                onChangeText={(t) => setCustomForm({ ...customForm, pieceQty: Number(t) || 1 })}
                                style={styles.numericInput}
                                placeholderTextColor="#9CA3AF"
                              />
                            </View>
                          </View>

                          <View style={styles.numericRow}>
                            <View style={styles.numericField}>
                              <Text style={styles.fieldLabel}>Calories (per piece)</Text>
                              <TextInput
                                placeholder="kcal"
                                keyboardType="numeric"
                                value={customForm.caloriesInput.toString()}
                                onChangeText={(t) => setCustomForm({ ...customForm, caloriesInput: t })}
                                style={[styles.numericInput, { color: "#2563EB" }]}
                                placeholderTextColor="#9CA3AF"
                              />
                            </View>
                            <View style={styles.numericField}>
                              <Text style={styles.fieldLabel}>Protein g (per piece)</Text>
                              <TextInput
                                placeholder="grams"
                                keyboardType="decimal-pad"
                                value={customForm.proteinInput.toString()}
                                onChangeText={(t) => setCustomForm({ ...customForm, proteinInput: t })}
                                style={[styles.numericInput, { color: "#10B981" }]}
                                placeholderTextColor="#9CA3AF"
                              />
                            </View>
                          </View>

                          {pieceCalPreview !== null && (
                            <View style={styles.previewInfoCard}>
                              <Text style={styles.previewInfoTitle}>Preview ({pieceWeightLabel})</Text>
                              <Text style={styles.previewInfoText}>
                                1 pc → {pieceCalPreview} kcal · {pieceProtPreview ?? 0}g protein
                              </Text>
                              {customForm.pieceQty > 1 && (
                                <Text style={[styles.previewInfoText, { marginTop: 4, color: "#4B5563" }]}>
                                  {customForm.pieceQty} pcs → {Math.round(pieceCalPreview * customForm.pieceQty)} kcal · {Math.round((pieceProtPreview ?? 0) * customForm.pieceQty * 10) / 10}g protein
                                </Text>
                              )}
                            </View>
                          )}
                        </View>
                      )}

                      {/* Grams / ML Mode Fields */}
                      {!isPiece && (
                        <View style={{ gap: 12 }}>
                          <View style={styles.numericRow}>
                            <View style={styles.numericField}>
                              <Text style={styles.fieldLabel}>{isMl ? "Total ml" : "Weight (g)"}</Text>
                              <TextInput
                                placeholder="e.g. 100"
                                keyboardType="numeric"
                                value={customForm.customWeightG.toString()}
                                onChangeText={(t) => setCustomForm({ ...customForm, customWeightG: t })}
                                style={styles.numericInput}
                                placeholderTextColor="#9CA3AF"
                              />
                              <Text style={styles.inputHelperText}>Leave blank for per-100{isMl ? "ml" : "g"}</Text>
                            </View>
                            <View style={styles.numericField}>
                              <Text style={styles.fieldLabel}>
                                Calories {hasWeight ? `(for ${weight}${isMl ? "ml" : "g"})` : `(per 100${isMl ? "ml" : "g"})`}
                              </Text>
                              <TextInput
                                placeholder="kcal"
                                keyboardType="numeric"
                                value={customForm.caloriesInput.toString()}
                                onChangeText={(t) => setCustomForm({ ...customForm, caloriesInput: t })}
                                style={[styles.numericInput, { color: "#2563EB" }]}
                                placeholderTextColor="#9CA3AF"
                              />
                            </View>
                          </View>

                          <View style={{ flexDirection: "row", gap: 12 }}>
                            <View style={{ flex: 1 }}>
                              <Text style={styles.fieldLabel}>
                                Protein g {hasWeight ? `(for ${weight}${isMl ? "ml" : "g"})` : `(per 100${isMl ? "ml" : "g"})`}
                              </Text>
                              <TextInput
                                placeholder="grams"
                                keyboardType="decimal-pad"
                                value={customForm.proteinInput.toString()}
                                onChangeText={(t) => setCustomForm({ ...customForm, proteinInput: t })}
                                style={[styles.numericInput, { color: "#10B981" }]}
                                placeholderTextColor="#9CA3AF"
                              />
                            </View>
                            <View style={{ flex: 1 }}>
                              <Text style={styles.fieldLabel}>Carbs (g)</Text>
                              <TextInput
                                placeholder="grams"
                                keyboardType="decimal-pad"
                                value={customForm.carbsInput.toString()}
                                onChangeText={(t) => setCustomForm({ ...customForm, carbsInput: t })}
                                style={styles.numericInput}
                                placeholderTextColor="#9CA3AF"
                              />
                            </View>
                            <View style={{ flex: 1 }}>
                              <Text style={styles.fieldLabel}>Fat (g)</Text>
                              <TextInput
                                placeholder="grams"
                                keyboardType="decimal-pad"
                                value={customForm.fatInput.toString()}
                                onChangeText={(t) => setCustomForm({ ...customForm, fatInput: t })}
                                style={styles.numericInput}
                                placeholderTextColor="#9CA3AF"
                              />
                            </View>
                          </View>

                          {hasWeight && (gramsCalPreview !== null || gramsProtPreview !== null) && (
                            <View style={styles.previewInfoCard}>
                              <Text style={styles.previewInfoTitle}>Per 100{isMl ? "ml" : "g"} (auto-calculated)</Text>
                              <Text style={styles.previewInfoText}>
                                {gramsCalPreview ?? 0} kcal · {gramsProtPreview ?? 0}g protein
                              </Text>
                            </View>
                          )}
                        </View>
                      )}

                      {/* Emoji Row Selection */}
                      <Text style={[styles.fieldLabel, { marginTop: 12 }]}>Select Emoji Icon</Text>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                        <View style={styles.emojiRow}>
                          {["🍽️", "🍛", "🥚", "🥩", "🍗", "🥣", "🍚", "🥛", "🍞", "🥗", "🍕", "🍔", "🍎", "🍌"].map((emo) => {
                            const isSelected = customForm.emoji === emo;
                            return (
                              <Pressable
                                key={emo}
                                onPress={() => {
                                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                  setCustomForm({ ...customForm, emoji: emo });
                                }}
                                style={[styles.emojiBtn, isSelected && styles.emojiBtnActive]}
                              >
                                <Text style={styles.emojiText}>{emo}</Text>
                              </Pressable>
                            );
                          })}
                        </View>
                      </ScrollView>

                      {/* Save / Cancel buttons */}
                      <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
                        <Pressable
                          onPress={handleAddCustomFood}
                          disabled={!canSave}
                          style={[styles.customSaveBtn, !canSave && styles.customSaveBtnDisabled]}
                        >
                          <Text style={styles.customSaveBtnText}>Save</Text>
                        </Pressable>
                        <Pressable
                          onPress={() => setShowAddCustomForm(false)}
                          style={styles.customCancelBtn}
                        >
                          <Text style={styles.customCancelBtnText}>Cancel</Text>
                        </Pressable>
                      </View>
                    </View>
                  );
                })()}

                {showCustomFoods && (
                  <View style={styles.customListContainer}>
                    {customFoods.length === 0 ? (
                      <Text style={styles.customListEmpty}>No custom foods yet</Text>
                    ) : (
                      customFoods.map((food) => (
                        <Pressable
                          key={food.id}
                          onPress={() => handleOpenDetail(food)}
                          style={({ pressed }) => [styles.customFoodRow, pressed && styles.btnPressed]}
                        >
                          <View style={styles.customFoodRowLeft}>
                            <View style={styles.customFoodEmojiCircle}>
                              <Text style={{ fontSize: 16 }}>{food.emoji || "🍽️"}</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                              <Text style={styles.customFoodName} numberOfLines={1}>
                                {food.name}
                              </Text>
                              <Text style={styles.customFoodMacros}>
                                {food.caloriesPer100g} kcal · {food.proteinPer100g}g protein / 100g
                              </Text>
                            </View>
                          </View>
                          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                            <Pressable
                              onPress={() => {
                                Alert.alert("Delete Custom Food", `Are you sure you want to delete "${food.name}"?`, [
                                  { text: "Cancel", style: "cancel" },
                                  { text: "Delete", style: "destructive", onPress: () => deleteCustomFood(food.id) }
                                ]);
                              }}
                              style={styles.customTrashBtn}
                              hitSlop={8}
                            >
                              <Ionicons name="trash-outline" size={16} color="#EF4444" />
                            </Pressable>
                            <Pressable
                              onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                handleSearchSelect(food);
                              }}
                              style={styles.customAddRowBtn}
                            >
                              <Ionicons name="add" size={16} color="#FFF" />
                            </Pressable>
                          </View>
                        </Pressable>
                      ))
                    )}
                  </View>
                )}
              </View>

              {/* My Saved Meals (rendered here below Custom Foods when not searching) */}
              {searchQuery.trim() === "" && mealTemplates && mealTemplates.length > 0 && (
                <View style={[styles.templatesContainer, { marginTop: 24 }]}>
                  <Text style={styles.templatesTitle}>My Saved Meals</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.templatesScroll}
                    contentContainerStyle={styles.templatesContent}
                  >
                    {mealTemplates.map((template, idx) => {
                      const totalCals = template.items.reduce((sum, item) => sum + item.calories, 0);
                      const totalProt = template.items.reduce((sum, item) => sum + item.protein, 0);
                      const emoji = template.items[0]?.emoji || "🍱";
                      const tagEmoji = template.tag === "breakfast" ? "🍳" : template.tag === "lunch" ? "🥗" : template.tag === "dinner" ? "🍽️" : template.tag === "snack" ? "🍏" : "🍕";
                      return (
                        <Animated.View
                          key={template.id}
                          entering={FadeInDown.springify().damping(15).delay(idx * 50)}
                        >
                          <ScalePressable
                            onPress={() => {
                              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                              setSelectedTemplate(template);
                            }}
                            style={styles.templateCard}
                          >
                            <View style={styles.templateHeader}>
                              <Text style={styles.templateName} numberOfLines={1}>
                                {template.name}
                              </Text>
                              <Text style={styles.templateEmoji}>{emoji}</Text>
                            </View>
                            <Text style={styles.templateTag}>
                              {tagEmoji} {template.tag}
                            </Text>
                            <View style={styles.templateMacrosRow}>
                              <Text style={styles.templateCals}>{totalCals} kcal</Text>
                              <Text style={styles.templateProt}>{totalProt.toFixed(1)}g P</Text>
                            </View>
                          </ScalePressable>
                        </Animated.View>
                      );
                    })}
                  </ScrollView>
                </View>
              )}
            </>
          )
        )}

        {activeTab === "public" && !editId && (
          selectedDbItem ? (
            renderInlineDetailCard()
          ) : (
            <>
              {/* Search Input Container */}
              <View style={styles.searchBarContainer}>
                <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
                <TextInput
                  placeholder="Search public foods from community..."
                  value={publicQuery}
                  onChangeText={setPublicQuery}
                  style={styles.searchInput}
                  placeholderTextColor="#9CA3AF"
                  clearButtonMode="while-editing"
                />
                {publicQuery.length > 0 && (
                  <Pressable
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setPublicQuery("");
                    }}
                    style={styles.clearSearchBtn}
                  >
                    <Ionicons name="close-circle" size={18} color="#9CA3AF" />
                  </Pressable>
                )}
              </View>

              {/* Contribute Toggle Button */}
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setShowPublicForm(!showPublicForm);
                  setPublicFormSubmitted(false);
                }}
                style={({ pressed }) => [styles.contributeBtn, pressed && styles.btnPressed]}
              >
                <Ionicons name={showPublicForm ? "close" : "add"} size={16} color="#2563EB" />
                <Text style={styles.contributeBtnText}>
                  {showPublicForm ? "Cancel" : "Contribute a New Food"}
                </Text>
              </Pressable>

              {/* Contribute Form Card */}
              {showPublicForm && (
                <View style={[styles.manualForm, { marginBottom: 20, backgroundColor: "rgba(255,255,255,0.95)" }]}>
                  {publicFormSubmitted ? (
                    <View style={styles.successCard}>
                      <Text style={{ fontSize: 32 }}>✅</Text>
                      <Text style={styles.successText}>Food contributed to public database!</Text>
                    </View>
                  ) : (
                    <>
                      <Text style={styles.formCardTitle}>Add Community Food 🌍</Text>

                      <Text style={styles.fieldLabel}>Food Name</Text>
                      <TextInput
                        placeholder="e.g. Chicken Biryani, Paneer Tikka..."
                        value={publicForm.name}
                        onChangeText={(t) => setPublicForm({ ...publicForm, name: t })}
                        style={styles.textInput}
                        placeholderTextColor="#9CA3AF"
                      />

                      <View style={styles.numericRow}>
                        <View style={styles.numericField}>
                          <Text style={styles.fieldLabel}>Calories</Text>
                          <TextInput
                            placeholder="kcal"
                            keyboardType="numeric"
                            value={publicForm.calories}
                            onChangeText={(t) => setPublicForm({ ...publicForm, calories: t })}
                            style={styles.numericInput}
                            placeholderTextColor="#9CA3AF"
                          />
                        </View>
                        <View style={styles.numericField}>
                          <Text style={styles.fieldLabel}>Protein (g)</Text>
                          <TextInput
                            placeholder="grams"
                            keyboardType="decimal-pad"
                            value={publicForm.protein}
                            onChangeText={(t) => setPublicForm({ ...publicForm, protein: t })}
                            style={styles.numericInput}
                            placeholderTextColor="#9CA3AF"
                          />
                        </View>
                      </View>

                      <View style={styles.numericRow}>
                        <View style={styles.numericField}>
                          <Text style={styles.fieldLabel}>Carbs (g)</Text>
                          <TextInput
                            placeholder="grams"
                            keyboardType="decimal-pad"
                            value={publicForm.carbs}
                            onChangeText={(t) => setPublicForm({ ...publicForm, carbs: t })}
                            style={styles.numericInput}
                            placeholderTextColor="#9CA3AF"
                          />
                        </View>
                        <View style={styles.numericField}>
                          <Text style={styles.fieldLabel}>Fat (g)</Text>
                          <TextInput
                            placeholder="grams"
                            keyboardType="decimal-pad"
                            value={publicForm.fat}
                            onChangeText={(t) => setPublicForm({ ...publicForm, fat: t })}
                            style={styles.numericInput}
                            placeholderTextColor="#9CA3AF"
                          />
                        </View>
                      </View>

                      {/* Serving Unit selector */}
                      <Text style={styles.fieldLabel}>Unit Type</Text>
                      <View style={styles.unitSelector}>
                        {([
                          { value: "g", label: "Grams (g)" },
                          { value: "ml", label: "Milliliters (ml)" },
                          { value: "piece", label: "Pieces (pc)" }
                        ] as const).map((unit) => {
                          const isSelected = publicForm.servingUnit === unit.value;
                          return (
                            <Pressable
                              key={unit.value}
                              onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                setPublicForm({ ...publicForm, servingUnit: unit.value });
                              }}
                              style={[styles.unitTab, isSelected && styles.unitTabActive]}
                            >
                              <Text style={[styles.unitTabText, isSelected && styles.unitTabTextActive]}>
                                {unit.label}
                              </Text>
                            </Pressable>
                          );
                        })}
                      </View>

                      {publicForm.servingUnit === "piece" ? (
                        <View style={{ marginBottom: 16 }}>
                          <Text style={styles.fieldLabel}>Grams per 1 Piece</Text>
                          <TextInput
                            placeholder="e.g. 60"
                            keyboardType="numeric"
                            value={publicForm.gramsPerPiece}
                            onChangeText={(t) => setPublicForm({ ...publicForm, gramsPerPiece: t })}
                            style={styles.numericInput}
                            placeholderTextColor="#9CA3AF"
                          />
                          <Text style={{ fontSize: 10, color: "#F59E0B", fontWeight: "600", marginTop: 4 }}>
                            🥚 Piece Mode: Enter nutrition per 1 piece above. Specifying grams per piece lets counts scale correctly.
                          </Text>
                        </View>
                      ) : (
                        <View style={{ marginBottom: 16 }}>
                          <Text style={styles.fieldLabel}>Serving Size</Text>
                          <TextInput
                            placeholder="e.g. 100"
                            keyboardType="numeric"
                            value={publicForm.servingSize}
                            onChangeText={(t) => setPublicForm({ ...publicForm, servingSize: t })}
                            style={styles.numericInput}
                            placeholderTextColor="#9CA3AF"
                          />
                          <Text style={{ fontSize: 10, color: "#2563EB", fontWeight: "600", marginTop: 4 }}>
                            Nutrition values above should correspond to this serving size.
                          </Text>
                        </View>
                      )}

                      {/* Emoji Row Selection */}
                      <Text style={styles.fieldLabel}>Select Emoji Icon</Text>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
                        <View style={styles.emojiRow}>
                          {["🍽️", "🍛", "🥚", "🥩", "🍗", "🥣", "🍚", "🥛", "🍞", "🥗", "🍕", "🍔", "🍎", "🍌"].map((emo) => {
                            const isSelected = publicForm.emoji === emo;
                            return (
                              <Pressable
                                key={emo}
                                onPress={() => {
                                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                  setPublicForm({ ...publicForm, emoji: emo });
                                }}
                                style={[styles.emojiBtn, isSelected && styles.emojiBtnActive]}
                              >
                                <Text style={styles.emojiText}>{emo}</Text>
                              </Pressable>
                            );
                          })}
                        </View>
                      </ScrollView>

                      <Pressable
                        onPress={handlePublicSubmit}
                        disabled={
                          !publicForm.name.trim() ||
                          !publicForm.calories ||
                          !publicForm.protein ||
                          (publicForm.servingUnit !== "piece" && !publicForm.servingSize) ||
                          (publicForm.servingUnit === "piece" && !publicForm.gramsPerPiece) ||
                          publicSubmitting
                        }
                        style={[
                          styles.submitBtn,
                          (!publicForm.name.trim() || !publicForm.calories || !publicForm.protein || publicSubmitting) && styles.submitBtnDisabled
                        ]}
                      >
                        <Text style={styles.submitBtnText}>
                          {publicSubmitting ? "Contributing..." : "Submit to Public DB"}
                        </Text>
                      </Pressable>
                    </>
                  )}
                </View>
              )}

              {/* Results / Recents lists */}
              {!publicQuery.trim() && !showPublicForm && (
                <View style={{ gap: 12 }}>
                  <Text style={styles.fieldLabel}>Recently Added by Community</Text>
                  {loadingRecentPublic ? (
                    <View style={{ alignItems: "center", paddingVertical: 20 }}>
                      <Text style={{ fontSize: 13, color: "#6B7280" }}>Loading recents...</Text>
                    </View>
                  ) : recentPublic.length === 0 ? (
                    <Text style={styles.noResults}>No community contributions found. Be the first!</Text>
                  ) : (
                    <View style={styles.foodCardsList}>
                      {recentPublic.map((item) => (
                        <Pressable
                          key={item.id}
                          onPress={() => handleOpenDetail(item)}
                          style={({ pressed }) => [styles.foodCard, pressed && styles.btnPressed]}
                        >
                          <View style={styles.foodCardLeft}>
                            <View style={styles.foodEmojiCircle}>
                              <Text style={{ fontSize: 20 }}>{item.emoji || "🍽️"}</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                              <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                                <Text style={styles.foodName} numberOfLines={1}>
                                  {item.name}
                                </Text>
                                {item.isPublic && item.servingSize && (
                                  <View style={styles.servingBadge}>
                                    <Text style={styles.servingBadgeText}>
                                      {item.quantityMode === "piece" ? `${item.gramsPerPiece}g/pc` : `${item.servingSize}${item.servingUnit}`}
                                    </Text>
                                  </View>
                                )}
                              </View>
                              <Text style={styles.foodMacros}>
                                {item.caloriesPer100g} kcal · {item.proteinPer100g}g protein (per 100g)
                              </Text>
                            </View>
                          </View>

                          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                            {item.isOwner && (
                              <Pressable
                                onPress={() => handleDeletePublicFood(item)}
                                style={({ pressed }) => [styles.deleteBtn, pressed && styles.btnPressed]}
                                hitSlop={8}
                              >
                                <Ionicons name="trash-outline" size={18} color="#EF4444" />
                              </Pressable>
                            )}
                            <Pressable
                              onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                handleSearchSelect(item);
                              }}
                              style={({ pressed }) => [styles.addButton, pressed && styles.btnPressed]}
                            >
                              <Ionicons name="add" size={20} color="#FFF" />
                            </Pressable>
                          </View>
                        </Pressable>
                      ))}
                    </View>
                  )}
                </View>
              )}

              {publicQuery.trim().length > 0 && (
                <View style={{ gap: 12 }}>
                  <Text style={styles.fieldLabel}>Search Results</Text>
                  {searchingPublic ? (
                    <View style={{ alignItems: "center", paddingVertical: 20 }}>
                      <Text style={{ fontSize: 13, color: "#6B7280" }}>Searching...</Text>
                    </View>
                  ) : publicResults.length === 0 ? (
                    <Text style={styles.noResults}>No public foods found for "{publicQuery}".</Text>
                  ) : (
                    <ScrollView
                      style={{ maxHeight: 380 }}
                      nestedScrollEnabled={true}
                      showsVerticalScrollIndicator={true}
                      contentContainerStyle={{ paddingBottom: 8 }}
                    >
                      <View style={styles.foodCardsList}>
                        {publicResults.map((item) => (
                          <Pressable
                            key={item.id}
                            onPress={() => handleOpenDetail(item)}
                            style={({ pressed }) => [styles.foodCard, pressed && styles.btnPressed]}
                          >
                            <View style={styles.foodCardLeft}>
                              <View style={styles.foodEmojiCircle}>
                                <Text style={{ fontSize: 20 }}>{item.emoji || "🍽️"}</Text>
                              </View>
                              <View style={{ flex: 1 }}>
                                <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                                  <Text style={styles.foodName} numberOfLines={1}>
                                    {item.name}
                                  </Text>
                                  {item.isPublic && item.servingSize && (
                                    <View style={styles.servingBadge}>
                                      <Text style={styles.servingBadgeText}>
                                        {item.quantityMode === "piece" ? `${item.gramsPerPiece}g/pc` : `${item.servingSize}${item.servingUnit}`}
                                      </Text>
                                    </View>
                                  )}
                                </View>
                                <Text style={styles.foodMacros}>
                                  {item.caloriesPer100g} kcal · {item.proteinPer100g}g protein (per 100g)
                                </Text>
                              </View>
                            </View>

                            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                              {item.isOwner && (
                                <Pressable
                                  onPress={() => handleDeletePublicFood(item)}
                                  style={({ pressed }) => [styles.deleteBtn, pressed && styles.btnPressed]}
                                  hitSlop={8}
                                >
                                  <Ionicons name="trash-outline" size={18} color="#EF4444" />
                                </Pressable>
                              )}
                              <Pressable
                                onPress={() => {
                                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                  handleSearchSelect(item);
                                }}
                                style={({ pressed }) => [styles.addButton, pressed && styles.btnPressed]}
                              >
                                <Ionicons name="add" size={20} color="#FFF" />
                              </Pressable>
                            </View>
                          </Pressable>
                        ))}
                      </View>
                    </ScrollView>
                  )}
                </View>
              )}
            </>
          )
        )}

        {(activeTab === "manual" || !!editId) && (
          <View style={{ gap: 16 }}>
            {recentlyLogged.length > 0 && !editId && (
              <View>
                <Text style={styles.fieldLabel}>Logged Today (Tap to Re-log)</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 8 }}
                >
                  {recentlyLogged.map((food) => (
                    <Pressable
                      key={food.id}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        handleReLog(food as any);
                      }}
                      style={({ pressed }) => [styles.chip, pressed && styles.btnPressed]}
                    >
                      <Text style={styles.chipText}>+ {food.name}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            )}

            {suggestions.length > 0 && !editId && (
              <View style={styles.suggestionsCard}>
                <Text style={styles.fieldLabel}>Suggestions</Text>
                <View style={{ gap: 6 }}>
                  {suggestions.map((food) => (
                    <Pressable
                      key={food.name}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        handleSuggestionTap(food);
                      }}
                      style={({ pressed }) => [styles.suggestionRow, pressed && styles.btnPressed]}
                    >
                      <Text style={styles.suggestionName} numberOfLines={1}>
                        {food.name}
                      </Text>
                      <Text style={styles.suggestionMacros}>
                        {food.calories} kcal · {food.protein}g protein
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

            <View style={styles.manualForm}>
              <Text style={styles.fieldLabel}>Describe meal or override name</Text>
              <TextInput
                placeholder="e.g. egg (auto-fills breakfast) or pizza 280 kcal"
                value={naturalText}
                onChangeText={(text) => {
                  setNaturalText(text);
                  const parsed = parseNaturalLanguage(text);
                  if (parsed) {
                    setName(parsed.name);
                    if (parsed.calories > 0) setCalories(parsed.calories);
                    if (parsed.protein > 0) setProtein(parsed.protein);
                    if (parsed.tag) setActiveTag(parsed.tag);
                  } else {
                    setName(text);
                  }
                }}
                style={styles.textInput}
                placeholderTextColor="#9CA3AF"
              />
              <View style={styles.numericRow}>
                <View style={styles.numericField}>
                  <Text style={styles.fieldLabel}>Calories</Text>
                  <TextInput
                    value={calories.toString()}
                    onChangeText={(t) => setCalories(parseInt(t, 10) || 0)}
                    keyboardType="numeric"
                    style={styles.numericInput}
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
                <View style={styles.numericField}>
                  <Text style={styles.fieldLabel}>Protein</Text>
                  <TextInput
                    value={protein.toString()}
                    onChangeText={(t) => setProtein(parseFloat(t) || 0)}
                    keyboardType="decimal-pad"
                    style={styles.numericInput}
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>

              <Text style={styles.fieldLabel}>Category Tag</Text>
              <View style={styles.tagRow}>
                {tagsList.map((item) => (
                  <Pressable
                    key={item.value}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setActiveTag(item.value);
                    }}
                    style={[styles.tagBtn, activeTag === item.value && styles.tagBtnActive]}
                  >
                    <Text style={[styles.tagBtnText, activeTag === item.value && styles.tagBtnTextActive]}>
                      {item.label}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
                <Pressable
                  onPress={handleAddManualToQueue}
                  disabled={!canSubmit}
                  style={[
                    styles.submitBtn,
                    { backgroundColor: "#EFFDF4", borderWidth: 1.5, borderColor: "#22C55E" },
                    !canSubmit && styles.submitBtnDisabled
                  ]}
                >
                  <Text style={[styles.submitBtnText, { color: "#15803D" }]}>+ Add to Queue</Text>
                </Pressable>
                <Pressable
                  onPress={handleSubmit}
                  disabled={!canSubmit}
                  style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}
                >
                  <Text style={styles.submitBtnText}>{editId ? "Save Changes" : "Log Now"}</Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}
        {/* Inline Meal Builder Card */}
        {mealItems.length > 0 && (
          <Animated.View
            entering={FadeInDown.springify().damping(15)}
            layout={LinearTransition.springify().damping(15)}
            style={styles.builderCardInline}
          >
            {/* Header */}
            <View style={styles.builderHeaderInline}>
              <View>
                <Text style={styles.builderTitleInline}>Meal Builder</Text>
                <Text style={styles.builderSubtitleInline}>
                  {mealItems.length} item{mealItems.length > 1 ? "s" : ""} added
                </Text>
              </View>
              <View style={styles.builderActionsInline}>
                <ScalePressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setShowSaveTemplateModal(true);
                  }}
                  style={styles.builderActionBtnInline}
                >
                  <Ionicons name="bookmark-outline" size={14} color="#2563EB" />
                  <Text style={[styles.builderActionTextInline, { color: "#2563EB" }]}>Save Template</Text>
                </ScalePressable>
                <ScalePressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setMealItems([]);
                  }}
                  style={[styles.builderActionBtnInline, { marginLeft: 8 }]}
                >
                  <Text style={[styles.builderActionTextInline, { color: "#EF4444" }]}>Clear All</Text>
                </ScalePressable>
              </View>
            </View>

            {/* Totals Grid */}
            <View style={[styles.builderMacrosGridInline, { marginBottom: 12 }]}>
              <View style={[styles.builderMacroItemInline, { backgroundColor: "#FFF", borderColor: "rgba(0,0,0,0.05)" }]}>
                <Text style={styles.builderMacroLabelInline}>Calories</Text>
                <AnimMacroText value={builderTotals.calories} style={[styles.builderMacroValueInline, { color: "#2563EB" }]} />
                <Text style={styles.builderMacroUnitInline}>kcal</Text>
              </View>
              <View style={[styles.builderMacroItemInline, { backgroundColor: "#FFF", borderColor: "rgba(0,0,0,0.05)" }]}>
                <Text style={styles.builderMacroLabelInline}>Protein</Text>
                <AnimMacroText value={`${builderTotals.protein}g`} style={[styles.builderMacroValueInline, { color: "#10B981" }]} />
                <Text style={styles.builderMacroUnitInline}>grams</Text>
              </View>
              {settings.trackCarbsFat && (
                <>
                  <View style={[styles.builderMacroItemInline, { backgroundColor: "#FFF", borderColor: "rgba(0,0,0,0.05)" }]}>
                    <Text style={styles.builderMacroLabelInline}>Carbs</Text>
                    <AnimMacroText value={`${builderTotals.carbs}g`} style={[styles.builderMacroValueInline, { color: "#F59E0B" }]} />
                    <Text style={styles.builderMacroUnitInline}>grams</Text>
                  </View>
                  <View style={[styles.builderMacroItemInline, { backgroundColor: "#FFF", borderColor: "rgba(0,0,0,0.05)" }]}>
                    <Text style={styles.builderMacroLabelInline}>Fat</Text>
                    <AnimMacroText value={`${builderTotals.fat}g`} style={[styles.builderMacroValueInline, { color: "#EF4444" }]} />
                    <Text style={styles.builderMacroUnitInline}>grams</Text>
                  </View>
                </>
              )}
            </View>

            {/* Items List */}
            <Animated.View layout={LinearTransition.springify().damping(15)} style={styles.builderListInline}>
              {mealItems.map((item, idx) => (
                <Animated.View
                  key={`${item.dbItemId}-${idx}`}
                  entering={FadeInDown.springify().damping(15)}
                  exiting={FadeOutDown.duration(180)}
                  layout={LinearTransition.springify().damping(15)}
                  style={styles.builderItemRowInline}
                >
                  <View style={styles.builderItemLeftInline}>
                    <Text style={styles.builderItemEmojiInline}>{item.emoji || "🍽️"}</Text>
                    <View style={{ flex: 1, marginLeft: 8 }}>
                      <Text style={styles.builderItemNameInline} numberOfLines={1}>{item.name}</Text>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 }}>
                        <ScalePressable
                          onPress={() => handleAdjustQty(idx, -1)}
                          style={styles.qtyAdjustBtn}
                        >
                          <Ionicons name="remove" size={12} color="#4B5563" />
                        </ScalePressable>
                        <AnimMacroText
                          value={`${item.displayQty}${getUnitLabel(item)}`}
                          style={styles.qtyValueText}
                        />
                        <ScalePressable
                          onPress={() => handleAdjustQty(idx, 1)}
                          style={styles.qtyAdjustBtn}
                        >
                          <Ionicons name="add" size={12} color="#4B5563" />
                        </ScalePressable>
                      </View>
                    </View>
                  </View>
                  <View style={styles.builderItemRightInline}>
                    <Text style={styles.builderItemCalTextInline}>{item.calories} kcal</Text>
                    <Text style={styles.builderItemProtTextInline}>{item.protein}g P</Text>
                    <ScalePressable
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        setMealItems((prev) => prev.filter((_, i) => i !== idx));
                      }}
                      style={styles.builderItemRemoveBtnInline}
                      hitSlop={8}
                    >
                      <Ionicons name="close" size={14} color="#9CA3AF" />
                    </ScalePressable>
                  </View>
                </Animated.View>
              ))}
            </Animated.View>

            {/* Tag Selector */}
            <View style={{ marginTop: 12 }}>
              <Text style={styles.fieldLabel}>Meal Tag</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.tagScrollInline}
                contentContainerStyle={styles.tagScrollContentInline}
              >
                {tagsList.map((t) => {
                  const isSelected = activeTag === t.value;
                  const emoji = t.value === "breakfast" ? "🍳" : t.value === "lunch" ? "🥗" : t.value === "dinner" ? "🍽️" : t.value === "snack" ? "🍏" : "🍕";
                  return (
                    <ScalePressable
                      key={t.value}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setActiveTag(t.value);
                      }}
                      style={[
                        styles.tagPillInline,
                        isSelected && styles.tagPillSelectedInline,
                      ]}
                    >
                      <Text style={styles.tagPillTextInline}>
                        {emoji} {t.label}
                      </Text>
                    </ScalePressable>
                  );
                })}
              </ScrollView>
            </View>

            {/* Log Mode Options */}
            <View style={{ marginTop: 12 }}>
              <Text style={styles.fieldLabel}>How to Log?</Text>
              <View style={styles.logModeGridInline}>
                <ScalePressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setLogMode("individual");
                  }}
                  style={[
                    styles.logModeCardInline,
                    logMode === "individual" && styles.logModeCardSelectedInline,
                  ]}
                >
                  <Text style={styles.logModeTitleInline}>📋 Separate</Text>
                  <Text style={styles.logModeDescInline}>Each food logged as own entry</Text>
                </ScalePressable>
                <ScalePressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setLogMode("combined");
                  }}
                  style={[
                    styles.logModeCardInline,
                    logMode === "combined" && styles.logModeCardSelectedInline,
                  ]}
                >
                  <Text style={styles.logModeTitleInline}>🍱 Combined</Text>
                  <Text style={styles.logModeDescInline}>One entry with total macros</Text>
                </ScalePressable>
              </View>
            </View>

            {/* Log CTA Button */}
            <ScalePressable
              onPress={() => {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                handleLogMeal(logMode, activeTag);
              }}
              style={styles.builderLogBtnInline}
            >
              <Text style={styles.builderLogBtnTextInline}>
                ✓ Log {logMode === "combined" ? "as 1 Meal" : `${mealItems.length} Items`} to {tagsList.find(t => t.value === activeTag)?.label}
              </Text>
            </ScalePressable>
          </Animated.View>
        )}
      </ScrollView>

      {/* Selected Template Modal Overlay */}
      {selectedTemplate && (
        <Modal visible={!!selectedTemplate} transparent animationType="fade">
          <View style={styles.modalBackdrop}>
            <View style={[styles.modalCard, { maxWidth: 320 }]}>
              <Text style={styles.modalTitle}>Saved Meal Template 🍱</Text>

              <Text style={[styles.detailFoodName, { marginBottom: 4 }]}>
                {selectedTemplate.name}
              </Text>
              <Text style={[styles.templateTag, { textAlign: "center", marginBottom: 12 }]}>
                {selectedTemplate.tag === "breakfast" ? "🍳" : selectedTemplate.tag === "lunch" ? "🥗" : selectedTemplate.tag === "dinner" ? "🍽️" : selectedTemplate.tag === "snack" ? "🍏" : "🍕"} {selectedTemplate.tag}
              </Text>

              {/* Scrollable list of ingredients */}
              <View style={styles.templateIngredientsContainer}>
                <Text style={styles.ingredientsTitle}>Ingredients ({selectedTemplate.items.length})</Text>
                <ScrollView style={styles.ingredientsScroll} showsVerticalScrollIndicator={false}>
                  {selectedTemplate.items.map((item: any, idx: number) => (
                    <View key={item.id || idx} style={styles.ingredientRow}>
                      <Text style={styles.ingredientName} numberOfLines={1}>
                        {item.emoji || "🍽️"} {item.name}
                      </Text>
                      <Text style={styles.ingredientQty}>
                        {item.displayQty} {item.quantityMode === "piece" ? (item.displayQty === 1 ? "piece" : "pieces") : item.quantityMode === "ml" ? "ml" : item.quantityMode === "serving" ? "serving" : "g"}
                      </Text>
                    </View>
                  ))}
                </ScrollView>
              </View>

              <View style={[styles.modalButtons, { flexDirection: "column", gap: 8, marginTop: 16 }]}>
                <Pressable
                  onPress={() => {
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    handleLogTemplate(selectedTemplate);
                  }}
                  style={({ pressed }) => [styles.submitBtn, pressed && styles.btnPressed]}
                >
                  <Text style={styles.submitBtnText}>🚀 Log Instantly</Text>
                </Pressable>

                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    handleLoadTemplateToBuilder(selectedTemplate);
                  }}
                  style={({ pressed }) => [
                    styles.submitBtn,
                    { backgroundColor: "#EFFDF4", borderWidth: 1.5, borderColor: "#22C55E" },
                    pressed && styles.btnPressed
                  ]}
                >
                  <Text style={[styles.submitBtnText, { color: "#15803D" }]}>📥 Load to Meal Builder</Text>
                </Pressable>

                <View style={{ flexDirection: "row", gap: 8, width: "100%" }}>
                  <Pressable
                    onPress={() => handleDeleteTemplate(selectedTemplate.id)}
                    style={({ pressed }) => [
                      styles.modalCancelBtn,
                      { backgroundColor: "#FEF2F2" },
                      pressed && styles.btnPressed
                    ]}
                  >
                    <Text style={[styles.modalCancelText, { color: "#EF4444" }]}>🗑️ Delete</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setSelectedTemplate(null)}
                    style={({ pressed }) => [styles.modalCancelBtn, pressed && styles.btnPressed]}
                  >
                    <Text style={styles.modalCancelText}>Close</Text>
                  </Pressable>
                </View>
              </View>

            </View>
          </View>
        </Modal>
      )}

      {/* Save Template Prompt Modal */}
      <Modal visible={showSaveTemplateModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Save Meal Template 💾</Text>
            <TextInput
              placeholder="e.g. My Favorite Breakfast"
              value={templateName}
              onChangeText={setTemplateName}
              style={styles.modalInput}
              placeholderTextColor="#9CA3AF"
              autoFocus
            />
            <View style={styles.modalButtons}>
              <Pressable
                onPress={() => setShowSaveTemplateModal(false)}
                style={styles.modalCancelBtn}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>

              <Pressable
                onPress={handleSaveTemplate}
                style={[styles.modalSaveBtn, !templateName.trim() && styles.modalSaveBtnDisabled]}
                disabled={!templateName.trim()}
              >
                <Text style={styles.modalSaveText}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingBottom: 220, // extra padding for bottom drawers
  },
  title: {
    fontSize: 22,
    fontWeight: "900",
    color: "#1F2937",
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  glassTabBar: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    borderRadius: 18,
    padding: 4,
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.6)",
    shadowColor: "#22C55E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 14,
  },
  tabActive: {
    backgroundColor: "#22C55E",
  },
  tabText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#71717A",
  },
  tabTextActive: {
    color: "#FFF",
  },
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.7)",
    paddingHorizontal: 14,
    marginBottom: 16,
    shadowColor: "#22C55E",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 3,
    height: 54,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#1F2937",
    fontWeight: "600",
    height: "100%",
  },
  clearSearchBtn: {
    padding: 4,
  },
  categoryScroll: {
    marginBottom: 20,
  },
  categoryContent: {
    gap: 8,
    paddingRight: 16,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.6)",
    shadowColor: "#22C55E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.01,
    shadowRadius: 6,
    elevation: 1,
  },
  categoryChipSelected: {
    backgroundColor: "#DCFCE7",
    borderColor: "#22C55E",
  },
  categoryEmoji: {
    fontSize: 14,
    marginRight: 6,
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#4B5563",
  },
  categoryLabelSelected: {
    color: "#15803D",
  },
  foodCardsList: {
    gap: 12,
  },
  foodCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    borderRadius: 20,
    padding: 14,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.6)",
    shadowColor: "#22C55E",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 3,
  },
  foodCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  foodEmojiCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#EFFDF4",
    justifyContent: "center",
    alignItems: "center",
  },
  foodName: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1F2937",
  },
  foodMacros: {
    fontSize: 12,
    fontWeight: "700",
    color: "#10B981",
    marginTop: 2,
  },
  foodServingSize: {
    fontSize: 10,
    color: "#9CA3AF",
    fontWeight: "600",
    marginTop: 1,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#22C55E",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#22C55E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  btnPressed: {
    transform: [{ scale: 0.96 }],
    opacity: 0.85,
  },
  noResults: {
    textAlign: "center",
    color: "#6B7280",
    fontSize: 13,
    marginTop: 24,
    fontWeight: "600",
  },
  manualForm: {
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    borderRadius: 24,
    padding: 20,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.7)",
    shadowColor: "#22C55E",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 3,
  },
  textInput: {
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    borderRadius: 16,
    padding: 14,
    fontSize: 14,
    color: "#1F2937",
    borderWidth: 1.5,
    borderColor: "#DCFCE7",
    marginBottom: 16,
    fontWeight: "600",
  },
  numericRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  numericField: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  numericInput: {
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: "#1F2937",
    borderWidth: 1.5,
    borderColor: "#DCFCE7",
    fontWeight: "700",
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  },
  tagBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(229, 231, 235, 0.5)",
  },
  tagBtnActive: {
    backgroundColor: "#22C55E",
  },
  tagBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#4B5563",
  },
  tagBtnTextActive: {
    color: "#FFF",
  },
  submitRow: {
    flexDirection: "row",
  },
  submitBtn: {
    flex: 1,
    backgroundColor: "#22C55E",
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#22C55E",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnDisabled: {
    backgroundColor: "#E5E7EB",
    opacity: 0.6,
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FFF",
  },

  // 3. Food Detail Modal Styles
  detailBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    justifyContent: "flex-end",
  },
  detailCard: {
    backgroundColor: "#F8FFF7",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 40,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.8)",
  },
  detailCloseBtn: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  detailIllustrationContainer: {
    alignItems: "center",
    marginVertical: 16,
  },
  detailEmojiCircle: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: "#EFFDF4",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#22C55E",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 12,
  },
  detailFoodName: {
    fontSize: 18,
    fontWeight: "900",
    color: "#1F2937",
    textAlign: "center",
  },
  detailFoodBaseMacros: {
    fontSize: 11,
    color: "#6B7280",
    fontWeight: "600",
    marginTop: 4,
  },
  detailSectionTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: "#4B5563",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 16,
    marginBottom: 8,
  },
  sliderContainer: {
    alignItems: "center",
    marginBottom: 8,
  },
  sliderValueText: {
    fontSize: 20,
    fontWeight: "900",
    color: "#15803D",
    marginBottom: 4,
  },
  slider: {
    width: "100%",
    height: 40,
  },
  presetsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  presetBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 12,
    backgroundColor: "rgba(229, 231, 235, 0.5)",
    borderWidth: 1,
    borderColor: "transparent",
  },
  presetBtnActive: {
    backgroundColor: "#EFFDF4",
    borderColor: "#22C55E",
  },
  presetBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#4B5563",
  },
  presetBtnTextActive: {
    color: "#15803D",
  },
  detailCustomInput: {
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    borderRadius: 12,
    padding: 10,
    fontSize: 13,
    color: "#1F2937",
    borderWidth: 1,
    borderColor: "#DCFCE7",
    marginBottom: 16,
    textAlign: "center",
    fontWeight: "700",
  },
  prepRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 20,
  },
  prepBtn: {
    flex: 1,
    flexDirection: "row",
    paddingVertical: 10,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    backgroundColor: "rgba(229, 231, 235, 0.5)",
    borderWidth: 1,
    borderColor: "transparent",
  },
  prepBtnActive: {
    backgroundColor: "#DCFCE7",
    borderColor: "#22C55E",
  },
  prepBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#4B5563",
  },
  prepBtnTextActive: {
    color: "#15803D",
  },
  detailLiveMacrosContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  detailMacroCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 16,
    gap: 8,
  },
  detailMacroIcon: {
    fontSize: 20,
  },
  detailMacroLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#6B7280",
    textTransform: "uppercase",
  },
  detailMacroVal: {
    fontSize: 14,
    fontWeight: "900",
    marginTop: 2,
  },
  detailAddCta: {
    flexDirection: "row",
    backgroundColor: "#22C55E",
    paddingVertical: 14,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#22C55E",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  detailAddCtaText: {
    color: "#FFF",
    fontWeight: "800",
    fontSize: 14,
  },

  // 4. Meal Builder Drawer Styles
  stickyPanel: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.8)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 10,
    zIndex: 100,
  },
  panelDragIndicatorContainer: {
    width: "100%",
    alignItems: "center",
    paddingBottom: 8,
    marginTop: -8,
  },
  panelDragIndicator: {
    width: 36,
    height: 5,
    borderRadius: 3,
    backgroundColor: "rgba(0, 0, 0, 0.15)",
  },
  panelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  panelTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1F2937",
  },
  clearText: {
    fontSize: 12,
    color: "#EF4444",
    fontWeight: "700",
  },
  queueScroll: {
    marginBottom: 14,
  },
  queueItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFFDF4",
    borderWidth: 1,
    borderColor: "#DCFCE7",
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginRight: 8,
    gap: 4,
    position: "relative",
  },
  queueItemName: {
    fontSize: 11,
    fontWeight: "700",
    color: "#15803D",
    maxWidth: 70,
  },
  queueRemove: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#EF4444",
    justifyContent: "center",
    alignItems: "center",
  },
  tagSelectorContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    gap: 4,
  },
  tagPill: {
    flex: 1,
    paddingVertical: 6,
    alignItems: "center",
    borderRadius: 10,
    backgroundColor: "rgba(229, 231, 235, 0.5)",
  },
  tagPillSelected: {
    backgroundColor: "#DCFCE7",
    borderWidth: 1,
    borderColor: "#22C55E",
  },
  tagPillText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#4B5563",
  },
  tagPillTextSelected: {
    color: "#15803D",
  },
  panelFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  panelTotals: {
    flex: 1,
  },
  totalCal: {
    fontSize: 18,
    fontWeight: "900",
    color: "#1F2937",
  },
  totalProt: {
    fontSize: 12,
    fontWeight: "700",
    color: "#10B981",
    marginTop: 2,
  },
  panelCta: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#22C55E",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 16,
    shadowColor: "#22C55E",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  panelCtaText: {
    color: "#FFF",
    fontWeight: "800",
    fontSize: 13,
  },

  // Expanded builder cards
  summaryStatsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    borderRadius: 18,
    padding: 12,
    borderWidth: 1.5,
    alignItems: "center",
  },
  statLabel: {
    fontSize: 10,
    color: "#6B7280",
    fontWeight: "700",
    textTransform: "uppercase",
    marginTop: 2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "900",
    marginTop: 2,
  },
  builderSectionHeader: {
    fontSize: 12,
    fontWeight: "800",
    color: "#4B5563",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  builderMealCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.04)",
  },
  builderMealLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  builderMealEmojiContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#EFFDF4",
    justifyContent: "center",
    alignItems: "center",
  },
  builderMealName: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1F2937",
    maxWidth: 90,
  },
  builderMealMacros: {
    fontSize: 10,
    fontWeight: "600",
    color: "#10B981",
    marginTop: 2,
  },
  builderMealPrepBadge: {
    fontSize: 8,
    fontWeight: "700",
    color: "#6B7280",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 2,
    alignSelf: "flex-start",
  },
  quantityControlsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  qtyAdjustBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
  },
  qtyValueText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#1F2937",
    minWidth: 44,
    textAlign: "center",
  },
  builderTrashBtn: {
    padding: 4,
    marginLeft: 2,
  },
  panelTemplateBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFFDF4",
    borderWidth: 1.5,
    borderColor: "#22C55E",
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  panelTemplateText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#15803D",
  },

  // Save template modal styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalCard: {
    width: "100%",
    maxWidth: 300,
    backgroundColor: "#FFF",
    borderRadius: 24,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1F2937",
    marginBottom: 16,
  },
  modalInput: {
    width: "100%",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 12,
    fontSize: 13,
    color: "#1F2937",
    borderWidth: 1.5,
    borderColor: "#DCFCE7",
    marginBottom: 16,
    textAlign: "center",
    fontWeight: "700",
  },
  modalButtons: {
    flexDirection: "row",
    gap: 8,
    width: "100%",
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
  },
  modalCancelText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#4B5563",
  },
  modalSaveBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 12,
    backgroundColor: "#22C55E",
  },
  modalSaveBtnDisabled: {
    opacity: 0.5,
  },
  modalSaveText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFF",
  },
  servingBadge: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  servingBadgeText: {
    fontSize: 9,
    color: "#2563EB",
    fontWeight: "700",
  },
  deleteBtn: {
    padding: 6,
    borderRadius: 12,
    backgroundColor: "rgba(239, 68, 68, 0.05)",
    justifyContent: "center",
    alignItems: "center",
  },
  emojiRow: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 4,
  },
  emojiBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(229, 231, 235, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  emojiBtnActive: {
    backgroundColor: "#EFFDF4",
    borderColor: "#22C55E",
  },
  emojiText: {
    fontSize: 18,
  },
  contributeBtn: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },
  contributeBtnText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#2563EB",
    marginLeft: 4,
  },
  formCardTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1F2937",
    marginBottom: 12,
  },
  unitSelector: {
    flexDirection: "row",
    backgroundColor: "#E5E7EB",
    borderRadius: 12,
    padding: 2,
    gap: 2,
    marginBottom: 16,
  },
  unitTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 10,
  },
  unitTabActive: {
    backgroundColor: "#2563EB",
  },
  unitTabText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#6B7280",
  },
  unitTabTextActive: {
    color: "#FFF",
  },
  templatesContainer: {
    marginBottom: 20,
  },
  templatesTitle: {
    fontSize: 10,
    fontWeight: "800",
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  templatesScroll: {
    flexGrow: 0,
  },
  templatesContent: {
    gap: 12,
    paddingRight: 16,
  },
  templateCard: {
    width: 140,
    height: 100,
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.6)",
    borderRadius: 16,
    padding: 12,
    justifyContent: "space-between",
    shadowColor: "#22C55E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  templateHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 4,
  },
  templateName: {
    fontSize: 12,
    fontWeight: "800",
    color: "#1F2937",
    flex: 1,
  },
  templateEmoji: {
    fontSize: 14,
  },
  templateTag: {
    fontSize: 9,
    fontWeight: "700",
    color: "#6B7280",
    textTransform: "uppercase",
  },
  templateMacrosRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  templateCals: {
    fontSize: 11,
    fontWeight: "800",
    color: "#22C55E",
  },
  templateProt: {
    fontSize: 11,
    fontWeight: "800",
    color: "#10B981",
  },
  templateIngredientsContainer: {
    backgroundColor: "#F3F4F6",
    borderRadius: 16,
    padding: 12,
    width: "100%",
    maxHeight: 150,
  },
  ingredientsTitle: {
    fontSize: 9,
    fontWeight: "800",
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
    paddingBottom: 6,
    marginBottom: 6,
  },
  ingredientsScroll: {
    flexGrow: 0,
  },
  ingredientRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  ingredientName: {
    fontSize: 11,
    fontWeight: "700",
    color: "#1F2937",
    flex: 1,
  },
  ingredientQty: {
    fontSize: 11,
    fontWeight: "600",
    color: "#4B5563",
  },
  customSectionContainer: {
    marginTop: 20,
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.6)",
    shadowColor: "#22C55E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  customSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  customHeaderToggle: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  customSectionTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#4B5563",
  },
  customAddButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#22C55E",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  customAddButtonText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#FFF",
  },
  customFormCard: {
    backgroundColor: "#F3F4F6",
    borderRadius: 16,
    padding: 14,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  pieceModeInfoCard: {
    backgroundColor: "#FFF7ED",
    borderColor: "#FFEDD5",
    borderWidth: 1,
    borderRadius: 10,
    padding: 8,
  },
  pieceModeInfoTitle: {
    fontSize: 9,
    fontWeight: "800",
    color: "#92400E",
    textTransform: "uppercase",
  },
  pieceModeInfoText: {
    fontSize: 9,
    color: "#92400E",
    fontWeight: "500",
    marginTop: 2,
    lineHeight: 12,
  },
  previewInfoCard: {
    backgroundColor: "#EFF6FF",
    borderColor: "#DBEAFE",
    borderWidth: 1,
    borderRadius: 10,
    padding: 8,
  },
  previewInfoTitle: {
    fontSize: 9,
    fontWeight: "800",
    color: "#2563EB",
    textTransform: "uppercase",
  },
  previewInfoText: {
    fontSize: 9,
    color: "#2563EB",
    fontWeight: "700",
    marginTop: 2,
  },
  inputHelperText: {
    fontSize: 9,
    color: "#6B7280",
    marginTop: 2,
    fontWeight: "500",
  },
  customSaveBtn: {
    flex: 1,
    backgroundColor: "#22C55E",
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
  },
  customSaveBtnDisabled: {
    backgroundColor: "#E5E7EB",
    opacity: 0.5,
  },
  customSaveBtnText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#FFF",
  },
  customCancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
  },
  customCancelBtnText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#4B5563",
  },
  customListContainer: {
    marginTop: 12,
    maxHeight: 200,
  },
  customListEmpty: {
    fontSize: 11,
    color: "#6B7280",
    textAlign: "center",
    paddingVertical: 12,
    fontWeight: "600",
  },
  customFoodRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.03)",
  },
  customFoodRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  customFoodEmojiCircle: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#EFFDF4",
    justifyContent: "center",
    alignItems: "center",
  },
  customFoodName: {
    fontSize: 12,
    fontWeight: "800",
    color: "#1F2937",
  },
  customFoodMacros: {
    fontSize: 10,
    fontWeight: "600",
    color: "#10B981",
    marginTop: 1,
  },
  customTrashBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: "#FEF2F2",
    justifyContent: "center",
    alignItems: "center",
  },
  customAddRowBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#22C55E",
    justifyContent: "center",
    alignItems: "center",
  },
  chip: {
    backgroundColor: "#EFF6FF",
    borderColor: "#DBEAFE",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    alignSelf: "flex-start",
  },
  chipText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#2563EB",
  },
  suggestionsCard: {
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.6)",
    shadowColor: "#22C55E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  suggestionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.03)",
  },
  suggestionName: {
    fontSize: 12,
    fontWeight: "800",
    color: "#1F2937",
    flex: 1,
  },
  suggestionMacros: {
    fontSize: 11,
    fontWeight: "600",
    color: "#4B5563",
  },
  successCard: {
    alignItems: "center",
    paddingVertical: 20,
  },
  successText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#10B981",
    marginTop: 8,
    textAlign: "center",
  },
  // Tab indicator sliding indicator background
  tabIndicatorBg: {
    backgroundColor: "#22C55E",
    borderRadius: 14,
    margin: 4,
    height: "85%", // fits nicely inside the tab bar container padding
  },
  // Skeleton pulse styles
  skeletonCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    borderRadius: 20,
    padding: 14,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.6)",
    gap: 12,
  },
  skeletonCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E5E7EB",
  },
  skeletonLineLong: {
    width: "70%",
    height: 12,
    borderRadius: 6,
    backgroundColor: "#E5E7EB",
  },
  skeletonLineShort: {
    width: "40%",
    height: 10,
    borderRadius: 5,
    backgroundColor: "#E5E7EB",
    marginTop: 4,
  },
  // Inline Detail Card & Meal Builder Styles
  inlineDetailCard: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 24,
    padding: 16,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.8)",
    shadowColor: "#22C55E",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 20,
  },
  inlineDetailHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  inlineDetailName: {
    fontSize: 15,
    fontWeight: "900",
    color: "#1F2937",
  },
  inlineDetailCategory: {
    fontSize: 11,
    color: "#6B7280",
    fontWeight: "600",
    marginTop: 2,
  },
  inlineDetailClearBtn: {
    backgroundColor: "rgba(0,0,0,0.05)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  inlineDetailClearText: {
    fontSize: 11,
    color: "#4B5563",
    fontWeight: "700",
  },
  inlineDetailSection: {
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
    paddingVertical: 12,
  },
  inlineCounterRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    padding: 2,
  },
  inlineCounterBtn: {
    width: 24,
    height: 24,
    borderRadius: 10,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  inlineCounterValue: {
    fontSize: 12,
    fontWeight: "800",
    color: "#22C55E",
    paddingHorizontal: 8,
    minWidth: 50,
    textAlign: "center",
  },
  presetBtnInline: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 10,
    backgroundColor: "rgba(229, 231, 235, 0.5)",
    borderWidth: 1,
    borderColor: "transparent",
  },
  presetBtnActiveInline: {
    backgroundColor: "#EFFDF4",
    borderColor: "#22C55E",
  },
  presetBtnTextInline: {
    fontSize: 11,
    fontWeight: "700",
    color: "#4B5563",
  },
  presetBtnTextActiveInline: {
    color: "#15803D",
  },
  approxWeightSubtextInline: {
    fontSize: 9,
    color: "#6B7280",
    fontWeight: "600",
    marginTop: 4,
  },
  prepRowInline: {
    flexDirection: "row",
    gap: 6,
  },
  prepBtnInline: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 10,
    backgroundColor: "rgba(229, 231, 235, 0.5)",
    borderWidth: 1,
    borderColor: "transparent",
  },
  prepBtnActiveInline: {
    backgroundColor: "#DCFCE7",
    borderColor: "#22C55E",
  },
  prepBtnTextInline: {
    fontSize: 10,
    fontWeight: "700",
    color: "#4B5563",
  },
  prepBtnTextActiveInline: {
    color: "#15803D",
  },
  inlineDetailMacrosGrid: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  inlineDetailMacroCard: {
    flex: 1,
    borderRadius: 12,
    padding: 8,
    borderWidth: 1,
    alignItems: "center",
  },
  inlineDetailMacroLabel: {
    fontSize: 8,
    fontWeight: "800",
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  inlineDetailMacroValue: {
    fontSize: 11,
    fontWeight: "900",
    marginTop: 2,
  },
  inlineDetailAddBtn: {
    backgroundColor: "#22C55E",
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#22C55E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  inlineDetailAddBtnText: {
    color: "#FFF",
    fontWeight: "800",
    fontSize: 13,
  },
  inlineWeightInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 8,
  },
  inlineWeightUnitText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#4B5563",
  },
  inlineWeightResetBtn: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  inlineWeightResetText: {
    fontSize: 11,
    color: "#EF4444",
    fontWeight: "700",
  },
  inlineWeightDisplayContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 8,
  },
  inlineWeightText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1F2937",
  },
  customWeightBadge: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  customWeightBadgeText: {
    fontSize: 9,
    color: "#2563EB",
    fontWeight: "700",
  },
  inlineWeightEditBtn: {
    padding: 4,
  },
  builderCardInline: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 24,
    padding: 16,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.8)",
    shadowColor: "#22C55E",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 3,
    marginTop: 20,
    marginBottom: 20,
  },
  builderHeaderInline: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  builderTitleInline: {
    fontSize: 14,
    fontWeight: "900",
    color: "#1F2937",
  },
  builderSubtitleInline: {
    fontSize: 11,
    color: "#6B7280",
    fontWeight: "600",
    marginTop: 1,
  },
  builderActionsInline: {
    flexDirection: "row",
    alignItems: "center",
  },
  builderActionBtnInline: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: "rgba(0,0,0,0.03)",
  },
  builderActionTextInline: {
    fontSize: 10,
    fontWeight: "700",
    marginLeft: 3,
  },
  builderMacrosGridInline: {
    flexDirection: "row",
    gap: 8,
  },
  builderMacroItemInline: {
    flex: 1,
    borderRadius: 14,
    padding: 8,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  builderMacroLabelInline: {
    fontSize: 8,
    fontWeight: "800",
    color: "#6B7280",
    textTransform: "uppercase",
  },
  builderMacroValueInline: {
    fontSize: 15,
    fontWeight: "900",
    marginTop: 1,
  },
  builderMacroUnitInline: {
    fontSize: 8,
    color: "#6B7280",
    fontWeight: "600",
    marginTop: 1,
  },
  builderListInline: {
    maxHeight: 220,
    marginVertical: 8,
  },
  builderItemRowInline: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.04)",
  },
  builderItemLeftInline: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  builderItemEmojiInline: {
    fontSize: 16,
  },
  builderItemNameInline: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1F2937",
  },
  builderItemRightInline: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  builderItemCalTextInline: {
    fontSize: 11,
    fontWeight: "800",
    color: "#2563EB",
    textAlign: "right",
  },
  builderItemProtTextInline: {
    fontSize: 10,
    fontWeight: "800",
    color: "#10B981",
    textAlign: "right",
  },
  builderItemRemoveBtnInline: {
    padding: 4,
    borderRadius: 10,
    backgroundColor: "rgba(0,0,0,0.04)",
  },
  tagScrollInline: {
    marginTop: 4,
  },
  tagScrollContentInline: {
    gap: 6,
    paddingRight: 16,
  },
  tagPillInline: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: "rgba(229, 231, 235, 0.5)",
  },
  tagPillSelectedInline: {
    backgroundColor: "#DCFCE7",
    borderWidth: 1,
    borderColor: "#22C55E",
  },
  tagPillTextInline: {
    fontSize: 10,
    fontWeight: "700",
    color: "#4B5563",
  },
  logModeGridInline: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  logModeCardInline: {
    flex: 1,
    backgroundColor: "rgba(229, 231, 235, 0.5)",
    borderWidth: 1,
    borderColor: "transparent",
    borderRadius: 12,
    padding: 8,
  },
  logModeCardSelectedInline: {
    backgroundColor: "#EFF6FF",
    borderColor: "#2563EB",
  },
  logModeTitleInline: {
    fontSize: 12,
    fontWeight: "900",
    color: "#1F2937",
  },
  logModeDescInline: {
    fontSize: 9,
    color: "#6B7280",
    fontWeight: "600",
    marginTop: 2,
  },
  builderLogBtnInline: {
    backgroundColor: "#22C55E",
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    shadowColor: "#22C55E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  builderLogBtnTextInline: {
    color: "#FFF",
    fontWeight: "900",
    fontSize: 13,
  },
});

import Skeleton from "@/src/components/Skeleton";
import { COLORS, FONTS, SHADOWS, SPACING, useThemeColors } from "@/src/constants/theme";
import { useOnboarding } from "@/src/hooks/useOnboarding";
import { Ingredient } from "@/src/types";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import Toast from 'react-native-toast-message';
import { useTranslation } from "@/src/lib/i18n";
import SwipeableIngredientItem from "../../../src/components/SwipeableIngredientItem";
import api from "../../../src/lib/api";

const IngredientSkeleton = () => (
  <View style={{
    paddingVertical: SPACING.m,
    paddingHorizontal: SPACING.m,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  }}>
    <View style={{ gap: 8 }}>
      <Skeleton width={120} height={20} />
      <Skeleton width={80} height={14} />
    </View>
    <Skeleton width={24} height={24} borderRadius={12} />
  </View>
);

export default function IngredientsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ query?: string; tag?: string; category?: string }>();
  const queryClient = useQueryClient();
  const showOnboarding = useOnboarding('onboarding_swipe_ingredients');
  const { t } = useTranslation();
  const { colors } = useThemeColors();

  const [query, setQuery] = useState<string>("");
  const [debouncedQuery, setDebouncedQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  useEffect(() => {
    if (params.tag) {
      setSelectedTag(params.tag);
    }
    if (params.query) {
      setQuery(params.query);
    }
    if (params.category) {
      setSelectedCategory(params.category);
    }
  }, [params.query, params.tag, params.category]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 400);

    return () => {
      clearTimeout(handler);
    };
  }, [query]);

  // Fetch Ingredients
  const {
    data: ingredients = [],
    isLoading,
    isFetching,
    error,
    refetch
  } = useQuery({
    queryKey: ['ingredients', debouncedQuery, selectedTag],
    queryFn: async () => {
      const paramsObj: Record<string, string> = {};
      if (debouncedQuery.trim()) paramsObj.query = debouncedQuery.trim();
      if (selectedTag) paramsObj.tag = selectedTag;

      const res = await api.get("/ingredients", { params: paramsObj });
      const data = res.data?.data ?? res.data;
      return Array.isArray(data) ? data : [];
    },
    staleTime: 1000 * 60 * 5 // 5 minutes cache
  });

  // Unique Categories List (Only categories with actual elements)
  const categories = useMemo(() => {
    const categorySet = new Set<string>();
    ingredients.forEach((item: Ingredient) => {
      if (item.category && item.category.trim()) {
        categorySet.add(item.category.trim());
      }
    });
    return ["All", ...Array.from(categorySet).sort()];
  }, [ingredients]);

  // Filter ingredients by category and tag
  const filteredIngredients = useMemo(() => {
    return ingredients.filter((item: Ingredient) => {
      // Category filter
      if (selectedCategory !== "All") {
        if (!item.category || item.category.trim().toLowerCase() !== selectedCategory.trim().toLowerCase()) {
          return false;
        }
      }
      // Tag filter
      if (selectedTag) {
        if (!item.tags || !Array.isArray(item.tags)) return false;
        const hasTag = item.tags.some((t: string) => t.trim().toLowerCase() === selectedTag.trim().toLowerCase());
        if (!hasTag) return false;
      }
      return true;
    });
  }, [ingredients, selectedCategory, selectedTag]);

  // Fetch Pantry for Check
  const {
    data: pantry = []
  } = useQuery({
    queryKey: ['pantry'],
    queryFn: async () => {
      const res = await api.get('/pantry');
      return res.data ?? [];
    }
  });

  // Add Mutation
  const addMutation = useMutation({
    mutationFn: async (item: Ingredient) => {
      await api.post("/shopping-list", {
        ingredientId: item._id,
        quantity: 1,
        unit: item.unit || 'unit'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-list'] });
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: "Added to shopping list"
      });
    },
    onError: () => {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: "Could not add to list"
      });
    }
  });

  // Handle Add Logic with Pantry Check
  const handleAdd = (item: Ingredient) => {
    // Check if item exists in pantry with FULL stock
    const pantryItem = pantry.find((p: any) => {
      const pId = typeof p.ingredient === 'object' ? p.ingredient._id : p.ingredient;
      return pId === item._id;
    });

    if (pantryItem && pantryItem.stockLevel === 'FULL') {
      Alert.alert(
        "Already Fully Stocked",
        `You already have "${item.name}" fully stocked in your pantry. Do you want to add it anyway?`,
        [
          { text: "Cancel", style: "cancel" },
          { text: "Add Anyway", onPress: () => addMutation.mutate(item) }
        ]
      );
    } else {
      addMutation.mutate(item);
    }
  };

  /* 
   * Render Item using SwipeableIngredientItem
   */
  const renderItem = ({ item, index }: { item: Ingredient; index: number }) => (
    <Animated.View entering={FadeInDown.duration(300).springify().damping(20)}>
      <SwipeableIngredientItem
        item={item}
        onPress={() => router.push(`./ingredients/${item._id}`)}
        onAdd={(authItem) => handleAdd(authItem)}
        shouldAnimate={index === 0 && showOnboarding}
      />
    </Animated.View>
  );

  const renderSkeletons = () => (
    <View style={styles.listContainer}>
      {[1, 2, 3, 4, 5, 6].map((key) => <IngredientSkeleton key={key} />)}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <View style={[styles.searchContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="search" size={20} color={colors.text.light} style={styles.searchIcon} />
          <TextInput
            placeholder={t('pantry.searchPlaceholder')}
            value={query}
            onChangeText={setQuery}
            style={[styles.searchInput, { color: colors.text.primary }]}
            placeholderTextColor={colors.text.light}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery("")} style={{ marginRight: 8 }}>
              <Ionicons name="close-circle" size={20} color={colors.text.light} />
            </TouchableOpacity>
          )}
          {(isFetching) && <ActivityIndicator size="small" color={colors.primary} />}
        </View>

        {/* Active Tag Filter Badge */}
        {selectedTag && (
          <View style={{ paddingHorizontal: SPACING.m, marginBottom: SPACING.s, flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity
              style={[
                styles.categoryChip,
                { backgroundColor: colors.primary + '20', borderColor: colors.primary, flexDirection: 'row', alignItems: 'center', gap: 6 }
              ]}
              onPress={() => setSelectedTag(null)}
              activeOpacity={0.7}
            >
              <Text style={[styles.categoryText, { color: colors.primary, fontWeight: '700' }]}>#{selectedTag}</Text>
              <Ionicons name="close-circle" size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>
        )}

        {/* Category Filters Bar */}
        <View style={{ marginBottom: SPACING.s }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: SPACING.m, gap: SPACING.s }}
          >
            {categories.map((cat) => {
              const isActive = selectedCategory.toLowerCase() === cat.toLowerCase();
              return (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setSelectedCategory(cat)}
                  style={[
                    styles.categoryChip,
                    { backgroundColor: colors.card, borderColor: colors.border },
                    isActive && { backgroundColor: colors.primary, borderColor: colors.primary },
                  ]}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.categoryText,
                    { color: colors.text.primary },
                    isActive && { color: '#ffffff', fontWeight: '700' }
                  ]}>
                    {cat === "All" ? t('common.all') : cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {error ? (
          <View style={styles.center}>
            <Text style={[styles.errorText, { color: colors.error }]}>Error loading ingredients</Text>
          </View>
        ) : null}

        {isLoading && ingredients.length === 0 ? (
          renderSkeletons()
        ) : (
          <FlatList
            data={filteredIngredients}
            keyExtractor={(i) => i._id}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
            refreshControl={<RefreshControl refreshing={isFetching} onRefresh={() => refetch()} tintColor={colors.primary} />}
            ListEmptyComponent={
              !isLoading ? (
                <View style={styles.center}>
                  <Text style={[styles.emptyText, { color: colors.text.secondary }]}>{t('recipes.noRecipesFound')}</Text>
                </View>
              ) : null
            }
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.m,
    paddingTop: SPACING.xl * 1.5,
    paddingBottom: SPACING.m,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    ...SHADOWS.small,
    zIndex: 10,
  },
  backButton: {
    padding: SPACING.xs,
  },
  headerTitle: {
    fontSize: FONTS.sizes.h3,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  content: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    marginVertical: SPACING.m,
    marginHorizontal: SPACING.m,
    paddingHorizontal: SPACING.m,
    height: 48,
    borderRadius: SPACING.m,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  searchIcon: {
    marginRight: SPACING.s,
  },
  searchInput: {
    flex: 1,
    fontSize: FONTS.sizes.body,
    color: COLORS.text.primary,
  },
  categoryChip: {
    paddingVertical: SPACING.s,
    paddingHorizontal: SPACING.m,
    borderRadius: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  categoryText: {
    fontSize: FONTS.sizes.small,
    color: COLORS.text.primary,
    fontWeight: "600",
  },
  listContainer: {
    padding: SPACING.m,
    paddingTop: 0,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  emptyText: {
    textAlign: "center",
    color: COLORS.text.secondary,
    fontSize: FONTS.sizes.body
  },
  errorText: {
    color: COLORS.error,
    textAlign: "center",
    fontSize: FONTS.sizes.body
  }
});
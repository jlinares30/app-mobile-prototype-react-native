import Skeleton from "@/src/components/Skeleton";
import { COLORS, FONTS, SHADOWS, SPACING, useThemeColors } from "@/src/constants/theme";
import { useOnboarding } from "@/src/hooks/useOnboarding";
import { useRecipeQueries } from "@/src/hooks/useRecipeQueries";
import { useTranslation } from "@/src/lib/i18n";
import { normalizeTags } from "@/src/lib/utils";
import { Ingredient, Recipe } from "@/src/types";
import { Ionicons } from "@expo/vector-icons";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Image, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import SwipeableRow from "../../../src/components/SwipeableRow";
import { useRecipeFilters } from "../../../src/hooks/useRecipeFilters";
import { useRecipeMutations } from "../../../src/hooks/useRecipeMutations";

const RecipeSkeleton = () => (
  <View style={[styles.recipeCard, { marginBottom: SPACING.m }]}>
    <Skeleton height={200} width="100%" borderRadius={0} />
    <View style={styles.recipeContent}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.s }}>
        <Skeleton width="60%" height={24} />
        <Skeleton width={60} height={20} />
      </View>
      <Skeleton width="100%" height={16} style={{ marginBottom: 4 }} />
      <Skeleton width="80%" height={16} />
    </View>
  </View>
);

export default function RecipesScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors, isDark } = useThemeColors();
  const params = useLocalSearchParams<{ tag?: string; category?: string; query?: string }>();
  const showOnboarding = useOnboarding('onboarding_swipe_recipes');
  const { selectedIngredients, recipeQuery, debouncedRecipeQuery, setRecipeQuery, addIngredient, removeIngredient } = useRecipeFilters();
  const { recipesQuery: recipes, ingredientsQuery: allIngredients, isLoading, isRefetching, refetch } = useRecipeQueries(debouncedRecipeQuery, selectedIngredients);
  const { addAllMutation } = useRecipeMutations();
  const [ingredientQuery, setIngredientQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState<boolean>(false);

  useEffect(() => {
    if (params.tag) {
      setSelectedTag(params.tag);
    }
    if (params.query) {
      setRecipeQuery(params.query);
    }
    if (params.category) {
      setSelectedCategory(params.category);
    }
  }, [params.tag, params.query, params.category]);

  // Unique Recipe Categories List (Only categories with existing recipes)
  const categories = useMemo(() => {
    const categorySet = new Set<string>();
    (recipes || []).forEach((r: Recipe) => {
      if (r.category && r.category.trim()) {
        categorySet.add(r.category.trim());
      }
    });
    return ["All", ...Array.from(categorySet).sort()];
  }, [recipes]);

  // Total active filters count for badge
  const activeFiltersCount = (selectedCategory !== "All" ? 1 : 0) + selectedIngredients.length + (recipeQuery ? 1 : 0) + (selectedTag ? 1 : 0);

  const filteredIngredients = ingredientQuery.trim()
    ? allIngredients.filter((i: Ingredient) => i.name.toLowerCase().includes(ingredientQuery.toLowerCase())).slice(0, 6)
    : [];

  const filteredRecipes = (recipes || []).filter((recipe: Recipe) => {
    // Category filter
    if (selectedCategory !== "All") {
      if (!recipe.category || recipe.category.trim().toLowerCase() !== selectedCategory.trim().toLowerCase()) {
        return false;
      }
    }
    // Tag filter
    if (selectedTag) {
      if (!recipe.tags || !Array.isArray(recipe.tags)) return false;
      const normTags = normalizeTags(recipe.tags);
      const hasTag = normTags.some((t: string) => t.trim().toLowerCase() === selectedTag.trim().toLowerCase());
      if (!hasTag) return false;
    }
    return true;
  });

  const handleSwipeRecipe = (item: Recipe) => {
    addAllMutation.mutate(item);
  };

  const renderRecipeItem = ({ item, index }: { item: Recipe; index: number }) => (
    <Animated.View entering={FadeInDown.duration(300).springify().damping(20)}>
      <SwipeableRow
        onSwipe={() => handleSwipeRecipe(item)}
        style={{ marginBottom: SPACING.m }}
        backColor="#10b981"
        actionLabel={t('recipes.addAll')}
        shouldAnimate={index === 0 && showOnboarding}
      >
        <TouchableOpacity
          style={[styles.recipeCard, { backgroundColor: colors.card }]}
          activeOpacity={1}
          onPress={() => router.push(`/recipes/${item._id}`)}
        >
          <Image
            source={{ uri: item.image || "https://via.placeholder.com/300" }}
            style={styles.cardImage}
          />
          <View style={styles.recipeContent}>
            <View style={styles.recipeHeader}>
              <Text style={[styles.recipeTitle, { color: colors.text.primary }]}>{item.title}</Text>
              <View style={[styles.timeContainer, { backgroundColor: isDark ? '#334155' : '#f1f5f9' }]}>
                <Ionicons name="time-outline" size={14} color={colors.primary} />
                <Text style={[styles.timeText, { color: colors.text.secondary }]}>{item.time}</Text>
              </View>
            </View>
            <Text style={[styles.recipeDescription, { color: isDark ? '#cbd5e1' : '#334155' }]} numberOfLines={2}>{item.description}</Text>

            {item.tags && item.tags.length > 0 && (
              <View style={styles.tagsRow}>
                {normalizeTags(item.tags).slice(0, 3).map((tag, idx) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={(e) => {
                      e.stopPropagation();
                      setSelectedTag(tag);
                    }}
                  >
                    <Text style={[styles.tagText, { color: colors.primary, backgroundColor: isDark ? '#334155' : '#eef2ff' }]}>#{tag}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
          {item.matchPercentage !== undefined && (
            <View style={[styles.matchBadge, { backgroundColor: colors.primary, opacity: item.matchPercentage > 0 ? 1 : 0 }]}>
              <Text style={styles.matchText}>{Math.round(item.matchPercentage)}% Match</Text>
            </View>
          )}
          {addAllMutation.isPending && addAllMutation.variables?._id === item._id && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator color="#fff" />
            </View>
          )}
        </TouchableOpacity>
      </SwipeableRow>
    </Animated.View>
  );

  const renderSkeletons = () => (
    <View style={styles.listContainer}>
      {[1, 2, 3].map((key) => <RecipeSkeleton key={key} />)}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>{t('recipes.title')}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          {/* Toggle Filters Button */}
          <TouchableOpacity
            style={[
              styles.filterToggleBtn,
              { backgroundColor: colors.background, borderColor: colors.border },
              showFilters && { backgroundColor: colors.primary, borderColor: colors.primary }
            ]}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Ionicons
              name={showFilters ? "options" : "options-outline"}
              size={22}
              color={showFilters ? '#ffffff' : colors.text.primary}
            />
            {activeFiltersCount > 0 && !showFilters && (
              <View style={[styles.filterBadge, { backgroundColor: colors.primary }]}>
                <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
              </View>
            )}
          </TouchableOpacity>

          <Link href="/recipes/my-recipes" asChild>
            <TouchableOpacity style={styles.backButton}>
              <Ionicons name="bookmarks-outline" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </Link>
          <Link href="/recipes/create" asChild>
            <TouchableOpacity style={styles.backButton}>
              <Ionicons name="add" size={28} color={colors.text.primary} />
            </TouchableOpacity>
          </Link>
        </View>
      </View>
      <View style={styles.content}>
        {/* Collapsible Filters Panel */}
        {showFilters && (
          <Animated.View entering={FadeInDown.duration(250)} style={{ zIndex: 1000, elevation: 1000 }}>
            <View style={[styles.ingredientSelector, { zIndex: 1000, elevation: 1000 }]}>
              <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>{t('recipes.filterIngredients')}</Text>
              <View style={[styles.searchWrapper, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <TextInput
                  value={ingredientQuery}
                  onChangeText={setIngredientQuery}
                  placeholder={t('recipes.typeIngredient')}
                  style={[styles.input, { color: colors.text.primary }]}
                  placeholderTextColor={colors.text.light}
                />
                {ingredientQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setIngredientQuery('')} style={{ padding: 4 }}>
                    <Ionicons name="close-circle" size={20} color={colors.text.light} />
                  </TouchableOpacity>
                )}
              </View>

              {filteredIngredients.length > 0 && (
                <View style={[styles.suggestions, { backgroundColor: colors.card, borderColor: colors.border, zIndex: 1000, elevation: 1000 }]}>
                  {filteredIngredients.map((item: Ingredient) => (
                    <TouchableOpacity
                      key={item._id}
                      onPress={() => addIngredient(item)}
                      style={[styles.suggestionItem, { borderBottomColor: colors.border }]}
                    >
                      <Text style={[styles.suggestionText, { color: colors.text.primary }]}>{item.name}</Text>
                      <Text style={[styles.category, { color: colors.text.secondary }]}>{item.category ?? "—"}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              <View style={styles.selectedContainer}>
                {selectedIngredients.map((item) => (
                  <TouchableOpacity
                    key={item._id}
                    style={[styles.chip, { backgroundColor: colors.primary + '20', borderColor: colors.primary + '40' }]}
                    onPress={() => removeIngredient(item._id)}
                  >
                    <Text style={[styles.chipText, { color: colors.primary }]}>{item.name}</Text>
                    <Ionicons name="close-circle" size={16} color={colors.primary} style={{ marginLeft: 4 }} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={[styles.mainSearch, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name="search" size={20} color={colors.text.light} style={{ marginRight: 8 }} />
              <TextInput
                placeholder={t('recipes.searchTitle')}
                value={recipeQuery}
                onChangeText={setRecipeQuery}
                style={[styles.searchInput, { color: colors.text.primary }]}
                returnKeyType="search"
                clearButtonMode="while-editing"
                placeholderTextColor={colors.text.light}
              />
              {isLoading && recipes.length > 0 && <ActivityIndicator size="small" color={colors.primary} />}
            </View>

            {/* Active Tag Filter Badge */}
            {selectedTag && (
              <View style={{ marginBottom: SPACING.s, flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity
                  style={[
                    styles.chip,
                    { backgroundColor: colors.primary + '20', borderColor: colors.primary, flexDirection: 'row', alignItems: 'center', gap: 6 }
                  ]}
                  onPress={() => setSelectedTag(null)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.chipText, { color: colors.primary, fontWeight: '700' }]}>#{selectedTag}</Text>
                  <Ionicons name="close-circle" size={16} color={colors.primary} />
                </TouchableOpacity>
              </View>
            )}

            <View style={{ marginBottom: SPACING.m }}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingRight: SPACING.m }}
              >
                {categories.map((item) => {
                  const isActive = selectedCategory === item;
                  const categoryLabel = t(`recipes.categories.${item}` as any) || item;
                  return (
                    <TouchableOpacity
                      key={item}
                      onPress={() => setSelectedCategory(item)}
                      style={[
                        styles.categoryChip,
                        { backgroundColor: colors.card, borderColor: colors.border },
                        isActive && { backgroundColor: colors.primary, borderColor: colors.primary },
                      ]}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.categoryText, { color: colors.text.primary }, isActive && styles.categoryTextActive]}>
                        {categoryLabel}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </Animated.View>
        )}

        {isLoading && recipes.length === 0 ? (
          renderSkeletons()
        ) : (
          <FlatList
            data={filteredRecipes}
            keyExtractor={(item) => item._id}
            renderItem={renderRecipeItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
            refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={COLORS.primary} />}
            ListEmptyComponent={
              !isLoading ? (
                <View style={styles.center}>
                  <Text style={styles.emptyText}>{t('recipes.noRecipesFound')}</Text>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.m,
    paddingTop: SPACING.s,
    paddingBottom: SPACING.m,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: SPACING.xs,
  },
  filterToggleBtn: {
    padding: SPACING.xs + 2,
    borderRadius: SPACING.s,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterToggleBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
  },
  headerTitle: {
    fontSize: FONTS.sizes.h3,
    fontWeight: '700',
    color: COLORS.text.primary,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: SPACING.m,
  },
  ingredientSelector: {
    marginBottom: SPACING.m,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.body,
    fontWeight: "600",
    marginBottom: SPACING.s,
    color: COLORS.text.primary
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SPACING.s,
    paddingHorizontal: SPACING.s,
  },
  input: {
    flex: 1,
    paddingVertical: SPACING.s,
    fontSize: FONTS.sizes.body,
    color: COLORS.text.primary,
  },
  suggestions: {
    backgroundColor: COLORS.card,
    borderRadius: SPACING.s,
    marginTop: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
    position: 'absolute',
    top: 70,
    left: 0,
    right: 0,
    zIndex: 100,
    ...SHADOWS.medium,
  },
  suggestionItem: {
    paddingVertical: SPACING.s,
    paddingHorizontal: SPACING.m,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  suggestionText: {
    color: COLORS.text.primary,
    fontSize: FONTS.sizes.body,
  },
  category: { color: COLORS.text.light, fontSize: FONTS.sizes.small },
  selectedContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: SPACING.s,
    gap: SPACING.s,
  },
  chip: {
    backgroundColor: COLORS.primary + '15',
    borderRadius: SPACING.l,
    paddingVertical: 6,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  chipText: { color: COLORS.primary, fontWeight: "600", fontSize: FONTS.sizes.small },
  mainSearch: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.m,
    backgroundColor: COLORS.card,
    borderRadius: SPACING.m,
    paddingHorizontal: SPACING.m,
    borderWidth: 1,
    borderColor: COLORS.border,
    height: 48,
  },
  searchInput: {
    flex: 1,
    fontSize: FONTS.sizes.body,
    color: COLORS.text.primary,
  },
  categoryChip: {
    paddingVertical: SPACING.s,
    paddingHorizontal: SPACING.m,
    backgroundColor: COLORS.card,
    borderRadius: SPACING.xl,
    marginRight: SPACING.s,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryText: {
    fontSize: FONTS.sizes.small,
    color: COLORS.text.primary,
    fontWeight: "600",
  },
  categoryTextActive: {
    color: "#ffffff",
    fontWeight: "700",
  },
  listContainer: {
    paddingBottom: 100,
  },
  recipeCard: {
    backgroundColor: COLORS.card,
    borderRadius: SPACING.s,
    overflow: "hidden",
    ...SHADOWS.medium,
  },
  cardImage: {
    width: "100%",
    height: 200,
  },
  recipeContent: {
    padding: SPACING.m,
  },
  recipeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.s,
  },
  recipeTitle: {
    fontSize: FONTS.sizes.h3,
    fontWeight: "700",
    color: COLORS.text.primary,
    flex: 1,
    marginRight: SPACING.s,
  },
  recipeDescription: {
    fontSize: FONTS.sizes.small,
    color: COLORS.text.secondary,
    lineHeight: 18,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.s,
    paddingVertical: 4,
    borderRadius: SPACING.s,
  },
  timeText: {
    marginLeft: 4,
    fontSize: FONTS.sizes.tiny,
    fontWeight: '600',
    color: COLORS.text.secondary,
  },
  matchBadge: {
    position: 'absolute',
    top: SPACING.m,
    right: SPACING.m,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  matchText: {
    color: '#fff',
    fontSize: FONTS.sizes.tiny,
    fontWeight: '700',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: SPACING.xl,
  },
  emptyText: {
    fontSize: FONTS.sizes.body,
    color: COLORS.text.secondary,
  },
  tagsRow: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 8,
  },
  tagText: {
    fontSize: 10,
    color: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
});
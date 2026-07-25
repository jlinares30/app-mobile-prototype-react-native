import { COLORS, FONTS, SHADOWS, SPACING, useThemeColors } from "@/src/constants/theme";
import api from "@/src/lib/api";
import { useTranslation } from "@/src/lib/i18n";
import { formatQuantityAndUnit } from "@/src/lib/units";
import { normalizeTags } from "@/src/lib/utils";
import { useAuthStore } from "@/src/store/useAuth";
import { usePreferencesStore } from "@/src/store/usePreferencesStore";
import { Recipe } from "@/src/types";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t, language } = useTranslation();
  const { measurementSystem } = usePreferencesStore();
  const { colors } = useThemeColors();

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();
  const [isFavorite, setIsFavorite] = useState(false);


  const isAuthor = recipe && user && (recipe.user === user._id || recipe.user === user.id);

  const toggleFavorite = async () => {
    if (!recipe) return;
    try {
      const res = await api.post(`/recipes/${recipe._id}/favorite`);
      setIsFavorite(res.data.isFavorite);
    } catch (e) {
      console.error("Error toggling favorite:", e);
    }
  };

  const fetchRecipe = async (recipeId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/recipes/${recipeId}`);
      const data = res.data?.data ?? res.data;

      setRecipe(data);

      // Check if favorite
      try {
        const myFavorites = await api.get('/recipes/favorites/all');
        const isFav = myFavorites.data.some((fav: any) => fav._id === recipeId);
        setIsFavorite(isFav);
      } catch (e) {
        console.log("Could not check favorites");
      }
    } catch (err: any) {
      console.error("fetchRecipe error:", err);
      setError(err?.response?.data?.message ?? err.message ?? "Error retrieving recipe");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchRecipe(id);
  }, [id]);

  if (!id || loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error || !recipe) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={[styles.error, { color: colors.error }]}>{error || "Recipe not found"}</Text>
        <TouchableOpacity style={[styles.retryButton, { backgroundColor: colors.primary }]} onPress={() => router.back()}>
          <Text style={[styles.retryText, { color: '#ffffff' }]}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.mainContainer, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]} numberOfLines={1}>
          {language === 'es' ? 'Detalle de Receta' : 'Recipe Details'}
        </Text>
        <View style={styles.headerRight}>
          {isAuthor && (
            <TouchableOpacity onPress={() => router.push(`/recipes/edit/${recipe._id}`)} style={styles.actionButton}>
              <Ionicons name="pencil" size={24} color={colors.primary} />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={toggleFavorite} style={styles.actionButton}>
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={28}
              color={isFavorite ? "red" : colors.text.primary}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: recipe.image || "https://via.placeholder.com/400" }}
            style={styles.image}
          />
          {/* Overlay Gradient or Badges */}
          <View style={styles.imageOverlay}>
            <View style={[styles.badge, styles.categoryBadge, { backgroundColor: colors.primary }]}>
              <Text style={[styles.badgeText, { color: '#ffffff' }]}>
                {t(`recipes.categories.${recipe.category}` as any) || recipe.category || "General"}
              </Text>
            </View>
          </View>
        </View>

        {/* Title & Meta Info */}
        <View style={styles.section}>
          <Text style={[styles.title, { color: colors.text.primary }]}>{recipe.title}</Text>

          <View style={[styles.metaRow, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }]}>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={18} color={colors.text.secondary} />
              <Text style={[styles.metaText, { color: colors.text.secondary }]}>{recipe.time}</Text>
            </View>
            <View style={[styles.metaDivider, { backgroundColor: colors.border }]} />
            <View style={styles.metaItem}>
              <Ionicons name="flame-outline" size={18} color={colors.text.secondary} />
              <Text style={[styles.metaText, { color: colors.text.secondary }]}>
                {language === 'es'
                  ? (recipe.difficulty === 'Easy' ? 'Fácil' : recipe.difficulty === 'Hard' ? 'Difícil' : 'Medio')
                  : (recipe.difficulty || 'Medium')}
              </Text>
            </View>
            <View style={[styles.metaDivider, { backgroundColor: colors.border }]} />
            <View style={styles.metaItem}>
              <Ionicons name={recipe.isPublic ? "globe-outline" : "lock-closed-outline"} size={18} color={colors.text.secondary} />
              <Text style={[styles.metaText, { color: colors.text.secondary }]}>
                {recipe.isPublic ? (language === 'es' ? 'Pública' : 'Public') : (language === 'es' ? 'Privada' : 'Private')}
              </Text>
            </View>
          </View>

          {recipe.description ? <Text style={[styles.description, { color: colors.text.secondary }]}>{recipe.description}</Text> : null}
        </View>

        {/* Ingredients */}
        {recipe.ingredients && recipe.ingredients.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>{t('recipes.ingredientsSection')}</Text>
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }]}>
              {recipe.ingredients.map((ing, idx) => {
                const formatted = formatQuantityAndUnit(ing.quantity, ing.unit, measurementSystem);
                return (
                  <View key={idx} style={[styles.ingredientRow, { borderBottomColor: colors.border }, idx === recipe.ingredients!.length - 1 && { borderBottomWidth: 0 }]}>
                    <View style={[styles.bullet, { backgroundColor: colors.primary }]} />
                    <Text style={[styles.ingredientText, { color: colors.text.primary }]}>
                      <Text style={{ fontWeight: '700', color: colors.text.primary }}>{formatted.quantity} {formatted.unit}</Text>
                      <Text style={{ color: colors.text.secondary }}> {language === 'es' ? 'de' : 'of'} </Text>
                      <Text style={{ color: colors.text.primary }}>{typeof ing.ingredient === "object" ? ing.ingredient.name : ing.ingredient}</Text>
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Steps */}
        {recipe.steps && recipe.steps.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>{t('recipes.instructionsSection')}</Text>
            {recipe.steps?.map((step, idx) => (
              <View key={idx} style={styles.stepRow}>
                <View style={[styles.stepNumberContainer, { backgroundColor: colors.primary }]}>
                  <Text style={[styles.stepNumber, { color: '#ffffff' }]}>{idx + 1}</Text>
                </View>
                <Text style={[styles.stepText, { color: colors.text.primary }]}>{step}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Tags Section */}
        {recipe.tags && recipe.tags.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Tags</Text>
            <View style={styles.tagsContainer}>
              {normalizeTags(recipe.tags).map((tag, index) => (
                <TouchableOpacity
                  key={index}
                  activeOpacity={0.7}
                  style={[styles.tagChip, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={() => router.push({ pathname: "/recipes", params: { tag } })}
                >
                  <Text style={[styles.tagText, { color: colors.primary, fontWeight: '600' }]}>#{tag}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
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
  headerTitle: {
    fontSize: FONTS.sizes.h3,
    fontWeight: '700',
    color: COLORS.text.primary,
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
    width: 70,
    justifyContent: 'flex-end',
  },
  backButton: {
    padding: SPACING.xs,
    width: 70,
  },
  actionButton: {
    padding: 4
  },
  scrollContent: {
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  imageContainer: {
    width: '100%',
    height: 280,
    position: 'relative',
    marginBottom: SPACING.m,
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  imageOverlay: {
    position: 'absolute',
    top: SPACING.m,
    left: SPACING.m,
    flexDirection: 'row',
  },
  badge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    ...SHADOWS.small,
  },
  categoryBadge: {
    backgroundColor: COLORS.primary,
  },
  badgeText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: FONTS.sizes.small,
    textTransform: 'uppercase',
  },
  section: {
    paddingHorizontal: SPACING.m,
    marginBottom: SPACING.l,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: COLORS.text.primary,
    marginBottom: SPACING.s,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.m,
    backgroundColor: COLORS.card,
    padding: SPACING.m,
    borderRadius: SPACING.m,
    ...SHADOWS.small,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: FONTS.sizes.body,
    color: COLORS.text.secondary,
    fontWeight: '600',
  },
  metaDivider: {
    width: 1,
    height: 16,
    backgroundColor: COLORS.border,
    marginHorizontal: SPACING.m,
  },
  description: {
    fontSize: FONTS.sizes.body,
    color: COLORS.text.secondary,
    lineHeight: 24,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.h3,
    fontWeight: "700",
    marginBottom: SPACING.m,
    color: COLORS.text.primary,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: SPACING.m,
    padding: SPACING.m,
    ...SHADOWS.small,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.s,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.accent,
    marginRight: SPACING.m,
  },
  ingredientText: {
    fontSize: FONTS.sizes.body,
    color: COLORS.text.secondary,
    flex: 1,
    lineHeight: 22,
  },
  stepRow: {
    flexDirection: 'row',
    marginBottom: SPACING.m,
  },
  stepNumberContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.m,
    marginTop: 2,
  },
  stepNumber: {
    color: '#fff',
    fontWeight: '700',
    fontSize: FONTS.sizes.small,
  },
  stepText: {
    flex: 1,
    fontSize: FONTS.sizes.body,
    color: COLORS.text.secondary,
    lineHeight: 24,
  },
  error: {
    color: COLORS.error,
    marginBottom: 12,
  },
  retryButton: {
    padding: SPACING.m,
    backgroundColor: COLORS.primary,
    borderRadius: SPACING.m,
  },
  retryText: {
    color: '#fff',
    fontWeight: '600',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.s,
  },
  tagChip: {
    backgroundColor: COLORS.background,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tagText: {
    fontSize: FONTS.sizes.small,
    color: COLORS.text.secondary,
  },
});
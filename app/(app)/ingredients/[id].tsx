import { COLORS, FONTS, SHADOWS, SPACING, useThemeColors } from "@/src/constants/theme";
import { useTranslation } from "@/src/lib/i18n";
import { Ingredient } from "@/src/types";
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
  View,
} from "react-native";
import api from "../../../src/lib/api";
import Animated, { FadeInDown } from "react-native-reanimated";

export default function IngredientDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t, language } = useTranslation();
  const { colors } = useThemeColors();

  const [ingredient, setIngredient] = useState<Ingredient | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIngredient = async (ingredientId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/ingredients/${ingredientId}`);
      const data = res.data?.data ?? res.data;
      setIngredient(data ?? null);
    } catch (err: any) {
      console.error("fetchIngredient:", err);
      setError(err?.response?.data?.message ?? err.message ?? (language === 'es' ? 'Error al cargar ingrediente' : 'Error loading ingredient'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchIngredient(id);
  }, [id]);

  if (!id || loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error || !ingredient) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={[styles.error, { color: colors.error }]}>{error || (language === 'es' ? 'Ingrediente no encontrado' : 'Ingredient not found')}</Text>
        <TouchableOpacity style={[styles.retryButton, { backgroundColor: colors.primary }]} onPress={() => router.back()}>
          <Text style={[styles.retryText, { color: '#ffffff' }]}>{language === 'es' ? 'Volver' : 'Go Back'}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderMacro = (label: string, value: number = 0, color: string) => (
    <View style={[styles.macroCard, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }]}>
      <Text style={[styles.macroValue, { color }]}>{value}g</Text>
      <Text style={[styles.macroLabel, { color: colors.text.secondary }]}>{label}</Text>
    </View>
  );

  return (
    <View style={[styles.mainContainer, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]} numberOfLines={1}>
          {language === 'es' ? 'Detalle del Ingrediente' : 'Ingredient Details'}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Modern Hero Image Card */}
        <Animated.View
          entering={FadeInDown.duration(400).springify()}
          style={[styles.heroCard, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }]}
        >
          <View style={[styles.glowCircle, { backgroundColor: colors.primary + '18' }]} />
          <View style={[styles.imageFrame, { borderColor: colors.primary + '40', backgroundColor: colors.background }]}>
            <Image
              source={{ uri: ingredient.image || "https://img.icons8.com/color/480/vegetables.png" }}
              style={styles.heroImage}
              resizeMode="cover"
            />
          </View>
        </Animated.View>

        <View style={styles.headerSection}>
          <Text style={[styles.title, { color: colors.text.primary }]}>{ingredient.name}</Text>
          <View style={styles.badgesRow}>
            {ingredient.category && (
              <View style={[styles.badge, { backgroundColor: colors.primary + '20' }]}>
                <Ionicons name="pricetag-outline" size={14} color={colors.primary} />
                <Text style={[styles.badgeText, { color: colors.primary }]}>{ingredient.category}</Text>
              </View>
            )}
            {ingredient.unit && (
              <View style={[styles.badge, styles.unitBadge, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }]}>
                <Ionicons name="scale-outline" size={14} color={colors.text.secondary} />
                <Text style={[styles.badgeText, { color: colors.text.secondary }]}>{ingredient.unit}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Nutrition Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            {language === 'es' ? 'Nutrición (por 100g)' : 'Nutrition (per 100g)'}
          </Text>

          <View style={[styles.caloriesCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View>
              <Text style={[styles.caloriesLabel, { color: colors.text.secondary }]}>{language === 'es' ? 'Energía' : 'Energy'}</Text>
              <Text style={[styles.caloriesValue, { color: colors.text.primary }]}>{ingredient.calories || 0}</Text>
            </View>
            <Text style={[styles.kcalText, { color: colors.text.light }]}>kcal</Text>
          </View>

          <View style={styles.macrosContainer}>
            {renderMacro(language === 'es' ? 'Proteína' : 'Protein', ingredient.macros?.protein, "#3b82f6")}
            {renderMacro(language === 'es' ? 'Carbos' : 'Carbs', ingredient.macros?.carbs, "#eab308")}
            {renderMacro(language === 'es' ? 'Grasas' : 'Fat', ingredient.macros?.fat, "#ef4444")}
            {renderMacro(language === 'es' ? 'Fibra' : 'Fiber', ingredient.macros?.fiber, "#10b981")}
          </View>
        </View>

        {/* Tags Section */}
        {ingredient.tags && ingredient.tags.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>{language === 'es' ? 'Etiquetas' : 'Tags'}</Text>
            <View style={styles.tagsContainer}>
              {ingredient.tags.map((tag, index) => (
                <TouchableOpacity
                  key={index}
                  activeOpacity={0.7}
                  style={[styles.tagChip, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={() => router.push({ pathname: "/ingredients", params: { tag } })}
                >
                  <Text style={[styles.tagText, { color: colors.primary, fontWeight: '600' }]}>#{tag}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

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
  backButton: {
    padding: SPACING.xs,
    width: 40,
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
  heroCard: {
    marginHorizontal: SPACING.m,
    marginTop: SPACING.m,
    marginBottom: SPACING.l,
    height: 210,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  glowCircle: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
  },
  imageFrame: {
    width: 136,
    height: 136,
    borderRadius: 68,
    borderWidth: 3,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  heroImage: {
    width: '100%',
    height: '100%',
    borderRadius: 68,
  },
  headerSection: {
    paddingHorizontal: SPACING.l,
    marginBottom: SPACING.l,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.text.primary,
    marginBottom: SPACING.s,
    textAlign: 'center',
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.s,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    backgroundColor: COLORS.primary + '15',
    borderRadius: 16,
    gap: 4,
  },
  unitBadge: {
    backgroundColor: COLORS.border,
  },
  badgeText: {
    fontSize: FONTS.sizes.small,
    fontWeight: '600',
    color: COLORS.primary,
  },
  section: {
    paddingHorizontal: SPACING.l,
    marginBottom: SPACING.l,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.h3,
    fontWeight: "700",
    color: COLORS.text.primary,
    marginBottom: SPACING.m,
  },
  caloriesCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.card,
    padding: SPACING.m,
    borderRadius: SPACING.m,
    marginBottom: SPACING.m,
    ...SHADOWS.small,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  caloriesLabel: {
    fontSize: FONTS.sizes.body,
    color: COLORS.text.secondary,
  },
  caloriesValue: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.text.primary,
  },
  kcalText: {
    fontSize: FONTS.sizes.h3,
    fontWeight: '600',
    color: COLORS.text.light,
  },
  macrosContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.s,
  },
  macroCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    padding: SPACING.s,
    borderRadius: SPACING.m,
    alignItems: 'center',
    ...SHADOWS.small,
  },
  macroValue: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  macroLabel: {
    fontSize: 10,
    color: COLORS.text.secondary,
    textTransform: 'uppercase',
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
  error: {
    color: COLORS.error,
    marginBottom: 12,
    fontSize: FONTS.sizes.body,
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
});
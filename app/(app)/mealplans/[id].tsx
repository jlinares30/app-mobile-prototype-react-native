import { COLORS, FONTS, SHADOWS, SPACING, useThemeColors } from "@/src/constants/theme";
import { Ionicons } from '@expo/vector-icons';
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
import Animated, { FadeInDown } from 'react-native-reanimated';
import api from "../../../src/lib/api";
import { MealPlan } from "../../../src/types";

export default function MealPlanDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useThemeColors();

  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMealPlan = async (planId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/meal-plans/${planId}`);
      const data = res.data?.data ?? res.data;
      setMealPlan(data);
    } catch (err: any) {
      console.error("fetchMealPlan:", err);
      setError(err?.response?.data?.message ?? err.message ?? "Error al cargar el plan de comidas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchMealPlan(id);
  }, [id]);

  if (!id) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>ID not provided.</Text>
        <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={() => router.back()}>
          <Text style={[styles.buttonText, { color: '#ffffff' }]}>Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
        <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={() => fetchMealPlan(id)}>
          <Text style={[styles.buttonText, { color: '#ffffff' }]}>Reintentar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, { marginTop: SPACING.m, backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }]} onPress={() => router.back()}>
          <Text style={[styles.buttonText, { color: colors.text.primary }]}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!mealPlan) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>Not found meal plan.</Text>
        <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={() => router.back()}>
          <Text style={[styles.buttonText, { color: '#ffffff' }]}>Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const openRecipe = (recipeId: string) => {
    router.push(`/recipes/${recipeId}`);
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
      </View>

      <Animated.View entering={FadeInDown.springify()}>
        {mealPlan.image ? (
          <Image source={{ uri: mealPlan.image }} style={styles.image} />
        ) : (
          <View style={[styles.placeholderImage, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }]}>
            <Ionicons name="restaurant-outline" size={64} color={colors.text.light} />
          </View>
        )}

        <Text style={[styles.title, { color: colors.text.primary }]}>{mealPlan.title}</Text>
        {mealPlan.description ? <Text style={[styles.description, { color: colors.text.secondary }]}>{mealPlan.description}</Text> : null}

        {mealPlan.days && mealPlan.days.length > 0 ? (
          mealPlan.days.map((day, index) => (
            <Animated.View
              key={day._id}
              entering={FadeInDown.delay(index * 100).springify()}
              style={[styles.daySection, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }]}
            >
              <View style={[styles.dayHeader, { borderBottomColor: colors.border }]}>
                <Ionicons name="calendar-outline" size={20} color={colors.primary} />
                <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>{day.day}</Text>
              </View>

              {day.meals.map((meal) => (
                <TouchableOpacity
                  key={meal._id}
                  style={[styles.mealRow, { backgroundColor: colors.background, borderColor: colors.border, borderWidth: 1 }]}
                  activeOpacity={0.8}
                  onPress={() => {
                    const recipeId = typeof meal.recipe === 'string' ? meal.recipe : meal.recipe?._id;
                    if (recipeId) openRecipe(recipeId);
                  }}
                >
                  <View style={[styles.mealIcon, { backgroundColor: colors.primary + '20' }]}>
                    <Ionicons
                      name={meal.type.toLowerCase().includes('breakfast') ? 'sunny-outline' : meal.type.toLowerCase().includes('lunch') ? 'restaurant-outline' : 'moon-outline'}
                      size={20}
                      color={colors.primary}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.mealType, { color: colors.primary }]}>{meal.type.toUpperCase()}</Text>
                    <Text style={[styles.mealRecipe, { color: colors.text.primary }]}>
                      {typeof meal.recipe === 'string' ? "Recipe" : (meal.recipe?.title ?? "Unknown Recipe")}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.text.light} />
                </TouchableOpacity>
              ))}
            </Animated.View>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.text.secondary }]}>No meals in this plan.</Text>
          </View>
        )}
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: SPACING.m,
    paddingBottom: 40,
    backgroundColor: COLORS.background,
    minHeight: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
    marginBottom: SPACING.m,
  },
  backButton: {
    padding: SPACING.xs,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.m,
    backgroundColor: COLORS.background,
  },
  image: {
    width: "100%",
    height: 220,
    borderRadius: SPACING.l,
    marginBottom: SPACING.l,
    resizeMode: "cover",
  },
  placeholderImage: {
    width: "100%",
    height: 180,
    borderRadius: SPACING.l,
    marginBottom: SPACING.l,
    backgroundColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: FONTS.sizes.h2,
    fontWeight: "800",
    color: COLORS.text.primary,
    marginBottom: SPACING.s,
  },
  description: {
    fontSize: FONTS.sizes.body,
    color: COLORS.text.secondary,
    lineHeight: 22,
    marginBottom: SPACING.l,
  },
  daySection: {
    marginTop: SPACING.m,
    backgroundColor: COLORS.card,
    padding: SPACING.m,
    borderRadius: SPACING.l,
    ...SHADOWS.small,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.m,
    paddingBottom: SPACING.s,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: SPACING.s
  },
  sectionTitle: {
    fontSize: FONTS.sizes.h3,
    fontWeight: "700",
    color: COLORS.text.primary,
  },
  mealRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.m,
    backgroundColor: COLORS.background,
    borderRadius: SPACING.m,
    marginBottom: SPACING.s,
  },
  mealIcon: {
    marginRight: SPACING.m,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mealType: {
    fontSize: FONTS.sizes.small,
    color: COLORS.primary,
    fontWeight: "700",
    marginBottom: 2,
  },
  mealRecipe: {
    fontSize: FONTS.sizes.body,
    fontWeight: "600",
    color: COLORS.text.primary,
  },
  emptyContainer: {
    marginTop: SPACING.xl,
    alignItems: 'center',
  },
  emptyText: {
    textAlign: "center",
    color: COLORS.text.secondary,
    fontSize: FONTS.sizes.body,
  },
  errorText: {
    color: COLORS.error,
    marginBottom: SPACING.m,
    fontSize: FONTS.sizes.body,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.m,
    paddingHorizontal: SPACING.xl,
    borderRadius: SPACING.m,
    ...SHADOWS.small,
  },
  buttonText: {
    color: COLORS.card,
    fontWeight: '600',
    fontSize: FONTS.sizes.body,
  }
});

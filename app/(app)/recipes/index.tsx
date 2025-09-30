import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Recipe {
  id: string;
  title: string;
  description: string;
  time: string;
}

const recipes: Recipe[] = [
  { id: "1", title: "Ensalada de Pollo", description: "Fresca ensalada con pollo a la parrilla", time: "15 min" },
  { id: "2", title: "Pasta al Pesto", description: "Deliciosa pasta con salsa de albahaca", time: "20 min" },
  { id: "3", title: "Arroz con Verduras", description: "Arroz integral con vegetales frescos", time: "25 min" },
];

export default function RecipesScreen() {
  const renderRecipeItem = ({ item }: { item: Recipe }) => (
    <TouchableOpacity style={styles.recipeCard}>
      <View style={styles.recipeContent}>
        <View style={styles.recipeHeader}>
          <Text style={styles.recipeTitle}>{item.title}</Text>
          <View style={styles.timeContainer}>
            <Text style={styles.timeText}>{item.time}</Text>
          </View>
        </View>
        <Text style={styles.recipeDescription}>{item.description}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Lista de Recetas</Text>
      <FlatList
        data={recipes}
        keyExtractor={(item) => item.id}
        renderItem={renderRecipeItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 24,
    textAlign: 'center',
  },
  listContainer: {
    paddingBottom: 20,
  },
  recipeCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recipeContent: {
    padding: 16,
  },
  recipeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  recipeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    flex: 1,
  },
  timeContainer: {
    backgroundColor: '#e8f4fd',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  timeText: {
    fontSize: 12,
    color: '#2980b9',
    fontWeight: '500',
  },
  recipeDescription: {
    fontSize: 14,
    color: '#7f8c8d',
    lineHeight: 20,
  },
});
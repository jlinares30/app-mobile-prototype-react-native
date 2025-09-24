import { FlatList, Text, TouchableOpacity, View } from "react-native";

const recipes = [
  { id: "1", title: "Ensalada de Pollo" },
  { id: "2", title: "Pasta al Pesto" },
  { id: "3", title: "Arroz con Verduras" },
];

export default function RecipesScreen() {
  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Lista de recetas</Text>
      <FlatList
        data={recipes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Text>
            <TouchableOpacity style={{ padding: 10, borderBottomWidth: 1 }}>
              <Text>{item.title}</Text>
            </TouchableOpacity>
          </Text>
        )}
      />
    </View>
  );
}
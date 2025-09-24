import { Stack } from "expo-router";

export default function RecipesLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{ title: "Recetas" }} 
      />
      <Stack.Screen 
        name="[id]" 
        options={{ title: "Detalle de receta" }} 
      />
    </Stack>
  );
}

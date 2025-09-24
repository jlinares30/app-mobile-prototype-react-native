import { Stack } from "expo-router";

export default function AppLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Inicio" }} />
      <Stack.Screen name="recipes/index" options={{ title: "Recetas" }} />
      <Stack.Screen name="recipes/details" options={{ title: "Detalle receta" }} />
    </Stack>
  );
}

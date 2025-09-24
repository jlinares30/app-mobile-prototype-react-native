import { useRouter } from "expo-router";
import { Button, Text, View } from "react-native";

export default function AppHome() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 24 }}>Bienvenido a la App 🚀</Text>
      <Button title="Ver Recetas" onPress={() => router.push("/recipes")} />
      <Button title="Log out" onPress={() => router.push("/(auth)/login")} />
    </View>
  );
}

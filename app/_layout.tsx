import { Stack } from 'expo-router';
import { useAuthStore } from "../src/store/useAuth.js";

export default function RootLayout() {

  const { user } = useAuthStore();

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {user ? (
        <Stack.Screen name="(app)" />
      ) : (
        <Stack.Screen name="(auth)" />
      )}
    </Stack>
  );
}

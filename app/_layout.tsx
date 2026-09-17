import "../global.css";

import { AuthProvider } from "@/hooks/useAuth";
import { Stack } from "expo-router";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack
        initialRouteName="(tabs)"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="(tabs)" />

        <Stack.Screen
          name="login"
          options={{
            presentation: "modal",
          }}
        />

        <Stack.Screen
          name="register"
          options={{
            presentation: "modal",
          }}
        />

        <Stack.Screen name="edit-profile" />

        <Stack.Screen name="(tabs-admin)" />

        <Stack.Screen name="(tabs-employee)" />

        <Stack.Screen name="(tabs-restaurant)" />
      </Stack>
    </AuthProvider>
  );
}

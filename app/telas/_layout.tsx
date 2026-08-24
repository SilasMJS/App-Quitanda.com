import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import authService from "../../services/auth";

export default function TelasLayout() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    verificarAcesso();
  }, []);

  const verificarAcesso = async () => {
    const isAuth = await authService.isAuthenticated();
    if (!isAuth) {
      router.replace("/");
    } else {
      setIsAuthenticated(true);
    }
  };

  if (isAuthenticated === null) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack
        screenOptions={{
          headerShown: false, // Remove o cabeçalho padrão em todas as telas
        }}
        initialRouteName="dashboard"
      >
        <Stack.Screen name="dashboard" />
        <Stack.Screen name="produtos" />
        <Stack.Screen name="reservas" />
        <Stack.Screen name="postagens" />
        <Stack.Screen name="pagamentos" />
        <Stack.Screen name="perfil" />
        <Stack.Screen name="mensagens" />
      </Stack>
    </GestureHandlerRootView>
  );
}

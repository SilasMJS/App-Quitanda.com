import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function TelasLayout() {
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
      </Stack>
    </GestureHandlerRootView>
  );
}

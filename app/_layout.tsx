import { ToastProvider } from "@/components/ToastContext";
import { Stack } from "expo-router";

/**
 * RootLayout - O ponto de entrada principal da navegação.
 * Utilizamos um 'Stack' para permitir a transição entre a tela de login (index)
 * e a área restrita do aplicativo (pasta telas).
 */
export default function RootLayout() {
  return (
    <ToastProvider>
      <Stack screenOptions={{ headerShown: false }}>
        {/* 
        A tela 'index' é a primeira a ser carregada (Login).
        O Expo Router mapeia automaticamente arquivos .tsx para rotas.
      */}
        <Stack.Screen name="index" />

        {/* 
        O grupo 'telas' contém toda a lógica interna pós-login.
        Configuramos como uma rota protegida por interface.
      */}
        <Stack.Screen name="telas" />
      </Stack>
    </ToastProvider>
  );
}

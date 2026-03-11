import {Stack} from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false}}>
      {/*index é a tela de login*/}
      <Stack.Screen name="index" />
      {/*telas é onde o app acontece apos o login*/}
      <Stack.Screen name="telas" />
    </Stack>
  );
}
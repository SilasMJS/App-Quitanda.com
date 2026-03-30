import { ColorSchemeName, useColorScheme as _useColorScheme } from 'react-native';

/**
 * useColorScheme - Wrapper para garantir que o tema seja sempre light ou dark.
 */
export function useColorScheme(): NonNullable<ColorSchemeName> {
  const coreScheme = _useColorScheme();
  return coreScheme === 'dark' ? 'dark' : 'light';
}

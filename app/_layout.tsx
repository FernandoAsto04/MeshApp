import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

// 1. Corregimos la ruta (según tu imagen está en la carpeta context)
import { BluetoothProvider } from '@/context/BluetoothContext';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

// Solo DEBE EXISTIR un "export default function RootLayout"
export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    // 2. El BluetoothProvider debe envolver a TODO para que funcione en todas las pestañas
    <BluetoothProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </BluetoothProvider>
  );
}
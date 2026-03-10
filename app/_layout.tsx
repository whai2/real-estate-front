import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useNotifications } from '../src/hooks/useNotifications';

const queryClient = new QueryClient();

export default function RootLayout() {
  useNotifications();

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="login" options={{ presentation: 'fullScreenModal' }} />
        <Stack.Screen name="signup" options={{ presentation: 'fullScreenModal' }} />
        <Stack.Screen name="register" options={{ presentation: 'modal' }} />
      </Stack>
    </QueryClientProvider>
  );
}

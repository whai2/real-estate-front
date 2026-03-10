import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useNotifications } from '../src/hooks/useNotifications';
import { useAuthStore } from '../src/stores/authStore';
import { useEffect } from 'react';

const queryClient = new QueryClient();

function useProtectedRoute() {
  const { isAuthenticated } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inAuthGroup = segments[0] === 'login' || segments[0] === 'signup' || segments[0] === 'register';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/login');
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, segments]);
}

export default function RootLayout() {
  useNotifications();
  useProtectedRoute();

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="login" options={{ animation: 'fade' }} />
        <Stack.Screen name="signup" options={{ presentation: 'fullScreenModal' }} />
        <Stack.Screen name="register" options={{ presentation: 'modal' }} />
      </Stack>
    </QueryClientProvider>
  );
}

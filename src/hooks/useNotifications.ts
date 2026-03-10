import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import type { EventSubscription } from 'expo-modules-core';
import { apiRequest } from '../services/api';
import { useAuthStore } from '../stores/authStore';

if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}

async function registerForPushNotifications() {
  if (!Device.isDevice) {
    console.log('[Push] 실기기에서만 푸시 알림을 사용할 수 있습니다.');
    return;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('[Push] 푸시 알림 권한이 거부되었습니다.');
    return;
  }

  // FCM 디바이스 토큰 획득
  const deviceToken = (await Notifications.getDevicePushTokenAsync()).data;

  // 서버에 토큰 등록
  try {
    await apiRequest('/auth/device-token', {
      method: 'POST',
      body: {
        token: deviceToken,
        platform: Platform.OS as 'ios' | 'android',
      },
    });
    console.log('[Push] 디바이스 토큰 등록 완료:', deviceToken);
  } catch (err) {
    console.error('[Push] 토큰 등록 실패:', err);
  }

  // Android 알림 채널 설정
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#3B82F6',
    });
  }
}

export function useNotifications() {
  const notificationListener = useRef<EventSubscription | null>(null);
  const responseListener = useRef<EventSubscription | null>(null);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated || Platform.OS === 'web') return;

    registerForPushNotifications();

    notificationListener.current = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('[Push] 알림 수신:', notification);
      }
    );

    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log('[Push] 알림 탭:', response);
      }
    );

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [isAuthenticated]);
}

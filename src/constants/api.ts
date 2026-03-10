import { Platform } from 'react-native';

// Android 에뮬레이터에서 localhost 접근 시 10.0.2.2 사용
const LOCAL_IP = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
const DEV_API_URL = `http://${LOCAL_IP}:3000/api`;

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || DEV_API_URL;

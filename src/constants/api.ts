import { Platform } from 'react-native';

// Android 에뮬레이터에서 localhost 접근 시 10.0.2.2 사용
const LOCAL_IP = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';

export const API_BASE_URL = __DEV__
  ? `http://${LOCAL_IP}:3000/api`
  : 'https://your-production-url.com/api';

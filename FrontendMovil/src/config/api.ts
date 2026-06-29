import { Platform } from 'react-native';
import Constants from 'expo-constants';

const rawBackendUrl = Constants.expoConfig?.extra?.EXPO_PUBLIC_URL_BACKEND || '';

export const backendUrl = Platform.OS === 'android'
  ? rawBackendUrl.replace('localhost', '10.0.2.2')
  : rawBackendUrl;

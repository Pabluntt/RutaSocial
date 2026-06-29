import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { backendUrl } from '../config/api';

export const apiClient = axios.create({
  baseURL: backendUrl,
  timeout: 15000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error?.response?.status === 401) {
      await AsyncStorage.multiRemove(['accessToken', 'userId', 'userRole', 'userName']);
    }
    return Promise.reject(error);
  },
);

export function responseMessage<T>(data: unknown, fallback: T): T {
  if (data && typeof data === 'object' && 'message' in data) {
    return (data as { message?: T }).message ?? fallback;
  }
  return (data as T) ?? fallback;
}

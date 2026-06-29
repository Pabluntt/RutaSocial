jest.mock('react-native-vector-icons/FontAwesome', () => 'Icon');
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  multiRemove: jest.fn(),
}));
jest.mock('react-native-maps', () => {
  const React = require('react');
  const { View } = require('react-native');
  const MapView = (props: any) => React.createElement(View, props);
  return {
    __esModule: true,
    default: MapView,
    Marker: View,
    Circle: View,
    PROVIDER_GOOGLE: 'google',
  };
});
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(async () => ({ status: 'granted' })),
  getCurrentPositionAsync: jest.fn(async () => ({ coords: { latitude: -29.95, longitude: -71.33 } })),
}));

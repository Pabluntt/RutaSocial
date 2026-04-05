// Adaptado a tu estructura usando RootStackNavigation y pantallas existentes
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import InitialScreen from './src/screens/InitialScreen';
import LoginScreen from './src/screens/Auth/LoginScreen';
import HomeScreen from './src/screens/Common/HomeScreen';
import ProfileScreen from './src/screens/Common/ProfileScreen';

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Initial"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#FFD700',
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen
          name="Initial"
          component={InitialScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'Inicio' }}
        />
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          options={{ title: 'Perfil' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;

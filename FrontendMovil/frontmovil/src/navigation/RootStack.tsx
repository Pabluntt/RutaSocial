import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/Auth/LoginScreen';
import HomeScreen from '../screens/Common/HomeScreen';
import InitialScreen from '../screens/InitialScreen';
import ProfileScreen from '../screens/Common/ProfileScreen';
import UsersScreen from '../screens/Common/UsersScreen';
import EventScreen from '../screens/Common/EventScreen';
import RouteScreen from '../screens/Common/RouteScreen';
import HistoryScreen from '../screens/Common/HistoryScreen';
import FullMapScreen from '../screens/Common/FullMapScreen';

export type RootStackParamList = {
  Initial: undefined;
  Login: undefined;
  Home: undefined;
  Profile: undefined;
  Users: undefined;
  Event: undefined;
  Route: undefined;
  History: undefined;
  FullMap: {routeId: string; isOngoing: boolean; codeRoute: string};
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootStackNavigation = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Initial">
        <Stack.Group screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Initial" component={InitialScreen} />
        </Stack.Group>
        <Stack.Group screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
        </Stack.Group>
        <Stack.Group screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Home" component={HomeScreen} />
        </Stack.Group>
        <Stack.Group screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Profile" component={ProfileScreen} />
        </Stack.Group>
        <Stack.Group screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Users" component={UsersScreen} />
        </Stack.Group>
        <Stack.Group screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Event" component={EventScreen} />
        </Stack.Group>
        <Stack.Group screenOptions={{ headerShown: false}}>
          <Stack.Screen name="Route" component={RouteScreen} />
        </Stack.Group>
        <Stack.Group screenOptions={{ headerShown: false}}>
          <Stack.Screen name="History" component={HistoryScreen} />
        </Stack.Group>
        <Stack.Group screenOptions={{ headerShown: false}}>
          <Stack.Screen name= "FullMap" component={FullMapScreen} />
        </Stack.Group>
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootStackNavigation;

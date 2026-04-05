import jwt_decode from 'jwt-decode';
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { NavigationProp } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Constants from 'expo-constants';

const rawUrl = Constants.expoConfig?.extra?.EXPO_PUBLIC_URL_BACKEND || '';
const backendUrl =
  Platform.OS === 'android'
    ? rawUrl.replace('localhost', '10.0.2.2')
    : rawUrl;

type LoginScreenProps = {
  navigation: NavigationProp<any>;
};

const authenticate = async (
  email: string,
  password: string
): Promise<{ accessToken: string } | null> => {
  try {
    const response = await axios.post(`${backendUrl}/login`, {
      email,
      password,
    });

    const token = response.data.token;
    if (!token) return null;

    return { accessToken: token };
  } catch (error: any) {
    return null;
  }
};

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    const tokens = await authenticate(email, password);
    setLoading(false);

    if (tokens?.accessToken) {
      try {
        const decoded: any = jwt_decode(tokens.accessToken);
        console.log('DECODED JWT:', decoded);
        const userId = decoded.user_id;
        const user_Role = decoded.user_role; // <--- así se obtiene el rol del JWT

        await AsyncStorage.setItem('accessToken', tokens.accessToken);
        await AsyncStorage.setItem('userId', userId);
        await AsyncStorage.setItem('userRole', user_Role);

        navigation.navigate('Home');
      } catch (error) {
        console.error('Error al guardar datos en AsyncStorage', error);
      }
    } else {
      Alert.alert('Error', 'Credenciales inválidas');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Icon name="user-circle" size={80} color="#79CB3A" />
        <Text style={styles.title}>Iniciar Sesión</Text>

        <TextInput
          style={styles.input}
          placeholder="Correo electrónico"
          placeholderTextColor="#666"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          placeholderTextColor="#666"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Cargando...' : 'Ingresar'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F9997',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    width: '85%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0F9997',
    marginVertical: 20,
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  button: {
    backgroundColor: '#FF5A00',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 12,
    marginTop: 10,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

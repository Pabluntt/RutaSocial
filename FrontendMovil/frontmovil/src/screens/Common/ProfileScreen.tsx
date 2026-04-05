import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Constants from 'expo-constants';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/RootStack';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Profile'>;
};

const rawUrl = Constants.expoConfig?.extra?.EXPO_PUBLIC_URL_BACKEND || '';
const backendUrl = Platform.OS === 'android' ? rawUrl.replace('localhost', '10.0.2.2') : rawUrl;

export default function ProfileScreen({ navigation }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Resumen actividad
  const [lastRouteDate, setLastRouteDate] = useState('');
  const [registerDate, setRegisterDate] = useState('');
  const [role, setRole] = useState('');
  const [institution, setInstitution] = useState('');
  const [helpingPointsCount, setHelpingPointsCount] = useState(0);
  const [routesCount, setRoutesCount] = useState(0);

  useEffect(() => {
    const loadAllProfileData = async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        const res = await axios.get(`${backendUrl}/user/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setName(res.data.message.name || '');
        setPhone(res.data.message.phone || '');
        setEmail(res.data.message.email || '');
        setRegisterDate(
          res.data.message.date_register
            ? new Date(res.data.message.date_register).toLocaleDateString('es-CL')
            : ''
        );
        setRole(res.data.message.role || '');
        setInstitution(res.data.message.institution || '');

        // Buscar última ruta si existe
        const list: { date: string }[] = res.data.message.list_routes || [];
        if (list.length > 0) {
          const sorted = list.sort(
            (a, b) =>
              new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          setLastRouteDate(new Date(sorted[0].date).toLocaleDateString('es-CL'));
        }

        // Obtener datos de participación
        const userId = res.data.message._id || res.data.message.id || res.data.message.user_id;
        if (userId) {
          const participationRes = await axios.get(
            `${backendUrl}/route/participation/${userId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setHelpingPointsCount(participationRes.data.message.total_helpingpoints || 0);
          setRoutesCount(participationRes.data.message.total_routes || 0);
        }
      } catch (error) {
        console.error('Error al cargar perfil o participación:', error);
        Alert.alert('Error', 'No se pudo cargar tu perfil');
      }
    };

    loadAllProfileData();
  }, []);

  const handleSave = async () => {
    try {
      setLoading(true);
      if (newPassword && newPassword !== confirmPassword) {
        Alert.alert('Error', 'Las contraseñas no coinciden');
        return;
      }
      const token = await AsyncStorage.getItem('accessToken');
      const updateData: any = { name, phone };

      if (currentPassword && newPassword && confirmPassword) {
        updateData.currentPassword = currentPassword;
        updateData.newPassword = newPassword;
        updateData.confirmNewPassword = confirmPassword;
      }

      await axios.put(`${backendUrl}/user/update`, updateData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setIsEditing(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      Alert.alert('Éxito', 'Perfil actualizado correctamente');
    } catch (error) {
      console.error('Error al guardar perfil:', error);
      if (axios.isAxiosError(error) && error.response?.data?.error) {
        Alert.alert('Error', error.response.data.error);
      } else {
        Alert.alert('Error', 'No se pudo actualizar tu perfil');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Mi Perfil</Text>
        <View style={styles.infoContainer}>
          <Text style={styles.label}>Nombre:</Text>
          <TextInput
            style={[styles.input, !isEditing && styles.readOnly]}
            value={name}
            onChangeText={setName}
            editable={isEditing}
          />

          <Text style={styles.label}>Correo:</Text>
          <TextInput
            style={[styles.input, styles.readOnly]}
            value={email}
            editable={false}
          />

          <Text style={styles.label}>Teléfono:</Text>
          <TextInput
            style={[styles.input, !isEditing && styles.readOnly]}
            value={phone}
            onChangeText={setPhone}
            editable={isEditing}
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>Rol:</Text>
          <TextInput
            style={[styles.input, styles.readOnly]}
            value={role === 'admin' ? 'Admin' : 'Voluntario'}
            editable={false}
          />

          <Text style={styles.label}>Institución:</Text>
          <TextInput
            style={[styles.input, styles.readOnly]}
            value={institution}
            editable={false}
          />

          {isEditing && (
            <>
              <Text style={styles.label}>Contraseña actual:</Text>
              <TextInput
                style={styles.input}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry
                placeholder="Requerida para cambiar contraseña"
              />

              <Text style={styles.label}>Nueva contraseña:</Text>
              <TextInput
                style={styles.input}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
              />

              <Text style={styles.label}>Confirmar nueva contraseña:</Text>
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
            </>
          )}

          {isEditing ? (
            <TouchableOpacity
              style={[styles.button, { marginBottom: 30 }]}
              onPress={handleSave}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Guardando...' : 'Guardar'}
              </Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity
                style={styles.button}
                onPress={() => setIsEditing(true)}
              >
                <Text style={styles.buttonText}>Editar datos</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.homeButton}
                onPress={() => navigation.navigate('Home')}
              >
                <Text style={styles.homeButtonText}>Volver al Home</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {!isEditing && (
          <View style={styles.activitySummary}>
            <Text style={styles.summaryTitle}>Resumen de tu Actividad</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>🗓️ Última Ruta Realizada</Text>
              <Text style={styles.summaryValue}>{lastRouteDate || 'Sin rutas'}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>🛣️ Rutas en las que participaste</Text>
              <Text style={styles.summaryValue}>{routesCount}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>👥 Personas Registradas</Text>
              <Text style={styles.summaryValue}>{helpingPointsCount}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>🕒 Fecha de Creación</Text>
              <Text style={styles.summaryValue}>{registerDate}</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    paddingTop: 60,
    paddingHorizontal: 25,
    paddingBottom: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#0F9997',
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: 10,
  },
  label: {
    fontSize: 15,
    color: '#0F9997',
    marginBottom: 6,
    marginTop: 15,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#B2DFDB',
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 45,
    fontSize: 16,
    backgroundColor: '#F9F9F9',
    color: '#000',
  },
  readOnly: {
    backgroundColor: '#EAEAEA',
    color: '#777',
  },
  button: {
    backgroundColor: '#FF5A00',
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 30,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  buttonText: {
    textAlign: 'center',
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  homeButton: {
    marginTop: 10,
    marginBottom: 40,
    alignSelf: 'center',
    backgroundColor: '#79CB3A',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  homeButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  activitySummary: {
    backgroundColor: '#F0F4F8',
    marginTop: 40,
    padding: 20,
    borderRadius: 10,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#0F9997',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#333',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007BFF',
  },
});

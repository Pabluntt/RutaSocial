import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Constants from 'expo-constants';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/RootStack';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Clipboard from 'expo-clipboard';

const rawUrl = Constants.expoConfig?.extra?.EXPO_PUBLIC_URL_BACKEND || '';
const backendUrl = Platform.OS === 'android' ? rawUrl.replace('localhost', '10.0.2.2') : rawUrl;

export default function RouteScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [showDate, setShowDate] = useState(false);
  const [showTime, setShowTime] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inviteModalVisible, setInviteModalVisible] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [title, setTitle] = useState('');
  const [createdRouteId, setCreatedRouteId] = useState<string | null>(null);

  const handleCreateRoute = async () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert('Error', 'Debes ingresar título y descripción.');
      return;
    }

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('accessToken');
      const userId = await AsyncStorage.getItem('userId');

      const body = {
        title,
        description,
        route_leader: userId,
        team: [],
        status: 'activo',
        date_created: startDate.toISOString(),
      };

      const res = await axios.post(`${backendUrl}/route`, body, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const createdRoute = res.data.message;
      const inviteCode = res.data.message?.invite_code;

      setInviteCode(inviteCode || 'No disponible');
      setInviteModalVisible(true);
      setDescription('');
      setTitle('');

      setCreatedRouteId(createdRoute._id);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'No se pudo crear la ruta.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    Clipboard.setStringAsync(inviteCode);
    Alert.alert('Copiado', 'Código copiado al portapapeles.');
  };

  const handleDateChange = (_: any, selectedDate?: Date) => {
    if (selectedDate) {
      const updated = new Date(startDate);
      updated.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
      setStartDate(updated);
    }
    setShowDate(false);
  };

  const handleTimeChange = (_: any, selectedTime?: Date) => {
    if (selectedTime) {
      const updated = new Date(startDate);
      updated.setHours(selectedTime.getHours());
      updated.setMinutes(selectedTime.getMinutes());
      setStartDate(updated);
    }
    setShowTime(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crear Nueva Ruta</Text>

      <TextInput
        style={styles.input}
        placeholder="Título de la ruta"
        value={title}
        onChangeText={setTitle}
      />

      <TextInput
        style={styles.input}
        placeholder="Descripción de la ruta"
        value={description}
        onChangeText={setDescription}
      />

      <TouchableOpacity style={styles.input} onPress={() => setShowDate(true)}>
        <Text>📅 Fecha: {startDate.toLocaleDateString()}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.input} onPress={() => setShowTime(true)}>
        <Text>⏰ Hora: {startDate.toLocaleTimeString()}</Text>
      </TouchableOpacity>

      {showDate && (
        <DateTimePicker
          value={startDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}
      {showTime && (
        <DateTimePicker
          value={startDate}
          mode="time"
          display="default"
          onChange={handleTimeChange}
        />
      )}

      <TouchableOpacity style={styles.button} onPress={handleCreateRoute} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Creando...' : 'Crear Ruta'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.navigate('Home')}>
        <Text style={styles.cancelButtonText}>Volver al Inicio</Text>
      </TouchableOpacity>

      {inviteModalVisible && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Ruta creada exitosamente 🎉</Text>
            <Text style={styles.modalCodeLabel}>Código de invitación:</Text>
            <Text style={styles.modalCode}>{inviteCode}</Text>

            <TouchableOpacity style={styles.copyButton} onPress={handleCopyCode}>
              <Text style={styles.copyButtonText}>Copiar código</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalCloseButton, { backgroundColor: '#79CB3A' }]}
              onPress={() => {
                setInviteModalVisible(false);
                navigation.navigate('FullMap', {
                  routeId: createdRouteId,  // Necesitas guardar esto en estado
                  isOngoing: true,
                  codeRoute: inviteCode,
                });
              }}
            >
              <Text style={styles.modalCloseText}>Iniciar Ruta</Text>
            </TouchableOpacity>
            <TouchableOpacity
            
              style={styles.modalCloseButton}
              onPress={() => setInviteModalVisible(false)}
            >
              <Text style={styles.modalCloseText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#0F9997',
  },
  input: {
    borderWidth: 1,
    borderColor: '#B2DFDB',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    marginBottom: 15,
    backgroundColor: '#F9F9F9',
  },
  button: {
    backgroundColor: '#FF5A00',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    elevation: 2,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    marginTop: 20,
    alignItems: 'center',
    backgroundColor: '#79CB3A',
    paddingVertical: 12,
    borderRadius: 10,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 25,
    borderRadius: 12,
    alignItems: 'center',
    width: '85%',
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0F9997',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalCodeLabel: {
    fontSize: 16,
    color: '#333',
  },
  modalCode: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FF5A00',
    marginVertical: 10,
  },
  copyButton: {
    backgroundColor: '#FF5A00',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 10,
  },
  copyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalCloseButton: {
    marginTop: 15,
    backgroundColor: '#0F9997',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  modalCloseText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

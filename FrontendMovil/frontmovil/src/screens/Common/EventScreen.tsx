// EventScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert,
  ScrollView, Modal, Platform,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/RootStack';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Event'>;
};

const rawUrl = Constants.expoConfig?.extra?.EXPO_PUBLIC_URL_BACKEND || '';
const backendUrl = Platform.OS === 'android' ? rawUrl.replace('localhost', '10.0.2.2') : rawUrl;

export default function EventScreen({ navigation }: Props) {
  const [selectedDate, setSelectedDate] = useState('');
  const [eventName, setEventName] = useState('');
  const [eventTime, setEventTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [eventDescription, setEventDescription] = useState('');
  const [markedDates, setMarkedDates] = useState({});
  const [eventsForSelectedDate, setEventsForSelectedDate] = useState([]);
  const [showEventModal, setShowEventModal] = useState(false);

  const [institutions, setInstitutions] = useState<{ [id: string]: { name: string, color: string } }>({});
  const [userCache, setUserCache] = useState<{ [id: string]: any }>({}); // cache de usuarios por id

  const API = `${backendUrl}/calendar-event`;

  const getToken = async () => {
    const token = await AsyncStorage.getItem('accessToken');
    if (!token) console.warn('No se encontró token');
    return token;
  };

  // Cargar todas las instituciones y crear el mapa id → { name, color }
  const loadInstitutions = async () => {
    const token = await getToken();
    if (!token) return;

    try {
      // Ojo: Si tienes auth de admin, cambia endpoint a uno público si es posible
      const res = await axios.get(`${backendUrl}/institution/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const arr = res.data.message || [];
      const map: { [id: string]: { name: string, color: string } } = {};
      arr.forEach((inst: any) => {
        map[inst._id] = { name: inst.name, color: inst.color };
      });
      setInstitutions(map);
    } catch (err) {
      console.error('Error al obtener instituciones:', err);
    }
  };

  // Cargar usuario por id y guardar en cache
  const getUserById = async (userId: string) => {
    if (userCache[userId]) return userCache[userId];

    const token = await getToken();
    if (!token) return null;
    try {
      const res = await axios.get(`${backendUrl}/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const user = res.data.message;
      setUserCache(prev => ({ ...prev, [userId]: user }));
      return user;
    } catch (err) {
      console.error('Error al obtener usuario:', err);
      return null;
    }
  };

  // Cargar eventos, usuarios autores y marcar fechas por color de institución
  const loadEvents = async () => {
    const token = await getToken();
    if (!token) return;

    try {
      const res = await axios.get(API, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const allEvents = Array.isArray(res.data) ? res.data : [];
      const marked: any = {};
      const userIdSet = new Set<string>();

      // 1. Junta todos los authorIDs únicos
      allEvents.forEach((event: any) => {
        if (event.author_id) userIdSet.add(event.author_id);
        else if (event.authorID) userIdSet.add(event.authorID); // según tu modelo
      });

      // 2. Carga todos los usuarios (solo los necesarios)
      const userArr = Array.from(userIdSet);
      const usersById: { [id: string]: any } = { ...userCache };

      await Promise.all(
        userArr.map(async (id) => {
          if (!usersById[id]) {
            const user = await getUserById(id);
            if (user) usersById[id] = user;
          }
        })
      );

      setUserCache(usersById); // Actualiza el cache global

      // 3. Marca las fechas usando el color de la institución del usuario autor
      allEvents.forEach((event: any) => {
        const date = new Date(event.date_start).toISOString().split('T')[0];
        const authorId = event.author_id || event.authorID;
        const user = usersById[authorId];
        let instId = user?.institution;
        let dotColor = institutions[instId]?.color || '#0F9997';

        // Por si aún no se ha cargado institutions, fallback por nombre
        if (!dotColor && user?.institution_name && institutions) {
          const instEntry = Object.values(institutions).find(inst => inst.name === user.institution_name);
          if (instEntry) dotColor = instEntry.color;
        }

        // MULTI-DOT: si hay varios eventos en una fecha, muestra varios dots
        if (marked[date]) {
          if (!marked[date].dots) {
            marked[date].dots = [{ color: marked[date].dotColor || '#0F9997' }];
          }
          if (!marked[date].dots.some((d: any) => d.color === dotColor)) {
            marked[date].dots.push({ color: dotColor });
          }
        } else {
          marked[date] = {
            marked: true,
            dotColor: dotColor,
            dots: [{ color: dotColor }]
          };
        }
      });

      // Si tienes seleccionada una fecha, márcala
      if (selectedDate) {
        marked[selectedDate] = {
          ...(marked[selectedDate] || {}),
          selected: true,
          selectedColor: '#000',
        };
      }

      setMarkedDates(marked);
    } catch (err) {
      console.error('Error al obtener eventos:', err);
    }
  };

  // Al seleccionar día, carga eventos del día
  const handleDatePress = async (day: any) => {
    const date = day.dateString;
    setSelectedDate(date);

    const token = await getToken();
    if (!token) return;

    try {
      const res = await axios.get(`${API}?date=${date}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEventsForSelectedDate(Array.isArray(res.data) ? res.data : []);
      setShowEventModal(true);
    } catch (err) {
      console.error('Error al obtener eventos del día:', err);
    }
  };

  // Crear evento (puedes agregar la institución si la necesitas en el modelo)
  const handleCreateEvent = async () => {
    if (!eventName || !selectedDate) {
      Alert.alert('Faltan datos', 'Debes ingresar nombre y fecha del evento.');
      return;
    }

    const token = await getToken();
    if (!token) return;

    try {
      await axios.post(
        API,
        {
          title: eventName,
          description: eventDescription,
          date_start: new Date(selectedDate),
          time_start: eventTime.toLocaleTimeString('es-CL', { hour12: false }),
          time_end: '',
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      Alert.alert('Evento creado');
      setEventName('');
      setEventDescription('');
      setSelectedDate('');
      await loadEvents();
    } catch (err) {
      console.error('Error al crear evento:', err.response?.data || err.message);
    }
  };

  useEffect(() => {
    (async () => {
      await loadInstitutions();
    })();
  }, []);

  useEffect(() => {
    (async () => {
      await loadEvents();
    })();
    // eslint-disable-next-line
  }, [selectedDate, institutions]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Calendario de Eventos</Text>

      <Calendar
        onDayPress={handleDatePress}
        markedDates={markedDates}
        markingType={'multi-dot'}
        style={styles.calendar}
      />

      <View style={styles.formSection}>
        <TextInput
          placeholder="Nombre del evento"
          value={eventName}
          onChangeText={setEventName}
          style={styles.input}
        />

        <TouchableOpacity onPress={() => setShowTimePicker(true)} style={styles.timeButton}>
          <Text style={styles.timeButtonText}>Seleccionar hora</Text>
        </TouchableOpacity>
        <Text style={styles.selectedTime}>Hora: {eventTime.toLocaleTimeString()}</Text>

        {showTimePicker && (
          <DateTimePicker
            value={eventTime}
            mode="time"
            is24Hour
            display="default"
            onChange={(event, selected) => {
              if (selected) setEventTime(selected);
              setShowTimePicker(false);
            }}
          />
        )}

        <TextInput
          placeholder="Descripción"
          value={eventDescription}
          onChangeText={setEventDescription}
          multiline
          numberOfLines={3}
          style={[styles.input, { height: 70 }]}
        />

        <TouchableOpacity style={styles.createButton} onPress={handleCreateEvent}>
          <Text style={styles.createButtonText}>Crear Evento</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={showEventModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowEventModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>📅 Eventos del {selectedDate}</Text>

            {eventsForSelectedDate.length > 0 ? (
              eventsForSelectedDate.map((event: any, index: number) => (
                <View key={index} style={styles.modalEventCard}>
                  <Text style={styles.eventTitle}>🎉 {event.title}</Text>
                  <Text style={styles.eventDetail}>🕒 <Text style={styles.bold}>{event.time_start}</Text></Text>
                  <Text style={styles.eventDetail}>📝 <Text style={styles.bold}>{event.description}</Text></Text>
                </View>
              ))
            ) : (
              <Text style={{ textAlign: 'center', color: '#777' }}>No hay eventos.</Text>
            )}

            <TouchableOpacity onPress={() => setShowEventModal(false)} style={styles.modalCloseButton}>
              <Text style={styles.modalCloseText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <TouchableOpacity
        onPress={() => navigation.navigate('Home')}
        style={styles.backButton}
      >
        <Text style={styles.backButtonText}>Volver al Home</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ...Tus estilos aquí...


const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#F0F4F8',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#0F9997',
    marginBottom: 20,
  },
  calendar: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
    elevation: 2,
    backgroundColor: '#fff',
  },
  formSection: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 30,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D0E8E6',
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
    backgroundColor: '#F9F9F9',
    fontSize: 16,
    color: '#333',
  },
  timeButton: {
    backgroundColor: '#0F9997',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  timeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  selectedTime: {
    marginBottom: 15,
    fontSize: 16,
    color: '#0F9997',
    fontWeight: '600',
    textAlign: 'center',
  },
  createButton: {
    backgroundColor: '#FF5A00',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  createButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  backButton: {
    alignSelf: 'center',
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 24,
    backgroundColor: '#79CB3A',
    borderRadius: 12,
    elevation: 3,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    padding: 22,
    borderRadius: 16,
    width: '88%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 6,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#0F9997',
  },
  modalEventCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#D0E8E6',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 2,
  },
  eventTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#0F9997',
  },
  eventDetail: {
    fontSize: 15,
    marginBottom: 4,
    color: '#333',
  },
  bold: {
    fontWeight: '600',
  },
  modalCloseButton: {
    backgroundColor: '#0F9997',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 12,
  },
  modalCloseText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

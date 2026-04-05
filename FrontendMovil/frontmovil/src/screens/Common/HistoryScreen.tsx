import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Platform,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Constants from 'expo-constants';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/RootStack';
import Icon from 'react-native-vector-icons/FontAwesome'; // <--- IMPORTANTE

const rawUrl = Constants.expoConfig?.extra?.EXPO_PUBLIC_URL_BACKEND || '';
const backendUrl = Platform.OS === 'android' ? rawUrl.replace('localhost', '10.0.2.2') : rawUrl;

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'History'>;

export default function HistoryScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'day' | 'week' | 'month' | 'all'>('all');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<any>(null);
  const [editedDescription, setEditedDescription] = useState('');
  const [editedStatus, setEditedStatus] = useState('');
  const [userId, setUserId] = useState('');
  const [role, setRole] = useState(''); // <--- GUARDAMOS ROL
  const [showOnlyMine, setShowOnlyMine] = useState(true);
  const [expandedRoutes, setExpandedRoutes] = useState<{ [key: string]: boolean }>({});
  const [helpPointsByRoute, setHelpPointsByRoute] = useState<{ [key: string]: any[] }>({});

  useEffect(() => {
    const init = async () => {
      const id = await AsyncStorage.getItem('userId');
      setUserId(id || '');
      // Cargamos el rol si está en AsyncStorage
      const userRole = await AsyncStorage.getItem('role');
      setRole(userRole || '');
      fetchRoutes();
    };
    init();
  }, []);

  const fetchRoutes = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const res = await axios.get(`${backendUrl}/route`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRoutes(res.data.message || []);
    } catch (error) {
      console.error('Error al obtener las rutas:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPeopleHelped = async (routeId: string) => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const res = await axios.get(`${backendUrl}/helping-point`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const filtered = res.data.message.filter(
        (point: any) => point.route_id === routeId
      );
      setHelpPointsByRoute(prev => ({ ...prev, [routeId]: filtered }));
    } catch (error) {
      console.error('Error al obtener personas ayudadas:', error);
    }
  };

  const applyFilter = () => {
    const now = new Date();

    const filtered = routes.filter((route: any) => {
      const routeDate = new Date(route.date_created);

      const dateMatch =
        filter === 'day'
          ? routeDate.toDateString() === now.toDateString()
          : filter === 'week'
          ? (() => {
              const oneWeekAgo = new Date(now);
              oneWeekAgo.setDate(now.getDate() - 7);
              return routeDate >= oneWeekAgo && routeDate <= now;
            })()
          : filter === 'month'
          ? routeDate.getMonth() === now.getMonth() &&
            routeDate.getFullYear() === now.getFullYear()
          : true;

      const isMine =
        !showOnlyMine || route.route_leader === userId || route.route_leader?._id === userId;

      return dateMatch && isMine;
    });

    return filtered.sort(
      (a: any, b: any) =>
        new Date(b.date_created).getTime() - new Date(a.date_created).getTime()
    );
  };

  const toggleExpand = (routeId: string) => {
    const alreadyExpanded = expandedRoutes[routeId];
    if (!alreadyExpanded && !helpPointsByRoute[routeId]) {
      fetchPeopleHelped(routeId);
    }
    setExpandedRoutes(prev => ({ ...prev, [routeId]: !alreadyExpanded }));
  };

  // --- ELIMINAR RUTA ---
  const handleDelete = async () => {
    if (!selectedRoute) return;
    try {
      const token = await AsyncStorage.getItem('accessToken');
      await axios.delete(`${backendUrl}/route/${selectedRoute._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDeleteModalVisible(false);
      setSelectedRoute(null);
      await fetchRoutes();
      Alert.alert('Ruta eliminada correctamente');
    } catch (error: any) {
      setDeleteModalVisible(false);
      setSelectedRoute(null);
      Alert.alert('Error al eliminar ruta', error?.response?.data?.error || 'Inténtalo nuevamente');
    }
  };

  const handleSave = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      await axios.put(
        `${backendUrl}/route/${selectedRoute._id}`,
        {
          description: editedDescription,
          status: editedStatus,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setEditModalVisible(false);
      setSelectedRoute(null);
      await fetchRoutes();
      Alert.alert('Ruta editada correctamente');
    } catch (error) {
      setEditModalVisible(false);
      setSelectedRoute(null);
      Alert.alert('Error al editar la ruta');
    }
  };
  // --- ITEM CON BOTÓN BASURERO ---
  const renderItem = ({ item }: any) => (
    <View style={styles.routeItem}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={styles.description}>📍 {item.description}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {/* --- BOTÓN BASURERO SIEMPRE VISIBLE, o SOLO SI ADMIN --- */}
          <TouchableOpacity
            onPress={() => {
              setSelectedRoute(item);
              setDeleteModalVisible(true);
            }}
            style={{ paddingHorizontal: 8 }}
          >
            <Icon name="trash" size={22} color="#FF5A00" />
          </TouchableOpacity>
          {/* Si también quieres dejar la edición, puedes dejar el lápiz aquí
          <TouchableOpacity
            onPress={() => {
              setSelectedRoute(item);
              setEditedDescription(item.description);
              setEditedStatus(item.status);
              setEditModalVisible(true);
            }}
            style={{ paddingHorizontal: 8 }}
          >
            <Icon name="edit" size={22} color="#0F9997" />
          </TouchableOpacity>
          */}
        </View>
      </View>
      <Text style={styles.detail}>
        Fecha: {new Date(item.date_created).toLocaleString()}
      </Text>
      <Text style={styles.detail}>Código: {item.invite_code || 'N/A'}</Text>
      <Text style={styles.detail}>Estado: {item.status}</Text>

      {/* 🔽 FLECHA PARA EXPANDIR / COLAPSAR */}
      <TouchableOpacity onPress={() => toggleExpand(item._id)}>
        <Text style={{ color: '#4682B4', marginTop: 5 }}>
          {expandedRoutes[item._id] ? '▲ Ocultar personas registradas' : '▼ Ver personas registradas'}
        </Text>
      </TouchableOpacity>

      {/* 👥 PERSONAS REGISTRADAS */}
      {expandedRoutes[item._id] && helpPointsByRoute[item._id]?.length > 0 && (
        <View style={{ marginTop: 10 }}>
          {helpPointsByRoute[item._id].map((point, index) => (
            <View key={index} style={{ paddingLeft: 10, marginBottom: 5 }}>
              <Text style={{ fontSize: 13 }}>👤 Edad: {point.people_helped.age} | Género: {point.people_helped.gender}</Text>
              <Text style={{ fontSize: 12, color: '#666' }}>
                Fecha: {new Date(point.date_register).toLocaleString()}
              </Text>
            </View>
          ))}
        </View>
      )}

      {expandedRoutes[item._id] && helpPointsByRoute[item._id]?.length === 0 && (
        <Text style={{ fontSize: 13, fontStyle: 'italic', color: '#999', marginTop: 5 }}>
          No hay personas registradas en esta ruta.
        </Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Historial de Rutas</Text>

      <View style={styles.filterContainer}>
        {['day', 'week', 'month', 'all'].map((option) => (
          <TouchableOpacity
            key={option}
            style={[styles.filterButton, filter === option && styles.filterButtonActive]}
            onPress={() => setFilter(option as any)}
          >
            <Text style={{ color: filter === option ? '#fff' : '#000' }}>
              {option === 'day'
                ? 'Hoy'
                : option === 'week'
                ? 'Esta semana'
                : option === 'month'
                ? 'Este mes'
                : 'Todas'}
            </Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={[styles.filterButton, showOnlyMine && styles.filterButtonActive]}
          onPress={() => setShowOnlyMine(!showOnlyMine)}
        >
          <Text style={{ color: showOnlyMine ? '#fff' : '#000' }}>
            Mis rutas
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#000" />
      ) : (
        <FlatList
          data={applyFilter()}
          keyExtractor={(item: any) => item._id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}

      <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Home')}>
        <Text style={styles.backText}>Volver al Inicio</Text>
      </TouchableOpacity>

      {/* MODAL DE CONFIRMACIÓN DE ELIMINAR */}
      <Modal visible={deleteModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>¿Seguro que deseas eliminar esta ruta?</Text>
            <Text style={{ color: '#555', marginBottom: 18 }}>{selectedRoute?.description}</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={handleDelete}>
                <Text style={styles.saveButton}>Eliminar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setDeleteModalVisible(false)}>
                <Text style={styles.cancelButton}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de edición, si quieres mantenerlo */}
      {selectedRoute && (
        <Modal visible={editModalVisible} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Editar Ruta</Text>
              <TextInput
                style={styles.input}
                value={editedDescription}
                onChangeText={setEditedDescription}
                placeholder="Descripción"
              />
              <TextInput
                style={styles.input}
                value={editedStatus}
                onChangeText={setEditedStatus}
                placeholder="Estado"
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity onPress={handleSave}>
                  <Text style={styles.saveButton}>Guardar</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                  <Text style={styles.cancelButton}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#0F9997',
    marginBottom: 20,
    textAlign: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  filterButton: {
    borderWidth: 1,
    borderColor: '#0F9997',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    margin: 4,
    backgroundColor: '#fff',
  },
  filterButtonActive: {
    backgroundColor: '#0F9997',
    borderColor: '#0F9997',
  },
  routeItem: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: '#f5f5f5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  description: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  detail: {
    fontSize: 14,
    color: '#555',
  },
  options: {
    fontSize: 24,
    paddingHorizontal: 10,
    color: '#888',
  },
  backButton: {
    marginTop: 10,
    alignItems: 'center',
    padding: 10,
  },
  backText: {
    fontSize: 16,
    color: '#0F9997',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    width: '85%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0F9997',
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
    marginVertical: 8,
    fontSize: 14,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  saveButton: {
    backgroundColor: '#79CB3A',
    color: 'white',
    fontWeight: 'bold',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  cancelButton: {
    backgroundColor: '#FF5A00',
    color: 'white',
    fontWeight: 'bold',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
});

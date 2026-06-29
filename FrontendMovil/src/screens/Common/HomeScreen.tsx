import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
  Modal,
  TextInput,
  Alert as RNAlert,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/RootStack';
import { useFocusEffect } from '@react-navigation/native';
import { Role } from '../../config/roles';
import HomeMapSection from './Home/HomeMapSection';
import NotificationsModal from './Home/NotificationsModal';
import HomeMainActions from './Home/HomeMainActions';
import { HelpPointService, NoticeService, RiskService, RouteService, UserService } from '../../api/services';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

type RiskMarker = {
  latitude: number;
  longitude: number;
  description: string;
  date?: string;
  id?: string;
};

type HelpMarker = {
  latitude: number;
  longitude: number;
  name?: string;
  age?: number;
  gender?: string;
  date?: string;
  id?: string;
};

export default function HomeScreen({ navigation }: Props) {
  // Estados principales
  const [menuVisible, setMenuVisible] = useState(false);
  const [alertText, setAlertText] = useState('');
  const [alertLog, setAlertLog] = useState<string[]>([]);
  const [alertModalVisible, setAlertModalVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(-screenWidth)).current;
  const [userRole, setUserRole] = useState<string | null>(null);
  const [riskMarkers, setRiskMarkers] = useState<RiskMarker[]>([]);
  const [helpMarkers, setHelpMarkers] = useState<HelpMarker[]>([]);
  const [joinRouteVisible, setJoinRouteVisible] = useState(false);
  const [invitationCode, setInvitationCode] = useState('');

  // Notificaciones
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState<any[]>([]);
  const [showNotificationModal, setShowNotificationModal] = useState(false);

  // --- Animación de menú lateral ---
  const toggleMenu = () => {
    const toValue = menuVisible ? -screenWidth : 0;
    setMenuVisible(!menuVisible);
    Animated.timing(slideAnim, {
      toValue,
      duration: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  };

  // --- Funciones para traer datos ---
  // Alertas
  const fetchAlerts = async () => {
    try {
      const alertsArray = await NoticeService.all();
      const userName = await AsyncStorage.getItem('userName');
      const formatted = alertsArray.map((a: any) => `${userName || 'Usuario'}: ${a.description}`);
      setAlertLog(formatted.reverse());
    } catch (err) {
      console.error('Error al obtener alertas:', err);
    }
  };

  const getUserNamesByIds = async (ids: string[]) => {
    const uniqueIds = [...new Set(ids.filter(Boolean))];
    if (uniqueIds.length === 0) return {};
    try {
      const users = await UserService.batch(uniqueIds);
      return users.reduce((acc, user) => {
        const id = user?._id || user?.id;
        if (id) acc[id] = user.name || 'Desconocido';
        return acc;
      }, {} as Record<string, string>);
    } catch (err) {
      console.error('Error al obtener autores por lote:', err);
      return {};
    }
  };

  const getAuthorIdString = (id: any): string | undefined => {
    if (!id) return undefined;
    if (typeof id === "string") return id;
    if (typeof id === "object" && id.$oid) return id.$oid;
    return undefined;
  };

  const handleRiskDeleted = (id) => {
    setRiskMarkers(risks => risks.filter(r => r.id !== id));
    // No llames a fetchRisks() aquí
  };

  // Notificaciones
  const fetchAllNotifications = async () => {
    try {
      const [notificationsArr, unreadArr] = await Promise.all([
        NoticeService.all(),
        NoticeService.unread(),
      ]);

      const authorIds = [...new Set(notificationsArr.map(n => getAuthorIdString(n.author_id)).filter(Boolean))] as string[];
      const idToName = await getUserNamesByIds(authorIds);

      const notificationsWithNames = notificationsArr.map((n: any) => ({
        ...n,
        author_name: idToName[getAuthorIdString(n.author_id)] || 'Desconocido'
      }));

      const unreadWithNames = unreadArr.map((n: any) => ({
        ...n,
        author_name: idToName[getAuthorIdString(n.author_id)] || 'Desconocido'
      }));

      // Ordena por fecha descendente
      const sortedNotifications = [...notificationsWithNames].sort((a, b) => {
        if (!a.created_at) return 1;
        if (!b.created_at) return -1;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });

      setNotifications(sortedNotifications);
      setUnreadNotifications(unreadWithNames);
    } catch (err) {
      console.error('Error al obtener notificaciones:', err);
    }
  };

  // Marcar todas como leídas
  const markAllNotificationsAsRead = async () => {
    await Promise.all(
      unreadNotifications.map(async (n) => {
        try {
          await NoticeService.markRead(n._id);
        } catch (err) {
          console.error('Error al marcar aviso como leído:', err);
          RNAlert.alert('Error', 'No se pudo marcar un aviso como leído.');
        }
      })
    );
    await fetchAllNotifications();
  };

  // Riesgos
  const fetchRisks = async () => {
  try {
    const risksArray = await RiskService.all();
    const formatted = risksArray.map((r: any) => ({
      latitude: r.coords[0],
      longitude: r.coords[1],
      description: r.description || 'Riesgo sin descripción',
      date: r.date_register,
      id: r._id,
    }));
    setRiskMarkers(formatted);
  } catch (err) {
    console.error('Error al obtener riesgos:', err);
  }
};

  // Puntos de ayuda
  const fetchHelpPoints = async () => {
  try {
    const helpArray = await HelpPointService.all();
    const formatted = helpArray.map((h: any) => ({
      latitude: h.coords[0],
      longitude: h.coords[1],
      name: h.people_helped?.name ?? '',
      age: h.people_helped?.age ?? 0,
      gender: h.people_helped?.gender ?? '',
      date: h.people_helped?.date,           // <- la fecha del punto de ayuda
      id: h._id,                             // <- el ID del punto de ayuda
    }));
    setHelpMarkers(formatted);
  } catch (err) {
    console.error('Error al obtener puntos de ayuda:', err);
  }
};

  // --- Efectos y focus ---
  useFocusEffect(
  React.useCallback(() => {
    const fetchInitialData = async () => {
      const role = await AsyncStorage.getItem('userRole');
      setUserRole(role);
      fetchAllNotifications();
      fetchAlerts();
      fetchRisks();
      fetchHelpPoints();
    };
    fetchInitialData();
  }, [])
);

  // --- Acciones ---
  const handleSendAlert = async () => {
    if (alertText.trim().length < 10) {
      RNAlert.alert('Aviso demasiado corto', 'Escribe al menos 10 caracteres.');
      return;
    }
    try {
      await NoticeService.create({
        description: alertText,
        send_email: false,
        send_to_all: false,
      });
      setAlertText('');
      setAlertModalVisible(false);
      RNAlert.alert('Aviso enviado');
      await fetchAllNotifications();
    } catch {
      RNAlert.alert('Error', 'No se pudo enviar el aviso');
    }
  };

  // Opciones de menú lateral
  const menuOptions = [
    { label: 'Perfil', route: 'Profile' },
    { label: 'Eventos', route: 'Event' },
    { label: 'Rutas', route: 'Route' },
    { label: 'Historial', route: 'History' },
     ...(userRole === Role.Admin ? [{ label: 'Usuarios', route: 'Users' }] : []),
  ];

  const handleNavigate = (route: keyof RootStackParamList) => {
    toggleMenu();
    navigation.navigate(route);
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('accessToken');
    toggleMenu();
    navigation.reset({ index: 0, routes: [{ name: 'Initial' }] });
  };

  // --- Render ---
  return (
    <View style={styles.container}>
      {/* Overlay menú lateral */}
      {menuVisible && (
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={toggleMenu}>
          <View />
        </TouchableOpacity>
      )}

      {/* Menú lateral */}
      <Animated.View style={[styles.sidebar, { left: slideAnim }]}>
        {menuOptions.map((option) => (
          <TouchableOpacity
            key={option.route}
            style={styles.menuItem}
            onPress={() => handleNavigate(option.route as keyof RootStackParamList)}
          >
            <Text style={styles.menuItemText}>{option.label}</Text>
          </TouchableOpacity>
        ))}
        <View style={styles.separator} />
        <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
          <Text style={[styles.menuItemText, { color: 'red' }]}>Cerrar sesión</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Botón menú */}
      <TouchableOpacity style={styles.menuIconContainer} onPress={toggleMenu}>
        <Icon name="bars" size={24} color="#000" />
      </TouchableOpacity>

      {/* Campanita notificaciones */}
      <TouchableOpacity
        style={{ position: 'absolute', top: 40, right: 20, zIndex: 30 }}
        onPress={() => setShowNotificationModal(true)}
      >
        <Icon name="bell" size={28} color="#0F9997" />
        {unreadNotifications.length > 0 && (
          <View
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              backgroundColor: 'red',
              borderRadius: 9,
              width: 18,
              height: 18,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#fff', fontSize: 12 }}>
              {unreadNotifications.length}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      <HomeMainActions
        styles={styles}
        onJoinRoute={() => setJoinRouteVisible(true)}
        onOpenAlerts={() => setAlertModalVisible(true)}
      />

      <HomeMapSection
        style={styles.mapWrapper}
        riskMarkers={riskMarkers}
        helpMarkers={helpMarkers}
        onRiskDeleted={handleRiskDeleted}
      />

      <NotificationsModal
        visible={showNotificationModal}
        notifications={notifications}
        unreadNotifications={unreadNotifications}
        styles={styles}
        onClose={() => setShowNotificationModal(false)}
        onRefresh={fetchAllNotifications}
        onMarkAllRead={markAllNotificationsAsRead}
      />

      {/* Modal avisos */}
      <Modal visible={alertModalVisible} animationType="slide">
        <ScrollView contentContainerStyle={styles.alertModalContainer}>
          <Text style={styles.alertTitle}>Enviar Aviso</Text>
          <View style={styles.alertLog}>
            {alertLog.map((msg, i) => (
              <Text key={i} style={styles.alertMsg}>{msg}</Text>
            ))}
          </View>
          <TextInput
            style={styles.alertInput}
            placeholder="Escribe un aviso importante..."
            multiline
            numberOfLines={4}
            value={alertText}
            onChangeText={setAlertText}
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSendAlert}>
            <Text style={styles.sendButtonText}>Enviar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={() => setAlertModalVisible(false)}>
            <Text style={styles.cancelButtonText}>Cerrar</Text>
          </TouchableOpacity>
        </ScrollView>
      </Modal>

      {/* Modal unirse ruta */}
      <Modal visible={joinRouteVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.alertTitle}>Unirse a una Ruta</Text>
            <TextInput
              style={styles.alertInput}
              placeholder="Código de invitación"
              value={invitationCode}
              onChangeText={setInvitationCode}
            />
            <TouchableOpacity
              style={styles.sendButton}
              onPress={async () => {
                try {
                  const route = await RouteService.byCode(invitationCode);
                  if (route) {
                    setJoinRouteVisible(false);
                    setInvitationCode('');
                    navigation.navigate('FullMap', { routeId: route._id, codeRoute: route.codeRoute, isOngoing: route.isOngoing });
                  } else {
                    RNAlert.alert('Error', 'Código inválido o ruta no encontrada');
                  }
                } catch {
                  RNAlert.alert('Error', 'No se pudo encontrar la ruta');
                }
              }}
            >
              <Text style={styles.sendButtonText}>Unirse</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setJoinRouteVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ---- ESTILOS ----
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    justifyContent: 'flex-end',
  },
  menuIconContainer: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 30,
    backgroundColor: '#0F9997',
    padding: 10,
    borderRadius: 30,
    elevation: 6,
  },
  alertToggleButton: {
    backgroundColor: '#FF5A00',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  alertToggleButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  alertModalContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  alertTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0F9997',
    marginBottom: 15,
    textAlign: 'center',
  },
  alertInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    minHeight: 80,
    backgroundColor: '#f4f4f4',
    marginTop: 10,
  },
  sendButton: {
    backgroundColor: '#79CB3A',
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 15,
    alignItems: 'center',
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelButton: {
    marginTop: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#0F9997',
    fontSize: 16,
    fontWeight: 'bold',
  },
  mapWrapper: {
    height: screenHeight * 0.72,
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    elevation: 2,
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 250,
    backgroundColor: '#E0F2F1',
    paddingTop: 80,
    paddingHorizontal: 20,
    zIndex: 20,
    elevation: 6,
  },
  menuItem: {
    paddingVertical: 15,
  },
  menuItemText: {
    fontSize: 18,
    color: '#004D40',
    fontWeight: '500',
  },
  separator: {
    height: 1,
    backgroundColor: '#bbb',
    marginVertical: 10,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    padding: 20,
  },
  modalBox: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    width: '90%',
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    alignItems: 'center',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 10,
  },
  alertLog: {
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  alertMsg: {
    backgroundColor: '#E3F2FD',
    borderRadius: 10,
    padding: 10,
    marginVertical: 4,
    color: '#0F4C81',
    fontSize: 14,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 1,
  },
  notificationItem: {
    borderRadius: 10,
    padding: 12,
    marginVertical: 5,
    backgroundColor: "#F2F8FD",
    elevation: 1,
  }
});

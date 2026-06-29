import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/RootStack';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Picker } from '@react-native-picker/picker';
import { Role } from '../../config/roles';
import { InstitutionService, UserService } from '../../api/services';
import { apiClient } from '../../api/client';

const primaryColor = '#2B7A78';
const secondaryColor = '#3AAFA9';
const textColor = '#17252A';
const backgroundColor = '#DEF2F1';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Users'>;
};

type Institution = {
  _id: string;
  name: string;
};

export default function UsersScreen({ navigation }: Props) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [registerModalVisible, setRegisterModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(Role.Volunteer);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [selectedInstitution, setSelectedInstitution] = useState('');

  const fetchUsers = async () => {
  try {
    const usersResponse = await UserService.all();
    // Ordena por nombre alfabéticamente, ignorando mayúsculas/minúsculas
    const sortedUsers = usersResponse.sort((a, b) =>
      a.name?.toLowerCase().localeCompare(b.name?.toLowerCase())
    );
    setUsers(sortedUsers);
  } catch (err) {
    console.error('Error al cargar usuarios:', err);
    Alert.alert('Error', 'No se pudieron cargar los usuarios');
  } finally {
    setLoading(false);
  }
};

  const fetchInstitutions = async () => {
    try {
      setInstitutions(await InstitutionService.all());
    } catch {
      Alert.alert('Error al cargar instituciones');
    }
  };

  const handleRegisterUser = async () => {
  // Validaciones front
  if (!email || !password || !name || !phone || !selectedInstitution || !role) {
    Alert.alert('Faltan datos');
    return;
  }
  if (password.length < 8) {
    Alert.alert('La contraseña debe tener al menos 8 caracteres');
    return;
  }

  try {
    await UserService.createByAdmin({
      name,
      email,
      password,
      phone,
      institutionID: selectedInstitution,
      role,
    });

    Alert.alert('Usuario registrado correctamente');
    setRegisterModalVisible(false);
    setName('');
    setEmail('');
    setPhone('');
    setPassword('');
    setSelectedInstitution('');
    setRole(Role.Volunteer);
    fetchUsers();
  } catch (err: any) {
    // Si es error de email duplicado, muestra mensaje especial
    if (err.response && err.response.data && err.response.data.error && 
        err.response.data.error.toLowerCase().includes('existe')) {
      Alert.alert('El correo ya está registrado');
    } else {
      Alert.alert('Error al registrar usuario');
    }
    // No cierres el modal aquí
  }
};

  const handleDownloadExcel = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const fileUri = FileSystem.documentDirectory + 'people_helped.xlsx';

      const downloadResumable = FileSystem.createDownloadResumable(
        `${apiClient.defaults.baseURL}/export-data/people-helped`,
        fileUri,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const { uri } = await downloadResumable.downloadAsync();

      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert('Compartir no disponible en este dispositivo');
        return;
      }

      await Sharing.shareAsync(uri);
    } catch (error) {
      console.error('❌ Error al descargar el Excel:', error);
      Alert.alert('Error al descargar el Excel');
    }
  };

  useEffect(() => {
  fetchUsers();
  fetchInstitutions();
}, []);

  const renderItem = ({ item }: { item: any }) => {
    if (!item.name && !item.email && !item.phone) return null;
    return (
      <View style={styles.userCard}>
        <Text style={styles.name}>{item.name || 'Sin nombre'}</Text>
        <Text style={styles.email}>{item.email || 'Sin correo'}</Text>
        <Text style={styles.phone}>{item.phone || 'Sin teléfono'}</Text>
        <Text style={styles.date}>Registrado: {new Date(item.date_register).toLocaleDateString()}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Usuarios Registrados</Text>
      {loading ? (
        <ActivityIndicator size="large" color={primaryColor} />
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
        />
      )}

      <TouchableOpacity style={styles.homeButton} onPress={() => navigation.navigate('Home')}>
        <Text style={styles.homeButtonText}>Volver al Home</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.downloadButton} onPress={handleDownloadExcel}>
        <Text style={styles.downloadButtonText}>Descargar datos</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.fabButton} onPress={() => setRegisterModalVisible(true)}>
        <Icon name="plus" size={24} color="#fff" />
      </TouchableOpacity>

      <Modal visible={registerModalVisible} animationType="slide">
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nuevo Usuario</Text>

            <TextInput
              style={styles.input}
              placeholder="Nombre"
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={styles.input}
              placeholder="Correo"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Teléfono"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
            <TextInput
              style={styles.input}
              placeholder="Contraseña"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            {/* Picker de Institución */}
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedInstitution}
                onValueChange={(itemValue) => setSelectedInstitution(itemValue)}
                style={styles.picker}
                prompt="Selecciona institución"
              >
                <Picker.Item label="Selecciona institución..." value="" />
                {institutions.map((inst) => (
                  <Picker.Item key={inst._id} label={inst.name} value={inst._id} />
                ))}
              </Picker>
            </View>

            {/* Picker de Rol */}
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={role}
                onValueChange={(itemValue) => setRole(itemValue)}
                style={styles.picker}
                prompt="Selecciona rol"
              >
                <Picker.Item label="Voluntario" value={Role.Volunteer} />
                <Picker.Item label="Admin" value={Role.Admin} />
              </Picker>
            </View>

            <TouchableOpacity style={styles.sendButton} onPress={handleRegisterUser}>
              <Text style={styles.sendButtonText}>Registrar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelButton} onPress={() => setRegisterModalVisible(false)}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
    backgroundColor,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: textColor,
  },
  userCard: {
    padding: 15,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    marginBottom: 15,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: textColor,
  },
  email: {
    fontSize: 14,
    color: '#666',
  },
  phone: {
    fontSize: 14,
    color: '#666',
  },
  date: {
    fontSize: 12,
    color: '#999',
  },
  homeButton: {
    marginTop: 20,
    marginBottom: 30,
    alignSelf: 'center',
  },
  homeButtonText: {
    fontSize: 16,
    color: primaryColor,
    fontWeight: 'bold',
  },
  downloadButton: {
    backgroundColor: secondaryColor,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 10,
  },
  downloadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  fabButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: primaryColor,
    width: 55,
    height: 55,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },
  modalContent: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: textColor,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  sendButton: {
    backgroundColor: primaryColor,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    marginTop: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: secondaryColor,
    fontSize: 16,
    fontWeight: 'bold',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    marginBottom: 15,
    backgroundColor: '#fff',
    overflow: 'hidden'
  },
  picker: {
    height: 50,
    width: '100%',
  },
});

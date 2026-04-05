import React, { useRef, useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, Modal, Platform, ActivityIndicator, Alert } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region, Circle } from 'react-native-maps';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Constants from 'expo-constants';
import * as Location from 'expo-location'; 

const rawUrl = Constants.expoConfig?.extra?.EXPO_PUBLIC_URL_BACKEND || '';
const backendUrl = Platform.OS === 'android' ? rawUrl.replace('localhost', '10.0.2.2') : rawUrl;

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
  date?: string; // ISO string
  id?: string;
};

type Props = {
  riskMarkers?: RiskMarker[];
  helpMarkers?: HelpMarker[];
  onMapPress?: (coord: { latitude: number; longitude: number }) => void;
  onRiskDeleted?: (id: string) => void;
  onHelpDeleted?: (id: string) => void;
};

export default function MapComponent({
  riskMarkers = [],
  helpMarkers = [],
  onMapPress,
  onRiskDeleted,  
  onHelpDeleted,  
}: Props) {

  const defaultRegion: Region = {
    latitude: -29.9533,
    longitude: -71.3391,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  const mapRef = useRef<MapView>(null);
  const [selectedHelp, setSelectedHelp] = useState<HelpMarker | null>(null);
  const [selectedRisk, setSelectedRisk] = useState<RiskMarker | null>(null);
  const [region, setRegion] = useState<Region | null>(null);
  const [locationLoading, setLocationLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLocationLoading(true);
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setRegion(defaultRegion);
        setLocationLoading(false);
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
      setLocationLoading(false);
    })();
  }, []);

  const handleZoom = (zoomIn: boolean) => {
    if (!region) return;
    const factor = zoomIn ? 0.5 : 2;
    const newRegion: Region = {
      ...region,
      latitudeDelta: region.latitudeDelta * factor,
      longitudeDelta: region.longitudeDelta * factor,
    };
    setRegion(newRegion);
    mapRef.current?.animateToRegion(newRegion, 300);
  };

  if (locationLoading || !region) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#0F9997" />
        <Text>Obteniendo ubicación actual...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        region={region}
        onRegionChangeComplete={setRegion}
        zoomEnabled
        scrollEnabled
        showsUserLocation
        showsMyLocationButton
        onPress={e => {
          if (onMapPress) onMapPress(e.nativeEvent.coordinate);
        }}
      >
        {riskMarkers.map((risk, index) => (
          <React.Fragment key={`risk-${index}`}>
            <Marker
              coordinate={{
                latitude: risk.latitude,
                longitude: risk.longitude,
              }}
              pinColor="red"
              title="Riesgo"
              description={risk.description}
              onPress={() => setSelectedRisk(risk)}
            />
            <Circle
              center={{
                latitude: risk.latitude,
                longitude: risk.longitude,
              }}
              radius={80}
              strokeColor="rgba(255, 0, 0, 0.6)"
              fillColor="rgba(255, 0, 0, 0.2)"
            />
          </React.Fragment>
        ))}

        {helpMarkers.map((help, index) => (
          <React.Fragment key={`help-${index}`}>
            <Marker
              coordinate={{
                latitude: help.latitude,
                longitude: help.longitude,
              }}
              pinColor="lightgreen"
              onPress={() => setSelectedHelp(help)}
            />
            <Circle
              center={{
                latitude: help.latitude,
                longitude: help.longitude,
              }}
              radius={80}
              strokeColor="rgba(0, 255, 0, 0.6)"
              fillColor="rgba(0, 255, 0, 0.2)"
            />
          </React.Fragment>
        ))}
      </MapView>

      {/* Controles de zoom */}
      <View style={styles.zoomControls}>
        <TouchableOpacity style={styles.zoomButton} onPress={() => handleZoom(true)}>
          <Text style={styles.zoomText}>＋</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.zoomButton} onPress={() => handleZoom(false)}>
          <Text style={styles.zoomText}>−</Text>
        </TouchableOpacity>
      </View>

      {/* Modal Punto de Ayuda */}
      <Modal
        visible={!!selectedHelp}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedHelp(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={styles.modalTitle}>🆘 Punto de Ayuda</Text>
              {selectedHelp?.id && (
                <TouchableOpacity
                  onPress={async () => {
                    Alert.alert(
                      '¿Eliminar punto de ayuda?',
                      'Esta acción no se puede deshacer',
                      [
                        { text: 'Cancelar', style: 'cancel' },
                        {
                          text: 'Eliminar',
                          style: 'destructive',
                          onPress: async () => {
                            try {
                              const token = await AsyncStorage.getItem('accessToken');
                              await axios.delete(`${backendUrl}/helping-point/${selectedHelp.id}`, {
                                headers: { Authorization: `Bearer ${token}` }
                              });
                              setSelectedHelp(null);
                              if (typeof onHelpDeleted === 'function') onHelpDeleted(selectedHelp.id);
                            } catch (err) {
                              Alert.alert('Error al borrar', 'No se pudo eliminar el punto de ayuda');
                            }
                          }
                        }
                      ]
                    );
                  }}
                  style={{ padding: 8 }}
                >
                  <Text style={{ fontSize: 24, color: '#888' }}>⋮</Text>
                </TouchableOpacity>
              )}
            </View>
            {selectedHelp?.name && <Text>👤 Nombre: {selectedHelp.name}</Text>}
            {selectedHelp?.age !== undefined && <Text>🎂 Edad: {selectedHelp.age}</Text>}
            {selectedHelp?.gender && <Text>🚻 Género: {selectedHelp.gender}</Text>}
            {selectedHelp?.date && <Text>📅 Fecha: {new Date(selectedHelp.date).toLocaleString()}</Text>}
            <TouchableOpacity onPress={() => setSelectedHelp(null)} style={styles.modalClose}>
              <Text style={{ color: 'white' }}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal Riesgo */}
      <Modal
        visible={!!selectedRisk}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedRisk(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
              <Text style={styles.modalTitle}>⚠️ Riesgo</Text>
              {selectedRisk?.id && (
                <TouchableOpacity
                  onPress={async () => {
                    Alert.alert(
                      '¿Eliminar riesgo?',
                      'Esta acción no se puede deshacer',
                      [
                        {text: 'Cancelar', style: 'cancel'},
                        {
                          text: 'Eliminar',
                          style: 'destructive',
                          onPress: async () => {
                            try {
                              const token = await AsyncStorage.getItem('accessToken');
                              await axios.delete(`${backendUrl}/risk/${selectedRisk.id}`, {
                                headers: { Authorization: `Bearer ${token}` }
                              });
                              setSelectedRisk(null);
                              if (typeof onRiskDeleted === 'function') onRiskDeleted(selectedRisk.id);
                            } catch (err) {
                              Alert.alert('Error al borrar', 'No se pudo eliminar el riesgo');
                            }
                          }
                        }
                      ]
                    );
                  }}
                  style={{padding: 8}}
                >
                  <Text style={{fontSize: 24, color: '#888'}}>⋮</Text>
                </TouchableOpacity>
              )}
            </View>
            {selectedRisk?.description && <Text>📝 Descripción: {selectedRisk.description}</Text>}
            {selectedRisk?.date && (
              <Text>📅 Fecha: {new Date(selectedRisk.date).toLocaleString()}</Text>
            )}
            <TouchableOpacity onPress={() => setSelectedRisk(null)} style={styles.modalClose}>
              <Text style={{ color: 'white' }}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    borderRadius: 10,
    overflow: 'hidden',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  zoomControls: {
    position: 'absolute',
    right: 10,
    bottom: 20,
    flexDirection: 'column',
  },
  zoomButton: {
    backgroundColor: '#fff',
    borderRadius: 25,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  zoomText: {
    fontSize: 24,
    color: '#000',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalClose: {
    marginTop: 20,
    backgroundColor: '#333',
    padding: 10,
    alignItems: 'center',
    borderRadius: 5,
  },
});

import React from 'react';
import { Text, TouchableOpacity } from 'react-native';

type Props = {
  styles: any;
  onJoinRoute: () => void;
  onOpenAlerts: () => void;
};

export default function HomeMainActions({ styles, onJoinRoute, onOpenAlerts }: Props) {
  return (
    <>
      <TouchableOpacity style={[styles.alertToggleButton, { backgroundColor: '#4682B4' }]} onPress={onJoinRoute}>
        <Text style={styles.alertToggleButtonText}>Unirse a Ruta</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.alertToggleButton} onPress={onOpenAlerts}>
        <Text style={styles.alertToggleButtonText}>Abrir Avisos</Text>
      </TouchableOpacity>
    </>
  );
}

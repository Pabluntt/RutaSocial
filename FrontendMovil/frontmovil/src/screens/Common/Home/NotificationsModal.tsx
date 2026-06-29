import React from 'react';
import { Alert as RNAlert, Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { backendUrl } from '../../../config/api';

type Props = {
  visible: boolean;
  notifications: any[];
  unreadNotifications: any[];
  styles: any;
  onClose: () => void;
  onRefresh: () => Promise<void>;
  onMarkAllRead: () => Promise<void>;
};

export default function NotificationsModal({
  visible,
  notifications,
  unreadNotifications,
  styles,
  onClose,
  onRefresh,
  onMarkAllRead,
}: Props) {
  return (
    <Modal visible={visible} animationType="slide">
      <ScrollView contentContainerStyle={{ padding: 20, backgroundColor: '#fff' }}>
        <Text style={styles.alertTitle}>Avisos</Text>
        {notifications.map((notification) => {
          const isUnread = unreadNotifications.find((unread) => unread._id === notification._id);
          return (
            <TouchableOpacity
              key={notification._id}
              style={[styles.notificationItem, isUnread && { backgroundColor: '#FFEDD5' }]}
              onPress={async () => {
                if (!isUnread) return;
                try {
                  const token = await AsyncStorage.getItem('accessToken');
                  await axios.put(`${backendUrl}/notification/read/${notification._id}`, {}, {
                    headers: { Authorization: `Bearer ${token}` },
                  });
                  await onRefresh();
                } catch (err) {
                  console.error('Error al marcar aviso como leído:', err);
                  RNAlert.alert('Error', 'No se pudo marcar el aviso como leído.');
                }
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontWeight: 'bold' }}>{notification.author_name || 'Autor'}</Text>
                <Text style={{ fontSize: 12, color: '#888' }}>{new Date(notification.created_at).toLocaleString()}</Text>
              </View>
              <Text style={{ fontSize: 15, color: '#333' }}>{notification.description}</Text>
              {isUnread && <Text style={{ color: '#E74C3C', fontSize: 12 }}>No leído</Text>}
            </TouchableOpacity>
          );
        })}
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={async () => {
            await onMarkAllRead();
            onClose();
          }}
        >
          <Text style={styles.cancelButtonText}>Cerrar</Text>
        </TouchableOpacity>
      </ScrollView>
    </Modal>
  );
}

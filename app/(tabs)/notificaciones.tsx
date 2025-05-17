import React, { useEffect, useState } from 'react';
import * as Notifications from 'expo-notifications';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ScheduledNotification {
  id: string;
  title: string;
  body: string;
  trigger: Date | null;
}

const NotificationsScreen: React.FC = () => {
  const router = useRouter();
  const [scheduledNotifications, setScheduledNotifications] = useState<ScheduledNotification[]>([]);

  useEffect(() => {
    loadScheduledNotifications();
  }, []);

  const loadScheduledNotifications = async () => {
    try {
      const storedNotifications = await AsyncStorage.getItem('scheduledNotifications');
      if (storedNotifications) {
        setScheduledNotifications(JSON.parse(storedNotifications));
      }
    } catch (error) {
      console.error('Error al cargar las notificaciones:', error);
    }
  };

  const removeNotification = async (notificationId: string) => {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      const updatedNotifications = scheduledNotifications.filter(
          (notif) => notif.id !== notificationId
      );
      setScheduledNotifications(updatedNotifications);
      await AsyncStorage.setItem('scheduledNotifications', JSON.stringify(updatedNotifications));
    } catch (error) {
      console.error('Error al eliminar la notificación:', error);
    }
  };

  return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Tus Notificaciones Programadas</Text>
        <ScrollView contentContainerStyle={styles.notificationsGrid}>
          {scheduledNotifications.length === 0 ? (
              <Text style={styles.emptyText}>No hay notificaciones programadas.</Text>
          ) : (
              scheduledNotifications.map((notification) => (
                  <View key={notification.id} style={styles.notificationItem}>
                    <View style={styles.notificationDetails}>
                      <Text style={styles.notificationTitle}>{notification.title || 'Recordatorio'}</Text>
                      <Text style={styles.notificationBody}>{notification.body}</Text>
                      {notification.trigger && (
                          <Text style={styles.notificationTime}>
                            Programada para: {new Date(notification.trigger).toLocaleDateString()} -{' '}
                            {new Date(notification.trigger).toLocaleTimeString()}
                          </Text>
                      )}
                    </View>
                    <TouchableOpacity onPress={() => removeNotification(notification.id)} style={styles.deleteButton}>
                      <MaterialIcons name="delete-outline" size={24} color="#D32F2F" />
                    </TouchableOpacity>
                  </View>
              ))
          )}
        </ScrollView>

        <TouchableOpacity
            style={styles.newProductButton}
            onPress={() => router.navigate('/programarnotificacion')}
        >
          <MaterialIcons name="add-alert" size={48} color="#2E7D32" />
          <Text style={styles.newNotificationText}>Programar notificación</Text>
        </TouchableOpacity>
      </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  notificationsGrid: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
    marginTop: 20,
  },
  notificationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  notificationDetails: {
    flex: 1,
    marginRight: 15,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  notificationBody: {
    fontSize: 14,
    color: '#444',
    marginTop: 5,
  },
  notificationTime: {
    fontSize: 12,
    color: '#777',
    marginTop: 5,
  },
  deleteButton: {
    padding: 10,
  },
  newProductButton: {
    alignItems: 'center',
    marginTop: 20,
  },
  newNotificationText: {
    color: '#2E7D32',
    fontSize: 16,
    marginTop: 5,
  },
});

export default NotificationsScreen;
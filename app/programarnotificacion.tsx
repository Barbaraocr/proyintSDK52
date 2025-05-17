import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Calendar } from 'react-native-calendars';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProgramarNotificacion = () => {
    const router = useRouter();
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState(new Date());
    const [message, setMessage] = useState('');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

    const handleDateSelect = (date: { dateString: string }) => {
        setSelectedDate(date.dateString);
    };

    const handleTimeChange = (event: any, selected: Date | undefined) => {
        setShowTimePicker(false); // Ensure the picker is always hidden after a change or dismissal
        if (selected) {
            setSelectedTime(selected);
        }
    };

    const showTimepicker = () => {
        setShowTimePicker(true);
    };

    const scheduleNotification = async () => {
        if (!selectedDate || !message) {
            alert('Por favor, selecciona una fecha y escribe un mensaje.');
            return;
        }

        const [year, month, day] = selectedDate.split('-').map(Number);
        const triggerDate = new Date(year, month - 1, day, selectedTime.getHours(), selectedTime.getMinutes(), 0);
        const notificationId = Math.random().toString(36).substring(7); // Genera un ID único

        const trigger: Notifications.NotificationTriggerInput = {
            channelId: 'default',
            date: triggerDate,
        };

        try {
            await Notifications.scheduleNotificationAsync({
                identifier: notificationId, // Asigna el ID generado
                content: {
                    title: '¡Recordatorio!',
                    body: message,
                    sound: 'default',
                },
                trigger,
            });

            // Guarda la notificación programada en AsyncStorage
            const newNotification = {
                id: notificationId,
                title: '¡Recordatorio!',
                body: message,
                trigger: triggerDate.toISOString(), // Guarda la date como string ISO
            };

            const storedNotifications = await AsyncStorage.getItem('scheduledNotifications');
            const existingNotifications = storedNotifications ? JSON.parse(storedNotifications) : [];
            const updatedNotifications = [...existingNotifications, newNotification];
            await AsyncStorage.setItem('scheduledNotifications', JSON.stringify(updatedNotifications));

            alert(`Notificación programada para el ${selectedDate} a las ${selectedTime.toLocaleTimeString()}.`);
            router.back(); // Volver a la pantalla de notificaciones
        } catch (error) {
            console.error('Error al programar la notificación:', error);
            alert('Hubo un error al programar la notificación.');
        }
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                <MaterialIcons name="arrow-back" size={24} color="#000" />
                <Text style={styles.backButtonText}>Programar Notificación</Text>
            </TouchableOpacity>

            <Text style={styles.label}>Fecha:</Text>
            <Calendar
                onDayPress={handleDateSelect}
                markedDates={selectedDate ? { [selectedDate]: { selected: true, selectedColor: '#2E7D32' } } : {}}
            />
            {selectedDate && <Text style={styles.selectedText}>Fecha seleccionada: {selectedDate}</Text>}

            <Text style={styles.label}>Hora:</Text>
            <TouchableOpacity style={styles.timePickerButton} onPress={showTimepicker}>
                <Text style={styles.selectedText}>
                    Hora seleccionada: {selectedTime.toLocaleTimeString()}
                </Text>
                <MaterialIcons name="access-time" size={24} color="#2E7D32" />
            </TouchableOpacity>

            {showTimePicker && (
                <>
                    {Platform.OS !== 'ios' && (
                        <DateTimePicker
                            testID="timePicker"
                            value={selectedTime}
                            mode="time"
                            is24Hour={true}
                            display="default"
                            onChange={handleTimeChange}
                        />
                    )}
                    {Platform.OS === 'ios' && (
                        <View>
                            <DateTimePicker
                                testID="timePicker"
                                value={selectedTime}
                                mode="time"
                                display="spinner"
                                onChange={handleTimeChange}
                            />
                            <TouchableOpacity onPress={() => setShowTimePicker(false)} style={styles.doneButton}>
                                <Text style={styles.doneButtonText}>Done</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </>
            )}

            <Text style={styles.label}>Mensaje:</Text>
            <TextInput
                style={styles.input}
                multiline
                placeholder="Escribe tu mensaje aquí..."
                value={message}
                onChangeText={setMessage}
            />

            <TouchableOpacity style={styles.scheduleButton} onPress={scheduleNotification}>
                <Text style={styles.scheduleButtonText}>Programar Notificacion</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    backButtonText: {
        marginLeft: 10,
        fontSize: 18,
        fontWeight: 'bold',
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 15,
        marginBottom: 5,
    },
    selectedText: {
        fontSize: 16,
        marginBottom: 10,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        marginBottom: 20,
        minHeight: 100,
        textAlignVertical: 'top',
    },
    scheduleButton: {
        backgroundColor: '#2E7D32',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
    },
    scheduleButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    timePickerButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        marginBottom: 15,
    },
    doneButton: {
        backgroundColor: '#2E7D32',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 10,
    },
    doneButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
export default ProgramarNotificacion;
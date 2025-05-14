import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

import {
  getPurchaseHistoryByUserId,
  getPurchaseHistoryByDateRange,
  getPurchaseHistoryByFilters,
} from '@/services/purchasehistory';
import { PurchaseHistory } from '@/models/PurchaseHistory';
import { getUserIdFromSession } from '@/services/auth';

export default function PurchaseHistoryScreen() {
  const [userId, setUserId] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [productName, setProductName] = useState<string>('');
  const [listName, setListName] = useState<string>('');
  const [purchaseHistory, setPurchaseHistory] = useState<PurchaseHistory[]>([]);

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  // Obtener ID de usuario al montar
  useEffect(() => {
    getUserIdFromSession()
      .then(uid => setUserId(uid))
      .catch(err => console.error('Error obteniendo userId:', err));
  }, []);

  // Recuperar historial según filtros
  const fetchPurchaseHistory = async () => {
    if (!userId) return;
    try {
      let results: PurchaseHistory[] = [];

      // Filtro por rango de fechas (puede ser solo start o solo end)
      if (startDate || endDate) {
        const parseYMD = (str: string) => {
          const [y, m, d] = str.split('-').map(Number);
          return new Date(y, m - 1, d);
        };
        const start = startDate ? parseYMD(startDate) : undefined;
        const end = endDate ? parseYMD(endDate) : undefined;
        if (start && end) {
          results = await getPurchaseHistoryByDateRange(userId, start, end);
        } else if (start) {
          results = await getPurchaseHistoryByDateRange(userId, start, new Date());
        } else if (end) {
          results = await getPurchaseHistoryByDateRange(userId, new Date(0), end);
        }
      }
      // Filtro por nombre de producto/lista si hay texto
      else if (productName || listName) {
        results = await getPurchaseHistoryByFilters(userId, { productName, listName });
      }
      // Si no hay filtros, recuperar todo el historial del usuario
      else {
        results = await getPurchaseHistoryByUserId(userId);
      }

      setPurchaseHistory(results);
    } catch (error) {
      console.error('Error fetching purchase history:', error);
    }
  };

  const onStartConfirm = (date: Date) => {
    setStartDate(date.toISOString().split('T')[0]);
    setShowStartPicker(false);
  };

  const onEndConfirm = (date: Date) => {
    setEndDate(date.toISOString().split('T')[0]);
    setShowEndPicker(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Historial de Compras</Text>

      {/* Filtros de fecha */}
      <View style={styles.row}>
        <TextInput
          style={styles.input}
          placeholder="Fecha de inicio (YYYY-MM-DD)"
          value={startDate}
          onChangeText={setStartDate}
        />
        <TouchableOpacity
          onPress={() => Platform.OS !== 'web' && setShowStartPicker(true)}
          disabled={Platform.OS === 'web'}
        >
          <Ionicons
            name="calendar-outline"
            size={24}
            color={Platform.OS === 'web' ? '#ccc' : '#007BFF'}
            style={Platform.OS === 'web' && styles.disabledIcon}
          />
        </TouchableOpacity>
        <DateTimePickerModal
          isVisible={showStartPicker}
          mode="date"
          onConfirm={onStartConfirm}
          onCancel={() => setShowStartPicker(false)}
        />
      </View>

      <View style={styles.row}>
        <TextInput
          style={styles.input}
          placeholder="Fecha final (YYYY-MM-DD)"
          value={endDate}
          onChangeText={setEndDate}
        />
        <TouchableOpacity
          onPress={() => Platform.OS !== 'web' && setShowEndPicker(true)}
          disabled={Platform.OS === 'web'}
        >
          <Ionicons
            name="calendar-outline"
            size={24}
            color={Platform.OS === 'web' ? '#ccc' : '#007BFF'}
            style={Platform.OS === 'web' && styles.disabledIcon}
          />
        </TouchableOpacity>
        <DateTimePickerModal
          isVisible={showEndPicker}
          mode="date"
          onConfirm={onEndConfirm}
          onCancel={() => setShowEndPicker(false)}
        />
      </View>

      {/* Filtros de texto */}
      <TextInput
        style={styles.input}
        placeholder="Nombre del producto"
        value={productName}
        onChangeText={setProductName}
      />
      <TextInput
        style={styles.input}
        placeholder="Nombre de la lista"
        value={listName}
        onChangeText={setListName}
      />

      {/* Botón de búsqueda */}
      <TouchableOpacity style={styles.button} onPress={fetchPurchaseHistory}>
        <Text style={styles.buttonText}>Buscar</Text>
      </TouchableOpacity>

      {/* Lista de resultados con diseño de tarjetas */}
      {purchaseHistory.length === 0 ? (
        <Text style={styles.noResults}>No hay compras para mostrar</Text>
      ) : (
        <FlatList
          data={purchaseHistory}
          keyExtractor={item => item.idCompra!}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.listName}>{item.listName}</Text>
                <Text style={styles.productName}>{item.productName}</Text>
              </View>
              <View style={styles.cardFooter}>
                <Text style={styles.amount}>${item.montoTotal.toFixed(2)}</Text>
                <Text style={styles.date}>{item.fechaCompra.toLocaleDateString()}</Text>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    marginBottom: 12, 
    color: '#fff', 
    backgroundColor: '#256847',
    padding: 16,
  },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  disabledIcon: { opacity: 0.3 },
  button: {
    backgroundColor: '#007BFF',
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
    marginVertical: 12,
  },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  noResults: { textAlign: 'center', color: '#888', marginTop: 20 },
  card: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginVertical: 6,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  cardHeader: { marginBottom: 8 },
  listName: { fontSize: 16, fontWeight: '600', color: '#333' },
  productName: { fontSize: 14, color: '#666' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  amount: { fontSize: 14, fontWeight: 'bold', color: '#007BFF' },
  date: { fontSize: 12, color: '#999' },
});

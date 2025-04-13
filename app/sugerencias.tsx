import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const sampleProducts = [
  { id: '1', name: 'Producto', image: 'https://example.com/product1.png' },
  { id: '2', name: 'Producto', image: 'https://example.com/product2.png' },
  { id: '3', name: 'Producto', image: 'https://example.com/product3.png' },
  { id: '4', name: 'Producto', image: 'https://example.com/product4.png' },
];

export default function SuggestionsScreen() {
  const [accepted, setAccepted] = useState<string[]>([]);
  const [rejected, setRejected] = useState<string[]>([]);

  const handleAccept = (id: string) => {
    setAccepted([...accepted, id]);
    setRejected(rejected.filter(rid => rid !== id));
  };

  const handleReject = (id: string) => {
    setRejected([...rejected, id]);
    setAccepted(accepted.filter(aid => aid !== id));
  };

  const renderSuggestedItem = ({ item }: any) => (
    <View style={styles.productItem}>
      <Image source={{ uri: item.image }} style={styles.productImage} />
      <Text style={styles.productName}>{item.name}</Text>

      <View style={styles.iconRow}>
        <TouchableOpacity onPress={() => handleAccept(item.id)}>
          <Text style={styles.check}>{accepted.includes(item.id) ? '✅' : '◻️'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleReject(item.id)}>
          <Text style={styles.cross}>{rejected.includes(item.id) ? '❌' : '◻️'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton}>
        <MaterialIcons name="arrow-back-ios" size={24} color="white" />
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Sugerencias para ti</Text>
      <FlatList
        horizontal
        data={sampleProducts}
        keyExtractor={(item) => item.id}
        renderItem={renderSuggestedItem}
        contentContainerStyle={styles.horizontalList}
        showsHorizontalScrollIndicator={false}
      />

      <Text style={styles.sectionTitle}>Tal vez quieras probar</Text>
      <View style={styles.grid}>
        {sampleProducts.map((item) => (
          <View key={item.id + '-maybe'} style={styles.productItem}>
            <Image source={{ uri: item.image }} style={styles.productImage} />
            <Text style={styles.productName}>{item.name}</Text>
          </View>
        ))}
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fefefe' },
  backButton: { position: 'absolute', top: 40, left: 20 },
  sectionTitle: { marginTop: 110, marginLeft: 16, fontSize: 16, fontWeight: '600', color: '#3C4F3E' },
  horizontalList: { paddingHorizontal: 16, marginVertical: 8 },
  productItem: { marginRight: 16, alignItems: 'center' },
  productImage: { width: 60, height: 60, borderRadius: 12 },
  productName: { fontSize: 12, marginTop: 4 },
  iconRow: { flexDirection: 'row', marginTop: 4, gap: 8 },
  check: { fontSize: 18 },
  cross: { fontSize: 18 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
    justifyContent: 'space-between',
    marginTop: 8,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    marginTop: 20,
  },
});

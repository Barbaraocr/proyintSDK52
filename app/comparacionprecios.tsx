import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const productExample = {
  name: 'Lechuga',
  category: 'Verduras',
  supermarket: 'Super A',
  price: 30.0,
  icon: 'https://example.com/icon1.png',
};

const Comparacionprecios = () => {
  const [product1, setProduct1] = useState(productExample);
  const [product2, setProduct2] = useState({ ...productExample, price: 30.0 });

  const priceDifference = Math.abs(product1.price - product2.price);
  const isProduct1Cheaper = product1.price < product2.price;

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton}>
        <MaterialIcons name="arrow-back-ios" size={24} color="white" />
      </TouchableOpacity>

      <Text style={styles.title}>Comparador de precios</Text>

      <View style={styles.comparisonRow}>
        {[product1, product2].map((product, index) => (
          <View style={styles.column} key={index}>
            <Image source={{ uri: product.icon }} style={styles.icon} />
            <Text style={styles.arrow}>
              {index === 0
                ? isProduct1Cheaper
                  ? '⬇️'
                  : '⬆️'
                : isProduct1Cheaper
                ? '⬆️'
                : '⬇️'}
            </Text>

            <Text style={styles.label}>Producto</Text>
            <View style={styles.card}>
              <Text style={styles.label}>Nombre:</Text>
              <TextInput editable={false} value={product.name} style={styles.input} />

              <Text style={styles.label}>Categoría:</Text>
              <TextInput editable={false} value={product.category} style={styles.input} />

              <Text style={styles.label}>Supermercado:</Text>
              <TextInput editable={false} value={product.supermarket} style={styles.input} />

              <Text style={styles.label}>Precio:</Text>
              <TextInput
                editable={false}
                value={`$${product.price.toFixed(2)}`}
                style={styles.input}
              />
            </View>
          </View>
        ))}
      </View>

      <Text style={styles.differenceText}>Diferencia de precio:</Text>
      <View style={styles.differenceBox}>
        <Text style={styles.differenceValue}>${priceDifference.toFixed(2)}</Text>
      </View>

      
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6f6f6' },
  backButton: { position: 'absolute', top: 40, left: 20 },
  title: { marginTop: 100, marginLeft: 20, fontSize: 16, fontWeight: 'bold' },
  comparisonRow: { flexDirection: 'row', justifyContent: 'space-around', padding: 10 },
  column: { alignItems: 'center', width: '45%' },
  icon: { width: 60, height: 60, borderRadius: 30 },
  arrow: { fontSize: 20, marginVertical: 4 },
  card: {
    backgroundColor: '#e0e0e0',
    borderRadius: 16,
    padding: 10,
    marginTop: 8,
    width: '100%',
  },
  label: { fontSize: 12, color: '#333' },
  input: {
    backgroundColor: '#fff',
    borderRadius: 6,
    padding: 6,
    marginVertical: 4,
    fontSize: 13,
    color: '#000',
  },
  differenceText: {
    textAlign: 'center',
    marginTop: 10,
    fontSize: 14,
    color: '#444',
  },
  differenceBox: {
    alignSelf: 'center',
    marginTop: 6,
    backgroundColor: '#d9d9d9',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
  },
  differenceValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    marginTop: 30,
  },
});

export default Comparacionprecios;

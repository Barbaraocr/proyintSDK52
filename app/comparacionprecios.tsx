import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const productExample = {
  name: 'Lechuga',
  category: 'Verduras',
  supermarket: 'Super A',
  price: 30.0,
  icon: 'https://gallery.yopriceville.com/var/resizes/Free-Clipart-Pictures/Fruit-PNG/Plate_with_Fruits_PNG_Clipart_Image.png?m=1629831856',
};

const Comparacionprecios = () => {
  const navigation = useNavigation();
  const [product1, setProduct1] = useState(productExample);
  const [product2, setProduct2] = useState({ ...productExample, price: 35.0 });

  const priceDifference = Math.abs(product1.price - product2.price);
  const isProduct1Cheaper = product1.price < product2.price;

  return (
    <View style={styles.container}>
      {/* Cabecera verde con curva hacia abajo */}
      <View style={styles.headerContainer}>
        <View style={styles.greenHeader}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Comparador de precios</Text>
        </View>
        <View style={styles.curvedBottom} />
      </View>

      {/* Contenido de comparación */}
      <View style={styles.comparisonRow}>
        {[product1, product2].map((product, index) => (
          <View style={styles.column} key={index}>
            <View style={styles.imageArrowContainer}>
              <Image source={{ uri: product.icon }} style={styles.icon} />
              <AntDesign
                name={
                  (index === 0 && isProduct1Cheaper) || (index === 1 && !isProduct1Cheaper)
                    ? 'arrowdown'
                    : 'arrowup'
                }
                size={24}
                color={
                  (index === 0 && isProduct1Cheaper) || (index === 1 && !isProduct1Cheaper)
                    ? 'green'
                    : 'red'
                }
                style={styles.arrowIcon}
              />
            </View>

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
  container: { flex: 1, backgroundColor: '#ffff' },
  headerContainer: {
    position: 'relative',
    backgroundColor: '#3F704D',
    zIndex: 1,
  },
  greenHeader: {
    height: 220,
    borderBottomLeftRadius: 100,
    borderBottomRightRadius: 100,
    backgroundColor: '#3F704D',
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingLeft: 20,
    zIndex: 1,
  },
  curvedBottom: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    marginTop: -40, // traslape sobre la curva
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingTop: 40,
    zIndex: 2,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 10,
  },
  backIcon: {
    color: '#FFF',
    fontSize: 28,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 60,
  },
  comparisonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
    marginTop: 40,
  },
  column: { alignItems: 'center', width: '45%' },
  imageArrowContainer: {
    alignItems: 'center',
    marginBottom: 6,
  },
  icon: { width: 60, height: 60, borderRadius: 30 },
  arrowIcon: {
    marginTop: 4,
  },
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
});

export default Comparacionprecios;

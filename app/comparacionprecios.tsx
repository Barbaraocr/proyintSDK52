import React, { useState, useEffect } from 'react';
import { View, Text, Button, Modal, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { Producto } from '@/models/Products'; // Asegúrate de que el modelo esté bien importado
import { getProductos } from '@/services/Products';
import { Image } from 'react-native';
export default function PantallaComparacion() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [producto1, setProducto1] = useState<Producto | null>(null);
  const [producto2, setProducto2] = useState<Producto | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [seleccionandoProducto, setSeleccionandoProducto] = useState<1 | 2 | null>(null);
  const [comparado, setComparado] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProductos = async () => {
      const data = await getProductos();
      setProductos(data);
      setLoading(false);
    };
    fetchProductos();
  }, []);

  const seleccionarProducto = (producto: Producto) => {
    if (seleccionandoProducto === 1) {
      setProducto1(producto);
    } else if (seleccionandoProducto === 2) {
      setProducto2(producto);
    }
    setModalVisible(false);
  };

  const isProduct1Cheaper = producto1 && producto2 ? producto1.precio < producto2.precio : false;

  const renderProductoCard = (producto: Producto | null, lado: 1 | 2) => {
    const otroProducto = lado === 1 ? producto2 : producto1;
    const mostrarFlecha = comparado && producto && otroProducto;
    let iconName: 'arrowdown' | 'arrowup' | null = null;
    let iconColor = 'green';

    if (mostrarFlecha) {
      if (producto.precio < otroProducto.precio) {
        iconName = 'arrowdown';
        iconColor = 'green';
      } else if (producto.precio > otroProducto.precio) {
        iconName = 'arrowup';
        iconColor = 'red';
      }
    }

    return (
      <View style={styles.card}>
        <Text style={styles.etiqueta}>Nombre:</Text>
        <Text style={styles.valor}>{producto?.nombre ?? ''}</Text>
        <Text style={styles.etiqueta}>Categoría:</Text>
        <Text style={styles.valor}>{producto?.categoria ?? ''}</Text>
        <Text style={styles.etiqueta}>Supermercado:</Text>
        <Text style={styles.valor}>{producto?.supermercado ?? ''}</Text>
        <Text style={styles.etiqueta}>Precio:</Text>
        <View style={styles.precioContainer}>
          <Text style={styles.valor}>
            {producto ? `$${producto.precio.toFixed(2)}` : ''}
          </Text>
          {iconName && (
            <AntDesign
              name={iconName}
              size={24}
              color={iconColor}
              style={styles.arrowIcon}
            />
          )}
        </View>
        <Button
          title="Seleccionar producto"
          onPress={() => {
            setSeleccionandoProducto(lado);
            setModalVisible(true);
            setComparado(false);
          }}
        />
      </View>
    );
  };

  const renderComparacion = () => {
    if (!comparado || !producto1 || !producto2) return null;

    const diferencia = Math.abs(producto1.precio - producto2.precio).toFixed(2);
    const masBarato =
      producto1.precio < producto2.precio
        ? producto1.supermercado
        : producto2.supermercado;

    return (
      <View style={styles.comparacionContainer}>
        <Text style={styles.etiqueta}>Diferencia de precio:</Text>
        <View style={styles.diferencia}>
          <Text style={styles.diferenciaTexto}>${diferencia}</Text>
        </View>
        <Text style={styles.resultadoTexto}>
          {`${masBarato} es más barato`}
        </Text>
      </View>
    );
  };

  const renderItem = ({ item }: { item: Producto }) => (
  <TouchableOpacity onPress={() => seleccionarProducto(item)} style={styles.item}>
    {item.imagenURL ? (
      <Image source={{ uri: item.imagenURL }} style={styles.productImage} />
    ) : (
      <View style={[styles.productImage, styles.placeholderImage]}>
        <Text>Sin imagen</Text>
      </View>
    )}
    <View>
      <Text style={styles.valor}>{item.nombre}</Text>
      <Text style={styles.valor}>${item.precio.toFixed(2)}</Text>
    </View>
  </TouchableOpacity>
);


  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <>
          <View style={styles.cardsContainer}>
            {renderProductoCard(producto1, 1)}
            {renderProductoCard(producto2, 2)}
          </View>
          <Button
            title="Comparar"
            onPress={() => setComparado(true)}
            disabled={!producto1 || !producto2}
          />
          {renderComparacion()}

          <Modal visible={modalVisible} animationType="slide">
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Selecciona un producto</Text>
              <FlatList
              data={productos}
              keyExtractor={(item) => item.id || item.nombre || Math.random().toString()}
              renderItem={renderItem}
            />

              <Button title="Cerrar" onPress={() => setModalVisible(false)} />
            </View>
          </Modal>
        </>
      )}
    </View>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  titulo: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    alignSelf: 'center',
  },
  cardsContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  productosContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  card: {
    width: '48%',
    backgroundColor: '#eee',
    padding: 10,
    borderRadius: 10,
  },
  etiqueta: { fontWeight: '600', marginTop: 5 },
  valor: { backgroundColor: '#fff', padding: 5, borderRadius: 5 },
  precioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  arrowIcon: {
    marginLeft: 5,
  },
  comparacionContainer: { alignItems: 'center', marginBottom: 20 },
  diferencia: {
    backgroundColor: '#ddd',
    padding: 8,
    borderRadius: 10,
    marginVertical: 10,
  },
  diferenciaTexto: { fontWeight: 'bold' },
  resultadoTexto: { color: 'green', fontWeight: 'bold', fontSize: 16 },
  botonComparar: {
    backgroundColor: '#3b704c',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  botonTexto: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalContainer: { flex: 1, padding: 20 },
  modalTitulo: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  itemProducto: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  item: { paddingVertical: 8, borderBottomWidth: 1 },
  productImage: {
  width: 60,
  height: 60,
  borderRadius: 8,
  marginRight: 10,
  resizeMode: 'cover',
},
placeholderImage: {
  backgroundColor: '#ccc',
  justifyContent: 'center',
  alignItems: 'center',
},


});

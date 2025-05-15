// PantallaComparacion.tsx
import React, { useState } from 'react';
import { View, Text, Button, Modal, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { AntDesign } from '@expo/vector-icons';

interface Producto {
  id: string;
  name: string;
  categoria: string;
  supermercado: string;
  precio: number;
}

const productosDisponibles: Producto[] = [
  { id: '1', name: 'Lechuga', categoria: 'Verduras', supermercado: 'Super A', precio: 30 },
  { id: '2', name: 'Lechuga', categoria: 'Verduras', supermercado: 'Super A', precio: 35 },
  { id: '3', name: 'Tomate', categoria: 'Verduras', supermercado: 'Super B', precio: 25 },
  { id: '4', name: 'Tomate', categoria: 'Verduras', supermercado: 'Super C', precio: 28 },
];

export default function PantallaComparacion() {
  const [producto1, setProducto1] = useState<Producto | null>(null);
  const [producto2, setProducto2] = useState<Producto | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [seleccionandoProducto, setSeleccionandoProducto] = useState<1 | 2 | null>(null);
  const [comparado, setComparado] = useState(false);

  const seleccionarProducto = (producto: Producto) => {
    if (seleccionandoProducto === 1) {
      setProducto1(producto);
    } else if (seleccionandoProducto === 2) {
      setProducto2(producto);
    }
    setModalVisible(false);
  };

  // Indica cuál producto es más barato para la comparación de flechas
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
      } else {
        iconName = null; // Precios iguales, sin flecha
      }
    }

    return (
      <View style={styles.card}>
        <Text style={styles.etiqueta}>Nombre:</Text>
        <Text style={styles.valor}>{producto?.name ?? ''}</Text>
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
            setComparado(false); // Reinicia comparación si se cambia producto
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

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Comparar Productos</Text>

      <View style={styles.productosContainer}>
        {renderProductoCard(producto1, 1)}
        {renderProductoCard(producto2, 2)}
      </View>

      {renderComparacion()}

      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitulo}>Seleccionar Producto</Text>
          <FlatList
            data={productosDisponibles}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.itemProducto}
                onPress={() => seleccionarProducto(item)}
              >
                <Text>{item.name} - {item.supermercado} - ${item.precio}</Text>
              </TouchableOpacity>
            )}
          />
          <Button title="Cerrar" onPress={() => setModalVisible(false)} />
        </View>
      </Modal>

      <TouchableOpacity
        style={[
          styles.botonComparar,
          !(producto1 && producto2) && { backgroundColor: '#ccc' },
        ]}
        disabled={!(producto1 && producto2)}
        onPress={() => setComparado(true)}
      >
        <Text style={styles.botonTexto}>Comparar</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.botonComparar, { backgroundColor: '#555', marginTop: 10 }]}
        onPress={() => {
          setProducto1(null);
          setProducto2(null);
          setComparado(false);
          setSeleccionandoProducto(null);
        }}
      >
        <Text style={styles.botonTexto}>Reiniciar</Text>
      </TouchableOpacity>
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
});

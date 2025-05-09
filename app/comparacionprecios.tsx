import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
  Image,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ProductSelectionScreen = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectingProductFor, setSelectingProductFor] = useState<1 | 2>(1);

  const [selectedProduct1, setSelectedProduct1] = useState({ name: '', image: null });
  const [price1, setPrice1] = useState('');
  const [quantity1, setQuantity1] = useState('');

  const [selectedProduct2, setSelectedProduct2] = useState({ name: '', image: null });
  const [price2, setPrice2] = useState('');
  const [quantity2, setQuantity2] = useState('');

  const products = [
    { name: 'Manzana', image: { uri: 'https://via.placeholder.com/100' } },
    { name: 'Banana', image: { uri: 'https://via.placeholder.com/100' } },
    { name: 'Naranja', image: { uri: 'https://via.placeholder.com/100' } },
    { name: 'Uvas', image: { uri: 'https://via.placeholder.com/100' } },
  ];
  

  const handleProductSelect = (product: any) => {
    if (selectingProductFor === 1) {
      setSelectedProduct1(product);
    } else {
      setSelectedProduct2(product);
    }
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Producto 1</Text>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          setSelectingProductFor(1);
          setModalVisible(true);
        }}
      >
        <Ionicons name="add-circle-outline" size={24} color="#2E7D32" />
        <Text style={styles.addButtonText}>Seleccionar producto</Text>
      </TouchableOpacity>
      {selectedProduct1.name !== '' && (
        <View style={styles.imageArrowContainer}>
          {selectedProduct1?.image && (
  <Image source={selectedProduct1.image} style={styles.productImage} />
)}

          <Text>{selectedProduct1.name}</Text>
        </View>
      )}
      <TextInput
        placeholder="Precio"
        keyboardType="numeric"
        style={styles.input}
        value={price1}
        onChangeText={setPrice1}
      />
      <TextInput
        placeholder="Cantidad"
        keyboardType="numeric"
        style={styles.input}
        value={quantity1}
        onChangeText={setQuantity1}
      />

      <Text style={styles.label}>Producto 2</Text>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          setSelectingProductFor(2);
          setModalVisible(true);
        }}
      >
        <Ionicons name="add-circle-outline" size={24} color="#2E7D32" />
        <Text style={styles.addButtonText}>Seleccionar producto</Text>
      </TouchableOpacity>
      {selectedProduct2.name !== '' && (
        <View style={styles.imageArrowContainer}>
          {selectedProduct2?.image && (
  <Image source={selectedProduct2.image} style={styles.productImage} />
)}

          <Text>{selectedProduct2.name}</Text>
        </View>
      )}
      <TextInput
        placeholder="Precio"
        keyboardType="numeric"
        style={styles.input}
        value={price2}
        onChangeText={setPrice2}
      />
      <TextInput
        placeholder="Cantidad"
        keyboardType="numeric"
        style={styles.input}
        value={quantity2}
        onChangeText={setQuantity2}
      />

      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Selecciona un producto</Text>
          <FlatList
            data={products}
            keyExtractor={(item) => item.name}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.productItem}
                onPress={() => handleProductSelect(item)}
              >
                <Image source={item.image} style={styles.productImage} />
                <Text style={styles.productName}>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
          <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  label: {
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 20,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  addButtonText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#2E7D32',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    borderRadius: 5,
    marginBottom: 10,
  },
  icon: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  imageArrowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f2f2f2',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    width: '100%',
  },
  productImage: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  productName: {
    fontSize: 18,
  },
  closeButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#2E7D32',
    borderRadius: 5,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default ProductSelectionScreen;

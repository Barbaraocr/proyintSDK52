import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity, ActivityIndicator, Modal, Alert } from 'react-native';
import { CheckBox } from 'react-native-elements';
import { useNavigation } from '@react-navigation/native';
import { getSuggestedProductsByRecentCategories } from '../services/Products';
import { Producto } from '../models/Products';
import { getListsByUserId } from '../services/lists'; // Asegúrate de tener esto
import { addProductoToLista } from '../services/productsList'; // Asegúrate de tener esto
import { List } from '../models/Lists';
import { ProductoLista } from '../models/ProductsList';
import { getAuth } from 'firebase/auth';

export default function SuggestedScreen() {
  const navigation = useNavigation();
  const [suggestedProducts, setSuggestedProducts] = useState<Producto[]>([]);
  const [userLists, setUserLists] = useState<List[]>([]);
  const [selectedSuggestions, setSelectedSuggestions] = useState<{ [key: string]: boolean }>({});
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [productToAdd, setProductToAdd] = useState<Producto | null>(null);

  const user = getAuth().currentUser;

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!user) return;

        const [products, lists] = await Promise.all([
          getSuggestedProductsByRecentCategories(user.uid),
          getListsByUserId(user.uid)
        ]);

        setSuggestedProducts(products);
        setUserLists(lists);

        const initialSelection = Object.fromEntries(products.map(p => [p.id!, true]));
        setSelectedSuggestions(initialSelection);
      } catch (error) {
        console.error('Error loading suggestions or lists:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggleCheck = (product: Producto) => {
    setProductToAdd(product);
    setModalVisible(true); // Open modal for list selection
  };

  const handleAddToList = async (listId: string) => {
    console.log("Intentando agregar producto a la lista:", listId);
    if (!productToAdd || !user) return;
  
    // Corrección: asignar correctamente el productoId y listaId
    const productoLista = new ProductoLista(
      null,                   // id (lo asigna Firebase)
      productToAdd.id!,       // productoId
      null,                   // cantidad (se asigna después)
      listId,                 // ✅ listaId correcto
      false,                  // isComprado
      user.uid,               // usuarioAsignado
      new Date()              // fechaActualizacion
    );
  
    try {
      await addProductoToLista(productoLista, 1); // Puedes ajustar cantidad si lo deseas
      Alert.alert('Producto añadido', `El producto fue añadido a la lista correctamente.`);
    } catch (error) {
      Alert.alert('Error', 'No se pudo añadir el producto a la lista.');
      console.error('Add product error:', error);
    } finally {
      setModalVisible(false);
      setProductToAdd(null);
    }
  };
  

  const renderProduct = ({ item }: { item: Producto }) => (
    <View style={styles.productContainer}>
      <Image
        source={item.imagenURL ? { uri: item.imagenURL } : require('../assets/product.png')}
        style={styles.productImage}
      />
      <Text style={styles.productText}>{item.nombre}</Text>
      <CheckBox
        checked={!!selectedSuggestions[item.id!]}
        onPress={() => toggleCheck(item)}
        containerStyle={{ backgroundColor: 'transparent', borderWidth: 0, padding: 0 }}
      />
    </View>
  );

  return (
    <View style={styles.fullContainer}>
      <View style={styles.greenHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Sugerencias para ti</Text>
          {loading ? (
            <ActivityIndicator size="large" color="#00a680" />
          ) : (
            <FlatList
              data={suggestedProducts}
              horizontal
              keyExtractor={(item) => item.id!}
              renderItem={renderProduct}
              showsHorizontalScrollIndicator={false}
            />
          )}
        </View>
      </View>

      {/* Modal para seleccionar la lista */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>¿A qué lista deseas agregarlo?</Text>
            {userLists.map(list => (
              <TouchableOpacity key={list.id} style={styles.modalButton} onPress={() => handleAddToList(list.id!)}>
                <Text style={styles.modalButtonText}>{list.listName}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalCancel}>
              <Text style={{ color: 'red' }}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}


const styles = StyleSheet.create({
  fullContainer: {
    flex: 1,
    backgroundColor: '#3F704D', // fondo verde de toda la pantalla detrás de la curva
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    marginTop: -40, // traslape sobre la curva
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingTop: 40,
    zIndex: 2,
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
  backButton: {
    marginTop: 40,
  },
  backIcon: {
    color: '#FFF',
    fontSize: 28,
  },
  card: {
    backgroundColor: 'white',
    marginTop: 20,
    marginHorizontal: 20,
    borderRadius: 10,
    padding: 10,
  },
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 10,
    color: '#607060',
    backgroundColor: '#F1F1F1',
    padding: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  productContainer: {
    alignItems: 'center',
    marginHorizontal: 8,
    marginBottom: 15,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 5,
  },
  productText: {
    fontSize: 12,
    textAlign: 'center',
  },
  tryList: {
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00000099',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalButton: {
    paddingVertical: 10,
  },
  modalButtonText: {
    fontSize: 16,
    color: '#00a680',
  },
  modalCancel: {
    marginTop: 10,
    alignItems: 'center',
  }
});

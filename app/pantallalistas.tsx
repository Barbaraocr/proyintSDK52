import React, { useEffect, useState } from 'react';
import { View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AntDesign from '@expo/vector-icons/AntDesign';
import { List } from '@/models/Lists';
import { getListById } from '@/services/lists';
import { Producto } from '@/models/Products';
import { addProductoToList, getProductoById, getProductos, getProductosByListId, markProductoAsComprado } from '@/services/Products';
import { ProductoLista } from '@/models/ProductsList';
import { getPurchaseHistoryByFilters, getPurchaseHistoryByDateRange, createPurchaseHistory } from '@/services/purchasehistory';
import { PurchaseHistory } from '@/models/PurchaseHistory';
import { getUserIdFromSession } from '@/services/auth';


export default function ListScreen(){

  const [userId, setUserId] = useState<string | null>(null);

const { id } = useLocalSearchParams();

  const [selectedList, setSelectedList] = useState<List>(); // Estado de carga

  const fetchList = async (listID: string) => {
    try {
      const listSelected = await getListById(listID);
      setSelectedList(listSelected || undefined); // Si no hay lista, asigna `undefined`
    } catch (error) {
      console.error('Error fetching individual lists:', error);
    } finally {
    }
  };
  useEffect(() => {
    if (id && typeof id === 'string') {
      fetchList(id); // Llama a fetchList con el ID del parámetro
    }
    // → al montar, recupera el userId de sesión:
    getUserIdFromSession().then(uid => setUserId(uid));
  }, [id]);
  
  
  // Ejecuta fetchList al cargar el componente o cuando cambia el ID
  
  const [catalogProducts, setcatalogProducts] = useState<Producto[]>([]); // Estado de carga
  const [loadChanges, setLoadChanges] = useState<boolean>(); // Estado de carga

  
  
  
  const [products, setProducts] = useState<ProductoLista[]>([]); // Estado de carga
  
  const fetchProductInList = async (listID: string) => {
    try {
      const AllProductsInList = await getProductosByListId(listID);
      setProducts(AllProductsInList || undefined); // Si no hay lista, asigna `undefined`
    } catch (error) {
      console.error('Error fetching individual lists:', error);
    } finally {
    }
  };
  
  // Ejecuta fetchList al cargar el componente o cuando cambia el ID
  useEffect(() => {
    if (id && typeof id === 'string') {
      fetchProductInList(id); // Llama a fetchList con el ID del parámetro
    }
  }, [id]);

  
  type DetailedProduct = ProductoLista & { productoOriginal?: Producto | null };
  
  const [detailedProducts, setDetailedProducts] = useState<DetailedProduct[]>([]);
  
  const loadDetailedProducts = async (productList: ProductoLista[]) => {
    try {
      const promises = productList.map(async (item) => {
        if (item.productoId) {
          try {
            const product = await getProductoById(item.productoId); 
            return {
              ...item,
              productoOriginal: product,
            } as DetailedProduct; // Cast explícito
          } catch (error) {
            console.error(`Error al cargar el producto con ID ${item.productoId}:`, error);
            return null;
          }
        }
        return null;
      });
  
      const results = await Promise.all(promises);
  
  
      // Filtra valores nulos para evitar errores en setDetailedProducts
      const filteredResults = results.filter((result): result is DetailedProduct => result !== null);
      console.log(filteredResults)
  
      // Actualiza el estado con los productos detallados
      setDetailedProducts(filteredResults);
    } catch (error) {
      console.error('Error loading detailed products:', error);
    }
  };
  
  const getGroupedProducts = () => {
    const groupedByName: { [key: string]: DetailedProduct[] } = {};
  
    detailedProducts.forEach(product => {
      const name = product.productoOriginal?.nombre || 'Sin nombre'; // Cambiar esta linea cuando se agregen los departamentos para agrupar por departamentos
      if (!groupedByName[name]) {
        groupedByName[name] = [];
      }
      groupedByName[name].push(product);
    });
  
    return Object.entries(groupedByName).map(([name, items]) => ({
      nombre: name,
      cantidad: items.length,
      productos: items,
    }));
  };
  const [selectedProducts, setSelectedProducts] = useState<{ [id: string]: boolean }>({});

  useEffect(() => {
    if (products.length > 0) {
      loadDetailedProducts(products); // Llama al método con la lista de productos
    }
  }, [products,loadChanges]);

  useEffect(() => {
    if (products.length > 0) {
      loadDetailedProducts(products); // Llama al método con la lista de productos
    }
  }, [loadChanges]);

  const router = useRouter();
  const [search, setSearch] = useState('');
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [grouped, setGrouped] = useState(false);


  const toggleSelection = async (id: string) => {
    
      try {
    
    // Update the selectedProducts state first to reflect the UI change
    setSelectedProducts((prevState) => ({
      ...prevState,
      [id]: !prevState[id], // Toggle selection for the specific product
    }));
    
    // Update the 'isComprado' field for the corresponding product
    // Now call the API to update the product's purchase status in the backend
    await markProductoAsComprado(id);
  } catch (error) {
    console.error(`Error updating the product with ID ${id}:`, error);
  } finally {
  }
};

const handleBuyProduct = async (item: DetailedProduct) => {
  if (!userId) {
    console.error('Usuario no autenticado');
    return;
  }
  try {
    const compra = new PurchaseHistory(
      userId,
      item.productoOriginal?.precio ?? 0,
      new Date(),
      item.productoOriginal?.nombre ?? '',
      selectedList?.listName ?? ''
    );
    const idGen = await createPurchaseHistory(compra);
    compra.idCompra = idGen;
    console.log('Compra registrada:', compra);
    // Opcional: refresca el historial en pantalla
    //router.push('/historialcompras');
  } catch (err) {
    console.error('Error creando compra:', err);
  }
};


  

// Función para actualizar el estado en Firestore

  const totalSelected = detailedProducts.reduce(
    (total, product) =>
      selectedProducts[product.id || ''] ? total + (product.productoOriginal?.precio || 0) : total,
    0
  );

  const navigationToSharingOptions = (listId: string) => {
    console.log("Going to SharingOptions of Collaboration With ID:", listId);
    router.navigate(`/pantallacolaboracion?id=${listId}`);
  };
  const navigationToEditingOptions = (listId: string) => {
    console.log("Going to SettingOptions of Collaboration With ID:", listId);
    router.navigate(`/pantallaedicion?id=${listId}`);
  };
//?id=${listId}
const fetchProductos = async () => {
  try {
    const allproducts = await getProductos();
    setcatalogProducts(allproducts); // Si no hay lista, asigna `undefined`
  } catch (error) {
    console.error('Error fetching individual lists:', error);
  } finally {
  }
};

// Ejecuta fetchList al cargar el componente o cuando cambia el ID
useEffect(() => {
  fetchProductos(); // Llama a fetchList con el ID del parámetro

}, [id]);

  return (

    <View style={styles.container}>

      <TouchableOpacity
    style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, alignSelf: 'flex-start' }}
    onPress={() => router.navigate('/')}
  >
    <Ionicons name="arrow-back" size={24} color="#256847" />
    <Text style={{ marginLeft: 8, color: '#256847', fontWeight: 'bold' }}>Inicio</Text>
  </TouchableOpacity>
      
      <TouchableOpacity style={styles.menuIcon} onPress={() => {
          if (selectedList?.id) {
            navigationToEditingOptions(selectedList.id);
          } else {
            console.error("selectedList o su ID no están definidos");
          }
        }}>
        <MaterialIcons name="edit" size={24} color="#333" />
      </TouchableOpacity>

      {/* Menú lateral */}
      {isMenuOpen && (
        <View style={styles.menuContainer}>
          <TouchableOpacity style={styles.menuButton}>
            <Text style={styles.menuButtonText}>Convertir a colaborativa</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteButton}>
            <Text style={styles.deleteButtonText}>Eliminar lista</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Título */}
      <View style={styles.titlecontainer}>
        <Text style={styles.title}>Nombre de la lista</Text>
        <TouchableOpacity onPress={() => {
          if (selectedList?.id) {
            navigationToSharingOptions(selectedList.id);
          } else {
            console.error("selectedList o su ID no están definidos");
          }
        }}>
        <AntDesign name="adduser" size={24} color="black" onPress={() => {
          if (selectedList?.id) {
            navigationToSharingOptions(selectedList.id);
          } else {
            console.error("selectedList o su ID no están definidos");
          }
        }} />
        </TouchableOpacity>
      </View>
      {/* Search Bar */}
      <View style={styles.searchGroupContainer}>
        <View style={styles.searchContainer2}>
          <Ionicons name="search" size={20} color="#888" />
          <TextInput
            style={styles.searchInput2}
            placeholder="Buscar producto"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Botón de Agrupar */}
        <TouchableOpacity style={styles.groupButton} onPress={() => setGrouped(!grouped)}>
          <Ionicons name="grid-outline" size={24} color="#2E7D32" />
          <Text style={styles.groupButtonText}>{grouped ? 'Desagrupar' : 'Agrupar'}</Text>
        </TouchableOpacity>
      </View>

      {/* Lista de productos */}
      {grouped ? (
      <FlatList
        data={getGroupedProducts()}
        keyExtractor={(item) => item.nombre}
        renderItem={({ item }) => (
          <View style={styles.groupContainer}>
            <Text style={styles.groupTitle}>{item.nombre} ({item.cantidad})</Text>
            {item.productos.map(producto => (
              <View key={producto.id} style={styles.productContainer}>
                <Image
                  source={{ uri: producto.productoOriginal?.imagenURL || 'default_image_url' }}
                  style={styles.productImage}
                />
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{producto.productoOriginal?.nombre || 'Producto sin nombre'}</Text>
                  <Text style={styles.productPrice}>
                    ${producto.productoOriginal?.precio?.toFixed(2) || '0.00'}
                  </Text>
                </View>
                <View style={styles.actionsRow}>
                  <TouchableOpacity onPress={() => toggleSelection(producto.id || '')}>
                    <Ionicons
                      name={producto.isComprado ? 'radio-button-on' : 'radio-button-off'}
                      size={24}
                      color={producto.isComprado ? '#4CAF50' : '#888'}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.buyButton}
                    onPress={() => handleBuyProduct(producto)}
                  >
                    <Text style={styles.buyButtonText}>Comprar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      />
    ) : (
      <FlatList
        data={detailedProducts}
        keyExtractor={(item) => item.id || ''}
        renderItem={({ item }) => (
          <View style={styles.productContainer}>
            <Image
              source={{ uri: item.productoOriginal?.imagenURL || 'default_image_url' }}
              style={styles.productImage}
            />
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{item.productoOriginal?.nombre || 'Producto sin nombre'}</Text>
              <Text style={styles.productPrice}>
                ${item.productoOriginal?.precio?.toFixed(2) || '0.00'}
              </Text>
            </View>
            <View style={styles.actionsRow}>
              <TouchableOpacity onPress={() => toggleSelection(item.id || '')}>
                <Ionicons
                  name={item.isComprado ? 'radio-button-on' : 'radio-button-off'}
                  size={24}
                  color={item.isComprado ? '#4CAF50' : '#888'}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.buyButton}
                onPress={() => handleBuyProduct(item)}
              >
                <Text style={styles.buyButtonText}>Comprar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    )}


      {/* Montos */}
      <View style={styles.totalsContainer}>
        <Text style={styles.totalText}>Monto total de la lista: $0.00</Text>
        <Text style={styles.totalText}>
          Monto total de artículos seleccionados: ${totalSelected.toFixed(2)}
        </Text>
        <Text style={styles.totalText}>Presupuesto: $0.00</Text>
      </View>

      {/* Botón para abrir el popup */}
      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
        <Ionicons name="add-circle" size={40} color="#2E7D32" />
        <Text style={styles.addButtonText}>Agregar producto</Text>
      </TouchableOpacity>

      {/* Modal */}
      <Modal visible={isModalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Catálogo de productos</Text>
            <ScrollView contentContainerStyle={styles.productsGrid}>
              {catalogProducts.map((product) => (
                <TouchableOpacity
                  key={product.id}
                  style={styles.productItem}
                  onPress={() => {
                    const productoLista = new ProductoLista(
                      undefined, // ID opcional
                      product.id || null, // Referencia al ID del Producto
                      1, // Cantidad inicial
                      selectedList?.id || null, // ID de la lista desde `useLocalSearchParams`
                      false, // Inicializa como no comprado
                      null, // Usuario asignado, opcional
                      new Date() // Fecha de creación/actualización
                    );

                    // Llama a la función con el nuevo objeto ProductoLista
                    addProductoToList(productoLista, 1);
                    console.log("added product to list:")
                    console.log(productoLista)
                  }}

                >
                  <Image source={{ uri: product.imagenURL || 'https://via.placeholder.com/150' }} style={styles.productImage} />
                  <Text style={styles.productName}>{product.nombre}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.newProductButton}
              onPress={() => {
                setModalVisible(false);
                router.push('/agregarproducto');
              }}
            >
              <MaterialIcons name="add-circle-outline" size={48} color="#2E7D32" />
              <Text style={styles.newProductText}>Nuevo producto</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal >
    </View >
  );
};



const styles = StyleSheet.create({
  titlecontainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    height: "auto"
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
    paddingTop: 50,
  },
  menuIcon: {
    position: 'absolute',
    top: 10,
    left: 330,
    zIndex: 1100, // Asegúrate de que esté por encima de otros elementos
    padding: 10,  // Incrementa el área táctil
  },
  menuContainer: {
    position: 'absolute',
    top: 50,
    left: 0,
    width: '80%',
    height: '100%',
    backgroundColor: '#fff',
    padding: 16,
    zIndex: 1000,
  },
  menuButton: {
    backgroundColor: '#256847',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },
  menuButtonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  deleteButton: {
    backgroundColor: '#C73E3C',
    borderRadius: 20,
    padding: 16,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'left',
    paddingRight: 15,
    marginLeft: 15,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
    marginLeft: 8,
    fontSize: 16,
  },
  productContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 8,
  },
  productImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 16,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  productPrice: {
    fontSize: 14,
    color: '#888',
  },
  totalsContainer: {
    marginTop: 16,
  },
  totalText: {
    fontSize: 16,
    marginVertical: 4,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  addButtonText: {
    fontSize: 16,
    marginLeft: 8,
    color: '#2E7D32',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 8,
    padding: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  productItem: {
    alignItems: 'center',
    marginBottom: 16,
  },
  newProductButton: {
    alignItems: 'center',
    marginTop: 16,
  },
  newProductText: {
    marginTop: 8,
    fontSize: 16,
    color: '#2E7D32',
  },
  closeButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#C73E3C',
    fontSize: 16,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  buyButton: {
    marginLeft: 16,
    backgroundColor: '#2E7D32',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  buyButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  searchGroupContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  
  searchContainer2: {
    flex: 1, // ← para que el TextInput ocupe todo el espacio posible
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 8,
    marginRight: 8, // ← separación del botón
  },
  
  searchInput2: {
    flex: 1,
    paddingVertical: 8,
    marginLeft: 8,
    fontSize: 16,
  },
  
  groupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0f2e9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  
  groupButtonText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: 'bold',
  },
  groupContainer: {
    marginBottom: 16,
    backgroundColor: '#e0f2f1',
    padding: 10,
    borderRadius: 8,
  },
  groupTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
});


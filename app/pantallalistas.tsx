import React, { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import {
  View,
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
import { addProductoToList, getProductoById, getProductos, getProductosByCategory, getProductosByListId, markProductoAsComprado } from '@/services/Products';
import { ProductoLista } from '@/models/ProductsList';
import { getPurchaseHistoryByFilters, getPurchaseHistoryByDateRange, createPurchaseHistory } from '@/services/purchasehistory';
import { PurchaseHistory } from '@/models/PurchaseHistory';
import { getUserIdFromSession } from '@/services/auth';

export default function ListScreen(){

  const [userId, setUserId] = useState<string | null>(null);
  const { id } = useLocalSearchParams();
  const [selectedList, setSelectedList] = useState<List>(); // Estado de carga
  const [catalogProducts, setcatalogProducts] = useState<Producto[]>([]); // Estado de carga
  const [loadChanges, setLoadChanges] = useState<boolean>(); // Estado de carga
  const [suggestedProducts, setSuggestedProducts] = useState<Producto[]>([]);
  const [isSuggestedVisible, setSuggestedVisible] = useState(false);
  const [relatedSuggestions, setRelatedSuggestions] = useState<Producto[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  
  const fetchList = async (listID: string) => {
    try {
      const listSelected = await getListById(listID);
      setSelectedList(listSelected || undefined); // Si no hay lista, asigna undefined
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
  
  const [products, setProducts] = useState<ProductoLista[]>([]); // Estado de carga
  
  const fetchProductInList = async (listID: string) => {
    try {
      const AllProductsInList = await getProductosByListId(listID);
      setProducts(AllProductsInList || undefined); // Si no hay lista, asigna undefined
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

      // Extract categories from the detailed products
      const productCategories = filteredResults
        .map(product => product.productoOriginal?.categoria)
        .filter((category): category is string => category !== undefined && category !== null);
      
      // Remove duplicates from categories array
      const uniqueCategories = [...new Set(productCategories)];
      setCategories(uniqueCategories);

      // Fetch related products based on the categories
      if (uniqueCategories.length > 0) {
        await loadRelatedSuggestions(uniqueCategories);
      }
    } catch (error) {
      console.error('Error loading detailed products:', error);
    }
  };

  // Function to load suggested products based on categories
  const loadRelatedSuggestions = async (categories: string[]) => {
    try {
      const allSuggestions: Producto[] = [];
      
      // Fetch products for each category
      for (const category of categories) {
        const products = await getProductosByCategory(category);
        allSuggestions.push(...products);
      }
      
      // Filter out products that are already in the list
      const existingProductIds = detailedProducts.map(product => product.productoId);
      const filteredSuggestions = allSuggestions.filter(product => 
        !existingProductIds.includes(product.id as any)
      );
      // Remove duplicates (products might appear in multiple categories)
      const uniqueSuggestions = filteredSuggestions.filter((product, index, self) =>
        index === self.findIndex(p => p.id === product.id)
      );
      
      // Limit to a reasonable number of suggestions (e.g., 10)
      const limitedSuggestions = uniqueSuggestions.slice(0, 10);
      
      setRelatedSuggestions(limitedSuggestions);
    } catch (error) {
      console.error('Error loading related product suggestions:', error);
    }
  };
  
  const getGroupedProducts = () => {
    const groupedByCategory: { [key: string]: DetailedProduct[] } = {};
  
    detailedProducts.forEach(product => {
      const categoria = product.productoOriginal?.categoria || 'Sin categoría'; // Agrupar por categoría
      if (!groupedByCategory[categoria]) {
        groupedByCategory[categoria] = [];
      }
      groupedByCategory[categoria].push(product);
    });
  
    return Object.entries(groupedByCategory).map(([categoria, items]) => ({
      categoria,
      cantidad: items.length,
      productos: items,
    }));
  };
  
  const [selectedProducts, setSelectedProducts] = useState<{ [id: string]: boolean }>({});

  useEffect(() => {
    if (products.length > 0) {
      loadDetailedProducts(products); // Llama al método con la lista de productos
    }
  }, [products, loadChanges]);

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

  const handleAddSuggestion = async (product: Producto) => {
    try {
      const productoLista = new ProductoLista(
        undefined, // ID opcional
        product.id || null, // Referencia al ID del Producto
        1, // Cantidad inicial
        selectedList?.id || null, // ID de la lista
        false, // Inicializa como no comprado
        null, // Usuario asignado, opcional
        new Date() // Fecha de creación/actualización
      );

      await addProductoToList(productoLista, 1);
      Alert.alert('Éxito', '¡Producto agregado a la lista!');
      
      // Refresh the list to show the new product
      if (id && typeof id === 'string') {
        fetchProductInList(id);
      }
    } catch (error) {
      console.error('Error al agregar producto sugerido:', error);
      Alert.alert('Error', 'Hubo un problema al agregar el producto. Inténtalo de nuevo.');
    }
  };

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

  const fetchProductos = async () => {
    try {
      const allproducts = await getProductos();
      setcatalogProducts(allproducts); // Si no hay lista, asigna undefined
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
      {/* Botón de menú hamburguesa */}
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
        keyExtractor={(item) => item.categoria}
        renderItem={({ item }) => (
          <View style={styles.groupContainer}>
            <Text style={styles.groupTitle}>{item.categoria} ({item.cantidad})</Text>
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

      {/* Sugerencias basadas en categorías de la lista */}
      {relatedSuggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <Text style={styles.suggestionsTitle}>Productos sugeridos según tu lista:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {relatedSuggestions.map((product) => (
              <TouchableOpacity
                key={product.id}
                style={styles.suggestionItem}
                onPress={() => handleAddSuggestion(product)}
              >
                <Image
                  source={{ uri: product.imagenURL || 'default_image_url' }}
                  style={styles.suggestionImage}
                />
                <Text style={styles.suggestionName} numberOfLines={2}>{product.nombre}</Text>
                <Text style={styles.suggestionPrice}>${product.precio?.toFixed(2) || '0.00'}</Text>
                <TouchableOpacity
                  style={styles.addSuggestionButton}
                  onPress={() => handleAddSuggestion(product)}
                >
                  <Text style={styles.addSuggestionButtonText}>Agregar</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
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
                      selectedList?.id || null, // ID de la lista desde useLocalSearchParams
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
                router.push('/nuevoagregarproducto');
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
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  menuIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
  },
  titlecontainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  searchGroupContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  searchContainer2: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    borderRadius: 20,
    flex: 1,
    height: 40,
    marginRight: 10,
  },
  searchInput2: {
    marginLeft: 5,
    flex: 1,
  },
  groupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0f2e0',
    padding: 8,
    borderRadius: 20,
  },
  groupButtonText: {
    marginLeft: 5,
    color: '#2E7D32',
    fontWeight: 'bold',
  },
  productContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    marginBottom: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  productImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
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
    color: '#666',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buyButton: {
    backgroundColor: '#2E7D32',
    padding: 6,
    borderRadius: 5,
    marginLeft: 10,
  },
  buyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  totalsContainer: {
    backgroundColor: '#fff',
    padding: 5,
    borderRadius: 10,
    marginVertical: 10,
  },
  totalText: {
    fontSize: 14,
    marginBottom: 5,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e0f2e0',
    padding: 10,
    borderRadius: 10,
  },
  addButtonText: {
    marginLeft: 10,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    width: '90%',
    borderRadius: 10,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  productItem: {
    width: '45%',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
    alignItems: 'center',
  },
  closeButton: {
    backgroundColor: '#e0e0e0',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  closeButtonText: {
    fontWeight: 'bold',
  },
  menuContainer: {
    position: 'absolute',
    top: 50,
    right: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menuButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  menuButtonText: {
    color: '#333',
    fontWeight: 'bold',
  },
  deleteButton: {
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    backgroundColor: '#ffebee',
  },
  deleteButtonText: {
    color: '#d32f2f',
    fontWeight: 'bold',
  },
  groupContainer: {
    backgroundColor: '#e0f2e0',
    marginBottom: 10,
    borderRadius: 10,
    padding: 10,
  },
  groupTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2E7D32',
  },
  newProductButton: {
    alignItems: 'center',
    padding: 10,
    marginBottom: 10,
  },
  newProductText: {
    marginTop: 5,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  // Styles for the suggestions section
  suggestionsContainer: {
    backgroundColor: '#e8f5e9',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 10,
  },
  suggestionItem: {
    width: 150,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    marginRight: 10,
    alignItems: 'center',
  },
  suggestionImage: {
    width: 20,
    height: 20,
    borderRadius: 5,
    marginBottom: 8,
  },
  suggestionName: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    height: 40,
  },
  suggestionPrice: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  addSuggestionButton: {
    backgroundColor: '#2E7D32',
    padding: 6,
    borderRadius: 5,
    width: '80%',
    alignItems: 'center',
  },
  addSuggestionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  scrollContainer: {
    marginBottom: 10,
  },
  iconContainer: {
    flexDirection: 'row',
    paddingVertical: 10,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  iconImage: {
    width: 40,
    height: 40,
  },
  selectedIcon: {
    borderWidth: 2,
    borderColor: '#2E7D32',
  },
  detailsContainer: {
    marginVertical: 15,
  },
  input: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  suggestedContainer: {
    marginTop: 20,
  },
  suggestedTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  suggestedProductContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
    marginBottom: 5,
    alignItems: 'center',
  },
  suggestedImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  suggestedProductName: {
    flex: 1,
    fontWeight: 'bold',
  },
  suggestedProductPrice: {
    color: '#2E7D32',
    fontWeight: 'bold',
  } })

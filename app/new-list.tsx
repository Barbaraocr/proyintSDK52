import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Image, Modal, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { getProductos } from '@/services/Products'; // Asegúrate de colocar la ruta correcta al servicio
import { Producto } from '@/models/Products';
import { createList } from '@/services/lists';
import { List } from '@/models/Lists';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const CrearNuevaLista = () => {
  const [nombreLista, setNombreLista] = useState('');
  const [isShared, setIsShared] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [presupuesto, setPresupuesto] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(0);
  const [productos, setProductos] = useState<Producto[]>([]); // Estado para los productos
  const [selectedProductos, setSelectedProductos] = useState<Producto[]>([]); // Estado para productos seleccionados

  const router = useRouter();
  const toggleSwitch = () => setIsShared(previousState => !previousState);
  const toggleSelectProducto = (producto: Producto) => {
    setSelectedProductos(prev =>
      prev.some(p => p.id === producto.id)
        ? prev.filter(p => p.id !== producto.id)
        : [...prev, producto]
    );
  };

  // Log para ver productos seleccionados después de cada actualización
  useEffect(() => {
    console.log("Productos seleccionados:", selectedProductos);
  }, [selectedProductos]);
  // Función para obtener productos al montar el componente
  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const productosData = await getProductos();
        setProductos(productosData);
      } catch (error) {
        console.error("Error al obtener productos:", error);
      }
    };
    fetchProductos();
  }, []);

  // Renderizado de cada producto en la cuadrícula
  const renderProducto = ({ item }: { item: Producto }) => (
    <TouchableOpacity style={styles.iconWrapper} onPress={() => toggleSelectProducto(item)}>
      <View style={styles.checkboxContainer}>
        <View style={selectedProductos.find(p => p.id === item.id) ? styles.checkboxSelected : styles.checkbox} />
      </View>
      <Image
        source={{ uri: item.imagenURL ?? '../../assets/images/favicon.png' }}
        style={styles.icon}
      />
      <Text style={styles.iconLabel}>{item.nombre}</Text>
    </TouchableOpacity>
);
const handleCreateList = async () => {
  if (!nombreLista || !presupuesto) {
    Alert.alert('Error', 'Por favor llena todos los campos requeridos.');
    return;
  }

  try {
    // Crear una nueva instancia de la clase List
    const nuevaLista = new List(
      null, // Deja el id como null para que Firestore lo genere
      parseFloat(presupuesto),
      new Date(),
      nombreLista,
      [], // usersInList se gestionará automáticamente en el servicio
      [], // Puedes añadir categorías si es necesario
      selectedProductos.length, // montoArticulos
      0, // montoLista, ajusta si tienes lógica para calcularlo
      isShared ? 'shared' : 'private', // status
      0 // totalPrice, ajusta si tienes lógica para calcular precios
    );
    const productosSeleccionadosIds = selectedProductos
    .map(producto => producto.id)
    .filter((id): id is string => id !== undefined);
        await createList(nuevaLista, productosSeleccionadosIds); // Pasar la instancia de List al servicio
    
    Alert.alert('Éxito', 'Lista creada exitosamente.');
    setModalVisible(false);
    setNombreLista('');
    setPresupuesto('');
    setSelectedProductos([]);
  } catch (error) {
    console.error("Error al crear la lista:", error);
    Alert.alert('Error', 'Hubo un problema al crear la lista.');
  }
};

  return (
    <View style={styles.container}>

      <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, alignSelf: 'flex-start' }} 
      onPress={() => router.navigate('/')}
  >
    <Ionicons name="arrow-back" size={24} color="#256847" />
    <Text style={{ marginLeft: 8, color: '#256847', fontWeight: 'bold' }}>Inicio</Text>
  </TouchableOpacity>

      <Text style={styles.title}>Crear nueva lista</Text>
      
      <Text style={styles.label}>Nombre de la lista</Text>
      <TextInput
        style={styles.input}
        placeholder="Escribe aquí"
        value={nombreLista}
        onChangeText={setNombreLista}
      />

      <Text style={styles.label}>Lista compartida</Text>
      <View style={styles.switchContainer}>
        <Text style={[styles.switchLabel, isShared && styles.activeLabel]}>Sí</Text>
        <Switch
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={isShared ? "#f5dd4b" : "#f4f3f4"}
          onValueChange={toggleSwitch}
          value={isShared}
        />
        <Text style={[styles.switchLabel, !isShared && styles.activeLabel]}>No</Text>
      </View>

      {/* FlatList para mostrar productos en cuadrícula */}
      <FlatList
        data={productos}
        renderItem={renderProducto}
        keyExtractor={(_, index) => index.toString()}
        numColumns={4} // 4 columnas
        contentContainerStyle={styles.iconContainer}
      />
      <TouchableOpacity style={styles.addButton} onPress={() => {
        router.navigate("/agregarproducto");
      }}>
        <Text style={styles.addButtonText}>Nuevo producto</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.nextButton}
        onPress={() => setModalVisible(true)}>
        <Text style={styles.nextButtonText}>Siguiente</Text>
      </TouchableOpacity>

      {/* Start Modal View*/}
      <SafeAreaProvider>
        <SafeAreaView>
          <Modal
            animationType='slide'
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => {
              Alert.alert('Modal has been closed.');
              setModalVisible(!modalVisible);
          }}>
            <View style={styles.centeredView}>
              <View style={styles.modalView}>

                <View style={styles.container}>
                  <TouchableOpacity style={styles.backButton}>
                    <Text style={styles.backText}
                      onPress={() => {setModalVisible(!modalVisible)}}
                    >{"X"}</Text>
                  </TouchableOpacity>

                  <Text style={styles.label}>Escoge icono</Text>
                  
                  
                  <Text style={styles.label}>Selecciona el presupuesto de la lista:</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="$"
                    keyboardType="numeric"
                    value={presupuesto}
                    onChangeText={setPresupuesto}
                  />

                  <TouchableOpacity style={styles.createButton}>
                    <Text style={styles.createButtonText} onPress={handleCreateList}>Crear lista</Text>
                  </TouchableOpacity>
                </View>

              </View>
            </View>
          </Modal>
        </SafeAreaView>
      </SafeAreaProvider>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    borderRadius: 4,
    marginBottom: 16,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  switchLabel: {
    fontSize: 16,
    marginHorizontal: 8,
  },
  checkboxContainer: {
    position: 'absolute',
    top: 4,
    right: 4,
    zIndex: 1,
  },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ccc',
    backgroundColor: 'white',
  },
  checkboxSelected: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#4CAF50',
  },
  activeLabel: {
    color: '#81b0ff',
  },
  iconContainer: {
    paddingBottom: 20,
  },
  iconWrapper: {
    flex: 1,
    alignItems: 'center',
    margin: 4,
    maxWidth: '25%', // Ajuste para cada columna
  },
  icon: {
    width: 50,
    height: 50,
    marginBottom: 4,
  },
  iconLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  addButton: {
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
    marginBottom: 20,
  },
  addButtonText: {
    fontSize: 16,
    color: '#4CAF50',
  },
  nextButton: {
    alignItems: 'center',
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#4CAF50',
  },
  nextButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'gray',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  backText: {
    fontSize: 24,
    color: '#4CAF50',
  },
  iconButton: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#4CAF50',
    marginHorizontal: 5,
  },
  iconButtonSelected: {
    backgroundColor: '#3e8e41',
  },
  iconText: {
    fontSize: 16,
    color: '#fff',
  },
  createButton: {
    alignItems: 'center',
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#4CAF50',
    marginTop: 20,
  },
  createButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default CrearNuevaLista;
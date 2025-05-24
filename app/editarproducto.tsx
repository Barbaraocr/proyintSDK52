import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { router, SearchParams, useLocalSearchParams } from 'expo-router';
import { deleteProducto, getProductoById, modifyProducto } from '@/services/Products';

const EditProductScreen: React.FC = () => {
  const { id } = useLocalSearchParams();
  const handleDelete = async () => {
  if (!idString) return;

  try {
    await deleteProducto(idString);
    alert("Producto eliminado correctamente");
    router.back(); // Vuelve a la pantalla anterior
  } catch (error) {
    console.error("Error al eliminar el producto:", error);
    alert("Error al eliminar el producto");
  }
};

  const [product, setProduct] = useState<any>(null); 
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [supermarket, setSupermarket] = useState('');
  const [price, setPrice] = useState('');
  const idString = Array.isArray(id) ? id[0] : id;


  useEffect(() => {
    const fetchProduct = async () => {
      if (id) {
        try {
          const fetchedProduct = await getProductoById(idString  );
          console.log(fetchedProduct) // producto
          if (fetchedProduct) {
            setProduct(fetchedProduct);
            setName(fetchedProduct.nombre || ''); // Asigna un valor válido
            setCategory(fetchedProduct.categoria || ''); // Asigna un valor válido
            setPrice(fetchedProduct.precio ? String(fetchedProduct.precio) : '');
            setSupermarket(fetchedProduct.supermercado ? String(fetchedProduct.supermercado) : '');
          } else {
            console.log('Producto no encontrado');
          }
        } catch (error) {
          console.log('Error al cargar el producto');

        }
      }
    };

    fetchProduct();
  }, [id]);

  const handleSave = async () => {
  if (!idString) return;

  try {
    await modifyProducto(idString, {
      nombre: name,
      categoria: category,
      supermercado: supermarket,
      precio: parseFloat(price),
    });

    console.log("Producto actualizado:", { name, category, supermarket, price });
    alert("Cambios guardados correctamente");
    router.back(); // Opcional: vuelve a la pantalla anterior
  } catch (error) {
    console.error("Error al actualizar el producto:", error);
    alert("Error al guardar los cambios");
  }
};

  if (!product) {
    return <Text>Cargando información del producto...</Text>;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        </TouchableOpacity>
        <Text style={styles.title}>Editar producto</Text>
      </View>

      <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
        <Text style={styles.deleteButtonText}>Eliminar producto</Text>
      </TouchableOpacity>


      {/* Formulario para editar el producto */}
      <View style={styles.formContainer}>
        <View style={styles.inputContainer}>
          <Text>Nombre:</Text>
          <TextInput
            style={styles.input}
            placeholder="Escribe aquí"
            value={name}
            onChangeText={setName}
          />
        </View>
        <View style={styles.inputContainer}>
          <Text>Categoría:</Text>
          <TextInput
            style={styles.input}
            placeholder="Escribe aquí"
            value={category}
            onChangeText={setCategory}
          />
        </View>
        <View style={styles.inputContainer}>
          <Text>Supermercado:</Text>
          <TextInput
            style={styles.input}
            placeholder="Selecciona"
            value={supermarket}
            onChangeText={setSupermarket}
          />
        </View>
        <View style={styles.inputContainer}>
          <Text>Precio:</Text>
          <TextInput
            style={styles.input}
            placeholder="Escribe aquí"
            keyboardType="numeric"
            value={String(price)}
            onChangeText={(text) => setPrice(text)}
          />
        </View>
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Aceptar cambios</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.saveButton} 
      onPress={() => router.navigate('/comparacionprecios')}>
        <Text style={styles.saveButtonText}>Comparador de precios</Text>
      </TouchableOpacity>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  deleteButton: {
    alignSelf: 'flex-end',
    backgroundColor: '#BE0000',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  formContainer: {
    backgroundColor: '#F0F0F0',
    padding: 16,
    borderRadius: 8,
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#CCCCCC',
    paddingVertical: 4,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#2E7D32',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default EditProductScreen;


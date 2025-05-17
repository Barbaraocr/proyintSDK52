import React from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface ProductDetails {
    name: string;
    category: string;
    supermarket: string;
    price: string;
    userList: string;
}

const product: ProductDetails = {
    name: 'Leche Entera',
    category: 'Lácteos',
    supermarket: 'Supermercado Ejemplo',
    price: '$1.50',
    userList: 'Lista de Compras',
};

const ProductDetailsScreen: React.FC = () => {
    const router = useRouter();
    return (
        <View style={styles.container}>
            {/* Circular Product Image */}
            <Image
                source={{ uri: 'https://via.placeholder.com/100' }} // Cambia esto por la URL de la imagen del producto
                style={styles.productImage}
            />
            <Text style={styles.productLabel}>Producto</Text>

            {/* Product Details Display */}
            <View style={styles.detailsContainer}>
                <Text style={styles.detailText}>Nombre del producto: {product.name}</Text>
                <Text style={styles.detailText}>Categoría: {product.category}</Text>
                <Text style={styles.detailText}>Supermercado: {product.supermarket}</Text>
                <Text style={styles.detailText}>Precio: {product.price}</Text>
                <Text style={styles.detailText}>Lista: {product.userList}</Text>
            </View>

            {/* Compare Prices Button */}
            <TouchableOpacity style={styles.compareButton}
            onPress={() => router.push('/editarproducto')}>
                <Text style={styles.compareButtonText}>Editar Producto</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
        alignItems: 'center',
        padding: 20,
    },
    productImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 10,
    },
    productLabel: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2E7D32',
        marginBottom: 20,
    },
    detailsContainer: {
        width: '100%',
        backgroundColor: '#f2f2f2',
        borderRadius: 10,
        padding: 15,
        marginBottom: 20,
    },
    detailText: {
        fontSize: 16,
        color: '#333333',
        marginBottom: 10,
    },
    compareButton: {
        backgroundColor: '#2E7D32',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        width: '100%',
    },
    compareButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default ProductDetailsScreen;

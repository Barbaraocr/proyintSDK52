import React from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const suggestions = [
  { id: '1', image: require('../assets/product.png'), liked: true },
  { id: '2', image: require('../assets/product.png'), liked: true },
  { id: '3', image: require('../assets/product.png'), liked: true },
  { id: '4', image: require('../assets/product.png'), liked: true },
  { id: '5', image: require('../assets/product.png'), liked: false },
];

const tryProducts = [
  { id: '6', image: require('../assets/product.png') },
  { id: '7', image: require('../assets/product.png') },
  { id: '8', image: require('../assets/product.png') },
  { id: '9', image: require('../assets/product.png') },
  { id: '10', image: require('../assets/product.png') },
  { id: '11', image: require('../assets/product.png') },
  { id: '12', image: require('../assets/product.png') },
  { id: '13', image: require('../assets/product.png') },
];

export default function SuggestedScreen() {
  const navigation = useNavigation();

  const renderSuggestion = ({ item }: any) => (
    <View style={styles.productContainer}>
      <Image source={item.image} style={styles.productImage} />
      <Text style={styles.productText}>Producto</Text>
      <Ionicons
        name={item.liked ? 'checkmark-circle' : 'close-circle'}
        size={24}
        color={item.liked ? 'green' : 'red'}
        style={styles.icon}
      />
    </View>
  );

  const renderTryProduct = ({ item }: any) => (
    <View style={styles.tryProductContainer}>
      <Image source={item.image} style={styles.productImage} />
      <Text style={styles.productText}>Producto</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Ionicons name="chevron-back" size={28} color="white" />
      </TouchableOpacity>

      <View style={styles.card}>
        <Text style={styles.title}>Sugerencias para ti</Text>
        <FlatList
          data={suggestions}
          horizontal
          keyExtractor={(item) => item.id}
          renderItem={renderSuggestion}
          showsHorizontalScrollIndicator={false}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Tal vez quieras probar</Text>
        <FlatList
          data={tryProducts}
          numColumns={4}
          keyExtractor={(item) => item.id}
          renderItem={renderTryProduct}
          contentContainerStyle={styles.tryList}
        />
      </View>

      <View style={styles.bottomNav}>
        <Ionicons name="home-outline" size={24} color="black" />
        <Ionicons name="flame-outline" size={24} color="black" />
        <Ionicons name="settings-outline" size={24} color="black" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E6F0E9' },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 10,
  },
  card: {
    backgroundColor: 'white',
    marginTop: 100,
    marginHorizontal: 20,
    borderRadius: 10,
    padding: 10,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 10,
    color: '#607060',
  },
  productContainer: {
    alignItems: 'center',
    marginHorizontal: 8,
  },
  tryProductContainer: {
    alignItems: 'center',
    width: '25%',
    marginBottom: 20,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 50,
    marginBottom: 5,
  },
  productText: {
    fontSize: 12,
    textAlign: 'center',
  },
  icon: {
    position: 'absolute',
    bottom: -10,
    right: -10,
  },
  tryList: {
    alignItems: 'center',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 10,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderTopColor: '#ccc',
    borderTopWidth: 1,
    backgroundColor: '#fff',
  },
});

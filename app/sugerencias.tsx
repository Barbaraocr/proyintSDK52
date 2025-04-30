import React, { useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { CheckBox } from 'react-native-elements';
import { useNavigation } from '@react-navigation/native';

const suggestions = [
  { id: '1', image: require('../assets/product.png'), selected: true },
  { id: '2', image: require('../assets/product.png'), selected: true },
  { id: '3', image: require('../assets/product.png'), selected: true },
  { id: '4', image: require('../assets/product.png'), selected: false },
  { id: '5', image: require('../assets/product.png'), selected: false },
];

const tryProducts = [
  { id: '6', image: require('../assets/product.png'), selected: false },
  { id: '7', image: require('../assets/product.png'), selected: false },
  { id: '8', image: require('../assets/product.png'), selected: false },
  { id: '9', image: require('../assets/product.png'), selected: false },
  { id: '10', image: require('../assets/product.png'), selected: false },
  { id: '11', image: require('../assets/product.png'), selected: false },
  { id: '12', image: require('../assets/product.png'), selected: false },
  { id: '13', image: require('../assets/product.png'), selected: false },
];

export default function SuggestedScreen() {
  const navigation = useNavigation();
  const [selectedSuggestions, setSelectedSuggestions] = useState(suggestions);
  const [selectedTries, setSelectedTries] = useState(tryProducts);

  const toggleCheck = (id: string, listType: 'suggestions' | 'tries') => {
    const list = listType === 'suggestions' ? selectedSuggestions : selectedTries;
    const updatedList = list.map((item) =>
      item.id === id ? { ...item, selected: !item.selected } : item
    );
    listType === 'suggestions' ? setSelectedSuggestions(updatedList) : setSelectedTries(updatedList);
  };

  const renderProduct = ({ item }: any, listType: 'suggestions' | 'tries') => (
    <View style={styles.productContainer}>
      <Image source={item.image} style={styles.productImage} />
      <Text style={styles.productText}>Producto</Text>
      <CheckBox
        checked={item.selected}
        onPress={() => toggleCheck(item.id, listType)}
        containerStyle={{ backgroundColor: 'transparent', borderWidth: 0, padding: 0 }}
        style={{ alignSelf: 'center' }}
      />
    </View>
  );

  return (
    <View style={styles.fullContainer}>
      {/* Parte verde superior curva */}
      <View style={styles.greenHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Sugerencias para ti</Text>
          <FlatList
            data={selectedSuggestions}
            horizontal
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => renderProduct({ item }, 'suggestions')}
            showsHorizontalScrollIndicator={false}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Tal vez quieras probar</Text>
          <FlatList
            data={selectedTries}
            numColumns={4}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => renderProduct({ item }, 'tries')}
            contentContainerStyle={styles.tryList}
          />
        </View>
      </View>
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
});

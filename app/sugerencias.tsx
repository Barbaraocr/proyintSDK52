import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { CheckBox } from 'react-native-elements';
import { useNavigation } from '@react-navigation/native';
import { getSuggestedProductsByRecentCategories } from '../services/Products';
import { Producto } from '../models/Products';
import { getAuth } from 'firebase/auth';

export default function SuggestedScreen() {
  const navigation = useNavigation();
  const [suggestedProducts, setSuggestedProducts] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSuggestions, setSelectedSuggestions] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const user = getAuth().currentUser;
        if (!user) return;

        const products = await getSuggestedProductsByRecentCategories(user.uid);
        setSuggestedProducts(products);
        const initialSelection = Object.fromEntries(products.map(p => [p.id!, true]));
        setSelectedSuggestions(initialSelection);
      } catch (error) {
        console.error('Error fetching suggested products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, []);

  const toggleCheck = (id: string) => {
    setSelectedSuggestions(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
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
        onPress={() => toggleCheck(item.id!)}
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

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  StyleSheet,
  FlatList,
  Dimensions,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { auth } from "@/firebaseConfig";
import { getUserIdFromSession } from "../../services/auth";
import { getIndividualListsByUserId, getCollaborativeListsByUserId, getRandomIconUrl } from "../../services/lists";
import { List } from "../../models/Lists";
import Ionicons from "@expo/vector-icons/Ionicons";

const { width } = Dimensions.get("window");

const HomeScreen: React.FC = () => {
  const router = useRouter();
  const [myLists, setMyLists] = useState<List[]>([]);
  const [ourLists, setOurLists] = useState<List[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [iconsMap, setIconsMap] = useState<Record<string, string>>({}); // Almacena los íconos aleatorios

  // Obtener listas del usuario
  const fetchIndividualLists = async (userId: string) => {
    try {
      const lists = await getIndividualListsByUserId(userId);
      setMyLists(lists);
      fetchIconsForLists(lists);
    } catch (error) {
      console.error("Error fetching individual lists:", error);
    }
  };

  // Obtener listas colaborativas
  const fetchCollaborativeLists = async (userId: string) => {
    try {
      const lists = await getCollaborativeListsByUserId(userId);
      setOurLists(lists);
      fetchIconsForLists(lists);
    } catch (error) {
      console.error("Error fetching collaborative lists:", error);
    }
  };

  // Obtener íconos aleatorios para cada lista

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user: any) => {
      if (user) {
        const userId = await getUserIdFromSession();
        if (userId) {
          setLoading(true);
          await fetchIndividualLists(userId);
          await fetchCollaborativeLists(userId);
          setLoading(false);
        }
      } else {
        setMyLists([]);
        setOurLists([]);
      }
    });
    return unsubscribe;
  }, []);

  const handleShareList = (listId: string) => {
    router.push(`/pantallalistas?id=${listId}`);
  };

  const fetchIconsForLists = async (lists: List[]) => {
    const newIconsMap: Record<string, string> = {};
    for (let i = 0; i < lists.length; i++) {
      const list = lists[i];
      const iconUrl = await getRandomIconUrl();
      const key = list.id ?? `generated-key-${i}`; // Usar list.id si existe; de lo contrario, genera una clave única.
      newIconsMap[key] = iconUrl || ""; // Asocia un ícono a cada lista.
    }
    setIconsMap((prev) => ({ ...prev, ...newIconsMap })); // Agrega los íconos al estado.
  };

  const renderListItem = (list: List, index: number) => {
    const key = list.id ?? `generated-key-${index}`; // Obtén la clave única para esta lista.
    const iconUrl = iconsMap[key]; // Obtén el ícono correspondiente.

    return (
      <TouchableOpacity onPress={() => handleShareList(list.id ?? "")}>
        <View style={styles.listItemContainer}>
          <View style={styles.listFrame}>
            {iconUrl && (
              <Image
                source={{ uri: iconUrl }}
                style={styles.iconImage}
                resizeMode="cover"
              />
            )}
          </View>
          <Text style={styles.listText}>{list.listName}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#256847" />
      <SafeAreaView style={styles.container}>
        <View style={styles.searchFrame}>
          <TextInput
            style={styles.searchBar}
            placeholder="Buscar lista..."
            placeholderTextColor="#A9A9A9"
          />
        </View>
        <View style={styles.listsContainer}>
          <View style={styles.sectionFrame}>
          <View style={styles.tagContainer}>
                <Text style={styles.sectionTag}>Mis Listas</Text>
              </View>
            {loading ? (
              <Text>Cargando...</Text>
            ) : (
              <FlatList
                horizontal
                data={myLists}
                renderItem={({ item, index }) => renderListItem(item, index)} // Pasar índice.
                keyExtractor={(item, index) => item.id ?? `default-key-${index}`} // Generar clave única.
                contentContainerStyle={styles.carouselContainer}
                showsHorizontalScrollIndicator={false}
              />
            )}
          </View>
        </View>
        <View style={styles.listsContainer}>
        <View style={styles.sectionFrame}>
              <View style={styles.tagContainer}>
                <Text style={styles.sectionTag}>Listas compartidas</Text>
              </View>
              <FlatList
                horizontal
                data={ourLists}
                renderItem={({ item, index }) => renderListItem(item, index)} // Pasar índice.
                keyExtractor={(item, index) => item.id ?? `default-key-${index}`} // Generar clave única.
                contentContainerStyle={styles.carouselContainer}
                showsHorizontalScrollIndicator={false}
              />
            </View>
            </View>

          <View style={styles.buttonsContainer}>
            {/* Botón "Crear lista" */}
            <TouchableOpacity style={styles.createListButton} onPress={() => router.push('/new-list')}>
            <Ionicons name="add-circle-outline" size={24} color="#2E7D32" />
              <Text style={styles.createListButtonText}>Crear lista</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.createListButton} onPress={() => router.push('/historialcompras')}>
              <Ionicons name="time-outline" size={24} color="#2E7D32" />
              <Text style={styles.createListButtonText}>Ver historial</Text>
            </TouchableOpacity>
          </View>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#256847', // Fondo verde para toda la pantalla
  },
  searchFrame: {
    width: '100%',
    backgroundColor: '#256847', // Color verde para el frame de búsqueda
    paddingVertical: 20, // Espacio arriba y abajo de la searchBar
    alignItems: 'center',
    justifyContent: 'center',
  },
  listsContainer: {
    flex: 1,
    backgroundColor: '#fff', // Fondo blanco para el contenedor de listas
    paddingVertical: 10, // Espacio vertical para el contenedor de listas
    alignItems: 'center', // Centrar contenido horizontalmente
  },
  listFrame: {
    width: 180, // Ancho del marco
    height: 100, // Alto del marco
    backgroundColor: "#f0f0f0", // Color de fondo (opcional)
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 25, // Redondear bordes
    overflow: "hidden", // Ocultar contenido excedente
  },
  iconImage: {
    width: "100%", // Ajustar al ancho del contenedor
    height: "100%", // Ajustar al alto del contenedor
  },
  searchBar: {
    width: width * 0.9, // 90% del ancho de la pantalla
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#f0f0f0', // Fondo gris claro para la barra de búsqueda
    color: '#000', // Color del texto de entrada
  },
  listSectionsContainer: {
    flex: 1,
    justifyContent: 'flex-start', // Alinear al inicio
    alignItems: 'flex-start', // Alinear a la izquierda para que queden más alineados
    paddingHorizontal: 10, // Ajusta el padding horizontal según sea necesario
  },
  sectionFrame: {
    width: '100%',
    paddingVertical: 10,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 20, // Aumentar el margen inferior para mayor separación
  },
  tagContainer: {
    borderRadius: 20,
    overflow: 'hidden', // Asegura que el borde redondeado se aplique correctamente
    backgroundColor: '#5F7F1E', // Verde pasto para el tag
  },
  sectionTag: {
    paddingVertical: 5,
    paddingHorizontal: 15,
    color: '#FFF',
    fontWeight: 'medium', // Cambiar a '500' para consistencia
    textAlign: 'center',
  },
  carouselContainer: {
    paddingHorizontal: 10,
  },
  listItemContainer: {
    alignItems: 'center',
    marginRight: 10,
  },

  listText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  createListButton: {
    backgroundColor: '#fff', // Fondo blanco para el botón
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginTop: 10, // Acercar el botón a las listas
    alignItems: 'center',
    justifyContent: 'center',
  },
  createListButtonText: {
    color: '#256847', // Texto verde
    fontFamily: 'Manrope',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20, // Ajustar el lineHeight si es necesario
    backgroundColor: '#fff',
    paddingVertical: 1,
    paddingHorizontal: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    flexDirection: 'row',
    gap: 5,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20, // espacio entre los botones
    paddingVertical: 20,
  },
  
});

export default HomeScreen;



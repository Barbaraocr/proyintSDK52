import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { useLocalSearchParams } from 'expo-router';
import { List } from '@/models/Lists';
import { getListById, getUsersInList } from '@/services/lists';
import { User } from "@/models/User"; // Asegúrate de importar la clase `User`
import { getUserById } from '@/services/userservices';
import { useRouter } from 'expo-router';

const CollaborationScreen = () => {
  const { id } = useLocalSearchParams();

  const router = useRouter();

  const encodeBase64 = (data: string | undefined) => {
    try {
      const decodedData = btoa(data ?? ""); // Usa una cadena vacía si `data` es undefined
      return decodedData;
    } catch (error) {
      console.error("Error codificando a Base64: ", error);
      return undefined;
    }
  };


const [collaborators, setCollaborators] = useState<User[]>([]); // Estado para los colaboradores

useEffect(() => {
  if (id && typeof id === 'string') {
    const fetchData = async () => {
      await fetchList(id); // Obtén la lista por ID
      const users = await getUsersInList(id); // Obtén los IDs de los usuarios
      console.log("Estos son los usuarios de esta lista", users); // Obtén los colaboradores de la lista

      // Obtener los datos de los usuarios y convertirlos a instancias de la clase `User`
      const usersData = await Promise.all(users.map(async (userID) => {
        const userData = await getUserById(userID);
        if (userData) {
          // Asegúrate de que cada `userData` se convierta en una instancia de `User`
          return new User(userData.email, userData.name, userID);
        }
        return null; // Si no hay datos, retorna null
      }));

      console.log("Esta es la userdata", usersData); // Obtén la información de cada colaborador por ID

      // Filtrar los `null` y asegurar que el array solo contenga instancias de `User`
      const validUsers: User[] = usersData.filter((user): user is User => user !== null);

      // Actualizar el estado con los usuarios válidos
      setCollaborators(validUsers);
    };

    fetchData();
  }
}, [id]); // Dependencia de `id` para volver a ejecutar el efecto cuando cambie


  const [selectedList, setSelectedList] = useState<List | undefined>(undefined); // Estado inicial como undefined

  // Función para obtener la lista por ID
  const fetchList = async (listID: string) => {
    try {
      const listSelected = await getListById(listID);
      setSelectedList(listSelected || undefined); // Si no hay lista, asigna `undefined`
    } catch (error) {
      console.error('Error fetching individual lists:', error);
    }
  };

  // Ejecuta fetchList al cargar el componente o cuando cambia el ID
  useEffect(() => {
    if (id && typeof id === 'string') {
      fetchList(id); // Llama a fetchList con el ID del parámetro
    }
  }, [id]); // Solo dependemos de `id`, no de `selectedList`

  return (
    
    <View style={styles.container}>
      <TouchableOpacity
  style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, alignSelf: 'flex-start' }}
  onPress={() => router.navigate('/pantallalistas')}
>
  <Ionicons name="arrow-back" size={24} color="#256847" />
  <Text style={{ marginLeft: 8, color: '#256847', fontWeight: 'bold' }}>Regresar</Text>
</TouchableOpacity>

      {/* Botón remover colaboración */}
      <TouchableOpacity style={styles.removeCollaborationButton}>
        <Text style={styles.removeCollaborationText}>Quitar colaboración</Text>
      </TouchableOpacity>

      {/* Link de la lista */}
      <View style={styles.linkContainer}>
        <Text style={styles.linkLabel}>Codigo de la lista</Text>
        <Ionicons name="copy" size={18} color="#2E7D32" style={styles.copyIcon} />
      </View>
      <View style={styles.linkBox}>
        {/* Condición para verificar que selectedList no es undefined */}
        {selectedList && (
          <QRCode value={encodeBase64(selectedList?.id)} size={270} />
        )}
        {/* Este texto solo se muestra si `selectedList` está disponible */}
        <Text style={styles.linkText}>
        </Text>
      </View>

      {/* Lista de colaboradores */}
      <Text style={styles.sectionTitle}>Lista de colaboradores:</Text>
      <View style={styles.collaboratorsContainer}>
        {collaborators.length > 0 ? (
          collaborators.map((collaborator, index) => (
            <Text key={index} style={styles.collaborator}>{collaborator.name}</Text>
          ))
        ) : (
          <Text>No hay colaboradores</Text>
        )}
      </View>

      {/* Budget */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
    justifyContent: 'space-between',
    paddingTop: 60,
  },
  removeCollaborationButton: {
    backgroundColor: '#2E7D32',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  removeCollaborationText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  linkLabel: {
    fontSize: 16,
    color: '#2E7D32',
    marginRight: 4,
  },
  copyIcon: {
    marginLeft: 4,
  },
  linkBox: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    marginBottom: 16,
  },
  linkText: {
    fontSize: 16,
    color: '#333',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  collaboratorsContainer: {
    marginBottom: 16,
  },
  collaborator: {
    fontSize: 16,
    marginBottom: 4,
  },
});

export default CollaborationScreen;

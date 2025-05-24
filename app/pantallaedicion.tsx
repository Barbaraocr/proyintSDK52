import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { getListById, getUsersInList, deleteList, modifyList } from '@/services/lists';
import { List } from '@/models/Lists';
import { getUserById } from '@/services/userservices'; 
const CollaborationScreen = () => {
  const { id } = useLocalSearchParams();
  const listId = Array.isArray(id) ? id[0] : id;
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [selectedList, setSelectedList] = useState<List | null>(null);

  // Instead of storing just userIds, store an array of user emails or user objects
  const [userEmails, setUserEmails] = useState<string[]>([]);

  const [listName, setListName] = useState('');
  const [budget, setBudget] = useState('');

  useEffect(() => {
    const fetchListData = async () => {
      if (!listId) return;

      try {
        const list = await getListById(listId);
        if (list) {
          setSelectedList(list);
          setListName(list.listName || '');
          setBudget(list.budget?.toString() || '');
        }

        const usersInList = await getUsersInList(listId); // this returns user IDs (strings)
        
        // For each user ID, fetch user data and extract email
        const usersData = await Promise.all(
          usersInList.map(async (userId) => {
            const user = await getUserById(userId);
            return user?.email || 'Email no disponible';
          })
        );

        setUserEmails(usersData);

      } catch (error) {
        console.error('Error fetching list data:', error);
      }
    };

    fetchListData();
  }, [listId]);

  const handleSaveChanges = async () => {
    if (!listId) return;

    try {
      await modifyList(listId, {
        listName,
        budget: parseFloat(budget),
      });
      Alert.alert('Éxito', 'Lista actualizada correctamente');
    } catch (error) {
      console.error('Error al actualizar la lista:', error);
      Alert.alert('Error', 'No se pudo actualizar la lista');
    }
  };

 const handleDeleteList = async () => {
  console.log("Entró en handleDeleteList");

  Alert.alert(
    'Confirmar eliminación',
    '¿Estás seguro?',
    [
      { text: 'Cancelar', onPress: () => console.log('Cancelado'), style: 'cancel' },
      {
        text: 'Eliminar',
        onPress: async () => {
          console.log("Intentando eliminar...");
          // aquí puedes comentar lo demás para ver si llega
        },
        style: 'destructive'
      }
    ]
  );
};


  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>Nombre de la lista:</Text>
      <TextInput
        value={listName}
        onChangeText={setListName}
        style={styles.input}
        placeholder="Nombre de la lista"
      />

      <Text style={styles.label}>Presupuesto:</Text>
      <TextInput
        value={budget}
        onChangeText={setBudget}
        style={styles.input}
        placeholder="Presupuesto"
        keyboardType="numeric"
      />

      <Text style={styles.label}>Usuarios en la lista:</Text>
      {userEmails.length > 0 ? (
        userEmails.map((email, index) => (
          <Text key={index} style={styles.userItem}>{email}</Text>
        ))
      ) : (
        <Text style={styles.noUsers}>No hay usuarios.</Text>
      )}

      <TouchableOpacity style={styles.saveButton} onPress={handleSaveChanges}>
        <Text style={styles.saveButtonText}>Guardar Cambios</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.deleteButton} onPress={() => setShowDeleteModal(true)}>
  <Text style={styles.deleteButtonText}>Eliminar lista</Text>
</TouchableOpacity>
    {showDeleteModal && (
  <View style={styles.modalOverlay}>
    <View style={styles.modalContainer}>
      <Text style={styles.modalTitle}>¿Estás seguro de que quieres eliminar la lista?</Text>

      <View style={styles.modalButtons}>
        <TouchableOpacity style={styles.modalCancel} onPress={() => setShowDeleteModal(false)}>
          <Text style={styles.modalCancelText}>Cancelar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.modalDelete}
          onPress={async () => {
            try {
              console.log("Intentando eliminar...");
              await deleteList(listId!);
              setShowDeleteModal(false);
              Alert.alert('Eliminado', 'La lista ha sido eliminada');
              router.back(); // vuelve una pantalla atrás
              router.back(); 
            } catch (error) {
              console.error('Error al eliminar la lista:', error);
              Alert.alert('Error', 'No se pudo eliminar la lista');
            }
          }}
        >
          <Text style={styles.modalDeleteText}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
)}


    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 ,backgroundColor: 'white', // Add this line
    flexGrow: 1 },
  label: { fontWeight: 'bold', marginTop: 10 },
  input: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 8,
    padding: 10, marginTop: 5,
  },
  userItem: { marginVertical: 5, paddingLeft: 10 },
  noUsers: { fontStyle: 'italic', marginVertical: 5 },
  saveButton: {
    backgroundColor: '#4CAF50', padding: 15, borderRadius: 8, marginTop: 20,
  },
  saveButtonText: { color: 'white', textAlign: 'center', fontWeight: 'bold' },
  deleteButton: {
    backgroundColor: '#f44336', padding: 15, borderRadius: 8, marginTop: 10,
  },
  deleteButtonText: { color: 'white', textAlign: 'center', fontWeight: 'bold' }, 
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
  budgetContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  budgetLabel: {
    fontSize: 16,
    color: '#2E7D32',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  budgetAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  modalOverlay: {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 999,
},
modalContainer: {
  backgroundColor: '#fff',
  padding: 20,
  borderRadius: 10,
  width: '80%',
  alignItems: 'center',
},
modalTitle: {
  fontSize: 16,
  marginBottom: 20,
  textAlign: 'center',
},
modalButtons: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  width: '100%',
},
modalCancel: {
  flex: 1,
  marginRight: 10,
  padding: 10,
  backgroundColor: '#ccc',
  borderRadius: 5,
},
modalCancelText: {
  textAlign: 'center',
  color: '#000',
},
modalDelete: {
  flex: 1,
  marginLeft: 10,
  padding: 10,
  backgroundColor: 'red',
  borderRadius: 5,
},
modalDeleteText: {
  textAlign: 'center',
  color: '#fff',
  fontWeight: 'bold',
},

});

export default CollaborationScreen;

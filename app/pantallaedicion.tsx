import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const CollaborationScreen = () => {
  return (
    <View style={styles.container}>
      
      <View style={styles.budgetContainer}>
        <Text style={styles.budgetLabel}>Presupuesto de la lista</Text>
        <Text style={styles.budgetAmount}>$0.00</Text>
      </View>

      {/* Borrar lista */}
      <TouchableOpacity style={styles.deleteButton}>
        <Text style={styles.deleteButtonText}>Eliminar lista</Text>
      </TouchableOpacity>
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
  deleteButton: {
    backgroundColor: '#BE0000',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CollaborationScreen;

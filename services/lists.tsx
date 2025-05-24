// services/ListService.tsx
import { db } from "@/firebaseConfig";
import { doc, getDoc, setDoc, deleteDoc, updateDoc, collection, query, where, getDocs, arrayUnion, addDoc } from "firebase/firestore";
import { List } from "../models/Lists";


// Función para obtener una lista por su ID
export async function getListById(listId: string): Promise<List | null> {
  const docRef = doc(db, "Listas", listId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? List.fromFirestore(docSnap) : null;
}


// Obtener usuarios asociados a una lista específica
export async function getUsersInList(listId: string): Promise<any[]> {
  const listDocRef = doc(db, "Listas", listId);
  const listSnap = await getDoc(listDocRef);
  
  if (listSnap.exists()) {
    const listData = listSnap.data();
    return listData.usersInList || [];
  } 
  return [];
}

// Añadir un usuario a una lista específica
export async function addUserToList(listId: string, userId: string): Promise<boolean> {
  const listDocRef = doc(db, "Listas", listId);
  
  try {
    // Actualiza el documento de la lista añadiendo al usuario
    await updateDoc(listDocRef, {
      usersInList: arrayUnion(userId),  // 'arrayUnion' asegura que el usuario no se repita
    });

    // Si todo sale bien, se retorna 'true' para indicar éxito
    return true;
  } catch (error) {
    // Manejo de errores en caso de que falle la operación
    console.error("Error al agregar el usuario a la lista:", error);
    return false;
  }
}

// Obtener listas a las que está asociado un usuario específico
export async function getListsByUserId(userId: string): Promise<List[]> {
  const listsQuery = query(collection(db, "Listas"), where("usersInList", "array-contains", userId));
  const querySnapshot = await getDocs(listsQuery);
  return querySnapshot.docs.map(doc => List.fromFirestore(doc));
}
// Obtener solo listas donde el usuario está solo en esa lista
export async function getIndividualListsByUserId(userId: string): Promise<List[]> {
  const listsQuery = query(collection(db, "Listas"), where("usersInList", "array-contains", userId));
  const querySnapshot = await getDocs(listsQuery);
  
  const individualLists: List[] = [];
  
  querySnapshot.forEach((doc) => {
    const listData = doc.data();
    // Verifica si la lista tiene solo un usuario (el usuario logueado)
    if (listData.usersInList && listData.usersInList.length === 1) {
      individualLists.push(List.fromFirestore(doc));
    }
  });

  return individualLists;
}

export async function getCollaborativeListsByUserId(userId: string): Promise<List[]> {
  const listsQuery = query(collection(db, "Listas"), where("usersInList", "array-contains", userId));
  console.log(listsQuery)
  const querySnapshot = await getDocs(listsQuery);
  
  const collaborativeLists: List[] = [];
  
  querySnapshot.forEach((doc) => {
    const listData = doc.data();
    // Verifica si la lista tiene más de un usuario
    if (listData.usersInList && listData.usersInList.length > 1) {
      collaborativeLists.push(List.fromFirestore(doc));
    }
  });

  return collaborativeLists;
}

// Obtener usuarios asociados a una lista específica
export async function getListUsersbyListID(listId: string): Promise<any[]> {
  const usersQuery = query(collection(db, "Users"), where("listId", "==", listId));
  const querySnapshot = await getDocs(usersQuery);
  return querySnapshot.docs.map(doc => doc.data());
}


// Obtener productos asociados a una lista específica
export async function getProductsbyListID(listId: string): Promise<any[]> {
  const productsQuery = query(collection(db, "Products"), where("listId", "==", listId));
  const querySnapshot = await getDocs(productsQuery);
  return querySnapshot.docs.map(doc => doc.data());
}

// Crear una nueva lista
import { getUserIdFromSession } from "../services/auth"; // Asegúrate de importar la función para obtener el userId
import { ProductoLista } from "@/models/ProductsList";

// Función para crear una lista
export async function createList(list: List, productos: string[]): Promise<void> {
  try {
    // Obtener el userId del usuario logueado
    const userId = await getUserIdFromSession();
    
    if (!userId) {
      throw new Error("No user is logged in.");
    }

    // Crear un nuevo objeto de lista, añadiendo el userId al array usersInList
    const listWithUser = new List(
      null,
      list.budget,
      list.creationDate,
      list.listName,
      [userId, ...(list.usersInList || [])],
      list.categories,
      list.montoArticulos,
      list.montoLista,
      list.status,
      list.totalPrice
    );

    // Crear la lista en Firestore
    const docRef = await addDoc(collection(db, "Listas"), listWithUser.toFirestore());
    const listaId = docRef.id;

    console.log("Lista creada con ID:", listaId);

    // Crear objetos ProductoLista por cada producto seleccionado
    for (const productoId of productos) {
      const nuevoProductoLista = new ProductoLista(
        null,
        productoId, // ID del producto
        1, // Cantidad inicial
        listaId, // ID de la lista a la que pertenece el producto
        false, // No comprado inicialmente
        null, // Usuario asignado nulo por defecto
        new Date() // Fecha de actualización actual
      );

      await addDoc(collection(db, "ProductosListas"), nuevoProductoLista.toFirestore());
    }

    console.log("Productos asociados a la lista creados exitosamente.");
  } catch (error) {
    console.error("Error creando la lista y sus productos:", error);
    throw error;
  }
}



// Eliminar una lista
export async function deleteList(listId: string): Promise<void> {
  await deleteDoc(doc(db, "Listas", listId));
}

// Modificar una lista existente
export async function modifyList(listId: string, updatedData: Partial<List>): Promise<void> {
  const docRef = doc(db, "Listas", listId);
  await updateDoc(docRef, updatedData);
}
export async function getRandomIconUrl(): Promise<string | null> {
  try {
    const iconsCollection = collection(db, "IconsListas");
    const snapshot = await getDocs(iconsCollection);

    if (!snapshot.empty) {
      const icons = snapshot.docs.map(doc => doc.data().IconUrl);
      const randomIndex = Math.floor(Math.random() * icons.length);
      return icons[randomIndex]; // Retorna una URL aleatoria
    }
    return null; // No hay íconos disponibles
  } catch (error) {
    console.error("Error al obtener íconos: ", error);
    return null;
  }
}
export const getUsersInListmail = async (listId: string): Promise<string[]> => {
  const listDoc = await getDoc(doc(db, "listas", listId));
  const listData = listDoc.data();

  if (!listData?.usersInList) return [];

  const userDocs = await Promise.all(
    listData.usersInList.map((userId: string) => getDoc(doc(db, "users", userId)))
  );

  const userEmails = userDocs.map(userDoc => {
    const userData = userDoc.data();
    return userData?.email || userDoc.id;  // fallback
  });

  return userEmails;
};

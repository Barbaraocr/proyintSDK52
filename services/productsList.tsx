import { getFirestore, collection, addDoc } from "firebase/firestore";
import { app } from "@/firebaseConfig";
import { ProductoLista } from "..//models/ProductsList";

const db = getFirestore(app);

export const addProductoToLista = async (productoLista: ProductoLista, cantidad: number = 1) => {
  try {
    // Actualizamos los campos necesarios antes de guardar
    productoLista.cantidad = cantidad;
    productoLista.isComprado = false;
    productoLista.fechaActualizacion = new Date();

    const docRef = await addDoc(collection(db, "ProductosListas"), productoLista.toFirestore());

    console.log("Producto añadido a la lista con ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error al agregar el producto a la lista:", error);
    throw error;
  }
};

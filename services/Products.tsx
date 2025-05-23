// services/ProductoListaService.tsx
import { db } from "@/firebaseConfig";
import { doc, setDoc, deleteDoc, updateDoc, collection, query, where, getDocs,getDoc, addDoc  } from "firebase/firestore";
import { ProductoLista } from "../models/ProductsList";
import { Producto } from "../models/Products";

export async function addProducto(nombre: string, category: string, imagenURL: string, price: number): Promise<void> {
  // Crear una nueva instancia de Producto
  const producto = new Producto(null,nombre, category, price, imagenURL);

  // Generar un ID único para el producto
  const productoId = doc(collection(db, "productos")).id;

  // Guardar el objeto en Firestore
  await setDoc(doc(db, "productos", productoId), producto.toFirestore());
}
  
  // Obtener todos los productos
  export async function getProductos(): Promise<Producto[]> {
    const productosCollection = collection(db, "productos");
    const querySnapshot = await getDocs(productosCollection);
    return querySnapshot.docs.map(doc => Producto.fromFirestore(doc));
  }
  
  // Obtener producto por ID
  export async function getProductoById(productoId: string): Promise<Producto | null> {
    const docRef = doc(db, "productos", productoId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? Producto.fromFirestore(docSnap) : null;
  }
  
  // Modificar un producto
  export async function modifyProducto(productoId: string, updatedData: Partial<Producto>): Promise<void> {
    const docRef = doc(db, "productos", productoId);
    await updateDoc(docRef, updatedData);
  }
  
  // Eliminar un producto
  export async function deleteProducto(productoId: string): Promise<void> {
    await deleteDoc(doc(db, "productos", productoId));
  }
// Añadir un producto a una lista (con cantidad y número de productos)
export async function addProductoToList(productoLista: ProductoLista, cantidad: number): Promise<void> {
  await addDoc(collection(db, "ProductosListas"), {
    ...productoLista.toFirestore(),
    cantidad: cantidad
  });
}
// Obtener productos por categoría
export async function getProductosByCategory(categoryName: string): Promise<Producto[]> {
  const productosRef = collection(db, 'productos');
  const q = query(productosRef, where('categoria', '==', categoryName)); // Assuming each product has a 'categoria' field
  
  const querySnapshot = await getDocs(q);
  const productos: Producto[] = [];
  
  querySnapshot.forEach((doc) => {
    const producto = Producto.fromFirestore(doc);
    productos.push(producto);
  });

  return productos;
}

// Obtener productos en una lista específica
export async function getProductosByListId(listaId: string): Promise<ProductoLista[]> {
  const ProductosListasQuery = query(collection(db, "ProductosListas"), where("listaId", "==", listaId));
  console.log(ProductosListasQuery)
  const querySnapshot = await getDocs(ProductosListasQuery);
  return querySnapshot.docs.map(doc => ProductoLista.fromFirestore(doc));
}

// Modificar un producto en la lista (ej. cantidad o asignación de usuario)
export async function modifyProductoInList(productoListaId: string, updatedData: Partial<ProductoLista>): Promise<void> {
  const docRef = doc(db, "ProductosListas", productoListaId);
  await updateDoc(docRef, updatedData);
}

// Marcar producto como comprado en una lista
export async function markProductoAsComprado(productoListaId: string): Promise<void> {
  const docRef = doc(db, "ProductosListas", productoListaId);

  // Obtener el documento actual
  const docSnapshot = await getDoc(docRef);

  if (docSnapshot.exists()) {
    const currentData = docSnapshot.data();
    const currentIsComprado = currentData.isComprado;

    // Cambiar de true a false o de false a true
    await updateDoc(docRef, { isComprado: !currentIsComprado });
    console.log("cambiado successfully")
  } else {
    console.error("El documento no existe");
  }
}

// Eliminar un producto de una lista
export async function deleteProductoFromList(productoListaId: string): Promise<void> {
  await deleteDoc(doc(db, "ProductosListas", productoListaId));
}


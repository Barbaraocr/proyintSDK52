// models/ProductoLista.tsx
import { QueryDocumentSnapshot } from "firebase/firestore";
import { app } from "@/firebaseConfig";
import { getFirestore } from "firebase/firestore";
const db = getFirestore(app);

export class ProductoLista {
  id?: string; // Propiedad opcional para almacenar el ID de la lista
  productoId: string | null;       // ID de referencia al Producto
  cantidad: number | null;
  listaId: string | null;          // ID de la lista a la que pertenece el producto
  isComprado: boolean | null;      // Estado de compra del producto
  usuarioAsignado: string | null;  // Usuario responsable de comprar este producto
  fechaActualizacion: Date | null;
  price: any;

  constructor(
    id: string | null = null, // Agregar el id al constructor como opcional
    productoId: string | null = null,
    cantidad: number | null = null,
    listaId: string | null = null,
    isComprado: boolean | null = null,
    usuarioAsignado: string | null = null,
    fechaActualizacion: Date | null = null
  ) {
    this.id = id ?? undefined;
    this.productoId = productoId;
    this.cantidad = cantidad;
    this.listaId = listaId;
    this.isComprado = isComprado;
    this.usuarioAsignado = usuarioAsignado;
    this.fechaActualizacion = fechaActualizacion;
  }

  toFirestore(): {
    productoId: string | null;
    cantidad: number | null;
    listaId: string | null;
    isComprado: boolean | null;
    usuarioAsignado: string | null;
    fechaActualizacion: Date | null;
  } {
    return {
      productoId: this.productoId,
      cantidad: this.cantidad,
      listaId: this.listaId,
      isComprado: this.isComprado,
      usuarioAsignado: this.usuarioAsignado,
      fechaActualizacion: this.fechaActualizacion,
    };
  }

  static fromFirestore(snapshot: QueryDocumentSnapshot): ProductoLista {
    const data = snapshot.data();
    return new ProductoLista(
      snapshot.id, // Asignar el ID del documento Firestore a la propiedad id
      data.productoId ?? null,
      data.cantidad ?? null,
      data.listaId ?? null,
      data.isComprado ?? null,
      data.usuarioAsignado ?? null,
      data.fechaActualizacion ? data.fechaActualizacion.toDate() : null
    );
  }
}

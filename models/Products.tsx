import { QueryDocumentSnapshot } from "firebase/firestore";
import { app } from "@/firebaseConfig";
import { getFirestore } from "firebase/firestore";


const db = getFirestore(app);

export class Producto {
  id: string;
  nombre: string | null;
  categoria: string | null;
  precio: number;
  imagenURL: string | null;
  supermercado: string | null;
  creadoPor: string | null;
  fechaCreacion: Date | null;

  constructor(
    id: string | null = "",
    nombre: string | null = null,
    categoria: string | null = null,
    precio: number = 0, 
    imagenURL: string | null = null,
    supermercado: string | null = null,
    creadoPor: string | null = null,
    fechaCreacion: Date | null = null
  ) {
    this.id = id ?? "";
    this.nombre = nombre;
    this.categoria = categoria;
    this.precio = precio;
    this.imagenURL = imagenURL;
    this.supermercado = supermercado;
    this.creadoPor = creadoPor;
    this.fechaCreacion = fechaCreacion;
  }

  toFirestore(): {
    nombre: string | null;
    categoria: string | null;
    precio: number;
    imagenURL: string | null;
    supermercado: string | null;
    creadoPor: string | null;
    fechaCreacion: Date | null;
  } {
    return {
      nombre: this.nombre,
      categoria: this.categoria,
      precio: this.precio,
      imagenURL: this.imagenURL,
      supermercado: this.supermercado,
      creadoPor: this.creadoPor,
      fechaCreacion: this.fechaCreacion,
    };
  }

  static fromFirestore(snapshot: QueryDocumentSnapshot): Producto {
    const data = snapshot.data();
    return new Producto(
      snapshot.id,
      data.nombre ?? "",
      data.categoria ?? null,
      data.precio ?? 0, // ✅ si es null o undefined, será 0
      data.imagenURL ?? null,
      data.supermercado ?? null,
      data.creadoPor ?? null,
      data.fechaCreacion ? data.fechaCreacion.toDate() : null
    );
  }
}

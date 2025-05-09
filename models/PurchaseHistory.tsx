import { QueryDocumentSnapshot } from "firebase/firestore";
import { app } from "@/firebaseConfig";
import { getFirestore, Timestamp } from "firebase/firestore";

const db = getFirestore(app);

export class PurchaseHistory {
  idCompra?: string;
  idUsuario: string;
  montoTotal: number;
  fechaCompra: Date;
  productName: string;
  listName: string;

  constructor(
    idUsuario: string,
    montoTotal: number,
    fechaCompra: Date,
    productName: string,
    listName: string,
    idCompra?: string
  ) {
    this.idCompra = idCompra;
    this.idUsuario = idUsuario;
    this.montoTotal = montoTotal;
    this.fechaCompra = fechaCompra;
    this.productName = productName;
    this.listName = listName;
  }

  toFirestore(): {
    idUsuario: string;
    montoTotal: number;
    fechaCompra: Timestamp;
    nombreProducto: string;
    nombreLista: string;
  } {
    return {
      idUsuario: this.idUsuario,
      montoTotal: this.montoTotal,
      // Almacena como Timestamp para mantener consistencia
      fechaCompra: Timestamp.fromDate(this.fechaCompra),
      nombreProducto: this.productName,
      nombreLista: this.listName,
    };
  }

  static fromFirestore(snapshot: QueryDocumentSnapshot): PurchaseHistory {
    const data = snapshot.data();
    return new PurchaseHistory(
      data.idUsuario,
      data.montoTotal,
      data.fechaCompra.toDate(),
      data.nombreProducto,
      data.nombreLista,
      snapshot.id
    );
  }
}
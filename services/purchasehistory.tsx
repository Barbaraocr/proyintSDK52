// services/purchaseHistory.ts

import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/firebaseConfig";
import { PurchaseHistory } from "../models/PurchaseHistory";

const COLLECTION = "historialCompras";

/**
 * Obtiene un registro por su ID.
 */
export async function getPurchaseById(
  purchaseId: string
): Promise<PurchaseHistory | null> {
  const docRef = doc(db, COLLECTION, purchaseId);
  const snap = await getDoc(docRef);
  return snap.exists() ? PurchaseHistory.fromFirestore(snap) : null;
}

/**
 * Obtiene todo el historial de un usuario.
 */
export async function getPurchaseHistoryByUserId(
  userId: string
): Promise<PurchaseHistory[]> {
  const q = query(
    collection(db, COLLECTION),
    where("idUsuario", "==", userId)
  );
  const snap = await getDocs(q);
  return snap.docs.map(PurchaseHistory.fromFirestore);
}

/**
 * Obtiene historial en un rango de fechas (incluye todo el día endDate).
 * Filtra también por usuario.
 */
export async function getPurchaseHistoryByDateRange(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<PurchaseHistory[]> {
  // Normalizar inicio al 00:00:00 y fin al 23:59:59
  const startTs = Timestamp.fromDate(
    new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), 0, 0, 0)
  );
  const endTs = Timestamp.fromDate(
    new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 23, 59, 59)
  );

  const q = query(
    collection(db, COLLECTION),
    where("idUsuario", "==", userId),
    where("fechaCompra", ">=", startTs),
    where("fechaCompra", "<=", endTs)
  );
  const snap = await getDocs(q);
  return snap.docs.map(PurchaseHistory.fromFirestore);
}

/**
 * Obtiene historial filtrado por producto y/o lista.
 * Siempre filtra por usuario primero.
 */
export async function getPurchaseHistoryByFilters(
  userId: string,
  filters: { productName?: string; listName?: string }
): Promise<PurchaseHistory[]> {
  const constraints: any[] = [where("idUsuario", "==", userId)];

  if (filters.productName) {
    constraints.push(where("nombreProducto", "==", filters.productName));
  }
  if (filters.listName) {
    constraints.push(where("nombreLista", "==", filters.listName));
  }

  const q = query(collection(db, COLLECTION), ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map(PurchaseHistory.fromFirestore);
}

/**
 * Crea un nuevo registro de compra y devuelve el ID generado.
 */
export async function createPurchaseHistory(
  purchase: PurchaseHistory
): Promise<string> {
  const docRef = await addDoc(
    collection(db, COLLECTION),
    purchase.toFirestore()
  );
  console.log("Historial de compra creado con ID:", docRef.id);
  return docRef.id;
}

/**
 * Modifica campos válidos de un registro existente.
 */
export async function modifyPurchaseHistory(
  purchaseId: string,
  updatedData: Partial<PurchaseHistory>
): Promise<void> {
  const docRef = doc(db, COLLECTION, purchaseId);
  const data: any = {};

  if (updatedData.montoTotal !== undefined) {
    data.montoTotal = updatedData.montoTotal;
  }
  if (updatedData.fechaCompra) {
    data.fechaCompra = Timestamp.fromDate(updatedData.fechaCompra);
  }
  if (updatedData.productName) {
    data.nombreProducto = updatedData.productName;
  }
  if (updatedData.listName) {
    data.nombreLista = updatedData.listName;
  }
  if (updatedData.idUsuario) {
    data.idUsuario = updatedData.idUsuario;
  }

  await updateDoc(docRef, data);
}

/**
 * Elimina un registro de historial.
 */
export async function deletePurchaseHistory(
  purchaseId: string
): Promise<void> {
  const docRef = doc(db, COLLECTION, purchaseId);
  await deleteDoc(docRef);
}
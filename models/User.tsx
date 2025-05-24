import { QueryDocumentSnapshot } from "firebase/firestore";
import { app } from "@/firebaseConfig";
import { getFirestore } from "firebase/firestore";

const db = getFirestore(app);

export class User {
  id?: string;
  email: string;
  name: string;
  phone?: string; // 📱 Nuevo campo
  profileImage?: string;

  constructor(
    email: string,
    name: string,
    id?: string,
    profileImage?: string,
    phone?: string
  ) {
    if (!email || !name) {
      throw new Error("Email and Name are required fields.");
    }

    this.id = id;
    this.email = email;
    this.name = name;
    this.profileImage = profileImage;
    this.phone = phone; // Asignar phone si se pasa
  }

  toFirestore(): { email: string; name: string; profileImage?: string; phone?: string } {
    return {
      email: this.email,
      name: this.name,
      ...(this.profileImage ? { profileImage: this.profileImage } : {}),
      ...(this.phone ? { phone: this.phone } : {}),
    };
  }

  static fromFirestore(snapshot: QueryDocumentSnapshot): User {
    const data = snapshot.data();
    return new User(
      data.email,
      data.name,
      snapshot.id,
      data.profileImage,
      data.phone // 📥 Recuperar phone de Firestore
    );
  }
}

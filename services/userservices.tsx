// services/userService.ts
import { User } from "@/models/User";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, UserCredential } from "firebase/auth"; // Asegúrate de importar signInWithEmailAndPassword
import { setDoc, doc, getDoc } from "firebase/firestore";
import { app, db } from "@/firebaseConfig";
import { getFirestore } from "firebase/firestore";

// Inicializa Firebase Authentication y Firestore usando la instancia de la app
const auth = getAuth(app); // Usa la instancia de Firebase App

// Función para iniciar sesión
export const loginUser = async (identifier: string, password: string) => {
  try {
    // Iniciar sesión con correo electrónico o teléfono
    const userCredential: UserCredential = await signInWithEmailAndPassword(auth, identifier, password);
    const user = userCredential.user;
    
    return {
      uid: user.uid,
      email: user.email,
      // Puedes agregar otros campos del usuario si es necesario
    };
  } catch (error) {
    // Manejo de errores
    const errorMessage = (error as Error).message || 'Unknown error occurred';
    console.error("Error logging in:", error);
    throw new Error(`Error logging in: ${errorMessage}`);
  }
};

// Función para crear un nuevo usuario
export async function createUser(email: string, password: string, name: string, phone: string): Promise<{ uid: string; email: string; name: string }> {
  try {
    // Crear usuario en Firebase Authentication
    const userCredential: UserCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    // Crear instancia de usuario y subir a Firestore
    try {
      const newUser = new User(email, name);
      const userDocRef = doc(db, "users", uid);
      await setDoc(userDocRef, newUser.toFirestore());
    } catch (error) {
      throw new Error(`Error registering user: ${error}`); // Lanza un error más específico
    }

    return { uid, email, name };
  } catch (error) {
    console.error("Error creating user:", error);
    throw new Error(`Error creating user: ${error}`); // Lanza un error más específico
  }

 
}

export async function getUserById(userID: string): Promise<User | null> {
  const docRef = doc(db, "users", userID);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? User.fromFirestore(docSnap) : null;
}

export async function updateUserProfile (user: User) {
  if (!user.id) throw new Error('User ID is required');
  
  const userRef = doc(db, "users", user.id);
  
  await setDoc(userRef, user.toFirestore(), { merge: true });
};
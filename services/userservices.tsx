// services/userService.ts
import { User } from "@/models/User";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, UserCredential } from "firebase/auth";
import { setDoc, doc, getDoc } from "firebase/firestore";
import { app, db } from "@/firebaseConfig";

const auth = getAuth(app);

// Función para iniciar sesión
export const loginUser = async (identifier: string, password: string) => {
  try {
    const userCredential: UserCredential = await signInWithEmailAndPassword(auth, identifier, password);
    const user = userCredential.user;
    
    return {
      uid: user.uid,
      email: user.email,
    };
  } catch (error) {
    const errorMessage = (error as Error).message || 'Unknown error occurred';
    console.error("Error logging in:", error);
    throw new Error(`Error logging in: ${errorMessage}`);
  }
};

// Función para crear un nuevo usuario
export async function createUser(
  email: string,
  password: string,
  name: string,
  phone: string
): Promise<{ uid: string; email: string; name: string; phone: string }> {
  try {
    const userCredential: UserCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    // Asegúrate de que el modelo User soporte phone
    const newUser = new User(email, name, phone);
    const userDocRef = doc(db, "users", uid);
    await setDoc(userDocRef, newUser.toFirestore());

    return { uid, email, name, phone };
  } catch (error) {
    console.error("Error creating user:", error);
    throw new Error(`Error creating user: ${(error as Error).message}`);
  }
}

export async function getUserById(userID: string): Promise<User | null> {
  const docRef = doc(db, "users", userID);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? User.fromFirestore(docSnap) : null;
}

export async function updateUserProfile(user: User) {
  if (!user.id) throw new Error('User ID is required');

  const userRef = doc(db, "users", user.id);
  await setDoc(userRef, user.toFirestore(), { merge: true });
}

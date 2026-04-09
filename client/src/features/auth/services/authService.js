import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp
} from "firebase/firestore";
import { auth, db } from "../../../firebase/config";

// Registers a Firebase Auth user and creates the platform profile document.
export const registerUser = async ({ fullName, email, password }) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Create the matching Firestore profile immediately after auth account creation.
    await setDoc(doc(db, "users", user.uid), {
      fullName,
      email,
      role: "student",
      academicYear: null,
      semester: null,
      profileCompleted: false,
      status: "active",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    return user;
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
};

// Signs in an existing user with email/password credentials.
export const loginUser = async ({ email, password }) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

// Ends the current Firebase auth session.
export const logoutUser = async () => {
  await signOut(auth);
};

// Fetches the Firestore profile associated with a Firebase UID.
export const getUserProfile = async (uid) => {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  // Return null when profile docs do not exist yet.
  return snap.exists() ? snap.data() : null;
};

// Ensures legacy users always have a baseline profile document.
export const createMissingUserProfile = async (user) => {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);

  // Backfill profile docs for users that exist in Firebase Auth but not Firestore.
  if (!snap.exists()) {
    await setDoc(ref, {
      fullName: user.displayName || "Student User",
      email: user.email,
      role: "student",
      academicYear: null,
      semester: null,
      profileCompleted: false,
      status: "active",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }
};
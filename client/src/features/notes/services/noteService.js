import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../../firebase/config";

function sortNotes(notes = []) {
  return [...notes].sort((a, b) => {
    const aSec = a.lastEditedAt?.seconds ?? 0;
    const bSec = b.lastEditedAt?.seconds ?? 0;
    const aNano = a.lastEditedAt?.nanoseconds ?? 0;
    const bNano = b.lastEditedAt?.nanoseconds ?? 0;

    if (aSec !== bSec) return bSec - aSec;
    return bNano - aNano;
  });
}

export const createNote = async (uid, moduleId, title = "Untitled Note") => {
  const notesRef = collection(db, "notes");

  const docRef = await addDoc(notesRef, {
    userId: uid,
    moduleId,
    title,
    content: "<p></p>",
    createdAt: serverTimestamp(),
    lastEditedAt: serverTimestamp(),
  });

  return {
    id: docRef.id,
    userId: uid,
    moduleId,
    title,
    content: "<p></p>",
  };
};

export const getUserModuleNotes = async (uid, moduleId) => {
  const notesRef = collection(db, "notes");
  const q = query(
    notesRef,
    where("userId", "==", uid),
    where("moduleId", "==", moduleId)
  );

  const snapshot = await getDocs(q);

  const notes = snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  }));

  return sortNotes(notes);
};

export const getUserNotes = async (uid) => {
  const notesRef = collection(db, "notes");
  const q = query(notesRef, where("userId", "==", uid));

  const snapshot = await getDocs(q);

  const notes = snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  }));

  return sortNotes(notes);
};

export const getNoteById = async (noteId) => {
  const ref = doc(db, "notes", noteId);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    return null;
  }

  return {
    id: snap.id,
    ...snap.data(),
  };
};

export const updateNote = async (noteId, data) => {
  const ref = doc(db, "notes", noteId);

  await updateDoc(ref, {
    ...data,
    lastEditedAt: serverTimestamp(),
  });
};

export const deleteNoteById = async (noteId) => {
  const ref = doc(db, "notes", noteId);
  await deleteDoc(ref);
};
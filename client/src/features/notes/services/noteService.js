import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../../firebase/config";

export const getNote = async (uid, moduleId) => {
  const noteId = `${uid}_${moduleId}`;
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

export const saveNote = async (uid, moduleId, content) => {
  const noteId = `${uid}_${moduleId}`;
  const ref = doc(db, "notes", noteId);

  await setDoc(
    ref,
    {
      userId: uid,
      moduleId,
      content,
      lastEditedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    },
    { merge: true }
  );
};
import {
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "../../../firebase/config";

export async function getChatMessages(userId, moduleId) {
  const messagesRef = collection(
    db,
    "users",
    userId,
    "moduleChats",
    moduleId,
    "messages"
  );

  const snapshot = await getDocs(messagesRef);

  const messages = snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  }));

  return messages.sort((a, b) => {
    const aSec = a.createdAt?.seconds ?? 0;
    const bSec = b.createdAt?.seconds ?? 0;
    const aNano = a.createdAt?.nanoseconds ?? 0;
    const bNano = b.createdAt?.nanoseconds ?? 0;

    if (aSec !== bSec) return aSec - bSec;
    return aNano - bNano;
  });
}

export async function saveChatMessage(userId, moduleId, message) {
  const messagesRef = collection(
    db,
    "users",
    userId,
    "moduleChats",
    moduleId,
    "messages"
  );

  const docRef = await addDoc(messagesRef, {
    role: message.role,
    content: message.content,
    createdAt: serverTimestamp(),
  });

  return {
    id: docRef.id,
    role: message.role,
    content: message.content,
  };
}

export async function clearChatMessages(userId, moduleId) {
  const messagesRef = collection(
    db,
    "users",
    userId,
    "moduleChats",
    moduleId,
    "messages"
  );

  const snapshot = await getDocs(messagesRef);
  const batch = writeBatch(db);

  snapshot.forEach((docSnap) => {
    batch.delete(docSnap.ref);
  });

  await batch.commit();
}
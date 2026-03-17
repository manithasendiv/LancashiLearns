import {
  collection,
  addDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../../../firebase/config";

export async function getChatMessages(userId, moduleId) {
  const messagesRef = collection(db, "users", userId, "moduleChats", moduleId, "messages");
  const q = query(messagesRef, orderBy("createdAt", "asc"));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  }));
}

export async function saveChatMessage(userId, moduleId, message) {
  const messagesRef = collection(db, "users", userId, "moduleChats", moduleId, "messages");

  await addDoc(messagesRef, {
    role: message.role,
    content: message.content,
    createdAt: serverTimestamp(),
  });
}

export async function clearChatMessages(userId, moduleId, messages = []) {
  const deletePromises = messages.map((message) =>
    deleteDoc(doc(db, "users", userId, "moduleChats", moduleId, "messages", message.id))
  );

  await Promise.all(deletePromises);
}
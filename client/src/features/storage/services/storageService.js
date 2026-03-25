import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
import { db, storage } from "../../../firebase/config";

export async function createStorageFolder(uid, folderName) {
  const trimmedName = folderName.trim();

  if (!uid) throw new Error("User is not authenticated.");
  if (!trimmedName) throw new Error("Folder name is required.");

  const folderRef = await addDoc(collection(db, "users", uid, "storageFolders"), {
    name: trimmedName,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return folderRef.id;
}

export async function renameStorageFolder(uid, folderId, newName) {
  const trimmedName = newName.trim();

  if (!uid) throw new Error("User is not authenticated.");
  if (!folderId) throw new Error("Folder ID is required.");
  if (!trimmedName) throw new Error("Folder name is required.");

  await updateDoc(doc(db, "users", uid, "storageFolders", folderId), {
    name: trimmedName,
    updatedAt: serverTimestamp(),
  });
}

export async function getStorageFolders(uid) {
  if (!uid) throw new Error("User is not authenticated.");

  const q = query(
    collection(db, "users", uid, "storageFolders"),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((docItem) => ({
    id: docItem.id,
    ...docItem.data(),
  }));
}

export async function uploadFileToFolder(uid, folderId, file) {
  if (!uid) throw new Error("User is not authenticated.");
  if (!folderId) throw new Error("Folder is required.");
  if (!file) throw new Error("File is required.");

  const safeFileName = `${Date.now()}-${file.name}`;
  const storagePath = `user-storage/${uid}/${folderId}/${safeFileName}`;
  const storageRef = ref(storage, storagePath);

  await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(storageRef);

  const fileRef = await addDoc(
    collection(db, "users", uid, "storageFolders", folderId, "files"),
    {
      name: file.name,
      type: file.type || "unknown",
      size: file.size || 0,
      downloadURL,
      storagePath,
      uploadedAt: serverTimestamp(),
    }
  );

  return fileRef.id;
}

export async function getFolderFiles(uid, folderId) {
  if (!uid) throw new Error("User is not authenticated.");
  if (!folderId) return [];

  const q = query(
    collection(db, "users", uid, "storageFolders", folderId, "files"),
    orderBy("uploadedAt", "desc")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((docItem) => ({
    id: docItem.id,
    ...docItem.data(),
  }));
}

export async function deleteFolderFile(uid, folderId, fileId, storagePath) {
  if (!uid) throw new Error("User is not authenticated.");
  if (!folderId || !fileId || !storagePath) {
    throw new Error("Missing file details.");
  }

  await deleteObject(ref(storage, storagePath));
  await deleteDoc(doc(db, "users", uid, "storageFolders", folderId, "files", fileId));
}

export async function deleteStorageFolder(uid, folderId) {
  if (!uid) throw new Error("User is not authenticated.");
  if (!folderId) throw new Error("Folder ID is required.");

  const filesCollectionRef = collection(
    db,
    "users",
    uid,
    "storageFolders",
    folderId,
    "files"
  );

  const filesSnapshot = await getDocs(filesCollectionRef);

  for (const fileDoc of filesSnapshot.docs) {
    const fileData = fileDoc.data();

    if (fileData.storagePath) {
      await deleteObject(ref(storage, fileData.storagePath));
    }

    await deleteDoc(fileDoc.ref);
  }

  await deleteDoc(doc(db, "users", uid, "storageFolders", folderId));
}
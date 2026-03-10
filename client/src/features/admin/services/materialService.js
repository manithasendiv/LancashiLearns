import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { db, storage } from "../../../firebase/config";

// Get all modules for dropdown
export const getAllModulesForMaterials = async () => {
  const snapshot = await getDocs(collection(db, "modules"));

  return snapshot.docs.map((docItem) => ({
    id: docItem.id,
    ...docItem.data(),
  }));
};

// Get all materials for one module
export const getMaterialsByModuleId = async (moduleId) => {
  const snapshot = await getDocs(collection(db, "modules", moduleId, "materials"));

  return snapshot.docs.map((docItem) => ({
    id: docItem.id,
    ...docItem.data(),
  }));
};

// Upload file to Firebase Storage and save metadata to Firestore
export const uploadMaterialForModule = async ({
  moduleId,
  title,
  type,
  file,
}) => {
  const filePath = `modules/${moduleId}/${type}/${Date.now()}_${file.name}`;
  const storageRef = ref(storage, filePath);

  await uploadBytes(storageRef, file);
  const fileUrl = await getDownloadURL(storageRef);

  await addDoc(collection(db, "modules", moduleId, "materials"), {
    title,
    type,
    fileName: file.name,
    fileUrl,
    storagePath: filePath,
    uploadedAt: serverTimestamp(),
  });
};

// Delete material metadata and storage file
export const deleteMaterialById = async (moduleId, material) => {
  if (material.storagePath) {
    const storageRef = ref(storage, material.storagePath);
    await deleteObject(storageRef);
  }

  await deleteDoc(doc(db, "modules", moduleId, "materials", material.id));
};
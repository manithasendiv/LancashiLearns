import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  getDoc,
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

  const materials = snapshot.docs.map((docItem) => ({
    id: docItem.id,
    ...docItem.data(),
  }));

  materials.sort((a, b) => {
    const aTime = a.uploadedAt?.seconds || 0;
    const bTime = b.uploadedAt?.seconds || 0;
    return bTime - aTime;
  });

  return materials;
};

// Get one material
export const getMaterialById = async (moduleId, materialId) => {
  const refDoc = doc(db, "modules", moduleId, "materials", materialId);
  const snap = await getDoc(refDoc);

  if (!snap.exists()) return null;

  return {
    id: snap.id,
    ...snap.data(),
  };
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
    updatedAt: serverTimestamp(),
  });
};

// Edit material metadata only
export const updateMaterialById = async ({
  moduleId,
  materialId,
  title,
  type,
}) => {
  await updateDoc(doc(db, "modules", moduleId, "materials", materialId), {
    title,
    type,
    updatedAt: serverTimestamp(),
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
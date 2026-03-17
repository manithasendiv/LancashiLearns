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

function normalizeWeekNumber(value) {
  const num = Number(value);
  return Number.isInteger(num) && num > 0 ? num : null;
}

function sortMaterials(materials = []) {
  return [...materials].sort((a, b) => {
    const weekA = normalizeWeekNumber(a.weekNumber);
    const weekB = normalizeWeekNumber(b.weekNumber);

    if (weekA === null && weekB !== null) return 1;
    if (weekA !== null && weekB === null) return -1;
    if (weekA !== null && weekB !== null && weekA !== weekB) {
      return weekA - weekB;
    }

    const timeA = a.uploadedAt?.seconds || 0;
    const timeB = b.uploadedAt?.seconds || 0;

    if (timeA !== timeB) {
      return timeB - timeA;
    }

    return (a.title || "").localeCompare(b.title || "");
  });
}

export const getAllModulesForMaterials = async () => {
  const snapshot = await getDocs(collection(db, "modules"));

  return snapshot.docs.map((docItem) => ({
    id: docItem.id,
    ...docItem.data(),
  }));
};

export const getMaterialsByModuleId = async (moduleId) => {
  const snapshot = await getDocs(collection(db, "modules", moduleId, "materials"));

  const materials = snapshot.docs.map((docItem) => ({
    id: docItem.id,
    ...docItem.data(),
    weekNumber: normalizeWeekNumber(docItem.data().weekNumber),
  }));

  return sortMaterials(materials);
};

export const getMaterialById = async (moduleId, materialId) => {
  const refDoc = doc(db, "modules", moduleId, "materials", materialId);
  const snap = await getDoc(refDoc);

  if (!snap.exists()) return null;

  const data = snap.data();

  return {
    id: snap.id,
    ...data,
    weekNumber: normalizeWeekNumber(data.weekNumber),
  };
};

export const uploadMaterialForModule = async ({
  moduleId,
  title,
  type,
  weekNumber,
  file,
}) => {
  const normalizedWeekNumber = normalizeWeekNumber(weekNumber);
  const weekFolder = normalizedWeekNumber
    ? `week-${normalizedWeekNumber}`
    : "general";

  const filePath = `modules/${moduleId}/${weekFolder}/${type}/${Date.now()}_${file.name}`;
  const storageRef = ref(storage, filePath);

  await uploadBytes(storageRef, file);
  const fileUrl = await getDownloadURL(storageRef);

  await addDoc(collection(db, "modules", moduleId, "materials"), {
    title,
    type,
    weekNumber: normalizedWeekNumber,
    fileName: file.name,
    fileUrl,
    storagePath: filePath,
    uploadedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

export const updateMaterialById = async ({
  moduleId,
  materialId,
  title,
  type,
  weekNumber,
}) => {
  await updateDoc(doc(db, "modules", moduleId, "materials", materialId), {
    title,
    type,
    weekNumber: normalizeWeekNumber(weekNumber),
    updatedAt: serverTimestamp(),
  });
};

export const deleteMaterialById = async (moduleId, material) => {
  if (material.storagePath) {
    const storageRef = ref(storage, material.storagePath);
    await deleteObject(storageRef);
  }

  await deleteDoc(doc(db, "modules", moduleId, "materials", material.id));
};
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp
} from "firebase/firestore";
import { db } from "../../../firebase/config";

export const getAllModules = async () => {
  const snapshot = await getDocs(collection(db, "modules"));

  return snapshot.docs.map((docItem) => ({
    id: docItem.id,
    ...docItem.data()
  }));
};

export const addModule = async (moduleData) => {
  await addDoc(collection(db, "modules"), {
    ...moduleData,
    academicYear: Number(moduleData.academicYear),
    semester: Number(moduleData.semester),
    isProgrammingModule: Boolean(moduleData.isProgrammingModule),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
};

export const deleteModuleById = async (moduleId) => {
  await deleteDoc(doc(db, "modules", moduleId));
};
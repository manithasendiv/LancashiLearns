import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc
} from "firebase/firestore";
import { db } from "../../../firebase/config";

export const getModulesByYearSemester = async (academicYear, semester) => {
  const modulesRef = collection(db, "modules");

  const q = query(
    modulesRef,
    where("academicYear", "==", Number(academicYear)),
    where("semester", "==", Number(semester))
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data()
  }));
};

export const getModuleById = async (moduleId) => {
  const ref = doc(db, "modules", moduleId);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    return null;
  }

  return {
    id: snap.id,
    ...snap.data()
  };
};

export const getModuleMaterials = async (moduleId) => {
  const materialsRef = collection(db, "modules", moduleId, "materials");
  const snapshot = await getDocs(materialsRef);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data()
  }));
};
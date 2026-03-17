import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../../../firebase/config";

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
      return timeA - timeB;
    }

    return (a.title || "").localeCompare(b.title || "");
  });
}

export const getModulesByYearSemester = async (academicYear, semester) => {
  const modulesRef = collection(db, "modules");

  const q = query(
    modulesRef,
    where("academicYear", "==", Number(academicYear)),
    where("semester", "==", Number(semester))
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((docItem) => ({
    id: docItem.id,
    ...docItem.data(),
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
    ...snap.data(),
  };
};

export const getModuleMaterials = async (moduleId) => {
  const materialsRef = collection(db, "modules", moduleId, "materials");
  const snapshot = await getDocs(materialsRef);

  const materials = snapshot.docs.map((docItem) => ({
    id: docItem.id,
    ...docItem.data(),
    weekNumber: normalizeWeekNumber(docItem.data().weekNumber),
  }));

  return sortMaterials(materials);
};
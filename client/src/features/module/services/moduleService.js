import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../../../firebase/config";

// Converts mixed week values into positive integers or null for invalid input.
function normalizeWeekNumber(value) {
  const num = Number(value);
  return Number.isInteger(num) && num > 0 ? num : null;
}

// Applies a deterministic ordering so materials render consistently in the UI.
function sortMaterials(materials = []) {
  // Prioritize valid week numbers, then upload timestamp, then title for stable ordering.
  return [...materials].sort((a, b) => {
    const weekA = normalizeWeekNumber(a.weekNumber);
    const weekB = normalizeWeekNumber(b.weekNumber);

    if (weekA === null && weekB !== null) return 1;
    if (weekA !== null && weekB === null) return -1;
    if (weekA !== null && weekB !== null && weekA !== weekB) {
      // Earlier weeks should appear first.
      return weekA - weekB;
    }

    // Use upload time as a secondary chronological tiebreaker.
    const timeA = a.uploadedAt?.seconds || 0;
    const timeB = b.uploadedAt?.seconds || 0;

    if (timeA !== timeB) {
      return timeA - timeB;
    }

    // Final lexical fallback keeps sort stable when all other fields match.
    return (a.title || "").localeCompare(b.title || "");
  });
}

// Returns modules filtered by the student profile's year and semester.
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

// Loads one module document by id.
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

// Loads and sorts module materials from the subcollection.
export const getModuleMaterials = async (moduleId) => {
  const materialsRef = collection(db, "modules", moduleId, "materials");
  const snapshot = await getDocs(materialsRef);

  // Normalize each material shape before sorting to keep downstream UI logic simple.
  const materials = snapshot.docs.map((docItem) => ({
    id: docItem.id,
    ...docItem.data(),
    weekNumber: normalizeWeekNumber(docItem.data().weekNumber),
  }));

  return sortMaterials(materials);
};
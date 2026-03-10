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
import { db } from "../../../firebase/config";

// MODULES
export const getAllModules = async () => {
  const snapshot = await getDocs(collection(db, "modules"));

  return snapshot.docs.map((docItem) => ({
    id: docItem.id,
    ...docItem.data(),
  }));
};

export const getModuleByIdForAdmin = async (moduleId) => {
  const ref = doc(db, "modules", moduleId);
  const snap = await getDoc(ref);

  if (!snap.exists()) return null;

  return {
    id: snap.id,
    ...snap.data(),
  };
};

export const addModule = async (moduleData) => {
  await addDoc(collection(db, "modules"), {
    code: moduleData.code,
    title: moduleData.title,
    description: moduleData.description,
    academicYear: Number(moduleData.academicYear),
    semester: Number(moduleData.semester),
    isProgrammingModule: Boolean(moduleData.isProgrammingModule),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

export const updateModuleById = async (moduleId, updatedData) => {
  await updateDoc(doc(db, "modules", moduleId), {
    code: updatedData.code,
    title: updatedData.title,
    description: updatedData.description,
    academicYear: Number(updatedData.academicYear),
    semester: Number(updatedData.semester),
    isProgrammingModule: Boolean(updatedData.isProgrammingModule),
    updatedAt: serverTimestamp(),
  });
};

export const deleteModuleById = async (moduleId) => {
  await deleteDoc(doc(db, "modules", moduleId));
};

// USERS
export const getAllUsers = async () => {
  const snapshot = await getDocs(collection(db, "users"));

  return snapshot.docs.map((docItem) => ({
    id: docItem.id,
    ...docItem.data(),
  }));
};

export const updateUserById = async (userId, updatedData) => {
  const payload = {
    updatedAt: serverTimestamp(),
  };

  if (updatedData.role !== undefined) payload.role = updatedData.role;
  if (updatedData.status !== undefined) payload.status = updatedData.status;
  if (updatedData.academicYear !== undefined) {
    payload.academicYear =
      updatedData.academicYear === null ? null : Number(updatedData.academicYear);
  }
  if (updatedData.semester !== undefined) {
    payload.semester =
      updatedData.semester === null ? null : Number(updatedData.semester);
  }

  await updateDoc(doc(db, "users", userId), payload);
};

// COUNTS
export const getAdminCounts = async () => {
  const [usersSnap, modulesSnap] = await Promise.all([
    getDocs(collection(db, "users")),
    getDocs(collection(db, "modules")),
  ]);

  let totalMaterials = 0;
  let activeUsers = 0;
  let inactiveUsers = 0;

  const users = usersSnap.docs.map((d) => d.data());
  const modules = modulesSnap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));

  users.forEach((user) => {
    if ((user.status || "active") === "active") {
      activeUsers += 1;
    } else {
      inactiveUsers += 1;
    }
  });

  for (const module of modules) {
    const materialsSnap = await getDocs(
      collection(db, "modules", module.id, "materials")
    );
    totalMaterials += materialsSnap.size;
  }

  return {
    totalUsers: users.length,
    totalModules: modules.length,
    totalMaterials,
    activeUsers,
    inactiveUsers,
  };
};
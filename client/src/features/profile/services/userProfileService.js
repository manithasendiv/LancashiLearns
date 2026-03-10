import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../../firebase/config";

export const getUserProfileById = async (uid) => {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    return null;
  }

  return {
    id: snap.id,
    ...snap.data(),
  };
};

export const updateUserProfileById = async (uid, data) => {
  await updateDoc(doc(db, "users", uid), {
    fullName: data.fullName,
    academicYear: data.academicYear ? Number(data.academicYear) : null,
    semester: data.semester ? Number(data.semester) : null,
    updatedAt: serverTimestamp(),
  });
};
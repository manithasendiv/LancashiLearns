import {
  doc,
  setDoc,
  getDocs,
  collection,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../../firebase/config";

export const toggleMaterialCompletion = async (
  uid,
  moduleId,
  materialId,
  completed
) => {
  const progressId = `${uid}_${moduleId}_${materialId}`;
  const ref = doc(db, "materialProgress", progressId);

  await setDoc(
    ref,
    {
      userId: uid,
      moduleId,
      materialId,
      completed,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
};

export const getUserModuleProgress = async (uid, moduleId) => {
  const q = query(
    collection(db, "materialProgress"),
    where("userId", "==", uid),
    where("moduleId", "==", moduleId)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((docItem) => ({
    id: docItem.id,
    ...docItem.data(),
  }));
};
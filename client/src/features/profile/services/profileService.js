import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../../firebase/config";

export const saveAcademicSelection = async (uid, academicYear, semester) => {
  await updateDoc(doc(db, "users", uid), {
    academicYear: Number(academicYear),
    semester: Number(semester),
    profileCompleted: true,
    updatedAt: serverTimestamp()
  });
};
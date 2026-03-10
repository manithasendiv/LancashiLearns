import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../../firebase/config";
import { getUserProfile } from "../../auth/services/authService";
import { getModulesByYearSemester } from "../../module/services/moduleService";
import ModuleCard from "../../../components/common/ModuleCard";
import AppLayout from "../../../components/common/AppLayout";

export default function DashboardPage() {
  const [profile, setProfile] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        setLoading(true);
        setError("");

        if (!user) {
          setError("No authenticated user found.");
          setLoading(false);
          return;
        }

        console.log("Logged in user:", user.uid);

        const userProfile = await getUserProfile(user.uid);
        console.log("User profile:", userProfile);

        if (!userProfile) {
          setError("User profile not found.");
          setLoading(false);
          return;
        }

        setProfile(userProfile);

        if (userProfile.academicYear && userProfile.semester) {
          const moduleList = await getModulesByYearSemester(
            userProfile.academicYear,
            userProfile.semester
          );

          console.log("Modules returned:", moduleList);
          setModules(moduleList);
        } else {
          console.log("User does not have academicYear/semester");
          setModules([]);
        }
      } catch (err) {
        console.error("Dashboard load error:", err);
        setError("Failed to load dashboard.");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="p-6">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  return (
    <AppLayout
      title="Student Dashboard"
      subtitle={`Year ${profile?.academicYear} • Semester ${profile?.semester}`}
    >
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <p className="text-sm text-slate-500">Student</p>
          <h3 className="text-2xl font-bold text-slate-800 mt-2">
            {profile?.fullName || "Student"}
          </h3>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <p className="text-sm text-slate-500">Modules This Semester</p>
          <h3 className="text-2xl font-bold text-slate-800 mt-2">{modules.length}</h3>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <p className="text-sm text-slate-500">Learning Status</p>
          <h3 className="text-2xl font-bold text-green-600 mt-2">Active</h3>
        </div>
      </div>

      {modules.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 text-slate-600">
          No modules found for your selected academic year and semester.
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          {modules.map((module) => (
            <ModuleCard key={module.id} module={module} />
          ))}
        </div>
      )}
    </AppLayout>
  );
}
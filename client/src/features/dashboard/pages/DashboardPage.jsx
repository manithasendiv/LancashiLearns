import { useEffect, useState } from "react";
import { auth } from "../../../firebase/config";
import { getUserProfile } from "../../auth/services/authService";
import { getModulesByYearSemester } from "../../module/services/moduleService";
import ModuleCard from "../../../components/common/ModuleCard";

export default function DashboardPage() {
  const [profile, setProfile] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const user = auth.currentUser;

        if (!user) {
          setError("No authenticated user found.");
          setLoading(false);
          return;
        }

        const userProfile = await getUserProfile(user.uid);

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
          setModules(moduleList);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load dashboard.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return <div className="p-6">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-slate-100 px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Student Dashboard</h1>
        <p className="text-slate-600 mt-2">
          Year {profile?.academicYear} - Semester {profile?.semester}
        </p>
      </div>

      {modules.length === 0 ? (
        <div className="bg-white p-6 rounded-2xl shadow text-slate-600">
          No modules found for your selected academic year and semester.
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {modules.map((module) => (
            <ModuleCard key={module.id} module={module} />
          ))}
        </div>
      )}
    </div>
  );
}
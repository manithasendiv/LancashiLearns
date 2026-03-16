import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../../firebase/config";
import { getUserProfile } from "../../auth/services/authService";
import {
  getModulesByYearSemester,
  getModuleMaterials,
} from "../../module/services/moduleService";
import { getUserModuleProgress } from "../../module/services/progressService";
import ModuleCard from "../../../components/common/ModuleCard";
import AppLayout from "../../../components/common/AppLayout";
import PageLoader from "../../../components/common/PageLoader";

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

          const modulesWithProgress = await Promise.all(
            moduleList.map(async (module) => {
              const materials = await getModuleMaterials(module.id);
              const progress = await getUserModuleProgress(user.uid, module.id);

              const completedCount = progress.filter((item) => item.completed).length;
              const totalMaterials = materials.length;

              return {
                ...module,
                completedCount,
                totalMaterials,
              };
            })
          );

          setModules(modulesWithProgress);
        } else {
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

  const overallProgress = useMemo(() => {
    const completed = modules.reduce(
      (sum, module) => sum + (module.completedCount || 0),
      0
    );
    const total = modules.reduce(
      (sum, module) => sum + (module.totalMaterials || 0),
      0
    );

    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  }, [modules]);

  const completedMaterials = useMemo(() => {
    return modules.reduce((sum, module) => sum + (module.completedCount || 0), 0);
  }, [modules]);

  const recentMaterials = useMemo(() => {
    return modules.slice(0, 3).map((module) => ({
      title: `${module.title} Resources`,
      module: module.code,
      progress:
        module.totalMaterials > 0
          ? Math.round((module.completedCount / module.totalMaterials) * 100)
          : 0,
    }));
  }, [modules]);

  if (loading) {
    return <PageLoader text="Loading dashboard..." />;
  }

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  return (
    <AppLayout>
      <section className="mb-8 grid gap-6 lg:grid-cols-[1.5fr_0.9fr]">
        <div className="rounded-3xl bg-gradient-to-r from-blue-700 to-indigo-700 p-8 text-white shadow-sm">
          <p className="text-sm font-medium text-blue-100">Welcome back</p>
          <h2 className="mt-2 text-3xl font-bold">
            {profile?.fullName || "Student"}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100">
            Access your assigned modules, continue learning materials, keep
            personal notes, and track your academic progress from one workspace.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <span className="rounded-full bg-white/15 px-4 py-2 text-sm">
              Year {profile?.academicYear || "-"}
            </span>
            <span className="rounded-full bg-white/15 px-4 py-2 text-sm">
              Semester {profile?.semester || "-"}
            </span>
            <span className="rounded-full bg-white/15 px-4 py-2 text-sm">
              {modules.length} Active Modules
            </span>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900">Daily Progress</h3>
          <div className="mt-5 space-y-4">
            {modules.length === 0 ? (
              <p className="text-sm text-slate-500">No modules assigned yet.</p>
            ) : (
              modules.map((module) => {
                const percent =
                  module.totalMaterials > 0
                    ? Math.round((module.completedCount / module.totalMaterials) * 100)
                    : 0;

                return (
                  <div key={module.id}>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-700">
                        {module.title}
                      </span>
                      <span className="text-slate-500">{percent}%</span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-blue-600"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      <section className="mb-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Enrolled Modules</p>
          <h3 className="mt-2 text-3xl font-bold text-slate-900">{modules.length}</h3>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Completed Materials</p>
          <h3 className="mt-2 text-3xl font-bold text-slate-900">
            {completedMaterials}
          </h3>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Overall Progress</p>
          <h3 className="mt-2 text-3xl font-bold text-slate-900">
            {overallProgress}%
          </h3>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-900">Your Modules</h3>
          </div>

          {modules.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-slate-600">
              No modules found for your selected academic year and semester.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {modules.map((module) => (
                <ModuleCard key={module.id} module={module} />
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-xl font-bold text-slate-900">Recent Module Progress</h3>
            <div className="mt-5 space-y-4">
              {recentMaterials.length === 0 ? (
                <p className="text-sm text-slate-500">No module activity yet.</p>
              ) : (
                recentMaterials.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="font-semibold text-slate-900">{item.title}</h4>
                        <p className="mt-1 text-sm text-slate-500">{item.module}</p>
                      </div>
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm">
                        {item.progress}%
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
  <h3 className="text-xl font-bold text-slate-900">Continue Learning</h3>

  {modules.length === 0 ? (
    <p className="mt-4 text-sm text-slate-500">No modules available yet.</p>
  ) : (() => {
    const nextModule =
      modules.find((module) => {
        const total = module.totalMaterials || 0;
        const completed = module.completedCount || 0;
        return total > 0 && completed < total;
      }) || modules[0];

    const completed = nextModule.completedCount || 0;
    const total = nextModule.totalMaterials || 0;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

    return (
      <div className="mt-5 rounded-2xl bg-slate-50 p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
          {nextModule.code}
        </p>
        <h4 className="mt-2 text-lg font-bold text-slate-900">
          {nextModule.title}
        </h4>
        <p className="mt-2 text-sm text-slate-500">
          {completed} of {total} materials completed
        </p>

        <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-blue-600"
            style={{ width: `${percent}%` }}
          />
        </div>

        <p className="mt-2 text-sm text-slate-600">{percent}% completed</p>

        <Link
          to={`/modules/${nextModule.id}`}
          className="mt-5 inline-block rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          Open Workspace
        </Link>
      </div>
    );
  })()}
</div>
        </div>
      </section>
    </AppLayout>
  );
}
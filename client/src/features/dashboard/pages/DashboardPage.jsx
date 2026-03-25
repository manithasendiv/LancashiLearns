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

function BookIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
    >
      <path
        d="M4 6.5A2.5 2.5 0 0 1 6.5 4H20v15.5A1.5 1.5 0 0 1 18.5 21H6.5A2.5 2.5 0 0 1 4 18.5v-12Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 8h8M8 12h8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-5 w-5"
    >
      <path
        d="m5 12 4.2 4.2L19 6.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LayersIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
    >
      <path
        d="M12 4 4 8l8 4 8-4-8-4ZM4 12l8 4 8-4M4 16l8 4 8-4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
    >
      <path
        d="M4 19h16M7 16V9M12 16V5M17 16v-7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-4 w-4"
    >
      <path d="M8.5 6.5c0-.8.9-1.3 1.6-.8l7 5.5c.5.4.5 1.1 0 1.5l-7 5.5c-.7.5-1.6 0-1.6-.8v-11Z" />
    </svg>
  );
}

function StorageIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
    >
      <path
        d="M3 7.5A2.5 2.5 0 0 1 5.5 5H10l2 2h6.5A2.5 2.5 0 0 1 21 9.5v7A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5v-9Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

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

              const completedCount = progress.filter(
                (item) => item.completed
              ).length;
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

  const totalMaterialsCount = useMemo(() => {
    return modules.reduce((sum, module) => sum + (module.totalMaterials || 0), 0);
  }, [modules]);

  const nextModule = useMemo(() => {
    return (
      modules.find((module) => {
        const total = module.totalMaterials || 0;
        const completed = module.completedCount || 0;
        return total > 0 && completed < total;
      }) || modules[0] || null
    );
  }, [modules]);

  const recentModules = useMemo(() => {
    return modules.slice(0, 4).map((module) => {
      const total = module.totalMaterials || 0;
      const completed = module.completedCount || 0;
      const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

      return {
        id: module.id,
        title: module.title,
        code: module.code,
        completed,
        total,
        percent,
      };
    });
  }, [modules]);

  if (loading) {
    return <PageLoader text="Loading dashboard..." />;
  }

  if (error) {
    return (
      <AppLayout>
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-600">
          {error}
        </div>
      </AppLayout>
    );
  }

  const nextCompleted = nextModule?.completedCount || 0;
  const nextTotal = nextModule?.totalMaterials || 0;
  const nextPercent =
    nextTotal > 0 ? Math.round((nextCompleted / nextTotal) * 100) : 0;

  return (
    <AppLayout>
      <div className="space-y-8">
        <section className="grid gap-6 xl:grid-cols-[1.5fr_0.95fr]">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-blue-800 to-indigo-700 p-8 text-white shadow-lg">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-12 left-10 h-32 w-32 rounded-full bg-cyan-300/10 blur-2xl" />

            <div className="relative">
              <p className="text-sm font-medium text-blue-100">Student Dashboard</p>

              <h1 className="mt-3 text-3xl font-bold leading-tight md:text-4xl">
                Welcome back, {profile?.fullName || "Student"}
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-200">
                View your assigned modules, continue your learning materials,
                track completion progress, and keep your study flow organized in
                one place.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm">
                  Year {profile?.academicYear || "-"}
                </span>
                <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm">
                  Semester {profile?.semester || "-"}
                </span>
                <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm">
                  {modules.length} Modules
                </span>
              </div>

              <div className="mt-8">
                <div className="mb-2 flex items-center justify-between text-sm text-slate-200">
                  <span>Overall study progress</span>
                  <span>{overallProgress}%</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-white/20">
                  <div
                    className="h-full rounded-full bg-white"
                    style={{ width: `${overallProgress}%` }}
                  />
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to="/storage"
                  className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                >
                  My Storage
                </Link>

                <span className="inline-flex items-center rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-slate-200">
                  Upload your own materials for later use
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Continue Learning</h2>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                Next
              </span>
            </div>

            {!nextModule ? (
              <div className="mt-6 rounded-2xl bg-slate-50 p-5 text-sm text-slate-500">
                No modules available yet for your selected academic year and semester.
              </div>
            ) : (
              <div className="mt-6 rounded-2xl bg-slate-50 p-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                    {nextModule.code}
                  </p>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                    <PlayIcon />
                  </div>
                </div>

                <h3 className="mt-2 text-lg font-bold text-slate-900">
                  {nextModule.title}
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  {nextCompleted} of {nextTotal} materials completed
                </p>

                <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-blue-600"
                    style={{ width: `${nextPercent}%` }}
                  />
                </div>

                <p className="mt-2 text-sm font-medium text-slate-700">
                  {nextPercent}% completed
                </p>

                <Link
                  to={`/modules/${nextModule.id}`}
                  className="mt-5 inline-flex items-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Open Workspace
                </Link>
              </div>
            )}
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-slate-500">Enrolled Modules</p>
                <h3 className="mt-2 text-3xl font-bold text-slate-900">
                  {modules.length}
                </h3>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                <BookIcon />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-slate-500">Completed Materials</p>
                <h3 className="mt-2 text-3xl font-bold text-slate-900">
                  {completedMaterials}
                </h3>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                <CheckIcon />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-slate-500">Total Materials</p>
                <h3 className="mt-2 text-3xl font-bold text-slate-900">
                  {totalMaterialsCount}
                </h3>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
                <LayersIcon />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-slate-500">Overall Progress</p>
                <h3 className="mt-2 text-3xl font-bold text-blue-600">
                  {overallProgress}%
                </h3>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                <ChartIcon />
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.45fr_1fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Your Modules</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Access your current modules and continue your learning.
                </p>
              </div>
            </div>

            {modules.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">
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

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5">
              <h2 className="text-xl font-bold text-slate-900">Recent Progress</h2>
              <p className="mt-1 text-sm text-slate-500">
                Quick view of your latest module completion levels.
              </p>
            </div>

            <div className="space-y-4">
              {recentModules.length === 0 ? (
                <div className="rounded-2xl bg-slate-50 p-5 text-sm text-slate-500">
                  No module activity yet.
                </div>
              ) : (
                recentModules.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="font-semibold text-slate-900">{item.title}</h4>
                        <p className="mt-1 text-sm text-slate-500">{item.code}</p>
                      </div>

                      <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
                        {item.percent}%
                      </span>
                    </div>

                    <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-blue-600"
                        style={{ width: `${item.percent}%` }}
                      />
                    </div>

                    <p className="mt-2 text-xs text-slate-500">
                      {item.completed} / {item.total} materials completed
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
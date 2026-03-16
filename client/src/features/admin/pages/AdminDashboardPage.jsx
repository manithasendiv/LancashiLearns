import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AppLayout from "../../../components/common/AppLayout";
import { getAdminCounts } from "../services/adminService";

function StatCard({
  title,
  value,
  accent = "text-slate-800",
  iconBg = "bg-slate-100",
  icon,
  loading,
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          {loading ? (
            <div className="mt-3 h-8 w-20 rounded-lg bg-slate-200 animate-pulse" />
          ) : (
            <h3 className={`text-3xl font-bold mt-2 ${accent}`}>{value}</h3>
          )}
        </div>

        <div
          className={`h-12 w-12 rounded-2xl ${iconBg} flex items-center justify-center shrink-0`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

function ActionCard({ to, title, description, badge, icon }) {
  return (
    <Link
      to={to}
      className="group bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md hover:-translate-y-0.5 transition"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3">
          <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            {badge}
          </span>

          <div>
            <h3 className="text-xl font-bold text-slate-800 group-hover:text-blue-600 transition">
              {title}
            </h3>
            <p className="text-slate-600 mt-2 leading-relaxed">{description}</p>
          </div>
        </div>

        <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center shrink-0">
          {icon}
        </div>
      </div>
    </Link>
  );
}

function ProgressBar({ value, colorClass = "bg-blue-600" }) {
  return (
    <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
      <div
        className={`h-full rounded-full ${colorClass} transition-all duration-500`}
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}

export default function AdminDashboardPage() {
  const [counts, setCounts] = useState({
    totalUsers: 0,
    totalModules: 0,
    totalMaterials: 0,
    activeUsers: 0,
    inactiveUsers: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCounts = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getAdminCounts();
      setCounts(data);
    } catch (err) {
      console.error("Failed to load admin counts:", err);
      setError("Unable to load dashboard statistics right now.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCounts();
  }, [loadCounts]);

  const activePercentage = useMemo(() => {
    if (!counts.totalUsers) return 0;
    return Math.round((counts.activeUsers / counts.totalUsers) * 100);
  }, [counts.activeUsers, counts.totalUsers]);

  const inactivePercentage = useMemo(() => {
    if (!counts.totalUsers) return 0;
    return Math.round((counts.inactiveUsers / counts.totalUsers) * 100);
  }, [counts.inactiveUsers, counts.totalUsers]);

  const avgMaterialsPerModule = useMemo(() => {
    if (!counts.totalModules) return 0;
    return (counts.totalMaterials / counts.totalModules).toFixed(1);
  }, [counts.totalMaterials, counts.totalModules]);

  return (
    <AppLayout>
      <div className="space-y-8">
        <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-r from-slate-900 via-slate-800 to-blue-900 p-8 shadow-sm">
          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-200">
                Admin Panel
              </p>
              <h1 className="mt-3 text-3xl md:text-4xl font-bold text-white">
                Admin Dashboard
              </h1>
              <p className="mt-3 max-w-2xl text-slate-200 leading-relaxed">
                Monitor platform activity, manage academic content, and control
                user access from one central workspace.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/admin/modules"
                className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-100 transition"
              >
                Manage Modules
              </Link>

              <Link
                to="/admin/users"
                className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white hover:bg-white/20 transition"
              >
                Manage Users
              </Link>

              <button
                onClick={loadCounts}
                className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-transparent px-4 py-3 text-sm font-semibold text-white hover:bg-white/10 transition"
              >
                Refresh Data
              </button>
            </div>
          </div>

          <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-16 left-20 h-44 w-44 rounded-full bg-blue-400/10 blur-2xl" />
        </section>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-red-700">
            <div className="flex items-center justify-between gap-4">
              <p>{error}</p>
              <button
                onClick={loadCounts}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard
            title="Total Users"
            value={counts.totalUsers}
            accent="text-slate-800"
            iconBg="bg-blue-100"
            loading={loading}
            icon={
              <svg
                className="h-6 w-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                viewBox="0 0 24 24"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
                <circle cx="9.5" cy="7" r="4" />
                <path d="M20 8v6M23 11h-6" />
              </svg>
            }
          />

          <StatCard
            title="Total Modules"
            value={counts.totalModules}
            accent="text-slate-800"
            iconBg="bg-violet-100"
            loading={loading}
            icon={
              <svg
                className="h-6 w-6 text-violet-600"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                viewBox="0 0 24 24"
              >
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 17A2.5 2.5 0 0 0 4 19.5V6a2 2 0 0 1 2-2h14v13" />
              </svg>
            }
          />

          <StatCard
            title="Total Materials"
            value={counts.totalMaterials}
            accent="text-slate-800"
            iconBg="bg-amber-100"
            loading={loading}
            icon={
              <svg
                className="h-6 w-6 text-amber-600"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                viewBox="0 0 24 24"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <path d="M14 2v6h6" />
                <path d="M8 13h8M8 17h5" />
              </svg>
            }
          />

          <StatCard
            title="Active Users"
            value={counts.activeUsers}
            accent="text-green-600"
            iconBg="bg-green-100"
            loading={loading}
            icon={
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                viewBox="0 0 24 24"
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
            }
          />

          <StatCard
            title="Inactive Users"
            value={counts.inactiveUsers}
            accent="text-red-600"
            iconBg="bg-red-100"
            loading={loading}
            icon={
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                viewBox="0 0 24 24"
              >
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            }
          />
        </section>

        <section className="grid gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  Management Shortcuts
                </h2>
                <p className="text-slate-600 mt-1">
                  Quickly navigate to the main administrative areas.
                </p>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              <ActionCard
                to="/admin/modules"
                badge="Academic Structure"
                title="Module Management"
                description="Create, update, and organize academic modules by year and semester."
                icon={
                  <svg
                    className="h-6 w-6 text-violet-600"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 6 3 10.5 12 15l9-4.5L12 6Z" />
                    <path d="M3 15l9 4.5 9-4.5" />
                  </svg>
                }
              />

              <ActionCard
                to="/admin/users"
                badge="Access Control"
                title="User Management"
                description="Update user roles, statuses, academic year, and semester details."
                icon={
                  <svg
                    className="h-6 w-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    viewBox="0 0 24 24"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
                    <circle cx="9.5" cy="7" r="4" />
                    <path d="M20 8v6M23 11h-6" />
                  </svg>
                }
              />

              <ActionCard
                to="/admin/materials"
                badge="Learning Content"
                title="Material Management"
                description="Upload, edit, and maintain lecture notes and digital learning resources."
                icon={
                  <svg
                    className="h-6 w-6 text-amber-600"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    viewBox="0 0 24 24"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <path d="M14 2v6h6" />
                    <path d="M8 13h8M8 17h5" />
                  </svg>
                }
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-800">Platform Overview</h2>
            <p className="text-slate-600 mt-1">
              A quick snapshot of system usage and content distribution.
            </p>

            <div className="mt-6 space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-600">
                    Active user ratio
                  </span>
                  <span className="text-sm font-semibold text-slate-800">
                    {loading ? "--" : `${activePercentage}%`}
                  </span>
                </div>
                <ProgressBar value={loading ? 0 : activePercentage} colorClass="bg-green-600" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-600">
                    Inactive user ratio
                  </span>
                  <span className="text-sm font-semibold text-slate-800">
                    {loading ? "--" : `${inactivePercentage}%`}
                  </span>
                </div>
                <ProgressBar value={loading ? 0 : inactivePercentage} colorClass="bg-red-600" />
              </div>

              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                <p className="text-sm text-slate-500">Average materials per module</p>
                <h3 className="mt-2 text-2xl font-bold text-slate-800">
                  {loading ? "--" : avgMaterialsPerModule}
                </h3>
              </div>

              <div className="rounded-2xl bg-blue-50 border border-blue-100 p-4">
                <p className="text-sm text-blue-700 font-medium">Admin Insight</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-700">
                  {loading
                    ? "Loading latest dashboard insight..."
                    : counts.totalModules === 0
                    ? "No modules have been created yet. Start by adding academic modules."
                    : counts.totalMaterials === 0
                    ? "Modules exist, but materials have not yet been uploaded."
                    : counts.inactiveUsers > counts.activeUsers
                    ? "Inactive users currently exceed active users. You may want to review account statuses."
                    : "The platform has active engagement and learning resources are available across modules."}
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
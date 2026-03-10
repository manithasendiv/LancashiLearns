import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AppLayout from "../../../components/common/AppLayout";
import { getAdminCounts } from "../services/adminService";


export default function AdminDashboardPage() {
  const [counts, setCounts] = useState({
    totalUsers: 0,
    totalModules: 0,
    totalMaterials: 0,
    activeUsers: 0,
    inactiveUsers: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCounts = async () => {
      try {
        setLoading(true);
        const data = await getAdminCounts();
        setCounts(data);
      } catch (error) {
        console.error("Failed to load admin counts:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCounts();
  }, []);

  return (
    <AppLayout>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800">Admin Dashboard</h2>
        <p className="text-slate-600 mt-2">
          Manage users, modules, and learning resources
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-5 mb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <p className="text-sm text-slate-500">Total Users</p>
          <h3 className="text-2xl font-bold text-slate-800 mt-2">
            {loading ? "--" : counts.totalUsers}
          </h3>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <p className="text-sm text-slate-500">Total Modules</p>
          <h3 className="text-2xl font-bold text-slate-800 mt-2">
            {loading ? "--" : counts.totalModules}
          </h3>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <p className="text-sm text-slate-500">Total Materials</p>
          <h3 className="text-2xl font-bold text-slate-800 mt-2">
            {loading ? "--" : counts.totalMaterials}
          </h3>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <p className="text-sm text-slate-500">Active Users</p>
          <h3 className="text-2xl font-bold text-green-600 mt-2">
            {loading ? "--" : counts.activeUsers}
          </h3>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <p className="text-sm text-slate-500">Inactive Users</p>
          <h3 className="text-2xl font-bold text-red-600 mt-2">
            {loading ? "--" : counts.inactiveUsers}
          </h3>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Link
          to="/admin/modules"
          className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition"
        >
          <h3 className="text-xl font-bold text-slate-800">Module Management</h3>
          <p className="text-slate-600 mt-2">
            Add, edit, and remove academic modules.
          </p>
        </Link>

        <Link
          to="/admin/users"
          className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition"
        >
          <h3 className="text-xl font-bold text-slate-800">User Management</h3>
          <p className="text-slate-600 mt-2">
            Update roles, statuses, academic year, and semester.
          </p>
        </Link>

        <Link
          to="/admin/materials"
          className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition"
        >
          <h3 className="text-xl font-bold text-slate-800">Material Management</h3>
          <p className="text-slate-600 mt-2">
            Upload and manage lecture notes and resources.
          </p>
        </Link>
      </div>
    </AppLayout>
  );
}
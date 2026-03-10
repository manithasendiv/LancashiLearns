import { Link } from "react-router-dom";
import AppLayout from "../../../components/common/AppLayout";

export default function AdminDashboardPage() {
  return (
    <AppLayout>
      <div className="mb-8">
  <h2 className="text-3xl font-bold text-slate-800">Admin Dashboard</h2>
  <p className="text-slate-600 mt-2">
    Manage users, modules, and learning resources
  </p>
</div>
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <p className="text-sm text-slate-500">Total Users</p>
          <h3 className="text-2xl font-bold text-slate-800 mt-2">--</h3>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <p className="text-sm text-slate-500">Total Modules</p>
          <h3 className="text-2xl font-bold text-slate-800 mt-2">--</h3>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <p className="text-sm text-slate-500">System Status</p>
          <h3 className="text-2xl font-bold text-green-600 mt-2">Active</h3>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Link
          to="/admin/modules"
          className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition"
        >
          <h3 className="text-xl font-bold text-slate-800">Module Management</h3>
          <p className="text-slate-600 mt-2">
            Add, view, and remove academic modules from the system.
          </p>
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-xl font-bold text-slate-800">User Management</h3>
          <p className="text-slate-600 mt-2">User management will be added next.</p>
        </div>
      </div>
    </AppLayout>
  );
}
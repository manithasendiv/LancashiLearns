import { useEffect, useMemo, useState } from "react";
import AppLayout from "../../../components/common/AppLayout";
import { getAllUsers, updateUserById } from "../services/adminService";

export default function ManageUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getAllUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return users.filter((user) => {
      const name = user.fullName?.toLowerCase() || "";
      const email = user.email?.toLowerCase() || "";
      const role = user.role || "student";
      const status = user.status || "active";

      const matchesSearch = !term || name.includes(term) || email.includes(term);
      const matchesRole = roleFilter === "all" || role === roleFilter;
      const matchesStatus = statusFilter === "all" || status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

  const handleRoleChange = async (userId, role) => {
    try {
      setError("");
      setSuccess("");
      await updateUserById(userId, { role });
      setSuccess("User role updated successfully.");
      await loadUsers();
    } catch (err) {
      console.error(err);
      setError("Failed to update user role.");
    }
  };

  const handleStatusChange = async (userId, status) => {
    try {
      setError("");
      setSuccess("");
      await updateUserById(userId, { status });
      setSuccess("User status updated successfully.");
      await loadUsers();
    } catch (err) {
      console.error(err);
      setError("Failed to update user status.");
    }
  };

  const handleAcademicYearChange = async (userId, academicYear) => {
    try {
      setError("");
      setSuccess("");
      await updateUserById(userId, { academicYear });
      setSuccess("Academic year updated successfully.");
      await loadUsers();
    } catch (err) {
      console.error(err);
      setError("Failed to update academic year.");
    }
  };

  const handleSemesterChange = async (userId, semester) => {
    try {
      setError("");
      setSuccess("");
      await updateUserById(userId, { semester });
      setSuccess("Semester updated successfully.");
      await loadUsers();
    } catch (err) {
      console.error(err);
      setError("Failed to update semester.");
    }
  };

  return (
    <AppLayout>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800">Manage Users</h2>
        <p className="text-slate-600 mt-2">
          View and manage student and admin accounts
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-600">
          {success}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 mb-5">
          <h3 className="text-xl font-bold text-slate-800">All Users</h3>

          <div className="flex flex-col md:flex-row gap-3">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or email"
              className="border border-slate-300 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            />

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="border border-slate-300 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Roles</option>
              <option value="student">Student</option>
              <option value="admin">Admin</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-slate-300 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <span className="text-sm text-slate-500 self-center">
              {filteredUsers.length} found
            </span>
          </div>
        </div>

        {loading ? (
          <p className="text-slate-600">Loading users...</p>
        ) : filteredUsers.length === 0 ? (
          <p className="text-slate-600">No matching users found.</p>
        ) : (
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="border border-slate-200 rounded-2xl p-5"
              >
                <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr_1fr_1fr_1fr] lg:items-center">
                  <div>
                    <h4 className="text-lg font-bold text-slate-800">
                      {user.fullName || "Unnamed User"}
                    </h4>
                    <p className="text-slate-600 mt-1">{user.email}</p>

                    <div className="flex flex-wrap gap-2 mt-3">
                      <span className="text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-full">
                        {user.role || "student"}
                      </span>
                      <span className="text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-full">
                        {user.status || "active"}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-semibold text-slate-700">
                      Role
                    </label>
                    <select
                      value={user.role || "student"}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="student">Student</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-semibold text-slate-700">
                      Status
                    </label>
                    <select
                      value={user.status || "active"}
                      onChange={(e) => handleStatusChange(user.id, e.target.value)}
                      className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-semibold text-slate-700">
                      Year
                    </label>
                    <select
                      value={user.academicYear ?? ""}
                      onChange={(e) => handleAcademicYearChange(user.id, e.target.value)}
                      className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">-</option>
                      <option value="1">Year 1</option>
                      <option value="2">Year 2</option>
                      <option value="3">Year 3</option>
                      <option value="4">Year 4</option>
                    </select>
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-semibold text-slate-700">
                      Semester
                    </label>
                    <select
                      value={user.semester ?? ""}
                      onChange={(e) => handleSemesterChange(user.id, e.target.value)}
                      className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">-</option>
                      <option value="1">Semester 1</option>
                      <option value="2">Semester 2</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
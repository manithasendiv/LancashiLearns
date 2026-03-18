import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AppLayout from "../../../components/common/AppLayout";
import { getAllUsers, updateUserById } from "../services/adminService";

function getRoleBadgeClasses(role) {
    switch (role) {
      case "admin":
        return "bg-violet-100 text-violet-700 border-violet-200";
        case "student":
          default:
            return "bg-blue-100 text-blue-700 border-blue-200";
          }
        }

        function getStatusBadgeClasses(status) {
            switch (status) {
              case "inactive":
                return "bg-red-100 text-red-700 border-red-200";
                case "active":
                  default:
                    return "bg-green-100 text-green-700 border-green-200";
                  }
                }

                function StatCard({ title, value, accent = "text-slate-800" }) {
                    return (
                      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                      <p className="text-sm font-medium text-slate-500">{title}</p>
                      <h3 className={`mt-2 text-3xl font-bold ${accent}`}>{value}</h3>
                      </div>
                    );
                  }

                  export default function ManageUsersPage() {
                    const [users, setUsers] = useState([]);
                    const [loading, setLoading] = useState(true);
                    const [updatingKey, setUpdatingKey] = useState("");
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

                        const matchesSearch =
                        !term || name.includes(term) || email.includes(term);
                        const matchesRole = roleFilter === "all" || role === roleFilter;
                        const matchesStatus = statusFilter === "all" || status === statusFilter;

                        return matchesSearch && matchesRole && matchesStatus;
                    });
                  }, [users, searchTerm, roleFilter, statusFilter]);

                  const stats = useMemo(() => {
                    const total = users.length;
                    const students = users.filter((user) => (user.role || "student") === "student").length;
                    const admins = users.filter((user) => (user.role || "student") === "admin").length;
                    const active = users.filter((user) => (user.status || "active") === "active").length;
                    const inactive = users.filter((user) => (user.status || "active") === "inactive").length;

                    return { total, students, admins, active, inactive };
                  }, [users]);

                  const handleUserUpdate = async (userId, field, value, successMessage) => {
                    try {
                      setError("");
                      setSuccess("");
                      setUpdatingKey(`${userId}-${field}`);

                      await updateUserById(userId, { [field]: value });
                      setSuccess(successMessage);
                      await loadUsers();
                    } catch (err) {
                      console.error(err);
                      setError(`Failed to update ${field}.`);
                    } finally {
                      setUpdatingKey("");
                    }
                  };

                  const clearFilters = () => {
                    setSearchTerm("");
                    setRoleFilter("all");
                    setStatusFilter("all");
                  };

                  return (
                    <AppLayout>
                      <div className="space-y-8">
                        <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-r from-slate-900 via-slate-800 to-blue-900 p-8 shadow-sm">
                          <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-200">
                                Admin / Users
                              </p>
                              <div className="flex items-center gap-4">
                                <Link
                                to="/admin"
                                className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-white/30 bg-white/10 text-white transition hover:bg-white/20"
                                aria-label="Back to Admin"
                                title="Back to Admin"
                                >
                                <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                className="h-5 w-5"
                                >
                                <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15 18l-6-6 6-6"
                                />
                              </svg>
                            </Link>

                            <h1 className="text-3xl font-bold text-white md:text-4xl">
                              Manage Users
                            </h1>
                          </div>
                          <p className="mt-3 max-w-2xl text-slate-200 leading-relaxed">
                            View and manage student and admin accounts, update access roles,
                            account status, and academic information from one place.
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                          <button
                          onClick={loadUsers}
                          className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-100 transition"
                          >
                          Refresh Users
                        </button>

                        <button
                        onClick={clearFilters}
                        className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white hover:bg-white/20 transition"
                        >
                        Clear Filters
                      </button>
                    </div>
                  </div>

                  <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
                  <div className="absolute -bottom-16 left-20 h-44 w-44 rounded-full bg-blue-400/10 blur-2xl" />
                </section>

                {error && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-red-700">
                    {error}
                  </div>
              )}

              {success && (
                <div className="rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-green-700">
                  {success}
                </div>
            )}

            <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
              <StatCard title="Total Users" value={stats.total} />
              <StatCard title="Students" value={stats.students} accent="text-blue-600" />
              <StatCard title="Admins" value={stats.admins} accent="text-violet-600" />
              <StatCard title="Active Users" value={stats.active} accent="text-green-600" />
              <StatCard title="Inactive Users" value={stats.inactive} accent="text-red-600" />
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                <div>
                <h2 className="text-xl font-bold text-slate-800">All Users</h2>
                  <p className="mt-1 text-slate-600">
                    Search and filter users, then update their account settings.
                  </p>
                </div>

                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name or email"
                  className="rounded-xl border border-slate-300 px-4 py-2.5 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />

                  <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="rounded-xl border border-slate-300 px-4 py-2.5 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  >
                <option value="all">All Roles</option>
                <option value="student">Student</option>
                <option value="admin">Admin</option>
                </select>

                <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-xl border border-slate-300 px-4 py-2.5 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              </select>

              <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-500">
                {filteredUsers.length} matching user{filteredUsers.length === 1 ? "" : "s"}
              </div>
            </div>
          </div>

          <div className="mt-6">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((item) => (
                  <div
                  key={item}
                  className="rounded-2xl border border-slate-200 p-5"
                  >
                  <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr_1fr_1fr_1fr]">
                    <div className="space-y-3">
                      <div className="h-5 w-40 rounded bg-slate-200 animate-pulse" />
                      <div className="h-4 w-56 rounded bg-slate-200 animate-pulse" />
                      <div className="flex gap-2">
                        <div className="h-7 w-20 rounded-full bg-slate-200 animate-pulse" />
                        <div className="h-7 w-20 rounded-full bg-slate-200 animate-pulse" />
                      </div>
                    </div>

                    <div className="h-12 w-full rounded-xl bg-slate-200 animate-pulse" />
                    <div className="h-12 w-full rounded-xl bg-slate-200 animate-pulse" />
                    <div className="h-12 w-full rounded-xl bg-slate-200 animate-pulse" />
                    <div className="h-12 w-full rounded-xl bg-slate-200 animate-pulse" />
                  </div>
                </div>
          ))}
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center">
          <h3 className="text-lg font-bold text-slate-800">
            No matching users found
          </h3>
          <p className="mt-2 text-slate-600">
            Try changing the search or filter settings.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredUsers.map((user) => {
            const role = user.role || "student";
            const status = user.status || "active";

            return (
              <div
              key={user.id}
              className="rounded-2xl border border-slate-200 p-5 hover:shadow-sm transition"
              >
              <div className="grid gap-5 lg:grid-cols-[1.35fr_1fr_1fr_1fr_1fr] lg:items-start">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">
                    {user.fullName || "Unnamed User"}
                  </h3>
                  <p className="mt-1 break-all text-slate-600">
                    {user.email || "No email available"}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <span
                    className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getRoleBadgeClasses(
                      role
                  )}`}
                  >
                  {role}
                </span>

                <span
                className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusBadgeClasses(
                  status
              )}`}
              >
              {status}
            </span>

            {user.academicYear && (
              <span className="inline-flex rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                Year {user.academicYear}
              </span>
          )}

          {user.semester && (
            <span className="inline-flex rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
              Semester {user.semester}
            </span>
        )}
      </div>
    </div>

    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        Role
      </label>
      <select
      value={role}
      disabled={updatingKey === `${user.id}-role`}
      onChange={(e) =>
      handleUserUpdate(
        user.id,
        "role",
        e.target.value,
        "User role updated successfully."
      )
    }
    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-70"
    >
  <option value="student">Student</option>
  <option value="admin">Admin</option>
  </select>
</div>

<div>
  <label className="mb-2 block text-sm font-semibold text-slate-700">
    Status
  </label>
  <select
  value={status}
  disabled={updatingKey === `${user.id}-status`}
  onChange={(e) =>
  handleUserUpdate(
    user.id,
    "status",
    e.target.value,
    "User status updated successfully."
  )
}
className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-70"
>
<option value="active">Active</option>
<option value="inactive">Inactive</option>
</select>
</div>

<div>
  <label className="mb-2 block text-sm font-semibold text-slate-700">
    Year
  </label>
  <select
  value={user.academicYear ?? ""}
  disabled={updatingKey === `${user.id}-academicYear`}
  onChange={(e) =>
  handleUserUpdate(
    user.id,
    "academicYear",
    e.target.value,
    "Academic year updated successfully."
  )
}
className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-70"
>
<option value="">-</option>
<option value="1">Year 1</option>
<option value="2">Year 2</option>
<option value="3">Year 3</option>
<option value="4">Year 4</option>
</select>
</div>

<div>
  <label className="mb-2 block text-sm font-semibold text-slate-700">
    Semester
  </label>
  <select
  value={user.semester ?? ""}
  disabled={updatingKey === `${user.id}-semester`}
  onChange={(e) =>
  handleUserUpdate(
    user.id,
    "semester",
    e.target.value,
    "Semester updated successfully."
  )
}
className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-70"
>
<option value="">-</option>
<option value="1">Semester 1</option>
<option value="2">Semester 2</option>
</select>
</div>
</div>
</div>
);
})}
</div>
)}
</div>
</section>
</div>
</AppLayout>
);
}
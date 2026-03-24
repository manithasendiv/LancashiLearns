import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AppLayout from "../../../components/common/AppLayout";
import {
  getAllModules,
  addModule,
  deleteModuleById,
} from "../services/adminService";

export default function ManageModulesPage() {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
      code: "",
      title: "",
      description: "",
      academicYear: "1",
      semester: "1",
      isProgrammingModule: false,
  });

  const loadModules = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getAllModules();
      setModules(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load modules.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadModules();
  }, []);

  const filteredModules = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    if (!term) return modules;

      return modules.filter((module) => {
        const code = module.code?.toLowerCase() || "";
        const title = module.title?.toLowerCase() || "";
        const description = module.description?.toLowerCase() || "";

        return (
          code.includes(term) ||
          title.includes(term) ||
          description.includes(term)
        );
    });
  }, [modules, searchTerm]);

  const moduleStats = useMemo(() => {
    const programming = modules.filter(
      (module) => module.isProgrammingModule
    ).length;

    const years = new Set(
      modules.map((module) => module.academicYear).filter(Boolean)
    ).size;

    const semesters = new Set(
      modules.map((module) => module.semester).filter(Boolean)
    ).size;

    return {
      total: modules.length,
      programming,
      nonProgramming: modules.length - programming,
      years,
      semesters,
    };
  }, [modules]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
  }));
};

const resetForm = () => {
  setFormData({
      code: "",
      title: "",
      description: "",
      academicYear: "1",
      semester: "1",
      isProgrammingModule: false,
  });
};

const handleAddModule = async (e) => {
  e.preventDefault();
  setError("");
  setSuccess("");

  const { code, title, description, academicYear, semester } = formData;

  if (!code || !title || !description || !academicYear || !semester) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      setSaving(true);

      await addModule({
          ...formData,
          code: code.trim(),
          title: title.trim(),
          description: description.trim(),
      });

      setSuccess("Module added successfully.");
      resetForm();
      await loadModules();
    } catch (err) {
      console.error(err);
      setError("Failed to add module.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (moduleId, moduleTitle) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${moduleTitle}"?`
    );
    if (!confirmed) return;

      try {
        setError("");
        setSuccess("");
        setDeletingId(moduleId);

        await deleteModuleById(moduleId);
        setSuccess("Module deleted successfully.");

        await loadModules();
      } catch (err) {
        console.error(err);
        setError("Failed to delete module.");
      } finally {
        setDeletingId("");
      }
    };

    const clearSearch = () => {
      setSearchTerm("");
    };

    return (
      <AppLayout>
        <div className="space-y-8">
          <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-r from-slate-900 via-slate-800 to-blue-900 p-8 shadow-sm">
            <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-200">
                  Admin / Modules
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
                Manage Modules
              </h1>
            </div>

            <p className="mt-3 max-w-2xl leading-relaxed text-slate-200">
              Create, organize, update, and remove academic modules for each
              year and semester. Keep the platform structured and ready for
              student learning materials.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
            onClick={loadModules}
            className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
            >
            Refresh Modules
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

<div className="grid gap-6 xl:grid-cols-[1.05fr_1.45fr]">
  <div className="space-y-6">
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-xl font-bold text-slate-800">
          Add New Module
        </h2>
        <p className="mt-1 text-slate-600">
          Create a module with its code, title, description, year,
          semester, and module type.
        </p>
      </div>

      <form onSubmit={handleAddModule} className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Module Code
          </label>
          <input
          type="text"
          name="code"
          data-testid="module-code"
          value={formData.code}
          onChange={handleChange}
          placeholder="e.g. CS201"
          className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Module Title
          </label>
          <input
          type="text"
          name="title"
          data-testid="module-title"
          value={formData.title}
          onChange={handleChange}
          placeholder="e.g. Data Structures"
          className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Description
          </label>
          <textarea
          name="description"
          data-testid="module-description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Enter module description"
          className="min-h-[120px] w-full resize-none rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Academic Year
            </label>
            <select
            name="academicYear"
            data-testid="module-year"
            value={formData.academicYear}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            >
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
          name="semester"
          value={formData.semester}
          onChange={handleChange}
          data-testid="module-semester"
          className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          >
        <option value="1">Semester 1</option>
        <option value="2">Semester 2</option>
        </select>
      </div>
    </div>

    <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
      <input
      type="checkbox"
      name="isProgrammingModule"
      checked={formData.isProgrammingModule}
      onChange={handleChange}
      className="h-4 w-4 rounded"
      />
      Programming Module
    </label>

    <button
  type="submit"
  disabled={saving}
  data-testid="add-module-button"
  className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
>
  {saving ? "Saving Module..." : "Add Module"}
</button>
</form>
</div>

<div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
<h3 className="text-lg font-bold text-slate-800">Module Summary</h3>
  <p className="mt-1 text-slate-600">
    Quick overview of the current module collection.
  </p>

  <div className="mt-5 grid gap-3 sm:grid-cols-2">
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
    <p className="text-xs font-medium text-slate-500">Total Modules</p>
      <p className="mt-1 text-2xl font-bold text-slate-800">
        {moduleStats.total}
      </p>
    </div>

    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-medium text-slate-500">
        Programming Modules
      </p>
      <p className="mt-1 text-2xl font-bold text-blue-600">
        {moduleStats.programming}
      </p>
    </div>

    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-medium text-slate-500">
        Non-Programming
      </p>
      <p className="mt-1 text-2xl font-bold text-slate-800">
        {moduleStats.nonProgramming}
      </p>
    </div>

    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-medium text-slate-500">
        Years Covered
      </p>
      <p className="mt-1 text-2xl font-bold text-violet-600">
        {moduleStats.years}
      </p>
    </div>
  </div>
</div>
</div>

<div className="space-y-6">
  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
    <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
      <div>
      <h2 className="text-xl font-bold text-slate-800">All Modules</h2>
        <p className="mt-1 text-slate-600">
          Search and manage all modules available in the system.
        </p>
      </div>

      <div className="flex w-full flex-col gap-3 sm:w-auto sm:min-w-[320px]">
        <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search by code, title, or description"
        className="rounded-xl border border-slate-300 px-4 py-2.5 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        />
      </div>
    </div>

    <div className="mt-5 flex flex-wrap items-center gap-3">
      <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-xs font-medium text-slate-500">Total</p>
        <p className="text-lg font-bold text-slate-800">
          {moduleStats.total}
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-xs font-medium text-slate-500">Programming</p>
        <p className="text-lg font-bold text-blue-600">
          {moduleStats.programming}
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-xs font-medium text-slate-500">Semesters</p>
        <p className="text-lg font-bold text-violet-600">
          {moduleStats.semesters}
        </p>
      </div>

      <button
      onClick={clearSearch}
      className="ml-auto rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
      >
      Clear Search
    </button>
  </div>

  <div className="mt-4 text-sm text-slate-500">
    {filteredModules.length} matching module
    {filteredModules.length === 1 ? "" : "s"} found
  </div>
</div>

<div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
  {loading ? (
    <div className="space-y-4">
      {[1, 2, 3].map((item) => (
        <div
        key={item}
        className="rounded-2xl border border-slate-200 p-5"
        >
        <div className="space-y-3">
          <div className="h-5 w-40 animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-64 animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
          <div className="flex gap-3">
            <div className="h-8 w-20 animate-pulse rounded-full bg-slate-200" />
            <div className="h-8 w-24 animate-pulse rounded-full bg-slate-200" />
            <div className="h-8 w-24 animate-pulse rounded-full bg-slate-200" />
          </div>
          <div className="flex gap-3">
            <div className="h-10 w-20 animate-pulse rounded-lg bg-slate-200" />
            <div className="h-10 w-24 animate-pulse rounded-lg bg-slate-200" />
          </div>
        </div>
      </div>
))}
</div>
) : filteredModules.length === 0 ? (
  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center">
    <h3 className="text-lg font-bold text-slate-800">
      No matching modules found
    </h3>
    <p className="mt-2 text-slate-600">
      Try changing the search term or add a new module to get
      started.
    </p>
  </div>
) : (
  <div className="space-y-4">
    {filteredModules.map((module) => (
      <div
      key={module.id}
      className="rounded-2xl border border-slate-200 p-5 transition hover:shadow-sm"
      >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
              {module.code}
            </span>

            <span className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              Year {module.academicYear}
            </span>

            <span className="inline-flex rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
              Semester {module.semester}
            </span>

            {module.isProgrammingModule && (
              <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                Programming
              </span>
          )}
        </div>

        <h4 className="mt-4 text-lg font-bold text-slate-800">
          {module.title}
        </h4>

        <p className="mt-2 leading-relaxed text-slate-600">
          {module.description}
        </p>

        <div className="mt-4 flex flex-wrap gap-3">
          <Link
          to={`/admin/modules/${module.id}/edit`}
          className="inline-flex items-center rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
          >
          Edit
        </Link>

        <button
        onClick={() =>
        handleDelete(module.id, module.title)
      }
      disabled={deletingId === module.id}
      className="inline-flex items-center rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-70"
      >
      {deletingId === module.id
      ? "Deleting..."
      : "Delete"}
    </button>
  </div>
</div>

<div className="whitespace-nowrap text-xs text-slate-400">
  {module.code}
</div>
</div>
</div>
))}
</div>
)}
</div>
</div>
</div>
</div>
</AppLayout>
);
}
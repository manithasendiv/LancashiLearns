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
      return code.includes(term) || title.includes(term);
    });
  }, [modules, searchTerm]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
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
      await addModule(formData);

      setSuccess("Module added successfully.");
      setFormData({
        code: "",
        title: "",
        description: "",
        academicYear: "1",
        semester: "1",
        isProgrammingModule: false,
      });

      await loadModules();
    } catch (err) {
      console.error(err);
      setError("Failed to add module.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (moduleId) => {
    const confirmed = window.confirm("Are you sure you want to delete this module?");
    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");
      await deleteModuleById(moduleId);
      setSuccess("Module deleted successfully.");
      await loadModules();
    } catch (err) {
      console.error(err);
      setError("Failed to delete module.");
    }
  };

  return (
    <AppLayout>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800">Manage Modules</h2>
        <p className="text-slate-600 mt-2">
          Create, edit, view, and remove academic modules
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_1.4fr]">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-xl font-bold text-slate-800 mb-4">Add New Module</h3>

          <form onSubmit={handleAddModule} className="space-y-4">
            <div>
              <label className="block mb-2 text-sm font-semibold text-slate-700">
                Module Code
              </label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                placeholder="e.g. CS201"
                className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-semibold text-slate-700">
                Module Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Data Structures"
                className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-semibold text-slate-700">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter module description"
                className="w-full min-h-[120px] border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 text-sm font-semibold text-slate-700">
                  Academic Year
                </label>
                <select
                  name="academicYear"
                  value={formData.academicYear}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                >
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
                  name="semester"
                  value={formData.semester}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="1">Semester 1</option>
                  <option value="2">Semester 2</option>
                </select>
              </div>
            </div>

            <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                name="isProgrammingModule"
                checked={formData.isProgrammingModule}
                onChange={handleChange}
                className="h-4 w-4"
              />
              Programming Module
            </label>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-600">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition disabled:opacity-70"
            >
              {saving ? "Saving..." : "Add Module"}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
            <h3 className="text-xl font-bold text-slate-800">All Modules</h3>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by code or title"
                className="border border-slate-300 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-slate-500">
                {filteredModules.length} found
              </span>
            </div>
          </div>

          {loading ? (
            <p className="text-slate-600">Loading modules...</p>
          ) : filteredModules.length === 0 ? (
            <p className="text-slate-600">No matching modules found.</p>
          ) : (
            <div className="space-y-4">
              {filteredModules.map((module) => (
                <div
                  key={module.id}
                  className="border border-slate-200 rounded-2xl p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-blue-600">{module.code}</p>
                      <h4 className="text-lg font-bold text-slate-800 mt-1">
                        {module.title}
                      </h4>
                      <p className="text-slate-600 mt-2">{module.description}</p>

                      <div className="flex flex-wrap gap-2 mt-3">
                        <span className="text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-full">
                          Year {module.academicYear}
                        </span>
                        <span className="text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-full">
                          Semester {module.semester}
                        </span>
                        {module.isProgrammingModule && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                            Programming
                          </span>
                        )}
                      </div>

                      <div className="flex gap-3 mt-4">
                        <Link
                          to={`/admin/modules/${module.id}/edit`}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition"
                        >
                          Edit
                        </Link>

                        <button
                          onClick={() => handleDelete(module.id)}
                          className="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg text-sm font-medium transition"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import AppLayout from "../../../components/common/AppLayout";
import {
  getModuleByIdForAdmin,
  updateModuleById,
} from "../services/adminService";

export default function EditModulePage() {
  const { moduleId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    code: "",
    title: "",
    description: "",
    academicYear: "1",
    semester: "1",
    isProgrammingModule: false,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const loadModule = async () => {
      try {
        setLoading(true);
        setError("");

        const module = await getModuleByIdForAdmin(moduleId);

        if (!module) {
          setError("Module not found.");
          return;
        }

        setFormData({
          code: module.code || "",
          title: module.title || "",
          description: module.description || "",
          academicYear: String(module.academicYear ?? "1"),
          semester: String(module.semester ?? "1"),
          isProgrammingModule: Boolean(module.isProgrammingModule),
        });
      } catch (err) {
        console.error(err);
        setError("Failed to load module details.");
      } finally {
        setLoading(false);
      }
    };

    loadModule();
  }, [moduleId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (
      !formData.code ||
      !formData.title ||
      !formData.description ||
      !formData.academicYear ||
      !formData.semester
    ) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      setSaving(true);
      await updateModuleById(moduleId, formData);
      setSuccess("Module updated successfully.");

      setTimeout(() => {
        navigate("/admin/modules");
      }, 700);
    } catch (err) {
      console.error(err);
      setError("Failed to update module.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800">Edit Module</h2>
        <p className="text-slate-600 mt-2">
          Update the selected module information
        </p>
      </div>

      <div className="mb-6">
        <Link
          to="/admin/modules"
          className="inline-block bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 transition"
        >
          Back to Manage Modules
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 max-w-3xl">
        {loading ? (
          <p className="text-slate-600">Loading module...</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-2 text-sm font-semibold text-slate-700">
                Module Code
              </label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
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
              {saving ? "Saving..." : "Update Module"}
            </button>
          </form>
        )}
      </div>
    </AppLayout>
  );
}
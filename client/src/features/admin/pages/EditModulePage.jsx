import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import AppLayout from "../../../components/common/AppLayout";
import {
  getModuleByIdForAdmin,
  updateModuleById,
} from "../services/adminService";

function getYearLabel(year) {
  return `Year ${year || "1"}`;
}

function getSemesterLabel(semester) {
  return `Semester ${semester || "1"}`;
}

export default function EditModulePage() {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const redirectTimeoutRef = useRef(null);

  const [formData, setFormData] = useState({
    code: "",
    title: "",
    description: "",
    academicYear: "1",
    semester: "1",
    isProgrammingModule: false,
  });

  const [originalModule, setOriginalModule] = useState(null);
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

        setOriginalModule(module);
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

    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, [moduleId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (error) setError("");
    if (success) setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const payload = {
      ...formData,
      code: formData.code.trim(),
      title: formData.title.trim(),
      description: formData.description.trim(),
    };

    if (
      !payload.code ||
      !payload.title ||
      !payload.description ||
      !payload.academicYear ||
      !payload.semester
    ) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      setSaving(true);
      await updateModuleById(moduleId, payload);
      setSuccess("Module updated successfully.");

      redirectTimeoutRef.current = setTimeout(() => {
        navigate("/admin/modules");
      }, 900);
    } catch (err) {
      console.error(err);
      setError("Failed to update module.");
    } finally {
      setSaving(false);
    }
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
              <h1 className="mt-3 text-3xl md:text-4xl font-bold text-white">
                Edit Module
              </h1>
              <p className="mt-3 max-w-2xl text-slate-200 leading-relaxed">
                Update the selected module information, academic structure, and
                programming settings.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/admin/modules"
                className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-100 transition"
              >
                Back to Modules
              </Link>
            </div>
          </div>

          <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-16 left-20 h-44 w-44 rounded-full bg-blue-400/10 blur-2xl" />
        </section>

        {loading ? (
          <div className="grid gap-6 xl:grid-cols-3">
            <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <div className="space-y-5">
                <div className="h-6 w-40 rounded-lg bg-slate-200 animate-pulse" />
                <div className="space-y-2">
                  <div className="h-4 w-28 rounded bg-slate-200 animate-pulse" />
                  <div className="h-12 w-full rounded-xl bg-slate-200 animate-pulse" />
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-28 rounded bg-slate-200 animate-pulse" />
                  <div className="h-12 w-full rounded-xl bg-slate-200 animate-pulse" />
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-28 rounded bg-slate-200 animate-pulse" />
                  <div className="h-32 w-full rounded-xl bg-slate-200 animate-pulse" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-12 w-full rounded-xl bg-slate-200 animate-pulse" />
                  <div className="h-12 w-full rounded-xl bg-slate-200 animate-pulse" />
                </div>
                <div className="h-12 w-full rounded-xl bg-slate-200 animate-pulse" />
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <div className="space-y-4">
                <div className="h-6 w-36 rounded-lg bg-slate-200 animate-pulse" />
                <div className="h-28 w-full rounded-2xl bg-slate-200 animate-pulse" />
                <div className="h-24 w-full rounded-2xl bg-slate-200 animate-pulse" />
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 xl:grid-cols-3">
            <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-800">
                  Module Details
                </h2>
                <p className="text-slate-600 mt-2">
                  Edit the academic and descriptive information for this module.
                </p>
              </div>

              {error && !originalModule ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-red-700">
                  <p>{error}</p>
                  <div className="mt-4">
                    <Link
                      to="/admin/modules"
                      className="inline-flex items-center rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition"
                    >
                      Return to Modules
                    </Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block mb-2 text-sm font-semibold text-slate-700">
                      Module Code
                    </label>
                    <input
                      type="text"
                      name="code"
                      value={formData.code}
                      onChange={handleChange}
                      placeholder="Enter module code"
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
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
                      placeholder="Enter module title"
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
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
                      className="w-full min-h-[140px] rounded-xl border border-slate-300 px-4 py-3 text-slate-800 outline-none transition resize-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="block mb-2 text-sm font-semibold text-slate-700">
                        Academic Year
                      </label>
                      <select
                        name="academicYear"
                        value={formData.academicYear}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
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
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      >
                        <option value="1">Semester 1</option>
                        <option value="2">Semester 2</option>
                      </select>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        name="isProgrammingModule"
                        checked={formData.isProgrammingModule}
                        onChange={handleChange}
                        className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          Programming Module
                        </p>
                        <p className="text-sm text-slate-600 mt-1">
                          Enable this if the module should support coding-related
                          learning activities such as editor/compiler features.
                        </p>
                      </div>
                    </label>
                  </div>

                  {error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                      {success}
                    </div>
                  )}

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                      type="submit"
                      disabled={saving}
                      className="inline-flex w-full sm:w-auto items-center justify-center rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {saving ? "Saving Changes..." : "Update Module"}
                    </button>

                    <Link
                      to="/admin/modules"
                      className="inline-flex w-full sm:w-auto items-center justify-center rounded-xl border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Cancel
                    </Link>
                  </div>
                </form>
              )}
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-bold text-slate-800">Preview</h3>
                <p className="text-slate-600 mt-1">
                  Live summary of the current module settings.
                </p>

                <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                      {formData.code.trim() || "MODULE"}
                    </span>
                    <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                      {getYearLabel(formData.academicYear)}
                    </span>
                    <span className="inline-flex rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">
                      {getSemesterLabel(formData.semester)}
                    </span>
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        formData.isProgrammingModule
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {formData.isProgrammingModule
                        ? "Programming"
                        : "Theory / General"}
                    </span>
                  </div>

                  <h4 className="mt-4 text-lg font-bold text-slate-800 break-words">
                    {formData.title.trim() || "Untitled Module"}
                  </h4>

                  <p className="mt-2 text-sm leading-relaxed text-slate-600 whitespace-pre-line">
                    {formData.description.trim() ||
                      "No description provided yet."}
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-bold text-slate-800">
                  Module Info
                </h3>

                <div className="mt-4 space-y-4 text-sm">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-slate-500">Module ID</p>
                    <p className="mt-1 font-medium text-slate-800 break-all">
                      {moduleId}
                    </p>
                  </div>

                  {originalModule?.createdAt && (
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-slate-500">Created</p>
                      <p className="mt-1 font-medium text-slate-800">
                        {String(originalModule.createdAt)}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
                <p className="text-sm font-semibold text-blue-700">
                  Admin Tip
                </p>
                <p className="mt-2 text-sm leading-relaxed text-slate-700">
                  Keep module titles clear and descriptions focused so students
                  can understand the purpose of the module before opening it.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import AppLayout from "../../../components/common/AppLayout";
import {
  getMaterialById,
  updateMaterialById,
} from "../services/materialService";

function getTypeLabel(type) {
  switch (type) {
    case "lecture-note":
      return "Lecture Note";
    case "past-paper":
      return "Past Paper";
    case "resource":
      return "Resource";
    default:
      return "Material";
  }
}

function getTypeBadgeClasses(type) {
  switch (type) {
    case "lecture-note":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "past-paper":
      return "bg-violet-100 text-violet-700 border-violet-200";
    case "resource":
      return "bg-amber-100 text-amber-700 border-amber-200";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
}

function normalizeWeekNumber(value) {
  const num = Number(value);
  return Number.isInteger(num) && num > 0 ? num : null;
}

function getWeekLabel(weekNumber) {
  const normalized = normalizeWeekNumber(weekNumber);
  return normalized ? `Week ${normalized}` : "General";
}

export default function EditMaterialPage() {
  const { moduleId, materialId } = useParams();
  const navigate = useNavigate();
  const redirectTimeoutRef = useRef(null);

  const [formData, setFormData] = useState({
    title: "",
    weekNumber: "",
    type: "lecture-note",
  });

  const [originalMaterial, setOriginalMaterial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const loadMaterial = async () => {
      try {
        setLoading(true);
        setError("");

        const material = await getMaterialById(moduleId, materialId);

        if (!material) {
          setError("Material not found.");
          return;
        }

        setOriginalMaterial(material);
        setFormData({
          title: material.title || "",
          weekNumber: material.weekNumber ? String(material.weekNumber) : "",
          type: material.type || "lecture-note",
        });
      } catch (err) {
        console.error(err);
        setError("Failed to load material details.");
      } finally {
        setLoading(false);
      }
    };

    loadMaterial();

    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, [moduleId, materialId]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) setError("");
    if (success) setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const trimmedTitle = formData.title.trim();
    const normalizedWeekNumber = normalizeWeekNumber(formData.weekNumber);

    if (!trimmedTitle || !formData.type) {
      setError("Please fill in all fields.");
      return;
    }

    if (!normalizedWeekNumber) {
      setError("Please enter a valid week number.");
      return;
    }

    try {
      setSaving(true);

      await updateMaterialById({
        moduleId,
        materialId,
        title: trimmedTitle,
        weekNumber: normalizedWeekNumber,
        type: formData.type,
      });

      setSuccess("Material updated successfully.");

      redirectTimeoutRef.current = setTimeout(() => {
        navigate("/admin/materials");
      }, 900);
    } catch (err) {
      console.error(err);
      setError("Failed to update material.");
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
                Admin / Materials
              </p>
              <h1 className="mt-3 text-3xl md:text-4xl font-bold text-white">
                Edit Material
              </h1>
              <p className="mt-3 max-w-2xl text-slate-200 leading-relaxed">
                Update the material title, week, and type to keep your learning
                resources organized and easy to manage.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/admin/materials"
                className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-100 transition"
              >
                Back to Materials
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
                  <div className="h-4 w-24 rounded bg-slate-200 animate-pulse" />
                  <div className="h-12 w-full rounded-xl bg-slate-200 animate-pulse" />
                </div>
                <div className="h-12 w-full rounded-xl bg-slate-200 animate-pulse" />
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <div className="space-y-4">
                <div className="h-6 w-36 rounded-lg bg-slate-200 animate-pulse" />
                <div className="h-24 w-full rounded-2xl bg-slate-200 animate-pulse" />
                <div className="h-24 w-full rounded-2xl bg-slate-200 animate-pulse" />
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 xl:grid-cols-3">
            <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-800">
                  Material Details
                </h2>
                <p className="text-slate-600 mt-2">
                  Modify the selected learning material information below.
                </p>
              </div>

              {error && !originalMaterial ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-red-700">
                  <p>{error}</p>
                  <div className="mt-4">
                    <Link
                      to="/admin/materials"
                      className="inline-flex items-center rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition"
                    >
                      Return to Materials
                    </Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block mb-2 text-sm font-semibold text-slate-700">
                      Material Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="Enter material title"
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    />
                    <p className="mt-2 text-sm text-slate-500">
                      Use a clear, descriptive title so students can identify the
                      resource quickly.
                    </p>
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-semibold text-slate-700">
                      Week Number
                    </label>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      name="weekNumber"
                      value={formData.weekNumber}
                      onChange={handleChange}
                      placeholder="e.g. 1"
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    />
                    <p className="mt-2 text-sm text-slate-500">
                      Materials with the same week number will appear together on
                      the student module page.
                    </p>
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-semibold text-slate-700">
                      Material Type
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    >
                      <option value="lecture-note">Lecture Note</option>
                      <option value="past-paper">Past Paper</option>
                      <option value="resource">Resource</option>
                    </select>
                    <p className="mt-2 text-sm text-slate-500">
                      Choose the category that best represents this learning
                      material.
                    </p>
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
                      {saving ? "Saving Changes..." : "Update Material"}
                    </button>

                    <Link
                      to="/admin/materials"
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
                  Live summary of the current material details.
                </p>

                <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Material Title
                      </p>
                      <h4 className="mt-2 text-lg font-bold text-slate-800 break-words">
                        {formData.title.trim() || "Untitled Material"}
                      </h4>

                      <p className="mt-3 text-sm font-medium text-slate-600">
                        {getWeekLabel(formData.weekNumber)}
                      </p>
                    </div>

                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getTypeBadgeClasses(
                        formData.type
                      )}`}
                    >
                      {getTypeLabel(formData.type)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-bold text-slate-800">
                  Material Info
                </h3>

                <div className="mt-4 space-y-4 text-sm">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-slate-500">Module ID</p>
                    <p className="mt-1 font-medium text-slate-800 break-all">
                      {moduleId}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-slate-500">Material ID</p>
                    <p className="mt-1 font-medium text-slate-800 break-all">
                      {materialId}
                    </p>
                  </div>

                  {originalMaterial?.fileUrl && (
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-slate-500">Existing File</p>
                      <a
                        href={originalMaterial.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 inline-block font-medium text-blue-600 hover:text-blue-700"
                      >
                        Open current file
                      </a>
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
                <p className="text-sm font-semibold text-blue-700">
                  Admin Tip
                </p>
                <p className="mt-2 text-sm leading-relaxed text-slate-700">
                  Use the same week number for files that belong to the same
                  teaching week, such as a PDF, tutorial sheet, and extra
                  resource.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
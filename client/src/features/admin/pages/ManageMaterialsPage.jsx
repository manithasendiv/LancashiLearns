import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import AppLayout from "../../../components/common/AppLayout";
import {
  getAllModulesForMaterials,
  getMaterialsByModuleId,
  uploadMaterialForModule,
  deleteMaterialById,
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

                        export default function ManageMaterialsPage() {
                          const fileInputRef = useRef(null);

                          const [modules, setModules] = useState([]);
                          const [selectedModuleId, setSelectedModuleId] = useState("");
                          const [materials, setMaterials] = useState([]);
                          const [loadingModules, setLoadingModules] = useState(true);
                          const [loadingMaterials, setLoadingMaterials] = useState(false);
                          const [uploading, setUploading] = useState(false);
                          const [deletingId, setDeletingId] = useState("");
                          const [error, setError] = useState("");
                          const [success, setSuccess] = useState("");
                          const [searchTerm, setSearchTerm] = useState("");
                          const [typeFilter, setTypeFilter] = useState("all");

                          const [formData, setFormData] = useState({
                              title: "",
                              weekNumber: "",
                              type: "lecture-note",
                              file: null,
                          });

                          const loadModules = async () => {
                            try {
                              setLoadingModules(true);
                              setError("");

                              const data = await getAllModulesForMaterials();
                              setModules(data);

                              if (data.length > 0) {
                                  setSelectedModuleId((prev) => prev || data[0].id);
                                } else {
                                  setSelectedModuleId("");
                                }
                              } catch (err) {
                                console.error(err);
                                setError("Failed to load modules.");
                              } finally {
                                setLoadingModules(false);
                              }
                            };

                            const loadMaterials = async (moduleId) => {
                              if (!moduleId) {
                                  setMaterials([]);
                                  return;
                                }

                                try {
                                  setLoadingMaterials(true);
                                  setError("");

                                  const data = await getMaterialsByModuleId(moduleId);
                                  setMaterials(data);
                                } catch (err) {
                                  console.error(err);
                                  setError("Failed to load materials.");
                                } finally {
                                  setLoadingMaterials(false);
                                }
                              };

                              useEffect(() => {
                                loadModules();
                              }, []);

                              useEffect(() => {
                                if (selectedModuleId) {
                                    loadMaterials(selectedModuleId);
                                  } else {
                                    setMaterials([]);
                                  }
                                }, [selectedModuleId]);

                                const selectedModule = useMemo(() => {
                                  return modules.find((module) => module.id === selectedModuleId) || null;
                                }, [modules, selectedModuleId]);

                                const filteredMaterials = useMemo(() => {
                                  const term = searchTerm.trim().toLowerCase();

                                  return materials.filter((material) => {
                                    const title = material.title?.toLowerCase() || "";
                                    const fileName = material.fileName?.toLowerCase() || "";
                                    const type = material.type || "";
                                    const weekLabel = getWeekLabel(material.weekNumber).toLowerCase();

                                    const matchesSearch =
                                    !term ||
                                    title.includes(term) ||
                                    fileName.includes(term) ||
                                    weekLabel.includes(term);

                                    const matchesType = typeFilter === "all" || type === typeFilter;

                                    return matchesSearch && matchesType;
                                });
                              }, [materials, searchTerm, typeFilter]);

                              const materialStats = useMemo(() => {
                                const lectureNotes = materials.filter(
                                  (item) => item.type === "lecture-note"
                                ).length;
                                const pastPapers = materials.filter(
                                  (item) => item.type === "past-paper"
                                ).length;
                                const resources = materials.filter(
                                  (item) => item.type === "resource"
                                ).length;
                                const weeks = new Set(
                                  materials
                                  .map((item) => normalizeWeekNumber(item.weekNumber))
                                  .filter(Boolean)
                                ).size;

                                return {
                                  total: materials.length,
                                  lectureNotes,
                                  pastPapers,
                                  resources,
                                  weeks,
                                };
                              }, [materials]);

                              const handleChange = (e) => {
                                const { name, value, files } = e.target;

                                if (name === "file") {
                                    setFormData((prev) => ({
                                        ...prev,
                                        file: files?.[0] || null,
                                  }));
                                  return;
                                }

                                setFormData((prev) => ({
                                    ...prev,
                                    [name]: value,
                              }));
                            };

                            const resetUploadForm = () => {
                              setFormData({
                                  title: "",
                                  weekNumber: "",
                                  type: "lecture-note",
                                  file: null,
                              });

                              if (fileInputRef.current) {
                                  fileInputRef.current.value = "";
                                }
                              };

                              const handleUpload = async (e) => {
                                e.preventDefault();
                                setError("");
                                setSuccess("");

                                const trimmedTitle = formData.title.trim();
                                const normalizedWeekNumber = normalizeWeekNumber(formData.weekNumber);

                                if (!selectedModuleId) {
                                    setError("Please select a module.");
                                    return;
                                  }

                                  if (!trimmedTitle || !formData.type || !formData.file) {
                                      setError("Please fill in all fields and select a file.");
                                      return;
                                    }

                                    if (!normalizedWeekNumber) {
                                        setError("Please enter a valid week number.");
                                        return;
                                      }

                                      try {
                                        setUploading(true);

                                        await uploadMaterialForModule({
                                            moduleId: selectedModuleId,
                                            title: trimmedTitle,
                                            weekNumber: normalizedWeekNumber,
                                            type: formData.type,
                                            file: formData.file,
                                        });

                                        setSuccess("Material uploaded successfully.");
                                        resetUploadForm();
                                        await loadMaterials(selectedModuleId);
                                      } catch (err) {
                                        console.error(err);
                                        setError("Failed to upload material.");
                                      } finally {
                                        setUploading(false);
                                      }
                                    };

                                    const handleDelete = async (material) => {
                                      const confirmed = window.confirm(
                                        `Are you sure you want to delete "${material.title}"?`
                                      );
                                      if (!confirmed) return;

                                        try {
                                          setError("");
                                          setSuccess("");
                                          setDeletingId(material.id);

                                          await deleteMaterialById(selectedModuleId, material);
                                          setSuccess("Material deleted successfully.");

                                          await loadMaterials(selectedModuleId);
                                        } catch (err) {
                                          console.error(err);
                                          setError("Failed to delete material.");
                                        } finally {
                                          setDeletingId("");
                                        }
                                      };

                                      const clearFilters = () => {
                                        setSearchTerm("");
                                        setTypeFilter("all");
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
                                                  Manage Materials
                                                </h1>
                                              </div>
                                              <p className="mt-3 max-w-2xl text-slate-200 leading-relaxed">
                                                Upload, organize, edit, and remove lecture notes, past papers,
                                                and supporting learning resources for each module.
                                              </p>
                                            </div>

                                            <div className="flex flex-wrap gap-3">
                                              <button
                                              onClick={() => selectedModuleId && loadMaterials(selectedModuleId)}
                                              className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-100 transition"
                                              >
                                              Refresh Materials
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
                                      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                                        <div className="mb-5">
                                          <h2 className="text-xl font-bold text-slate-800">
                                            Upload Material
                                          </h2>
                                          <p className="text-slate-600 mt-1">
                                            Add a new file to the selected academic module. Use the same
                                            week number for multiple materials in the same week.
                                          </p>
                                        </div>

                                        {loadingModules ? (
                                          <div className="space-y-4">
                                            <div className="h-4 w-28 rounded bg-slate-200 animate-pulse" />
                                            <div className="h-12 w-full rounded-xl bg-slate-200 animate-pulse" />
                                            <div className="h-4 w-32 rounded bg-slate-200 animate-pulse" />
                                            <div className="h-12 w-full rounded-xl bg-slate-200 animate-pulse" />
                                            <div className="h-4 w-24 rounded bg-slate-200 animate-pulse" />
                                            <div className="h-12 w-full rounded-xl bg-slate-200 animate-pulse" />
                                            <div className="h-4 w-24 rounded bg-slate-200 animate-pulse" />
                                            <div className="h-12 w-full rounded-xl bg-slate-200 animate-pulse" />
                                            <div className="h-12 w-full rounded-xl bg-slate-200 animate-pulse" />
                                          </div>
                                        ) : modules.length === 0 ? (
                                          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                                            <p className="text-amber-700 font-medium">
                                              No modules available.
                                            </p>
                                            <p className="mt-2 text-sm text-slate-700">
                                              Create a module first before uploading materials.
                                            </p>
                                            <Link
                                            to="/admin/modules"
                                            className="mt-4 inline-flex items-center rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700 transition"
                                            >
                                            Go to Modules
                                          </Link>
                                        </div>
                                      ) : (
                                        <form onSubmit={handleUpload} className="space-y-5">
                                          <div>
                                            <label className="block mb-2 text-sm font-semibold text-slate-700">
                                              Select Module
                                            </label>
                                            <select
                                            value={selectedModuleId}
                                            onChange={(e) => setSelectedModuleId(e.target.value)}
                                            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                            >
                                            {modules.map((module) => (
                                              <option key={module.id} value={module.id}>
                                                {module.code} - {module.title}
                                              </option>
                                        ))}
                                      </select>
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
                                      className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                      />
                                    </div>

                                    <div>
                                      <label className="block mb-2 text-sm font-semibold text-slate-700">
                                        Material Title
                                      </label>
                                      <input
                                      type="text"
                                      name="title"
                                      value={formData.title}
                                      onChange={handleChange}
                                      placeholder="e.g. Arrays Lecture PDF"
                                      className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                      />
                                    </div>

                                    <div>
                                      <label className="block mb-2 text-sm font-semibold text-slate-700">
                                        Material Type
                                      </label>
                                      <select
                                      name="type"
                                      value={formData.type}
                                      onChange={handleChange}
                                      className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                      >
                                    <option value="lecture-note">Lecture Note</option>
                                    <option value="past-paper">Past Paper</option>
                                    <option value="resource">Resource</option>
                                    </select>
                                  </div>

                                  <div>
                                    <label className="block mb-2 text-sm font-semibold text-slate-700">
                                      File
                                    </label>
                                    <input
                                    ref={fileInputRef}
                                    type="file"
                                    name="file"
                                    onChange={handleChange}
                                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-700"
                                    />
                                    <p className="mt-2 text-sm text-slate-500">
                                      Selected: {formData.file?.name || "No file selected"}
                                    </p>
                                  </div>

                                  <button
                                  type="submit"
                                  disabled={uploading}
                                  className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
                                  >
                                  {uploading ? "Uploading Material..." : "Upload Material"}
                                </button>
                              </form>
                          )}
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                          <h3 className="text-lg font-bold text-slate-800">
                            Selected Module
                          </h3>
                          <p className="text-slate-600 mt-1">
                            Quick overview of the current module.
                          </p>

                          <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                            {selectedModule ? (
                              <>
                              <div className="flex flex-wrap gap-2">
                                <span className="inline-flex rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                                  {selectedModule.code || "MODULE"}
                                </span>
                                {selectedModule.academicYear && (
                                  <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                                    Year {selectedModule.academicYear}
                                  </span>
                              )}
                              {selectedModule.semester && (
                                <span className="inline-flex rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">
                                  Semester {selectedModule.semester}
                                </span>
                            )}
                          </div>

                          <h4 className="mt-4 text-lg font-bold text-slate-800">
                            {selectedModule.title || "Untitled Module"}
                          </h4>

                          <p className="mt-2 text-sm leading-relaxed text-slate-600">
                            {selectedModule.description ||
                            "No module description available."}
                          </p>
                          </>
                        ) : (
                          <p className="text-sm text-slate-500">
                            No module selected yet.
                          </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                    <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                      <div>
                        <h2 className="text-xl font-bold text-slate-800">
                          Module Materials
                        </h2>
                        <p className="text-slate-600 mt-1">
                          Search and manage uploaded resources for the selected module.
                        </p>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search title, file, or week"
                        className="rounded-xl border border-slate-300 px-4 py-2.5 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                        />

                        <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="rounded-xl border border-slate-300 px-4 py-2.5 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                        >
                      <option value="all">All Types</option>
                      <option value="lecture-note">Lecture Note</option>
                      <option value="past-paper">Past Paper</option>
                      <option value="resource">Resource</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-xs font-medium text-slate-500">Total</p>
                      <p className="text-lg font-bold text-slate-800">
                        {materialStats.total}
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-xs font-medium text-slate-500">Weeks</p>
                      <p className="text-lg font-bold text-slate-800">
                        {materialStats.weeks}
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-xs font-medium text-slate-500">Lecture Notes</p>
                      <p className="text-lg font-bold text-blue-600">
                        {materialStats.lectureNotes}
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-xs font-medium text-slate-500">Past Papers</p>
                      <p className="text-lg font-bold text-violet-600">
                        {materialStats.pastPapers}
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-xs font-medium text-slate-500">Resources</p>
                      <p className="text-lg font-bold text-amber-600">
                        {materialStats.resources}
                      </p>
                    </div>

                    <button
                    onClick={clearFilters}
                    className="ml-auto rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
                    >
                    Clear Filters
                  </button>
                </div>

                <div className="mt-4 text-sm text-slate-500">
                  {filteredMaterials.length} matching material
                  {filteredMaterials.length === 1 ? "" : "s"} found
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                {loadingMaterials ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((item) => (
                      <div
                      key={item}
                      className="rounded-2xl border border-slate-200 p-5"
                      >
                      <div className="space-y-3">
                        <div className="h-5 w-40 rounded bg-slate-200 animate-pulse" />
                        <div className="h-4 w-56 rounded bg-slate-200 animate-pulse" />
                        <div className="h-8 w-24 rounded-full bg-slate-200 animate-pulse" />
                        <div className="flex gap-3">
                          <div className="h-10 w-24 rounded-lg bg-slate-200 animate-pulse" />
                          <div className="h-10 w-20 rounded-lg bg-slate-200 animate-pulse" />
                          <div className="h-10 w-24 rounded-lg bg-slate-200 animate-pulse" />
                        </div>
                      </div>
                    </div>
              ))}
            </div>
          ) : !selectedModuleId ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center">
              <p className="text-slate-700 font-medium">
                Select a module to view materials.
              </p>
            </div>
          ) : filteredMaterials.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center">
              <h3 className="text-lg font-bold text-slate-800">
                No matching materials found
              </h3>
              <p className="mt-2 text-slate-600">
                Try changing the filters or upload a new resource for this
                module.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredMaterials.map((material) => (
                <div
                key={material.id}
                className="rounded-2xl border border-slate-200 p-5 hover:shadow-sm transition"
                >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-lg font-bold text-slate-800 break-words">
                        {material.title}
                      </h4>

                      <span
                      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getTypeBadgeClasses(
                        material.type
                    )}`}
                    >
                    {getTypeLabel(material.type)}
                  </span>

                  <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
                    {getWeekLabel(material.weekNumber)}
                  </span>
                </div>

                <p className="mt-2 text-slate-600 break-all">
                  {material.fileName || "Unnamed file"}
                </p>

                <div className="mt-4 flex flex-wrap gap-3">
                  <a
                  href={material.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center rounded-lg bg-blue-50 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-100 transition"
                  >
                  Open File
                </a>

                <Link
                to={`/admin/materials/${selectedModuleId}/${material.id}/edit`}
                className="inline-flex items-center rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 transition"
                >
                Edit
              </Link>

              <button
              onClick={() => handleDelete(material)}
              disabled={deletingId === material.id}
              className="inline-flex items-center rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100 transition disabled:cursor-not-allowed disabled:opacity-70"
              >
              {deletingId === material.id
              ? "Deleting..."
              : "Delete"}
            </button>
          </div>
        </div>

        <div className="text-xs text-slate-400 whitespace-nowrap">
          {getWeekLabel(material.weekNumber)}
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
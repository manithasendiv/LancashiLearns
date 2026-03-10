import { useEffect, useMemo, useState } from "react";
import AppLayout from "../../../components/common/AppLayout";
import {
  getAllModulesForMaterials,
  getMaterialsByModuleId,
  uploadMaterialForModule,
  deleteMaterialById,
} from "../services/materialService";

export default function ManageMaterialsPage() {
  const [modules, setModules] = useState([]);
  const [selectedModuleId, setSelectedModuleId] = useState("");
  const [materials, setMaterials] = useState([]);
  const [loadingModules, setLoadingModules] = useState(true);
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const [formData, setFormData] = useState({
    title: "",
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
        setSelectedModuleId(data[0].id);
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
    }
  }, [selectedModuleId]);

  const filteredMaterials = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return materials.filter((material) => {
      const title = material.title?.toLowerCase() || "";
      const fileName = material.fileName?.toLowerCase() || "";
      const type = material.type || "";

      const matchesSearch = !term || title.includes(term) || fileName.includes(term);
      const matchesType = typeFilter === "all" || type === typeFilter;

      return matchesSearch && matchesType;
    });
  }, [materials, searchTerm, typeFilter]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "file") {
      setFormData((prev) => ({
        ...prev,
        file: files[0] || null,
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!selectedModuleId) {
      setError("Please select a module.");
      return;
    }

    if (!formData.title || !formData.type || !formData.file) {
      setError("Please fill in all fields and select a file.");
      return;
    }

    try {
      setUploading(true);

      await uploadMaterialForModule({
        moduleId: selectedModuleId,
        title: formData.title,
        type: formData.type,
        file: formData.file,
      });

      setSuccess("Material uploaded successfully.");
      setFormData({
        title: "",
        type: "lecture-note",
        file: null,
      });

      const fileInput = document.getElementById("material-file-input");
      if (fileInput) fileInput.value = "";

      await loadMaterials(selectedModuleId);
    } catch (err) {
      console.error(err);
      setError("Failed to upload material.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (material) => {
    const confirmed = window.confirm("Are you sure you want to delete this material?");
    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await deleteMaterialById(selectedModuleId, material);
      setSuccess("Material deleted successfully.");

      await loadMaterials(selectedModuleId);
    } catch (err) {
      console.error(err);
      setError("Failed to delete material.");
    }
  };

  return (
    <AppLayout>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800">Manage Materials</h2>
        <p className="text-slate-600 mt-2">
          Upload and manage lecture notes, past papers, and module resources
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

      <div className="grid gap-6 lg:grid-cols-[1.1fr_1.4fr]">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-xl font-bold text-slate-800 mb-4">Upload Material</h3>

          {loadingModules ? (
            <p className="text-slate-600">Loading modules...</p>
          ) : (
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block mb-2 text-sm font-semibold text-slate-700">
                  Select Module
                </label>
                <select
                  value={selectedModuleId}
                  onChange={(e) => setSelectedModuleId(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
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
                  Material Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Week 1 Lecture Notes"
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
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
                  id="material-file-input"
                  type="file"
                  name="file"
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={uploading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition disabled:opacity-70"
              >
                {uploading ? "Uploading..." : "Upload Material"}
              </button>
            </form>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
            <h3 className="text-xl font-bold text-slate-800">Module Materials</h3>

            <div className="flex flex-col md:flex-row gap-3">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search title or file name"
                className="border border-slate-300 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              />

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="border border-slate-300 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="lecture-note">Lecture Note</option>
                <option value="past-paper">Past Paper</option>
                <option value="resource">Resource</option>
              </select>

              <span className="text-sm text-slate-500 self-center">
                {filteredMaterials.length} found
              </span>
            </div>
          </div>

          {loadingMaterials ? (
            <p className="text-slate-600">Loading materials...</p>
          ) : filteredMaterials.length === 0 ? (
            <p className="text-slate-600">No matching materials found.</p>
          ) : (
            <div className="space-y-4">
              {filteredMaterials.map((material) => (
                <div
                  key={material.id}
                  className="border border-slate-200 rounded-2xl p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="text-lg font-bold text-slate-800">
                        {material.title}
                      </h4>
                      <p className="text-slate-600 mt-1">{material.fileName}</p>

                      <div className="flex flex-wrap gap-2 mt-3">
                        <span className="text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-full">
                          {material.type}
                        </span>
                      </div>

                      <a
                        href={material.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-block mt-3 text-blue-600 hover:underline text-sm font-medium"
                      >
                        Open File
                      </a>
                    </div>

                    <button
                      onClick={() => handleDelete(material)}
                      className="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg text-sm font-medium transition"
                    >
                      Delete
                    </button>
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
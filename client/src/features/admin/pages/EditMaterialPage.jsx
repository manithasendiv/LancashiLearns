import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import AppLayout from "../../../components/common/AppLayout";
import {
  getMaterialById,
  updateMaterialById,
} from "../services/materialService";

export default function EditMaterialPage() {
  const { moduleId, materialId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    type: "lecture-note",
  });

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

        setFormData({
          title: material.title || "",
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
  }, [moduleId, materialId]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.title || !formData.type) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      setSaving(true);

      await updateMaterialById({
        moduleId,
        materialId,
        title: formData.title,
        type: formData.type,
      });

      setSuccess("Material updated successfully.");

      setTimeout(() => {
        navigate("/admin/materials");
      }, 700);
    } catch (err) {
      console.error(err);
      setError("Failed to update material.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800">Edit Material</h2>
        <p className="text-slate-600 mt-2">
          Update material title and category
        </p>
      </div>

      <div className="mb-6">
        <Link
          to="/admin/materials"
          className="inline-block bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 transition"
        >
          Back to Manage Materials
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 max-w-3xl">
        {loading ? (
          <p className="text-slate-600">Loading material...</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-2 text-sm font-semibold text-slate-700">
                Material Title
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
              {saving ? "Saving..." : "Update Material"}
            </button>
          </form>
        )}
      </div>
    </AppLayout>
  );
}
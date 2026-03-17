import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import AppLayout from "../../../components/common/AppLayout";
import MaterialForm from "../components/MaterialForm";
import { createMaterial } from "../services/materialService";

export default function CreateMaterialPage() {
  const { moduleId } = useParams();
  const navigate = useNavigate();

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async (formData) => {
    try {
      setSaving(true);
      setError("");

      await createMaterial({
        ...formData,
        moduleId,
      });

      navigate(`/admin/modules/${moduleId}/materials`);
    } catch (err) {
      console.error(err);
      setError("Failed to create material.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Add New Material
            </h1>
            <p className="text-slate-600 mt-1">
              Add a material and place it inside the correct week.
            </p>
          </div>

          <Link
            to={`/admin/modules/${moduleId}/materials`}
            className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50"
          >
            Back
          </Link>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <MaterialForm
          onSubmit={handleCreate}
          loading={saving}
          submitLabel="Create Material"
        />
      </div>
    </AppLayout>
  );
}
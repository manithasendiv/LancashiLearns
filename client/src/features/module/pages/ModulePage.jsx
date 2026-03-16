import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { auth } from "../../../firebase/config";
import { getModuleById, getModuleMaterials } from "../services/moduleService";
import {
  getUserModuleProgress,
  toggleMaterialCompletion,
} from "../services/progressService";
import MaterialsList from "../components/MaterialsList";
import MaterialViewer from "../components/MaterialViewer";
import NotebookEditor from "../components/NotebookEditor";
import CodeLab from "../components/CodeLab";
import CodeOutput from "../components/CodeOutput";
import StudyAssistant from "../../../components/chat/StudyAssistant";
import AppLayout from "../../../components/common/AppLayout";
import PageLoader from "../../../components/common/PageLoader";

export default function ModulePage() {
  const { moduleId } = useParams();

  const [module, setModule] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [progressMap, setProgressMap] = useState({});
  const [codeOutput, setCodeOutput] = useState("Output will appear here.");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const completedCount = useMemo(() => {
    return Object.values(progressMap).filter(Boolean).length;
  }, [progressMap]);

  const totalCount = materials.length;
  const progressPercent =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const materialTitle = useMemo(() => {
    if (!selectedMaterial) return "";
    return (
      selectedMaterial.title ||
      selectedMaterial.name ||
      selectedMaterial.label ||
      "Selected Material"
    );
  }, [selectedMaterial]);

  const materialContent = useMemo(() => {
    if (!selectedMaterial) return "";

    return (
      selectedMaterial.content ||
      selectedMaterial.text ||
      selectedMaterial.description ||
      selectedMaterial.summary ||
      selectedMaterial.notes ||
      selectedMaterial.body ||
      selectedMaterial.excerpt ||
      ""
    );
  }, [selectedMaterial]);

  useEffect(() => {
    const loadModulePage = async () => {
      try {
        setLoading(true);
        setError("");

        const user = auth.currentUser;
        if (!user) {
          setError("No authenticated user found.");
          return;
        }

        const moduleData = await getModuleById(moduleId);

        if (!moduleData) {
          setError("Module not found.");
          return;
        }

        const materialsData = await getModuleMaterials(moduleId);
        const progressData = await getUserModuleProgress(user.uid, moduleId);

        const progressLookup = {};
        progressData.forEach((item) => {
          progressLookup[item.materialId] = item.completed;
        });

        setModule(moduleData);
        setMaterials(materialsData);
        setProgressMap(progressLookup);
      } catch (err) {
        console.error(err);
        setError("Failed to load module page.");
      } finally {
        setLoading(false);
      }
    };

    loadModulePage();
  }, [moduleId]);

  const handleToggleComplete = async (materialId, completed) => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      await toggleMaterialCompletion(user.uid, moduleId, materialId, completed);

      setProgressMap((prev) => ({
        ...prev,
        [materialId]: completed,
      }));
    } catch (err) {
      console.error("Failed to update material progress:", err);
    }
  };

  if (loading) {
    return <PageLoader text="Loading module..." />;
  }

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  return (
    <AppLayout fullWidth>
      <div className="max-w-7xl mx-auto mb-8 flex items-start justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">{module.title}</h2>
          <p className="text-slate-600 mt-2">
            {module.code} • {module.description}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 px-6 py-4 text-center min-w-[140px]">
          <div className="relative w-20 h-20 mx-auto">
            <svg className="w-20 h-20 -rotate-90">
              <circle
                cx="40"
                cy="40"
                r="32"
                stroke="#e2e8f0"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="40"
                cy="40"
                r="32"
                stroke="#2563eb"
                strokeWidth="8"
                fill="none"
                strokeDasharray={2 * Math.PI * 32}
                strokeDashoffset={2 * Math.PI * 32 * (1 - progressPercent / 100)}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-slate-800">
              {progressPercent}%
            </div>
          </div>
          <p className="text-sm text-slate-600 mt-3">
            {completedCount} / {totalCount} completed
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto flex items-center justify-between mb-6">
        <Link
          to="/dashboard"
          className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 transition"
        >
          Back to Dashboard
        </Link>

        {selectedMaterial && (
          <button
            onClick={() => setSelectedMaterial(null)}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg transition"
          >
            Back to Materials
          </button>
        )}
      </div>

      {!selectedMaterial ? (
        <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="mb-5">
            <h3 className="text-xl font-bold text-slate-800">Module Materials</h3>
            <p className="text-slate-600 mt-1">
              Select a material to open your learning workspace.
            </p>
          </div>

          <MaterialsList
            materials={materials}
            selectedMaterialId={null}
            onSelectMaterial={setSelectedMaterial}
            progressMap={progressMap}
            onToggleComplete={handleToggleComplete}
          />
        </div>
      ) : (
        <div className="max-w-7xl mx-auto grid gap-6 xl:grid-cols-[1.35fr_0.95fr] min-h-[88vh]">
          <div className="min-h-[88vh]">
            <MaterialViewer material={selectedMaterial} />
          </div>

          {module.isProgrammingModule ? (
            <div className="grid gap-4 min-h-[88vh] grid-rows-[0.95fr_0.8fr_0.8fr_0.5fr]">
              <div className="min-h-0">
                <StudyAssistant
                  moduleTitle={module.title}
                  materialTitle={materialTitle}
                  materialContent={materialContent}
                  compact
                />
              </div>

              <div className="min-h-0">
                <NotebookEditor moduleId={moduleId} compact />
              </div>

              <div className="min-h-0">
                <CodeLab onOutputChange={setCodeOutput} compact />
              </div>

              <div className="min-h-0">
                <CodeOutput output={codeOutput} compact />
              </div>
            </div>
          ) : (
            <div className="grid gap-4 min-h-[88vh] grid-rows-[0.95fr_1fr]">
              <div className="min-h-0">
                <StudyAssistant
                  moduleTitle={module.title}
                  materialTitle={materialTitle}
                  materialContent={materialContent}
                  compact
                />
              </div>

              <div className="min-h-0">
                <NotebookEditor moduleId={moduleId} />
              </div>
            </div>
          )}
        </div>
      )}
    </AppLayout>
  );
}
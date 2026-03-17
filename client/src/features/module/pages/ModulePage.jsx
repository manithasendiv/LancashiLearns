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

function PanelTab({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${
        active
          ? "bg-slate-900 text-white shadow-sm"
          : "bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900"
      }`}
    >
      {children}
    </button>
  );
}

function InfoChip({ children }) {
  return (
    <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
      {children}
    </span>
  );
}

export default function ModulePage() {
  const { moduleId } = useParams();

  const [module, setModule] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [progressMap, setProgressMap] = useState({});
  const [codeOutput, setCodeOutput] = useState("Output will appear here.");
  const [activePanel, setActivePanel] = useState("workbook");
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

  const availablePanels = useMemo(() => {
    if (module?.isProgrammingModule) {
      return [
        { id: "workbook", label: "Workbook" },
        { id: "code", label: "Code Lab" },
        { id: "chatbot", label: "Chatbot" },
      ];
    }

    return [
      { id: "workbook", label: "Workbook" },
      { id: "chatbot", label: "Chatbot" },
    ];
  }, [module]);

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

  useEffect(() => {
    setActivePanel("workbook");
  }, [moduleId, selectedMaterial?.id]);

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

  const renderRightPanelContent = () => {
    if (activePanel === "workbook") {
      return (
        <div className="h-full min-h-0 overflow-hidden">
          <NotebookEditor moduleId={moduleId} compact />
        </div>
      );
    }

    if (activePanel === "code" && module?.isProgrammingModule) {
      return (
        <div className="grid h-full min-h-0 gap-4 grid-rows-[1fr_220px] overflow-hidden">
          <div className="min-h-0 overflow-hidden rounded-3xl">
            <CodeLab onOutputChange={setCodeOutput} compact />
          </div>
          <div className="min-h-0 overflow-hidden rounded-3xl">
            <CodeOutput output={codeOutput} compact />
          </div>
        </div>
      );
    }

    if (activePanel === "chatbot") {
      return (
        <div className="h-full min-h-0 overflow-hidden">
          <StudyAssistant
            moduleTitle={module.title}
            materialTitle={materialTitle}
            materialContent={materialContent}
            compact
          />
        </div>
      );
    }

    return null;
  };

  if (loading) {
    return <PageLoader text="Loading module..." />;
  }

  if (error) {
    return (
      <AppLayout fullWidth>
        <div className="mx-auto max-w-7xl">
          <div className="rounded-3xl border border-red-200 bg-red-50 px-6 py-5 text-red-600">
            {error}
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout fullWidth>
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="flex flex-col gap-6 px-6 py-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 flex-1">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <InfoChip>{module.code || "Module"}</InfoChip>
                <InfoChip>
                  {module?.isProgrammingModule
                    ? "Programming Module"
                    : "Theory Module"}
                </InfoChip>
                <InfoChip>{totalCount} materials</InfoChip>
              </div>

              <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
                {module.title}
              </h1>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                {module.description || "Open materials and study inside your workspace."}
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  to="/dashboard"
                  className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Back to Dashboard
                </Link>

                {selectedMaterial && (
                  <button
                    type="button"
                    onClick={() => setSelectedMaterial(null)}
                    className="inline-flex items-center rounded-xl border border-slate-200 bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
                  >
                    Back to Materials
                  </button>
                )}
              </div>
            </div>

            <div className="w-full rounded-3xl border border-slate-200 bg-slate-50 p-5 lg:max-w-xs">
              <div className="flex items-center gap-4">
                <div className="relative h-20 w-20 shrink-0">
                  <svg className="h-20 w-20 -rotate-90">
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
                      stroke="#0f172a"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={2 * Math.PI * 32}
                      strokeDashoffset={
                        2 * Math.PI * 32 * (1 - progressPercent / 100)
                      }
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-slate-900">
                    {progressPercent}%
                  </div>
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900">
                    Module Progress
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {completedCount} of {totalCount} materials completed
                  </p>
                </div>
              </div>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-slate-900 transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {!selectedMaterial ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                Module Materials
              </h2>
              <p className="mt-1 text-sm text-slate-500">
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
          <div className="grid h-[85vh] gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.95fr)]">
            <div className="flex min-h-0 h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-5 py-4">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                  Material Viewer
                </p>
                <h3 className="mt-1 truncate text-lg font-semibold text-slate-900">
                  {materialTitle}
                </h3>
              </div>

              <div className="flex-1 min-h-0 overflow-hidden">
                <MaterialViewer material={selectedMaterial} />
              </div>
            </div>

            <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-4 py-4">
                <div className="inline-flex flex-wrap gap-2 rounded-2xl bg-slate-100 p-1.5">
                  {availablePanels.map((panel) => (
                    <PanelTab
                      key={panel.id}
                      active={activePanel === panel.id}
                      onClick={() => setActivePanel(panel.id)}
                    >
                      {panel.label}
                    </PanelTab>
                  ))}
                </div>
              </div>

              <div className="flex-1 min-h-0 overflow-hidden p-4 bg-slate-50/50">
                {renderRightPanelContent()}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
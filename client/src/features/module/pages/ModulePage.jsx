import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  getModuleById,
  getModuleMaterials
} from "../services/moduleService";
import MaterialsList from "../components/MaterialsList";
import NotebookEditor from "../components/NotebookEditor";
import CodeLab from "../components/CodeLab";
import AppLayout from "../../../components/common/AppLayout";

export default function ModulePage() {
  const { moduleId } = useParams();

  const [module, setModule] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [activeTab, setActiveTab] = useState("materials");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadModulePage = async () => {
      try {
        setLoading(true);
        setError("");

        const moduleData = await getModuleById(moduleId);

        if (!moduleData) {
          setError("Module not found.");
          return;
        }

        const materialsData = await getModuleMaterials(moduleId);

        setModule(moduleData);
        setMaterials(materialsData);
      } catch (err) {
        console.error(err);
        setError("Failed to load module page.");
      } finally {
        setLoading(false);
      }
    };

    loadModulePage();
  }, [moduleId]);

  if (loading) {
    return <div className="p-6">Loading module...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  const tabClass = (tab) =>
    `px-4 py-2 rounded-lg font-medium transition ${
      activeTab === tab
        ? "bg-blue-600 text-white"
        : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50"
    }`;

  return (
    <AppLayout>
      <div className="mb-8">
  <h2 className="text-3xl font-bold text-slate-800">{module.title}</h2>
  <p className="text-slate-600 mt-2">
    {module.code} • {module.description}
  </p>
</div>
      <div className="flex items-center justify-between mb-6">
        <Link
          to="/dashboard"
          className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 transition"
        >
          Back to Dashboard
        </Link>

        {module.isProgrammingModule && (
          <span className="text-sm font-semibold bg-blue-100 text-blue-700 px-4 py-2 rounded-full">
            Programming Module
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <button onClick={() => setActiveTab("materials")} className={tabClass("materials")}>
          Materials
        </button>

        <button onClick={() => setActiveTab("notebook")} className={tabClass("notebook")}>
          Notebook
        </button>

        {module.isProgrammingModule && (
          <button onClick={() => setActiveTab("code")} className={tabClass("code")}>
            Code Lab
          </button>
        )}
      </div>

      {activeTab === "materials" && <MaterialsList materials={materials} />}
      {activeTab === "notebook" && <NotebookEditor moduleId={moduleId} />}
      {activeTab === "code" && module.isProgrammingModule && <CodeLab />}
    </AppLayout>
  );
}
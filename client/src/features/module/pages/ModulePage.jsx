import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getModuleById,
  getModuleMaterials
} from "../services/moduleService";
import MaterialsList from "../components/MaterialsList";
import NotebookEditor from "../components/NotebookEditor";
import CodeLab from "../components/CodeLab";

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
          setLoading(false);
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

  return (
    <div className="min-h-screen bg-slate-100 px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">{module.title}</h1>
        <p className="text-slate-600 mt-2">{module.code}</p>
        <p className="text-slate-600 mt-3">{module.description}</p>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={() => setActiveTab("materials")}
          className={`px-4 py-2 rounded-lg ${
            activeTab === "materials"
              ? "bg-blue-600 text-white"
              : "bg-white text-slate-700 border border-slate-300"
          }`}
        >
          Materials
        </button>

        <button
          onClick={() => setActiveTab("notebook")}
          className={`px-4 py-2 rounded-lg ${
            activeTab === "notebook"
              ? "bg-blue-600 text-white"
              : "bg-white text-slate-700 border border-slate-300"
          }`}
        >
          Notebook
        </button>

        {module.isProgrammingModule && (
          <button
            onClick={() => setActiveTab("code")}
            className={`px-4 py-2 rounded-lg ${
              activeTab === "code"
                ? "bg-blue-600 text-white"
                : "bg-white text-slate-700 border border-slate-300"
            }`}
          >
            Code Lab
          </button>
        )}
      </div>

      {activeTab === "materials" && <MaterialsList materials={materials} />}
      {activeTab === "notebook" && <NotebookEditor />}
      {activeTab === "code" && module.isProgrammingModule && <CodeLab />}
    </div>
  );
}
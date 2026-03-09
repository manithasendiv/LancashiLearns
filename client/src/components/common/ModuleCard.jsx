import { Link } from "react-router-dom";

export default function ModuleCard({ module }) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-5 border border-slate-200">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800">{module.title}</h2>
          <p className="text-sm text-slate-500 mt-1">{module.code}</p>
        </div>

        {module.isProgrammingModule && (
          <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
            Programming
          </span>
        )}
      </div>

      <p className="text-slate-600 mt-4">{module.description}</p>

      <Link
        to={`/modules/${module.id}`}
        className="inline-block mt-5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
      >
        Open Module
      </Link>
    </div>
  );
}
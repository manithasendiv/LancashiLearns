import { Link } from "react-router-dom";

export default function ModuleCard({ module }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-blue-600">{module.code}</p>
          <h3 className="text-xl font-bold text-slate-800 mt-1">{module.title}</h3>
        </div>

        {module.isProgrammingModule && (
          <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
            Programming
          </span>
        )}
      </div>

      <p className="text-slate-600 mt-4 leading-relaxed">{module.description}</p>

      <Link
        to={`/modules/${module.id}`}
        className="inline-block mt-6 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
      >
        Open Module
      </Link>
    </div>
  );
}
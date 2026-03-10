import { Link } from "react-router-dom";

export default function ModuleCard({ module }) {
  const completed = module.completedCount || 0;
  const total = module.totalMaterials || 0;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - percent / 100);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-blue-600">{module.code}</p>
          <h3 className="text-xl font-bold text-slate-800 mt-1">{module.title}</h3>
        </div>

        <div className="relative w-16 h-16 shrink-0">
          <svg className="w-16 h-16 -rotate-90">
            <circle
              cx="32"
              cy="32"
              r={radius}
              stroke="#e2e8f0"
              strokeWidth="6"
              fill="none"
            />
            <circle
              cx="32"
              cy="32"
              r={radius}
              stroke="#16a34a"
              strokeWidth="6"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
            />
          </svg>

          <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-800">
            {percent}%
          </div>
        </div>
      </div>

      <p className="text-slate-600 mt-4 leading-relaxed">{module.description}</p>

      <div className="mt-5">
        <p className="text-sm text-slate-600">
          Completed {completed} of {total} materials
        </p>
      </div>

      <Link
        to={`/modules/${module.id}`}
        className="inline-block mt-6 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
      >
        Open Module
      </Link>
    </div>
  );
}
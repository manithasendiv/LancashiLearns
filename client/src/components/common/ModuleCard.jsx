import { Link } from "react-router-dom";

export default function ModuleCard({ module }) {
  const completed = module.completedCount || 0;
  const total = module.totalMaterials || 0;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
            {module.code}
          </p>
          <h4 className="mt-2 text-lg font-bold text-slate-900">{module.title}</h4>
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-sm font-bold text-slate-800 shadow-sm">
          {percent}%
        </div>
      </div>

      <p className="mt-4 text-sm leading-6 text-slate-600">{module.description}</p>

      <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-blue-600"
          style={{ width: `${percent}%` }}
        />
      </div>

      <p className="mt-2 text-xs text-slate-500">
        {completed} of {total} materials completed
      </p>

      <Link
        to={`/modules/${module.id}`}
        className="mt-5 inline-block w-full rounded-xl bg-blue-600 px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-blue-700"
      >
        Open Module
      </Link>
    </div>
  );
}
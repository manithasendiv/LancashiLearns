export default function MaterialsList({
  materials,
  selectedMaterialId,
  onSelectMaterial,
  progressMap = {},
  onToggleComplete,
}) {
  if (!materials.length) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 text-slate-600">
        No materials available for this module yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {materials.map((item) => {
        const isActive = selectedMaterialId === item.id;
        const isCompleted = !!progressMap[item.id];

        return (
          <div
            key={item.id}
            className={`rounded-2xl border p-5 min-h-[150px] transition ${
              isActive
                ? "border-blue-500 bg-blue-50"
                : "border-slate-200 bg-white hover:bg-slate-50"
            }`}
          >
            <div className="flex items-center justify-between gap-4 min-h-[110px]">
              <button
                type="button"
                onClick={() => onSelectMaterial(item)}
                className="flex-1 text-left"
              >
                <h3 className="text-lg font-bold text-slate-800">{item.title}</h3>
                <p className="text-sm text-slate-500 mt-2">{item.type}</p>
                <p className="text-sm text-slate-500 mt-1 break-all">{item.fileName}</p>
              </button>

              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 whitespace-nowrap shrink-0">
                <input
                  type="checkbox"
                  checked={isCompleted}
                  onChange={(e) => onToggleComplete(item.id, e.target.checked)}
                  className="h-4 w-4"
                />
                Done
              </label>
            </div>
          </div>
        );
      })}
    </div>
  );
}
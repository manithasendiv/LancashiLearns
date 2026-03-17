import { useMemo } from "react";

function normalizeWeekNumber(value) {
  const num = Number(value);
  return Number.isInteger(num) && num > 0 ? num : null;
}

function groupMaterialsByWeek(materials = []) {
  const groupsMap = new Map();

  materials.forEach((item) => {
    const weekNumber = normalizeWeekNumber(item.weekNumber);
    const key = weekNumber ? `week-${weekNumber}` : "general";

    if (!groupsMap.has(key)) {
      groupsMap.set(key, {
        key,
        weekNumber,
        title: weekNumber ? `Week ${weekNumber}` : "General Materials",
        items: [],
      });
    }

    groupsMap.get(key).items.push(item);
  });

  const groups = Array.from(groupsMap.values()).sort((a, b) => {
    if (a.weekNumber === null && b.weekNumber === null) return 0;
    if (a.weekNumber === null) return 1;
    if (b.weekNumber === null) return -1;
    return a.weekNumber - b.weekNumber;
  });

  groups.forEach((group) => {
    group.items.sort((a, b) => {
      const titleA = (a.title || "").toLowerCase();
      const titleB = (b.title || "").toLowerCase();
      return titleA.localeCompare(titleB);
    });
  });

  return groups;
}

export default function MaterialsList({
  materials,
  selectedMaterialId,
  onSelectMaterial,
  progressMap = {},
  onToggleComplete,
}) {
  const groupedMaterials = useMemo(
    () => groupMaterialsByWeek(materials),
    [materials]
  );

  if (!materials.length) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 text-slate-600">
        No materials available for this module yet.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {groupedMaterials.map((group) => (
        <section key={group.key} className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-lg font-bold text-slate-800">{group.title}</h3>
              <p className="text-sm text-slate-500 mt-1">
                {group.items.length} material{group.items.length === 1 ? "" : "s"}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {group.items.map((item) => {
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
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-lg font-bold text-slate-800">
                          {item.title}
                        </h4>

                        {item.type && (
                          <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                            {item.type}
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-slate-500 mt-2 break-all">
                        {item.fileName}
                      </p>
                    </button>

                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700 whitespace-nowrap shrink-0">
                      <input
                        type="checkbox"
                        checked={isCompleted}
                        onChange={(e) =>
                          onToggleComplete(item.id, e.target.checked)
                        }
                        className="h-4 w-4"
                      />
                      Done
                    </label>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
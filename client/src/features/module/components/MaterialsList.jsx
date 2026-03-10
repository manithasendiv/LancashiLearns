export default function MaterialsList({ materials }) {
  if (!materials.length) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 text-slate-600">
        No materials available for this module yet.
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {materials.map((item) => (
        <div
          key={item.id}
          className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-800">{item.title}</h3>
              <p className="text-sm text-slate-500 mt-1">{item.type}</p>
              <p className="text-sm text-slate-500">{item.fileName}</p>
            </div>

            <a
              href={item.fileUrl}
              target="_blank"
              rel="noreferrer"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              Open
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}
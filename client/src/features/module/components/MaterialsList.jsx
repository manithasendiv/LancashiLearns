export default function MaterialsList({ materials }) {
  if (!materials.length) {
    return (
      <div className="bg-white rounded-2xl shadow p-6 text-slate-600">
        No materials available for this module yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {materials.map((item) => (
        <div
          key={item.id}
          className="bg-white rounded-2xl shadow p-5 border border-slate-200"
        >
          <h3 className="text-lg font-semibold text-slate-800">{item.title}</h3>
          <p className="text-sm text-slate-500 mt-1">{item.type}</p>
          <p className="text-sm text-slate-500">{item.fileName}</p>

          <a
            href={item.fileUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-block mt-4 text-blue-600 font-medium hover:underline"
          >
            Open Material
          </a>
        </div>
      ))}
    </div>
  );
}
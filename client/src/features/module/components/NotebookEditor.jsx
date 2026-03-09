export default function NotebookEditor() {
  return (
    <div className="bg-white rounded-2xl shadow p-5 border border-slate-200">
      <h2 className="text-xl font-bold text-slate-800 mb-3">Personal Notebook</h2>
      <textarea
        className="w-full min-h-[300px] border border-slate-300 rounded-lg p-4 outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Write your notes here..."
      />
      <button className="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg">
        Save Note
      </button>
    </div>
  );
}
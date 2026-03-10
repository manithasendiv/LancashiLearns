import { useEffect, useState } from "react";
import { auth } from "../../../firebase/config";
import { getNote, saveNote } from "../../notes/services/noteService";

export default function NotebookEditor({ moduleId }) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadNote = async () => {
      try {
        setLoading(true);
        setError("");
        setMessage("");

        const user = auth.currentUser;

        if (!user) {
          setError("No authenticated user found.");
          setLoading(false);
          return;
        }

        const note = await getNote(user.uid, moduleId);

        if (note?.content) {
          setContent(note.content);
        } else {
          setContent("");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load note.");
      } finally {
        setLoading(false);
      }
    };

    loadNote();
  }, [moduleId]);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");
      setMessage("");

      const user = auth.currentUser;

      if (!user) {
        setError("No authenticated user found.");
        return;
      }

      await saveNote(user.uid, moduleId, content);
      setMessage("Note saved successfully.");
    } catch (err) {
      console.error("Save note error:", err);
      setError(err.message || "Failed to save note.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">Loading note...</div>;
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Personal Notebook</h2>
          <p className="text-sm text-slate-500 mt-1">
            Write and save your module notes here.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-70"
        >
          {saving ? "Saving..." : "Save Note"}
        </button>
      </div>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full min-h-[350px] border border-slate-300 rounded-xl p-4 outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        placeholder="Write your notes here..."
      />

      {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
      {message && <p className="mt-3 text-sm text-green-600">{message}</p>}
    </div>
  );
}
import { useEffect, useRef, useState } from "react";
import { auth } from "../../../firebase/config";
import { getNote, saveNote } from "../../notes/services/noteService";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";

function ToolbarButton({ onClick, active, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-2 rounded-lg text-sm font-medium border transition ${
        active
          ? "bg-blue-600 text-white border-blue-600"
          : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
      }`}
    >
      {children}
    </button>
  );
}

export default function NotebookEditor({ moduleId }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saveStatus, setSaveStatus] = useState("");
  const [lastSavedText, setLastSavedText] = useState("");

  const hasLoadedNote = useRef(false);
  const autosaveTimeout = useRef(null);

  const editor = useEditor({
    extensions: [StarterKit, Highlight],
    content: "<p>Write your notes here...</p>",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "tiptap min-h-[320px] outline-none rounded-b-xl border border-t-0 border-slate-300 p-4 bg-white",
      },
    },
    onUpdate: () => {
      if (!hasLoadedNote.current) return;

      if (autosaveTimeout.current) {
        clearTimeout(autosaveTimeout.current);
      }

      setSaveStatus("Typing...");

      autosaveTimeout.current = setTimeout(() => {
        handleSave(true);
      }, 2000);
    },
  });

  useEffect(() => {
    const loadNote = async () => {
      try {
        setLoading(true);
        setError("");
        setSaveStatus("");

        const user = auth.currentUser;
        if (!user) {
          setError("No authenticated user found.");
          return;
        }

        const note = await getNote(user.uid, moduleId);

        if (editor) {
          editor.commands.setContent(
            note?.content || "<p>Write your notes here...</p>"
          );
        }

        if (note?.lastEditedAt?.seconds) {
          const date = new Date(note.lastEditedAt.seconds * 1000);
          setLastSavedText(`Last saved: ${date.toLocaleString()}`);
        } else {
          setLastSavedText("Not saved yet");
        }

        hasLoadedNote.current = true;
      } catch (err) {
        console.error(err);
        setError("Failed to load note.");
      } finally {
        setLoading(false);
      }
    };

    if (editor) {
      loadNote();
    }

    return () => {
      if (autosaveTimeout.current) {
        clearTimeout(autosaveTimeout.current);
      }
    };
  }, [editor, moduleId]);

  const handleSave = async (isAutoSave = false) => {
    try {
      setSaving(true);
      setError("");
      setSaveStatus(isAutoSave ? "Autosaving..." : "Saving...");

      const user = auth.currentUser;
      if (!user) {
        setError("No authenticated user found.");
        return;
      }

      const htmlContent = editor?.getHTML() || "<p></p>";
      await saveNote(user.uid, moduleId, htmlContent);

      const now = new Date();
      setLastSavedText(`Last saved: ${now.toLocaleString()}`);
      setSaveStatus(isAutoSave ? "Autosaved" : "Saved successfully");
    } catch (err) {
      console.error(err);
      setError("Failed to save note.");
      setSaveStatus("Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleClear = () => {
    const confirmed = window.confirm("Are you sure you want to clear this note?");
    if (!confirmed) return;

    editor?.commands.clearContent();
    setSaveStatus("Cleared locally. Autosave will update shortly.");
  };

  if (loading || !editor) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        Loading note...
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 h-full flex flex-col overflow-hidden">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Personal Notebook</h2>
          <p className="text-sm text-slate-500 mt-1">
            Rich text notes with headings, lists, and highlight.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => handleSave(false)}
            disabled={saving}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-70"
          >
            {saving ? "Saving..." : "Save Now"}
          </button>

          <button
            onClick={handleClear}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-medium"
          >
            Clear Note
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4 text-sm">
        <span className="text-slate-600">{lastSavedText}</span>
        <span
          className={`font-medium ${
            saveStatus === "Save failed"
              ? "text-red-600"
              : saveStatus === "Autosaved" || saveStatus === "Saved successfully"
              ? "text-green-600"
              : "text-blue-600"
          }`}
        >
          {saveStatus}
        </span>
      </div>

      <div className="flex flex-wrap gap-2 border border-slate-300 border-b-0 rounded-t-xl bg-slate-50 p-3">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
        >
          Bold
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
        >
          Italic
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          active={editor.isActive("heading", { level: 1 })}
        >
          H1
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive("heading", { level: 2 })}
        >
          H2
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
        >
          Bullet List
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
        >
          Numbered List
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          active={editor.isActive("highlight")}
        >
          Highlight
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          active={false}
        >
          Undo
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          active={false}
        >
          Redo
        </ToolbarButton>
      </div>

      <div className="flex-1 min-h-0">
  <EditorContent editor={editor} />
</div>

      {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
    </div>
  );
}
import { useEffect, useRef, useState } from "react";
import { auth } from "../../../firebase/config";
import { getNote, saveNote } from "../../notes/services/noteService";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import Placeholder from "@tiptap/extension-placeholder";

function ToolbarButton({ onClick, active, title, children }) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      className={`flex h-10 w-10 items-center justify-center rounded-xl border transition ${
        active
          ? "border-slate-900 bg-slate-900 text-white shadow-sm"
          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900"
      }`}
    >
      {children}
    </button>
  );
}

function BoldIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2">
      <path d="M7 5h6a4 4 0 0 1 0 8H7z" />
      <path d="M7 13h7a4 4 0 0 1 0 8H7z" />
    </svg>
  );
}

function ItalicIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2">
      <path d="M14 4h-4" />
      <path d="M10 20h4" />
      <path d="M14 4 10 20" />
    </svg>
  );
}

function H1Icon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2">
      <path d="M4 5v14" />
      <path d="M10 5v14" />
      <path d="M4 12h6" />
      <path d="M16 9 18 7v10" />
      <path d="M16 17h4" />
    </svg>
  );
}

function H2Icon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2">
      <path d="M3 5v14" />
      <path d="M9 5v14" />
      <path d="M3 12h6" />
      <path d="M15 10a2.5 2.5 0 1 1 5 0c0 2-2 3-3.5 4.5L15 16h5" />
    </svg>
  );
}

function BulletListIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2">
      <circle cx="5" cy="7" r="1" fill="currentColor" stroke="none" />
      <circle cx="5" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="5" cy="17" r="1" fill="currentColor" stroke="none" />
      <path d="M9 7h10" />
      <path d="M9 12h10" />
      <path d="M9 17h10" />
    </svg>
  );
}

function NumberedListIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2">
      <path d="M4 7h1v4" />
      <path d="M4 17h2l-2-2 2-2" />
      <path d="M10 7h10" />
      <path d="M10 12h10" />
      <path d="M10 17h10" />
    </svg>
  );
}

function HighlightIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2">
      <path d="m9 11 7-7 4 4-7 7" />
      <path d="M7 13 4 20l7-3" />
      <path d="M3 21h18" />
    </svg>
  );
}

function UndoIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2">
      <path d="M9 14 4 9l5-5" />
      <path d="M20 20a8 8 0 0 0-8-8H4" />
    </svg>
  );
}

function RedoIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2">
      <path d="m15 14 5-5-5-5" />
      <path d="M4 20a8 8 0 0 1 8-8h8" />
    </svg>
  );
}

export default function NotebookEditor({ moduleId, compact = false }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saveStatus, setSaveStatus] = useState("");
  const [lastSavedText, setLastSavedText] = useState("Not saved yet");

  const hasLoadedNote = useRef(false);
  const autosaveTimeout = useRef(null);

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
      setSaveStatus(isAutoSave ? "Autosaved" : "Saved");
    } catch (err) {
      console.error(err);
      setError("Failed to save note.");
      setSaveStatus("Save failed");
    } finally {
      setSaving(false);
    }
  };

  const editor = useEditor({
    extensions: [
      StarterKit,
      Highlight,
      Placeholder.configure({
        placeholder: "Write your notes, ideas, and revision points here...",
        emptyEditorClass: "is-editor-empty",
      }),
    ],
    content: "<p></p>",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: [
          "tiptap",
          compact ? "min-h-[280px] px-4 py-4" : "min-h-[380px] px-5 py-5",
          "bg-slate-50",
          "text-[15px] leading-7 text-slate-700",
          "outline-none",
        ].join(" "),
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
          editor.commands.setContent(note?.content || "<p></p>");
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

  const handleClear = () => {
    const confirmed = window.confirm("Are you sure you want to clear this note?");
    if (!confirmed) return;

    editor?.commands.setContent("<p></p>");
    setSaveStatus("Cleared locally. Autosave will update shortly.");
  };

  const getStatusClasses = () => {
    if (saveStatus === "Save failed") {
      return "border-red-200 bg-red-50 text-red-600";
    }

    if (saveStatus === "Autosaved" || saveStatus === "Saved") {
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    }

    if (saveStatus === "Autosaving..." || saveStatus === "Saving...") {
      return "border-blue-200 bg-blue-50 text-blue-700";
    }

    return "border-slate-200 bg-slate-100 text-slate-600";
  };

  if (loading || !editor) {
    return (
      <div className="h-full rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm text-slate-500">Loading note...</p>
      </div>
    );
  }

  return (
    <div className="notebook-editor h-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <style>{`
        .notebook-editor .tiptap {
          caret-color: #0f172a;
        }

        .notebook-editor .tiptap p {
          margin: 0.45rem 0;
        }

        .notebook-editor .tiptap h1 {
          margin: 1rem 0 0.5rem;
          font-size: 1.5rem;
          line-height: 2rem;
          font-weight: 700;
          color: #0f172a;
        }

        .notebook-editor .tiptap h2 {
          margin: 0.9rem 0 0.45rem;
          font-size: 1.25rem;
          line-height: 1.75rem;
          font-weight: 600;
          color: #0f172a;
        }

        .notebook-editor .tiptap ul,
        .notebook-editor .tiptap ol {
          margin: 0.6rem 0;
          padding-left: 1.4rem;
        }

        .notebook-editor .tiptap li {
          margin: 0.2rem 0;
        }

        .notebook-editor .tiptap mark {
          background: #fde68a;
          color: #0f172a;
          border-radius: 0.35rem;
          padding: 0.05rem 0.2rem;
        }

        .notebook-editor .tiptap p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          color: #94a3b8;
          pointer-events: none;
          float: left;
          height: 0;
        }
      `}</style>

      <div className={`${compact ? "px-4 py-4" : "px-6 py-5"} border-b border-slate-200`}>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                Workbook
              </p>
              <h2 className="mt-1 text-xl font-semibold text-slate-900">
                Personal Notebook
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Keep quick notes, summaries, and revision points here.
              </p>
            </div>

            <div className="flex gap-2">
  <button
    type="button"
    onClick={() => handleSave(false)}
    disabled={saving}
    className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-70"
  >
    {saving ? "Saving..." : "Save"}
  </button>

  <button
    type="button"
    onClick={handleClear}
    className="px-4 py-2 rounded-lg bg-slate-200 text-slate-800 text-sm font-medium hover:bg-slate-300"
  >
    Clear
  </button>
</div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm text-slate-500">{lastSavedText}</span>

            <span
              className={`inline-flex w-fit items-center rounded-full border px-3 py-1 text-xs font-medium ${getStatusClasses()}`}
            >
              {saveStatus || "Ready"}
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden bg-slate-50/60">
        <div className="h-full overflow-y-auto">
          <div className="sticky top-0 z-10 border-b border-slate-200 bg-slate-50/95 px-4 py-3 backdrop-blur-sm">
            <div className="flex flex-wrap gap-2">
              <ToolbarButton
                title="Bold"
                onClick={() => editor.chain().focus().toggleBold().run()}
                active={editor.isActive("bold")}
              >
                <BoldIcon />
              </ToolbarButton>

              <ToolbarButton
                title="Italic"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                active={editor.isActive("italic")}
              >
                <ItalicIcon />
              </ToolbarButton>

              <ToolbarButton
                title="Heading 1"
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                active={editor.isActive("heading", { level: 1 })}
              >
                <H1Icon />
              </ToolbarButton>

              <ToolbarButton
                title="Heading 2"
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                active={editor.isActive("heading", { level: 2 })}
              >
                <H2Icon />
              </ToolbarButton>

              <ToolbarButton
                title="Bullet list"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                active={editor.isActive("bulletList")}
              >
                <BulletListIcon />
              </ToolbarButton>

              <ToolbarButton
                title="Numbered list"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                active={editor.isActive("orderedList")}
              >
                <NumberedListIcon />
              </ToolbarButton>

              <ToolbarButton
                title="Highlight"
                onClick={() => editor.chain().focus().toggleHighlight().run()}
                active={editor.isActive("highlight")}
              >
                <HighlightIcon />
              </ToolbarButton>

              <ToolbarButton
                title="Undo"
                onClick={() => editor.chain().focus().undo().run()}
                active={false}
              >
                <UndoIcon />
              </ToolbarButton>

              <ToolbarButton
                title="Redo"
                onClick={() => editor.chain().focus().redo().run()}
                active={false}
              >
                <RedoIcon />
              </ToolbarButton>
            </div>
          </div>

          <EditorContent editor={editor} />
        </div>
      </div>

      {error && (
        <div className="border-t border-slate-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
}
import { useCallback, useEffect, useMemo, useState } from "react";
import { auth } from "../../../firebase/config";
import AppLayout from "../../../components/common/AppLayout";
import PageLoader from "../../../components/common/PageLoader";
import NotebookEditor from "../../module/components/NotebookEditor";
import {
  createNote,
  deleteNoteById,
  getUserNotes,
} from "../services/noteService";
import { getModuleById } from "../../module/services/moduleService";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

function stripHtml(html = "") {
  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.body.textContent || "";
}

function SparklesIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5 fill-none stroke-current stroke-2"
    >
      <path d="M12 3l1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8L12 3z" />
      <path d="M19 14l.9 2.1L22 17l-2.1.9L19 20l-.9-2.1L16 17l2.1-.9L19 14z" />
      <path d="M5 14l.9 2.1L8 17l-2.1.9L5 20l-.9-2.1L2 17l2.1-.9L5 14z" />
    </svg>
  );
}

export default function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [moduleTitles, setModuleTitles] = useState({});
  const [selectedNoteId, setSelectedNoteId] = useState("");
  const [selectedNoteData, setSelectedNoteData] = useState(null);

  const [loading, setLoading] = useState(true);
  const [creatingNote, setCreatingNote] = useState(false);
  const [notesBarCollapsed, setNotesBarCollapsed] = useState(true);

  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summary, setSummary] = useState("");
  const [showSummaryModal, setShowSummaryModal] = useState(false);

  const [error, setError] = useState("");

  const groupedNotes = useMemo(() => {
    return notes.reduce((acc, note) => {
      const key = note.moduleId || "general";
      if (!acc[key]) acc[key] = [];
      acc[key].push(note);
      return acc;
    }, {});
  }, [notes]);

  const flattenedNotes = useMemo(() => {
    return Object.entries(groupedNotes).flatMap(([moduleId, moduleNotes]) =>
      moduleNotes.map((note) => ({
        ...note,
        groupLabel: moduleTitles[moduleId] || moduleId,
      }))
    );
  }, [groupedNotes, moduleTitles]);

  const loadNotes = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const user = auth.currentUser;
      if (!user) {
        setError("No authenticated user found.");
        return;
      }

      const notesData = await getUserNotes(user.uid);
      setNotes(notesData);

      setSelectedNoteId((prev) => {
        const exists = notesData.some((note) => note.id === prev);
        return exists ? prev : notesData[0]?.id || "";
      });

      setSelectedNoteData((prev) => {
        const exists = notesData.find((note) => note.id === prev?.id);
        return exists || notesData[0] || null;
      });

      const uniqueModuleIds = [...new Set(notesData.map((note) => note.moduleId))];

      const titleEntries = await Promise.all(
        uniqueModuleIds.map(async (moduleId) => {
          if (moduleId === "general") {
            return ["general", "General Notes"];
          }

          try {
            const module = await getModuleById(moduleId);
            return [moduleId, module?.title || `Module ${moduleId}`];
          } catch {
            return [moduleId, `Module ${moduleId}`];
          }
        })
      );

      setModuleTitles(Object.fromEntries(titleEntries));
    } catch (err) {
      console.error(err);
      setError("Failed to load notes.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const handleCreateGeneralNote = async () => {
    try {
      const user = auth.currentUser;
      if (!user || creatingNote) return;

      setCreatingNote(true);

      const created = await createNote(
        user.uid,
        "general",
        `Untitled Note ${notes.length + 1}`
      );

      await loadNotes();
      setSelectedNoteId(created.id);
      setSelectedNoteData(created);
      setSummary("");
      setNotesBarCollapsed(true);
    } catch (err) {
      console.error("Failed to create note:", err);
    } finally {
      setCreatingNote(false);
    }
  };

  const handleDeleteNote = async () => {
    try {
      if (!selectedNoteId) return;

      const confirmed = window.confirm(
        "Are you sure you want to delete this note?"
      );
      if (!confirmed) return;

      await deleteNoteById(selectedNoteId);
      await loadNotes();
      setSummary("");
      setShowSummaryModal(false);
    } catch (err) {
      console.error("Failed to delete note:", err);
    }
  };

  const handleSummarize = async () => {
    try {
      if (!selectedNoteData?.content) {
        setShowSummaryModal(true);
        setSummary("This note is empty, so there is nothing to summarize.");
        return;
      }

      const plainText = stripHtml(selectedNoteData.content).trim();

      setShowSummaryModal(true);

      if (!plainText) {
        setSummary("This note is empty, so there is nothing to summarize.");
        return;
      }

      setSummaryLoading(true);
      setSummary("");

      const response = await fetch(`${API_BASE_URL}/api/notes/summarize`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          noteText: plainText,
          moduleTitle:
            moduleTitles[selectedNoteData.moduleId] ||
            selectedNoteData.moduleId ||
            "General Notes",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to summarize note.");
      }

      setSummary(data.summary || "No summary generated.");
    } catch (err) {
      console.error(err);
      setSummary(
        "Failed to generate summary. Make sure backend server and Ollama are running."
      );
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleNoteChange = useCallback((updatedNote) => {
    setSelectedNoteData(updatedNote);

    setNotes((prev) =>
      prev.map((note) =>
        note.id === updatedNote.id ? { ...note, ...updatedNote } : note
      )
    );
  }, []);

  if (loading) {
    return <PageLoader text="Loading notes..." />;
  }

  return (
    <AppLayout fullWidth>
      <div className="space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white px-6 py-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
                My Notes
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Manage all your note pages and summarize them with AI.
              </p>
            </div>

            <button
              type="button"
              onClick={handleCreateGeneralNote}
              disabled={creatingNote}
              className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {creatingNote ? "Creating..." : "New General Note"}
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-3xl border border-red-200 bg-red-50 px-6 py-4 text-red-600">
            {error}
          </div>
        )}

        <div className="relative grid h-[88vh] min-h-0 gap-4 grid-rows-[auto_minmax(0,1fr)]">
          <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-4 py-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-slate-900">
                    Notes
                  </h3>
                  {!notesBarCollapsed && (
                    <p className="mt-1 text-xs text-slate-500">
                      {notes.length} note{notes.length !== 1 ? "s" : ""}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setNotesBarCollapsed((prev) => !prev)}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    {notesBarCollapsed ? "Expand Notes" : "Collapse Notes"}
                  </button>

                  <button
                    type="button"
                    onClick={handleDeleteNote}
                    disabled={!selectedNoteId}
                    className="rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100 disabled:opacity-60"
                  >
                    Delete Note
                  </button>
                </div>
              </div>
            </div>

            {!notesBarCollapsed && (
              <div className="overflow-x-auto px-4 py-3">
                <div className="flex min-w-max gap-3">
                  {flattenedNotes.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-3 text-sm text-slate-500">
                      No notes yet. Create your first note page.
                    </div>
                  ) : (
                    flattenedNotes.map((note, index) => (
                      <button
                        key={note.id}
                        type="button"
                        onClick={() => {
                          setSelectedNoteId(note.id);
                          setSelectedNoteData(note);
                          setSummary("");
                          setNotesBarCollapsed(true);
                        }}
                        className={`max-w-[240px] min-w-[240px] rounded-2xl border p-3 text-left transition ${
                          selectedNoteId === note.id
                            ? "border-slate-900 bg-slate-900 text-white"
                            : "border-slate-200 bg-white hover:bg-slate-50"
                        }`}
                      >
                        <p
                          className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${
                            selectedNoteId === note.id
                              ? "text-slate-300"
                              : "text-slate-400"
                          }`}
                        >
                          {note.groupLabel}
                        </p>

                        <p className="mt-2 truncate text-sm font-semibold">
                          {note.title || `Untitled Note ${index + 1}`}
                        </p>

                        <p
                          className={`mt-1 text-xs ${
                            selectedNoteId === note.id
                              ? "text-slate-300"
                              : "text-slate-500"
                          }`}
                        >
                          {note.lastEditedAt?.seconds
                            ? new Date(
                                note.lastEditedAt.seconds * 1000
                              ).toLocaleString()
                            : "No save date"}
                        </p>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}

            {notesBarCollapsed && (
              <div className="px-4 py-2.5">
                <select
                  value={selectedNoteId}
                  onChange={(e) => {
                    const nextId = e.target.value;
                    const nextNote =
                      notes.find((note) => note.id === nextId) || null;

                    setSelectedNoteId(nextId);
                    setSelectedNoteData(nextNote);
                    setSummary("");
                  }}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a note</option>
                  {flattenedNotes.map((note, index) => (
                    <option key={note.id} value={note.id}>
                      {`${note.groupLabel} — ${
                        note.title || `Untitled Note ${index + 1}`
                      }`}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="min-h-0 overflow-hidden">
            <NotebookEditor
              noteId={selectedNoteId}
              onNoteChange={handleNoteChange}
            />
          </div>

          <button
            type="button"
            onClick={handleSummarize}
            disabled={!selectedNoteId || summaryLoading}
            title="Summarize note"
            className="absolute bottom-5 right-5 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <SparklesIcon />
          </button>
        </div>

        {showSummaryModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
            onClick={() => setShowSummaryModal(false)}
          >
            <div
              className="w-full max-w-3xl rounded-3xl border border-slate-200 bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
                <div>
                  <h3 className="text-xl font-semibold text-slate-900">
                    AI Note Summary
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Summary for the selected note page
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowSummaryModal(false)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Close
                </button>
              </div>

              <div className="px-6 py-5">
                <div className="max-h-[70vh] overflow-y-auto whitespace-pre-wrap rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-700">
                  {summaryLoading
                    ? "Generating summary..."
                    : summary || "No summary generated yet."}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
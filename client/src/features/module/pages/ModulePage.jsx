import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { auth } from "../../../firebase/config";
import { getModuleById, getModuleMaterials } from "../services/moduleService";
import {
  getUserModuleProgress,
  toggleMaterialCompletion,
} from "../services/progressService";
import {
  createNote,
  deleteNoteById,
  getUserModuleNotes,
} from "../../notes/services/noteService";
import MaterialsList from "../components/MaterialsList";
import MaterialViewer from "../components/MaterialViewer";
import NotebookEditor from "../components/NotebookEditor";
import CodeLab from "../components/CodeLab";
import CodeOutput from "../components/CodeOutput";
import StudyAssistant from "../../../components/chat/StudyAssistant";
import AppLayout from "../../../components/common/AppLayout";
import PageLoader from "../../../components/common/PageLoader";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

// Reusable tab button for right-panel mode switching.
function PanelTab({ active, onClick, children, testId }) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-testid={testId}
      className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${
        active
          ? "bg-slate-900 text-white shadow-sm"
          : "bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900"
      }`}
    >
      {children}
    </button>
  );
}

// Small badge used in module metadata header.
function InfoChip({ children }) {
  return (
    <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
      {children}
    </span>
  );
}

// Converts rich HTML content into plain text for prompt-safe API requests.
function stripHtml(html = "") {
  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.body.textContent || "";
}

// Icon for the floating AI summary action button.
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

export default function ModulePage() {
  const { moduleId } = useParams();

  // Core module and material state.
  const [module, setModule] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [progressMap, setProgressMap] = useState({});
  // Output panel state for code execution mode.
  const [codeOutput, setCodeOutput] = useState("Output will appear here.");
  // Controls right-panel content (workbook, code, chatbot).
  const [activePanel, setActivePanel] = useState("workbook");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Note selection and UI controls.
  const [notes, setNotes] = useState([]);
  const [selectedNoteId, setSelectedNoteId] = useState("");
  const [selectedNoteData, setSelectedNoteData] = useState(null);
  const [creatingNote, setCreatingNote] = useState(false);
  const [notesBarCollapsed, setNotesBarCollapsed] = useState(true);

  const [summaryLoading, setSummaryLoading] = useState(false);
  const [noteSummary, setNoteSummary] = useState("");
  const [showSummaryModal, setShowSummaryModal] = useState(false);

  // Count completed materials from the lookup map.
  const completedCount = useMemo(() => {
    return Object.values(progressMap).filter(Boolean).length;
  }, [progressMap]);

  // Derive completion percentage for the circular/linear progress UI.
  const totalCount = materials.length;
  const progressPercent =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const materialTitle = useMemo(() => {
    if (!selectedMaterial) return "";
    // Pick first available title field from mixed material schemas.
    return (
      selectedMaterial.title ||
      selectedMaterial.name ||
      selectedMaterial.label ||
      "Selected Material"
    );
  }, [selectedMaterial]);

  const materialContent = useMemo(() => {
    if (!selectedMaterial) return "";

    // Different material sources use different field names; collapse them to one value.
    return (
      selectedMaterial.content ||
      selectedMaterial.text ||
      selectedMaterial.description ||
      selectedMaterial.summary ||
      selectedMaterial.notes ||
      selectedMaterial.body ||
      selectedMaterial.excerpt ||
      ""
    );
  }, [selectedMaterial]);

  const availablePanels = useMemo(() => {
    // Programming modules expose code execution in addition to notes/chat.
    if (module?.isProgrammingModule) {
      return [
        { id: "workbook", label: "Workbook" },
        { id: "code", label: "Code Lab" },
        { id: "chatbot", label: "Chatbot" },
      ];
    }

    return [
      { id: "workbook", label: "Workbook" },
      { id: "chatbot", label: "Chatbot" },
    ];
  }, [module]);

  const loadModuleNotes = useCallback(async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      // Refresh notes and keep previous selection if it still exists.
      const notesData = await getUserModuleNotes(user.uid, moduleId);
      setNotes(notesData);

      setSelectedNoteId((prev) => {
        const exists = notesData.some((note) => note.id === prev);
        if (exists) return prev;
        return notesData[0]?.id || "";
      });

      if (notesData.length === 0) {
        // Clear editor state when no notes are available.
        setSelectedNoteData(null);
      }
    } catch (err) {
      console.error("Failed to load notes:", err);
    }
  }, [moduleId]);

  useEffect(() => {
    // Initial page load fetches module metadata, materials, progress, and notes.
    const loadModulePage = async () => {
      try {
        setLoading(true);
        setError("");

        const user = auth.currentUser;
        if (!user) {
          setError("No authenticated user found.");
          return;
        }

        const moduleData = await getModuleById(moduleId);

        if (!moduleData) {
          setError("Module not found.");
          return;
        }

        const materialsData = await getModuleMaterials(moduleId);
        const progressData = await getUserModuleProgress(user.uid, moduleId);
        const notesData = await getUserModuleNotes(user.uid, moduleId);

        // Convert progress records into a quick lookup map for toggle/render speed.
        const progressLookup = {};
        progressData.forEach((item) => {
          progressLookup[item.materialId] = item.completed;
        });

        setModule(moduleData);
        setMaterials(materialsData);
        setProgressMap(progressLookup);
        setNotes(notesData);
        setSelectedNoteId(notesData[0]?.id || "");
        setSelectedNoteData(notesData[0] || null);
      } catch (err) {
        console.error(err);
        setError("Failed to load module page.");
      } finally {
        // End loading regardless of success/failure path.
        setLoading(false);
      }
    };

    loadModulePage();
  }, [moduleId]);

  useEffect(() => {
    // Reset panel to workbook whenever module/material context changes.
    setActivePanel("workbook");
  }, [moduleId, selectedMaterial?.id]);

  const handleToggleComplete = async (materialId, completed) => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      // Persist completion in backend and mirror state locally.
      await toggleMaterialCompletion(user.uid, moduleId, materialId, completed);

      setProgressMap((prev) => ({
        ...prev,
        [materialId]: completed,
      }));
    } catch (err) {
      console.error("Failed to update material progress:", err);
    }
  };

  const handleCreateNote = async () => {
    try {
      const user = auth.currentUser;
      if (!user || creatingNote) return;

      setCreatingNote(true);

      const created = await createNote(
        user.uid,
        moduleId,
        `Untitled Note ${notes.length + 1}`
      );

      // Reload to preserve canonical ordering/metadata from backend.
      await loadModuleNotes();
      setSelectedNoteId(created.id);
      setSelectedNoteData(created);
      setNoteSummary("");
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

      // Client-side safety prompt before destructive delete.
      const confirmed = window.confirm(
        "Are you sure you want to delete this note?"
      );
      if (!confirmed) return;

      await deleteNoteById(selectedNoteId);
      await loadModuleNotes();
      setNoteSummary("");
      setShowSummaryModal(false);
    } catch (err) {
      console.error("Failed to delete note:", err);
    }
  };

  const handleSummarizeNote = async () => {
    try {
      // Short-circuit empty notes with an immediate modal message.
      if (!selectedNoteData?.content) {
        setShowSummaryModal(true);
        setNoteSummary("This note is empty, so there is nothing to summarize.");
        return;
      }

      // Strip rich-text HTML before sending note content to the summarization API.
      const plainText = stripHtml(selectedNoteData.content).trim();

      setShowSummaryModal(true);

      if (!plainText) {
        setNoteSummary("This note is empty, so there is nothing to summarize.");
        return;
      }

      setSummaryLoading(true);
      setNoteSummary("");

      const response = await fetch(`${API_BASE_URL}/api/notes/summarize`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          noteText: plainText,
          moduleTitle: module?.title || "Unknown module",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to summarize note.");
      }

      // Render model output in the summary modal.
      setNoteSummary(data.summary || "No summary generated.");
    } catch (err) {
      console.error(err);
      setNoteSummary(
        "Failed to generate summary. Make sure backend server and Ollama are running."
      );
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleNoteChange = useCallback((updatedNote) => {
    // Keep selected note and list preview in sync with editor autosaves.
    setSelectedNoteData(updatedNote);

    setNotes((prev) =>
      prev.map((note) =>
        note.id === updatedNote.id ? { ...note, ...updatedNote } : note
      )
    );
  }, []);

  const renderWorkbookPanel = () => {
    return (
      <>
        {/* Notes strip + editor + summarize FAB are grouped as workbook mode. */}
        <div className="relative grid h-full min-h-0 gap-3 grid-rows-[auto_minmax(0,1fr)]">
          <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-4 py-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-slate-900">Notes</h3>
                  {!notesBarCollapsed && (
                    <p className="mt-1 text-xs text-slate-500">
                      {notes.length} page{notes.length !== 1 ? "s" : ""}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    // Toggle between compact dropdown mode and horizontal note cards.
                    onClick={() => setNotesBarCollapsed((prev) => !prev)}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    {notesBarCollapsed ? "Expand Notes" : "Collapse Notes"}
                  </button>

                  <button
                    type="button"
                    onClick={handleCreateNote}
                    disabled={creatingNote}
                    className="rounded-xl bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
                  >
                    {creatingNote ? "Creating..." : "New Note"}
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
                  {notes.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-3 text-sm text-slate-500">
                      No notes yet. Create your first note page.
                    </div>
                  ) : (
                    notes.map((note, index) => (
                      <button
                        key={note.id}
                        type="button"
                        onClick={() => {
                          // Selecting a card binds note content into NotebookEditor.
                          setSelectedNoteId(note.id);
                          setSelectedNoteData(note);
                          setNoteSummary("");
                          setNotesBarCollapsed(true);
                        }}
                        className={`max-w-[220px] min-w-[220px] rounded-2xl border p-3 text-left transition ${
                          selectedNoteId === note.id
                            ? "border-slate-900 bg-slate-900 text-white"
                            : "border-slate-200 bg-white hover:bg-slate-50"
                        }`}
                      >
                        <p className="truncate text-sm font-semibold">
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
                    // Keep selected note object synced with selected note id.
                    setSelectedNoteId(nextId);
                    const nextNote =
                      notes.find((note) => note.id === nextId) || null;
                    setSelectedNoteData(nextNote);
                    setNoteSummary("");
                  }}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a note</option>
                  {notes.map((note, index) => (
                    <option key={note.id} value={note.id}>
                      {note.title || `Untitled Note ${index + 1}`}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="h-full min-h-0 overflow-hidden">
            <NotebookEditor
              noteId={selectedNoteId}
              compact
              onNoteChange={handleNoteChange}
            />
          </div>

          <button
            type="button"
            // Triggers backend summarization for currently selected note.
            onClick={handleSummarizeNote}
            disabled={!selectedNoteId || summaryLoading}
            title="Summarize note"
            className="absolute bottom-5 right-5 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <SparklesIcon />
          </button>
        </div>

        {showSummaryModal && (
          // Modal is dismissible by clicking outside or close button.
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
                    : noteSummary || "No summary generated yet."}
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  };

  const renderRightPanelContent = () => {
    // Workbook mode: note-taking UI.
    if (activePanel === "workbook") {
      return (
        <div
          className="h-full min-h-0 overflow-hidden"
          data-testid="workbook-panel"
        >
          {renderWorkbookPanel()}
        </div>
      );
    }

    if (activePanel === "code" && module?.isProgrammingModule) {
      // Code mode: editor plus output console for programming modules.
      return (
        <div
          className="grid h-full min-h-0 grid-rows-[1fr_220px] gap-4 overflow-hidden"
          data-testid="code-panel"
        >
          <div className="min-h-0 overflow-hidden rounded-3xl">
            <CodeLab onOutputChange={setCodeOutput} compact />
          </div>
          <div
            className="min-h-0 overflow-hidden rounded-3xl"
            data-testid="code-output-panel"
          >
            <CodeOutput output={codeOutput} compact />
          </div>
        </div>
      );
    }

    if (activePanel === "chatbot") {
      // Chat mode: contextual assistant fed with module/material data.
      return (
        <div
          className="h-full min-h-0 overflow-hidden"
          data-testid="chatbot-panel"
        >
          <StudyAssistant
            moduleId={moduleId}
            moduleTitle={module?.title || ""}
            materialTitle={materialTitle}
            materialContent={materialContent}
            compact
          />
        </div>
      );
    }

    return null;
  };

  if (loading) {
    // Full-page loader while initial data dependencies resolve.
    return <PageLoader text="Loading module..." />;
  }

  if (error) {
    // Show recoverable error banner inside standard app layout.
    return (
      <AppLayout fullWidth>
        <div className="w-full">
          <div
            className="rounded-3xl border border-red-200 bg-red-50 px-6 py-5 text-red-600"
            data-testid="module-error"
          >
            {error}
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout fullWidth>
      <div className="w-full space-y-6" data-testid="module-page">
        <div className="w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-6 px-6 py-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 flex-1">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <InfoChip>{module.code || "Module"}</InfoChip>
                <InfoChip>
                  {module?.isProgrammingModule
                    ? "Programming Module"
                    : "Theory Module"}
                </InfoChip>
                <InfoChip>{totalCount} materials</InfoChip>
              </div>

              <h1
                className="text-3xl font-semibold tracking-tight text-slate-900"
                data-testid="module-title"
              >
                {module.title}
              </h1>

              <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-600">
                {module.description ||
                  "Open materials and study inside your workspace."}
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  to="/dashboard"
                  data-testid="back-dashboard"
                  className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Back to Dashboard
                </Link>

                <Link
                  to="/notes"
                  className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Open My Notes
                </Link>

                {selectedMaterial && (
                  <button
                    type="button"
                    onClick={() => setSelectedMaterial(null)}
                    data-testid="back-materials"
                    className="inline-flex items-center rounded-xl border border-slate-200 bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
                  >
                    Back to Materials
                  </button>
                )}
              </div>
            </div>

            <div
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 p-5 lg:w-[320px] lg:min-w-[320px]"
              data-testid="module-progress-card"
            >
              <div className="flex items-center gap-4">
                <div className="relative h-20 w-20 shrink-0">
                  <svg className="h-20 w-20 -rotate-90">
                    <circle
                      cx="40"
                      cy="40"
                      r="32"
                      stroke="#e2e8f0"
                      strokeWidth="8"
                      fill="none"
                    />
                    <circle
                      cx="40"
                      cy="40"
                      r="32"
                      stroke="#0f172a"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={2 * Math.PI * 32}
                      strokeDashoffset={
                        2 * Math.PI * 32 * (1 - progressPercent / 100)
                      }
                      strokeLinecap="round"
                    />
                  </svg>
                  <div
                    className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-slate-900"
                    data-testid="module-progress-percent"
                  >
                    {progressPercent}%
                  </div>
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900">
                    Module Progress
                  </p>
                  <p
                    className="mt-1 text-sm text-slate-500"
                    data-testid="module-progress-text"
                  >
                    {completedCount} of {totalCount} materials completed
                  </p>
                </div>
              </div>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-slate-900 transition-all"
                  style={{ width: `${progressPercent}%` }}
                  data-testid="module-progress-bar"
                />
              </div>
            </div>
          </div>
        </div>

        {!selectedMaterial ? (
          // Left state before material selection: show material catalog.
          <div
            className="w-full rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
            data-testid="materials-section"
          >
            <div className="mb-5">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                Module Materials
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Select a material to open your learning workspace.
              </p>
            </div>

            <MaterialsList
              materials={materials}
              selectedMaterialId={null}
              onSelectMaterial={setSelectedMaterial}
              progressMap={progressMap}
              onToggleComplete={handleToggleComplete}
            />
          </div>
        ) : (
          // Workspace split view after selecting a material.
          <div
            className="grid h-[88vh] w-full gap-6 xl:grid-cols-2"
            data-testid="workspace-layout"
          >
            <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-5 py-4">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                  Material Viewer
                </p>
                <h3
                  className="mt-1 truncate text-lg font-semibold text-slate-900"
                  data-testid="selected-material-title"
                >
                  {materialTitle}
                </h3>
              </div>

              <div
                className="flex-1 min-h-0 overflow-hidden"
                data-testid="material-viewer"
              >
                <MaterialViewer material={selectedMaterial} />
              </div>
            </div>

            <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-4 py-4">
                <div
                  className="inline-flex flex-wrap gap-2 rounded-2xl bg-slate-100 p-1.5"
                  data-testid="module-panel-tabs"
                >
                  {availablePanels.map((panel) => (
                    <PanelTab
                      key={panel.id}
                      active={activePanel === panel.id}
                      onClick={() => setActivePanel(panel.id)}
                      testId={`panel-tab-${panel.id}`}
                    >
                      {panel.label}
                    </PanelTab>
                  ))}
                </div>
              </div>

              <div
                className="flex-1 min-h-0 overflow-hidden bg-slate-50/50 p-4"
                data-testid="right-panel-content"
              >
                {renderRightPanelContent()}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
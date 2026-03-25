import { useEffect, useState } from "react";
import { auth } from "../../../firebase/config";
import AppLayout from "../../../components/common/AppLayout";
import PageLoader from "../../../components/common/PageLoader";
import ConfirmDialog from "../../../components/common/ConfirmDialog";

import {
  createStorageFolder,
  deleteFolderFile,
  deleteStorageFolder,
  getFolderFiles,
  getStorageFolders,
  renameStorageFolder,
  uploadFileToFolder,
} from "../services/storageService";

function formatBytes(bytes = 0) {
  if (bytes === 0) return "0 B";
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
}

function FolderIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
    >
      <path
        d="M3 7.5A2.5 2.5 0 0 1 5.5 5H10l2 2h6.5A2.5 2.5 0 0 1 21 9.5v7A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5v-9Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function MyStoragePage() {
  const [folders, setFolders] = useState([]);
  const [selectedFolderId, setSelectedFolderId] = useState("");
  const [files, setFiles] = useState([]);
  const [folderName, setFolderName] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingFolder, setSavingFolder] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingFolderId, setEditingFolderId] = useState("");
  const [editingFolderName, setEditingFolderName] = useState("");
  const [renamingFolder, setRenamingFolder] = useState(false);
  const [confirmState, setConfirmState] = useState({
  open: false,
  type: "",
  title: "",
  message: "",
  file: null,
  folderId: null,
});
const [confirmLoading, setConfirmLoading] = useState(false);

  function handleDeleteFile(file) {
  setConfirmState({
    open: true,
    type: "file",
    title: "Delete File",
    message: `Are you sure you want to delete "${file.name}"? This action cannot be undone.`,
    file,
    folderId: null,
  });
}

  const user = auth.currentUser;

  useEffect(() => {
    async function loadFolders() {
      try {
        if (!user) {
          setLoading(false);
          return;
        }

        const folderList = await getStorageFolders(user.uid);
        setFolders(folderList);

        if (folderList.length > 0) {
          setSelectedFolderId(folderList[0].id);
        }
      } catch (err) {
        setError(err.message || "Failed to load folders.");
      } finally {
        setLoading(false);
      }
    }

    loadFolders();
  }, [user]);

  useEffect(() => {
    async function loadFiles() {
      try {
        if (!user || !selectedFolderId) {
          setFiles([]);
          return;
        }

        const folderFiles = await getFolderFiles(user.uid, selectedFolderId);
        setFiles(folderFiles);
      } catch (err) {
        setError(err.message || "Failed to load files.");
      }
    }

    loadFiles();
  }, [user, selectedFolderId]);

  async function refreshFolders(newSelectedFolderId = "") {
  const folderList = await getStorageFolders(user.uid);
  setFolders(folderList);

  if (newSelectedFolderId) {
    setSelectedFolderId(newSelectedFolderId);
    return;
  }

  if (folderList.length === 0) {
    setSelectedFolderId("");
    return;
  }

  const stillExists = folderList.some((folder) => folder.id === selectedFolderId);

  if (!stillExists) {
    setSelectedFolderId(folderList[0].id);
  }
}

  async function handleCreateFolder(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      setSavingFolder(true);
      const newFolderId = await createStorageFolder(user.uid, folderName);
      setFolderName("");
      await refreshFolders(newFolderId);
      setSuccess("Folder created successfully.");
    } catch (err) {
      setError(err.message || "Failed to create folder.");
    } finally {
      setSavingFolder(false);
    }
  }

  async function handleUploadFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setSuccess("");

    try {
      setUploading(true);
      await uploadFileToFolder(user.uid, selectedFolderId, file);
      const updatedFiles = await getFolderFiles(user.uid, selectedFolderId);
      setFiles(updatedFiles);
      setSuccess("File uploaded successfully.");
    } catch (err) {
      setError(err.message || "Failed to upload file.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function handleDeleteFolder(folderId) {
  const folder = folders.find((item) => item.id === folderId);

  setConfirmState({
    open: true,
    type: "folder",
    title: "Delete Folder",
    message: `Are you sure you want to delete "${folder?.name || "this folder"}" and all files inside it? This action cannot be undone.`,
    file: null,
    folderId,
  });
}

async function handleConfirmDelete() {
  setError("");
  setSuccess("");
  setConfirmLoading(true);

  try {
    if (confirmState.type === "file" && confirmState.file) {
      await deleteFolderFile(
        user.uid,
        selectedFolderId,
        confirmState.file.id,
        confirmState.file.storagePath
      );

      const updatedFiles = await getFolderFiles(user.uid, selectedFolderId);
      setFiles(updatedFiles);
      setSuccess("File deleted successfully.");
    }

    if (confirmState.type === "folder" && confirmState.folderId) {
      await deleteStorageFolder(user.uid, confirmState.folderId);
      await refreshFolders();
      setSuccess("Folder and all files inside it were deleted successfully.");
    }

    setConfirmState({
      open: false,
      type: "",
      title: "",
      message: "",
      file: null,
      folderId: null,
    });
  } catch (err) {
    setError(err.message || "Delete action failed.");
  } finally {
    setConfirmLoading(false);
  }
}

function handleCloseConfirm() {
  if (confirmLoading) return;

  setConfirmState({
    open: false,
    type: "",
    title: "",
    message: "",
    file: null,
    folderId: null,
  });
}

function handleStartRenameFolder(folder) {
  setEditingFolderId(folder.id);
  setEditingFolderName(folder.name);
}

function handleCancelRenameFolder() {
  setEditingFolderId("");
  setEditingFolderName("");
}

async function handleSaveRenameFolder(folderId) {
  setError("");
  setSuccess("");

  try {
    setRenamingFolder(true);
    await renameStorageFolder(user.uid, folderId, editingFolderName);
    await refreshFolders(folderId);
    setEditingFolderId("");
    setEditingFolderName("");
    setSuccess("Folder renamed successfully.");
  } catch (err) {
    setError(err.message || "Failed to rename folder.");
  } finally {
    setRenamingFolder(false);
  }
}

  if (loading) {
    return <PageLoader text="Loading storage..." />;
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-700 p-6 text-white shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
              <FolderIcon />
            </div>
            <div>
              <h1 className="text-3xl font-bold">My Storage</h1>
              <p className="mt-1 text-sm text-blue-100">
                Create folders and upload your own study materials for later use.
              </p>
            </div>
          </div>
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        ) : null}

        {success ? (
          <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            {success}
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">Folders</h2>

            <form onSubmit={handleCreateFolder} className="mt-4 space-y-3">
              <input
                type="text"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                placeholder="Enter folder name"
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
              />

              <button
                type="submit"
                disabled={savingFolder}
                className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
              >
                {savingFolder ? "Creating..." : "Create Folder"}
              </button>
            </form>

            <div className="mt-5 space-y-3">
              {folders.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center text-sm text-slate-500">
                  No folders created yet.
                </div>
              ) : (
                folders.map((folder) => {
                  const isActive = selectedFolderId === folder.id;

                  return (
                    <div
  key={folder.id}
  className={`rounded-2xl border p-4 transition ${
    isActive
      ? "border-blue-600 bg-blue-50"
      : "border-slate-200 bg-white"
  }`}
>
  {editingFolderId === folder.id ? (
    <div className="space-y-3">
      <input
        type="text"
        value={editingFolderName}
        onChange={(e) => setEditingFolderName(e.target.value)}
        className="w-full rounded-2xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
        placeholder="Enter folder name"
      />

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => handleSaveRenameFolder(folder.id)}
          disabled={renamingFolder}
          className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
        >
          {renamingFolder ? "Saving..." : "Save"}
        </button>

        <button
          type="button"
          onClick={handleCancelRenameFolder}
          disabled={renamingFolder}
          className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
        >
          Cancel
        </button>
      </div>
    </div>
  ) : (
    <>
      <button
        type="button"
        onClick={() => setSelectedFolderId(folder.id)}
        className="w-full text-left"
      >
        <div className="font-semibold text-slate-900">{folder.name}</div>
      </button>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => handleStartRenameFolder(folder)}
          className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Rename
        </button>

        <button
          type="button"
          onClick={() => handleDeleteFolder(folder.id)}
          className="rounded-xl bg-red-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-red-700"
        >
          Delete Folder
        </button>
      </div>
    </>
  )}
</div>
                  );
                })
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Stored Materials</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {selectedFolderId
                    ? "Upload files and keep them organized inside your folder."
                    : "Create and select a folder first."}
                </p>
              </div>

              <label
                className={`inline-flex items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold text-white ${
                  selectedFolderId
                    ? "cursor-pointer bg-blue-600 hover:bg-blue-700"
                    : "cursor-not-allowed bg-slate-300"
                }`}
              >
                {uploading ? "Uploading..." : "Upload File"}
                <input
                  type="file"
                  className="hidden"
                  onChange={handleUploadFile}
                  disabled={!selectedFolderId || uploading}
                />
              </label>
            </div>

            <div className="mt-6 space-y-4">
              {!selectedFolderId ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
                  Select a folder to view files.
                </div>
              ) : files.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
                  No files uploaded yet.
                </div>
              ) : (
                files.map((file) => (
                  <div
                    key={file.id}
                    className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-4 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-900">{file.name}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {file.type || "Unknown"} · {formatBytes(file.size)}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <a
                        href={file.downloadURL}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                      >
                        Open
                      </a>

                      <button
                        type="button"
                        onClick={() => handleDeleteFile(file)}
                        className="rounded-xl border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      <ConfirmDialog
  open={confirmState.open}
  title={confirmState.title}
  message={confirmState.message}
  confirmText="Delete"
  cancelText="Cancel"
  onConfirm={handleConfirmDelete}
  onCancel={handleCloseConfirm}
  loading={confirmLoading}
  danger
/>
    </AppLayout>
  );
}
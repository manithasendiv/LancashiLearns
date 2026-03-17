export default function MaterialViewer({ material }) {
  if (!material) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 h-full flex items-center justify-center text-slate-500">
        Select a material to view it here.
      </div>
    );
  }

  const getFileExtension = (fileName = "") => {
    return fileName.split(".").pop()?.toLowerCase() || "";
  };

  const getViewerUrl = () => {
    const ext = getFileExtension(material.fileName);

    if (ext === "pdf") {
      return material.fileUrl;
    }

    if (["doc", "docx", "ppt", "pptx"].includes(ext)) {
      return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
        material.fileUrl
      )}`;
    }

    return null;
  };

  const viewerUrl = getViewerUrl();

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 h-full flex flex-col overflow-hidden">
      <div className="border-b border-slate-200 px-5 py-4 flex items-center justify-between gap-4">
        <div>          
          <p className="text-sm text-slate-500 mt-1">{material.fileName}</p>
        </div>

        <a
          href={material.fileUrl}
          target="_blank"
          rel="noreferrer"
          className="shrink-0 bg-blue-50 hover:bg-blue-100 text-blue-600 px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          Open in New Tab
        </a>
      </div>

      <div className="flex-1 bg-slate-50 min-h-[700px]">
        {viewerUrl ? (
          <iframe
            src={viewerUrl}
            title={material.title}
            className="w-full h-full border-0"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-500 p-6 text-center">
            This file type cannot be previewed in the browser.
            <br />
            Please use “Open in New Tab”.
          </div>
        )}
      </div>
    </div>
  );
}
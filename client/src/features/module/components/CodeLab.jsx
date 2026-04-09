import { useState } from "react";
import Editor from "@monaco-editor/react";

export default function CodeLab({ onOutputChange, compact = false }) {
  // Tracks currently selected execution language.
  const [language, setLanguage] = useState("javascript");
  // Holds editor source before sending to backend.
  const [code, setCode] = useState("// Write your code here");
  // Prevents duplicate submissions while execution is in progress.
  const [running, setRunning] = useState(false);

  const handleRun = async () => {
    try {
      // Push immediate feedback so users know execution started.
      setRunning(true);
      onOutputChange("Running code...");

      // Submit code to backend execution endpoint.
      const response = await fetch("http://localhost:5000/api/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // Backend expects this exact payload shape.
          language,
          sourceCode: code,
        }),
      });

      // Parse JSON response from the executor service.
      const data = await response.json();

      // Surface backend/compiler errors directly in the output panel.
      if (!response.ok) {
        onOutputChange(data.error || "Execution failed.");
        return;
      }

      onOutputChange(data.output || "No output returned.");
    } catch (error) {
      // Network/backend failures are surfaced as a human-friendly fallback.
      console.error("Run code error:", error);
      onOutputChange("Failed to connect to backend.");
    } finally {
      // Always re-enable run button after request completes.
      setRunning(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between mb-3 gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Code Lab</h2>
          {!compact && (
            <p className="text-sm text-slate-500 mt-1">
              Practice and run code inside the platform.
            </p>
          )}
        </div>

        <select
          value={language}
          // Keeps language selector synchronized with local state.
          onChange={(e) => setLanguage(e.target.value)}
          className="border border-slate-300 rounded-lg px-3 py-2"
        >
          <option value="javascript">JavaScript</option>
          <option value="cpp">C++</option>
          <option value="java">Java</option>
          <option value="csharp">C#</option>
        </select>
      </div>

      <div className="rounded-xl overflow-hidden border border-slate-300 flex-1 min-h-0">
        <Editor
          height="100%"
          // Monaco expects "cpp" for C++ highlighting mode.
          language={language === "cpp" ? "cpp" : language}
          value={code}
          // Normalize empty editor changes to an empty string.
          onChange={(value) => setCode(value || "")}
          theme="vs-light"
        />
      </div>

      <button
        onClick={handleRun}
        disabled={running}
        className="mt-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-70"
      >
        {running ? "Running..." : "Run Code"}
      </button>
    </div>
  );
}
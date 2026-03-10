import { useState } from "react";
import Editor from "@monaco-editor/react";

export default function CodeLab({ onOutputChange, compact = false }) {
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState("// Write your code here");
  const [running, setRunning] = useState(false);

  const handleRun = async () => {
    try {
      setRunning(true);
      onOutputChange("Running code...");

      const response = await fetch("http://localhost:5000/api/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          language,
          sourceCode: code,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        onOutputChange(data.error || "Execution failed.");
        return;
      }

      onOutputChange(data.output || "No output returned.");
    } catch (error) {
      console.error("Run code error:", error);
      onOutputChange("Failed to connect to backend.");
    } finally {
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
          language={language === "cpp" ? "cpp" : language}
          value={code}
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
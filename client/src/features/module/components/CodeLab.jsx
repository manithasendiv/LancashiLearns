import { useState } from "react";
import Editor from "@monaco-editor/react";

export default function CodeLab() {
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState("// Write your code here");
  const [output, setOutput] = useState("Run your code to see output.");
  const [running, setRunning] = useState(false);

  const handleRun = async () => {
    try {
      setRunning(true);
      setOutput("Running code...");

      const response = await fetch("http://localhost:5000/api/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          language,
          sourceCode: code
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setOutput(data.error || "Execution failed.");
        return;
      }

      setOutput(data.output || "No output returned.");
    } catch (error) {
      console.error("Run code error:", error);
      setOutput("Failed to connect to backend.");
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Code Lab</h2>
            <p className="text-sm text-slate-500 mt-1">
              Practice and run code inside the platform.
            </p>
          </div>

          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="border border-slate-300 rounded-lg px-4 py-2"
          >
            <option value="javascript">JavaScript</option>
            <option value="cpp">C++</option>
            <option value="java">Java</option>
            <option value="csharp">C#</option>
          </select>
        </div>

        <div className="rounded-xl overflow-hidden border border-slate-300">
          <Editor
            height="450px"
            language={language === "cpp" ? "cpp" : language}
            value={code}
            onChange={(value) => setCode(value || "")}
            theme="vs-light"
          />
        </div>

        <button
          onClick={handleRun}
          disabled={running}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium disabled:opacity-70"
        >
          {running ? "Running..." : "Run Code"}
        </button>
      </div>

      <div className="bg-slate-950 text-green-400 rounded-2xl shadow-sm p-6 min-h-[250px] whitespace-pre-wrap font-mono text-sm">
        {output}
      </div>
    </div>
  );
}
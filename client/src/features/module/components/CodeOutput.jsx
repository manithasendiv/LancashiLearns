export default function CodeOutput({ output, compact = false }) {
  return (
    <div className="bg-slate-950 text-green-400 rounded-2xl shadow-sm border border-slate-200 p-4 h-full whitespace-pre-wrap font-mono text-sm overflow-auto">
      {output || (compact ? "Output..." : "Output will appear here.")}
    </div>
  );
}
export default function PageLoader({ text = "Loading..." }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 px-10 py-12 flex flex-col items-center">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-slate-200" />
          <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
        </div>

        <h3 className="mt-6 text-lg font-semibold text-slate-800">{text}</h3>

        <div className="mt-3 flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:-0.3s]" />
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:-0.15s]" />
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" />
        </div>

        <p className="mt-4 text-sm text-slate-500 text-center">
          Please wait while we prepare your content.
        </p>
      </div>
    </div>
  );
}
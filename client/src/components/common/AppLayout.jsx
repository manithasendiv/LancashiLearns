import { Link, useLocation } from "react-router-dom";

export default function AppLayout({ title, subtitle, children }) {
  const location = useLocation();

  const navItems = [
    { id: "dashboard", name: "Dashboard", path: "/dashboard" },
    { id: "modules", name: "Modules", path: "/modules" },
    { id: "admin", name: "Admin", path: "/admin" }
  ];

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">LancashiLearns</h1>
            <p className="text-sm text-slate-500">University Learning Platform</p>
          </div>

          <nav className="flex gap-3">
            {navItems.map((item) => {
              const active = location.pathname === item.path;

              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    active
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {(title || subtitle) && (
          <div className="mb-8">
            {title && <h2 className="text-3xl font-bold text-slate-800">{title}</h2>}
            {subtitle && <p className="text-slate-600 mt-2">{subtitle}</p>}
          </div>
        )}

        {children}
      </main>
    </div>
  );
}